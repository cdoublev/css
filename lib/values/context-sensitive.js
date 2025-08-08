
import { getProduction } from '../utils/context.js'

/**
 * @param {object} node
 * @returns {string}
 */
function resolveMultipliedExpression(node) {
    return getProduction(getProduction(node)).definition.test
}

export default {
    '<test>': resolveMultipliedExpression,
}
