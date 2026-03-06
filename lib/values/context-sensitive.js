
import { findRule, getProduction } from '../utils/context.js'

/**
 * @param {object} node
 * @returns {string}
 */
function resolveScopeStart(node) {
    if (findRule(node, ({ definition: { name } }) => name === '@scope' || name === '@style')) {
        return '<relative-real-selector-list>'
    }
    return '<complex-real-selector-list>'
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
    '<test>': resolveMultipliedExpression,
}
