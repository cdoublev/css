
const {
    MAX_ARGUMENTS: MAX_MATH_FUNCTION_ARGUMENTS,
    MAX_NESTING: MAX_MATH_FUNCTION_NESTING,
    getCalculationNode,
    getParentCalculationNode,
} = require('./math-functions.js')
const { isAmpersand, isComma, isMinus, isPlus, isWhitespace } = require('../values/validation.js')
const { createList } = require('../values/value.js')
const createOmitted = require('../values/omitted.js')

/**
 * @param {Parser} parser
 * @returns {null|void}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing the operator when it is not preceded by a whitespace.
 */
function preParseCalcOperator({ list: { current }, tree }) {
    if (!isWhitespace(current) && tree.root.definition.name === 'calc-sum') {
        if (isPlus(current) || isMinus(current)) {
            return Error('Invalid calculation sum operator')
        }
        return null
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {null|void}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing when the maximum nesting levels of calculations or math
 * functions is exceeded.
 */
function preParseCalcSum({ tree }, node) {
    const { context } = node
    const parentCalculation = getParentCalculationNode(tree)
    if (parentCalculation) {
        let { context: { counters: { nestedFunctions } } } = parentCalculation
        if (MAX_MATH_FUNCTION_NESTING === nestedFunctions++) {
            return Error('Maximum math function nesting exceeded')
        }
        const { counters } = context
        counters.nestedFunctions = nestedFunctions
        --counters.arguments
        tree.subscribe({
            callback() {
                --counters.nestedFunctions
            },
            event: 'always',
            node,
            once: true,
            status: 'postprocessing',
        })
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {null|void}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing when the maximum number of arguments for a calculation or
 * a math function is exceeded.
 */
function preParseCalcValue(parser, node) {
    const { context: { counters } } = getCalculationNode(node)
    if (MAX_MATH_FUNCTION_ARGUMENTS === counters.arguments++) {
        return Error('Maximum math function terms exceeded')
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#comb-comma}
 *
 * It aborts parsing the comma when it is in leading or trailing position in the
 * list of component values, or when it is adjacent to a previous comma.
 *
 * It replaces a match failure for an omitted comma when it is not separating
 * values matching a repeated node.
 */
function preParseComma({ list, tree }, { definition, parent }) {
    let { current } = list
    if (isWhitespace(current)) {
        current = list.prev()
    }
    const comma = list.consume(isComma)
    if (current === undefined || isComma(current)) {
        // Leading or adjacent comma
        if (comma) {
            return null
        }
        return createOmitted(definition)
    }
    if (comma) {
        // Trailing comma
        if (list.atEnd(isWhitespace) && tree.parent?.tail.definition.name !== 'var') {
            return null
        }
        return comma
    }
    if (list.atEnd(isWhitespace) && parent.definition.type !== 'repeat') {
        return createOmitted(definition)
    }
    return null
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {null|void}
 * @see {@link https://drafts.csswg.org/selectors-4/#white-space}
 *
 * It aborts parsing the selector when the preceding <combinator> is omitted and
 * there is no leading whitespace, and it parses a nesting selector prefix with
 * an argument to require it when the context is a directly nested style rule.
 */
function preParseCompoundSelector(parser, node) {
    const { context: { type, parent: { definition: { value } } }, list, tree } = parser
    const { parent: { definition: { value: [first] } } } = node
    // <compound-selector> [<combinator>? <compound-selector>]*
    if (first.type === 'optional' && tree.get(first).value.omitted && !isWhitespace(list.current)) {
        return null
    }
    const required = first === node.definition && value === '<style-block>' && type === 'style'
    // & is valid in any context
    return preParseNestingSelector(parser, node, required)
}

/**
 * @param {Parser} object
 * @param {object} node
 * @returns {object|undefined}
 *
 * It parses <integer> or <number> with priority over <length> when both are
 * combined with `|` or `||`.
 */
function preParseLength({ list }, node) {
    const next = list.next()
    if (next?.type.has('number') && next.value === 0) {
        let { parent } = node
        if (parent?.parent?.definition.name === 'length-percentage') {
            ({ parent: { parent } } = parent)
        }
        if (parent) {
            const { definition: { type, value } } = parent
            if ((type === '|' || type === '||') && value.some(({ name }) => name === 'integer' || name === 'number')) {
                return list.consume()
            }
        }
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {boolean} [required]
 * @returns {object|null|void}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nesting-selector}
 *
 * It parses a selector preceded by a nesting selector.
 */
function preParseNestingSelector({ list, tree }, node, required = false) {
    const nestingSelector = list.consume(isAmpersand)
    if (nestingSelector) {
        const { definition: { name } } = node
        const next = list.next()
        if (isWhitespace(next) || isComma(next) || list.atEnd()) {
            return createList([nestingSelector], '', [name])
        }
        tree.subscribe({
            callback(parser, { value }) {
                if (Array.isArray(value)) {
                    value.unshift(nestingSelector)
                } else {
                    value.type.delete(name)
                    value = createList([nestingSelector, value], '', [name])
                }
                return value
            },
            event: 'always',
            node,
            once: true,
            status: 'postprocessing',
        })
    } else if (required) {
        return Error("Invalid directly nested style rule's prelude")
    }
}

module.exports = {
    '+': preParseCalcOperator,
    ',': preParseComma,
    '-': preParseCalcOperator,
    'calc-sum': preParseCalcSum,
    'calc-value': preParseCalcValue,
    'compound-selector': preParseCompoundSelector,
    'length': preParseLength,
    'pseudo-class-selector': preParseNestingSelector,
    'pseudo-element-selector': preParseNestingSelector,
    'subclass-selector': preParseNestingSelector,
    'type-selector': preParseNestingSelector,
}
