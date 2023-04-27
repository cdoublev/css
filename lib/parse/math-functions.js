
const { getCalculationType, matchNumericType, types } = require('./types.js')
const { canonicalize, getCanonicalUnitFromType } = require('../values/dimensions.js')
const { clamp, isNegativeZero, round, sign, toDegrees, toRadians } = require('../utils/math.js')
const { angle, map, number, percentage } = require('../values/value.js')
const { isCalculation, isCombinable, isNumeric } = require('../values/validation.js')

const MAX_TERMS = 32

/**
 * @param {object} node
 * @returns {object}
 *
 * If the node represents a type produced by a <type-percentage>/etc mixed type,
 * it returns the mixed type as the context type and the type as the resolution
 * type, otherwise it only returns the type as the context type.
 */
function getNumericContextTypes({ definition: { name: type }, parent }) {
    if (type === 'integer') {
        type = 'number'
    }
    if (
        type !== 'percentage'
        && parent?.definition.type === '|'
        && parent.definition.value.some(definition => definition.name === 'percentage')
    ) {
        return { contextType: `${type}-percentage`, resolutionType: type }
    }
    return { contextType: type }
}

/**
 * @param {object} root
 * @param {string} [resolutionType]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#simplify-a-calculation-tree}
 */
function simplifyCalculationTree(root, resolutionType) {
    const { name, type, value } = root
    // Leaf: numeric
    if (isNumeric(root)) {
        if (type.has('percentage') && resolutionType === 'number') {
            return number(value / 100)
        }
        if (type.has('dimension')) {
            return canonicalize(root)
        }
        if (type.has('calc-constant')) {
            switch (value) {
                case 'infinity':
                    return number(Infinity)
                case '-infinity':
                    return number(-Infinity)
                case 'e':
                    return number(Math.E)
                case 'pi':
                    return number(Math.Pi)
                case 'nan':
                    return number(NaN)
                default:
                    throw RangeError('Unexpected <calc-constant> value')
            }
        }
        return root
    }
    // Leaf: non-math function (`var()` or `attr()`) that resolves to a numeric value (at computed value time)
    if (type.has('var()') || type.has('attr()')) {
        return root
    }
    // Operator: math function or calculation operator
    const multi = Array.isArray(value)
    const parameters = []
    let calculations = []
    if (multi) {
        value.forEach(value => {
            if (value.omitted || value.value === ',') {
                return
            }
            if (isCalculation(value)) {
                calculations.push(simplifyCalculationTree(value, resolutionType))
            } else {
                parameters.push(value)
            }
        })
    } else {
        calculations.push(simplifyCalculationTree(value, resolutionType))
    }
    const [calculation, ...other] = calculations
    // Operator: math function that can be resolved to a single numeric value
    if (calculations.length === 1 && (name === 'calc' || name === 'max' || name === 'min') && isNumeric(calculation)) {
        return calculation
    }
    // Operator: math function with enough information to compute the operation root represents
    if (type.has('function') && calculations.every(node => isCombinable(node, resolutionType))) {
        switch (name) {
            case 'abs':
                return map(calculation, Math.abs)
            case 'acos':
            case 'asin':
            case 'atan':
                return angle(toDegrees(Math[name](calculation.value)))
            case 'atan2':
                return angle(toDegrees(Math.atan2(...calculations.map(({ value }) => value))))
            case 'calc':
                return calculation
            case 'clamp':
                return map(calculation, () => clamp(...calculations.map(({ value }) => value)))
            case 'cos':
                return number(Math.cos(calculation.type.has('angle') ? toRadians(calculation.value) : calculation.value))
            case 'exp':
            case 'sign':
            case 'sqrt':
                return number(Math[name](calculation.value))
            case 'hypot':
            case 'max':
            case 'min':
                return map(calculation, () => Math[name](...calculations.map(({ value }) => value)))
            case 'log':
                return map(calculation, value => {
                    value = Math.log(value)
                    if (other.length === 1) {
                        const [{ value: base }] = other
                        value /= Math.log(base)
                    }
                    return value
                })
            case 'mod':
                return map(calculation, value => {
                    const [{ value: modulus }] = other
                    if (Math.abs(value) === Infinity || modulus === 0) {
                        return NaN
                    }
                    if (Math.abs(modulus) === Infinity) {
                        if (sign(value) !== sign(modulus)) {
                            return NaN
                        }
                        return value
                    }
                    return value - (modulus * Math.floor(value / modulus))
                })
            case 'pow':
                return number(Math.pow(...calculations.map(({ value }) => value)))
            case 'rem':
                return map(calculation, value => {
                    const [{ value: divisor }] = other
                    if (divisor === 0 || Math.abs(value) === Infinity) {
                        return NaN
                    }
                    if (Math.abs(divisor) === Infinity) {
                        return value
                    }
                    return value - (divisor * Math.trunc(value / divisor))
                })
            case 'round':
                return map(calculation, v => round(parameters[0]?.value ?? 'nearest', v, other[0].value))
            case 'sin':
                return number(map(calculation, value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (calculation.type.has('angle')) {
                        return Math.sin(toRadians(value))
                    }
                    return Math.sin(value)
                }).value)
            case 'tan':
                return number(map(calculation, value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (calculation.type.has('number')) {
                        value = toDegrees(value)
                    }
                    switch (value % 360) {
                        case -270:
                        case 90:
                            return Infinity
                        case 270:
                        case -90:
                            return -Infinity
                        default:
                            return Math.tan(toRadians(value))
                    }
                }).value)
            default:
                console.log(`The math function "${name}" cannot be simplified`)
                break
        }
    }
    // Operator: `min()` or `max()` that cannot be fully resolved
    if (type.has('min()') || type.has('max()')) {
        const combinables = []
        const rest = []
        calculations.forEach(node => isCombinable(node, resolutionType)
            ? combinables.push(node)
            : rest.push(node))
        if (combinables.length > 0) {
            const [seed] = combinables
            const operation = type.has('min()') ? 'min' : 'max'
            const combined = map(seed, () => Math[operation](...combinables.map(({ value }) => value)))
            calculations = [...rest, combined]
        }
        if (calculations.length === 1) {
            return calculations[0]
        }
    // Operator: calculation operator
    } else if (type.has('calc-negate')) {
        if (isNumeric(calculation)) {
            return map(calculation, value => 0 - value)
        }
        // Nesting is the result of consecutive substractions by math function or substitution-containing values
        if (calculation.type.has('calc-negate')) {
            return calculation.value
        }
    } else if (type.has('calc-invert')) {
        // Do not simplify <dimension> and <percentage> to preserve their (inverted) type
        if (calculation.type.has('number')) {
            return map(calculation, value => 1 / value)
        }
        // Nesting is the result of consecutive divisions by math function or substitution-containing values
        if (calculation.type.has('calc-invert')) {
            return calculation.value
        }
    } else if (type.has('calc-sum')) {
        calculations = calculations
            // Flatten nested sums (result of consecutive math function or substitution-containing values)
            .reduce(
                (sum, operand) => {
                    if (operand.type.has('calc-sum')) {
                        ({ value: operand } = operand)
                    }
                    return sum.concat(operand)
                },
                [])
            // Resolve each sum of numerics with the same unit
            .reduce(
                (sum, operand) => {
                    if (isNumeric(operand)) {
                        const matchIndex = sum.findIndex(term => isNumeric(term) && term.unit === operand.unit)
                        if (-1 < matchIndex) {
                            const match = sum[matchIndex]
                            sum[matchIndex] = map(match, value => value + operand.value)
                            return sum
                        }
                    }
                    sum.push(operand)
                    return sum
                },
                [])
        if (calculations.length === 1) {
            return calculations[0]
        }
    } else if (type.has('calc-product')) {
        let factor = 1
        calculations = calculations
            // Flatten nested products (result of consecutive math function or substitution-containing values)
            .reduce(
                (product, operand) => {
                    if (operand.type.has('calc-product')) {
                        ({ value: operand } = operand)
                    }
                    return product.concat(operand)
                },
                [])
            // Resolve the product (factor) of numbers
            .reduce(
                (calculations, multiplier) => {
                    if (multiplier.type.has('product')) {
                        ({ value: multiplier } = multiplier)
                    }
                    const { type, value } = multiplier
                    if (type.has('number')) {
                        factor *= value
                        return calculations
                    }
                    calculations.push(multiplier)
                    return calculations
                },
                [])
        if (calculations.length === 0) {
            return number(factor)
        }
        // Apply factor to a dimension, a percentage, or a sum of dimensions/percentages
        const index = calculations.findIndex(isNumeric)
        if (-1 < index) {
            const numeric = calculations[index]
            calculations[index] = map(numeric, value => value * factor)
        } else {
            const index = calculations.findIndex(term => term.type.has('calc-sum') && term.value.every(isNumeric))
            if (-1 < index) {
                const sum = calculations[index]
                calculations[index] = map(sum, value => value.map(term => map(term, value => value * factor)))
            } else if (factor !== 1) {
                // Put factor back into calculations
                calculations.push(number(factor))
            }
        }
        if (calculations.length === 1) {
            return calculations[0]
        }
        // Resolve the product of combinables
        if (calculations.every(operand => isCombinable(operand) || (operand.type.has('calc-invert') && isCombinable(operand.value)))) {
            // Match any of the types that a math function can resolve to
            const productType = getCalculationType({ type, value: calculations })
            const matchType = productType && types.find(mathFnType => matchNumericType(productType, mathFnType))
            if (matchType) {
                const value = calculations.reduce(
                    (product, { type, value }) => {
                        if (type.has('calc-invert')) {
                            return product /= value.value
                        }
                        return product *= value
                    },
                    1)
                if (matchType === 'number') {
                    return number(value)
                }
                if (matchType === 'percentage') {
                    return percentage(value)
                }
                return {
                    type: new Set(['dimension', matchType]),
                    unit: getCanonicalUnitFromType(matchType),
                    value,
                }
            }
        }
    }
    // https://github.com/w3c/csswg-drafts/issues/7456
    return map(root, () => multi ? [...parameters, ...calculations] : calculation)
}

module.exports = {
    MAX_TERMS,
    getNumericContextTypes,
    simplifyCalculationTree,
}
