
const { serializeNodeType } = require('../serialize.js')

/**
 * @param {object} node
 * @param {number} [location]
 * @param {number} [position]
 * @returns {object}
 */
function create(node, location, position) {
    const type = new Set()
    const value = serializeNodeType(node, true)
    const { type: nodeType } = node
    // TODO: figure out the appropriate component property values of an omitted value
    if (nodeType === 'delimiter') {
        type.add(nodeType)
    }
    if (location === undefined) {
        return { omitted: true, type, value }
    }
    if (position === undefined) {
        return { location, omitted: true, type, value }
    }
    return { location, omitted: true, position, type, value }
}

module.exports = create
