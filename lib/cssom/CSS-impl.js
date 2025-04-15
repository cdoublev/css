
const { isComputationallyIndependent, isList } = require('../utils/value.js')
const { parseCSSDeclaration, parseCSSGrammar } = require('../parse/parser.js')
const { serializeIdentifier, serializeCSSComponentValue } = require('../serialize.js')
const { keywords: cssWideKeywords } = require('../values/substitutions.js')
const matchSupport = require('../match/support.js')

const INVALID_CUSTOM_PROPERTY_NAME = {
    message: 'Invalid name',
    type: SyntaxError,
}
const INVALID_CUSTOM_PROPERTY_OVERRIDE = {
    message: 'Cannot override an existing custom property definition',
    type: SyntaxError,
}
const INVALID_CUSTOM_PROPERTY_SYNTAX = {
    message: 'Invalid syntax',
    type: SyntaxError,
}
const INVALID_INITIAL_CUSTOM_PROPERTY_VALUE = {
    message: 'Invalid initial value',
    type: SyntaxError,
}
const INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL = {
    message: 'Invalid initial value',
    type: SyntaxError,
}
const MISSING_INITIAL_CUSTOM_PROPERTY_VALUE = {
    message: 'Invalid initial value',
    type: SyntaxError,
}

/**
 * @param {string} property
 * @param {string} value
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports}
 *
 * It deviates from the specification to avoid resolving a declaration value
 * definition in multiple places.
 */
function supportsValue(property, value) {
    return parseCSSDeclaration(property, value, false, '@style') !== null
}

/**
 * @param {string} conditionText
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports-conditiontext}
 */
function supportsCondition(conditionText) {
    const parsed = parseCSSGrammar(`(${conditionText})`, '<supports-condition>')
    return parsed ? matchSupport(parsed) : false
}

/**
 * @param {object[]}
 * @returns {boolean}
 * @see {@link https://github.com/w3c/css-houdini-drafts/issues/1076}
 */
function isValidUniversalInitialValue(initial) {
    if (initial.length === 1 && cssWideKeywords.includes(initial[0].value)) {
        return false
    }
    return true
}

class CSSImpl {

    /**
     * @param {string} ident
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-css-escape}
     */
    escape(ident) {
        return serializeIdentifier({ value: ident })
    }

    /**
     * @param {PropertyDefinition} definition
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#dom-css-registerproperty}
     */
    registerProperty({ name, inherits, initialValue, syntax }) {
        if (!parseCSSGrammar(name, '<custom-property-name>', '@property')) {
            throw INVALID_CUSTOM_PROPERTY_NAME
        }
        const register = globalThis.document._registeredPropertySet
        if (register.some(definition => definition.name === name)) {
            throw INVALID_CUSTOM_PROPERTY_OVERRIDE
        }
        syntax = parseCSSGrammar(syntax, '<syntax>', '@property')
        if (syntax === null) {
            throw INVALID_CUSTOM_PROPERTY_SYNTAX
        }
        syntax = serializeCSSComponentValue(syntax)
        if (syntax === '*') {
            if (typeof initialValue === 'undefined') {
                register.push({ inherits, name, syntax })
                return
            }
            initialValue = parseCSSGrammar(initialValue, '<declaration-value>?', '@property')
            if (initialValue && isValidUniversalInitialValue(initialValue)) {
                register.push({ inherits, initialValue, name, syntax })
                return
            }
            throw INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL
        }
        if (initialValue) {
            initialValue = parseCSSGrammar(initialValue, syntax, '@property')
            if (initialValue && isComputationallyIndependent(initialValue)) {
                register.push({ inherits, initialValue, name, syntax })
                return
            }
            throw INVALID_INITIAL_CUSTOM_PROPERTY_VALUE
        }
        throw MISSING_INITIAL_CUSTOM_PROPERTY_VALUE
    }

    /**
     * @param {string} conditionTextOrProperty
     * @param {string} [value]
     * @returns {boolean}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports-conditiontext}
     */
    supports(propertyOrConditionText, value) {
        return value
            ? supportsValue(propertyOrConditionText, value)
            : supportsCondition(propertyOrConditionText)
    }
}

module.exports = {
    INVALID_CUSTOM_PROPERTY_NAME,
    INVALID_CUSTOM_PROPERTY_OVERRIDE,
    INVALID_CUSTOM_PROPERTY_SYNTAX,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL,
    MISSING_INITIAL_CUSTOM_PROPERTY_VALUE,
    implementation: CSSImpl,
}
