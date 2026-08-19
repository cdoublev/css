
import { findRule, getDeclaration, getProduction, getRule } from '../utils/context.js'

/**
 * @param {object} node
 * @returns {string}
 */
function resolveScopeStart(node) {
    if (findRule(getRule(node), ({ definition: { name } }) => name === '@scope' || name === '@style')) {
        return '<relative-real-selector-list>'
    }
    return '<complex-real-selector-list>'
}

/**
 * @param {object} node
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-5/#typedef-size-keyword}
 */
function resolveSizeKeyword(node) {
    switch (getDeclaration(node)?.definition.name) {
        case 'height':
        case 'min-height':
        case 'min-width':
        case 'width':
            return 'auto | min-content | max-content | stretch | fit-content | fit-content(<length-percentage [0,∞]>) | contain'
        case 'max-height':
        case 'max-width':
            return 'min-content | max-content | stretch | fit-content | fit-content(<length-percentage [0,∞]>) | contain'
        default:
            throw RangeError('Unexpected size keyword')
    }
}

/**
 * @param {object} node
 * @returns {string}
 */
function resolveMultipliedExpression(node) {
    return getProduction(getProduction(node)).definition.test
}

export default {
    '<scope-start>': resolveScopeStart,
    '<size-keyword>': resolveSizeKeyword,
    '<test>': resolveMultipliedExpression,
}
