
import * as substitutions from '../values/substitutions.js'
import { angle, dimension, isCalculation, isCombinable, isList, isNumeric, isOmitted, list, map, number, percentage } from '../values/value.js'
import { areEqual, clamp, isInfinite, isNegativeZero, round, sign, toDegrees, toRadians } from '../utils/math.js'
import { canonicalize, getCanonicalUnitFromType } from '../values/dimensions.js'
import { getCalculationType, matchNumericType, types as numericTypes } from './types.js'

/**
 * @param {*} calculation
 * @param {string} [resolutionType]
 * @returns {boolean}
 */
function isResolvableCalculation(value, resolutionType) {
    if (isList(value)) {
        return value.every(node => isResolvableCalculation(node, resolutionType))
    }
    return !isCalculation(value) || isNumeric(value, { resolutionType, resolved: true })
}

/**
 * @param {number} a
 * @param {number} devicePixelRatio
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-values-4/#snap-as-a-line-width}
 */
function roundToDevicePixel(a, devicePixelRatio) {
    const absolute = Math.abs(a) * devicePixelRatio
    if (absolute % 1) {
        let strategy
        if (0 < absolute && absolute < 1) {
            strategy = a < 0 ? 'down' : 'up'
        } else {
            strategy = 'nearest'
        }
        a = round(strategy, a, 1 / devicePixelRatio)
    }
    return a
}

/**
 * @param {object} node
 * @param {string|null} resolutionType
 * @param {number} devicePixelRatio
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#simplify-a-calculation-tree}
 */
export function simplifyCalculation(node, resolutionType, devicePixelRatio) {
    // Leaf: numeric
    if (isNumeric(node)) {
        return node
    }
    let { name, types, value } = node
    // Operator: calculation operator or calculation function
    node = map(node, function simplify(value) {
        if (isCalculation(value)) {
            return simplifyCalculation(value, resolutionType, devicePixelRatio)
        }
        if (isList(value)) {
            return map(value, simplify)
        }
        return value
    })
    value = node.value
    // Operator: calculation operator
    if (types.includes('<calc-negate>')) {
        if (isNumeric(value, { literal: true })) {
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
                    if (isNumeric(operand, { literal: true })) {
                        const index = sum.findIndex(term => isNumeric(term, { literal: true }) && term.unit === operand.unit)
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
        const index = node.findIndex(node => isNumeric(node, { literal: true }))
        if (-1 < index) {
            const numeric = node[index]
            node[index] = map(numeric, value => value * factor)
        } else {
            const index = node.findIndex(child =>
                child.types.includes('<calc-sum>')
                && child.every(node => isNumeric(node, { literal: true })))
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
    // Operator: calculation function
    if (name === 'calc') {
        return value
    }
    if (name === 'calc-interpolate') {
        return node
    }
    if (name === 'calc-mix') {

        let weightSum = 0
        let omitted = 0
        for (const [, weight] of value) {
            if (isOmitted(weight)) {
                omitted++
                continue
            }
            if (isNumeric(weight, { literal: true })) {
                weightSum += weight.value
                continue
            }
            return node
        }

        const distributedWeight = 0 < omitted ? Math.max(0, (100 - weightSum)) / omitted : 0
        const multiplier = 100 < weightSum ? 100 / weightSum : 1

        const items = new Map
        let { length } = value
        value.forEach(([value, weight]) => {
            if (isOmitted(weight)) {
                weight = percentage(distributedWeight)
            }
            if (weight.value === 0) {
                length--
                if (!resolutionType || !getCalculationType(value, resolutionType).percentHint) {
                    return
                }
                if (isNumeric(value, { literal: true }) && value.types[0] === '<percentage-token>') {
                    items.set('zero-weight', [weight, weight])
                    return
                }
            }
            if (isNumeric(value, { literal: true })) {
                if (items.has(value.unit)) {
                    items.get(value.unit).push([value, weight])
                } else {
                    items.set(value.unit, [[value, weight]])
                }
            } else if (items.has('non-numeric')) {
                items.get('non-numeric').push([value, weight])
            } else {
                items.set('non-numeric', [[value, weight]])
            }
        })

        const simplified = []
        items.forEach((items, unit) => {
            if (unit === 'non-numeric') {
                simplified.push(...items.map(item => list(item)))
            } else if (unit === 'zero-weight') {
                simplified.push(list(items))
            } else {
                const average = items.reduce((sum, [v, w]) => sum + (v.value * w.value), 0) / 100
                const ratio = items.length / length
                const value = map(items[0][0], () => average / ratio * multiplier)
                const weight = percentage(100 * ratio)
                simplified.push(list([value, weight]))
            }
        })

        switch (simplified.length) {
            case 0:
                return map(value.find(item => isNumeric(item[0], { literal: true }))[0], () => 0)
            case 1:
                return simplified[0][0]
            default:
                return map(node, () => list(simplified, ','))
        }
    }
    if (isResolvableCalculation(value, resolutionType)) {
        switch (name) {
            case 'abs':
                return map(value, Math.abs)
            case 'acos':
            case 'asin':
            case 'atan':
                return angle(toDegrees(Math[name](value.value)), 'deg', ['<calc-value>'])
            case 'atan2':
                return angle(toDegrees(Math.atan2(value[0].value, value[2].value)), 'deg', ['<calc-value>'])
            case 'clamp': {
                const [min,, center,, max] = value
                if (value.some(value => value.value === 'none')) {
                    if (min.value === max.value) {
                        return center
                    }
                    return node
                }
                return map(min, () => clamp(min.value, center.value, max.value))
            }
            case 'cos':
                return number(Math.cos(value.unit === 'deg' ? toRadians(value.value) : value.value), ['<calc-value>'])
            case 'exp':
            case 'sign':
            case 'sqrt':
                return number(Math[name](value.value), ['<calc-value>'])
            case 'hypot':
            case 'max':
            case 'min':
                return map(value[0], () => Math[name](...value.map(node => node.value)))
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
                    })
            case 'mod':
                return map(
                    value[0],
                    a => {
                        const b = value[2].value
                        if (isInfinite(a) || b === 0) {
                            return NaN
                        }
                        if (isInfinite(b)) {
                            if (sign(a) !== sign(b)) {
                                return NaN
                            }
                            return a
                        }
                        return a - (b * Math.floor(a / b))
                    })
            case 'pow':
                return number(Math.pow(value[0].value, value[2].value), ['<calc-value>'])
            case 'progress': {
                const [noClamp,, { value: progress },, { value: start },, { value: end }] = value
                if (start === end) {
                    if (isOmitted(noClamp) || progress === start) {
                        return number(0, ['<calc-value>'])
                    }
                    return number(progress < start ? -Infinity : Infinity, ['<calc-value>'])
                }
                let distance = (progress - start) / (end - start)
                if (isOmitted(noClamp)) {
                    distance = clamp(0, distance, 1)
                }
                return number(distance, ['<calc-value>'])
            }
            case 'random': {
                if (node.base === undefined) {
                    return node
                }
                const [, min, max, step] = value
                if (isInfinite(min.value)) {
                    return min
                }
                if (step) {
                    if (isInfinite(step.value)) {
                        return min
                    }
                    const epsilon = step.value / 1000 || Number.MIN_VALUE
                    let multiplier = Math.floor((max.value - min.value) / step.value)
                    if (!areEqual(multiplier, max.value, epsilon) && areEqual(multiplier + 1, max.value, epsilon)) {
                        multiplier++
                    }
                    const index = round('down', node.base * (multiplier + 1), 1)
                    if (!isInfinite(index)) {
                        const value = min.value + (index * step.value)
                        if (index === multiplier && areEqual(value, max.value, epsilon)) {
                            return max
                        }
                        return map(min, () => value)
                    }
                }
                return map(min, () => min.value + (node.base * (max.value - min.value)))
            }
            case 'rem':
                return map(
                    value[0],
                    a => {
                        const b = value[2].value
                        if (b === 0 || isInfinite(a)) {
                            return NaN
                        }
                        if (isInfinite(b)) {
                            return a
                        }
                        return a - (b * Math.trunc(a / b))
                    })
            case 'round': {
                const [strategy, a, b] = value
                if (strategy.value === 'line-width') {
                    if (isOmitted(b)) {
                        return map(a, a => roundToDevicePixel(a, devicePixelRatio))
                    }
                    const step = b.value
                    return map(a, a => {
                        let value = round('nearest', a, step)
                        if (value === 0) {
                            value = Math[a < 0 ? 'min' : 'max'](round('down', a, step), round('up', a, step))
                        }
                        return roundToDevicePixel(value, devicePixelRatio)
                    })
                }
                return map(a, a => round(strategy.value, a, b.value))
            }
            case 'sin':
                return number(map(value, a => {
                    if (isNegativeZero(a)) {
                        return a
                    }
                    if (value.unit === 'deg') {
                        return Math.sin(toRadians(a))
                    }
                    return Math.sin(a)
                }).value, ['<calc-value>'])
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
                }).value, ['<calc-value>'])
        }
    } else if (name === 'min' || name === 'max') {
        if (value.length === 1) {
            return value[0]
        }
        const entries = new Map
        value.forEach(calculation => {
            const unit = isNumeric(calculation, { resolutionType, resolved: true }) ? calculation.unit : 'unresolved'
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
