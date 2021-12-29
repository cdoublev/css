
/**
 * @param {number} t1
 * @param {number} t2
 * @param {number} hue
 */
function hueToRgb(t1, t2, hue) {
    if (hue < 0) {
        hue += 6
    }
    if (hue >= 6) {
        hue -= 6
    }
    if (hue < 1) {
        return ((t2 - t1) * hue) + t1
    } else if (hue < 3) {
        return t2
    } else if (hue < 4) {
        return ((t2 - t1) * (4 - hue)) + t1
    }
    return t1
}

/**
 * @param {number} hue Angle value in degrees
 * @param {number} saturation Percentage value
 * @param {number} lightness Percentage value
 * @returns {number[]}
 * @see {@link https://drafts.csswg.org/css-color/#hsl-to-rgb}
 */
function hslToRgb(hue, saturation, lightness) {
    hue = hue % 360 / 60
    saturation = Math.max(0, Math.min(100, saturation)) / 100
    lightness = Math.max(0, Math.min(100, lightness)) / 100
    const t2 = lightness <= 0.5
        ? lightness * (saturation + 1)
        : lightness + saturation - (lightness * saturation)
    const t1 = (lightness * 2) - t2
    const r = hueToRgb(t1, t2, hue + 2)
    const g = hueToRgb(t1, t2, hue)
    const b = hueToRgb(t1, t2, hue - 2)
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}

module.exports = {
    hslToRgb,
}
