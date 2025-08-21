
/**
 * @param {number} min
 * @param {number} value
 * @param {number} max
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-clamp}
 */
export function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max))
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isDegenerate(value) {
    return typeof value === 'number' && !isFinite(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isInfinite(value) {
    return value === Infinity || value === -Infinity
}

/**
 * @param {*} value
 * @returns {boolean}
 */
export function isNegativeZero(value) {
    return Object.is(-0, value)
}

/**
 * @param {string} strategy
 * @param {number} value
 * @param {number} precision
 * @returns {object}
 */
export function round(strategy, value, precision) {
    // Preserve 0⁻ or 0⁺
    if (value % precision === 0) {
        return value
    }
    const isInfinitePrecision = isInfinite(precision)
    if (precision === 0 || (isInfinitePrecision && isInfinite(value))) {
        return NaN
    }
    if (isInfinitePrecision) {
        switch (strategy) {
            case 'nearest':
            case 'to-zero':
                return (value < 0 || isNegativeZero(value)) ? -0 : 0
            case 'up':
                if (0 < value) {
                    return Infinity
                }
                if (value < 0 || isNegativeZero(value)) {
                    return -0
                }
                return value
            case 'down':
                if (value < 0) {
                    return -Infinity
                }
                if (isNegativeZero(value)) {
                    return value
                }
                return 0
            default:
                throw RangeError('Unexpected rounding strategy')
        }
    }
    const half = value / precision
    const down = Math.floor(half) * precision
    const up = Math.ceil(half) * precision
    switch (strategy) {
        case 'down':
            return down
        case 'up':
            return up
        case 'to-zero':
            return Math.abs(down) < Math.abs(up) ? down : up
        case 'nearest':
            return Math.abs(down - value) < Math.abs(up - value) ? down : up
        default:
            throw RangeError('Unexpected rounding strategy')
    }
}

/**
 * @param {number} number
 * @returns {number}
 *
 * Limit precision to 6 significant decimal digits to handle rounding error of
 * binary floating point (eg. 50 * 2.55 === 127.499... instead of 127.5).
 */
export function safeFloat(number) {
    return +number.toFixed(6)
}

/**
 * @param {number} number
 * @returns {number}
 */
export function sign(number) {
    if (number === -Infinity || (1 / number) < 0) {
        return -1
    }
    return 1
}

/**
 * @param {number} radians
 * @returns {number}
 */
export function toDegrees(radians) {
    return radians * 180 / Math.PI
}

/**
 * @param {number} radians
 * @returns {number}
 */
export function toRadians(degrees) {
    return degrees * Math.PI / 180
}

/**
 * @param {number} number
 * @returns {number}
 */
export function toEightBit(number) {
    return clamp(0, Math.round(safeFloat(number * 255)), 255)
}
