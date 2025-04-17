
const { angle, dimension, list, map, number, percentage } = require('../values/value.js')
const { canonicalize, getCanonicalUnitFromType } = require('../values/dimensions.js')
const { clamp, isNegativeZero, round, sign, toDegrees, toRadians } = require('../utils/math.js')
const { getCalculationType, matchNumericType, types: numericTypes } = require('./types.js')
const { isCalculation, isCombinable, isNumeric, isOmitted } = require('../utils/value.js')
const error = require('../error.js')
const substitutions = require('../values/substitutions.js')

/**
 * @param {object} node
 * @param {string} [resolutionType]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#simplify-a-calculation-tree}
 */
function simplifyCalculation(node, resolutionType) {
    const { name, types, value } = node
    // Leaf: numeric
    if (isNumeric(node)) {
        if (types.includes('<dimension>')) {
            return canonicalize(node)
        }
        if (types.includes('<calc-keyword>')) {
            switch (value) {
                case '-infinity':
                    return number(-Infinity, ['<calc-value>'])
                case 'infinity':
                    return number(Infinity, ['<calc-value>'])
                case 'e':
                    return number(Math.E, ['<calc-value>'])
                case 'pi':
                    return number(Math.PI, ['<calc-value>'])
                case 'nan':
                    return number(NaN, ['<calc-value>'])
            }
        }
        return node
    }
    // Leaf: substitution resolved at computed value time or later
    if (substitutions.numeric.some(definition => definition.value === value)) {
        return node
    }
    // Operator: calculation operator or numeric substitution function
    let children
    if (Array.isArray(value)) {
        function simplifyArgument(value) {
            if (Array.isArray(value)) {
                return value.map(simplifyArgument)
            }
            if (isCalculation(value)) {
                return simplifyCalculation(value, resolutionType)
            }
            return value
        }
        children = value.map(simplifyArgument)
    } else {
        children = list([simplifyCalculation(value, resolutionType)])
    }
    // Operator: calculation operator
    if (types.includes('<calc-negate>')) {
        if (isNumeric(children[0])) {
            return map(children[0], value => 0 - value)
        }
        return map(node, () => children[0])
    }
    if (types.includes('<calc-invert>')) {
        if (children[0].types.includes('<number>')) {
            return map(children[0], value => 1 / value)
        }
        return map(node, () => children[0])
    }
    if (types.includes('<calc-sum>')) {
        children = children
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
        if (children.length === 1) {
            return children[0]
        }
        return map(node, () => children)
    }
    if (types.includes('<calc-product>')) {
        let factor = 1
        children = children
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
        if (children.length === 0) {
            return number(factor, ['<calc-value>'])
        }
        // Apply factor to the first dimension, percentage, or sum of dimensions/percentages
        const index = children.findIndex(node => isNumeric(node, true))
        if (-1 < index) {
            const numeric = children[index]
            children[index] = map(numeric, value => value * factor)
        } else {
            const index = children.findIndex(({ types, value }) =>
                types.includes('<calc-sum>') && value.every(node => isNumeric(node, true)))
            if (-1 < index) {
                const sum = children[index]
                children[index] = map(sum, value => value.map(term => map(term, value => value * factor)))
            } else if (factor !== 1) {
                children.push(number(factor))
            }
        }
        if (children.length === 1) {
            return children[0]
        }
        // Resolve the product of combinables
        if (children.every(node => isCombinable(node, resolutionType))) {
            const productType = getCalculationType({ types, value: children })
            const matchType = productType && numericTypes.find(mathFnType => matchNumericType(productType, mathFnType))
            if (matchType) {
                const value = children.reduce(
                    (product, { types, value }) => {
                        if (types.includes('<calc-invert>')) {
                            return product /= value.value
                        }
                        return product *= value
                    },
                    1)
                if (matchType === '<number>') {
                    return number(value, ['<calc-value>'])
                }
                if (matchType === '<percentage>') {
                    return percentage(value, ['<calc-value>'])
                }
                return dimension(value, getCanonicalUnitFromType(matchType), [matchType, '<calc-value>'])
            }
        }
        return map(node, () => children)
    }
    // Operator: numeric substitution function
    if (name === 'calc') {
        return children[0]
    }
    if (name === 'media-progress' || substitutions.numeric.find(definition => definition.name === name).element) {
        return map(node, () => children)
    }
    if (name === 'clamp' && children.some(value => value.value === 'none')) {
        const [min,, center,, max] = children
        if (min.value === max.value) {
            return center
        }
    } else if (children.every(node => !isCalculation(node) || isCombinable(node, resolutionType))) {
        switch (name) {
            case 'abs':
                return map(children[0], Math.abs, ['<calc-value>'])
            case 'acos':
            case 'asin':
            case 'atan':
                return angle(toDegrees(Math[name](children[0].value)), 'deg', ['<calc-value>'])
            case 'atan2':
                return angle(toDegrees(Math.atan2(children[0].value, children[2].value)), 'deg', ['<calc-value>'])
            case 'clamp':
                return map(children[0], () => clamp(children[0].value, children[2].value, children[4].value), ['<calc-value>'])
            case 'cos':
                return number(Math.cos(children[0].unit === 'deg' ? toRadians(children[0].value) : children[0].value), ['<calc-value>'])
            case 'exp':
            case 'sign':
            case 'sqrt':
                return number(Math[name](children[0].value), ['<calc-value>'])
            case 'hypot':
            case 'max':
            case 'min':
                return map(children[0], () => Math[name](...children.map(node => node.value)), ['<calc-value>'])
            case 'log':
                return map(
                    children[0],
                    value => {
                        const base = children[2]
                        value = Math.log(value)
                        if (!isOmitted(base)) {
                            value /= Math.log(base.value)
                        }
                        return value
                    },
                    ['<calc-value>'])
            case 'mod':
                return map(
                    children[0],
                    value => {
                        const modulus = children[2].value
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
                    },
                    ['<calc-value>'])
            case 'pow':
                return number(Math.pow(children[0].value, children[2].value), ['<calc-value>'])
            case 'progress': {
                const [{ value: progress },, { value: start },, { value: end }] = children
                if (progress === start && start === end) {
                    return number(0, ['<calc-value'])
                }
                return number((progress - start) / (end - start), ['<calc-value'])
            }
            case 'rem':
                return map(
                    children[0],
                    value => {
                        const divisor = children[2].value
                        if (divisor === 0 || Math.abs(value) === Infinity) {
                            return NaN
                        }
                        if (Math.abs(divisor) === Infinity) {
                            return value
                        }
                        return value - (divisor * Math.trunc(value / divisor))
                    },
                    ['<calc-value>'])
            case 'round':
                return map(children[1], v => round(children[0].value, v, children[2].value), ['<calc-value>'])
            case 'sin':
                return number(map(children[0], value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (children[0].unit === 'deg') {
                        return Math.sin(toRadians(value))
                    }
                    return Math.sin(value)
                }).value, ['<calc-value>'])
            case 'tan':
                return number(map(children[0], value => {
                    if (isNegativeZero(value)) {
                        return value
                    }
                    if (children[0].types.includes('<number>')) {
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
                }).value, ['<calc-value>'])
            default:
                throw error({ message: `Unrecognized math function "${name}"` })
        }
    } else if (name === 'min' || name === 'max') {
        if (children.length === 1) {
            return children[0]
        }
        const entries = new Map
        children.forEach(calculation => {
            const unit = isCombinable(calculation, resolutionType) ? calculation.unit : 'unresolved'
            const entry = entries.get(unit)
            if (entry) {
                entry.push(calculation)
            } else {
                entries.set(unit, [calculation])
            }
        })
        children = list([], ',')
        for (const [unit, nodes] of entries) {
            if (1 < nodes.length && unit !== 'unresolved') {
                children.push(nodes.reduce((a, b) => {
                    if (a.value < b.value) {
                        return name === 'min' ? a : b
                    }
                    return name === 'min' ? b : a
                }))
            } else {
                children.push(...nodes)
            }
        }
        if (children.length === 1) {
            return children[0]
        }
    }
    return map(node, () => children)
}

module.exports = {
    simplifyCalculation,
}
