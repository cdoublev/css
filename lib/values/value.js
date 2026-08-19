
import * as dimensions from './dimensions.js'
import * as units from './length-units.js'

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
    return isNumeric(value, { resolutionType, resolved: true })
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
    if (List.is(value)) {
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
    if (List.is(value)) {
        if (value.separator && value.separator !== ' ') {
            return value.every(value => List.is(value) && value.every(isOmitted))
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


/**
 * @param {object[]} value
 * @param {function} predicate
 * @returns {object[]}
 */
export function filter(value, predicate, types = value.types) {
    return list(value.filter(predicate), value.separator, types)
}

/**
 * @param {object|object[]} value
 * @param {function} transform
 * @param {string[]} [types]
 * @returns {object|object[]}
 */
export function map(value, transform, types = []) {
    types = [...value.types, ...types]
    if (List.is(value)) {
        return list(value.map(transform), value.separator, types)
    }
    const { end, start, ...props } = value
    return { ...props, types, value: transform(props.value) }
}


class List extends Array {

    types = []

    /**
     * @see {@link https://github.com/tc39/proposal-rm-builtin-subclassing}
     *
     * It enforces returning Array rather than a List, which is consistent with
     * the TC39 proposal above.
     */
    static get [Symbol.species]() {
        return Array
    }

    /**
     * @param {*} value
     * @returns {boolean}
     */
    static is(value) {
        return value instanceof this
    }
}

/**
 * @param {object[]} [values]
 * @param {string} [separator]
 * @param {string[]} [types]
 * @returns {List}
 */
export function list(values = [], separator = ' ', types = []) {
    const value = new List(...values)
    value.separator = separator
    value.types.push(...types)
    return value
}

export function block(value = [], types = [], associatedToken = '[') {
    return { associatedToken, types: ['<block>', ...types], value: list(value) }
}

export function delimiter(value, types = []) {
    return { types: ['<delimiter-token>', ...types], value }
}
export function dimensionToken(value, unit, types = []) {
    return { types: ['<dimension-token>', ...types], unit, value }
}
export function identifierToken(value, types = []) {
    return { types: ['<ident-token>', ...types], value }
}
export function numberToken(value, types = []) {
    return { types: ['<number-token>', ...types], value }
}

export function identifier(value, types = []) {
    return identifierToken(value, ['<ident>', ...types])
}
export function customIdentifier(value, types = []) {
    return identifier(value, ['<custom-ident>', ...types])
}
export function dashedIdentifier(value, types = []) {
    return customIdentifier(value, ['<dashed-ident>', ...types])
}
export function keyword(value, types = []) {
    return identifier(value, ['<keyword>', ...types])
}
export function hash(value, types = []) {
    return { types: ['<hash-token>', ...types], value }
}
export function integer(value, types = []) {
    return numberToken(value, ['<integer>', ...types])
}
export function string(value, types = []) {
    return { types: ['<string-token>', '<string>', ...types], value }
}
export function number(value, types = []) {
    return numberToken(value, ['<number>', ...types])
}
export function percentage(value, types = []) {
    return { types: ['<percentage-token>', '<percentage>', ...types], unit: '%', value }
}
export function dimension(value, unit, types = []) {
    return dimensionToken(value, unit, ['<dimension>', ...types])
}
export function angle(value, unit, types = []) {
    return dimension(value, unit, ['<angle>', ...types])
}
export function decibel(value, types = []) {
    return dimension(value, 'db', ['<decibel>', ...types])
}
export function flex(value, types = []) {
    return dimension(value, 'fr', ['<flex>', ...types])
}
export function frequency(value, unit, types = []) {
    return dimension(value, unit, ['<frequency>', ...types])
}
export function length(value, unit, types = []) {
    return dimension(value, unit, ['<length>', ...types])
}
export function resolution(value, unit, types = []) {
    return dimension(value, unit, ['<resolution>', ...types])
}
export function semitones(value, types = []) {
    return dimension(value, 'st', ['<semitones>', ...types])
}
export function time(value, unit, types = []) {
    return dimension(value, unit, ['<time>', ...types])
}

export const omitted = { types: [] }
