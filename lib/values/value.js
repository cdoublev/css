
// Highly unstable. `Single` and `create` are not currently used.

class Single {
    constructor(value, type = [], props = []) {
        this.type = new Set(type)
        this.value = value
        props.forEach(([key, value]) => this[key] = value)
    }
    * [Symbol.iterator]() {
        yield this
    }
    map(fn) {
        const { type, value, ...props } = this
        return new Single(fn(value), type, props)
    }
}

/**
 * @param {string[]} [values]
 * @param {string} [separator]
 * @param {Array|Set} [type]
 * @returns {List}
 *
 * This factory returns a list of values that can be transformed using `Array`
 * interface while preserving its properties.
 */
function createList(values = [], separator = ' ', type = []) {
    type = new Set(type)
    return new class List extends Array {
        separator = separator
        type = type
    }(...values)
}

/**
 * @param {*} value
 * @param {string} [separator]
 * @param {Array|Set} [type]
 * @returns {Single|List}
 */
function create(value = [], ...args) {
    if (Array.isArray(value)) {
        return createList(value, ...args)
    }
    return new Single(value, ...args)
}

/**
 * @param {object} component
 * @param {function} transform
 * @param {boolean} [preserveRepresentation]
 * @returns {object}
 */
function map({ representation, type, value, ...props }, transform, preserveRepresentation = false) {
    type = new Set(type)
    value = transform(value)
    if (preserveRepresentation) {
        return { ...props, representation, type, value }
    }
    return { ...props, type, value }
}

function angle(value, unit = 'deg', type = []) {
    return { type: new Set(['dimension', 'angle', ...type]), unit, value }
}
function number(value, type = []) {
    return { type: new Set(['number', ...type]), value }
}
function percentage(value, type = []) {
    return { type: new Set(['percentage', ...type]), unit: '%', value }
}
function simpleBlock(value = [], type = [], associatedToken = '[') {
    return { associatedToken, type: new Set(['simple-block', ...type]), value: createList(value) }
}

module.exports = {
    angle,
    create,
    createList,
    map,
    number,
    percentage,
    simpleBlock,
}
