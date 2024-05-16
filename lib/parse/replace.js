
const { colorFunctionKeywords, colorSpaces, colorSpaceKeywords } = require('../values/colors.js')
const { getMathFunctionType, matchNumericType } = require('./types.js')
const { getNumericContextTypes, simplifyCalculationTree } = require('./math-function.js')
const { isAmpersand, isOmitted } = require('../utils/value.js')
const { findSibling } = require('../utils/context.js')
const substitutions = require('../values/substitutions.js')

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
 * @returns {SyntaxError|object[]|null}
 * @see {@link https://drafts.csswg.org/css-color-5/#relative-color}
 */
function replaceColorChannel(node, parser) {
    const definition = resolveColorChannelDefinition(node)
    if (definition) {
        const { context, input } = node
        const match = parser.parseCSSValue(input, definition, context, 'lazy')
        if (match && !(match instanceof SyntaxError)) {
            return { ...match, types: [...match.types, '<calc-keyword>'] }
        }
    }
    return null
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|null}
 */
function replaceNumber(node, parser) {
    const { context, input } = node
    const { name } = input.next()
    if (substitutions.numeric.state.includes(name) && context.rule.definition.elemental) {
        return parser.parseCSSValue(input, `<${name}()>`, { ...context, replaced: node }, 'lazy')
    }
    return replaceNumeric(node, parser)
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#math-function}
 *
 * `contextType` is the context production: <type-percentage> or <type>.
 *
 * `resolutionType` is the type in <type-percentage> or it is undefined.
 *
 * `numericType` is a map of base types to integers representing a power.
 */
function replaceNumeric(node, parser) {

    const { context, definition, input, parent } = node
    const { name } = input.next()

    if (!substitutions.numeric.math.includes(name)) {
        return replaceColorChannel(node, parser)
    }

    // <number> -> <number> | <dimension> | ... -> <calc-value>
    const topLevel = parent?.parent?.definition.name !== '<calc-value>'
    if (topLevel) {
        context.globals.set('calc-terms', 0)
    }

    const match = parser.parseCSSValue(input, `<${name}()>`, { ...context, replaced: node }, 'lazy')
    // Eg. do not match the type of `min(1)` when parsing `translateX(calc(1px * min(1)))`
    if (topLevel && match && !(match instanceof SyntaxError)) {
        const { contextType, resolutionType } = getNumericContextTypes(node)
        const numericType = getMathFunctionType(match, resolutionType)
        if (matchNumericType(numericType, contextType)) {
            const value = simplifyCalculationTree(match, resolutionType)
            const { name, range } = definition
            const round = name === '<integer>'
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
function replaceSelector(node) {
    return node.input.consume(isAmpersand)
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|null}
 */
function replaceSystemColor(node, parser) {
    const { context, input } = node
    const match = parser.parseCSSValue(input, '<deprecated-color>', context, 'lazy')
    if (match && !(match instanceof SyntaxError)) {
        return { ...match, types: [...match.types, '<deprecated-color>'] }
    }
    return match
}

module.exports = {
    '<angle>': replaceNumeric,
    '<flex>': replaceNumeric,
    '<frequency>': replaceNumeric,
    '<integer>': replaceNumber,
    '<length>': replaceNumeric,
    '<number>': replaceNumber,
    '<percentage>': replaceNumeric,
    '<resolution>': replaceNumeric,
    '<subclass-selector>': replaceSelector,
    '<system-color>': replaceSystemColor,
    '<time>': replaceNumeric,
    '<type-selector>': replaceSelector,
}
