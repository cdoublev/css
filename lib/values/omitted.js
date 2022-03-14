
const { serializeNodeType } = require('../serialize.js')

/**
 * @param {object} node
 * @param {number} location
 * @param {number} [position]
 * @returns {object}
 *
 * It returns a representation of an omitted value with:
 * - `value` as its value definition (omitting its multiplier, if any)
 * - `type` as a `String` for value combination otherwise a `Set`
 * - `location` as the list index at which the value has been omitted
 * - `position` (optional) as its canonical index in a list of matched values
 *
 * TODO: figure out the appropriate component property values of an omitted value
 * TODO: create a simplier representation for the "non-development" mode.
 */
function create(node, location, position) {
    const type = new Set()
    const value = serializeNodeType(node, true)
    const { type: nodeType } = node
    if (nodeType === 'delimiter') {
        type.add(nodeType)
    }
    if (position === undefined) {
        return { location, omitted: true, type, value }
    }
    return { location, omitted: true, position, type, value }
}

module.exports = create
