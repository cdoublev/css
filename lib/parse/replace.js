
import * as substitutions from '../values/substitutions.js'
import { colorFunctionKeywords, colorSpaceKeywords, colorSpaces } from '../values/colors.js'
import { consumeComponentValueList, parseArbitrarySubstitution, parseGrammar } from './parser.js'
import { dimensionTypes, getCalculationType, matchNumericType } from './types.js'
import { findContext, findFunction, findParent, findSibling, getFunction, getFunctionName, getRule, isProducedBy } from '../utils/context.js'
import { isDelimiter, isFailure } from '../utils/value.js'
import { create as createError } from '../error.js'
import { simplifyCalculation } from './simplify.js'

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}`, name: 'SyntaxError' })
}

/**
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-variables}
 */
function replaceCalcKeyword(node) {
    return replaceWithCalcSizeKeyword(node)
        ?? replaceWithColorComponentKeyword(node)
}

/**
 * @param {object} node
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-selector-list}
 */
function replaceForgivingSelector(node) {
    const { context, input } = node
    if (!context.strict && findContext(node, node => node.definition.type === 'forgiving')) {
        return consumeComponentValueList(input, ',', node)
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
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#math-function}
 * @see {@link https://drafts.csswg.org/css-values-5/#tree-counting}
 */
function replaceNumeric(node) {

    const topLevel = !isProducedBy(node, '<calc-value>')
    const { context, definition, input, parent } = node
    const token = input.next()

    if (token.types[0] !== '<function-token>') {
        if (definition.name === '<number>' && topLevel) {
            return replaceWithColorComponentKeyword(node)
        }
        return null
    }

    // Do not try replacing <dimension> produced by a CSS dimension type
    if (definition.name === '<dimension>' && parent?.definition.type === 'non-terminal') {
        return null
    }

    for (const { definition, element, name } of substitutions.numeric) {

        if (isFailure(parseGrammar([token], { name: '<function-token>', range: name, type: 'token' }, context))) {
            continue
        }
        if (element && !getRule(node)?.definition.elemental) {
            return error(node)
        }

        if (topLevel) {
            context.globals.set('calc-terms', 0)
        }
        const match = parseGrammar(input, definition, node, 'lazy')

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
    return null
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-style-range-value}
 */
function replaceWithArbitrarySubstitution(node) {
    return parseArbitrarySubstitution(node.input, node)
}

/**
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-5/#calc-size-calculation}
 */
function replaceWithCalcSizeKeyword(node) {
    const { context, input } = node
    const basis = context.trees.findLast(node => getFunctionName(node) === 'calc-size')?.children[0]
    if (basis && basis.value.value !== 'any') {
        const match = parseGrammar(input, 'size', node, 'lazy')
        if (!isFailure(match)) {
            return { ...match, types: [...match.types, '<calc-keyword>'] }
        }
    }
    return null
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isColorComponent(node) {
    return findFunction(node, node => findParent(node, node => node.definition.name === '<color>'), Boolean)
}

/**
 * @param {object} node
 * @returns {string|null}
 */
function resolveColorComponentDefinition(node) {
    // Find the deepest replaced node representing a color component
    if (!isColorComponent(node)) {
        node = findContext(node, node => node.state === 'replacing' && isColorComponent(node))
    }
    // There must be a source color for color component keywords to be valid
    if (node && findSibling(node, node => node.definition.name === '<color>')) {
        const { definition: { name } } = getFunction(node)
        if (name === 'color') {
            const colorSpace = findSibling(node, node => colorSpaces.includes(node.definition.name))
            return colorSpaceKeywords[colorSpace.definition.name]
        }
        return colorFunctionKeywords[name]
    }
}

/**
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-color-5/#relative-color}
 */
function replaceWithColorComponentKeyword(node) {
    const definition = resolveColorComponentDefinition(node)
    if (definition) {
        const { definition: { name }, input } = node
        const match = parseGrammar(input, definition, node, 'lazy')
        if (!isFailure(match) && name === '<calc-keyword>') {
            return { ...match, types: [...match.types, name] }
        }
        return match
    }
    return null
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-color-4/#typedef-deprecated-color}
 */
function replaceWithDeprecatedColor(node) {
    return parseGrammar(node.input, '<deprecated-color>', node, 'lazy')
}

/**
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#selectordef-}
 */
function replaceWithNestingSelector(node) {
    return node.input.consume(isDelimiter('&'))
}

export default {
    '<angle>': replaceNumeric,
    '<calc-keyword>': replaceCalcKeyword,
    '<complex-real-selector>': replaceForgivingSelector,
    '<dimension>': replaceNumeric,
    '<flex>': replaceNumeric,
    '<frequency>': replaceNumeric,
    '<integer>': replaceNumeric,
    '<length>': replaceNumeric,
    '<mf-value>': replaceWithArbitrarySubstitution,
    '<number>': replaceNumeric,
    '<percentage>': replaceNumeric,
    '<resolution>': replaceNumeric,
    '<style-range-value>': replaceWithArbitrarySubstitution,
    '<subclass-selector>': replaceWithNestingSelector,
    '<system-color>': replaceWithDeprecatedColor,
    '<time>': replaceNumeric,
    '<type-selector>': replaceWithNestingSelector,
}
