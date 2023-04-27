
const { MAX_TERMS: MAX_MATH_FUNCTION_TERMS } = require('./math-functions.js')
const { angle, createList, length } = require('../values/value.js')
const { findLast, findParent } = require('../utils/context.js')
const { isAmpersand, isColon, isComma, isMinus, isPlus, isWhitespace } = require('../values/validation.js')
const createError = require('../error.js')
const createOmitted = require('../values/omitted.js')
const pseudos = require('../values/pseudos.js')
const properties = require('../properties/definitions.js')

/**
 * @param {object} node
 * @returns {Error}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `invalid ${name ? `<${name}>` : `'${value}'`}`, type: SyntaxError })
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#angle-value}
 *
 * It parses `0` and represents it as <angle> when it is an alternative of
 * <zero> (browser conformance).
 */
function preParseAngle({ tree: { list } }, { definition, parent }) {
    const next = list.next()
    if (next?.type.has('number') && next.value === 0 && parent) {
        const { definition: { type, value } } = parent
        if ((type === '|' || type === '||') && value.some(definition => definition.name === 'zero')) {
            list.consume()
            return angle(0, 'deg', [definition.name])
        }
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|null|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing when the next component value is a calculation sum operator
 * that is not preceded by a white space.
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
    const rootMathFunction = parser.trees.find(tree => tree.tail.definition.value?.includes('<calc-sum>'))
    if (MAX_MATH_FUNCTION_TERMS === rootMathFunction.arguments++) {
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
    if (tree.list.atEnd()) {
        return null
    }
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
            return error(node)
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
 * It aborts parsing when the next component value is a leading, adjacent, or
 * trailing comma.
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
 * when the preceding combinator is omitted and there is no leading white space,
 * except when it is the first combinator of a relative selector.
 *
 * It aborts parsing when the next component value does not start with `:`
 * whereas the context is a functional pseudo-class taking selector(s) as
 * argument(s) and is compounded to a pseudo-element.
 */
function preParseCompoundSelector(parser, node) {
    const { tree } = parser
    const { list, nodes } = tree
    const combinator = findLast(
        nodes,
        node => node.definition.value?.name === 'combinator',
        ({ definition: { name }, status }) =>
            status === 'matched' && (name === 'compound-selector' || name?.startsWith('relative')))
    // Omitted <combinator> and white space
    if (combinator?.value.omitted && !isWhitespace(list.current) && -1 < list.index) {
        return null
    }
    // Abort parsing anything other than a pseudo-class in a logical combination selecting pseudo-elements
    const next = list.next()
    if (
        next
        && !isColon(next)
        && findParent(tree, ({ list, tail }) =>
            pseudos.logical[`${list.current?.name}()`]
            && findParent(
                tail,
                node => node.definition.name === 'pseudo-compound-selector',
                node => node.definition.name === 'subclass-selector'))
    ) {
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
 * It aborts parsing when the next component value is a nested image set or when
 * it is not an url or a string whereas an url set option is expected.
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
    if (
        tree.parent.tail.parent.parent?.definition.name === 'url-set'
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
 * It aborts parsing a length when the next component value is `0` if it can be
 * parsed as an integer or a number, otherwise it parses and represents it as
 * <length> (browser conformance).
 */
function preParseLength({ tree: { list } }, { definition, parent }) {
    const next = list.next()
    if (next?.type.has('number') && next.value === 0) {
        if (parent) {
            const { definition: { type, value } } = parent
            if ((type === '|' || type === '||') && value.some(({ name }) => name === 'integer' || name === 'number')) {
                return null
            }
        }
        list.consume()
        return length(0, 'px', [definition.name])
    }
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|undefined}
 *
 * It aborts parsing when the context is a declaration for a property that is
 * not animatable.
 */
function preParseMix(parser, node) {
    if (properties[parser.context.definition.name]?.animate === false) {
        return error(node)
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
    if (list.atEnd(isWhitespace)) {
        return null
    }
    const nestingSelector = list.consume(isAmpersand)
    if (nestingSelector) {
        const { definition: { name } } = node
        if (name === 'subclass-selector' || name === 'pseudo-class-selector') {
            return nestingSelector
        }
        const next = list.next()
        // & is the last part of <[pseudo-]compound-selector>
        if (
            list.atEnd()
            || isWhitespace(next)
            || isComma(next)
            || list.next(2).every(isColon)
            || parser.parseValue([next], '<combinator>')
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

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|undefined}
 *
 * It aborts parsing when the next component value is an identifier or function
 * at the top-level of the selector of a nested style rule.
 */
function preParseRelativeSelectorList({ context, tree: { list, parent } }, node) {
    if (context.parent.definition.value === '<style-block>' && parent === null) {
        const { type } = list.next()
        if (type.has('ident') || type.has('function')) {
            return error(node)
        }
    }
}

module.exports = {
    '+': preParseCalcOperator,
    ',': preParseComma,
    '-': preParseCalcOperator,
    'angle': preParseAngle,
    'angle-percentage': preParseAngle,
    'calc-value': preParseCalcValue,
    'combinator': preParseCombinator,
    'compound-selector': preParseCompoundSelector,
    'image-set-option': preParseImageSetOption,
    'length': preParseLength,
    'length-percentage': preParseLength,
    'mix()': preParseMix,
    'pseudo-class-selector': preParseNestingSelector,
    'relative-selector-list': preParseRelativeSelectorList,
    'subclass-selector': preParseNestingSelector,
}
