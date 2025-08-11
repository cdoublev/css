
import { clamp } from './math.js'

/**
 * @param {number} hue normalized in [0,360)
 * @param {number} saturation [0,100]
 * @param {number} lightness [0,100]
 * @returns {number[]} [0,1]
 * @see {@link https://drafts.csswg.org/css-color-4/#hsl-to-rgb}
 */
export function hslToRgb(hue, saturation, lightness) {
    saturation /= 100
    lightness /= 100
    function f(n) {
        const k = (n + (hue / 30)) % 12
        const a = saturation * Math.min(lightness, 1 - lightness)
        return lightness - (a * clamp(-1, Math.min(k - 3, 9 - k), 1))
    }
    return [f(0), f(8), f(4)]
}

/**
 * @param {number} hue normalized in [0,360)
 * @param {number} white [0,100]
 * @param {number} black [0,100]
 * @returns {number[]} [0,1]
 * @see {@link https://drafts.csswg.org/css-color-4/#hwb-to-rgb}
 */
export function hwbToRgb(hue, white, black) {
    white /= 100
    black /= 100
    if (1 <= (white + black)) {
        const gray = white / (white + black)
        return [gray, gray, gray]
    }
    return hslToRgb(hue, 100, 50).map(n => (n * (1 - white - black)) + white)
}
