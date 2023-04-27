
const { MAX_INTEGER, MIN_INTEGER } = require('../lib/values/integers.js')
const { Parser, parseCSSGrammar, productions } = require('../lib/parse/syntax.js')
const { serializeCSSComponentValue } = require('../lib/serialize.js')
const { toDegrees, toRadians } = require('../lib/utils/math.js')
const createOmitted = require('../lib/values/omitted.js')
const { createList: list } = require('../lib/values/value.js')
const { notAll } = require('../lib/values/defaults.js')
const parseDefinition = require('../lib/parse/definition.js')

// Helpers to create component values
function component(value, type, representation = value) {
    return { representation, type: new Set(type), value }
}
function delimiter(value, type = []) {
    return component(value, ['delimiter', ...type])
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
function resolution(value, unit, type = [], representation) {
    return dimension(value, unit, ['resolution', ...type], representation)
}
function time(value, unit, type = [], representation) {
    return dimension(value, unit, ['time', ...type], representation)
}
function ident(value, type = [], representation) {
    return component(value, ['ident', ...type], representation)
}
function customIdent(value, type = [], representation) {
    return ident(value, ['custom-ident', ...type], representation)
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
    return createOmitted(parseDefinition(definition, productions))
}

/**
 * @param {string} definition
 * @param {string} value
 * @param {boolean} [serialize]
 * @returns {object|object[]|string|null}
 */
function parse(definition, value, serialize = true) {
    value = parseCSSGrammar(value, definition, parser)
    if (serialize) {
        if (value) {
            return serializeCSSComponentValue(value)
        }
        return ''
    }
    return value
}

// Initialize Parser with a style rule as context
const rules = []
const styleSheet = { _rules: rules, type: 'text/css' }
const styleRule = { parentStyleSheet: styleSheet, type: new Set(['style']) }

rules.push(
    { parentStyleSheet: styleSheet, prefix: 'html', type: new Set(['namespace']) },
    { parentStyleSheet: styleSheet, prefix: 'svg', type: new Set(['namespace']) },
    styleRule)

const parser = new Parser(styleRule)

const a = keyword('a')
const b = keyword('b')

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
        expect(parse(definition, '', false)).toEqual(omitted('a?'))
        expect(parse(definition, 'a', false)).toEqual(a)
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
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a', false)).toEqual(list([a]))
        expect(parse(definition, 'a a', false)).toEqual(list([a, a]))
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
        expect(parse(definition, 'a', false)).toEqual(list([a], ','))
        expect(parse(definition, 'a, a', false)).toEqual(list([a, a], ','))
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
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'a a', false)).toEqual(list([a, a]))
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
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a a', false)).toEqual(list([a, a]))
    })
    it('parses a value matched against [a b?]', () => {
        const definition = '[a b?]'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b?')]))
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a b?]?', () => {
        const definition = '[a b?]?'
        expect(parse(definition, '', false)).toEqual(omitted('[a b?]?'))
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b?')]))
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a b?]*', () => {
        const definition = '[a b?]*'
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a', false)).toEqual(list([list([a, omitted('b?')])]))
        expect(parse(definition, 'a b', false)).toEqual(list([list([a, b])]))
    })
    it('parses a value matched against [a b?]#', () => {
        const definition = '[a b?]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([list([a, omitted('b?')])], ','))
        expect(parse(definition, 'a b', false)).toEqual(list([list([a, b])], ','))
    })
    it('parses a value matched against [a? b?]', () => {
        const definition = '[a? b?]'
        expect(parse(definition, '', false)).toEqual(list([omitted('a?'), omitted('b?')]))
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b?')]))
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a? b?]?', () => {
        const definition = '[a? b?]?'
        expect(parse(definition, '', false)).toEqual(list([omitted('a?'), omitted('b?')]))
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b?')]))
        expect(parse(definition, 'b', false)).toEqual(list([omitted('a?'), b]))
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses and serializes a value matched against a [b? c?]!', () => {
        const definition = 'a [b? c?]!'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'a c')).toBe('a c')
    })
    it('parses a value matched against [a? b?]!', () => {
        const definition = '[a? b?]!'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b?')]))
        expect(parse(definition, 'b', false)).toEqual(list([omitted('a?'), b]))
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a b]', () => {
        const definition = '[a b]'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'b', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a b]?', () => {
        const definition = '[a b]?'
        expect(parse(definition, '', false)).toEqual(omitted('[a b]?'))
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'b', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a b]*', () => {
        const definition = '[a b]*'
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'b', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toEqual(list([list([a, b])]))
    })
    it('parses a value matched against [a b]#', () => {
        const definition = '[a b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toBeNull()
        expect(parse(definition, 'b', false)).toBeNull()
        expect(parse(definition, 'a b', false)).toEqual(list([list([a, b])], ','))
    })
    it('parses a value matched against [a | b]', () => {
        const definition = '[a | b]'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(a)
        expect(parse(definition, 'b', false)).toEqual(b)
    })
    it('parses a value matched against [a | b]?', () => {
        const definition = '[a | b]?'
        expect(parse(definition, '', false)).toEqual(omitted('[a | b]?'))
        expect(parse(definition, 'a', false)).toEqual(a)
        expect(parse(definition, 'b', false)).toEqual(b)
    })
    it('parses a value matched against [a | b]*', () => {
        const definition = '[a | b]*'
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a', false)).toEqual(list([a]))
        expect(parse(definition, 'b', false)).toEqual(list([b]))
    })
    it('parses a value matched against [a | b]#', () => {
        const definition = '[a | b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([a], ','))
        expect(parse(definition, 'b', false)).toEqual(list([b], ','))
    })
    it('parses a value matched against [a | b b]', () => {
        const definition = '[a | b b]'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(a)
        expect(parse(definition, 'b b', false)).toEqual(list([b, b]))
    })
    it('parses a value matched against [a | b b]?', () => {
        const definition = '[a | b b]?'
        expect(parse(definition, '', false)).toEqual(omitted('[a | b b]?'))
        expect(parse(definition, 'a', false)).toEqual(a)
        expect(parse(definition, 'b b', false)).toEqual(list([b, b]))
    })
    it('parses a value matched against [a | b b]*', () => {
        const definition = '[a | b b]*'
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a', false)).toEqual(list([a]))
        expect(parse(definition, 'b b', false)).toEqual(list([list([b, b])]))
    })
    it('parses a value matched against [a | b b]#', () => {
        const definition = '[a | b b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([a], ','))
        expect(parse(definition, 'b b', false)).toEqual(list([list([b, b])], ','))
    })
    it('parses a value matched against [a || b]', () => {
        const definition = '[a || b]'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b')]))
        expect(parse(definition, 'b', false)).toEqual(list([omitted('a'), b]))
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a || b]?', () => {
        const definition = '[a || b]?'
        expect(parse(definition, '', false)).toEqual(omitted('[a || b]?'))
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b')]))
        expect(parse(definition, 'b', false)).toEqual(list([omitted('a'), b]))
        expect(parse(definition, 'a b', false)).toEqual(list([a, b]))
    })
    it('parses a value matched against [a || b]*', () => {
        const definition = '[a || b]*'
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a', false)).toEqual(list([list([a, omitted('b')])]))
        expect(parse(definition, 'b', false)).toEqual(list([list([omitted('a'), b])]))
        expect(parse(definition, 'a b', false)).toEqual(list([list([a, b])]))
    })
    it('parses a value matched against [a || b]#', () => {
        const definition = '[a || b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a, b', false)).toEqual(list([list([a, omitted('b')]), list([omitted('a'), b])], ','))
        expect(parse(definition, 'a', false)).toEqual(list([list([a, omitted('b')])], ','))
        expect(parse(definition, 'b', false)).toEqual(list([list([omitted('a'), b])], ','))
        expect(parse(definition, 'a b', false)).toEqual(list([list([a, b])], ','))
        expect(parse(definition, 'a b, b', false)).toEqual(list([list([a, b]), list([omitted('a'), b])], ','))
    })
    it('parses a value matched against [a || b b]', () => {
        const definition = '[a || b b]'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b b')]))
        expect(parse(definition, 'b b', false)).toEqual(list([omitted('a'), list([b, b])]))
        expect(parse(definition, 'a b b', false)).toEqual(list([a, list([b, b])]))
    })
    it('parses a value matched against [a || b b]?', () => {
        const definition = '[a || b b]?'
        expect(parse(definition, '', false)).toEqual(omitted('[a || b b]?'))
        expect(parse(definition, 'a', false)).toEqual(list([a, omitted('b b')]))
        expect(parse(definition, 'b b', false)).toEqual(list([omitted('a'), list([b, b])]))
        expect(parse(definition, 'a b b', false)).toEqual(list([a, list([b, b])]))
    })
    it('parses a value matched against [a || b b]*', () => {
        const definition = '[a || b b]*'
        expect(parse(definition, '', false)).toEqual(list())
        expect(parse(definition, 'a', false)).toEqual(list([list([a, omitted('b b')])]))
        expect(parse(definition, 'b b', false)).toEqual(list([list([omitted('a'), list([b, b])])]))
        expect(parse(definition, 'a b b', false)).toEqual(list([list([a, list([b, b])])]))
    })
    it('parses a value matched against [a || b b]#', () => {
        const definition = '[a || b b]#'
        expect(parse(definition, '', false)).toBeNull()
        expect(parse(definition, 'a', false)).toEqual(list([list([a, omitted('b b')])], ','))
        expect(parse(definition, 'b b', false)).toEqual(list([list([omitted('a'), list([b, b])])], ','))
        expect(parse(definition, 'a b b', false)).toEqual(list([list([a, list([b, b])])], ','))
    })
})
describe('backtracking', () => {
    // Simple backtracking
    it('parses and serializes a value matched against a | a a | a a a', () => {
        const definition = 'a | a a | a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a a a | a a | a', () => {
        const definition = 'a a a | a a | a'
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
    it('parses and serializes a value matched against a a a || a a || a', () => {
        const definition = 'a a a || a a || a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
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
    // Complex backtracking
    it('parses and serializes a value matched against [a | a a | a a a] a', () => {
        const definition = '[a | a a | a a a] a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a | a a | a a a] && a', () => {
        const definition = '[a | a a | a a a] && a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a | a a | a a a] || a', () => {
        const definition = '[a | a a | a a a] || a'
        expect(parse(definition, 'a')).toBe('a')
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
    it('parses and serializes a value matched against [a || a a || a a a] && a', () => {
        const definition = '[a || a a || a a a] && a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a || a a || a a a] | a', () => {
        const definition = '[a || a a || a a a] | a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a | a a | a a a]{2} a', () => {
        const definition = '[a | a a | a a a]{2} a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('a a a a a a a')
        expect(parse(definition, 'a a a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a? a{2}', () => {
        const definition = 'a? a{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    it('parses and serializes a value matched against [a | a a]* a', () => {
        const definition = '[a | a a]* a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    it('parses and serializes a value matched against [a? | a a] a', () => {
        const definition = '[a? | a a] a'
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
    it('parses and serializes a value matched against [a? && a?] a', () => {
        const definition = '[a? && a?] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a{2}]? && a', () => {
        const definition = '[a{2}]? && a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a | a a | a a a] [a | a a]', () => {
        const definition = '[a | a a | a a a] [a | a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a | a a] a | a', () => {
        const definition = '[a | a a] a | a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against [a && [a | a a]] a', () => {
        const definition = '[a && [a | a a]] a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    /**
     * There is no definition of the following requirement in specifications but
     * combination order generally encode priorities to resolve an ambiguity.
     */
    it('parses a value in lexicographic order', () => {

        // <media-type> and <mf-name> represent <ident>
        const definition = 'a || <media-type> || <mf-name>'
        const screenMediaType = ident('screen', ['media-type'])
        const screenMediaFeature = ident('screen', ['mf-name'])
        const colorMediaType = ident('color', ['media-type'])
        const colorMediaFeature = ident('color', ['mf-name'])

        expect(parse(definition, 'a screen color', false)).toEqual(list([a, screenMediaType, colorMediaFeature]))
        expect(parse(definition, 'a color screen', false)).toEqual(list([a, colorMediaType, screenMediaFeature]))
        expect(parse(definition, 'screen a color', false)).toEqual(list([a, screenMediaType, colorMediaFeature]))
        expect(parse(definition, 'screen color a', false)).toEqual(list([a, screenMediaType, colorMediaFeature]))
        expect(parse(definition, 'color a screen', false)).toEqual(list([a, colorMediaType, screenMediaFeature]))
        expect(parse(definition, 'color screen a', false)).toEqual(list([a, colorMediaType, screenMediaFeature]))
    })
    /**
     * Requirements:
     *
     * 1. Replacing must only apply once (ie. not after backtracking).
     * 2. The list index must backtrack to a location saved/resolved from state
     * instead of from the index of a component value in the list.
     * 3. The result from processing a math function should not replace the
     * input component value, because this result may be different depending on
     * the context production.
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
    // Comma-elision rules do or do not apply
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
    it('parses and serializes a value missing optional whitespace', () => {
        expect(parse('a a', 'a/**/a')).toBe('a a')
    })
    it('parses and serializes a value including leading and trailing whitespaces', () => {
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
        invalid.forEach(input => expect(parse('<any-value>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<any-value>', 'any value', false))
            .toEqual(list([ident('any'), delimiter(' '), ident('value')], ' ', ['any-value']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<any-value>', '  /**/  !1e0;  /**/  ')).toBe('! 1;')
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
        invalid.forEach(input => expect(parse('<declaration-value>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<declaration-value>', 'declaration value', false))
            .toEqual(list([ident('declaration'), delimiter(' '), ident('value')], ' ', ['declaration-value']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<declaration-value>', '  /**/  1e0  /**/  ')).toBe('1')
    })
})
describe('<declaration>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<declaration>', 'color red', false)).toBeNull()
        expect(parse('<declaration>', 'color: red;', false)).toBeNull()
    })
    it('parses a valid value', () => {
        expect(parse('<declaration>', 'color: green !important', false)).toEqual({
            important: true,
            name: 'color',
            type: new Set(['declaration']),
            value: list([ident('green')]),
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<declaration>', '  /**/  opacity :1e0 !important  /**/  ')).toBe('opacity: 1 !important')
        expect(parse('<declaration>', '--custom:  /**/  1e0 !important  /**/  ')).toBe('--custom: 1e0 !important')
        expect(parse('<declaration>', '--custom:')).toBe('--custom: ')
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
        invalid.forEach(input => expect(parse('<ident>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<ident>', 'identifier', false)).toEqual(ident('identifier'))
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
        expect(parse('solid', 'solid', false)).toEqual(keyword('solid'))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Case-insensitive
            ['solid', 'SOLId', 'solid'],
            // Legacy mapped value
            ['flex', '-webkit-box'],
            ['flex', '-webkit-flex'],
            ['inline-flex', '-webkit-inline-box'],
            ['inline-flex', '-webkit-inline-flex'],
        ]
        valid.forEach(([keyword, input, expected = input]) => expect(parse(keyword, input)).toBe(expected))
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
        invalid.forEach(input => expect(parse('<custom-ident>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<custom-ident>', 'customIdentifier', false)).toEqual(customIdent('customIdentifier'))
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
        invalid.forEach(input => expect(parse('<dashed-ident>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<dashed-ident>', '--dashed-ident', false)).toEqual(ident('--dashed-ident', ['dashed-ident']))
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
        expect(parse('<custom-property-name>', '--', false)).toBeNull()
    })
    it('parses a valid value', () => {
        expect(parse('<custom-property-name>', '--custom', false)).toEqual(ident('--custom', ['custom-property-name']))
    })
})
describe('<ndashdigit-ident>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-n-1',
            'n--1',
            'n-1-',
        ]
        invalid.forEach(input => expect(parse('<ndashdigit-ident>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const valid = [
            ['n-1', ident('n-1', ['ndashdigit-ident'])],
            ['N-1', ident('n-1', ['ndashdigit-ident'], 'N-1')],
            ['n-12', ident('n-12', ['ndashdigit-ident'])],
        ]
        valid.forEach(([input, expected]) => expect(parse('<ndashdigit-ident>', input, false)).toEqual(expected))
    })
})
describe('<dashndashdigit-ident>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '--n-1',
            '-n--1',
            '-n-1-',
        ]
        invalid.forEach(input => expect(parse('<dashndashdigit-ident>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const valid = [
            ['-n-1', ident('-n-1', ['dashndashdigit-ident'])],
            ['-N-1', ident('-n-1', ['dashndashdigit-ident'], '-N-1')],
            ['-n-12', ident('-n-12', ['dashndashdigit-ident'])],
        ]
        valid.forEach(([input, expected]) => expect(parse('<dashndashdigit-ident>', input, false)).toEqual(expected))
    })
})
describe('<string>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<string>', '"\n"', false)).toBeNull()
    })
    it('parses a valid value', () => {
        expect(parse('<string>', '"css"', false)).toEqual(string('css'))
        expect(parse('<string>', '"css', false)).toEqual(string('css', [], '"css'))
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
        invalid.forEach(input => expect(parse('<url>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const valid = [
            ['url(img.jpg)', {
                representation: 'url(img.jpg)',
                type: new Set(['url-token', 'url()', 'url']),
                value: 'img.jpg',
            }],
            ['url("img.jpg")', {
                name: 'url',
                representation: 'url("img.jpg")',
                type: new Set(['function', 'url()', 'url']),
                value: list([string('img.jpg'), list()]),
            }],
            ['src("img.jpg")', {
                name: 'src',
                representation: 'src("img.jpg")',
                type: new Set(['function', 'src()', 'url']),
                value: list([string('img.jpg'), list()]),
            }],
        ]
        valid.forEach(([input, expected]) => expect(parse('<url>', input, false)).toEqual(expected))
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
            '1',
            '0px',
            'calc(0)',
        ]
        invalid.forEach(input => expect(parse('<zero>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<zero>', '0', false)).toEqual(number(0, ['zero']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            '0.0',
            '+0',
            '0e1',
        ]
        valid.forEach(input => expect(parse('<zero>', input)).toBe('0'))
    })
})
describe('<integer>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-1',
            '1.1',
            '1e-1',
            '1px',
            'calc(1px)',
        ]
        invalid.forEach(input => expect(parse('<integer [0,∞]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<integer>', '1', false)).toEqual(number(1, ['integer']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Scientific notation (https://github.com/w3c/csswg-drafts/issues/7289)
            ['1.0', '1'],
            ['1e1', '10'],
            ['1e+1', '10'],
            ['1234567'],
            // 8 bits signed integer (browser conformance)
            [`${MIN_INTEGER - 1}`, MIN_INTEGER],
            [`${MAX_INTEGER + 1}`, MAX_INTEGER],
            // Priority over <length> in "either" combination types
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
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-1',
            '+1',
            '1.1',
            '1e-1',
            '1px',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<signless-integer>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<signless-integer>', '1', false)).toEqual(number(1, ['signless-integer']))
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
        invalid.forEach(input => expect(parse('<signed-integer>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<signed-integer>', '+1', false)).toEqual(number(1, ['signed-integer'], '+1'))
        expect(parse('<signed-integer>', '-1', false)).toEqual(number(-1, ['signed-integer'], '-1'))
    })
})
describe('<number>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-1',
            '1px',
            'calc(1px)',
        ]
        invalid.forEach(input => expect(parse('<number [0,∞]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<number>', '1', false)).toEqual(number(1))
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
            // Priority over <length> in "either" combination types
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
        invalid.forEach(input => expect(parse('<dimension-token>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<dimension-token>', '1identifier', false))
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
        invalid.forEach(input => expect(parse('<length [0,∞]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<length>', '0', false)).toEqual({ type: new Set(['dimension', 'length']), unit: 'px', value: 0 })
        expect(parse('<length>', '1px', false)).toEqual(length(1, 'px'))
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
            '-1%',
            '0',
            '1px',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<percentage [0,∞]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<percentage>', '1%', false)).toEqual(percentage(1))
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
        const invalid = [
            '-1px',
            '-1%',
            '1deg',
        ]
        invalid.forEach(input => expect(parse('<length-percentage [0,∞]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<length-percentage>', '1px', false)).toEqual(length(1, 'px', ['length-percentage']))
    })
    it('parses and serializes valid value', () => {
        expect(parse('<length-percentage>', '1px')).toBe('1px')
        expect(parse('<length-percentage>', '1%')).toBe('1%')
    })
})
describe('<alpha-value>', () => {
    it('parses a valid value', () => {
        expect(parse('<alpha-value>', '1', false)).toEqual(number(1, ['alpha-value']))
        expect(parse('<alpha-value>', '1%', false)).toEqual(percentage(1, ['alpha-value']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // To number
            ['50%', '0.5'],
            // Clamped at computed value time
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
        invalid.forEach(input => expect(parse('<angle [0,1deg]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const valid = [
            ['<angle> | <zero>', '0', {
                type: new Set(['dimension', 'angle']),
                unit: 'deg',
                value: 0,
            }],
            ['<angle-percentage> | <zero>', '0', {
                type: new Set(['dimension', 'angle', 'angle-percentage']),
                unit: 'deg',
                value: 0,
            }],
            ['<angle>', '1deg', angle(1, 'deg')],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input, false)).toEqual(expected))
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
        valid.forEach(([input, expected = input, definition = '<angle [0,1turn]>']) =>
            expect(parse(definition, input)).toBe(expected))
    })
})
describe('<resolution>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '-1dppx',
            '1dpi',
            '1',
            '1px',
            'calc(1)',
        ]
        invalid.forEach(input => expect(parse('<resolution [0,1dppx]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<resolution>', '1dppx', false)).toEqual(resolution(1, 'dppx'))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Scientific notation
            ['1e1dppx', '10dppx'],
            ['1e+1dppx', '10dppx'],
            ['1e-1dppx', '0.1dppx'],
            // Leading 0
            ['.1dppx', '0.1dppx'],
            // Trailing 0
            ['0.10dppx', '0.1dppx'],
            // Case-insensitive
            ['1DPpx', '1dppx'],
        ]
        valid.forEach(([input, expected = input, definition = '<resolution [0,1dpi]>']) =>
            expect(parse(definition, input)).toBe(expected))
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
        invalid.forEach(input => expect(parse('<time [0,1ms]>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<time>', '1s', false)).toEqual(time(1, 's'))
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
        invalid.forEach(input => expect(parse('<dimension>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<dimension>', '1identifier', false)).toEqual(dimension(1, 'identifier'))
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
        invalid.forEach(input => expect(parse('<n-dimension>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<n-dimension>', '1n', false)).toEqual(dimension(1, 'n', ['n-dimension']))
        expect(parse('<n-dimension>', '1N', false)).toEqual(dimension(1, 'n', ['n-dimension'], '1N'))
    })
})
describe('<ndash-dimension>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1n',
            '1.1n-',
            'calc(1n-)',
        ]
        invalid.forEach(input => expect(parse('<ndash-dimension>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<ndash-dimension>', '1n-', false)).toEqual(dimension(1, 'n-', ['ndash-dimension']))
        expect(parse('<ndash-dimension>', '1N-', false)).toEqual(dimension(1, 'n-', ['ndash-dimension'], '1N-'))
    })
})
describe('<ndashdigit-dimension>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            '1n-',
            '1.1n-1',
            'calc(1n-1)',
        ]
        invalid.forEach(input => expect(parse('<ndashdigit-dimension>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const valid = [
            ['1n-1', dimension(1, 'n-1', ['ndashdigit-dimension'])],
            ['1N-1', dimension(1, 'n-1', ['ndashdigit-dimension'], '1N-1')],
            ['1n-11', dimension(1, 'n-11', ['ndashdigit-dimension'])],
        ]
        valid.forEach(([input, expected]) => expect(parse('<ndashdigit-dimension>', input, false)).toEqual(expected))
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
        invalid.forEach(input => expect(parse('<urange>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<urange>', 'U+0-f', false)).toEqual({
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
        invalid.forEach(input => expect(parse('<an+b>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<an+b>', 'even', false)).toEqual({
            representation: 'even',
            type: new Set(['an+b']),
            value: { a: 2, b: 0 },
        })
        expect(parse('<an+b>', '1n+1', false)).toEqual({
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
        const invalid = [
            // Whitespace is required on both sides of `+` and `-`
            ['<number>', 'calc(1+ 1)'],
            ['<number>', 'calc(1 +1)'],
            ['<number>', 'calc(1- 1)'],
            ['<number>', 'calc(1 -1)'],
            // Maximum 32 <calc-value>
            ['<number>', `calc(${[...Array(32)].reduce((n, _, i) => `${n} ${i < 15 ? '+' : '*'} 1`, '0')})`],
            ['<number>', `calc(${[...Array(32)].reduce(n => `(${n})`, '1')})`],
            ['<number>', `calc(${[...Array(32)].reduce(n => `calc(${n})`, '1')})`],
            ['<number>', `calc((1) + ${[...Array(30)].reduce(n => `(${n})`, '1')})`],
            ['<number>', `calc(calc(1) + ${[...Array(30)].reduce(n => `calc(${n})`, '1')})`],
            // Resolved type mismatch
            ['<number>', 'calc(1px)'],
            ['<number>', 'calc(1%)'],
            ['<length>', 'calc(1)'],
            ['<length>', 'calc(1%)'],
            ['<length>', 'calc(1px + 1s)'],
            ['<number>', 'calc(1px - 1s)'],
            ['<number>', 'calc(1px * 1s)'],
            ['<number>', 'calc(1px / 1s)'],
            ['<length>', 'calc(1px + 1)'],
            ['<length>', 'calc(1px - 1)'],
            ['<length>', 'calc(1 + 1px)'],
            ['<length>', 'calc(1 - 1px)'],
            ['<length>', 'calc(1 / 1px)'],
            ['<length>', 'calc(1px * 1px)'],
            ['<length>', 'calc(1px / 1px)'],
            ['<number>', 'calc(1px / 1px / 1px)'],
            ['<percentage>', 'calc(1% * 1%)'],
            ['<percentage>', 'calc(1% / 1%)'],
            ['<percentage>', 'calc(1 / 1%)'],
            // <dimension> does not match a type that a math function can resolve to
            ['<dimension>', 'calc(1n)'],
            // 0 is parsed as <number> in calculations
            ['<length>', 'calc(0 + 1px)'],
            ['<length>', 'calc(0 - 1px)'],
            // <number> and <percentage> are not combinable
            ['<number> | <percentage>', 'calc(1 + 1%)'],
            ['<number> | <percentage>', 'calc(1 - 1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses a valid value', () => {

        const one = number(1, ['calc-value'])
        const two = number(2, ['calc-value'])

        const valid = [
            // Unresolved calculations
            ['<calc()>', 'calc(1)', {
                name: 'calc',
                representation: 'calc(1)',
                type: new Set(['function', 'calc()']),
                value: one,
            }],
            ['<calc()>', 'calc(1 + 2)', {
                name: 'calc',
                representation: 'calc(1 + 2)',
                type: new Set(['function', 'calc()']),
                value: {
                    type: new Set(['calc-sum']),
                    value: [one, two],
                },
            }],
            ['<calc()>', 'calc(1 - 2)', {
                name: 'calc',
                representation: 'calc(1 - 2)',
                type: new Set(['function', 'calc()']),
                value: {
                    type: new Set(['calc-sum']),
                    value: [one, { type: new Set(['calc-negate']), value: two }],
                },
            }],
            ['<calc()>', 'calc(1 * 2)', {
                name: 'calc',
                representation: 'calc(1 * 2)',
                type: new Set(['function', 'calc()']),
                value: {
                    type: new Set(['calc-product']),
                    value: [one, two],
                },
            }],
            ['<calc()>', 'calc(1 / 2)', {
                name: 'calc',
                representation: 'calc(1 / 2)',
                type: new Set(['function', 'calc()']),
                value: {
                    type: new Set(['calc-product']),
                    value: [one, { type: new Set(['calc-invert']), value: two }],
                },
            }],
            // Resolved calculations
            ['<number>', 'calc(1)', {
                name: 'calc',
                numericType: new Map(),
                range: undefined,
                representation: 'calc(1)',
                round: false,
                type: new Set(['function', 'calc()']),
                value: number(1, ['calc-value']),
            }],
            ['<number>', 'calc(1 + 2)', {
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
            }],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input, false)).toEqual(expected))
    })
    it('parses and serializes calc() with a single operand', () => {
        const valid = [
            // <number>, <percentage>, <dimension>
            ['<number>', 'CALc(1)', 'calc(1)'],
            ['<percentage>', 'calc(1%)', 'calc(1%)'],
            ['<length>', 'calc(1px)', 'calc(1px)'],
            // <type-percentage>
            ['<number> | <percentage>', 'calc(1)', 'calc(1)'],
            ['<number> | <percentage>', 'calc(100%)', 'calc(1)'],
            ['<length-percentage>', 'calc(1px)', 'calc(1px)'],
            ['<length-percentage>', 'calc(1%)', 'calc(1%)'],
            ['<length> | <percentage>', 'calc(1%)', 'calc(1%)'],
            ['<length> | <percentage>', 'calc(1px)', 'calc(1px)'],
            ['a | <percentage> | b | <length> | c', 'calc(1px)', 'calc(1px)'],
            // Nested calculation or math function
            ['<number>', 'calc((1))', 'calc(1)'],
            ['<number>', 'calc(calc(1))', 'calc(1)'],
            ['<number>', 'calc(min(1))', 'calc(1)'],
            ['<length>', 'calc((1em))', 'calc(1em)'],
            ['<length>', 'calc(calc(calc(1em)))', 'calc(1em)'],
            ['<number>', 'calc(sign(1em))', 'sign(1em)'],
            ['<length>', 'calc(min(1em))', 'calc(1em)'],
            ['<length-percentage>', 'calc(min(1%))', 'calc(1%)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    it('parses and serializes calc() with operands of the same type and with the same unit', () => {
        const valid = [
            // Consecutive run of operations
            ['<number>', 'calc(1 + 1 + 1 + 1)', 'calc(4)'],
            ['<number>', 'calc(4 - 1 - 1 - 1)', 'calc(1)'],
            ['<number>', 'calc(1 * 2 * 3 * 4)', 'calc(24)'],
            ['<number>', 'calc(42 / 2 / 3 / 7)', 'calc(1)'],
            ['<number>', 'calc(1 + 2 * 3 - 2 / 1)', 'calc(5)'],
            // Addition or substraction of <dimension>s or <percentage>s
            ['<length>', 'calc(1px + 1px)', 'calc(2px)'],
            ['<length>', 'calc(1px - 1px)', 'calc(0px)'],
            ['<percentage>', 'calc(1% + 1%)', 'calc(2%)'],
            ['<percentage>', 'calc(1% - 1%)', 'calc(0%)'],
            // Multiplication of <dimension>s or <percentage>s (eg. <area>, <speed>, etc.)
            // Division of <dimension>s or <percentage>s
            ['<number>', 'calc(6px / 2px)', 'calc(3)'],
            ['<number>', 'calc(6% / 2%)', 'calc(3)'],
            // Nested calculations
            ['<number>', 'calc(1 + 2 * (3 + 4))', 'calc(15)'],
            ['<number>', 'calc((1 + 2) * 3 / (4 + 5))', 'calc(1)'],
            ['<number>', 'calc(calc(1 + 2) * 3 / calc(4 + 5))', 'calc(1)'],
            ['<length>', 'calc((3px + 2px) * 3)', 'calc(15px)'],
            // Nested math functions
            ['<number>', 'calc(min(1, 2) + sign(1))', 'calc(2)'],
            ['<number>', 'calc(min(1, 2) - sign(1))', 'calc(0)'],
            ['<number>', 'calc(min(1, 2) * sign(1))', 'calc(1)'],
            ['<number>', 'calc(min(1, 2) / sign(1))', 'calc(1)'],
            ['<length>', 'calc(min(1px, 2px) + 1px)', 'calc(2px)'],
            ['<length>', 'calc(min(1px, 2px) - 1px)', 'calc(0px)'],
            ['<length>', 'calc(min(1px, 2px) * sign(1px))', 'calc(1px)'],
            ['<length>', 'calc(min(1px, 2px) / sign(1px))', 'calc(1px)'],
            // Maximum 32 <calc-value>
            ['<number>', `calc(${[...Array(31)].reduce((n, _, i) => `${n} ${i < 15 ? '+' : '*'} 1`, '0')})`, 'calc(15)'],
            ['<number>', `calc(${[...Array(31)].reduce(n => `(${n})`, '1')})`, 'calc(1)'],
            ['<number>', `calc(${[...Array(31)].reduce(n => `calc(${n})`, '1')})`, 'calc(1)'],
            ['<number>{2}', `calc(${[...Array(31)].reduce(n => `${n} + 1`, '1')}) calc(1)`, 'calc(32) calc(1)'],
            ['<number>{2}', `calc(${[...Array(31)].reduce(n => `calc(${n})`, '1')}) calc(calc(1))`, 'calc(1) calc(1)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    it('parses and serializes calc() with operands of the same type and with different units', () => {
        const valid = [
            // <length>
            ['<length>', 'calc(1px + 1cm)', `calc(${(1 + (96 / 2.54)).toFixed(6)}px)`],
            ['<length>', 'calc(1px + 1mm)', `calc(${(1 + (96 / 2.54 / 10)).toFixed(6)}px)`],
            ['<length>', 'calc(1px + 1Q)', `calc(${(1 + (96 / 2.54 / 40)).toFixed(6)}px)`],
            ['<length>', 'calc(1px + 1in)', 'calc(97px)'],
            ['<length>', 'calc(1px + 1pc)', 'calc(17px)'],
            ['<length>', 'calc(1px + 1pt)', `calc(${(1 + (96 / 72)).toFixed(6)}px)`],
            ['<length>', 'calc(1em + 1px + 1em)', 'calc(2em + 1px)'],
            ['<length>', 'calc(1em - 1px - 1em)', 'calc(0em - 1px)'],
            ['<length>', 'calc(3em * 2 / 3)', 'calc(2em)'],
            ['<length>', 'calc(6em / 2 * 3)', 'calc(9em)'],
            ['<length>', 'calc(3 * 2em / 3)', 'calc(2em)'],
            ['<length>', 'calc(2 / 3 * 3em)', 'calc(2em)'],
            ['<length>', 'calc((1px + 1em) * 2)', 'calc(2em + 2px)'],
            ['<length>', 'calc((2px + 2em) / 2)', 'calc(1em + 1px)'],
            ['<length>', 'calc(min(1px, 1em))', 'min(1em, 1px)'],
            ['<length>', 'calc(min(1em, 2px) + 1px)', 'calc(1px + min(1em, 2px))'],
            ['<length>', 'calc(min(1em, 2px) - 1px)', 'calc(-1px + min(1em, 2px))'],
            ['<length>', 'calc(min(1em, 2px) * sign(1px))', 'min(1em, 2px)'],
            ['<length>', 'calc(min(1em, 2px) / sign(1px))', 'min(1em, 2px)'],
            // <length-percentage>
            ['<length-percentage>', 'calc(1px + 1%)', 'calc(1% + 1px)'],
            ['<length-percentage>', 'calc(1px - 1%)', 'calc(-1% + 1px)'],
            ['<length-percentage>', 'calc((1px + 1%) * 2)', 'calc(2% + 2px)'],
            ['<length-percentage>', 'calc((2px + 2%) / 2)', 'calc(1% + 1px)'],
            ['<length> | <percentage>', 'calc(1px + 1%)', 'calc(1% + 1px)'],
            ['a | <percentage> | b | <length> | c', 'calc(1px + 1%)', 'calc(1% + 1px)'],
            // <length> -> <number>
            ['<number>', 'calc(1cm / 5mm)', 'calc(2)'],
            ['<number>', 'calc(2 * 1px / 1em)', 'calc(2px / 1em)'],
            ['<number>', 'calc(2 * (1px + 1em) / 1em)', 'calc((2em + 2px) / 1em)'],
            ['<number>', 'calc(1px / 1em * 2)', 'calc(2px / 1em)'],
            ['<number>', 'calc((1px + 1em) / 1em * 2)', 'calc((2em + 2px) / 1em)'],
            // <angle>
            ['<angle>', 'calc(1deg + 200grad)', 'calc(181deg)'],
            ['<angle>', `calc(1deg + ${Math.PI.toString()}rad)`, 'calc(181deg)'],
            ['<angle>', 'calc(1deg + 0.5turn)', 'calc(181deg)'],
            // <frequency>
            ['<frequency>', 'calc(1khz + 1hz)', 'calc(1001hz)'],
            // <resolution>
            ['<resolution>', 'calc(1dppx + 1x)', 'calc(2dppx)'],
            ['<resolution>', 'calc(1dppx + 1dpcm)', `calc(${(1 + (96 / 2.54)).toFixed(6)}dppx)`],
            ['<resolution>', 'calc(1dppx + 1dpi)', 'calc(97dppx)'],
            // <time>
            ['<time>', 'calc(1s + 1ms)', 'calc(1.001s)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    it('parses and serializes calc() with operands whose numeric part is infinite or not a number', () => {
        const valid = [
            // <calc-constant>
            ['<number>', 'calc(Infinity)', 'calc(infinity)'],
            ['<number>', 'calc(0 - Infinity)', 'calc(-infinity)'],
            ['<number>', 'calc(nan)', 'calc(NaN)'],
            ['<number>', 'calc(0 - nan)', 'calc(NaN)'],
            // IEEE-754 semantics
            ['<number>', 'calc(1 / 0)', 'calc(infinity)'],
            ['<number>', 'calc(-1 / 0)', 'calc(-infinity)'],
            ['<number>', 'calc(1 / -0)', 'calc(infinity)'],
            ['<number>', 'calc(1 / (0 * -1))', 'calc(-infinity)'],
            // Partial simplification
            ['<length>', 'calc(1px + 2em / 0)', 'calc(infinity * 1px + 1px)'],
            ['<length>', 'calc((2px + 2em) * infinity)', 'calc(infinity * 1px + infinity * 1px)'],
            ['<length>', 'calc((2px + 2em) * NaN)', 'calc(NaN * 1px + NaN * 1px)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    it('parses and serializes calc() without performing range checking or rounding in a specified value', () => {
        expect(parse('<integer>', 'calc(1 / 2)')).toBe('calc(0.5)')
        expect(parse('<integer [0,∞]>', 'calc(1 * -1)')).toBe('calc(-1)')
    })
})
describe('<min()>, <max()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Maximum 32 <calc-value>
            ['<number>', `min(${[...Array(16)].map(() => '1 + 1').join(', ')}, 1)`],
            ['<number>', `min(${[...Array(16)].map(() => '((1))').join(', ')}, (1))`],
            // Maximum 32 arguments
            ['<number>', `min(${[...Array(33)].map(() => 1).join(', ')})`],
            // Arguments should resolve to the same type
            ['<number>', 'min(1px, 1)'],
            ['<number>', 'min(1px / 1px, 1)'],
            ['<length>', 'min(1, 1px)'],
            ['<number> | <percentage>', 'min(1%, 1)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<min()>', 'min(1)', false)).toEqual({
            name: 'min',
            representation: 'min(1)',
            type: new Set(['function', 'min()']),
            value: list([number(1, ['calc-value'])], ','),
        })
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Single argument
            ['<number>', 'min(0)', 'calc(0)'],
            ['<length>', 'min(1em)', 'calc(1em)'],
            ['<length-percentage>', 'min(1%)', 'calc(1%)'],
            // Multiple arguments
            ['<number>', 'min(0, 1)', 'calc(0)'],
            ['<number>', 'max(0, 1)', 'calc(1)'],
            ['<percentage>', 'min(0%, 1%)', 'calc(0%)'],
            ['<length>', 'min(1px, 1in)', 'calc(1px)'],
            ['<length>', 'max(1px, 1in)', 'calc(96px)'],
            ['<length>', 'min(1px, 1em)', 'min(1em, 1px)'],
            ['<length-percentage>', 'min(min(1px, 1%), 1px)', 'min(min(1%, 1px), 1px)'],
            // Maximum 32 <calc-value>
            ['<number>', `min(${[...Array(15)].map(() => '1 + 1').join(', ')}, 1)`, 'calc(1)'],
            ['<number>', `min(${[...Array(15)].map(() => '(1)').join(', ')}, (1))`, 'calc(1)'],
            // Maximum 32 arguments
            ['<number>', `min(${[...Array(32)].map((_, i) => i).join(', ')})`, 'calc(0)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<clamp()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Arguments should resolve to the same type
            ['<number>', 'clamp(1, 1px, 1)'],
            ['<number>', 'clamp(1, 1px / 1px, 1)'],
            ['<length>', 'clamp(1px, 1, 1px)'],
            ['<number> | <percentage>', 'clamp(1, 1%, 1)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<length>', 'clamp(0px, 1px, 2px)', 'calc(1px)'],
            ['<length>', 'clamp(0px, 2px, 1px)', 'calc(1px)'],
            ['<length>', 'clamp(1px, 0px, 2px)', 'calc(1px)'],
            ['<length>', 'clamp(1px, 2px, 0px)', 'calc(1px)'],
            ['<length>', 'clamp(0px, 1in, 2px)', 'calc(2px)'],
            ['<length>', 'clamp(0em, 1px, 2px)', 'clamp(0em, 1px, 2px)'],
            ['<length-percentage>', 'clamp(clamp(0%, 1px, 2px), 1px, 2px)', 'clamp(clamp(0%, 1px, 2px), 1px, 2px)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<round()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Arguments should resolve to the same type
            ['<number>', 'round(1px, 1)'],
            ['<number>', 'round(1px / 1px, 1)'],
            ['<length>', 'round(1, 1px)'],
            ['<number> | <percentage>', 'round(1%, 1)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<length>', 'round(1.1px, 1px)', 'calc(1px)'],
            ['<length>', 'round(1px, 2px)', 'calc(2px)'],
            ['<length>', 'round(up, 1.1px, 1px)', 'calc(2px)'],
            ['<length>', 'round(down, 1.9px, 1px)', 'calc(1px)'],
            ['<length>', 'round(to-zero, 1px, 2px)', 'calc(0px)'],
            ['<length>', 'round(to-zero, -1px, 2px)', 'calc(0px)'],
            ['<length>', 'round(nearest, 1cm, 1px)', 'calc(38px)'],
            ['<length>', 'round(1em, 1px)', 'round(1em, 1px)'],
            ['<length-percentage>', 'round(round(1%, 1px), 1px)', 'round(round(1%, 1px), 1px)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    it('parses and serializes round() resulting to 0⁻, 0⁺, NaN, or Infinity', () => {
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
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Arguments should resolve to the same type
            ['<number>', 'mod(1px, 1)'],
            ['<number>', 'mod(1px / 1px, 1)'],
            ['<length>', 'mod(1, 1px)'],
            ['<number> | <percentage>', 'mod(1%, 1)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<length>', 'mod(3px, 2px)', 'calc(1px)'],
            ['<length>', 'mod(3px, -2px)', 'calc(-1px)'],
            ['<length>', 'mod(-3px, 2px)', 'calc(1px)'],
            ['<length>', 'mod(1in, 5px)', 'calc(1px)'],
            ['<length>', 'mod(1em, 1px)', 'mod(1em, 1px)'],
            ['<length-percentage>', 'mod(mod(1%, 1px), 1px)', 'mod(mod(1%, 1px), 1px)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    it('parses and serializes mod() resulting to NaN or Infinity', () => {
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
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Arguments should resolve to the same type
            ['<number>', 'rem(1px, 1)'],
            ['<number>', 'rem(1px / 1px, 1)'],
            ['<number>', 'rem(1, 1px)'],
            ['<number> | <percentage>', 'rem(1%, 1)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<length>', 'rem(3px, 2px)', 'calc(1px)'],
            ['<length>', 'rem(3px, -2px)', 'calc(1px)'],
            ['<length>', 'rem(-3px, 2px)', 'calc(-1px)'],
            ['<length>', 'rem(1in, 5px)', 'calc(1px)'],
            ['<length>', 'rem(1em, 1px)', 'rem(1em, 1px)'],
            ['<length-percentage>', 'rem(rem(1%, 1px), 1px)', 'rem(rem(1%, 1px), 1px)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
    it('parses and serializes rem() resulting to NaN or Infinity', () => {
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
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number> or <angle>
        expect(parse('<number>', 'sin(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'sin(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['sin(45)', `calc(${+Math.sin(45).toFixed(6)})`],
            ['sin(45deg)', `calc(${+Math.sin(toRadians(45)).toFixed(6)})`],
            ['sin(1in / 2px)', `calc(${+Math.sin(48).toFixed(6)})`],
            ['sin(sin(90px / 2px))', `calc(${+Math.sin(Math.sin(45)).toFixed(6)})`],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
    it('parses and serializes sin() resulting to 0⁻', () => {
        // 0⁻ as input value results as is
        expect(parse('<number>', 'calc(1 / sin(-0))')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(1 / sin(0 * -1))')).toBe('calc(-infinity)')
    })
})
describe('<cos()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number> or <angle>
        expect(parse('<number>', 'cos(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'cos(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['cos(45)', `calc(${+Math.cos(45).toFixed(6)})`],
            ['cos(45deg)', `calc(${+Math.cos(toRadians(45)).toFixed(6)})`],
            ['cos(1in / 2px)', `calc(${+Math.cos(48).toFixed(6)})`],
            ['cos(cos(90px / 2px))', `calc(${+Math.cos(Math.cos(45)).toFixed(6)})`],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<tan()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number> or <angle>
        expect(parse('<number>', 'tan(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'tan(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['tan(45)', `calc(${+Math.tan(45).toFixed(6)})`],
            ['tan(45deg)', 'calc(1)'],
            ['tan(1in / 2px)', `calc(${+Math.tan(48).toFixed(6)})`],
            ['tan(tan(90px / 2px))', `calc(${+Math.tan(Math.tan(45)).toFixed(6)})`],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
    it('parses and serializes tan() resulting to 0⁻, Infinity, or -Infinity', () => {
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
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Argument should resolve to <number>
            ['<angle>', 'asin(1deg)'],
            ['<angle-percentage>', 'asin(1%)'],
            ['<angle>', 'asin(asin(1))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['asin(0.5)', 'calc(30deg)'],
            ['asin(1deg / 2deg)', 'calc(30deg)'],
            ['asin(1in / 192px)', 'calc(30deg)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<angle>', input)).toBe(expected))
    })
})
describe('<acos()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Argument should resolve to <number>
            ['<angle>', 'acos(1deg)'],
            ['<angle-percentage>', 'acos(1%)'],
            ['<angle>', 'acos(acos(1))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['acos(0.5)', 'calc(60deg)'],
            ['acos(1deg / 2deg)', 'calc(60deg)'],
            ['acos(1in / 192px)', 'calc(60deg)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<angle>', input)).toBe(expected))
    })
})
describe('<atan()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Argument should resolve to <number>
            ['<angle>', 'atan(1deg)'],
            ['<angle-percentage>', 'atan(1%)'],
            ['<angle>', 'atan(atan(1))'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['atan(0.5)', `calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`],
            ['atan(1deg / 2deg)', `calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`],
            ['atan(1in / 192px)', `calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`],
        ]
        valid.forEach(([input, expected]) => expect(parse('<angle>', input)).toBe(expected))
    })
})
describe('<atan2()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Arguments should resolve to the same type
            'atan2(1, 1%)',
            'atan2(1, 1px)',
            'atan2(1%, 1)',
            'atan2(1%, 1px)',
            'atan2(1px, 1)',
            'atan2(1px, 1%)',
            'atan2(1px / 1px, 1))',
        ]
        invalid.forEach(input => expect(parse('<angle>', input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<angle>', 'atan2(1, 1)', `calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`],
            ['<angle>', 'atan2(1px, 1px)', `calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`],
            ['<angle>', 'atan2(1in, 100px)', `calc(${+toDegrees(Math.atan2(96, 100)).toFixed(6)}deg)`],
            ['<angle>', 'atan2(1em, 1px)', 'atan2(1em, 1px)'],
            ['<angle-percentage>', 'atan2(atan2(1%, 1deg), 1deg)', 'atan2(atan2(1%, 1deg), 1deg)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<pow()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Argument should resolve to <number>s
            ['<number>', 'pow(1px, 1px)'],
            ['<number>', 'pow(1px, 1)'],
            ['<number>', 'pow(1, 1px)'],
            ['<number> | <percentage>', 'pow(1%, 1)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['pow(4, 2)', 'calc(16)'],
            ['pow(4px / 1px, 2)', 'calc(16)'],
            ['pow(1in / 24px, 2)', 'calc(16)'],
            ['pow(pow(1em / 1px, 1), 1)', 'pow(pow(1em / 1px, 1), 1)'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<sqrt()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should resolve to <number>
        expect(parse('<number>', 'sqrt(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'sqrt(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['sqrt(4)', 'calc(2)'],
            ['sqrt(4px / 1px)', 'calc(2)'],
            ['sqrt(1in / 1px)', `calc(${Math.sqrt(96).toFixed(6)})`],
            ['sqrt(sqrt(1em / 1px))', 'sqrt(sqrt(1em / 1px))'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<hypot()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Arguments should resolve to the same type
            ['<number>', 'hypot(1px, 1)'],
            ['<length>', 'hypot(1, 1px)'],
            ['<number>', 'hypot(1px / 1px, 1)'],
            ['<number> | <percentage>', 'hypot(1%, 1)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<number>', 'hypot(3, 4)', 'calc(5)'],
            ['<length>', 'hypot(3px, 4px)', 'calc(5px)'],
            ['<length>', 'hypot(1in, 72px)', 'calc(120px)'],
            ['<length>', 'hypot(1em, 1px)', 'hypot(1em, 1px)'],
            ['<length-percentage>', 'hypot(hypot(1%, 1px), 1px)', 'hypot(hypot(1%, 1px), 1px)'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<log()>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Argument should be <number>(s)
            ['<number>', 'log(1px, 1px)'],
            ['<number>', 'log(1px, 1)'],
            ['<number>', 'log(1, 1px)'],
            ['<number> | <percentage>', 'log(1%)'],
        ]
        invalid.forEach(([definition, input]) => expect(parse(definition, input, false)).toBeNull())
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['log(e)', 'calc(1)'],
            ['log(8, 2)', 'calc(3)'],
            ['log(96px / 12px, 2)', 'calc(3)'],
            ['log(1in / 12px, 2)', 'calc(3)'],
            ['log(log(1em / 1px))', 'log(log(1em / 1px))'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<exp()>', () => {
    it('fails to parse an invalid value', () => {
        // Argument should be <number>
        expect(parse('<number>', 'exp(1px)')).toBe('')
        expect(parse('<number> | <percentage>', 'exp(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['exp(1)', `calc(${Math.E.toFixed(6)})`],
            ['exp(1px / 1px)', `calc(${Math.E.toFixed(6)})`],
            ['exp(exp(1em / 1px))', 'exp(exp(1em / 1px))'],
        ]
        valid.forEach(([input, expected]) => expect(parse('<number>', input)).toBe(expected))
    })
})
describe('<abs()>', () => {
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<number>', 'abs(-1)', 'calc(1)'],
            ['<number>', 'abs(-infinity)', 'calc(infinity)'],
            ['<number> | <percentage>', 'abs(abs(-100%))', 'calc(1)'],
            ['<length>', 'abs(-1px)', 'calc(1px)'],
            ['<length>', 'abs(-1in)', 'calc(96px)'],
            ['<length>', 'abs(-1em)', 'abs(-1em)'],
            ['<length-percentage>', 'abs(abs(-1%))', 'abs(abs(-1%))'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})
describe('<sign()>', () => {
    it('parses and serializes a valid value', () => {
        const valid = [
            ['<number>', 'sign(-2)', 'calc(-1)'],
            ['<number>', 'sign(-infinity)', 'calc(-1)'],
            ['<number> | <percentage>', 'sign(sign(1%))', 'calc(1)'],
            ['<number>', 'sign(1px)', 'calc(1)'],
            ['<number>', 'sign(1in)', 'calc(1)'],
            ['<number>', 'sign(sign(1em))', 'sign(sign(1em))'],
        ]
        valid.forEach(([definition, input, expected]) => expect(parse(definition, input)).toBe(expected))
    })
})

describe('<basic-shape>', () => {
    it('parses a valid value', () => {

        const comma = omitted(',')
        const fillRule = omitted("<'fill-rule'>?")
        const position = omitted('[at <position>]?')
        const px = length(1, 'px', ['length-percentage'])
        const radius = omitted("[round <'border-radius'>]?")

        const valid = [
            ['circle()', {
                name: 'circle',
                representation: 'circle()',
                type: new Set(['function', 'circle()', 'basic-shape']),
                value: list([omitted('<shape-radius>?'), position]),
            }],
            ['ellipse()', {
                name: 'ellipse',
                representation: 'ellipse()',
                type: new Set(['function', 'ellipse()', 'basic-shape']),
                value: list([omitted('[<shape-radius>{2}]?'), position]),
            }],
            ['inset(1px)', {
                name: 'inset',
                representation: 'inset(1px)',
                type: new Set(['function', 'inset()', 'basic-shape-rect', 'basic-shape']),
                value: list([list([px]), radius]),
            }],
            ['path("m 1 0 v 1")', {
                name: 'path',
                representation: 'path("m 1 0 v 1")',
                type: new Set(['function', 'path()', 'basic-shape']),
                value: list([fillRule, comma, string('m 1 0 v 1')]),
            }],
            ['polygon(1px 1px)', {
                name: 'polygon',
                representation: 'polygon(1px 1px)',
                type: new Set(['function', 'polygon()', 'basic-shape']),
                value: list([fillRule, comma, list([list([px, px])], ',')]),
            }],
            ['rect(1px 1px 1px 1px)', {
                name: 'rect',
                representation: 'rect(1px 1px 1px 1px)',
                type: new Set(['function', 'rect()', 'basic-shape-rect', 'basic-shape']),
                value: list([list([px, px, px, px]), radius]),
            }],
            ['xywh(1px 1px 1px 1px)', {
                name: 'xywh',
                representation: 'xywh(1px 1px 1px 1px)',
                type: new Set(['function', 'xywh()', 'basic-shape-rect', 'basic-shape']),
                value: list([list([px, px]), list([px, px]), radius]),
            }],
        ]
        valid.forEach(([input, expected]) => expect(parse('<basic-shape>', input, false)).toEqual(expected))
    })
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
        invalid.forEach(input => expect(parse('<color>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const zero = number(0)
        const rgb = list([
            list([zero, zero, zero], ','),
            omitted(','),
            omitted('<alpha-value>?'),
        ])
        const valid = [
            ['red', keyword('red', ['named-color', 'absolute-color-base', 'color'])],
            ['#000', hash('000', ['hex-color', 'absolute-color-base', 'color'])],
            ['rgb(0, 0, 0)', {
                name: 'rgb',
                representation: 'rgb(0, 0, 0)',
                type: new Set(['function', 'legacy-rgb-syntax', 'rgb()', 'absolute-color-function', 'absolute-color-base', 'color']),
                value: rgb,
            }],
            ['rgba(0, 0, 0)', {
                name: 'rgba',
                representation: 'rgba(0, 0, 0)',
                type: new Set(['function', 'legacy-rgba-syntax', 'rgba()', 'absolute-color-function', 'absolute-color-base', 'color']),
                value: rgb,
            }],
        ]
        valid.forEach(([input, expected]) => expect(parse('<color>', input, false)).toEqual(expected))
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
            ['hsl(-540 -1 50 / -1)', 'rgba(128, 128, 128, 0)'],
            ['hsl(540 101 50 / 2)', 'rgb(0, 255, 255)'],
            ['hsl(-540deg -1% 50% / -1%)', 'rgba(128, 128, 128, 0)'],
            ['hsl(540deg 101% 50% / 101%)', 'rgb(0, 255, 255)'],
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
            // Map `none` to `0`
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
            ['lab(101 126 0 / 2)', 'lab(100 126 0)'],
            ['lab(0 0 0 / -1%)', 'lab(0 0 0 / 0)'],
            ['lab(0 0 0 / 101%)', 'lab(0 0 0)'],
            // Map <percentage> to <number>
            ['lab(-1% -101% 0% / -1%)', 'lab(0 -126.25 0 / 0)'],
            ['lab(101% 101% 0% / 101%)', 'lab(100 126.25 0)'],
            // Preserve `none`
            ['lab(none none none / none)', 'lab(none none none / none)'],
            // Math function
            ['lab(calc(-1) calc(-126) 0 / calc(-1))', 'lab(0 -126 0 / 0)'],
            ['lab(calc(101) calc(126) 0 / calc(2))', 'lab(100 126 0)'],
            ['lab(calc(-1%) calc(-101%) 0 / calc(-1%))', 'lab(0 -126.25 0 / 0)'],
            ['lab(calc(101%) calc(101%) 0 / calc(101%))', 'lab(100 126.25 0)'],
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
            ['lch(101 151 540 / 2)', 'lch(100 151 180)'],
            // Map <angle> and <percentage> to <number>
            ['lch(-1% -1% -540deg / -1%)', 'lch(0 0 180 / 0)'],
            ['lch(101% 101% 540deg / 101%)', 'lch(100 151.5 180)'],
            // Preserve `none`
            ['lch(none none none / none)', 'lch(none none none / none)'],
            // Math function
            ['lch(calc(-1) calc(-1) calc(-540) / calc(-1))', 'lch(0 0 180 / 0)'],
            ['lch(calc(101) calc(151) calc(540) / calc(2))', 'lch(100 151 180)'],
            ['lch(calc(-1%) calc(-1%) calc(-540deg) / calc(-1%))', 'lch(0 0 180 / 0)'],
            ['lch(calc(101%) calc(101%) calc(540deg) / calc(101%))', 'lch(100 151.5 180)'],
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
            ['oklab(1.1 0.41 0 / 2)', 'oklab(1 0.41 0)'],
            // Map <percentage> to <number>
            ['oklab(-1% -101% 0 / -1%)', 'oklab(0 -0.404 0 / 0)'],
            ['oklab(101% 101% 0 / 101%)', 'oklab(1 0.404 0)'],
            // Preserve `none`
            ['oklab(none none none / none)', 'oklab(none none none / none)'],
            // Math function
            ['oklab(calc(-1) calc(-0.41) calc(0) / calc(-1))', 'oklab(0 -0.41 0 / 0)'],
            ['oklab(calc(1.1) calc(0.41) calc(0) / calc(2))', 'oklab(1 0.41 0)'],
            ['oklab(calc(-1%) calc(-101%) calc(0) / calc(-1%))', 'oklab(0 -0.404 0 / 0)'],
            ['oklab(calc(101%) calc(101%) calc(0) / calc(101%))', 'oklab(1 0.404 0)'],
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
            ['oklch(1.1 0.41 540 / 2)', 'oklch(1 0.41 180)'],
            // Map <angle> and <percentage> to <number>
            ['oklch(-1% -1% -540deg / -1%)', 'oklch(0 0 180 / 0)'],
            ['oklch(101% 101% 540deg / 101%)', 'oklch(1 0.404 180)'],
            // Preserve `none`
            ['oklch(none none none / none)', 'oklch(none none none / none)'],
            // Math function
            ['oklch(calc(-1) calc(-1) calc(-540) / calc(-1))', 'oklch(0 0 180 / 0)'],
            ['oklch(calc(1.1) calc(0.41) calc(540) / calc(2))', 'oklch(1 0.41 180)'],
            ['oklch(calc(-1%) calc(-1%) calc(-540deg) / calc(-1%))', 'oklch(0 0 180 / 0)'],
            ['oklch(calc(101%) calc(101%) calc(540deg) / calc(101%))', 'oklch(1 0.404 180)'],
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
            // Out of range arguments
            ['color(srgb -1 -1 -1 / -1)', 'color(srgb -1 -1 -1 / 0)'],
            ['color(srgb 1.1 1.1 1.1 / 2)', 'color(srgb 1.1 1.1 1.1)'],
            // Map <percentage> to <number>
            ['color(srgb -1% -1% -1% / -1%)', 'color(srgb -0.01 -0.01 -0.01 / 0)'],
            ['color(srgb 101% 101% 101%)', 'color(srgb 1.01 1.01 1.01)'],
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
describe('<container-name>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            'and',
            'none',
            'not',
            'or',
        ]
        invalid.forEach(input => expect(parse('<container-name>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<container-name>', 'name', false)).toEqual(customIdent('name', ['container-name']))
    })
})
describe('<family-name>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // `font-family` in style rule, @font-face, @font-palette-values
            ['serif', { name: 'font-family', type: 'property', value: '<family-name>' }],
            // Prelude of `@font-feature-values`
            ['serif', '<family-name>', { name: 'font-feature-values', type: 'rule' }],
            // `voice-family` in style rule
            ['male', { name: 'voice-family', type: 'property', value: '<family-name>' }],
            ['preserve', { name: 'voice-family', type: 'property', value: '<family-name>' }],
        ]
        invalid.forEach(([input, definition, context]) => {
            if (context) {
                parser.contexts.push(context)
                expect(parse(definition, input, false)).toBeNull()
                parser.contexts.pop()
            } else {
                expect(parse(definition, input, false)).toBeNull()
            }
        })
    })
    it('parses a valid value', () => {
        expect(parse('<family-name>', '"serif"', false))
            .toEqual(string('serif', ['family-name']))
        expect(parse('<family-name>', 'the serif', false))
            .toEqual(list([customIdent('the'), customIdent('serif')], ' ', ['family-name']))
    })
})
describe('<feature-tag-value>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Less or more than 4 characters
            '"aaa"',
            '"aaaaa"',
            // Non-ASCII
            '"©aaa"',
        ]
        invalid.forEach(input => expect(parse('<feature-tag-value>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<feature-tag-value>', '"aaaa"', false))
            .toEqual(list([string('aaaa'), omitted('[<integer> | on | off]?')], ' ', ['feature-tag-value']))
    })
})
describe('<gradient>', () => {
    it('parses a valid value', () => {

        const red = keyword('red', ['named-color', 'absolute-color-base', 'color'])
        const cyan = keyword('cyan', ['named-color', 'absolute-color-base', 'color'])
        const angularStopList = list(
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
        )
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

        expect(parse('<gradient>', 'conic-gradient(red, cyan)', false)).toEqual({
            name: 'conic-gradient',
            representation: 'conic-gradient(red, cyan)',
            type: new Set(['function', 'conic-gradient()', 'gradient']),
            value: list([
                omitted('[[[from <angle> | <zero>]? [at <position>]?]! || <color-interpolation-method>]?'),
                omitted(','),
                angularStopList,
            ]),
        })
        expect(parse('<gradient>', 'linear-gradient(red, cyan)', false)).toEqual({
            name: 'linear-gradient',
            representation: 'linear-gradient(red, cyan)',
            type: new Set(['function', 'linear-gradient()', 'gradient']),
            value: list([
                omitted('[<angle> | <zero> | to <side-or-corner> || <color-interpolation-method>]?'),
                omitted(','),
                linearStopList,
            ]),
        })
        expect(parse('<gradient>', 'radial-gradient(red, cyan)', false)).toEqual({
            name: 'radial-gradient',
            representation: 'radial-gradient(red, cyan)',
            type: new Set(['function', 'radial-gradient()', 'gradient']),
            value: list([
                omitted('[[[<rg-ending-shape> || <rg-size>]? [at <position>]?]! || <color-interpolation-method>]?'),
                omitted(','),
                linearStopList,
            ]),
        })
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['CONIC-gradient(red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['LINEAR-gradient(red, cyan)', 'linear-gradient(red, cyan)'],
            ['RADIAL-gradient(red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            // Repeating gradients
            ['repeating-conic-gradient(red, cyan)', 'repeating-conic-gradient(at center center, red, cyan)'],
            ['repeating-linear-gradient(red, cyan)', 'repeating-linear-gradient(red, cyan)'],
            ['repeating-radial-gradient(red, cyan)', 'repeating-radial-gradient(at center center, red, cyan)'],
            // Legacy alias
            ['-webkit-linear-gradient(red, cyan)', 'linear-gradient(red, cyan)'],
            ['-webkit-repeating-linear-gradient(red, cyan)', 'repeating-linear-gradient(red, cyan)'],
            ['-webkit-radial-gradient(red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            ['-webkit-repeating-radial-gradient(red, cyan)', 'repeating-radial-gradient(at center center, red, cyan)'],
            // Simplified configuration
            ['conic-gradient(in oklab, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 0, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 0deg, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 0turn, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 360deg, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from calc(360deg), red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['linear-gradient(in oklab, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(180deg, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(1.5turn, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(to bottom, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(calc(540deg), red, cyan)', 'linear-gradient(red, cyan)'],
            ['radial-gradient(in oklab, red, cyan)', 'radial-gradient(at center center, red, cyan)'],
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
        ]
        valid.forEach(([input, expected]) => expect(parse('<gradient>', input)).toBe(expected))
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
        invalid.forEach(input => expect(parse('<grid-line>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<grid-line>', 'auto', false)).toEqual(keyword('auto', ['grid-line']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<grid-line>', 'span 1')).toBe('span 1')
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
        invalid.forEach(input => expect(parse('<id-selector>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<id-selector>', '#identifier', false))
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
describe('<image-set()>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<image-set()>', 'image-set(image-set("image.jpg" 1x))', false)).toBeNull()
        expect(parse('<image-set()>', 'image-set(cross-fade(image-set("image.jpg" 1x)))', false)).toBeNull()
    })
    it('parses a valid value', () => {

        const url = string('image.jpg')
        const resolution = dimension(1, 'x', ['resolution'])
        const format = omitted('type(<string>)')
        const option = list([url, list([resolution, format])], ' ', ['image-set-option'])

        expect(parse('<image-set()>', 'image-set("image.jpg" 1x)', false)).toEqual({
            name: 'image-set',
            representation: 'image-set("image.jpg" 1x)',
            type: new Set(['function', 'image-set()']),
            value: list([option], ','),
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<image-set()>', '-webkit-image-set("image.jpg" 1x)')).toBe('image-set("image.jpg" 1x)')
    })
})
describe('<keyframes-name>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<keyframes-name>', 'none', false)).toBeNull()
    })
    it('parses a valid value', () => {
        expect(parse('<keyframes-name>', 'animation', false)).toEqual(customIdent('animation', ['keyframes-name']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            ['""'],
            ['"none"'],
            ['"initial"'],
            ['"identifier"', 'identifier'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<keyframes-name>', input)).toBe(expected))
    })
})
describe('<keyframe-selector>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<keyframe-selector>', 'none', false)).toBeNull()
    })
    it('parses a valid value', () => {
        expect(parse('<keyframe-selector>', '0%', false)).toEqual(percentage(0, ['keyframe-selector']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<keyframe-selector>', 'from')).toBe('0%')
        expect(parse('<keyframe-selector>', 'to')).toBe('100%')
    })
})
describe('<layer-name>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            // Invalid whitespace
            'prefix .name',
            'prefix. name',
            // Invalid CSS-wide keyword
            'initial',
        ]
        invalid.forEach(input => expect(parse('<layer-name>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        const name = list([ident('prefix'), list([list([delimiter('.'), ident('name')], '')], '')], '', ['layer-name'])
        expect(parse('<layer-name>', 'prefix.name', false)).toEqual(name)
    })
})
describe('<line-names>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<line-names>', '[auto]', false)).toBeNull()
        expect(parse('<line-names>', '[span]', false)).toBeNull()
    })
    it('parses a valid value', () => {

        const name = customIdent('name')

        expect(parse('<line-names>', '[name name]', false)).toEqual({
            associatedToken: '[',
            representation: '[name name]',
            type: new Set(['simple-block', 'line-names']),
            value: list([name, name]),
        })
    })
})
describe('<media-type>', () => {
    it('fails to parse an invalid value', () => {
        const invalid = [
            'and',
            'not',
            'only',
            'or',
            'layer',
        ]
        invalid.forEach(input => expect(parse('<media-type>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {
        expect(parse('<media-type>', 'all', false)).toEqual(ident('all', ['media-type']))
    })
})
describe('<mf-comparison>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<mf-comparison>', '< =', false)).toBeNull()
        expect(parse('<mf-comparison>', '> =', false)).toBeNull()
    })
    it('parses a valid value', () => {
        expect(parse('<mf-comparison>', '<=', false))
            .toEqual(list([delimiter('<'), delimiter('=')], '', ['mf-lt', 'mf-comparison']))
    })
})
describe('<mf-name>', () => {
    it('parses a valid value', () => {
        const type = ['mf-name']
        const names = [
            ['width'],
            // Legacy alias
            ['-webkit-device-pixel-ratio', 'resolution'],
            ['-webkit-min-device-pixel-ratio', 'min-resolution'],
            ['-webkit-max-device-pixel-ratio', 'max-resolution'],
        ]
        names.forEach(([name, representation = name]) =>
            expect(parse('<mf-name>', name, false)).toEqual(ident(representation, type, name)))
    })
})
describe('<page-selector-list>', () => {
    it('fails to parse an invalid value', () => {
        // Invalid whitespace
        expect(parse('<page-selector-list>', 'toc :left', false)).toBeNull()
        expect(parse('<page-selector-list>', 'toc: left', false)).toBeNull()
    })
    it('parses a valid value', () => {

        const toc = ident('toc', ['ident-token'])
        const pseudoSelector = list([delimiter(':'), keyword('right')], '', ['pseudo-page'])
        const pseudoChain = list([pseudoSelector], '')
        const selector = list([toc, pseudoChain], '', ['page-selector'])
        const selectors = list([selector], ',', ['page-selector-list'])

        expect(parse('<page-selector-list>', 'toc:right', false)).toEqual(selectors)
    })
})
describe('<position>', () => {
    it('parses a valid value', () => {
        expect(parse('<position>', 'left', false))
            .toEqual(list([keyword('left'), omitted('top | center | bottom')], ' ', ['position']))
    })
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
describe('<ray()>', () => {
    it('parses a valid value', () => {
        expect(parse('<ray()>', 'ray(1deg)', false)).toEqual({
            name: 'ray',
            representation: 'ray(1deg)',
            type: new Set(['function', 'ray()']),
            value: list([angle(1, 'deg'), omitted('<ray-size>?'), omitted('contain?')]),
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<ray()>', 'ray(1deg closest-side)')).toBe('ray(1deg)')
        expect(parse('<ray()>', 'ray(1deg closest-side contain)')).toBe('ray(1deg closest-side contain)')
    })
})
describe('<shadow>', () => {
    it('parses a valid value', () => {
        expect(parse('<shadow>', '1px 1px', false)).toEqual(list(
            [
                omitted('<color>?'),
                list([
                    list([length(1, 'px'), length(1, 'px')]),
                    omitted('<length [0,∞]>?'),
                    omitted('<length>?'),
                ]),
                omitted('inset?'),
            ],
            ' ',
            ['shadow']))
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<shadow>', 'currentColor 1px 1px 0px 0px')).toBe('1px 1px')
    })
})
describe('<steps()>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<steps()>', 'steps(0)', false)).toBeNull()
        expect(parse('<steps()>', 'steps(1, jump-none)', false)).toBeNull()
    })
    it('parses a valid value', () => {
        expect(parse('<steps()>', 'steps(1)', false)).toEqual({
            name: 'steps',
            representation: 'steps(1)',
            type: new Set(['function', 'steps()']),
            value: list([number(1, ['integer']), omitted(','), omitted('<step-position>?')]),
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<steps()>', 'steps(1, end)')).toBe('steps(1)')
        expect(parse('<steps()>', 'steps(1, jump-end)')).toBe('steps(1)')
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
        invalid.forEach(input => expect(parse('<url-set>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {

        const url = string('image.jpg')
        const src = {
            name: 'src',
            representation: 'src("image.jpg")',
            type: new Set(['function', 'src()', 'url', 'image']),
            value: list([url, list()]),
        }
        const hints = list([resolution(1, 'x'), omitted('type(<string>)')])

        expect(parse('<url-set>', 'image-set(src("image.jpg") 1x)', false)).toEqual({
            name: 'image-set',
            representation: 'image-set(src("image.jpg") 1x)',
            type: new Set(['function', 'image-set()', 'url-set']),
            value: list([list([src, hints], ' ', ['image-set-option'])], ','),
        })
        expect(parse('<url-set>', 'image-set("image.jpg" 1x)', false)).toEqual({
            name: 'image-set',
            representation: 'image-set("image.jpg" 1x)',
            type: new Set(['function', 'image-set()', 'url-set']),
            value: list([list([url, hints], ' ', ['image-set-option'])], ','),
        })
    })
})

describe('<font-src-list>', () => {
    it('fails to parse an invalid value', () => {
        expect(parse('<font-src-list>', 'url(font.eotf) format("embedded-opentype")', false)).toBeNull()
    })
    it('parses a valid value', () => {

        const url = {
            representation: 'url(font.woff2)',
            type: new Set(['url-token', 'url()', 'url']),
            value: 'font.woff2',
        }
        const keywordFormat = {
            name: 'format',
            representation: 'format(woff2)',
            type: new Set(['function']),
            value: keyword('woff2', ['font-format']),
        }
        const stringFormat = {
            name: 'format',
            type: new Set(['function']),
            value: {
                type: new Set(['ident', 'keyword', 'font-format']),
                value: 'woff2',
            },
        }
        const tech = omitted('[tech(<font-tech>#)]?')

        expect(parse('<font-src-list>', 'url(font.woff2) format(woff2)', false))
            .toEqual(list([list([url, keywordFormat, tech], ' ', ['font-src'])], ',', ['font-src-list']))
        expect(parse('<font-src-list>', 'url(font.woff2) format("woff2")', false))
            .toEqual(list([list([url, stringFormat, tech], ' ', ['font-src'])], ',', ['font-src-list']))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Forgiving <font-src-list>
            ['url("font.woff2") format(woff2), url("font.eotf") format("embedded-opentype")', 'url("font.woff2") format(woff2)'],
            // Legacy <font-format>
            ['url("font.otc") format("collection")', 'url("font.otc") format(collection)'],
            ['url("font.otf") format("opentype")', 'url("font.otf") format(opentype)'],
            ['url("font.otf") format("opentype-variations")', 'url("font.otf") format(opentype) tech(variations)'],
            ['url("font.ttf") format("truetype")', 'url("font.ttf") format(truetype)'],
            ['url("font.ttf") format("truetype-variations")', 'url("font.ttf") format(truetype) tech(variations)'],
            ['url("font.woff") format("woff")', 'url("font.woff") format(woff)'],
            ['url("font.woff") format("woff-variations")', 'url("font.woff") format(woff) tech(variations)'],
            ['url("font.woff2") format("woff2")', 'url("font.woff2") format(woff2)'],
            ['url("font.woff2") format("woff2-variations")', 'url("font.woff2") format(woff2) tech(variations)'],
        ]
        valid.forEach(([actual, expected = actual]) => expect(parse('<font-src-list>', actual)).toBe(expected))
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
            // Invalid functional pseudo-class argument
            ':not(:host(:not(type > type))',
            ':host(:has(type))',
            ':host-context(:not(type > type))',
            ':host-context(:has(type))',
            '::slotted(:not(type > type))',
            '::slotted(:has(type))',
            ':has(:not(:has(type)))',
            // Invalid pseudo-element name
            '::hover',
            '::not',
            '::webkit-unknown()',
            // Invalid functional pseudo-element name
            '::hover()',
            '::not()',
            '::marker()',
            // Invalid pseudo-classing of pseudo-element
            '::before:current',
            '::before:not(:current)',
            '::before:not(type)',
            '::before:not(:not(type))',
            '::before:not(:hover > type)',
            '::before:lang(fr)',
            '::marker:empty',
            '::marker:not(:empty)',
            '::marker:has(:hover)',
            '::backdrop:only-child',
            '::backdrop:not(:only-child)',
            '::backdrop:nth-child(1)',
            // Invalid sub-pseudo-element
            '::marker::before',
            '::marker::slotted(type)',
            '::view-transition::view-transition-new(name)',
            // Invalid pseudo-element combination (no internal structure)
            '::before span',
            '::before + span',
            // https://github.com/w3c/csswg-drafts/issues/7503
            '::before + &',
        ]
        invalid.forEach(input => expect(parse('<selector-list>', input, false)).toBeNull())
    })
    it('parses a valid value', () => {

        const subclass = list([delimiter('.'), ident('class', ['ident-token'])], '', ['class-selector', 'subclass-selector'])
        const subclasses = list([subclass], '')
        const compound = list([omitted('<type-selector>?'), subclasses], '', ['compound-selector'])
        const complexUnit = list([compound, list([], '')], '', ['complex-selector-unit'])
        const complex = list([complexUnit, list()], ' ', ['complex-selector'])
        const selectors = list([complex], ',', ['complex-selector-list', 'selector-list'])

        expect(parse('<selector-list>', '.class', false)).toEqual(selectors)
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
            [':HOVER', ':hover'],
            [':DIR(ltr)', ':dir(ltr)'],
            [':-WEBKIT-AUTOFILL', ':autofill'],
            ['::BEFORE', '::before'],
            ['::HIGHLIGHT(name)', '::highlight(name)'],
            ['::-WEBKIT-UNKNOWN', '::-webkit-unknown'],
            // Forgiving pseudo-class selector
            [':is(::before, type, undeclared|type, ::after)', ':is(type)'],
            [':where(::before, type, undeclared|type, ::after)', ':where(type)'],
            [':is()'],
            [':where()'],
            // Pseudo-element as pseudo-class (back-compatibility with CSS2)
            [':after', '::after'],
            [':before', '::before'],
            [':first-letter', '::first-letter'],
            [':first-line', '::first-line'],
            // Pseudo-classing pseudo-element
            ['::before:hover'],
            ['::before:empty'],
            ['::before:not(:hover, :not(:focus, :empty))'],
            ['::marker:only-child'],
            ['::marker:nth-child(1)'],
            ['::marker:not(:only-child, :not(:nth-child(1)))'],
            ['::before:is(:hover, type, #id, .class, :root, :not(:root), :not(:focus))', '::before:is(:hover, :not(:focus))'],
            // Pseudo-classing structured pseudo-element (none are defined yet)
            // ['::structured:empty'],
            // ['::structured:has(span)'],
            // ['::structured-child:only-child'],
            // ['::structured-child:nth-child(1)'],
            // ['::structured-child:not(:only-child, :not(:nth-child(1)))'],
            // https://github.com/w3c/csswg-drafts/issues/8517
            ['::part(name):empty'],
            ['::part(name):has(span)'],
            ['::part(name):only-child'],
            ['::part(name):nth-child(1)'],
            ['::part(name):not(type, :not(:only-child, :nth-child(1)))'],
            // Sub-pseudo-element
            ['::after::marker'],
            ['::before::marker'],
            ['::first-letter::postfix'],
            ['::first-letter::prefix'],
            ['::before:hover::marker:focus', '::before:hover::marker:focus'],
            ['::view-transition::view-transition-group(name)'],
            ['::view-transition-group(name)::view-transition-image-pair(name)'],
            ['::view-transition-image-pair(name)::view-transition-old(name)'],
            ['::view-transition-image-pair(name)::view-transition-new(name)'],
            ['::part(name)::after'],
            ['::slotted(type)::after'],
            // Combination with structured pseudo-element (none are defined yet)
            // ['::structured span'],
            // Nesting selector
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
            ['& type + & type &, &'],
            ['type&'],
            ['#identifier&'],
            ['.subclass&'],
            ['[attr]&'],
            [':hover&'],
            ['::before&'],
            ['::before:hover&'],
            // Nesting-selector with structured pseudo-element (none are defined yet)
            // ['::structured &'],
            ['type &'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<selector-list>', input)).toBe(expected))
    })
})
describe('<media-query-list>', () => {
    it('parses a valid value', () => {

        const feature = {
            associatedToken: '(',
            representation: '(color)',
            type: new Set(['simple-block', 'media-feature', 'media-in-parens']),
            value: ident('color', ['mf-name', 'mf-boolean']),
        }
        const query = list([feature, list()], ' ', ['media-condition', 'media-query'])

        expect(parse('<media-query-list>', '(color)', false)).toEqual(list([query], ',', ['media-query-list']))
        expect(parse('<media-query-list>', '1', false)).toEqual(list([notAll], ',', ['media-query-list']))
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
