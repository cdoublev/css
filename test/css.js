
import {
    INVALID_CUSTOM_PROPERTY_NAME,
    INVALID_CUSTOM_PROPERTY_OVERRIDE,
    INVALID_CUSTOM_PROPERTY_SYNTAX,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL,
    MISSING_INITIAL_CUSTOM_PROPERTY_VALUE,
} from '../lib/error.js'
import { describe, it } from 'node:test'
import assert from 'node:assert'
import { install } from '@cdoublev/css'

install()

const registeredProperties = new Map
globalThis.document = { _registeredProperties: registeredProperties }

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
        values.forEach(([input, expected = input]) => assert.equal(CSS.escape(input), expected))
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
        registeredProperties.set('--registered', { inherits: true, initialValue: 'green', syntax: '<color>' })
        invalid.forEach(([definition, error]) => assert.throws(() => CSS.registerProperty(definition), error))
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
        valid.forEach(property => {
            CSS.registerProperty(property)
            assert.equal(registeredProperties.has(property.name), true)
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
            assert.equal(CSS.supports(property, value), expected))
    })
    it('returns whether it supports the given feature condition', () => {
        // Complete test is in test/match.js
        assert.equal(CSS.supports('general(enclosed)'), false)
        assert.equal(CSS.supports('color: green'), true)
    })
})
