
const { clamp } = require('./math.js')

const sRGB = ['hex-color', 'hsl()', 'hsla()', 'hwb()', 'rgb()', 'rgba()']

/**
 * @param {number} hue Unboudned
 * @param {number} saturation [0,100]
 * @param {number} lightness [0,100]
 * @returns {number[]} RGB in [0,1]
 * @see {@link https://drafts.csswg.org/css-color-4/#hsl-to-rgb}
 */
function hslToRgb (hue, saturation, lightness) {
    saturation /= 100
    lightness /= 100
    function f(n) {
        let k = (n + hue / 30) % 12
        let a = saturation * Math.min(lightness, 1 - lightness)
        return lightness - a * clamp(-1, Math.min(k - 3, 9 - k), 1)
    }
    return [f(0), f(8), f(4)]
}

/**
 * @param {number} hue Unboudned
 * @param {number} white [0,100]
 * @param {number} black [0,100]
 * @returns {number[]} RGB in [0,1]
 * @see {@link https://drafts.csswg.org/css-color-4/#hwb-to-rgb}
 */
function hwbToRgb(hue, white, black) {
    white /= 100
    black /= 100
    if (1 <= (white + black)) {
        const gray = white / (white + black)
        return [gray, gray, gray]
    }
    return hslToRgb(hue, 100, 50).map(n => n * (1 - white - black) + white)
}

module.exports = {
    hslToRgb,
    hwbToRgb,
    sRGB,
}
