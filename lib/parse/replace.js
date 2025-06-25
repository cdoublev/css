
const { colorFunctionKeywords, colorSpaces, colorSpaceKeywords } = require('../values/colors.js')
const { dimensionTypes, getCalculationType, matchNumericType } = require('./types.js')
const { findSibling, isProducedBy } = require('../utils/context.js')
const { isDelimiter, isFailure } = require('../utils/value.js')
const createError = require('../error.js')
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
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-variables}
 */
function replaceCalcKeyword(node, parser) {
    return replaceWithColorChannelKeyword(node, parser)
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-selector-list}
 */
function replaceForgivingSelector({ context, input }, parser) {
    if (!context.strict && context.forgiving) {
        input.moveToEnd()
        return input.data
    }
    return null
}

/**
 * @param {object} node
 * @returns {string|string[]}
 */
function getReplacedNumericType({ definition: { name } }) {
    switch (name) {
        case '<dimension>':
            return dimensionTypes
        case '<integer>':
            return '<number>'
        default:
            return name
    }
}

/**
 * @param {object} node
 * @returns {string|null}
 */
function getPercentageResolutionType({ definition: { name }, parent }) {
    if (name === '<dimension>' || name === '<percentage>') {
        return null
    }
    if (parent?.definition.type === '|' && parent.definition.value.some(definition => definition.name === '<percentage>')) {
        return name
    }
    return null
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#math-function}
 * @see {@link https://drafts.csswg.org/css-values-5/#tree-counting}
 */
function replaceNumeric(node, parser) {

    const { context, definition, input, parent } = node

    // Do not try replacing <dimension> produced by a CSS dimension type
    if (definition.name === '<dimension>' && parent?.definition.type === 'non-terminal') {
        return null
    }

    const name = input.next().name?.toLowerCase()
    const topLevel = !isProducedBy(node, '<calc-value>')

    const fn = name && substitutions.numeric.find(definition => definition.name === name)

    if (fn) {

        if (fn.element && !context.rule?.definition.elemental) {
            return error(node)
        }

        if (topLevel) {
            context.globals.set('calc-terms', 0)
        }

        const match = parser.parseCSSGrammar(input, `<${name}()>`, { ...context, replaced: node }, 'lazy')

        if (isFailure(match)) {
            return error(node)
        }

        // Validate type and simplify calculations once from top to bottom
        if (topLevel && !isProducedBy(node, '<mf-value>')) {

            const { name, range } = definition
            const replacedType = getReplacedNumericType(node)
            const resolutionType = getPercentageResolutionType(node)
            const type = getCalculationType(match, resolutionType)

            if (matchNumericType(type, replacedType, resolutionType)) {
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
        const { [index - 1]: { context: { replaced, function: fn } } } = trees
        if (fn) {
            const { definition: { name } } = fn
            // Ignore trees of numeric substitution functions and their arguments
            if (substitutions.numeric.some(definition => definition.name === name)) {
                node = replaced
                --index
                continue
            }
            // There must be a source color for color keywords to be valid
            if (findSibling(node, node => node.definition.name === '<color>')) {
                if (name === 'color') {
                    const colorSpace = findSibling(node, node => colorSpaces.includes(node.definition.name))
                    return colorSpaceKeywords[colorSpace.definition.name]
                }
                return colorFunctionKeywords[name]
            }
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
        const match = parser.parseCSSGrammar(input, definition, context, 'lazy')
        if (!isFailure(match) && name === '<calc-keyword>') {
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
 * @see {@link https://drafts.csswg.org/css-color-4/#typedef-deprecated-color}
 */
function replaceWithDeprecatedColor(node, parser) {
    const { context, input } = node
    const match = parser.parseCSSGrammar(input, '<deprecated-color>', context, 'lazy')
    if (isFailure(match)) {
        return match
    }
    return { ...match, types: [...match.types, '<deprecated-color>'] }
}

/**
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#selectordef-}
 */
function replaceWithNestingSelector(node) {
    return node.input.consume(isDelimiter('&'))
}

module.exports = {
    '<angle>': replaceNumeric,
    '<calc-keyword>': replaceCalcKeyword,
    '<complex-real-selector>': replaceForgivingSelector,
    '<dimension>': replaceNumeric,
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
