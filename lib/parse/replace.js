
const { colorFunctionKeywords, colorSpaces, colorSpaceKeywords } = require('../values/colors.js')
const { getNumericFunctionType, matchNumericType } = require('./types.js')
const { getNumericContextTypes, simplifyCalculationTree } = require('./math-function.js')
const { isAmpersand, isOmitted } = require('../utils/value.js')
const error = require('../error.js')
const { findSibling } = require('../utils/context.js')
const substitutions = require('../values/substitutions.js')

/**
 * @param {object} node
 * @param {object} parser
 * @returns {object|null}
 */
function replaceCalcKeyword(node, parser) {
    return replaceWithColorChannelKeyword(node, parser)
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#math-function}
 */
function replaceNumeric(node, parser) {

    const { definition, input, parent } = node
    const { name } = input.next()
    // <number> -> <number> | <dimension> | ... -> <calc-value>
    const topLevel = parent?.parent?.definition.name !== '<calc-value>'

    if (substitutions.numeric.state.includes(name)) {
        return replaceWithNumericFunction(name, node, parser, topLevel)
    }
    if (substitutions.numeric.math.includes(name)) {
        return replaceWithMathFunction(name, node, parser, topLevel)
    }
    // Try replacing <number> at the top-level of a color function
    if (definition.name === '<number>' && topLevel) {
        return replaceWithColorChannelKeyword(node, parser)
    }
    return null
}

/**
 * @param {object} node
 * @returns {string|null}
 */
function resolveColorChannelDefinition(node) {
    const { context: { trees } } = node
    // Find the deepest tree whose context is a color function
    for (let index = trees.length; 0 < index; --index) {
        const tree = trees[index - 1]
        const { children, context: { replaced, function: fn } } = tree
        if (fn) {
            const { definition: { name } } = fn
            // Ignore trees of math functions and their arguments
            if (substitutions.numeric.math.includes(name)) {
                node = replaced
                --index
                continue
            }
            // There must be a source color for color keywords to be valid
            const [source] = children
            if (source?.definition.type !== 'optional' || isOmitted(source.value)) {
                return null
            }
            if (name === 'color') {
                const colorSpace = findSibling(node, node => colorSpaces.includes(node.definition.name))
                return colorSpaceKeywords[colorSpace.definition.name]
            }
            return colorFunctionKeywords[name]
        }
        return null
    }
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-color-5/#relative-color}
 */
function replaceWithColorChannelKeyword(node, parser) {
    const definition = resolveColorChannelDefinition(node)
    if (definition) {
        const { context, definition: { name }, input } = node
        const match = parser.parseCSSValue(input, definition, context, 'lazy')
        if (match && name === '<calc-keyword>') {
            return { ...match, types: [...match.types, name] }
        }
        return match
    }
    return null
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|null}
 */
function replaceWithDeprecatedColor(node, parser) {
    const { context, input } = node
    const match = parser.parseCSSValue(input, '<deprecated-color>', context, 'lazy')
    if (match && !(match instanceof SyntaxError)) {
        return { ...match, types: [...match.types, '<deprecated-color>'] }
    }
    return match
}

/**
 * @param {string} name
 * @param {object} node
 * @param {object} parser
 * @param {boolean} topLevel
 * @returns {SyntaxError|object|null}
 *
 * contextType: <type-percentage> or <type>.
 * resolutionType: type in <type-percentage> or undefined.
 * numericType: map of base types to integers (powers)
 */
function replaceWithMathFunction(name, node, parser, topLevel) {

    const { context, definition: { name: type, range }, input } = node

    if (topLevel) {
        context.globals.set('calc-terms', 0)
    }

    const match = parser.parseCSSValue(input, `<${name}()>`, { ...context, replaced: node }, 'lazy')

    // Eg. do not match the type of `min(1)` when parsing `translateX(calc(1px * min(1)))`
    if (topLevel && match && !(match instanceof SyntaxError)) {

        const { contextType, resolutionType } = getNumericContextTypes(node)
        const numericType = getNumericFunctionType(match, resolutionType)

        if (matchNumericType(numericType, contextType)) {

            const value = simplifyCalculationTree(match, resolutionType)
            const round = type === '<integer>'
            const types = [...match.types, '<math-function>']

            return { ...match, range, round, types, value }
        }
        return null
    }
    return match
}

/**
 * @param {object} node
 * @returns {object|null}
 */
function replaceWithNestingSelector(node) {
    return node.input.consume(isAmpersand)
}

/**
 * @param {string} name
 * @param {object} node
 * @param {object} parser
 * @param {boolean} topLevel
 * @returns {SyntaxError|object|null}
 */
function replaceWithNumericFunction(name, node, parser, topLevel) {

    const { context, definition: { name: type }, input } = node

    if ((type === '<integer>' || type === '<number>') && context.rule.definition.elemental) {
        return parser.parseCSSValue(input, `<${name}()>`, { ...context, replaced: node }, 'lazy')
    }
    return error(node)
}

module.exports = {
    '<angle>': replaceNumeric,
    '<calc-keyword>': replaceCalcKeyword,
    '<flex>': replaceNumeric,
    '<frequency>': replaceNumeric,
    '<integer>': replaceNumeric,
    '<length>': replaceNumeric,
    '<number>': replaceNumeric,
    '<percentage>': replaceNumeric,
    '<resolution>': replaceNumeric,
    '<subclass-selector>': replaceWithNestingSelector,
    '<system-color>': replaceWithDeprecatedColor,
    '<time>': replaceNumeric,
    '<type-selector>': replaceWithNestingSelector,
}
