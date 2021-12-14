
// Simple Array
function List1(values = [], type = [], separator = ' ') {
    values.type = new Set(type)
    values.separator = separator
    return values
}
function map(list, fn) {
    const { separator, type } = list
    return List1(list.map(fn), type, separator)
}

// Static class as Array decorator
class List2 {

    separator
    type
    values

    constructor(values = [], type = [], separator = ' ') {
        this.type = new Set(type)
        this.values = values
        this.separator = separator
    }
    * [Symbol.iterator]() {
        yield this.value
    }
    get length() {
        return this.values.length
    }
    at(index) {
        return this.values[index]
    }
    filter(fn) {
        return new List2(this.values.filter(fn), this.type, this.separator)
    }
    map(fn) {
        return new List2(this.values.map(fn), this.type, this.separator)
    }
    push(value) {
        this.values.push(value)
    }
    reduce(fn, seed) {
        return new List2(this.values.reduce(fn, seed), this.type, this.separator)
    }
    // ... other Array methods
}

const n = 100000

console.time('Simple Array')
for (let i = 0; i < n; i++) {
    const component = List1([i, i + 1], ['numbers'])
    const result = map(component, value => value + 1)
    result.type.add('matched')
}
console.timeEnd('Simple Array')

console.time('Static class as Array decorator')
for (let i = 0; i < n; i++) {
    const component = new List2([i, i + 1], ['numbers'])
    const result = component.map(value => value + 1)
    result.type.add('matched')
}
console.timeEnd('Static class as Array decorator')
