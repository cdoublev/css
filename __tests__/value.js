
const { atCenter, comma } = require('../lib/values/defaults.js')
const { MAX_INTEGER, MIN_INTEGER } = require('../lib/values/integers.js')
const { createParser, parseCSSGrammar, parseCSSPropertyValue } = require('../lib/parse/syntax.js')
const { toDegrees, toRadians } = require('../lib/utils/math.js')
const createOmitted = require('../lib/values/omitted.js')
const { createList: list } = require('../lib/values/value.js')
const parseDefinition = require('../lib/parse/definition.js')
const { serializeCSSValue } = require('../lib/serialize.js')

// Helpers to create component values
function component(value, type, representation = value) {
    return { representation, type: new Set(type), value }
}
function delimiter(value) {
    return component(value, ['delimiter'])
}
function number(value, type = [], representation = `${value}`) {
    return component(value, ['number', ...type], representation)
}
function percentage(value, type = [], representation = `${value}%`) {
    return { representation, type: new Set(['percentage', ...type]), unit: '%', value }
}
function dimension(value, unit, type = [], representation = `${value}${unit}`) {
    return { representation, type: new Set(['dimension', ...type]), unit, value }
}
function angle(value, unit, type = [], representation) {
    return dimension(value, unit, ['angle', ...type], representation)
}
function length(value, unit, type = [], representation) {
    return dimension(value, unit, ['length', ...type], representation)
}
function time(value, unit, type = [], representation) {
    return dimension(value, unit, ['time', ...type], representation)
}
function ident(value, type = [], representation) {
    return component(value, ['ident', ...type], representation)
}
function keyword(value, type = [], representation) {
    return ident(value, ['keyword', ...type], representation)
}
function hash(value, type = [], representation = `#${value}`) {
    return component(value, ['hash', ...type], representation)
}
function string(value, type = [], representation = `"${value}"`) {
    return component(value, ['string', ...type], representation)
}
function omitted(definition) {
    if (definition === ',' || definition === '/') {
        definition = `'${definition}'`
    }
    const node = parseDefinition(definition)
    return createOmitted(node)
}

/**
 * @param {string} definition
 * @param {string} value
 * @param {boolean} [parseGlobals]
 * @param {boolean} [serialize]
 * @returns {function|string}
 *
 * Helper to allow a CSS-wide keyword or a custom variable to match the given
 * definition, and to return the representation resulting from parsing instead
 * of its serialization.
 */
function parse(definition, value, parseGlobals = false, serialize = true) {
    value = parseGlobals
        ? parseCSSPropertyValue(value, 'color', parser)
        : parseCSSGrammar(value, definition, parser)
    if (value === null) {
        if (serialize) {
            return ''
        }
        return null
    }
    if (serialize) {
        return serializeCSSValue({ name: 'color', value })
    }
    return value
}

// Initialize Parser with a default context
const rules = []
const styleSheet = { _rules: rules, type: 'text/css' }
const styleRule = { parentStyleSheet: styleSheet, type: new Set(['style']) }

rules.push(
    { parentStyleSheet: styleSheet, prefix: 'html', type: new Set(['namespace']) },
    { parentStyleSheet: styleSheet, prefix: 'svg', type: new Set(['namespace']) },
    styleRule)

const parser = createParser(styleRule)

describe('combined types', () => {
    it('parses and serializes a value matched against a b', () => {
        const definition = 'a b'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a b')).toBe('a b')
    })
    it('parses and serializes a value matched against a && b', () => {
        const definition = 'a && b'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'b a')).toBe('a b')
    })
    it('parses and serializes a value matched against a || b', () => {
        const definition = 'a || b'
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'b a')).toBe('a b')
    })
    it('parses and serializes a value matched against a | b', () => {
        const definition = 'a | b'
        expect(parse(definition, 'c')).toBe('')
        expect(parse(definition, 'a b')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
    })
})
describe('multiplied types', () => {
    it('parses and serializes a value matched against a?', () => {
        const definition = 'a?'
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
    })
    it('parses a value matched against a?', () => {
        const definition = 'a?'
        expect(parse(definition, '', false, false)).toEqual(omitted('a?'))
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
    })
    it('parses and serializes a value matched against a*', () => {
        const definition = 'a*'
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a, a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
    })
    it('parses a value matched against a*', () => {
        const definition = 'a*'
        expect(parse(definition, '', false, false)).toEqual(list())
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a')]))
        expect(parse(definition, 'a a', false, false)).toEqual(list([keyword('a'), keyword('a')]))
    })
    it('parses and serializes a value matched against a+', () => {
        const definition = 'a+'
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a, a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
    })
    it('parses and serializes a value matched against a#', () => {
        const definition = 'a#'
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a, a,')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a , a')).toBe('a, a')
    })
    it('parses a value matched against a#', () => {
        const definition = 'a#'
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a')], ','))
        expect(parse(definition, 'a, a', false, false)).toEqual(list([keyword('a'), keyword('a')], ','))
    })
    it('parses and serializes a value matched against a#?', () => {
        const definition = 'a a#?'
        expect(parse(definition, 'a, a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    it('parses and serializes a value matched against a+#', () => {
        const definition = 'a+#'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
    })
    it('parses and serializes a value matched against a+#?', () => {
        const definition = 'a a+#?'
        expect(parse(definition, 'a, a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
        expect(parse(definition, 'a a, a a')).toBe('a a, a a')
        expect(parse(definition, 'a a a, a')).toBe('a a a, a')
    })
    it('parses and serializes a value matched against a{2}', () => {
        const definition = 'a{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('')
        expect(parse(definition, 'a, a')).toBe('')
    })
    it('parses a value matched against a{2}', () => {
        const definition = 'a{2}'
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'a a', false, false)).toEqual(list([keyword('a'), keyword('a')]))
    })
    it('parses and serializes a value matched against a{2,3}', () => {
        const definition = 'a{2,3}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a{2,∞}', () => {
        const definition = 'a{2,∞}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    it('parses and serializes a value matched against a{2,}', () => {
        const definition = 'a{2,}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    it('parses a value matched against a{0,∞}', () => {
        const definition = 'a{0,∞}'
        expect(parse(definition, '', false, false)).toEqual(list())
        expect(parse(definition, 'a a', false, false)).toEqual(list([keyword('a'), keyword('a')]))
    })
    it('parses a value matched against [a b?]', () => {
        const definition = '[a b?]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b?')]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a b?]?', () => {
        const definition = '[a b?]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('[a b?]?'))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b?')]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a b?]*', () => {
        const definition = '[a b?]*'
        expect(parse(definition, '', false, false)).toEqual(list())
        expect(parse(definition, 'a', false, false)).toEqual(list([list([keyword('a'), omitted('b?')])]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([list([keyword('a'), keyword('b')])]))
    })
    it('parses a value matched against [a b?]#', () => {
        const definition = '[a b?]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(list([list([keyword('a'), omitted('b?')])], ','))
        expect(parse(definition, 'a b', false, false)).toEqual(list([list([keyword('a'), keyword('b')])], ','))
    })
    it('parses a value matched against [a? b?]', () => {
        const definition = '[a? b?]'
        expect(parse(definition, '', false, false)).toEqual(list([omitted('a?'), omitted('b?')]))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b?')]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a? b?]?', () => {
        const definition = '[a? b?]?'
        expect(parse(definition, '', false, false)).toEqual(list([omitted('a?'), omitted('b?')]))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b?')]))
        expect(parse(definition, 'b', false, false)).toEqual(list([omitted('a?'), keyword('b')]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses and serializes a value matched against a [b? c?]!', () => {
        const definition = 'a [b? c?]!'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'a c')).toBe('a c')
    })
    it('parses a value matched against [a? b?]!', () => {
        const definition = '[a? b?]!'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b?')]))
        expect(parse(definition, 'b', false, false)).toEqual(list([omitted('a?'), keyword('b')]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a? b?]*', () => {
        const definition = '[a? b?]*'
        expect(parse(definition, '', false, false)).toEqual(list([list([omitted('a?'), omitted('b?')])]))
        expect(parse(definition, 'a', false, false)).toEqual(list([list([keyword('a'), omitted('b?')])]))
        expect(parse(definition, 'b', false, false)).toEqual(list([list([omitted('a?'), keyword('b')])]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([list([keyword('a'), keyword('b')])]))
    })
    it('parses a value matched against [a? b?]#', () => {
        const definition = '[a? b?]#'
        expect(parse(definition, '', false, false)).toEqual(list([list([omitted('a?'), omitted('b?')])], ','))
        expect(parse(definition, 'a', false, false)).toEqual(list([list([keyword('a'), omitted('b?')])], ','))
        expect(parse(definition, 'b', false, false)).toEqual(list([list([omitted('a?'), keyword('b')])], ','))
        expect(parse(definition, 'a b', false, false)).toEqual(list([list([keyword('a'), keyword('b')])], ','))
    })
    it('parses a value matched against [a b]', () => {
        const definition = '[a b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a b]?', () => {
        const definition = '[a b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('[a b]?'))
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a b]*', () => {
        const definition = '[a b]*'
        expect(parse(definition, '', false, false)).toEqual(list())
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(list([list([keyword('a'), keyword('b')])]))
    })
    it('parses a value matched against [a b]#', () => {
        const definition = '[a b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(list([list([keyword('a'), keyword('b')])], ','))
    })
    it('parses a value matched against [a | b]', () => {
        const definition = '[a | b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b', false, false)).toEqual(keyword('b'))
    })
    it('parses a value matched against [a | b]?', () => {
        const definition = '[a | b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('[a | b]?'))
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b', false, false)).toEqual(keyword('b'))
    })
    it('parses a value matched against [a | b]*', () => {
        const definition = '[a | b]*'
        expect(parse(definition, '', false, false)).toEqual(list())
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a')]))
        expect(parse(definition, 'b', false, false)).toEqual(list([keyword('b')]))
    })
    it('parses a value matched against [a | b]#', () => {
        const definition = '[a | b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a')], ','))
        expect(parse(definition, 'b', false, false)).toEqual(list([keyword('b')], ','))
    })
    it('parses a value matched against [a | b b]', () => {
        const definition = '[a | b b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b b', false, false)).toEqual(list([keyword('b'), keyword('b')]))
    })
    it('parses a value matched against [a | b b]?', () => {
        const definition = '[a | b b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('[a | b b]?'))
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b b', false, false)).toEqual(list([keyword('b'), keyword('b')]))
    })
    it('parses a value matched against [a | b b]*', () => {
        const definition = '[a | b b]*'
        expect(parse(definition, '', false, false)).toEqual(list())
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a')]))
        expect(parse(definition, 'b b', false, false)).toEqual(list([list([keyword('b'), keyword('b')])]))
    })
    it('parses a value matched against [a | b b]#', () => {
        const definition = '[a | b b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a')], ','))
        expect(parse(definition, 'b b', false, false)).toEqual(list([list([keyword('b'), keyword('b')])], ','))
    })
    it('parses a value matched against [a || b]', () => {
        const definition = '[a || b]'
        expect(parse(definition, '', false, false))
            .toBeNull()
        expect(parse(definition, 'a', false, false))
            .toEqual(list([keyword('a'), omitted('b')]))
        expect(parse(definition, 'b', false, false))
            .toEqual(list([omitted('a'), keyword('b')]))
        expect(parse(definition, 'a b', false, false))
            .toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a || b]?', () => {
        const definition = '[a || b]?'
        expect(parse(definition, '', false, false))
            .toEqual(omitted('[a || b]?'))
        expect(parse(definition, 'a', false, false))
            .toEqual(list([keyword('a'), omitted('b')]))
        expect(parse(definition, 'b', false, false))
            .toEqual(list([omitted('a'), keyword('b')]))
        expect(parse(definition, 'a b', false, false))
            .toEqual(list([keyword('a'), keyword('b')]))
    })
    it('parses a value matched against [a || b]*', () => {
        const definition = '[a || b]*'
        expect(parse(definition, '', false, false))
            .toEqual(list())
        expect(parse(definition, 'a', false, false))
            .toEqual(list([list([keyword('a'), omitted('b')])]))
        expect(parse(definition, 'b', false, false))
            .toEqual(list([list([omitted('a'), keyword('b')])]))
        expect(parse(definition, 'a b', false, false))
            .toEqual(list([list([keyword('a'), keyword('b')])]))
    })
    it('parses a value matched against [a || b]#', () => {
        const definition = '[a || b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a, b', false, false)).toEqual(list(
            [
                list([keyword('a'), omitted('b')]),
                list([omitted('a'), keyword('b')]),
            ],
            ','))
        expect(parse(definition, 'a', false, false)).toEqual(list(
            [
                list([keyword('a'), omitted('b')]),
            ],
            ','))
        expect(parse(definition, 'b', false, false)).toEqual(list(
            [
                list([omitted('a'), keyword('b')]),
            ],
            ','))
        expect(parse(definition, 'a b', false, false)).toEqual(list(
            [
                list([keyword('a'), keyword('b')]),
            ],
            ','))
        expect(parse(definition, 'a b, b', false, false)).toEqual(list(
            [
                list([keyword('a'), keyword('b')]),
                list([omitted('a'), keyword('b')]),
            ],
            ','))
    })
    it('parses a value matched against [a || b b]', () => {
        const definition = '[a || b b]'
        expect(parse(definition, '', false, false))
            .toBeNull()
        expect(parse(definition, 'a', false, false))
            .toEqual(list([keyword('a'), omitted('b b')]))
        expect(parse(definition, 'b b', false, false))
            .toEqual(list([omitted('a'), list([keyword('b'), keyword('b')])]))
        expect(parse(definition, 'a b b', false, false))
            .toEqual(list([keyword('a'), list([keyword('b'), keyword('b')])]))
    })
    it('parses a value matched against [a || b b]?', () => {
        const definition = '[a || b b]?'
        expect(parse(definition, '', false, false))
            .toEqual(omitted('[a || b b]?'))
        expect(parse(definition, 'a', false, false))
            .toEqual(list([keyword('a'), omitted('b b')]))
        expect(parse(definition, 'b b', false, false))
            .toEqual(list([omitted('a'), list([keyword('b'), keyword('b')])]))
        expect(parse(definition, 'a b b', false, false))
            .toEqual(list([keyword('a'), list([keyword('b'), keyword('b')])]))
    })
    it('parses a value matched against [a || b b]*', () => {
        const definition = '[a || b b]*'
        expect(parse(definition, '', false, false))
            .toEqual(list())
        expect(parse(definition, 'a', false, false))
            .toEqual(list([list([keyword('a'), omitted('b b')])]))
        expect(parse(definition, 'b b', false, false))
            .toEqual(list([list([omitted('a'), list([keyword('b'), keyword('b')])])]))
        expect(parse(definition, 'a b b', false, false))
            .toEqual(list([list([keyword('a'), list([keyword('b'), keyword('b')])])]))
    })
    it('parses a value matched against [a || b b]#', () => {
        const definition = '[a || b b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false))
            .toEqual(list([list([keyword('a'), omitted('b b')])], ','))
        expect(parse(definition, 'b b', false, false))
            .toEqual(list([list([omitted('a'), list([keyword('b'), keyword('b')])])], ','))
        expect(parse(definition, 'a b b', false, false))
            .toEqual(list([list([keyword('a'), list([keyword('b'), keyword('b')])])], ','))
    })
})
describe('backtracking', () => {
    // Simple backtracking (depth: 1)
    it('parses and serializes a value matched against a | a a', () => {
        const definition = 'a | a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('')
    })
    it('parses and serializes a value matched against a || a a', () => {
        const definition = 'a || a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a a || a', () => {
        const definition = 'a a || a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a && a a', () => {
        const definition = 'a && a a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a a && a', () => {
        const definition = 'a a && a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    // Simple backtracking (depth: 2)
    it('parses and serializes a value matched against [a | a a]{2}', () => {
        const definition = '[a | a a]{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a | a a] a', () => {
        const definition = '[a | a a] a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a? a{2}', () => {
        const definition = 'a? a{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    it('parses and serializes a value matched against a? a? | a a a', () => {
        const definition = 'a? a? | a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a a a | a? a?', () => {
        const definition = 'a a a | a? a?'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a? && a?] a', () => {
        const definition = '[a? && a?] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a? || a a] a', () => {
        const definition = '[a? || a a] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a? | b] a', () => {
        const definition = '[a? | a a] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    // Complex backtracking (depth: 1)
    it('parses and serializes a value matched against a | a a | a a a', () => {
        const definition = 'a | a a | a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a || a a || a a a', () => {
        const definition = 'a || a a || a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a && a b && a b c', () => {
        const definition = 'a && a b && a b c'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b')).toBe('')
        expect(parse(definition, 'a a b')).toBe('')
        expect(parse(definition, 'a b a')).toBe('')
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a a b c')).toBe('')
        expect(parse(definition, 'a b c a')).toBe('')
        expect(parse(definition, 'a b a b c')).toBe('')
        expect(parse(definition, 'a b c a b')).toBe('')
        expect(parse(definition, 'a a b a b c')).toBe('a a b a b c')
        expect(parse(definition, 'a a b c a b')).toBe('a a b a b c')
        expect(parse(definition, 'a b a b c a')).toBe('a a b a b c')
        expect(parse(definition, 'a b a a b c')).toBe('a a b a b c')
        expect(parse(definition, 'a b c a b a')).toBe('a a b a b c')
        expect(parse(definition, 'a b c a a b')).toBe('a a b a b c')
        expect(parse(definition, 'a b c a b c')).toBe('')
        expect(parse(definition, 'a a b a b c a')).toBe('')
    })
    // Complex backtracking (depth: 2)
    it('parses and serializes a value matched against [a | a a | a a a]{2}', () => {
        const definition = '[a | a a | a a a]{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a [a | a a | a a a]', () => {
        const definition = 'a [a | a a | a a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a [a || a a || a a a]', () => {
        const definition = 'a [a || a a || a a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a && [a | a a | a a a]', () => {
        const definition = 'a && [a | a a | a a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a && [a || a a || a a a]', () => {
        const definition = 'a && [a || a a || a a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a || [a | a a | a a a]', () => {
        const definition = 'a || [a | a a | a a a]'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a | [a || a a || a a a]', () => {
        const definition = 'a | [a || a a || a a a]'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a | a a | a a a] a', () => {
        const definition = '[a | a a | a a a] a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a || a a || a a a] a', () => {
        const definition = '[a || a a || a a a] a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a')).toBe('')
    })
    // Complex backtracking (depth: 2 + 2)
    it('parses and serializes a value matched against [a | a a | a a a] [a | a a]', () => {
        const definition = '[a | a a | a a a] [a | a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('')
    })
    // Complex backtracking (depth: 3)
    it('parses and serializes a value matched against a | a [a | a a]', () => {
        const definition = 'a | a [a | a a]'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a [a && [a | a a]]', () => {
        const definition = 'a [a && [a | a a]]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    /**
     * Requirements:
     *
     * 1. Replacing must only apply once (ie. not after backtracking).
     *
     * 2. The list index must backtrack to a location saved/resolved from state
     * instead of from the index of a component value in the list.
     *
     * 3. The result from processing a math function should not replace the
     * input component value, because this processing depends on the context
     * production.
     */
    it('parses and serializes a replacing value', () => {
        expect(parse('<number>{2}', 'calc(1) a')).toBe('')
        expect(parse('<angle-percentage>{1,2} <length-percentage>', '1deg calc(1%)')).toBe('1deg calc(1%)')
    })
})
describe('comma-separated types', () => {
    // Comma-elision rules apply
    it('parses and serializes a value matched against a?, a?, a', () => {

        const definition = 'a?, a?, a'

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', a')).toBe('')
        expect(parse(definition, 'a,, a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a, a,')).toBe('')
        expect(parse(definition, ', a, a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a , a')).toBe('a, a')
        expect(parse(definition, 'a,a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    it('parses and serializes a value matched against a, a?, a?', () => {

        const definition = 'a, a?, a?'

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', a')).toBe('')
        expect(parse(definition, 'a,, a')).toBe('')
        expect(parse(definition, 'a, a,')).toBe('')
        expect(parse(definition, ', a, a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    it('parses and serializes a value matched against [a?, a?,] a', () => {

        const definition = '[a?, a?,] a'

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a,, a')).toBe('')
        expect(parse(definition, ', a, a')).toBe('')

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    it('parses and serializes a value matched against a [, a? , a?]', () => {

        const definition = 'a [, a? , a?]'

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a a,, a')).toBe('')
        expect(parse(definition, 'a, a,')).toBe('')

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    it('parses and serializes a value matched against a, && a, && a', () => {

        const definition = 'a, && a, && a'

        expect(parse(definition, 'a a a')).toBe('')
        expect(parse(definition, 'a a, a,')).toBe('')

        expect(parse(definition, 'a, a a')).toBe('a, a a')
        expect(parse(definition, 'a a, a')).toBe('a, a a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    it('parses and serializes a value matched against a, || a, || a', () => {

        const definition = 'a, || a, || a'

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a a,')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')
        expect(parse(definition, 'a a, a,')).toBe('')

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
        expect(parse(definition, 'a a, a')).toBe('a, a a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    it('parses and serializes a value matched against a#?, a', () => {

        const definition = 'a#?, a'

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a,,')).toBe('')
        expect(parse(definition, 'a a')).toBe('')

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
    })
    it('parses and serializes a value matched against a*, a', () => {

        const definition = 'a*, a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
    })
    // Comma-ellision rules do or do not apply
    it('parses and serializes a value matched against a [a?, && a]', () => {

        const definition = 'a [a?, && a]'

        expect(parse(definition, 'a a,')).toBe('')
        expect(parse(definition, 'a a a,')).toBe('')

        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    // Comma-elision rules do not apply
    it('parses and serializes a value matched against a a?, a', () => {

        const definition = 'a a?, a'

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    it('parses and serializes a value matched against a, a? a', () => {

        const definition = 'a, a? a'

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
    })
    it('parses and serializes a value matched against a [a?, a]', () => {

        const definition = 'a [a?, a]'

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    it('parses and serializes a value matched against a [, a? a]', () => {

        const definition = 'a [, a? a]'

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')
    })
    it('parses and serializes a value matched against [a a?,] a', () => {

        const definition = '[a a?,] a'

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
})
describe('optional whitespace', () => {
    it('parses and serializes a value without optional whitespace', () => {
        expect(parse('a a', 'a/**/a')).toBe('a a')
    })
    it('parses and serializes a value with leading and trailing whitespaces', () => {
        expect(parse('fn(a)', '  fn(  a  )  ')).toBe('fn(a)')
        expect(parse('(a)', '  (  a  )  ')).toBe('(a)')
    })
})

describe('<any-value>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // One or more tokens
            '',
            // Invalid tokens
            '"bad\nstring"',
            'url(bad .url)',
            ')',
            ']',
            '}',
        ]
        invalid.forEach(input => expect(parse('<any-value>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<any-value>', 'any value', false, false))
            .toEqual(list([ident('any'), delimiter(' '), ident('value')], '', ['any-value']))
        expect(parse('<any-value>', ';', false, false))
            .toEqual(list([delimiter(';')], '', ['any-value']))
        expect(parse('<any-value>', '!', false, false))
            .toEqual(list([delimiter('!')], '', ['any-value']))
    })
})
describe('<declaration-value>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // One or more tokens
            '',
            // Invalid tokens
            '"bad\nstring"',
            'url(bad .url)',
            ')',
            ']',
            '}',
            ';',
            '!',
        ]
        invalid.forEach(input => expect(parse('<declaration-value>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<declaration-value>', 'declaration value', false, false))
            .toEqual(list([ident('declaration'), delimiter(' '), ident('value')], '', ['declaration-value']))
    })
})
describe('<declaration>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            'color red',
            'color: red;',
        ]
        invalid.forEach(input => expect(parse('<declaration>', input, true, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<declaration>', 'color: green !important', false, false)).toEqual({
            important: true,
            name: 'color',
            type: new Set(['declaration']),
            value: keyword('green', ['named-color', 'absolute-color-base', 'color']),
        })
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['color :green !important  ', 'color: green !important'],
            ['color: initial'],
            ['color: var(--custom)'],
            ['--custom: '],
            ['--custom: green'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<declaration>', input)).toBe(expected))
    })
})
describe('<var()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            'var(--custom, var(--))',
            'var(--custom, var(1px))',
        ]
        invalid.forEach(input => expect(parse('<var()>', input, true, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<var()>', 'var(--custom)', true, false)).toEqual(list(
            [{
                name: 'var',
                representation: 'var(--custom)',
                type: new Set(['function', 'var()']),
                value: list([ident('--custom', ['custom-property-name'])], ''),
            }],
            ''))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['var(--custom'],
            ['var(--custom, )'],
            ['var(--custom, var(--fallback))'],
            ['fn(var(--custom))'],
            ['  /* comment */  var(  --PROPerty/*, fallback */, 1e0  )  ', 'var(  --PROPerty/*, fallback */, 1e0  )'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('a', input, true)).toBe(expected))
    })
})

describe('<ident>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '1identifier',
            '!identifier',
            '-1identifier',
            '-!identifier',
            // Invalid escape sequence (parse error)
            '\\\n',
            '-\\\n',
        ]
        invalid.forEach(input => expect(parse('<ident>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<ident>', 'identifier', false, false)).toEqual(ident('identifier'))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Starts with identifier start code point
            ['identifier'],
            ['·identifier'],
            ['_identifier'],
            // Starts with escape sequence
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
            // Starts with -
            ['--'],
            ['-identifier'],
            ['-·identifier'],
            ['-_identifier'],
            ['-\\31identifier', '-\\31 identifier'],
            // Contains identifier code points
            ['identifier·'],
            ['identifier_'],
            ['identifier1'],
            ['identifier-'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<ident>', input)).toBe(expected))
    })
})
describe('keyword', () => {
    it('parses a valid value', () => {
        expect(parse('solid', 'inherit', true, false)).toEqual(keyword('inherit', ['css-wide-keyword']))
        expect(parse('solid', 'solid', false, false)).toEqual(keyword('solid'))
    })
    it('parses and serializes a valid value', () => {
        // CSS-wide keyword
        expect(parse('solid', 'INItial', true)).toBe('initial')
        expect(parse('solid', 'initial', true)).toBe('initial')
        expect(parse('solid', 'inherit', true)).toBe('inherit')
        expect(parse('solid', 'revert', true)).toBe('revert')
        expect(parse('solid', 'unset', true)).toBe('unset')
        // Pre-defined keyword
        expect(parse('solid', 'SOLId')).toBe('solid')
    })
    it('parses and serializes a vendor prefixed mapping keyword', () => {
        expect(parse('flex', '-webkit-box')).toBe('-webkit-box')
        expect(parse('flex', '-webkit-flex')).toBe('-webkit-flex')
        expect(parse('inline-flex', '-webkit-inline-box')).toBe('-webkit-inline-box')
        expect(parse('inline-flex', '-webkit-inline-flex')).toBe('-webkit-inline-flex')
    })
})
describe('<custom-ident>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '1identifier',
            '!identifier',
            '-1identifier',
            '-!identifier',
            // Invalid escape sequence (parse error)
            '\\\n',
            '-\\\n',
            // Reserved
            'initial',
            'inherit',
            'unset',
            'default',
        ]
        invalid.forEach(input => expect(parse('<custom-ident>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<custom-ident>', 'customIdentifier', false, false))
            .toEqual(ident('customIdentifier', ['custom-ident']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Starts with identifier start code point
            ['identifier'],
            ['·identifier'],
            ['_identifier'],
            // Starts with escape sequence
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
            // Starts with -
            ['--'],
            ['-identifier'],
            ['-·identifier'],
            ['-_identifier'],
            ['-\\31identifier', '-\\31 identifier'],
            // Contains identifier code points
            ['identifier·'],
            ['identifier_'],
            ['identifier1'],
            ['identifier-'],
            // Case-sensitive
            ['PascalCase'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<custom-ident>', input)).toBe(expected))
    })
})
describe('<dashed-ident>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Does not start with --
            'identifier',
            // Invalid identifier code point
            '--identifier!',
            // Invalid escape sequence (parse error)
            '--identifier\\\n',
        ]
        invalid.forEach(input => expect(parse('<dashed-ident>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<dashed-ident>', '--dashed-ident', false, false))
            .toEqual(ident('--dashed-ident', ['dashed-ident']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Contains identifier code points or escape sequences
            ['--'],
            ['--identifier·'],
            ['--identifier_'],
            ['--identifier1'],
            ['--identifier-'],
            ['--identifier\\', '--identifier�'],
            ['--identifier\\0', '--identifier�'],
            ['--identifier\\D800', '--identifier�'],
            ['--identifier\\110000', '--identifier�'],
            ['--identifier\\0000311', '--identifier11'],
            ['--identifier\\31 1', '--identifier11'],
            ['--identifier\\A', '--identifier\\a '],
            ['--identifie\\72', '--identifier'],
            ['--identifie\\r', '--identifier'],
            ['--identifier\\21', '--identifier\\!'],
            ['--identifier\\!'],
            ['--identifier\\A9', '--identifier\\©'],
            ['--identifier\\©'],
            // Case-sensitive
            ['--PascalCase'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<dashed-ident>', input)).toBe(expected))
    })
})
describe('<custom-property-name>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<custom-property-name>', '--')).toBe('')
    })
    it('parses a valid value', () => {
        expect(parse('<custom-property-name>', '--custom', false, false))
            .toEqual(ident('--custom', ['custom-property-name']))
    })
})
describe('<ndashdigit-ident>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-n-1',
            'n--1',
            'n-1-',
        ]
        invalid.forEach(input => expect(parse('<ndashdigit-ident>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<ndashdigit-ident>', 'n-1', false, false))
            .toEqual(ident('n-1', ['ndashdigit-ident']))
        expect(parse('<ndashdigit-ident>', 'N-1', false, false))
            .toEqual(ident('n-1', ['ndashdigit-ident'], 'N-1'))
        expect(parse('<ndashdigit-ident>', 'n-12', false, false))
            .toEqual(ident('n-12', ['ndashdigit-ident']))
    })
})
describe('<dashndashdigit-ident>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '--n-1',
            '-n--1',
            '-n-1-',
        ]
        invalid.forEach(input => expect(parse('<dashndashdigit-ident>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<dashndashdigit-ident>', '-n-1', false, false))
            .toEqual(ident('-n-1', ['dashndashdigit-ident']))
        expect(parse('<dashndashdigit-ident>', '-N-1', false, false))
            .toEqual(ident('-n-1', ['dashndashdigit-ident'], '-N-1'))
        expect(parse('<dashndashdigit-ident>', '-n-12', false, false))
            .toEqual(ident('-n-12', ['dashndashdigit-ident']))
    })
})
describe('<string>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<string>', '"\n"')).toBe('')
    })
    it('parses a valid value', () => {
        expect(parse('<string>', '"css"', false, false)).toEqual(string('css'))
        expect(parse('<string>', '"css', false, false)).toEqual(string('css', undefined, '"css'))
    })
    it('parses and serializes a valid value', () => {
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
    it('fails to parse an invalid value', () => {
        const invalid = [
            'url(inval id.url)',
            'url(inval\nid.url)',
            'url(inval\tid.url)',
            'url(inval"id.url)',
            "url(inval'id.url)",
            'url(inval(id.url)',
            'url(inval\u0001id.url)',
            'url(inval\\\nid.url)',
        ]
        invalid.forEach(input => expect(parse('<url>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<url>', 'url(img.jpg)', false, false)).toEqual({
            representation: 'url(img.jpg)',
            type: new Set(['url-token', 'url']),
            value: 'img.jpg',
        })
        expect(parse('<url>', 'url("img.jpg")', false, false)).toEqual({
            name: 'url',
            representation: 'url("img.jpg")',
            type: new Set(['function', 'url']),
            value: list([string('img.jpg'), list()]),
        })
        expect(parse('<url>', 'src("img.jpg")', false, false)).toEqual({
            name: 'src',
            representation: 'src("img.jpg")',
            type: new Set(['function', 'url']),
            value: list([string('img.jpg'), list()]),
        })
    })
    it('parses and serializes an unclosed URL', () => {
        const valid = [
            // Unclosed (parse error)
            ['url(', 'url("")'],
            ['url( ', 'url("")'],
            ['url(\n', 'url("")'],
            ['url(\t', 'url("")'],
            ['url(\\', 'url("�")'],
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

describe('<zero>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '+0',
            '0e1',
            '0px',
            'calc(0)',
        ]
        invalid.forEach(input => expect(parse('<zero>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<zero>', '0', false, false)).toEqual(number(0, ['zero']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<zero>', '0')).toBe('0')
    })
})
describe('<integer>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1.1',
            '1e-1',
            '1px',
            'calc(1px)',
        ]
        invalid.forEach(input => expect(parse('<integer [0,∞]>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<integer>', '1', false, false)).toEqual(number(1, ['integer']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // https://github.com/w3c/csswg-drafts/issues/7289
            ['1e1', '10'],
            ['1e+1', '10'],
            ['1234567'],
            // 8 bits signed integer (browser conformance)
            [`${MIN_INTEGER - 1}`, MIN_INTEGER],
            [`${MAX_INTEGER + 1}`, MAX_INTEGER],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<integer>', input)).toBe(expected))
    })
    it('parses 0 with priority over <length> in `|` or `||` combinations', () => {
        // https://github.com/w3c/csswg-drafts/issues/489
        expect(parse('<length> | <integer>', '0')).toBe('0')
        expect(parse('<length> || <integer>', '0')).toBe('0')
        expect(parse('<length-percentage> | <integer>', '0')).toBe('0')
        expect(parse('<length-percentage> || <integer>', '0')).toBe('0')
        expect(parse('<length> && <integer>', '0 1')).toBe('0px 1')
        expect(parse('<integer> && <length>', '0 1')).toBe('1 0px')
    })
})
describe('<signless-integer>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-1',
            '+1',
            '1.1',
            '1e-1',
            '1px',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<signless-integer>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<signless-integer>', '1', false, false)).toEqual(number(1, ['signless-integer']))
        // https://github.com/w3c/csswg-drafts/issues/7289
        expect(parse('<signless-integer>', '1e+1', false, false)).toEqual(number(10, ['signless-integer'], '1e+1'))
    })
})
describe('<signed-integer>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1',
            '+1.1',
            '+1e-1',
            '+1px',
            'calc(+1)',
        ]
        invalid.forEach(input => expect(parse('<signed-integer>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<signed-integer>', '+1', false, false))
            .toEqual(number(1, ['signed-integer'], '+1'))
        expect(parse('<signed-integer>', '-1', false, false))
            .toEqual(number(-1, ['signed-integer'], '-1'))
        expect(parse('<signed-integer>', '+1e1', false, false))
            .toEqual(number(10, ['signed-integer'], '+1e1'))
    })
})
describe('<number>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1px',
            '-1',
            'calc(1px)',
        ]
        invalid.forEach(input => expect(parse('<number [0,∞]>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<number>', '1', false, false)).toEqual(number(1))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Scientific notation
            ['1e1', '10'],
            ['1e+1', '10'],
            ['1e-1', '0.1'],
            // Leading 0
            ['.1', '0.1'],
            // Trailing 0
            ['0.10', '0.1'],
            // https://github.com/w3c/csswg-drafts/issues/6471
            ['1e-6', '0.000001'],
            ['1e-7', '0'],
            ['0.123456'],
            ['0.1234567', '0.123457'],
            ['1.234567'],
            ['1.2345678', '1.234568'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<number>', input)).toBe(expected))
    })
    it('parses 0 with priority over <length> in `|` or `||` combinations', () => {
        // https://github.com/w3c/csswg-drafts/issues/489
        expect(parse('<length> | <number>', '0')).toBe('0')
        expect(parse('<length> || <number>', '0')).toBe('0')
        expect(parse('<length-percentage> | <number>', '0')).toBe('0')
        expect(parse('<length-percentage> || <number>', '0')).toBe('0')
        expect(parse('<length> && <number>', '0 1')).toBe('0px 1')
        expect(parse('<number> && <length>', '0 1')).toBe('1 0px')
    })
})
describe('<dimension-token>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '1!identifier',
            '1-1identifier',
            '1-!identifier',
            // Invalid escape sequence (parse error)
            '1\\\n',
            '1-\\\n',
        ]
        invalid.forEach(input => expect(parse('<dimension-token>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<dimension-token>', '1identifier', false, false))
            .toEqual(dimension(1, 'identifier', ['dimension-token']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Starts with identifier start code point
            ['1identifier'],
            ['1·identifier'],
            ['1_identifier'],
            // Starts with escape sequence
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
            // Starts with -
            ['1--'],
            ['1-identifier'],
            ['1-·identifier'],
            ['1-_identifier'],
            ['1-\\31identifier', '1-\\31 identifier'],
            // Contains identifier code points
            ['1identifier·'],
            ['1identifier_'],
            ['1identifier1'],
            ['1identifier-'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<dimension-token>', input)).toBe(expected))
    })
})
describe('<length>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-1px',
            '1',
            '1%',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<length [0,∞]>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<length>', '0', false, false)).toEqual(length(0, 'px', undefined, '0'))
        expect(parse('<length>', '1px', false, false)).toEqual(length(1, 'px'))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Scientific notation
            ['1e1px', '10px'],
            ['1e+1px', '10px'],
            ['1e-1px', '0.1px'],
            // Leading 0
            ['.1px', '0.1px'],
            // Trailing 0
            ['0.10px', '0.1px'],
            // Case-insensitive
            ['1Px', '1px'],
            ['1Q', '1q'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<length>', input)).toBe(expected))
    })
})
describe('<percentage>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '0',
            '1px',
            '-1%',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<percentage [0,∞]>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<percentage>', '1%', false, false)).toEqual(percentage(1))
    })
    it('parses and serializes a valid value', () => {
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
        valid.forEach(([input, expected = input]) => expect(parse('<percentage>', input)).toBe(expected))
    })
})
describe('<length-percentage>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<length-percentage [0,∞]>', '-1px')).toBe('')
        expect(parse('<length-percentage [0,∞]>', '-1%')).toBe('')
        expect(parse('<length-percentage>', '1deg')).toBe('')
    })
    it('parses a valid value', () => {
        expect(parse('<length-percentage>', '1px', false, false))
            .toEqual(length(1, 'px', ['length-percentage']))
    })
    it('parses and serializes valid value', () => {
        expect(parse('<length-percentage>', '1px')).toBe('1px')
        expect(parse('<length-percentage>', '1%')).toBe('1%')
    })
})
describe('<alpha-value>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1px',
            'calc(1px)',
            'calc(0.5 + 50%)',
        ]
        invalid.forEach(input => expect(parse('<alpha-value>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<alpha-value>', '1', false, false)).toEqual(number(1, ['alpha-value']))
        expect(parse('<alpha-value>', '1%', false, false)).toEqual(percentage(1, ['alpha-value']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Scientific notation
            ['1e0', '1'],
            ['1e+0', '1'],
            ['1e-1', '0.1'],
            // Leading 0
            ['.1', '0.1'],
            // Trailing 0
            ['0.10', '0.1'],
            // Serializes to number
            ['50%', '0.5'],
            // Clamped between 0 and 1 at computed value time
            ['-1'],
            ['2'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<alpha-value>', input)).toBe(expected))
    })
})
describe('<angle>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-1deg',
            '1turn',
            '1',
            '1px',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<angle [0,1deg]>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<angle>', '0', false, false)).toEqual(angle(0, 'deg', undefined, '0'))
        expect(parse('<angle>', '1deg', false, false)).toEqual(angle(1, 'deg'))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Scientific notation
            ['1e1deg', '10deg'],
            ['1e+1deg', '10deg'],
            ['1e-1deg', '0.1deg'],
            // Leading 0
            ['.1deg', '0.1deg'],
            // Trailing 0
            ['0.10deg', '0.1deg'],
            // Case-insensitive
            ['1DEg', '1deg'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<angle [0,1turn]>', input)).toBe(expected))
    })
})
describe('<time>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1s',
            '1',
            '1px',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<time [0,1ms]>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<time>', '1s', false, false)).toEqual(time(1, 's'))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Scientific notation
            ['1e1s', '10s'],
            ['1e+1s', '10s'],
            ['1e-1s', '0.1s'],
            // Leading 0
            ['.1s', '0.1s'],
            // Trailing 0
            ['0.10s', '0.1s'],
            // Case-insensitive
            ['1Ms', '1ms'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<time [1ms,∞]>', input)).toBe(expected))
    })
})
describe('<dimension>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '1!identifier',
            '1-1identifier',
            '1-!identifier',
            // Invalid escape sequence (parse error)
            '1\\\n',
            '1-\\\n',
        ]
        invalid.forEach(input => expect(parse('<dimension>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<dimension>', '1identifier', false, false)).toEqual(dimension(1, 'identifier'))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Starts with identifier start code point
            ['1identifier'],
            ['1·identifier'],
            ['1_identifier'],
            // Starts with escape sequence
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
            // Starts with -
            ['1--'],
            ['1-identifier'],
            ['1-·identifier'],
            ['1-_identifier'],
            ['1-\\31identifier', '1-\\31 identifier'],
            // Contains identifier code points
            ['1identifier·'],
            ['1identifier_'],
            ['1identifier1'],
            ['1identifier-'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<dimension>', input)).toBe(expected))
    })
})
describe('<n-dimension>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1n-',
            '1.1n',
            'calc(1n)',
        ]
        invalid.forEach(input => expect(parse('<n-dimension>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<n-dimension>', '1n', false, false)).toEqual(dimension(1, 'n', ['n-dimension']))
        expect(parse('<n-dimension>', '1N', false, false)).toEqual(dimension(1, 'n', ['n-dimension'], '1N'))
    })
})
describe('<ndash-dimension>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1n',
            '1.1n-',
            'calc(1n-)',
        ]
        invalid.forEach(input => expect(parse('<ndash-dimension>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<ndash-dimension>', '1n-', false, false)).toEqual(dimension(1, 'n-', ['ndash-dimension']))
        expect(parse('<ndash-dimension>', '1N-', false, false)).toEqual(dimension(1, 'n-', ['ndash-dimension'], '1N-'))
    })
})
describe('<ndashdigit-dimension>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1n-',
            '1.1n-1',
            'calc(1n-1)',
        ]
        invalid.forEach(input => expect(parse('<ndashdigit-dimension>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<ndashdigit-dimension>', '1n-1', false, false))
            .toEqual(dimension(1, 'n-1', ['ndashdigit-dimension']))
        expect(parse('<ndashdigit-dimension>', '1N-1', false, false))
            .toEqual(dimension(1, 'n-1', ['ndashdigit-dimension'], '1N-1'))
        expect(parse('<ndashdigit-dimension>', '1n-11', false, false))
            .toEqual(dimension(1, 'n-11', ['ndashdigit-dimension']))
    })
})
describe('<urange>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid whitespaces
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
        invalid.forEach(input => expect(parse('<urange>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<urange>', 'U+0-f', false, false)).toEqual({
            end: 15,
            start: 0,
            type: new Set(['urange']),
        })
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['U+0'],
            ['u+0a-1a', 'U+A-1A'],
            ['U+0000-00001', 'U+0-1'],
            ['U+????', 'U+0-FFFF'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<urange>', input)).toBe(expected))
    })
})
describe('<an+b>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '+ n-1',
            '+ n- 1',
            '+ n -1',
            '+ n - 1',
        ]
        invalid.forEach(input => expect(parse('<an+b>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<an+b>', 'even', false, false)).toEqual({
            representation: 'even',
            type: new Set(['an+b']),
            value: { a: 2, b: 0 },
        })
        expect(parse('<an+b>', '1n+1', false, false)).toEqual({
            representation: '1n+1',
            type: new Set(['an+b']),
            value: { a: 1, b: 1 },
        })
    })
    it('parses and serializes a valid value', () => {
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

describe('<calc()>', () => {
    it('fails to parse an invalid value', () => {

        // Whitespace is required on both sides of `+` and `-`
        expect(parse('<number>', 'calc(1+ 1)')).toBe('')
        expect(parse('<number>', 'calc(1 +1)')).toBe('')
        expect(parse('<number>', 'calc(1- 1)')).toBe('')
        expect(parse('<number>', 'calc(1 -1)')).toBe('')

        // Maximum 32 <calc-value> or nested calculations or functions
        expect(parse('<number>', `calc(${[...Array(32)].reduce((n, _, i) => `${n} ${i < 15 ? '+' : '*'} 1`, '0')})`)).toBe('')
        expect(parse('<number>', `calc(${[...Array(33)].reduce(n => `(${n})`, '1')})`)).toBe('')
        expect(parse('<number>', `calc(${[...Array(33)].reduce(n => `calc(${n})`, '1')})`)).toBe('')
        expect(parse('<number>', `calc(1 + (${[...Array(32)].reduce(n => `${n} + 1`, '0')}))`)).toBe('')
        expect(parse('<number>', `calc(1 + calc(${[...Array(32)].reduce(n => `${n} + 1`, '0')}))`)).toBe('')

        // Resolved type mismatch
        expect(parse('<number>', 'calc(1px)')).toBe('')
        expect(parse('<number>', 'calc(1%)')).toBe('')
        expect(parse('<length>', 'calc(1)')).toBe('')
        expect(parse('<length>', 'calc(1%)')).toBe('')
        expect(parse('<length>', 'calc(1px + 1s)')).toBe('')
        expect(parse('<number>', 'calc(1px - 1s)')).toBe('')
        expect(parse('<number>', 'calc(1px * 1s)')).toBe('')
        expect(parse('<number>', 'calc(1px / 1s)')).toBe('')
        expect(parse('<length>', 'calc(1px + 1)')).toBe('')
        expect(parse('<length>', 'calc(1px - 1)')).toBe('')
        expect(parse('<length>', 'calc(1 + 1px)')).toBe('')
        expect(parse('<length>', 'calc(1 - 1px)')).toBe('')
        expect(parse('<length>', 'calc(1 / 1px)')).toBe('')
        expect(parse('<length>', 'calc(1px * 1px)')).toBe('')
        expect(parse('<length>', 'calc(1px / 1px)')).toBe('')
        expect(parse('<number>', 'calc(1px / 1px / 1px)')).toBe('')
        expect(parse('<percentage>', 'calc(1% * 1%)')).toBe('')
        expect(parse('<percentage>', 'calc(1% / 1%)')).toBe('')
        expect(parse('<percentage>', 'calc(1 / 1%)')).toBe('')

        // <dimension> does not match a type that a math function can resolve to
        expect(parse('<dimension>', 'calc(1n)')).toBe('')

        // 0 is parsed as <number> in calculations
        expect(parse('<length>', 'calc(0 + 1px)')).toBe('')
        expect(parse('<length>', 'calc(0 - 1px)')).toBe('')

        // <number> and <percentage> are not combinable
        expect(parse('<number> | <percentage>', 'calc(1 + 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'calc(1 - 1%)')).toBe('')
    })
    it('parses a valid value', () => {
        const one = number(1, ['calc-value'])
        const two = number(2, ['calc-value'])
        // Unresolved calculations
        expect(parse('<calc()>', 'calc(1)', false, false)).toEqual({
            name: 'calc',
            representation: 'calc(1)',
            type: new Set(['function', 'calc()']),
            value: one,
        })
        expect(parse('<calc()>', 'calc(1 + 2)', false, false)).toEqual({
            name: 'calc',
            representation: 'calc(1 + 2)',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-sum']),
                value: [one, two],
            },
        })
        expect(parse('<calc()>', 'calc(1 - 2)', false, false)).toEqual({
            name: 'calc',
            representation: 'calc(1 - 2)',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-sum']),
                value: [one, { type: new Set(['calc-negate']), value: two }],
            },
        })
        expect(parse('<calc()>', 'calc(1 * 2)', false, false)).toEqual({
            name: 'calc',
            representation: 'calc(1 * 2)',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-product']),
                value: [one, two],
            },
        })
        expect(parse('<calc()>', 'calc(1 / 2)', false, false)).toEqual({
            name: 'calc',
            representation: 'calc(1 / 2)',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-product']),
                value: [one, { type: new Set(['calc-invert']), value: two }],
            },
        })
        // Resolved calculations
        expect(parse('<number>', 'calc(1)', false, false)).toEqual({
            name: 'calc',
            numericType: new Map(),
            range: undefined,
            representation: 'calc(1)',
            round: false,
            type: new Set(['function', 'calc()']),
            value: number(1, ['calc-value']),
        })
        expect(parse('<number>', 'calc(1 + 2)', false, false)).toEqual({
            name: 'calc',
            numericType: new Map(),
            range: undefined,
            representation: 'calc(1 + 2)',
            round: false,
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['number', 'calc-value']),
                value: 3,
            },
        })
    })
    it('parses and serializes calc() with a single operand', () => {
        // <number>, <percentage>, <dimension>
        expect(parse('<number>', 'CALc(1)')).toBe('calc(1)')
        expect(parse('<percentage>', 'calc(1%)')).toBe('calc(1%)')
        expect(parse('<length>', 'calc(1px)')).toBe('calc(1px)')
        // <type-percentage>
        expect(parse('<number> | <percentage>', 'calc(1)')).toBe('calc(1)')
        expect(parse('<number> | <percentage>', 'calc(100%)')).toBe('calc(1)')
        expect(parse('<length-percentage>', 'calc(1px)')).toBe('calc(1px)')
        expect(parse('<length-percentage>', 'calc(1%)')).toBe('calc(1%)')
        expect(parse('<length> | <percentage>', 'calc(1%)')).toBe('calc(1%)')
        expect(parse('<length> | <percentage>', 'calc(1px)')).toBe('calc(1px)')
        expect(parse('a | <percentage> | b | <length> | c', 'calc(1px)')).toBe('calc(1px)')
        // Nested calculation or math function
        expect(parse('<number>', 'calc((1))')).toBe('calc(1)')
        expect(parse('<number>', 'calc(calc(1))')).toBe('calc(1)')
        expect(parse('<number>', 'calc(min(1))')).toBe('calc(1)')
        expect(parse('<length>', 'calc((1em))')).toBe('calc(1em)')
        expect(parse('<length>', 'calc(calc(calc(1em)))')).toBe('calc(1em)')
        expect(parse('<number>', 'calc(sign(1em))')).toBe('sign(1em)')
        expect(parse('<length>', 'calc(min(1em))')).toBe('calc(1em)')
        expect(parse('<length-percentage>', 'calc(min(1%))')).toBe('calc(1%)')
    })
    it('parses and serializes calc() with operands of the same type and with the same unit', () => {
        // Consecutive run of operations
        expect(parse('<number>', 'calc(1 + 1 + 1 + 1)')).toBe('calc(4)')
        expect(parse('<number>', 'calc(4 - 1 - 1 - 1)')).toBe('calc(1)')
        expect(parse('<number>', 'calc(1 * 2 * 3 * 4)')).toBe('calc(24)')
        expect(parse('<number>', 'calc(42 / 2 / 3 / 7)')).toBe('calc(1)')
        expect(parse('<number>', 'calc(1 + 2 * 3 - 2 / 1)')).toBe('calc(5)')
        // Addition or substraction of <dimension>s or <percentage>s
        expect(parse('<length>', 'calc(1px + 1px)')).toBe('calc(2px)')
        expect(parse('<length>', 'calc(1px - 1px)')).toBe('calc(0px)')
        expect(parse('<percentage>', 'calc(1% + 1%)')).toBe('calc(2%)')
        expect(parse('<percentage>', 'calc(1% - 1%)')).toBe('calc(0%)')
        // Multiplication of <dimension>s or <percentage>s (eg. <area>, <speed>, etc.)
        // Division of <dimension>s or <percentage>s
        expect(parse('<number>', 'calc(6px / 2px)')).toBe('calc(3)')
        expect(parse('<number>', 'calc(6% / 2%)')).toBe('calc(3)')
        // Nested calculations
        expect(parse('<number>', 'calc(1 + 2 * (3 + 4))')).toBe('calc(15)')
        expect(parse('<number>', 'calc((1 + 2) * 3 / (4 + 5))')).toBe('calc(1)')
        expect(parse('<number>', 'calc(calc(1 + 2) * 3 / calc(4 + 5))')).toBe('calc(1)')
        expect(parse('<length>', 'calc((3px + 2px) * 3)')).toBe('calc(15px)')
        // Nested math functions
        expect(parse('<number>', 'calc(min(1, 2) + sign(1))')).toBe('calc(2)')
        expect(parse('<number>', 'calc(min(1, 2) - sign(1))')).toBe('calc(0)')
        expect(parse('<number>', 'calc(min(1, 2) * sign(1))')).toBe('calc(1)')
        expect(parse('<number>', 'calc(min(1, 2) / sign(1))')).toBe('calc(1)')
        expect(parse('<length>', 'calc(min(1px, 2px) + 1px)')).toBe('calc(2px)')
        expect(parse('<length>', 'calc(min(1px, 2px) - 1px)')).toBe('calc(0px)')
        expect(parse('<length>', 'calc(min(1px, 2px) * sign(1px))')).toBe('calc(1px)')
        expect(parse('<length>', 'calc(min(1px, 2px) / sign(1px))')).toBe('calc(1px)')
        // Maximum 32 <calc-value> terms in a single calculation
        expect(parse('<number>', `calc(${[...Array(31)].reduce((n, _, i) => `${n} ${i < 15 ? '+' : '*'} 1`, '0')})`)).toBe('calc(15)')
        expect(parse('<number>', `calc((${[...Array(31)].reduce(n => `${n} + 1`, '1')}) + 1)`)).toBe('calc(33)')
        expect(parse('<number>', `calc(calc(${[...Array(31)].reduce(n => `${n} + 1`, '1')}) + 1)`)).toBe('calc(33)')
        expect(parse('<number>{2}', `calc(${[...Array(31)].reduce(n => `${n} + 1`, '1')}) calc(1)`)).toBe('calc(32) calc(1)')
        // Maximum 32 levels of nesting (parentheses and/or math functions) in a single calculation
        expect(parse('<number>', `calc(${[...Array(32)].reduce(n => `(${n})`, '1')} + (1))`)).toBe('calc(2)')
        expect(parse('<number>', `calc(${[...Array(32)].reduce(n => `calc(${n})`, '1')} + calc(1))`)).toBe('calc(2)')
        expect(parse('<number>{2}', `calc(${[...Array(32)].reduce(n => `calc(${n})`, '1')}) calc(calc(1))`)).toBe('calc(1) calc(1)')
    })
    it('parses and serializes calc() with operands of the same type and with different units', () => {
        // <length>
        expect(parse('<length>', 'calc(1px + 1cm)')).toBe(`calc(${(1 + (96 / 2.54)).toFixed(6)}px)`)
        expect(parse('<length>', 'calc(1px + 1mm)')).toBe(`calc(${(1 + (96 / 2.54 / 10)).toFixed(6)}px)`)
        expect(parse('<length>', 'calc(1px + 1Q)')).toBe(`calc(${(1 + (96 / 2.54 / 40)).toFixed(6)}px)`)
        expect(parse('<length>', 'calc(1px + 1in)')).toBe('calc(97px)')
        expect(parse('<length>', 'calc(1px + 1pc)')).toBe('calc(17px)')
        expect(parse('<length>', 'calc(1px + 1pt)')).toBe(`calc(${(1 + (96 / 72)).toFixed(6)}px)`)
        expect(parse('<length>', 'calc(1em + 1px + 1em)')).toBe('calc(2em + 1px)')
        expect(parse('<length>', 'calc(1em - 1px - 1em)')).toBe('calc(0em - 1px)')
        expect(parse('<length>', 'calc(3em * 2 / 3)')).toBe('calc(2em)')
        expect(parse('<length>', 'calc(6em / 2 * 3)')).toBe('calc(9em)')
        expect(parse('<length>', 'calc(3 * 2em / 3)')).toBe('calc(2em)')
        expect(parse('<length>', 'calc(2 / 3 * 3em)')).toBe('calc(2em)')
        expect(parse('<length>', 'calc((1px + 1em) * 2)')).toBe('calc(2em + 2px)')
        expect(parse('<length>', 'calc((2px + 2em) / 2)')).toBe('calc(1em + 1px)')
        expect(parse('<length>', 'calc(min(1px, 1em))')).toBe('min(1em, 1px)')
        expect(parse('<length>', 'calc(min(1em, 2px) + 1px)')).toBe('calc(1px + min(1em, 2px))')
        expect(parse('<length>', 'calc(min(1em, 2px) - 1px)')).toBe('calc(-1px + min(1em, 2px))')
        expect(parse('<length>', 'calc(min(1em, 2px) * sign(1px))')).toBe('min(1em, 2px)')
        expect(parse('<length>', 'calc(min(1em, 2px) / sign(1px))')).toBe('min(1em, 2px)')
        // <length-percentage>
        expect(parse('<length-percentage>', 'calc(1px + 1%)')).toBe('calc(1% + 1px)')
        expect(parse('<length-percentage>', 'calc(1px - 1%)')).toBe('calc(-1% + 1px)')
        expect(parse('<length-percentage>', 'calc((1px + 1%) * 2)')).toBe('calc(2% + 2px)')
        expect(parse('<length-percentage>', 'calc((2px + 2%) / 2)')).toBe('calc(1% + 1px)')
        expect(parse('<length> | <percentage>', 'calc(1px + 1%)')).toBe('calc(1% + 1px)')
        expect(parse('a | <percentage> | b | <length> | c', 'calc(1px + 1%)')).toBe('calc(1% + 1px)')
        // <length> -> <number>
        expect(parse('<number>', 'calc(1cm / 5mm)')).toBe('calc(2)')
        expect(parse('<number>', 'calc(2 * 1px / 1em)')).toBe('calc(2px / 1em)')
        expect(parse('<number>', 'calc(2 * (1px + 1em) / 1em)')).toBe('calc((2em + 2px) / 1em)')
        expect(parse('<number>', 'calc(1px / 1em * 2)')).toBe('calc(2px / 1em)')
        expect(parse('<number>', 'calc((1px + 1em) / 1em * 2)')).toBe('calc((2em + 2px) / 1em)')
        // <angle>
        expect(parse('<angle>', 'calc(1deg + 200grad)')).toBe('calc(181deg)')
        expect(parse('<angle>', `calc(1deg + ${Math.PI.toString()}rad)`)).toBe('calc(181deg)')
        expect(parse('<angle>', 'calc(1deg + 0.5turn)')).toBe('calc(181deg)')
        // <frequency>
        expect(parse('<frequency>', 'calc(1khz + 1hz)')).toBe('calc(1001hz)')
        // <resolution>
        expect(parse('<resolution>', 'calc(1dppx + 1x)')).toBe('calc(2dppx)')
        expect(parse('<resolution>', 'calc(1dppx + 1dpcm)')).toBe(`calc(${(1 + (96 / 2.54)).toFixed(6)}dppx)`)
        expect(parse('<resolution>', 'calc(1dppx + 1dpi)')).toBe('calc(97dppx)')
        // <time>
        expect(parse('<time>', 'calc(1s + 1ms)')).toBe('calc(1.001s)')
    })
    it('parses and serializes calc() resolved to an infinite number or not to a number', () => {
        expect(parse('<number>', 'calc(Infinity)')).toBe('calc(infinity)')
        // IEEE-754 semantics (tokenization turns -0 into 0)
        expect(parse('<number>', 'calc(1 / 0)')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(1 / -0)')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(1 / (0 * -1))')).toBe('calc(-infinity)')
        // Apply infinity to other operands
        expect(parse('<length>', 'calc(1px + 2em / 0)')).toBe('calc(infinity * 1px + 1px)')
        expect(parse('<length>', 'calc((2px + 2em) * infinity)')).toBe('calc(infinity * 1px + infinity * 1px)')
        // NaN resolves to 0 when produced in a top-level calculation
        expect(parse('<number>', 'calc(nan)')).toBe('calc(0)')
        expect(parse('<number>', 'calc(0 / 0)')).toBe('calc(0)')
        expect(parse('<number>', 'calc(calc(NaN))')).toBe('calc(0)')
        expect(parse('<length>', 'calc(min(1em, 0px / 0) + 1px)')).toBe('calc(1px + min(1em, NaN * 1px))')
        expect(parse('<length>', 'calc(min(1em, 0px * NaN) + 1px)')).toBe('calc(1px + min(1em, NaN * 1px))')
    })
    it('parses and serializes calc() without performing range checking or rounding in a specified value', () => {
        expect(parse('<integer>', 'calc(1 / 2)')).toBe('calc(0.5)')
        expect(parse('<integer [0,∞]>', 'calc(1 * -1)')).toBe('calc(-1)')
    })
})
describe('<min()>, <max()>', () => {
    it('fails to parse an invalid value', () => {
        // Maximum 32 arguments
        expect(parse('<number>', `min(${[...Array(33)].map(() => 1).join(', ')})`)).toBe('')
        // Arguments should resolve to the same type
        expect(parse('<number>', 'min(1px, 1)')).toBe('')
        expect(parse('<number>', 'min(1px / 1px, 1)')).toBe('')
        expect(parse('<length>', 'min(1, 1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'min(1%, 1)')).toBe('')
    })
    it('parses a valid value', () => {
        expect(parse('<min()>', 'min(1)', false, false)).toEqual({
            name: 'min',
            representation: 'min(1)',
            type: new Set(['function', 'min()']),
            value: list([number(1, ['calc-value'])], ','),
        })
    })
    it('parses and serializes a valid value', () => {
        // Single argument
        expect(parse('<number>', 'min(0)')).toBe('calc(0)')
        expect(parse('<length>', 'min(1em)')).toBe('calc(1em)')
        expect(parse('<length-percentage>', 'min(1%)')).toBe('calc(1%)')
        // Multiple arguments
        expect(parse('<number>', 'min(0, 1)')).toBe('calc(0)')
        expect(parse('<number>', 'max(0, 1)')).toBe('calc(1)')
        expect(parse('<percentage>', 'min(0%, 1%)')).toBe('calc(0%)')
        expect(parse('<length>', 'min(1px, 1in)')).toBe('calc(1px)')
        expect(parse('<length>', 'max(1px, 1in)')).toBe('calc(96px)')
        expect(parse('<length>', 'min(1px, 1em)')).toBe('min(1em, 1px)')
        expect(parse('<length-percentage>', 'min(min(1px, 1%), 1px)')).toBe('min(min(1%, 1px), 1px)')
        // Maximum 32 <calc-value> terms or levels of nesting (parentheses and/or math functions) in a single calculation
        expect(parse('<number>', `min(${[...Array(16)].map(() => '1 + 1').join(', ')}, 1)`)).toBe('calc(1)')
        expect(parse('<number>', `min(${[...Array(16)].map(() => '((1))').join(', ')}, (1))`)).toBe('calc(1)')
        // Maximum 32 arguments
        expect(parse('<number>', `min(${[...Array(32)].map((_, i) => i).join(', ')})`)).toBe('calc(0)')
    })
})
describe('<clamp()>', () => {
    it('fails to parse an invalid value', () => {
        // Arguments should resolve to the same type
        expect(parse('<number>', 'clamp(1, 1px, 1)')).toBe('')
        expect(parse('<number>', 'clamp(1, 1px / 1px, 1)')).toBe('')
        expect(parse('<length>', 'clamp(1px, 1, 1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'clamp(1, 1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<length>', 'clamp(0px, 1px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'clamp(0px, 2px, 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'clamp(1px, 0px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'clamp(1px, 2px, 0px)')).toBe('calc(1px)')
        expect(parse('<length>', 'clamp(0px, 1in, 2px)')).toBe('calc(2px)')
        expect(parse('<length>', 'clamp(0em, 1px, 2px)')).toBe('clamp(0em, 1px, 2px)')
        expect(parse('<length-percentage>', 'clamp(clamp(0%, 1px, 2px), 1px, 2px)'))
            .toBe('clamp(clamp(0%, 1px, 2px), 1px, 2px)')
    })
})
describe('<round()>', () => {
    it('fails to parse an invalid value', () => {
        // Arguments should resolve to the same type
        expect(parse('<number>', 'round(1px, 1)')).toBe('')
        expect(parse('<number>', 'round(1px / 1px, 1)')).toBe('')
        expect(parse('<length>', 'round(1, 1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'round(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<length>', 'round(1.1px, 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'round(1px, 2px)')).toBe('calc(2px)')
        expect(parse('<length>', 'round(up, 1.1px, 1px)')).toBe('calc(2px)')
        expect(parse('<length>', 'round(down, 1.9px, 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'round(to-zero, 1px, 2px)')).toBe('calc(0px)')
        expect(parse('<length>', 'round(to-zero, -1px, 2px)')).toBe('calc(0px)')
        expect(parse('<length>', 'round(nearest, 1cm, 1px)')).toBe('calc(38px)')
        expect(parse('<length>', 'round(1em, 1px)')).toBe('round(1em, 1px)')
        expect(parse('<length-percentage>', 'round(round(1%, 1px), 1px)')).toBe('round(round(1%, 1px), 1px)')
    })
    it('parses and serializes round() resulting to 0⁻, 0⁺, NaN, or Infinity', () => {
        // Rounding 0⁻ or 0⁺ is preserved as is (it is a multiple of every number)
        expect(parse('<integer>', 'calc(1 / round(0 * -1, 1))')).toBe('calc(-infinity)')
        // Rounding up to 0 results to 0⁻
        expect(parse('<integer>', 'calc(1 / round(-1, 2))')).toBe('calc(-infinity)')
        // 0 as step value results to NaN
        expect(parse('<length>', 'calc(1em + round(1px, 0px))')).toBe('calc(1em + NaN * 1px)')
        // An infinite input and step values result to NaN
        expect(parse('<length>', 'calc(1em + round(1px / 0, 1px / 0))')).toBe('calc(1em + NaN * 1px)')
        expect(parse('<length>', 'calc(1em + round(1px / 0, -1px / 0))')).toBe('calc(1em + NaN * 1px)')
        expect(parse('<length>', 'calc(1em + round(-1px / 0, 1px / 0))')).toBe('calc(1em + NaN * 1px)')
        expect(parse('<length>', 'calc(1em + round(-1px / 0, -1px / 0))')).toBe('calc(1em + NaN * 1px)')
        // An infinite input value results to the same infinite value (if step value is finite and not 0)
        expect(parse('<integer>', 'round(-infinity, 1)')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'round(infinity, 1)')).toBe('calc(infinity)')
        // Rounding to nearest/zero with an infinite step value results to 0⁻ if input value is negative or 0⁻ (but finite)
        expect(parse('<integer>', 'calc(1 / round(-1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(-1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(0 * -1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(0 * -1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, -1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, -1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, 0 * -1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, 0 * -1, infinity))')).toBe('calc(-infinity)')
        // Rounding to nearest/zero with an infinite step value results to 0⁺ if input value is 0⁺ or positive (but finite)
        expect(parse('<integer>', 'round(0, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(0, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(1, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(1, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 0, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 0, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 1, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 1, infinity)')).toBe('calc(0)')
        // Rounding up with an infinite step value results to 0⁻ if input value is negative or 0⁻ (but finite)
        expect(parse('<integer>', 'calc(1 / round(up, 0 * -1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(up, -1, infinity))')).toBe('calc(-infinity)')
        // Rounding up with an infinite step value results to the same input value if it is 0⁺ (but finite)
        expect(parse('<integer>', 'round(up, 0, infinity)')).toBe('calc(0)')
        // Rounding up with an infinite step value results to Infinity if input value is positive (but finite)
        expect(parse('<integer>', 'round(up, 1, infinity)')).toBe('calc(infinity)')
        // Rounding down with an infinite step value results to -Infinity if input value is negative (but finite)
        expect(parse('<integer>', 'round(down, -1, infinity)')).toBe('calc(-infinity)')
        // Rounding down with an infinite step value results to the same input value if it is 0⁻
        expect(parse('<integer>', 'calc(1 / round(down, 0 * -1, infinity))')).toBe('calc(-infinity)')
        // Rounding down with an infinite step value results to the same input value if it is 0⁺ or positive (but finite)
        expect(parse('<integer>', 'round(down, 0, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(down, 1, infinity)')).toBe('calc(0)')
    })
})
describe('<mod()>', () => {
    it('fails to parse an invalid value', () => {
        // Arguments should resolve to the same type
        expect(parse('<number>', 'mod(1px, 1)')).toBe('')
        expect(parse('<number>', 'mod(1px / 1px, 1)')).toBe('')
        expect(parse('<length>', 'mod(1, 1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'mod(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<length>', 'mod(3px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'mod(3px, -2px)')).toBe('calc(-1px)')
        expect(parse('<length>', 'mod(-3px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'mod(1in, 5px)')).toBe('calc(1px)')
        expect(parse('<length>', 'mod(1em, 1px)')).toBe('mod(1em, 1px)')
        expect(parse('<length-percentage>', 'mod(mod(1%, 1px), 1px)')).toBe('mod(mod(1%, 1px), 1px)')
    })
    it('parses and serializes mod() resulting to NaN or Infinity', () => {
        // 0 as modulus value results to NaN
        expect(parse('<length>', 'calc(1em + mod(1px, 0px))')).toBe('calc(1em + NaN * 1px)')
        // An infinite input value results to NaN
        expect(parse('<length>', 'calc(1em + mod(1px / 0, 1px))')).toBe('calc(1em + NaN * 1px)')
        // A positive infinite modulus value and a negative input value results to NaN (or the other way around)
        expect(parse('<length>', 'calc(1em + mod(1px, -1px / 0))')).toBe('calc(1em + NaN * 1px)')
        expect(parse('<length>', 'calc(1em + mod(-1px, 1px / 0))')).toBe('calc(1em + NaN * 1px)')
        // An infinite modulus value results to the input value as is (if it has the same sign that the input value)
        expect(parse('<integer>', 'mod(-1, -infinity)')).toBe('calc(-1)')
        expect(parse('<integer>', 'mod(1, infinity)')).toBe('calc(1)')
    })
})
describe('<rem()>', () => {
    it('fails to parse an invalid value', () => {
        // Arguments should resolve to the same type
        expect(parse('<number>', 'rem(1px, 1)')).toBe('')
        expect(parse('<number>', 'rem(1px / 1px, 1)')).toBe('')
        expect(parse('<number>', 'rem(1, 1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'rem(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<length>', 'rem(3px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'rem(3px, -2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'rem(-3px, 2px)')).toBe('calc(-1px)')
        expect(parse('<length>', 'rem(1in, 5px)')).toBe('calc(1px)')
        expect(parse('<length>', 'rem(1em, 1px)')).toBe('rem(1em, 1px)')
        expect(parse('<length-percentage>', 'rem(rem(1%, 1px), 1px)')).toBe('rem(rem(1%, 1px), 1px)')
    })
    it('parses and serializes rem() resulting to NaN or Infinity', () => {
        // 0 as divisor value results to NaN
        expect(parse('<length>', 'calc(1em + rem(1px, 0px))')).toBe('calc(1em + NaN * 1px)')
        // An infinite input value results to NaN
        expect(parse('<length>', 'calc(1em + rem(1px / 0, 1px))')).toBe('calc(1em + NaN * 1px)')
        // An infinite modulus value results to the input value as is
        expect(parse('<integer>', 'rem(1, infinity)')).toBe('calc(1)')
        expect(parse('<integer>', 'rem(1, -infinity)')).toBe('calc(1)')
        expect(parse('<integer>', 'rem(-1, -infinity)')).toBe('calc(-1)')
        expect(parse('<integer>', 'rem(-1, infinity)')).toBe('calc(-1)')
    })
})
describe('<sin()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number> or <angle>
        expect(parse('<number>', 'sin(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'sin(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'sin(45)')).toBe(`calc(${+Math.sin(45).toFixed(6)})`)
        expect(parse('<number>', 'sin(45deg)')).toBe(`calc(${+Math.sin(toRadians(45)).toFixed(6)})`)
        expect(parse('<number>', 'sin(1in / 2px)')).toBe(`calc(${+Math.sin(48).toFixed(6)})`)
        expect(parse('<number>', 'sin(sin(90px / 2px))')).toBe(`calc(${+Math.sin(Math.sin(45)).toFixed(6)})`)
    })
    it('parses and serializes sin() resulting to 0⁻', () => {
        // 0⁻ as input value results as is
        expect(parse('<number>', 'calc(-1 / sin(0 * -1))')).toBe('calc(infinity)')
    })
})
describe('<cos()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number> or <angle>
        expect(parse('<number>', 'cos(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'cos(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'cos(45)')).toBe(`calc(${+Math.cos(45).toFixed(6)})`)
        expect(parse('<number>', 'cos(45deg)')).toBe(`calc(${+Math.cos(toRadians(45)).toFixed(6)})`)
        expect(parse('<number>', 'cos(1in / 2px)')).toBe(`calc(${+Math.cos(48).toFixed(6)})`)
        expect(parse('<number>', 'cos(cos(90px / 2px))')).toBe(`calc(${+Math.cos(Math.cos(45)).toFixed(6)})`)
    })
})
describe('<tan()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number> or <angle>
        expect(parse('<number>', 'tan(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'tan(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'tan(45)')).toBe(`calc(${+Math.tan(45).toFixed(6)})`)
        expect(parse('<number>', 'tan(45deg)')).toBe('calc(1)')
        expect(parse('<number>', 'tan(1in / 2px)')).toBe(`calc(${+Math.tan(48).toFixed(6)})`)
        expect(parse('<number>', 'tan(tan(90px / 2px))')).toBe(`calc(${+Math.tan(Math.tan(45)).toFixed(6)})`)
    })
    it('parses and serializes tan() resulting to 0⁻, Infinity, or -Infinity', () => {
        // 0⁻ as input value results as is
        expect(parse('<number>', 'calc(-1 / tan(0 * -1))')).toBe('calc(infinity)')
        // An asymptote as input value results to Infinity or -Infinity
        expect(parse('<number>', 'tan(90deg)')).toBe('calc(infinity)')
        expect(parse('<number>', 'tan(-270deg)')).toBe('calc(infinity)')
        expect(parse('<number>', 'tan(450deg)')).toBe('calc(infinity)')
        expect(parse('<number>', 'tan(-90deg)')).toBe('calc(-infinity)')
        expect(parse('<number>', 'tan(270deg)')).toBe('calc(-infinity)')
        expect(parse('<number>', 'tan(-450deg)')).toBe('calc(-infinity)')
    })
})
describe('<asin()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number>
        expect(parse('<angle>', 'asin(1deg)')).toBe('')
        expect(parse('<angle-percentage>', 'asin(1%)')).toBe('')
        expect(parse('<angle>', 'asin(asin(1))')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'asin(0.5)')).toBe('calc(30deg)')
        expect(parse('<angle>', 'asin(1deg / 2deg)')).toBe('calc(30deg)')
        expect(parse('<angle>', 'asin(1in / 192px)')).toBe('calc(30deg)')
    })
})
describe('<acos()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number>
        expect(parse('<angle>', 'acos(1deg)')).toBe('')
        expect(parse('<angle-percentage>', 'acos(1%)')).toBe('')
        expect(parse('<angle>', 'acos(acos(1))')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'acos(0.5)')).toBe('calc(60deg)')
        expect(parse('<angle>', 'acos(1deg / 2deg)')).toBe('calc(60deg)')
        expect(parse('<angle>', 'acos(1in / 192px)')).toBe('calc(60deg)')
    })
})
describe('<atan()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number>
        expect(parse('<angle>', 'atan(1deg)')).toBe('')
        expect(parse('<angle-percentage>', 'atan(1%)')).toBe('')
        expect(parse('<angle>', 'atan(atan(1))')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'atan(0.5)')).toBe(`calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan(1deg / 2deg)')).toBe(`calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan(1in / 192px)')).toBe(`calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`)
    })
})
describe('<atan2()>', () => {
    it('fails to parse an invalid value', () => {
        // Arguments should resolve to the same type
        expect(parse('<angle>', 'atan2(1, 1%)')).toBe('')
        expect(parse('<angle>', 'atan2(1, 1px)')).toBe('')
        expect(parse('<angle>', 'atan2(1%, 1)')).toBe('')
        expect(parse('<angle>', 'atan2(1%, 1px)')).toBe('')
        expect(parse('<angle>', 'atan2(1px, 1)')).toBe('')
        expect(parse('<angle>', 'atan2(1px, 1%)')).toBe('')
        expect(parse('<angle>', 'atan2(1px / 1px, 1))')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'atan2(1, 1)')).toBe(`calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan2(1px, 1px)')).toBe(`calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan2(1in, 100px)')).toBe(`calc(${+toDegrees(Math.atan2(96, 100)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan2(1em, 1px)')).toBe('atan2(1em, 1px)')
        expect(parse('<angle-percentage>', 'atan2(atan2(1%, 1deg), 1deg)')).toBe('atan2(atan2(1%, 1deg), 1deg)')
    })
})
describe('<pow()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number>s
        expect(parse('<number>', 'pow(1px, 1px)')).toBe('')
        expect(parse('<number>', 'pow(1px, 1)')).toBe('')
        expect(parse('<number>', 'pow(1, 1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'pow(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'pow(4, 2)')).toBe('calc(16)')
        expect(parse('<number>', 'pow(4px / 1px, 2)')).toBe('calc(16)')
        expect(parse('<number>', 'pow(1in / 24px, 2)')).toBe('calc(16)')
        expect(parse('<number>', 'pow(pow(1em / 1px, 1), 1)')).toBe('pow(pow(1em / 1px, 1), 1)')
    })
})
describe('<sqrt()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number>
        expect(parse('<number>', 'sqrt(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'sqrt(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'sqrt(4)')).toBe('calc(2)')
        expect(parse('<number>', 'sqrt(4px / 1px)')).toBe('calc(2)')
        expect(parse('<number>', 'sqrt(1in / 1px)')).toBe(`calc(${Math.sqrt(96).toFixed(6)})`)
        expect(parse('<number>', 'sqrt(sqrt(1em / 1px))')).toBe('sqrt(sqrt(1em / 1px))')
    })
})
describe('<hypot()>', () => {
    it('fails to parse an invalid value', () => {
        // Arguments should resolve to the same type
        expect(parse('<number>', 'hypot(1px, 1)')).toBe('')
        expect(parse('<length>', 'hypot(1, 1px)')).toBe('')
        expect(parse('<number>', 'hypot(1px / 1px, 1)')).toBe('')
        expect(parse('<number> | <percentage>', 'hypot(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'hypot(3, 4)')).toBe('calc(5)')
        expect(parse('<length>', 'hypot(3px, 4px)')).toBe('calc(5px)')
        expect(parse('<length>', 'hypot(1in, 72px)')).toBe('calc(120px)')
        expect(parse('<length>', 'hypot(1em, 1px)')).toBe('hypot(1em, 1px)')
        expect(parse('<length-percentage>', 'hypot(hypot(1%, 1px), 1px)')).toBe('hypot(hypot(1%, 1px), 1px)')
    })
})
describe('<log()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should be <number>(s)
        expect(parse('<number>', 'log(1px, 1px)')).toBe('')
        expect(parse('<number>', 'log(1px, 1)')).toBe('')
        expect(parse('<number>', 'log(1, 1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'log(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'log(e)')).toBe('calc(1)')
        expect(parse('<number>', 'log(8, 2)')).toBe('calc(3)')
        expect(parse('<number>', 'log(96px / 12px, 2)')).toBe('calc(3)')
        expect(parse('<number>', 'log(1in / 12px, 2)')).toBe('calc(3)')
        expect(parse('<number>', 'log(log(1em / 1px))')).toBe('log(log(1em / 1px))')
    })
})
describe('<exp()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should be <number>
        expect(parse('<number>', 'exp(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'exp(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'exp(1)')).toBe(`calc(${Math.E.toFixed(6)})`)
        expect(parse('<number>', 'exp(1px / 1px)')).toBe(`calc(${Math.E.toFixed(6)})`)
        expect(parse('<number>', 'exp(exp(1em / 1px))')).toBe('exp(exp(1em / 1px))')
    })
})
describe('<abs()>', () => {
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'abs(-1)')).toBe('calc(1)')
        expect(parse('<number>', 'abs(-infinity)')).toBe('calc(infinity)')
        expect(parse('<number> | <percentage>', 'abs(abs(-100%))')).toBe('calc(1)')
        expect(parse('<length>', 'abs(-1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'abs(-1in)')).toBe('calc(96px)')
        expect(parse('<length>', 'abs(-1em)')).toBe('abs(-1em)')
        expect(parse('<length-percentage>', 'abs(abs(-1%))')).toBe('abs(abs(-1%))')
    })
})
describe('<sign()>', () => {
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'sign(-2)')).toBe('calc(-1)')
        expect(parse('<number>', 'sign(-infinity)')).toBe('calc(-1)')
        expect(parse('<number> | <percentage>', 'sign(sign(1%))')).toBe('calc(1)')
        expect(parse('<number>', 'sign(1px)')).toBe('calc(1)')
        expect(parse('<number>', 'sign(1in)')).toBe('calc(1)')
        expect(parse('<number>', 'sign(sign(1em))')).toBe('sign(sign(1em))')
    })
})

describe('<basic-shape>', () => {
    it('parses and serializes a valid value', () => {
        const valid = [
            ['circle()', 'circle(at center center)'],
            ['circle(calc(50%) at calc(50%))', 'circle(calc(50%) at calc(50%) center)'],
            ['ellipse()', 'ellipse(at center center)'],
            ['ellipse(calc(1px) 1px at calc(50%))', 'ellipse(calc(1px) 1px at calc(50%) center)'],
            ['inset(1px 1px 1px 1px round 1px 1px 1px 1px / 1px 1px 1px 1px)', 'inset(1px round 1px)'],
            ['inset(1px round 0px)', 'inset(1px)'],
            ['inset(calc(1px) round calc(0px))', 'inset(calc(1px))'],
            ['path(nonzero, "M0 0")', 'path("M0 0")'],
            ['polygon(nonzero, 1px 1px)', 'polygon(1px 1px)'],
            ['polygon(calc(1px) 1px)', 'polygon(calc(1px) 1px)'],
            ['rect(1px 1px 1px 1px round 1px 1px 1px 1px / 1px 1px 1px 1px)', 'rect(1px 1px 1px 1px round 1px)'],
            ['rect(1px 1px 1px 1px round 0px)', 'rect(1px 1px 1px 1px)'],
            ['rect(calc(1px) 1px 1px 1px round calc(0px))', 'rect(calc(1px) 1px 1px 1px)'],
            ['xywh(1px 1px 1px 1px round 1px 1px 1px 1px / 1px 1px 1px 1px)', 'xywh(1px 1px 1px 1px round 1px)'],
            ['xywh(1px 1px 1px 1px round 0px)', 'xywh(1px 1px 1px 1px)'],
            ['xywh(calc(1px) 1px 1px 1px round calc(0px))', 'xywh(calc(1px) 1px 1px 1px)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<basic-shape>', input)).toBe(expected))
    })
})
describe('<color>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid <hex-color>
            '#ffz',
            '#1',
            '#12',
            '#12345',
            '#1234567',
            '#123456789',
        ]
        invalid.forEach(input => expect(parse('<color>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<color>', 'red', false, false))
            .toEqual(keyword('red', ['named-color', 'absolute-color-base', 'color']))
        expect(parse('<color>', '#000', false, false))
            .toEqual(hash('000', ['hex-color', 'absolute-color-base', 'color']))
        const zero = number(0)
        const rgb = list([
            list([zero, zero, zero], ','),
            omitted(','),
            omitted('<alpha-value>?'),
        ])
        expect(parse('<color>', 'rgb(0, 0, 0)', false, false)).toEqual({
            name: 'rgb',
            representation: 'rgb(0, 0, 0)',
            type: new Set(['function', 'rgb()', 'absolute-color-function', 'absolute-color-base', 'color']),
            value: rgb,
        })
        expect(parse('<color>', 'rgba(0, 0, 0)', false, false)).toEqual({
            name: 'rgba',
            representation: 'rgba(0, 0, 0)',
            type: new Set(['function', 'rgba()', 'absolute-color-function', 'absolute-color-base', 'color']),
            value: rgb,
        })
    })
    it('parses and serializes <hex-color>', () => {
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
    it('parses and serializes <deprecated-color>', () => {
        expect(parse('<color>', 'ActiveBorder')).toBe('activeborder')
    })
    it('parses and serializes <rgb()> or <rgba()>', () => {
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
            // Map <percentage> to <number>
            ['rgb(-1% 0% 0% / -1%)', 'rgba(0, 0, 0, 0)'],
            ['rgb(101% 100% 100% / 101%)', 'rgb(255, 255, 255)'],
            // Map `none` to `0`
            ['rgb(none 0 0 / none)', 'rgba(0, 0, 0, 0)'],
            ['rgb(none 0% 0%)', 'rgb(0, 0, 0)'],
            // Math function
            ['rgb(calc(-1) 0 0 / calc(-1))', 'rgba(0, 0, 0, 0)'],
            ['rgb(calc(256) 0 0 / calc(2))', 'rgb(255, 0, 0)'],
            ['rgb(calc(-1%) 0% 0% / calc(-1%))', 'rgba(0, 0, 0, 0)'],
            ['rgb(calc(101%) 0% 0% / calc(101%))', 'rgb(255, 0, 0)'],
            // Precision (browser conformance: 8 bit integers)
            ['rgb(127.499 0 0 / 0.498)', 'rgba(127, 0, 0, 0.498)'],
            ['rgb(127.501 0 0 / 0.499)', 'rgba(128, 0, 0, 0.498)'],
            ['rgb(0 0 0 / 0.501)', 'rgba(0, 0, 0, 0.5)'],
            ['rgb(49.9% 50.1% 0% / 49.9%)', 'rgba(127, 128, 0, 0.498)'],
            ['rgb(0.501 0.499 0 / 50.1%)', 'rgba(1, 0, 0, 0.5)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
    it('parses and serializes <hsl()> or <hsla()>', () => {
        const valid = [
            // To legacy <rgb()> or <rgba()> depending on <alpha-value>
            ['hsl(0 1% 2%)', 'rgb(5, 5, 5)'],
            ['hsl(0 1% 2% / 0)', 'rgba(5, 5, 5, 0)'],
            ['hsl(0 1% 2% / 1)', 'rgb(5, 5, 5)'],
            ['hsla(0 1% 2%)', 'rgb(5, 5, 5)'],
            ['hsla(0 1% 2% / 0)', 'rgba(5, 5, 5, 0)'],
            ['hsla(0 1% 2% / 1)', 'rgb(5, 5, 5)'],
            // From legacy color syntax
            ['hsl(0, 0%, 0%)', 'rgb(0, 0, 0)'],
            ['hsl(0, 0%, 0%, 0)', 'rgba(0, 0, 0, 0)'],
            ['hsl(0, 0%, 0%, 100%)', 'rgb(0, 0, 0)'],
            ['hsla(0, 0%, 0%)', 'rgb(0, 0, 0)'],
            ['hsla(0, 0%, 0%, 0%)', 'rgba(0, 0, 0, 0)'],
            ['hsla(0, 0%, 0%, 1)', 'rgb(0, 0, 0)'],
            // Out of range arguments
            ['hsl(-540 -1% 50% / -1)', 'rgba(128, 128, 128, 0)'],
            ['hsl(540 101% 50% / 2)', 'rgb(0, 255, 255)'],
            ['hsl(-540deg 100% 50% / -1%)', 'rgba(0, 255, 255, 0)'],
            ['hsl(540deg 100% 50% / 101%)', 'rgb(0, 255, 255)'],
            // Map `none` to `0`
            ['hsl(none 100% 50% / none)', 'rgba(255, 0, 0, 0)'],
            ['hsl(0 none none)', 'rgb(0, 0, 0)'],
            // Math function
            ['hsl(calc(-540) calc(101%) calc(50%) / calc(-1))', 'rgba(0, 255, 255, 0)'],
            ['hsl(calc(540) 100% 50% / calc(2))', 'rgb(0, 255, 255)'],
            ['hsl(calc(-540deg) 100% 50% / calc(-1%))', 'rgba(0, 255, 255, 0)'],
            ['hsl(calc(540deg) 100% 50% / 101%)', 'rgb(0, 255, 255)'],
            // Precision (browser conformance: 8 bit integers)
            ['hsl(0.498 100% 49.8% / 0.498)', 'rgba(254, 2, 0, 0.498)'],
            ['hsl(0.499 100% 49.9% / 0.499)', 'rgba(254, 2, 0, 0.498)'],
            ['hsl(0.501 100% 50.1% / 0.501)', 'rgba(255, 3, 1, 0.5)'],
            ['hsl(0 100% 50% / 49.9%)', 'rgba(255, 0, 0, 0.498)'],
            ['hsl(0 100% 50% / 50.1%)', 'rgba(255, 0, 0, 0.5)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input)).toBe(expected))
    })
    it('parses and serializes <hwb()>', () => {
        const valid = [
            // To legacy <rgb()> or <rgba()> depending on <alpha-value>
            ['hwb(0 1% 2%)', 'rgb(250, 3, 3)'],
            ['hwb(0 1% 2% / 0)', 'rgba(250, 3, 3, 0)'],
            ['hwb(0 1% 2% / 1)', 'rgb(250, 3, 3)'],
            // Out of range arguments
            ['hwb(-540 0% 0% / -1)', 'rgba(0, 255, 255, 0)'],
            ['hwb(540 0% 0% / 2)', 'rgb(0, 255, 255)'],
            ['hwb(-540deg 0% 0% / -1%)', 'rgba(0, 255, 255, 0)'],
            ['hwb(-540deg 0% 0% / 101%)', 'rgb(0, 255, 255)'],
            ['hwb(0 -1% 101%)', 'rgb(0, 0, 0)'],
            ['hwb(0 101% -1%)', 'rgb(255, 255, 255)'],
            // Map `none` to `0` (deviates from the specification but it is browsers conformant)
            ['hwb(none none none / none)', 'rgba(255, 0, 0, 0)'],
            ['hwb(0 none none)', 'rgb(255, 0, 0)'],
            // Math function
            ['hwb(calc(-540) calc(0%) calc(0%) / calc(-1))', 'rgba(0, 255, 255, 0)'],
            ['hwb(calc(540) 0% 0% / calc(2))', 'rgb(0, 255, 255)'],
            ['hwb(calc(-540deg) 0% 0% / calc(-1%))', 'rgba(0, 255, 255, 0)'],
            ['hwb(calc(540deg) 0% 0% / calc(101%))', 'rgb(0, 255, 255)'],
            // Precision (browser conformance: 8 bit integers)
            ['hwb(0.498 0% 49.8% / 0.498)', 'rgba(128, 1, 0, 0.498)'],
            ['hwb(0.499 0% 49.9% / 0.499)', 'rgba(128, 1, 0, 0.498)'],
            ['hwb(0.501 0% 50.1% / 0.501)', 'rgba(127, 1, 0, 0.5)'],
            ['hwb(0 0% 0% / 49.8%)', 'rgba(255, 0, 0, 0.498)'],
            ['hwb(0 0% 0% / 49.9%)', 'rgba(255, 0, 0, 0.498)'],
            ['hwb(0 0% 0% / 50.1%)', 'rgba(255, 0, 0, 0.5)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input)).toBe(expected))
    })
    it('parses and serializes <lab()>', () => {
        const valid = [
            // Out of range arguments
            ['lab(-1 -126 0 / -1)', 'lab(0 -126 0 / 0)'],
            ['lab(101 126 0 / 2)', 'lab(101 126 0)'],
            ['lab(0 0 0 / -1%)', 'lab(0 0 0 / 0)'],
            ['lab(0 0 0 / 101%)', 'lab(0 0 0)'],
            // Map <percentage> to <number>
            ['lab(-1% -101% 0% / -1%)', 'lab(0 -126.25 0 / 0)'],
            ['lab(101% 101% 0% / 101%)', 'lab(101 126.25 0)'],
            // Preserve `none`
            ['lab(none none none / none)', 'lab(none none none / none)'],
            // Math function
            ['lab(calc(-1) calc(-126) 0 / calc(-1))', 'lab(0 -126 0 / 0)'],
            ['lab(calc(101) calc(126) 0 / calc(2))', 'lab(101 126 0)'],
            ['lab(calc(-1%) calc(-101%) 0 / calc(-1%))', 'lab(0 -126.25 0 / 0)'],
            ['lab(calc(101%) calc(101%) 0 / calc(101%))', 'lab(101 126.25 0)'],
            // Precision (browser conformance: TBD, at least 16 bit)
            ['lab(0.0000001 0.0000001 0 / 0.499)', 'lab(0 0 0 / 0.498)'],
            ['lab(0.00000051 0.00000051 0 / 0.501)', 'lab(0.000001 0.000001 0 / 0.5)'],
            ['lab(0.0000001% 0.0000001% 0 / 49.9%)', 'lab(0 0 0 / 0.498)'],
            ['lab(0.00000051% 0.00000041% 0 / 50.1%)', 'lab(0.000001 0.000001 0 / 0.5)'],

        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input)).toBe(expected))
    })
    it('parses and serializes <lch()>', () => {
        const valid = [
            // Out of range arguments
            ['lch(-1 -1 -540 / -1)', 'lch(0 0 180 / 0)'],
            ['lch(101 151 540 / 2)', 'lch(101 151 180)'],
            // Map <angle> and <percentage> to <number>
            ['lch(-1% -1% -540deg / -1%)', 'lch(0 0 180 / 0)'],
            ['lch(101% 101% 540deg / 101%)', 'lch(101 151.5 180)'],
            // Preserve `none`
            ['lch(none none none / none)', 'lch(none none none / none)'],
            // Math function
            ['lch(calc(-1) calc(-1) calc(-540) / calc(-1))', 'lch(0 0 180 / 0)'],
            ['lch(calc(101) calc(151) calc(540) / calc(2))', 'lch(101 151 180)'],
            ['lch(calc(-1%) calc(-1%) calc(-540deg) / calc(-1%))', 'lch(0 0 180 / 0)'],
            ['lch(calc(101%) calc(101%) calc(540deg) / calc(101%))', 'lch(101 151.5 180)'],
            // Precision (browser conformance: TBD, at least 16 bit)
            ['lch(0.0000001 0.0000001 0.0000001 / 0.499)', 'lch(0 0 0 / 0.498)'],
            ['lch(0.00000051 0.00000051 0.00000051 / 0.501)', 'lch(0.000001 0.000001 0.000001 / 0.5)'],
            ['lch(0.0000001% 0.0000003% 0.0000001deg / 49.9%)', 'lch(0 0 0 / 0.498)'],
            ['lch(0.00000051% 0.00000041% 0.00000051deg / 50.1%)', 'lch(0.000001 0.000001 0.000001 / 0.5)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input)).toBe(expected))
    })
    it('parses and serializes <oklab()>', () => {
        const valid = [
            // Out of range arguments
            ['oklab(-1 -0.41 0 / -1)', 'oklab(0 -0.41 0 / 0)'],
            ['oklab(1.1 0.41 0 / 2)', 'oklab(1.1 0.41 0)'],
            // Map <percentage> to <number>
            ['oklab(-1% -101% 0 / -1%)', 'oklab(0 -0.404 0 / 0)'],
            ['oklab(101% 101% 0 / 101%)', 'oklab(1.01 0.404 0)'],
            // Preserve `none`
            ['oklab(none none none / none)', 'oklab(none none none / none)'],
            // Math function
            ['oklab(calc(-1) calc(-0.41) calc(0) / calc(-1))', 'oklab(0 -0.41 0 / 0)'],
            ['oklab(calc(1.1) calc(0.41) calc(0) / calc(2))', 'oklab(1.1 0.41 0)'],
            ['oklab(calc(-1%) calc(-101%) calc(0) / calc(-1%))', 'oklab(0 -0.404 0 / 0)'],
            ['oklab(calc(101%) calc(101%) calc(0) / calc(101%))', 'oklab(1.01 0.404 0)'],
            // Precision (browser conformance: TBD, at least 16 bit)
            ['oklab(0.0000001 0.0000001 0 / 0.499)', 'oklab(0 0 0 / 0.498)'],
            ['oklab(0.00000051 0.00000051 0 / 0.501)', 'oklab(0.000001 0.000001 0 / 0.5)'],
            ['oklab(0.00001% 0.0001% 0 / 49.9%)', 'oklab(0 0 0 / 0.498)'],
            ['oklab(0.00005% 0.00013% 0 / 50.1%)', 'oklab(0.000001 0.000001 0 / 0.5)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input)).toBe(expected))
    })
    it('parses and serializes <oklch()>', () => {
        const valid = [
            // Out of range arguments
            ['oklch(-1 -1 -540 / -1)', 'oklch(0 0 180 / 0)'],
            ['oklch(1.1 0.41 540 / 2)', 'oklch(1.1 0.41 180)'],
            // Map <angle> and <percentage> to <number>
            ['oklch(-1% -1% -540deg / -1%)', 'oklch(0 0 180 / 0)'],
            ['oklch(101% 101% 540deg / 101%)', 'oklch(1.01 0.404 180)'],
            // Preserve `none`
            ['oklch(none none none / none)', 'oklch(none none none / none)'],
            // Math function
            ['oklch(calc(-1) calc(-1) calc(-540) / calc(-1))', 'oklch(0 0 180 / 0)'],
            ['oklch(calc(1.1) calc(0.41) calc(540) / calc(2))', 'oklch(1.1 0.41 180)'],
            ['oklch(calc(-1%) calc(-1%) calc(-540deg) / calc(-1%))', 'oklch(0 0 180 / 0)'],
            ['oklch(calc(101%) calc(101%) calc(540deg) / calc(101%))', 'oklch(1.01 0.404 180)'],
            // Precision (browser conformance: TBD, at least 16 bit)
            ['oklch(0.0000001 0.0000001 0.0000001 / 0.499)', 'oklch(0 0 0 / 0.498)'],
            ['oklch(0.00000051 0.00000051 0.00000051 / 0.501)', 'oklch(0.000001 0.000001 0.000001 / 0.5)'],
            ['oklch(0.00001% 0.0001% 0.0000001deg / 49.9%)', 'oklch(0 0 0 / 0.498)'],
            ['oklch(0.00005% 0.00013% 0.00000051deg / 50.1%)', 'oklch(0.000001 0.000001 0.000001 / 0.5)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input)).toBe(expected))
    })
    it('parses and serializes <color()>', () => {
        const valid = [
            // Explicit `xyz` color space
            ['color(xyz 0 0 0)', 'color(xyz-d65 0 0 0)'],
            // Map <percentage> to <number>
            ['color(srgb 0% 100% calc(100%))', 'color(srgb 0 1 1)'],
            // Preserve `none`
            ['color(srgb none none none / none)'],
            // Math function
            ['color(srgb calc(1) calc(100%) 0)', 'color(srgb 1 1 0)'],
            // Precision (browser conformance: TBD, at least 10 to 16 bits depending on the color space)
            ['color(srgb 0.0000001 0 0 / 0.499)', 'color(srgb 0 0 0 / 0.498)'],
            ['color(srgb 0.00000051 0 0 / 0.501)', 'color(srgb 0.000001 0 0 / 0.5)'],
            ['color(srgb 0.00001% 0 0 / 49.9%)', 'color(srgb 0 0 0 / 0.498)'],
            ['color(srgb 0.00005% 0 0 / 50.1%)', 'color(srgb 0.000001 0 0 / 0.5)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<color>', input)).toBe(expected))
    })
})
describe('<gradient>', () => {
    it('parses a valid value', () => {

        const red = keyword('red', ['named-color', 'absolute-color-base', 'color'])
        const cyan = keyword('cyan', ['named-color', 'absolute-color-base', 'color'])
        const linearStopList = list(
            [
                list([red, omitted('<color-stop-length>?')], ' ', ['linear-color-stop']),
                delimiter(','),
                list(
                    [
                        list([
                            omitted('<linear-color-hint>?'),
                            omitted(','),
                            list([cyan, omitted('<color-stop-length>?')], ' ', ['linear-color-stop']),
                        ]),
                    ],
                    ',',
                ),
            ],
            ' ',
            ['color-stop-list'])

        expect(parse('<gradient>', 'conic-gradient(red, cyan)', false, false)).toEqual({
            name: 'conic-gradient',
            representation: 'conic-gradient(red, cyan)',
            type: new Set(['function', 'conic-gradient()', 'gradient']),
            value: list([
                omitted('[from <angle>]?'),
                atCenter,
                comma,
                list(
                    [
                        list([red, omitted('<color-stop-angle>?')], ' ', ['angular-color-stop']),
                        delimiter(','),
                        list(
                            [
                                list([
                                    omitted('<angular-color-hint>?'),
                                    omitted(','),
                                    list([cyan, omitted('<color-stop-angle>?')], ' ', ['angular-color-stop']),
                                ]),
                            ],
                            ',',
                        ),
                    ],
                    ' ',
                    ['angular-color-stop-list'],
                ),
            ]),
        })
        expect(parse('<gradient>', 'linear-gradient(red, cyan)', false, false)).toEqual({
            name: 'linear-gradient',
            representation: 'linear-gradient(red, cyan)',
            type: new Set(['function', 'linear-gradient()', 'gradient']),
            value: list([
                omitted('[<angle> | to <side-or-corner>]?'),
                omitted(','),
                linearStopList,
            ]),
        })
        expect(parse('<gradient>', 'radial-gradient(red, cyan)', false, false)).toEqual({
            name: 'radial-gradient',
            representation: 'radial-gradient(red, cyan)',
            type: new Set(['function', 'radial-gradient()', 'gradient']),
            value: list([
                omitted('[<ending-shape> || <size>]?'),
                atCenter,
                comma,
                linearStopList,
            ]),
        })
    })
    it('parses and serializes a valid value', () => {
        [
            ['CONIC-gradient(red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['LINEAR-gradient(red, cyan)', 'linear-gradient(red, cyan)'],
            ['RADIAL-gradient(red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            // Repeating gradients
            ['repeating-conic-gradient(red, cyan)', 'repeating-conic-gradient(at center center, red, cyan)'],
            ['repeating-linear-gradient(red, cyan)', 'repeating-linear-gradient(red, cyan)'],
            ['repeating-radial-gradient(red, cyan)', 'repeating-radial-gradient(at center center, red, cyan)'],
            // Simplified gradient configurations
            ['conic-gradient(from 0, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 0deg, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 0turn, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 360deg, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from calc(360deg), red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['linear-gradient(180deg, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(1.5turn, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(to bottom, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(calc(540deg), red, cyan)', 'linear-gradient(red, cyan)'],
            ['radial-gradient(circle farthest-corner, red, cyan)', 'radial-gradient(circle at center center, red, cyan)'],
            ['radial-gradient(circle 1px, red, cyan)', 'radial-gradient(1px at center center, red, cyan)'],
            ['radial-gradient(ellipse farthest-corner, red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            ['radial-gradient(ellipse 1px 1px, red, cyan)', 'radial-gradient(1px 1px at center center, red, cyan)'],
            // Implicit color stops
            ['conic-gradient(red 0deg 180deg)', 'conic-gradient(at center center, red 0deg, red 180deg)'],
            ['conic-gradient(red 0deg 180deg, cyan 180deg 0deg)', 'conic-gradient(at center center, red 0deg, red 180deg, cyan 180deg, cyan 0deg)'],
            ['linear-gradient(red 0% 50%)', 'linear-gradient(red 0%, red 50%)'],
            ['linear-gradient(red 0% 50%, cyan 50% 0%)', 'linear-gradient(red 0%, red 50%, cyan 50%, cyan 0%)'],
            ['radial-gradient(red 0% 50%)', 'radial-gradient(at center center, red 0%, red 50%)'],
            ['radial-gradient(red 0% 50%, cyan 50% 0%)', 'radial-gradient(at center center, red 0%, red 50%, cyan 50%, cyan 0%)'],
        ].forEach(([input, expected]) => expect(parse('<gradient>', input)).toBe(expected))
    })
    it('parses and serializes a vendor prefixed alias gradient value', () => {
        const aliases = [
            'linear-gradient(red, cyan)',
            'radial-gradient(at center center, red, cyan)',
        ]
        aliases.forEach(input => {
            expect(parse('<gradient>', `-webkit-${input}`)).toBe(input)
            expect(parse('<gradient>', `-webkit-repeating-${input}`)).toBe(`repeating-${input}`)
        })
    })
})
describe('<grid-line>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            'span',
            '-1 span',
            '-1 auto',
            'span auto',
        ]
        invalid.forEach(input => expect(parse('<grid-line>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<grid-line>', 'auto', false, false)).toEqual(keyword('auto', ['grid-line']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<grid-line>', 'span 1'))
    })
})
describe('<line-names>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<line-names>', '[auto]', false, false)).toBeNull()
        expect(parse('<line-names>', '[span]', false, false)).toBeNull()
    })
    it('parses a valid value', () => {
        const name = ident('name', ['custom-ident'])
        expect(parse('<line-names>', '[name name]', false, false)).toEqual({
            associatedToken: '[',
            representation: '[name name]',
            type: new Set(['simple-block', 'line-names']),
            value: list([name, name]),
        })
    })
})
describe('<position>', () => {
    it('parses and serializes a valid value', () => {
        const valid = [
            ['center', 'center center'],
            ['left', 'left center'],
            ['top', 'center top'],
            ['50%', '50% center'],
            ['0px', '0px center'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<position>', input)).toBe(expected))
    })
})
describe('<url-set>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            'image-set(image(black) 1x)',
            'image-set(image-set(black) 1x)',
            'image-set(cross-fade(black) 1x)',
            'image-set(element(#image) 1x)',
            'image-set(linear-gradient(red, cyan) 1x)',
        ]
        invalid.forEach(input => expect(parse('<url-set>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const url = string('image.jpg')
        const resolution = dimension(1, 'x', ['resolution'])
        const format = omitted('type(<string>)')
        const option = list([url, list([resolution, format])], ' ', ['image-set-option'])
        expect(parse('<url-set>', 'image-set("image.jpg" 1x)', false, false)).toEqual({
            name: 'image-set',
            representation: 'image-set("image.jpg" 1x)',
            type: new Set(['function', 'image-set()', 'url-set']),
            value: list([option], ','),
        })
    })
})

describe('<id-selector>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid identifier (start) code point
            '#1identifier',
            '#!identifier',
            '#-1identifier',
            '#-!identifier',
            // Invalid escape sequence (parse error)
            '#\\\n',
            '#-\\\n',
        ]
        invalid.forEach(input => expect(parse('<id-selector>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<id-selector>', '#identifier', false, false))
            .toEqual(hash('identifier', ['id', 'hash-token', 'id-selector']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Starts with identifier start code point
            ['#identifier'],
            ['#·identifier'],
            ['#_identifier'],
            // Starts with escape sequence
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
            // Starts with -
            ['#--'],
            ['#-identifier'],
            ['#-·identifier'],
            ['#-_identifier'],
            ['#-\\31identifier', '#-\\31 identifier'],
            // Contains identifier code points
            ['#identifier·'],
            ['#identifier_'],
            ['#identifier1'],
            ['#identifier-'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<id-selector>', input)).toBe(expected))
    })
})
describe('<selector-list>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid whitespace
            'col | | td',
            'svg| *',
            'svg| a',
            '*| a',
            '. class',
            ': hover',
            ': :before',
            ':: before',
            '[svg |viewBox]',
            '[svg| viewBox]',
            '[attr~ =value]',
            // Undeclared namespace
            'undeclared|*',
            '[undeclared|attr=value]',
            // Invalid pseudo-class name
            ':not',
            ':marker',
            // Invalid functional pseudo-class name
            ':hover()',
            ':marker()',
            // Invalid pseudo-element name
            '::hover',
            '::not',
            // Invalid functional pseudo-element name
            '::hover()',
            '::not()',
            '::marker()',
            // Invalid pseudo-classing of pseudo-element
            '::before:root',
            '::before:lang(fr)',
            // Invalid sub-pseudo-element
            '::before::first-line',
            // Invalid pseudo-element combination (no internal structure)
            '::first-letter + span',
            // Invalid functional pseudo-class arguments
            ':current(::before)',
            ':not(::before)',
            ':nth-child(+ n)',
        ]
        invalid.forEach(input => expect(parse('<selector-list>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {

        const classIdentifier = ident('class', ['ident-token'])
        const classSelector = list([delimiter('.'), classIdentifier], '', ['class-selector', 'subclass-selector'])
        const classChain = list([classSelector], '')
        const pseudoChain = list([], '')
        const compoundSelector = list([omitted('<type-selector>?'), classChain, pseudoChain], '', ['compound-selector'])
        const complexSelector = list([compoundSelector, list()], ' ', ['complex-selector'])
        const selectors = list([complexSelector], ',', ['complex-selector-list', 'selector-list'])

        expect(parse('<selector-list>', '.class', false, false)).toEqual(selectors)
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // No invalid whitespace
            ['#id.class[ *|attr ^= value ]:hover > [attr=value]::before', '#id.class[*|attr ^= value]:hover > [attr = value]::before'],
            ['html|*'],
            ['html|a'],
            ['*|a'],
            ['|a'],
            ['col || td'],
            // Pseudo-class or pseudo-element name is case-insensitive
            ['::BEFORE', '::before'],
            [':HOVER', ':hover'],
            [':DIR(ltr)', ':dir(ltr)'],
            // Pseudo-element as pseudo-class (back-compatibility with CSS2)
            [':after', '::after'],
            [':before', '::before'],
            [':first-letter', '::first-letter'],
            [':first-line', '::first-line'],
            // Pseudo-classing pseudo-element
            ['::before:hover'],
            ['::before:defined'],
            ['::before:is(:hover)'],
            ['::before:not(:hover)'],
            ['::before:where(:hover)'],
            // Sub-pseudo-element
            ['::after::marker'],
            ['::before::marker'],
            ['::first-letter::postfix'],
            ['::first-letter::prefix'],
            // Special parsing of <forgiving-[relative-]selector-list>
            [':is(, valid, 0, #valid, undeclared|*, .valid, ::before, :hover)', ':is(valid, #valid, .valid, :hover)'],
            [':has(, valid, 0, #valid, undeclared|*, .valid, ::before, :hover)', ':has(valid, #valid, .valid, :hover)'],
            [':nth-child(1 of , valid, 0, #valid, undeclared|*, .valid, ::before, :hover)', ':nth-child(1 of valid, #valid, .valid, :hover)'],
            // Nest-prefixed selector
            ['&'],
            ['&&'],
            ['&type&'],
            ['&#identifier&'],
            ['&.subclass&'],
            ['&[attr]&'],
            ['&:hover&'],
            ['&:is(&)'],
            ['&:is(&:hover)'],
            ['&::before&'],
            ['&::before:hover&'],
            ['& type + & type &'],
            ['&, &'],
            // Nest-containing selector
            ['type&'],
            ['.subclass&'],
            [':hover&'],
            ['::before&'],
            ['::before:hover&'],
            ['type &'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<selector-list>', input)).toBe(expected))
    })
})
describe('<keyframes-name>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<keyframes-name>', 'none')).toBe('')
    })
})
describe('<keyframe-selector>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<keyframe-selector>', 'none')).toBe('')
    })
    it('parses a valid value', () => {
        expect(parse('<keyframe-selector>', '0%', false, false)).toEqual(percentage(0, ['keyframe-selector']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<keyframe-selector>', 'from')).toBe('0%')
        expect(parse('<keyframe-selector>', 'to')).toBe('100%')
    })
})
describe('<page-selector-list>', () => {
    it('fails to parse and invalid value', () => {
        const invalid = [
            // Invalid whitespace
            'toc :left',
            'toc: left',
        ]
        invalid.forEach(input => expect(parse('<page-selector-list>', input, false, false)).toBeNull())
    })
    it('parses a valid value', () => {

        const toc = ident('toc', ['ident-token'])
        const pseudoSelector = list([delimiter(':'), keyword('right')], '', ['pseudo-page'])
        const pseudoChain = list([pseudoSelector], '')
        const selector = list([toc, pseudoChain], '', ['page-selector'])
        const selectors = list([selector], ',', ['page-selector-list'])

        expect(parse('<page-selector-list>', 'toc:right', false, false)).toEqual(selectors)
    })
})
describe('<media-query>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // <media-type> must not be `only`, `not`, `and`, `or`
            'not only',
            'not not',
            'and',
            'or',
            // <mf-lt> or <mf-gt> must not include a whitespace
            'width < = 1px',
            'width > = 1px',
        ]
        invalid.forEach(input => expect(parse('<media-query>', input, false, false)).toBeNull())
    })
})

describe.skip('(WIP) CSSValue', () => {
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
    it('transforms a single value without side effect but preserves instance properties', () => {
        const single = new CSSValue(1, ['length'], { unit: 'px' })
        const transformed = single.map(n => n + 1)
        transformed.type.add('two')
        expect(single.value).toBe(1)
        expect(single.type.size).toBe(1)
        expect(single.unit).toBe('px')
        expect(transformed.value).toBe(2)
        expect(transformed.type.size).toBe(2)
        expect(transformed.unit).toBe('px')
    })
    it('transforms a list of values without side effect but preserves instance properties', () => {
        const parameters = { strategy: 'to-zero' }
        const list = new CSSValue([1, 2], ' ', ['round'], { parameters })
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
})
