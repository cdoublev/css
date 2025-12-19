
import { describe, test } from 'node:test'
import { Assert } from 'node:assert'
import parseDefinition from '../lib/parse/definition.js'
import properties from '../lib/properties/definitions.js'
import { serializeDefinition as serialize } from '../lib/serialize.js'
import types from '../lib/values/definitions.js'

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
    return { name, type: 'non-terminal', value: types[name] }
}

/**
 * @param {string} definition
 * @param {object} [production]
 */
function parse(definition, production) {
    return parseDefinition(definition, production)
}

class CSSAssert extends Assert {

    /**
     * @param {string|string[]} serialized
     * @param {object} parsed
     */
    roundtrip(serialized, parsed) {
        if (!Array.isArray(serialized)) {
            serialized = [serialized]
        }
        serialized.forEach(serialized => assert.deepEqual(parse(serialized), parsed))
        assert.equal(serialize(parsed), serialized[0])
    }
}

const assert = new CSSAssert({ skipPrototype: true })

const a = keyword('a')
const b = keyword('b')
const c = keyword('c')
const d = keyword('d')
const colon = token(':')
const comma = token(',')
const number = type('<number>')
const plus = token('+')

describe('symbols', () => {
    test('+ (delimiter)', () => {
        assert.roundtrip("'+'", plus)
    })
    test('a (keyword)', () => {
        assert.roundtrip('a', a)
    })
    test('<number-token>', () => {
        assert.roundtrip('<number-token>', { name: '<number-token>', type: 'token' })
    })
    test('<number>', () => {
        assert.roundtrip('<number>', number)
    })
    test('<number [-2,-1]>', () => {
        assert.roundtrip('<number [-2,-1]>', { ...type('<number>'), max: -1, min: -2 })
    })
    test('<number [0,∞]>', () => {
        assert.roundtrip('<number [0,∞]>', { ...type('<number>'), max: Infinity, min: 0 })
    })
    test('<number [-∞,1]>', () => {
        assert.roundtrip('<number [-∞,1]>', { ...type('<number>'), max: 1, min: -Infinity })
    })
    test('<angle [0,∞]>', () => {
        assert.roundtrip(['<angle [0,∞]>', '<angle [0px,∞]>'], { ...type('<angle>'), max: Infinity, min: 0 })
    })
    test('<angle [-∞,1turn]>', () => {
        assert.roundtrip(['<angle [-∞,360deg]>', '<angle [-∞,1turn]>'], { ...type('<angle>'), max: 360, min: -Infinity })
    })
    test('<flex [0,∞]>', () => {
        assert.roundtrip(['<flex [0,∞]>', '<flex [0fr,∞]>'], { ...type('<flex>'), max: Infinity, min: 0 })
    })
    test('<flex [-∞,1]>', () => {
        assert.roundtrip(['<flex [-∞,1]>', '<flex [-∞,1fr]>'], { ...type('<flex>'), max: 1, min: -Infinity })
    })
    test('<length [0,∞]>', () => {
        assert.roundtrip(['<length [0,∞]>', '<length [0px,∞]>'], { ...type('<length>'), max: Infinity, min: 0 })
    })
    test('<length [-∞,1px]>', () => {
        assert.roundtrip('<length [-∞,1px]>', { ...type('<length>'), max: 1, min: -Infinity })
    })
    test('<percentage [0,∞]>', () => {
        assert.roundtrip(['<percentage [0,∞]>', '<percentage [0%,∞]>'], { ...type('<percentage>'), max: Infinity, min: 0 })
    })
    test('<percentage [-∞,1]>', () => {
        assert.roundtrip(['<percentage [-∞,1]>', '<percentage [-∞,1%]>'], { ...type('<percentage>'), max: 1, min: -Infinity })
    })
    test('fn()', () => {
        assert.roundtrip('fn()', { name: 'fn', type: 'function' })
    })
    test('fn(a)', () => {
        assert.roundtrip(['fn(fn(a))', 'fn( fn( a ) )'], {
            name: 'fn',
            type: 'function',
            value: { name: 'fn', type: 'function', value: a },
        })
    })
    test('<function-token> a )', () => {
        assert.roundtrip('<function-token> a )', { type: 'function', value: a })
    })
    test('(a)', () => {
        assert.roundtrip(['((a))', '( ( a ) )'], {
            associatedToken: '(',
            type: 'block',
            value: { associatedToken: '(', type: 'block', value: a },
        })
    })
    test("'['a']'", () => {
        assert.roundtrip(["'[''['a']'']'", "'[' '[' a ']' ']'"], {
            associatedToken: '[',
            type: 'block',
            value: { associatedToken: '[', type: 'block', value: a },
        })
    })
    test('<length-percentage>', () => {
        assert.roundtrip('<length-percentage>', type('<length-percentage>'))
    })
    test('<length-percentage [0,∞]>', () => {
        const parsed = { ...type('<length-percentage>'), max: Infinity, min: 0 }
        assert.roundtrip('<length-percentage [0,∞]>', parsed)
        assert.deepEqual(parse('<length>', parsed), { ...type('<length>'), max: Infinity, min: 0 })
    })
    test('<boolean-expr[<number>]>', () => {
        assert.roundtrip('<boolean-expr[<number>]>', { ...type('<boolean-expr>'), test: '<number>' })
    })
    test('<rotate()>', () => {
        assert.roundtrip('<rotate()>', type('<rotate()>'))
    })
    test('<dashed-function>', () => {
        assert.roundtrip('<dashed-function>', types['<dashed-function>'])
    })
    test('<declaration>', () => {
        assert.roundtrip('<declaration>', { name: '<declaration>', type: 'arbitrary' })
    })
    test('<forgiving-selector-list>', () => {
        assert.roundtrip('<forgiving-selector-list>', { name: '<forgiving-selector-list>', type: 'forgiving' })
    })
    test("<'background-color'>", () => {
        assert.roundtrip(
            "<'background-color'>",
            {
                name: "<'background-color'>",
                type: 'non-terminal',
                value: properties['background-color'].value,
            })
    })
})
describe('multipliers', () => {
    test('a{1,2}', () => {
        assert.roundtrip(['a{1,2}', '[a]{1,2}'], repeat(a, 1, 2))
    })
    test('a{2}', () => {
        assert.roundtrip('a{2}', repeat(a, 2, 2))
    })
    test('a{2,∞}', () => {
        assert.roundtrip(['a{2,∞}', 'a{2,}'], repeat(a, 2, 20))
    })
    test('a{2}?', () => {
        assert.roundtrip(['a{2}?', '[a{2}]?'], optional(repeat(a, 2, 2)))
    })
    test('a?', () => {
        assert.roundtrip('a?', optional(a))
    })
    test('a*', () => {
        assert.roundtrip(['a*', 'a{0,∞}'], repeat(a, 0, 20))
    })
    test('a+', () => {
        assert.roundtrip(['a+', 'a{1,∞}'], repeat(a, 1, 20))
    })
    test('a#', () => {
        assert.roundtrip(['a#', 'a#{1,∞}'], repeat(a, 1, 20, ','))
    })
    test('a#{1,2}', () => {
        assert.roundtrip('a#{1,2}', repeat(a, 1, 2, ','))
    })
    test('a#{2}', () => {
        assert.roundtrip('a#{2}', repeat(a, 2, 2, ','))
    })
    test('a#{2,∞}', () => {
        assert.roundtrip('a#{2,∞}', repeat(a, 2, 20, ','))
    })
    test('a#?', () => {
        assert.roundtrip(['a#?', '[a#]?'], optional(repeat(a, 1, 20, ',')))
    })
    test('a#{2}?', () => {
        assert.roundtrip('a#{2}?', optional(repeat(a, 2, 2, ',')))
    })
    test('a+#', () => {
        assert.roundtrip(['a+#', '[a+]#'], repeat(repeat(a, 1, 20), 1, 20, ','))
    })
    test('a+#{2}', () => {
        assert.roundtrip('a+#{2}', repeat(repeat(a, 1, 20), 2, 2, ','))
    })
    test('a+#?', () => {
        assert.roundtrip('a+#?', optional(repeat(repeat(a, 1, 20), 1, 20, ',')))
    })
    test('a+#{2}?', () => {
        assert.roundtrip('a+#{2}?', optional(repeat(repeat(a, 1, 20), 2, 2, ',')))
    })
    test(',?', () => {
        assert.roundtrip([',?', "','?"], optional(comma))
    })
    test("'+'?'", () => {
        assert.roundtrip("'+'?", optional(plus))
    })
    test('<number>?', () => {
        assert.roundtrip('<number>?', optional(number))
    })
})
describe('combinations', () => {
    test('a b c', () => {
        assert.roundtrip('a b c', sequence(a, b, c))
    })
    test('a && b && c', () => {
        assert.roundtrip(['a && b && c', 'a&&b&&c'], permutation(a, b, c))
    })
    test('a || b || c', () => {
        assert.roundtrip(['a || b || c', 'a||b||c'], arrangement(a, b, c))
    })
    test('a | b | c', () => {
        assert.roundtrip(['a | b | c', 'a|b|c'], alternation(a, b, c))
    })
    test('a b c && a c b && b a c', () => {
        assert.roundtrip('a b c && a c b && b a c', permutation(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c)))
    })
    test('a b c && a c b || a', () => {
        assert.roundtrip('a b c && a c b || a', arrangement(permutation(sequence(a, b, c), sequence(a, c, b)), a))
    })
    test('a b c || a c b && b a c', () => {
        assert.roundtrip('a b c || a c b && b a c', arrangement(sequence(a, b, c), permutation(sequence(a, c, b), sequence(b, a, c))))
    })
    test('a b c || a c b || b a c', () => {
        assert.roundtrip('a b c || a c b || b a c', arrangement(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c)))
    })
    test('a b c || a c b | b a c', () => {
        assert.roundtrip('a b c || a c b | b a c', alternation(arrangement(sequence(a, b, c), sequence(a, c, b)), sequence(b, a, c)))
    })
    test('a b c | a c b | b a c', () => {
        assert.roundtrip('a b c | a c b | b a c', alternation(sequence(a, b, c), sequence(a, c, b), sequence(b, a, c)))
    })
    test('a b c | a c b || b a c', () => {
        assert.roundtrip('a b c | a c b || b a c', alternation(sequence(a, b, c), arrangement(sequence(a, c, b), sequence(b, a, c))))
    })
    test(':pseudo-class', () => {
        const parsed = sequence(colon, keyword('pseudo-class'))
        assert.deepEqual(parse(':pseudo-class'), parsed)
        assert.equal(serialize(parsed), ': pseudo-class')
    })
    test('::pseudo-element', () => {
        const parsed = sequence(colon, colon, keyword('pseudo-element'))
        assert.deepEqual(parse('::pseudo-element'), parsed)
        assert.equal(serialize(parsed), ': : pseudo-element')
    })
    test(':pseudo-class(a)', () => {
        const parsed = sequence(colon, { name: 'pseudo-class', type: 'function', value: a })
        assert.deepEqual(parse(':pseudo-class(a)'), parsed)
        assert.equal(serialize(parsed), ': pseudo-class(a)')
    })
    test('::pseudo-element(a)', () => {
        const parsed = sequence(colon, colon, { name: 'pseudo-element', type: 'function', value: a })
        assert.deepEqual(parse('::pseudo-element(a)'), parsed)
        assert.equal(serialize(parsed), ': : pseudo-element(a)')
    })
})
describe('groups', () => {
    test('[a]', () => {
        assert.deepEqual(parse('[a]'), a)
        assert.deepEqual(parse('[ a ]'), a)
    })
    test('[a#]{2}', () => {
        assert.roundtrip('[a#]{2}', repeat(repeat(a, 1, 20, ','), 2, 2))
    })
    test('[a?]!', () => {
        assert.roundtrip('[a?]!', required(optional(a)))
    })
    test('[a b] c', () => {
        const parsed = sequence(a, b, c)
        assert.deepEqual(parse('[ a b ] c'), parsed)
        assert.deepEqual(parse('[a b]c'), parsed)
        assert.equal(serialize(parsed), 'a b c')
    })
    test('[a && b] && c', () => {
        assert.roundtrip(['[a && b] && c', '[a && b]&& c'], permutation(permutation(a, b), c))
    })
    test('[a || b] || c', () => {
        assert.roundtrip(['[a || b] || c', '[a || b]|| c'], arrangement(arrangement(a, b), c))
    })
    test('[a | b] | c', () => {
        const parsed = alternation(a, b, c)
        assert.deepEqual(parse('[a | b] | c'), parsed)
        assert.deepEqual(parse('[a | b]| c'), parsed)
        assert.equal(serialize(parsed), 'a | b | c')
    })
    test('a [b c]', () => {
        const parsed = sequence(a, b, c)
        assert.deepEqual(parse('a [ b c ]'), parsed)
        assert.deepEqual(parse('a[b c]'), parsed)
        assert.equal(serialize(parsed), 'a b c')
    })
    test('a && [b && c]', () => {
        assert.roundtrip(['a && [b && c]', 'a &&[b && c]'], permutation(a, permutation(b, c)))
    })
    test('a || [b || c]', () => {
        assert.roundtrip(['a || [b || c]', 'a ||[b || c]'], arrangement(a, arrangement(b, c)))
    })
    test('a | [b | c]', () => {
        const parsed = alternation(a, b, c)
        assert.deepEqual(parse('a | [b | c]'), parsed)
        assert.deepEqual(parse('a |[b | c]'), parsed)
        assert.equal(serialize(parsed), 'a | b | c')
    })
    test('[a b] [c d]', () => {
        const parsed = sequence(a, b, c, d)
        assert.deepEqual(parse('[a b] [c d]'), parsed)
        assert.deepEqual(parse('[a b][c d]'), parsed)
        assert.equal(serialize(parsed), 'a b c d')
    })
    test('[a b] [c && d]', () => {
        const parsed = sequence(a, b, permutation(c, d))
        assert.deepEqual(parse('[a b] [c && d]'), parsed)
        assert.equal(serialize(parsed), 'a b [c && d]')
    })
    test('[a && b] && [c && d]', () => {
        assert.roundtrip('[a && b] && [c && d]', permutation(permutation(a, b), permutation(c, d)))
    })
    test('[a && b] && [c || d]', () => {
        assert.roundtrip('[a && b] && [c || d]', permutation(permutation(a, b), arrangement(c, d)))
    })
    test('[a | b] | [c | d]', () => {
        const parsed = alternation(a, b, c, d)
        assert.deepEqual(parse('[a | b] | [c | d]'), parsed)
        assert.equal(serialize(parsed), 'a | b | c | d')
    })
    test('a b [c d]', () => {
        const parsed = sequence(a, b, c, d)
        assert.deepEqual(parse('a b [c d]'), parsed)
        assert.equal(serialize(parsed), 'a b c d')
    })
    test('a b [c && d]', () => {
        assert.roundtrip('a b [c && d]', sequence(a, b, permutation(c, d)))
    })
    test('a && b && [c && d]', () => {
        assert.roundtrip('a && b && [c && d]', permutation(a, b, permutation(c, d)))
    })
    test('a && b && [c || d]', () => {
        assert.roundtrip('a && b && [c || d]', permutation(a, b, arrangement(c, d)))
    })
    test('a | b | [c | d]', () => {
        const parsed = alternation(a, b, c, d)
        assert.deepEqual(parse('a | b | [c | d]'), parsed)
        assert.equal(serialize(parsed), 'a | b | c | d')
    })
    test('[a | b] [a b]', () => {
        const parsed = sequence(alternation(a, b), a, b)
        assert.deepEqual(parse('[a | b] [a b]'), parsed)
        assert.equal(serialize(parsed), '[a | b] a b')
    })
    test('[a | b] && [a && b]', () => {
        assert.roundtrip('[a | b] && [a && b]', permutation(alternation(a, b), permutation(a, b)))
    })
    test('[a | b] || [a || b]', () => {
        assert.roundtrip('[a | b] || [a || b]', arrangement(alternation(a, b), arrangement(a, b)))
    })
    test('[a b] | [a | b]', () => {
        const parsed = alternation(sequence(a, b), a, b)
        assert.deepEqual(parse('[a b] | [a | b]'), parsed)
        assert.equal(serialize(parsed), 'a b | a | b')
    })
})
describe('context rules', () => {
    test("a# produced by <'property'>", () => {
        const production = { name: "<'property'>", type: 'non-terminal' }
        const repetition = repeat(a, 1, 20, ',')
        assert.deepEqual(parse('a#', production), a)
        assert.deepEqual(parse('a# b', production), sequence(repetition, b))
        assert.deepEqual(parse('[a b]#', production), sequence(a, b))
        assert.deepEqual(parse('<number>#', production), number)
        assert.deepEqual(parse('fn(a#)', production), { name: 'fn', type: 'function', value: repetition })
    })
    test("[['+' | '-'] <calc-product>]* produced by <calc-sum>", () => {
        const production = parse('<calc-sum>')
        assert.deepEqual(parse("[['+' | '-'] <calc-product>]*", production),
            repeat(
                sequence(
                    alternation(plus, token('-')),
                    type('<calc-product>')),
                0,
                31))
    })
    test('<calc-sum># produced by <hypoth()>, <max()>, <min()>', () => {
        const production = parse('<hypoth()>')
        assert.deepEqual(parse('<calc-sum>#', production), repeat(type('<calc-sum>'), 1, 32, ','))
    })
})

describe('errors', () => {
    test('symbols', () => {
        assert.throws(() => parse('1'))
    })
    test('combinators', () => {
        assert.throws(() => parse('a & b'))
        assert.throws(() => parse('a . b'))
    })
    test('multipliers', () => {
        const invalid = [
            'a!',
            'a{2}{2}',
            'a{2}*',
            'a{2}+',
            'a{2}#',
            'a{2}!',
            'a{0,∞}?',
            'a{1,∞}?',
            'a?{2}',
            'a??',
            'a?*',
            'a?+',
            'a?#',
            'a?!',
            'a*{2}',
            'a*?',
            'a**',
            'a*+',
            'a*#',
            'a*!',
            'a+{2}',
            'a+?',
            'a+*',
            'a++',
            'a+!',
            'a#*',
            'a#+',
            'a##',
            'a#!',
            'a!{2}',
            'a!?',
            'a!*',
            'a!+',
            'a!#',
            'a!!',
        ]
        invalid.forEach(input => assert.throws(() => parse(input)))
    })
})
