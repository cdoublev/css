
const { toDegrees, toRadians } = require('../lib/utils/math.js')
const createList = require('../lib/values/value.js')
const createOmitted = require('../lib/values/omitted.js')
const parseDefinition = require('../lib/parse/definition.js')
const { parseValue } = require('../lib/parse/value.js')
const { serializeValue } = require('../lib/serialize.js')

/**
 * @param {string} definition
 * @param {string} input
 * @param {boolean} [parseGlobals]
 * @returns {function|string}
 *
 * Helper to call `parseValue()` by feeding it the grammar to use for parsing
 * the given input, and to return the serialized string result instead of the
 * parsed component values.
 */
function parse(definition, input, parseGlobals = false, serialize = true) {
    const parsed = parseValue(input, '', definition, parseGlobals)
    if (parsed === null) {
        if (serialize) {
            return ''
        }
        return null
    }
    if (serialize) {
        return serializeValue({ input, value: parsed })
    }
    return parsed
}

// Helpers to create component values.
function keyword(value, location = -1, position) {
    const match = { type: new Set(['ident', 'keyword']), value }
    if (typeof location === 'number') {
        match.location = location
    }
    if (typeof position === 'number') {
        match.position = position
    }
    return match
}
function omitted(definition, location, position) {
    const node = parseDefinition(definition)
    const value = createOmitted(node)
    if (typeof location !== 'undefined') {
        value.location = location
    }
    if (typeof position !== 'undefined') {
        value.position = position
    }
    return value
}
function list(components = [], separator = ' ', location = -1, position) {
    const list = createList(components, separator)
    list.location = location
    if (position) {
        list.position = position
    }
    return list
}

/**
 * TODO: add generalized test case guaranteeing that the maximum call stack size
 * can not be exceeded by recursive backtracking, ie. it should support missing
 * tail call optimization.
 */
it('<final-bg-layer>', () => {
    const definition = "a || b || c || d || e || f || g"
    const input = 'a b d e c'
    debugger
    expect(parse(definition, input)).toBe('a b c d e')
})

/**
 * TODO: add generalized test case(s) guaranteeing that matching `a a b` against
 * `[b || a¹ || a²] | a a b` should result to `a¹`, `a²`, `b`, in this order.
 */
/**
 * TODO: add generalized test case to `backtracking`.
 * -> this is a minimum reproduction of an issue that was occurring while
 * parsing `background-property`, ie. a grammar containing `<bg-position>`
 * followed by another type
 * -> the issue was about ... ?
 */
it('[a | a b] || a', () => {
    expect(parse('[a | a b] || a', 'a b')).toBe('a b')
})
/**
 * TODO: add generalized test case to `backtracking`.
 * -> this is a minimum reproduction of an issue that was occurring while
 * backtracking to a function type that was assigned a single component instead
 * of a list as the result from parsing its arguments, which can not be used to
 * create a stream to use for parsing.
 * -> it has been temporarily fixed in `stream()` by wrapping a non-iterable in
 * an array but ideally this should be fixed by implementing an iterable data
 * structure for representing a single component value.
 */
it('fn(a) || a || b', () => {
    const definition = 'fn(a) || a || b'
    expect(parse(definition, 'fn(a) b a')).toBe('fn(a) a b')
})
/**
 * TODO: add generalized test case to `backtracking`.
 * -> the issue was occurring when `parseCombination()` was not trying to parse
 * the remaining node types after backtracking from the (outside) next grammar
 * to a type that could yield a different match result.
 */
it('a || b c? || d', () => {

    const definition = 'a || b c? || d'

    expect(parse(definition, 'a')).toBe('a')
    expect(parse(definition, 'a b')).toBe('a b')
    expect(parse(definition, 'a b c')).toBe('a b c')
    expect(parse(definition, 'a d')).toBe('a d')
    expect(parse(definition, 'a b c d')).toBe('a b c d')
    expect(parse(definition, 'b c')).toBe('b c')
    expect(parse(definition, 'b d')).toBe('b d')
    expect(parse(definition, 'b c d')).toBe('b c d')

    expect(parse(definition, 'c')).toBe('')
    expect(parse(definition, 'c b')).toBe('')
    expect(parse(definition, 'a c')).toBe('')
    expect(parse(definition, 'a c b')).toBe('')
})

describe('combined types', () => {
    it('parses a b', () => {
        const definition = 'a b'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a b')).toBe('a b')
    })
    it('parses a && b', () => {
        const definition = 'a && b'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'b a')).toBe('a b')
    })
    it('parses a || b', () => {
        const definition = 'a || b'
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'b a')).toBe('a b')
    })
    it('parses a | b', () => {
        const definition = 'a | b'
        expect(parse(definition, 'c')).toBe('')
        expect(parse(definition, 'a b')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'b')).toBe('b')
    })
})
describe('repeated types (serialized)', () => {
    it('parses a?', () => {
        const definition = 'a?'
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
    })
    it('parses a#', () => {
        const definition = 'a#'
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
    })
    it('parses a#?', () => {
        const definition = 'a a#?'
        expect(parse(definition, 'a, a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    it('parses a+#', () => {
        const definition = 'a+#'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('')
    })
    it('parses a+#?', () => {
        const definition = 'a a+#?'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
        expect(parse(definition, 'a, a')).toBe('')
        expect(parse(definition, 'a a, a a')).toBe('')
        expect(parse(definition, 'a a a, a')).toBe('')
    })
    it('parses a{2}', () => {
        const definition = 'a{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('')
        expect(parse(definition, 'a, a')).toBe('')
    })
    it('parses a{2,3}', () => {
        const definition = 'a{2,3}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a{2,∞}', () => {
        const definition = 'a{2,∞}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    it('parses a{2,}', () => {
        const definition = 'a{2,}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
    })
    it('parses <length-percentage>#', () => {
        const definition = '<length-percentage>#'
        expect(parse(definition, '1px 1px')).toBe('')
        expect(parse(definition, '1px')).toBe('1px')
        expect(parse(definition, '1px, 1px')).toBe('1px, 1px')
    })
})
describe('repeated types (data structure)', () => {

    it('parses a{2}', () => {
        const definition = 'a{2}'
        expect(parse(definition, 'a a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)]))
        expect(parse(definition, 'a', false, false)).toBeNull()
    })
    it('parses a{0,∞}', () => {
        const definition = 'a{0,∞}'
        expect(parse(definition, 'a a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)]))
        expect(parse(definition, '', false, false)).toEqual(createList([]))
    })
    it('parses a?', () => {
        const definition = 'a?'
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, '', false, false)).toEqual(omitted('a'))
    })
    it('parses a*', () => {
        const definition = 'a*'
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')]))
        expect(parse(definition, 'a a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)]))
        expect(parse(definition, '', false, false)).toEqual(createList([]))
    })
    it('parses a#', () => {
        const definition = 'a#'
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')], ','))
        expect(parse(definition, 'a, a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)], ','))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a b?]', () => {
        const definition = '[a b?]'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([keyword('a'), keyword('b', 0)]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a b?]?', () => {
        const definition = '[a b?]?'
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, '', false, false)).toEqual(omitted('a b?'))
    })
    it('parses [a b?]*', () => {
        const definition = '[a b?]*'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])]))
        expect(parse(definition, '', false, false)).toEqual(createList())
    })
    it('parses [a b?]#', () => {
        const definition = '[a b?]#'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])], ','))
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])], ','))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a? b?]', () => {
        const definition = '[a? b?]'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([keyword('a'), keyword('b', 0)]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, '', false, false)).toEqual(createList([omitted('a', -1), omitted('b', -1)]))
    })
    it('parses [a? b?]?', () => {
        const definition = '[a? b?]?'
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, 'b', false, false)).toEqual(list([omitted('a', -1), keyword('b')]))
        expect(parse(definition, '', false, false)).toEqual(list([omitted('a', -1), omitted('b', -1)]))
    })
    it('parses [a? b?]!', () => {
        const definition = '[a? b?]!'
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, 'b', false, false)).toEqual(list([omitted('a', -1), keyword('b')]))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a? b?]*', () => {
        const definition = '[a? b?]*'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])]))
        expect(parse(definition, 'b', false, false)).toEqual(createList([list([omitted('a', -1), keyword('b')])]))
        expect(parse(definition, '', false, false)).toEqual(createList([list([omitted('a', -1), omitted('b', -1)])]))
    })
    it('parses [a? b?]#', () => {
        const definition = '[a? b?]#'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])], ','))
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])], ','))
        expect(parse(definition, 'b', false, false)).toEqual(createList([list([omitted('a', -1), keyword('b')])], ','))
        expect(parse(definition, '', false, false)).toEqual(createList([list([omitted('a', -1), omitted('b', -1)])], ','))
    })
    it('parses [a b]', () => {
        const definition = '[a b]'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([keyword('a'), keyword('b', 0)]))
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a b]?', () => {
        const definition = '[a b]?'
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, '', false, false)).toEqual(omitted('a b'))
    })
    it('parses [a b]*', () => {
        const definition = '[a b]*'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])]))
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, '', false, false)).toEqual(createList([]))
    })
    it('parses [a b]#', () => {
        const definition = '[a b]#'
        expect(parse(definition, 'a b', false, false)).toEqual(createList(
            [list([keyword('a'), keyword('b', 0)])],
            ','))
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a | b]', () => {
        const definition = '[a | b]'
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a', null))
        expect(parse(definition, 'b', false, false)).toEqual(keyword('b', null))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a | b]?', () => {
        const definition = '[a | b]?'
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b', false, false)).toEqual(keyword('b'))
        expect(parse(definition, '', false, false)).toEqual(omitted('a | b'))
    })
    it('parses [a | b]*', () => {
        const definition = '[a | b]*'
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')]))
        expect(parse(definition, 'b', false, false)).toEqual(createList([keyword('b')]))
        expect(parse(definition, '', false, false)).toEqual(createList([]))
    })
    it('parses [a | b]#', () => {
        const definition = '[a | b]#'
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')], ','))
        expect(parse(definition, 'b', false, false)).toEqual(createList([keyword('b')], ','))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a | b b]', () => {
        const definition = '[a | b b]'
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a', null))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([keyword('b'), keyword('b', 0)]))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a | b b]?', () => {
        const definition = '[a | b b]?'
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b b', false, false)).toEqual(list([keyword('b'), keyword('b', 0)]))
        expect(parse(definition, '', false, false)).toEqual(omitted('a | b b'))
    })
    it('parses [a | b b]*', () => {
        const definition = '[a | b b]*'
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')]))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([list([keyword('b'), keyword('b', 0)])]))
        expect(parse(definition, '', false, false)).toEqual(createList([]))
    })
    it('parses [a | b b]#', () => {
        const definition = '[a | b b]#'
        expect(parse(definition, 'a', false, false)).toEqual(createList(
            [keyword('a')],
            ','))
        expect(parse(definition, 'b b', false, false)).toEqual(createList(
            [list([keyword('b'), keyword('b', 0)])],
            ','))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a || b]', () => {
        const definition = '[a || b]'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            keyword('b', 0, 1),
        ]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            omitted('b', -1, 1),
        ]))
        expect(parse(definition, 'b', false, false)).toEqual(createList([
            omitted('a', -1, 0),
            keyword('b', -1, 1),
        ]))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a || b]?', () => {
        const definition = '[a || b]?'
        expect(parse(definition, 'a b', false, false)).toEqual(list([
            keyword('a', -1, 0),
            keyword('b', 0, 1),
        ]))
        expect(parse(definition, 'a', false, false)).toEqual(list([
            keyword('a', -1, 0),
            omitted('b', -1, 1),
        ]))
        expect(parse(definition, 'b', false, false)).toEqual(list([
            omitted('a', -1, 0),
            keyword('b', -1, 1),
        ]))
        expect(parse(definition, '', false, false)).toEqual(omitted('a || b'))
    })
    it('parses [a || b]*', () => {
        const definition = '[a || b]*'
        expect(parse(definition, 'a b', false, false)).toEqual(createList([
            list([
                keyword('a', -1, 0),
                keyword('b', 0, 1),
            ]),
        ]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([
            list([
                keyword('a', -1, 0),
                omitted('b', -1, 1),
            ]),
        ]))
        expect(parse(definition, 'b', false, false)).toEqual(createList([
            list([
                omitted('a', -1, 0),
                keyword('b', -1, 1),
            ]),
        ]))
        expect(parse(definition, '', false, false)).toEqual(createList([]))
    })
    it('parses [a || b]#', () => {
        const definition = '[a || b]#'
        expect(parse(definition, 'a b, b', false, false)).toEqual(createList(
            [
                list([keyword('a', -1, 0), keyword('b', 0, 1)]),
                list([omitted('a', 3, 0), keyword('b', 3, 1)], ' ', 2),
            ],
            ','))
        expect(parse(definition, 'a b', false, false)).toEqual(createList(
            [
                list([keyword('a', -1, 0), keyword('b', 0, 1)]),
            ],
            ','))
        expect(parse(definition, 'a, b', false, false)).toEqual(createList(
            [
                list([keyword('a', -1, 0), omitted('b', -1, 1)]),
                list([omitted('a', 1, 0), keyword('b', 1, 1)], ' ', 0),
            ],
            ','))
        expect(parse(definition, 'a', false, false)).toEqual(createList(
            [
                list([keyword('a', -1, 0), omitted('b', -1, 1)]),
            ],
            ','))
        expect(parse(definition, 'b', false, false)).toEqual(createList(
            [
                list([omitted('a', -1, 0), keyword('b', -1, 1)]),
            ],
            ','))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a || b b]', () => {
        const definition = '[a || b b]'
        expect(parse(definition, 'a b b', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
        ]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            omitted('b b', -1, 1),
        ]))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([
            omitted('a', -1, 0),
            list([keyword('b', -1), keyword('b', 0)], ' ', -1, 1),
        ]))
        expect(parse(definition, '', false, false)).toBeNull()
    })
    it('parses [a || b b]?', () => {
        const definition = '[a || b b]?'
        expect(parse(definition, 'a b b', false, false)).toEqual(list(
            [
                keyword('a', -1, 0),
                list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
            ],
            ' ',
            -1))
        expect(parse(definition, 'a', false, false)).toEqual(list(
            [keyword('a', -1, 0), omitted('b b', -1, 1)],
            ' ',
            -1))
        expect(parse(definition, 'b b', false, false)).toEqual(list(
            [omitted('a', -1, 0), list([keyword('b'), keyword('b', 0)], ' ', -1, 1)],
            ' ',
            -1))
        expect(parse(definition, '', false, false)).toEqual(omitted('a || b b'))
    })
    it('parses [a || b b]*', () => {
        const definition = '[a || b b]*'
        expect(parse(definition, 'a b b', false, false)).toEqual(createList([
            list([
                keyword('a', -1, 0),
                list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
            ]),
        ]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([
            list([keyword('a', -1, 0), omitted('b b', -1, 1)]),
        ]))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([
            list([omitted('a', -1, 0), list([keyword('b', -1), keyword('b', 0)], ' ', -1, 1)]),
        ]))
        expect(parse(definition, '', false, false)).toEqual(createList([]))
    })
    it('parses [a || b b]#', () => {
        const definition = '[a || b b]#'
        expect(parse(definition, 'a b b', false, false)).toEqual(createList(
            [
                list([
                    keyword('a', -1, 0),
                    list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
                ]),
            ],
            ','))
        expect(parse(definition, 'a', false, false)).toEqual(createList(
            [
                list([keyword('a', -1, 0), omitted('b b', -1, 1)]),
            ],
            ','))
        expect(parse(definition, 'b b', false, false)).toEqual(createList(
            [
                list([
                    omitted('a', -1, 0),
                    list([keyword('b'), keyword('b', 0)], ' ', -1, 1),
                ]),
            ],
            ','))
        expect(parse(definition, '', false, false)).toBeNull()
    })
})
describe('backtracking', () => {
    // Simple backtracking (depth: 1)
    it('parses a | a a', () => {
        const definition = 'a | a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('')
    })
    it('parses a a | a', () => {
        const definition = 'a a | a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('')
    })
    it('parses a || a a', () => {
        const definition = 'a || a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a a || a', () => {
        const definition = 'a a || a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a && a a', () => {
        const definition = 'a && a a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a a && a', () => {
        const definition = 'a a && a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    // Simple backtracking (depth: 2)
    it('parses [a | a a]{2}', () => {
        const definition = '[a | a a]{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses [a | a a] a', () => {
        const definition = '[a | a a] a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    // TODO: cleanup and eventually complete the following cases
    it('parses a? a? | a a a', () => {
        const definition = 'a? a? | a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a a a | a? a?', () => {
        const definition = 'a a a | a? a?'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses [a? && a?] a', () => {
        const definition = '[a? && a?] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses [a? || a a] a', () => {
        const definition = '[a? || a a] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses [a? | b] a', () => {
        const definition = '[a? | a a] a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses [a | <length-percentage>] b', () => {
        const definition = '[a | <length-percentage>] b'
        expect(parse(definition, '1px a')).toBe('')
        expect(parse(definition, '1px')).toBe('')
        expect(parse(definition, '1px b')).toBe('1px b')
        expect(parse(definition, '1% b')).toBe('1% b')
    })
    it('parses <length-percentage>? <length-percentage>{2}', () => {
        const definition = '<length-percentage>? <length-percentage>{2}'
        expect(parse(definition, '1px')).toBe('')
        expect(parse(definition, '1px 1px')).toBe('1px 1px')
        expect(parse(definition, '1px 1px 1px')).toBe('1px 1px 1px')
    })
    it('parses <linear-color-stop> a', () => {
        const definition = '<linear-color-stop>, a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, '1px, a')).toBe('')
        expect(parse(definition, 'black, a')).toBe('black, a')
        expect(parse(definition, 'black 1px, a')).toBe('black 1px, a')
        expect(parse(definition, 'black 1px 1px, a')).toBe('black 1px 1px, a')
    })
    // Complex backtracking (depth: 1)
    it('parses a | a a | a a a', () => {
        const definition = 'a | a a | a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a || a a || a a a', () => {
        const definition = 'a || a a || a a a'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
    })
    it('parses a && a b && a b c', () => {
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
    it('parses [a | a a | a a a]{2}', () => {
        const definition = '[a | a a | a a a]{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
    })
    it('parses a [a | a a | a a a]', () => {
        const definition = 'a [a | a a | a a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses a [a || a a || a a a]', () => {
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
    it('parses a && [a | a a | a a a]', () => {
        const definition = 'a && [a | a a | a a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses a && [a || a a || a a a]', () => {
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
    it('parses a || [a | a a | a a a]', () => {
        const definition = 'a || [a | a a | a a a]'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses a | [a || a a || a a a]', () => {
        const definition = 'a | [a || a a || a a a]'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('a a a a a a')
        expect(parse(definition, 'a a a a a a a')).toBe('')
    })
    it('parses [a | a a | a a a] a', () => {
        const definition = '[a | a a | a a a] a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
    it('parses [a || a a || a a a] a', () => {
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
    it('parses [a | a a | a a a] [a | a a]', () => {
        const definition = '[a | a a | a a a] [a | a a]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('a a a a a')
        expect(parse(definition, 'a a a a a a')).toBe('')
    })
    // Complex backtracking (depth: 3)
    it('parses a | a [a | a a]', () => {
        const definition = 'a | a [a | a a]'
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a [a && [a | a a]]', () => {
        const definition = 'a [a && [a | a a]]'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('a a a a')
        expect(parse(definition, 'a a a a a')).toBe('')
    })
})
describe('comma-separated types', () => {
    // Comma-ellision rules apply
    it('parses a?, b', () => {

        const definition = 'a?, b'

        expect(parse(definition, 'a, b')).toBe('a, b')
        expect(parse(definition, 'a , b')).toBe('a, b')
        expect(parse(definition, 'a ,b')).toBe('a, b')
        expect(parse(definition, 'b')).toBe('b')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a b')).toBe('')
        expect(parse(definition, ', b')).toBe('')
        expect(parse(definition, 'a, b,')).toBe('')
    })
    it('parses a?, a', () => {

        const definition = 'a?, a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
    })
    it('parses a, b?', () => {

        const definition = 'a, b?'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, b')).toBe('a, b')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', b')).toBe('')
        expect(parse(definition, 'b')).toBe('')
        expect(parse(definition, 'a b')).toBe('')
    })
    it('parses a, a?', () => {

        const definition = 'a, a?'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
    })
    it('parses a, b?, c', () => {

        const definition = 'a, b?, c'

        expect(parse(definition, 'a, c')).toBe('a, c')
        expect(parse(definition, 'a, b, c')).toBe('a, b, c')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a, b')).toBe('')
        expect(parse(definition, 'b, c')).toBe('')
        expect(parse(definition, 'a b c')).toBe('')
        expect(parse(definition, 'a, , c')).toBe('')
    })
    it('parses a, a?, a', () => {

        const definition = 'a, a?, a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a, a,')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses a, b?, c?, d', () => {

        const definition = 'a, b?, c?, d'

        expect(parse(definition, 'a, d')).toBe('a, d')
        expect(parse(definition, 'a, b, d')).toBe('a, b, d')
        expect(parse(definition, 'a, c, d')).toBe('a, c, d')
        expect(parse(definition, 'a, b, c, d')).toBe('a, b, c, d')

        expect(parse(definition, 'a d')).toBe('')
        expect(parse(definition, 'a, b d')).toBe('')
        expect(parse(definition, 'a, c d')).toBe('')
        expect(parse(definition, 'a b c d')).toBe('')
        expect(parse(definition, 'a, b, c d')).toBe('')
        expect(parse(definition, 'a, b c, d')).toBe('')

    })
    it('parses a, a?, a?, a', () => {

        const definition = 'a, a?, a?, a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
        expect(parse(definition, 'a, a, a, a')).toBe('a, a, a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a, a, a a')).toBe('')
        expect(parse(definition, 'a, a a, a')).toBe('')
        expect(parse(definition, 'a, a, , a, a')).toBe('')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses a, [b?, a]', () => {

        const definition = 'a, [b?, a]'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, b, a')).toBe('a, b, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a, b a')).toBe('')
        expect(parse(definition, 'a b, a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses a, [a?, a]#', () => {

        const definition = 'a, [a?, a]#'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')
        expect(parse(definition, 'a, a, a, a')).toBe('a, a, a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses [a?, a?,] a', () => {

        const definition = '[a?, a?,] a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses a [, a? , a?]', () => {

        const definition = 'a [, a? , a?]'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a, a, , a')).toBe('')
    })
    it('parses [a, && b?,] a', () => {

        const definition = '[a, && b?,] a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, b, a')).toBe('a, b, a')
        expect(parse(definition, 'b, a, a')).toBe('a, b, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'b')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'b, a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a, b, , a')).toBe('')
    })
    it('parses a [, a && , b?]', () => {

        const definition = 'a [, a && , b?]'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, b')).toBe('a, a, b')
        expect(parse(definition, 'a, b, a')).toBe('a, a, b')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'b')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, b')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a, a, , b')).toBe('')
    })
    it('parses [a# ,]? a', () => {

        const definition = '[a# ,]? a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a, ,')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
    })
    // Comma-ellision rules do not apply
    it('parses a a?, a', () => {

        const definition = 'a a?, a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a,')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a a, , a')).toBe('')
    })
    it('parses a, a? a', () => {

        const definition = 'a, a? a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a, a, , a')).toBe('')
    })
    it('parses a [a?, a]', () => {

        const definition = 'a [a?, a]'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a a,')).toBe('')
        expect(parse(definition, 'a a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a a, , a')).toBe('')
    })
    it('parses a [, a? a]', () => {

        const definition = 'a [, a? a]'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses [a a?,] a', () => {

        const definition = '[a a?,] a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a a, , a')).toBe('')
    })
    it('parses [a b?, || c b?, || b?,]? d', () => {

        const definition = '[a b?, || c b?, || b?,] d'

        expect(parse(definition, 'a, d')).toBe('a, d')
        expect(parse(definition, 'a b, d')).toBe('a b, d')
        expect(parse(definition, 'b, d')).toBe('b, d')
        expect(parse(definition, 'a b, b, d')).toBe('a b, b, d')
        expect(parse(definition, 'd')).toBe('d')

        expect(parse(definition, 'a d')).toBe('')
        expect(parse(definition, 'a b d')).toBe('')
        expect(parse(definition, 'b d')).toBe('')
    })
})

describe('<var()>', () => {
    it('returns empty string for invalid var() values', () => {
        const invalid = [
            'var(--)', // `--` is reserved since 2018/07/04
            'var(, --property)',
            'var(1px, --property)',
            'vvar(--property)',
            'varr(--property)',
            'var(--prop erty)',
            'var(--, var(1px))',
        ]
        invalid.forEach(input => expect(parse('<var()>', input, true)).toBe(''))
    })
    it('parses a custom variable to a representation with the expected CSS type(s)', () => {
        expect(parse('<var()>', 'var(--prop)', true, false)).toEqual({
            name: 'var',
            type: new Set(['function', 'var()']),
            value: createList([
                {
                    location: -1,
                    type: new Set(['ident', 'custom-property-name']),
                    value: '--prop',
                },
                omitted(',', 0),
                {
                    location: 0,
                    omitted: true,
                    type: new Set(),
                    value: '<declaration-value>',
                },
            ]),
        })
    })
    it('parses and serializes a custom variable with fallback value(s)', () => {
        expect(parse('<var()>', 'var(--foo, 100px)', true)).toBe('var(--foo, 100px)')
        expect(parse('<var()>', 'var(--foo, var(--bar))', true)).toBe('var(--foo, var(--bar))')
        expect(parse('<var()>', 'var(--foo, calc(1 + 1))', true)).toBe('var(--foo, calc(1 + 1))')
    })
    it('parses and serializes a custom variable even when it might be resolved as invalid at user time', () => {
        const invalid = [
            'var(--prop',
            'var(--prop, )',
            'var(--prop)invalid',
            'invalid var(--prop)',
            'var(--prop) erty',
            'var(--prop, --prop erty)',
            'calc(var(--integer',
            'calc(var(--integer) + 1)',
        ]
        invalid.forEach(input => expect(parse('<var()>', input, true)).toBe(input))
    })
    it('parses and serializes a custom variable case-sensitively', () => {
        expect(parse('<var()>', 'VAr(--PROPerty)', true)).toBe('var(--PROPerty)')
    })
})

describe('keyword', () => {
    it('returns empty string for invalid keyword values', () => {
        const invalid = ['ninitial', 'initiall', '--initial', 'liquid']
        const valid = ['solid']
        invalid.forEach(input => expect(parse('solid', input, valid, true)).toBe(''))
    })
    it('parses a pre-defined keyword to a representation with the expected CSS types', () => {
        expect(parse('solid', 'solid', false, false)).toEqual({
            type: new Set(['ident', 'keyword']),
            value: 'solid',
        })
    })
    it('parses a keyword to a representation with the expected CSS types', () => {
        expect(parse('inherit', 'inherit', true, false)).toEqual({
            type: new Set(['ident', 'keyword', 'css-wide-keyword']),
            value: 'inherit',
        })
    })
    it('parses and serializes CSS wide keywords', () => {
        expect(parse('<keyword>', 'INItial', true)).toBe('initial')
        expect(parse('<keyword>', 'initial', true)).toBe('initial')
        expect(parse('<keyword>', 'inherit', true)).toBe('inherit')
        expect(parse('<keyword>', 'revert', true)).toBe('revert')
        expect(parse('<keyword>', 'unset', true)).toBe('unset')
    })
    it('parses and serializes predefined keywords', () => {
        expect(parse('solid', 'SOLId')).toBe('solid')
    })
    it('parses and serializes a keyword defined with a custom variable', () => {
        expect(parse('solid', 'var(--keyword)', true)).toBe('var(--keyword)')
    })
})
describe('<custom-ident>', () => {
    it('returns empty string for invalid custom identifier values', () => {
        const invalid = [
            'initial',
            'inherit',
            'unset',
            'default',
            '-',
            // Invalid ASCII character: !
            '!',
            'a!',
            '-!',
            '-a!',
            '--!',
            '--a!',
            // Invalid escape sequence (parse error)
            '\\\n',
            'a\\\n',
            '-\\\n',
            '-a\\\n',
            '--\\\n',
            '--a\\\n',
        ]
        invalid.forEach(input => expect(parse('<custom-ident>', input)).toBe(''))
    })
    it('parses a custom identifier to a representation with the expected CSS types', () => {
        expect(parse('<custom-ident>', 'myAnimationName', false, false)).toEqual({
            type: new Set(['ident', 'custom-ident']),
            value: 'myAnimationName',
        })
    })
    it('parses and serializes valid custom identifier values', () => {
        const valid = [
            ['_'],
            ['\\0 \\g', '�g'], // Valid escape sequences
            ['camelIdentifier'],
            ['snake_identifier'],
            ['kebab-identifier'],
            ['--'],
            ['--dashed-camelIdentifier'],
            ['--dashed-kebab-identifier'],
            ['--kebab-snake_identifier'],
            ['--\\0 \\g', '--�g'], // Valid escape sequences
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<custom-ident>', input)).toBe(expected))
    })
    it('parses and serializes a custom identifier defined with a custom variable', () => {
        expect(parse('<custom-ident>', 'var(--identifier)', true)).toBe('var(--identifier)')
    })
})
describe('<dashed-ident>', () => {
    it('returns empty string for invalid dashed identifier values', () => {
        expect(parse('<dashed-ident>', 'identifier')).toBe('')
    })
    it('parses a dashed identifier to a representation with the expected CSS types', () => {
        // TODO: a `<dashed-ident>` should also be a `<custom-ident>` (see CSS Values)
        expect(parse('<dashed-ident>', '--prop', false, false)).toEqual({
            type: new Set(['ident', /*'custom-ident', */'dashed-ident']),
            value: '--prop',
        })
    })
    it('parses and serializes a dashed identifier defined with a custom variable', () => {
        expect(parse('<dashed-ident>', 'var(--dashed-ident)', true)).toBe('var(--dashed-ident)')
    })
})
describe('<string>', () => {
    it('returns empty string for invalid string values', () => {
        const invalid = [
            'unquoted',
            '"string" unquoted',
            '"\n"', // Unquoted newline (results to a bad string and a newline)
        ]
        invalid.forEach(input => expect(parse('<string>', input)).toBe(''))
    })
    it('parses a string to a representation with the expected CSS type', () => {
        expect(parse('<string>', '"css"', false, false)).toEqual({
            type: new Set(['string']),
            value: 'css',
        })
    })
    it('parses and serializes bad strings to empty string', () => {
        const bad = ['"', "'", '"\\']
        bad.forEach(input => expect(parse('<string>', input)).toBe('""'))
    })
    it('parses and serializes an empty string', () => {
        expect(parse('<string>', '""')).toBe('""')
        expect(parse('<string>', '" "')).toBe('" "')
    })
    it('parses and serializes a string with an escape sequence', () => {
        expect(parse('<string>', '"\\1 "')).toBe('"\\u1"')
        expect(parse('<string>', '"\\a "')).toBe('"\\u10"')
        expect(parse('<string>', '"\\g"')).toBe('"g"')
        expect(parse('<string>', '"inline \\\nstring"')).toBe('"inline string"')
    })
    it('parses and serializes a string wrapped between double quotes', () => {
        expect(parse('<string>', "'string'")).toBe('"string"')
    })
    it('parses and serializes a string defined with a custom variable', () => {
        expect(parse('<string>', 'var(--string)', true)).toBe('var(--string)')
    })
})
describe('<url>', () => {
    it('returns empty string for invalid url values', () => {
        const invalid = [
            'uurl(valid.url)',
            'url(val)id.url)',
            'url(valid.url))',
            'src()',
            'src(unquoted.url)',
            'url(var(--url))', // Parsed to a bad url (parse error at open parenthesis) and close parenthesis
        ]
        invalid.forEach(input => expect(parse('<url>', input)).toBe(''))
    })
    it('parses an URL to a representation with the expected CSS type', () => {
        expect(parse('<url>', 'url(img.jpg)', false, false)).toEqual({
            type: new Set(['url-token', 'url']),
            value: 'img.jpg',
        })
        expect(parse('<url>', 'url("img.jpg")', false, false)).toEqual({
            name: 'url',
            type: new Set(['function', 'url()', 'url']),
            value: createList([
                { location: -1, type: new Set(['string']), value: 'img.jpg' },
                list([], ' ', 0),
            ]),
        })
        expect(parse('<url>', 'src("img.jpg")', false, false)).toEqual({
            name: 'src',
            type: new Set(['function', 'src()', 'url']),
            value: createList([
                { location: -1, type: new Set(['string']), value: 'img.jpg' },
                list([], ' ', 0),
            ]),
        })
    })
    it('parses and serializes bad URLs to empty URLs', () => {
        const bad = [
            // Unexpected whitepsace
            'url(val id.url)',    // '' in Chrome
            'url(val\nid.url)',   // '' in Chrome
            'url(val\tid.url)',   // '' in Chrome
            // Unexpected EOF, quote, open parenthesis, or whitespace (parse error)
            'url(',
            'url(val"id.url)',    // '' in Chrome
            "url(val'id.url)",    // '' in Chrome
            'url(val(id.url)',    // '' in Chrome
            // Invalid escape sequence (parse error)
            'url(val\\\nid.url)', // '' in Chrome
        ]
        bad.forEach(input => expect(parse('<url>', input)).toBe('url("")'))
    })
    it('parses and serializes a resource with an escape sequence', () => {
        expect(parse('<url>', 'url(\\1)')).toBe('url("\\u1")')
        expect(parse('<url>', 'url(\\a)')).toBe('url("\\u10")')
        expect(parse('<url>', 'url(\\g)')).toBe('url("g")')
    })
    it('parses and serializes a resource wrapped between double quotes', () => {
        expect(parse('<url>', 'url(file.jpg)')).toBe('url("file.jpg")')
        expect(parse('<url>', "url('file.jpg')")).toBe('url("file.jpg")')
        expect(parse('<url>', "src('file.jpg')")).toBe('src("file.jpg")')
    })
    it('parses and serializes an url defined with custom variable(s)', () => {
        expect(parse('<url>', 'var(--url)', true)).toBe('var(--url)')
        expect(parse('<url>', 'src(var(--url))', true)).toBe('src(var(--url))')
    })
})

describe('<zero>', () => {
    it('returns empty string for invalid zero values', () => {
        const invalid = ['string', '0px', '0%', 'calc(0)']
        invalid.forEach(input => expect(parse('<zero>', input)).toBe(''))
    })
    it('parses 0 to a representation with the expected CSS type', () => {
        expect(parse('<zero>', '0', false, false)).toEqual({
            type: new Set(['integer', 'zero']),
            value: 0,
        })
    })
    it('parses and serializes zero', () => {
        expect(parse('<zero>', '0')).toBe('0')
    })
})
describe('<integer>', () => {
    it('returns empty string for invalid integer values', () => {
        const invalid = ['string', '1px', '1.1', '.1', '1e-1', '-1', 'calc(1px)']
        invalid.forEach(input => expect(parse('<integer [0,∞]>', input)).toBe(''))
    })
    it('parses an integer to a representation with the expected CSS type', () => {
        expect(parse('<integer>', '0', false, false)).toEqual({
            type: new Set(['integer']),
            value: 0,
        })
        expect(parse('<integer>', '1', false, false)).toEqual({
            type: new Set(['integer']),
            value: 1,
        })
    })
    it('parses and serializes an integer with an exponent', () => {
        expect(parse('<integer>', '1e1')).toBe('10')
        expect(parse('<integer>', '1e+1')).toBe('10')
    })
    it('parses and serializes an integer defined with a custom variable', () => {
        expect(parse('<integer>', 'var(--integer)', true)).toBe('var(--integer)')
    })
})
describe('<number>', () => {
    it('returns empty string for invalid number values', () => {
        const invalid = ['string', '1px', '-1', 'calc(1px)']
        invalid.forEach(input => expect(parse('<number [0,∞]>', input)).toBe(''))
    })
    it('parses a number to a representation with the expected CSS type(s)', () => {
        expect(parse('<number>', '0', false, false)).toEqual({
            type: new Set(['integer', 'number']),
            value: 0,
        })
        expect(parse('<number>', '1', false, false)).toEqual({
            type: new Set(['integer', 'number']),
            value: 1,
        })
        expect(parse('<number>', '1.1', false, false)).toEqual({
            type: new Set(['number']),
            value: 1.1,
        })
    })
    it('parses and serializes a number with an exponent', () => {
        expect(parse('<number>', '1e1')).toBe('10')
        expect(parse('<number>', '1e+1')).toBe('10')
        expect(parse('<number>', '1e-1')).toBe('0.1')
    })
    it('parses and serializes a number without an integer part', () => {
        expect(parse('<number>', '.1')).toBe('0.1')
    })
    it('parses and serializes a number with a trailing decimal 0', () => {
        expect(parse('<number>', '0.10')).toBe('0.1')
    })
    it('parses and serializes a number defined with a custom variable', () => {
        expect(parse('<number>', 'var(--number)', true)).toBe('var(--number)')
    })
})
describe('<length>', () => {
    it('returns empty string for invalid length values', () => {
        const invalid = ['string', '0', '0px', '1', 'px', '1%', '#1px', '1px%', '-1px', 'calc(1)']
        invalid.forEach(input => expect(parse('<length [1,∞]>', input)).toBe(''))
    })
    it('parses a length to a representation with the expected CSS types', () => {
        expect(parse('<length>', '0', false, false)).toEqual({
            type: new Set(['dimension', 'length']),
            unit: 'px',
            value: 0,
        })
        expect(parse('<length>', '1px', false, false)).toEqual({
            type: new Set(['dimension', 'length']),
            unit: 'px',
            value: 1,
        })
    })
    it('parses and serializes a length with an exponent', () => {
        expect(parse('<length>', '1e1px')).toBe('10px')
        expect(parse('<length>', '1e+1px')).toBe('10px')
        expect(parse('<length>', '1e-1px')).toBe('0.1px')
    })
    it('parses and serializes a length without an integer part', () => {
        expect(parse('<length>', '.1px')).toBe('0.1px')
    })
    it('parses and serializes a length with a trailing decimal 0', () => {
        expect(parse('<length>', '0.10px')).toBe('0.1px')
    })
    it('parses and serializes a length case-insensitively', () => {
        expect(parse('<length>', '1Px')).toBe('1px')
        expect(parse('<length>', '1Q')).toBe('1q')
    })
    it('parses and serializes a length defined with a custom variable', () => {
        expect(parse('<length>', 'var(--length)', true)).toBe('var(--length)')
    })
})
describe('<percentage>', () => {
    it('returns empty string for invalid percentage values', () => {
        const invalid = ['string', '0', '1', '%', '1px', '#1%', '1%%', '-1%', 'calc(1)']
        invalid.forEach(input => expect(parse('<percentage [0,∞]>', input)).toBe(''))
    })
    it('parses a percentage to a representation with the expected CSS type', () => {
        expect(parse('<percentage>', '0%', false, false)).toEqual({
            type: new Set(['percentage']),
            unit: '%',
            value: 0,
        })
        expect(parse('<percentage>', '1%', false, false)).toEqual({
            type: new Set(['percentage']),
            unit: '%',
            value: 1,
        })
    })
    it('parses and serializes a percentage with an exponent', () => {
        expect(parse('<percentage>', '1e1%')).toBe('10%')
        expect(parse('<percentage>', '1e+1%')).toBe('10%')
        expect(parse('<percentage>', '1e-1%')).toBe('0.1%')
    })
    it('parses and serializes a percentage without an integer part', () => {
        expect(parse('<percentage>', '.1%')).toBe('0.1%')
    })
    it('parses and serializes a percentage with a trailing decimal 0', () => {
        expect(parse('<percentage>', '0.10%')).toBe('0.1%')
    })
    it('parses and serializes a percentage defined with a custom variable', () => {
        expect(parse('<percentage>', 'var(--percentage)', true)).toBe('var(--percentage)')
    })
})
describe('<length-percentage>', () => {
    it.todo('test')
})
describe('<alpha-value>', () => {
    it('returns empty string for invalid alpha-value values', () => {
        const invalid = ['string', '%', '1px', '1%%', 'calc(1px)', 'calc(0.5 + 50%)']
        invalid.forEach(input => expect(parse('<alpha-value>', input)).toBe(''))
    })
    it('parses an alpha value to a representation with the expected CSS types', () => {
        expect(parse('<alpha-value>', '0', false, false)).toEqual({
            type: new Set(['integer', 'number', 'alpha-value']),
            value: 0,
        })
        expect(parse('<alpha-value>', '1', false, false)).toEqual({
            type: new Set(['integer', 'number', 'alpha-value']),
            value: 1,
        })
        expect(parse('<alpha-value>', '1%', false, false)).toEqual({
            type: new Set(['percentage', 'alpha-value']),
            unit: '%',
            value: 1,
        })
    })
    it('parses and serializes an alpha value with an exponent', () => {
        expect(parse('<alpha-value>', '1e0')).toBe('1')
        expect(parse('<alpha-value>', '1e+0')).toBe('1')
        expect(parse('<alpha-value>', '1e-1')).toBe('0.1')
    })
    it('parses and serializes an alpha value without an integer part', () => {
        expect(parse('<alpha-value>', '.1')).toBe('0.1')
    })
    it('parses and serializes an alpha value with a trailing decimal 0', () => {
        expect(parse('<alpha-value>', '0.10')).toBe('0.1')
    })
    it('parses and serializes an alpha value authored as a percentage to a number', () => {
        expect(parse('<alpha-value>', '50%')).toBe('0.5')
    })
    it('parses and serializes an alpha value clamped between 0 and 1', () => {
        expect(parse('<alpha-value>', '-100%')).toBe('-1')
        expect(parse('<alpha-value>', '150%')).toBe('1.5')
        expect(parse('<alpha-value>', '-1')).toBe('-1')
        expect(parse('<alpha-value>', '1.5')).toBe('1.5')
    })
    it('parses and serializes an alpha value defined with a custom variable', () => {
        expect(parse('<alpha-value>', 'var(--alpha)', true)).toBe('var(--alpha)')
    })
})
describe('<angle>', () => {
    it('returns empty string for invalid angle values', () => {
        const invalid = ['string', '0', '0deg', '1', 'deg', '1px', '#1deg', '1degg', 'calc(1)']
        invalid.forEach(input => expect(parse('<angle [1,∞]>', input)).toBe(''))
    })
    it('parses an angle to a representation with the expected CSS types', () => {
        expect(parse('<angle>', '0', false, false)).toEqual({
            type: new Set(['dimension', 'angle']),
            unit: 'deg',
            value: 0,
        })
        expect(parse('<angle>', '1deg', false, false)).toEqual({
            type: new Set(['dimension', 'angle']),
            unit: 'deg',
            value: 1,
        })
    })
    it('parses and serializes an angle with an exponent', () => {
        expect(parse('<angle>', '1e1deg')).toBe('10deg')
        expect(parse('<angle>', '1e+1deg')).toBe('10deg')
        expect(parse('<angle>', '1e-1deg')).toBe('0.1deg')
    })
    it('parses and serializes an angle without an integer part', () => {
        expect(parse('<angle>', '.1deg')).toBe('0.1deg')
    })
    it('parses and serializes an angle with a trailing decimal 0', () => {
        expect(parse('<angle>', '0.10deg')).toBe('0.1deg')
    })
    it('parses and serializes an angle case-insensitively', () => {
        expect(parse('<angle>', '1DEg')).toBe('1deg')
    })
    it('parses and serializes an angle defined with a custom variable', () => {
        expect(parse('<angle>', 'var(--angle)', true)).toBe('var(--angle)')
    })
})
describe('<time>', () => {
    it('returns empty string for invalid time values', () => {
        const invalid = ['string', '0', '1', 's', '1px', '#1s', '1ss', '-1s', 'calc(1)']
        invalid.forEach(input => expect(parse('<time [0,∞]>', input)).toBe(''))
    })
    it('parses a time to a representation with the expected CSS types', () => {
        expect(parse('<time>', '1s', false, false)).toEqual({
            type: new Set(['dimension', 'time']),
            unit: 's',
            value: 1,
        })
    })
    it('parses and serializes a time with an exponent', () => {
        expect(parse('<time>', '1e1s')).toBe('10s')
        expect(parse('<time>', '1e+1s')).toBe('10s')
        expect(parse('<time>', '1e-1s')).toBe('0.1s')
    })
    it('parses and serializes a time without an integer part', () => {
        expect(parse('<time>', '.1s')).toBe('0.1s')
    })
    it('parses and serializes a time with a trailing decimal 0', () => {
        expect(parse('<time>', '0.10s')).toBe('0.1s')
    })
    it('parses and serializes a time case-insensitively', () => {
        expect(parse('<time>', '1Ms')).toBe('1ms')
    })
    it('parses and serializes a time defined with a custom variable', () => {
        expect(parse('<time>', 'var(--time)', true)).toBe('var(--time)')
    })
})

describe('<calc()>', () => {
    it('returns empty string for invalid calc() values', () => {

        // Whitespace is required on both sides of the + and - operators
        expect(parse('<number>', 'calc(1+ 1)')).toBe('')
        expect(parse('<number>', 'calc(1 +1)')).toBe('')
        expect(parse('<number>', 'calc(1- 1)')).toBe('')
        expect(parse('<number>', 'calc(1 -1)')).toBe('')

        // Maximum 32 `<calc-value>` or nested calculations
        expect(parse('<number>', `calc(${[...Array(32)].reduce(n => `${n} + 1`, '1')})`)).toBe('')
        expect(parse('<number>', `calc(${[...Array(33)].reduce(n => `calc(1 + ${n})`, '1')})`)).toBe('')
        expect(parse('<number>', `calc(${[...Array(33)].reduce(n => `1 + (${n})`, '1')})`)).toBe('')
        expect(parse('<number>', `calc(${[...Array(32)].reduce((n, _, i) => `${n} ${i < 15 ? '+' : '*'} 1`, '0')})`)).toBe('')

        // Type mismatch
        expect(parse('<number>', 'calc(keyword)')).toBe('')
        expect(parse('<number>', 'calc(1px)')).toBe('')
        expect(parse('<number>', 'calc(1%)')).toBe('')
        expect(parse('<length>', 'calc(1)')).toBe('')
        expect(parse('<length>', 'calc(1%)')).toBe('')
        expect(parse('<length>', 'calc(1px + 1s)')).toBe('')
        expect(parse('<length>', 'calc(1px + 1)')).toBe('')
        expect(parse('<length>', 'calc(1 + 1px)')).toBe('')
        expect(parse('<length>', 'calc(1px - 1)')).toBe('')
        expect(parse('<length>', 'calc(1 - 1px)')).toBe('')
        expect(parse('<length>', 'calc(1px * 1px)')).toBe('')
        expect(parse('<length>', 'calc(1px * 1em)')).toBe('')
        expect(parse('<length>', 'calc(1px / 1px)')).toBe('')
        expect(parse('<length>', 'calc(1px / 1em)')).toBe('')
        expect(parse('<length>', 'calc(1 / 1px)')).toBe('')
        expect(parse('<percentage>', 'calc(1% * 1%)')).toBe('')
        expect(parse('<percentage>', 'calc(1% / 1%)')).toBe('')
        expect(parse('<percentage>', 'calc(1 / 1%)')).toBe('')

        // "Unitless 0" <length> is not supported in math functions
        expect(parse('<length>', 'calc(1px + 0)')).toBe('')
        expect(parse('<length>', 'calc(0 + 1px)')).toBe('')
        expect(parse('<length>', 'calc(1px - 0)')).toBe('')
        expect(parse('<length>', 'calc(0 - 1px)')).toBe('')

        // A number and a percentage can not be combined
        expect(parse('<number> | <percentage>', 'calc(1 + 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'calc(1 - 1%)')).toBe('')
    })
    it('parses calc() to a representation with the expected CSS types', () => {
        // Raw calculations
        expect(parse('<calc()>', 'calc(1)', false, false)).toEqual({
            name: 'calc',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-sum']),
                value: [
                    {
                        location: -1,
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                ],
            },
        })
        expect(parse('<calc()>', 'calc(1 + 2)', false, false)).toEqual({
            name: 'calc',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-sum']),
                value: [
                    {
                        location: -1,
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        location: 2,
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 2,
                    },
                ],
            },
        })
        expect(parse('<calc()>', 'calc(1 - 2)', false, false)).toEqual({
            name: 'calc',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-sum']),
                value: [
                    {
                        location: -1,
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        type: new Set(['calc-negate']),
                        value: [
                            {
                                location: 2,
                                type: new Set(['integer', 'number', 'calc-value']),
                                value: 2,
                            },
                        ],
                    },
                ],
            },
        })
        expect(parse('<calc()>', 'calc(1 * 2)', false, false)).toEqual({
            name: 'calc',
            type: new Set(['function', 'calc()']),
            value: {
                location: -1,
                type: new Set(['calc-product']),
                value: [
                    {
                        location: -1,
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        location: 2,
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 2,
                    },
                ],
            },
        })
        expect(parse('<calc()>', 'calc(1 / 2)', false, false)).toEqual({
            name: 'calc',
            type: new Set(['function', 'calc()']),
            value: {
                location: -1,
                type: new Set(['calc-product']),
                value: [
                    {
                        location: -1,
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        type: new Set(['calc-invert']),
                        value: [
                            {
                                location: 2,
                                type: new Set(['integer', 'number', 'calc-value']),
                                value: 2,
                            },
                        ],
                    },
                ],
            },
        })
        // Resolved calculations
        expect(parse('<number>', 'calc(1)', false, false)).toEqual({
            name: 'calc',
            numericType: new Map(),
            type: new Set(['function', 'calc()', 'math-function']),
            value: {
                location: -1,
                range: undefined,
                round: false,
                type: new Set(['integer', 'number', 'calc-value']),
                value: 1,
            },
        })
        expect(parse('<number>', 'calc(1 + 2)', false, false)).toEqual({
            name: 'calc',
            numericType: new Map(),
            type: new Set(['function', 'calc()', 'math-function']),
            value: {
                location: -1,
                range: undefined,
                round: false,
                type: new Set(['integer', 'number', 'calc-value']),
                value: 3,
            },
        })
    })
    it('parses and serializes calc() with a single operand', () => {
        expect(parse('<number>', 'CALc(1)')).toBe('calc(1)')
        expect(parse('<length>', 'calc(1px)')).toBe('calc(1px)')
    })
    it('parses and serializes calc() operands of the same type and with the same unit', () => {
        expect(parse('<number>', 'calc(1 + 1 + 1 + 1)')).toBe('calc(4)')
        expect(parse('<number>', 'calc(4 - 1 - 1 - 1)')).toBe('calc(1)')
        expect(parse('<number>', 'calc(1 * 2 * 3 * 4)')).toBe('calc(24)')
        expect(parse('<number>', 'calc(42 / 2 / 3 / 7)')).toBe('calc(1)')
        expect(parse('<number>', 'calc(1 + 2 * 3 - 2 / 1)')).toBe('calc(5)')
        expect(parse('<length>', 'calc(1px + 1px)')).toBe('calc(2px)')
        expect(parse('<percentage>', 'calc(1% + 1%)')).toBe('calc(2%)')
        expect(parse('<number>', `calc(${[...Array(31)].reduce(n => `${n} + 1`, '1')})`)).toBe('calc(32)')
        expect(parse('<number>', `calc(${[...Array(32)].reduce(n => `calc(1 + ${n})`, '1')})`)).toBe('calc(33)')
        expect(parse('<number>', `calc(${[...Array(32)].reduce(n => `1 + (${n})`, '1')})`)).toBe('calc(33)')
        expect(parse('<number>', `calc(${[...Array(31)].reduce((n, _, i) => `${n} ${i < 15 ? '+' : '*'} 1`, '0')})`)).toBe('calc(15)')
    })
    it('parses and serializes calc() operands of the same type and with different units', () => {
        expect(parse('<angle>', 'calc(1deg + 200grad)')).toBe('calc(181deg)')
        expect(parse('<angle>', `calc(1deg + ${Math.PI.toString()}rad)`)).toBe('calc(181deg)')
        expect(parse('<angle>', 'calc(1deg + 0.5turn)')).toBe('calc(181deg)')
        expect(parse('<frequency>', 'calc(1khz + 1hz)')).toBe('calc(1001hz)')
        expect(parse('<length>', 'calc(1px + 1em)')).toBe('calc(1px + 1em)')
        expect(parse('<length>', 'calc(1px - 1em)')).toBe('calc(1px - 1em)')
        expect(parse('<length-percentage>', 'calc(1px + 1%)')).toBe('calc(1% + 1px)')
        expect(parse('<length-percentage>', 'calc(1px - 1%)')).toBe('calc(-1% + 1px)')
        expect(parse('<length>', 'calc(1px + 1cm)')).toBe(`calc(${(1 + (96 / 2.54)).toFixed(6)}px)`)
        expect(parse('<length>', 'calc(1px + 1mm)')).toBe(`calc(${(1 + (96 / 2.54 / 10)).toFixed(6)}px)`)
        expect(parse('<length>', 'calc(1px + 1Q)')).toBe(`calc(${(1 + (96 / 2.54 / 40)).toFixed(6)}px)`)
        expect(parse('<length>', 'calc(1px + 1in)')).toBe('calc(97px)')
        expect(parse('<length>', 'calc(1px + 1pc)')).toBe('calc(17px)')
        expect(parse('<length>', 'calc(1px + 1pt)')).toBe(`calc(${(1 + (96 / 72)).toFixed(6)}px)`)
        expect(parse('<resolution>', 'calc(1dppx + 1x)')).toBe('calc(2dppx)')
        expect(parse('<resolution>', 'calc(1dppx + 1dpcm)')).toBe(`calc(${(1 + (96 / 2.54)).toFixed(6)}dppx)`)
        expect(parse('<resolution>', 'calc(1dppx + 1dpi)')).toBe('calc(97dppx)')
        expect(parse('<time>', 'calc(1s + 1ms)')).toBe('calc(1.001s)')
    })
    it('parses and serializes calc() operands as a dimension or percentage multiplied/divided by a number', () => {
        expect(parse('<length>', 'calc(1px * 1)')).toBe('calc(1px)')
        expect(parse('<length>', 'calc(1 * 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'calc(1px / 1)')).toBe('calc(1px)')
        expect(parse('<percentage>', 'calc(100% * 1)')).toBe('calc(100%)')
        expect(parse('<percentage>', 'calc(100 * 1%)')).toBe('calc(100%)')
        expect(parse('<percentage>', 'calc(100% / 1)')).toBe('calc(100%)')
    })
    it('parses and serializes calc() operands as a percentage relative to another type', () => {
        expect(parse('<length-percentage>', 'calc(1%)')).toBe('calc(1%)')
        expect(parse('<length> | <percentage>', 'calc(1%)')).toBe('calc(1%)')
        expect(parse('<number> | <percentage>', 'calc(100%)')).toBe('calc(1)')
    })
    it('parses and serializes calc() that resolves to an infinite number or not to a number', () => {
        expect(parse('<number>', 'calc(Infinity)')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(1 / 0)')).toBe('calc(infinity)')
        expect(parse('<length>', 'calc(1px / 0)')).toBe('calc(infinity * 1px)')
        // NaN should resolve to Infinity when produced in a top-level calculation
        expect(parse('<number>', 'calc(nan)')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(0 / 0)')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(calc(NaN))')).toBe('calc(infinity)')
        expect(parse('<length>', 'calc(min(1em, 0px / 0) + 1px)')).toBe('calc(1px + min(1em, NaN * 1px))')
        expect(parse('<length>', 'calc(min(1em, 0px * NaN) + 1px)')).toBe('calc(1px + min(1em, NaN * 1px))')
    })
    it('parses and serializes calc() with nested calculations', () => {
        expect(parse('<number>', 'calc((1))')).toBe('calc(1)')
        expect(parse('<number>', `calc(${[...Array(32)].reduce(n => `calc(1 + ${n})`, '1')})`)).toBe('calc(33)')
        expect(parse('<number>', `calc(${[...Array(32)].reduce(n => `1 + (${n})`, '1')})`)).toBe('calc(33)')
        expect(parse('<number>', 'calc((1 + 2) * 3)')).toBe('calc(9)')
        expect(parse('<number>', 'calc(1 + 2 * (3 + 4))')).toBe('calc(15)')
        expect(parse('<number>', 'calc(calc(1 + 2) * 3 * calc(2 - 1))')).toBe('calc(9)')
        // Nested math functions simplified to a single numeric value
        expect(parse('<number>', 'calc(min(1, 2) + max(1, 2))')).toBe('calc(3)')
        expect(parse('<length>', 'calc(min(1px))')).toBe('calc(1px)')
        expect(parse('<length>', 'calc(min(1em))')).toBe('calc(1em)')
        expect(parse('<length-percentage>', 'calc(min(1%))')).toBe('calc(1%)')
        expect(parse('<length>', 'calc(min(1px) + 1px)')).toBe('calc(2px)')
        // Nested math functions not fully resolved
        expect(parse('<length>', 'calc(min(1px, 1em))')).toBe('min(1em, 1px)')
        expect(parse('<length>', 'calc(min(1px, 1em) + 1px)')).toBe('calc(1px + min(1em, 1px))')
    })
    it('parses and serializes calc() without performing range checking or rounding for specified values', () => {
        expect(parse('<integer>', 'calc(1 / 2)')).toBe('calc(0.5)')
        expect(parse('<integer [0,∞]>', 'calc(1 * -1)')).toBe('calc(-1)')
    })
    it('parses and serializes a calculation function defined with custom variable(s)', () => {
        expect(parse('<number>', 'calc(var(--number) + 1)', true)).toBe('calc(var(--number) + 1)')
    })
})
describe('<min()>, <max()>', () => {
    it('returns empty string for invalid min() or max() values', () => {
        // Maximum 32 `<calc-sum>` arguments
        expect(parse('<number>', `min(${[...Array(33)].map(() => 1).join(', ')})`)).toBe('')
        // Type mismatch
        expect(parse('<number>', 'min(1, keyword)')).toBe('')
        expect(parse('<number>', 'min(1px)')).toBe('')
        expect(parse('<number>', 'min(1%)')).toBe('')
        expect(parse('<length>', 'min(1)')).toBe('')
        expect(parse('<length>', 'min(1s)')).toBe('')
        expect(parse('<length>', 'min(1%)')).toBe('')
        expect(parse('<percentage>', 'min(1)')).toBe('')
        expect(parse('<percentage>', 'min(1px)')).toBe('')
        // "Unitless 0" <length> is not supported in math functions
        expect(parse('<length>', 'min(0)')).toBe('')
        // A number and a percentage can not be combined
        expect(parse('<number> | <percentage>', 'min(1%, 1)')).toBe('')
    })
    it('parses min() to a representation with the expected CSS types', () => {
        expect(parse('<min()>', 'min(1)', false, false)).toEqual({
            name: 'min',
            type: new Set(['function', 'min()']),
            value: createList([{
                // TODO: implement an appropriate data structure for component values
                location: -1,
                type: new Set(['calc-sum']),
                value: [{
                    location: -1,
                    type: new Set(['integer', 'number', 'calc-value']),
                    value: 1,
                }],
            }], ','),
        })
    })
    it('parses and serializes min() or max() with valid arguments', () => {
        expect(parse('<number>', 'min(0)')).toBe('calc(0)')
        expect(parse('<number>', 'min(0, 1)')).toBe('calc(0)')
        expect(parse('<number>', 'max(0, 1)')).toBe('calc(1)')
        expect(parse('<length>', 'min(0px, 1px)')).toBe('calc(0px)')
        expect(parse('<percentage>', 'min(0%, 1%)')).toBe('calc(0%)')
        expect(parse('<number>', `min(${[...Array(32)].map((_, i) => i).join(', ')})`)).toBe('calc(0)')
        expect(parse('<number>', `max(${[...Array(32)].map((_, i) => i).join(', ')})`)).toBe('calc(31)')
        expect(parse('<number>', 'min(0, 0 + 1)')).toBe('calc(0)')
        expect(parse('<length>', 'min(1px, 1cm)')).toBe('calc(1px)')
        expect(parse('<length>', 'max(100px, 1cm)')).toBe('calc(100px)')
        expect(parse('<length>', 'min(1em, 1px)')).toBe('min(1em, 1px)')
        expect(parse('<length-percentage>', 'min(1px, 1%)')).toBe('min(1%, 1px)')
    })
    it('parses and serializes min() or max() defined with custom variable(s)', () => {
        expect(parse('<integer>', 'min(var(--integer), 1)', true)).toBe('min(var(--integer), 1)')
    })
})
describe('<clamp()>', () => {
    it('returns empty string for invalid clamp() values', () => {
        expect(parse('<number>', 'clamp(1, 1)')).toBe('')
        expect(parse('<number>', 'clamp(1, 1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'clamp(1, keyword, 1)')).toBe('')
        expect(parse('<number>', 'clamp(1px, 2, 3)')).toBe('')
        expect(parse('<number>', 'clamp(1, 2px, 3)')).toBe('')
        expect(parse('<number>', 'clamp(1, 2, 3px)')).toBe('')
        // "Unitless 0" <length> is not supported in math functions
        expect(parse('<length>', 'clamp(0, 1px, 2px)')).toBe('')
        // A number and a percentage can not be combined
        expect(parse('<number> | <percentage>', 'clamp(0px, 1%, 2px)')).toBe('')
    })
    it('parses and serializes clamp() with valid arguments', () => {
        expect(parse('<number>', 'clamp(0, 1, 2)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(0, 2, 1)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(1, 0, 2)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(0, 1 * 1, 2)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(1, 2, 0)')).toBe('calc(1)')
        expect(parse('<length>', 'clamp(0px, 2px, 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'clamp(0px, 1em, 2px)')).toBe('clamp(0px, 1em, 2px)')
        expect(parse('<length-percentage>', 'clamp(1px, 1%, 2px)')).toBe('clamp(1px, 1%, 2px)')
    })
    it('parses and serializes clamp() defined with custom variable(s)', () => {
        expect(parse('<number>', 'clamp(var(--min), var(--number), var(--max))', true))
            .toBe('clamp(var(--min), var(--number), var(--max))')
    })
})
describe('<round()>', () => {
    it('returns empty string for invalid round() values', () => {
        expect(parse('<number>', 'round(nearest)')).toBe('')
        expect(parse('<number>', 'round(nearest, 1)')).toBe('')
        expect(parse('<number>', 'round(nearest, 1, 1, 1)')).toBe('')
        expect(parse('<number>', 'round(1, nearest, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'round(1px, 2)')).toBe('')
        expect(parse('<number>', 'round(1, 2px)')).toBe('')
        expect(parse('<length>', 'round(1px, 2)')).toBe('')
        expect(parse('<length>', 'round(1, 2px)')).toBe('')
        // "Unitless 0" <length> is not supported in math functions
        expect(parse('<length>', 'round(0 + 1px, 2px)')).toBe('')
        // A number and a percentage can not be combined
        expect(parse('<number> | <percentage>', 'round(1, 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'round(1%, 1)')).toBe('')
    })
    it('parses and serializes round() with valid arguments', () => {
        expect(parse('<length>', 'round(1.1px, 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'round(1px, 2px)')).toBe('calc(2px)')
        expect(parse('<length>', 'round(up, 1.1px, 1px)')).toBe('calc(2px)')
        expect(parse('<length>', 'round(down, 1.9px, 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'round(to-zero, 1px, 2px)')).toBe('calc(0px)')
        expect(parse('<length>', 'round(to-zero, -1px, 2px)')).toBe('calc(0px)')
        expect(parse('<length>', 'round(1em, 1px)')).toBe('round(1em, 1px)')
        expect(parse('<length-percentage>', 'round(1px, 1%)')).toBe('round(1px, 1%)')
        expect(parse('<length> | <percentage>', 'round(1px, 1%)')).toBe('round(1px, 1%)')
        expect(parse('<length> | <percentage>', 'round(1%, 1px)')).toBe('round(1%, 1px)')
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
    it('parses and serializes round() defined with custom variable(s)', () => {
        expect(parse('<number>', 'round(var(--strategy), var(--number), var(--step))', true))
            .toBe('round(var(--strategy), var(--number), var(--step))')
    })
})
describe('<mod()>', () => {
    it('returns empty string for invalid mod() values', () => {
        expect(parse('<number>', 'mod(1)')).toBe('')
        expect(parse('<number>', 'mod(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'mod(1, keyword)')).toBe('')
        expect(parse('<number>', 'mod(1px, 2)')).toBe('')
        expect(parse('<number>', 'mod(1, 2px)')).toBe('')
        expect(parse('<length>', 'mod(1px, 2)')).toBe('')
        expect(parse('<length>', 'mod(1, 2px)')).toBe('')
        // "Unitless 0" <length> is not supported in math functions
        expect(parse('<length>', 'mod(0 + 1px, 2px)')).toBe('')
        // A number and a percentage can not be combined
        expect(parse('<number> | <percentage>', 'mod(1, 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'mod(1%, 1)')).toBe('')
    })
    it('parses and serializes mod() with valid arguments', () => {
        expect(parse('<length>', 'mod(3px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'mod(3px, -2px)')).toBe('calc(-1px)')
        expect(parse('<length>', 'mod(-3px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'mod(1em, 1px)')).toBe('mod(1em, 1px)')
        expect(parse('<length-percentage>', 'mod(1px, 1%)')).toBe('mod(1px, 1%)')
        expect(parse('<length> | <percentage>', 'mod(1px, 1%)')).toBe('mod(1px, 1%)')
        expect(parse('<length> | <percentage>', 'mod(1%, 1px)')).toBe('mod(1%, 1px)')
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
    it('parses and serializes mod() defined with custom variable(s)', () => {
        expect(parse('<number>', 'mod(var(--number), var(--modulus))', true))
            .toBe('mod(var(--number), var(--modulus))')
    })
})
describe('<rem()>', () => {
    it('returns empty string for invalid rem() values', () => {
        expect(parse('<number>', 'rem(1)')).toBe('')
        expect(parse('<number>', 'rem(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'rem(1, keyword)')).toBe('')
        expect(parse('<number>', 'rem(1px, 2)')).toBe('')
        expect(parse('<number>', 'rem(1, 2px)')).toBe('')
        expect(parse('<length>', 'rem(1px, 2)')).toBe('')
        expect(parse('<length>', 'rem(1, 2px)')).toBe('')
        // "Unitless 0" <length> is not supported in math functions
        expect(parse('<length>', 'rem(0 + 1px, 2px)')).toBe('')
        // A number and a percentage can not be combined
        expect(parse('<number> | <percentage>', 'rem(1, 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'rem(1%, 1)')).toBe('')
    })
    it('parses and serializes rem() with valid arguments', () => {
        expect(parse('<length>', 'rem(3px, 2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'rem(3px, -2px)')).toBe('calc(1px)')
        expect(parse('<length>', 'rem(-3px, 2px)')).toBe('calc(-1px)')
        expect(parse('<length>', 'rem(1em, 1px)')).toBe('rem(1em, 1px)')
        expect(parse('<length-percentage>', 'rem(1px, 1%)')).toBe('rem(1px, 1%)')
        expect(parse('<length> | <percentage>', 'rem(1px, 1%)')).toBe('rem(1px, 1%)')
        expect(parse('<length> | <percentage>', 'rem(1%, 1px)')).toBe('rem(1%, 1px)')
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
    it('parses and serializes rem() defined with custom variable(s)', () => {
        expect(parse('<number>', 'rem(var(--number), var(--divisor))', true))
            .toBe('rem(var(--number), var(--divisor))')
    })
})
describe('<sin()>', () => {
    it('returns empty string for invalid sin() values', () => {
        expect(parse('<number>', 'sin(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'sin(keyword)')).toBe('')
        expect(parse('<number>', 'sin(1px)')).toBe('')
        expect(parse('<number>', 'sin(1%)')).toBe('')
        expect(parse('<number>', 'sin(1 + 1deg)')).toBe('')
        expect(parse('<number>', 'sin(1 - 1deg)')).toBe('')
    })
    it('parses and serializes sin() with a valid argument', () => {
        expect(parse('<number>', 'sin(45)')).toBe(`calc(${+Math.sin(45).toFixed(6)})`)
        expect(parse('<number>', 'sin(45deg)')).toBe(`calc(${+Math.sin(toRadians(45)).toFixed(6)})`)
    })
    it('parses and serializes sin() resulting to 0⁻', () => {
        // 0⁻ as input value results as is
        expect(parse('<number>', 'calc(-1 / sin(0 * -1))')).toBe('calc(infinity)')
    })
})
describe('<cos()>', () => {
    it('returns empty string for invalid cos() values', () => {
        expect(parse('<number>', 'cos(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'cos(keyword)')).toBe('')
        expect(parse('<number>', 'cos(1px)')).toBe('')
        expect(parse('<number>', 'cos(1%)')).toBe('')
        expect(parse('<number>', 'cos(1 + 1deg)')).toBe('')
        expect(parse('<number>', 'cos(1 - 1deg)')).toBe('')
    })
    it('parses and serializes cos() with a valid argument', () => {
        expect(parse('<number>', 'cos(45)')).toBe(`calc(${+Math.cos(45).toFixed(6)})`)
        expect(parse('<number>', 'cos(45deg)')).toBe(`calc(${+Math.cos(toRadians(45)).toFixed(6)})`)
    })
})
describe('<tan()>', () => {
    it('returns empty string for invalid tan() values', () => {
        expect(parse('<number>', 'tan(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'tan(keyword)')).toBe('')
        expect(parse('<number>', 'tan(1px)')).toBe('')
        expect(parse('<number>', 'tan(1%)')).toBe('')
        expect(parse('<number>', 'tan(1 + 1deg)')).toBe('')
        expect(parse('<number>', 'tan(1 - 1deg)')).toBe('')
    })
    it('parses and serializes tan() with a valid argument', () => {
        expect(parse('<number>', 'tan(45)')).toBe(`calc(${+Math.tan(45).toFixed(6)})`)
        expect(parse('<number>', 'tan(45deg)')).toBe('calc(1)')
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
    it('returns empty string for invalid asin() values', () => {
        expect(parse('<angle>', 'asin(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'asin(keyword)')).toBe('')
        expect(parse('<angle>', 'asin(1deg)')).toBe('')
        expect(parse('<angle>', 'asin(1px)')).toBe('')
        expect(parse('<angle>', 'asin(1%)')).toBe('')
    })
    it('parses and serializes asin() with a valid argument', () => {
        expect(parse('<angle>', 'asin(0.5)')).toBe('calc(30deg)')
    })
})
describe('<acos()>', () => {
    it('returns empty string for invalid acos() values', () => {
        expect(parse('<angle>', 'acos(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'acos(keyword)')).toBe('')
        expect(parse('<angle>', 'acos(1deg)')).toBe('')
        expect(parse('<angle>', 'acos(1px)')).toBe('')
        expect(parse('<angle>', 'acos(1%)')).toBe('')
    })
    it('parses and serializes acos() with a valid argument', () => {
        expect(parse('<angle>', 'acos(0.5)')).toBe('calc(60deg)')
    })
})
describe('<atan()>', () => {
    it('returns empty string for invalid atan() values', () => {
        expect(parse('<angle>', 'atan(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'atan(keyword)')).toBe('')
        expect(parse('<angle>', 'atan(1deg)')).toBe('')
        expect(parse('<angle>', 'atan(1px)')).toBe('')
        expect(parse('<angle>', 'atan(1%)')).toBe('')
    })
    it('parses and serializes atan() with a valid argument', () => {
        expect(parse('<angle>', 'atan(0.5)')).toBe(`calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`)
    })
})
describe('<atan2()>', () => {
    it('returns empty string for invalid atan2() values', () => {
        expect(parse('<angle>', 'atan2(1)')).toBe('')
        expect(parse('<angle>', 'atan2(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'atan2(1, keyword)')).toBe('')
        expect(parse('<angle>', 'atan2(1, 1px)')).toBe('')
        expect(parse('<angle>', 'atan2(1px, 1deg)')).toBe('')
    })
    it('parses and serializes atan2() with valid arguments', () => {
        expect(parse('<angle>', 'atan2(1, 1)')).toBe(`calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan2(1px, 1px)')).toBe(`calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan2(100px, 1cm)')).toBe(`calc(${+toDegrees(Math.atan2(100, 96 / 2.54)).toFixed(6)}deg)`)
    })
})
describe('<pow()>', () => {
    it('returns empty string for invalid pow() values', () => {
        expect(parse('<number>', 'pow(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'pow(1, keyword)')).toBe('')
        expect(parse('<number>', 'pow(1px, 1)')).toBe('')
        expect(parse('<number>', 'pow(1, 1px)')).toBe('')
        expect(parse('<number>', 'pow(1%, 1)')).toBe('')
        expect(parse('<number>', 'pow(1, 1%)')).toBe('')
    })
    it('parses and serializes pow()> with valid arguments', () => {
        expect(parse('<number>', 'pow(4, 2)')).toBe('calc(16)')
    })
})
describe('<sqrt()>', () => {
    it('returns empty string for invalid sqrt() values', () => {
        expect(parse('<number>', 'sqrt(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'sqrt(keyword)')).toBe('')
        expect(parse('<number>', 'sqrt(1px)')).toBe('')
        expect(parse('<number>', 'sqrt(1%)')).toBe('')
    })
    it('parses and serializes sqrt() with a valid argument', () => {
        expect(parse('<number>', 'sqrt(4)')).toBe('calc(2)')
    })
})
describe('<hypot()>', () => {
    it('returns empty string for invalid hypot() values', () => {
        expect(parse('<number>', 'hypot(1, keyword)')).toBe('')
        expect(parse('<number>', 'hypot(1, 1px)')).toBe('')
        expect(parse('<number>', 'hypot(1, 1%)')).toBe('')
        expect(parse('<number>', 'hypot(1px, 1px)')).toBe('')
        expect(parse('<length>', 'hypot(1, 1)')).toBe('')
        expect(parse('<percentage>', 'hypot(1, 1)')).toBe('')
    })
    it('parses and serializes hypot() with valid arguments', () => {
        expect(parse('<number>', 'hypot(3, 4)')).toBe('calc(5)')
    })
})
describe('<log()>', () => {
    it('returns empty string for invalid log() values', () => {
        expect(parse('<number>', 'log(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'log(keyword)')).toBe('')
        expect(parse('<number>', 'log(1, keyword)')).toBe('')
        expect(parse('<number>', 'log(1px)')).toBe('')
        expect(parse('<number>', 'log(1%)')).toBe('')
        expect(parse('<number>', 'log(1, 1px)')).toBe('')
        expect(parse('<number>', 'log(1, 1%)')).toBe('')
    })
    it('parses and serializes log() with valid arguments', () => {
        expect(parse('<number>', 'log(e)')).toBe('calc(1)')
        expect(parse('<number>', 'log(8, 2)')).toBe('calc(3)')
    })
})
describe('<exp()>', () => {
    it('returns empty string for invalid exp() values', () => {
        expect(parse('<number>', 'exp(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'exp(keyword)')).toBe('')
        expect(parse('<number>', 'exp(1px)')).toBe('')
        expect(parse('<number>', 'exp(1%)')).toBe('')
    })
    it('parses and serializes exp() with a valid argument', () => {
        expect(parse('<number>', 'exp(1)')).toBe(`calc(${Math.E.toFixed(6)})`)
    })
})
describe('<abs()>', () => {
    it('returns empty string for invalid abs() values', () => {
        expect(parse('<number>', 'abs(keyword)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'abs(1px)')).toBe('')
        expect(parse('<length>', 'abs(1)')).toBe('')
        expect(parse('<percentage>', 'abs(1)')).toBe('')
    })
    it('parses and serializes abs() with a valid argument', () => {
        expect(parse('<number>', 'abs(-1)')).toBe('calc(1)')
        expect(parse('<number>', 'abs(-infinity)')).toBe('calc(infinity)')
        expect(parse('<length>', 'abs(-1px)')).toBe('calc(1px)')
    })
})
describe('<sign()>', () => {
    it('returns empty string for invalid sign() values', () => {
        expect(parse('<number>', 'sign(keyword)')).toBe('')
        // Type mismatch
        expect(parse('<length>', 'sign(1px)')).toBe('')
        expect(parse('<length>', 'sign(1)')).toBe('')
        expect(parse('<percentage>', 'sign(1)')).toBe('')
    })
    it('parses and serializes sign() with a valid argument', () => {
        expect(parse('<number>', 'sign(-2)')).toBe('calc(-1)')
        expect(parse('<number>', 'sign(-infinity)')).toBe('calc(-1)')
        expect(parse('<number>', 'sign(2px)')).toBe('calc(1)')
    })
})

describe('<color>', () => {
    it('returns empty string for invalid color values', () => {
        const invalid = [
            'invalid',
            '#ffz',
            '#1',
            '#12',
            '#12345',
            '#1234567',
            '#123456789',
            'rg(0, 0, 0)',
            'rgbo(0, 0, 0)',
            'rgb(0, 0)',
            'rgb(0, 0 0)',
            'rgb(0%, 0, 0)',
            'rgb(0, 1deg, 1px)',
            'rgba(0, 1deg, 1px, invalid)',
            'rgba(0 0 0 0)',
            'rgba(0, 0, 0 / 0)',
            'hs(0, 0, 0)',
            'hslo(0, 0, 0)',
            'hsl(0, 0)',
            'hsl(0, 0 0)',
            'hsl(0%, 0, 0)',
            'hsl(0, 1deg, 1px)',
            'hsla(0, 1deg, 1px, invalid)',
            'hsla(0 0 0 0)',
            'hsla(0, 0, 0 / 0)',
        ]
        invalid.forEach(input => expect(parse('<color>', input)).toBe(''))
    })
    it('parses a color to a representation with the expected CSS types', () => {
        expect(parse('<color>', 'red', false, false)).toEqual({
            type: new Set(['ident', 'keyword', 'named-color', 'color']),
            value: 'red',
        })
        expect(parse('<color>', '#000', false, false)).toEqual({
            type: new Set(['hash-token', 'hex-color', 'color']),
            value: '000',
        })
        expect(parse('<color>', 'rgb(0, 0, 0)', false, false)).toEqual({
            name: 'rgb',
            type: new Set(['function', 'rgb()', 'color']),
            value: createList([
                list([
                    { location: -1, type: new Set(['integer', 'number']), value: 0 },
                    { location: 0, type: new Set(['integer', 'number']), value: 0 },
                    { location: 3, type: new Set(['integer', 'number']), value: 0 },
                ], ',', -1),
                omitted(',', 6),
                omitted('<alpha-value>', 6),
            ]),
        })
    })
    it('parses and serializes a color case-insensitively', () => {
        expect(parse('<color>', 'RED')).toBe('red')
        expect(parse('<color>', 'RGb(0, 0, 0)')).toBe('rgb(0, 0, 0)')
    })
    it('parses and serializes a color defined as an hexadecimal value to rgb()', () => {
        expect(parse('<color>', '#F00')).toBe('rgb(255, 0, 0)')
        expect(parse('<color>', '#0f06')).toBe('rgba(0, 255, 0, 0.4)')
        expect(parse('<color>', '#0000ff')).toBe('rgb(0, 0, 255)')
        expect(parse('<color>', '#ff00ffff')).toBe('rgb(255, 0, 255)')
        expect(parse('<color>', '#ff00ff66')).toBe('rgba(255, 0, 255, 0.4)')
    })
    it('parses and serializes a color defined as hsl() to rgb()', () => {
        expect(parse('<color>', 'hsl(0, 1%, 2%)')).toBe('rgb(5, 5, 5)')
    })
    it('parses and serializes a color defined as hsla() to rgb()', () => {
        expect(parse('<color>', 'hsla(0, 1%, 2%, 0.5)')).toBe('rgba(5, 5, 5, 0.5)')
    })
    it('parses and serializes a color with clamped rgb values', () => {
        expect(parse('<color>', 'rgb(300, 300, 300, 2)')).toBe('rgb(255, 255, 255)')
        expect(parse('<color>', 'rgb(-1, -1, -1, -1)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'hsl(540, 100%, 50%)')).toBe('rgb(0, 255, 255)')
        expect(parse('<color>', 'hsla(400, 200%, 200%, 200%)')).toBe('rgb(255, 255, 255)')
        expect(parse('<color>', 'hsla(-20deg, -1%, -1%, -1%)')).toBe('rgba(0, 0, 0, 0)')
    })
    it('parses and serializes a color by preserving the precision of rgb values', () => {
        expect(parse('<color>', 'rgba(245.5, 245.5, 0, 50.1%)')).toBe('rgba(246, 246, 0, 0.5)')
        expect(parse('<color>', 'rgba(245.5, 245.5, 0, 49.9%)')).toBe('rgba(246, 246, 0, 0.498)')
    })
    it('parses and serializes a color defined with math function(s)', () => {
        expect(parse('<color>', 'rgb(calc(255), min(0, 255), max(0, 255))')).toBe('rgb(255, 0, 255)')
        expect(parse('<color>', 'hsl(calc(300deg), min(0%, 100%), max(0%, 50%))')).toBe('rgb(128, 128, 128)')
    })
    it('parses and serializes a color defined with custom variable(s)', () => {
        expect(parse('<color>', 'rgb(var(--red', true)).toBe('rgb(var(--red')
        expect(parse('<color>', 'hsl(var(--red', true)).toBe('hsl(var(--red')
        expect(parse('<color>', 'rgb(var(--red), 0, 0, var(--alpha))', true)).toBe('rgb(var(--red), 0, 0, var(--alpha))')
        expect(parse('<color>', 'hsl(var(--hue), var(--sat), 0, var(--alpha))', true)).toBe('hsl(var(--hue), var(--sat), 0, var(--alpha))')
    })
})
describe('<image>', () => {
    it.todo('tests')
})
describe('<position>', () => {
    it('returns empty string for invalid position values', () => {
        const invalid = [
            'side',
            '1',
            // Invalid 2 values syntax
            'left left',
            'top top',
            'top 50%',
            '50% left',
            // Invalid 3 values syntax (not allowed)
            'left 0% top',
            'left 0% center',
            'left 0% 0%',
            'left top center',
            'left top 0%',
            // Invalid 4 values syntax
            'left center top 0%',
            'left 0% top center',
            'left 0% center 0%',
            'center 0% top 0%',
        ]
        invalid.forEach(input => expect(parse('<position>', input)).toBe(''))
    })
    it('parses and serializes a position defined with a single value', () => {
        expect(parse('<position>', 'center')).toBe('center center')
        expect(parse('<position>', '50%')).toBe('50% center')
        expect(parse('<position>', 'left')).toBe('left center')
        expect(parse('<position>', 'top')).toBe('center top')
        expect(parse('<position>', '0')).toBe('0px center')
        expect(parse('<position>', '0px')).toBe('0px center')
        expect(parse('<position>', '0%')).toBe('0% center')
    })
    it('parses and serializes a position defined with two values', () => {
        expect(parse('<position>', 'center center')).toBe('center center')
        expect(parse('<position>', 'center 50%')).toBe('center 50%')
        expect(parse('<position>', '50% center')).toBe('50% center')
        expect(parse('<position>', '50% 50%')).toBe('50% 50%')
        expect(parse('<position>', 'left top')).toBe('left top')
        expect(parse('<position>', 'left center')).toBe('left center')
        expect(parse('<position>', 'center left')).toBe('left center')
        expect(parse('<position>', 'top left')).toBe('left top')
        expect(parse('<position>', 'top center')).toBe('center top')
        expect(parse('<position>', 'center top')).toBe('center top')
        expect(parse('<position>', 'left 50%')).toBe('left 50%')
        expect(parse('<position>', '50% top')).toBe('50% top')
        expect(parse('<position>', '0 0')).toBe('0px 0px')
        expect(parse('<position>', '0px 0px')).toBe('0px 0px')
        expect(parse('<position>', '0% 0%')).toBe('0% 0%')
    })
    it('parses and serializes a position defined with four values', () => {
        expect(parse('<position>', 'left 0 top 0')).toBe('left 0px top 0px')
        expect(parse('<position>', 'left 0px top 0px')).toBe('left 0px top 0px')
        expect(parse('<position>', 'left 0% top 0%')).toBe('left 0% top 0%')
        expect(parse('<position>', 'left 1px top 1px')).toBe('left 1px top 1px')
        expect(parse('<position>', 'right 10% bottom 10%')).toBe('right 10% bottom 10%')
        expect(parse('<position>', 'right 1px bottom 1px')).toBe('right 1px bottom 1px')
        expect(parse('<position>', 'left 1px bottom 10%')).toBe('left 1px bottom 10%')
    })
    it('serializes keywords to lower case', () => {
        expect(parse('<position>', 'LEFt 0%')).toBe('left 0%')
    })
    it('parses and serializes a position defined with custom variable(s)', () => {
        expect(parse('<position>', 'var(--position)', true)).toBe('var(--position)')
        expect(parse('<position>', 'top var(--position)', true)).toBe('top var(--position)')
    })
})

describe('<basic-shape>', () => {
    it('returns empty string for invalid basic shape values', () => {
        const invalid = [
            'ccircle()',
            'circle())',
            'circle(0deg)',
            'circle(50% left top)',
            'circle() invalid-box',
            'circle() ellipse()',
            'eellipse()',
            'ellipse())',
            'ellipse(50%)',
            'ellipse(0deg 0deg)',
            'ellipse(50% 50% left top)',
            'ellipse() invalid-box',
            'ellipse() circle()',
            'inset()',
            'iinset(1px)',
            'inset(1px))',
            'inset(1deg)',
            'inset(1px) invalid-box',
            'inset(1px) circle()',
            'path()',
            'ppath("M0 0")',
            'path("M0 0h1"))',
            'path(nonone, "M0 0h1")',
            'path(nonzero "M0 0h1")',
            'path("M0 0") invalid-box',
            'path("M0 0") circle()',
            'polygon()',
            'ppolygon(10px 10px)',
            'polygon(10px 10px))',
            'polygon(nonone, 10px 10px)',
            'polygon(nozero 10px 10px)',
            'polygon(10px 10px 10px)',
            'polygon(10px 10px) invalid-box',
            'polygon(10px 10px) circle()',
        ]
        invalid.forEach(value => expect(parse('<basic-shape>', value)).toBe(''))
    })
    it('parses and serializes valid basic shape values', () => {
        // [input, expected = input]
        const valid = [
            ['circle()', 'circle(at center center)'],
            ['circle(1px)', 'circle(1px at center center)'],
            ['circle(at center)', 'circle(at center center)'],
            ['circle(at 50%)', 'circle(at 50% center)'],
            ['circle(at left 50% top 50%)', 'circle(at left 50% top 50%)'],
            ['ellipse()', 'ellipse(at center center)'],
            ['ellipse(1px 1px)', 'ellipse(1px 1px at center center)'],
            ['ellipse(at center)', 'ellipse(at center center)'],
            ['ellipse(at 50%)', 'ellipse(at 50% center)'],
            ['ellipse(at left 50% top 50%)', 'ellipse(at left 50% top 50%)'],
            ['inset(1px)'],
            ['inset(1px round 0)', 'inset(1px)'],
            ['inset(1px round calc(0px))', 'inset(1px)'],
            ['inset(1px round 0%)', 'inset(1px)'],
            ['inset(1px round calc(0%))', 'inset(1px)'],
            ['inset(1px 1px 1px 1px round 10% 10% 10% 10% / 10% 10% 10% 10%)', 'inset(1px round 10%)'],
            ['path("M0 0")'],
            ['path(nonzero, "M0 0")', 'path("M0 0")'],
            ['polygon(10px 10%)'],
            ['polygon(nonzero, 1px 1px)', 'polygon(1px 1px)'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<basic-shape>', input)).toBe(expected))
    })
    it('parses and serializes a basic shape defined with math function(s)', () => {
        // [input, expected = input]
        const input = [
            ['circle(calc(25% * 2) at calc(50% * 2))', 'circle(calc(50%) at calc(100%) center)'],
            ['ellipse(calc(25px * 2) calc(25px * 2) at calc(25px * 2))', 'ellipse(calc(50px) calc(50px) at calc(50px) center)'],
            ['inset(calc(5% * 2) round calc(1% * 2))', 'inset(calc(10%) round calc(2%))'],
            ['polygon(calc(1% + 1%) calc(1px + 1px))', 'polygon(calc(2%) calc(2px))'],
        ]
        input.forEach(([value, expected = value]) => expect(parse('<basic-shape>', value)).toBe(expected))
    })
    it('parses and serializes a basic shape defined with custom variable(s)', () => {
        const input = [
            'var(--shape)',
            'circle(var(--radius))',
            'circle(var(--radius)) var(--geometry-box)',
            'ellipse(var(--radii))',
            'inset(var(--radii))',
            'path(var(--definition))',
            'polygon(var(--vertices))',
        ]
        input.forEach(value => expect(parse('<basic-shape>', value, true)).toBe(value))
    })
})
describe('<gradient>', () => {
    it('returns empty string for invalid gradient values', () => {
        const invalid = [
            'string',
            '1',
            'invalid-gradient(red, cyan)',
            'invalid-conic-gradient(red, cyan)',
            'conic-gradient()',
            'conic-gradient( , red, cyan)',
            'conic-gradient(0, cyan)',
            'conic-gradient(from , red, cyan)',
            'conic-gradient(from 1, red, cyan)',
            'conic-gradient(from 90deg 120deg, red, cyan)',
            'conic-gradient(at , red, cyan)',
            'conic-gradient(at 1, red, cyan)',
            'conic-gradient(at left center center, red, cyan)',
            'conic-gradient(red, 0%, 0%, cyan)',
            'conic-gradient(cyan 0deg)',
            'linear-gradient(0, cyan)',
            'linear-gradient(1, red, cyan)',
            'linear-gradient(90deg 120deg, red, cyan)',
            'linear-gradient(at , red, cyan)',
            'linear-gradient(at 1, red, cyan)',
            'linear-gradient(at left center center, red, cyan)',
            'linear-gradient(red, 0%, 0%, cyan)',
            'linear-gradient(cyan 0%)',
            'radial-gradient(0, cyan)',
            'radial-gradient(1, red, cyan)',
            'radial-gradient(circle 50%, red, cyan)',
            'radial-gradient(circle 100px 120px, red, cyan)',
            'radial-gradient(ellipse 50%, red, cyan)',
            'radial-gradient(50% closest-corner, red, cyan)',
            'radial-gradient(closest-corner 50%, red, cyan)',
            'radial-gradient(at , red, cyan)',
            'radial-gradient(at 1, red, cyan)',
            'radial-gradient(at left center center, red, cyan)',
            'radial-gradient(red, 0%, 0%, cyan)',
            'radial-gradient(cyan 0%)',
        ]
        invalid.forEach(input => expect(parse('<gradient>', input)).toBe(''))
    })
    it('parses and serializes a conic gradient with valid arguments', () => {
        [
            // [input, expected]
            ['conic-gradient(red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['CONIc-gradient(red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['repeating-conic-gradient(red, cyan)', 'repeating-conic-gradient(at center center, red, cyan)'],
            // Various gradient configurations
            ['conic-gradient(at top, red, cyan)', 'conic-gradient(at center top, red, cyan)'],
            ['conic-gradient(at left, red, cyan)', 'conic-gradient(at left center, red, cyan)'],
            ['conic-gradient(at center, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(at top left, red, cyan)', 'conic-gradient(at left top, red, cyan)'],
            ['conic-gradient(at 0%, red, cyan)', 'conic-gradient(at 0% center, red, cyan)'],
            ['conic-gradient(at center 100%, red, cyan)', 'conic-gradient(at center 100%, red, cyan)'],
            ['conic-gradient(from 90deg at left center, red, cyan)', 'conic-gradient(from 90deg at left center, red, cyan)'],
            // Simplified gradient configurations
            ['conic-gradient(from 0, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 0deg, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 0turn, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from calc(0deg), red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 360deg, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            ['conic-gradient(from 1turn, red, cyan)', 'conic-gradient(at center center, red, cyan)'],
            // Color stop list
            ['conic-gradient(red, 50%, cyan)', 'conic-gradient(at center center, red, 50%, cyan)'],
            ['conic-gradient(red 0 0, 0, cyan)', 'conic-gradient(at center center, red 0deg, red 0deg, 0deg, cyan)'],
            ['conic-gradient(red 0deg 1turn, 50%, cyan)', 'conic-gradient(at center center, red 0deg, red 1turn, 50%, cyan)'],
            ['conic-gradient(red -1% 200%, 540deg, cyan)', 'conic-gradient(at center center, red -1%, red 200%, 540deg, cyan)'],
            // Implicit color stops
            ['conic-gradient(red 0deg 180deg)', 'conic-gradient(at center center, red 0deg, red 180deg)'],
        ].forEach(([input, expected]) => expect(parse('<gradient>', input)).toBe(expected))
    })
    it('parses and serializes a linear gradient with valid arguments', () => {
        [
            // [input, expected]
            ['linear-gradient(red, cyan)', 'linear-gradient(red, cyan)'],
            ['LINEAr-gradient(red, cyan)', 'linear-gradient(red, cyan)'],
            ['repeating-linear-gradient(red, cyan)', 'repeating-linear-gradient(red, cyan)'],
            // Various gradient configurations
            ['linear-gradient(0, red, cyan)', 'linear-gradient(0deg, red, cyan)'],
            ['linear-gradient(1turn, red, cyan)', 'linear-gradient(1turn, red, cyan)'],
            ['linear-gradient(to top, red, cyan)', 'linear-gradient(to top, red, cyan)'],
            ['linear-gradient(to left, red, cyan)', 'linear-gradient(to left, red, cyan)'],
            ['linear-gradient(to top left, red, cyan)', 'linear-gradient(to left top, red, cyan)'],
            // Simplified gradient configurations
            ['linear-gradient(180deg, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(1.5turn, red, cyan)', 'linear-gradient(red, cyan)'],
            ['linear-gradient(to bottom, red, cyan)', 'linear-gradient(red, cyan)'],
            // Color stop list
            ['linear-gradient(red, 50%, cyan)', 'linear-gradient(red, 50%, cyan)'],
            ['linear-gradient(red 0 0, 0, cyan)', 'linear-gradient(red 0px, red 0px, 0px, cyan)'],
            ['linear-gradient(red 0px 100%, 50px, cyan)', 'linear-gradient(red 0px, red 100%, 50px, cyan)'],
            ['linear-gradient(red -1% 200px, 150%, cyan)', 'linear-gradient(red -1%, red 200px, 150%, cyan)'],
            // Implicit color stops
            ['linear-gradient(red 0% 50%)', 'linear-gradient(red 0%, red 50%)'],
        ].forEach(([input, expected]) => expect(parse('<gradient>', input)).toBe(expected))
    })
    it('parses and serializes a radial gradient with valid arguments', () => {
        [
            // [input, expected]
            ['radial-gradient(red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            ['RADIAl-gradient(red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            ['repeating-radial-gradient(red, cyan)', 'repeating-radial-gradient(at center center, red, cyan)'],
            // Various gradient configurations
            ['radial-gradient(circle, red, cyan)', 'radial-gradient(circle at center center, red, cyan)'],
            ['radial-gradient(0, red, cyan)', 'radial-gradient(0px at center center, red, cyan)'],
            ['radial-gradient(50px, red, cyan)', 'radial-gradient(50px at center center, red, cyan)'],
            ['radial-gradient(circle farthest-side, red, cyan)', 'radial-gradient(circle farthest-side at center center, red, cyan)'],
            ['radial-gradient(farthest-side circle, red, cyan)', 'radial-gradient(circle farthest-side at center center, red, cyan)'],
            ['radial-gradient(ellipse 0 120%, red, cyan)', 'radial-gradient(0px 120% at center center, red, cyan)'],
            ['radial-gradient(ellipse 80% 100%, red, cyan)', 'radial-gradient(80% 100% at center center, red, cyan)'],
            ['radial-gradient(at top, red, cyan)', 'radial-gradient(at center top, red, cyan)'],
            ['radial-gradient(at left, red, cyan)', 'radial-gradient(at left center, red, cyan)'],
            ['radial-gradient(at center, red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            ['radial-gradient(at top left, red, cyan)', 'radial-gradient(at left top, red, cyan)'],
            ['radial-gradient(at 0%, red, cyan)', 'radial-gradient(at 0% center, red, cyan)'],
            ['radial-gradient(at center 100%, red, cyan)', 'radial-gradient(at center 100%, red, cyan)'],
            ['radial-gradient(circle closest-side at left center, red, cyan)', 'radial-gradient(circle closest-side at left center, red, cyan)'],
            // Simplified gradient configurations
            ['radial-gradient(circle 50px, red, cyan)', 'radial-gradient(50px at center center, red, cyan)'],
            ['radial-gradient(50px circle, red, cyan)', 'radial-gradient(50px at center center, red, cyan)'],
            ['radial-gradient(circle farthest-corner, red, cyan)', 'radial-gradient(circle at center center, red, cyan)'],
            ['radial-gradient(farthest-corner circle, red, cyan)', 'radial-gradient(circle at center center, red, cyan)'],
            ['radial-gradient(ellipse, red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            ['radial-gradient(ellipse farthest-corner, red, cyan)', 'radial-gradient(at center center, red, cyan)'],
            ['radial-gradient(ellipse farthest-side, red, cyan)', 'radial-gradient(farthest-side at center center, red, cyan)'],
            // Color stop list
            ['radial-gradient(red, 50%, cyan)', 'radial-gradient(at center center, red, 50%, cyan)'],
            ['radial-gradient(red 0 0, 0, cyan)', 'radial-gradient(at center center, red 0px, red 0px, 0px, cyan)'],
            ['radial-gradient(red 0px 100%, 50px, cyan)', 'radial-gradient(at center center, red 0px, red 100%, 50px, cyan)'],
            ['radial-gradient(red -1% 200px, 150%, cyan)', 'radial-gradient(at center center, red -1%, red 200px, 150%, cyan)'],
            // Implicit color stop
            ['radial-gradient(red 0% 50%)', 'radial-gradient(at center center, red 0%, red 50%)'],
        ].forEach(([input, expected]) => expect(parse('<gradient>', input)).toBe(expected))
    })
    it('parses and serializes a gradient defined with math function(s)', () => {
        [
            // [input, expected]
            [
                'conic-gradient(from calc(0deg) at calc(50%), red calc(5% * 2) calc(50% * 2), calc(25% * 2), cyan)',
                'conic-gradient(at calc(50%) center, red calc(10%), red calc(100%), calc(50%), cyan)',
            ],
            [
                'conic-gradient(from calc(180deg), red, cyan)',
                'conic-gradient(from calc(180deg) at center center, red, cyan)',
            ],
            [
                'linear-gradient(calc(90deg * 2), red, cyan)',
                'linear-gradient(red, cyan)',
            ],
            [
                'linear-gradient(calc(90deg), red, cyan)',
                'linear-gradient(calc(90deg), red, cyan)',
            ],
            [
                'radial-gradient(calc(50px) at calc(100%), red, cyan)',
                'radial-gradient(calc(50px) at calc(100%) center, red, cyan)',
            ],
            [
                'radial-gradient(calc(50px) calc(50px), red, cyan)',
                'radial-gradient(calc(50px) calc(50px) at center center, red, cyan)',
            ],
        ].forEach(([input, expected]) => expect(parse('<gradient>', input)).toBe(expected))
    })
    it('parses and serializes a gradient defined with custom variable(s)', () => {
        [
            'conic-gradient(var(--config))',
            'linear-gradient(var(--config))',
            'radial-gradient(var(--config))',
        ].forEach(input => expect(parse('<gradient>', input, true)).toBe(input))
    })
})
