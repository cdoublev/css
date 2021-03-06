/**
 * This file must be used to test requirements of:
 *
 * 1. the production parser
 *    1. combined types
 *    2. repeated types
 *    3. backtracking
 * 2. the `,` delimiter CSS type (aka. comma-ellision rules)
 * 3. CSS custom variable (to replace any CSS type)
 * 4. CSS types defined in CSS Value (aka. basic data types)
 *    1. textual
 *    2. numerics (and math functions to replace a numeric)
 * 5. CSS types with specific parsing or serialization rules
 *    (CSS types used in a CSS property/descriptor value)
 *    1. <color>
 *    2. <image>
 *    3. <position>
 *    4. <basic-shape>
 *    5. <gradient>
 *    ... (CSS types only used in the prelude of a rule)
 *    6. <selector-list> (style rule)
 *    7. <media-query-list> (`@media`)
 *    8. <supports-condition> (`@supports`)
 */

const { createParser, parseCSSGrammar, parseCSSPropertyValue } = require('../lib/parse/syntax.js')
const { toDegrees, toRadians } = require('../lib/utils/math.js')
const createList = require('../lib/values/value.js')
const createOmitted = require('../lib/values/omitted.js')
const parseDefinition = require('../lib/parse/definition.js')
const { serializeCSSValue } = require('../lib/serialize.js')

/**
 * Initialize `Parser` with a default context: a top-level style rule.
 *
 * Run eg. `context.enter({ name: 'page', type: new Set(['page']) })` to test
 * against a declaration value for a descriptors allowed in `@page`, then run
 * `context.exit()` to move back to the context of a top-level style rule.
 */
const cssRules = []
const styleSheet = { _rules: cssRules }
const styleRule = { parentStyleSheet: styleSheet, type: new Set(['style']) }

cssRules.push(
    { parentStyleSheet: styleSheet, prefix: 'html', type: new Set(['namespace']) },
    { parentStyleSheet: styleSheet, prefix: 'svg', type: new Set(['namespace']) },
    styleRule)

const parser = createParser(styleRule)
const { context, state } = parser

/**
 * @param {string} definition
 * @param {string} value
 * @param {boolean} [parseGlobals]
 * @param {boolean} [serialize]
 * @returns {function|string}
 *
 * Helper to allow parsing a CSS wide keyword or a custom variable replacing a
 * value matching the given definition, or to assert against the representation
 * resulting from parsing intead of the string resulting from serialization.
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
        return serializeCSSValue({ value })
    }
    return value
}

// Helpers to create component values
function keyword(value, location = -1, position) {
    const match = { representation: value, type: new Set(['ident', 'keyword']), value }
    if (typeof location === 'number') {
        match.location = location
    }
    if (typeof position === 'number') {
        match.position = position
    }
    return match
}
function omitted(definition, location = -1, position) {
    const node = parseDefinition(definition)
    return createOmitted(node, location, position)
}
function list(components = [], separator = ' ', location = -1, position) {
    const list = createList(components, separator)
    list.location = location
    if (position) {
        list.position = position
    }
    return list
}

beforeEach(() => {
    state.clear()
})

/**
 * TODO: add generalized test case guaranteeing that the maximum call stack size
 * can not be exceeded by recursive backtracking, ie. it should support missing
 * tail call optimization.
 */
it('<final-bg-layer>', () => {
    const definition = 'a || b || c || d || e || f || g'
    const input = 'a b d e c'
    expect(parse(definition, input)).toBe('a b c d e')
})

/**
 * TODO: add generalized test case(s) guaranteeing that matching `a a b` against
 * `[b || a?? || a??] | a a b` should result to `a??`, `a??`, `b`, in this order.
 */
/**
 * TODO: add generalized test case to `backtracking`.
 * -> this is a minimum reproduction of an issue that was occurring while
 * parsing `background-property`, ie. a grammar containing <bg-position>
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
 * -> it has been fixed by returning a new function with the result from parsing
 * its arguments as its `value`
 */
it('fn(a) || a || b', () => {
    const definition = 'fn(a) || a || b'
    expect(parse(definition, 'fn(a) b a')).toBe('fn(a) a b')
})
/**
 * TODO: add generalized test case to `backtracking`.
 * -> the issue was occurring when `parseSequence()` was not trying to parse
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
describe('repeated types', () => {
    it('parses and serializes a value matched against a?', () => {
        const definition = 'a?'
        expect(parse(definition, '')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
    })
    it('parses a value matched against a? to the expected representation', () => {
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
    it('parses a value matched against a* to the expected representation', () => {
        const definition = 'a*'
        expect(parse(definition, '', false, false)).toEqual(createList([]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')]))
        expect(parse(definition, 'a a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)]))
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
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
    })
    it('parses a value matched against a# to the expected representation', () => {
        const definition = 'a#'
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')], ','))
        expect(parse(definition, 'a, a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)], ','))
    })
    it('parses and serializes a value matched against <length-percentage>#', () => {
        const definition = '<length-percentage>#'
        expect(parse(definition, '1px 1px')).toBe('')
        expect(parse(definition, '1px')).toBe('1px')
        expect(parse(definition, '1px, 1px')).toBe('1px, 1px')
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
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a, a')).toBe('a, a')
    })
    it('parses and serializes a value matched against a+#?', () => {
        const definition = 'a a+#?'
        expect(parse(definition, 'a, a')).toBe('')
        expect(parse(definition, 'a a, a a')).toBe('')
        expect(parse(definition, 'a a a, a')).toBe('')
        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')
    })
    it('parses and serializes a value matched against a{2}', () => {
        const definition = 'a{2}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('')
        expect(parse(definition, 'a, a')).toBe('')
    })
    it('parses a value matched against a{2} to the expected representation', () => {
        const definition = 'a{2}'
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'a a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)]))
    })
    it('parses and serializes a value matched against a{2,3}', () => {
        const definition = 'a{2,3}'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('a a')
        expect(parse(definition, 'a a a')).toBe('a a a')
        expect(parse(definition, 'a a a a')).toBe('')
    })
    it('parses and serializes a value matched against a{2,???}', () => {
        const definition = 'a{2,???}'
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
    it('parses a value matched against a{0,???} to the expected representation', () => {
        const definition = 'a{0,???}'
        expect(parse(definition, '', false, false)).toEqual(createList([]))
        expect(parse(definition, 'a a', false, false)).toEqual(createList([keyword('a'), keyword('a', 0)]))
    })
    it('parses a value matched against [a b?] to the expected representation', () => {
        const definition = '[a b?]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, 'a b', false, false)).toEqual(createList([keyword('a'), keyword('b', 0)]))
    })
    it('parses a value matched against [a b?]? to the expected representation', () => {
        const definition = '[a b?]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('a b?'))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
    })
    it('parses a value matched against [a b?]* to the expected representation', () => {
        const definition = '[a b?]*'
        expect(parse(definition, '', false, false)).toEqual(createList())
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])]))
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])]))
    })
    it('parses a value matched against [a b?]# to the expected representation', () => {
        const definition = '[a b?]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])], ','))
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])], ','))
    })
    it('parses a value matched against [a? b?] to the expected representation', () => {
        const definition = '[a? b?]'
        expect(parse(definition, '', false, false)).toEqual(createList([omitted('a'), omitted('b')]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, 'a b', false, false)).toEqual(createList([keyword('a'), keyword('b', 0)]))
    })
    it('parses a value matched against [a? b?]? to the expected representation', () => {
        const definition = '[a? b?]?'
        expect(parse(definition, '', false, false)).toEqual(list([omitted('a', -1), omitted('b', -1)]))
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, 'b', false, false)).toEqual(list([omitted('a', -1), keyword('b')]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
    })
    it('parses and serializes a value matched against a [b? c?]!', () => {
        const definition = 'a [b? c?]!'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a b')).toBe('a b')
        expect(parse(definition, 'a c')).toBe('a c')
    })
    it('parses a value matched against [a? b?]! to the expected representation', () => {
        const definition = '[a? b?]!'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(list([keyword('a'), omitted('b', 0)]))
        expect(parse(definition, 'b', false, false)).toEqual(list([omitted('a', -1), keyword('b')]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
    })
    it('parses a value matched against [a? b?]* to the expected representation', () => {
        const definition = '[a? b?]*'
        expect(parse(definition, '', false, false)).toEqual(createList([list([omitted('a', -1), omitted('b', -1)])]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])]))
        expect(parse(definition, 'b', false, false)).toEqual(createList([list([omitted('a', -1), keyword('b')])]))
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])]))
    })
    it('parses a value matched against [a? b?]# to the expected representation', () => {
        const definition = '[a? b?]#'
        expect(parse(definition, '', false, false)).toEqual(createList([list([omitted('a', -1), omitted('b', -1)])], ','))
        expect(parse(definition, 'a', false, false)).toEqual(createList([list([keyword('a'), omitted('b', 0)])], ','))
        expect(parse(definition, 'b', false, false)).toEqual(createList([list([omitted('a', -1), keyword('b')])], ','))
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])], ','))
    })
    it('parses a value matched against [a b] to the expected representation', () => {
        const definition = '[a b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(createList([keyword('a'), keyword('b', 0)]))
    })
    it('parses a value matched against [a b]? to the expected representation', () => {
        const definition = '[a b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('a b'))
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(list([keyword('a'), keyword('b', 0)]))
    })
    it('parses a value matched against [a b]* to the expected representation', () => {
        const definition = '[a b]*'
        expect(parse(definition, '', false, false)).toEqual(createList([]))
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(createList([list([keyword('a'), keyword('b', 0)])]))
    })
    it('parses a value matched against [a b]# to the expected representation', () => {
        const definition = '[a b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toBeNull()
        expect(parse(definition, 'b', false, false)).toBeNull()
        expect(parse(definition, 'a b', false, false)).toEqual(createList(
            [list([keyword('a'), keyword('b', 0)])],
            ','))
    })
    it('parses a value matched against [a | b] to the expected representation', () => {
        const definition = '[a | b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a', null))
        expect(parse(definition, 'b', false, false)).toEqual(keyword('b', null))
    })
    it('parses a value matched against [a | b]? to the expected representation', () => {
        const definition = '[a | b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('a | b'))
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b', false, false)).toEqual(keyword('b'))
    })
    it('parses a value matched against [a | b]* to the expected representation', () => {
        const definition = '[a | b]*'
        expect(parse(definition, '', false, false)).toEqual(createList([]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')]))
        expect(parse(definition, 'b', false, false)).toEqual(createList([keyword('b')]))
    })
    it('parses a value matched against [a | b]# to the expected representation', () => {
        const definition = '[a | b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')], ','))
        expect(parse(definition, 'b', false, false)).toEqual(createList([keyword('b')], ','))
    })
    it('parses a value matched against [a | b b] to the expected representation', () => {
        const definition = '[a | b b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a', null))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([keyword('b'), keyword('b', 0)]))
    })
    it('parses a value matched against [a | b b]? to the expected representation', () => {
        const definition = '[a | b b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('a | b b'))
        expect(parse(definition, 'a', false, false)).toEqual(keyword('a'))
        expect(parse(definition, 'b b', false, false)).toEqual(list([keyword('b'), keyword('b', 0)]))
    })
    it('parses a value matched against [a | b b]* to the expected representation', () => {
        const definition = '[a | b b]*'
        expect(parse(definition, '', false, false)).toEqual(createList([]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([keyword('a')]))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([list([keyword('b'), keyword('b', 0)])]))
    })
    it('parses a value matched against [a | b b]# to the expected representation', () => {
        const definition = '[a | b b]#'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(createList(
            [keyword('a')],
            ','))
        expect(parse(definition, 'b b', false, false)).toEqual(createList(
            [list([keyword('b'), keyword('b', 0)])],
            ','))
    })
    it('parses a value matched against [a || b] to the expected representation', () => {
        const definition = '[a || b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            omitted('b', -1, 1),
        ]))
        expect(parse(definition, 'b', false, false)).toEqual(createList([
            omitted('a', -1, 0),
            keyword('b', -1, 1),
        ]))
        expect(parse(definition, 'a b', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            keyword('b', 0, 1),
        ]))
    })
    it('parses a value matched against [a || b]? to the expected representation', () => {
        const definition = '[a || b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('a || b'))
        expect(parse(definition, 'a', false, false)).toEqual(list([
            keyword('a', -1, 0),
            omitted('b', -1, 1),
        ]))
        expect(parse(definition, 'b', false, false)).toEqual(list([
            omitted('a', -1, 0),
            keyword('b', -1, 1),
        ]))
        expect(parse(definition, 'a b', false, false)).toEqual(list([
            keyword('a', -1, 0),
            keyword('b', 0, 1),
        ]))
    })
    it('parses a value matched against [a || b]* to the expected representation', () => {
        const definition = '[a || b]*'
        expect(parse(definition, '', false, false)).toEqual(createList([]))
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
        expect(parse(definition, 'a b', false, false)).toEqual(createList([
            list([
                keyword('a', -1, 0),
                keyword('b', 0, 1),
            ]),
        ]))
    })
    it('parses a value matched against [a || b]# to the expected representation', () => {
        const definition = '[a || b]#'
        expect(parse(definition, '', false, false)).toBeNull()
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
        expect(parse(definition, 'a b', false, false)).toEqual(createList(
            [
                list([keyword('a', -1, 0), keyword('b', 0, 1)]),
            ],
            ','))
        expect(parse(definition, 'a b, b', false, false)).toEqual(createList(
            [
                list([keyword('a', -1, 0), keyword('b', 0, 1)]),
                list([omitted('a', 3, 0), keyword('b', 3, 1)], ' ', 2),
            ],
            ','))
    })
    it('parses a value matched against [a || b b] to the expected representation', () => {
        const definition = '[a || b b]'
        expect(parse(definition, '', false, false)).toBeNull()
        expect(parse(definition, 'a', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            omitted('b b', -1, 1),
        ]))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([
            omitted('a', -1, 0),
            list([keyword('b', -1), keyword('b', 0)], ' ', -1, 1),
        ]))
        expect(parse(definition, 'a b b', false, false)).toEqual(createList([
            keyword('a', -1, 0),
            list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
        ]))
    })
    it('parses a value matched against [a || b b]? to the expected representation', () => {
        const definition = '[a || b b]?'
        expect(parse(definition, '', false, false)).toEqual(omitted('a || b b'))
        expect(parse(definition, 'a', false, false)).toEqual(list(
            [keyword('a', -1, 0), omitted('b b', -1, 1)],
            ' ',
            -1))
        expect(parse(definition, 'b b', false, false)).toEqual(list(
            [omitted('a', -1, 0), list([keyword('b'), keyword('b', 0)], ' ', -1, 1)],
            ' ',
            -1))
        expect(parse(definition, 'a b b', false, false)).toEqual(list(
            [
                keyword('a', -1, 0),
                list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
            ],
            ' ',
            -1))
    })
    it('parses a value matched against [a || b b]* to the expected representation', () => {
        const definition = '[a || b b]*'
        expect(parse(definition, '', false, false)).toEqual(createList([]))
        expect(parse(definition, 'a', false, false)).toEqual(createList([
            list([keyword('a', -1, 0), omitted('b b', -1, 1)]),
        ]))
        expect(parse(definition, 'b b', false, false)).toEqual(createList([
            list([omitted('a', -1, 0), list([keyword('b', -1), keyword('b', 0)], ' ', -1, 1)]),
        ]))
        expect(parse(definition, 'a b b', false, false)).toEqual(createList([
            list([
                keyword('a', -1, 0),
                list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
            ]),
        ]))
    })
    it('parses a value matched against [a || b b]# to the expected representation', () => {
        const definition = '[a || b b]#'
        expect(parse(definition, '', false, false)).toBeNull()
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
        expect(parse(definition, 'a b b', false, false)).toEqual(createList(
            [
                list([
                    keyword('a', -1, 0),
                    list([keyword('b', 0), keyword('b', 2)], ' ', 0, 1),
                ]),
            ],
            ','))
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
    it('parses and serializes a value matched against a a | a', () => {
        const definition = 'a a | a'
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
    // TODO: cleanup and eventually complete the following cases
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
    it('parses and serializes a value matched against [a | <length-percentage>] b', () => {
        const definition = '[a | <length-percentage>] b'
        expect(parse(definition, '1px a')).toBe('')
        expect(parse(definition, '1px')).toBe('')
        expect(parse(definition, '1px b')).toBe('1px b')
        expect(parse(definition, '1% b')).toBe('1% b')
    })
    it('parses and serializes a value matched against <length-percentage>? <length-percentage>{2}', () => {
        const definition = '<length-percentage>? <length-percentage>{2}'
        expect(parse(definition, '1px')).toBe('')
        expect(parse(definition, '1px 1px')).toBe('1px 1px')
        expect(parse(definition, '1px 1px 1px')).toBe('1px 1px 1px')
    })
    it('parses and serializes a value matched against <linear-color-stop> a', () => {
        const definition = '<linear-color-stop>, a'
        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, '1px, a')).toBe('')
        expect(parse(definition, 'black, a')).toBe('black, a')
        expect(parse(definition, 'black 1px, a')).toBe('black 1px, a')
        expect(parse(definition, 'black 1px 1px, a')).toBe('black 1px 1px, a')
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
})
describe('comma-separated types', () => {
    // Comma-ellision rules apply
    it('parses and serializes a value matched against a?, b', () => {

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
    it('parses and serializes a value matched against a?, a', () => {

        const definition = 'a?, a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
    })
    it('parses and serializes a value matched against a, b?', () => {

        const definition = 'a, b?'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, b')).toBe('a, b')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', b')).toBe('')
        expect(parse(definition, 'b')).toBe('')
        expect(parse(definition, 'a b')).toBe('')
    })
    it('parses and serializes a value matched against a, a?', () => {

        const definition = 'a, a?'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, ', a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
    })
    it('parses and serializes a value matched against a, b?, c', () => {

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
    it('parses and serializes a value matched against a, a?, a', () => {

        const definition = 'a, a?, a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a, a,')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses and serializes a value matched against a, b?, c?, d', () => {

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
    it('parses and serializes a value matched against a, a?, a?, a', () => {

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
    it('parses and serializes a value matched against a, [b?, a]', () => {

        const definition = 'a, [b?, a]'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, b, a')).toBe('a, b, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a, b a')).toBe('')
        expect(parse(definition, 'a b, a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses and serializes a value matched against a, [a?, a]#', () => {

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
    it('parses and serializes a value matched against [a?, a?,] a', () => {

        const definition = '[a?, a?,] a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses and serializes a value matched against a [, a? , a?]', () => {

        const definition = 'a [, a? , a?]'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, a a')).toBe('')
        expect(parse(definition, 'a a, a')).toBe('')
        expect(parse(definition, 'a, a, , a')).toBe('')
    })
    it('parses and serializes a value matched against [a, && b?,] a', () => {

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
    it('parses and serializes a value matched against a [, a && , b?]', () => {

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
    it('parses and serializes a value matched against [a# ,]? a', () => {

        const definition = '[a# ,]? a'

        expect(parse(definition, 'a')).toBe('a')
        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a, a')).toBe('a, a, a')

        expect(parse(definition, 'a,')).toBe('')
        expect(parse(definition, 'a, ,')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
    })
    // Comma-ellision rules do not apply
    it('parses and serializes a value matched against a a?, a', () => {

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
    it('parses and serializes a value matched against a, a? a', () => {

        const definition = 'a, a? a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a, a, , a')).toBe('')
    })
    it('parses and serializes a value matched against a [a?, a]', () => {

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
    it('parses and serializes a value matched against a [, a? a]', () => {

        const definition = 'a [, a? a]'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a, a a')).toBe('a, a a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
    })
    it('parses and serializes a value matched against [a a?,] a', () => {

        const definition = '[a a?,] a'

        expect(parse(definition, 'a, a')).toBe('a, a')
        expect(parse(definition, 'a a, a')).toBe('a a, a')

        expect(parse(definition, 'a')).toBe('')
        expect(parse(definition, 'a a')).toBe('')
        expect(parse(definition, 'a, , a')).toBe('')
        expect(parse(definition, 'a a, , a')).toBe('')
    })
    it('parses and serializes a value matched against [a b?, || c b?, || b?,]? d', () => {

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
    it('parses and serializes an invalid value to an empty string', () => {
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
    it('parses a valid value to the expected representation', () => {
        expect(parse('<var()>', 'var(--prop)', true, false)).toEqual(createList(
            [{
                name: 'var',
                type: new Set(['function', 'var()']),
                value: createList(
                    [{
                        location: -1,
                        representation: '--prop',
                        type: new Set(['ident', 'custom-property-name']),
                        value: '--prop',
                    }],
                    ''),
            }],
            ''))
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
    it('parses and serializes case-sensitively', () => {
        expect(parse('<var()>', 'VAr(--PROPerty)', true)).toBe('var(--PROPerty)')
    })
})

describe('keyword', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['ninitial', 'initiall', '--initial', 'liquid']
        const valid = ['solid']
        invalid.forEach(input => expect(parse('solid', input, valid, true)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('inherit', 'inherit', true, false)).toEqual({
            representation: 'inherit',
            type: new Set(['ident', 'keyword', 'css-wide-keyword']),
            value: 'inherit',
        })
        expect(parse('solid', 'solid', false, false)).toEqual({
            representation: 'solid',
            type: new Set(['ident', 'keyword']),
            value: 'solid',
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('solid', 'var(--keyword)', true)).toBe('var(--keyword)')
    })
})
describe('<custom-ident>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = [
            'initial',
            'inherit',
            'unset',
            'default',
            '-',
            // Invalid identifier character: !
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
    it('parses a valid value to the expected representation', () => {
        expect(parse('<custom-ident>', 'myAnimationName', false, false)).toEqual({
            representation: 'myAnimationName',
            type: new Set(['ident', 'custom-ident']),
            value: 'myAnimationName',
        })
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // Valid start character(s)
            ['??'],
            ['_'],
            ['-a'],
            ['--'],
            ['-\\0 \\g', '-???g'],
            ['\\0 \\g', '???g'],
            // Valid identifier characters
            ['_??'],
            ['__'],
            ['_0'],
            ['camelIdentifier'],
            ['snake_identifier'],
            ['kebab-identifier'],
            ['--camelCustomIdentifier'],
            ['--kebab-custom-identifier'],
            ['--snake_custom_identifier'],
        ]
        valid.forEach(([input, expected = input]) => expect(parse('<custom-ident>', input)).toBe(expected))
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<custom-ident>', 'var(--identifier)', true)).toBe('var(--identifier)')
    })
})
describe('<dashed-ident>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<dashed-ident>', 'identifier')).toBe('')
    })
    it('parses a valid value to the expected representation', () => {
        // TODO: a <dashed-ident> must also be a <custom-ident> (see CSS Values)
        expect(parse('<dashed-ident>', '--prop', false, false)).toEqual({
            representation: '--prop',
            type: new Set(['ident', /*'custom-ident', */'dashed-ident']),
            value: '--prop',
        })
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<dashed-ident>', 'var(--dashed-ident)', true)).toBe('var(--dashed-ident)')
    })
})
describe('<ndashdigit-ident>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['keyword', '"string"', '1', '1px', '1n-1', 'n-1.1', 'n--1', '-n-1']
        invalid.forEach(input => expect(parse('<ndashdigit-ident>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<ndashdigit-ident>', 'n-1', false, false)).toEqual({
            representation: 'n-1',
            type: new Set(['ident', 'ndashdigit-ident']),
            value: 'n-1',
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<ndashdigit-ident>', 'n-0')).toBe('n-0')
        expect(parse('<ndashdigit-ident>', 'n-1')).toBe('n-1')
    })
    it('parses and serializes case-insensitively', () => {
        expect(parse('<ndashdigit-ident>', 'N-1')).toBe('n-1')
    })
})
describe('<dashndashdigit-ident>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['keyword', '"string"', '1', '1px', '-n-1.1', '-n--1', 'n-1']
        invalid.forEach(input => expect(parse('<dashndashdigit-ident>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<dashndashdigit-ident>', '-n-1', false, false)).toEqual({
            representation: '-n-1',
            type: new Set(['ident', 'dashndashdigit-ident']),
            value: '-n-1',
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<dashndashdigit-ident>', '-n-0')).toBe('-n-0')
        expect(parse('<dashndashdigit-ident>', '-n-1')).toBe('-n-1')
    })
    it('parses and serializes case-insensitively', () => {
        expect(parse('<dashndashdigit-ident>', '-N-1')).toBe('-n-1')
    })
})
describe('<string>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = [
            'unquoted',
            '"string" unquoted',
            '"\n"', // Unescaped newline
        ]
        invalid.forEach(input => expect(parse('<string>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<string>', '"css"', false, false)).toEqual({
            representation: '"css"',
            type: new Set(['string']),
            value: 'css',
        })
        expect(parse('<string>', '"css', false, false)).toEqual({
            representation: '"css',
            type: new Set(['string']),
            value: 'css',
        })
    })
    it('parses and serializes an unclosed string', () => {
        expect(parse('<string>', '"css')).toBe('"css"')
        expect(parse('<string>', "'css")).toBe('"css"')
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<string>', 'var(--string)', true)).toBe('var(--string)')
    })
})
describe('<url>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = [
            'uurl(valid.url)',
            'url(val)id.url)',
            'url(valid.url))',
            // Unexpected whitepsace
            'url(val id.url)',
            'url(val\nid.url)',
            'url(val\tid.url)',
            // Unexpected quote (parse error)
            'url(val"id.url)',
            "url(val'id.url)",
            // Unexpected open parenthesis (parse error)
            'url(val(id.url)',
            // Unexpected non-printable character (parse error)
            'url(val\u0001id.url)',
            // Invalid escape sequence
            'url(val\\\nid.url)',
            // Invalid <string>
            'src()',
            'src(unquoted.url)',
        ]
        invalid.forEach(input => expect(parse('<url>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<url>', 'url(img.jpg)', false, false)).toEqual({
            representation: 'url(img.jpg)',
            type: new Set(['url-token', 'url']),
            value: 'img.jpg',
        })
        expect(parse('<url>', 'url("img.jpg")', false, false)).toEqual({
            name: 'url',
            type: new Set(['function', 'url()', 'url']),
            value: createList([
                {
                    location: -1,
                    representation: '"img.jpg"',
                    type: new Set(['string']),
                    value: 'img.jpg',
                },
                list([], ' ', 0),
            ]),
        })
        expect(parse('<url>', 'src("img.jpg")', false, false)).toEqual({
            name: 'src',
            type: new Set(['function', 'src()', 'url']),
            value: createList([
                {
                    location: -1,
                    representation: '"img.jpg"',
                    type: new Set(['string']),
                    value: 'img.jpg',
                },
                list([], ' ', 0),
            ]),
        })
    })
    it('parses and serializes an unclosed URL', () => {
        expect(parse('<url>', 'url(valid.url')).toBe('url("valid.url")')
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<url>', 'var(--url)', true)).toBe('var(--url)')
        expect(parse('<url>', 'src(var(--url))', true)).toBe('src(var(--url))')
    })
})

describe('<zero>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '0px', '0%', 'calc(0)']
        invalid.forEach(input => expect(parse('<zero>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<zero>', '0', false, false)).toEqual({
            representation: '0',
            type: new Set(['integer', 'zero']),
            value: 0,
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<zero>', '0')).toBe('0')
    })
})
describe('<integer>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '1px', '1.1', '.1', '1e-1', '-1', 'calc(1px)']
        invalid.forEach(input => expect(parse('<integer [0,???]>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<integer>', '0', false, false)).toEqual({
            representation: '0',
            type: new Set(['integer']),
            value: 0,
        })
        expect(parse('<integer>', '1', false, false)).toEqual({
            representation: '1',
            type: new Set(['integer']),
            value: 1,
        })
    })
    it('parses and serializes an integer with an exponent', () => {
        expect(parse('<integer>', '1e1')).toBe('10')
        expect(parse('<integer>', '1e+1')).toBe('10')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<integer>', 'var(--integer)', true)).toBe('var(--integer)')
    })
})
describe('<signless-integer>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['keyword', '"string"', '1.1', '+1.1', '-1.1']
        invalid.forEach(input => expect(parse('<signless-integer>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<signless-integer>', '1', false, false)).toEqual({
            representation: '1',
            type: new Set(['integer', 'signless-integer']),
            value: 1,
        })
        /**
         * TODO: expect `0` to be represented with types `integer`, `zero`, and
         * `signless-integer`.
         */
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<signless-integer>', '1')).toBe('1')
    })
})
describe('<signed-integer>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['keyword', '"string"', '1', '1.1']
        invalid.forEach(input => expect(parse('<signed-integer>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<signed-integer>', '+1', false, false)).toEqual({
            representation: '+1',
            type: new Set(['integer', 'signed-integer']),
            value: 1,
        })
        expect(parse('<signed-integer>', '-1', false, false)).toEqual({
            representation: '-1',
            type: new Set(['integer', 'signed-integer']),
            value: -1,
        })
        /**
         * TODO: expect `+0` and `-0` to be represented with types `integer` and
         * `signed-integer`.
         */
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<signed-integer>', '+1')).toBe('1')
        expect(parse('<signed-integer>', '-1')).toBe('-1')
    })
})
describe('<number>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '1px', '-1', 'calc(1px)']
        invalid.forEach(input => expect(parse('<number [0,???]>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<number>', '0', false, false)).toEqual({
            representation: '0',
            type: new Set(['integer', 'number']),
            value: 0,
        })
        expect(parse('<number>', '1', false, false)).toEqual({
            representation: '1',
            type: new Set(['integer', 'number']),
            value: 1,
        })
        expect(parse('<number>', '1.1', false, false)).toEqual({
            representation: '1.1',
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<number>', 'var(--number)', true)).toBe('var(--number)')
    })
})
describe('<length>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '0', '0px', '1', 'px', '1%', '#1px', '1px%', '-1px', 'calc(1)']
        invalid.forEach(input => expect(parse('<length [1,???]>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<length>', '0', false, false)).toEqual({
            representation: '0',
            type: new Set(['dimension', 'length']),
            unit: 'px',
            value: 0,
        })
        expect(parse('<length>', '1px', false, false)).toEqual({
            representation: '1px',
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
    it('parses and serializes case-insensitively', () => {
        expect(parse('<length>', '1Px')).toBe('1px')
        expect(parse('<length>', '1Q')).toBe('1q')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<length>', 'var(--length)', true)).toBe('var(--length)')
    })
})
describe('<percentage>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '0', '1', '%', '1px', '#1%', '1%%', '-1%', 'calc(1)']
        invalid.forEach(input => expect(parse('<percentage [0,???]>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<percentage>', '0%', false, false)).toEqual({
            representation: '0%',
            type: new Set(['percentage']),
            unit: '%',
            value: 0,
        })
        expect(parse('<percentage>', '1%', false, false)).toEqual({
            representation: '1%',
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<percentage>', 'var(--percentage)', true)).toBe('var(--percentage)')
    })
})
describe('<length-percentage>', () => {
    it.todo('test')
})
describe('<alpha-value>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '%', '1px', '1%%', 'calc(1px)', 'calc(0.5 + 50%)']
        invalid.forEach(input => expect(parse('<alpha-value>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<alpha-value>', '0', false, false)).toEqual({
            representation: '0',
            type: new Set(['integer', 'number', 'alpha-value']),
            value: 0,
        })
        expect(parse('<alpha-value>', '1', false, false)).toEqual({
            representation: '1',
            type: new Set(['integer', 'number', 'alpha-value']),
            value: 1,
        })
        expect(parse('<alpha-value>', '1%', false, false)).toEqual({
            representation: '1%',
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<alpha-value>', 'var(--alpha)', true)).toBe('var(--alpha)')
    })
})
describe('<angle>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '0', '0deg', '1', 'deg', '1px', '#1deg', '1degg', 'calc(1)']
        invalid.forEach(input => expect(parse('<angle [1,???]>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<angle>', '0', false, false)).toEqual({
            representation: '0',
            type: new Set(['dimension', 'angle']),
            unit: 'deg',
            value: 0,
        })
        expect(parse('<angle>', '1deg', false, false)).toEqual({
            representation: '1deg',
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
    it('parses and serializes case-insensitively', () => {
        expect(parse('<angle>', '1DEg')).toBe('1deg')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<angle>', 'var(--angle)', true)).toBe('var(--angle)')
    })
})
describe('<time>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['string', '0', '1', 's', '1px', '#1s', '1ss', '-1s', 'calc(1)']
        invalid.forEach(input => expect(parse('<time [0,???]>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<time>', '1s', false, false)).toEqual({
            representation: '1s',
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
    it('parses and serializes case-insensitively', () => {
        expect(parse('<time>', '1Ms')).toBe('1ms')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<time>', 'var(--time)', true)).toBe('var(--time)')
    })
})
describe('<n-dimension>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['keyword', '"string"', '1px', '1n-', '1.1n', 'calc(1n)']
        invalid.forEach(input => expect(parse('<n-dimension>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<n-dimension>', '1n', false, false)).toEqual({
            representation: '1n',
            type: new Set(['dimension', 'n-dimension']),
            unit: 'n',
            value: 1,
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<n-dimension>', '1n')).toBe('1n')
        expect(parse('<n-dimension>', '-1n')).toBe('-1n')
        expect(parse('<n-dimension>', '0n')).toBe('0n')
    })
    it('parses and serializes case-insensitively', () => {
        expect(parse('<n-dimension>', '1N')).toBe('1n')
    })
})
describe('<ndash-dimension>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['keyword', '"string"', '1px', '1n', '1.1n-', 'calc(1n-)']
        invalid.forEach(input => expect(parse('<ndash-dimension>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<ndash-dimension>', '1n-', false, false)).toEqual({
            representation: '1n-',
            type: new Set(['dimension', 'ndash-dimension']),
            unit: 'n-',
            value: 1,
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<ndash-dimension>', '1n-')).toBe('1n-')
        expect(parse('<ndash-dimension>', '-1n-')).toBe('-1n-')
        expect(parse('<ndash-dimension>', '0n-')).toBe('0n-')
    })
    it('parses and serializes case-insensitively', () => {
        expect(parse('<ndash-dimension>', '1N-')).toBe('1n-')
    })
})
describe('<ndashdigit-dimension>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = ['keyword', '"string"', '1px', '1n-', '1.1n-1', 'calc(1n-1)']
        invalid.forEach(input => expect(parse('<ndashdigit-dimension>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<ndashdigit-dimension>', '1n-1', false, false)).toEqual({
            representation: '1n-1',
            type: new Set(['dimension', 'ndashdigit-dimension']),
            unit: 'n-1',
            value: 1,
        })
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<ndashdigit-dimension>', '1n-1')).toBe('1n-1')
        expect(parse('<ndashdigit-dimension>', '-1n-1')).toBe('-1n-1')
        expect(parse('<ndashdigit-dimension>', '0n-1')).toBe('0n-1')
    })
    it('parses and serializes case-insensitively', () => {
        expect(parse('<ndashdigit-dimension>', '1N-1')).toBe('1n-1')
    })
})
describe('<urange>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = [
            'keyword',
            '"string"',
            '1',
            // `U+` must appear first
            'U-0',
            'U0',
            // Start/end code points must have 0 < hexadecimal digits < 7
            'U+',
            'U+0000001',
            'U+-1',
            'U+0-',
            'U+-0',
            'U+0-0000001',
            // `?` must appear last
            'U+?0',
            'U+0?-1',
            'U+0-?0',
            // Start/end code points must be separated with an hyphen
            'U+0+1',
            // Start/end code points must be hexadecimal digits
            'U+0g',
            'U+0-0g',
            // Start/end code points must be lower than 10FFFF (maximum allowed code point)
            'U+110001',
            // Start code point must be lower or equal to end code point
            'U+1-0',
        ]
        invalid.forEach(input => expect(parse('<urange>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<urange>', 'U+0-f', false, false)).toEqual({
            end: 15,
            representation: 'U+0-f',
            start: 0,
            type: new Set(['urange']),
        })
    })
})

describe('<calc()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {

        // Whitespace is required on both sides of `+` and `-`
        expect(parse('<number>', 'calc(1+ 1)')).toBe('')
        expect(parse('<number>', 'calc(1 +1)')).toBe('')
        expect(parse('<number>', 'calc(1- 1)')).toBe('')
        expect(parse('<number>', 'calc(1 -1)')).toBe('')

        // Maximum 32 <calc-value> or nested calculations
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

        // <number> and <percentage> can not be combined
        expect(parse('<number> | <percentage>', 'calc(1 + 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'calc(1 - 1%)')).toBe('')
    })
    it('parses a valid value to the expected representation', () => {
        // Unresolved calculations
        expect(parse('<calc()>', 'calc(1)', false, false)).toEqual({
            name: 'calc',
            type: new Set(['function', 'calc()']),
            value: {
                type: new Set(['calc-sum']),
                value: [
                    {
                        location: -1,
                        representation: '1',
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
                        representation: '1',
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        location: 2,
                        representation: '2',
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
                        representation: '1',
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        type: new Set(['calc-negate']),
                        value: [
                            {
                                location: 2,
                                representation: '2',
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
                        representation: '1',
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        location: 2,
                        representation: '2',
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
                        representation: '1',
                        type: new Set(['integer', 'number', 'calc-value']),
                        value: 1,
                    },
                    {
                        type: new Set(['calc-invert']),
                        value: [
                            {
                                location: 2,
                                representation: '2',
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
                representation: '1',
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
                representation: '1',
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
    it('parses and serializes calc() operands as a type-percentage mixed type', () => {
        expect(parse('<length-percentage>', 'calc(1px)')).toBe('calc(1px)')
        expect(parse('<length-percentage>', 'calc(1%)')).toBe('calc(1%)')
        expect(parse('<length> | <percentage>', 'calc(1px)')).toBe('calc(1px)')
        expect(parse('<length> | <percentage>', 'calc(1%)')).toBe('calc(1%)')
        expect(parse('<number> | <percentage>', 'calc(1)')).toBe('calc(1)')
        expect(parse('<number> | <percentage>', 'calc(100%)')).toBe('calc(1)')
    })
    it('parses and serializes calc() that resolves to an infinite number or not to a number', () => {
        expect(parse('<number>', 'calc(Infinity)')).toBe('calc(infinity)')
        expect(parse('<number>', 'calc(1 / 0)')).toBe('calc(infinity)')
        expect(parse('<length>', 'calc(1px / 0)')).toBe('calc(infinity * 1px)')
        // NaN must resolve to infinity when produced in a top-level calculation
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
        // Nested math functions resolved to a single numeric value
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
        expect(parse('<integer [0,???]>', 'calc(1 * -1)')).toBe('calc(-1)')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<number>', 'calc(var(--number) + 1)', true)).toBe('calc(var(--number) + 1)')
    })
})
describe('<min()>, <max()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        // Maximum 32 <calc-sum> arguments
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
        // <number> and <percentage> can not be combined
        expect(parse('<number> | <percentage>', 'min(1%, 1)')).toBe('')
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<min()>', 'min(1)', false, false)).toEqual({
            name: 'min',
            type: new Set(['function', 'min()']),
            value: createList([{
                // TODO: implement an appropriate data structure for component values
                location: -1,
                type: new Set(['calc-sum']),
                value: [{
                    location: -1,
                    representation: '1',
                    type: new Set(['integer', 'number', 'calc-value']),
                    value: 1,
                }],
            }], ','),
        })
    })
    it('parses and serializes a valid value', () => {
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<integer>', 'min(var(--integer), 1)', true)).toBe('min(var(--integer), 1)')
    })
})
describe('<clamp()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'clamp(1, 1)')).toBe('')
        expect(parse('<number>', 'clamp(1, 1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'clamp(1, keyword, 1)')).toBe('')
        expect(parse('<number>', 'clamp(1px, 2, 3)')).toBe('')
        expect(parse('<number>', 'clamp(1, 2px, 3)')).toBe('')
        expect(parse('<number>', 'clamp(1, 2, 3px)')).toBe('')
        // "Unitless 0" <length> is not supported in math functions
        expect(parse('<length>', 'clamp(0, 1px, 2px)')).toBe('')
        // <number> and <percentage> can not be combined
        expect(parse('<number> | <percentage>', 'clamp(0px, 1%, 2px)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'clamp(0, 1, 2)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(0, 2, 1)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(1, 0, 2)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(0, 1 * 1, 2)')).toBe('calc(1)')
        expect(parse('<number>', 'clamp(1, 2, 0)')).toBe('calc(1)')
        expect(parse('<length>', 'clamp(0px, 2px, 1px)')).toBe('calc(1px)')
        expect(parse('<length>', 'clamp(0px, 1em, 2px)')).toBe('clamp(0px, 1em, 2px)')
        expect(parse('<length-percentage>', 'clamp(1px, 1%, 2px)')).toBe('clamp(1px, 1%, 2px)')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<number>', 'clamp(var(--min), var(--number), var(--max))', true))
            .toBe('clamp(var(--min), var(--number), var(--max))')
    })
})
describe('<round()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
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
        // <number> and <percentage> can not be combined
        expect(parse('<number> | <percentage>', 'round(1, 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'round(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
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
    it('parses and serializes round() resulting to 0???, 0???, NaN, or Infinity', () => {
        // Rounding 0??? or 0??? is preserved as is (it is a multiple of every number)
        expect(parse('<integer>', 'calc(1 / round(0 * -1, 1))')).toBe('calc(-infinity)')
        // Rounding up to 0 results to 0???
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
        // Rounding to nearest/zero with an infinite step value results to 0??? if input value is negative or 0??? (but finite)
        expect(parse('<integer>', 'calc(1 / round(-1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(-1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(0 * -1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(0 * -1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, -1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, -1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, 0 * -1, -infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(to-zero, 0 * -1, infinity))')).toBe('calc(-infinity)')
        // Rounding to nearest/zero with an infinite step value results to 0??? if input value is 0??? or positive (but finite)
        expect(parse('<integer>', 'round(0, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(0, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(1, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(1, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 0, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 0, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 1, -infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(to-zero, 1, infinity)')).toBe('calc(0)')
        // Rounding up with an infinite step value results to 0??? if input value is negative or 0??? (but finite)
        expect(parse('<integer>', 'calc(1 / round(up, 0 * -1, infinity))')).toBe('calc(-infinity)')
        expect(parse('<integer>', 'calc(1 / round(up, -1, infinity))')).toBe('calc(-infinity)')
        // Rounding up with an infinite step value results to the same input value if it is 0??? (but finite)
        expect(parse('<integer>', 'round(up, 0, infinity)')).toBe('calc(0)')
        // Rounding up with an infinite step value results to Infinity if input value is positive (but finite)
        expect(parse('<integer>', 'round(up, 1, infinity)')).toBe('calc(infinity)')
        // Rounding down with an infinite step value results to -Infinity if input value is negative (but finite)
        expect(parse('<integer>', 'round(down, -1, infinity)')).toBe('calc(-infinity)')
        // Rounding down with an infinite step value results to the same input value if it is 0???
        expect(parse('<integer>', 'calc(1 / round(down, 0 * -1, infinity))')).toBe('calc(-infinity)')
        // Rounding down with an infinite step value results to the same input value if it is 0??? or positive (but finite)
        expect(parse('<integer>', 'round(down, 0, infinity)')).toBe('calc(0)')
        expect(parse('<integer>', 'round(down, 1, infinity)')).toBe('calc(0)')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<number>', 'round(var(--strategy), var(--number), var(--step))', true))
            .toBe('round(var(--strategy), var(--number), var(--step))')
    })
})
describe('<mod()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
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
        // <number> and <percentage> can not be combined
        expect(parse('<number> | <percentage>', 'mod(1, 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'mod(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<number>', 'mod(var(--number), var(--modulus))', true))
            .toBe('mod(var(--number), var(--modulus))')
    })
})
describe('<rem()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
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
        // <number> and <percentage> can not be combined
        expect(parse('<number> | <percentage>', 'rem(1, 1%)')).toBe('')
        expect(parse('<number> | <percentage>', 'rem(1%, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
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
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<number>', 'rem(var(--number), var(--divisor))', true))
            .toBe('rem(var(--number), var(--divisor))')
    })
})
describe('<sin()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'sin(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'sin(keyword)')).toBe('')
        expect(parse('<number>', 'sin(1px)')).toBe('')
        expect(parse('<number>', 'sin(1%)')).toBe('')
        expect(parse('<number>', 'sin(1 + 1deg)')).toBe('')
        expect(parse('<number>', 'sin(1 - 1deg)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'sin(45)')).toBe(`calc(${+Math.sin(45).toFixed(6)})`)
        expect(parse('<number>', 'sin(45deg)')).toBe(`calc(${+Math.sin(toRadians(45)).toFixed(6)})`)
    })
    it('parses and serializes sin() resulting to 0???', () => {
        // 0??? as input value results as is
        expect(parse('<number>', 'calc(-1 / sin(0 * -1))')).toBe('calc(infinity)')
    })
})
describe('<cos()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'cos(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'cos(keyword)')).toBe('')
        expect(parse('<number>', 'cos(1px)')).toBe('')
        expect(parse('<number>', 'cos(1%)')).toBe('')
        expect(parse('<number>', 'cos(1 + 1deg)')).toBe('')
        expect(parse('<number>', 'cos(1 - 1deg)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'cos(45)')).toBe(`calc(${+Math.cos(45).toFixed(6)})`)
        expect(parse('<number>', 'cos(45deg)')).toBe(`calc(${+Math.cos(toRadians(45)).toFixed(6)})`)
    })
})
describe('<tan()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'tan(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'tan(keyword)')).toBe('')
        expect(parse('<number>', 'tan(1px)')).toBe('')
        expect(parse('<number>', 'tan(1%)')).toBe('')
        expect(parse('<number>', 'tan(1 + 1deg)')).toBe('')
        expect(parse('<number>', 'tan(1 - 1deg)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'tan(45)')).toBe(`calc(${+Math.tan(45).toFixed(6)})`)
        expect(parse('<number>', 'tan(45deg)')).toBe('calc(1)')
    })
    it('parses and serializes tan() resulting to 0???, Infinity, or -Infinity', () => {
        // 0??? as input value results as is
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
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<angle>', 'asin(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'asin(keyword)')).toBe('')
        expect(parse('<angle>', 'asin(1deg)')).toBe('')
        expect(parse('<angle>', 'asin(1px)')).toBe('')
        expect(parse('<angle>', 'asin(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'asin(0.5)')).toBe('calc(30deg)')
    })
})
describe('<acos()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<angle>', 'acos(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'acos(keyword)')).toBe('')
        expect(parse('<angle>', 'acos(1deg)')).toBe('')
        expect(parse('<angle>', 'acos(1px)')).toBe('')
        expect(parse('<angle>', 'acos(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'acos(0.5)')).toBe('calc(60deg)')
    })
})
describe('<atan()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<angle>', 'atan(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'atan(keyword)')).toBe('')
        expect(parse('<angle>', 'atan(1deg)')).toBe('')
        expect(parse('<angle>', 'atan(1px)')).toBe('')
        expect(parse('<angle>', 'atan(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'atan(0.5)')).toBe(`calc(${+toDegrees(Math.atan(0.5)).toFixed(6)}deg)`)
    })
})
describe('<atan2()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<angle>', 'atan2(1)')).toBe('')
        expect(parse('<angle>', 'atan2(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<angle>', 'atan2(1, keyword)')).toBe('')
        expect(parse('<angle>', 'atan2(1, 1px)')).toBe('')
        expect(parse('<angle>', 'atan2(1px, 1deg)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<angle>', 'atan2(1, 1)')).toBe(`calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan2(1px, 1px)')).toBe(`calc(${+toDegrees(Math.atan2(1, 1)).toFixed(6)}deg)`)
        expect(parse('<angle>', 'atan2(100px, 1cm)')).toBe(`calc(${+toDegrees(Math.atan2(100, 96 / 2.54)).toFixed(6)}deg)`)
    })
})
describe('<pow()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'pow(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'pow(1, keyword)')).toBe('')
        expect(parse('<number>', 'pow(1px, 1)')).toBe('')
        expect(parse('<number>', 'pow(1, 1px)')).toBe('')
        expect(parse('<number>', 'pow(1%, 1)')).toBe('')
        expect(parse('<number>', 'pow(1, 1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'pow(4, 2)')).toBe('calc(16)')
    })
})
describe('<sqrt()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'sqrt(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'sqrt(keyword)')).toBe('')
        expect(parse('<number>', 'sqrt(1px)')).toBe('')
        expect(parse('<number>', 'sqrt(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'sqrt(4)')).toBe('calc(2)')
    })
})
describe('<hypot()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'hypot(1, keyword)')).toBe('')
        expect(parse('<number>', 'hypot(1, 1px)')).toBe('')
        expect(parse('<number>', 'hypot(1, 1%)')).toBe('')
        expect(parse('<number>', 'hypot(1px, 1px)')).toBe('')
        expect(parse('<length>', 'hypot(1, 1)')).toBe('')
        expect(parse('<percentage>', 'hypot(1, 1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'hypot(3, 4)')).toBe('calc(5)')
    })
})
describe('<log()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'log(1, 1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'log(keyword)')).toBe('')
        expect(parse('<number>', 'log(1, keyword)')).toBe('')
        expect(parse('<number>', 'log(1px)')).toBe('')
        expect(parse('<number>', 'log(1%)')).toBe('')
        expect(parse('<number>', 'log(1, 1px)')).toBe('')
        expect(parse('<number>', 'log(1, 1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'log(e)')).toBe('calc(1)')
        expect(parse('<number>', 'log(8, 2)')).toBe('calc(3)')
    })
})
describe('<exp()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'exp(1, 1)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'exp(keyword)')).toBe('')
        expect(parse('<number>', 'exp(1px)')).toBe('')
        expect(parse('<number>', 'exp(1%)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'exp(1)')).toBe(`calc(${Math.E.toFixed(6)})`)
    })
})
describe('<abs()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'abs(keyword)')).toBe('')
        // Type mismatch
        expect(parse('<number>', 'abs(1px)')).toBe('')
        expect(parse('<length>', 'abs(1)')).toBe('')
        expect(parse('<percentage>', 'abs(1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'abs(-1)')).toBe('calc(1)')
        expect(parse('<number>', 'abs(-infinity)')).toBe('calc(infinity)')
        expect(parse('<length>', 'abs(-1px)')).toBe('calc(1px)')
    })
})
describe('<sign()>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        expect(parse('<number>', 'sign(keyword)')).toBe('')
        // Type mismatch
        expect(parse('<length>', 'sign(1px)')).toBe('')
        expect(parse('<length>', 'sign(1)')).toBe('')
        expect(parse('<percentage>', 'sign(1)')).toBe('')
    })
    it('parses and serializes a valid value', () => {
        expect(parse('<number>', 'sign(-2)')).toBe('calc(-1)')
        expect(parse('<number>', 'sign(-infinity)')).toBe('calc(-1)')
        expect(parse('<number>', 'sign(2px)')).toBe('calc(1)')
    })
})

describe('<color>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = [
            // Invalid <hex-color>
            '#ffz',
            '#1',
            '#12',
            '#12345',
            '#1234567',
            '#123456789',
            // Invalid legacy color syntax
            'rgb(0, 0 0)',
            'rgb(0 0 0 0)',
            'rgb(0, 0, 0 / 0)',
            'hwb(0, 0, 0, 0)',
        ]
        invalid.forEach(input => expect(parse('<color>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<color>', 'red', false, false)).toEqual({
            representation: 'red',
            type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']),
            value: 'red',
        })
        expect(parse('<color>', '#000', false, false)).toEqual({
            representation: '#000',
            type: new Set(['hash', 'hex-color', 'absolute-color-base', 'color']),
            value: '000',
        })
        expect(parse('<color>', 'rgb(0, 0, 0)', false, false)).toEqual({
            name: 'rgb',
            type: new Set(['function', 'rgb()', 'absolute-color-base', 'color']),
            value: createList([
                list([
                    { location: -1, representation: '0', type: new Set(['integer', 'number']), value: 0 },
                    { location: 0, representation: '0', type: new Set(['integer', 'number']), value: 0 },
                    { location: 3, representation: '0', type: new Set(['integer', 'number']), value: 0 },
                ], ',', -1),
                omitted(',', 6),
                omitted('<alpha-value> | none', 6),
            ]),
        })
    })
    it('parses and serializes <hex-color> to legacy <rgb()> or <rgba()>', () => {
        expect(parse('<color>', '#F00')).toBe('rgb(255, 0, 0)')
        expect(parse('<color>', '#0f0f')).toBe('rgb(0, 255, 0)')
        expect(parse('<color>', '#0f06')).toBe('rgba(0, 255, 0, 0.4)')
        expect(parse('<color>', '#0000ff')).toBe('rgb(0, 0, 255)')
        expect(parse('<color>', '#ff00ffff')).toBe('rgb(255, 0, 255)')
        expect(parse('<color>', '#ff00ff66')).toBe('rgba(255, 0, 255, 0.4)')
    })
    it('parses and serializes <rgb()> or <rgba()> to legacy <rgb()> or <rgba()>', () => {
        // To legacy <rgb()> or <rgba()> depending on <alpha-value>
        expect(parse('<color>', 'rgb(0 0 0)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'rgb(0 0 0 / 0)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgb(0 0 0 / 1)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'rgba(0 0 0)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'rgba(0 0 0 / 0)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgba(0 0 0 / 1)')).toBe('rgb(0, 0, 0)')
        // From legacy color syntax
        expect(parse('<color>', 'rgb(0, 0, 0)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'rgb(0, 0, 0, 0)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgb(0, 0, 0, 1)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'rgba(0, 0, 0)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'rgba(0, 0, 0, 0)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgba(0, 0, 0, 1)')).toBe('rgb(0, 0, 0)')
        // Out of range arguments
        expect(parse('<color>', 'rgb(-1 0 0 / -1)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgb(256 0 0 / 2)')).toBe('rgb(255, 0, 0)')
        // Map <percentage> to <number>
        expect(parse('<color>', 'rgb(-1% 0% 0% / -1%)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgb(101% 100% 100% / 101%)')).toBe('rgb(255, 255, 255)')
        // Map `none` to `0`
        expect(parse('<color>', 'rgb(none 0 0 / none)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgb(none 0% 0%)')).toBe('rgb(0, 0, 0)')
        // Math function
        expect(parse('<color>', 'rgb(calc(-1) 0 0 / calc(-1))')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgb(calc(256) 0 0 / calc(2))')).toBe('rgb(255, 0, 0)')
        expect(parse('<color>', 'rgb(calc(-1%) 0% 0% / calc(-1%))')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'rgb(calc(101%) 0% 0% / calc(101%))')).toBe('rgb(255, 0, 0)')
        // Precision (browser conformance: 8 bit integers)
        expect(parse('<color>', 'rgb(127.499 0 0 / 0.498)')).toBe('rgba(127, 0, 0, 0.498)')
        expect(parse('<color>', 'rgb(127.501 0 0 / 0.499)')).toBe('rgba(128, 0, 0, 0.498)')
        expect(parse('<color>', 'rgb(0 0 0 / 0.501)')).toBe('rgba(0, 0, 0, 0.5)')
        expect(parse('<color>', 'rgb(49.9% 50.1% 0% / 49.9%)')).toBe('rgba(127, 128, 0, 0.498)')
        expect(parse('<color>', 'rgb(0.501 0.499 0 / 50.1%)')).toBe('rgba(1, 0, 0, 0.5)')
    })
    it('parses and serializes <hsl()> or <hsla()> to legacy <rgb()> or <rgba()>', () => {
        // To legacy <rgb()> or <rgba()> depending on <alpha-value>
        expect(parse('<color>', 'hsl(0 1% 2%)')).toBe('rgb(5, 5, 5)')
        expect(parse('<color>', 'hsl(0 1% 2% / 0)')).toBe('rgba(5, 5, 5, 0)')
        expect(parse('<color>', 'hsl(0 1% 2% / 1)')).toBe('rgb(5, 5, 5)')
        expect(parse('<color>', 'hsla(0 1% 2%)')).toBe('rgb(5, 5, 5)')
        expect(parse('<color>', 'hsla(0 1% 2% / 0)')).toBe('rgba(5, 5, 5, 0)')
        expect(parse('<color>', 'hsla(0 1% 2% / 1)')).toBe('rgb(5, 5, 5)')
        // From legacy color syntax
        expect(parse('<color>', 'hsl(0, 0%, 0%)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'hsl(0, 0%, 0%, 0)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'hsl(0, 0%, 0%, 100%)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'hsla(0, 0%, 0%)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'hsla(0, 0%, 0%, 0%)')).toBe('rgba(0, 0, 0, 0)')
        expect(parse('<color>', 'hsla(0, 0%, 0%, 1)')).toBe('rgb(0, 0, 0)')
        // Out of range arguments
        expect(parse('<color>', 'hsl(-540 -1% 50% / -1)')).toBe('rgba(128, 128, 128, 0)')
        expect(parse('<color>', 'hsl(540 101% 50% / 2)')).toBe('rgb(0, 255, 255)')
        expect(parse('<color>', 'hsl(-540deg 100% 50% / -1%)')).toBe('rgba(0, 255, 255, 0)')
        expect(parse('<color>', 'hsl(540deg 100% 50% / 101%)')).toBe('rgb(0, 255, 255)')
        // Map `none` to `0`
        expect(parse('<color>', 'hsl(none 100% 50% / none)')).toBe('rgba(255, 0, 0, 0)')
        expect(parse('<color>', 'hsl(0 none none)')).toBe('rgb(0, 0, 0)')
        // Math function
        expect(parse('<color>', 'hsl(calc(-540) calc(101%) calc(50%) / calc(-1))')).toBe('rgba(0, 255, 255, 0)')
        expect(parse('<color>', 'hsl(calc(540) 100% 50% / calc(2))')).toBe('rgb(0, 255, 255)')
        expect(parse('<color>', 'hsl(calc(-540deg) 100% 50% / calc(-1%))')).toBe('rgba(0, 255, 255, 0)')
        expect(parse('<color>', 'hsl(calc(540deg) 100% 50% / 101%)')).toBe('rgb(0, 255, 255)')
        // Precision (browser conformance: 8 bit integers)
        expect(parse('<color>', 'hsl(0.498 100% 49.8% / 0.498)')).toBe('rgba(254, 2, 0, 0.498)')
        expect(parse('<color>', 'hsl(0.499 100% 49.9% / 0.499)')).toBe('rgba(254, 2, 0, 0.498)')
        expect(parse('<color>', 'hsl(0.501 100% 50.1% / 0.501)')).toBe('rgba(255, 3, 1, 0.5)')
        expect(parse('<color>', 'hsl(0 100% 50% / 49.9%)')).toBe('rgba(255, 0, 0, 0.498)')
        expect(parse('<color>', 'hsl(0 100% 50% / 50.1%)')).toBe('rgba(255, 0, 0, 0.5)')
    })
    it('parses and serializes <hwb()> to legacy <rgb()> or <rgba()>', () => {
        // To legacy <rgb()> or <rgba()> depending on <alpha-value>
        expect(parse('<color>', 'hwb(0 1% 2%)')).toBe('rgb(250, 3, 3)')
        expect(parse('<color>', 'hwb(0 1% 2% / 0)')).toBe('rgba(250, 3, 3, 0)')
        expect(parse('<color>', 'hwb(0 1% 2% / 1)')).toBe('rgb(250, 3, 3)')
        // Out of range arguments
        expect(parse('<color>', 'hwb(-540 0% 0% / -1)')).toBe('rgba(0, 255, 255, 0)')
        expect(parse('<color>', 'hwb(540 0% 0% / 2)')).toBe('rgb(0, 255, 255)')
        expect(parse('<color>', 'hwb(-540deg 0% 0% / -1%)')).toBe('rgba(0, 255, 255, 0)')
        expect(parse('<color>', 'hwb(-540deg 0% 0% / 101%)')).toBe('rgb(0, 255, 255)')
        expect(parse('<color>', 'hwb(0 -1% 101%)')).toBe('rgb(0, 0, 0)')
        expect(parse('<color>', 'hwb(0 101% -1%)')).toBe('rgb(255, 255, 255)')
        // Map `none` to `0` (deviates from the specification but it is browsers conformant)
        expect(parse('<color>', 'hwb(none none none / none)')).toBe('rgba(255, 0, 0, 0)')
        expect(parse('<color>', 'hwb(0 none none)')).toBe('rgb(255, 0, 0)')
        // Math function
        expect(parse('<color>', 'hwb(calc(-540) calc(0%) calc(0%) / calc(-1))')).toBe('rgba(0, 255, 255, 0)')
        expect(parse('<color>', 'hwb(calc(540) 0% 0% / calc(2))')).toBe('rgb(0, 255, 255)')
        expect(parse('<color>', 'hwb(calc(-540deg) 0% 0% / calc(-1%))')).toBe('rgba(0, 255, 255, 0)')
        expect(parse('<color>', 'hwb(calc(540deg) 0% 0% / calc(101%))')).toBe('rgb(0, 255, 255)')
        // Precision (browser conformance: 8 bit integers)
        expect(parse('<color>', 'hwb(0.498 0% 49.8% / 0.498)')).toBe('rgba(128, 1, 0, 0.498)')
        expect(parse('<color>', 'hwb(0.499 0% 49.9% / 0.499)')).toBe('rgba(128, 1, 0, 0.498)')
        expect(parse('<color>', 'hwb(0.501 0% 50.1% / 0.501)')).toBe('rgba(127, 1, 0, 0.5)')
        expect(parse('<color>', 'hwb(0 0% 0% / 49.8%)')).toBe('rgba(255, 0, 0, 0.498)')
        expect(parse('<color>', 'hwb(0 0% 0% / 49.9%)')).toBe('rgba(255, 0, 0, 0.498)')
        expect(parse('<color>', 'hwb(0 0% 0% / 50.1%)')).toBe('rgba(255, 0, 0, 0.5)')
    })
    it('parses and serializes <lab()>', () => {
        // Out of range arguments
        expect(parse('<color>', 'lab(-1 -126 0 / -1)')).toBe('lab(0 -126 0 / 0)')
        expect(parse('<color>', 'lab(101 126 0 / 2)')).toBe('lab(101 126 0)')
        expect(parse('<color>', 'lab(0 0 0 / -1%)')).toBe('lab(0 0 0 / 0)')
        expect(parse('<color>', 'lab(0 0 0 / 101%)')).toBe('lab(0 0 0)')
        // Map <percentage> to <number>
        expect(parse('<color>', 'lab(-1% -101% 0% / -1%)')).toBe('lab(0 -126.25 0 / 0)')
        expect(parse('<color>', 'lab(101% 101% 0% / 101%)')).toBe('lab(101 126.25 0)')
        // Preserve `none`
        expect(parse('<color>', 'lab(none none none / none)')).toBe('lab(none none none / none)')
        // Math function
        expect(parse('<color>', 'lab(calc(-1) calc(-126) 0 / calc(-1))')).toBe('lab(0 -126 0 / 0)')
        expect(parse('<color>', 'lab(calc(101) calc(126) 0 / calc(2))')).toBe('lab(101 126 0)')
        expect(parse('<color>', 'lab(calc(-1%) calc(-101%) 0 / calc(-1%))')).toBe('lab(0 -126.25 0 / 0)')
        expect(parse('<color>', 'lab(calc(101%) calc(101%) 0 / calc(101%))')).toBe('lab(101 126.25 0)')
        // Precision (browser conformance: TBD, at least 16 bit)
        expect(parse('<color>', 'lab(0.0000001 0.0000001 0 / 0.499)')).toBe('lab(0 0 0 / 0.498)')
        expect(parse('<color>', 'lab(0.00000051 0.00000051 0 / 0.501)')).toBe('lab(0.000001 0.000001 0 / 0.5)')
        expect(parse('<color>', 'lab(0.0000001% 0.0000001% 0 / 49.9%)')).toBe('lab(0 0 0 / 0.498)')
        expect(parse('<color>', 'lab(0.00000051% 0.00000041% 0 / 50.1%)')).toBe('lab(0.000001 0.000001 0 / 0.5)')
    })
    it('parses and serializes <lch()>', () => {
        // Out of range arguments
        expect(parse('<color>', 'lch(-1 -1 -540 / -1)')).toBe('lch(0 0 180 / 0)')
        expect(parse('<color>', 'lch(101 151 540 / 2)')).toBe('lch(101 151 180)')
        // Map <angle> and <percentage> to <number>
        expect(parse('<color>', 'lch(-1% -1% -540deg / -1%)')).toBe('lch(0 0 180 / 0)')
        expect(parse('<color>', 'lch(101% 101% 540deg / 101%)')).toBe('lch(101 151.5 180)')
        // Preserve `none`
        expect(parse('<color>', 'lch(none none none / none)')).toBe('lch(none none none / none)')
        // Math function
        expect(parse('<color>', 'lch(calc(-1) calc(-1) calc(-540) / calc(-1))')).toBe('lch(0 0 180 / 0)')
        expect(parse('<color>', 'lch(calc(101) calc(151) calc(540) / calc(2))')).toBe('lch(101 151 180)')
        expect(parse('<color>', 'lch(calc(-1%) calc(-1%) calc(-540deg) / calc(-1%))')).toBe('lch(0 0 180 / 0)')
        expect(parse('<color>', 'lch(calc(101%) calc(101%) calc(540deg) / calc(101%))')).toBe('lch(101 151.5 180)')
        // Precision (browser conformance: TBD, at least 16 bit)
        expect(parse('<color>', 'lch(0.0000001 0.0000001 0.0000001 / 0.499)')).toBe('lch(0 0 0 / 0.498)')
        expect(parse('<color>', 'lch(0.00000051 0.00000051 0.00000051 / 0.501)')).toBe('lch(0.000001 0.000001 0.000001 / 0.5)')
        expect(parse('<color>', 'lch(0.0000001% 0.0000003% 0.0000001deg / 49.9%)')).toBe('lch(0 0 0 / 0.498)')
        expect(parse('<color>', 'lch(0.00000051% 0.00000041% 0.00000051deg / 50.1%)')).toBe('lch(0.000001 0.000001 0.000001 / 0.5)')
    })
    it('parses and serializes <oklab()>', () => {
        // Out of range arguments
        expect(parse('<color>', 'oklab(-1 -0.41 0 / -1)')).toBe('oklab(0 -0.41 0 / 0)')
        expect(parse('<color>', 'oklab(1.1 0.41 0 / 2)')).toBe('oklab(1.1 0.41 0)')
        // Map <percentage> to <number>
        expect(parse('<color>', 'oklab(-1% -101% 0 / -1%)')).toBe('oklab(0 -0.404 0 / 0)')
        expect(parse('<color>', 'oklab(101% 101% 0 / 101%)')).toBe('oklab(1.01 0.404 0)')
        // Preserve `none`
        expect(parse('<color>', 'oklab(none none none / none)')).toBe('oklab(none none none / none)')
        // Math function
        expect(parse('<color>', 'oklab(calc(-1) calc(-0.41) calc(0) / calc(-1))')).toBe('oklab(0 -0.41 0 / 0)')
        expect(parse('<color>', 'oklab(calc(1.1) calc(0.41) calc(0) / calc(2))')).toBe('oklab(1.1 0.41 0)')
        expect(parse('<color>', 'oklab(calc(-1%) calc(-101%) calc(0) / calc(-1%))')).toBe('oklab(0 -0.404 0 / 0)')
        expect(parse('<color>', 'oklab(calc(101%) calc(101%) calc(0) / calc(101%))')).toBe('oklab(1.01 0.404 0)')
        // Precision (browser conformance: TBD, at least 16 bit)
        expect(parse('<color>', 'oklab(0.0000001 0.0000001 0 / 0.499)')).toBe('oklab(0 0 0 / 0.498)')
        expect(parse('<color>', 'oklab(0.00000051 0.00000051 0 / 0.501)')).toBe('oklab(0.000001 0.000001 0 / 0.5)')
        expect(parse('<color>', 'oklab(0.00001% 0.0001% 0 / 49.9%)')).toBe('oklab(0 0 0 / 0.498)')
        expect(parse('<color>', 'oklab(0.00005% 0.00013% 0 / 50.1%)')).toBe('oklab(0.000001 0.000001 0 / 0.5)')
    })
    it('parses and serializes <oklch()>', () => {
        // Out of range arguments
        expect(parse('<color>', 'oklch(-1 -1 -540 / -1)')).toBe('oklch(0 0 180 / 0)')
        expect(parse('<color>', 'oklch(1.1 0.41 540 / 2)')).toBe('oklch(1.1 0.41 180)')
        // Map <angle> and <percentage> to <number>
        expect(parse('<color>', 'oklch(-1% -1% -540deg / -1%)')).toBe('oklch(0 0 180 / 0)')
        expect(parse('<color>', 'oklch(101% 101% 540deg / 101%)')).toBe('oklch(1.01 0.404 180)')
        // Preserve `none`
        expect(parse('<color>', 'oklch(none none none / none)')).toBe('oklch(none none none / none)')
        // Math function
        expect(parse('<color>', 'oklch(calc(-1) calc(-1) calc(-540) / calc(-1))')).toBe('oklch(0 0 180 / 0)')
        expect(parse('<color>', 'oklch(calc(1.1) calc(0.41) calc(540) / calc(2))')).toBe('oklch(1.1 0.41 180)')
        expect(parse('<color>', 'oklch(calc(-1%) calc(-1%) calc(-540deg) / calc(-1%))')).toBe('oklch(0 0 180 / 0)')
        expect(parse('<color>', 'oklch(calc(101%) calc(101%) calc(540deg) / calc(101%))')).toBe('oklch(1.01 0.404 180)')
        // Precision (browser conformance: TBD, at least 16 bit)
        expect(parse('<color>', 'oklch(0.0000001 0.0000001 0.0000001 / 0.499)')).toBe('oklch(0 0 0 / 0.498)')
        expect(parse('<color>', 'oklch(0.00000051 0.00000051 0.00000051 / 0.501)')).toBe('oklch(0.000001 0.000001 0.000001 / 0.5)')
        expect(parse('<color>', 'oklch(0.00001% 0.0001% 0.0000001deg / 49.9%)')).toBe('oklch(0 0 0 / 0.498)')
        expect(parse('<color>', 'oklch(0.00005% 0.00013% 0.00000051deg / 50.1%)')).toBe('oklch(0.000001 0.000001 0.000001 / 0.5)')
    })
    it('parses and serializes <color()>', () => {
        // Explicit `xyz` color space
        expect(parse('<color>', 'color(xyz 0 0 0)')).toBe('color(xyz-d65 0 0 0)')
        // Out of range arguments
        // TODO: implement CSS gamut mapping
        // Map <percentage> to <number>
        expect(parse('<color>', 'color(srgb 0% 100% calc(100%))')).toBe('color(srgb 0 1 1)')
        // Preserve `none`
        // TODO: resolve https://github.com/w3c/csswg-drafts/issues/7136
        // expect(parse('<color>', 'color(srgb none none none / none)')).toBe('color(srgb none none none / none)')
        // Math function
        expect(parse('<color>', 'color(srgb calc(1) calc(100%) 0)')).toBe('color(srgb 1 1 0)')
        // Precision (browser conformance: TBD, at least 10 to 16 bits depending on the color space)
        expect(parse('<color>', 'color(srgb 0.0000001 0 0 / 0.499)')).toBe('color(srgb 0 0 0 / 0.498)')
        expect(parse('<color>', 'color(srgb 0.00000051 0 0 / 0.501)')).toBe('color(srgb 0.000001 0 0 / 0.5)')
        expect(parse('<color>', 'color(srgb 0.00001% 0 0 / 49.9%)')).toBe('color(srgb 0 0 0 / 0.498)')
        expect(parse('<color>', 'color(srgb 0.00005% 0 0 / 50.1%)')).toBe('color(srgb 0.000001 0 0 / 0.5)')
    })
    it('parses and serializes a value defined with a <var()>', () => {
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
    it('parses and serializes an invalid value to an empty string', () => {
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
    it('parses and serializes case-insensitively', () => {
        expect(parse('<position>', 'LEFt 0%')).toBe('left 0%')
    })
    it('parses and serializes a value defined with a <var()>', () => {
        expect(parse('<position>', 'var(--position)', true)).toBe('var(--position)')
        expect(parse('<position>', 'top var(--position)', true)).toBe('top var(--position)')
    })
})
describe('<basic-shape>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
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
    it('parses and serializes a valid value', () => {
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
    it('parses and serializes a value defined with a math function', () => {
        const input = [
            ['circle(calc(25% * 2) at calc(50% * 2))', 'circle(calc(50%) at calc(100%) center)'],
            ['ellipse(calc(25px * 2) calc(25px * 2) at calc(25px * 2))', 'ellipse(calc(50px) calc(50px) at calc(50px) center)'],
            ['inset(calc(5% * 2) round calc(1% * 2))', 'inset(calc(10%) round calc(2%))'],
            ['polygon(calc(1% + 1%) calc(1px + 1px))', 'polygon(calc(2%) calc(2px))'],
        ]
        input.forEach(([value, expected = value]) => expect(parse('<basic-shape>', value)).toBe(expected))
    })
    it('parses and serializes a value defined with a <var()>', () => {
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
    it('parses and serializes an invalid value to an empty string', () => {
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
    it('parses and serializes a valid conic gradient value', () => {
        [
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
    it('parses and serializes a valid linear gradient value', () => {
        [
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
    it('parses and serializes a valid radial gradient value', () => {
        [
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
    it('parses and serializes a value defined with a math function', () => {
        [
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
    it('parses and serializes a value defined with a <var()>', () => {
        [
            'conic-gradient(var(--config))',
            'linear-gradient(var(--config))',
            'radial-gradient(var(--config))',
        ].forEach(input => expect(parse('<gradient>', input, true)).toBe(input))
    })
})

describe('<selector-list>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = [
            '"string"',
            '1px',
            '#000',
            // Invalid whitespace
            'col | | td',
            'svg| *',
            'svg| a',
            '*| a',
            '. class',
            ': hover',
            ': not(.valid)',
            ': before',
            ': :before',
            ':: before',
            '[attr~ =value]',
            '[attr| =value]',
            '[attr^ =value]',
            '[attr$ =value]',
            '[attr* =value]',
            // Undeclared namespace
            'undeclared|*',
            '[undeclared|attr~ =value]',
            // Invalid pseudo-class name
            ':hover()',
            ':marker',
            ':marker()',
            ':not',
            // Invalid pseudo-element name
            '::hover',
            '::not',
            // Invalid functional pseudo-class name
            '::hover()',
            '::marker()',
            '::not()',
            // Invalid functional pseudo-class arguments
            ':current(::before)',
            ':not(::before)',
            ':nth-child(keyword)',
            ':nth-child("string")',
            ':nth-child(1px)',
            ':nth-child(+ n)',
            ':nth-child(+ n-1)',
            ':nth-child(+ n- 1)',
            ':nth-child(+ n -1)',
            ':nth-child(+ n - 1)',
            // Invalid pseudo-classing pseudo-element
            '::before:root',
            '::before:lang(fr)',
            // Invalid sub-pseudo-element
            '::before::first-line',
            // Invalid pseudo-element combination (no internal structure)
            '::first-letter + span',
        ]
        invalid.forEach(input => expect(parse('<selector-list>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        const classSelector = list([
            { location: -1, type: new Set(['delimiter']), value: '.' },
            { location: 0, representation: 'class', type: new Set(['ident', 'ident-token']), value: 'class' },
        ])
        classSelector.type.add('class-selector')
        classSelector.type.add('subclass-selector')
        const compoundSelector = list([
            omitted('<type-selector>', -1),
            list([classSelector]),
            list([], ' ', 1),
        ])
        compoundSelector.type.add('compound-selector')
        const complexSelector = list([compoundSelector, list([], ' ', 1)])
        complexSelector.type.add('complex-selector')
        expect(parse('<selector-list>', '.class', false, false)).toEqual(createList(
            [complexSelector],
            ',',
            new Set(['complex-selector-list', 'selector-list'])))
    })
    it('parses and serializes a valid value', () => {
        const valid = [
            // No extra whitespace
            ['#id.class[*|attr^=value]:hover > [attr=value]::before'],
            ['html|*'],
            ['html|a'],
            ['*|a'],
            ['|a'],
            ['col || td'],
            // Pseudo-class and pseudo-element name is case-insensitive
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
            // Special parsing of <forgiving-selector-list>
            [':is(, valid, 0, #valid, undeclared|*, .valid, ::before, :hover)', ':is(valid, #valid, .valid, :hover)'],
            [':where(, valid, 0, #valid, undeclared|*, .valid, ::before, :hover)', ':where(valid, #valid, .valid, :hover)'],
            // Special parsing of <forgiving-relative-selector-list>
            [':has(, valid, 0, #valid, undeclared|*, .valid, ::before, :hover)', ':has(valid, #valid, .valid, ::before, :hover)'],
            // Special parsing of <an+b>
            [':nth-child(even)', ':nth-child(2n)'],
            [':nth-child(odd)', ':nth-child(2n+1)'],
            [':nth-child(1)'],
            [':nth-child(1n)', ':nth-child(n)'],
            [':nth-child(n)'],
            [':nth-child(+n)', ':nth-child(n)'],
            [':nth-child(-n)', ':nth-child(-n)'],
            [':nth-child(1n-1)', ':nth-child(n-1)'],
            [':nth-child(n-1)'],
            [':nth-child(+n-1)', ':nth-child(n-1)'],
            [':nth-child(-n-1)'],
            [':nth-child(1n -1)', ':nth-child(n-1)'],
            [':nth-child(n -1)', ':nth-child(n-1)'],
            [':nth-child(+n -1)', ':nth-child(n-1)'],
            [':nth-child(-n -1)', ':nth-child(-n-1)'],
            [':nth-child(1n -1)', ':nth-child(n-1)'],
            [':nth-child(n- 1)', ':nth-child(n-1)'],
            [':nth-child(+n- 1)', ':nth-child(n-1)'],
            [':nth-child(-n- 1)', ':nth-child(-n-1)'],
            [':nth-child(1n - 1)', ':nth-child(n-1)'],
            [':nth-child(1n - 1)', ':nth-child(n-1)'],
            [':nth-child(1n + 1)', ':nth-child(n+1)'],
            [':nth-child(n - 1)', ':nth-child(n-1)'],
            [':nth-child(n + 1)', ':nth-child(n+1)'],
            [':nth-child(+n - 1)', ':nth-child(n-1)'],
            [':nth-child(+n + 1)', ':nth-child(n+1)'],
            [':nth-child(-n - 1)', ':nth-child(-n-1)'],
            [':nth-child(-n + 1)', ':nth-child(-n+1)'],
            [':nth-child(1 of type)'],
            [':nth-last-child(1 of type)'],
        ]
        valid.forEach(([input, expected = input]) =>
            expect(parse('<selector-list>', input, false, true, ['*', 'html']))
                .toBe(expected))
    })
})
describe('<media-query>', () => {
    it.todo('parses (color) to a representation with the expected properties')
    it.todo('parses (aspect-ratio: 4/3) to a representation with the expected properties')
    it.todo('parses (width < 1px) to a representation with the expected properties')
})
describe('<declaration>', () => {
    it('parses and serializes an invalid value to an empty string', () => {
        const invalid = [
            'color; red',
            'color: ',
            'color: ;',
            'color:: red',
            'color: red;',
        ]
        invalid.forEach(input => expect(parse('<declaration>', input)).toBe(''))
    })
    it('parses a valid value to the expected representation', () => {
        expect(parse('<declaration>', 'color: green !important', false, false)).toEqual({
            important: true,
            name: 'color',
            type: new Set(['declaration']),
            value: {
                representation: 'green',
                type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']),
                value: 'green',
            },
        })
    })
    it('parses and serializes a declaration for a custom property', () => {
        const input = '--custom: green'
        expect(parse('<declaration>', input)).toBe(input)
    })
    it('parses and serializes a declaration of a custom variable', () => {
        const input = 'color: var(--custom)'
        expect(parse('<declaration>', input)).toBe(input)
    })
    it('parses and serializes a declaration of a CSS wide keyword', () => {
        const input = 'color: initial'
        expect(parse('<declaration>', input)).toBe(input)
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
    it('transforms a single value without side effect but preserving instance properties', () => {
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
    it('transforms a list of values without side effect but preserving instance properties', () => {
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
