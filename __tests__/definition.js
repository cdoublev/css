
const parse = require('../lib/parse/definition.js')
const properties = require('../lib/properties/definitions.js')
const { serializeDefinition: serialize } = require('../lib/serialize.js')
const types = require('../lib/values/definitions.js')

const a = { name: 'keyword', type: 'terminal', value: 'a' }
const b = { name: 'keyword', type: 'terminal', value: 'b' }
const c = { name: 'keyword', type: 'terminal', value: 'c' }
const colon = { type: 'delimiter', value: ':' }
const comma = { type: 'delimiter', value: ',' }
const number = { name: 'number', type: 'terminal' }

/**
 * @param {object} value
 * @returns {object}
 */
function optional(value) {
    return { type: 'optional', value }
}

/**
 * @param {object} value
 * @returns {object}
 */
function required(value) {
    return { type: 'required', value }
}

/**
 * @param {object} value
 * @param {number} min
 * @param {number} max
 * @param {string} [separator]
 * @returns {object}
 */
function repeat(value, min, max, separator) {
    return separator
        ? { max, min, separator, type: 'repeat', value }
        : { max, min, type: 'repeat', value }
}

/**
 * @param {string} name
 * @returns {object}
 */
function type(name) {
    return { name, type: 'non-terminal', value: types[name] }
}

describe('type', () => {
    it("represents '+' (delimiter)", () => {
        expect(parse("'+'")).toEqual({ type: 'delimiter', value: '+' })
    })
    it('represents a (keyword)', () => {
        expect(parse('a')).toEqual(a)
    })
    it('represents <number>', () => {
        expect(parse('<number>')).toEqual(number)
    })
    it('represents <number [-2,-1]>', () => {
        expect(parse('<number [-2,-1]>')).toEqual({
            max: -1,
            min: -2,
            name: 'number',
            type: 'terminal',
        })
    })
    it('represents <number [0,∞]>', () => {
        expect(parse('<number [0,∞]>')).toEqual({
            max: Infinity,
            min: 0,
            name: 'number',
            type: 'terminal',
        })
    })
    it('represents <number [-∞,0]>', () => {
        expect(parse('<number [-∞,0]>')).toEqual({
            max: 0,
            min: -Infinity,
            name: 'number',
            type: 'terminal',
        })
    })
    it('represents <angle [-1deg,1deg]>', () => {
        expect(parse('<angle [-1deg,1deg]>')).toEqual({
            max: 1,
            min: -1,
            name: 'angle',
            type: 'terminal',
        })
    })
    it('represents <angle [-1turn, 1turn]>', () => {
        expect(parse('<angle [-1turn,1turn]>')).toEqual({
            max: 360,
            min: -360,
            name: 'angle',
            type: 'terminal',
        })
    })
    it('represents fn(<number>)', () => {
        expect(parse('fn(<number>)')).toEqual({
            name: 'fn',
            type: 'function',
            value: '<number>',
        })
    })
    it("represents (<number> '+'|'-' <number>)", () => {
        expect(parse("(<number> '+'|'-' <number>)")).toEqual({
            associatedToken: '(',
            type: 'simple-block',
            value: "<number> '+'|'-' <number>",
        })
    })
    it("represents '[' a [b c] ']'", () => {
        expect(parse("'[' a [b c] ']'")).toEqual({
            associatedToken: '[',
            type: 'simple-block',
            value: 'a [b c]',
        })
    })
    it('represents <length-percentage>', () => {
        expect(parse('<length-percentage>')).toEqual(type('length-percentage'))
    })
    it('represents <length-percentage [0,∞]>', () => {
        const definition = parse('<length-percentage [0,∞]>')
        expect(definition).toEqual({
            max: Infinity,
            min: 0,
            name: 'length-percentage',
            type: 'non-terminal',
            value: types['length-percentage'],
        })
        expect(parse('<length>', { parent: { definition } })).toEqual({
            max: Infinity,
            min: 0,
            name: 'length',
            type: 'terminal',
        })
    })
    it('represents <rotate()>', () => {
        expect(parse('<rotate()>')).toEqual(type('rotate()'))
    })
    it('represents <structure>', () => {
        expect(parse('<declaration>')).toEqual({ name: 'declaration', type: 'structure' })
    })
    it("represents <'background-color'>", () => {
        expect(parse("<'background-color'>")).toEqual({
            name: 'background-color',
            type: 'property',
            value: properties['background-color'].value,
        })
    })
})
describe('multiplier', () => {
    it('represents a{1,2}', () => {
        expect(parse('a{1,2}')).toEqual(repeat(a, 1, 2))
    })
    it('represents a{2}', () => {
        expect(parse('a{2}')).toEqual(repeat(a, 2, 2))
    })
    it('represents a{2,∞}', () => {
        expect(parse('a{2,∞}')).toEqual(repeat(a, 2, 20))
    })
    it('represents a?', () => {
        expect(parse('a?')).toEqual(optional(a))
    })
    it('represents a*', () => {
        expect(parse('a*')).toEqual(repeat(a, 0, 20))
    })
    it('represents a+', () => {
        expect(parse('a+')).toEqual(repeat(a, 1, 20))
    })
    it('represents a#', () => {
        expect(parse('a#')).toEqual(repeat(a, 1, 20, ','))
    })
    it('represents a#{1,2}', () => {
        expect(parse('a#{1,2}')).toEqual(repeat(a, 1, 2, ','))
    })
    it('represents a#{2}', () => {
        expect(parse('a#{2}')).toEqual(repeat(a, 2, 2, ','))
    })
    it('represents a#{2,∞}', () => {
        expect(parse('a#{2,∞}')).toEqual(repeat(a, 2, 20, ','))
    })
    it('represents a#?', () => {
        expect(parse('a#?')).toEqual(optional(repeat(a, 1, 20, ',')))
    })
    it('represents a+#', () => {
        expect(parse('a+#')).toEqual(repeat(repeat(a, 1, 20), 1, 20, ','))
    })
    it('represents a+#?', () => {
        expect(parse('a+#?')).toEqual(optional(repeat(repeat(a, 1, 20), 1, 20, ',')))
    })
    it("represents ','?'", () => {
        expect(parse("','?")).toEqual(optional(comma))
    })
    it('represents <number>?', () => {
        expect(parse('<number>?')).toEqual(optional(number))
    })
})
describe('combination', () => {
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
        expect(parse('a b c && a c b && b a c')).toEqual({
            type: '&&',
            value: [
                { type: ' ', value: [a, b, c] },
                { type: ' ', value: [a, c, b] },
                { type: ' ', value: [b, a, c] },
            ],
        })
    })
    it('represents a b c && a c b | a', () => {
        expect(parse('a b c && a c b | a')).toEqual({
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
        })
    })
    it('represents a, a', () => {
        expect(parse('a, a')).toEqual({ type: ' ', value: [a, comma, a] })
    })
    it('represents a [b, c]', () => {
        expect(parse('a [b, c]')).toEqual({
            type: ' ',
            value: [a, { type: ' ', value: [b, comma, c] }],
        })
    })
    it('represents [a, | b,] c', () => {
        expect(parse('[a, | b,] c')).toEqual({
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
        })
    })
    it('represents a [, b | , c]', () => {
        expect(parse('a [, b | , c]')).toEqual({
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
        })
    })
    it('represents [a && b, | a && c,] a', () => {
        expect(parse('[a && b, | a && c,] a')).toEqual({
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
        })
    })
    it('represents a [, a && b | , a && c]', () => {
        expect(parse('a [, a && b | , a && c]')).toEqual({
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
        })
    })
    it('represents :pseudo-class', () => {
        expect(parse(':pseudo-class')).toEqual({
            type: ' ',
            value: [colon, { name: 'keyword', type: 'terminal', value: 'pseudo-class' }],
        })
    })
    it('represents ::pseudo-element', () => {
        expect(parse('::pseudo-element')).toEqual({
            type: ' ',
            value: [colon, colon, { name: 'keyword', type: 'terminal', value: 'pseudo-element' }],
        })
    })
    it('represents :pseudo-class(a)', () => {
        expect(parse(':pseudo-class(a)')).toEqual({
            type: ' ',
            value: [colon, { name: 'pseudo-class', type: 'function', value: 'a' }],
        })
    })
    it('represents ::pseudo-element(a)', () => {
        expect(parse('::pseudo-element(a)')).toEqual({
            type: ' ',
            value: [colon, colon, { name: 'pseudo-element', type: 'function', value: 'a' }],
        })
    })
})
describe('group', () => {
    it('represents a [a | b]', () => {
        expect(parse('a [a | b]')).toEqual({
            type: ' ',
            value: [a, { type: '|', value: [a, b] }],
        })
    })
    it('represents [a | b] a', () => {
        expect(parse('[a | b] a')).toEqual({
            type: ' ',
            value: [{ type: '|', value: [a, b] }, a],
        })
    })
    it('represents [a | b]? a', () => {
        expect(parse('[a | b]? a')).toEqual({
            type: ' ',
            value: [optional({ type: '|', value: [a, b] }), a],
        })
    })
    it('represents [a{2}]?', () => {
        expect(parse('[a{2}]?')).toEqual(optional(repeat(a, 2, 2)))
    })
    it('represents [a?]!', () => {
        expect(parse('[a?]!')).toEqual(required(optional(a)))
    })
    it('represents [a? b?]!', () => {
        expect(parse('[a? b?]!')).toEqual(required({
            type: ' ',
            value: [optional(a), optional(b)],
        }))
    })
})
describe('context rules', () => {
    it("represents the expansion of <'property'>", () => {
        const root = { definition: {} }
        const definition = parse("<'color'>")
        expect(parse('<number>#', { parent: { definition } })).toEqual(repeat(number, 1, 20, ','))
        expect(parse('<number>#', { parent: { definition, parent: root } })).toEqual(number)
    })
    it('represents the expansion of <calc-sum>', () => {
        const parent = { definition: parse('<calc-sum>') }
        expect(parse("[['+' | '-'] <calc-product>]*", { parent })).toEqual(repeat(
            {
                type: ' ',
                value: [
                    {
                        type: '|',
                        value: [
                            { type: 'delimiter', value: '+' },
                            { type: 'delimiter', value: '-' },
                        ],
                    },
                    type('calc-product'),
                ],
            },
            0,
            31))
    })
    it('represents <calc-sum># in min(<calc-sum>#)', () => {
        const parent = { definition: parse('min(<calc-sum>#)') }
        expect(parse('<calc-sum>#', { parent })).toEqual(repeat(type('calc-sum'), 1, 32, ','))
    })
})

describe('serialize', () => {
    const definitions = [
        ['a'],
        ['<number>'],
        ['<number [0,1]>'],
        ['<number [0,∞]>'],
        ['<length-percentage>'],
        ['<calc()>'],
        ['<number>?'],
        ['<number>*'],
        ['<number>+'],
        ['<number>{2}'],
        ['<number>{0,∞}', '<number>*'],
        ['<number>{1,∞}', '<number>+'],
        ['<number>{1,2}'],
        ['<number>#'],
        ['<number>#{1,2}'],
        ['<number>#{1,∞}', '<number>#'],
        ['<number>#{2,∞}', '<number>#{2,20}'],
        ['<number>#?'],
        ['<number>+#'],
        ['<number>+#?'],
        ['a b'],
        ['a && b'],
        ['a || b'],
        ['a | b'],
        ['[a b]?'],
        ['[a{2}]?'],
        ['[a? b?]!'],
    ]
    it.each(definitions)('serializes %s', (definition, expected = definition) =>
        expect(serialize(parse(definition))).toBe(expected))
})
