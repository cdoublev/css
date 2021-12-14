
const parse = require('../lib/parse/definition.js')

const a = { type: 'keyword', value: 'a' }
const b = { type: 'keyword', value: 'b' }
const c = { type: 'keyword', value: 'c' }
const comma = { type: 'delimiter', value: ',' }
const number = { type: 'basic', value: 'number' }

/**
 * @param {object} type
 * @param {object} repeat
 * @returns {object}
 */
function repeat(type, repeat) {
    return { ...type, repeat }
}

// TODO: handle repeated function name in definition value
it('rgb()', () => {
    const definition = 'rgb(<percentage>{3} [/ <alpha-value>]?) | rgb(<number>{3} [/ <alpha-value>]?) | rgb(<percentage>#{3} , <alpha-value>?) | rgb(<number>#{3} , <alpha-value>?)'
    const ast = {
        type: '|',
        value: [
            { name: 'rgb', type: 'function', value: '<percentage>{3} [/ <alpha-value>]?' },
            { name: 'rgb', type: 'function', value: '<number>{3} [/ <alpha-value>]?' },
            { name: 'rgb', type: 'function', value: '<percentage>#{3} , <alpha-value>?' },
            { name: 'rgb', type: 'function', value: '<number>#{3} , <alpha-value>?' },
        ],
    }
    expect(parse(definition)).toEqual(ast)
})

describe('single type', () => {
    it('represents a (keyword type)', () => {
        expect(parse('a')).toEqual(a)
    })
    it('represents <number> (basic type)', () => {
        expect(parse('<number>')).toEqual({ type: 'basic', value: 'number' })
    })
    it('represents <number [0,1]>', () => {
        const ast = {
            range: { max: 1, min: 0 },
            type: 'basic',
            value: 'number',
        }
        expect(parse('<number [0,1]>')).toEqual(ast)
    })
    it('represents <number [0,∞]>', () => {
        const ast = {
            range: { max: Infinity, min: 0 },
            type: 'basic',
            value: 'number',
        }
        expect(parse('<number [0,∞]>')).toEqual(ast)
    })
    it('represents <length-percentage> (non-terminal type)', () => {
        expect(parse('<length-percentage>')).toEqual({ type: 'non-terminal', value: 'length-percentage' })
    })
    it('represents fn(<number>) (terminal function)', () => {
        expect(parse('fn(<number>)')).toEqual({ name: 'fn', type: 'function', value: '<number>' })
    })
    it('represents <rotate()> (non-terminal function)', () => {
        expect(parse('<rotate()>')).toEqual({ name: 'rotate', type: 'function', value: '<angle> | <zero>' })
    })
    it("represents <'prop'> (property type)", () => {
        expect(parse("<'prop'>")).toEqual({ type: 'property', value: 'prop' })
    })
})
describe('repeated type', () => {
    it('represents a?', () => {
        expect(parse('a?')).toEqual(repeat(a, { max: 1, min: 1, optional: true }))
    })
    it('represents a*', () => {
        expect(parse('a*')).toEqual(repeat(a, { max: 20, min: 0 }))
    })
    it('represents a+', () => {
        expect(parse('a+')).toEqual(repeat(a, { max: 20, min: 1 }))
    })
    it('represents a{2}', () => {
        expect(parse('a{2}')).toEqual(repeat(a, { max: 2, min: 2 }))
    })
    it('represents a{1,}', () => {
        expect(parse('a{1,}')).toEqual(repeat(a, { max: 20, min: 1 }))
    })
    it('represents a#', () => {
        expect(parse('a#')).toEqual(repeat(a, { max: 20, min: 1, separator: ',' }))
    })
    it('represents a#?', () => {
        expect(parse('a#?')).toEqual(repeat(a, { max: 20, min: 1, optional: true, separator: ',' }))
    })
    it('represents a+#', () => {
        expect(parse('a+#')).toEqual(repeat(a, { max: 20, min: 1, separator: [' ', ','] }))
    })
    it('represents a+#?', () => {
        expect(parse('a+#?')).toEqual(repeat(a, { max: 20, min: 0, separator: [' ', ','] }))
    })
    it('represents a#{1,}', () => {
        expect(parse('a#{1,}')).toEqual(repeat(a, { max: 20, min: 1, separator: ',' }))
    })
    it('represents <number>?', () => {
        expect(parse('<number>?')).toEqual(repeat(number, { max: 1, min: 1, optional: true }))
    })
    it('represents <number># with `repeat.ignoreHash` flag set', () => {
        expect(parse('<number>#', { repeat: { ignoreHash: true } })).toEqual(number)
    })
    it('represents <calc-sum># with a custom `repeat.max`', () => {
        expect(parse('<calc-sum>#', { repeat: { max: 32 } })).toEqual({
            repeat: { min: 1, max: 32, separator: ',' },
            type: 'non-terminal',
            value: 'calc-sum',
        })
    })
    it("represents [['+' | '-'] <calc-product>]* with a custom `repeat.max`", () => {
        expect(parse("[['+' | '-'] <calc-product>]*", { repeat: { max: 32 } })).toEqual({
            repeat: { min: 0, max: 32 },
            type: ' ',
            value: [
                {
                    type: '|',
                    value: [
                        { type: 'delimiter', value: '+' },
                        { type: 'delimiter', value: '-' },
                    ],
                },
                { type: 'non-terminal', value: 'calc-product' },
            ],
        })
    })
})
describe('combined types', () => {
    it('represents a b c', () => {
        expect(parse('a b c')).toEqual({ type: ' ', value: [a, b, c] })
    })
    it('represents a && b && c', () => {
        expect(parse('a && b && c')).toEqual({ type: '&&', value: [a, b, c] })
    })
    it('represents a || b || c', () => {
        expect(parse('a || b || c')).toEqual({ type: '||', value: [a, b, c] })
    })
    it('represents a | b | c', () => {
        expect(parse('a | b | c')).toEqual({ type: '|', value: [a, b, c] })
    })
    it('represents a b c && a c b && b a c', () => {
        const ast = {
            type: '&&',
            value: [
                { type: ' ', value: [a, b, c] },
                { type: ' ', value: [a, c, b] },
                { type: ' ', value: [b, a, c] },
            ],
        }
        expect(parse('a b c && a c b && b a c')).toEqual(ast)
    })
    it('represents a b c && a c b | a', () => {
        const ast = {
            type: '|',
            value: [
                {
                    type: '&&',
                    value: [
                        { type: ' ', value: [a, b, c] },
                        { type: ' ', value: [a, c, b] },
                    ],
                },
                a,
            ],
        }
        expect(parse('a b c && a c b | a')).toEqual(ast)
    })
})
describe('group of types', () => {
    it('represents a [a | b]', () => {
        const ast = { type: ' ', value: [a, { type: '|', value: [a, b] }] }
        expect(parse('a [a | b]')).toEqual(ast)
    })
    it('represents [a | b] a', () => {
        const ast = { type: ' ', value: [{ type: '|', value: [a, b] }, a] }
        expect(parse('[a | b] a')).toEqual(ast)
    })
    it('represents [a | b]? c', () => {
        const ast = {
            type: ' ',
            value: [{ repeat: { max: 1, min: 1, optional: true }, type: '|', value: [a, b] }, c],
        }
        expect(parse('[a | b]? c')).toEqual(ast)
    })
    it('represents [a{2}]?', () => {
        const ast = {
            repeat: { max: 2, min: 2, optional: true },
            type: 'keyword',
            value: 'a',
        }
        expect(parse('[a{2}]?')).toEqual(ast)
    })
    it('represents [a?]!', () => {
        const ast = {
            repeat: { max: 1, min: 1, optional: false },
            type: 'keyword',
            value: 'a',
        }
        expect(parse('[a?]!')).toEqual(ast)
    })
    it('represents [a? b?]!', () => {
        const ast = {
            repeat: { max: 1, min: 1, optional: false },
            type: ' ',
            value: [
                repeat(a, { max: 1, min: 1, optional: true }),
                repeat(b, { max: 1, min: 1, optional: true }),
            ],
        }
        expect(parse('[a? b?]!')).toEqual(ast)
    })
})
describe('block of types', () => {
    it("(<number> '+'|'-' <number>)", () => {
        const ast = {
            type: 'simple-block',
            value: "<number> '+'|'-' <number>",
        }
        expect(parse("(<number> '+'|'-' <number>)")).toEqual(ast)
    })
})
describe('comma-separated types', () => {
    // Subject to comma-ellision rules
    it('represents a, b? c', () => {
        const ast = { type: ' ', value: [a, comma, repeat(b, { max: 1, min: 1, optional: true }), c] }
        expect(parse('a, b? c')).toEqual(ast)
    })
    it('represents a b?, c', () => {
        const ast = { type: ' ', value: [a, repeat(b, { max: 1, min: 1, optional: true }), comma, c] }
        expect(parse('a b?, c')).toEqual(ast)
    })
    it('represents a [b?, c]#', () => {
        const ast = {
            type: ' ',
            value: [
                a,
                {
                    repeat: { max: 20, min: 1, separator: ',' },
                    type: ' ',
                    value: [repeat(b, { max: 1, min: 1, optional: true }), comma, c],
                },
            ],
        }
        expect(parse('a [b?, c]#')).toEqual(ast)
    })
    // Not subject to comma-ellision rules
    it('represents [a, | b,] c', () => {
        const ast = {
            type: ' ',
            value: [
                {
                    type: '|',
                    value: [
                        { type: ' ', value: [a, comma] },
                        { type: ' ', value: [b, comma] },
                    ],
                },
                c,
            ],
        }
        expect(parse('[a, | b,] c')).toEqual(ast)
    })
    it('represents a [, b | , c]', () => {
        const ast = {
            type: ' ',
            value: [
                a,
                {
                    type: '|',
                    value: [
                        { type: ' ', value: [comma, b] },
                        { type: ' ', value: [comma, c] },
                    ],
                },
            ],
        }
        expect(parse('a [, b | , c]')).toEqual(ast)
    })
    it('represents [a && b, | a && c,] a', () => {
        const ast = {
            type: ' ',
            value: [
                {
                    type: '|',
                    value: [
                        { type: '&&', value: [a, { type: ' ', value: [b, comma] }] },
                        { type: '&&', value: [a, { type: ' ', value: [c, comma] }] },
                    ],
                },
                a,
            ],
        }
        expect(parse('[a && b, | a && c,] a')).toEqual(ast)
    })
    it('represents a [, a && b | , a && c]', () => {
        const ast = {
            type: ' ',
            value: [
                a,
                {
                    type: '|',
                    value: [
                        { type: '&&', value: [{ type: ' ', value: [comma, a] }, b] },
                        { type: '&&', value: [{ type: ' ', value: [comma, a] }, c] },
                    ],
                },
            ],
        }
        expect(parse('a [, a && b | , a && c]')).toEqual(ast)
    })
})
