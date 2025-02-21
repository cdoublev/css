
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
 * @param {object} [production]
 */
function parse(definition, production) {
    return parseDefinition(definition, production)
}

const a = keyword('a')
const b = keyword('b')
const c = keyword('c')
const colon = token(':')
const comma = token(',')
const number = type('<number>')
const plus = token('+')

describe('symbols', () => {
    test('+ (delimiter)', () => {
        const input = "'+'"
        expect(parse("'+'")).toEqual(plus)
        expect(serialize(plus)).toBe(input)
    })
    test('a (keyword)', () => {
        const input = 'a'
        expect(parse(input)).toEqual(a)
        expect(serialize(a)).toBe(input)
    })
    test('<number-token>', () => {
        const input = '<number-token>'
        const parsed = { name: input, type: 'token' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<number>', () => {
        const input = '<number>'
        expect(parse(input)).toEqual(number)
        expect(serialize(number)).toBe(input)
    })
    test('<number [-2,-1]>', () => {
        const input = '<number [-2,-1]>'
        const parsed = { ...type('<number>'), max: -1, min: -2 }
        expect(parse('<number [-2,-1]>')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<number [0,∞]>', () => {
        const input = '<number [0,∞]>'
        const parsed = { ...type('<number>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<number [-∞,1]>', () => {
        const input = '<number [-∞,1]>'
        const parsed = { ...type('<number>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<angle [0,∞]>', () => {
        const input = '<angle [0,∞]>'
        const parsed = { ...type('<angle>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<angle [0px,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<angle [-∞,1turn]>', () => {
        const parsed = { ...type('<angle>'), max: 360, min: -Infinity }
        expect(parse('<angle [-∞,1turn]>')).toEqual(parsed)
        expect(serialize(parsed)).toBe('<angle [-∞,360deg]>')
    })
    test('<flex [0,∞]>', () => {
        const input = '<flex [0,∞]>'
        const parsed = { ...type('<flex>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<flex [0fr,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    test('<flex [-∞,1]>', () => {
        const input = '<flex [-∞,1]>'
        const parsed = { ...type('<flex>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<flex [-∞,1fr]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    test('<length [0,∞]>', () => {
        const input = '<length [0,∞]>'
        const parsed = { ...type('<length>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<length [0px,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    test('<length [-∞,1px]>', () => {
        const input = '<length [-∞,1px]>'
        const parsed = { ...type('<length>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    test('<percentage [0,∞]>', () => {
        const input = '<percentage [0,∞]>'
        const parsed = { ...type('<percentage>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<percentage [0%,∞]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    test('<percentage [-∞,1]>', () => {
        const input = '<percentage [-∞,1]>'
        const parsed = { ...type('<percentage>'), max: 1, min: -Infinity }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<percentage [-∞,1%]>')).toEqual(parsed)
        expect(serialize(parsed)).toEqual(input)
    })
    test('fn()', () => {
        const parsed = { name: 'fn', type: 'function' }
        expect(parse('fn()')).toEqual(parsed)
        expect(serialize(parsed)).toBe('fn()')
    })
    test('fn(a)', () => {
        const parsed = {
            name: 'fn',
            type: 'function',
            value: { name: 'fn', type: 'function', value: a },
        }
        expect(parse('fn( fn( a ) )')).toEqual(parsed)
        expect(serialize(parsed)).toBe('fn(fn(a))')
    })
    test('(a)', () => {
        const parsed = {
            associatedToken: '(',
            type: 'simple-block',
            value: { associatedToken: '(', type: 'simple-block', value: a },
        }
        expect(parse('( ( a ) )')).toEqual(parsed)
        expect(serialize(parsed)).toBe('((a))')
    })
    test("'['a']'", () => {
        const parsed = {
            associatedToken: '[',
            type: 'simple-block',
            value: { associatedToken: '[', type: 'simple-block', value: a },
        }
        expect(parse("'[' '[' a ']' ']'")).toEqual(parsed)
        expect(serialize(parsed)).toBe("'[''['a']'']'")
    })
    test('<length-percentage>', () => {
        const input = '<length-percentage>'
        const parsed = type('<length-percentage>')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<length-percentage [0,∞]>', () => {
        const input = '<length-percentage [0,∞]>'
        const parsed = { ...type('<length-percentage>'), max: Infinity, min: 0 }
        expect(parse(input)).toEqual(parsed)
        expect(parse('<length>', parsed)).toEqual({ ...type('<length>'), max: Infinity, min: 0 })
        expect(serialize(parsed)).toBe(input)
    })
    test('<rotate()>', () => {
        const input = '<rotate()>'
        const parsed = type('<rotate()>')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<declaration>', () => {
        const input = '<declaration>'
        const parsed = { name: '<declaration>', type: 'arbitrary' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<declaration-list>', () => {
        const input = '<declaration-list>'
        const parsed = { name: '<declaration-list>', type: 'block-contents' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('<forgiving-selector-list>', () => {
        const input = '<forgiving-selector-list>'
        const parsed = { name: '<forgiving-selector-list>', type: 'forgiving' }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test("<'background-color'>", () => {
        const input = "<'background-color'>"
        const parsed = {
            name: "<'background-color'>",
            type: 'non-terminal',
            value: properties['background-color'].value,
        }
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
})
describe('multipliers', () => {
    test('a{1,2}', () => {
        const input = 'a{1,2}'
        const parsed = repeat(a, 1, 2)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a{2}', () => {
        const input = 'a{2}'
        const parsed = repeat(a, 2, 2)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a{2,∞}', () => {
        const input = 'a{2,∞}'
        const parsed = repeat(a, 2, 20)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a{2,}', () => {
        const parsed = repeat(a, 2, 20)
        expect(parse('a{2,}')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a{2,∞}')
    })
    test('a?', () => {
        const input = 'a?'
        const parsed = optional(a)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a*', () => {
        const input = 'a*'
        const parsed = repeat(a, 0, 20)
        expect(parse(input)).toEqual(parsed)
        expect(parse('a{0,∞}')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a+', () => {
        const input = 'a+'
        const parsed = repeat(a, 1, 20)
        expect(parse(input)).toEqual(parsed)
        expect(parse('a{1,∞}')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a#', () => {
        const input = 'a#'
        const parsed = repeat(a, 1, 20, ',')
        expect(parse(input)).toEqual(parsed)
        expect(parse('a#{1,∞}')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a#{1,2}', () => {
        const input = 'a#{1,2}'
        const parsed = repeat(a, 1, 2, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a#{2}', () => {
        const input = 'a#{2}'
        const parsed = repeat(a, 2, 2, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a#{2,∞}', () => {
        const input = 'a#{2,∞}'
        const parsed = repeat(a, 2, 20, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a#?', () => {
        const input = 'a#?'
        const parsed = optional(repeat(a, 1, 20, ','))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a+#', () => {
        const input = 'a+#'
        const parsed = repeat(repeat(a, 1, 20), 1, 20, ',')
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a+#?', () => {
        const input = 'a+#?'
        const parsed = optional(repeat(repeat(a, 1, 20), 1, 20, ','))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test(',?', () => {
        const input = ',?'
        const parsed = optional(comma)
        expect(parse(input)).toEqual(parsed)
        expect(parse("','?")).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test("'+'?'", () => {
        const parsed = optional(plus)
        expect(parse("'+'?")).toEqual(parsed)
        expect(serialize(parsed)).toBe("'+'?")
    })
    test('<number>?', () => {
        const input = '<number>?'
        const parsed = optional(number)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
})
describe('combinations', () => {
    test('a b c', () => {
        const input = 'a b c'
        const parsed = sequence(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a && b && c', () => {
        const input = 'a && b && c'
        const parsed = permutation(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(parse('a&&b&&c')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a || b || c', () => {
        const input = 'a || b || c'
        const parsed = arrangement(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(parse('a||b||c')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a | b | c', () => {
        const input = 'a | b | c'
        const parsed = alternation(a, b, c)
        expect(parse(input)).toEqual(parsed)
        expect(parse('a|b|c')).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a b c && a c b && b a c', () => {
        const input = 'a b c && a c b && b a c'
        const parsed = permutation(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a b c && a c b || a', () => {
        const input = 'a b c && a c b || a'
        const parsed = arrangement(permutation(sequence(a, b, c), sequence(a, c, b)), a)
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a b c || a c b && b a c', () => {
        const input = 'a b c || a c b && b a c'
        const parsed = arrangement(sequence(a, b, c), permutation(sequence(a, c, b), sequence(b, a, c)))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a b c || a c b || b a c', () => {
        const input = 'a b c || a c b || b a c'
        const parsed = arrangement(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a b c || a c b | b a c', () => {
        const input = 'a b c || a c b | b a c'
        const parsed = alternation(arrangement(sequence(a, b, c), sequence(a, c, b)), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a b c | a c b | b a c', () => {
        const input = 'a b c | a c b | b a c'
        const parsed = alternation(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('a b c | a c b || b a c', () => {
        const input = 'a b c | a c b || b a c'
        const parsed = alternation(sequence(a, b, c), arrangement(sequence(a, c, b), sequence(b, a, c)))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test(':pseudo-class', () => {
        const parsed = sequence(colon, keyword('pseudo-class'))
        expect(parse(':pseudo-class')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': pseudo-class')
    })
    test('::pseudo-element', () => {
        const parsed = sequence(colon, colon, keyword('pseudo-element'))
        expect(parse('::pseudo-element')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': : pseudo-element')
    })
    test(':pseudo-class(a)', () => {
        const parsed = sequence(colon, { name: 'pseudo-class', type: 'function', value: a })
        expect(parse(':pseudo-class(a)')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': pseudo-class(a)')
    })
    test('::pseudo-element(a)', () => {
        const parsed = sequence(colon, colon, { name: 'pseudo-element', type: 'function', value: a })
        expect(parse('::pseudo-element(a)')).toEqual(parsed)
        expect(serialize(parsed)).toBe(': : pseudo-element(a)')
    })
})
describe('groups', () => {
    test('[a]', () => {
        expect(parse('[a]')).toEqual(a)
        expect(parse('[ a ]')).toEqual(a)
    })
    test('[a{2}]?', () => {
        const input = '[a{2}]?'
        const parsed = optional(repeat(a, 2, 2))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('[a?]!', () => {
        const input = '[a?]!'
        const parsed = required(optional(a))
        expect(parse(input)).toEqual(parsed)
        expect(serialize(parsed)).toBe(input)
    })
    test('[a, b], c', () => {
        const parsed = sequence(a, comma, b, comma, c)
        expect(parse('[ a , b ] , c')).toEqual(parsed)
        expect(parse('[a,b],c')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a , b , c')
    })
    test('[a, b,] c', () => {
        const parsed = sequence(a, comma, b, comma, c)
        expect(parse('[ a , b , ] c')).toEqual(parsed)
        expect(parse('[a,b,]c')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a , b , c')
    })
    test('a, [b, c]', () => {
        const parsed = sequence(a, comma, b, comma, c)
        expect(parse('a , [ b , c ]')).toEqual(parsed)
        expect(parse('a,[b,c]')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a , b , c')
    })
    test('a [, b, c]', () => {
        const parsed = sequence(a, sequence(comma, b, comma, c))
        expect(parse('a [ , b , c ]')).toEqual(parsed)
        expect(parse('a[,b,c]')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a , b , c')
    })
    test('[a, | b,] c', () => {
        const parsed = sequence(alternation(sequence(a, comma), sequence(b, comma)), c)
        expect(parse('[a , | b , ] c')).toEqual(parsed)
        expect(parse('[a,|b,]c')).toEqual(parsed)
        expect(serialize(parsed)).toBe('[a , | b ,] c')
    })
    test('a [, b | , c]', () => {
        const parsed = sequence(a, alternation(sequence(comma, b), sequence(comma, c)))
        expect(parse('a [ , b | , c ]')).toEqual(parsed)
        expect(parse('a[,b|,c]')).toEqual(parsed)
        expect(serialize(parsed)).toBe('a [, b | , c]')
    })
})
describe('context rules', () => {
    test("a# produced by <'property'>", () => {
        const production = { name: "<'property'>", type: 'non-terminal' }
        const repetition = repeat(a, 1, 20, ',')
        expect(parse('a#', production)).toEqual(a)
        expect(parse('a# b', production)).toEqual(sequence(repetition, b))
        expect(parse('[a b]#', production)).toEqual(sequence(a, b))
        expect(parse('<number>#', production)).toEqual(number)
        expect(parse('fn(a#)', production)).toEqual({ name: 'fn', type: 'function', value: repetition })
    })
    test("[['+' | '-'] <calc-product>]* produced by <calc-sum>", () => {
        const production = parse('<calc-sum>')
        expect(parse("[['+' | '-'] <calc-product>]*", production)).toEqual(
            repeat(
                sequence(
                    alternation(plus, token('-')),
                    type('<calc-product>')),
                0,
                31))
    })
    test('<calc-sum># produced by <hypoth()>, <max()>, <min()>', () => {
        const production = parse('<hypoth()>')
        expect(parse('<calc-sum>#', production)).toEqual(repeat(type('<calc-sum>'), 1, 32, ','))
    })
})
