
const { canonicalize, definitions: dimensions } = require('./dimensions.js')

const calculationOperators = ['calc-invert', 'calc-negate', 'calc-product', 'calc-sum']
const numerics = ['calc-constant', 'dimension', 'number', 'percentage']

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function hasSubstitution(component) {
    const { type, value } = component
    if (type.has('var()') || type.has('attr()')) {
        return true
    }
    // Search in function arguments
    if (Array.isArray(value)) {
        return value.some(hasSubstitution)
    }
    // Search in list
    if (Array.isArray(component)) {
        return component.some(hasSubstitution)
    }
    return false
}

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function isCalculation(component) {
    return component.type.has('calc-value') || isCalculationOperator(component)
}

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function isCalculationOperator({ type }) {
    return calculationOperators.some(t => type.has(t))
}

/**
 * @param {object|object[]} component
 * @param {string} resolutionType
 * @returns {boolean}
 */
function isCombinable({ type, unit }, resolutionType) {
    if (type.has('percentage')) {
        return !resolutionType || resolutionType === 'number'
    }
    if (type.has('dimension')) {
        for (const { canonicalUnit } of dimensions.values()) {
            if (canonicalUnit === unit) {
                return true
            }
        }
        return false
    }
    return type.has('number')
}

/**
 * @param {string} delimiter
 * @param {object|object[]} [component]
 * @returns {boolean|function}
 */
function isDelimiter(delimiter, component) {
    if (component) {
        const { type, value } = component
        return value === delimiter && type.has('delimiter')
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
 * @returns {boolean}
 */
function isNumeric({ type }) {
    return numerics.some(t => type.has(t))
}

/**
 * @param {object|object[]} component
 * @param {number} number
 * @param {string} [symbol]
 * @returns {boolean}
 */
function isNumericRepresentationOf(component, number, symbol) {
    if (Array.isArray(component)) {
        const [, direction] = component
        if (symbol == 'deg' && direction.type.has('side-or-corner')) {
            const [x, y] = direction
            switch (number) {
                case 0:
                    return x.omitted && y.value === 'top'
                case 90:
                    return y.omitted && x.value === 'right'
                case 180:
                    return x.omitted && y.value === 'bottom'
                case 270:
                    return y.omitted && x.value === 'left'
            }
        }
        return false
    }
    let { type, unit, value } = component
    if (type.has('function') && isNumeric(value)) {
        return isNumericRepresentationOf(value, number, symbol)
    }
    if (type.has('dimension')) {
        ({ unit, value } = canonicalize(component))
        if (type.has('angle')) {
            value %= 360
        }
    }
    return (number === 0 || unit === symbol) && number === value
}

/**
 * @param {object|object[]} [component]
 * @returns {boolean}
 */
function isOmitted(value) {
    return Array.isArray(value)
        ? value.every(isOmitted)
        : value?.omitted
}

module.exports = {
    hasSubstitution,
    isAmpersand: isDelimiter('&'),
    isCalculation,
    isCalculationOperator,
    isColon: isDelimiter(':'),
    isCombinable,
    isComma: isDelimiter(','),
    isDelimiter,
    isInfinityOrNaN,
    isMinus: isDelimiter('-'),
    isNumeric,
    isNumericRepresentationOf,
    isOmitted,
    isOpenCurlyBrace: isDelimiter('{'),
    isPlus: isDelimiter('+'),
    isSemicolon: isDelimiter(';'),
    isWhitespace: isDelimiter(' '),
}
