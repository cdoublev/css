
import { isOmitted } from './value.js'

/**
 * @param {number} t
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
function getCubicBezierCurveSample(t, a, b, c) {
    return ((((a * t) + b) * t) + c) * t
}

/**
 * @param {number} progress
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 * @see {@link https://source.chromium.org/chromium/chromium/src/+/main:ui/gfx/geometry/cubic_bezier.cc}
 */
function getCubicBezierYPoint(progress, [x1, y1], [x2, y2]) {

    const EPSILON = 1e-7
    const MAX_NEWTON_ITERATIONS = 4

    // Polynomial coefficients
    const cx = 3 * x1
    const bx = (3 * (x2 - x1)) - cx
    const ax = 1 - cx - bx
    const cy = 3 * y1
    const by = (3 * (y2 - y1)) - cy
    const ay = 1 - cy - by

    // Newton-Raphson
    let t = progress
    for (let i = 0; i < MAX_NEWTON_ITERATIONS; i++) {
        const x = getCubicBezierCurveSample(t, ax, bx, cx) - progress
        if (Math.abs(x) < EPSILON) {
            return getCubicBezierCurveSample(t, ay, by, cy)
        }
        const derivative = (((3 * ax * t) + (2 * bx)) * t) + cx
        if (Math.abs(derivative) < EPSILON) {
            break
        }
        t -= x / derivative
    }

    // Bissection
    let low = 0
    let high = 1
    t = progress
    if (t < low) {
        return getCubicBezierCurveSample(low, ay, by, cy)
    }
    if (t > high) {
        return getCubicBezierCurveSample(high, ay, by, cy)
    }
    while (EPSILON < (high - low)) {
        const x = getCubicBezierCurveSample(t, ax, bx, cx)
        if (Math.abs(x - progress) < EPSILON) {
            return getCubicBezierCurveSample(t, ay, by, cy)
        }
        if (progress < x) {
            high = t
        } else {
            low = t
        }
        t = (high + low) / 2
    }
    return getCubicBezierCurveSample(t, ay, by, cy)
}

/**
 * @param {number} progress
 * @param {number[]} p1
 * @param {number[]} p2
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-easing-2/#calculate-cubic-bzier-easing-output-progress}
 */
function cubic(progress, p1, p2) {

    if (0 <= progress && progress <= 1) {
        return getCubicBezierYPoint(progress, p1, p2)
    }

    const p0 = [0, 0]
    const p3 = [1, 1]
    let t1
    let t2
    if (progress < 0) {
        t1 = p0
        if (0 < p1[0]) {
            t2 = p1
        } else if (0 < p2[0]) {
            t2 = p2
        } else {
            return 0
        }
    } else {
        t2 = p3
        if (p2[0] < 1) {
            t1 = p2
        } else if (p1[0] < 1) {
            t1 = p1
        } else {
            return 1
        }
    }
    const [ax, ay] = t1
    const [bx, by] = t2
    if (ax === bx) {
        return ay
    }
    const t = (progress - ax) / (bx - ax)
    return ay + (t * (by - ay))
}

/**
 * @param {number} progress
 * @param {number[]} points
 * @param {boolean} [before]
 * @returns {function}
 * @see {@link https://drafts.csswg.org/css-easing-2/#calculate-linear-easing-output-progress}
 */
function linear(progress, points, before) {

    if (points.length === 0 || (before && progress === points[0][0])) {
        return points[0][1]
    }

    let { length } = points
    let a
    let b
    for (let index = length - 1; -1 < index; index--) {

        const point = points[index]
        const [input, output] = point

        if (progress === input) {
            return output
        }
        if (progress < input) {
            if (index === 0) {
                if (input === b[0]) {
                    return output
                }
                a = point
            } else {
                b = point
            }
            continue
        }
        if ((index + 1) === length) {
            a = points[index - 1]
            if (a[0] === input) {
                return output
            }
            b = point
        } else {
            a = point
        }
        break
    }

    const [x1, y1] = a
    const [x2, y2] = b
    return y1 + ((progress - x1) / (x2 - x1) * (y2 - y1))
}

/**
 * @param {number} progress
 * @param {number} count
 * @param {string} position
 * @param {boolean} [before]
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-easing-2/#calculate-step-easing-output-progress}
 */
function steps(progress, count, position, before) {

    if (before || progress < 0) {
        return 0
    }
    if (1 <= progress) {
        return 1
    }

    let jumps = count
    let step = Math.floor(progress * count)

    switch (position) {
        case 'jump-both':
            jumps++
            // falls through
        case 'jump-start':
        case 'start':
            step++
            break
        case 'jump-none':
            jumps--
            break
    }

    return step / jumps
}

/**
 * @param {number} progress
 * @param {object} easing
 * @returns {number}
 */
export default function apply(progress, { name, value }) {
    switch (name) {
        case undefined:
            break
        case 'cubic-bezier': {
            const points = value.map(([x,, y]) => [x.value, y.value])
            return cubic(progress, ...points)
        }
        case 'linear': {
            const points = value.map(([output, [input]]) => [input.value / 100, output.value])
            return linear(progress, points)
        }
        case 'steps': {
            const [count,, position] = value
            return steps(progress, count.value, isOmitted(position) ? 'end' : position.value)
        }
        default:
            throw RangeError('Unexpected timing function')
    }
    switch (value) {
        case 'ease':
            return cubic(progress, [0.25, 0.1], [0.25, 1])
        case 'ease-in':
            return cubic(progress, [0.42, 0], [1, 1])
        case 'ease-in-out':
            return cubic(progress, [0.42, 0], [0.58, 1])
        case 'ease-out':
            return cubic(progress, [0, 0], [0.58, 1])
        case 'linear':
            return progress
        case 'step-end':
            return steps(progress, 1, 'jump-end')
        case 'step-start':
            return steps(progress, 1, 'jump-start')
        default:
            throw RangeError('Unexpected timing function')
    }
}
