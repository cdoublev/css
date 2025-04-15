
/**
 * @param {number} min
 * @param {number} value
 * @param {number} max
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-clamp}
 */
function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max))
}

/**
 * @param {*} value
 * @returns {boolean}
 */
function isDegenerate(value) {
    return typeof value === 'number' && !isFinite(value)
}

/**
 * @param {*} value
 * @returns {boolean}
 */
function isInfinite(value) {
    return value === Infinity || value === -Infinity
}

/**
 * @param {*} value
 * @returns {boolean}
 */
function isNegativeZero(value) {
    return Object.is(-0, value)
}

/**
 * @param {string} strategy
 * @param {number} value
 * @param {number} precision
 * @returns {object}
 */
function round(strategy, value, precision) {
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
function safeFloat(number) {
    return +number.toFixed(6)
}

/**
 * @param {number} number
 * @returns {number}
 */
function sign(number) {
    if (number === -Infinity || (1 / number) < 0) {
        return -1
    }
    return 1
}

/**
 * @param {number} radians
 * @returns {number}
 */
function toDegrees(radians) {
    return radians * 180 / Math.PI
}

/**
 * @param {number} radians
 * @returns {number}
 */
function toRadians(degrees) {
    return degrees * Math.PI / 180
}

/**
 * @param {number} number
 * @returns {number}
 */
function toEightBit(number) {
    return Math.round(safeFloat(number * 255))
}

module.exports = {
    clamp,
    isDegenerate,
    isInfinite,
    isNegativeZero,
    round,
    safeFloat,
    sign,
    toDegrees,
    toEightBit,
    toRadians,
}
