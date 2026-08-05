
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
import { parseDeclarationValue, parseGrammar } from '../parse/parser.js'
import { serializeComponentValue, serializeIdentifier } from '../serialize.js'
import { createVirtualContext } from '../utils/context.js'
import { keywords as cssWideKeywords } from '../values/substitutions.js'
import { customProperties } from '../state.js'
import matchSupport from '../match/support.js'

/**
 * @param {Window} globalObject
 * @param {string} property
 * @param {string} value
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports}
 */
function supportsValue(globalObject, property, value) {
    return !isFailure(parseDeclarationValue(value, property, createVirtualContext(globalObject, '@style')))
}

/**
 * @param {Window} globalObject
 * @param {string} conditionText
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports-conditiontext}
 */
function supportsCondition(globalObject, conditionText) {
    const condition = parseGrammar(`(${conditionText})`, '<supports-condition>')
    return !isFailure(condition) && matchSupport(condition, globalObject)
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
     * @param {string} identifier
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-css-escape}
     */
    static escape(identifier) {
        return serializeIdentifier({ value: identifier })
    }

    /**
     * @param {Window} globalObject
     * @param {PropertyDefinition} definition
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#dom-css-registerproperty}
     */
    static registerProperty(globalObject, { name, inherits, initialValue, syntax }) {
        const context = createVirtualContext(globalObject, '@property')
        if (isFailure(parseGrammar(name, '<custom-property-name>', context))) {
            throw error(INVALID_CUSTOM_PROPERTY_NAME, globalObject)
        }
        const register = customProperties.get(globalObject)
        if (register.has(name)) {
            throw error(INVALID_CUSTOM_PROPERTY_OVERRIDE, globalObject)
        }
        syntax = parseDeclarationValue(`"${syntax}"`, 'syntax', context)
        if (isFailure(syntax)) {
            throw error(INVALID_CUSTOM_PROPERTY_SYNTAX, globalObject)
        }
        syntax = serializeComponentValue(syntax)
        if (syntax === '*') {
            if (initialValue === undefined) {
                register.set(name, { inherits, syntax })
                return
            }
            initialValue = parseDeclarationValue(initialValue, 'initial-value', context)
            if (!isFailure(initialValue) && isValidUniversalInitialValue(initialValue)) {
                register.set(name, { inherits, initialValue, syntax })
                return
            }
            throw error(INVALID_INITIAL_CUSTOM_PROPERTY_VALUE_UNIVERSAL, globalObject)
        }
        if (initialValue) {
            initialValue = parseGrammar(initialValue, syntax, context)
            if (!isFailure(initialValue) && isComputationallyIndependent(initialValue)) {
                register.set(name, { inherits, initialValue, syntax })
                return
            }
            throw error(INVALID_INITIAL_CUSTOM_PROPERTY_VALUE, globalObject)
        }
        throw error(MISSING_INITIAL_CUSTOM_PROPERTY_VALUE, globalObject)
    }

    /**
     * @param {Window} globalObject
     * @param {string} propertyOrConditionText
     * @param {string} [value]
     * @returns {boolean}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports-conditiontext}
     */
    static supports(globalObject, propertyOrConditionText, value) {
        return value === undefined
            ? supportsCondition(globalObject, propertyOrConditionText)
            : supportsValue(globalObject, propertyOrConditionText, value)
    }
}
