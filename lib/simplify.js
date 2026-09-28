
import { angle, dimension, isCalculation, isCombinable, isList, isNumeric, isOmitted, list, map, number, percentage } from './values/value.js'
import { areEqual, clamp, isInfinite, isNegativeZero, round, sign, toDegrees, toRadians } from './utils/math.js'
import { getCalculationType, matchNumericType, types as numericTypes } from './parse/types.js'
import applyEasing from './values/easing.js'
import { getCanonicalUnitFromType } from './values/dimension.js'

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
 * @param {object} easing
 * @returns {boolean}
 */
function isResolvableEasing({ name, value }) {
    switch (name) {
        case 'cubic':
            return value.every(([x,, y]) => isNumeric(x) && isNumeric(y))
        case 'linear':
            return value.flatten(3).every(value => isNumeric(value))
        case 'steps':
            return isNumeric(value[0])
        default:
            return true
    }
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
        if (value.types.includes('<progress-source>') || value.types.includes('<input-position>')) {
            return value
        }
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

        const [[progress, progressEasing, positionEasing],, [from, to],, output,, tail] = value

        if (!isNumeric(progress, { resolved: true })) {
            return node
        }

        const hasAbsoluteProgress = progress.types[0] === '<dimension-token>'

        // Collect explicit stops, absolute positions, and easings
        const stops = []
        const absolutes = []
        const easings = []
        const stack = []
        if (!isNumeric(from)) {
            return node
        }
        stops.push([from, output])
        if (from.types[0] === '<dimension-token>') {
            if (hasAbsoluteProgress && progress.unit !== from.unit) {
                return node
            }
            absolutes.push(from)
        }
        if (to) {
            if (!isNumeric(to)) {
                return node
            }
            stack.push([to, output])
            if (to.types[0] === '<dimension-token>') {
                if (hasAbsoluteProgress && progress.unit !== to.unit) {
                    return node
                }
                absolutes.push(to)
            }
        }
        if (isOmitted(tail)) {
            easings.push(positionEasing)
        } else {
            for (const [easing,, [from, to],, output] of tail) {
                stops.at(-1).push(easing)
                if (0 < stack.length) {
                    stops.push(stack.pop())
                }
                if (!isNumeric(from)) {
                    return node
                }
                stops.push([from, output])
                if (from.types[0] === '<dimension-token>') {
                    if (hasAbsoluteProgress && progress.unit !== from.unit) {
                        return node
                    }
                    absolutes.push(from)
                }
                if (to) {
                    if (!isNumeric(to)) {
                        return node
                    }
                    stack.push([to, output])
                    if (to.types[0] === '<dimension-token>') {
                        if (hasAbsoluteProgress && progress.unit !== to.unit) {
                            return node
                        }
                        absolutes.push(to)
                    }
                }
            }
        }
        if (0 < stack.length) {
            stops.push(stack.pop())
        }
        // A single absolute position represents the start and end of the absolute range
        if (absolutes.length === 1) {
            stops.push(stops.find(stop => stop[0] === absolutes[0]))
            easings.push(positionEasing)
        }

        // Resolve progress
        let x = progress.value
        if (hasAbsoluteProgress) {
            const x1 = absolutes[0].value
            const x2 = absolutes.at(-1).value
            if (x1 === x2) {
                if (x < x1) {
                    x = -Infinity
                } else if (x1 < x) {
                    x = Infinity
                }
            } else {
                x = (x - x1) / (x2 - x1)
            }
        } else if (progress.types[0] === '<percentage-token>') {
            x /= 100
        }
        if (!isOmitted(progressEasing)) {
            if (!isResolvableEasing(progressEasing[1])) {
                return node
            }
            x = applyEasing(x, progressEasing[1])
        }

        // Resolve stop positions
        const normalized = []
        stops.forEach(([position, y, easing]) => {
            let x
            let absolute = false
            switch (position.types[0]) {
                case '<dimension-token>':
                    absolute = true
                    if (position === absolutes[0]) {
                        x = normalized.some(stop => stop.x === 0 && stop.absolute) ? 1 : 0
                    } else if (position === absolutes.at(-1)) {
                        x = 1
                    } else {
                        x = (position.value - absolutes[0].value) / (absolutes.at(-1).value - absolutes[0].value)
                    }
                    break
                case '<number-token>':
                    x = position.value
                    break
                case '<percentage-token>':
                    x = position.value / 100
                    break
                default:
                    throw RangeError('Unexpected position type')
            }
            normalized.push({ absolute, easing, x, y })
        })
        normalized.sort((a, b) => {
            if (a.x < b.x) {
                return -1
            }
            if (b.x < a.x) {
                return 1
            }
            if (b.absolute && !a.absolute) {
                return -1
            }
            if (a.absolute && !b.absolute) {
                return 1
            }
            return 0
        })

        // Find the last segment (or point) for progress
        let p1
        let p2
        let index = normalized.length - 1
        for (; -1 < index; index--) {
            const stop = normalized[index]
            if (stop.x === x) {
                return stop.y
            }
            if (stop.x < x) {
                if (index === (normalized.length - 1)) {
                    [p1, p2 = p1] = normalized.slice(-2)
                } else {
                    p1 = stop
                    p2 = normalized[index + 1] ?? p1
                }
                break
            }
            if (index === 0) {
                [p1, p2 = p1] = normalized
            }
        }

        const { easing = positionEasing, x: x1, y: y1 } = p1
        const { x: x2, y: y2 } = p2
        if (isNumeric(y1, { literal: true }) && isNumeric(y2, { literal: true }) && y1.unit === y2.unit) {
            // Progress extends a flat segment
            if (y1.value === y2.value && (x < x1 || x2 < x)) {
                return map(y1, () => {
                    if (x < x1) {
                        return -Infinity
                    }
                    if (x1 < x) {
                        return Infinity
                    }
                    return x1
                })
            }
            if (!isOmitted(easing)) {
                if (!isResolvableEasing(easing)) {
                    return node
                }
                x = applyEasing(x / (x2 - x1), easing)
            } else if (!isOmitted(positionEasing)) {
                if (!isResolvableEasing(positionEasing)) {
                    return node
                }
                x = applyEasing(x / (x2 - x1), positionEasing)
            }
            return map(y1, y1 => y1 + ((x - x1) / (x2 - x1) * (y2.value - y1)))
        }
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
        value.forEach(([calculation, weight]) => {
            if (isOmitted(weight)) {
                weight = percentage(distributedWeight)
            }
            if (weight.value === 0) {
                length--
                if (!resolutionType || !getCalculationType(calculation, resolutionType).percentHint) {
                    return
                }
                if (isNumeric(calculation, { literal: true }) && calculation.types[0] === '<percentage-token>') {
                    items.set('zero-weight', [weight, weight])
                    return
                }
            }
            if (isNumeric(calculation, { literal: true })) {
                if (items.has(calculation.unit)) {
                    items.get(calculation.unit).push([calculation, weight])
                } else {
                    items.set(calculation.unit, [[calculation, weight]])
                }
            } else if (items.has('non-numeric')) {
                items.get('non-numeric').push([calculation, weight])
            } else {
                items.set('non-numeric', [[calculation, weight]])
            }
        })

        const simplified = []
        items.forEach((values, unit) => {
            if (unit === 'non-numeric') {
                simplified.push(...values.map(item => list(item)))
            } else if (unit === 'zero-weight') {
                simplified.push(list(values))
            } else {
                const average = values.reduce((sum, [v, w]) => sum + (v.value * w.value), 0) / 100
                const ratio = values.length / length
                const value = map(values[0][0], () => average / ratio * multiplier)
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
