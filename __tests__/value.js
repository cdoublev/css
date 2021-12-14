
const CSSValue = require('../lib/values/value.js')

it('iterates over a single value', () => {
    const single = new CSSValue(1)
    for (const value of single) {
        expect(value).toBe(single)
    }
})
it('iterates over a list of values', () => {
    const list = new CSSValue([1, 2])
    for (const value of list) {
        expect(value).toBe(list[0])
        break
    }
    let i = 0
    for (const value of list) {
        expect(value).toBe(list[i++])
    }
})
it('transforms a single value without side effect but preserving instance properties', () => {
    const single = new CSSValue(1, ['length'], [['unit', 'px']])
    const transformed = single.map(n => n + 1)
    transformed.type.add('two')
    expect(single.value).toBe(1)
    expect(single.type.size).toBe(1)
    expect(single.unit).toBe('px')
    expect(transformed.value).toBe(2)
    expect(transformed.type.size).toBe(2)
    expect(transformed.unit).toBe('px')
})
it('transforms a list of values without side effect but preserving instance properties', () => {
    const parameters = { strategy: 'to-zero' }
    const list = new CSSValue([1, 2], ' ', ['round'], [['parameters', parameters]])
    const transformed = list.map(n => n + 1)
    transformed.type.add('result')
    expect(list).toEqual(expect.arrayContaining([1, 2]))
    expect(list.type.size).toBe(1)
    expect(list.parameters).toBe(parameters)
    expect(transformed).toEqual(expect.arrayContaining([2, 3]))
    expect(transformed.type.size).toBe(2)
    expect(transformed.separator).toBe(' ')
    expect(transformed.unit).toBe(parameters)
})
