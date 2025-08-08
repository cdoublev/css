
import {
    INVALID_CUSTOM_PROPERTY_NAME,
    INVALID_CUSTOM_PROPERTY_OVERRIDE,
    INVALID_CUSTOM_PROPERTY_SYNTAX,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE,
    INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL,
    MISSING_INITIAL_CUSTOM_PROPERTY_VALUE,
    create as error,
} from '../error.js'
import { isComputationallyIndependent, isFailure, isList } from '../utils/value.js'
import { parseCSSDeclaration, parseCSSGrammar } from '../parse/parser.js'
import { serializeCSSComponentValue, serializeIdentifier } from '../serialize.js'
import { keywords as cssWideKeywords } from '../values/substitutions.js'
import matchSupport from '../match/support.js'

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
    return !isFailure(parseCSSDeclaration(property, value, false, '@style'))
}

/**
 * @param {string} conditionText
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports-conditiontext}
 */
function supportsCondition(conditionText) {
    const condition = parseCSSGrammar(`(${conditionText})`, '<supports-condition>')
    return !isFailure(condition) && matchSupport(condition)
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

export default class CSSImpl {

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
        if (isFailure(parseCSSGrammar(name, '<custom-property-name>', '@property'))) {
            throw error(INVALID_CUSTOM_PROPERTY_NAME)
        }
        const register = globalThis.document._registeredPropertySet
        if (register.some(definition => definition.name === name)) {
            throw error(INVALID_CUSTOM_PROPERTY_OVERRIDE)
        }
        syntax = parseCSSGrammar(syntax, '<syntax>', '@property')
        if (isFailure(syntax)) {
            throw error(INVALID_CUSTOM_PROPERTY_SYNTAX)
        }
        syntax = serializeCSSComponentValue(syntax)
        if (syntax === '*') {
            if (initialValue === undefined) {
                register.push({ inherits, name, syntax })
                return
            }
            initialValue = parseCSSGrammar(initialValue, '<declaration-value>?', '@property')
            if (!isFailure(initialValue) && isValidUniversalInitialValue(initialValue)) {
                register.push({ inherits, initialValue, name, syntax })
                return
            }
            throw error(INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL)
        }
        if (initialValue) {
            initialValue = parseCSSGrammar(initialValue, syntax, '@property')
            if (!isFailure(initialValue) && isComputationallyIndependent(initialValue)) {
                register.push({ inherits, initialValue, name, syntax })
                return
            }
            throw error(INVALID_INITIAL_CUSTOM_PROPERTY_VALUE)
        }
        throw error(MISSING_INITIAL_CUSTOM_PROPERTY_VALUE)
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
