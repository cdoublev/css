
const { findContext, findParent, findSibling } = require('../utils/context.js')
const { isColon, isComma, isDelimiter, isOmitted, isWhitespace } = require('../utils/value.js')
const { length, omitted } = require('../values/value.js')
const createError = require('../error.js')
const pseudos = require('../values/pseudos.js')
const properties = require('../properties/definitions.js')

/**
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 */
const MAX_CALCULATION_TERMS = 32

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}` })
}

/**
 * @param {object} node
 * @returns {SyntaxError|null|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing when the next component value is a calculation sum operator
 * that is not preceded by a whitespace.
 */
function preParseCalcOperator(node) {
    const { input } = node
    if (input.atEnd()) {
        return null
    }
    if (!isWhitespace(input.current) && findParent(node, node => node.definition.name === '<calc-sum>')) {
        if (isDelimiter(['-', '+'], input.next())) {
            return error(node)
        }
        return null
    }
}

/**
 * @param {object} node
 * @returns {SyntaxError|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 *
 * It aborts parsing when exceeding the maximum number of calculation terms.
 */
function preParseCalcValue(node) {
    const { context: { globals } } = node
    let count = globals.get('calc-terms')
    if (count++ === MAX_CALCULATION_TERMS) {
        return error(node)
    }
    globals.set('calc-terms', count)
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|object[]|null|undefined}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-combinator}
 * @see {@link https://drafts.csswg.org/selectors-4/#pseudo-element-structure}
 *
 * It aborts parsing a combinator when it follows a selector of a pseudo-element
 * that has no internal structure, or when the context only allows a compound
 * selector.
 *
 * It aborts parsing when the context allows relative selector(s) whereas it is
 * already restricted to compound selector(s).
 */
function preParseCombinator(node) {
    const { context, input } = node
    if (input.atEnd()) {
        return null
    }
    const pseudoElement = findSibling(
        node,
        node => node.definition.name === '<pseudo-element-selector>',
        ({ definition: { name } }) => name === '<compound-selector>' || name?.startsWith('<relative'))
    if (pseudoElement) {
        const { value: [, [, { name, types, value }]] } = pseudoElement
        const definition = types[0] === '<function>'
            ? pseudos.elements.functions[name]
            : pseudos.elements.identifiers[value]
        if (!definition?.structured) {
            return error(node)
        }
    }
    const { trees } = context
    if (trees.findLast(tree => tree.definition.name === '<compound-selector>')) {
        return trees.at(-1).definition.name?.startsWith('<relative') ? error(node) : null
    }
}

/**
 * @param {object} node
 * @param {number} direction
 * @returns {boolean}
 */
function hasArbitrarySibling({ definition, parent: { definition: { type, value } } }, direction) {
    const next = type === 'repetition' ? value : value[value.indexOf(definition) + direction]
    if (next?.type === 'optional') {
        const { value: { name } } = next
        return name === '<any-value>' || name === '<declaration-value>'
    }
    return false
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#comb-comma}
 * @see {@link https://drafts.csswg.org/css-variables-2/#funcdef-var}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/8387}
 *
 * It aborts parsing when the next component value is a leading, adjacent, or
 * trailing comma (exception excluded).
 *
 * It accepts an omitted value as replacing a comma that would not have been the
 * separator of a repeated node.
 */
function preParseComma(node) {
    const { input, parent } = node
    let { current } = input
    if (isWhitespace(current)) {
        current = input.prev()
    }
    const comma = input.consume(isComma)
    if (current === undefined || isComma(current)) {
        if (comma) {
            return hasArbitrarySibling(node, -1) ? comma : error(node)
        }
        return parent.definition.type === 'repetition' ? null : omitted
    }
    if (comma) {
        if (input.atEnd() && !hasArbitrarySibling(node, 1)) {
            return error(node)
        }
        return comma
    }
    if (input.atEnd() && parent.definition.type !== 'repetition') {
        return omitted
    }
    return null
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function hasInvalidSiblingCombinator({ input, parent }) {
    const combinator = parent?.children[0]?.value
    return -1 < input.index
        && combinator && isOmitted(combinator)
        && !isWhitespace(input.current)
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|null|undefined}
 * @see {@link https://drafts.csswg.org/selectors-4/#white-space}
 *
 * It aborts parsing a complex selector unit following another complex selector
 * unit when the combinator is omitted and there is no interleaving whitespace.
 */
function preParseComplexSelectorUnit(node) {
    if (hasInvalidSiblingCombinator(node)) {
        return null
    }
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|null|undefined}
 * @see {@link https://drafts.csswg.org/selectors-4/#white-space}
 *
 * It aborts parsing a compound selector following another compound selector
 * when the combinator is omitted and there is no interleaving whitespace.
 *
 * It aborts parsing when the next component value is not a pseudo whereas the
 * context is a logical pseudo-class compounded to a pseudo-element.
 */
function preParseCompoundSelector(node) {
    if (hasInvalidSiblingCombinator(node)) {
        return null
    }
    const next = node.input.next()
    if (
        next
        && !isColon(next)
        && findContext('function', node, node =>
            pseudos.logical[node.input.current?.name.toLowerCase()]
            // ::part(name):not(type) must be valid (but match nothing)
            && node.input.prev(1, 1)?.name?.toLowerCase() !== 'part'
            && findParent(
                node,
                node => node.definition.name === '<pseudo-compound-selector>',
                node => node.definition.name === '<subclass-selector>'))
    ) {
        return error(node)
    }
}

/**
 * @param {object} node
 * @returns {SyntaxError|undefined}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-image-set}
 *
 * It aborts parsing when the next component value is a nested image set.
 */
function preParseImageSet(node) {
    if (
        node.input.next()?.name?.toLowerCase() === 'image-set'
        && findContext('function', node, node => node.definition.name === 'image-set')
    ) {
        return error(node)
    }
}

/**
 * @param {object} node
 * @returns {SyntaxError|undefined}
 * @see {@link https://drafts.csswg.org/css-ui-4/#typedef-cursor-url-set}
 *
 * It aborts parsing when the next component value is not an url or a string
 * whereas an url set option is expected.
 */
function preParseImageSetOption(node) {
    const { context, input } = node
    const next = input.next()
    if (next) {
        const name = next.name?.toLowerCase()
        if (
            context.function.parent.parent?.definition.name === '<url-set>'
            && name !== 'src'
            && name !== 'url'
            && next.types[0] !== '<string-token>'
        ) {
            return error(node)
        }
    }
}

/**
 * @param {object} node
 * @returns {null|undefined}
 * @see {@link https://drafts.csswg.org/css-values-4/#length-value}
 *
 * It aborts parsing a length when the next component value is 0 and the context
 * allows a number or an integer.
 *
 * It accepts 0 as replacing 0px.
 */
function preParseLength(node) {
    const { input, definition, parent } = node
    const next = input.next()
    if (next?.types[0] === '<number-token>' && next.value === 0) {
        if (parent) {
            const { definition: { type, value } } = parent
            if ((type === '|' || type === '||') && value.some(({ name }) => name === '<integer>' || name === '<number>')) {
                return null
            }
        }
        input.consume()
        if (definition.name === '<length-percentage>') {
            return length(0, 'px', ['<length-percentage>'])
        }
        return length(0, 'px')
    }
}

/**
 * @param {object} node
 * @returns {SyntaxError|null|undefined}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-mix}
 *
 * It aborts parsing a mix when the context is a declaration for a property that
 * is not animatable, and aborts parsing when the next component value happens
 * to be a mix.
 */
function preParseMix(node) {
    if (properties[node.context.declaration?.definition.name]?.animate === false) {
        return node.input.next()?.name?.toLowerCase() === 'mix' ? error(node) : null
    }
}

module.exports = {
    '+': preParseCalcOperator,
    ',': preParseComma,
    '-': preParseCalcOperator,
    '<calc-value>': preParseCalcValue,
    '<combinator>': preParseCombinator,
    '<complex-selector-unit>': preParseComplexSelectorUnit,
    '<compound-selector>': preParseCompoundSelector,
    '<image-set()>': preParseImageSet,
    '<image-set-option>': preParseImageSetOption,
    '<length-percentage>': preParseLength,
    '<length>': preParseLength,
    '<mix()>': preParseMix,
}
