
const NEGATIVE_ZERO = -1 * 0

/**
 * @param {number} min
 * @param {number} value
 * @param {number} max
 * @returns {number}
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

module.exports = {
    NEGATIVE_ZERO,
    clamp,
    isInfinite,
    isNegativeZero,
    sign,
    toDegrees,
    toRadians,
}
