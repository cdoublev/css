
const { createContext } = require('../lib/utils/context.js')
const nonTerminal = require('../lib/values/definitions.js')
const parseDefinition = require('../lib/parse/definition.js')
const properties = require('../lib/properties/definitions.js')
const { serializeDefinition: serialize } = require('../lib/serialize.js')

/**
 * @param {...object} value
 * @returns {object}
 */
function alternation(...value) {
    return { type: '|', value }
}

/**
 * @param {...object} value
 * @returns {object}
 */
function arrangement(...value) {
    return { type: '||', value }
}

/**
 * @param {string} range
 * @returns {object}
 */
function keyword(range) {
    return { name: '<keyword>', range, type: 'non-terminal', value: '<ident>' }
}

/**
 * @param {object} value
 * @returns {object}
 */
function optional(value) {
    return { type: 'optional', value }
}

/**
 * @param {...object} value
 * @returns {object}
 */
function permutation(...value) {
    return { type: '&&', value }
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
        ? { max, min, separator, type: 'repetition', value }
        : { max, min, type: 'repetition', value }
}

/**
 * @param {object} value
 * @returns {object}
 */
function required(value) {
    return { type: 'required', value }
}

/**
 * @param {object[]} value
 * @param {string} [separator]
 * @returns {object}
 */
function sequence(...value) {
    return { type: ' ', value }
}

/**
 * @param {string} value
 * @returns {object}
 */
function token(value) {
    return { type: 'token', value }
}

/**
 * @param {string} name
 * @returns {object}
 */
function type(name) {
    return { name, type: 'non-terminal', value: nonTerminal[name] }
}

/**
 * @param {string} definition
 * @param {object} [parent]
 */
function parse(definition, parent = null) {
    return parseDefinition(definition, context, parent)
}

const context = createContext()
const a = keyword('a')
const b = keyword('b')
const c = keyword('c')
const colon = token(':')
const comma = token(',')
const number = type('<number>')

describe('symbols', () => {
    it("parses and serializes '+' (delimiter)", () => {
        const input = "'+'"
        const parsed = token('+')
        expect(parse("'+'")).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a (keyword)', () => {
        const input = 'a'
        expect(parse(input)).toEqual(a)
        expect(serialize(a)).toBe(input)
    })
    it('parses and serializes <number-token>', () => {
        const input = '<number-token>'
        const parsed = { name: input,  type: 'token' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <number>', () => {
        const input = '<number>'
        expect(parse(input)).toEqual(number)
        expect(serialize(number)).toBe(input)
    })
    it('parses and serializes <number [-2,-1]>', () => {
        const input = '<number [-2,-1]>'
        const parsed = { ...type('<number>'), max: -1, min: -2 }
        expect(parse('<number [-2,-1]>')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <number [0,∞]>', () => {
        const input = '<number [0,∞]>'
        const parsed = { ...type('<number>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <number [-∞,1]>', () => {
        const input = '<number [-∞,1]>'
        const parsed = { ...type('<number>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <angle [0,∞]>', () => {
        const input = '<angle [0,∞]>'
        const parsed = { ...type('<angle>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<angle [0px,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <angle [-∞,1turn]>', () => {
        const parsed = { ...type('<angle>'), max: 360, min: -Infinity }
        expect(parse('<angle [-∞,1turn]>')).toEqual(parsed)
        expect(serialize(parsed)).toBe('<angle [-∞,360deg]>')
    })
    it('parses and serializes <flex [0,∞]>', () => {
        const input = '<flex [0,∞]>'
        const parsed = { ...type('<flex>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<flex [0fr,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    it('parses and serializes <flex [-∞,1]>', () => {
        const input = '<flex [-∞,1]>'
        const parsed = { ...type('<flex>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<flex [-∞,1fr]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    it('parses and serializes <length [0,∞]>', () => {
        const input = '<length [0,∞]>'
        const parsed = { ...type('<length>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<length [0px,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    it('parses and serializes <length [-∞,1px]>', () => {
        const input = '<length [-∞,1px]>'
        const parsed = { ...type('<length>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    it('parses and serializes <percentage [0,∞]>', () => {
        const input = '<percentage [0,∞]>'
        const parsed = { ...type('<percentage>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<percentage [0%,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    it('parses and serializes <percentage [-∞,1]>', () => {
        const input = '<percentage [-∞,1]>'
        const parsed = { ...type('<percentage>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<percentage [-∞,1%]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    it('parses and serializes fn()', () => {
        const parsed = { name: 'fn', type: 'function' }
        expect(parse('fn()')).toEqual(parsed)
        expect(serialize(parsed)).toBe('fn()')
    })
    it('parses and serializes fn(a)', () => {
        const parsed = {
            name: 'fn',
            type: 'function',
            value: { name: 'fn', type: 'function', value: a },
        }
        expect(parse('fn( fn( a ) )')).toEqual(parsed)
        expect(serialize(parsed)).toBe('fn(fn(a))')
    })
    it("parses and serializes (a)", () => {
        const parsed = {
            associatedToken: '(',
            type: 'simple-block',
            value: { associatedToken: '(', type: 'simple-block', value: a },
        }
        expect(parse('( ( a ) )')).toEqual(parsed)
        expect(serialize(parsed)).toBe('((a))')
    })
    it("parses and serializes '['a']'", () => {
        const parsed = {
            associatedToken: '[',
            type: 'simple-block',
            value: { associatedToken: '[', type: 'simple-block', value: a },
        }
        expect(parse("'[' '[' a ']' ']'")).toEqual(parsed)
        expect(serialize(parsed)).toBe("'[''['a']'']'")
    })
    it('parses and serializes <length-percentage>', () => {
        const input = '<length-percentage>'
        const parsed = type('<length-percentage>')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <length-percentage [0,∞]>', () => {
        const input = '<length-percentage [0,∞]>'
        const parsed = { ...type('<length-percentage>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<length>', { definition: parsed })).toEqual({ ...type('<length>'), max: Infinity, min: 0 })
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <rotate()>', () => {
        const input = '<rotate()>'
        const parsed = type('<rotate()>')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <declaration>', () => {
        const input = '<declaration>'
        const parsed = { name: '<declaration>', type: 'arbitrary' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <declaration-list>', () => {
        const input = '<declaration-list>'
        const parsed = { name: '<declaration-list>', type: 'block-contents' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes <forgiving-selector-list>', () => {
        const input = '<forgiving-selector-list>'
        const parsed = { name: '<forgiving-selector-list>', type: 'forgiving' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it("parses and serializes <'background-color'>", () => {
        const input = "<'background-color'>"
        const parsed = {
            name: 'background-color',
            type: 'property',
            value: properties['background-color'].value,
        }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
})
describe('multipliers', () => {
    it('parses and serializes a{1,2}', () => {
        const input = 'a{1,2}'
        const parsed = repeat(a, 1, 2)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a{2}', () => {
        const input = 'a{2}'
        const parsed = repeat(a, 2, 2)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a{2,∞}', () => {
        const input = 'a{2,∞}'
        const parsed = repeat(a, 2, 20)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a{2,}', () => {
        const parsed = repeat(a, 2, 20)
        expect(parse('a{2,}')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a{2,∞}')
    })
    it('parses and serializes a?', () => {
        const input = 'a?'
        const parsed = optional(a)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a*', () => {
        const input = 'a*'
        const parsed = repeat(a, 0, 20)
        expect(parse(input)).toEqual(parsed)
        expect(parse('a{0,∞}')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a+', () => {
        const input = 'a+'
        const parsed = repeat(a, 1, 20)
        expect(parse(input)).toEqual(parsed)
        expect(parse('a{1,∞}')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a#', () => {
        const input = 'a#'
        const parsed = repeat(a, 1, 20, ',')
        expect(parse(input)).toEqual(parsed)
        expect(parse('a#{1,∞}')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a#{1,2}', () => {
        const input = 'a#{1,2}'
        const parsed = repeat(a, 1, 2, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a#{2}', () => {
        const input = 'a#{2}'
        const parsed = repeat(a, 2, 2, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a#{2,∞}', () => {
        const input = 'a#{2,∞}'
        const parsed = repeat(a, 2, 20, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a#?', () => {
        const input = 'a#?'
        const parsed = optional(repeat(a, 1, 20, ','))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a+#', () => {
        const input = 'a+#'
        const parsed = repeat(repeat(a, 1, 20), 1, 20, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a+#?', () => {
        const input = 'a+#?'
        const parsed = optional(repeat(repeat(a, 1, 20), 1, 20, ','))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it("parses and serializes ','?'", () => {
        const parsed = optional(comma)
        expect(parse("','?")).toEqual(parsed)
        expect(serialize(parsed)).toBe(",?")
    })
    it('parses and serializes <number>?', () => {
        const input = '<number>?'
        const parsed = optional(number)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
})
describe('combinations', () => {
    it('parses and serializes a b c', () => {
        const input = 'a b c'
        const parsed = sequence(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a && b && c', () => {
        const input = 'a && b && c'
        const parsed = permutation(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a || b || c', () => {
        const input = 'a || b || c'
        const parsed = arrangement(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a | b | c', () => {
        const input = 'a | b | c'
        const parsed = alternation(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a b c && a c b && b a c', () => {
        const input = 'a b c && a c b && b a c'
        const parsed = permutation(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a b c && a c b || a', () => {
        const input = 'a b c && a c b || a'
        const parsed = arrangement(permutation(sequence(a, b, c), sequence(a, c, b)), a)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a b c || a c b && b a c', () => {
        const input = 'a b c || a c b && b a c'
        const parsed = arrangement(sequence(a, b, c), permutation(sequence(a, c, b), sequence(b, a, c)))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a b c || a c b || b a c', () => {
        const input = 'a b c || a c b || b a c'
        const parsed = arrangement(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a b c || a c b | b a c', () => {
        const input = 'a b c || a c b | b a c'
        const parsed = alternation(arrangement(sequence(a, b, c), sequence(a, c, b)), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a b c | a c b | b a c', () => {
        const input = 'a b c | a c b | b a c'
        const parsed = alternation(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a b c | a c b || b a c', () => {
        const input = 'a b c | a c b || b a c'
        const parsed = alternation(sequence(a, b, c), arrangement(sequence(a, c, b), sequence(b, a, c)))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes a [b, c]', () => {
        const parsed = sequence(a, sequence(b, comma, c))
        expect(parse('a [b, c]')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a b , c')
    })
    it('parses and serializes [a, | b,] c', () => {
        const parsed = sequence(alternation(sequence(a, comma), sequence(b, comma)), c)
        expect(parse('[a, | b,] c')).toEqual(parsed)
        expect(serialize(parsed)).toBe('[a , | b ,] c')
    })
    it('parses and serializes a [, b | , c]', () => {
        const parsed = sequence(a, alternation(sequence(comma, b), sequence(comma, c)))
        expect(parse('a [, b | , c]')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a [, b | , c]')
    })
    it('parses and serializes [a && b, | a && c,] a', () => {
        const parsed = sequence(
            alternation(
                permutation(a, sequence(b, comma)),
                permutation(a, sequence(c, comma))),
            a)
        expect(parse('[a && b, | a && c,] a')).toEqual(parsed)
        expect(serialize(parsed)).toBe('[a && b , | a && c ,] a')
    })
    it('parses and serializes a [, a && b | , a && c]', () => {
        const parsed = sequence(
            a,
            alternation(
                permutation(sequence(comma, a), b),
                permutation(sequence(comma, a), c)))
        expect(parse('a [, a && b | , a && c]')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a [, a && b | , a && c]')
    })
    it('parses and serializes :pseudo-class', () => {
        const parsed = sequence(colon, keyword('pseudo-class'))
        expect(parse(':pseudo-class')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': pseudo-class')
    })
    it('parses and serializes ::pseudo-element', () => {
        const parsed = sequence(colon, colon, keyword('pseudo-element'))
        expect(parse('::pseudo-element')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': : pseudo-element')
    })
    it('parses and serializes :pseudo-class(a)', () => {
        const parsed = sequence(colon, { name: 'pseudo-class', type: 'function', value: a })
        expect(parse(':pseudo-class(a)')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': pseudo-class(a)')
    })
    it('parses and serializes ::pseudo-element(a)', () => {
        const parsed = sequence(colon, colon, { name: 'pseudo-element', type: 'function', value: a })
        expect(parse('::pseudo-element(a)')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': : pseudo-element(a)')
    })
})
describe('groups', () => {
    it('parses and serializes [ a ]', () => {
        expect(parse('[ a ]')).toEqual(a)
    })
    it('parses and serializes a [a | b]', () => {
        const input = 'a [a | b]'
        const parsed = sequence(a, alternation(a, b))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes [a | b] a', () => {
        const input = '[a | b] a'
        const parsed = sequence(alternation(a, b), a)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes [a | b]? a', () => {
        const input = '[a | b]? a'
        const parsed = sequence(optional(alternation(a, b)), a)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes [a{2}]?', () => {
        const input = '[a{2}]?'
        const parsed = optional(repeat(a, 2, 2))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes [a?]!', () => {
        const input = '[a?]!'
        const parsed = required(optional(a))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    it('parses and serializes [a? b?]!', () => {
        const input = '[a? b?]!'
        const parsed = required(sequence(optional(a), optional(b)))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
})
describe('context rules', () => {
    it("represents <number># produced by <'property'>", () => {
        const root = { definition: { name: 'property', type: 'property', value: "<'color'>" } }
        const parent = { definition: parse("<'color'>", undefined, root), parent: root }
        expect(parse('<number>#', parent)).toEqual(number)
    })
    it("represents [['+' | '-'] <calc-product>]* produced by <calc-sum>", () => {
        const parent = { definition: parse('<calc-sum>') }
        expect(parse("[['+' | '-'] <calc-product>]*", parent)).toEqual(
            repeat(
                sequence(
                    alternation(token('+'), token('-')),
                    type('<calc-product>')),
                0,
                31))
    })
    it('represents <calc-sum># in min(<calc-sum>#)', () => {
        const parent = { definition: type('<min()>') }
        expect(parse('<calc-sum>#', parent)).toEqual(repeat(type('<calc-sum>'), 1, 32, ','))
    })
})
