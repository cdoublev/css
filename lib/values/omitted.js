
const { serializeDefinition } = require('../serialize.js')

/**
 * @param {object} definition
 * @returns {object}
 *
 * It returns a representation of an omitted value with:
 * - `value`: its value definition
 * - `type`: a `Set` that is empty except for a delimiter
 */
function create(definition) {
    const type = new Set()
    const { type: definitionType } = definition
    if (definitionType === 'delimiter') {
        type.add(definitionType)
    }
    return { omitted: true, type, value: serializeDefinition(definition) }
}

module.exports = create
