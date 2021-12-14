
function CSSValue(value = [], ...args) {
    if (Array.isArray(value)) {
        return createList(value, ...args)
    }
    return new Single(value, ...args)
}

class Single {
    type
    value
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
 * interface while preserving its `type` and `separator` properties.
 *
 * TODO: implement an appropriate data structure for component values.
 */
function createList(values = [], separator = ' ', type = []) {
    type = new Set(type)
    return new class List extends Array {
        separator = separator
        type = type
    }(...values)
}

module.exports = CSSValue
