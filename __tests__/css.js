
const { install } = require('../lib/index.js')

let CSS

beforeAll(() => {
    install()
    ;({ CSS } = globalThis)
})

describe('CSS.escape()', () => {
    it('serializes the given value', () => {
        const values = [
            ['\0', '�'],
            ['\u0001', '\\1 '],
            ['\u007f', '\\7f '],
            ['0', '\\30 '],
            ['-0', '-\\30 '],
            ['-', '\\-'],
            ['·-_09AZaz'],
            ['[`', '\\[\\`'],
        ]
        values.forEach(([input, expected = input]) => expect(CSS.escape(input)).toBe(expected))
    })
})
describe('CSS.supports()', () => {
    it('returns whether it supports the given property declaration', () => {
        expect(CSS.supports(' color', 'red')).toBeFalsy()
        expect(CSS.supports(' color', 'red !important')).toBeFalsy()
        expect(CSS.supports('COLOR', 'green')).toBeTruthy()
    })
    it('returns whether it supports the given feature condition', () => {
        const conditions = [
            // <supports-decl>
            ['(unsupported: 1)', false],
            ['(color: unsupported)', false],
            ['(color: green) and (color: green)'],
            ['(color: unsupported) and (color: green)', false],
            ['(color: unsupported) and (color: unsupported)', false],
            ['(color: green) or (color: green)'],
            ['(color: unsupported) or (color: green)'],
            ['(color: unsupported) or (color: unsupported)', false],
            ['((color: unsupported) and (color: unsupported)) or (color: green)'],
            ['((color: unsupported) or (color: green)) and (color: green)'],
            ['not (unsupported: 1)'],
            ['not (color: green)', false],
            ['not (color: unsupported)'],
            ['(--custom: 1)'],
            ['(grid-gap: 1px)'],
            ['(-webkit-box-align: center)'],
            ['(color: green !important)'],
            // <general-enclosed>
            ['general(enclosed)', false],
            // <supports-decl> not nested in parens
            ['color: green'],
            // <supports-font-format-fn>
            ['font-format(woff)'],
            // <supports-font-tech-fn>
            ['font-tech(color-svg)'],
            // <supports-selector-fn>
            ['selector(undeclared|*)', false],
            ['selector(type + .class)'],
        ]
        conditions.forEach(([condition, expected = true]) => expect(CSS.supports(condition)).toBe(expected))
    })
})
