
import * as dimensions from '../values/dimensions.js'
import { List, omitted } from '../values/value.js'

const calculationOperators = ['<calc-invert>', '<calc-negate>', '<calc-product>', '<calc-sum>']
const computationallyDependentUnits = [
    'em', 'rem',
    'lh', 'rlh',
    'ex', 'rex', 'cap', 'rcap', 'ch', 'rch', 'ic', 'ric',
    'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax',
]

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
export const isColon = isDelimiter(':')

/**
 * @param {object|object[]} value
 * @param {string} [resolutionType]
 * @returns {boolean}
 */
export function isCombinable({ types, unit, value }, resolutionType) {
    if (types.includes('<calc-invert>')) {
        return isCombinable(value, resolutionType)
    }
    if (types.includes('<dimension>')) {
        for (const dimension of dimensions.definitions.values()) {
            if (dimension.canonicalUnit === unit) {
                return true
            }
        }
        return false
    }
    if (types.includes('<percentage>')) {
        return !resolutionType
    }
    return types.includes('<number>')
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
    return value instanceof SyntaxError
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
 * @param {boolean} [literal]
 * @returns {boolean}
 */
export function isNumeric(value, literal) {
    return value.types.some(type =>
        type === '<dimension>'
        || type === '<number>'
        || type === '<percentage>'
        || (!literal && type === '<calc-keyword>'))
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
