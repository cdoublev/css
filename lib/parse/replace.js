
const { colorFunctionKeywords, colorSpaces, colorSpaceKeywords } = require('../values/colors.js')
const { getCalculationType, matchNumericType } = require('./types.js')
const { isAmpersand, isOmitted } = require('../utils/value.js')
const createError = require('../error.js')
const { findSibling } = require('../utils/context.js')
const { simplifyCalculation } = require('./simplify.js')
const substitutions = require('../values/substitutions.js')

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}` })
}

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

    const { context, definition, input, parent } = node
    const { name } = input.next()
    const topLevel = !context.replaced

    const fn = name && substitutions.numeric.find(definition => definition.name === name)

    if (fn) {

        if (fn.element && !context.rule.definition.elemental) {
            return error(node)
        }

        if (topLevel) {
            context.globals.set('calc-terms', 0)
        }

        const match = parser.parseCSSValue(input, `<${name}()>`, { ...context, replaced: node }, 'lazy')

        if (match === null) {
            return error(node)
        }
        if (match instanceof SyntaxError) {
            return match
        }

        // Validate type and simplify calculations once from top to bottom
        if (topLevel) {

            const { name, range } = definition
            const replacedType = name === '<integer>' ? '<number>' : name
            const hasResolutionType = name !== '<percentage>'
                && parent?.definition.type === '|'
                && parent.definition.value.some(definition => definition.name === '<percentage>')
            const resolutionType = hasResolutionType ? name : null
            const numericType = getCalculationType(match, resolutionType)

            if (matchNumericType(numericType, replacedType, resolutionType)) {
                return {
                    ...match,
                    range,
                    round: name === '<integer>',
                    types: [...match.types, '<calc-function>'],
                    value: simplifyCalculation(match, resolutionType),
                }
            }
            return null
        }
        return match
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
            // Ignore trees of numeric substitution functions and their arguments
            if (substitutions.numeric.some(definition => definition.name === name)) {
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
 * @param {object} node
 * @returns {object|null}
 */
function replaceWithNestingSelector(node) {
    return node.input.consume(isAmpersand)
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
