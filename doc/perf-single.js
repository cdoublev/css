
// Simple Object
function Single1(value, type = []) {
    return { type: new Set(type), value }
}
function map({ type, value, ...props }, fn) {
    return { ...props, type: new Set(type), value: fn(value) }
}

// Static class
class Single2 {
    type
    value
    constructor(value, type = [], props = []) {
        this.type = new Set(type)
        this.value = value
        props.forEach(([key, value]) => this[key] = value)
    }
    * [Symbol.iterator]() {
        yield this.value
    }
    map(fn) {
        const { type, value, ...props } = this
        return new Single2(fn(value), type, Object.entries(props))
    }
}

const n = 100000

console.time('Simple object')
for (let i = 0; i < n; i++) {
    const component = Single1(i, ['number'])
    const result = map(component, value => value + 1)
    result.type.add('matched')
}
console.timeEnd('Simple object')

console.time('Static class')
for (let i = 0; i < n; i++) {
    const component = new Single2(i, ['number'])
    const result = component.map(value => value + 1)
    result.type.add('matched')
}
console.timeEnd('Static class')
