
const { install } = require('../lib/index.js')
const {
    INVALID_CUSTOM_PROPERTY_NAME,
    INVALID_CUSTOM_PROPERTY_OVERRIDE,
    INVALID_CUSTOM_PROPERTY_SYNTAX,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL,
    MISSING_INITIAL_CUSTOM_PROPERTY_VALUE,
} = require('../lib/cssom/CSS-impl.js')

install()
globalThis.document = { _registeredPropertySet: [] }

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
describe('CSS.registerProperty()', () => {
    it('throws an error when the given definition is invalid', () => {
        const invalid = [
            [{ inherits: true, initialValue: 'any', name: 'custom', syntax: '*' }, INVALID_CUSTOM_PROPERTY_NAME],
            [{ inherits: true, initialValue: 'any', name: '--registered', syntax: '*' }, INVALID_CUSTOM_PROPERTY_OVERRIDE],
            [{ inherits: true, name: '--custom', syntax: '<color>' }, MISSING_INITIAL_CUSTOM_PROPERTY_VALUE],
            [{ inherits: true, initialValue: 'any', name: '--custom', syntax: '<unknown>' }, INVALID_CUSTOM_PROPERTY_SYNTAX],
            [{ inherits: true, initialValue: ';', name: '--custom', syntax: '*' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL],
            [{ inherits: true, initialValue: '', name: '--custom', syntax: '<length>' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL],
            [{ inherits: true, initialValue: '1', name: '--custom', syntax: '<length>' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE],
            [{ inherits: true, initialValue: 'initial', name: '--custom', syntax: '<length>' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE],
            [{ inherits: true, initialValue: 'var(--custom)', name: '--custom', syntax: '<length>' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE],
            [{ inherits: true, initialValue: '1em', name: '--custom', syntax: '<length>' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE],
            [{ inherits: true, initialValue: 'calc(1em + 1px)', name: '--custom', syntax: '<length>' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE],
            [{ inherits: true, initialValue: 'initial', name: '--custom', syntax: '*' }, INVALID_INITIAL_CUSTOM_PROPERTY_VALUE],
        ]
        document._registeredPropertySet.push({
            inherits: true,
            initialValue: 'green',
            name: '--registered',
            syntax: '<color>',
        })
        invalid.forEach(([definition, error]) => expect(() => CSS.registerProperty(definition)).toThrow(error))
    })
    it('registers a valid definition', () => {
        const valid = [
            { inherits: true, name: '--custom-1', syntax: '*' },
            { inherits: true, initialValue: '', name: '--custom-2', syntax: '*' },
            { inherits: true, initialValue: ' \f\n\r\t', name: '--custom-3', syntax: '*' },
            { inherits: true, initialValue: 'env(name)', name: '--custom-4', syntax: '*' },
            { inherits: true, initialValue: 'var(--custom)', name: '--custom-5', syntax: '*' },
            { inherits: true, initialValue: 'first-valid(1px)', name: '--custom-6', syntax: '*' },
        ]
        const register = globalThis.document._registeredPropertySet
        valid.forEach(property => {
            CSS.registerProperty(property)
            expect(register.some(definition => definition.name === property.name)).toBeTruthy()
        })
    })
})
describe('CSS.supports()', () => {
    it('returns whether it supports the given property declaration', () => {
        const declarations = [
            [' color', 'red', false],
            ['color ', 'red', false],
            ['color/**/', 'red', false],
            ['color', 'red !important', false],
            ['COLOR', 'green'],
            ['--custom', '1'],
            ['color', 'initial'],
            ['color', 'var(--custom)'],
            ['color', 'first-valid(green)'],
            ['grid-gap', '1px'],
            ['-webkit-box-align', 'center'],
        ]
        declarations.forEach(([property, value, expected = true]) =>
            expect(CSS.supports(property, value)).toBe(expected))
    })
    it('returns whether it supports the given feature condition', () => {
        // Complete test is in __tests__/match.js
        expect(CSS.supports('general(enclosed)')).toBeFalsy()
        expect(CSS.supports('color: green')).toBeTruthy()
    })
})
