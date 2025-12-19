
import { CSSStyleSheet, install } from '@cdoublev/css'
import { MAX_INTEGER, MIN_INTEGER } from '../lib/values/integers.js'
import {
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
} from '../lib/values/value.js'
import { createContext, parseGrammar } from '../lib/parse/parser.js'
import { describe, test } from 'node:test'
import { toDegrees, toRadians } from '../lib/utils/math.js'
import { Assert } from 'node:assert'
import { keywords as cssWideKeywords } from '../lib/values/substitutions.js'
import { isFailure } from '../lib/utils/value.js'
import properties from '../lib/properties/definitions.js'
import { serializeComponentValue } from '../lib/serialize.js'

/**
 * @param {string} definition
 * @param {string} value
 * @param {boolean} [serialize]
 * @param {object|string} [context]
 * @returns {object|object[]|string|null}
 */
function parse(definition, value, serialize = true, context) {
    value = parseGrammar(value, definition, context)
    if (isFailure(value)) {
        if (serialize) {
            return ''
        }
        return null
    }
    if (serialize) {
        return serializeComponentValue(value)
    }
    return value
}

class CSSAssert extends Assert {

    /**
     * @param {string} definition
     * @param {string} input
     * @param {object} [context]
     */
    invalid(definition, input, context) {
        this.strictEqual(parse(definition, input, false, context), null)
    }

    partialDeepEqual = super.partialDeepStrictEqual

    /**
     * @param {string} definition
     * @param {string} input
     * @param {object|object[]} expected
     * @param {object} [context]
     */
    representation(definition, input, expected, context) {
        this.partialDeepStrictEqual(parse(definition, input, false, context), expected)
    }

    /**
     * @param {string} definition
     * @param {string} input
     * @param {string} [expected]
     * @param {object} [context]
     */
    valid(definition, input, expected = input, context) {
        this.strictEqual(parse(definition, input, true, context), expected)
    }
}

install()
globalThis.document = { href: 'https://github.com/cdoublev/' }

const styleSheet = CSSStyleSheet.createImpl(globalThis, [{ media: '' }])

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

const assert = new CSSAssert({ skipPrototype: true })

const a = keyword('a')
const b = keyword('b')
const colon = delimiter(':')
const comma = delimiter(',')
const equal = delimiter('=')
const lt = delimiter('<')

describe('combined values', () => {
    test('a b', () => {
        const definition = 'a b'
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'a b c')
        assert.valid(definition, 'a b')
    })
    test('a && b', () => {
        const definition = 'a && b'
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'a b c')
        assert.valid(definition, 'a b')
        assert.valid(definition, 'b a', 'a b')
    })
    test('a || b', () => {
        const definition = 'a || b'
        assert.invalid(definition, 'a b c')
        assert.valid(definition, 'a')
        assert.valid(definition, 'b')
        assert.valid(definition, 'a b')
        assert.valid(definition, 'b a', 'a b')
    })
    test('a | b', () => {
        const definition = 'a | b'
        assert.invalid(definition, 'a b')
        assert.valid(definition, 'a')
        assert.valid(definition, 'b')
    })
})
describe('multiplied values', () => {
    test('a?', () => {
        const definition = 'a?'
        assert.representation(definition, '', omitted)
        assert.valid(definition, '')
        assert.valid(definition, 'a')
    })
    test('a*', () => {
        const definition = 'a*'
        assert.representation(definition, '', list())
        assert.valid(definition, '')
        assert.invalid(definition, 'a, a')
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
    })
    test('a+', () => {
        const definition = 'a+'
        assert.invalid(definition, '')
        assert.invalid(definition, 'a, a')
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
    })
    test('a#', () => {
        const definition = 'a#'
        assert.invalid(definition, '')
        assert.invalid(definition, 'a, a,')
        assert.invalid(definition, 'a a')
        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a , a', 'a, a')
    })
    test('a#?', () => {
        const definition = 'a a#?'
        assert.invalid(definition, 'a, a')
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a, a')
    })
    test('[a?]#', () => {
        const definition = '[a?]#'
        assert.representation(definition, '', list([omitted], ','))
        assert.valid(definition, '')
        assert.invalid(definition, 'a, a,')
        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
    })
    test('a+#', () => {
        const definition = 'a+#'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a a, a')
        assert.valid(definition, 'a, a a')
    })
    test('a+#?', () => {
        const definition = 'a a+#?'
        assert.invalid(definition, 'a, a')
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a, a')
        assert.valid(definition, 'a a, a a')
        assert.valid(definition, 'a a a, a')
    })
    test('a{2}', () => {
        const definition = 'a{2}'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.invalid(definition, 'a a a')
        assert.invalid(definition, 'a, a')
    })
    test('a{2,3}', () => {
        const definition = 'a{2,3}'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('a{0,∞}', () => {
        const definition = 'a{0,∞}'
        assert.representation(definition, '', list())
        assert.valid(definition, 'a a')
    })
    test('a{2,∞}', () => {
        const definition = 'a{2,∞}'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
    })
    test('a{2,}', () => {
        const definition = 'a{2,}'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
    })
    test('[a b]?', () => {
        const definition = '[a b]?'
        assert.representation(definition, '', omitted)
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'b')
        assert.representation(definition, 'a b', list([a, b]))
    })
    test('[a b]*', () => {
        const definition = '[a b]*'
        assert.representation(definition, '', list())
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'b')
        assert.representation(definition, 'a b', list([list([a, b])]))
    })
    test('[a b]#', () => {
        const definition = '[a b]#'
        assert.invalid(definition, '')
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'b')
        assert.representation(definition, 'a b', list([list([a, b])], ','))
    })
    test('[a? b?]!', () => {
        const definition = '[a? b?]!'
        assert.invalid(definition, '')
        assert.representation(definition, 'a', list([a, omitted]))
        assert.representation(definition, 'b', list([omitted, b]))
        assert.representation(definition, 'a b', list([a, b]))
    })
    test('[a? b?]#', () => {
        const definition = '[a? b?]#'
        assert.representation(definition, '', list([list([omitted, omitted])], ','))
        assert.representation(definition, 'a', list([list([a, omitted])], ','))
        assert.representation(definition, 'b', list([list([omitted, b])], ','))
        assert.representation(definition, 'a b', list([list([a, b])], ','))
        assert.invalid(definition, 'a b,')
    })
    test('[a | b]?', () => {
        const definition = '[a | b]?'
        assert.representation(definition, '', omitted)
        assert.valid(definition, 'a')
        assert.valid(definition, 'b')
    })
    test('[a | b]*', () => {
        const definition = '[a | b]*'
        assert.representation(definition, '', list())
        assert.valid(definition, 'a')
        assert.valid(definition, 'b')
    })
    test('[a | b]#', () => {
        const definition = '[a | b]#'
        assert.invalid(definition, '')
        assert.valid(definition, 'a')
        assert.valid(definition, 'b')
    })
    test('[a | b b]?', () => {
        const definition = '[a | b b]?'
        assert.representation(definition, '', omitted)
        assert.representation(definition, 'a', a)
        assert.representation(definition, 'b b', list([b, b]))
    })
    test('[a | b b]*', () => {
        const definition = '[a | b b]*'
        assert.representation(definition, '', list())
        assert.representation(definition, 'a', list([a]))
        assert.representation(definition, 'b b', list([list([b, b])]))
    })
    test('[a | b b]#', () => {
        const definition = '[a | b b]#'
        assert.invalid(definition, '')
        assert.representation(definition, 'a', list([a], ','))
        assert.representation(definition, 'b b', list([list([b, b])], ','))
    })
    test('[a || b]?', () => {
        const definition = '[a || b]?'
        assert.representation(definition, '', omitted)
        assert.representation(definition, 'a', list([a, omitted]))
        assert.representation(definition, 'b', list([omitted, b]))
        assert.representation(definition, 'a b', list([a, b]))
    })
    test('[a || b]*', () => {
        const definition = '[a || b]*'
        assert.representation(definition, '', list())
        assert.representation(definition, 'a', list([list([a, omitted])]))
        assert.representation(definition, 'b', list([list([omitted, b])]))
        assert.representation(definition, 'a b', list([list([a, b])]))
    })
    test('[a || b]#', () => {
        const definition = '[a || b]#'
        assert.invalid(definition, '')
        assert.representation(definition, 'a, b', list([list([a, omitted]), list([omitted, b])], ','))
        assert.representation(definition, 'a', list([list([a, omitted])], ','))
        assert.representation(definition, 'b', list([list([omitted, b])], ','))
        assert.representation(definition, 'a b', list([list([a, b])], ','))
        assert.representation(definition, 'a b, b', list([list([a, b]), list([omitted, b])], ','))
    })
    test('[a || b b]?', () => {
        const definition = '[a || b b]?'
        assert.representation(definition, '', omitted)
        assert.representation(definition, 'a', list([a, omitted]))
        assert.representation(definition, 'b b', list([omitted, list([b, b])]))
        assert.representation(definition, 'a b b', list([a, list([b, b])]))
    })
    test('[a || b b]*', () => {
        const definition = '[a || b b]*'
        assert.representation(definition, '', list())
        assert.representation(definition, 'a', list([list([a, omitted])]))
        assert.representation(definition, 'b b', list([list([omitted, list([b, b])])]))
        assert.representation(definition, 'a b b', list([list([a, list([b, b])])]))
    })
    test('[a || b b]#', () => {
        const definition = '[a || b b]#'
        assert.invalid(definition, '')
        assert.representation(definition, 'a', list([list([a, omitted])], ','))
        assert.representation(definition, 'b b', list([list([omitted, list([b, b])])], ','))
        assert.representation(definition, 'a b b', list([list([a, list([b, b])])], ','))
    })
})
describe('backtracking', () => {
    // Simple backtracking
    test('a | a a | a a a', () => {
        const definition = 'a | a a | a a a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('a a a | a a | a', () => {
        const definition = 'a a a | a a | a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('a || a a || a a a', () => {
        const definition = 'a || a a || a a a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.valid(definition, 'a a a a a')
        assert.valid(definition, 'a a a a a a')
        assert.invalid(definition, 'a a a a a a a')
    })
    test('a a a || a a || a', () => {
        const definition = 'a a a || a a || a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.valid(definition, 'a a a a a')
        assert.valid(definition, 'a a a a a a')
        assert.invalid(definition, 'a a a a a a a')
    })
    test('a && a a', () => {
        const definition = 'a && a a'
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('a a && a', () => {
        const definition = 'a a && a'
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('a && a b && a b c', () => {
        const definition = 'a && a b && a b c'
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'a b')
        assert.invalid(definition, 'a a b')
        assert.invalid(definition, 'a b a')
        assert.invalid(definition, 'a b c')
        assert.invalid(definition, 'a a b c')
        assert.invalid(definition, 'a b c a')
        assert.invalid(definition, 'a b a b c')
        assert.invalid(definition, 'a b c a b')
        assert.valid(definition, 'a a b a b c')
        assert.valid(definition, 'a a b c a b', 'a a b a b c')
        assert.valid(definition, 'a b a b c a', 'a a b a b c')
        assert.valid(definition, 'a b a a b c', 'a a b a b c')
        assert.valid(definition, 'a b c a b a', 'a a b a b c')
        assert.valid(definition, 'a b c a a b', 'a a b a b c')
        assert.invalid(definition, 'a b c a b c')
        assert.invalid(definition, 'a a b a b c a')
    })
    // Complex backtracking
    test('[a | a a | a a a] a', () => {
        const definition = '[a | a a | a a a] a'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.invalid(definition, 'a a a a a')
    })
    test('[a | a a | a a a] && a', () => {
        const definition = '[a | a a | a a a] && a'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.invalid(definition, 'a a a a a')
    })
    test('[a | a a | a a a] || a', () => {
        const definition = '[a | a a | a a a] || a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.invalid(definition, 'a a a a a')
    })
    test('[a || a a || a a a] a', () => {
        const definition = '[a || a a || a a a] a'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.valid(definition, 'a a a a a')
        assert.valid(definition, 'a a a a a a')
        assert.valid(definition, 'a a a a a a a')
        assert.invalid(definition, 'a a a a a a a a')
    })
    test('[a || a a || a a a] && a', () => {
        const definition = '[a || a a || a a a] && a'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.valid(definition, 'a a a a a')
        assert.valid(definition, 'a a a a a a')
        assert.valid(definition, 'a a a a a a a')
        assert.invalid(definition, 'a a a a a a a a')
    })
    test('[a || a a || a a a] | a', () => {
        const definition = '[a || a a || a a a] | a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.valid(definition, 'a a a a a')
        assert.valid(definition, 'a a a a a a')
        assert.invalid(definition, 'a a a a a a a')
    })
    test('[a | a a | a a a]{2} a', () => {
        const definition = '[a | a a | a a a]{2} a'
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.valid(definition, 'a a a a a')
        assert.valid(definition, 'a a a a a a')
        assert.valid(definition, 'a a a a a a a')
        assert.invalid(definition, 'a a a a a a a a')
    })
    test('a? a{2}', () => {
        const definition = 'a? a{2}'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
    })
    test('[a | a a]* a', () => {
        const definition = '[a | a a]* a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
    })
    test('[a? | a a] a', () => {
        const definition = '[a? | a a] a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('[a? || a a] a', () => {
        const definition = '[a? || a a] a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.invalid(definition, 'a a a a a')
    })
    test('[a? && a?] a', () => {
        const definition = '[a? && a?] a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('[a{2}]? && a', () => {
        const definition = '[a{2}]? && a'
        assert.valid(definition, 'a')
        assert.invalid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('[a | a a | a a a] [a | a a]', () => {
        const definition = '[a | a a | a a a] [a | a a]'
        assert.invalid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.valid(definition, 'a a a a a')
        assert.invalid(definition, 'a a a a a a')
    })
    test('[a | a a] a | a', () => {
        const definition = '[a | a a] a | a'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.invalid(definition, 'a a a a')
    })
    test('[a && [a | a a]] a', () => {
        const definition = '[a && [a | a a]] a'
        assert.invalid(definition, 'a')
        assert.invalid(definition, 'a a')
        assert.valid(definition, 'a a a')
        assert.valid(definition, 'a a a a')
        assert.invalid(definition, 'a a a a a')
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

        assert.representation(definition, 'a screen color', list([a, screenMediaType, colorPrefix]))
        assert.representation(definition, 'a color screen', list([a, colorMediaType, screenPrefix]))
        assert.representation(definition, 'screen a color', list([a, screenMediaType, colorPrefix]))
        assert.representation(definition, 'screen color a', list([a, screenMediaType, colorPrefix]))
        assert.representation(definition, 'color a screen', list([a, colorMediaType, screenPrefix]))
        assert.representation(definition, 'color screen a', list([a, colorMediaType, screenPrefix]))
    })
    /**
     * Requirements:
     *
     * 1. Replacing must only apply once (ie. not after backtracking).
     * 2. The input index must backtrack to a location stored in state instead
     * of the first token in the parse result.
     * 3. The list must not be updated with the result of parsing because it
     * can be different depending on the context.
     */
    test('replaced value', () => {
        assert.valid('<angle-percentage>? <length-percentage>', 'calc(1%)')
    })
})
describe('whitespaces', () => {
    test('consecutive', () => {
        assert.valid('a{2}', 'a /**/ /**/ /**/ a', 'a a')
    })
    test('omitted', () => {
        assert.valid('a a', 'a/**/a', 'a a')
    })
    test('leading and trailing', () => {
        assert.valid('fn(a)', '  fn(  a  )  ', 'fn(a)')
        assert.valid('(a)', '  (  a  )  ', '(a)')
        assert.valid('a, a?, a', 'a ,a', 'a, a')
        assert.valid('a, <any-value>', 'a ,a', 'a, a')
        assert.valid('a, <any-value>?', 'a, ', 'a,')
        assert.valid('a: a', 'a :a', 'a: a')
        assert.valid('a: <any-value>', 'a :a', 'a: a')
        assert.valid('a: <any-value>?', 'a: ', 'a:')
    })
})
describe('comma separated values', () => {
    // Comma-elision rules apply
    test('a?, a?, a', () => {

        const definition = 'a?, a?, a'

        assert.invalid(definition, 'a,')
        assert.invalid(definition, ', a')
        assert.invalid(definition, 'a,, a')
        assert.invalid(definition, 'a, , a')
        assert.invalid(definition, 'a, a,')
        assert.invalid(definition, ', a, a')
        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a, a a')
        assert.invalid(definition, 'a a, a')

        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a , a', 'a, a')
        assert.valid(definition, 'a,a', 'a, a')
        assert.valid(definition, 'a, a, a')
    })
    test('a, a?, a?', () => {

        const definition = 'a, a?, a?'

        assert.invalid(definition, 'a,')
        assert.invalid(definition, ', a')
        assert.invalid(definition, 'a,, a')
        assert.invalid(definition, 'a, a,')
        assert.invalid(definition, ', a, a')
        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a, a a')
        assert.invalid(definition, 'a a, a')

        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a, a, a')
    })
    test('[a?, a?,] a', () => {

        const definition = '[a?, a?,] a'

        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a, a a')
        assert.invalid(definition, 'a a, a')
        assert.invalid(definition, 'a,, a')
        assert.invalid(definition, ', a, a')

        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a, a, a')
    })
    test('a [, a? , a?]', () => {

        const definition = 'a [, a? , a?]'

        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a, a a')
        assert.invalid(definition, 'a a, a')
        assert.invalid(definition, 'a a,, a')
        assert.invalid(definition, 'a, a,')

        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a, a, a')
    })
    test('a, && a, && a', () => {

        const definition = 'a, && a, && a'

        assert.invalid(definition, 'a a a')
        assert.invalid(definition, 'a a, a,')

        assert.valid(definition, 'a, a a')
        assert.valid(definition, 'a a, a', 'a, a a')
        assert.valid(definition, 'a, a, a')
    })
    test('a, || a, || a', () => {

        const definition = 'a, || a, || a'

        assert.invalid(definition, 'a,')
        assert.invalid(definition, 'a a,')
        assert.invalid(definition, 'a a a')
        assert.invalid(definition, 'a a, a,')

        assert.valid(definition, 'a')
        assert.valid(definition, 'a a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a, a a')
        assert.valid(definition, 'a a, a', 'a, a a')
        assert.valid(definition, 'a, a, a')
    })
    test('a#?, a', () => {

        const definition = 'a#?, a'

        assert.invalid(definition, 'a,')
        assert.invalid(definition, 'a,,')
        assert.invalid(definition, 'a a')

        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a, a, a')
    })
    test('a*, a', () => {

        const definition = 'a*, a'

        assert.valid(definition, 'a')
        assert.valid(definition, 'a, a')
    })
    // Comma-elision rules do or do not apply
    test('a [a?, && a]', () => {

        const definition = 'a [a?, && a]'

        assert.invalid(definition, 'a a,')
        assert.invalid(definition, 'a a a,')

        assert.valid(definition, 'a a')
        assert.valid(definition, 'a a, a')
        assert.valid(definition, 'a a a')
    })
    // Comma-elision rules do not apply
    test('a a?, a', () => {

        const definition = 'a a?, a'

        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a a a')

        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a a, a')
    })
    test('a, a? a', () => {

        const definition = 'a, a? a'

        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a a a')

        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a, a a')
    })
    test('a [a?, a]', () => {

        const definition = 'a [a?, a]'

        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a a a')

        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a a, a')
    })
    test('a [, a? a]', () => {

        const definition = 'a [, a? a]'

        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a a a')

        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a, a a')
    })
    test('[a a?,] a', () => {

        const definition = '[a a?,] a'

        assert.invalid(definition, 'a a')
        assert.invalid(definition, 'a a a')

        assert.valid(definition, 'a, a')
        assert.valid(definition, 'a a, a')
    })
    test('a, <any-value>?', () => {
        const definition = 'a, <any-value>?'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a,')
        assert.valid(definition, 'a, ,', 'a,,')
    })
    test('a, <declaration-value>?', () => {
        const definition = 'a, <declaration-value>?'
        assert.valid(definition, 'a')
        assert.valid(definition, 'a,')
        assert.valid(definition, 'a, ,', 'a,,')
    })
})
describe('blocks', () => {
    test('invalid', () => {
        assert.invalid('(a)', '[a]')
    })
    test('valid', () => {
        // Unclosed (parse error)
        assert.valid('(a)', '(a', '(a)')
    })
})
describe('functions', () => {
    test('invalid', () => {
        assert.invalid('fn()', 'fn(1)')
        // Comma-containing production
        assert.invalid('fn(<any-value>)', 'fn(,)')
        assert.invalid('fn(<any-value>)', 'fn(a {})')
        assert.invalid('fn(<any-value>)', 'fn({} a)')
        assert.invalid('fn(<any-value>)', 'fn({})')
        assert.invalid('fn(<declaration-value>)', 'fn(,)')
        assert.invalid('fn(<declaration-value>)', 'fn(a {})')
        assert.invalid('fn(<declaration-value>)', 'fn({} a)')
        assert.invalid('fn(<declaration-value>)', 'fn({})')
    })
    test('valid', () => {
        // Case-insensitive name
        assert.valid('fn(a)', 'FN(a)', 'fn(a)')
        // Unclosed (parse error)
        assert.valid('fn()', 'fn(', 'fn()')
        // Comma-containing production
        assert.valid('fn([<declaration-value>?]#)', 'fn(, {})', 'fn(,)')
        assert.valid('fn([<declaration-value>?]#)', 'fn({ a }, { , }, {{}})', 'fn(a, {,}, {{}})')
        assert.valid('fn(<declaration-value>?, a)', 'fn(, a)')
    })
})

describe('<any-value>', () => {
    test('invalid', () => {
        // One or more tokens
        assert.invalid('<any-value>', '')
        // Top-level or nested <bad-*-token>, ), ], }
        assert.invalid('<any-value>', 'fn("\n)')
        assert.invalid('<any-value>', '(url(bad .url))')
        assert.invalid('<any-value>', '(])')
        assert.invalid('<any-value>', '[)]')
        assert.invalid('<any-value>', '(})')
    })
    test('representation', () => {
        const tokens = [identToken('any'), delimiter(' '), identToken('value')]
        const value = list(tokens, '', ['<any-value>'])
        assert.representation('<any-value>', 'any value', value)
    })
    test('valid', () => {
        assert.valid('<any-value>', '  /**/  !1/**/1e0;  /**/  ', '!1 1;')
    })
})
describe('<declaration-value>', () => {
    test('invalid', () => {
        // One or more tokens
        assert.invalid('<declaration-value>', '')
        // Top-level or nested <bad-*-token>, ), ], }
        assert.invalid('<declaration-value>', 'fn("\n)')
        assert.invalid('<declaration-value>', '(url(bad .url))')
        assert.invalid('<declaration-value>', '(])')
        assert.invalid('<declaration-value>', '[)]')
        assert.invalid('<declaration-value>', '(})')
        // Top-level ; and !
        assert.invalid('<declaration-value>', ';')
        assert.invalid('<declaration-value>', '!')
    })
    test('representation', () => {
        const tokens = [identToken('declaration'), delimiter(' '), identToken('value')]
        const value = list(tokens, '', ['<declaration-value>'])
        assert.representation('<declaration-value>', 'declaration value', value)
    })
    test('valid', () => {
        assert.valid('<declaration-value>', '  /**/  (;) {} 1/**/1e0  /**/  ', '(;) {} 1 1')
    })
})
describe('<declaration>', () => {
    test('invalid', () => {
        // Top-level or nested <bad-*-token>, ), ], }
        assert.invalid('<declaration>', 'color: var(--custom) fn("\n)')
        assert.invalid('<declaration>', 'color: var(--custom) (url(bad .url))')
        assert.invalid('<declaration>', 'color: var(--custom) [)]')
        assert.invalid('<declaration>', 'color: var(--custom) (])')
        assert.invalid('<declaration>', 'color: var(--custom) (})')
        assert.invalid('<declaration>', '--custom: fn("\n)')
        assert.invalid('<declaration>', '--custom: (url(bad .url))')
        assert.invalid('<declaration>', '--custom: [)]')
        assert.invalid('<declaration>', '--custom: (])')
        assert.invalid('<declaration>', '--custom: (})')
        // Top-level ; and !
        assert.invalid('<declaration>', 'color: var(--custom) ;')
        assert.invalid('<declaration>', 'color: var(--custom) !')
        assert.invalid('<declaration>', '--custom: ;')
        // Positioned {} block
        assert.invalid('<declaration>', 'color: var(--custom) {}')
        assert.invalid('<declaration>', 'color: {} var(--custom)')
    })
    test('representation', () => {
        const declaration = {
            important: true,
            name: 'color',
            types: ['<declaration>'],
            value: keyword('green', ['<named-color>', '<color-base>', '<color>', 'color']),
        }
        assert.representation('<declaration>', 'color: green !important', declaration, styleRule)
    })
    test('valid', () => {
        assert.valid(
            '<declaration>',
            '--custom:  /**/  (;) {} 1e0 !important  /**/  ',
            '--custom: (;) {} 1e0 !important',
            styleRule)
    })
})

describe('<ident>', () => {
    test('invalid', () => {
        // Invalid identifier (start) code point
        assert.invalid('<ident>', '1identifier')
        assert.invalid('<ident>', '!identifier')
        assert.invalid('<ident>', '-1identifier')
        assert.invalid('<ident>', '-!identifier')
        assert.invalid('<ident>', '--!identifier')
        // Invalid escape sequence (parse error)
        assert.invalid('<ident>', '\\\n')
        assert.invalid('<ident>', '-\\\n')
    })
    test('representation', () => {
        assert.representation('<ident>', 'identifier', ident('identifier'))
    })
    test('valid', () => {
        // Starts with identifier start code point(s)
        assert.valid('<ident>', 'identifier')
        assert.valid('<ident>', '·identifier')
        assert.valid('<ident>', '_identifier')
        // Starts with an escape sequence
        assert.valid('<ident>', '\\', '�')
        assert.valid('<ident>', '\\-')
        assert.valid('<ident>', '\\0', '�')
        assert.valid('<ident>', '\\D800', '�')
        assert.valid('<ident>', '\\110000', '�')
        assert.valid('<ident>', '\\0000311', '\\31 1')
        assert.valid('<ident>', '\\31 1')
        assert.valid('<ident>', '\\31\\31', '\\31 1')
        assert.valid('<ident>', '\\Aidentifier', '\\a identifier')
        assert.valid('<ident>', '\\69 dentifier', 'identifier')
        assert.valid('<ident>', '\\identifier', 'identifier')
        assert.valid('<ident>', '\\21identifier', '\\!identifier')
        assert.valid('<ident>', '\\!identifier')
        assert.valid('<ident>', '\\A9identifier', '\\©identifier')
        assert.valid('<ident>', '\\©identifier')
        // Starts with - followed by - or identifier start code point
        assert.valid('<ident>', '--')
        assert.valid('<ident>', '-identifier')
        assert.valid('<ident>', '-·identifier')
        assert.valid('<ident>', '-_identifier')
        assert.valid('<ident>', '-\\31identifier', '-\\31 identifier')
        // Only contains identifier code points and escape sequences
        assert.valid('<ident>', 'identifier·')
        assert.valid('<ident>', 'identifier_')
        assert.valid('<ident>', 'identifier1')
        assert.valid('<ident>', 'identifier-')
        assert.valid('<ident>', 'identifie\\r', 'identifier')
        // Case-sensitive
        assert.valid('<ident>', 'IDENTIFIER')
    })
})
describe('keyword', () => {
    test('representation', () => {
        assert.representation('identifier', 'identifier', keyword('identifier'))
    })
    test('valid', () => {
        assert.valid('identifier', 'IDENTIFIER', 'identifier')
    })
})
describe('<custom-ident>', () => {
    test('invalid', () => {
        const invalid = [...cssWideKeywords, 'DEFAULT']
        invalid.forEach(input => assert.invalid('<custom-ident>', input))
    })
    test('representation', () => {
        assert.representation('<custom-ident>', 'IDENTIFIER', customIdent('IDENTIFIER'))
    })
})
describe('<dashed-ident>', () => {
    test('invalid', () => {
        assert.invalid('<dashed-ident>', '-custom-identifier')
    })
    test('representation', () => {
        assert.representation('<dashed-ident>', '--custom-identifier', dashedIdent('--custom-identifier'))
    })
})
describe('<custom-property-name>', () => {
    test('invalid', () => {
        assert.invalid('<custom-property-name>', '--')
    })
    test('representation', () => {
        assert.representation(
            '<custom-property-name>',
            '--dashed-identifier',
            dashedIdent('--dashed-identifier', ['<custom-property-name>']))
    })
})
describe('<ndashdigit-ident>', () => {
    test('invalid', () => {
        assert.invalid('<ndashdigit-ident>', '-n-1')
        assert.invalid('<ndashdigit-ident>', 'n--1')
        assert.invalid('<ndashdigit-ident>', 'n-1-')
    })
    test('representation', () => {
        assert.representation('<ndashdigit-ident>', 'n-11', identToken('n-11', ['<ndashdigit-ident>']))
    })
})
describe('<dashndashdigit-ident>', () => {
    test('invalid', () => {
        assert.invalid('<dashndashdigit-ident>', '--n-1')
        assert.invalid('<dashndashdigit-ident>', '-n--1')
        assert.invalid('<dashndashdigit-ident>', '-n-1-')
    })
    test('representation', () => {
        assert.representation('<dashndashdigit-ident>', '-n-11', identToken('-n-11', ['<dashndashdigit-ident>']))
    })
})
describe('<string>', () => {
    test('invalid', () => {
        assert.invalid('<string>', '"\n"')
    })
    test('representation', () => {
        assert.representation('<string>', '"css"', string('css'))
        assert.representation('<string>', '"css', string('css', [], '"css'))
    })
    test('valid', () => {
        // Unclosed (parse error)
        assert.valid('<string>', '"', '""')
        assert.valid('<string>', "'", '""')
        assert.valid('<string>', '"\\', '""')
        // Escape sequence
        assert.valid('<string>', '"\\\n"', '""')
        assert.valid('<string>', '"\\0"', '"�"')
        assert.valid('<string>', '"\\D800"', '"�"')
        assert.valid('<string>', '"\\110000"', '"�"')
        assert.valid('<string>', '"\\0000311"', '"11"')
        assert.valid('<string>', '"\\31 1"', '"11"')
        assert.valid('<string>', '"\\31\\31"', '"11"')
        assert.valid('<string>', '"\\A"', '"\\a "')
        assert.valid('<string>', '"\\22"', '"\\""')
        assert.valid('<string>', '"\\""')
        assert.valid('<string>', '"\\5C"', '"\\\\"')
        assert.valid('<string>', '"\\\\"')
        assert.valid('<string>', '"\\73tring"', '"string"')
        assert.valid('<string>', '"\\string"', '"string"')
        // Double quotes
        assert.valid('<string>', "'string'", '"string"')
    })
})
describe('<url>', () => {
    test('invalid', () => {
        assert.invalid('<url>', 'url(bad .url)')
        assert.invalid('<url>', 'url(bad\n.url)')
        assert.invalid('<url>', 'url(bad\t.url)')
        assert.invalid('<url>', 'url(bad".url)')
        assert.invalid('<url>', "url(bad'.url)")
        assert.invalid('<url>', 'url(bad(.url)')
        assert.invalid('<url>', 'url(bad\u0001.url)')
        assert.invalid('<url>', 'url(bad\\\n.url)')
    })
    test('representation', () => {
        assert.representation('<url>', 'url(img.jpg)', {
            types: ['<url-token>', '<url()>', '<url>'],
            value: 'img.jpg',
        })
        assert.representation('<url>', 'url("img.jpg")', {
            name: 'url',
            types: ['<function>', '<url()>', '<url>'],
            value: list([string('img.jpg'), list()]),
        })
        assert.representation('<url>', 'src("img.jpg")', {
            name: 'src',
            types: ['<function>', '<src()>', '<url>'],
            value: list([string('img.jpg'), list()]),
        })
    })
    test('valid', () => {
        // Case-insensitive name
        assert.valid('<url>', 'URL(file.jpg)', 'url("file.jpg")')
        assert.valid('<url>', 'URL("file.jpg")', 'url("file.jpg")')
        assert.valid('<url>', 'SRC("file.jpg")', 'src("file.jpg")')
        // Unclosed (parse error)
        assert.valid('<url>', 'url(', 'url("")')
        assert.valid('<url>', 'url( ', 'url("")')
        assert.valid('<url>', 'url(\n', 'url("")')
        assert.valid('<url>', 'url(\t', 'url("")')
        assert.valid('<url>', 'url(\\', 'url("�")')
        assert.valid('<url>', 'url(valid.jpg ', 'url("valid.jpg")')
        // Single whitespace
        assert.valid('<url>', 'url( )', 'url("")')
        assert.valid('<url>', 'url(\n)', 'url("")')
        assert.valid('<url>', 'url(\t)', 'url("")')
        // Escape sequence
        assert.valid('<url>', 'url(\\0)', 'url("�")')
        assert.valid('<url>', 'url(\\D800)', 'url("�")')
        assert.valid('<url>', 'url(\\110000)', 'url("�")')
        assert.valid('<url>', 'url(\\0000311)', 'url("11")')
        assert.valid('<url>', 'url(\\31 1)', 'url("11")')
        assert.valid('<url>', 'url(\\31\\31)', 'url("11")')
        assert.valid('<url>', 'url(\\A)', 'url("\\a ")')
        assert.valid('<url>', 'url(\\22)', 'url("\\"")')
        assert.valid('<url>', 'url(\\")', 'url("\\"")')
        assert.valid('<url>', 'url(\\5C)', 'url("\\\\")')
        assert.valid('<url>', 'url(\\\\)', 'url("\\\\")')
        assert.valid('<url>', 'url(\\76 alid.url)', 'url("valid.url")')
        assert.valid('<url>', 'url(\\valid.url)', 'url("valid.url")')
        // Double quotes
        assert.valid('<url>', "url('file.jpg')", 'url("file.jpg")')
        assert.valid('<url>', "src('file.jpg')", 'src("file.jpg")')
    })
})

describe('<number>', () => {
    test('invalid', () => {
        assert.invalid('<number [0,∞]>', '-1')
        assert.invalid('<number [0,∞]>', '1px')
    })
    test('representation', () => {
        assert.representation('<number>', '1', number(1))
    })
    test('valid', () => {
        // Scientific notation
        assert.valid('<number>', '1e1', '10')
        assert.valid('<number>', '1e+1', '10')
        assert.valid('<number>', '1e-1', '0.1')
        // Leading 0
        assert.valid('<number>', '.1', '0.1')
        // Trailing 0
        assert.valid('<number>', '0.10', '0.1')
        // Precision
        assert.valid('<number>', '1e-6', '0.000001')
        assert.valid('<number>', '1e-7', '0')
        assert.valid('<number>', '0.123456')
        assert.valid('<number>', '0.1234567', '0.123457')
        assert.valid('<number>', '1.234567')
        assert.valid('<number>', '1.2345678', '1.234568')
        // https://github.com/w3c/csswg-drafts/issues/6471
        assert.valid('<number>', '1234567')
        // Priority over <length> in "either" combination type
        assert.valid('<length> | <number>', '0')
        assert.valid('<length> || <number>', '0')
        assert.valid('<length-percentage> | <number>', '0')
        assert.valid('<length-percentage> || <number>', '0')
        assert.valid('<length> && <number>', '0 1', '0px 1')
        assert.valid('<number> && <length>', '0 1', '1 0px')
    })
})
describe('<level>', () => {
    test('invalid', () => {
        assert.invalid('<level>', '1.1')
        assert.invalid('<level>', '1e-1')
        assert.invalid('<level>', '1px')
        assert.invalid('<level>', 'calc(1)')
    })
    test('representation', () => {
        assert.representation('<level>', '1', numberToken(1, ['<level>']))
    })
    test('valid', () => {
        // https://github.com/w3c/csswg-drafts/issues/10238
        assert.valid('<integer>', '1.0', '1')
        assert.valid('<integer>', '1e1', '10')
        assert.valid('<integer>', '1e+1', '10')
        // 8 bits signed integer (browser conformance)
        assert.valid('<integer>', `${MIN_INTEGER - 1}`, `${MIN_INTEGER}`)
        assert.valid('<integer>', `${MAX_INTEGER + 1}`, `${MAX_INTEGER}`)
    })
})
describe('<zero>', () => {
    test('invalid', () => {
        assert.invalid('<zero>', '1')
        assert.invalid('<zero>', '0px')
        assert.invalid('<zero>', 'calc(0)')
    })
    test('representation', () => {
        assert.representation('<zero>', '0', numberToken(0, ['<zero>']))
    })
    test('valid', () => {
        assert.valid('<zero>', '0.0', '0')
        assert.valid('<zero>', '+0', '0')
        assert.valid('<zero>', '0e1', '0')
    })
})
describe('<integer>', () => {
    test('invalid', () => {
        assert.invalid('<integer [0,∞]>', '-1')
        assert.invalid('<integer [0,∞]>', '1.1')
        assert.invalid('<integer [0,∞]>', '1e-1')
        assert.invalid('<integer [0,∞]>', '1px')
    })
    test('representation', () => {
        assert.representation('<integer>', '1', integer(1))
    })
    test('valid', () => {
        // https://github.com/w3c/csswg-drafts/issues/10238
        assert.valid('<integer>', '1.0', '1')
        assert.valid('<integer>', '1e1', '10')
        assert.valid('<integer>', '1e+1', '10')
        // 8 bits signed integer (browser conformance)
        assert.valid('<integer>', `${MIN_INTEGER - 1}`, `${MIN_INTEGER}`)
        assert.valid('<integer>', `${MAX_INTEGER + 1}`, `${MAX_INTEGER}`)
        // Priority over <length> in "either" combination type
        assert.valid('<length> | <integer>', '0')
        assert.valid('<length> || <integer>', '0')
        assert.valid('<length-percentage> | <integer>', '0')
        assert.valid('<length-percentage> || <integer>', '0')
        assert.valid('<length> && <integer>', '0 1', '0px 1')
        assert.valid('<integer> && <length>', '0 1', '1 0px')
    })
})
describe('<signless-integer>', () => {
    test('invalid', () => {
        assert.invalid('<signless-integer>', '+1')
        assert.invalid('<signless-integer>', '1.1')
        assert.invalid('<signless-integer>', '1e-1')
        assert.invalid('<signless-integer>', '1px')
        assert.invalid('<signless-integer>', 'calc(1)')
    })
    test('representation', () => {
        assert.representation('<signless-integer>', '1', numberToken(1, ['<signless-integer>']))
    })
    test('valid', () => {
        assert.valid('<signless-integer>', `${MAX_INTEGER + 1}`, `${MAX_INTEGER}`)
    })
})
describe('<signed-integer>', () => {
    test('invalid', () => {
        assert.invalid('<signed-integer>', '1')
        assert.invalid('<signed-integer>', '+1.1')
        assert.invalid('<signed-integer>', '+1e-1')
        assert.invalid('<signed-integer>', '+1px')
        assert.invalid('<signed-integer>', 'calc(+1)')
    })
    test('representation', () => {
        assert.representation('<signed-integer>', '+1', numberToken(1, ['<signed-integer>']))
        assert.representation('<signed-integer>', '-1', numberToken(-1, ['<signed-integer>']))
    })
    test('valid', () => {
        assert.valid('<signed-integer>', `${MIN_INTEGER - 1}`, `${MIN_INTEGER}`)
        assert.valid('<signed-integer>', `+${MAX_INTEGER + 1}`, `+${MAX_INTEGER}`)
    })
})
// TODO: add support for variable units
describe('<dimension>', () => {
    test('invalid', () => {
        // Invalid identifier (start) code point
        assert.invalid('<dimension>', '1!identifier')
        assert.invalid('<dimension>', '1-1identifier')
        assert.invalid('<dimension>', '1-!identifier')
        assert.invalid('<dimension>', '1--!identifier')
        // Invalid escape sequence (parse error)
        assert.invalid('<dimension>', '1\\\n')
        assert.invalid('<dimension>', '1-\\\n')
    })
    test('representation', () => {
        assert.representation('<dimension>', '1identifier', dimension(1, 'identifier'))
    })
    test('valid', () => {
        // Scientific notation
        assert.valid('<dimension>', '1e1identifier', '10identifier')
        assert.valid('<dimension>', '1e+1identifier', '10identifier')
        assert.valid('<dimension>', '1e-1identifier', '0.1identifier')
        // Leading 0
        assert.valid('<dimension>', '.1identifier', '0.1identifier')
        // Trailing 0
        assert.valid('<dimension>', '0.10identifier', '0.1identifier')
        // The unit starts with identifier start code point(s)
        assert.valid('<dimension>', '1identifier')
        assert.valid('<dimension>', '1·identifier')
        assert.valid('<dimension>', '1_identifier')
        // The unit starts with an escape sequence
        assert.valid('<dimension>', '1\\', '1�')
        assert.valid('<dimension>', '1\\-')
        assert.valid('<dimension>', '1\\0', '1�')
        assert.valid('<dimension>', '1\\D800', '1�')
        assert.valid('<dimension>', '1\\110000', '1�')
        assert.valid('<dimension>', '1\\0000311', '1\\31 1')
        assert.valid('<dimension>', '1\\31 1')
        assert.valid('<dimension>', '1\\31\\31', '1\\31 1')
        assert.valid('<dimension>', '1\\Aidentifier', '1\\a identifier')
        assert.valid('<dimension>', '1\\69 dentifier', '1identifier')
        assert.valid('<dimension>', '1\\identifier', '1identifier')
        assert.valid('<dimension>', '1\\21identifier', '1\\!identifier')
        assert.valid('<dimension>', '1\\!identifier')
        assert.valid('<dimension>', '1\\A9identifier', '1\\©identifier')
        assert.valid('<dimension>', '1\\©identifier')
        // The unit starts with - followed by - or identifier start code point
        assert.valid('<dimension>', '1--')
        assert.valid('<dimension>', '1-identifier')
        assert.valid('<dimension>', '1-·identifier')
        assert.valid('<dimension>', '1-_identifier')
        assert.valid('<dimension>', '1-\\31identifier', '1-\\31 identifier')
        // The unit only contains identifier code points and escape sequences
        assert.valid('<dimension>', '1identifier·')
        assert.valid('<dimension>', '1identifier_')
        assert.valid('<dimension>', '1identifier1')
        assert.valid('<dimension>', '1identifier-')
        assert.valid('<dimension>', '1identifie\\r', '1identifier')
        // The unit is case-insensitive
        assert.valid('<dimension>', '1IDENTIFIER', '1identifier')
    })
})
describe('<angle>', () => {
    test('invalid', () => {
        assert.invalid('<angle [0,1deg]>', '-1deg')
        assert.invalid('<angle [0,1deg]>', '1turn')
        assert.invalid('<angle [0,1deg]>', '1')
        assert.invalid('<angle [0,1deg]>', '1px')
    })
    test('representation', () => {
        assert.representation('<angle> | <zero>', '0', {
            types: ['<dimension-token>', '<dimension>', '<angle>'],
            unit: 'deg',
            value: 0,
        }),
        assert.representation('<angle-percentage> | <zero>', '0', {
            types: ['<dimension-token>', '<dimension>', '<angle>', '<angle-percentage>'],
            unit: 'deg',
            value: 0,
        }),
        assert.representation('<angle>', '1deg', angle(1, 'deg'))
    })
    test('valid', () => {
        assert.valid('<angle [0,1turn]>', '1turn')
        assert.valid('<angle [0,1turn]>', '360deg')
    })
})
describe('<decibel>', () => {
    test('invalid', () => {
        assert.invalid('<decibel [0,1db]>', '-1db')
        assert.invalid('<decibel [0,1db]>', '1')
        assert.invalid('<decibel [0,1db]>', '1px')
    })
    test('representation', () => {
        assert.representation('<decibel>', '1db', decibel(1))
    })
    test('valid', () => {
        assert.valid('<decibel [0,∞]>', '0db')
    })
})
describe('<flex>', () => {
    test('invalid', () => {
        assert.invalid('<flex>', '-1fr')
        assert.invalid('<flex [0,1fr]>', '1')
        assert.invalid('<flex [0,1fr]>', '1px')
    })
    test('representation', () => {
        assert.representation('<flex>', '1fr', flex(1))
    })
    test('valid', () => {
        assert.valid('<flex [0,∞]>', '0fr')
    })
})
describe('<frequency>', () => {
    test('invalid', () => {
        assert.invalid('<frequency [0,1hz]>', '-1hz')
        assert.invalid('<frequency [0,1hz]>', '1khz')
        assert.invalid('<frequency [0,1hz]>', '1')
        assert.invalid('<frequency [0,1hz]>', '1px')
    })
    test('representation', () => {
        assert.representation('<frequency>', '1hz', frequency(1, 'hz'))
    })
    test('valid', () => {
        assert.valid('<frequency [0,1khz]>', '1khz')
        assert.valid('<frequency [0,1khz]>', '1000hz')
    })
})
describe('<length>', () => {
    test('invalid', () => {
        assert.invalid('<length [0,1px]>', '-1px')
        assert.invalid('<length [0,1px]>', '1in')
        assert.invalid('<length [0,1px]>', '1')
        assert.invalid('<length [0,1px]>', '1%')
    })
    test('representation', () => {
        assert.representation('<length>', '0', {
            types: ['<dimension-token>', '<dimension>', '<length>'],
            unit: 'px',
            value: 0,
        })
        assert.representation('<length>', '1px', length(1, 'px'))
    })
    test('valid', () => {
        assert.valid('<length [0,1in]>', '1in')
        assert.valid('<length [0,1in]>', '96px')
    })
})
describe('<percentage>', () => {
    test('invalid', () => {
        assert.invalid('<percentage [0,∞]>', '-1%')
        assert.invalid('<percentage [0,∞]>', '0')
        assert.invalid('<percentage [0,∞]>', '1px')
    })
    test('representation', () => {
        assert.representation('<percentage>', '1%', percentage(1))
    })
    test('valid', () => {
        // Scientific notation
        assert.valid('<percentage [0,∞]>', '1e1%', '10%')
        assert.valid('<percentage [0,∞]>', '1e+1%', '10%')
        assert.valid('<percentage [0,∞]>', '1e-1%', '0.1%')
        // Leading 0
        assert.valid('<percentage [0,∞]>', '.1%', '0.1%')
        // Trailing 0
        assert.valid('<percentage [0,∞]>', '0.10%', '0.1%')
    })
})
describe('<length-percentage>', () => {
    test('invalid', () => {
        assert.invalid('<length-percentage [0,∞]>', '-1px')
        assert.invalid('<length-percentage [0,∞]>', '-1%')
        assert.invalid('<length-percentage [0,∞]>', '1deg')
    })
    test('representation', () => {
        assert.representation('<length-percentage>', '1px', length(1, 'px', ['<length-percentage>']))
    })
    test('valid', () => {
        assert.valid('<length-percentage [0,∞]>', '1px')
        assert.valid('<length-percentage [0,∞]>', '1%')
    })
})
describe('<semitones>', () => {
    test('invalid', () => {
        assert.invalid('<semitones [0,1st]>', '-1st')
        assert.invalid('<semitones [0,1st]>', '1')
        assert.invalid('<semitones [0,1st]>', '1px')
    })
    test('representation', () => {
        assert.representation('<semitones>', '1st', semitones(1))
    })
    test('valid', () => {
        assert.valid('<semitones [0,∞]>', '1st')
    })
})
describe('<resolution>', () => {
    test('invalid', () => {
        assert.invalid('<resolution>', '-1dppx')
        assert.invalid('<resolution [0,1dppx]>', '1dpi')
        assert.invalid('<resolution [0,1dppx]>', '1')
        assert.invalid('<resolution [0,1dppx]>', '1px')
    })
    test('representation', () => {
        assert.representation('<resolution>', '1dppx', resolution(1, 'dppx'))
    })
    test('valid', () => {
        assert.valid('<resolution [0,1dpi]>', '1dpi')
        assert.valid('<resolution [0,1dpi]>', '96dppx')
    })
})
describe('<time>', () => {
    test('invalid', () => {
        assert.invalid('<time [0,1ms]>', '-1ms')
        assert.invalid('<time [0,1ms]>', '1s')
        assert.invalid('<time [0,1ms]>', '1')
        assert.invalid('<time [0,1ms]>', '1px')
    })
    test('representation', () => {
        assert.representation('<time>', '1s', time(1, 's'))
    })
    test('valid', () => {
        assert.valid('<time [0,1s]>', '1s')
        assert.valid('<time [0,1s]>', '1000ms')
    })
})
describe('<n-dimension>', () => {
    test('invalid', () => {
        assert.invalid('<n-dimension>', '1n-')
        assert.invalid('<n-dimension>', '1.1n')
    })
    test('representation', () => {
        assert.representation('<n-dimension>', '1n', dimensionToken(1, 'n', ['<n-dimension>']))
    })
})
describe('<ndash-dimension>', () => {
    test('invalid', () => {
        assert.invalid('<ndash-dimension>', '1n')
        assert.invalid('<ndash-dimension>', '1.1n-')
    })
    test('representation', () => {
        assert.representation('<ndash-dimension>', '1n-', dimensionToken(1, 'n-', ['<ndash-dimension>']))
    })
})
describe('<ndashdigit-dimension>', () => {
    test('invalid', () => {
        assert.invalid('<ndashdigit-dimension>', '1n-')
        assert.invalid('<ndashdigit-dimension>', '1.1n-1')
    })
    test('representation', () => {
        assert.representation('<ndashdigit-dimension>', '1n-11', dimensionToken(1, 'n-11', ['<ndashdigit-dimension>']))
    })
})

describe('<calc()>', () => {
    test('invalid', () => {
        // Whitespace required on both sides of `+` and `-`
        assert.invalid('<number>', 'calc(1+ 1)')
        assert.invalid('<number>', 'calc(1 +1)')
        assert.invalid('<number>', 'calc(1- 1)')
        assert.invalid('<number>', 'calc(1 -1)')
        // Maximum 32 <calc-value>
        assert.invalid('<number>', `calc(${[...Array(32)].reduce((n, _, i) => `${n} ${i % 2 ? '+' : '*'} 1`, '0')})`)
        assert.invalid('<number>', `calc(${[...Array(32)].reduce(n => `(${n})`, '1')})`)
        assert.invalid('<number>', `calc(${[...Array(32)].reduce(n => `calc(${n})`, '1')})`)
        assert.invalid('<number>', `calc((1) + ${[...Array(30)].reduce(n => `(${n})`, '1')})`)
        assert.invalid('<number>', `calc(calc(1) + ${[...Array(30)].reduce(n => `calc(${n})`, '1')})`)
        // Result type failure or mismatch
        assert.invalid('<number>', 'calc(1px)')
        assert.invalid('<number>', 'calc(1%)')
        assert.invalid('<number>', 'calc(1 + 1px)')
        assert.invalid('<number>', 'calc(1 - 1px)')
        assert.invalid('<number>', 'calc(1 / 1px)')
        assert.invalid('<number>', 'calc(1% / 1%)')
        assert.invalid('<number>', 'calc(1px * 1px)')
        assert.invalid('<number>', 'calc((1% + 1px) / 1px)')
        assert.invalid('<number>', 'calc(1px / 1 * 1px)')
        assert.invalid('<number>', 'calc(1 / 1px / 1px)')
        assert.invalid('<length>', 'calc(1)')
        assert.invalid('<length>', 'calc(1%)')
        assert.invalid('<length>', 'calc(1px + 1)')
        assert.invalid('<length>', 'calc(1px - 1)')
        assert.invalid('<length>', 'calc(1 / 1px)')
        assert.invalid('<length>', 'calc(1px * 1px)')
        assert.invalid('<length>', 'calc(1px / 1px)')
        assert.invalid('<length>', 'calc(1px / 1px / 1px)')
        assert.invalid('<length>', 'calc(1px / 1% / 1%)')
        assert.invalid('<length>', 'calc(1px + 1s)')
        assert.invalid('<length>', 'calc(1px - 1s)')
        assert.invalid('<length>', 'calc(1px * 1s)')
        assert.invalid('<length>', 'calc(1px / 1s)')
        assert.invalid('<length>', 'calc(1px + 1%)')
        assert.invalid('<length>', 'calc(1px - 1%)')
        assert.invalid('<length>', 'calc(1px * 1%)')
        assert.invalid('<length>', 'calc(1px / 1%)')
        assert.invalid('<length>', 'calc(1% / 1px)')
        assert.invalid('<dimension>', 'calc(1n)')
        assert.invalid('<dimension>', 'calc(1px + 1s)')
        assert.invalid('<dimension> | <percentage>', 'calc(1px + 1%)')
        assert.invalid('<percentage>', 'calc(1)')
        assert.invalid('<percentage>', 'calc(1px)')
        assert.invalid('<percentage>', 'calc(1% + 1)')
        assert.invalid('<percentage>', 'calc(1% - 1)')
        assert.invalid('<percentage>', 'calc(1 / 1%)')
        assert.invalid('<percentage>', 'calc(1% * 1%)')
        assert.invalid('<percentage>', 'calc(1% / 1%)')
        // 0 is parsed as <number> in calculations
        assert.invalid('<length>', 'calc(0 + 1px)')
        assert.invalid('<length>', 'calc(0 - 1px)')
        // <number> and <percentage> are not combinable
        assert.invalid('<number> | <percentage>', 'calc(1 + 1%)')
        assert.invalid('<number> | <percentage>', 'calc(1 - 1%)')
    })
    test('representation', () => {

        const one = number(1, ['<calc-value>'])
        const two = number(2, ['<calc-value>'])

        // Unresolved calculation
        assert.representation('<calc()>', 'calc(1)', {
            name: 'calc',
            types: ['<function>', '<calc()>'],
            value: one,
        })
        assert.representation('<calc()>', 'calc(1 + 2)', {
            name: 'calc',
            types: ['<function>', '<calc()>'],
            value: list([one, two], '+', ['<calc-sum>']),
        })
        assert.representation('<calc()>', 'calc(1 - 2)', {
            name: 'calc',
            types: ['<function>', '<calc()>'],
            value: list([one, { types: ['<calc-negate>'], value: two }], '+', ['<calc-sum>']),
        })
        assert.representation('<calc()>', 'calc(1 * 2)', {
            name: 'calc',
            types: ['<function>', '<calc()>'],
            value: list([one, two], '*', ['<calc-product>']),
        })
        assert.representation('<calc()>', 'calc(1 / 2)', {
            name: 'calc',
            types: ['<function>', '<calc()>'],
            value: list([one, { types: ['<calc-invert>'], value: two }], '*', ['<calc-product>']),
        })
        // Resolved calculation
        assert.representation('<number>', 'calc(1)', {
            name: 'calc',
            range: undefined,
            round: false,
            types: ['<function>', '<calc()>', '<calc-function>'],
            value: number(1, ['<calc-value>']),
        })
        assert.representation('<number>', 'calc(1 + 2)', {
            name: 'calc',
            range: undefined,
            round: false,
            types: ['<function>', '<calc()>', '<calc-function>'],
            value: {
                types: ['<number-token>', '<number>', '<calc-value>'],
                value: 3,
            },
        })
    })
    test('valid single operand', () => {
        // <number>, <dimension>, <percentage>
        assert.valid('<number>', 'CALC(1)', 'calc(1)')
        assert.valid('<length>', 'calc(1px)')
        assert.valid('<dimension>', 'calc(1px)')
        assert.valid('<percentage>', 'calc(1%)')
        // <calc-keyword>
        assert.valid('<number>', 'calc(e)', `calc(${Math.E.toFixed(6)})`)
        assert.valid('<number>', 'calc(pi)', `calc(${Math.PI.toFixed(6)})`)
        assert.valid('<number>', 'calc(infinity)')
        assert.valid('<number>', 'calc(-infinity)')
        assert.valid('<number>', 'calc(nan)', 'calc(NaN)')
        // <type-percentage>
        assert.valid('<number> | <percentage>', 'calc(1)')
        assert.valid('<number> | <percentage>', 'calc(100%)')
        assert.valid('<length-percentage>', 'calc(1px)')
        assert.valid('<length-percentage>', 'calc(1%)')
        assert.valid('<length> | <percentage>', 'calc(1%)')
        assert.valid('<length> | <percentage>', 'calc(1px)')
        assert.valid('a | <percentage> | b | <length> | c', 'calc(1%)')
        assert.valid('a | <percentage> | b | <length> | c', 'calc(1px)')
        // Nested calculation or math function
        assert.valid('<length>', 'calc((1em))', 'calc(1em)')
        assert.valid('<length>', 'calc(calc(1em))', 'calc(1em)')
        assert.valid('<length>', 'calc(min(1em))', 'calc(1em)')
        assert.valid('<number>', 'calc(sign(1em))', 'sign(1em)')
    })
    test('valid operands of identical units', () => {
        // Unitless
        assert.valid('<number>', 'calc(1 + 1 + 1 + 1)', 'calc(4)')
        assert.valid('<number>', 'calc(4 - 1 - 1 - 1)', 'calc(1)')
        assert.valid('<number>', 'calc(1 * 2 * 3 * 4)', 'calc(24)')
        assert.valid('<number>', 'calc(42 / 7 / 3 / 2)', 'calc(1)')
        assert.valid('<number>', 'calc(1 + 2 * 3 - 2 / 1)', 'calc(5)')
        // Unitful
        assert.valid('<length>', 'calc(3px * 2px / 2px)', 'calc(3px)')
        assert.valid('<percentage>', 'calc(1% + 1%)', 'calc(2%)')
        assert.valid('<percentage>', 'calc(1% - 1%)', 'calc(0%)')
        assert.valid('<percentage>', 'calc(3% * 2% / 2%)', 'calc(3%)')
        assert.valid('<percentage>', 'calc(3% / 2% * 2%)', 'calc(3%)')
        // <calc-keyword>
        assert.valid('<number>', 'calc(1 * e)', `calc(${Math.E.toFixed(6)})`)
        assert.valid('<number>', 'calc(1 * infinity)', 'calc(infinity)')
        assert.valid('<number>', 'calc(1 * nan)', 'calc(NaN)')
        // -0
        assert.valid('<number>', 'calc(1 / -0)', 'calc(infinity)')
        assert.valid('<number>', 'calc(1 / (0 * -1))', 'calc(-infinity)')
        // Nested calculation or math function
        assert.valid('<number>', 'calc(1 + 2 * (3 + 4))', 'calc(15)')
        assert.valid('<number>', 'calc((1 + 2) * 3 / (4 + 5))', 'calc(1)')
        assert.valid('<number>', 'calc(calc(1 + 2) * 3 / calc(4 + 5))', 'calc(1)')
        assert.valid('<number>', 'calc(min(1, 2) + sign(1))', 'calc(2)')
        assert.valid('<number>', 'calc(min(1, 2) - sign(1))', 'calc(0)')
        assert.valid('<number>', 'calc(min(1, 2) * sign(1))', 'calc(1)')
        assert.valid('<number>', 'calc(min(1, 2) / sign(1))', 'calc(1)')
        // Maximum 32 <calc-value>
        assert.valid('<number>', `calc(${[...Array(31)].reduce((n, _, i) => `${n} ${i % 2 ? '+' : '*'} 1`, '0')})`, 'calc(15)')
        assert.valid('<number>', `calc(${[...Array(31)].reduce(n => `(${n})`, '1')})`, 'calc(1)')
        assert.valid('<number>', `calc(${[...Array(31)].reduce(n => `calc(${n})`, '1')})`, 'calc(1)')
        assert.valid('<number>{2}', `calc(${[...Array(31)].reduce(n => `${n} + 1`, '1')}) calc(1)`, 'calc(32) calc(1)')
        assert.valid('<number>{2}', `calc(${[...Array(31)].reduce(n => `calc(${n})`, '1')}) calc(calc(1))`, 'calc(1) calc(1)')
    })
    test('valid operands of different units', () => {
        // Absolute unit
        assert.valid('<angle>', 'calc(1deg + 200grad)', 'calc(181deg)')
        assert.valid('<angle>', `calc(1deg + ${Math.PI}rad)`, 'calc(181deg)')
        assert.valid('<angle>', 'calc(1deg + 0.5turn)', 'calc(181deg)')
        assert.valid('<length>', 'calc(1px + 1cm)', `calc(${(1 + (96 / 2.54)).toFixed(6)}px)`)
        assert.valid('<length>', 'calc(1px + 1mm)', `calc(${(1 + (96 / 2.54 / 10)).toFixed(6)}px)`)
        assert.valid('<length>', 'calc(1px + 1Q)', `calc(${(1 + (96 / 2.54 / 40)).toFixed(6)}px)`)
        assert.valid('<length>', 'calc(1px + 1in)', 'calc(97px)')
        assert.valid('<length>', 'calc(1px + 1pc)', 'calc(17px)')
        assert.valid('<length>', 'calc(1px + 1pt)', `calc(${(1 + (96 / 72)).toFixed(6)}px)`)
        assert.valid('<frequency>', 'calc(1khz + 1hz)', 'calc(1001hz)')
        assert.valid('<resolution>', 'calc(1dppx + 1x)', 'calc(2dppx)')
        assert.valid('<resolution>', 'calc(1dppx + 1dpcm)', `calc(${(1 + (96 / 2.54)).toFixed(6)}dppx)`)
        assert.valid('<resolution>', 'calc(1dppx + 1dpi)', 'calc(97dppx)')
        assert.valid('<time>', 'calc(1s + 1ms)', 'calc(1.001s)')
        assert.valid('<length>', 'calc(1cm - 5mm)', `calc(${(96 / 2.54 / 2).toFixed(6)}px)`)
        assert.valid('<number>', 'calc(1cm / 5mm)', 'calc(2)')
        assert.valid('<number>', 'calc(1px / 1em)')
        // Absolute and relative units
        assert.valid('<length>', 'calc(1px + (1em + 1px) + 1em)', 'calc(2em + 2px)')
        assert.valid('<length>', 'calc(1px - 1em - 1px - 1em)', 'calc(-2em + 0px)')
        assert.valid('<length>', 'calc(1em * 1px / 1px)')
        assert.valid('<length>', 'calc(1px / 1px * 1em)', 'calc(1em * 1px / 1px)')
        // Nested math function
        assert.valid('<length>', 'calc(min(1px, 2em))', 'min(1px, 2em)')
        assert.valid('<length>', 'calc(min(1px, 2em) + 1px)', 'calc(1px + min(1px, 2em))')
        assert.valid('<length>', 'calc(min(1px, 2em) - 1px)', 'calc(-1px + min(1px, 2em))')
    })
    test('valid operands of different types', () => {
        // Addition and substraction
        assert.valid('<length-percentage>', 'calc(1px + (1% + 1px) + 1%)', 'calc(2% + 2px)')
        assert.valid('<length-percentage>', 'calc(1px - 1% - 1px - 1%)', 'calc(-2% + 0px)')
        // Multiplication or division by <number>
        assert.valid('<length>', 'calc(3em * 2 / 3)', 'calc(2em)')
        assert.valid('<length>', 'calc(3 * 2em / 3)', 'calc(2em)')
        assert.valid('<length>', 'calc(2 / 3 * 3em)', 'calc(2em)')
        assert.valid('<length>', 'calc(2em / 2)', 'calc(1em)')
        assert.valid('<length>', 'calc(1px + 2em / 0)', 'calc(infinity * 1px + 1px)')
        assert.valid('<length>', 'calc(1px + 0em / 0)', 'calc(NaN * 1px + 1px)')
        assert.valid('<percentage>', 'calc(3% * 2 / 3)', 'calc(2%)')
        assert.valid('<percentage>', 'calc(3 * 2% / 3)', 'calc(2%)')
        assert.valid('<percentage>', 'calc(2 / 3 * 3%)', 'calc(2%)')
        assert.valid('<percentage>', 'calc(2% / 2)', 'calc(1%)')
        // Multiplication or division to <number>
        assert.valid('<number>', 'calc(2 * 3px / 3px)', 'calc(2)')
        assert.valid('<number>', 'calc(2 / 3px * 3px)', 'calc(2)')
        assert.valid('<number>', 'calc(2px * 3 / 3px)', 'calc(2)')
        assert.valid('<number>', 'calc(9px / 3 / 3px)', 'calc(1)')
        assert.valid('<number>', 'calc(2px / 3px * 3)', 'calc(2)')
        assert.valid('<number>', 'calc(9px / 3px / 3)', 'calc(1)')
        // Multiplication or division by unresolved <number>
        assert.valid('<length>', 'calc(1em * 1em / 1px)')
        assert.valid('<length>', 'calc(1em / 1em * 1px)', 'calc(1em * 1px / 1em)')
        assert.valid('<length>', 'calc(1px * 1em / 1em)', 'calc(1em * 1px / 1em)')
        assert.valid('<length>', 'calc(1px / 1em * 1em)', 'calc(1em * 1px / 1em)')
        assert.valid('<length-percentage>', 'calc(1% * 1% / 1px)')
        assert.valid('<length-percentage>', 'calc(1% / 1% * 1px)', 'calc(1% * 1px / 1%)')
        assert.valid('<length-percentage>', 'calc(1px * 1% / 1%)', 'calc(1% * 1px / 1%)')
        assert.valid('<length-percentage>', 'calc(1px / 1% * 1%)', 'calc(1% * 1px / 1%)')
        // Distribution of <number>
        assert.valid('<length>', 'calc((1px + 2em) * 3)', 'calc(6em + 3px)')
        assert.valid('<length>', 'calc((1px + 2em) * infinity)', 'calc(infinity * 1px + infinity * 1px)')
        assert.valid('<length>', 'calc((1px + 2em) * NaN)', 'calc(NaN * 1px + NaN * 1px)')
        assert.valid('<length>', 'calc((2px + 2em) / 2)', 'calc(1em + 1px)')
        assert.valid('<length-percentage>', 'calc((1px + 2%) * 3)', 'calc(6% + 3px)')
        assert.valid('<length-percentage>', 'calc((2px + 2%) / 2)', 'calc(1% + 1px)')
        assert.valid('<number>', 'calc(2 * 1px / 1em)', 'calc(2px / 1em)')
        assert.valid('<number>', 'calc(2 * (1px + 1em) / 1em)', 'calc((2em + 2px) / 1em)')
        assert.valid('<length>', 'calc(2 * (1em * (1px / 1em)))', 'calc(2em * 1px / 1em)')
        assert.valid('<number>', 'calc(1px / 1em * 2)', 'calc(2px / 1em)')
        assert.valid('<number>', 'calc((1px + 1em) / 1em * 2)', 'calc((2em + 2px) / 1em)')
        // Nested math function
        assert.valid('<length>', 'calc(min(1px, 2px) * sign(1px))', 'calc(1px)')
        assert.valid('<length>', 'calc(min(1px, 2px) / sign(1px))', 'calc(1px)')
        assert.valid('<length>', 'calc(min(1px, 2em) * sign(1px))', 'min(1px, 2em)')
        assert.valid('<length>', 'calc(min(1px, 2em) / sign(1px))', 'min(1px, 2em)')
    })
})
describe('<min()>, <max()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'min(1, 1px)')
        assert.invalid('<number> | <percentage>', 'min(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'min((1% + 1px) / 1px)')
        assert.invalid('<length>', 'min(1px, 1%)')
        // Maximum 32 <calc-value>
        assert.invalid('<number>', `min(${[...Array(16)].map(() => '1 + 1').join(', ')}, 1)`)
        assert.invalid('<number>', `min(${[...Array(16)].map(() => '((1))').join(', ')}, (1))`)
        // Maximum 32 arguments
        assert.invalid('<number>', `min(${[...Array(33)].map(() => 1).join(', ')})`)
    })
    test('representation', () => {
        assert.representation('<min()>', 'min(1)', {
            name: 'min',
            types: ['<function>', '<min()>'],
            value: list([number(1, ['<calc-value>'])], ','),
        })
    })
    test('valid', () => {
        // Single argument
        assert.valid('<number>', 'min(1)', 'calc(1)')
        assert.valid('<length>', 'min(1em)', 'calc(1em)')
        assert.valid('<length-percentage>', 'min(1%)', 'calc(1%)')
        // Identical units
        assert.valid('<number>', 'min(0, 1)', 'calc(0)')
        assert.valid('<length>', 'MIN(0em, 1em)', 'min(0em, 1em)')
        assert.valid('<length-percentage>', 'min(0%, 1%)')
        assert.valid('<percentage>', 'min(0%, 1%)', 'calc(0%)')
        // Different units
        assert.valid('<length>', 'min(1px, 1in)', 'calc(1px)')
        assert.valid('<length>', 'max(1px, 1in)', 'calc(96px)')
        assert.valid('<length-percentage>', 'min(1px, min(0%, 1%))')
        // Maximum 32 <calc-value>
        assert.valid('<number>', `min(${[...Array(15)].map(() => '1 + 1').join(', ')}, 1)`, 'calc(1)')
        assert.valid('<number>', `min(${[...Array(15)].map(() => '(1)').join(', ')}, (1))`, 'calc(1)')
        // Maximum 32 arguments
        assert.valid('<number>', `min(${[...Array(32)].map((_, i) => i).join(', ')})`, 'calc(0)')
    })
})
describe('<clamp()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'clamp(1, 1px, 1)')
        assert.invalid('<number> | <percentage>', 'clamp(1, 1%, 1)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'clamp(1, (1% + 1px) / 1px, 1)')
        assert.invalid('<length>', 'clamp(1px, 1%, 1px)')
    })
    test('valid', () => {
        // Identical units
        assert.valid('<number>', 'clamp(0, 1, 2)', 'calc(1)')
        assert.valid('<number>', 'clamp(0, 2, 1)', 'calc(1)')
        assert.valid('<number>', 'clamp(1, 0, 2)', 'calc(1)')
        assert.valid('<number>', 'clamp(1, 2, 0)', 'calc(1)')
        assert.valid('<length>', 'CLAMP(0em, 1em, 2em)', 'clamp(0em, 1em, 2em)')
        assert.valid('<length-percentage>', 'clamp(0%, 1%, 2%)')
        assert.valid('<percentage>', 'clamp(0%, 1%, 2%)', 'calc(1%)')
        // Different units
        assert.valid('<length>', 'clamp(0px, 1in, 2px)', 'calc(2px)')
        assert.valid('<length>', 'clamp(0em, 1px, 2px)')
        assert.valid('<length-percentage>', 'clamp(0px, 1px, clamp(0%, 1%, 2%))')
        // none
        assert.valid('<number>', 'clamp(0, 1, none)')
        assert.valid('<number>', 'clamp(none, 1, 2)')
        assert.valid('<number>', 'clamp(none, 1, none)', 'calc(1)')
    })
})
describe('<round()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'round(1, 1px)')
        assert.invalid('<number> | <length>', 'round(1px)')
        assert.invalid('<number> | <percentage>', 'round(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'round(1, (1% + 1px) / 1px)')
        assert.invalid('<length>', 'round(1px, 1%)')
    })
    test('valid', () => {
        // Identical units
        assert.valid('<number>', 'round(1.1, 1)', 'calc(1)')
        assert.valid('<number>', 'round(1, 2)', 'calc(2)')
        assert.valid('<number>', 'round(up, 1.1)', 'calc(2)')
        assert.valid('<number>', 'round(down, 1.9)', 'calc(1)')
        assert.valid('<number>', 'round(to-zero, 1, 2)', 'calc(0)')
        assert.valid('<number>', 'round(to-zero, -1, 2)', 'calc(0)')
        assert.valid('<length>', 'ROUND(1em, 1em)', 'round(1em, 1em)')
        assert.valid('<length-percentage>', 'round(1%, 1%)')
        assert.valid('<percentage>', 'round(1%, 1%)', 'calc(1%)')
        // Different units
        assert.valid('<length>', 'round(1cm, 1px)', 'calc(38px)')
        assert.valid('<length>', 'round(1em, 1px)')
        assert.valid('<length-percentage>', 'round(1px, round(1%, 1%))')
        // Omitted component values
        assert.valid('<number>', 'round(nearest, 1px / 1em, 1)', 'round(1px / 1em)')
    })
    test('valid resulting to 0⁻, 0⁺, NaN, or Infinity', () => {
        // Rounding 0⁻ or 0⁺ is preserved as is (it is a multiple of every number)
        assert.valid('<number>', 'calc(1 / round(-0, 1))', 'calc(infinity)')
        assert.valid('<number>', 'calc(1 / round(-1 * 0, 1))', 'calc(-infinity)')
        // Rounding up to 0 results to 0⁻
        assert.valid('<number>', 'calc(1 / round(-1, 2))', 'calc(-infinity)')
        // 0 as step value results to NaN
        assert.valid('<number>', 'round(1, 0)', 'calc(NaN)')
        // An infinite input and step values result to NaN
        assert.valid('<number>', 'round(1 / 0, 1 / 0)', 'calc(NaN)')
        assert.valid('<number>', 'round(1 / 0, -1 / 0)', 'calc(NaN)')
        assert.valid('<number>', 'round(-1 / 0, 1 / 0)', 'calc(NaN)')
        assert.valid('<number>', 'round(-1 / 0, -1 / 0)', 'calc(NaN)')
        // An infinite input value results to the same infinite value (if step value is finite and not 0)
        assert.valid('<number>', 'round(-infinity, 1)', 'calc(-infinity)')
        assert.valid('<number>', 'round(infinity, 1)', 'calc(infinity)')
        // Rounding to nearest/zero with an infinite step value results to 0⁻ if input value is negative or 0⁻ (but finite)
        assert.valid('<number>', 'calc(1 / round(-1, -infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(-1, infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(0 * -1, -infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(0 * -1, infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(to-zero, -1, -infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(to-zero, -1, infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(to-zero, 0 * -1, -infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(to-zero, 0 * -1, infinity))', 'calc(-infinity)')
        // Rounding to nearest/zero with an infinite step value results to 0⁺ if input value is 0⁺ or positive (but finite)
        assert.valid('<number>', 'round(0, -infinity)', 'calc(0)')
        assert.valid('<number>', 'round(0, infinity)', 'calc(0)')
        assert.valid('<number>', 'round(1, -infinity)', 'calc(0)')
        assert.valid('<number>', 'round(1, infinity)', 'calc(0)')
        assert.valid('<number>', 'round(to-zero, 0, -infinity)', 'calc(0)')
        assert.valid('<number>', 'round(to-zero, 0, infinity)', 'calc(0)')
        assert.valid('<number>', 'round(to-zero, 1, -infinity)', 'calc(0)')
        assert.valid('<number>', 'round(to-zero, 1, infinity)', 'calc(0)')
        // Rounding up with an infinite step value results to 0⁻ if input value is negative or 0⁻ (but finite)
        assert.valid('<number>', 'calc(1 / round(up, 0 * -1, infinity))', 'calc(-infinity)')
        assert.valid('<number>', 'calc(1 / round(up, -1, infinity))', 'calc(-infinity)')
        // Rounding up with an infinite step value results to the same input value if it is 0⁺ (but finite)
        assert.valid('<number>', 'round(up, 0, infinity)', 'calc(0)')
        // Rounding up with an infinite step value results to Infinity if input value is positive (but finite)
        assert.valid('<number>', 'round(up, 1, infinity)', 'calc(infinity)')
        // Rounding down with an infinite step value results to -Infinity if input value is negative (but finite)
        assert.valid('<number>', 'round(down, -1, infinity)', 'calc(-infinity)')
        // Rounding down with an infinite step value results to the same input value if it is 0⁻
        assert.valid('<number>', 'calc(1 / round(down, 0 * -1, infinity))', 'calc(-infinity)')
        // Rounding down with an infinite step value results to the same input value if it is 0⁺ or positive (but finite)
        assert.valid('<number>', 'round(down, 0, infinity)', 'calc(0)')
        assert.valid('<number>', 'round(down, 1, infinity)', 'calc(0)')
    })
})
describe('<mod()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'mod(1, 1px)')
        assert.invalid('<number> | <percentage>', 'mod(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'mod(1, (1% + 1px) / 1px)')
        assert.invalid('<length>', 'mod(1px, 1%)')
    })
    test('valid', () => {
        // Identical units
        assert.valid('<number>', 'mod(3, 2)', 'calc(1)')
        assert.valid('<number>', 'mod(3, -2)', 'calc(-1)')
        assert.valid('<number>', 'mod(-3, 2)', 'calc(1)')
        assert.valid('<length>', 'MOD(3em, 2em)', 'mod(3em, 2em)')
        assert.valid('<length-percentage>', 'mod(3%, 2%)')
        assert.valid('<percentage>', 'mod(3%, 2%)', 'calc(1%)')
        // Different units
        assert.valid('<length>', 'mod(1in, 5px)', 'calc(1px)')
        assert.valid('<length>', 'mod(1em, 1px)')
        assert.valid('<length-percentage>', 'mod(1px, mod(1%, 1%))')
    })
    test('valid resulting to NaN or Infinity', () => {
        // 0 as modulus value results to NaN
        assert.valid('<number>', 'mod(1, 0)', 'calc(NaN)')
        // An infinite input value results to NaN
        assert.valid('<number>', 'mod(1 / 0, 1)', 'calc(NaN)')
        // A positive infinite modulus value and a negative input value results to NaN (or the other way around)
        assert.valid('<number>', 'mod(1, -1 / 0)', 'calc(NaN)')
        assert.valid('<number>', 'mod(-1, 1 / 0)', 'calc(NaN)')
        // An infinite modulus value results to the input value as is (if it has the same sign that the input value)
        assert.valid('<number>', 'mod(-1, -infinity)', 'calc(-1)')
        assert.valid('<number>', 'mod(1, infinity)', 'calc(1)')
    })
})
describe('<rem()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'rem(1, 1px)')
        assert.invalid('<number> | <percentage>', 'rem(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'rem(1, (1% + 1px) / 1px)')
        assert.invalid('<length>', 'rem(1px, 1%)')
    })
    test('valid', () => {
        // Identical units
        assert.valid('<number>', 'rem(3, 2)', 'calc(1)')
        assert.valid('<number>', 'rem(3, -2)', 'calc(1)')
        assert.valid('<number>', 'rem(-3, 2)', 'calc(-1)')
        assert.valid('<length>', 'REM(3em, 2em)', 'rem(3em, 2em)')
        assert.valid('<length-percentage>', 'rem(3%, 2%)')
        assert.valid('<percentage>', 'rem(3%, 2%)', 'calc(1%)')
        // Different units
        assert.valid('<length>', 'rem(1in, 5px)', 'calc(1px)')
        assert.valid('<length>', 'rem(1em, 1px)')
        assert.valid('<length-percentage>', 'rem(1px, rem(1%, 1%))')
    })
    test('valid resulting to NaN or Infinity', () => {
        // 0 as divisor value results to NaN
        assert.valid('<number>', 'rem(1, 0)', 'calc(NaN)')
        // An infinite input value results to NaN
        assert.valid('<number>', 'rem(1 / 0, 1)', 'calc(NaN)')
        // An infinite modulus value results to the input value as is
        assert.valid('<number>', 'rem(1, infinity)', 'calc(1)')
        assert.valid('<number>', 'rem(1, -infinity)', 'calc(1)')
        assert.valid('<number>', 'rem(-1, -infinity)', 'calc(-1)')
        assert.valid('<number>', 'rem(-1, infinity)', 'calc(-1)')
    })
})
describe('<sin()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<number> | <length>', 'sin(1px)')
        assert.invalid('<number> | <percentage>', 'sin(1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'sin((1% + 1px) / 1px)')
        assert.invalid('<angle>', 'calc(sin(1% + 1deg) * 1deg)')
    })
    test('valid', () => {
        assert.valid('<number>', 'sin(45)', `calc(${+Math.sin(45).toFixed(6)})`)
        assert.valid('<number>', 'sin(45deg)', `calc(${+Math.sin(toRadians(45)).toFixed(6)})`)
        assert.valid('<angle-percentage>', 'calc(1deg * SIN(1%))', 'calc(1deg * sin(1%))')
    })
    test('valid resulting to 0⁻', () => {
        // 0⁻ as input value results as is
        assert.valid('<number>', 'calc(1 / sin(-0))', 'calc(infinity)')
        assert.valid('<number>', 'calc(1 / sin(0 * -1))', 'calc(-infinity)')
    })
})
describe('<cos()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<number> | <length>', 'cos(1px)')
        assert.invalid('<number> | <percentage>', 'cos(1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'cos((1% + 1px) / 1px)')
        assert.invalid('<angle>', 'calc(cos(1% + 1deg) * 1deg)')
    })
    test('valid', () => {
        assert.valid('<number>', 'cos(45)', `calc(${+Math.cos(45).toFixed(6)})`)
        assert.valid('<number>', 'cos(45deg)', `calc(${+Math.cos(toRadians(45)).toFixed(6)})`)
        assert.valid('<angle-percentage>', 'calc(1deg * COS(1%))', 'calc(1deg * cos(1%))')
    })
})
describe('<tan()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<number> | <length>', 'tan(1px)')
        assert.invalid('<number> | <percentage>', 'tan(1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'tan((1% + 1px) / 1px)')
        assert.invalid('<angle>', 'calc(tan(1% + 1deg) * 1deg)')
    })
    test('valid', () => {
        assert.valid('<number>', 'tan(45)', `calc(${+Math.tan(45).toFixed(6)})`)
        assert.valid('<number>', 'tan(45deg)', `calc(${+Math.tan(toRadians(45)).toFixed(6)})`)
        assert.valid('<angle-percentage>', 'calc(1deg * TAN(1%))', 'calc(1deg * tan(1%))')
    })
    test('valid resulting to 0⁻, Infinity, or -Infinity', () => {
        // 0⁻ as input value results as is
        assert.valid('<number>', 'calc(1 / tan(-0))', 'calc(infinity)')
        assert.valid('<number>', 'calc(1 / tan(-1 * 0))', 'calc(-infinity)')
        // An asymptote as input value results to Infinity or -Infinity
        assert.valid('<number>', 'tan(90deg)', 'calc(infinity)')
        assert.valid('<number>', 'tan(-270deg)', 'calc(infinity)')
        assert.valid('<number>', 'tan(450deg)', 'calc(infinity)')
        assert.valid('<number>', 'tan(-90deg)', 'calc(-infinity)')
        assert.valid('<number>', 'tan(270deg)', 'calc(-infinity)')
        assert.valid('<number>', 'tan(-450deg)', 'calc(-infinity)')
    })
})
describe('<asin()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<angle>', 'asin(1deg)')
        assert.invalid('<angle-percentage>', 'asin(1%)')
        assert.invalid('<number> | <percentage>', 'calc(asin(1%) / 1deg)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'calc(asin((1% + 1px) / 1px) / 1deg)')
        assert.invalid('<angle>', 'asin((1% + 1deg) / 1deg)')
    })
    test('valid', () => {
        assert.valid('<angle>', 'asin(0.5)', 'calc(30deg)')
        assert.valid('<angle-percentage>', 'ASIN(1% / 1deg)', 'asin(1% / 1deg)')
    })
})
describe('<acos()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<angle>', 'acos(1deg)')
        assert.invalid('<angle-percentage>', 'acos(1%)')
        assert.invalid('<number> | <percentage>', 'calc(acos(1%) / 1deg)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'calc(acos((1% + 1px) / 1px) / 1deg)')
        assert.invalid('<angle>', 'acos((1% + 1deg) / 1deg)')
    })
    test('valid', () => {
        assert.valid('<angle>', 'acos(0.5)', 'calc(60deg)')
        assert.valid('<angle-percentage>', 'ACOS(1% / 1deg)', 'acos(1% / 1deg)')
    })
})
describe('<atan()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<angle>', 'atan(1deg)')
        assert.invalid('<angle-percentage>', 'atan(1%)')
        assert.invalid('<number> | <percentage>', 'calc(atan(1%) / 1deg)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'calc(atan((1% + 1px) / 1px) / 1deg)')
        assert.invalid('<angle>', 'atan((1% + 1deg) / 1deg)')
    })
    test('valid', () => {
        assert.valid('<angle>', 'atan(0.5)', `calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`)
        assert.valid('<angle-percentage>', 'ATAN(1% / 1deg)', 'atan(1% / 1deg)')
    })
})
describe('<atan2()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'calc(atan2(1, 1px) / 1deg)')
        assert.invalid('<number> | <percentage>', 'calc(atan2(1, 1%) / 1deg)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'calc(atan2(1, (1% + 1px) / 1px) / 1deg)')
        assert.invalid('<angle>', 'atan2(1deg, 1%)')
    })
    test('valid', () => {
        assert.valid('<angle>', 'atan2(1, 1)', `calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        assert.valid('<angle>', 'atan2(1px, 1px)', `calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        assert.valid('<length-percentage>', 'calc(ATAN2(1%, 1%) / 1deg * 1px)', 'calc(1px * atan2(1%, 1%) / 1deg)')
        assert.valid('<angle>', 'atan2(1in, 100px)', `calc(${+toDegrees(Math.atan2(96, 100)).toFixed(6)}deg)`)
        assert.valid('<angle>', 'atan2(1em, 1px)')
        assert.valid('<angle-percentage>', 'atan2(1deg, atan2(1%, 1%))')
    })
})
describe('<pow()>', () => {
    test('invalid', () => {
        // Calculation types mismatch
        assert.invalid('<number> | <length>', 'pow(1, 1px)')
        assert.invalid('<number> | <percentage>', 'pow(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'pow(1, (1% + 1px) / 1px)')
        assert.invalid('<length>', 'calc(1px * pow(1, (1% + 1px) / 1px))')
    })
    test('valid', () => {
        assert.valid('<number>', 'pow(4, 2)', 'calc(16)')
        assert.valid('<length-percentage>', 'calc(1px * POW(1, 1% / 1px))', 'calc(1px * pow(1, 1% / 1px))')
    })
})
describe('<sqrt()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<number> | <length>', 'sqrt(1px)')
        assert.invalid('<number> | <percentage>', 'sqrt(1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'sqrt((1% + 1px) / 1px)')
        assert.invalid('<length>', 'calc(1px * sqrt((1% + 1px) / 1px))')
    })
    test('valid', () => {
        assert.valid('<number>', 'sqrt(4)', 'calc(2)')
        assert.valid('<length-percentage>', 'calc(1px * SQRT(1% / 1px))', 'calc(1px * sqrt(1% / 1px))')
    })
})
describe('<hypot()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'hypot(1, 1px)')
        assert.invalid('<number> | <percentage>', 'hypot(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'hypot(1, (1% + 1px) / 1px)')
        assert.invalid('<length>', 'hypot(1px, 1%)')
    })
    test('valid', () => {
        // Identical units
        assert.valid('<number>', 'hypot(3, 4)', 'calc(5)')
        assert.valid('<length>', 'HYPOT(1em, 2em)', 'hypot(1em, 2em)')
        assert.valid('<length-percentage>', 'hypot(1%)')
        assert.valid('<percentage>', 'hypot(3%, 4%)', 'calc(5%)')
        // Different units
        assert.valid('<length>', 'hypot(1in, 72px)', 'calc(120px)')
        assert.valid('<length>', 'hypot(1em, 1px)')
        assert.valid('<length-percentage>', 'hypot(1px, hypot(1%))')
    })
})
describe('<log()>', () => {
    test('invalid', () => {
        // Calculation types mismatch
        assert.invalid('<number> | <length>', 'log(1, 1px)')
        assert.invalid('<number> | <percentage>', 'log(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'log(1, (1% + 1px) / 1px)')
        assert.invalid('<length>', 'calc(log(1, 1px * (1% + 1px) / 1px))')
    })
    test('valid', () => {
        assert.valid('<number>', 'log(e)', 'calc(1)')
        assert.valid('<number>', 'log(8, 2)', 'calc(3)')
        assert.valid('<length-percentage>', 'calc(1px * LOG(1, 1% / 1px))', 'calc(1px * log(1, 1% / 1px))')
        assert.valid('<length>', 'calc(1px * log(1em / 1px, e))', 'calc(1px * log(1em / 1px))')
    })
})
describe('<exp()>', () => {
    test('invalid', () => {
        // Calculation type mismatch
        assert.invalid('<number> | <length>', 'exp(1px)')
        assert.invalid('<number> | <percentage>', 'exp(1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'exp((1% + 1px) / 1px)')
        assert.invalid('<length>', 'calc(1px * exp((1% + 1px) / 1px))')
    })
    test('valid', () => {
        assert.valid('<number>', 'exp(1)', `calc(${Math.E.toFixed(6)})`)
        assert.valid('<length-percentage>', 'calc(1px * EXP(1% / 1px))', 'calc(1px * exp(1% / 1px))')
    })
})
describe('<abs()>', () => {
    test('invalid', () => {
        assert.invalid('<number> | <percentage>', 'abs((1% + 1px) / 1px)')
        assert.invalid('<length>', 'abs(1% + 1px)')
    })
    test('valid', () => {
        assert.valid('<number>', 'abs(-1)', 'calc(1)')
        assert.valid('<number>', 'abs(-infinity)', 'calc(infinity)')
        assert.valid('<length>', 'ABS(-1em)', 'abs(-1em)')
        assert.valid('<length-percentage>', 'abs(abs(-1%))')
        assert.valid('<percentage>', 'abs(-1%)', 'calc(1%)')
    })
})
describe('<sign()>', () => {
    test('invalid', () => {
        assert.invalid('<number> | <percentage>', 'sign((1% + 1px) / 1px)')
        assert.invalid('<length>', 'calc(1px * sign(1% + 1px))')
    })
    test('valid', () => {
        assert.valid('<number>', 'sign(-2)', 'calc(-1)')
        assert.valid('<number>', 'sign(-infinity)', 'calc(-1)')
        assert.valid('<number>', 'SIGN(-1em)', 'sign(-1em)')
        assert.valid('<length-percentage>', 'calc(sign(-1%) * 1%)', 'calc(1% * sign(-1%))')
    })
})
describe('<progress()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'progress(1, 1px, 1)')
        assert.invalid('<number> | <percentage>', 'progress(1, 1%, 1)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'progress(1, (1% + 1px) / 1px, 1)')
        assert.invalid('<length>', 'calc(1px * progress(1%, 1px, 1px))')
    })
    test('valid', () => {
        // Identical units
        assert.valid('<number>', 'progress(1, 0, 2)', 'calc(0.5)')
        assert.valid('<number>', 'progress(1, 2, 0)', 'calc(0.5)')
        assert.valid('<number>', 'progress(-1, 0, 2)', 'calc(-0.5)')
        assert.valid('<number>', 'PROGRESS(1em, 0em, 2em)', 'progress(1em, 0em, 2em)')
        assert.valid('<length-percentage>', 'calc(1px * progress(1%, 0%, 2%))')
        // Different units
        assert.valid('<number>', 'progress(48px, 0px, 1in)', 'calc(0.5)')
        assert.valid('<length-percentage>', 'calc(1px * progress(1px, 0%, 2px))')
        // Consistent type
        assert.valid('<number>', 'progress(1 * 1, 360deg / 1turn, 1em / 1px)', 'progress(1, 1, 1em / 1px)')
        assert.valid('<length-percentage>', 'calc(1px * progress(1 * 1, 1% / 1%, 1em / 1px))', 'calc(1px * progress(1, 1% / 1%, 1em / 1px))')
        // Equal argument values
        assert.valid('<number>', 'progress(1, 1, 1)', 'calc(0)')
    })
})
describe('<calc-mix()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'calc-mix(1, 1px)')
        assert.invalid('<number> | <percentage>', 'calc-mix(1, 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'calc-mix(1, (1% + 1px) / 1px)')
        assert.invalid('<length>', 'calc-mix(1px, 1% + 1px)')
    })
    test('valid', () => {
        assert.valid('<length>', 'CALC-MIX(1px * 1, 1px)', 'calc-mix(1px, 1px)')
        assert.valid('<length-percentage>', 'calc-mix(1px, 1%)')
        assert.valid('<length-percentage>', 'calc(1px * calc-mix(1% / 1px, (1% + 1px) / 1px))')
    })
})
describe('<calc-interpolate()>', () => {
    test('invalid', () => {
        // Invalid <progress-source> type
        assert.invalid('<number> | <length>', 'calc-interpolate(1px, 0: 1)')
        assert.invalid('<length-percentage>', 'calc-interpolate(calc(1% / 1px), 0: 1px)')
        assert.invalid('<length-percentage>', 'calc-interpolate(calc((1% + 1px) / 1px), 0: 1px)')
        assert.invalid('<length-percentage>', 'calc-interpolate(progress(1%, 1px, 1px), 0: 1px)')
        // Invalid <input-position> type
        assert.invalid('<length-percentage>', 'calc-interpolate(0, calc(1% / 1px): 0px)')
        assert.invalid('<length-percentage>', 'calc-interpolate(0, calc((1% + 1px) / 1px): 0px)')
        assert.invalid('<length-percentage>', 'calc-interpolate(0, progress(1%, 1px, 1px): 0px)')
        // Missing absolute <input-position> type
        assert.invalid('<length>', 'calc-interpolate(1px, 0: 1px)')
        // Inconsistent absolute <progress-source> and <input-position> types
        assert.invalid('<length>', 'calc-interpolate(0deg, 0px: 1px, 1px: 1px)')
        assert.invalid('<length>', 'calc-interpolate(0px, 0deg: 1px, 1px: 1px)')
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'calc-interpolate(0, 0: 1, 1: 1px)')
        assert.invalid('<number> | <percentage>', 'calc-interpolate(0, 0: 1, 1: 1%)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'calc-interpolate(0, 0: (1% + 1px) / 1px)')
        assert.invalid('<length>', 'calc-interpolate(0, 0: 1% + 1px)')
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
        valid.forEach(([definition, input, expected]) =>
            assert.valid(definition, input, expected, styleRule))
    })
})
describe('<random()>', () => {
    test('invalid', () => {
        // Inconsistent calculation types
        assert.invalid('<number> | <length>', 'random(1, 1px, 1)')
        assert.invalid('<number> | <percentage>', 'random(1, 1%, 1)')
        // Result type mismatch
        assert.invalid('<number> | <percentage>', 'random(1, (1% + 1px) / 1px, 1)')
        assert.invalid('<length>', 'random(1px, 1%, 1px)')
    })
    test('valid', () => {
        assert.valid('<number>', 'RANDOM(auto, 1 / 1, 1em / 1px)', 'random(1, 1em / 1px)', styleRule)
        assert.valid('<length-percentage>', 'random(--key, 1px, 1%)', 'random(--key, 1px, 1%)', styleRule)
        assert.valid('<length-percentage>', 'calc(1px * random(1% / 1px, 1))', 'calc(1px * random(1% / 1px, 1))', styleRule)
    })
})
describe('<sibling-count()>, <sibling-index()>', () => {
    test('valid', () => {
        assert.valid('<integer>', 'SIBLING-COUNT()', 'sibling-count()', styleRule)
        assert.valid('<length>', 'calc(sibling-count() * 1px)', 'calc(1px * sibling-count())', styleRule)
    })
})

describe('<alpha-value>', () => {
    test('representation', () => {
        assert.representation('<alpha-value>', '1', number(1, ['<alpha-value>']))
        assert.representation('<alpha-value>', '1%', percentage(1, ['<alpha-value>']))
    })
    test('valid', () => {
        assert.valid('<alpha-value>', '50%', '0.5')
    })
})
describe('<an+b>', () => {
    test('invalid', () => {
        assert.invalid('<an+b>', '+ n-1')
        assert.invalid('<an+b>', '+ n- 1')
        assert.invalid('<an+b>', '+ n -1')
        assert.invalid('<an+b>', '+ n - 1')
    })
    test('representation', () => {
        assert.representation('<an+b>', 'even', { types: ['<an+b>'], value: { a: 2, b: 0 } })
        assert.representation('<an+b>', '1n+1', { types: ['<an+b>'], value: { a: 1, b: 1 } })
    })
    test('valid', () => {
        assert.valid('<an+b>', 'even', '2n')
        assert.valid('<an+b>', 'odd', '2n+1')
        assert.valid('<an+b>', '1')
        assert.valid('<an+b>', '1n', 'n')
        assert.valid('<an+b>', 'n')
        assert.valid('<an+b>', '+n', 'n')
        assert.valid('<an+b>', '-n')
        assert.valid('<an+b>', '1n-1', 'n-1')
        assert.valid('<an+b>', 'n-1')
        assert.valid('<an+b>', '+n-1', 'n-1')
        assert.valid('<an+b>', '-n-1')
        assert.valid('<an+b>', '1n -1', 'n-1')
        assert.valid('<an+b>', 'n -1', 'n-1')
        assert.valid('<an+b>', '+n -1', 'n-1')
        assert.valid('<an+b>', '-n -1', '-n-1')
        assert.valid('<an+b>', '1n -1', 'n-1')
        assert.valid('<an+b>', 'n- 1', 'n-1')
        assert.valid('<an+b>', '+n- 1', 'n-1')
        assert.valid('<an+b>', '-n- 1', '-n-1')
        assert.valid('<an+b>', '1n - 1', 'n-1')
        assert.valid('<an+b>', '1n - 1', 'n-1')
        assert.valid('<an+b>', '1n + 1', 'n+1')
        assert.valid('<an+b>', 'n - 1', 'n-1')
        assert.valid('<an+b>', 'n + 1', 'n+1')
        assert.valid('<an+b>', '+n - 1', 'n-1')
        assert.valid('<an+b>', '+n + 1', 'n+1')
        assert.valid('<an+b>', '-n - 1', '-n-1')
        assert.valid('<an+b>', '-n + 1', '-n+1')
    })
})
describe('<anchored-feature>', () => {
    test('invalid', () => {
        assert.invalid('<anchored-feature>', 'color', containerRule)
        assert.invalid('<anchored-feature>', 'scrollable', containerRule)
    })
    test('representation', () => {
        const feature = ident('fallback', ['<mf-name>', '<mf-boolean>', '<media-feature>', '<anchored-feature>'])
        assert.representation('<anchored-feature>', 'fallback', feature, containerRule)
    })
})
describe('<animateable-feature>', () => {
    test('invalid', () => {
        assert.invalid('<animateable-feature>', 'ALL')
        assert.invalid('<animateable-feature>', 'auto')
        assert.invalid('<animateable-feature>', 'none')
        assert.invalid('<animateable-feature>', 'will-change')
    })
    test('representation', () => {
        assert.representation('<animateable-feature>', 'contents', keyword('contents', ['<animateable-feature>']))
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

        assert.representation('<arc-command>', 'arc by 0px 0px of 0px', command)
    })
    test('valid', () => {
        assert.valid('<arc-command>', 'arc by 0px 0px of 0px 0px ccw small rotate 0deg', 'arc by 0px 0px of 0px')
    })
})
describe('<attr()>', () => {
    test('representation', () => {
        const name = list([omitted, identToken('name')], '', ['<attr-name>'])
        const attribute = {
            name: 'attr',
            types: ['<function>', '<attr()>'],
            value: list([name, omitted, omitted, omitted]),
        }
        assert.representation('<attr()>', 'attr(name)', attribute)
    })
    test('valid', () => {
        assert.valid('<attr()>', 'attr(name raw-string)')
        assert.valid('<attr()>', 'attr(name raw-string, "")', 'attr(name)')
    })
})
describe('<attr-matcher>', () => {
    test('invalid', () => {
        assert.invalid('<attr-matcher>', '~ =')
    })
    test('representation', () => {
        assert.representation('<attr-matcher>', '=', list([omitted, delimiter('=')], '', ['<attr-matcher>']))
    })
})
describe('<attr-name>', () => {
    test('invalid', () => {
        assert.invalid('<attr-name>', 'prefix |name')
        assert.invalid('<attr-name>', 'prefix| name')
    })
    test('representation', () => {
        assert.representation('<attr-name>', 'name', list([omitted, identToken('name')], '', ['<attr-name>']))
    })
})
describe('<baseline-position>', () => {
    test('representation', () => {
        assert.representation('<baseline-position>', 'baseline', list([omitted, keyword('baseline')], ' ', ['<baseline-position>']))
    })
    test('valid', () => {
        assert.valid('<baseline-position>', 'first baseline', 'baseline')
    })
})
describe('<basic-shape>', () => {
    test('invalid', () => {
        assert.invalid('<basic-shape>', 'circle(1px 1px)')
        assert.invalid('<basic-shape>', 'circle(1% 1%)')
        assert.invalid('<basic-shape>', 'circle(closest-side closest-side)')
    })
    test('representation', () => {
        const px = length(1, 'px', ['<length-percentage>'])
        assert.representation('<basic-shape>', 'circle()', {
            name: 'circle',
            types: ['<function>', '<circle()>', '<basic-shape>'],
            value: list([omitted, omitted]),
        })
        assert.representation('<basic-shape>', 'ellipse()', {
            name: 'ellipse',
            types: ['<function>', '<ellipse()>', '<basic-shape>'],
            value: list([omitted, omitted]),
        })
        assert.representation('<basic-shape>', 'inset(1px)', {
            name: 'inset',
            types: ['<function>', '<inset()>', '<basic-shape-rect>', '<basic-shape>'],
            value: list([list([px]), omitted]),
        })
        assert.representation('<basic-shape>', 'path("m 1 0 v 1")', {
            name: 'path',
            types: ['<function>', '<path()>', '<basic-shape>'],
            value: list([omitted, omitted, string('m 1 0 v 1')]),
        })
        assert.representation('<basic-shape>', 'polygon(1px 1px)', {
            name: 'polygon',
            types: ['<function>', '<polygon()>', '<basic-shape>'],
            value: list([omitted, omitted, omitted, list([list([px, px])], ',')]),
        })
        assert.representation('<basic-shape>', 'rect(1px 1px 1px 1px)', {
            name: 'rect',
            types: ['<function>', '<rect()>', '<basic-shape-rect>', '<basic-shape>'],
            value: list([list([px, px, px, px]), omitted]),
        })
        assert.representation('<basic-shape>', 'xywh(1px 1px 1px 1px)', {
            name: 'xywh',
            types: ['<function>', '<xywh()>', '<basic-shape-rect>', '<basic-shape>'],
            value: list([list([px, px]), list([px, px]), omitted]),
        })
    })
    test('valid', () => {
        assert.valid('<basic-shape>', 'circle(closest-side)', 'circle()')
        assert.valid('<basic-shape>', 'circle(at center)', 'circle()')
        assert.valid('<basic-shape>', 'circle(at center center)', 'circle()')
        assert.valid('<basic-shape>', 'ellipse(1px 1px)', 'ellipse(1px)')
        assert.valid('<basic-shape>', 'ellipse(closest-side closest-side)', 'ellipse()')
        assert.valid('<basic-shape>', 'ellipse(farthest-side farthest-side)', 'ellipse(farthest-side)')
        assert.valid('<basic-shape>', 'ellipse(at center)', 'ellipse()')
        assert.valid('<basic-shape>', 'ellipse(at center center)', 'ellipse()')
        assert.valid('<basic-shape>', 'inset(1px 1px 1px 1px round 1px / 1px)', 'inset(1px round 1px)')
        assert.valid('<basic-shape>', 'inset(1px round 0px / 0px)', 'inset(1px)')
        assert.valid('<basic-shape>', 'inset(1px round 0in)')
        assert.valid('<basic-shape>', 'path(nonzero, "M0 0")', 'path("M0 0")')
        assert.valid('<basic-shape>', 'polygon(nonzero, 1px 1px)', 'polygon(1px 1px)')
        assert.valid('<basic-shape>', 'rect(1px 1px 1px 1px round 1px / 1px)', 'rect(1px 1px 1px 1px round 1px)')
        assert.valid('<basic-shape>', 'rect(1px 1px 1px 1px round 0px / 0px)', 'rect(1px 1px 1px 1px)')
        assert.valid('<basic-shape>', 'rect(1px 1px 1px 1px round 0in)')
        assert.valid('<basic-shape>', 'xywh(1px 1px 1px 1px round 1px / 1px)', 'xywh(1px 1px 1px 1px round 1px)')
        assert.valid('<basic-shape>', 'xywh(1px 1px 1px 1px round 0px / 0px)', 'xywh(1px 1px 1px 1px)')
        assert.valid('<basic-shape>', 'xywh(1px 1px 1px 1px round 0in)')
    })
})
describe('<boolean-expr>', () => {
    test('invalid', () => {
        assert.invalid('<boolean-expr[<number>]>', '1px')
    })
    test('representation', () => {
        const test = number(1, ['<test>', '<boolean-expr-group>'])
        const expression = list([test, list()], ' ', ['<boolean-expr>'])
        assert.representation('<boolean-expr[<number>]>', '1', expression)
    })
})
describe('<blur()>', () => {
    test('representation', () => {
        assert.representation('<blur()>', 'blur()', {
            name: 'blur',
            types: ['<function>', '<blur()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<blur()>', 'blur(0)', 'blur()')
        assert.valid('<blur()>', 'blur(0px)', 'blur()')
    })
})
describe('<border-radius>', () => {
    test('representation', () => {
        const radius = length(0, 'px', ['<length-percentage>'])
        const radii = list([radius], ' ', ['<legacy-border-radius-syntax>', '<border-radius>'])
        assert.representation('<border-radius>', '0px', radii)
    })
    test('valid', () => {
        assert.valid('<border-radius>', '0px / 0px', '0px')
        assert.valid('<border-radius>', '0px / 1px', '0px 1px')
    })
})
describe('<brightness()>, <contrast()>, <grayscale()>, <invert()>, <opacity()>, <saturate()>, <sepia()>', () => {
    test('representation', () => {
        assert.representation('<brightness()>', 'brightness()', {
            name: 'brightness',
            types: ['<function>', '<brightness()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<brightness()>', 'brightness(1)', 'brightness()')
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
        // Invalid basis
        assert.invalid('<calc-size()>', 'calc-size(none)', context)
        assert.invalid('<calc-size()>', 'calc-size(1, 1px)', context)
        // Invalid calculation
        assert.invalid('<calc-size()>', 'calc-size(any, size)', context)
        assert.invalid('<calc-size()>', 'calc-size(1px, 1)', context)
    })
    test('representation', () => {
        const any = keyword('any', ['<calc-size-basis>'])
        const px = dimension(1, 'px', ['<calc-value>'])
        const size = {
            name: 'calc-size',
            types: ['<function>', '<calc-size()>'],
            value: list([any, comma, px]),
        }
        assert.representation('<calc-size()>', 'calc-size(any, 1px)', size, context)
    })
    test('valid', () => {
        assert.valid('<calc-size()>', 'CALC-SIZE(auto, 1 * 1% + 1px + size)', 'calc-size(auto, 1% + 1px + size)', context)
    })
})
describe('<color>', () => {
    test('invalid', () => {
        // <hex-color>
        assert.invalid('<color>', '#ffz')
        assert.invalid('<color>', '#1')
        assert.invalid('<color>', '#12')
        assert.invalid('<color>', '#12345')
        assert.invalid('<color>', '#1234567')
        assert.invalid('<color>', '#123456789')
        // Relative color
        assert.invalid('<color>', 'rgb(r 0 0)')
        assert.invalid('<color>', 'rgb(r, 0, 0)')
        assert.invalid('<color>', 'rgb(0, 0, 0, alpha)')
        assert.invalid('<color>', 'rgb(from red x 0 0)')
        assert.invalid('<color>', 'rgb(from red calc(r + 1%) g b)')
        assert.invalid('<color>', 'color(from red srgb x g b)')
        assert.invalid('<color>', 'color(from red xyz r g b)')
    })
    test('representation', () => {

        const zero = number(0)
        const rgb = list([list([zero, zero, zero], ','), omitted, omitted])

        assert.representation('<color>', 'red', keyword('red', ['<named-color>', '<color-base>', '<color>']))
        assert.representation('<color>', '#000', hash('000', ['<hex-color>', '<color-base>', '<color>']))
        assert.representation('<color>', 'rgb(0, 0, 0)', {
            name: 'rgb',
            types: ['<function>', '<legacy-rgb-syntax>', '<rgb()>', '<color-function>', '<color-base>', '<color>'],
            value: rgb,
        })
        assert.representation('<color>', 'rgba(0, 0, 0)', {
            name: 'rgba',
            types: ['<function>', '<legacy-rgba-syntax>', '<rgba()>', '<color-function>', '<color-base>', '<color>'],
            value: rgb,
        })
    })
    test('valid <hex-color>', () => {
        assert.valid('<color>', '#F00', 'rgb(255, 0, 0)')
        assert.valid('<color>', '#0f0f', 'rgb(0, 255, 0)')
        assert.valid('<color>', '#0f06', 'rgba(0, 255, 0, 0.4)')
        assert.valid('<color>', '#0000ff', 'rgb(0, 0, 255)')
        assert.valid('<color>', '#ff00ffff', 'rgb(255, 0, 255)')
        assert.valid('<color>', '#ff00ff66', 'rgba(255, 0, 255, 0.4)')
    })
    test('valid <rgb()> or <rgba()>', () => {
        // To legacy <rgb()> or <rgba()> depending on <alpha-value>
        assert.valid('<color>', 'rgb(0 0 0)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'rgb(0 0 0 / 0)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'rgb(0 0 0 / 1)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'rgba(0 0 0)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'rgba(0 0 0 / 0)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'rgba(0 0 0 / 1)', 'rgb(0, 0, 0)')
        // From legacy color syntax
        assert.valid('<color>', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'rgb(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'rgb(0, 0, 0, 1)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'rgba(0, 0, 0)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'rgba(0, 0, 0, 1)', 'rgb(0, 0, 0)')
        // Out of range arguments
        assert.valid('<color>', 'rgb(-1 0 0 / -1)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'rgb(256 0 0 / 2)', 'rgb(255, 0, 0)')
        // Map <percentage> and `none` to <number>
        assert.valid('<color>', 'rgba(50% -1% 101% / 101%)', 'rgb(128, 0, 255)')
        assert.valid('<color>', 'rgb(none none none / none)', 'rgba(0, 0, 0, 0)')
        // Precision (at least 8 bit integers)
        assert.valid('<color>', 'rgb(127.499 0 0 / 0.498)', 'rgba(127, 0, 0, 0.498)')
        assert.valid('<color>', 'rgb(127.501 0 0 / 0.499)', 'rgba(128, 0, 0, 0.498)')
        assert.valid('<color>', 'rgb(0 0 0 / 0.501)', 'rgba(0, 0, 0, 0.5)')
        assert.valid('<color>', 'rgb(49.9% 50.1% 0% / 49.9%)', 'rgba(127, 128, 0, 0.498)')
        assert.valid('<color>', 'rgb(0.501 0.499 0 / 50.1%)', 'rgba(1, 0, 0, 0.5)')
        // Numeric substitution function
        assert.valid('<color>', 'rgb(calc(50%) calc(-1%) calc(101%) / calc(-1%))', 'rgba(128, 0, 255, 0)')
        assert.valid('<color>', 'rgb(calc(-infinity) calc(-infinity) calc(infinity))', 'rgb(0, 0, 255)')
        assert.valid('<color>', 'rgb(calc(infinity) calc(infinity) calc(-infinity))', 'rgb(255, 255, 0)')
        assert.valid('<color>', 'rgba(calc(1em / 1px) -1% 101% / -1%)', 'rgb(calc(1em / 1px) 0 255 / 0)')
        assert.valid('<color>', 'rgb(sibling-count() calc(-1) calc(256) / calc(2))', 'rgb(sibling-count() 0 255)', styleRule)
        // Relative color
        assert.valid('<color>', 'rgb(from green alpha calc(r) calc(g * 1%) / calc(b + 1 + 1))', 'rgb(from green alpha calc(r) calc(1% * g) / calc(2 + b))')
        assert.valid('<color>', 'rgba(from rgba(-1 256 0 / -1) -100% 200% 0% / 101%)', 'rgb(from rgb(-1 256 0 / 0) -255 510 0)')
    })
    test('valid <hsl()> or <hsla()>', () => {
        // To legacy <rgb()> or <rgba()> depending on <alpha-value>
        assert.valid('<color>', 'hsl(0 0 0)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsl(0 0 0 / 0)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'hsl(0 0 0 / 1)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsla(0 0 0)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsla(0 0 0 / 0)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'hsla(0 0 0 / 1)', 'rgb(0, 0, 0)')
        // From legacy color syntax
        assert.valid('<color>', 'hsl(0, 0%, 0%)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsl(0, 0%, 0%, 0)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'hsl(0, 0%, 0%, 100%)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsla(0, 0%, 0%)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsla(0, 0%, 0%, 0%)', 'rgba(0, 0, 0, 0)')
        assert.valid('<color>', 'hsla(0, 0%, 0%, 1)', 'rgb(0, 0, 0)')
        // Out of range arguments
        assert.valid('<color>', 'hsl(-540 -1 50 / -1)', 'rgba(128, 128, 128, 0)')
        assert.valid('<color>', 'hsl(540 101 49 / 2)', 'rgb(0, 251, 251)')
        assert.valid('<color>', 'hsl(0 150 -1)', 'rgb(0, 1, 1)')
        assert.valid('<color>', 'hsl(0 -150 101)', 'rgb(255, 255, 255)')
        // Map <angle>, <percentage>, `none`, to <number>
        assert.valid('<color>', 'hsla(-1.5turn -1% 50% / 101%)', 'rgb(128, 128, 128)')
        assert.valid('<color>', 'hsl(none none 50 / none)', 'rgba(128, 128, 128, 0)')
        // Precision (at least 8 bit integers)
        assert.valid('<color>', 'hsl(0.498 100% 49.8% / 0.498)', 'rgba(254, 2, 0, 0.498)')
        assert.valid('<color>', 'hsl(0.499 100% 49.9% / 0.499)', 'rgba(254, 2, 0, 0.498)')
        assert.valid('<color>', 'hsl(0.501 100% 50.1% / 0.501)', 'rgba(255, 3, 1, 0.5)')
        assert.valid('<color>', 'hsl(0 100% 50% / 49.9%)', 'rgba(255, 0, 0, 0.498)')
        assert.valid('<color>', 'hsl(0 100% 50% / 50.1%)', 'rgba(255, 0, 0, 0.5)')
        // Numeric substitution function
        assert.valid('<color>', 'hsl(calc(-1.5turn) calc(-1%) calc(50%) / calc(-1%))', 'rgba(128, 128, 128, 0)')
        assert.valid('<color>', 'hsl(calc(-infinity) calc(-infinity) 1)', 'rgb(3, 3, 3)')
        assert.valid('<color>', 'hsl(calc(infinity) calc(infinity) 0)', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsl(0 0 calc(-infinity))', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hsl(0 0 calc(infinity))', 'rgb(255, 255, 255)')
        assert.valid('<color>', 'hsla(calc(1em / 1px) -1% 101% / -1%)', 'hsl(calc(1em / 1px) 0 101 / 0)')
        assert.valid('<color>', 'hsl(sibling-count() calc(-1) calc(101) / calc(2))', 'hsl(sibling-count() 0 101)', styleRule)
        // Relative color
        assert.valid('<color>', 'hsl(from green alpha calc(h) calc(s * 1%) / calc(l + 1 + 1))', 'hsl(from green alpha calc(h) calc(1% * s) / calc(2 + l))')
        assert.valid('<color>', 'hsla(from hsla(540 -1 0 / -1) 540deg 101% 0% / 101%)', 'hsl(from hsl(180 -1 0 / 0) 180 101 0)')
    })
    test('valid <hwb()>', () => {
        // To legacy <rgb()> or <rgba()> depending on <alpha-value>
        assert.valid('<color>', 'hwb(0 0 0)', 'rgb(255, 0, 0)')
        assert.valid('<color>', 'hwb(0 0 0 / 0)', 'rgba(255, 0, 0, 0)')
        assert.valid('<color>', 'hwb(0 0 0 / 1)', 'rgb(255, 0, 0)')
        // Out of range arguments
        assert.valid('<color>', 'hwb(-540 0 0 / -1)', 'rgba(0, 255, 255, 0)')
        assert.valid('<color>', 'hwb(540 0 0 / 2)', 'rgb(0, 255, 255)')
        assert.valid('<color>', 'hwb(90 -1 0)', 'rgb(126, 255, 0)')
        assert.valid('<color>', 'hwb(0 101 50)', 'rgb(171, 171, 171)')
        assert.valid('<color>', 'hwb(90 0 -1)', 'rgb(129, 255, 0)')
        assert.valid('<color>', 'hwb(0 50 101)', 'rgb(84, 84, 84)')
        // Map <angle>, <percentage>, `none`, to <number>
        assert.valid('<color>', 'hwb(-1.5turn -1% 50% / 101%)', 'rgb(0, 128, 128)')
        assert.valid('<color>', 'hwb(none none none / none)', 'rgba(255, 0, 0, 0)')
        // Precision (at least 8 bit integers)
        assert.valid('<color>', 'hwb(0.498 0% 49.8% / 0.498)', 'rgba(128, 1, 0, 0.498)')
        assert.valid('<color>', 'hwb(0.499 0% 49.9% / 0.499)', 'rgba(128, 1, 0, 0.498)')
        assert.valid('<color>', 'hwb(0.501 0% 50.1% / 0.501)', 'rgba(127, 1, 0, 0.5)')
        assert.valid('<color>', 'hwb(0 0% 0% / 49.8%)', 'rgba(255, 0, 0, 0.498)')
        assert.valid('<color>', 'hwb(0 0% 0% / 49.9%)', 'rgba(255, 0, 0, 0.498)')
        assert.valid('<color>', 'hwb(0 0% 0% / 50.1%)', 'rgba(255, 0, 0, 0.5)')
        // Numeric substitution functions
        assert.valid('<color>', 'hwb(calc(-1.5turn) calc(-1%) calc(50%) / calc(-1%))', 'rgba(0, 128, 128, 0)')
        assert.valid('<color>', 'hwb(calc(-infinity) 0 0)', 'rgb(255, 0, 0)')
        assert.valid('<color>', 'hwb(calc(infinity) 0 0)', 'rgb(255, 0, 0)')
        assert.valid('<color>', 'hwb(90 calc(-infinity) 0)', 'rgb(0, 255, 0)')
        assert.valid('<color>', 'hwb(0 calc(infinity) 50)', 'rgb(255, 255, 255)')
        assert.valid('<color>', 'hwb(90 0 calc(-infinity))', 'rgb(255, 255, 0)')
        assert.valid('<color>', 'hwb(0 50 calc(infinity))', 'rgb(0, 0, 0)')
        assert.valid('<color>', 'hwb(calc(1em / 1px) -1% 101% / -1%)', 'hwb(calc(1em / 1px) -1 101 / 0)')
        assert.valid('<color>', 'hwb(sibling-count() calc(-1) calc(101) / calc(101))', 'hwb(sibling-count() -1 101)', styleRule)
        // Relative color
        assert.valid('<color>', 'hwb(from green alpha calc(h) calc(w * 1%) / calc(b + 1 + 1))', 'hwb(from green alpha calc(h) calc(1% * w) / calc(2 + b))')
        assert.valid('<color>', 'hwb(from hwb(540 -1 0 / -1) 540deg -1% 0% / 101%)', 'hwb(from hwb(180 -1 0 / 0) 180 -1 0)')
    })
    test('valid <lab()>', () => {
        // Out of range arguments
        assert.valid('<color>', 'lab(-1 -126 0 / -1)', 'lab(0 -126 0 / 0)')
        assert.valid('<color>', 'lab(101 126 0 / 2)', 'lab(100 126 0)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'lab(-1% -101% 0% / -1%)', 'lab(0 -126.25 0 / 0)')
        assert.valid('<color>', 'lab(101% 101% 0% / 101%)', 'lab(100 126.25 0)')
        // Preserve `none`
        assert.valid('<color>', 'lab(none none none / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'lab(0.0000001 0.0000001 0 / 0.499)', 'lab(0 0 0 / 0.498)')
        assert.valid('<color>', 'lab(0.00000051 0.00000051 0 / 0.501)', 'lab(0.000001 0.000001 0 / 0.5)')
        assert.valid('<color>', 'lab(0.0000001% 0.0000001% 0 / 49.9%)', 'lab(0 0 0 / 0.498)')
        assert.valid('<color>', 'lab(0.00000051% 0.00000041% 0 / 50.1%)', 'lab(0.000001 0.000001 0 / 0.5)')
        // Relative color
        assert.valid('<color>', 'lab(from green alpha calc(l) calc(a * 1%) / calc(b + 1 + 1))', 'lab(from green alpha calc(l) calc(1% * a) / calc(2 + b))')
        assert.valid('<color>', 'lab(from lab(-1 0 0 / -1) 200% 100% 0% / 101%)', 'lab(from lab(-1 0 0 / 0) 200 125 0)')
    })
    test('valid <lch()>', () => {
        // Out of range arguments
        assert.valid('<color>', 'lch(-1 -1 -540 / -1)', 'lch(0 0 180 / 0)')
        assert.valid('<color>', 'lch(101 151 540 / 2)', 'lch(100 151 180)')
        // Map <angle> and <percentage> to <number>
        assert.valid('<color>', 'lch(-1% -1% -1.5turn / -1%)', 'lch(0 0 180 / 0)')
        assert.valid('<color>', 'lch(101% 101% 1.5turn / 101%)', 'lch(100 151.5 180)')
        // Preserve `none`
        assert.valid('<color>', 'lch(none none none / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'lch(0.0000001 0.0000001 0.0000001 / 0.499)', 'lch(0 0 0 / 0.498)')
        assert.valid('<color>', 'lch(0.00000051 0.00000051 0.00000051 / 0.501)', 'lch(0.000001 0.000001 0.000001 / 0.5)')
        assert.valid('<color>', 'lch(0.0000001% 0.0000003% 0.0000001deg / 49.9%)', 'lch(0 0 0 / 0.498)')
        assert.valid('<color>', 'lch(0.00000051% 0.00000041% 0.00000051deg / 50.1%)', 'lch(0.000001 0.000001 0.000001 / 0.5)')
        // Relative color
        assert.valid('<color>', 'lch(from green alpha calc(l) calc(c * 1deg) / calc(h + 1 + 1))', 'lch(from green alpha calc(l) calc(1deg * c) / calc(2 + h))')
        assert.valid('<color>', 'lch(from lch(-1 -1 540 / -1) 101% -100% 540deg / 101%)', 'lch(from lch(-1 -1 180 / 0) 101 -150 180)')
    })
    test('valid <oklab()>', () => {
        // Out of range arguments
        assert.valid('<color>', 'oklab(-1 -0.41 0 / -1)', 'oklab(0 -0.41 0 / 0)')
        assert.valid('<color>', 'oklab(1.1 0.41 0 / 2)', 'oklab(1 0.41 0)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'oklab(-1% -101% 0 / -1%)', 'oklab(0 -0.404 0 / 0)')
        assert.valid('<color>', 'oklab(101% 101% 0 / 101%)', 'oklab(1 0.404 0)')
        // Preserve `none`
        assert.valid('<color>', 'oklab(none none none / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'oklab(0.0000001 0.0000001 0 / 0.499)', 'oklab(0 0 0 / 0.498)')
        assert.valid('<color>', 'oklab(0.00000051 0.00000051 0 / 0.501)', 'oklab(0.000001 0.000001 0 / 0.5)')
        assert.valid('<color>', 'oklab(0.00001% 0.0001% 0 / 49.9%)', 'oklab(0 0 0 / 0.498)')
        assert.valid('<color>', 'oklab(0.00005% 0.00013% 0 / 50.1%)', 'oklab(0.000001 0.000001 0 / 0.5)')
        // Relative color
        assert.valid('<color>', 'oklab(from green alpha calc(l) calc(a * 1%) / calc(b + 1 + 1))', 'oklab(from green alpha calc(l) calc(1% * a) / calc(2 + b))')
        assert.valid('<color>', 'oklab(from oklab(-1 0 0 / -1) 200% 100% 0% / 101%)', 'oklab(from oklab(-1 0 0 / 0) 2 0.4 0)')
    })
    test('valid <oklch()>', () => {
        // Out of range arguments
        assert.valid('<color>', 'oklch(-1 -1 -540 / -1)', 'oklch(0 0 180 / 0)')
        assert.valid('<color>', 'oklch(1.1 0.41 540 / 2)', 'oklch(1 0.41 180)')
        // Map <angle> and <percentage> to <number>
        assert.valid('<color>', 'oklch(-1% -1% -1.5turn / -1%)', 'oklch(0 0 180 / 0)')
        assert.valid('<color>', 'oklch(101% 101% 1.5turn / 101%)', 'oklch(1 0.404 180)')
        // Preserve `none`
        assert.valid('<color>', 'oklch(none none none / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'oklch(0.0000001 0.0000001 0.0000001 / 0.499)', 'oklch(0 0 0 / 0.498)')
        assert.valid('<color>', 'oklch(0.00000051 0.00000051 0.00000051 / 0.501)', 'oklch(0.000001 0.000001 0.000001 / 0.5)')
        assert.valid('<color>', 'oklch(0.00001% 0.0001% 0.0000001deg / 49.9%)', 'oklch(0 0 0 / 0.498)')
        assert.valid('<color>', 'oklch(0.00005% 0.00013% 0.00000051deg / 50.1%)', 'oklch(0.000001 0.000001 0.000001 / 0.5)')
        // Relative color
        assert.valid('<color>', 'oklch(from green alpha calc(l) calc(c * 1deg) / calc(h + 1 + 1))', 'oklch(from green alpha calc(l) calc(1deg * c) / calc(2 + h))')
        assert.valid('<color>', 'oklch(from oklch(-1 -1 540 / -1) 200% -100% 540deg / 101%)', 'oklch(from oklch(-1 -1 180 / 0) 2 -0.4 180)')
    })
    test('valid <alpha()>', () => {
        // Relative component keyword
        assert.valid('<color>', 'alpha(from green / alpha)')
        assert.valid('<color>', 'alpha(from green / calc(alpha + 1 + 1))', 'alpha(from green / calc(2 + alpha))')
        // Out of range arguments
        assert.valid('<color>', 'alpha(from green / -1)', 'alpha(from green / 0)')
        assert.valid('<color>', 'alpha(from green / 2)', 'alpha(from green)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'alpha(from green / -1%)', 'alpha(from green / 0)')
        assert.valid('<color>', 'alpha(from green / 101%)', 'alpha(from green)')
        // Preserve `none`
        assert.valid('<color>', 'alpha(from green / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'alpha(from green / 0.499)', 'alpha(from green / 0.498)')
        assert.valid('<color>', 'alpha(from green / 0.501)', 'alpha(from green / 0.5)')
        assert.valid('<color>', 'alpha(from green / 49.9%)', 'alpha(from green / 0.498)')
        assert.valid('<color>', 'alpha(from green / 50.1%)', 'alpha(from green / 0.5)')
    })
    test('valid <color()>', () => {
        // Explicit `xyz` color space
        assert.valid('<color>', 'color(xyz 0 0 0)', 'color(xyz-d65 0 0 0)')
        // Out of range arguments
        assert.valid('<color>', 'color(srgb -1 -1 -1 / -1)', 'color(srgb -1 -1 -1 / 0)')
        assert.valid('<color>', 'color(srgb 1.1 1.1 1.1 / 2)', 'color(srgb 1.1 1.1 1.1)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'color(srgb -1% -1% -1% / -1%)', 'color(srgb -0.01 -0.01 -0.01 / 0)')
        assert.valid('<color>', 'color(srgb 101% 101% 101%)', 'color(srgb 1.01 1.01 1.01)')
        // Preserve `none`
        assert.valid('<color>', 'color(srgb none none none / none)')
        // Precision (at least 10 to 16 bits depending on the color space)
        assert.valid('<color>', 'color(srgb 0.0000001 0 0 / 0.499)', 'color(srgb 0 0 0 / 0.498)')
        assert.valid('<color>', 'color(srgb 0.00000051 0 0 / 0.501)', 'color(srgb 0.000001 0 0 / 0.5)')
        assert.valid('<color>', 'color(srgb 0.00001% 0 0 / 49.9%)', 'color(srgb 0 0 0 / 0.498)')
        assert.valid('<color>', 'color(srgb 0.00005% 0 0 / 50.1%)', 'color(srgb 0.000001 0 0 / 0.5)')
        // Relative color
        assert.valid('<color>', 'color(from green srgb alpha calc(r) calc(g * 1%) / calc(b + 1 + 1))', 'color(from green srgb alpha calc(r) calc(1% * g) / calc(2 + b))')
        assert.valid('<color>', 'color(from green xyz-d65 calc(alpha) calc(x) y / z)')
        assert.valid('<color>', 'color(from green --profile calc(alpha) calc(channel-identifier))')
        assert.valid('<color>', 'color(from color(srgb -1 2 0 / -1) srgb -100% 200% 0% / 101%)', 'color(from color(srgb -1 2 0 / 0) srgb -1 2 0)')
    })
    test('valid <device-cmyk()>', () => {
        // From legacy color syntax
        assert.valid('<color>', 'device-cmyk(0, 0, 0, 0)', 'device-cmyk(0 0 0 0)')
        // Out of range arguments
        assert.valid('<color>', 'device-cmyk(-1 -1 -1 -1 / -1)', 'device-cmyk(-1 -1 -1 -1 / 0)')
        assert.valid('<color>', 'device-cmyk(1.1 1.1 1.1 1.1 / 2)', 'device-cmyk(1.1 1.1 1.1 1.1)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'device-cmyk(-1% -1% -1% -1% / -1%)', 'device-cmyk(-0.01 -0.01 -0.01 -0.01 / 0)')
        assert.valid('<color>', 'device-cmyk(101% 101% 101% 101% / 101%)', 'device-cmyk(1.01 1.01 1.01 1.01)')
        // Preserve `none`
        assert.valid('<color>', 'device-cmyk(none none none none / none)')
        // Precision (at least 8 bits)
        assert.valid('<color>', 'device-cmyk(0.0000001 0 0 0 / 0.499)', 'device-cmyk(0 0 0 0 / 0.498)')
        assert.valid('<color>', 'device-cmyk(0.00000051 0 0 0 / 0.501)', 'device-cmyk(0.000001 0 0 0 / 0.5)')
        assert.valid('<color>', 'device-cmyk(0.00001% 0 0 0 / 49.9%)', 'device-cmyk(0 0 0 0 / 0.498)')
        assert.valid('<color>', 'device-cmyk(0.00005% 0 0 0 / 50.1%)', 'device-cmyk(0.000001 0 0 0 / 0.5)')
    })
    test('valid <ictcp()>', () => {
        // Out of range arguments
        assert.valid('<color>', 'ictcp(-1 -1 -1 / -1)', 'ictcp(-1 -1 -1 / 0)')
        assert.valid('<color>', 'ictcp(2 1 1 / 2)', 'ictcp(2 1 1)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'ictcp(-1% -1% -1% / -1%)', 'ictcp(-0.01 -0.005 -0.005 / 0)')
        assert.valid('<color>', 'ictcp(101% 101% 101% / 101%)', 'ictcp(1.01 0.505 0.505)')
        // Preserve `none`
        assert.valid('<color>', 'ictcp(none none none / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'ictcp(0.0000001 0 0 / 0.499)', 'ictcp(0 0 0 / 0.498)')
        assert.valid('<color>', 'ictcp(0.00000051 0 0 / 0.501)', 'ictcp(0.000001 0 0 / 0.5)')
        assert.valid('<color>', 'ictcp(0.00001% 0 0 / 49.9%)', 'ictcp(0 0 0 / 0.498)')
        assert.valid('<color>', 'ictcp(0.00005% 0 0 / 50.1%)', 'ictcp(0.000001 0 0 / 0.5)')
        // Relative color
        assert.valid('<color>', 'ictcp(from green alpha calc(i) calc(ct * 1%) / calc(cp + 1 + 1))', 'ictcp(from green alpha calc(i) calc(1% * ct) / calc(2 + cp))')
        assert.valid('<color>', 'ictcp(from ictcp(-1 2 0 / -1) -100% 200% 0% / 101%)', 'ictcp(from ictcp(-1 2 0 / 0) -1 1 0)')
    })
    test('valid <jzazbz()>', () => {
        // Out of range arguments
        assert.valid('<color>', 'jzazbz(-1 -1 -1 / -1)', 'jzazbz(-1 -1 -1 / 0)')
        assert.valid('<color>', 'jzazbz(2 1 1 / 2)', 'jzazbz(2 1 1)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'jzazbz(-1% -1% -1% / -1%)', 'jzazbz(-0.01 -0.0021 -0.0021 / 0)')
        assert.valid('<color>', 'jzazbz(101% 101% 101% / 101%)', 'jzazbz(1.01 0.2121 0.2121)')
        // Preserve `none`
        assert.valid('<color>', 'jzazbz(none none none / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'jzazbz(0.0000001 0 0 / 0.499)', 'jzazbz(0 0 0 / 0.498)')
        assert.valid('<color>', 'jzazbz(0.00000051 0 0 / 0.501)', 'jzazbz(0.000001 0 0 / 0.5)')
        assert.valid('<color>', 'jzazbz(0.00001% 0 0 / 49.9%)', 'jzazbz(0 0 0 / 0.498)')
        assert.valid('<color>', 'jzazbz(0.00005% 0 0 / 50.1%)', 'jzazbz(0.000001 0 0 / 0.5)')
        // Relative color
        assert.valid('<color>', 'jzazbz(from green alpha calc(jz) calc(az * 1%) / calc(bz + 1 + 1))', 'jzazbz(from green alpha calc(jz) calc(1% * az) / calc(2 + bz))')
        assert.valid('<color>', 'jzazbz(from jzazbz(-1 2 0 / -1) -100% 200% 0% / 101%)', 'jzazbz(from jzazbz(-1 2 0 / 0) -1 0.42 0)')
    })
    test('valid <jzczhz()>', () => {
        // Out of range arguments
        assert.valid('<color>', 'jzczhz(-1 -1 -540 / -1)', 'jzczhz(-1 -1 180 / 0)')
        assert.valid('<color>', 'jzczhz(2 1 540 / 2)', 'jzczhz(2 1 180)')
        // Map <percentage> to <number>
        assert.valid('<color>', 'jzczhz(-1% -1% -1.5turn / -1%)', 'jzczhz(-0.01 -0.0026 180 / 0)')
        assert.valid('<color>', 'jzczhz(101% 101% 1.5turn / 101%)', 'jzczhz(1.01 0.2626 180)')
        // Preserve `none`
        assert.valid('<color>', 'jzczhz(none none none / none)')
        // Precision (at least 16 bits)
        assert.valid('<color>', 'jzczhz(0.0000001 0 0 / 0.499)', 'jzczhz(0 0 0 / 0.498)')
        assert.valid('<color>', 'jzczhz(0.00000051 0 0 / 0.501)', 'jzczhz(0.000001 0 0 / 0.5)')
        assert.valid('<color>', 'jzczhz(0.00001% 0 0 / 49.9%)', 'jzczhz(0 0 0 / 0.498)')
        assert.valid('<color>', 'jzczhz(0.00005% 0 0 / 50.1%)', 'jzczhz(0.000001 0 0 / 0.5)')
        // Relative color
        assert.valid('<color>', 'jzczhz(from green alpha calc(jz) calc(cz * 1deg) / calc(hz + 1 + 1))', 'jzczhz(from green alpha calc(jz) calc(1deg * cz) / calc(2 + hz))')
        assert.valid('<color>', 'jzczhz(from jzczhz(-1 2 540 / -1) -100% 200% 540deg / 101%)', 'jzczhz(from jzczhz(-1 2 180 / 0) -1 0.52 180)')
    })
    test('valid <color-interpolate()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        assert.valid(
            '<color>',
            'color-interpolate(0, 0: rgba(-100% 200% 0 / 101%), 1: hsla(540deg -1% 0 / 50%))',
            'color-interpolate(0, 0: rgb(-255 510 0), 1: hsl(180 -1 0 / 0.5))',
            styleRule)
    })
    test('valid <color-mix()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        assert.valid(
            '<color>',
            'color-mix(in srgb, rgba(-100% 200% 0 / 101%), hsla(540deg -1% 0 / 50%))',
            'color-mix(in srgb, rgb(-255 510 0), hsl(180 -1 0 / 0.5))')
    })
    test('valid <contrast-color()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        assert.valid('<color>', 'contrast-color(rgba(-100% 200% 0 / 101%))', 'contrast-color(rgb(-255 510 0))')
        assert.valid('<color>', 'contrast-color(hsla(540deg -1% 0 / 50%))', 'contrast-color(hsl(180 -1 0 / 0.5))')
    })
    test('valid <light-dark()>', () => {
        // Preserve color components except <hue> and <alpha-value>
        assert.valid(
            '<color>',
            'light-dark(rgba(-100% 200% 0 / 101%), hsla(540deg -1% 0 / 50%))',
            'light-dark(rgb(-255 510 0), hsl(180 -1 0 / 0.5))')
    })
})
describe('<color-stripe>', () => {
    test('representation', () => {
        const color = keyword('green', ['<named-color>', '<color-base>', '<color>'])
        const stripe = list([color, omitted], ' ', ['<color-stripe>'])
        assert.representation('<color-stripe>', 'green', stripe)
    })
    test('valid', () => {
        assert.valid('<color-stripe>', 'green 1fr', 'green')
    })
})
describe('<combinator>', () => {
    test('invalid', () => {
        assert.invalid('<combinator>', '| |')
    })
    test('representation', () => {
        const pipe = delimiter('|')
        const combinator = list([pipe, pipe], '', ['<combinator>'])
        assert.representation('<combinator>', '||', combinator)
    })
})
describe('<container-name>', () => {
    test('invalid', () => {
        assert.invalid('<container-name>', 'AND')
        assert.invalid('<container-name>', 'none')
        assert.invalid('<container-name>', 'not')
        assert.invalid('<container-name>', 'or')
    })
    test('representation', () => {
        assert.representation('<container-name>', 'name', customIdent('name', ['<container-name>']))
    })
})
describe('<content()>', () => {
    test('representation', () => {
        assert.representation('<content()>', 'content()', {
            name: 'content',
            types: ['<function>', '<content()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<content()>', 'content(text)', 'content()')
    })
})
describe('<control-value()>', () => {
    test('representation', () => {
        assert.representation('<control-value()>', 'control-value()', {
            name: 'control-value',
            types: ['<function>', '<control-value()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<control-value()>', 'control-value(string)', 'control-value()')
    })
})
describe('<counter>', () => {
    test('representation', () => {
        const name = customIdent('chapters', ['<counter-name>'])
        assert.representation('<counter>', 'counter(chapters)', {
            name: 'counter',
            types: ['<function>', '<counter()>', '<counter>'],
            value: list([name, omitted, omitted]),
        })
        assert.representation('<counter>', 'counters(chapters, "-")', {
            name: 'counters',
            types: ['<function>', '<counters()>', '<counter>'],
            value: list([name, comma, string('-'), omitted, omitted]),
        })
    })
    test('valid', () => {
        let context = createContext(styleRule)
        context = { ...context, context, definition: { name: 'any-property', type: 'declaration' } }
        assert.valid('<counter>', 'counter(chapters, decimal)', 'counter(chapters)', context)
        assert.valid('<counter>', 'counters(chapters, "-", decimal)', 'counters(chapters, "-")', context)
    })
})
describe('<counter-name>', () => {
    test('invalid', () => {
        assert.invalid('<counter-name>', 'NONE')
    })
    test('representation', () => {
        assert.representation('<counter-name>', 'chapters', customIdent('chapters', ['<counter-name>']))
    })
})
describe('<counter-style-name>', () => {
    test('invalid', () => {
        assert.invalid('<counter-style-name>', 'NONE')
        assert.invalid('<counter-style-name>', 'DECIMAL')
    })
    test('representation', () => {
        assert.representation('<counter-style-name>', 'custom', customIdent('custom', ['<counter-style-name>']))
    })
    test('valid', () => {
        let context = createContext(styleRule)
        context = { ...context, context, definition: { name: 'any-property', type: 'declaration' } }
        assert.valid('<counter-style-name>', 'DECIMAL', 'decimal', context)
        assert.valid('<counter-style-name>', 'NAME')
    })
})
describe('<custom-function-definition>', () => {
    test('invalid', () => {
        assert.invalid('<custom-function-definition>', 'custom()')
    })
    test('representation', () => {
        const nameAndParameters = {
            name: '--CUSTOM',
            types: ['<function>'],
            value: omitted,
        }
        const definition = list([nameAndParameters, omitted], ' ', ['<custom-function-definition>'])
        assert.representation('<custom-function-definition>', '--CUSTOM()', definition)
    })
    test('valid', () => {
        assert.valid('<custom-function-definition>', '--custom() returns type(*)', '--custom()')
    })
})
describe('<drop-shadow()>', () => {
    test('representation', () => {
        assert.representation('<drop-shadow()>', 'drop-shadow(1px 1px)', {
            name: 'drop-shadow',
            types: ['<function>', '<drop-shadow()>'],
            value: list([omitted, list([length(1, 'px'), length(1, 'px')])]),
        })
    })
    test('valid', () => {
        assert.valid('<drop-shadow()>', 'drop-shadow(currentcolor 1px 1px 0px)', 'drop-shadow(1px 1px)')
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
                inputs.forEach(input => assert.invalid('<family-name>', input, context))
            }))
    })
    test('representation', () => {
        assert.representation('<family-name>', '"serif"', string('serif', ['<family-name>']))
        assert.representation('<family-name>', 'the serif', list([customIdent('the'), customIdent('serif')], ' ', ['<family-name>']))
    })
})
describe('<feature-tag-value>', () => {
    test('representation', () => {
        const tag = list([string('aaaa', ['<opentype-tag>']), omitted], ' ', ['<feature-tag-value>'])
        assert.representation('<feature-tag-value>', '"aaaa"', tag)
    })
    test('valid', () => {
        assert.valid('<feature-tag-value>', '"aaaa" 1', '"aaaa"')
    })
})
describe('<font-format>', () => {
    test('invalid', () => {
        assert.invalid('<font-format>', '"embedded-opentype"')
    })
    test('representation', () => {
        assert.representation('<font-format>', 'woff2', keyword('woff2', ['<font-format>']))
    })
    test('valid', () => {
        assert.valid('<font-format>', '"collection"')
        assert.valid('<font-format>', '"opentype"')
        assert.valid('<font-format>', '"opentype-variations"')
        assert.valid('<font-format>', '"truetype"')
        assert.valid('<font-format>', '"truetype-variations"')
        assert.valid('<font-format>', '"woff"')
        assert.valid('<font-format>', '"woff-variations"')
        assert.valid('<font-format>', '"woff2"')
        assert.valid('<font-format>', '"woff2-variations"')
    })
})
describe('<function-parameter>', () => {
    test('invalid', () => {
        assert.invalid('<function-parameter>', '--name <integer>: 1.5')
    })
    test('representation', () => {
        const name = dashedIdent('--name', ['<custom-property-name>'])
        const declaration = list([name, omitted, omitted], ' ', ['<function-parameter>'])
        assert.representation('<function-parameter>', '--name', declaration)
    })
    test('valid', () => {
        assert.valid('<function-parameter>', '--name type(*)', '--name')
        assert.valid('<function-parameter>', '--name type(<number>)', '--name <number>')
    })
})
describe('<gradient>', () => {
    test('invalid', () => {
        assert.invalid('<gradient>', 'radial-gradient(circle 1px 1px, red)')
        assert.invalid('<gradient>', 'radial-gradient(circle closest-side closest-side, red)')
    })
    test('representation', () => {

        const red = keyword('red', ['<named-color>', '<color-base>', '<color>'])
        const angularStopList = list(
            [list([red, omitted], ' ', ['<angular-color-stop>']), omitted, omitted],
            ' ',
            ['<angular-color-stop-list>'])
        const linearStopList = list(
            [list([red, omitted], ' ', ['<linear-color-stop>']), omitted, omitted],
            ' ',
            ['<color-stop-list>'])

        assert.representation('<gradient>', 'conic-gradient(red)', {
            name: 'conic-gradient',
            types: ['<function>', '<conic-gradient()>', '<gradient>'],
            value: list([omitted, omitted, angularStopList], ' ', ['<conic-gradient-syntax>']),
        })
        assert.representation('<gradient>', 'linear-gradient(red)', {
            name: 'linear-gradient',
            types: ['<function>', '<linear-gradient()>', '<gradient>'],
            value: list([omitted, omitted, linearStopList], ' ', ['<linear-gradient-syntax>']),
        })
        assert.representation('<gradient>', 'radial-gradient(red)', {
            name: 'radial-gradient',
            types: ['<function>', '<radial-gradient()>', '<gradient>'],
            value: list([omitted, omitted, linearStopList], ' ', ['<radial-gradient-syntax>']),
        })
    })
    test('valid', () => {
        // Simple
        assert.valid('<gradient>', 'conic-gradient(red)')
        assert.valid('<gradient>', 'linear-gradient(red)')
        assert.valid('<gradient>', 'radial-gradient(red)')
        // Repeating
        assert.valid('<gradient>', 'repeating-conic-gradient(red)')
        assert.valid('<gradient>', 'repeating-linear-gradient(red)')
        assert.valid('<gradient>', 'repeating-radial-gradient(red)')
        // Legacy alias
        assert.valid('<gradient>', '-webkit-linear-gradient(red)', 'linear-gradient(red)')
        assert.valid('<gradient>', '-webkit-repeating-linear-gradient(red)', 'repeating-linear-gradient(red)')
        assert.valid('<gradient>', '-webkit-radial-gradient(red)', 'radial-gradient(red)')
        assert.valid('<gradient>', '-webkit-repeating-radial-gradient(red)', 'repeating-radial-gradient(red)')
        // Omitted component values
        assert.valid('<gradient>', 'conic-gradient(from 0, red)', 'conic-gradient(red)')
        assert.valid('<gradient>', 'conic-gradient(from 0deg, red)', 'conic-gradient(red)')
        assert.valid('<gradient>', 'conic-gradient(at center, red)', 'conic-gradient(at center center, red)')
        assert.valid('<gradient>', 'conic-gradient(at center center, red)')
        assert.valid('<gradient>', 'conic-gradient(in oklab, red)', 'conic-gradient(red)')
        assert.valid('<gradient>', 'linear-gradient(to bottom, red)', 'linear-gradient(red)')
        assert.valid('<gradient>', 'linear-gradient(in oklab, red)', 'linear-gradient(red)')
        assert.valid('<gradient>', 'radial-gradient(circle farthest-corner, red)', 'radial-gradient(circle, red)')
        assert.valid('<gradient>', 'radial-gradient(circle 1px, red)', 'radial-gradient(1px, red)')
        assert.valid('<gradient>', 'radial-gradient(circle farthest-side, red)')
        assert.valid('<gradient>', 'radial-gradient(ellipse farthest-corner, red)', 'radial-gradient(red)')
        assert.valid('<gradient>', 'radial-gradient(ellipse 1px 1px, red)', 'radial-gradient(1px, red)')
        assert.valid('<gradient>', 'radial-gradient(ellipse farthest-side farthest-side, red)', 'radial-gradient(farthest-side, red)')
        assert.valid('<gradient>', 'radial-gradient(at center, red)', 'radial-gradient(at center center, red)')
        assert.valid('<gradient>', 'radial-gradient(at center center, red)')
        assert.valid('<gradient>', 'radial-gradient(in oklab, red)', 'radial-gradient(red)')
        // Implicit color stop
        assert.valid('<gradient>', 'conic-gradient(red 0deg 180deg)', 'conic-gradient(red 0deg, red 180deg)')
        assert.valid('<gradient>', 'linear-gradient(red 0% 50%)', 'linear-gradient(red 0%, red 50%)')
        assert.valid('<gradient>', 'radial-gradient(red 0% 50%)', 'radial-gradient(red 0%, red 50%)')
    })
})
describe('<grid-line>', () => {
    test('invalid', () => {
        assert.invalid('<grid-line>', 'SPAN')
        assert.invalid('<grid-line>', '-1 SPAN')
        assert.invalid('<grid-line>', '-1 auto')
        assert.invalid('<grid-line>', 'span AUTO')
    })
    test('representation', () => {
        assert.representation('<grid-line>', 'auto', keyword('auto', ['<grid-line>']))
    })
    test('valid', () => {
        assert.valid('<grid-line>', 'span 1')
    })
})
describe('<hue-rotate()>', () => {
    test('representation', () => {
        assert.representation('<hue-rotate()>', 'hue-rotate()', {
            name: 'hue-rotate',
            types: ['<function>', '<hue-rotate()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<hue-rotate()>', 'hue-rotate(0)', 'hue-rotate()')
        assert.valid('<hue-rotate()>', 'hue-rotate(0deg)', 'hue-rotate()')
    })
})
describe('<id-selector>', () => {
    test('invalid', () => {
        // Invalid identifier (start) code point
        assert.invalid('<id-selector>', '#1identifier')
        assert.invalid('<id-selector>', '#!identifier')
        assert.invalid('<id-selector>', '#-1identifier')
        assert.invalid('<id-selector>', '#-!identifier')
        assert.invalid('<id-selector>', '#--!identifier')
        // Invalid escape sequence (parse error)
        assert.invalid('<id-selector>', '#\\\n')
        assert.invalid('<id-selector>', '#-\\\n')
    })
    test('representation', () => {
        assert.representation('<id-selector>', '#identifier', {
            type: 'id',
            types: ['<hash-token>', '<id-selector>'],
            value: 'identifier',
        })
    })
    test('valid', () => {
        // Starts with identifier start code point
        assert.valid('<id-selector>', '#identifier')
        assert.valid('<id-selector>', '#·identifier')
        assert.valid('<id-selector>', '#_identifier')
        // Starts with an escape sequence
        assert.valid('<id-selector>', '#\\', '#�')
        assert.valid('<id-selector>', '#\\-')
        assert.valid('<id-selector>', '#\\0', '#�')
        assert.valid('<id-selector>', '#\\D800', '#�')
        assert.valid('<id-selector>', '#\\110000', '#�')
        assert.valid('<id-selector>', '#\\0000311', '#\\31 1')
        assert.valid('<id-selector>', '#\\31 1')
        assert.valid('<id-selector>', '#\\31\\31', '#\\31 1')
        assert.valid('<id-selector>', '#\\Aidentifier', '#\\a identifier')
        assert.valid('<id-selector>', '#\\69 dentifier', '#identifier')
        assert.valid('<id-selector>', '#\\identifier', '#identifier')
        assert.valid('<id-selector>', '#\\21identifier', '#\\!identifier')
        assert.valid('<id-selector>', '#\\!identifier')
        assert.valid('<id-selector>', '#\\A9identifier', '#\\©identifier')
        assert.valid('<id-selector>', '#\\©identifier')
        // Starts with - followed by - or identifier start code point
        assert.valid('<id-selector>', '#--')
        assert.valid('<id-selector>', '#-identifier')
        assert.valid('<id-selector>', '#-·identifier')
        assert.valid('<id-selector>', '#-_identifier')
        assert.valid('<id-selector>', '#-\\31identifier', '#-\\31 identifier')
        // Only contains identifier code points and escape sequences
        assert.valid('<id-selector>', '#identifier·')
        assert.valid('<id-selector>', '#identifier_')
        assert.valid('<id-selector>', '#identifier1')
        assert.valid('<id-selector>', '#identifier-')
        assert.valid('<id-selector>', '#identifie\\r', '#identifier')
        // Case-sensitive
        assert.valid('<id-selector>', '#IDENTIFIER')
    })
})
describe('<image-set()>', () => {
    test('invalid', () => {
        assert.invalid('<image-set()>', 'image-set(image-set("image.jpg"))')
        assert.invalid('<image-set()>', 'image-set(cross-fade(image-set("image.jpg")))')
    })
    test('representation', () => {

        const url = string('image.jpg')
        const option = list([url, omitted], ' ', ['<image-set-option>'])
        const set = {
            name: 'image-set',
            types: ['<function>', '<image-set()>'],
            value: list([option], ','),
        }

        assert.representation('<image-set()>', 'image-set("image.jpg")', set)
    })
    test('valid', () => {
        assert.valid('<image-set()>', '-webkit-image-set("image.jpg")', 'image-set("image.jpg")')
    })
})
describe('<input-position>', () => {
    test('invalid', () => {
        assert.invalid('<input-position>', 'calc((1% + 1px) / 1px)')
        assert.invalid('<input-position>', 'progress(1%, 1px, 1px)')
    })
    test('representation', () => {
        assert.representation('<input-position>', '50%', percentage(50, ['<input-position>']))
    })
    test('valid', () => {
        assert.valid('<input-position>', 'calc(100% / 2)', 'calc(50%)')
        assert.valid('<input-position>', 'progress(0%, 0%, 1%)')
    })
})
describe('<keyframe-selector>', () => {
    test('representation', () => {
        assert.representation('<keyframe-selector>', '0%', percentage(0, ['<keyframe-selector>']), keyframeRule)
    })
    test('valid', () => {
        const valid = [
            // To <percentage>
            ['from', '0%'],
            ['to', '100%'],
            // Element-dependent numeric substitution
            ['calc-interpolate(0, 0: 1% * sibling-count())'],
        ]
        valid.forEach(([input, expected]) =>
            assert.valid('<keyframe-selector>', input, expected, keyframeRule))
    })
})
describe('<keyframes-name>', () => {
    test('invalid', () => {
        assert.invalid('<keyframes-name>', 'NONE')
    })
    test('representation', () => {
        assert.representation('<keyframes-name>', 'animation', customIdent('animation', ['<keyframes-name>']))
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
        invalid.forEach(input => assert.invalid('<layer-name>', input))
    })
    test('representation', () => {
        assert.representation('<layer-name>', 'reset', list([ident('reset'), list([], '')], '', ['<layer-name>']))
    })
})
describe('<line-names>', () => {
    test('invalid', () => {
        assert.invalid('<line-names>', '[AUTO]')
        assert.invalid('<line-names>', '[span]')
    })
    test('representation', () => {
        assert.representation('<line-names>', '[name]', {
            associatedToken: '[',
            types: ['<block>', '<line-names>'],
            value: list([customIdent('name')]),
        })
    })
})
describe('<linear()>', () => {
    test('representation', () => {
        assert.representation('<linear()>', 'linear(1)', {
            name: 'linear',
            types: ['<function>', '<linear()>'],
            value: list([list([number(1), list()])], ','),
        })
    })
    test('valid', () => {
        assert.valid('<linear()>', 'linear(0 0% 50%)', 'linear(0 0%, 0 50%)')
    })
})
describe('<media-feature>', () => {
    test('invalid', () => {
        assert.invalid('<media-feature>', 'inline-size', mediaRule)
        assert.invalid('<media-feature>', 'scrollable', mediaRule)
    })
    test('representation', () => {
        const feature = ident('color', ['<mf-name>', '<mf-boolean>', '<media-feature>'])
        assert.representation('<media-feature>', 'color', feature, mediaRule)
    })
    test('valid', () => {
        assert.valid('<media-feature>', 'COLOR', 'color', mediaRule)
        assert.valid('<media-feature>', '-webkit-device-pixel-ratio: 1dppx', 'resolution: 1dppx', mediaRule)
        assert.valid('<media-feature>', '-webkit-min-device-pixel-ratio: 1dppx', 'min-resolution: 1dppx', mediaRule)
        assert.valid('<media-feature>', '-webkit-max-device-pixel-ratio: 1dppx', 'max-resolution: 1dppx', mediaRule)
    })
})
describe('<media-type>', () => {
    test('invalid', () => {
        assert.invalid('<media-type>', 'AND')
        assert.invalid('<media-type>', 'not')
        assert.invalid('<media-type>', 'only')
        assert.invalid('<media-type>', 'or')
        assert.invalid('<media-type>', 'layer')
    })
    test('representation', () => {
        assert.representation('<media-type>', 'all', ident('all', ['<media-type>']))
    })
})
describe('<mf-comparison>', () => {
    test('invalid', () => {
        assert.invalid('<mf-comparison>', '< =')
        assert.invalid('<mf-comparison>', '> =')
    })
    test('representation', () => {
        assert.representation('<mf-comparison>', '<=', list([lt, equal], '', ['<mf-lt>', '<mf-comparison>']))
    })
})
describe('<mf-boolean>', () => {
    test('invalid', () => {
        assert.invalid('<mf-boolean>', 'min-color', mediaRule)
        assert.invalid('<mf-boolean>', 'min-orientation', mediaRule)
    })
    test('representation', () => {
        assert.representation('<mf-boolean>', 'color', ident('color', ['<mf-name>', '<mf-boolean>']), mediaRule)
    })
    test('valid', () => {
        assert.valid('<mf-boolean>', 'orientation', 'orientation', mediaRule)
    })
})
describe('<mf-plain>', () => {
    test('invalid', () => {
        assert.invalid('<mf-plain>', 'min-orientation: landscape', mediaRule)
        assert.invalid('<mf-plain>', 'color: red', mediaRule)
    })
    test('representation', () => {
        const name = ident('color', ['<mf-name>'])
        const value = integer(1, ['<mf-value>'])
        const feature = list([name, delimiter(':'), value], ' ', ['<mf-plain>'])
        assert.representation('<mf-plain>', 'color: 1', feature, mediaRule)
    })
    test('valid', () => {
        assert.valid('<mf-plain>', 'orientation: PORTRAIT', 'orientation: portrait', mediaRule)
        assert.valid('<mf-plain>', 'color: 1.0', 'color: 1', mediaRule)
        assert.valid('<mf-plain>', 'min-width: 0', 'min-width: 0px', mediaRule)
        assert.valid('<mf-plain>', 'color: calc(1 * 1)', 'color: calc(1)', mediaRule)
        assert.valid('<mf-plain>', 'aspect-ratio: 1', 'aspect-ratio: 1 / 1', mediaRule)
    })
})
describe('<mf-range>', () => {
    test('invalid', () => {
        // Prefixed <mf-name>
        assert.invalid('<mf-range>', 'min-color = 1', mediaRule)
        assert.invalid('<mf-range>', '1 < min-color < 1', mediaRule)
        // Discrete <mf-name>
        assert.invalid('<mf-range>', 'orientation = 1', mediaRule)
        assert.invalid('<mf-range>', '1 < orientation < 1', mediaRule)
        // Invalid <mf-value>
        assert.invalid('<mf-range>', 'color = 1px', mediaRule)
        assert.invalid('<mf-range>', '1 < color < 1px', mediaRule)
        assert.invalid('<mf-range>', '1px < color < 1', mediaRule)
    })
    test('representation', () => {
        const name = ident('color', ['<mf-name>'])
        const comparator = delimiter('=', ['<mf-eq>', '<mf-comparison>'])
        const value = integer(1, ['<mf-value>'])
        const range = list([name, comparator, value], ' ', ['<mf-range>'])
        assert.representation('<mf-range>', 'color = 1', range, mediaRule)
    })
    test('valid', () => {
        assert.valid('<mf-range>', 'color < 0', 'color < 0', mediaRule),
        assert.valid('<mf-range>', 'color < calc(1 * 1)', 'color < calc(1)', mediaRule),
        assert.valid('<mf-range>', '0 < aspect-ratio < 1', '0 / 1 < aspect-ratio < 1 / 1', mediaRule)
    })
})
describe('<mf-value>', () => {
    test('invalid', () => {
        assert.invalid('<mf-value>', 'var(--custom)', mediaRule)
        assert.invalid('<mf-value>', 'attr(name)', mediaRule)
        assert.invalid('<mf-value>', 'calc-interpolate(0, 0: 1)', mediaRule)
        assert.invalid('<mf-value>', 'sibling-count()', mediaRule)
    })
    test('representation', () => {
        assert.representation('<mf-value>', '1', number(1, ['<mf-value>']))
    })
    test('valid', () => {
        const valid = [
            ['env(name)', mediaRule],
            ['env(name)', containerRule],
            ['var(--custom)', containerRule],
            ['attr(name)', containerRule],
            ['calc-interpolate(0, 0: 1 * sibling-count())', containerRule],
        ]
        valid.forEach(([input, context]) =>
            assert.valid('<mf-value>', input, input, context))
    })
})
describe('<opentype-tag>', () => {
    test('invalid', () => {
        // Less or more than 4 characters
        assert.invalid('<opentype-tag>', '"aaa"')
        assert.invalid('<opentype-tag>', '"aaaaa"')
        // Non-printable ASCII characters
        assert.invalid('<opentype-tag>', '"©aaa"')
    })
    test('representation', () => {
        assert.representation('<opentype-tag>', '"aaaa"', string('aaaa', ['<opentype-tag>']))
    })
})
describe('<page-selector-list>', () => {
    test('invalid', () => {
        assert.invalid('<page-selector-list>', 'toc :left')
        assert.invalid('<page-selector-list>', 'toc: left')
    })
    test('representation', () => {

        const toc = identToken('toc')
        const pseudoSelector = list([colon, keyword('right')], '', ['<pseudo-page>'])
        const pseudoChain = list([pseudoSelector], '')
        const selector = list([toc, pseudoChain], '', ['<page-selector>'])
        const selectors = list([selector], ',', ['<page-selector-list>'])

        assert.representation('<page-selector-list>', 'toc:right', selectors)
    })
})
describe('<pointer()>', () => {
    test('representation', () => {
        assert.representation('<pointer()>', 'pointer()', {
            name: 'pointer',
            types: ['<function>', '<pointer()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<pointer()>', 'pointer(inline self)', 'pointer()')
    })
})
describe('<position>', () => {
    test('representation', () => {
        assert.representation('<position>', 'left', keyword('left', ['<position-one>', '<position>']))
    })
    test('valid', () => {
        assert.valid('<position>', 'center', 'center center')
        assert.valid('<position>', 'left', 'left center')
        assert.valid('<position>', 'top', 'center top')
        assert.valid('<position>', 'x-start', 'x-start center')
        assert.valid('<position>', 'y-start', 'center y-start')
        assert.valid('<position>', 'block-start', 'block-start center')
        assert.valid('<position>', 'inline-start', 'center inline-start')
        assert.valid('<position>', '50%', '50% center')
        assert.valid('<position>', '0px', '0px center')
    })
})
describe('<position-area>', () => {
    test('representation', () => {
        const area = list([keyword('left'), omitted], ' ', ['<position-area>'])
        assert.representation('<position-area>', 'left', area)
    })
    test('valid', () => {
        assert.valid('<position-area>', 'center', 'center center')
        assert.valid('<position-area>', 'left', 'left span-all')
        assert.valid('<position-area>', 'top', 'span-all top')
        assert.valid('<position-area>', 'start', 'start start')
        assert.valid('<position-area>', 'x-start', 'x-start span-all')
        assert.valid('<position-area>', 'y-start', 'span-all y-start')
        assert.valid('<position-area>', 'block-start', 'start span-all')
        assert.valid('<position-area>', 'inline-start', 'span-all start')
        assert.valid('<position-area>', 'span-self-block-start', 'span-self-start span-all')
        assert.valid('<position-area>', 'span-self-inline-end', 'span-all span-self-end')
    })
})
describe('<position-area-query>', () => {
    test('representation', () => {
        const area = list([keyword('left'), omitted], ' ', ['<position-area-query>'])
        assert.representation('<position-area-query>', 'left', area)
    })
    test('valid', () => {
        assert.valid('<position-area-query>', 'center', 'center center')
        assert.valid('<position-area-query>', 'left', 'left any')
        assert.valid('<position-area-query>', 'top', 'any top')
        assert.valid('<position-area-query>', 'start', 'start start')
        assert.valid('<position-area-query>', 'x-start', 'x-start any')
        assert.valid('<position-area-query>', 'y-start', 'any y-start')
        assert.valid('<position-area-query>', 'block-start', 'start any')
        assert.valid('<position-area-query>', 'inline-start', 'any start')
        assert.valid('<position-area-query>', 'span-self-block-start', 'span-self-start any')
        assert.valid('<position-area-query>', 'span-self-inline-end', 'any span-self-end')
    })
})
describe('<progress-source>', () => {
    test('invalid', () => {
        // Invalid <calc-sum>
        assert.invalid('<progress-source>', 'calc((1% + 1px) / 1px)')
        assert.invalid('<progress-source>', 'progress(1%, 1px, 1px)')
        assert.invalid('<progress-source>', 'auto')
        assert.invalid('<progress-source>', 'none')
    })
    test('representation', () => {
        assert.representation('<progress-source>', '50%', percentage(50, ['<progress-source>']))
    })
    test('valid', () => {
        assert.valid('<progress-source>', 'calc(100% / 2)', 'calc(50%)')
        assert.valid('<progress-source>', 'progress(0%, 0%, 1%)')
    })
})
describe('<pt-name-and-class-selector>', () => {
    test('invalid', () => {
        assert.invalid('<pt-name-and-class-selector>', 'name .class')
        assert.invalid('<pt-name-and-class-selector>', '.class .class')
    })
    test('representation', () => {
        const name = customIdent('name', ['<pt-name-selector>'])
        const selector = list([name, omitted], '', ['<pt-name-and-class-selector>'])
        assert.representation('<pt-name-and-class-selector>', 'name', selector)
    })
})
describe('<ray()>', () => {
    test('representation', () => {
        assert.representation('<ray()>', 'ray(1deg)', {
            name: 'ray',
            types: ['<function>', '<ray()>'],
            value: list([angle(1, 'deg'), omitted, omitted, omitted]),
        })
    })
    test('valid', () => {
        assert.valid('<ray()>', 'ray(1deg closest-side)', 'ray(1deg)')
    })
})
describe('<ratio>', () => {
    test('representation', () => {
        assert.representation('<ratio>', '1', list([number(1), omitted], ' ', ['<ratio>']))
    })
    test('valid', () => {
        assert.valid('<ratio>', '1', '1 / 1')
        assert.valid('<ratio>', '1 / 1')
    })
})
describe('<relative-control-point>', () => {
    test('representation', () => {

        const zero = length(0, 'px', ['<length-percentage>'])
        const coordinate = list([zero, zero], ' ', ['<coordinate-pair>'])
        const point = list([coordinate, omitted], ' ', ['<relative-control-point>'])

        assert.representation('<relative-control-point>', '0px 0px', point)
    })
    test('valid', () => {
        assert.valid('<relative-control-point>', '0px 0px from start', '0px 0px')
    })
})
describe('<repeat-style>', () => {
    test('representation', () => {
        assert.representation('<repeat-style>', 'repeat-x', keyword('repeat-x', ['<repeat-style>']))
    })
    test('valid', () => {
        assert.valid('<repeat-style>', 'repeat no-repeat', 'repeat-x')
        assert.valid('<repeat-style>', 'no-repeat repeat', 'repeat-y')
        assert.valid('<repeat-style>', 'repeat repeat', 'repeat')
        assert.valid('<repeat-style>', 'round round', 'round')
        assert.valid('<repeat-style>', 'space space', 'space')
    })
})
describe('<scale()>', () => {
    test('representation', () => {
        assert.representation('<scale()>', 'scale(1)', {
            name: 'scale',
            types: ['<function>', '<scale()>'],
            value: list([number(1)], ','),
        })
    })
    test('valid', () => {
        assert.valid('<scale()>', 'scale(1, 1)', 'scale(1)')
    })
})
describe('<scroll()>', () => {
    test('representation', () => {
        assert.representation('<scroll()>', 'scroll()', {
            name: 'scroll',
            types: ['<function>', '<scroll()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<scroll()>', 'scroll(nearest block)', 'scroll()')
        assert.valid('<scroll()>', 'scroll(root block)', 'scroll(root)')
        assert.valid('<scroll()>', 'scroll(nearest inline)', 'scroll(inline)')
    })
})
describe('<scroll-state-feature>', () => {
    test('invalid', () => {
        assert.invalid('<scroll-state-feature>', 'color', containerRule)
        assert.invalid('<scroll-state-feature>', 'inline-size', containerRule)
    })
    test('representation', () => {
        const feature = ident('scrollable', ['<mf-name>', '<mf-boolean>', '<media-feature>', '<scroll-state-feature>'])
        assert.representation('<scroll-state-feature>', 'scrollable', feature, containerRule)
    })
})
describe('<shadow>', () => {
    test('representation', () => {
        assert.representation('<shadow>', '1px 1px', list(
            [
                omitted,
                list([
                    list([length(1, 'px'), length(1, 'px')]),
                    omitted,
                ]),
                omitted,
            ],
            ' ',
            ['<shadow>']))
    })
    test('valid', () => {
        assert.valid('<shadow>', 'currentColor 1px 1px 0px 0px', '1px 1px')
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
        const shape = {
            name: 'shape',
            types: ['<function>', '<shape()>'],
            value,
        }

        assert.representation('<shape()>', 'shape(from 0px 0px, move by 0px 0px)', shape)
    })
    test('valid', () => {
        assert.valid('<shape()>', 'shape(nonzero from 0px 0px, move by 0px 0px)', 'shape(from 0px 0px, move by 0px 0px)')
    })
})
describe('<size-feature>', () => {
    test('invalid', () => {
        assert.invalid('<size-feature>', 'color', containerRule)
        assert.invalid('<size-feature>', 'scrollable', containerRule)
    })
    test('representation', () => {
        const feature = ident('inline-size', ['<mf-name>', '<mf-boolean>', '<media-feature>', '<size-feature>'])
        assert.representation('<size-feature>', 'inline-size', feature, containerRule)
    })
})
describe('<skew()>', () => {
    test('representation', () => {
        assert.representation('<skew()>', 'skew(1deg)', {
            name: 'skew',
            types: ['<function>', '<skew()>'],
            value: list([angle(1, 'deg'), omitted, omitted]),
        })
    })
    test('valid', () => {
        assert.valid('<skew()>', 'skew(0deg, 0)', 'skew(0deg)')
        assert.valid('<skew()>', 'skew(0deg, 0deg)', 'skew(0deg)')
    })
})
describe('<snap-block()>, <snap-inline()>', () => {
    test('representation', () => {
        assert.representation('<snap-block()>', 'snap-block(1px)', {
            name: 'snap-block',
            types: ['<function>', '<snap-block()>'],
            value: list([length(1, 'px'), omitted, omitted]),
        })
    })
    test('valid', () => {
        assert.valid('<snap-block()>', 'snap-block(1px, near)', 'snap-block(1px)')
    })
})
describe('<step-easing-function>', () => {
    test('invalid', () => {
        assert.invalid('<step-easing-function>', 'steps(0)')
        assert.invalid('<step-easing-function>', 'steps(1, jump-none)')
    })
    test('representation', () => {
        assert.representation('<step-easing-function>', 'steps(1)', {
            name: 'steps',
            types: ['<function>', '<steps()>', '<step-easing-function>'],
            value: list([integer(1), omitted, omitted]),
        })
    })
    test('valid', () => {
        assert.valid('<step-easing-function>', 'step-start', 'steps(1, start)')
        assert.valid('<step-easing-function>', 'step-end', 'steps(1)')
        assert.valid('<step-easing-function>', 'steps(1, end)', 'steps(1)')
        assert.valid('<step-easing-function>', 'steps(1, jump-end)', 'steps(1)')
    })
})
describe('<string()>', () => {
    test('representation', () => {
        assert.representation('<string()>', 'string(name)', {
            name: 'string',
            types: ['<function>', '<string()>'],
            value: list([ident('name', ['<custom-ident>']), omitted, omitted]),
        })
    })
    test('valid', () => {
        assert.valid('<string()>', 'string(name, first)', 'string(name)')
    })
})
describe('<style-feature>', () => {
    test('invalid', () => {
        assert.invalid('<style-feature>', 'unknown', containerRule)
        assert.invalid('<style-feature>', 'width: revert', containerRule)
        assert.invalid('<style-feature>', 'width: revert-layer', containerRule)
    })
    test('representation', () => {
        const feature = {
            important: true,
            name: 'color',
            types: ['<declaration>', '<style-feature-plain>', '<style-feature>'],
            value: keyword('green', ['<named-color>', '<color-base>', '<color>', 'color']),
        }
        assert.representation('<style-feature>', 'color: green !important', feature, containerRule)
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
        valid.forEach(([input, expected]) =>
            assert.valid('<style-feature>', input, expected, containerRule))
    })
})
describe('<syntax-string>', () => {
    test('invalid', () => {
        assert.invalid('<syntax-string>', '""')
    })
    test('representation', () => {
        assert.representation('<syntax-string>', '"*"', delimiter('*', ['<syntax>']))
    })
})
describe('<syntax-component>', () => {
    test('invalid', () => {
        assert.invalid('<syntax-component>', 'a #')
        assert.invalid('<syntax-component>', '< angle>')
        assert.invalid('<syntax-component>', '<angle >')
        assert.invalid('<syntax-component>', '< transform-list>')
        assert.invalid('<syntax-component>', '<transform-list >')
    })
    test('representation', () => {
        const componentUnit = ident('a', ['<syntax-single-component>'])
        const component = list([componentUnit, omitted], '', ['<syntax-component>'])
        assert.representation('<syntax-component>', 'a', component)
    })
})
describe('<supports-decl>', () => {
    test('invalid', () => {
        assert.invalid('<supports-decl>', '(unknown: initial)', supportsRule)
        assert.invalid('<supports-decl>', '(color: invalid)', supportsRule)
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
        assert.representation('<supports-decl>', '(color: green)', block, supportsRule)
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
        valid.forEach(([input, expected]) =>
            assert.valid('<supports-decl>', input, expected, styleRule))
    })
})
describe('<supports-feature>', () => {
    test('invalid', () => {
        assert.invalid('<supports-feature>', 'selector(undeclared|type)', supportsRule)
        assert.invalid('<supports-feature>', 'selector(:is(:not))', supportsRule)
        assert.invalid('<supports-feature>', 'selector(::webkit-unknown)', supportsRule)
    })
    test('representation', () => {
        const feature = {
            associatedToken: '(',
            types: ['<block>', '<supports-decl>', '<supports-feature>'],
            value: {
                important: false,
                name: 'color',
                types: ['<declaration>'],
                value: keyword('green', ['<named-color>', '<color-base>', '<color>', 'color']),
            },
        }
        assert.representation('<supports-feature>', '(color: green)', feature, supportsRule)
    })
})
describe('<symbols()>', () => {
    test('invalid', () => {
        assert.invalid('<symbols()>', 'symbols(alphabetic "a")')
        assert.invalid('<symbols()>', 'symbols(numeric "a")')
    })
    test('representation', () => {
        assert.representation('<symbols()>', 'symbols("a")', {
            name: 'symbols',
            types: ['<function>', '<symbols()>'],
            value: list([omitted, list([string('a')])]),
        })
    })
    test('valid', () => {
        assert.valid('<symbols()>', 'symbols(symbolic "a")', 'symbols("a")')
    })
})
describe('<translate()>', () => {
    test('representation', () => {
        assert.representation('<translate()>', 'translate(1px)', {
            name: 'translate',
            types: ['<function>', '<translate()>'],
            value: list([length(1, 'px', ['<length-percentage>']), omitted, omitted]),
        })
    })
    test('valid', () => {
        assert.valid('<translate()>', 'translate(1px, 0px)', 'translate(1px)')
    })
})
describe('<try-tactic>', () => {
    test('representation', () => {
        const tactics = list([keyword('flip-block'), omitted, omitted, omitted, omitted], ' ', ['<try-tactic>'])
        assert.representation('<try-tactic>', 'flip-block', tactics)
    })
    test('valid', () => {
        assert.valid('<try-tactic>', 'flip-start flip-inline flip-block')
    })
})
describe('<urange>', () => {
    test('invalid', () => {
        // Invalid whitespace
        assert.invalid('<urange>', 'U +0-1')
        assert.invalid('<urange>', 'U+ 0-1')
        assert.invalid('<urange>', 'U+0 -1')
        // `U+` must appear first
        assert.invalid('<urange>', 'U-0')
        assert.invalid('<urange>', 'U0')
        // Start/end code points must have 0 < hexadecimal digits < 7
        assert.invalid('<urange>', 'U+-1')
        assert.invalid('<urange>', 'U+0-')
        assert.invalid('<urange>', 'U+0000001')
        assert.invalid('<urange>', 'U+0-0000001')
        assert.invalid('<urange>', 'U+000000a')
        assert.invalid('<urange>', 'U+0-000000a')
        assert.invalid('<urange>', 'U+000000?')
        assert.invalid('<urange>', 'U+0-000000?')
        // `?` must appear last
        assert.invalid('<urange>', 'U+?0')
        assert.invalid('<urange>', 'U+0?-1')
        assert.invalid('<urange>', 'U+0-?0')
        // Start/end code points must be separated with an hyphen
        assert.invalid('<urange>', 'U+0+1')
        // Start/end code points must be hexadecimal digits
        assert.invalid('<urange>', 'U+0g')
        assert.invalid('<urange>', 'U+0-0g')
        // Start/end code points must be lower than 10FFFF
        assert.invalid('<urange>', 'U+110000')
        assert.invalid('<urange>', 'U+11????')
        // Start code point must be lower or equal than end code point
        assert.invalid('<urange>', 'U+1-0')
    })
    test('representation', () => {
        assert.representation('<urange>', 'U+0-f', { from: 0, to: 15, types: ['<urange>'] })
    })
    test('valid', () => {
        assert.valid('<urange>', 'U+0')
        assert.valid('<urange>', 'u+0a-1a', 'U+A-1A')
        assert.valid('<urange>', 'U+0000-00001', 'U+0-1')
        assert.valid('<urange>', 'U+????', 'U+0-FFFF')
    })
})
describe('<url-set>', () => {
    test('invalid', () => {
        assert.invalid('<url-set>', 'image-set(image(black))')
        assert.invalid('<url-set>', 'image-set(image-set(black))')
        assert.invalid('<url-set>', 'image-set(cross-fade(black))')
        assert.invalid('<url-set>', 'image-set(element(#image))')
        assert.invalid('<url-set>', 'image-set(linear-gradient(red, cyan))')
    })
    test('representation', () => {

        const url = string('image.jpg')
        const src = {
            name: 'src',
            types: ['<function>', '<src()>', '<url>', '<image>'],
            value: list([url, list()]),
        }

        assert.representation('<url-set>', 'image-set(src("image.jpg"))', {
            name: 'image-set',
            types: ['<function>', '<image-set()>', '<url-set>'],
            value: list([list([src, omitted], ' ', ['<image-set-option>'])], ','),
        })
        assert.representation('<url-set>', 'image-set("image.jpg")', {
            name: 'image-set',
            types: ['<function>', '<image-set()>', '<url-set>'],
            value: list([list([url, omitted], ' ', ['<image-set-option>'])], ','),
        })
    })
})
describe('<var()>', () => {
    test('representation', () => {
        const property = dashedIdent('--custom', ['<custom-property-name>'])
        const variable = {
            name: 'var',
            types: ['<function>', '<var()>'],
            value: list([property, omitted, omitted]),
        }
        assert.representation('<var()>', 'var(--custom)', variable)
    })
    test('valid', () => {
        assert.valid('<var()>', 'var(--custom,,)')
        assert.valid('<var()>', 'var(--custom, 1 {})')
    })
})
describe('<view()>', () => {
    test('representation', () => {
        assert.representation('<view()>', 'view()', {
            name: 'view',
            types: ['<function>', '<view()>'],
            value: omitted,
        })
    })
    test('valid', () => {
        assert.valid('<view()>', 'view(block auto)', 'view()')
        assert.valid('<view()>', 'view(block 1px)', 'view(1px)')
        assert.valid('<view()>', 'view(inline auto)', 'view(inline)')
    })
})
describe('<wq-name>', () => {
    test('invalid', () => {
        assert.invalid('<wq-name>', 'prefix |name')
        assert.invalid('<wq-name>', 'prefix| name')
    })
    test('representation', () => {
        assert.representation('<wq-name>', 'name', list([omitted, identToken('name')], '', ['<wq-name>']))
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
        const sources = list([list([url, format, omitted], ' ', ['<font-src>'])], ',', ['<font-src-list>'])

        assert.representation('<font-src-list>', 'url(font.woff2) format(woff2)', sources)
    })
    test('valid', () => {
        assert.valid(
            '<font-src-list>',
            'url("font.woff2") format(woff2), url("font.eotf") format("embedded-opentype")',
            'url("font.woff2") format(woff2)')
    })
})
describe('<selector-list>', () => {
    test('invalid', () => {
        // Invalid whitespace
        assert.invalid('<selector-list>', 'svg| *', styleRule)
        assert.invalid('<selector-list>', '. class', styleRule)
        assert.invalid('<selector-list>', ': hover', styleRule)
        assert.invalid('<selector-list>', ': :before', styleRule)
        assert.invalid('<selector-list>', ':: before', styleRule)
        // Undeclared namespace
        assert.invalid('<selector-list>', 'undeclared|type', styleRule)
        assert.invalid('<selector-list>', '[undeclared|attr=value]', styleRule)
        // Invalid pseudo-class name
        assert.invalid('<selector-list>', ':is', styleRule)
        assert.invalid('<selector-list>', ':hover()', styleRule)
        assert.invalid('<selector-list>', ':marker', styleRule)
        assert.invalid('<selector-list>', ':highlight(name)', styleRule)
        // Invalid pseudo-element name
        assert.invalid('<selector-list>', '::is()', styleRule)
        assert.invalid('<selector-list>', '::hover', styleRule)
        assert.invalid('<selector-list>', '::marker()', styleRule)
        assert.invalid('<selector-list>', '::highlight', styleRule)
        assert.invalid('<selector-list>', '::webkit-unknown()', styleRule)
        // Invalid pseudo-classing of pseudo-element
        assert.invalid('<selector-list>', '::before:only-child', styleRule)
        assert.invalid('<selector-list>', '::marker:empty', styleRule)
        assert.invalid('<selector-list>', '::before:nth-child(1)', styleRule)
        // Invalid functional pseudo argument
        assert.invalid('<selector-list>', ':has(:not(:has(type)))', styleRule)
        assert.invalid('<selector-list>', ':current(:nth-child(1 of type > type))', styleRule)
        assert.invalid('<selector-list>', ':current(:nth-child(1 of :has(type)))', styleRule)
        assert.invalid('<selector-list>', ':current(:has(type))', styleRule)
        assert.invalid('<selector-list>', ':current(:not(type > type))', styleRule)
        assert.invalid('<selector-list>', ':current(:not(:has(type)))', styleRule)
        assert.invalid('<selector-list>', '::slotted(:nth-child(1 of type > type))', styleRule)
        assert.invalid('<selector-list>', '::slotted(:nth-child(1 of :has(type)))', styleRule)
        assert.invalid('<selector-list>', '::slotted(:has(type))', styleRule)
        assert.invalid('<selector-list>', '::slotted(:not(type > type))', styleRule)
        assert.invalid('<selector-list>', '::slotted(:not(:has(type)))', styleRule)
        assert.invalid('<selector-list>', '::before:not(:only-child)', styleRule)
        assert.invalid('<selector-list>', '::before:not(:not(:only-child))', styleRule)
        assert.invalid('<selector-list>', '::before:not(type)', styleRule)
        assert.invalid('<selector-list>', '::before:not(:hover > :hover)', styleRule)
        assert.invalid('<selector-list>', '::before:not(:has(:hover))', styleRule)
        assert.invalid('<selector-list>', '::marker:nth-child(1 of type)', styleRule)
        assert.invalid('<selector-list>', '::marker:nth-child(1 of type > :hover)', styleRule)
        assert.invalid('<selector-list>', '::marker:nth-child(1 of has(:hover))', styleRule)
        assert.invalid('<selector-list>', '::slotted(:not(type > type))', styleRule)
        assert.invalid('<selector-list>', '::slotted(:not(:has(type)))', styleRule)
        assert.invalid('<selector-list>', '::part(name):current(:only-child)', styleRule)
        assert.invalid('<selector-list>', '::part(name):current(type)', styleRule)
        assert.invalid('<selector-list>', '::part(name):not(:current(:only-child))', styleRule)
        assert.invalid('<selector-list>', '::part(name):not(:current(type))', styleRule)
        // Invalid sub-pseudo-element
        assert.invalid('<selector-list>', '::marker::before', styleRule)
        assert.invalid('<selector-list>', '::marker::highlight(name)', styleRule)
        assert.invalid('<selector-list>', '::part(name)::part(name)', styleRule)
        // Invalid pseudo-element combination (no internal structure)
        assert.invalid('<selector-list>', '::before span', styleRule)
        assert.invalid('<selector-list>', '::before + span', styleRule)
    })
    test('representation', () => {

        const subclass = list([delimiter('.'), identToken('class')], '', ['<class-selector>', '<subclass-selector>'])
        const subclasses = list([subclass], '')
        const compound = list([omitted, subclasses], '', ['<compound-selector>'])
        const complexUnit = list([compound, list([], '')], '', ['<complex-selector-unit>'])
        const complex = list([complexUnit, list()], ' ', ['<complex-selector>'])
        const selectors = list([complex], ',', ['<complex-selector-list>', '<selector-list>'])

        assert.representation('<selector-list>', '.class', selectors, styleRule)
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
            ['::before:is(:only-child, type > type)'],
            ['::marker:only-child'],
            ['::marker:nth-child(1 of :hover)'],
            ['::marker:not(:only-child, :not(:nth-child(1 of :hover)))'],
            ['::part(name):current'],
            ['::part(name):active-view-transition-type(name)'],
            ['::part(name):not(:current)'],
            // Sub-pseudo-element
            ['::after::marker'],
            ['::after:hover::marker'],
            ['::before::marker'],
            ['::column::scroll-marker'],
            ['::first-letter::prefix'],
            ['::first-letter::suffix'],
            ['::part(name)::marker'],
            ['::part(name)::slotted(type)'],
            ['::slider-track::slider-fill'],
            ['::step-control::step-down'],
            ['::step-control::step-up'],
            ['::slotted(type)::marker'],
            ['::slotted(type)::part(name)'],
            // Nesting selector
            ['&'],
            ['type&#identifier&.class&[attr]&:hover&'],
        ]
        valid.forEach(([input, expected]) =>
            assert.valid('<selector-list>', input, expected, styleRule))
    })
})
describe('<media-query-list>', () => {
    test('representation', () => {

        const mediaType = ident('all', ['<media-type>'])
        const mediaQuery = list([omitted, mediaType, omitted], ' ', ['<media-query>'])
        const mediaQueryList = list([mediaQuery], ',', ['<media-query-list>'])

        assert.representation('<media-query-list>', 'all', mediaQueryList, mediaRule)
    })
    test('valid', () => {
        assert.valid('<media-query-list>', ';, 1, (condition),', 'not all, not all, (condition), not all', mediaRule)
        assert.valid('<media-query-list>', 'all and (condition)', '(condition)', mediaRule)
    })
})

describe("<'border-radius'>", () => {
    test('representation', () => {

        const radius = length(1, 'px', ['<length-percentage>'])
        const side = list([radius, radius, radius, radius])
        const radii = list([side, side], '/', ["<'border-radius'>"])

        assert.representation("<'border-radius'>", '1px', radii)
    })
    test('valid', () => {
        // Non-omitted component values
        assert.valid("<'border-radius'>", '1px 2px')
        assert.valid("<'border-radius'>", '1px 1px 2px')
        assert.valid("<'border-radius'>", '1px 1px 1px 2px')
        assert.valid("<'border-radius'>", '1px / 1px 2px')
        assert.valid("<'border-radius'>", '1px / 1px 1px 2px')
        assert.valid("<'border-radius'>", '1px / 1px 1px 1px 2px')
        // Omitted component values
        assert.valid("<'border-radius'>", '1px 1px', '1px')
        assert.valid("<'border-radius'>", '1px 2px 1px', '1px 2px')
        assert.valid("<'border-radius'>", '1px 1px 2px 1px', '1px 1px 2px')
        assert.valid("<'border-radius'>", '1px 2px 1px 2px', '1px 2px')
        assert.valid("<'border-radius'>", '2px / 1px 1px', '2px / 1px')
        assert.valid("<'border-radius'>", '2px / 1px 2px 1px', '2px / 1px 2px')
        assert.valid("<'border-radius'>", '2px / 1px 1px 2px 1px', '2px / 1px 1px 2px')
        assert.valid("<'border-radius'>", '2px / 1px 2px 1px 2px', '2px / 1px 2px')
        assert.valid("<'border-radius'>", '1px / 1px', '1px')
        assert.valid("<'border-radius'>", '1px 2px / 1px 2px', '1px 2px')
        assert.valid("<'border-radius'>", '1px 2px 1px / 1px 2px 1px', '1px 2px')
        assert.valid("<'border-radius'>", '1px 1px 2px / 1px 1px 2px', '1px 1px 2px')
        assert.valid("<'border-radius'>", '1px 1px 1px 2px / 1px 1px 1px 2px', '1px 1px 1px 2px')
    })
})
