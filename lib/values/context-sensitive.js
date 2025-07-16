
const { getProduction } = require('../utils/context.js')

/**
 * @param {object} node
 * @returns {string}
 */
function resolveMultipliedExpression(node) {
    return getProduction(getProduction(node)).definition.test
}

module.exports = {
    '<test>': resolveMultipliedExpression,
}
