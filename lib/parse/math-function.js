
const { angle, dimension, list, map, number, percentage } = require('../values/value.js')
const { canonicalize, getCanonicalUnitFromType } = require('../values/dimensions.js')
const { clamp, isNegativeZero, round, sign, toDegrees, toRadians } = require('../utils/math.js')
const { getCalculationType, matchNumericType, types: numericTypes } = require('./types.js')
const { isCalculation, isCombinable, isComma, isNumeric, isOmitted } = require('../utils/value.js')
const error = require('../error.js')
const substitutions = require('../values/substitutions.js')

const MAX_TERMS = 32

/**
 * @param {object} root
 * @param {string} [resolutionType]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#simplify-a-calculation-tree}
 */
function simplifyCalculationTree(root, resolutionType) {
    const { name, types, value } = root
    // Leaf: numeric
    if (isNumeric(root)) {
        if (types.includes('<dimension>')) {
            return canonicalize(root)
        }
        if (types.includes('<calc-keyword>')) {
            switch (value) {
                case '-infinity':
                    return number(-Infinity)
                case 'infinity':
                    return number(Infinity)
                case 'e':
                    return number(Math.E)
                case 'pi':
                    return number(Math.PI)
                case 'nan':
                    return number(NaN)
            }
        }
        return root
    }
    // Leaf: substitution resolved at computed value time
    if (substitutions.numeric.state.includes(name ?? value)) {
        return root
    }
    // Operator: calculation operator or math function
    let args
    if (Array.isArray(value)) {
        function simplifyArguments(components, component) {
            if (!isComma(component)) {
                if (Array.isArray(component)) {
                    const { separator, types } = component
                    component = list(component.reduce(simplifyArguments, []), separator, types)
                } else if (isCalculation(component)) {
                    component = simplifyCalculationTree(component, resolutionType)
                }
                components.push(component)
            }
            return components
        }
        args = value.reduce(simplifyArguments, [])
    } else {
        args = [simplifyCalculationTree(value, resolutionType)]
    }
    // Operator: calculation operator
    if (types.includes('<calc-negate>')) {
        if (isNumeric(args[0])) {
            return map(args[0], value => 0 - value)
        }
        return map(root, () => args[0])
    }
    if (types.includes('<calc-invert>')) {
        if (args[0].types.includes('<number>')) {
            return map(args[0], value => 1 / value)
        }
        return map(root, () => args[0])
    }
    if (types.includes('<calc-sum>')) {
        args = args
            // Flatten unresolved nested sums
            .reduce(
                (sum, operand) => {
                    if (operand.types.includes('<calc-sum>')) {
                        sum.push(...operand.value)
                    } else {
                        sum.push(operand)
                    }
                    return sum
                },
                [])
            // Resolve each sum of numerics with the same unit
            .reduce(
                (sum, operand) => {
                    if (isNumeric(operand, true)) {
                        const matchIndex = sum.findIndex(term => isNumeric(term, true) && term.unit === operand.unit)
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
        if (args.length === 1) {
            return args[0]
        }
        return map(root, () => args)
    }
    if (types.includes('<calc-product>')) {
        let factor = 1
        args = args
            // Flatten unresolved nested products
            .reduce(
                (product, operand) => {
                    if (operand.types.includes('<calc-product>')) {
                        product.push(...operand.value)
                    } else {
                        product.push(operand)
                    }
                    return product
                },
                [])
            // Resolve the product (factor) of numbers
            .reduce(
                (calculations, multiplier) => {
                    const { types, value } = multiplier
                    if (types.includes('<number>')) {
                        factor *= value
                    } else {
                        calculations.push(multiplier)
                    }
                    return calculations
                },
                [])
        if (args.length === 0) {
            return number(factor)
        }
        // Apply factor to the first dimension, percentage, or sum of dimensions/percentages
        const index = args.findIndex(node => isNumeric(node, true))
        if (-1 < index) {
            const numeric = args[index]
            args[index] = map(numeric, value => value * factor)
        } else {
            const index = args.findIndex(({ types, value }) =>
                types.includes('<calc-sum>') && value.every(node => isNumeric(node, true)))
            if (-1 < index) {
                const sum = args[index]
                args[index] = map(sum, value => value.map(term => map(term, value => value * factor)))
            } else if (factor !== 1) {
                args.push(number(factor))
            }
        }
        if (args.length === 1) {
            return args[0]
        }
        // Resolve the product of combinables
        if (args.every(node => isCombinable(node, resolutionType))) {
            const productType = getCalculationType({ types, value: args })
            const matchType = productType && numericTypes.find(mathFnType => matchNumericType(productType, mathFnType))
            if (matchType) {
                const value = args.reduce(
                    (product, { types, value }) => {
                        if (types.includes('<calc-invert>')) {
                            return product /= value.value
                        }
                        return product *= value
                    },
                    1)
                if (matchType === '<number>') {
                    return number(value)
                }
                if (matchType === '<percentage>') {
                    return percentage(value)
                }
                return dimension(value, getCanonicalUnitFromType(matchType), [matchType])
            }
        }
        return map(root, () => args)
    }
    // Operator: math function
    if (name === 'calc') {
        return args[0]
    }
    if (name === 'calc-mix' || name === 'random') {
        return map(root, () => args)
    }
    if (name === 'clamp' && args.some(component => component.value === 'none')) {
        const [min, center, max] = args
        if (min.value === max.value) {
            return center
        }
    } else if (args.every(node => !isCalculation(node) || isCombinable(node, resolutionType))) {
        switch (name) {
            case 'abs':
                return map(args[0], Math.abs)
            case 'acos':
            case 'asin':
            case 'atan':
                return angle(toDegrees(Math[name](args[0].value)), 'deg')
            case 'atan2':
                return angle(toDegrees(Math.atan2(...args.map(component => component.value))), 'deg')
            case 'clamp':
                return map(args[0], () => clamp(...args.map(node => node.value)))
            case 'cos':
                return number(Math.cos(args[0].unit === 'deg' ? toRadians(args[0].value) : args[0].value))
            case 'exp':
            case 'sign':
            case 'sqrt':
                return number(Math[name](args[0].value))
            case 'hypot':
            case 'max':
            case 'min':
                return map(args[0], () => Math[name](...args.map(node => node.value)))
            case 'log':
                return map(args[0], value => {
                    const base = args[1]
                    value = Math.log(value)
                    if (!isOmitted(base)) {
                        value /= Math.log(base.value)
                    }
                    return value
                })
            case 'mod':
                return map(args[0], value => {
                    const modulus = args[1].value
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
                return number(Math.pow(...args.map(node => node.value)))
            case 'rem':
                return map(args[0], value => {
                    const divisor = args[1].value
                    if (divisor === 0 || Math.abs(value) === Infinity) {
                        return NaN
                    }
                    if (Math.abs(divisor) === Infinity) {
                        return value
                    }
                    return value - (divisor * Math.trunc(value / divisor))
                })
            case 'round':
                return map(args[1], v => round(args[0]?.value ?? 'nearest', v, args[2]?.value ?? 1))
            case 'sin':
                return number(map(args[0], value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (args[0].unit === 'deg') {
                        return Math.sin(toRadians(value))
                    }
                    return Math.sin(value)
                }).value)
            case 'tan':
                return number(map(args[0], value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (args[0].types.includes('<number>')) {
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
                throw error({ message: `Unrecognized math function "${name}"` })
        }
    } else if (name === 'min' || name === 'max') {
        if (args.length === 1) {
            return args[0]
        }
        const entries = new Map()
        for (const calculation of args) {
            const unit = isCombinable(calculation, resolutionType) ? calculation.unit : 'unresolved'
            const entry = entries.get(unit)
            if (entry) {
                entry.push(calculation)
            } else {
                entries.set(unit, [calculation])
            }
        }
        args = []
        for (const [unit, nodes] of entries) {
            if (1 < nodes.length && unit !== 'unresolved') {
                args.push(nodes.reduce((a, b) => {
                    if (a.value < b.value) {
                        return name === 'min' ? a : b
                    }
                    return name === 'min' ? b : a
                }))
            } else {
                args.push(...nodes)
            }
        }
        if (args.length === 1) {
            return args[0]
        }
    }
    return map(root, () => args)
}

module.exports = {
    MAX_TERMS,
    simplifyCalculationTree,
}
