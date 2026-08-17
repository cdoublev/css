
import * as dimensions from '../values/dimensions.js'
import * as units from '../values/length-units.js'
import { List, omitted } from '../values/value.js'

const calculationOperators = ['<calc-invert>', '<calc-negate>', '<calc-product>', '<calc-sum>']
const computationallyDependentUnits = [...units.container, ...units.font]

/**
 * @param {object|object[]} value
 * @param {string} [associatedToken]
 * @returns {boolean}
 */
export function isBlock(value, associatedToken) {
    if (value.types[0] === '<block>') {
        if (typeof associatedToken === 'string') {
            return associatedToken === value.associatedToken
        }
        return true
    }
    return false
}

/**
 * @param {object|object[]} value
 * @returns {boolean}
 */
export function isCalculation(value) {
    return value.types.includes('<calc-value>') || isCalculationOperator(value)
}

/**
 * @param {object|object[]} value
 * @returns {boolean}
 */
export function isCalculationOperator(value) {
    return calculationOperators.includes(value.types[0])
}

/**
 * @param {object|object[]} value
 * @returns {boolean}
 */
export const isCloseCurlyBrace = isDelimiter('}')

/**
 * @param {object|object[]} value
 * @returns {boolean}
 */
export const isCloseParen = isDelimiter(')')

/**
 * @param {object|object[]} value
 * @returns {boolean}
 */
export const isColon = isDelimiter(':')

/**
 * @param {object|object[]} value
 * @param {string} [resolutionType]
 * @returns {boolean}
 */
export function isCombinable(value, resolutionType) {
    if (value.types.includes('<calc-invert>')) {
        value = value.value
    }
    return isNumeric(value, { resolved: true, resolutionType })
}

/**
 * @param {object|object[]} value
 * @returns {boolean}
 */
export const isComma = isDelimiter(',')

/**
 * @param {object|object[]} value
 * @returns {boolean}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#computationally-independent}
 */
export function isComputationallyIndependent(value) {
    if (isList(value)) {
        return value.every(isComputationallyIndependent)
    }
    switch (value.types[0]) {
        case '<dimension-token>':
            return !computationallyDependentUnits.includes(value.unit)
        case '<function>':
            return isComputationallyIndependent(value.value)
        default:
            if (Array.isArray(value.value)) {
                return value.value.every(isComputationallyIndependent)
            }
            return true
    }
}

/**
 * @param {string|string[]} delimiter
 * @param {object|object[]} [value]
 * @returns {boolean|function}
 */
export function isDelimiter(delimiter, value) {
    if (value) {
        if (Array.isArray(delimiter)) {
            return delimiter.some(delimiter => isDelimiter(delimiter, value))
        }
        return value.types[0] === '<delimiter-token>'
            && value.value === delimiter
    }
    return value => value && isDelimiter(delimiter, value)
}

/**
 * @param {SyntaxError|object|object[]} [value]
 * @returns {boolean}
 */
export function isError(value) {
    return value instanceof Error || value instanceof DOMException
}

/**
 * @param {SyntaxError|object|object[]} [value]
 * @returns {boolean}
 */
export function isFailure(value) {
    return isNull(value) || isError(value)
}

/**
 * @param {object|object[]} value
 * @param {string} [name]
 * @returns {boolean}
 */
export function isFunction(value, name) {
    if (value.types[0] === '<function>') {
        if (typeof name === 'string') {
            return name === value.name
        }
        return true
    }
    return false
}

/**
 * @param {object|object[]} value
 * @param {string} [separator]
 */
export function isList(value, separator) {
    if (List.is(value)) {
        if (typeof separator === 'string') {
            return value.separator === separator
        }
        return true
    }
    return false
}

/**
 * @param {SyntaxError|object|object[]|null} [value]
 * @returns {boolean}
 */
export function isNull(value) {
    return value === null
}

/**
 * @param {object|object[]} value
 * @param {object} [options]
 * @returns {boolean}
 */
export function isNumeric(value, { literal, resolved, resolutionType } = {}) {
    switch (value.types[0]) {
        case '<dimension-token>':
            if (resolved) {
                for (const dimension of dimensions.definitions.values()) {
                    if (dimension.canonicalUnit === value.unit) {
                        return true
                    }
                }
                return false
            }
            return true
        case '<ident-token>':
            return !resolved && !literal && value.types.includes('<calc-keyword>')
        case '<number-token>':
            return true
        case '<percentage-token>':
            return !resolutionType || !resolved
        default:
            return false
    }
}

/**
 * @param {object|object[]} [value]
 * @returns {boolean}
 */
export function isOmitted(value) {
    if (isList(value)) {
        if (value.separator && value.separator !== ' ') {
            return value.every(value => isList(value) && value.every(isOmitted))
        }
        return value.every(isOmitted)
    }
    return value === omitted
}

/**
 * @param {object|object[]} [value]
 * @returns {boolean}
 */
export const isOpenCurlyBrace = isDelimiter('{')

/**
 * @param {object|object[]} [value]
 * @returns {boolean}
 */
export const isSemicolon = isDelimiter(';')

/**
 * @param {SyntaxError|object|object[]|null} [value]
 * @returns {boolean}
 */
export function isUndefined(value) {
    return value === undefined
}

/**
 * @param {object|object[]} [value]
 * @returns {boolean}
 */
export const isWhitespace = isDelimiter(' ')
