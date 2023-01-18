
const { MAX_TERMS: MAX_MATH_FUNCTION_TERMS } = require('./math-functions.js')
const { findLast, findParent } = require('../utils/context.js')
const { isAmpersand, isColon, isComma, isMinus, isPlus, isWhitespace } = require('../values/validation.js')
const createError = require('../error.js')
const { createList } = require('../values/value.js')
const createOmitted = require('../values/omitted.js')
const pseudos = require('../values/pseudos.js')

/**
 * @param {object} node
 * @returns {Error}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `invalid ${name ? `<${name}>` : `'${value}'`}`, type: 'ParseError' }, true)
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|null|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing when the next component is a calculation sum operator that
 * is not preceded by a whitespace.
 */
function preParseCalcOperator({ tree: { list: { current }, root } }, node) {
    if (!isWhitespace(current) && root.definition.name === 'calc-sum') {
        if (isPlus(current) || isMinus(current)) {
            return error(node)
        }
        return null
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing when exceeding the maximum number of math function terms.
 */
function preParseCalcValue(parser, node) {
    const calculationTree = parser.trees.find(tree => tree.parent?.tail.definition.value?.includes('<calc-sum>'))
    if (MAX_MATH_FUNCTION_TERMS === calculationTree.arguments++) {
        return error(node)
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object|object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-combinator}
 * @see {@link https://drafts.csswg.org/selectors-4/#pseudo-element-structure}
 *
 * It aborts parsing a combinator following a pseudo-element selector that is
 * not defined with an internal structure, or when the context only allows a
 * compound selector.
 *
 * It aborts parsing when the context allows relative selector(s) whereas it is
 * already restricted to compound selector(s).
 */
function preParseCombinator({ tree }, node) {
    const pseudoElement = findLast(
        tree.nodes,
        node => node.definition.name === 'pseudo-element-selector',
        ({ definition: { name } }) => name === 'compound-selector' || name?.startsWith('relative'))
    if (pseudoElement) {
        const { value: [, [, { name, type, value }]] } = pseudoElement
        const definition = type.has('function')
            ? pseudos.elements.functions[`${name}()`]
            : pseudos.elements.identifiers[value]
        if (!definition?.structured) {
            return null
        }
    }
    if (findParent(tree, tree => tree.root.definition.name === 'compound-selector')) {
        return tree.root.definition.name?.startsWith('relative') ? error(node) : null
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#comb-comma}
 *
 * It aborts parsing when the next component is a comma in leading or trailing
 * position in the list of component values, or is adjacent to a previous comma.
 *
 * It replaces a match failure for an omitted comma when it is not separating
 * values matching a repeated node.
 */
function preParseComma({ tree }, node) {
    const { list } = tree
    let { current } = list
    if (isWhitespace(current)) {
        current = list.prev()
    }
    const comma = list.consume(isComma)
    if (current === undefined || isComma(current)) {
        if (comma) {
            return error(node)
        }
        return createOmitted(node.definition)
    }
    if (comma) {
        if (list.atEnd(isWhitespace) && tree.parent?.tail.definition.name !== 'var') {
            return error(node)
        }
        return comma
    }
    if (list.atEnd(isWhitespace) && node.parent.definition.type !== 'repeat') {
        return createOmitted(node.definition)
    }
    return null
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object|null|undefined}
 * @see {@link https://drafts.csswg.org/selectors-4/#white-space}
 *
 * It aborts parsing a compound selector following another compound selector
 * when the preceding combinator is omitted and there is no leading whitespace,
 * except when it is first combinator of a relative selector.
 *
 * It aborts parsing when the next component does not start with `:` whereas the
 * context is a functional pseudo-class taking selector(s) as argument(s) and
 * that is compounded to a pseudo-element.
 */
function preParseCompoundSelector(parser, node) {
    const { tree } = parser
    const { list, nodes } = tree
    const combinator = findLast(
        nodes,
        node => node.definition.value?.name === 'combinator',
        ({ definition: { name }, status }) =>
            status === 'matched' && (name === 'compound-selector' || name?.startsWith('relative')))
    // Omitted <combinator> and whitespace
    if (combinator?.value.omitted && !isWhitespace(list.current) && -1 < list.index) {
        return null
    }
    // Find a pseudo-element compounded with a logical combination pseudo-class
    const pseudoElement = findParent(tree, ({ list, tail }) =>
        pseudos.logical[`${list.current?.name}()`]
        && findParent(
            tail,
            node => node.definition.name === 'pseudo-compound-selector',
            node => node.definition.name === 'subclass-selector'))
    // Abort parsing anything other than a pseudo-class
    if (pseudoElement && !isColon(list.next()) && !list.atEnd()) {
        return error(node)
    }
    // & is valid in any context
    return preParseNestingSelector(parser, node)
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|null|undefined}
 * @see {@link https://drafts.csswg.org/css-ui-4/#typedef-cursor-url-set}
 *
 * It aborts parsing when the next component is a nested image set or when it is
 * not an url or a string whereas an url set option is expected.
 */
function preParseImageSetOption({ tree }, node) {
    const next = tree.list.next()
    if (!next) {
        return null
    }
    const { name, type } = next
    if (next?.name === 'image-set') {
        return error(node)
    }
    if (tree.parent.tail.parent.parent?.definition.name === 'url-set'
        && name !== 'src'
        && name !== 'url'
        && !type.has('string')
    ) {
        return error(node)
    }
}

/**
 * @param {Parser} object
 * @param {object} node
 * @returns {null|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#length-value}
 *
 * It aborts parsing a length when the next component is `0` which can be parsed
 * as an integer or a number.
 */
function preParseLength(parser, node) {
    const next = parser.tree.list.next()
    if (next?.type.has('number') && next.value === 0) {
        let { parent } = node
        if (parent?.parent?.definition.name === 'length-percentage') {
            ({ parent: { parent } } = parent)
        }
        if (parent) {
            const { definition: { type, value } } = parent
            if ((type === '|' || type === '||') && value.some(({ name }) => name === 'integer' || name === 'number')) {
                return null
            }
        }
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|null|undefined}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nesting-selector}
 *
 * It parses a selector preceded by a nesting selector.
 */
function preParseNestingSelector(parser, node) {
    const { tree } = parser
    const { list } = tree
    const nestingSelector = list.consume(isAmpersand)
    if (nestingSelector) {
        const { definition: { name } } = node
        if (name === 'subclass-selector' || name === 'pseudo-class-selector') {
            return nestingSelector
        }
        const next = list.next()
        // & is the last part of <[pseudo-]compound-selector>
        if (list.atEnd()
            || isWhitespace(next)
            || isComma(next)
            || list.next(2).every(isColon)
            || parser.parse([next], '<combinator>')
        ) {
            return createList([nestingSelector], '', [name])
        }
        tree.subscribe({
            callback(parser, { value }) {
                const [type] = value
                if (type.omitted) {
                    // &.subclass, &:pseudo-class
                    value[0] = nestingSelector
                } else if (value.length === 1/* || type.value === '&'*/) {
                    // &&
                    value.push(createList([nestingSelector], '', ['subclass-selector']))
                } else {
                    // &type, &&&, &&&&, ...
                    type.unshift(nestingSelector)
                }
                return value
            },
            event: 'always',
            node,
            once: true,
            status: 'postprocessing',
        })
    }
}

module.exports = {
    '+': preParseCalcOperator,
    ',': preParseComma,
    '-': preParseCalcOperator,
    'calc-value': preParseCalcValue,
    'combinator': preParseCombinator,
    'compound-selector': preParseCompoundSelector,
    'image-set-option': preParseImageSetOption,
    'length': preParseLength,
    'pseudo-class-selector': preParseNestingSelector,
    'subclass-selector': preParseNestingSelector,
}
