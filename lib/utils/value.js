
const dimensions = require('../values/dimensions.js')
const { omitted } = require('../values/value.js')
const substitutions = require('../values/substitutions.js')

const calculationOperators = ['<calc-invert>', '<calc-negate>', '<calc-product>', '<calc-sum>']
const pendingSubstitutions = [...substitutions.property.arbitrary, ...substitutions.property.whole]

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function hasPendingSubstitution(component) {
    const { name, value } = component
    if (pendingSubstitutions.includes(name)) {
        return true
    }
    // Search in function arguments
    if (Array.isArray(value)) {
        return value.some(hasPendingSubstitution)
    }
    // Search in list
    if (Array.isArray(component)) {
        return component.some(hasPendingSubstitution)
    }
    return false
}

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function isCalculation(component) {
    return component.types.includes('<calc-value>') || isCalculationOperator(component)
}

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function isCalculationOperator(component) {
    return calculationOperators.includes(component.types[0])
}

/**
 * @param {object|object[]} component
 * @param {string} [resolutionType]
 * @returns {boolean}
 */
function isCombinable(component, resolutionType) {
    const { types, unit, value } = component
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
 * @param {string|string[]} delimiter
 * @param {object|object[]} [component]
 * @returns {boolean|function}
 */
function isDelimiter(delimiter, component) {
    if (component) {
        if (Array.isArray(delimiter)) {
            return delimiter.some(delimiter => isDelimiter(delimiter, component))
        }
        return component.types[0] === '<delimiter-token>'
            && component.value === delimiter
    }
    return component => component && isDelimiter(delimiter, component)
}

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function isInfinityOrNaN({ value }) {
    return typeof value === 'number' && !isFinite(value)
}

/**
 * @param {object|object[]} component
 * @param {boolean} [literal]
 * @returns {boolean}
 */
function isNumeric(component, literal = false) {
    return component.types.some(type =>
        type === '<dimension>'
        || type === '<number>'
        || type === '<percentage>'
        || (!literal && type === '<calc-keyword>'))
}

/**
 * @param {object|object[]} [component]
 * @returns {boolean}
 */
function isOmitted(value) {
    return Array.isArray(value) ? value.every(isOmitted) : value === omitted
}

module.exports = {
    hasPendingSubstitution,
    isAmpersand: isDelimiter('&'),
    isCalculation,
    isCalculationOperator,
    isCloseCurlyBrace: isDelimiter('}'),
    isColon: isDelimiter(':'),
    isCombinable,
    isComma: isDelimiter(','),
    isDelimiter,
    isInfinityOrNaN,
    isMinus: isDelimiter('-'),
    isNumeric,
    isOmitted,
    isOpenCurlyBrace: isDelimiter('{'),
    isPlus: isDelimiter('+'),
    isSemicolon: isDelimiter(';'),
    isWhitespace: isDelimiter(' '),
}
