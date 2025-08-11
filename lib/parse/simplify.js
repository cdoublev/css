
import * as substitutions from '../values/substitutions.js'
import { angle, dimension, list, map, number, percentage } from '../values/value.js'
import { canonicalize, getCanonicalUnitFromType } from '../values/dimensions.js'
import { clamp, isNegativeZero, round, sign, toDegrees, toRadians } from '../utils/math.js'
import { getCalculationType, matchNumericType, types as numericTypes } from './types.js'
import { isCalculation, isCombinable, isNumeric, isOmitted } from '../utils/value.js'
import { create as error } from '../error.js'
import { isList } from '../utils/value.js'

/**
 * @param {object} node
 * @param {string} [resolutionType]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#simplify-a-calculation-tree}
 */
export function simplifyCalculation(node, resolutionType) {
    let { name, types, value } = node
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
    if (value && substitutions.numeric.some(definition => definition.value === value)) {
        return node
    }
    // Operator: calculation operator or numeric substitution function
    node = map(node, function simplify(value) {
        if (value.types.includes('<progress-source>') || value.types.includes('<input-position>')) {
            return value
        }
        if (isCalculation(value)) {
            return simplifyCalculation(value, resolutionType)
        }
        if (isList(value)) {
            return map(value, simplify)
        }
        return value
    })
    value = node.value
    // Operator: calculation operator
    if (types.includes('<calc-negate>')) {
        if (isNumeric(value)) {
            return map(value, value => 0 - value)
        }
        return node
    }
    if (types.includes('<calc-invert>')) {
        if (value.types.includes('<number>')) {
            return map(value, value => 1 / value)
        }
        return node
    }
    if (types.includes('<calc-sum>')) {
        node = node
            // Flatten unresolved nested sums
            .reduce(
                (sum, operand) => {
                    if (operand.types.includes('<calc-sum>')) {
                        sum.push(...operand)
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
                        const index = sum.findIndex(term => isNumeric(term, true) && term.unit === operand.unit)
                        if (-1 < index) {
                            const match = sum[index]
                            sum[index] = map(match, value => value + operand.value)
                            return sum
                        }
                    }
                    sum.push(operand)
                    return sum
                },
                list([], '+', ['<calc-sum>']))
        if (node.length === 1) {
            return node[0]
        }
        return node
    }
    if (types.includes('<calc-product>')) {
        let factor = 1
        node = node
            // Flatten unresolved nested products
            .reduce(
                (product, operand) => {
                    if (operand.types.includes('<calc-product>')) {
                        product.push(...operand)
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
                list([], '*', ['<calc-product>']))
        if (node.length === 0) {
            return number(factor, ['<calc-value>'])
        }
        // Apply factor to the first dimension, percentage, or sum of dimensions/percentages
        const index = node.findIndex(node => isNumeric(node, true))
        if (-1 < index) {
            const numeric = node[index]
            node[index] = map(numeric, value => value * factor)
        } else {
            const index = node.findIndex(child =>
                child.types.includes('<calc-sum>')
                && child.every(node => isNumeric(node, true)))
            if (-1 < index) {
                const sum = node[index]
                node[index] = map(sum, term => map(term, value => value * factor))
            } else if (factor !== 1) {
                node.push(number(factor))
            }
        }
        if (node.length === 1) {
            return node[0]
        }
        // Resolve the product of combinables
        if (node.every(node => isCombinable(node, resolutionType))) {
            const productType = getCalculationType(node)
            const matchType = productType && numericTypes.find(mathFnType => matchNumericType(productType, mathFnType))
            if (matchType) {
                const value = node.reduce(
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
        return node
    }
    // Operator: numeric substitution function
    if (name === 'calc') {
        return value
    }
    if (name === 'calc-mix' || substitutions.numeric.find(definition => definition.name === name).element) {
        return node
    }
    if (name === 'clamp' && value.some(value => value.value === 'none')) {
        const [min,, center,, max] = value
        if (min.value === max.value) {
            return center
        }
    } else if (isList(value) ? value.every(node => !isCalculation(node) || isCombinable(node, resolutionType)) : isCombinable(value, resolutionType)) {
        switch (name) {
            case 'abs':
                return map(value, Math.abs, ['<calc-value'])
            case 'acos':
            case 'asin':
            case 'atan':
                return angle(toDegrees(Math[name](value.value)), 'deg', ['<calc-value'])
            case 'atan2':
                return angle(toDegrees(Math.atan2(value[0].value, value[2].value)), 'deg', ['<calc-value'])
            case 'clamp':
                return map(value[0], () => clamp(value[0].value, value[2].value, value[4].value), ['<calc-value'])
            case 'cos':
                return number(Math.cos(value.unit === 'deg' ? toRadians(value.value) : value.value), ['<calc-value'])
            case 'exp':
            case 'sign':
            case 'sqrt':
                return number(Math[name](value.value), ['<calc-value'])
            case 'hypot':
            case 'max':
            case 'min':
                return map(value[0], () => Math[name](...value.map(node => node.value)), ['<calc-value'])
            case 'log':
                return map(
                    value[0],
                    a => {
                        const b = value[2]
                        a = Math.log(a)
                        if (isOmitted(b)) {
                            return a
                        }
                        return a / Math.log(b.value)
                    },
                    ['<calc-value'])
            case 'mod':
                return map(
                    value[0],
                    a => {
                        const b = value[2].value
                        if (Math.abs(a) === Infinity || b === 0) {
                            return NaN
                        }
                        if (Math.abs(b) === Infinity) {
                            if (sign(a) !== sign(b)) {
                                return NaN
                            }
                            return a
                        }
                        return a - (b * Math.floor(a / b))
                    },
                    ['<calc-value'])
            case 'pow':
                return number(Math.pow(value[0].value, value[2].value), ['<calc-value'])
            case 'progress': {
                const [{ value: progress },, { value: start },, { value: end }] = value
                if (progress === start && start === end) {
                    return number(0, ['<calc-value'])
                }
                return number((progress - start) / (end - start), ['<calc-value'])
            }
            case 'rem':
                return map(
                    value[0],
                    a => {
                        const b = value[2].value
                        if (b === 0 || Math.abs(a) === Infinity) {
                            return NaN
                        }
                        if (Math.abs(b) === Infinity) {
                            return a
                        }
                        return a - (b * Math.trunc(a / b))
                    },
                    ['<calc-value'])
            case 'round':
                return map(value[1], a => round(value[0].value, a, value[2].value), ['<calc-value'])
            case 'sin':
                return number(map(value, a => {
                    if (isNegativeZero(a)) {
                        return a
                    }
                    if (value.unit === 'deg') {
                        return Math.sin(toRadians(a))
                    }
                    return Math.sin(a)
                }).value, ['<calc-value'])
            case 'tan':
                return number(map(value, a => {
                    if (isNegativeZero(a)) {
                        return a
                    }
                    if (value.types.includes('<number>')) {
                        a = toDegrees(a)
                    }
                    switch (a % 360) {
                        case -270:
                        case 90:
                            return Infinity
                        case 270:
                        case -90:
                            return -Infinity
                        default:
                            return Math.tan(toRadians(a))
                    }
                }).value, ['<calc-value'])
            default:
                throw error({ message: `Unrecognized math function "${name}"` })
        }
    } else if (name === 'min' || name === 'max') {
        if (value.length === 1) {
            return value[0]
        }
        const entries = new Map
        value.forEach(calculation => {
            const unit = isCombinable(calculation, resolutionType) ? calculation.unit : 'unresolved'
            const entry = entries.get(unit)
            if (entry) {
                entry.push(calculation)
            } else {
                entries.set(unit, [calculation])
            }
        })
        value = []
        for (const [unit, nodes] of entries) {
            if (1 < nodes.length && unit !== 'unresolved') {
                value.push(nodes.reduce((a, b) => {
                    if (a.value < b.value) {
                        return name === 'min' ? a : b
                    }
                    return name === 'min' ? b : a
                }))
            } else {
                value.push(...nodes)
            }
        }
        if (value.length === 1) {
            return value[0]
        }
        node = map(node, () => list(value, ','))
    }
    return node
}
