
const NEGATIVE_ZERO = -1 * 0

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
function isInfinite(value) {
    return value === Infinity || value === -Infinity
}

/**
 * @param {*} value
 * @returns {boolean}
 */
function isNegativeZero(value) {
    return Object.is(NEGATIVE_ZERO, value)
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
    if (number === -Infinity || 1 / number < 0) {
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
    NEGATIVE_ZERO,
    clamp,
    isInfinite,
    isNegativeZero,
    sign,
    safeFloat,
    toEightBit,
    toDegrees,
    toRadians,
}
