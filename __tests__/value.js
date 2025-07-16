
const { MAX_INTEGER, MIN_INTEGER } = require('../lib/values/integers.js')
const {
    angle,
    customIdent,
    dashedIdent,
    decibel,
    delimiter,
    dimension,
    dimensionToken,
    flex,
    frequency,
    hash,
    ident,
    identToken,
    integer,
    keyword,
    length,
    list,
    number,
    numberToken,
    omitted,
    percentage,
    resolution,
    semitones,
    string,
    time,
} = require('../lib/values/value.js')
const { cssom, install } = require('../lib/index.js')
const { createContext, parseCSSGrammar } = require('../lib/parse/parser.js')
const { toDegrees, toRadians } = require('../lib/utils/math.js')
const { keywords: cssWideKeywords } = require('../lib/values/substitutions.js')
const { isFailure } = require('../lib/utils/value.js')
const properties = require('../lib/properties/definitions.js')
const { serializeCSSComponentValue } = require('../lib/serialize.js')

/**
 * @param {string} definition
 * @param {string} value
 * @param {boolean} [serialize]
 * @param {object|string} [context]
 * @returns {object|object[]|string|null}
 */
function parse(definition, value, serialize = true, context) {
    value = parseCSSGrammar(value, definition, context)
    if (isFailure(value)) {
        if (serialize) {
            return ''
        }
        return null
    }
    if (serialize) {
        return serializeCSSComponentValue(value)
    }
    return value
}

install()
globalThis.document = { href: 'https://github.com/cdoublev/' }

const styleSheet = cssom.CSSStyleSheet.createImpl(globalThis, [{ media: '' }])

styleSheet.replaceSync(`
    @namespace html "https://www.w3.org/1999/xhtml/";
    @namespace svg "http://www.w3.org/2000/svg";
    style {}
    @container (1px < width) {}
    @keyframes animation { 0% {} }
    @media {}
    @supports (width: 1px) {}
`)

const { cssRules: { _rules: [,, styleRule, containerRule, keyframesRule, mediaRule, supportsRule] } } = styleSheet
const { cssRules: { _rules: [keyframeRule] } } = keyframesRule

const a = keyword('a')
const b = keyword('b')
const colon = delimiter(':')
const comma = delimiter(',')
const equal = delimiter('=')
const lt = delimiter('<')

describe('combined values', () => {
    test('a b', () => {
        const definition = 'a b'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a b c', false)).toBeNull()
        expect(parse(definition, 'a b')).toBe('a b')
    })
    test('a && b', () => {
        const definition = 'a && b'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a b c', false)).toBeNull()
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'b a')).toBe('a b')
    })
    test('a || b', () => {
        const definition = 'a || b'
        expect(parse(definition, 'a b c', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'b a')).toBe('a b')
    })
    test('a | b', () => {
        const definition = 'a | b'
        expect(parse(definition, 'a b', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
    })
})
describe('multiplied values', () => {
    test('a?', () => {
        const definition = 'a?'
        expect(parse(definition, '', false)).toBe(omitted)
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
    })
    test('a*', () => {
        const definition = 'a*'
        expect(parse(definition, '', false)).toMatchObject(list())
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a, a', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
    })
    test('a+', () => {
        const definition = 'a+'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a, a', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
    })
    test('a#', () => {
        const definition = 'a#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a, a,', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a , a')).toBe('a, a')
    })
    test('a#?', () => {
        const definition = 'a a#?'
        expect(parse(definition, 'a, a', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    test('[a?]#', () => {
        const definition = '[a?]#'
        expect(parse(definition, '', false)).toEqual(list([omitted], ','))
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a, a,', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
    })
    test('a+#', () => {
        const definition = 'a+#'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
    })
    test('a+#?', () => {
        const definition = 'a a+#?'
        expect(parse(definition, 'a, a', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
        expect(parse(definition, 'a a, a a')).toBe('a a, a a')
        expect(parse(definition, 'a a a, a')).toBe('a a a, a')
    })
    test('a{2}', () => {
        const definition = 'a{2}'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a', false)).toBeNull()
        expect(parse(definition, 'a, a', false)).toBeNull()
    })
    test('a{2,3}', () => {
        const definition = 'a{2,3}'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('a{0,∞}', () => {
        const definition = 'a{0,∞}'
        expect(parse(definition, '', false)).toMatchObject(list())
        expect(parse(definition, 'a a')).toBe('a a')
    })
    test('a{2,∞}', () => {
        const definition = 'a{2,∞}'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    test('a{2,}', () => {
        const definition = 'a{2,}'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    test('[a b]?', () => {
        const definition = '[a b]?'
        expect(parse(definition, '', false)).toBe(omitted)
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'b', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toMatchObject(list([a, b]))
    })
    test('[a b]*', () => {
        const definition = '[a b]*'
        expect(parse(definition, '', false)).toMatchObject(list())
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'b', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toMatchObject(list([list([a, b])]))
    })
    test('[a b]#', () => {
        const definition = '[a b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'b', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toMatchObject(list([list([a, b])], ','))
    })
    test('[a? b?]!', () => {
        const definition = '[a? b?]!'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toMatchObject(list([a, omitted]))
        expect(parse(definition, 'b', false)).toMatchObject(list([omitted, b]))
        expect(parse(definition, 'a b', false)).toMatchObject(list([a, b]))
    })
    test('[a? b?]#', () => {
        const definition = '[a? b?]#'
        expect(parse(definition, '', false)).toMatchObject(list([list([omitted, omitted])], ','))
        expect(parse(definition, 'a', false)).toMatchObject(list([list([a, omitted])], ','))
        expect(parse(definition, 'b', false)).toMatchObject(list([list([omitted, b])], ','))
        expect(parse(definition, 'a b', false)).toMatchObject(list([list([a, b])], ','))
        expect(parse(definition, 'a b,', false)).toBeNull()
    })
    test('[a | b]?', () => {
        const definition = '[a | b]?'
        expect(parse(definition, '', false)).toBe(omitted)
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
    })
    test('[a | b]*', () => {
        const definition = '[a | b]*'
        expect(parse(definition, '', false)).toMatchObject(list())
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
    })
    test('[a | b]#', () => {
        const definition = '[a | b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
    })
    test('[a | b b]?', () => {
        const definition = '[a | b b]?'
        expect(parse(definition, '', false)).toBe(omitted)
        expect(parse(definition, 'a', false)).toMatchObject(a)
        expect(parse(definition, 'b b', false)).toMatchObject(list([b, b]))
    })
    test('[a | b b]*', () => {
        const definition = '[a | b b]*'
        expect(parse(definition, '', false)).toMatchObject(list())
        expect(parse(definition, 'a', false)).toMatchObject(list([a]))
        expect(parse(definition, 'b b', false)).toMatchObject(list([list([b, b])]))
    })
    test('[a | b b]#', () => {
        const definition = '[a | b b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toMatchObject(list([a], ','))
        expect(parse(definition, 'b b', false)).toMatchObject(list([list([b, b])], ','))
    })
    test('[a || b]?', () => {
        const definition = '[a || b]?'
        expect(parse(definition, '', false)).toBe(omitted)
        expect(parse(definition, 'a', false)).toMatchObject(list([a, omitted]))
        expect(parse(definition, 'b', false)).toMatchObject(list([omitted, b]))
        expect(parse(definition, 'a b', false)).toMatchObject(list([a, b]))
    })
    test('[a || b]*', () => {
        const definition = '[a || b]*'
        expect(parse(definition, '', false)).toMatchObject(list())
        expect(parse(definition, 'a', false)).toMatchObject(list([list([a, omitted])]))
        expect(parse(definition, 'b', false)).toMatchObject(list([list([omitted, b])]))
        expect(parse(definition, 'a b', false)).toMatchObject(list([list([a, b])]))
    })
    test('[a || b]#', () => {
        const definition = '[a || b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a, b', false)).toMatchObject(list([list([a, omitted]), list([omitted, b])], ','))
        expect(parse(definition, 'a', false)).toMatchObject(list([list([a, omitted])], ','))
        expect(parse(definition, 'b', false)).toMatchObject(list([list([omitted, b])], ','))
        expect(parse(definition, 'a b', false)).toMatchObject(list([list([a, b])], ','))
        expect(parse(definition, 'a b, b', false)).toMatchObject(list([list([a, b]), list([omitted, b])], ','))
    })
    test('[a || b b]?', () => {
        const definition = '[a || b b]?'
        expect(parse(definition, '', false)).toBe(omitted)
        expect(parse(definition, 'a', false)).toMatchObject(list([a, omitted]))
        expect(parse(definition, 'b b', false)).toMatchObject(list([omitted, list([b, b])]))
        expect(parse(definition, 'a b b', false)).toMatchObject(list([a, list([b, b])]))
    })
    test('[a || b b]*', () => {
        const definition = '[a || b b]*'
        expect(parse(definition, '', false)).toMatchObject(list())
        expect(parse(definition, 'a', false)).toMatchObject(list([list([a, omitted])]))
        expect(parse(definition, 'b b', false)).toMatchObject(list([list([omitted, list([b, b])])]))
        expect(parse(definition, 'a b b', false)).toMatchObject(list([list([a, list([b, b])])]))
    })
    test('[a || b b]#', () => {
        const definition = '[a || b b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toMatchObject(list([list([a, omitted])], ','))
        expect(parse(definition, 'b b', false)).toMatchObject(list([list([omitted, list([b, b])])], ','))
        expect(parse(definition, 'a b b', false)).toMatchObject(list([list([a, list([b, b])])], ','))
    })
})
describe('backtracking', () => {
    // Simple backtracking
    test('a | a a | a a a', () => {
        const definition = 'a | a a | a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('a a a | a a | a', () => {
        const definition = 'a a a | a a | a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('a || a a || a a a', () => {
        const definition = 'a || a a || a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a', false)).toBeNull()
    })
    test('a a a || a a || a', () => {
        const definition = 'a a a || a a || a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a', false)).toBeNull()
    })
    test('a && a a', () => {
        const definition = 'a && a a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('a a && a', () => {
        const definition = 'a a && a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('a && a b && a b c', () => {
        const definition = 'a && a b && a b c'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toBeNull()
        expect(parse(definition, 'a a b', false)).toBeNull()
        expect(parse(definition, 'a b a', false)).toBeNull()
        expect(parse(definition, 'a b c', false)).toBeNull()
        expect(parse(definition, 'a a b c', false)).toBeNull()
        expect(parse(definition, 'a b c a', false)).toBeNull()
        expect(parse(definition, 'a b a b c', false)).toBeNull()
        expect(parse(definition, 'a b c a b', false)).toBeNull()
        expect(parse(definition, 'a a b a b c')).toBe('a a b a b c')
        expect(parse(definition, 'a a b c a b')).toBe('a a b a b c')
        expect(parse(definition, 'a b a b c a')).toBe('a a b a b c')
        expect(parse(definition, 'a b a a b c')).toBe('a a b a b c')
        expect(parse(definition, 'a b c a b a')).toBe('a a b a b c')
        expect(parse(definition, 'a b c a a b')).toBe('a a b a b c')
        expect(parse(definition, 'a b c a b c', false)).toBeNull()
        expect(parse(definition, 'a a b a b c a', false)).toBeNull()
    })
    // Complex backtracking
    test('[a | a a | a a a] a', () => {
        const definition = '[a | a a | a a a] a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a', false)).toBeNull()
    })
    test('[a | a a | a a a] && a', () => {
        const definition = '[a | a a | a a a] && a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a', false)).toBeNull()
    })
    test('[a | a a | a a a] || a', () => {
        const definition = '[a | a a | a a a] || a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a', false)).toBeNull()
    })
    test('[a || a a || a a a] a', () => {
        const definition = '[a || a a || a a a] a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a', false)).toBeNull()
    })
    test('[a || a a || a a a] && a', () => {
        const definition = '[a || a a || a a a] && a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a', false)).toBeNull()
    })
    test('[a || a a || a a a] | a', () => {
        const definition = '[a || a a || a a a] | a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a', false)).toBeNull()
    })
    test('[a | a a | a a a]{2} a', () => {
        const definition = '[a | a a | a a a]{2} a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a', false)).toBeNull()
    })
    test('a? a{2}', () => {
        const definition = 'a? a{2}'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    test('[a | a a]* a', () => {
        const definition = '[a | a a]* a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    test('[a? | a a] a', () => {
        const definition = '[a? | a a] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('[a? || a a] a', () => {
        const definition = '[a? || a a] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a', false)).toBeNull()
    })
    test('[a? && a?] a', () => {
        const definition = '[a? && a?] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('[a{2}]? && a', () => {
        const definition = '[a{2}]? && a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('[a | a a | a a a] [a | a a]', () => {
        const definition = '[a | a a | a a a] [a | a a]'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a', false)).toBeNull()
    })
    test('[a | a a] a | a', () => {
        const definition = '[a | a a] a | a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a', false)).toBeNull()
    })
    test('[a && [a | a a]] a', () => {
        const definition = '[a && [a | a a]] a'
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a', false)).toBeNull()
    })
    /**
     * There is no definition of the following requirement in specifications but
     * combination order often encode priorities to resolve an ambiguity.
     */
    test('lexicographic order', () => {

        // <media-type> and <namespace-prefix> represent <ident>
        const definition = 'a || <media-type> || <namespace-prefix>'
        const screenMediaType = ident('screen', ['<media-type>'])
        const screenPrefix = ident('screen', ['<namespace-prefix>'])
        const colorMediaType = ident('color', ['<media-type>'])
        const colorPrefix = ident('color', ['<namespace-prefix>'])

        expect(parse(definition, 'a screen color', false)).toMatchObject(list([a, screenMediaType, colorPrefix]))
        expect(parse(definition, 'a color screen', false)).toMatchObject(list([a, colorMediaType, screenPrefix]))
        expect(parse(definition, 'screen a color', false)).toMatchObject(list([a, screenMediaType, colorPrefix]))
        expect(parse(definition, 'screen color a', false)).toMatchObject(list([a, screenMediaType, colorPrefix]))
        expect(parse(definition, 'color a screen', false)).toMatchObject(list([a, colorMediaType, screenPrefix]))
        expect(parse(definition, 'color screen a', false)).toMatchObject(list([a, colorMediaType, screenPrefix]))
    })
    /**
     * Requirements:
     *
     * 1. Replacing must only apply once (ie. not after backtracking).
     * 2. The list index must backtrack to a location stored in state instead of
     * from the index of a component value in the list.
     * 3. The list must not be updated with the result from parsing because it
     * may be different depending on the context production.
     */
    test('replaced value', () => {
        expect(parse('<angle-percentage>? <length-percentage>', 'calc(1%)')).toBe('calc(1%)')
    })
})
describe('whitespaces', () => {
    test('consecutive', () => {
        expect(parse('a{2}', 'a /**/ /**/ /**/ a')).toBe('a a')
    })
    test('omitted', () => {
        expect(parse('a a', 'a/**/a')).toBe('a a')
    })
    test('leading and trailing', () => {
        expect(parse('fn(a)', '  fn(  a  )  ')).toBe('fn(a)')
        expect(parse('(a)', '  (  a  )  ')).toBe('(a)')
        expect(parse('a, a?, a', 'a ,a')).toBe('a, a')
        expect(parse('a, <any-value>', 'a ,a')).toBe('a, a')
        expect(parse('a, <any-value>?', 'a, ')).toBe('a,')
        expect(parse('a: a', 'a :a')).toBe('a: a')
        expect(parse('a: <any-value>', 'a :a')).toBe('a: a')
        expect(parse('a: <any-value>?', 'a: ')).toBe('a:')
    })
})
describe('comma separated values', () => {
    // Comma-elision rules apply
    test('a?, a?, a', () => {

        const definition = 'a?, a?, a'

        expect(parse(definition, 'a,', false)).toBeNull()
        expect(parse(definition, ', a', false)).toBeNull()
        expect(parse(definition, 'a,, a', false)).toBeNull()
        expect(parse(definition, 'a, , a', false)).toBeNull()
        expect(parse(definition, 'a, a,', false)).toBeNull()
        expect(parse(definition, ', a, a', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a, a a', false)).toBeNull()
        expect(parse(definition, 'a a, a', false)).toBeNull()

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a , a')).toBe('a, a')
        expect(parse(definition, 'a,a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    test('a, a?, a?', () => {

        const definition = 'a, a?, a?'

        expect(parse(definition, 'a,', false)).toBeNull()
        expect(parse(definition, ', a', false)).toBeNull()
        expect(parse(definition, 'a,, a', false)).toBeNull()
        expect(parse(definition, 'a, a,', false)).toBeNull()
        expect(parse(definition, ', a, a', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a, a a', false)).toBeNull()
        expect(parse(definition, 'a a, a', false)).toBeNull()

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    test('[a?, a?,] a', () => {

        const definition = '[a?, a?,] a'

        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a, a a', false)).toBeNull()
        expect(parse(definition, 'a a, a', false)).toBeNull()
        expect(parse(definition, 'a,, a', false)).toBeNull()
        expect(parse(definition, ', a, a', false)).toBeNull()

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    test('a [, a? , a?]', () => {

        const definition = 'a [, a? , a?]'

        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a, a a', false)).toBeNull()
        expect(parse(definition, 'a a, a', false)).toBeNull()
        expect(parse(definition, 'a a,, a', false)).toBeNull()
        expect(parse(definition, 'a, a,', false)).toBeNull()

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    test('a, && a, && a', () => {

        const definition = 'a, && a, && a'

        expect(parse(definition, 'a a a', false)).toBeNull()
        expect(parse(definition, 'a a, a,', false)).toBeNull()

        expect(parse(definition, 'a, a a')).toBe('a, a a')
        expect(parse(definition, 'a a, a')).toBe('a, a a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    test('a, || a, || a', () => {

        const definition = 'a, || a, || a'

        expect(parse(definition, 'a,', false)).toBeNull()
        expect(parse(definition, 'a a,', false)).toBeNull()
        expect(parse(definition, 'a a a', false)).toBeNull()
        expect(parse(definition, 'a a, a,', false)).toBeNull()

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
        expect(parse(definition, 'a a, a')).toBe('a, a a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    test('a#?, a', () => {

        const definition = 'a#?, a'

        expect(parse(definition, 'a,', false)).toBeNull()
        expect(parse(definition, 'a,,', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toBeNull()

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    test('a*, a', () => {

        const definition = 'a*, a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
    })
    // Comma-elision rules do or do not apply
    test('a [a?, && a]', () => {

        const definition = 'a [a?, && a]'

        expect(parse(definition, 'a a,', false)).toBeNull()
        expect(parse(definition, 'a a a,', false)).toBeNull()

        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    // Comma-elision rules do not apply
    test('a a?, a', () => {

        const definition = 'a a?, a'

        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a', false)).toBeNull()

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    test('a, a? a', () => {

        const definition = 'a, a? a'

        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a', false)).toBeNull()

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
    })
    test('a [a?, a]', () => {

        const definition = 'a [a?, a]'

        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a', false)).toBeNull()

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    test('a [, a? a]', () => {

        const definition = 'a [, a? a]'

        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a', false)).toBeNull()

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
    })
    test('[a a?,] a', () => {

        const definition = '[a a?,] a'

        expect(parse(definition, 'a a', false)).toBeNull()
        expect(parse(definition, 'a a a', false)).toBeNull()

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    test('a, <any-value>?', () => {
        const definition = 'a, <any-value>?'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a,')).toBe('a,')
        expect(parse(definition, 'a, ,')).toBe('a,,')
    })
    test('a, <declaration-value>?', () => {
        const definition = 'a, <declaration-value>?'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a,')).toBe('a,')
        expect(parse(definition, 'a, ,')).toBe('a,,')
    })
})
describe('blocks', () => {
    test('invalid', () => {
        expect(parse('(a)', '[a]', false)).toBeNull()
    })
    test('valid', () => {
        // Unclosed (parse error)
        expect(parse('(a)', '(a')).toBe('(a)')
    })
})
describe('functions', () => {
    test('invalid', () => {
        const invalid = [
            ['fn()', 'fn(1)'],
            // Comma-containing production
            ['fn(<any-value>)', 'fn(,)'],
            ['fn(<any-value>)', 'fn(a {})'],
            ['fn(<any-value>)', 'fn({} a)'],
            ['fn(<any-value>)', 'fn({})'],
            ['fn(<declaration-value>)', 'fn(,)'],
            ['fn(<declaration-value>)', 'fn(a {})'],
            ['fn(<declaration-value>)', 'fn({} a)'],
            ['fn(<declaration-value>)', 'fn({})'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Case-insensitive name
            ['fn(a)', 'FN(a)', 'fn(a)'],
            // Unclosed (parse error)
            ['fn()', 'fn(', 'fn()'],
            // Comma-containing production
            ['fn([<declaration-value>?]#)', 'fn(, {})', 'fn(,)'],
            ['fn([<declaration-value>?]#)', 'fn({ a }, { , }, {{}})', 'fn(a, {,}, {{}})'],
            ['fn(<declaration-value>?, a)', 'fn(, a)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})

describe('<any-value>', () => {
    test('invalid', () => {
        const invalid = [
            // One or more tokens
            '',
            // Invalid token
            '"bad\nstring"',
            'url(bad .url)',
            ']',
            ')',
            '}',
        ]
        invalid.forEach(input => expect(parse('<any-value>', input, false)).toBeNull())
    })
    test('representation', () => {
        const value = list([identToken('any'), delimiter(' '), identToken('value')], '', ['<any-value>'])
        expect(parse('<any-value>', 'any value', false)).toMatchObject(value)
    })
    test('valid', () => {
        expect(parse('<any-value>', '  /**/  !1/**/1e0;  /**/  ')).toBe('!1 1;')
    })
})
describe('<declaration-value>', () => {
    test('invalid', () => {
        const invalid = [
            // One or more tokens
            '',
            // Invalid token
            '"bad\nstring"',
            'url(bad .url)',
            ']',
            ')',
            '}',
            ';',
            '!',
        ]
        invalid.forEach(input => expect(parse('<declaration-value>', input, false)).toBeNull())
    })
    test('representation', () => {
        const tokens = [identToken('declaration'), delimiter(' '), identToken('value')]
        const value = list(tokens, '', ['<declaration-value>'])
        expect(parse('<declaration-value>', 'declaration value', false)).toMatchObject(value)
    })
    test('valid', () => {
        expect(parse('<declaration-value>', 'positioned {} var()')).toBe('positioned {} var()')
        expect(parse('<declaration-value>', '  /**/  1/**/1e0  /**/  ')).toBe('1 1')
    })
})
describe('<declaration>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid structure
            'color red',
            'color: red;',
            // Invalid value
            'color: var(--custom) {}',
            'color: {} var(--custom)',
            '--custom: "bad\nstring"',
            '--custom: url(bad .url)',
            '--custom: ]',
            '--custom: )',
            '--custom: }',
            '--custom: !',
        ]
        invalid.forEach(input => expect(parse('<declaration>', input, false, styleRule)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<declaration>', 'color: green !important', false, styleRule)).toMatchObject({
            important: true,
            name: 'color',
            types: ['<declaration>'],
            value: keyword('green', ['<named-color>', '<color-base>', '<color>', 'color']),
        })
    })
    test('valid', () => {
        expect(parse('<declaration>', '--custom:  /**/  {} 1e0 {} !important  /**/  ', true, styleRule))
            .toBe('--custom: {} 1e0 {} !important')
        expect(parse('<declaration>', '--custom:', true, styleRule))
            .toBe('--custom: ')
    })
})

describe('<ident>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '1identifier',
            '!identifier',
            '-1identifier',
            '-!identifier',
            '--!identifier',
            // Invalid escape sequence (parse error)
            '\\\n',
            '-\\\n',
        ]
        invalid.forEach(input => expect(parse('<ident>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<ident>', 'identifier', false)).toMatchObject(ident('identifier'))
    })
    test('valid', () => {
        const valid = [
            // Starts with identifier start code point(s)
            ['identifier'],
            ['·identifier'],
            ['_identifier'],
            // Starts with an escape sequence
            ['\\', '�'],
            ['\\-'],
            ['\\0', '�'],
            ['\\D800', '�'],
            ['\\110000', '�'],
            ['\\0000311', '\\31 1'],
            ['\\31 1'],
            ['\\31\\31', '\\31 1'],
            ['\\Aidentifier', '\\a identifier'],
            ['\\69 dentifier', 'identifier'],
            ['\\identifier', 'identifier'],
            ['\\21identifier', '\\!identifier'],
            ['\\!identifier'],
            ['\\A9identifier', '\\©identifier'],
            ['\\©identifier'],
            // Starts with - followed by - or identifier start code point
            ['--'],
            ['-identifier'],
            ['-·identifier'],
            ['-_identifier'],
            ['-\\31identifier', '-\\31 identifier'],
            // Only contains identifier code points and escape sequences
            ['identifier·'],
            ['identifier_'],
            ['identifier1'],
            ['identifier-'],
            ['identifie\\r', 'identifier'],
            // Case-sensitive
            ['IDENTIFIER'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<ident>', input)).toBe(expected))
    })
})
describe('keyword', () => {
    test('representation', () => {
        expect(parse('identifier', 'identifier', false)).toMatchObject(keyword('identifier'))
    })
    test('valid', () => {
        expect(parse('identifier', 'IDENTIFIER')).toBe('identifier')
    })
})
describe('<custom-ident>', () => {
    test('invalid', () => {
        const invalid = [...cssWideKeywords, 'DEFAULT']
        invalid.forEach(input => expect(parse('<custom-ident>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<custom-ident>', 'IDENTIFIER', false)).toMatchObject(customIdent('IDENTIFIER'))
    })
})
describe('<dashed-ident>', () => {
    test('invalid', () => {
        expect(parse('<dashed-ident>', '-custom-identifier', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<dashed-ident>', '--custom-identifier', false)).toMatchObject(dashedIdent('--custom-identifier'))
    })
})
describe('<custom-property-name>', () => {
    test('invalid', () => {
        expect(parse('<custom-property-name>', '--', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<custom-property-name>', '--dashed-identifier', false))
            .toMatchObject(dashedIdent('--dashed-identifier', ['<custom-property-name>']))
    })
})
describe('<ndashdigit-ident>', () => {
    test('invalid', () => {
        const invalid = [
            '-n-1',
            'n--1',
            'n-1-',
        ]
        invalid.forEach(input => expect(parse('<ndashdigit-ident>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<ndashdigit-ident>', 'n-11', false)).toMatchObject(identToken('n-11', ['<ndashdigit-ident>']))
    })
})
describe('<dashndashdigit-ident>', () => {
    test('invalid', () => {
        const invalid = [
            '--n-1',
            '-n--1',
            '-n-1-',
        ]
        invalid.forEach(input => expect(parse('<dashndashdigit-ident>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<dashndashdigit-ident>', '-n-11', false))
            .toMatchObject(identToken('-n-11', ['<dashndashdigit-ident>']))
    })
})
describe('<string>', () => {
    test('invalid', () => {
        expect(parse('<string>', '"\n"', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<string>', '"css"', false)).toMatchObject(string('css'))
        expect(parse('<string>', '"css', false)).toMatchObject(string('css', [], '"css'))
    })
    test('valid', () => {
        const valid = [
            // Unclosed (parse error)
            ['"', '""'],
            ["'", '""'],
            ['"\\', '""'],
            // Escape sequence
            ['"\\\n"', '""'],
            ['"\\0"', '"�"'],
            ['"\\D800"', '"�"'],
            ['"\\110000"', '"�"'],
            ['"\\0000311"', '"11"'],
            ['"\\31 1"', '"11"'],
            ['"\\31\\31"', '"11"'],
            ['"\\A"', '"\\a "'],
            ['"\\22"', '"\\""'],
            ['"\\""', '"\\""'],
            ['"\\5C"', '"\\\\"'],
            ['"\\\\"', '"\\\\"'],
            ['"\\73tring"', '"string"'],
            ['"\\string"', '"string"'],
            // Double quotes
            ["'string'", '"string"'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<string>', input)).toBe(expected))
    })
})
describe('<url>', () => {
    test('invalid', () => {
        const invalid = [
            'url(bad .url)',
            'url(bad\n.url)',
            'url(bad\t.url)',
            'url(bad".url)',
            "url(bad'.url)",
            'url(bad(.url)',
            'url(bad\u0001.url)',
            'url(bad\\\n.url)',
        ]
        invalid.forEach(input => expect(parse('<url>', input, false)).toBeNull())
    })
    test('representation', () => {
        const valid = [
            ['url(img.jpg)', {
                types: ['<url-token>', '<url()>', '<url>'],
                value: 'img.jpg',
            }],
            ['url("img.jpg")', {
                name: 'url',
                types: ['<function>', '<url()>', '<url>'],
                value: list([string('img.jpg'), list()]),
            }],
            ['src("img.jpg")', {
                name: 'src',
                types: ['<function>', '<src()>', '<url>'],
                value: list([string('img.jpg'), list()]),
            }],
        ]
        valid.forEach(([input, expected]) => expect(parse('<url>', input, false)).toMatchObject(expected))
    })
    test('valid', () => {
        const valid = [
            // Case-insensitive name
            ['URL(file.jpg)', 'url("file.jpg")'],
            ['URL("file.jpg")', 'url("file.jpg")'],
            ['SRC("file.jpg")', 'src("file.jpg")'],
            // Unclosed (parse error)
            ['url(', 'url("")'],
            ['url( ', 'url("")'],
            ['url(\n', 'url("")'],
            ['url(\t', 'url("")'],
            ['url(\\', 'url("�")'],
            ['url(valid.jpg ', 'url("valid.jpg")'],
            // Single whitespace
            ['url( )', 'url("")'],
            ['url(\n)', 'url("")'],
            ['url(\t)', 'url("")'],
            // Escape sequence
            ['url(\\0)', 'url("�")'],
            ['url(\\D800)', 'url("�")'],
            ['url(\\110000)', 'url("�")'],
            ['url(\\0000311)', 'url("11")'],
            ['url(\\31 1)', 'url("11")'],
            ['url(\\31\\31)', 'url("11")'],
            ['url(\\A)', 'url("\\a ")'],
            ['url(\\22)', 'url("\\"")'],
            ['url(\\")', 'url("\\"")'],
            ['url(\\5C)', 'url("\\\\")'],
            ['url(\\\\)', 'url("\\\\")'],
            ['url(\\76 alid.url)', 'url("valid.url")'],
            ['url(\\valid.url)', 'url("valid.url")'],
            // Double quotes
            ["url('file.jpg')", 'url("file.jpg")'],
            ["src('file.jpg')", 'src("file.jpg")'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<url>', input)).toBe(expected))
    })
})

describe('<number>', () => {
    test('invalid', () => {
        expect(parse('<number [0,∞]>', '-1', false)).toBeNull()
        expect(parse('<number [0,∞]>', '1px', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<number>', '1', false)).toMatchObject(number(1))
    })
    test('valid', () => {
        const valid = [
            // Scientific notation
            ['1e1', '10'],
            ['1e+1', '10'],
            ['1e-1', '0.1'],
            // Leading 0
            ['.1', '0.1'],
            // Trailing 0
            ['0.10', '0.1'],
            // Precision
            ['1e-6', '0.000001'],
            ['1e-7', '0'],
            ['0.123456'],
            ['0.1234567', '0.123457'],
            ['1.234567'],
            ['1.2345678', '1.234568'],
            // https://github.com/w3c/csswg-drafts/issues/6471
            ['1234567'],
            // Priority over <length> in "either" combination type
            ['0', '0', '<length> | <number>'],
            ['0', '0', '<length> || <number>'],
            ['0', '0', '<length-percentage> | <number>'],
            ['0', '0', '<length-percentage> || <number>'],
            ['0 1', '0px 1', '<length> && <number>'],
            ['0 1', '1 0px', '<number> && <length>'],
        ]
        valid.forEach(([input, expected = input, definition = '<number>']) =>
            expect(parse(definition, input)).toBe(expected))
    })
})
describe('<zero>', () => {
    test('invalid', () => {
        expect(parse('<zero>', '1', false)).toBeNull()
        expect(parse('<zero>', '0px', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<zero>', '0', false)).toMatchObject(numberToken(0, ['<zero>']))
    })
    test('valid', () => {
        const valid = [
            '0.0',
            '+0',
            '0e1',
        ]
        valid.forEach(input => expect(parse('<zero>', input)).toBe('0'))
    })
})
describe('<integer>', () => {
    test('invalid', () => {
        const invalid = [
            '-1',
            '1.1',
            '1e-1',
            '1px',
        ]
        invalid.forEach(input => expect(parse('<integer [0,∞]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<integer>', '1', false)).toMatchObject(integer(1))
    })
    test('valid', () => {
        const valid = [
            // https://github.com/w3c/csswg-drafts/issues/10238
            ['1.0', '1'],
            ['1e1', '10'],
            ['1e+1', '10'],
            // 8 bits signed integer (browser conformance)
            [`${MIN_INTEGER - 1}`, MIN_INTEGER],
            [`${MAX_INTEGER + 1}`, MAX_INTEGER],
            // Priority over <length> in "either" combination type
            ['0', '0', '<length> | <integer>'],
            ['0', '0', '<length> || <integer>'],
            ['0', '0', '<length-percentage> | <integer>'],
            ['0', '0', '<length-percentage> || <integer>'],
            ['0 1', '0px 1', '<length> && <integer>'],
            ['0 1', '1 0px', '<integer> && <length>'],
        ]
        valid.forEach(([input, expected = input, definition = '<integer>']) =>
            expect(parse(definition, input)).toBe(expected))
    })
})
describe('<signless-integer>', () => {
    test('invalid', () => {
        const invalid = [
            '+1',
            '1.1',
            '1e-1',
            '1px',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<signless-integer>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<signless-integer>', '1', false)).toMatchObject(numberToken(1, ['<signless-integer>']))
    })
})
describe('<signed-integer>', () => {
    test('invalid', () => {
        const invalid = [
            '1',
            '+1.1',
            '+1e-1',
            '+1px',
            'calc(+1)',
        ]
        invalid.forEach(input => expect(parse('<signed-integer>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<signed-integer>', '+1', false)).toMatchObject(numberToken(1, ['<signed-integer>']))
        expect(parse('<signed-integer>', '-1', false)).toMatchObject(numberToken(-1, ['<signed-integer>']))
    })
})
describe('<dimension>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '1!identifier',
            '1-1identifier',
            '1-!identifier',
            '1--!identifier',
            // Invalid escape sequence (parse error)
            '1\\\n',
            '1-\\\n',
        ]
        invalid.forEach(input => expect(parse('<dimension>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<dimension>', '1identifier', false)).toMatchObject(dimension(1, 'identifier'))
    })
    test('valid', () => {
        const valid = [
            // Scientific notation
            ['1e1identifier', '10identifier'],
            ['1e+1identifier', '10identifier'],
            ['1e-1identifier', '0.1identifier'],
            // Leading 0
            ['.1identifier', '0.1identifier'],
            // Trailing 0
            ['0.10identifier', '0.1identifier'],
            // The unit starts with identifier start code point(s)
            ['1identifier'],
            ['1·identifier'],
            ['1_identifier'],
            // The unit starts with an escape sequence
            ['1\\', '1�'],
            ['1\\-'],
            ['1\\0', '1�'],
            ['1\\D800', '1�'],
            ['1\\110000', '1�'],
            ['1\\0000311', '1\\31 1'],
            ['1\\31 1'],
            ['1\\31\\31', '1\\31 1'],
            ['1\\Aidentifier', '1\\a identifier'],
            ['1\\69 dentifier', '1identifier'],
            ['1\\identifier', '1identifier'],
            ['1\\21identifier', '1\\!identifier'],
            ['1\\!identifier'],
            ['1\\A9identifier', '1\\©identifier'],
            ['1\\©identifier'],
            // The unit starts with - followed by - or identifier start code point
            ['1--'],
            ['1-identifier'],
            ['1-·identifier'],
            ['1-_identifier'],
            ['1-\\31identifier', '1-\\31 identifier'],
            // The unit only contains identifier code points and escape sequences
            ['1identifier·'],
            ['1identifier_'],
            ['1identifier1'],
            ['1identifier-'],
            ['1identifie\\r', '1identifier'],
            // The unit is case-insensitive
            ['1IDENTIFIER', '1identifier'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<dimension>', input)).toBe(expected))
    })
})
describe('<angle>', () => {
    test('invalid', () => {
        const invalid = [
            '-1deg',
            '1turn',
            '1',
            '1px',
        ]
        invalid.forEach(input => expect(parse('<angle [0,1deg]>', input, false)).toBeNull())
    })
    test('representation', () => {
        const valid = [
            ['<angle> | <zero>', '0', {
                types: ['<dimension-token>', '<dimension>', '<angle>'],
                unit: 'deg',
                value: 0,
            }],
            ['<angle-percentage> | <zero>', '0', {
                types: ['<dimension-token>', '<dimension>', '<angle>', '<angle-percentage>'],
                unit: 'deg',
                value: 0,
            }],
            ['<angle>', '1deg', angle(1, 'deg')],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input, false)).toMatchObject(expected))
    })
    test('valid', () => {
        expect(parse('<angle [0,1turn]>', '1turn')).toBe('1turn')
        expect(parse('<angle [0,1turn]>', '360deg')).toBe('360deg')
    })
})
describe('<decibel>', () => {
    test('invalid', () => {
        const invalid = [
            '-1db',
            '1',
            '1px',
        ]
        invalid.forEach(input => expect(parse('<decibel [0,1db]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<decibel>', '1db', false)).toMatchObject(decibel(1))
    })
    test('valid', () => {
        expect(parse('<decibel [0,∞]>', '0db')).toBe('0db')
    })
})
describe('<flex>', () => {
    test('invalid', () => {
        const invalid = [
            ['-1fr', '<flex>'],
            ['1'],
            ['1px'],
        ]
        invalid.forEach(([input, definition = '<flex [0,1fr]>']) => expect(parse(definition, input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<flex>', '1fr', false)).toMatchObject(flex(1))
    })
    test('valid', () => {
        expect(parse('<flex [0,∞]>', '0fr')).toBe('0fr')
    })
})
describe('<frequency>', () => {
    test('invalid', () => {
        const invalid = [
            '-1hz',
            '1khz',
            '1',
            '1px',
        ]
        invalid.forEach(input => expect(parse('<frequency [0,1hz]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<frequency>', '1hz', false)).toMatchObject(frequency(1, 'hz'))
    })
    test('valid', () => {
        expect(parse('<frequency [0,1khz]>', '1khz')).toBe('1khz')
        expect(parse('<frequency [0,1khz]>', '1000hz')).toBe('1000hz')
    })
})
describe('<length>', () => {
    test('invalid', () => {
        const invalid = [
            '-1px',
            '1in',
            '1',
            '1%',
        ]
        invalid.forEach(input => expect(parse('<length [0,1px]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<length>', '0', false)).toMatchObject({
            types: ['<dimension-token>', '<dimension>', '<length>'],
            unit: 'px',
            value: 0,
        })
        expect(parse('<length>', '1px', false)).toMatchObject(length(1, 'px'))
    })
    test('valid', () => {
        expect(parse('<length [0,1in]>', '1in')).toBe('1in')
        expect(parse('<length [0,1in]>', '96px')).toBe('96px')
    })
})
describe('<percentage>', () => {
    test('invalid', () => {
        const invalid = [
            '-1%',
            '0',
            '1px',
        ]
        invalid.forEach(input => expect(parse('<percentage [0,∞]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<percentage>', '1%', false)).toMatchObject(percentage(1))
    })
    test('valid', () => {
        const valid = [
            // Scientific notation
            ['1e1%', '10%'],
            ['1e+1%', '10%'],
            ['1e-1%', '0.1%'],
            // Leading 0
            ['.1%', '0.1%'],
            // Trailing 0
            ['0.10%', '0.1%'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<percentage [0,∞]>', input)).toBe(expected))
    })
})
describe('<length-percentage>', () => {
    test('invalid', () => {
        const invalid = [
            '-1px',
            '-1%',
            '1deg',
        ]
        invalid.forEach(input => expect(parse('<length-percentage [0,∞]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<length-percentage>', '1px', false)).toMatchObject(length(1, 'px', ['<length-percentage>']))
    })
    test('valid', () => {
        expect(parse('<length-percentage [0,∞]>', '1px')).toBe('1px')
        expect(parse('<length-percentage [0,∞]>', '1%')).toBe('1%')
    })
})
describe('<semitones>', () => {
    test('invalid', () => {
        const invalid = [
            '-1st',
            '1',
            '1px',
        ]
        invalid.forEach(input => expect(parse('<semitones [0,1st]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<semitones>', '1st', false)).toMatchObject(semitones(1))
    })
    test('valid', () => {
        expect(parse('<semitones [0,∞]>', '1st')).toBe('1st')
    })
})
describe('<resolution>', () => {
    test('invalid', () => {
        const invalid = [
            ['-1dppx', '<resolution>'],
            ['1dpi'],
            ['1'],
            ['1px'],
        ]
        invalid.forEach(([input, definition = '<resolution [0,1dppx]>']) =>
            expect(parse(definition, input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<resolution>', '1dppx', false)).toMatchObject(resolution(1, 'dppx'))
    })
    test('valid', () => {
        expect(parse('<resolution [0,1dpi]>', '1dpi')).toBe('1dpi')
        expect(parse('<resolution [0,1dpi]>', '96dppx')).toBe('96dppx')
    })
})
describe('<time>', () => {
    test('invalid', () => {
        const invalid = [
            '-1ms',
            '1s',
            '1',
            '1px',
        ]
        invalid.forEach(input => expect(parse('<time [0,1ms]>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<time>', '1s', false)).toMatchObject(time(1, 's'))
    })
    test('valid', () => {
        expect(parse('<time [0,1s]>', '1s')).toBe('1s')
        expect(parse('<time [0,1s]>', '1000ms')).toBe('1000ms')
    })
})
describe('<n-dimension>', () => {
    test('invalid', () => {
        expect(parse('<n-dimension>', '1n-', false)).toBeNull()
        expect(parse('<n-dimension>', '1.1n', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<n-dimension>', '1n', false)).toMatchObject(dimensionToken(1, 'n', ['<n-dimension>']))
    })
})
describe('<ndash-dimension>', () => {
    test('invalid', () => {
        expect(parse('<ndash-dimension>', '1n', false)).toBeNull()
        expect(parse('<ndash-dimension>', '1.1n-', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<ndash-dimension>', '1n-', false)).toMatchObject(dimensionToken(1, 'n-', ['<ndash-dimension>']))
    })
})
describe('<ndashdigit-dimension>', () => {
    test('invalid', () => {
        expect(parse('<ndashdigit-dimension>', '1n-', false)).toBeNull()
        expect(parse('<ndashdigit-dimension>', '1.1n-1', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<ndashdigit-dimension>', '1n-11', false))
            .toMatchObject(dimensionToken(1, 'n-11', ['<ndashdigit-dimension>']))
    })
})

describe('<calc()>', () => {
    test('invalid', () => {
        const invalid = [
            // Whitespace required on both sides of `+` and `-`
            ['<number>', 'calc(1+ 1)'],
            ['<number>', 'calc(1 +1)'],
            ['<number>', 'calc(1- 1)'],
            ['<number>', 'calc(1 -1)'],
            // Maximum 32 <calc-value>
            ['<number>', `calc(${[...Array(32)].reduce((n, _, i) => `${n} ${i % 2 ? '+' : '*'} 1`, '0')})`],
            ['<number>', `calc(${[...Array(32)].reduce(n => `(${n})`, '1')})`],
            ['<number>', `calc(${[...Array(32)].reduce(n => `calc(${n})`, '1')})`],
            ['<number>', `calc((1) + ${[...Array(30)].reduce(n => `(${n})`, '1')})`],
            ['<number>', `calc(calc(1) + ${[...Array(30)].reduce(n => `calc(${n})`, '1')})`],
            // Result type failure or mismatch
            ['<number>', 'calc(1px)'],
            ['<number>', 'calc(1%)'],
            ['<number>', 'calc(1 + 1px)'],
            ['<number>', 'calc(1 - 1px)'],
            ['<number>', 'calc(1 / 1px)'],
            ['<number>', 'calc(1% / 1%)'],
            ['<number>', 'calc(1px * 1px)'],
            ['<number>', 'calc((1% + 1px) / 1px)'],
            ['<number>', 'calc(1px / 1 * 1px)'],
            ['<number>', 'calc(1 / 1px / 1px)'],
            ['<length>', 'calc(1)'],
            ['<length>', 'calc(1%)'],
            ['<length>', 'calc(1px + 1)'],
            ['<length>', 'calc(1px - 1)'],
            ['<length>', 'calc(1 / 1px)'],
            ['<length>', 'calc(1px * 1px)'],
            ['<length>', 'calc(1px / 1px)'],
            ['<length>', 'calc(1px / 1px / 1px)'],
            ['<length>', 'calc(1px / 1% / 1%)'],
            ['<length>', 'calc(1px + 1s)'],
            ['<length>', 'calc(1px - 1s)'],
            ['<length>', 'calc(1px * 1s)'],
            ['<length>', 'calc(1px / 1s)'],
            ['<length>', 'calc(1px + 1%)'],
            ['<length>', 'calc(1px - 1%)'],
            ['<length>', 'calc(1px * 1%)'],
            ['<length>', 'calc(1px / 1%)'],
            ['<length>', 'calc(1% / 1px)'],
            ['<dimension>', 'calc(1n)'],
            ['<dimension>', 'calc(1px + 1s)'],
            ['<dimension> | <percentage>', 'calc(1px + 1%)'],
            ['<percentage>', 'calc(1)'],
            ['<percentage>', 'calc(1px)'],
            ['<percentage>', 'calc(1% + 1)'],
            ['<percentage>', 'calc(1% - 1)'],
            ['<percentage>', 'calc(1 / 1%)'],
            ['<percentage>', 'calc(1% * 1%)'],
            ['<percentage>', 'calc(1% / 1%)'],
            // 0 is parsed as <number> in calculations
            ['<length>', 'calc(0 + 1px)'],
            ['<length>', 'calc(0 - 1px)'],
            // <number> and <percentage> are not combinable
            ['<number> | <percentage>', 'calc(1 + 1%)'],
            ['<number> | <percentage>', 'calc(1 - 1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('representation', () => {

        const one = number(1, ['<calc-value>'])
        const two = number(2, ['<calc-value>'])

        const valid = [
            // Unresolved calculation
            ['<calc()>', 'calc(1)', {
                name: 'calc',
                types: ['<function>', '<calc()>'],
                value: one,
            }],
            ['<calc()>', 'calc(1 + 2)', {
                name: 'calc',
                types: ['<function>', '<calc()>'],
                value: list([one, two], '+', ['<calc-sum>']),
            }],
            ['<calc()>', 'calc(1 - 2)', {
                name: 'calc',
                types: ['<function>', '<calc()>'],
                value: list([one, { types: ['<calc-negate>'], value: two }], '+', ['<calc-sum>']),
            }],
            ['<calc()>', 'calc(1 * 2)', {
                name: 'calc',
                types: ['<function>', '<calc()>'],
                value: list([one, two], '*', ['<calc-product>']),
            }],
            ['<calc()>', 'calc(1 / 2)', {
                name: 'calc',
                types: ['<function>', '<calc()>'],
                value: list([one, { types: ['<calc-invert>'], value: two }], '*', ['<calc-product>']),
            }],
            // Resolved calculation
            ['<number>', 'calc(1)', {
                name: 'calc',
                range: undefined,
                round: false,
                types: ['<function>', '<calc()>', '<calc-function>'],
                value: number(1, ['<calc-value>']),
            }],
            ['<number>', 'calc(1 + 2)', {
                name: 'calc',
                range: undefined,
                round: false,
                types: ['<function>', '<calc()>', '<calc-function>'],
                value: {
                    types: ['<number-token>', '<number>', '<calc-value>'],
                    value: 3,
                },
            }],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input, false)).toMatchObject(expected))
    })
    test('valid single operand', () => {
        const valid = [
            // <number>, <dimension>, <percentage>
            ['<number>', 'CALC(1)', 'calc(1)'],
            ['<length>', 'calc(1px)'],
            ['<dimension>', 'calc(1px)'],
            ['<percentage>', 'calc(1%)'],
            // <calc-keyword>
            ['<number>', 'calc(e)', `calc(${Math.E.toFixed(6)})`],
            ['<number>', 'calc(pi)', `calc(${Math.PI.toFixed(6)})`],
            ['<number>', 'calc(infinity)'],
            ['<number>', 'calc(-infinity)'],
            ['<number>', 'calc(nan)', 'calc(NaN)'],
            // <type-percentage>
            ['<number> | <percentage>', 'calc(1)'],
            ['<number> | <percentage>', 'calc(100%)'],
            ['<length-percentage>', 'calc(1px)'],
            ['<length-percentage>', 'calc(1%)'],
            ['<length> | <percentage>', 'calc(1%)'],
            ['<length> | <percentage>', 'calc(1px)'],
            ['a | <percentage> | b | <length> | c', 'calc(1%)'],
            ['a | <percentage> | b | <length> | c', 'calc(1px)'],
            // Nested calculation or math function
            ['<length>', 'calc((1em))', 'calc(1em)'],
            ['<length>', 'calc(calc(1em))', 'calc(1em)'],
            ['<length>', 'calc(min(1em))', 'calc(1em)'],
            ['<number>', 'calc(sign(1em))', 'sign(1em)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid operands of identical units', () => {
        const valid = [
            // Unitless
            ['<number>', 'calc(1 + 1 + 1 + 1)', 'calc(4)'],
            ['<number>', 'calc(4 - 1 - 1 - 1)', 'calc(1)'],
            ['<number>', 'calc(1 * 2 * 3 * 4)', 'calc(24)'],
            ['<number>', 'calc(42 / 7 / 3 / 2)', 'calc(1)'],
            ['<number>', 'calc(1 + 2 * 3 - 2 / 1)', 'calc(5)'],
            // Unitful
            ['<length>', 'calc(3px * 2px / 2px)', 'calc(3px)'],
            ['<percentage>', 'calc(1% + 1%)', 'calc(2%)'],
            ['<percentage>', 'calc(1% - 1%)', 'calc(0%)'],
            ['<percentage>', 'calc(3% * 2% / 2%)', 'calc(3%)'],
            ['<percentage>', 'calc(3% / 2% * 2%)', 'calc(3%)'],
            // <calc-keyword>
            ['<number>', 'calc(1 * e)', `calc(${Math.E.toFixed(6)})`],
            ['<number>', 'calc(1 * infinity)', 'calc(infinity)'],
            ['<number>', 'calc(1 * nan)', 'calc(NaN)'],
            // -0
            ['<number>', 'calc(1 / -0)', 'calc(infinity)'],
            ['<number>', 'calc(1 / (0 * -1))', 'calc(-infinity)'],
            // Nested calculation or math function
            ['<number>', 'calc(1 + 2 * (3 + 4))', 'calc(15)'],
            ['<number>', 'calc((1 + 2) * 3 / (4 + 5))', 'calc(1)'],
            ['<number>', 'calc(calc(1 + 2) * 3 / calc(4 + 5))', 'calc(1)'],
            ['<number>', 'calc(min(1, 2) + sign(1))', 'calc(2)'],
            ['<number>', 'calc(min(1, 2) - sign(1))', 'calc(0)'],
            ['<number>', 'calc(min(1, 2) * sign(1))', 'calc(1)'],
            ['<number>', 'calc(min(1, 2) / sign(1))', 'calc(1)'],
            // Maximum 32 <calc-value>
            ['<number>', `calc(${[...Array(31)].reduce((n, _, i) => `${n} ${i % 2 ? '+' : '*'} 1`, '0')})`, 'calc(15)'],
            ['<number>', `calc(${[...Array(31)].reduce(n => `(${n})`, '1')})`, 'calc(1)'],
            ['<number>', `calc(${[...Array(31)].reduce(n => `calc(${n})`, '1')})`, 'calc(1)'],
            ['<number>{2}', `calc(${[...Array(31)].reduce(n => `${n} + 1`, '1')}) calc(1)`, 'calc(32) calc(1)'],
            ['<number>{2}', `calc(${[...Array(31)].reduce(n => `calc(${n})`, '1')}) calc(calc(1))`, 'calc(1) calc(1)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid operands of different units', () => {
        const valid = [
            // Absolute unit
            ['<angle>', 'calc(1deg + 200grad)', 'calc(181deg)'],
            ['<angle>', `calc(1deg + ${Math.PI.toString()}rad)`, 'calc(181deg)'],
            ['<angle>', 'calc(1deg + 0.5turn)', 'calc(181deg)'],
            ['<length>', 'calc(1px + 1cm)', `calc(${(1 + (96 / 2.54)).toFixed(6)}px)`],
            ['<length>', 'calc(1px + 1mm)', `calc(${(1 + (96 / 2.54 / 10)).toFixed(6)}px)`],
            ['<length>', 'calc(1px + 1Q)', `calc(${(1 + (96 / 2.54 / 40)).toFixed(6)}px)`],
            ['<length>', 'calc(1px + 1in)', 'calc(97px)'],
            ['<length>', 'calc(1px + 1pc)', 'calc(17px)'],
            ['<length>', 'calc(1px + 1pt)', `calc(${(1 + (96 / 72)).toFixed(6)}px)`],
            ['<frequency>', 'calc(1khz + 1hz)', 'calc(1001hz)'],
            ['<resolution>', 'calc(1dppx + 1x)', 'calc(2dppx)'],
            ['<resolution>', 'calc(1dppx + 1dpcm)', `calc(${(1 + (96 / 2.54)).toFixed(6)}dppx)`],
            ['<resolution>', 'calc(1dppx + 1dpi)', 'calc(97dppx)'],
            ['<time>', 'calc(1s + 1ms)', 'calc(1.001s)'],
            ['<length>', 'calc(1cm - 5mm)', `calc(${(96 / 2.54 / 2).toFixed(6)}px)`],
            ['<number>', 'calc(1cm / 5mm)', 'calc(2)'],
            ['<number>', 'calc(1px / 1em)', 'calc(1px / 1em)'],
            // Absolute and relative units
            ['<length>', 'calc(1px + (1em + 1px) + 1em)', 'calc(2em + 2px)'],
            ['<length>', 'calc(1px - 1em - 1px - 1em)', 'calc(-2em + 0px)'],
            ['<length>', 'calc(1em * 1px / 1px)', 'calc(1em * 1px / 1px)'],
            ['<length>', 'calc(1px / 1px * 1em)', 'calc(1em * 1px / 1px)'],
            // Nested math function
            ['<length>', 'calc(min(1px, 2em))', 'min(1px, 2em)'],
            ['<length>', 'calc(min(1px, 2em) + 1px)', 'calc(1px + min(1px, 2em))'],
            ['<length>', 'calc(min(1px, 2em) - 1px)', 'calc(-1px + min(1px, 2em))'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid operands of different types', () => {
        const valid = [
            // Addition and substraction
            ['<length-percentage>', 'calc(1px + (1% + 1px) + 1%)', 'calc(2% + 2px)'],
            ['<length-percentage>', 'calc(1px - 1% - 1px - 1%)', 'calc(-2% + 0px)'],
            // Multiplication or division by <number>
            ['<length>', 'calc(3em * 2 / 3)', 'calc(2em)'],
            ['<length>', 'calc(3 * 2em / 3)', 'calc(2em)'],
            ['<length>', 'calc(2 / 3 * 3em)', 'calc(2em)'],
            ['<length>', 'calc(2em / 2)', 'calc(1em)'],
            ['<length>', 'calc(1px + 2em / 0)', 'calc(infinity * 1px + 1px)'],
            ['<length>', 'calc(1px + 0em / 0)', 'calc(NaN * 1px + 1px)'],
            ['<percentage>', 'calc(3% * 2 / 3)', 'calc(2%)'],
            ['<percentage>', 'calc(3 * 2% / 3)', 'calc(2%)'],
            ['<percentage>', 'calc(2 / 3 * 3%)', 'calc(2%)'],
            ['<percentage>', 'calc(2% / 2)', 'calc(1%)'],
            // Multiplication or division to <number>
            ['<number>', 'calc(2 * 3px / 3px)', 'calc(2)'],
            ['<number>', 'calc(2 / 3px * 3px)', 'calc(2)'],
            ['<number>', 'calc(2px * 3 / 3px)', 'calc(2)'],
            ['<number>', 'calc(9px / 3 / 3px)', 'calc(1)'],
            ['<number>', 'calc(2px / 3px * 3)', 'calc(2)'],
            ['<number>', 'calc(9px / 3px / 3)', 'calc(1)'],
            // Multiplication or division by unresolved <number>
            ['<length>', 'calc(1em * 1em / 1px)', 'calc(1em * 1em / 1px)'],
            ['<length>', 'calc(1em / 1em * 1px)', 'calc(1em * 1px / 1em)'],
            ['<length>', 'calc(1px * 1em / 1em)', 'calc(1em * 1px / 1em)'],
            ['<length>', 'calc(1px / 1em * 1em)', 'calc(1em * 1px / 1em)'],
            ['<length-percentage>', 'calc(1% * 1% / 1px)', 'calc(1% * 1% / 1px)'],
            ['<length-percentage>', 'calc(1% / 1% * 1px)', 'calc(1% * 1px / 1%)'],
            ['<length-percentage>', 'calc(1px * 1% / 1%)', 'calc(1% * 1px / 1%)'],
            ['<length-percentage>', 'calc(1px / 1% * 1%)', 'calc(1% * 1px / 1%)'],
            // Distribution of <number>
            ['<length>', 'calc((1px + 2em) * 3)', 'calc(6em + 3px)'],
            ['<length>', 'calc((1px + 2em) * infinity)', 'calc(infinity * 1px + infinity * 1px)'],
            ['<length>', 'calc((1px + 2em) * NaN)', 'calc(NaN * 1px + NaN * 1px)'],
            ['<length>', 'calc((2px + 2em) / 2)', 'calc(1em + 1px)'],
            ['<length-percentage>', 'calc((1px + 2%) * 3)', 'calc(6% + 3px)'],
            ['<length-percentage>', 'calc((2px + 2%) / 2)', 'calc(1% + 1px)'],
            ['<number>', 'calc(2 * 1px / 1em)', 'calc(2px / 1em)'],
            ['<number>', 'calc(2 * (1px + 1em) / 1em)', 'calc((2em + 2px) / 1em)'],
            ['<length>', 'calc(2 * (1em * (1px / 1em)))', 'calc(2em * 1px / 1em)'],
            ['<number>', 'calc(1px / 1em * 2)', 'calc(2px / 1em)'],
            ['<number>', 'calc((1px + 1em) / 1em * 2)', 'calc((2em + 2px) / 1em)'],
            // Nested math function
            ['<length>', 'calc(min(1px, 2px) * sign(1px))', 'calc(1px)'],
            ['<length>', 'calc(min(1px, 2px) / sign(1px))', 'calc(1px)'],
            ['<length>', 'calc(min(1px, 2em) * sign(1px))', 'min(1px, 2em)'],
            ['<length>', 'calc(min(1px, 2em) / sign(1px))', 'min(1px, 2em)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<min()>, <max()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'min(1, 1px)'],
            ['<number> | <percentage>', 'min(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'min((1% + 1px) / 1px)'],
            ['<length>', 'min(1px, 1%)'],
            // Maximum 32 <calc-value>
            ['<number>', `min(${[...Array(16)].map(() => '1 + 1').join(', ')}, 1)`],
            ['<number>', `min(${[...Array(16)].map(() => '((1))').join(', ')}, (1))`],
            // Maximum 32 arguments
            ['<number>', `min(${[...Array(33)].map(() => 1).join(', ')})`],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<min()>', 'min(1)', false)).toMatchObject({
            name: 'min',
            types: ['<function>', '<min()>'],
            value: list([number(1, ['<calc-value>'])], ','),
        })
    })
    test('valid', () => {
        const valid = [
            // Single argument
            ['<number>', 'min(1)', 'calc(1)'],
            ['<length>', 'min(1em)', 'calc(1em)'],
            ['<length-percentage>', 'min(1%)', 'calc(1%)'],
            // Identical units
            ['<number>', 'min(0, 1)', 'calc(0)'],
            ['<length>', 'MIN(0em, 1em)', 'min(0em, 1em)'],
            ['<length-percentage>', 'min(0%, 1%)'],
            ['<percentage>', 'min(0%, 1%)', 'calc(0%)'],
            // Different units
            ['<length>', 'min(1px, 1in)', 'calc(1px)'],
            ['<length>', 'max(1px, 1in)', 'calc(96px)'],
            ['<length-percentage>', 'min(1px, min(0%, 1%))'],
            // Maximum 32 <calc-value>
            ['<number>', `min(${[...Array(15)].map(() => '1 + 1').join(', ')}, 1)`, 'calc(1)'],
            ['<number>', `min(${[...Array(15)].map(() => '(1)').join(', ')}, (1))`, 'calc(1)'],
            // Maximum 32 arguments
            ['<number>', `min(${[...Array(32)].map((_, i) => i).join(', ')})`, 'calc(0)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<clamp()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'clamp(1, 1px, 1)'],
            ['<number> | <percentage>', 'clamp(1, 1%, 1)'],
            // Result type mismatch
            ['<number> | <percentage>', 'clamp(1, (1% + 1px) / 1px, 1)'],
            ['<length>', 'clamp(1px, 1%, 1px)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Identical units
            ['<number>', 'clamp(0, 1, 2)', 'calc(1)'],
            ['<number>', 'clamp(0, 2, 1)', 'calc(1)'],
            ['<number>', 'clamp(1, 0, 2)', 'calc(1)'],
            ['<number>', 'clamp(1, 2, 0)', 'calc(1)'],
            ['<length>', 'CLAMP(0em, 1em, 2em)', 'clamp(0em, 1em, 2em)'],
            ['<length-percentage>', 'clamp(0%, 1%, 2%)'],
            ['<percentage>', 'clamp(0%, 1%, 2%)', 'calc(1%)'],
            // Different units
            ['<length>', 'clamp(0px, 1in, 2px)', 'calc(2px)'],
            ['<length>', 'clamp(0em, 1px, 2px)'],
            ['<length-percentage>', 'clamp(0px, 1px, clamp(0%, 1%, 2%))'],
            // none
            ['<number>', 'clamp(0, 1, none)'],
            ['<number>', 'clamp(none, 1, 2)'],
            ['<number>', 'clamp(none, 1, none)', 'calc(1)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<round()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'round(1, 1px)'],
            ['<number> | <length>', 'round(1px)'],
            ['<number> | <percentage>', 'round(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'round(1, (1% + 1px) / 1px)'],
            ['<length>', 'round(1px, 1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Identical units
            ['<number>', 'round(1.1, 1)', 'calc(1)'],
            ['<number>', 'round(1, 2)', 'calc(2)'],
            ['<number>', 'round(up, 1.1)', 'calc(2)'],
            ['<number>', 'round(down, 1.9)', 'calc(1)'],
            ['<number>', 'round(to-zero, 1, 2)', 'calc(0)'],
            ['<number>', 'round(to-zero, -1, 2)', 'calc(0)'],
            ['<length>', 'ROUND(1em, 1em)', 'round(1em, 1em)'],
            ['<length-percentage>', 'round(1%, 1%)'],
            ['<percentage>', 'round(1%, 1%)', 'calc(1%)'],
            // Different units
            ['<length>', 'round(1cm, 1px)', 'calc(38px)'],
            ['<length>', 'round(1em, 1px)'],
            ['<length-percentage>', 'round(1px, round(1%, 1%))'],
            // Omitted component values
            ['<number>', 'round(nearest, 1px / 1em, 1)', 'round(1px / 1em)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid resulting to 0⁻, 0⁺, NaN, or Infinity', () => {
        const valid = [
            // Rounding 0⁻ or 0⁺ is preserved as is (it is a multiple of every number)
            ['calc(1 / round(-0, 1))', 'calc(infinity)'],
            ['calc(1 / round(-1 * 0, 1))', 'calc(-infinity)'],
            // Rounding up to 0 results to 0⁻
            ['calc(1 / round(-1, 2))', 'calc(-infinity)'],
            // 0 as step value results to NaN
            ['round(1, 0)', 'calc(NaN)'],
            // An infinite input and step values result to NaN
            ['round(1 / 0, 1 / 0)', 'calc(NaN)'],
            ['round(1 / 0, -1 / 0)', 'calc(NaN)'],
            ['round(-1 / 0, 1 / 0)', 'calc(NaN)'],
            ['round(-1 / 0, -1 / 0)', 'calc(NaN)'],
            // An infinite input value results to the same infinite value (if step value is finite and not 0)
            ['round(-infinity, 1)', 'calc(-infinity)'],
            ['round(infinity, 1)', 'calc(infinity)'],
            // Rounding to nearest/zero with an infinite step value results to 0⁻ if input value is negative or 0⁻ (but finite)
            ['calc(1 / round(-1, -infinity))', 'calc(-infinity)'],
            ['calc(1 / round(-1, infinity))', 'calc(-infinity)'],
            ['calc(1 / round(0 * -1, -infinity))', 'calc(-infinity)'],
            ['calc(1 / round(0 * -1, infinity))', 'calc(-infinity)'],
            ['calc(1 / round(to-zero, -1, -infinity))', 'calc(-infinity)'],
            ['calc(1 / round(to-zero, -1, infinity))', 'calc(-infinity)'],
            ['calc(1 / round(to-zero, 0 * -1, -infinity))', 'calc(-infinity)'],
            ['calc(1 / round(to-zero, 0 * -1, infinity))', 'calc(-infinity)'],
            // Rounding to nearest/zero with an infinite step value results to 0⁺ if input value is 0⁺ or positive (but finite)
            ['round(0, -infinity)', 'calc(0)'],
            ['round(0, infinity)', 'calc(0)'],
            ['round(1, -infinity)', 'calc(0)'],
            ['round(1, infinity)', 'calc(0)'],
            ['round(to-zero, 0, -infinity)', 'calc(0)'],
            ['round(to-zero, 0, infinity)', 'calc(0)'],
            ['round(to-zero, 1, -infinity)', 'calc(0)'],
            ['round(to-zero, 1, infinity)', 'calc(0)'],
            // Rounding up with an infinite step value results to 0⁻ if input value is negative or 0⁻ (but finite)
            ['calc(1 / round(up, 0 * -1, infinity))', 'calc(-infinity)'],
            ['calc(1 / round(up, -1, infinity))', 'calc(-infinity)'],
            // Rounding up with an infinite step value results to the same input value if it is 0⁺ (but finite)
            ['round(up, 0, infinity)', 'calc(0)'],
            // Rounding up with an infinite step value results to Infinity if input value is positive (but finite)
            ['round(up, 1, infinity)', 'calc(infinity)'],
            // Rounding down with an infinite step value results to -Infinity if input value is negative (but finite)
            ['round(down, -1, infinity)', 'calc(-infinity)'],
            // Rounding down with an infinite step value results to the same input value if it is 0⁻
            ['calc(1 / round(down, 0 * -1, infinity))', 'calc(-infinity)'],
            // Rounding down with an infinite step value results to the same input value if it is 0⁺ or positive (but finite)
            ['round(down, 0, infinity)', 'calc(0)'],
            ['round(down, 1, infinity)', 'calc(0)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<mod()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'mod(1, 1px)'],
            ['<number> | <percentage>', 'mod(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'mod(1, (1% + 1px) / 1px)'],
            ['<length>', 'mod(1px, 1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Identical units
            ['<number>', 'mod(3, 2)', 'calc(1)'],
            ['<number>', 'mod(3, -2)', 'calc(-1)'],
            ['<number>', 'mod(-3, 2)', 'calc(1)'],
            ['<length>', 'MOD(3em, 2em)', 'mod(3em, 2em)'],
            ['<length-percentage>', 'mod(3%, 2%)'],
            ['<percentage>', 'mod(3%, 2%)', 'calc(1%)'],
            // Different units
            ['<length>', 'mod(1in, 5px)', 'calc(1px)'],
            ['<length>', 'mod(1em, 1px)'],
            ['<length-percentage>', 'mod(1px, mod(1%, 1%))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid resulting to NaN or Infinity', () => {
        const valid = [
            // 0 as modulus value results to NaN
            ['mod(1, 0)', 'calc(NaN)'],
            // An infinite input value results to NaN
            ['mod(1 / 0, 1)', 'calc(NaN)'],
            // A positive infinite modulus value and a negative input value results to NaN (or the other way around)
            ['mod(1, -1 / 0)', 'calc(NaN)'],
            ['mod(-1, 1 / 0)', 'calc(NaN)'],
            // An infinite modulus value results to the input value as is (if it has the same sign that the input value)
            ['mod(-1, -infinity)', 'calc(-1)'],
            ['mod(1, infinity)', 'calc(1)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<rem()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'rem(1, 1px)'],
            ['<number> | <percentage>', 'rem(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'rem(1, (1% + 1px) / 1px)'],
            ['<length>', 'rem(1px, 1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Identical units
            ['<number>', 'rem(3, 2)', 'calc(1)'],
            ['<number>', 'rem(3, -2)', 'calc(1)'],
            ['<number>', 'rem(-3, 2)', 'calc(-1)'],
            ['<length>', 'REM(3em, 2em)', 'rem(3em, 2em)'],
            ['<length-percentage>', 'rem(3%, 2%)'],
            ['<percentage>', 'rem(3%, 2%)', 'calc(1%)'],
            // Different units
            ['<length>', 'rem(1in, 5px)', 'calc(1px)'],
            ['<length>', 'rem(1em, 1px)'],
            ['<length-percentage>', 'rem(1px, rem(1%, 1%))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid resulting to NaN or Infinity', () => {
        const valid = [
            // 0 as divisor value results to NaN
            ['rem(1, 0)', 'calc(NaN)'],
            // An infinite input value results to NaN
            ['rem(1 / 0, 1)', 'calc(NaN)'],
            // An infinite modulus value results to the input value as is
            ['rem(1, infinity)', 'calc(1)'],
            ['rem(1, -infinity)', 'calc(1)'],
            ['rem(-1, -infinity)', 'calc(-1)'],
            ['rem(-1, infinity)', 'calc(-1)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<sin()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<number> | <length>', 'sin(1px)'],
            ['<number> | <percentage>', 'sin(1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'sin((1% + 1px) / 1px)'],
            ['<angle>', 'calc(sin(1% + 1deg) * 1deg)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            ['<number>', 'sin(45)', `calc(${+Math.sin(45).toFixed(6)})`],
            ['<number>', 'sin(45deg)', `calc(${+Math.sin(toRadians(45)).toFixed(6)})`],
            ['<angle-percentage>', 'calc(1deg * SIN(1%))', 'calc(1deg * sin(1%))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid resulting to 0⁻', () => {
        // 0⁻ as input value results as is
        expect(parse('<number>', 'calc(1 / sin(-0))')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(1 / sin(0 * -1))')).toBe('calc(-infinity)')
    })
})
describe('<cos()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<number> | <length>', 'cos(1px)'],
            ['<number> | <percentage>', 'cos(1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'cos((1% + 1px) / 1px)'],
            ['<angle>', 'calc(cos(1% + 1deg) * 1deg)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            ['<number>', 'cos(45)', `calc(${+Math.cos(45).toFixed(6)})`],
            ['<number>', 'cos(45deg)', `calc(${+Math.cos(toRadians(45)).toFixed(6)})`],
            ['<angle-percentage>', 'calc(1deg * COS(1%))', 'calc(1deg * cos(1%))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<tan()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<number> | <length>', 'tan(1px)'],
            ['<number> | <percentage>', 'tan(1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'tan((1% + 1px) / 1px)'],
            ['<angle>', 'calc(tan(1% + 1deg) * 1deg)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            ['<number>', 'tan(45)', `calc(${+Math.tan(45).toFixed(6)})`],
            ['<number>', 'tan(45deg)', `calc(${+Math.tan(toRadians(45)).toFixed(6)})`],
            ['<angle-percentage>', 'calc(1deg * TAN(1%))', 'calc(1deg * tan(1%))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
    test('valid resulting to 0⁻, Infinity, or -Infinity', () => {
        const valid = [
            // 0⁻ as input value results as is
            ['calc(1 / tan(-0))', 'calc(infinity)'],
            ['calc(1 / tan(-1 * 0))', 'calc(-infinity)'],
            // An asymptote as input value results to Infinity or -Infinity
            ['tan(90deg)', 'calc(infinity)'],
            ['tan(-270deg)', 'calc(infinity)'],
            ['tan(450deg)', 'calc(infinity)'],
            ['tan(-90deg)', 'calc(-infinity)'],
            ['tan(270deg)', 'calc(-infinity)'],
            ['tan(-450deg)', 'calc(-infinity)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<asin()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<angle>', 'asin(1deg)'],
            ['<angle-percentage>', 'asin(1%)'],
            ['<number> | <percentage>', 'calc(asin(1%) / 1deg)'],
            // Result type mismatch
            ['<number> | <percentage>', 'calc(asin((1% + 1px) / 1px) / 1deg)'],
            ['<angle>', 'asin((1% + 1deg) / 1deg)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        expect(parse('<angle>', 'asin(0.5)')).toBe('calc(30deg)')
        expect(parse('<angle-percentage>', 'ASIN(1% / 1deg)')).toBe('asin(1% / 1deg)')
    })
})
describe('<acos()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<angle>', 'acos(1deg)'],
            ['<angle-percentage>', 'acos(1%)'],
            ['<number> | <percentage>', 'calc(acos(1%) / 1deg)'],
            // Result type mismatch
            ['<number> | <percentage>', 'calc(acos((1% + 1px) / 1px) / 1deg)'],
            ['<angle>', 'acos((1% + 1deg) / 1deg)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        expect(parse('<angle>', 'acos(0.5)')).toBe('calc(60deg)')
        expect(parse('<angle-percentage>', 'ACOS(1% / 1deg)')).toBe('acos(1% / 1deg)')
    })
})
describe('<atan()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<angle>', 'atan(1deg)'],
            ['<angle-percentage>', 'atan(1%)'],
            ['<number> | <percentage>', 'calc(atan(1%) / 1deg)'],
            // Result type mismatch
            ['<number> | <percentage>', 'calc(atan((1% + 1px) / 1px) / 1deg)'],
            ['<angle>', 'atan((1% + 1deg) / 1deg)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        expect(parse('<angle>', 'atan(0.5)')).toBe(`calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`)
        expect(parse('<angle-percentage>', 'ATAN(1% / 1deg)')).toBe('atan(1% / 1deg)')
    })
})
describe('<atan2()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'calc(atan2(1, 1px) / 1deg)'],
            ['<number> | <percentage>', 'calc(atan2(1, 1%) / 1deg)'],
            // Result type mismatch
            ['<number> | <percentage>', 'calc(atan2(1, (1% + 1px) / 1px) / 1deg)'],
            ['<angle>', 'atan2(1deg, 1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            ['<angle>', 'atan2(1, 1)', `calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`],
            ['<angle>', 'atan2(1px, 1px)', `calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`],
            ['<length-percentage>', 'calc(ATAN2(1%, 1%) / 1deg * 1px)', 'calc(1px * atan2(1%, 1%) / 1deg)'],
            ['<angle>', 'atan2(1in, 100px)', `calc(${+toDegrees(Math.atan2(96, 100)).toFixed(6)}deg)`],
            ['<angle>', 'atan2(1em, 1px)', 'atan2(1em, 1px)'],
            ['<angle-percentage>', 'atan2(1deg, atan2(1%, 1%))', 'atan2(1deg, atan2(1%, 1%))'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<pow()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation types mismatch
            ['<number> | <length>', 'pow(1, 1px)'],
            ['<number> | <percentage>', 'pow(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'pow(1, (1% + 1px) / 1px)'],
            ['<length>', 'calc(1px * pow(1, (1% + 1px) / 1px))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        expect(parse('<number>', 'pow(4, 2)')).toBe('calc(16)')
        expect(parse('<length-percentage>', 'calc(1px * POW(1, 1% / 1px))')).toBe('calc(1px * pow(1, 1% / 1px))')
    })
})
describe('<sqrt()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<number> | <length>', 'sqrt(1px)'],
            ['<number> | <percentage>', 'sqrt(1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'sqrt((1% + 1px) / 1px)'],
            ['<length>', 'calc(1px * sqrt((1% + 1px) / 1px))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        expect(parse('<number>', 'sqrt(4)')).toBe('calc(2)')
        expect(parse('<length-percentage>', 'calc(1px * SQRT(1% / 1px))')).toBe('calc(1px * sqrt(1% / 1px))')
    })
})
describe('<hypot()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'hypot(1, 1px)'],
            ['<number> | <percentage>', 'hypot(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'hypot(1, (1% + 1px) / 1px)'],
            ['<length>', 'hypot(1px, 1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Identical units
            ['<number>', 'hypot(3, 4)', 'calc(5)'],
            ['<length>', 'HYPOT(1em, 2em)', 'hypot(1em, 2em)'],
            ['<length-percentage>', 'hypot(1%)'],
            ['<percentage>', 'hypot(3%, 4%)', 'calc(5%)'],
            // Different units
            ['<length>', 'hypot(1in, 72px)', 'calc(120px)'],
            ['<length>', 'hypot(1em, 1px)'],
            ['<length-percentage>', 'hypot(1px, hypot(1%))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<log()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation types mismatch
            ['<number> | <length>', 'log(1, 1px)'],
            ['<number> | <percentage>', 'log(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'log(1, (1% + 1px) / 1px)'],
            ['<length>', 'calc(log(1, 1px * (1% + 1px) / 1px))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            ['<number>', 'log(e)', 'calc(1)'],
            ['<number>', 'log(8, 2)', 'calc(3)'],
            ['<length-percentage>', 'calc(1px * LOG(1, 1% / 1px))', 'calc(1px * log(1, 1% / 1px))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<exp()>', () => {
    test('invalid', () => {
        const invalid = [
            // Calculation type mismatch
            ['<number> | <length>', 'exp(1px)'],
            ['<number> | <percentage>', 'exp(1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'exp((1% + 1px) / 1px)'],
            ['<length>', 'calc(1px * exp((1% + 1px) / 1px))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        expect(parse('<number>', 'exp(1)')).toBe(`calc(${Math.E.toFixed(6)})`)
        expect(parse('<length-percentage>', 'calc(1px * EXP(1% / 1px))')).toBe('calc(1px * exp(1% / 1px))')
    })
})
describe('<abs()>', () => {
    test('invalid', () => {
        expect(parse('<number> | <percentage>', 'abs((1% + 1px) / 1px)', false)).toBeNull()
        expect(parse('<length>', 'abs(1% + 1px)', false)).toBeNull()
    })
    test('valid', () => {
        const valid = [
            ['<number>', 'abs(-1)', 'calc(1)'],
            ['<number>', 'abs(-infinity)', 'calc(infinity)'],
            ['<length>', 'ABS(-1em)', 'abs(-1em)'],
            ['<length-percentage>', 'abs(abs(-1%))'],
            ['<percentage>', 'abs(-1%)', 'calc(1%)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<sign()>', () => {
    test('invalid', () => {
        expect(parse('<number> | <percentage>', 'sign((1% + 1px) / 1px)', false)).toBeNull()
        expect(parse('<length>', 'calc(1px * sign(1% + 1px))', false)).toBeNull()
    })
    test('valid', () => {
        const valid = [
            ['<number>', 'sign(-2)', 'calc(-1)'],
            ['<number>', 'sign(-infinity)', 'calc(-1)'],
            ['<number>', 'SIGN(-1em)', 'sign(-1em)'],
            ['<length-percentage>', 'calc(sign(-1%) * 1%)', 'calc(1% * sign(-1%))'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<progress()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'progress(1, 1px, 1)'],
            ['<number> | <percentage>', 'progress(1, 1%, 1)'],
            // Result type mismatch
            ['<number> | <percentage>', 'progress(1, (1% + 1px) / 1px, 1)'],
            ['<length>', 'calc(1px * progress(1%, 1px, 1px))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Identical units
            ['<number>', 'progress(1, 0, 2)', 'calc(0.5)'],
            ['<number>', 'progress(1, 2, 0)', 'calc(0.5)'],
            ['<number>', 'progress(-1, 0, 2)', 'calc(-0.5)'],
            ['<number>', 'PROGRESS(1em, 0em, 2em)', 'progress(1em, 0em, 2em)'],
            ['<length-percentage>', 'calc(1px * progress(1%, 0%, 2%))'],
            // Different units
            ['<number>', 'progress(48px, 0px, 1in)', 'calc(0.5)'],
            ['<length-percentage>', 'calc(1px * progress(1px, 0%, 2px))'],
            // Consistent type
            ['<number>', 'progress(1 * 1, 360deg / 1turn, 1em / 1px)', 'progress(1, 1, 1em / 1px)'],
            ['<length-percentage>', 'calc(1px * progress(1 * 1, 1% / 1%, 1em / 1px))', 'calc(1px * progress(1, 1% / 1%, 1em / 1px))'],
            // Equal argument values
            ['<number>', 'progress(1, 1, 1)', 'calc(0)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<calc-mix()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'calc-mix(1, 1px)'],
            ['<number> | <percentage>', 'calc-mix(1, 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'calc-mix(1, (1% + 1px) / 1px)'],
            ['<length>', 'calc-mix(1px, 1% + 1px)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false, styleRule)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            ['<length>', 'CALC-MIX(1px * 1, 1px)', 'calc-mix(1px, 1px)'],
            ['<length-percentage>', 'calc-mix(1px, 1%)'],
            ['<length-percentage>', 'calc(1px * calc-mix(1% / 1px, (1% + 1px) / 1px))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input, true, styleRule)).toBe(expected))
    })
})
describe('<calc-interpolate()>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid <progress-source> type
            ['<number> | <length>', 'calc-interpolate(1px, 0: 1)'],
            ['<length-percentage>', 'calc-interpolate(calc(1% / 1px), 0: 1px)'],
            ['<length-percentage>', 'calc-interpolate(calc((1% + 1px) / 1px), 0: 1px)'],
            ['<length-percentage>', 'calc-interpolate(progress(1%, 1px, 1px), 0: 1px)'],
            // Invalid <input-position> type
            ['<length-percentage>', 'calc-interpolate(0, calc(1% / 1px): 0px)'],
            ['<length-percentage>', 'calc-interpolate(0, calc((1% + 1px) / 1px): 0px)'],
            ['<length-percentage>', 'calc-interpolate(0, progress(1%, 1px, 1px): 0px)'],
            // Missing absolute <input-source> type
            ['<length>', 'calc-interpolate(1px, 0: 1px)'],
            // Inconsistent absolute <progress-source> and <input-position> types
            ['<length>', 'calc-interpolate(0deg, 0px: 1px, 1px: 1px)'],
            ['<length>', 'calc-interpolate(0px, 0deg: 1px, 1px: 1px)'],
            // Inconsistent calculation types
            ['<number> | <length>', 'calc-interpolate(0, 0: 1, 1: 1px)'],
            ['<number> | <percentage>', 'calc-interpolate(0, 0: 1, 1: 1%)'],
            // Result type mismatch
            ['<number> | <percentage>', 'calc-interpolate(0, 0: (1% + 1px) / 1px)'],
            ['<length>', 'calc-interpolate(0, 0: 1% + 1px)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false, styleRule)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            // Mixed <progress-source> and <input-position> types
            ['<number>', 'CALC-INTERPOLATE(--timeline, 0px: 1, 1%: 1)', 'calc-interpolate(--timeline, 0px: 1, 1%: 1)'],
            ['<number>', 'calc-interpolate(0, 0px: 1, 100%: 1)'],
            ['<number>', 'calc-interpolate(0%, 0px: 1, 1: 1)'],
            ['<number>', 'calc-interpolate(0px, 0px: 1, 1: 1)'],
            // Type checking <percentage> in nested <progress-source> or <input-position> contexts
            ['<number>', 'calc-interpolate(progress(0%, 0%, 1%), progress(0%, 0%, 1%): 1)'],
            ['<length-percentage>', 'calc-interpolate(progress(0%, 0%, 1%), progress(0%, 0%, 1%): 1px)'],
            ['<length-percentage>', 'calc-interpolate(0%, 0%: 1px)'],
            // Type checking and simplification of <calc-sum> and <calc-interpolate()>
            ['<length-percentage>', 'calc-interpolate(0%, 0: 1px * 1, 1: 1% + 1px)', 'calc-interpolate(0%, 0: 1px, 1: 1% + 1px)'],
            ['<length-percentage>', 'calc(1px * calc-interpolate(0%, 0: 1% / 1px, 1: (1% + 1px) / 1px))'],
            // Omitted component values
            ['<number>', 'calc-interpolate(0 by linear linear, 0: 1, linear, 1: 1)', 'calc-interpolate(0, 0: 1, 1: 1)'],
            // Implicit interpolation stop
            ['<number>', 'calc-interpolate(0, 0 1: 0)', 'calc-interpolate(0, 0: 0, 1: 0)'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input, true, styleRule)).toBe(expected))
    })
})
describe('<random()>', () => {
    test('invalid', () => {
        const invalid = [
            // Inconsistent calculation types
            ['<number> | <length>', 'random(1, 1px, 1)'],
            ['<number> | <percentage>', 'random(1, 1%, 1)'],
            // Result type mismatch
            ['<number> | <percentage>', 'random(1, (1% + 1px) / 1px, 1)'],
            ['<length>', 'random(1px, 1%, 1px)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false, styleRule)).toBeNull())
    })
    test('valid', () => {
        const valid = [
            ['<number>', 'RANDOM(auto, 1 / 1, 1em / 1px)', 'random(1, 1em / 1px)'],
            ['<length-percentage>', 'random(--key, 1px, 1%)'],
            ['<length-percentage>', 'calc(1px * random(1% / 1px, 1))'],
        ]
        valid.forEach(([definition, input, expected = input]) => expect(parse(definition, input, true, styleRule)).toBe(expected))
    })
})
describe('<sibling-count()>, <sibling-index()>', () => {
    test('valid', () => {
        expect(parse('<integer>', 'SIBLING-COUNT()', true, styleRule)).toBe('sibling-count()')
        expect(parse('<length>', 'calc(sibling-count() * 1px)', true, styleRule)).toBe('calc(1px * sibling-count())')
    })
})

describe('<alpha-value>', () => {
    test('representation', () => {
        expect(parse('<alpha-value>', '1', false)).toMatchObject(number(1, ['<alpha-value>']))
        expect(parse('<alpha-value>', '1%', false)).toMatchObject(percentage(1, ['<alpha-value>']))
    })
    test('valid', () => {
        expect(parse('<alpha-value>', '50%')).toBe('0.5')
    })
})
describe('<an+b>', () => {
    test('invalid', () => {
        const invalid = [
            '+ n-1',
            '+ n- 1',
            '+ n -1',
            '+ n - 1',
        ]
        invalid.forEach(input => expect(parse('<an+b>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<an+b>', 'even', false)).toMatchObject({ types: ['<an+b>'], value: { a: 2, b: 0 } })
        expect(parse('<an+b>', '1n+1', false)).toMatchObject({ types: ['<an+b>'], value: { a: 1, b: 1 } })
    })
    test('valid', () => {
        const valid = [
            ['even', '2n'],
            ['odd', '2n+1'],
            ['1'],
            ['1n', 'n'],
            ['n'],
            ['+n', 'n'],
            ['-n'],
            ['1n-1', 'n-1'],
            ['n-1'],
            ['+n-1', 'n-1'],
            ['-n-1'],
            ['1n -1', 'n-1'],
            ['n -1', 'n-1'],
            ['+n -1', 'n-1'],
            ['-n -1', '-n-1'],
            ['1n -1', 'n-1'],
            ['n- 1', 'n-1'],
            ['+n- 1', 'n-1'],
            ['-n- 1', '-n-1'],
            ['1n - 1', 'n-1'],
            ['1n - 1', 'n-1'],
            ['1n + 1', 'n+1'],
            ['n - 1', 'n-1'],
            ['n + 1', 'n+1'],
            ['+n - 1', 'n-1'],
            ['+n + 1', 'n+1'],
            ['-n - 1', '-n-1'],
            ['-n + 1', '-n+1'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<an+b>', input)).toBe(expected))
    })
})
describe('<animateable-feature>', () => {
    test('invalid', () => {
        const invalid = [
            'ALL',
            'auto',
            'none',
            'will-change',
        ]
        invalid.forEach(input => expect(parse('<animateable-feature>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<animateable-feature>', 'contents', false))
            .toMatchObject(keyword('contents', ['<animateable-feature>']))
    })
})
describe('<arc-command>', () => {
    test('representation', () => {

        const arc = keyword('arc')
        const by = keyword('by')
        const zero = length(0, 'px', ['<length-percentage>'])
        const coordinate = list([zero, zero], ' ', ['<coordinate-pair>'])
        const of = keyword('of')
        const radii = list([zero])
        const endpoint = list([by, coordinate], ' ', ['<command-end-point>'])
        const parameters = list([list([of, radii]), omitted, omitted, omitted])
        const command = list([arc, endpoint, parameters], ' ', ['<arc-command>'])

        expect(parse('<arc-command>', 'arc by 0px 0px of 0px', false)).toMatchObject(command)
    })
    test('valid', () => {
        expect(parse('<arc-command>', 'arc by 0px 0px of 0px 0px ccw small rotate 0deg')).toBe('arc by 0px 0px of 0px')
    })
})
describe('<attr()>', () => {
    test('representation', () => {
        const name = list([omitted, identToken('name')], '', ['<attr-name>'])
        expect(parse('<attr()>', 'attr(name)', false)).toMatchObject({
            name: 'attr',
            types: ['<function>', '<attr()>'],
            value: list([name, omitted, omitted, omitted]),
        })
    })
    test('valid', () => {
        expect(parse('<attr()>', 'attr(name raw-string)')).toBe('attr(name raw-string)')
        expect(parse('<attr()>', 'attr(name raw-string, "")')).toBe('attr(name)')
    })
})
describe('<attr-matcher>', () => {
    test('invalid', () => {
        expect(parse('<attr-matcher>', '~ =', false)).toBeNull()
    })
    test('representation', () => {
        const matcher = list([omitted, delimiter('=')], '', ['<attr-matcher>'])
        expect(parse('<attr-matcher>', '=', false)).toMatchObject(matcher)
    })
})
describe('<attr-name>', () => {
    test('invalid', () => {
        expect(parse('<attr-name>', 'prefix |name', false)).toBeNull()
        expect(parse('<attr-name>', 'prefix| name', false)).toBeNull()
    })
    test('representation', () => {
        const name = list([omitted, identToken('name')], '', ['<attr-name>'])
        expect(parse('<attr-name>', 'name', false)).toMatchObject(name)
    })
})
describe('<baseline-position>', () => {
    test('representation', () => {
        expect(parse('<baseline-position>', 'baseline', false))
            .toMatchObject(list([omitted, keyword('baseline')], ' ', ['<baseline-position>']))
    })
    test('valid', () => {
        expect(parse('<baseline-position>', 'first baseline')).toBe('baseline')
    })
})
describe('<basic-shape>', () => {
    test('invalid', () => {
        const invalid = [
            'circle(1px 1px)',
            'circle(1% 1%)',
            'circle(closest-side closest-side)',
        ]
        invalid.forEach(input => expect(parse('<basic-shape>', input, false)).toBeNull())
    })
    test('representation', () => {
        const px = length(1, 'px', ['<length-percentage>'])
        const valid = [
            ['circle()', {
                name: 'circle',
                types: ['<function>', '<circle()>', '<basic-shape>'],
                value: list([omitted, omitted]),
            }],
            ['ellipse()', {
                name: 'ellipse',
                types: ['<function>', '<ellipse()>', '<basic-shape>'],
                value: list([omitted, omitted]),
            }],
            ['inset(1px)', {
                name: 'inset',
                types: ['<function>', '<inset()>', '<basic-shape-rect>', '<basic-shape>'],
                value: list([list([px]), omitted]),
            }],
            ['path("m 1 0 v 1")', {
                name: 'path',
                types: ['<function>', '<path()>', '<basic-shape>'],
                value: list([omitted, omitted, string('m 1 0 v 1')]),
            }],
            ['polygon(1px 1px)', {
                name: 'polygon',
                types: ['<function>', '<polygon()>', '<basic-shape>'],
                value: list([omitted, omitted, omitted, list([list([px, px])], ',')]),
            }],
            ['rect(1px 1px 1px 1px)', {
                name: 'rect',
                types: ['<function>', '<rect()>', '<basic-shape-rect>', '<basic-shape>'],
                value: list([list([px, px, px, px]), omitted]),
            }],
            ['xywh(1px 1px 1px 1px)', {
                name: 'xywh',
                types: ['<function>', '<xywh()>', '<basic-shape-rect>', '<basic-shape>'],
                value: list([list([px, px]), list([px, px]), omitted]),
            }],
        ]
        valid.forEach(([input, expected]) => expect(parse('<basic-shape>', input, false)).toMatchObject(expected))
    })
    test('valid', () => {
        const valid = [
            ['circle(closest-side)', 'circle()'],
            ['circle(at center)', 'circle()'],
            ['circle(at center center)', 'circle()'],
            ['ellipse(1px 1px)', 'ellipse(1px)'],
            ['ellipse(closest-side closest-side)', 'ellipse()'],
            ['ellipse(farthest-side farthest-side)', 'ellipse(farthest-side)'],
            ['ellipse(at center)', 'ellipse()'],
            ['ellipse(at center center)', 'ellipse()'],
            ['inset(1px 1px 1px 1px round 1px / 1px)', 'inset(1px round 1px)'],
            ['inset(1px round 0px / 0px)', 'inset(1px)'],
            ['inset(1px round 0in)'],
            ['path(nonzero, "M0 0")', 'path("M0 0")'],
            ['polygon(nonzero, 1px 1px)', 'polygon(1px 1px)'],
            ['rect(1px 1px 1px 1px round 1px / 1px)', 'rect(1px 1px 1px 1px round 1px)'],
            ['rect(1px 1px 1px 1px round 0px / 0px)', 'rect(1px 1px 1px 1px)'],
            ['rect(1px 1px 1px 1px round 0in)'],
            ['xywh(1px 1px 1px 1px round 1px / 1px)', 'xywh(1px 1px 1px 1px round 1px)'],
            ['xywh(1px 1px 1px 1px round 0px / 0px)', 'xywh(1px 1px 1px 1px)'],
            ['xywh(1px 1px 1px 1px round 0in)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<basic-shape>', input)).toBe(expected))
    })
})
describe('<boolean-expr>', () => {
    test('invalid', () => {
        expect(parse('<boolean-expr[<number>]>', '1px', false)).toBeNull()
    })
    test('representation', () => {
        const test = number(1, ['<test>', '<boolean-expr-group>'])
        const expression = list([test, list()], ' ', ['<boolean-expr>'])
        expect(parse('<boolean-expr[<number>]>', '1', false)).toMatchObject(expression)
    })
})
describe('<blur()>', () => {
    test('representation', () => {
        expect(parse('<blur()>', 'blur()', false)).toMatchObject({
            name: 'blur',
            types: ['<function>', '<blur()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        expect(parse('<blur()>', 'blur(0)')).toBe('blur()')
        expect(parse('<blur()>', 'blur(0px)')).toBe('blur()')
    })
})
describe('<brightness()>, <contrast()>, <grayscale()>, <invert()>, <opacity()>, <saturate()>, <sepia()>', () => {
    test('representation', () => {
        expect(parse('<brightness()>', 'brightness()', false)).toMatchObject({
            name: 'brightness',
            types: ['<function>', '<brightness()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        expect(parse('<brightness()>', 'brightness(1)')).toBe('brightness()')
    })
})
describe('<calc-size()>', () => {

    let context = createContext(styleRule)
    context = {
        ...context,
        context,
        definition: {
            name: 'width',
            type: 'declaration',
            value: properties.width.value,
        },
    }

    test('invalid', () => {
        const invalid = [
            // Invalid basis
            'calc-size(none)',
            'calc-size(1, 1px)',
            // Invalid calculation
            'calc-size(any, size)',
            'calc-size(1px, 1)',
        ]
        invalid.forEach(input => expect(parse('<calc-size()>', input, false, context)).toBeNull())
    })
    test('representation', () => {
        const any = keyword('any', ['<calc-size-basis>'])
        const px = dimension(1, 'px', ['<calc-value>'])
        expect(parse('<calc-size()>', 'calc-size(any, 1px)', false, context)).toMatchObject({
            name: 'calc-size',
            types: ['<function>', '<calc-size()>'],
            value: list([any, comma, px]),
        })
    })
    test('valid', () => {
        expect(parse('<calc-size()>', 'CALC-SIZE(auto, 1 * 1% + 1px + size)', true, context))
            .toBe('calc-size(auto, 1% + 1px + size)')
    })
})
describe('<color>', () => {
    test('invalid', () => {
        const invalid = [
            // <hex-color>
            '#ffz',
            '#1',
            '#12',
            '#12345',
            '#1234567',
            '#123456789',
            // Relative color
            'rgb(r 0 0)',
            'rgb(r, 0, 0)',
            'rgb(0, 0, 0, alpha)',
            'rgb(from red x 0 0)',
            'rgb(from red calc(r + 1%) g b)',
            'color(from red srgb x g b)',
            'color(from red xyz r g b)',
        ]
        invalid.forEach(input => expect(parse('<color>', input, false)).toBeNull())
    })
    test('representation', () => {
        const zero = number(0)
        const rgb = list([list([zero, zero, zero], ','), omitted, omitted])
        const valid = [
            ['red', keyword('red', ['<named-color>', '<color-base>', '<color>'])],
            ['#000', hash('000', ['<hex-color>', '<color-base>', '<color>'])],
            ['rgb(0, 0, 0)', {
                name: 'rgb',
                types: ['<function>', '<legacy-rgb-syntax>', '<rgb()>', '<color-function>', '<color-base>', '<color>'],
                value: rgb,
            }],
            ['rgba(0, 0, 0)', {
                name: 'rgba',
                types: ['<function>', '<legacy-rgba-syntax>', '<rgba()>', '<color-function>', '<color-base>', '<color>'],
                value: rgb,
            }],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input, false)).toMatchObject(expected))
    })
    test('valid <hex-color>', () => {
        const valid = [
            ['#F00', 'rgb(255, 0, 0)'],
            ['#0f0f', 'rgb(0, 255, 0)'],
            ['#0f06', 'rgba(0, 255, 0, 0.4)'],
            ['#0000ff', 'rgb(0, 0, 255)'],
            ['#ff00ffff', 'rgb(255, 0, 255)'],
            ['#ff00ff66', 'rgba(255, 0, 255, 0.4)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <rgb()> or <rgba()>', () => {
        const valid = [
            // To legacy <rgb()> or <rgba()> depending on <alpha-value>
            ['rgb(0 0 0)', 'rgb(0, 0, 0)'],
            ['rgb(0 0 0 / 0)', 'rgba(0, 0, 0, 0)'],
            ['rgb(0 0 0 / 1)', 'rgb(0, 0, 0)'],
            ['rgba(0 0 0)', 'rgb(0, 0, 0)'],
            ['rgba(0 0 0 / 0)', 'rgba(0, 0, 0, 0)'],
            ['rgba(0 0 0 / 1)', 'rgb(0, 0, 0)'],
            // From legacy color syntax
            ['rgb(0, 0, 0)'],
            ['rgb(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)'],
            ['rgb(0, 0, 0, 1)', 'rgb(0, 0, 0)'],
            ['rgba(0, 0, 0)', 'rgb(0, 0, 0)'],
            ['rgba(0, 0, 0, 0)'],
            ['rgba(0, 0, 0, 1)', 'rgb(0, 0, 0)'],
            // Out of range arguments
            ['rgb(-1 0 0 / -1)', 'rgba(0, 0, 0, 0)'],
            ['rgb(256 0 0 / 2)', 'rgb(255, 0, 0)'],
            ['rgb(calc(-infinity) calc(-infinity) calc(infinity))', 'rgb(0, 0, 255)'],
            ['rgb(calc(infinity) calc(infinity) calc(-infinity))', 'rgb(255, 255, 0)'],
            // Map <percentage> to <number>
            ['rgb(-1% 0% 0% / -1%)', 'rgba(0, 0, 0, 0)'],
            ['rgb(101% 100% 100% / 101%)', 'rgb(255, 255, 255)'],
            // Map `none` to `0`
            ['rgb(none 0 0 / none)', 'rgba(0, 0, 0, 0)'],
            ['rgb(none 0% 0%)', 'rgb(0, 0, 0)'],
            // Precision (at least 8 bit integers)
            ['rgb(127.499 0 0 / 0.498)', 'rgba(127, 0, 0, 0.498)'],
            ['rgb(127.501 0 0 / 0.499)', 'rgba(128, 0, 0, 0.498)'],
            ['rgb(0 0 0 / 0.501)', 'rgba(0, 0, 0, 0.5)'],
            ['rgb(49.9% 50.1% 0% / 49.9%)', 'rgba(127, 128, 0, 0.498)'],
            ['rgb(0.501 0.499 0 / 50.1%)', 'rgba(1, 0, 0, 0.5)'],
            // Numeric substitution function
            ['rgb(calc(-1) 0 0 / calc(-1))', 'rgba(0, 0, 0, 0)'],
            ['rgb(calc(256) 0 0 / calc(2))', 'rgb(255, 0, 0)'],
            ['rgb(calc(-1%) 0% 0% / calc(-1%))', 'rgba(0, 0, 0, 0)'],
            ['rgb(calc(101%) 0% 0% / calc(101%))', 'rgb(255, 0, 0)'],
            ['rgba(-1 calc(1em / 1px) 101% / 1)', 'rgb(0 calc(1em / 1px) 255)'],
            ['rgb(calc(1) sibling-count() progress(1, 0, 2))', 'rgb(1 sibling-count() 0.5)'],
            // Relative color
            ['rgb(from green alpha calc(r) calc(g * 1%) / calc(b + 1 + 1))', 'rgb(from green alpha calc(r) calc(1% * g) / calc(2 + b))'],
            ['rgba(from rgba(-1 256 0 / -1) -100% 200% 0% / 101%)', 'rgb(from rgb(-1 256 0 / 0) -255 510 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input, true, styleRule)).toBe(expected))
    })
    test('valid <hsl()> or <hsla()>', () => {
        const valid = [
            // To legacy <rgb()> or <rgba()> depending on <alpha-value>
            ['hsl(0 0 0)', 'rgb(0, 0, 0)'],
            ['hsl(0 0 0 / 0)', 'rgba(0, 0, 0, 0)'],
            ['hsl(0 0 0 / 1)', 'rgb(0, 0, 0)'],
            ['hsla(0 0 0)', 'rgb(0, 0, 0)'],
            ['hsla(0 0 0 / 0)', 'rgba(0, 0, 0, 0)'],
            ['hsla(0 0 0 / 1)', 'rgb(0, 0, 0)'],
            // From legacy color syntax
            ['hsl(0, 0%, 0%)', 'rgb(0, 0, 0)'],
            ['hsl(0, 0%, 0%, 0)', 'rgba(0, 0, 0, 0)'],
            ['hsl(0, 0%, 0%, 100%)', 'rgb(0, 0, 0)'],
            ['hsla(0, 0%, 0%)', 'rgb(0, 0, 0)'],
            ['hsla(0, 0%, 0%, 0%)', 'rgba(0, 0, 0, 0)'],
            ['hsla(0, 0%, 0%, 1)', 'rgb(0, 0, 0)'],
            // Out of range arguments
            ['hsl(-540 -1 50 / -1)', 'rgba(128, 128, 128, 0)'],
            ['hsl(540 101 50 / 2)', 'rgb(0, 255, 255)'],
            ['hsl(0 0 -1)', 'rgb(0, 0, 0)'],
            ['hsl(0 0 101)', 'rgb(255, 255, 255)'],
            ['hsl(calc(-infinity) calc(-infinity) calc(infinity))', 'rgb(255, 255, 255)'],
            ['hsl(calc(infinity) calc(infinity) calc(-infinity))', 'rgb(0, 0, 0)'],
            // Map <angle> and <percentage> to <number>
            ['hsl(-1.5turn -1% 50% / -1%)', 'rgba(128, 128, 128, 0)'],
            ['hsl(1.5turn 101% 50% / 101%)', 'rgb(0, 255, 255)'],
            ['hsl(0deg 0% -1%)', 'rgb(0, 0, 0)'],
            ['hsl(0deg 0% 101%)', 'rgb(255, 255, 255)'],
            // Map `none` to `0`
            ['hsl(none 100 50 / none)', 'rgba(255, 0, 0, 0)'],
            ['hsl(0 none none)', 'rgb(0, 0, 0)'],
            // Precision (at least 8 bit integers)
            ['hsl(0.498 100% 49.8% / 0.498)', 'rgba(254, 2, 0, 0.498)'],
            ['hsl(0.499 100% 49.9% / 0.499)', 'rgba(254, 2, 0, 0.498)'],
            ['hsl(0.501 100% 50.1% / 0.501)', 'rgba(255, 3, 1, 0.5)'],
            ['hsl(0 100% 50% / 49.9%)', 'rgba(255, 0, 0, 0.498)'],
            ['hsl(0 100% 50% / 50.1%)', 'rgba(255, 0, 0, 0.5)'],
            // Numeric substitution function
            ['hsl(calc(-540) calc(101%) calc(50%) / calc(-1))', 'rgba(0, 255, 255, 0)'],
            ['hsl(calc(540) 100% 50% / calc(2))', 'rgb(0, 255, 255)'],
            ['hsl(calc(-540deg) 100% 50% / calc(-1%))', 'rgba(0, 255, 255, 0)'],
            ['hsl(calc(540deg) 100% 50% / 101%)', 'rgb(0, 255, 255)'],
            ['hsla(-540 calc(1em / 1px) 101% / 1)', 'hsl(180 calc(1em / 1px) 100)'],
            ['hsl(calc(1) sibling-count() progress(1, 0, 2))', 'hsl(1 sibling-count() 0.5)'],
            // Relative color
            ['hsl(from green alpha calc(h) calc(s * 1%) / calc(l + 1 + 1))', 'hsl(from green alpha calc(h) calc(1% * s) / calc(2 + l))'],
            ['hsla(from hsla(540 -1 0 / -1) 540deg 101% 0% / 101%)', 'hsl(from hsl(180 -1 0 / 0) 180 101 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input, true, styleRule)).toBe(expected))
    })
    test('valid <hwb()>', () => {
        const valid = [
            // To legacy <rgb()> or <rgba()> depending on <alpha-value>
            ['hwb(0 0 0)', 'rgb(255, 0, 0)'],
            ['hwb(0 0 0 / 0)', 'rgba(255, 0, 0, 0)'],
            ['hwb(0 0 0 / 1)', 'rgb(255, 0, 0)'],
            // Out of range arguments
            ['hwb(-540 0 0 / -1)', 'rgba(0, 255, 255, 0)'],
            ['hwb(540 0 0 / 2)', 'rgb(0, 255, 255)'],
            ['hwb(0 -1 100)', 'rgb(0, 0, 0)'],
            ['hwb(0 100 -1)', 'rgb(255, 255, 255)'],
            ['hwb(0 1000 1)', 'rgb(252, 252, 252)'],
            ['hwb(0 1 1000)', 'rgb(3, 3, 3)'],
            ['hwb(calc(-infinity) calc(-infinity) calc(infinity))', 'rgb(0, 0, 0)'],
            ['hwb(calc(infinity) calc(infinity) calc(-infinity))', 'rgb(255, 255, 255)'],
            ['hwb(0 calc(infinity) calc(infinity))', 'rgb(128, 128, 128)'],
            // Map <angle> and <percentage> to <number>
            ['hwb(-1.5turn 0% 0% / -1%)', 'rgba(0, 255, 255, 0)'],
            ['hwb(-1.5turn 0% 0% / 101%)', 'rgb(0, 255, 255)'],
            ['hwb(0 -1% 100%)', 'rgb(0, 0, 0)'],
            ['hwb(0 100% -1%)', 'rgb(255, 255, 255)'],
            ['hwb(0 1000% -1%)', 'rgb(255, 255, 255)'],
            ['hwb(0 1% 1000%)', 'rgb(3, 3, 3)'],
            // Map `none` to `0`
            ['hwb(none none none / none)', 'rgba(255, 0, 0, 0)'],
            ['hwb(0 none none)', 'rgb(255, 0, 0)'],
            // Precision (at least 8 bit integers)
            ['hwb(0.498 0% 49.8% / 0.498)', 'rgba(128, 1, 0, 0.498)'],
            ['hwb(0.499 0% 49.9% / 0.499)', 'rgba(128, 1, 0, 0.498)'],
            ['hwb(0.501 0% 50.1% / 0.501)', 'rgba(127, 1, 0, 0.5)'],
            ['hwb(0 0% 0% / 49.8%)', 'rgba(255, 0, 0, 0.498)'],
            ['hwb(0 0% 0% / 49.9%)', 'rgba(255, 0, 0, 0.498)'],
            ['hwb(0 0% 0% / 50.1%)', 'rgba(255, 0, 0, 0.5)'],
            // Numeric substitution functions
            ['hwb(calc(-540) calc(0%) calc(0%) / calc(-1))', 'rgba(0, 255, 255, 0)'],
            ['hwb(calc(540) 0% 0% / calc(2))', 'rgb(0, 255, 255)'],
            ['hwb(calc(-540deg) 0% 0% / calc(-1%))', 'rgba(0, 255, 255, 0)'],
            ['hwb(calc(540deg) 0% 0% / calc(101%))', 'rgb(0, 255, 255)'],
            ['hwb(-540 calc(1em / 1px) 101% / 1)', 'hwb(180 calc(1em / 1px) 100)'],
            ['hwb(calc(1) sibling-count() progress(1, 0, 2))', 'hwb(1 sibling-count() 0.5)'],
            // Relative color
            ['hwb(from green alpha calc(h) calc(w * 1%) / calc(b + 1 + 1))', 'hwb(from green alpha calc(h) calc(1% * w) / calc(2 + b))'],
            ['hwb(from hwb(540 -1 0 / -1) 540deg -1% 0% / 101%)', 'hwb(from hwb(180 -1 0 / 0) 180 -1 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input, true, styleRule)).toBe(expected))
    })
    test('valid <lab()>', () => {
        const valid = [
            // Out of range arguments
            ['lab(-1 -126 0 / -1)', 'lab(0 -126 0 / 0)'],
            ['lab(101 126 0 / 2)', 'lab(100 126 0)'],
            // Map <percentage> to <number>
            ['lab(-1% -101% 0% / -1%)', 'lab(0 -126.25 0 / 0)'],
            ['lab(101% 101% 0% / 101%)', 'lab(100 126.25 0)'],
            // Preserve `none`
            ['lab(none none none / none)', 'lab(none none none / none)'],
            // Precision (at least 16 bits)
            ['lab(0.0000001 0.0000001 0 / 0.499)', 'lab(0 0 0 / 0.498)'],
            ['lab(0.00000051 0.00000051 0 / 0.501)', 'lab(0.000001 0.000001 0 / 0.5)'],
            ['lab(0.0000001% 0.0000001% 0 / 49.9%)', 'lab(0 0 0 / 0.498)'],
            ['lab(0.00000051% 0.00000041% 0 / 50.1%)', 'lab(0.000001 0.000001 0 / 0.5)'],
            // Relative color
            ['lab(from green alpha calc(l) calc(a * 1%) / calc(b + 1 + 1))', 'lab(from green alpha calc(l) calc(1% * a) / calc(2 + b))'],
            ['lab(from lab(-1 0 0 / -1) 200% 100% 0% / 101%)', 'lab(from lab(-1 0 0 / 0) 200 125 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <lch()>', () => {
        const valid = [
            // Out of range arguments
            ['lch(-1 -1 -540 / -1)', 'lch(0 0 180 / 0)'],
            ['lch(101 151 540 / 2)', 'lch(100 151 180)'],
            // Map <angle> and <percentage> to <number>
            ['lch(-1% -1% -1.5turn / -1%)', 'lch(0 0 180 / 0)'],
            ['lch(101% 101% 1.5turn / 101%)', 'lch(100 151.5 180)'],
            // Preserve `none`
            ['lch(none none none / none)', 'lch(none none none / none)'],
            // Precision (at least 16 bits)
            ['lch(0.0000001 0.0000001 0.0000001 / 0.499)', 'lch(0 0 0 / 0.498)'],
            ['lch(0.00000051 0.00000051 0.00000051 / 0.501)', 'lch(0.000001 0.000001 0.000001 / 0.5)'],
            ['lch(0.0000001% 0.0000003% 0.0000001deg / 49.9%)', 'lch(0 0 0 / 0.498)'],
            ['lch(0.00000051% 0.00000041% 0.00000051deg / 50.1%)', 'lch(0.000001 0.000001 0.000001 / 0.5)'],
            // Relative color
            ['lch(from green alpha calc(l) calc(c * 1deg) / calc(h + 1 + 1))', 'lch(from green alpha calc(l) calc(1deg * c) / calc(2 + h))'],
            ['lch(from lch(-1 -1 540 / -1) 101% -100% 540deg / 101%)', 'lch(from lch(-1 -1 180 / 0) 101 -150 180)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <oklab()>', () => {
        const valid = [
            // Out of range arguments
            ['oklab(-1 -0.41 0 / -1)', 'oklab(0 -0.41 0 / 0)'],
            ['oklab(1.1 0.41 0 / 2)', 'oklab(1 0.41 0)'],
            // Map <percentage> to <number>
            ['oklab(-1% -101% 0 / -1%)', 'oklab(0 -0.404 0 / 0)'],
            ['oklab(101% 101% 0 / 101%)', 'oklab(1 0.404 0)'],
            // Preserve `none`
            ['oklab(none none none / none)', 'oklab(none none none / none)'],
            // Precision (at least 16 bits)
            ['oklab(0.0000001 0.0000001 0 / 0.499)', 'oklab(0 0 0 / 0.498)'],
            ['oklab(0.00000051 0.00000051 0 / 0.501)', 'oklab(0.000001 0.000001 0 / 0.5)'],
            ['oklab(0.00001% 0.0001% 0 / 49.9%)', 'oklab(0 0 0 / 0.498)'],
            ['oklab(0.00005% 0.00013% 0 / 50.1%)', 'oklab(0.000001 0.000001 0 / 0.5)'],
            // Relative color
            ['oklab(from green alpha calc(l) calc(a * 1%) / calc(b + 1 + 1))', 'oklab(from green alpha calc(l) calc(1% * a) / calc(2 + b))'],
            ['oklab(from oklab(-1 0 0 / -1) 200% 100% 0% / 101%)', 'oklab(from oklab(-1 0 0 / 0) 2 0.4 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <oklch()>', () => {
        const valid = [
            // Out of range arguments
            ['oklch(-1 -1 -540 / -1)', 'oklch(0 0 180 / 0)'],
            ['oklch(1.1 0.41 540 / 2)', 'oklch(1 0.41 180)'],
            // Map <angle> and <percentage> to <number>
            ['oklch(-1% -1% -1.5turn / -1%)', 'oklch(0 0 180 / 0)'],
            ['oklch(101% 101% 1.5turn / 101%)', 'oklch(1 0.404 180)'],
            // Preserve `none`
            ['oklch(none none none / none)', 'oklch(none none none / none)'],
            // Precision (at least 16 bits)
            ['oklch(0.0000001 0.0000001 0.0000001 / 0.499)', 'oklch(0 0 0 / 0.498)'],
            ['oklch(0.00000051 0.00000051 0.00000051 / 0.501)', 'oklch(0.000001 0.000001 0.000001 / 0.5)'],
            ['oklch(0.00001% 0.0001% 0.0000001deg / 49.9%)', 'oklch(0 0 0 / 0.498)'],
            ['oklch(0.00005% 0.00013% 0.00000051deg / 50.1%)', 'oklch(0.000001 0.000001 0.000001 / 0.5)'],
            // Relative color
            ['oklch(from green alpha calc(l) calc(c * 1deg) / calc(h + 1 + 1))', 'oklch(from green alpha calc(l) calc(1deg * c) / calc(2 + h))'],
            ['oklch(from oklch(-1 -1 540 / -1) 200% -100% 540deg / 101%)', 'oklch(from oklch(-1 -1 180 / 0) 2 -0.4 180)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <color()>', () => {
        const valid = [
            // Explicit `xyz` color space
            ['color(xyz 0 0 0)', 'color(xyz-d65 0 0 0)'],
            // Out of range arguments
            ['color(srgb -1 -1 -1 / -1)', 'color(srgb -1 -1 -1 / 0)'],
            ['color(srgb 1.1 1.1 1.1 / 2)', 'color(srgb 1.1 1.1 1.1)'],
            // Map <percentage> to <number>
            ['color(srgb -1% -1% -1% / -1%)', 'color(srgb -0.01 -0.01 -0.01 / 0)'],
            ['color(srgb 101% 101% 101%)', 'color(srgb 1.01 1.01 1.01)'],
            // Preserve `none`
            ['color(srgb none none none / none)'],
            // Precision (at least 10 to 16 bits depending on the color space)
            ['color(srgb 0.0000001 0 0 / 0.499)', 'color(srgb 0 0 0 / 0.498)'],
            ['color(srgb 0.00000051 0 0 / 0.501)', 'color(srgb 0.000001 0 0 / 0.5)'],
            ['color(srgb 0.00001% 0 0 / 49.9%)', 'color(srgb 0 0 0 / 0.498)'],
            ['color(srgb 0.00005% 0 0 / 50.1%)', 'color(srgb 0.000001 0 0 / 0.5)'],
            // Relative color
            ['color(from green srgb alpha calc(r) calc(g * 1%) / calc(b + 1 + 1))', 'color(from green srgb alpha calc(r) calc(1% * g) / calc(2 + b))'],
            ['color(from green xyz-d65 calc(alpha) calc(x) y / z)'],
            ['color(from green --profile calc(alpha) calc(channel-identifier))'],
            ['color(from color(srgb -1 2 0 / -1) srgb -100% 200% 0% / 101%)', 'color(from color(srgb -1 2 0 / 0) srgb -1 2 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <device-cmyk()>', () => {
        const valid = [
            // From legacy color syntax
            ['device-cmyk(0, 0, 0, 0)', 'device-cmyk(0 0 0 0)'],
            // Out of range arguments
            ['device-cmyk(-1 -1 -1 -1 / -1)', 'device-cmyk(-1 -1 -1 -1 / 0)'],
            ['device-cmyk(1.1 1.1 1.1 1.1 / 2)', 'device-cmyk(1.1 1.1 1.1 1.1)'],
            // Map <percentage> to <number>
            ['device-cmyk(-1% -1% -1% -1% / -1%)', 'device-cmyk(-0.01 -0.01 -0.01 -0.01 / 0)'],
            ['device-cmyk(101% 101% 101% 101% / 101%)', 'device-cmyk(1.01 1.01 1.01 1.01)'],
            // Preserve `none`
            ['device-cmyk(none none none none / none)'],
            // Precision (at least 8 bits)
            ['device-cmyk(0.0000001 0 0 0 / 0.499)', 'device-cmyk(0 0 0 0 / 0.498)'],
            ['device-cmyk(0.00000051 0 0 0 / 0.501)', 'device-cmyk(0.000001 0 0 0 / 0.5)'],
            ['device-cmyk(0.00001% 0 0 0 / 49.9%)', 'device-cmyk(0 0 0 0 / 0.498)'],
            ['device-cmyk(0.00005% 0 0 0 / 50.1%)', 'device-cmyk(0.000001 0 0 0 / 0.5)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <ictcp()>', () => {
        const valid = [
            // Out of range arguments
            ['ictcp(-1 -1 -1 / -1)', 'ictcp(-1 -1 -1 / 0)'],
            ['ictcp(2 1 1 / 2)', 'ictcp(2 1 1)'],
            // Map <percentage> to <number>
            ['ictcp(-1% -1% -1% / -1%)', 'ictcp(-0.01 -0.005 -0.005 / 0)'],
            ['ictcp(101% 101% 101% / 101%)', 'ictcp(1.01 0.505 0.505)'],
            // Preserve `none`
            ['ictcp(none none none / none)'],
            // Precision (at least 16 bits)
            ['ictcp(0.0000001 0 0 / 0.499)', 'ictcp(0 0 0 / 0.498)'],
            ['ictcp(0.00000051 0 0 / 0.501)', 'ictcp(0.000001 0 0 / 0.5)'],
            ['ictcp(0.00001% 0 0 / 49.9%)', 'ictcp(0 0 0 / 0.498)'],
            ['ictcp(0.00005% 0 0 / 50.1%)', 'ictcp(0.000001 0 0 / 0.5)'],
            // Relative color
            ['ictcp(from green alpha calc(i) calc(ct * 1%) / calc(cp + 1 + 1))', 'ictcp(from green alpha calc(i) calc(1% * ct) / calc(2 + cp))'],
            ['ictcp(from ictcp(-1 2 0 / -1) -100% 200% 0% / 101%)', 'ictcp(from ictcp(-1 2 0 / 0) -1 1 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <jzazbz()>', () => {
        const valid = [
            // Out of range arguments
            ['jzazbz(-1 -1 -1 / -1)', 'jzazbz(-1 -1 -1 / 0)'],
            ['jzazbz(2 1 1 / 2)', 'jzazbz(2 1 1)'],
            // Map <percentage> to <number>
            ['jzazbz(-1% -1% -1% / -1%)', 'jzazbz(-0.01 -0.0021 -0.0021 / 0)'],
            ['jzazbz(101% 101% 101% / 101%)', 'jzazbz(1.01 0.2121 0.2121)'],
            // Preserve `none`
            ['jzazbz(none none none / none)'],
            // Precision (at least 16 bits)
            ['jzazbz(0.0000001 0 0 / 0.499)', 'jzazbz(0 0 0 / 0.498)'],
            ['jzazbz(0.00000051 0 0 / 0.501)', 'jzazbz(0.000001 0 0 / 0.5)'],
            ['jzazbz(0.00001% 0 0 / 49.9%)', 'jzazbz(0 0 0 / 0.498)'],
            ['jzazbz(0.00005% 0 0 / 50.1%)', 'jzazbz(0.000001 0 0 / 0.5)'],
            // Relative color
            ['jzazbz(from green alpha calc(jz) calc(az * 1%) / calc(bz + 1 + 1))', 'jzazbz(from green alpha calc(jz) calc(1% * az) / calc(2 + bz))'],
            ['jzazbz(from jzazbz(-1 2 0 / -1) -100% 200% 0% / 101%)', 'jzazbz(from jzazbz(-1 2 0 / 0) -1 0.42 0)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <jzczhz()>', () => {
        const valid = [
            // Out of range arguments
            ['jzczhz(-1 -1 -540 / -1)', 'jzczhz(-1 -1 180 / 0)'],
            ['jzczhz(2 1 540 / 2)', 'jzczhz(2 1 180)'],
            // Map <percentage> to <number>
            ['jzczhz(-1% -1% -1.5turn / -1%)', 'jzczhz(-0.01 -0.0026 180 / 0)'],
            ['jzczhz(101% 101% 1.5turn / 101%)', 'jzczhz(1.01 0.2626 180)'],
            // Preserve `none`
            ['jzczhz(none none none / none)'],
            // Precision (at least 16 bits)
            ['jzczhz(0.0000001 0 0 / 0.499)', 'jzczhz(0 0 0 / 0.498)'],
            ['jzczhz(0.00000051 0 0 / 0.501)', 'jzczhz(0.000001 0 0 / 0.5)'],
            ['jzczhz(0.00001% 0 0 / 49.9%)', 'jzczhz(0 0 0 / 0.498)'],
            ['jzczhz(0.00005% 0 0 / 50.1%)', 'jzczhz(0.000001 0 0 / 0.5)'],
            // Relative color
            ['jzczhz(from green alpha calc(jz) calc(cz * 1deg) / calc(hz + 1 + 1))', 'jzczhz(from green alpha calc(jz) calc(1deg * cz) / calc(2 + hz))'],
            ['jzczhz(from jzczhz(-1 2 540 / -1) -100% 200% 540deg / 101%)', 'jzczhz(from jzczhz(-1 2 180 / 0) -1 0.52 180)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    test('valid <color-interpolate()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        expect(parse('<color>', 'color-interpolate(0, 0: rgba(-100% 200% 0 / 101%), 1: hsla(540deg -1% 0 / 50%))', true, styleRule))
            .toBe('color-interpolate(0, 0: rgb(-255 510 0), 1: hsl(180 -1 0 / 0.5))')
    })
    test('valid <color-mix()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        expect(parse('<color>', 'color-mix(in srgb, rgba(-100% 200% 0 / 101%), hsla(540deg -1% 0 / 50%))'))
            .toBe('color-mix(in srgb, rgb(-255 510 0), hsl(180 -1 0 / 0.5))')
    })
    test('valid <contrast-color()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        expect(parse('<color>', 'contrast-color(rgba(-100% 200% 0 / 101%))'))
            .toBe('contrast-color(rgb(-255 510 0))')
        expect(parse('<color>', 'contrast-color(hsla(540deg -1% 0 / 50%))'))
            .toBe('contrast-color(hsl(180 -1 0 / 0.5))')
    })
    test('valid <light-dark()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        expect(parse('<color>', 'light-dark(rgba(-100% 200% 0 / 101%), hsla(540deg -1% 0 / 50%))'))
            .toBe('light-dark(rgb(-255 510 0), hsl(180 -1 0 / 0.5))')
    })
})
describe('<combinator>', () => {
    test('invalid', () => {
        expect(parse('<combinator>', '| |', false)).toBeNull()
    })
    test('representation', () => {
        const pipe = delimiter('|')
        const combinator = list([pipe, pipe], '', ['<combinator>'])
        expect(parse('<combinator>', '||', false)).toMatchObject(combinator)
    })
})
describe('<container-name>', () => {
    test('invalid', () => {
        const invalid = [
            'AND',
            'none',
            'not',
            'or',
        ]
        invalid.forEach(input => expect(parse('<container-name>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<container-name>', 'name', false)).toMatchObject(customIdent('name', ['<container-name>']))
    })
})
describe('<content()>', () => {
    test('representation', () => {
        expect(parse('<content()>', 'content()', false)).toMatchObject({
            name: 'content',
            types: ['<function>', '<content()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        expect(parse('<content()>', 'content(text)')).toBe('content()')
    })
})
describe('<control-value()>', () => {
    test('representation', () => {
        expect(parse('<control-value()>', 'control-value()', false)).toMatchObject({
            name: 'control-value',
            types: ['<function>', '<control-value()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        expect(parse('<control-value()>', 'control-value(string)')).toBe('control-value()')
    })
})
describe('<counter>', () => {
    test('representation', () => {
        const name = customIdent('chapters', ['<counter-name>'])
        expect(parse('<counter>', 'counter(chapters)', false)).toMatchObject({
            name: 'counter',
            types: ['<function>', '<counter()>', '<counter>'],
            value: list([name, omitted, omitted]),
        })
        expect(parse('<counter>', 'counters(chapters, "-")', false)).toMatchObject({
            name: 'counters',
            types: ['<function>', '<counters()>', '<counter>'],
            value: list([name, comma, string('-'), omitted, omitted]),
        })
    })
    test('valid', () => {
        let context = createContext(styleRule)
        context = { ...context, context, definition: { name: 'any-property', type: 'declaration' } }
        expect(parse('<counter>', 'counter(chapters, decimal)', true, context)).toBe('counter(chapters)')
        expect(parse('<counter>', 'counters(chapters, "-", decimal)', true, context)).toBe('counters(chapters, "-")')
    })
})
describe('<counter-name>', () => {
    test('invalid', () => {
        expect(parse('<counter-name>', 'NONE', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<counter-name>', 'chapters', false)).toMatchObject(customIdent('chapters', ['<counter-name>']))
    })
})
describe('<counter-style-name>', () => {
    test('invalid', () => {
        expect(parse('<counter-style-name>', 'NONE', false)).toBeNull()
        expect(parse('<counter-style-name>', 'DECIMAL', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<counter-style-name>', 'custom', false))
            .toMatchObject(customIdent('custom', ['<counter-style-name>']))
    })
    test('valid', () => {
        let context = createContext(styleRule)
        context = { ...context, context, definition: { name: 'any-property', type: 'declaration' } }
        expect(parse('<counter-style-name>', 'DECIMAL', true, context)).toBe('decimal')
        expect(parse('<counter-style-name>', 'NAME')).toBe('NAME')
    })
})
describe('<custom-function-definition>', () => {
    test('invalid', () => {
        expect(parse('<custom-function-definition>', 'custom()', false)).toBeNull()
    })
    test('representation', () => {
        const nameAndParameters = {
            name: '--CUSTOM',
            types: ['<function>'],
            value: omitted,
        }
        const definition = list([nameAndParameters, omitted], ' ', ['<custom-function-definition>'])
        expect(parse('<custom-function-definition>', '--CUSTOM()', false)).toMatchObject(definition)
    })
    test('valid', () => {
        expect(parse('<custom-function-definition>', '--custom() returns type(*)')).toBe('--custom()')
    })
})
describe('<drop-shadow()>', () => {
    test('representation', () => {
        expect(parse('<drop-shadow()>', 'drop-shadow(1px 1px)', false)).toMatchObject({
            name: 'drop-shadow',
            types: ['<function>', '<drop-shadow()>'],
            value: list([omitted, list([length(1, 'px'), length(1, 'px')])]),
        })
    })
    test('valid', () => {
        expect(parse('<drop-shadow()>', 'drop-shadow(currentcolor 1px 1px 0px)')).toBe('drop-shadow(1px 1px)')
    })
})
describe('<family-name>', () => {
    test('invalid', () => {
        const invalid = [
            [
                [
                    [createContext(styleRule), 'font-family'],
                    [createContext('@font-face'), 'src'],
                    [createContext('@font-feature-values')],
                ],
                // <generic-family>, <system-family-name>
                ['SERIF', 'caption'],
            ],
            [
                [[createContext(styleRule), 'voice-family']],
                // <gender>, preserve
                ['MALE', 'preserve'],
            ],
        ]
        invalid.forEach(([contexts, inputs]) =>
            contexts.forEach(([context, name]) => {
                if (name) {
                    context = { ...context, context, definition: { name, type: 'declaration' } }
                }
                inputs.forEach(input => expect(parse('<family-name>', input, false, context)).toBeNull())
            }))
    })
    test('representation', () => {
        expect(parse('<family-name>', '"serif"', false))
            .toMatchObject(string('serif', ['<family-name>']))
        expect(parse('<family-name>', 'the serif', false))
            .toMatchObject(list([customIdent('the'), customIdent('serif')], ' ', ['<family-name>']))
    })
})
describe('<feature-tag-value>', () => {
    test('representation', () => {
        expect(parse('<feature-tag-value>', '"aaaa"', false))
            .toMatchObject(list([string('aaaa', ['<opentype-tag>']), omitted], ' ', ['<feature-tag-value>']))
    })
    test('valid', () => {
        expect(parse('<feature-tag-value>', '"aaaa" 1')).toBe('"aaaa"')
    })
})
describe('<font-format>', () => {
    test('invalid', () => {
        expect(parse('<font-format>', '"embedded-opentype"', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<font-format>', 'woff2', false)).toMatchObject(keyword('woff2', ['<font-format>']))
    })
    test('valid', () => {
        const valid = [
            '"collection"',
            '"opentype"',
            '"opentype-variations"',
            '"truetype"',
            '"truetype-variations"',
            '"woff"',
            '"woff-variations"',
            '"woff2"',
            '"woff2-variations"',
        ]
        valid.forEach(value => expect(parse('<font-format>', value)).toBe(value))
    })
})
describe('<function-parameter>', () => {
    test('invalid', () => {
        expect(parse('<function-parameter>', '--name <integer>: 1.5', false)).toBeNull()
    })
    test('representation', () => {
        const name = dashedIdent('--name', ['<custom-property-name>'])
        const declaration = list([name, omitted, omitted], ' ', ['<function-parameter>'])
        expect(parse('<function-parameter>', '--name', false)).toMatchObject(declaration)
    })
    test('valid', () => {
        expect(parse('<function-parameter>', '--name type(*)')).toBe('--name')
        expect(parse('<function-parameter>', '--name type(<number>)')).toBe('--name <number>')
    })
})
describe('<gradient>', () => {
    test('invalid', () => {
        expect(parse('<gradient>', 'radial-gradient(circle 1px 1px, red)', false)).toBeNull()
        expect(parse('<gradient>', 'radial-gradient(circle closest-side closest-side, red)', false)).toBeNull()
    })
    test('representation', () => {

        const red = keyword('red', ['<named-color>', '<color-base>', '<color>'])
        const angularStopList = list(
            [list([red, omitted], ' ', ['<angular-color-stop>']), omitted, omitted],
            ' ',
            ['<angular-color-stop-list>'],
        )
        const linearStopList = list(
            [list([red, omitted], ' ', ['<linear-color-stop>']), omitted, omitted],
            ' ',
            ['<color-stop-list>'])

        expect(parse('<gradient>', 'conic-gradient(red)', false)).toMatchObject({
            name: 'conic-gradient',
            types: ['<function>', '<conic-gradient()>', '<gradient>'],
            value: list(
                [
                    omitted,
                    omitted,
                    angularStopList,
                ],
                ' ',
                ['<conic-gradient-syntax>']),
        })
        expect(parse('<gradient>', 'linear-gradient(red)', false)).toMatchObject({
            name: 'linear-gradient',
            types: ['<function>', '<linear-gradient()>', '<gradient>'],
            value: list(
                [
                    omitted,
                    omitted,
                    linearStopList,
                ],
                ' ',
                ['<linear-gradient-syntax>']),
        })
        expect(parse('<gradient>', 'radial-gradient(red)', false)).toMatchObject({
            name: 'radial-gradient',
            types: ['<function>', '<radial-gradient()>', '<gradient>'],
            value: list(
                [
                    omitted,
                    omitted,
                    linearStopList,
                ],
                ' ',
                ['<radial-gradient-syntax>']),
        })
    })
    test('valid', () => {
        const valid = [
            // Simple
            ['conic-gradient(red)'],
            ['linear-gradient(red)'],
            ['radial-gradient(red)'],
            // Repeating
            ['repeating-conic-gradient(red)'],
            ['repeating-linear-gradient(red)'],
            ['repeating-radial-gradient(red)'],
            // Legacy alias
            ['-webkit-linear-gradient(red)', 'linear-gradient(red)'],
            ['-webkit-repeating-linear-gradient(red)', 'repeating-linear-gradient(red)'],
            ['-webkit-radial-gradient(red)', 'radial-gradient(red)'],
            ['-webkit-repeating-radial-gradient(red)', 'repeating-radial-gradient(red)'],
            // Omitted component values
            ['conic-gradient(from 0, red)', 'conic-gradient(red)'],
            ['conic-gradient(from 0deg, red)', 'conic-gradient(red)'],
            ['conic-gradient(at center, red)', 'conic-gradient(at center center, red)'],
            ['conic-gradient(at center center, red)'],
            ['conic-gradient(in oklab, red)', 'conic-gradient(red)'],
            ['linear-gradient(to bottom, red)', 'linear-gradient(red)'],
            ['linear-gradient(in oklab, red)', 'linear-gradient(red)'],
            ['radial-gradient(circle farthest-corner, red)', 'radial-gradient(circle, red)'],
            ['radial-gradient(circle 1px, red)', 'radial-gradient(1px, red)'],
            ['radial-gradient(circle farthest-side, red)'],
            ['radial-gradient(ellipse farthest-corner, red)', 'radial-gradient(red)'],
            ['radial-gradient(ellipse 1px 1px, red)', 'radial-gradient(1px, red)'],
            ['radial-gradient(ellipse farthest-side farthest-side, red)', 'radial-gradient(farthest-side, red)'],
            ['radial-gradient(at center, red)', 'radial-gradient(at center center, red)'],
            ['radial-gradient(at center center, red)'],
            ['radial-gradient(in oklab, red)', 'radial-gradient(red)'],
            // Implicit color stop
            ['conic-gradient(red 0deg 180deg)', 'conic-gradient(red 0deg, red 180deg)'],
            ['linear-gradient(red 0% 50%)', 'linear-gradient(red 0%, red 50%)'],
            ['radial-gradient(red 0% 50%)', 'radial-gradient(red 0%, red 50%)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<gradient>', input)).toBe(expected))
    })
})
describe('<grid-line>', () => {
    test('invalid', () => {
        const invalid = [
            'SPAN',
            '-1 SPAN',
            '-1 auto',
            'span AUTO',
        ]
        invalid.forEach(input => expect(parse('<grid-line>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<grid-line>', 'auto', false)).toMatchObject(keyword('auto', ['<grid-line>']))
    })
    test('valid', () => {
        expect(parse('<grid-line>', 'span 1')).toBe('span 1')
    })
})
describe('<hue-rotate()>', () => {
    test('representation', () => {
        expect(parse('<hue-rotate()>', 'hue-rotate()', false)).toMatchObject({
            name: 'hue-rotate',
            types: ['<function>', '<hue-rotate()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        expect(parse('<hue-rotate()>', 'hue-rotate(0)')).toBe('hue-rotate()')
        expect(parse('<hue-rotate()>', 'hue-rotate(0deg)')).toBe('hue-rotate()')
    })
})
describe('<id-selector>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '#1identifier',
            '#!identifier',
            '#-1identifier',
            '#-!identifier',
            '#--!identifier',
            // Invalid escape sequence (parse error)
            '#\\\n',
            '#-\\\n',
        ]
        invalid.forEach(input => expect(parse('<id-selector>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<id-selector>', '#identifier', false)).toMatchObject({
            type: 'id',
            types: ['<hash-token>', '<id-selector>'],
            value: 'identifier',
        })
    })
    test('valid', () => {
        const valid = [
            // Starts with identifier start code point
            ['#identifier'],
            ['#·identifier'],
            ['#_identifier'],
            // Starts with an escape sequence
            ['#\\', '#�'],
            ['#\\-'],
            ['#\\0', '#�'],
            ['#\\D800', '#�'],
            ['#\\110000', '#�'],
            ['#\\0000311', '#\\31 1'],
            ['#\\31 1'],
            ['#\\31\\31', '#\\31 1'],
            ['#\\Aidentifier', '#\\a identifier'],
            ['#\\69 dentifier', '#identifier'],
            ['#\\identifier', '#identifier'],
            ['#\\21identifier', '#\\!identifier'],
            ['#\\!identifier'],
            ['#\\A9identifier', '#\\©identifier'],
            ['#\\©identifier'],
            // Starts with - followed by - or identifier start code point
            ['#--'],
            ['#-identifier'],
            ['#-·identifier'],
            ['#-_identifier'],
            ['#-\\31identifier', '#-\\31 identifier'],
            // Only contains identifier code points and escape sequences
            ['#identifier·'],
            ['#identifier_'],
            ['#identifier1'],
            ['#identifier-'],
            ['#identifie\\r', '#identifier'],
            // Case-sensitive
            ['#IDENTIFIER'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<id-selector>', input)).toBe(expected))
    })
})
describe('<image-set()>', () => {
    test('invalid', () => {
        expect(parse('<image-set()>', 'image-set(image-set("image.jpg"))', false)).toBeNull()
        expect(parse('<image-set()>', 'image-set(cross-fade(image-set("image.jpg")))', false)).toBeNull()
    })
    test('representation', () => {

        const url = string('image.jpg')
        const option = list([url, omitted], ' ', ['<image-set-option>'])

        expect(parse('<image-set()>', 'image-set("image.jpg")', false)).toMatchObject({
            name: 'image-set',
            types: ['<function>', '<image-set()>'],
            value: list([option], ','),
        })
    })
    test('valid', () => {
        expect(parse('<image-set()>', 'image-set("image.jpg" 1x)')).toBe('image-set("image.jpg")')
        expect(parse('<image-set()>', '-webkit-image-set("image.jpg" 1x)')).toBe('image-set("image.jpg")')
    })
})
describe('<input-position>', () => {
    test('invalid', () => {
        expect(parse('<input-position>', 'calc((1% + 1px) / 1px)', false)).toBeNull()
        expect(parse('<input-position>', 'progress(1%, 1px, 1px)', false)).toBeNull()
    })
    test('representation', () => {
        const progress = percentage(50, ['<input-position>'])
        expect(parse('<input-position>', '50%', false)).toMatchObject(progress)
    })
    test('valid', () => {
        expect(parse('<input-position>', 'calc(100% / 2)')).toBe('calc(50%)')
        expect(parse('<input-position>', 'progress(0%, 0%, 1%)')).toBe('progress(0%, 0%, 1%)')
    })
})
describe('<keyframe-selector>', () => {
    test('representation', () => {
        expect(parse('<keyframe-selector>', '0%', false, keyframeRule))
            .toMatchObject(percentage(0, ['<keyframe-selector>']))
    })
    test('valid', () => {
        const valid = [
            // To <percentage>
            ['from', '0%'],
            ['to', '100%'],
            // Element-dependent numeric substitution
            ['calc-interpolate(0, 0: 1% * sibling-count())'],
        ]
        valid.forEach(([input, expected = input]) =>
            expect(parse('<keyframe-selector>', input, true, keyframeRule)).toBe(expected))
    })
})
describe('<keyframes-name>', () => {
    test('invalid', () => {
        expect(parse('<keyframes-name>', 'NONE', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<keyframes-name>', 'animation', false))
            .toMatchObject(customIdent('animation', ['<keyframes-name>']))
    })
})
describe('<layer-name>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid whitespace
            'prefix .name',
            'prefix. name',
            // Invalid reserved keyword
            ...cssWideKeywords,
        ]
        invalid.forEach(input => expect(parse('<layer-name>', input, false)).toBeNull())
    })
    test('representation', () => {
        const name = list([ident('reset'), list([], '')], '', ['<layer-name>'])
        expect(parse('<layer-name>', 'reset', false)).toMatchObject(name)
    })
})
describe('<line-names>', () => {
    test('invalid', () => {
        expect(parse('<line-names>', '[AUTO]', false)).toBeNull()
        expect(parse('<line-names>', '[span]', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<line-names>', '[name]', false)).toMatchObject({
            associatedToken: '[',
            types: ['<block>', '<line-names>'],
            value: list([customIdent('name')]),
        })
    })
})
describe('<linear()>', () => {
    test('representation', () => {
        expect(parse('<linear()>', 'linear(1)', false)).toMatchObject({
            name: 'linear',
            types: ['<function>', '<linear()>'],
            value: list([list([number(1), list()])], ','),
        })
    })
    test('valid', () => {
        expect(parse('<linear()>', 'linear(0 0% 50%)')).toBe('linear(0 0%, 0 50%)')
    })
})
describe('<media-type>', () => {
    test('invalid', () => {
        const invalid = [
            'AND',
            'not',
            'only',
            'or',
            'layer',
        ]
        invalid.forEach(input => expect(parse('<media-type>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<media-type>', 'all', false)).toMatchObject(ident('all', ['<media-type>']))
    })
})
describe('<mf-comparison>', () => {
    test('invalid', () => {
        expect(parse('<mf-comparison>', '< =', false)).toBeNull()
        expect(parse('<mf-comparison>', '> =', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<mf-comparison>', '<=', false))
            .toMatchObject(list([lt, equal], '', ['<mf-lt>', '<mf-comparison>']))
    })
})
describe('<mf-boolean>', () => {
    test('invalid', () => {
        expect(parse('<mf-boolean>', 'min-color', false, mediaRule)).toBeNull()
        expect(parse('<mf-boolean>', 'min-orientation', false, mediaRule)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<mf-boolean>', 'color', false, mediaRule))
            .toMatchObject(ident('color', ['<mf-name>', '<mf-boolean>']))
    })
    test('valid', () => {
        expect(parse('<mf-boolean>', 'orientation', true, mediaRule)).toBe('orientation')
    })
})
describe('<mf-name>', () => {
    test('invalid', () => {
        expect(parse('<mf-name>', 'color', false, containerRule)).toBeNull()
        expect(parse('<mf-name>', 'inline-size', false, mediaRule)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<mf-name>', 'color', false, mediaRule)).toMatchObject(ident('color', ['<mf-name>']))
    })
    test('valid', () => {
        const valid = [
            ['COLOR', 'color', mediaRule],
            ['inline-size', 'inline-size', containerRule],
            ['-webkit-device-pixel-ratio', 'resolution', mediaRule],
            ['-webkit-min-device-pixel-ratio', 'min-resolution', mediaRule],
            ['-webkit-max-device-pixel-ratio', 'max-resolution', mediaRule],
        ]
        valid.forEach(([input, expected, context]) => expect(parse('<mf-name>', input, true, context)).toBe(expected))
    })
})
describe('<mf-plain>', () => {
    test('invalid', () => {
        expect(parse('<mf-plain>', 'min-orientation: landscape', false, mediaRule)).toBeNull()
        expect(parse('<mf-plain>', 'color: red', false, mediaRule)).toBeNull()
    })
    test('representation', () => {
        const name = ident('color', ['<mf-name>'])
        const value = integer(1, ['<mf-value>'])
        const feature = list([name, delimiter(':'), value], ' ', ['<mf-plain>'])
        expect(parse('<mf-plain>', 'color: 1', false, mediaRule)).toMatchObject(feature)
    })
    test('valid', () => {
        const valid = [
            ['orientation: PORTRAIT', 'orientation: portrait'],
            ['color: 1.0', 'color: 1'],
            ['min-width: 0', 'min-width: 0px'],
            ['color: calc(1 * 1)', 'color: calc(1)'],
            ['aspect-ratio: 1', 'aspect-ratio: 1 / 1'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<mf-plain>', input, true, mediaRule)).toBe(expected))
    })
})
describe('<mf-range>', () => {
    test('invalid', () => {
        const invalid = [
            // Prefixed <mf-name>
            'min-color = 1',
            '1 < min-color < 1',
            // Discrete <mf-name>
            'orientation = 1',
            '1 < orientation < 1',
            // Invalid <mf-value>
            'color = 1px',
            '1 < color < 1px',
            '1px < color < 1',
        ]
        invalid.forEach(input => expect(parse('<mf-range>', input, false, mediaRule)).toBeNull())
    })
    test('representation', () => {
        const name = ident('color', ['<mf-name>'])
        const comparator = delimiter('=', ['<mf-eq>', '<mf-comparison>'])
        const value = integer(1, ['<mf-value>'])
        const range = list([name, comparator, value], ' ', ['<mf-range>'])
        expect(parse('<mf-range>', 'color = 1', false, mediaRule)).toMatchObject(range)
    })
    test('valid', () => {
        const valid = [
            ['color < 0', 'color < 0'],
            ['color < calc(1 * 1)', 'color < calc(1)'],
            ['0 < aspect-ratio < 1', '0 / 1 < aspect-ratio < 1 / 1'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<mf-range>', input, true, mediaRule)).toBe(expected))
    })
})
describe('<mf-value>', () => {
    test('invalid', () => {
        const invalid = [
            [mediaRule, 'var(--custom)'],
            [mediaRule, 'attr(name)'],
            [mediaRule, 'calc-interpolate(0, 0: 1)'],
            [mediaRule, 'sibling-count()'],
        ]
        invalid.forEach(([context, input]) => expect(parse('<mf-value>', input, false, context)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<mf-value>', '1', false)).toMatchObject(number(1, ['<mf-value>']))
    })
    test('valid', () => {
        const valid = [
            [mediaRule, 'env(name)'],
            [containerRule, 'env(name)'],
            [containerRule, 'var(--custom)'],
            [containerRule, 'attr(name)'],
            [containerRule, 'calc-interpolate(0, 0: 1 * sibling-count())'],
        ]
        valid.forEach(([context, input, expected = input]) =>
            expect(parse('<mf-value>', input, true, context)).toBe(expected))
    })
})
describe('<opentype-tag>', () => {
    test('invalid', () => {
        const invalid = [
            // Less or more than 4 characters
            '"aaa"',
            '"aaaaa"',
            // Non-printable ASCII characters
            '"©aaa"',
        ]
        invalid.forEach(input => expect(parse('<opentype-tag>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<opentype-tag>', '"aaaa"', false)).toMatchObject(string('aaaa', ['<opentype-tag>']))
    })
})
describe('<page-selector-list>', () => {
    test('invalid', () => {
        expect(parse('<page-selector-list>', 'toc :left', false)).toBeNull()
        expect(parse('<page-selector-list>', 'toc: left', false)).toBeNull()
    })
    test('representation', () => {

        const toc = identToken('toc')
        const pseudoSelector = list([colon, keyword('right')], '', ['<pseudo-page>'])
        const pseudoChain = list([pseudoSelector], '')
        const selector = list([toc, pseudoChain], '', ['<page-selector>'])
        const selectors = list([selector], ',', ['<page-selector-list>'])

        expect(parse('<page-selector-list>', 'toc:right', false)).toMatchObject(selectors)
    })
})
describe('<pointer()>', () => {
    test('representation', () => {
        expect(parse('<pointer()>', 'pointer()', false)).toMatchObject({
            name: 'pointer',
            types: ['<function>', '<pointer()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        expect(parse('<pointer()>', 'pointer(inline self)')).toBe('pointer()')
    })
})
describe('<position>', () => {
    test('representation', () => {
        expect(parse('<position>', 'left', false)).toMatchObject(keyword('left', ['<position-one>', '<position>']))
    })
    test('valid', () => {
        const valid = [
            ['center', 'center center'],
            ['left', 'left center'],
            ['top', 'center top'],
            ['x-start', 'x-start center'],
            ['y-start', 'center y-start'],
            ['block-start', 'block-start center'],
            ['inline-start', 'center inline-start'],
            ['50%', '50% center'],
            ['0px', '0px center'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<position>', input)).toBe(expected))
    })
})
describe('<progress-source>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid <calc-sum>
            'calc((1% + 1px) / 1px)',
            'progress(1%, 1px, 1px)',
            // Invalid <'animation-timeline'>
            'auto',
            'none',
        ]
        invalid.forEach(input => expect(parse('<progress-source>', input, false)).toBeNull())
    })
    test('representation', () => {
        const progress = percentage(50, ['<progress-source>'])
        expect(parse('<progress-source>', '50%', false)).toMatchObject(progress)
    })
    test('valid', () => {
        expect(parse('<progress-source>', 'calc(100% / 2)')).toBe('calc(50%)')
        expect(parse('<progress-source>', 'progress(0%, 0%, 1%)')).toBe('progress(0%, 0%, 1%)')
    })
})
describe('<pt-name-and-class-selector>', () => {
    test('invalid', () => {
        expect(parse('<pt-name-and-class-selector>', 'name .class', false)).toBeNull()
        expect(parse('<pt-name-and-class-selector>', '.class .class', false)).toBeNull()
    })
    test('representation', () => {
        const name = customIdent('name', ['<pt-name-selector>'])
        expect(parse('<pt-name-and-class-selector>', 'name', false))
            .toMatchObject(list([name, omitted], '', ['<pt-name-and-class-selector>']))
    })
})
describe('<ray()>', () => {
    test('representation', () => {
        expect(parse('<ray()>', 'ray(1deg)', false)).toMatchObject({
            name: 'ray',
            types: ['<function>', '<ray()>'],
            value: list([angle(1, 'deg'), omitted, omitted, omitted]),
        })
    })
    test('valid', () => {
        expect(parse('<ray()>', 'ray(1deg closest-side)')).toBe('ray(1deg)')
    })
})
describe('<ratio>', () => {
    test('representation', () => {
        expect(parse('<ratio>', '1', false)).toMatchObject(list([number(1), omitted], ' ', ['<ratio>']))
    })
    test('valid', () => {
        expect(parse('<ratio>', '1')).toBe('1 / 1')
        expect(parse('<ratio>', '1 / 1')).toBe('1 / 1')
    })
})
describe('<relative-control-point>', () => {
    test('representation', () => {

        const zero = length(0, 'px', ['<length-percentage>'])
        const coordinate = list([zero, zero], ' ', ['<coordinate-pair>'])
        const point = list([coordinate, omitted], ' ', ['<relative-control-point>'])

        expect(parse('<relative-control-point>', '0px 0px', false)).toMatchObject(point)
    })
    test('valid', () => {
        expect(parse('<relative-control-point>', '0px 0px from start')).toBe('0px 0px')
    })
})
describe('<repeat-style>', () => {
    test('representation', () => {
        expect(parse('<repeat-style>', 'repeat-x', false)).toMatchObject(keyword('repeat-x', ['<repeat-style>']))
    })
    test('valid', () => {
        const valid = [
            ['repeat no-repeat', 'repeat-x'],
            ['no-repeat repeat', 'repeat-y'],
            ['repeat repeat', 'repeat'],
            ['round round', 'round'],
            ['space space', 'space'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<repeat-style>', input)).toBe(expected))
    })
})
describe('<scale()>', () => {
    test('representation', () => {
        expect(parse('<scale()>', 'scale(1)', false)).toMatchObject({
            name: 'scale',
            types: ['<function>', '<scale()>'],
            value: list([number(1)], ','),
        })
    })
    test('valid', () => {
        expect(parse('<scale()>', 'scale(1, 1)')).toBe('scale(1)')
    })
})
describe('<scroll()>', () => {
    test('representation', () => {
        expect(parse('<scroll()>', 'scroll()', false)).toMatchObject({
            name: 'scroll',
            types: ['<function>', '<scroll()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        const valid = [
            ['scroll(nearest block)', 'scroll()'],
            ['scroll(root block)', 'scroll(root)'],
            ['scroll(nearest inline)', 'scroll(inline)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<scroll()>', input)).toBe(expected))
    })
})
describe('<shadow>', () => {
    test('representation', () => {
        expect(parse('<shadow>', '1px 1px', false)).toMatchObject(list(
            [
                omitted,
                list([
                    list([length(1, 'px'), length(1, 'px')]),
                    omitted,
                    omitted,
                ]),
                omitted,
            ],
            ' ',
            ['<shadow>']))
    })
    test('valid', () => {
        expect(parse('<shadow>', 'currentColor 1px 1px 0px 0px')).toBe('1px 1px')
    })
})
describe('<shape()>', () => {
    test('representation', () => {

        const from = keyword('from')
        const zero = length(0, 'px', ['<length-percentage>'])
        const position = list([zero, zero], ' ', ['<position-two>', '<position>'])
        const move = keyword('move')
        const by = keyword('by')
        const coordinate = list([zero, zero], ' ', ['<coordinate-pair>'])
        const endpoint = list([by, coordinate], ' ', ['<command-end-point>'])
        const commands = list([list([move, endpoint], ' ', ['<move-command>', '<shape-command>'])], ',')
        const value = list([omitted, from, position, comma, commands])

        expect(parse('<shape()>', 'shape(from 0px 0px, move by 0px 0px)', false)).toMatchObject({
            name: 'shape',
            types: ['<function>', '<shape()>'],
            value,
        })
    })
    test('valid', () => {
        expect(parse('<shape()>', 'shape(nonzero from 0px 0px, move by 0px 0px)'))
            .toBe('shape(from 0px 0px, move by 0px 0px)')
    })
})
describe('<skew()>', () => {
    test('representation', () => {
        expect(parse('<skew()>', 'skew(1deg)', false)).toMatchObject({
            name: 'skew',
            types: ['<function>', '<skew()>'],
            value: list([angle(1, 'deg'), omitted, omitted]),
        })
    })
    test('valid', () => {
        expect(parse('<skew()>', 'skew(0deg, 0)')).toBe('skew(0deg)')
        expect(parse('<skew()>', 'skew(0deg, 0deg)')).toBe('skew(0deg)')
    })
})
describe('<snap-block()>, <snap-inline()>', () => {
    test('representation', () => {
        expect(parse('<snap-block()>', 'snap-block(1px)', false)).toMatchObject({
            name: 'snap-block',
            types: ['<function>', '<snap-block()>'],
            value: list([length(1, 'px'), omitted, omitted]),
        })
    })
    test('valid', () => {
        expect(parse('<snap-block()>', 'snap-block(1px, near)')).toBe('snap-block(1px)')
    })
})
describe('<step-easing-function>', () => {
    test('invalid', () => {
        expect(parse('<step-easing-function>', 'steps(0)', false)).toBeNull()
        expect(parse('<step-easing-function>', 'steps(1, jump-none)', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<step-easing-function>', 'steps(1)', false)).toMatchObject({
            name: 'steps',
            types: ['<function>', '<steps()>', '<step-easing-function>'],
            value: list([integer(1), omitted, omitted]),
        })
    })
    test('valid', () => {
        const valid = [
            ['step-start', 'steps(1, start)'],
            ['step-end', 'steps(1)'],
            ['steps(1, end)', 'steps(1)'],
            ['steps(1, jump-end)', 'steps(1)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<step-easing-function>', input)).toBe(expected))
    })
})
describe('<string()>', () => {
    test('representation', () => {
        expect(parse('<string()>', 'string(name)', false)).toMatchObject({
            name: 'string',
            types: ['<function>', '<string()>'],
            value: list([ident('name', ['<custom-ident>']), omitted, omitted]),
        })
    })
    test('valid', () => {
        expect(parse('<string()>', 'string(name, first)')).toBe('string(name)')
    })
})
describe('<style-feature>', () => {
    test('invalid', () => {
        const invalid = [
            'unknown',
            'width: revert',
            'width: revert-layer',
        ]
        invalid.forEach(input => expect(parse('<style-feature>', input, false, containerRule)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<style-feature>', 'color: green !important', false, containerRule)).toMatchObject({
            important: true,
            name: 'color',
            types: ['<declaration>', '<style-feature-plain>', '<style-feature>'],
            value: keyword('green', ['<named-color>', '<color-base>', '<color>', 'color']),
        })
    })
    test('valid', () => {
        const valid = [
            // Standard property name
            ['color'],
            // Aliased and mapped property name
            ['-webkit-order'],
            ['-webkit-box-align'],
            // Custom property
            ['--custom: fn(  /**/  1e0  /**/  )'],
            // Substitution of a declaration value
            ['width: env(name)'],
            ['width: first-valid(1px)', 'width: 1px'],
            ['width: var(--custom)'],
            ['width: initial'],
            ['width: attr(name)'],
            ['width: interpolate(0, 0: 1px)'],
            ['width: calc-interpolate(0, 0: 1px * sibling-count())'],
            // Arbitrary substitution of a range value
            ['var(--custom) < 1px'],
        ]
        valid.forEach(([input, expected = input]) =>
            expect(parse('<style-feature>', input, true, containerRule)).toBe(expected))
    })
})
describe('<syntax-string>', () => {
    test('invalid', () => {
        expect(parse('<syntax-string>', '""', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<syntax-string>', '"*"', false)).toMatchObject(delimiter('*', ['<syntax>']))
    })
})
describe('<syntax-component>', () => {
    test('invalid', () => {
        expect(parse('<syntax-component>', 'a #', false)).toBeNull()
        expect(parse('<syntax-component>', '< angle>', false)).toBeNull()
        expect(parse('<syntax-component>', '<angle >', false)).toBeNull()
        expect(parse('<syntax-component>', '< transform-list>', false)).toBeNull()
        expect(parse('<syntax-component>', '<transform-list >', false)).toBeNull()
    })
    test('representation', () => {
        const componentUnit = ident('a', ['<syntax-single-component>'])
        const component = list([componentUnit, omitted], '', ['<syntax-component>'])
        expect(parse('<syntax-component>', 'a', false)).toMatchObject(component)
    })
})
describe('<supports-decl>', () => {
    test('invalid', () => {
        expect(parse('<supports-decl>', '(unknown: initial)', false, supportsRule)).toBeNull()
        expect(parse('<supports-decl>', '(color: invalid)', false, supportsRule)).toBeNull()
    })
    test('representation', () => {
        const declaration = {
            important: false,
            name: 'color',
            types: ['<declaration>'],
            value: keyword('green', ['<named-color>', '<color-base>', '<color>', 'color']),
        }
        const block = {
            associatedToken: '(',
            types: ['<block>', '<supports-decl>'],
            value: declaration,
        }
        expect(parse('<supports-decl>', '(color: green)', false, supportsRule)).toMatchObject(block)
    })
    test('valid', () => {
        const valid = [
            // Custom property
            ['(--custom: fn(  /**/  1e0  /**/  ))'],
            // Substitution
            ['(width: env(name))'],
            ['(width: first-valid(1px))', '(width: 1px)'],
            ['(width: var(--custom))'],
            ['(width: initial)'],
            ['(width: attr(name))'],
            ['(width: interpolate(0, 0: 1px))'],
            ['(width: calc-interpolate(0, 0: random(1px, 1px), 1: 1px * sibling-count()))'],
        ]
        valid.forEach(([input, expected = input]) =>
            expect(parse('<supports-decl>', input, true, supportsRule)).toBe(expected))
    })
})
describe('<supports-feature>', () => {
    test('invalid', () => {
        const invalid = [
            'selector(undeclared|type)',
            'selector(:is(:not))',
            'selector(::webkit-unknown)',
        ]
        invalid.forEach(input => expect(parse('<supports-feature>', input, false, supportsRule)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<supports-feature>', '(color: green)', false, supportsRule)).toMatchObject({
            associatedToken: '(',
            types: ['<block>', '<supports-decl>', '<supports-feature>'],
            value: {
                important: false,
                name: 'color',
                types: ['<declaration>'],
                value: keyword('green', ['<named-color>', '<color-base>', '<color>', 'color']),
            },
        })
    })
})
describe('<symbols()>', () => {
    test('invalid', () => {
        expect(parse('<symbols()>', 'symbols(alphabetic "a")', false)).toBeNull()
        expect(parse('<symbols()>', 'symbols(numeric "a")', false)).toBeNull()
    })
    test('representation', () => {
        expect(parse('<symbols()>', 'symbols("a")', false)).toMatchObject({
            name: 'symbols',
            types: ['<function>', '<symbols()>'],
            value: list([omitted, list([string('a')])]),
        })
    })
    test('valid', () => {
        expect(parse('<symbols()>', 'symbols(symbolic "a")')).toBe('symbols("a")')
    })
})
describe('<translate()>', () => {
    test('representation', () => {
        expect(parse('<translate()>', 'translate(1px)', false)).toMatchObject({
            name: 'translate',
            types: ['<function>', '<translate()>'],
            value: list([length(1, 'px', ['<length-percentage>']), omitted, omitted]),
        })
    })
    test('valid', () => {
        expect(parse('<translate()>', 'translate(1px, 0px)')).toBe('translate(1px)')
    })
})
describe('<urange>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid whitespace
            'U +0-1',
            'U+ 0-1',
            'U+0 -1',
            // `U+` must appear first
            'U-0',
            'U0',
            // Start/end code points must have 0 < hexadecimal digits < 7
            'U+-1',
            'U+0-',
            'U+0000001',
            'U+0-0000001',
            'U+000000a',
            'U+0-000000a',
            'U+000000?',
            'U+0-000000?',
            // `?` must appear last
            'U+?0',
            'U+0?-1',
            'U+0-?0',
            // Start/end code points must be separated with an hyphen
            'U+0+1',
            // Start/end code points must be hexadecimal digits
            'U+0g',
            'U+0-0g',
            // Start/end code points must be lower than 10FFFF
            'U+110000',
            'U+11????',
            // Start code point must be lower or equal than end code point
            'U+1-0',
        ]
        invalid.forEach(input => expect(parse('<urange>', input, false)).toBeNull())
    })
    test('representation', () => {
        expect(parse('<urange>', 'U+0-f', false)).toMatchObject({ from: 0, to: 15, types: ['<urange>'] })
    })
    test('valid', () => {
        const valid = [
            ['U+0', 'U+0'],
            ['u+0a-1a', 'U+A-1A'],
            ['U+0000-00001', 'U+0-1'],
            ['U+????', 'U+0-FFFF'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<urange>', input)).toBe(expected))
    })
})
describe('<url-set>', () => {
    test('invalid', () => {
        const invalid = [
            'image-set(image(black))',
            'image-set(image-set(black))',
            'image-set(cross-fade(black))',
            'image-set(element(#image))',
            'image-set(linear-gradient(red, cyan))',
        ]
        invalid.forEach(input => expect(parse('<url-set>', input, false)).toBeNull())
    })
    test('representation', () => {

        const url = string('image.jpg')
        const src = {
            name: 'src',
            types: ['<function>', '<src()>', '<url>', '<image>'],
            value: list([url, list()]),
        }

        expect(parse('<url-set>', 'image-set(src("image.jpg"))', false)).toMatchObject({
            name: 'image-set',
            types: ['<function>', '<image-set()>', '<url-set>'],
            value: list([list([src, omitted], ' ', ['<image-set-option>'])], ','),
        })
        expect(parse('<url-set>', 'image-set("image.jpg")', false)).toMatchObject({
            name: 'image-set',
            types: ['<function>', '<image-set()>', '<url-set>'],
            value: list([list([url, omitted], ' ', ['<image-set-option>'])], ','),
        })
    })
})
describe('<var()>', () => {
    test('representation', () => {
        const property = dashedIdent('--custom', ['<custom-property-name>'])
        expect(parse('<var()>', 'var(--custom)', false)).toMatchObject({
            name: 'var',
            value: list([property, omitted, omitted]),
            types: ['<function>', '<var()>'],
        })
    })
    test('valid', () => {
        expect(parse('<var()>', 'var(--custom,,)')).toBe('var(--custom,,)')
        expect(parse('<var()>', 'var(--custom, 1 {})')).toBe('var(--custom, 1 {})')
    })
})
describe('<view()>', () => {
    test('representation', () => {
        expect(parse('<view()>', 'view()', false)).toMatchObject({
            name: 'view',
            types: ['<function>', '<view()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        const valid = [
            ['view(block auto)', 'view()'],
            ['view(block 1px)', 'view(1px)'],
            ['view(inline auto)', 'view(inline)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<view()>', input)).toBe(expected))
    })
})
describe('<wq-name>', () => {
    test('invalid', () => {
        expect(parse('<wq-name>', 'prefix |name', false)).toBeNull()
        expect(parse('<wq-name>', 'prefix| name', false)).toBeNull()
    })
    test('representation', () => {
        const name = list([omitted, identToken('name')], '', ['<wq-name>'])
        expect(parse('<wq-name>', 'name', false)).toMatchObject(name)
    })
})

describe('<font-src-list>', () => {
    test('representation', () => {

        const url = {
            types: ['<url-token>', '<url()>', '<url>'],
            value: 'font.woff2',
        }
        const format = {
            name: 'format',
            types: ['<function>'],
            value: keyword('woff2', ['<font-format>']),
        }

        expect(parse('<font-src-list>', 'url(font.woff2) format(woff2)', false))
            .toMatchObject(list([list([url, format, omitted], ' ', ['<font-src>'])], ',', ['<font-src-list>']))
    })
    test('valid', () => {
        expect(parse('<font-src-list>', 'url("font.woff2") format(woff2), url("font.eotf") format("embedded-opentype")'))
            .toBe('url("font.woff2") format(woff2)')
    })
})
describe('<selector-list>', () => {
    test('invalid', () => {
        const invalid = [
            // Invalid whitespace
            'svg| *',
            '. class',
            ': hover',
            ': :before',
            ':: before',
            // Undeclared namespace
            'undeclared|type',
            '[undeclared|attr=value]',
            // Invalid pseudo-class name
            ':is',
            ':hover()',
            ':marker',
            ':highlight(name)',
            // Invalid pseudo-element name
            '::is()',
            '::hover',
            '::marker()',
            '::highlight',
            '::webkit-unknown()',
            // Invalid pseudo-classing of pseudo-element
            '::before:only-child',
            '::marker:empty',
            '::before:nth-child(1)',
            '::before:not(:only-child)',
            '::before:not(:not(:only-child))',
            '::before:not(type)',
            '::before:not(:hover > type)',
            // Invalid functional pseudo argument
            ':has(:not(:has(type)))',
            ':host(:not(type > type))',
            ':host(:not(:has(type)))',
            ':host-context(:not(type > type))',
            ':host-context(:not(:has(type)))',
            '::slotted(:not(type > type))',
            '::slotted(:not(:has(type)))',
            // Invalid sub-pseudo-element
            '::marker::before',
            '::marker::highlight(name)',
            // Invalid pseudo-element combination (no internal structure)
            '::before span',
            '::before + span',
        ]
        invalid.forEach(input => expect(parse('<selector-list>', input, false, styleRule)).toBeNull())
    })
    test('representation', () => {

        const subclass = list([delimiter('.'), identToken('class')], '', ['<class-selector>', '<subclass-selector>'])
        const subclasses = list([subclass], '')
        const compound = list([omitted, subclasses], '', ['<compound-selector>'])
        const complexUnit = list([compound, list([], '')], '', ['<complex-selector-unit>'])
        const complex = list([complexUnit, list()], ' ', ['<complex-selector>'])
        const selectors = list([complex], ',', ['<complex-selector-list>', '<selector-list>'])

        expect(parse('<selector-list>', '.class', false, styleRule)).toMatchObject(selectors)
    })
    test('valid', () => {
        const valid = [
            // No invalid whitespace
            ['#id.class[ *|attr ^= value ]:hover > [attr=value]::before', '#id.class[*|attr ^= value]:hover > [attr = value]::before'],
            ['html|*'],
            ['html|a'],
            ['*|a'],
            ['|a'],
            ['col || td'],
            // Pseudo-class or pseudo-element name is case-insensitive
            [':HOVER', ':hover'],
            [':DIR(ltr)', ':dir(ltr)'],
            [':-WEBKIT-AUTOFILL', ':autofill'],
            ['::BEFORE', '::before'],
            ['::HIGHLIGHT(name)', '::highlight(name)'],
            ['::-WEBKIT-UNKNOWN', '::-webkit-unknown'],
            // Forgiving pseudo-class selector
            [':is(::before, type, undeclared|type, ::after, a {}, {} a)'],
            [':where(::before, type, undeclared|type, ::after, a {}, {} a)'],
            // Pseudo-element as pseudo-class (back-compatibility with CSS2)
            [':after', '::after'],
            [':before', '::before'],
            [':first-letter', '::first-letter'],
            [':first-line', '::first-line'],
            // Pseudo-classing pseudo-element
            ['::before:hover'],
            ['::before:empty'],
            ['::before:not(:hover, :not(:focus, :empty))'],
            ['::before:is(:hover, type, #id, .class, :root, :not(:root), type > :hover, :not(:focus))'],
            ['::marker:only-child'],
            ['::marker:nth-child(1 of :hover)'],
            ['::marker:not(:only-child, :not(:nth-child(1 of :hover)))'],
            ['::part(name):empty'],
            ['::part(name):only-child'],
            ['::part(name):nth-child(1)'],
            ['::part(name):has(type)'],
            ['::part(name):is(type)'],
            ['::part(name):not(type)'],
            // Sub-pseudo-element
            ['::after::marker'],
            ['::before::marker'],
            ['::first-letter::prefix'],
            ['::first-letter::suffix'],
            ['::before:hover::marker:focus', '::before:hover::marker:focus'],
            ['::part(name)::marker'],
            ['::part(name)::part(name)'],
            ['::slotted(type)::marker'],
            ['::slotted(type)::part(name)'],
            // Nesting selector
            ['&'],
            ['type&#identifier&.class&[attr]&:hover&'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<selector-list>', input, true, styleRule)).toBe(expected))
    })
})
describe('<media-query-list>', () => {
    test('representation', () => {

        const mediaType = ident('all', ['<media-type>'])
        const mediaQuery = list([omitted, mediaType, omitted], ' ', ['<media-query>'])
        const mediaQueryList = list([mediaQuery], ',', ['<media-query-list>'])

        expect(parse('<media-query-list>', 'all', false, mediaRule)).toMatchObject(mediaQueryList)
    })
    test('valid', () => {
        expect(parse('<media-query-list>', ';, 1, (condition),', true, mediaRule))
            .toBe('not all, not all, (condition), not all')
        expect(parse('<media-query-list>', 'all and (condition)', true, mediaRule))
            .toBe('(condition)')
    })
})

describe("<'border-radius'>", () => {
    test('representation', () => {
        const radius = length(1, 'px', ['<length-percentage>'])
        const side = list([radius, radius, radius, radius])
        const radii = list([side, side], '/', ["<'border-radius'>"])
        expect(parse("<'border-radius'>", '1px', false)).toMatchObject(radii)
    })
    test('valid', () => {
        const valid = [
            // Non-omitted component values
            ['1px 2px'],
            ['1px 1px 2px'],
            ['1px 1px 1px 2px'],
            ['1px / 1px 2px'],
            ['1px / 1px 1px 2px'],
            ['1px / 1px 1px 1px 2px'],
            // Omitted component values
            ['1px 1px', '1px'],
            ['1px 2px 1px', '1px 2px'],
            ['1px 1px 2px 1px', '1px 1px 2px'],
            ['1px 2px 1px 2px', '1px 2px'],
            ['2px / 1px 1px', '2px / 1px'],
            ['2px / 1px 2px 1px', '2px / 1px 2px'],
            ['2px / 1px 1px 2px 1px', '2px / 1px 1px 2px'],
            ['2px / 1px 2px 1px 2px', '2px / 1px 2px'],
            ['1px / 1px', '1px'],
            ['1px 2px / 1px 2px', '1px 2px'],
            ['1px 2px 1px / 1px 2px 1px', '1px 2px'],
            ['1px 1px 2px / 1px 1px 2px', '1px 1px 2px'],
            ['1px 1px 1px 2px / 1px 1px 1px 2px', '1px 1px 1px 2px'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse("<'border-radius'>", input)).toBe(expected))
    })
})
