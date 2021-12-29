
const { absoluteUnits, canonicalize } = require('./dimensions.js')

/**
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 */
function areEqualNumeric({ value: a, unit: au }, { value: b, unit: bu }) {
    return a === b && (au === bu || a === 0)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isCalculation({ type }) {
    return type.has('calc-sum') || type.has('calc-product') || type.has('calc-value')
}

const calcOperators = ['calc-sum', 'calc-negate', 'calc-invert', 'calc-product']

/**
 * @param {object} node
 * @returns {object}
 */
function isCalcOperatorNode({ type }) {
    return calcOperators.some(t => type.has(t))
}

/**
 * @param {object} node
 * @param {string} contextType
 * @returns {boolean}
 */
function isCombinable({ type, unit }, contextType) {
    if (type.has('percentage')) {
        return !contextType || contextType === 'number'
    }
    if (type.has('dimension')) {
        return absoluteUnits.includes(unit)
    }
    return type.has('number')
}

/**
 * @param {object} component
 * @param {boolean} [usePercentage]
 * @returns {boolean}
 *
 * TODO: cleanup validation functions for numerics.
 */
function isNumeric({ type }, usePercentage = true) {
    return type.has('number')
        || (usePercentage && type.has('percentage'))
        || type.has('dimension')
        || type.has('calc-constant')
}

/**
 * @param {object} component
 * @param {number} number
 * @param {string} [unit]
 * @returns {boolean}
 */
function isNumericRepresentationOf(component, number, unit) {
    const { type, value } = component
    if (type.has('math-function') && isNumeric(value)) {
        component = value
    } else if (type.has('keyword') && unit === '%') {
        switch (value) {
            case 'bottom':
            case 'right':
                return number === 100
            case 'center':
                return number === 50
            case 'left':
            case 'top':
                return number === 0
            default:
                return false
        }
    } else {
        component = canonicalize(component)
    }
    if (type.has('angle')) {
        component.value %= 360
    }
    return typeof component.value === 'number'
        && (number === 0 || unit === component.unit)
        && number === component.value
}

/**
 * @param {*} component
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-values-4/#math}
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-error-constants}
 */
function isInfinityOrNaN({ value }) {
    return typeof value === 'number' && !isFinite(value)
}

/**
 * @param {*} [value]
 * @param {boolean} [allowEmptyList]
 * @returns {boolean}
 */
function isOmitted(value, allowEmptyList = true) {
    if (Array.isArray(value)) {
        return !allowEmptyList && value.every(value => value.omitted)
    }
    return value?.omitted
}

module.exports = {
    areEqualNumeric,
    isCalcOperatorNode,
    isCalculation,
    isCombinable,
    isInfinityOrNaN,
    isNumeric,
    isNumericRepresentationOf,
    isOmitted,
}
