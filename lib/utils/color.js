
const D50 = [0.3457 / 0.3585, 1, (1.0 - 0.3457 - 0.3585) / 0.3585]

// Color space conversions

/**
 * @param {number[][]} m
 * @param {number[]} v
 * @returns {number[]}
 */
function multiplyMatriceByVector([[x1, x2, x3], [y1, y2, y3], [z1, z2, z3]], [a, b, c]) {
    return [
        (a * x1) + (b * x2) + (c * x3),
        (a * y1) + (b * y2) + (c * y3),
        (a * z1) + (b * z2) + (c * z3),
    ]
}

/**
 * @param {number} hue normalized in [0,360)
 * @param {number} saturation [0,100]
 * @param {number} lightness [0,100]
 * @returns {number[]} [[0,1], [0,1], [0,1]]
 * @see {@link https://drafts.csswg.org/css-color-4/#hsl-to-rgb}
 */
export function hslToRgb(hue, saturation, lightness) {
    saturation /= 100
    lightness /= 100
    function f(n) {
        const k = (n + (hue / 30)) % 12
        const a = saturation * Math.min(lightness, 1 - lightness)
        return lightness - (a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))
    }
    return [f(0), f(8), f(4)]
}

/**
 * @param {number} hue normalized in [0,360)
 * @param {number} white [0,100]
 * @param {number} black [0,100]
 * @returns {number[]} [[0,1], [0,1], [0,1]]
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

/**
 * @param {number} r [0,1]
 * @param {number} g [0,1]
 * @param {number} b [0,1]
 * @returns {number[]} [[0,1], [0,1], [0,1]]
 */
export function rgbLinearToXyzD65(...rgb) {
    const M = [
        [506752 / 1228815, 87881 / 245763, 12673 / 70218],
        [87098 / 409605, 175762 / 245763, 12673 / 175545],
        [7918 / 409605, 87881 / 737289, 1001167 / 1053270],
    ]
    return multiplyMatriceByVector(M, rgb)
}

/**
 * @param {number} r [0,1]
 * @param {number} g [0,1]
 * @param {number} b [0,1]
 * @returns {number[]} [[0,1], [0,1], [0,1]]
 */
export function rgbToRgbLinear(...rgb) {
    return rgb.map(value => {
        const abs = Math.abs(value)
        if (abs <= 0.04045) {
            return value / 12.92
        }
        const sign = value < 0 ? -1 : 1
        return sign * (((abs + 0.055) / 1.055) ** 2.4)
    })
}

/**
 * @param {number} x [0,1]
 * @param {number} y [0,1]
 * @param {number} z [0,1]
 * @returns {number[]} [[0,100], [-125,125], [-125,125]]
 */
export function xyzD50ToLab(...xyz) {
    const epsilon = 216 / 24389
    const kappa = 24389 / 27
    const [f1, f2, f3] = xyz.map((value, index) => {
        value /= D50[index]
        return epsilon <= value ? ((kappa * value) + 16) / 116 : Math.cbrt(value)
    })
    return [
        (116 * f2) - 16,
        (f1 - f2) * 500,
        (f2 - f3) * 200,
    ]
}

/**
 * @param {number} x [0,1]
 * @param {number} y [0,1]
 * @param {number} z [0,1]
 * @returns {number[]} [[0,1], [0,1], [0,1]]
 */
export function xyzD65ToXyzD50(...xyz) {
    const M =  [
        [1.0479297925449969, 0.022946870601609652, -0.05019226628920524],
        [0.02962780877005599, 0.9904344267538799, -0.017073799063418826],
        [-0.009243040646204504, 0.015055191490298152, 0.7518742814281371],
    ]
    return multiplyMatriceByVector(M, xyz)
}


// Inspection

/**
 * @param {object} c1
 * @param {object} c2
 * @returns {number}
 * @see {@link https://w3c.github.io/wcag/guidelines/22/#dfn-contrast-ratio}
 */
export function getContrast(c1, c2) {
    const l1 = getRelativeLuminance(c1) + 0.05
    const l2 = getRelativeLuminance(c2) + 0.05
    return l1 < l2 ? l2 / l1 : l1 / l2
}

/**
 * @param {object} rgb
 * @returns {number}
 */
export function getLabLuminance(rgb) {
    const linear = rgbToRgbLinear(...rgb.value[0].map(component => component.value / 255))
    const xyzD65 = rgbLinearToXyzD65(...linear)
    const xyzD50 = xyzD65ToXyzD50(...xyzD65)
    return xyzD50ToLab(...xyzD50)[0]
}

/**
 * @param {rgb}
 * @returns {number}
 */
export function getRelativeLuminance(rgb) {
    const [r, g, b] = rgbToRgbLinear(...rgb.value[0].map(component => component.value / 255))
    return (r * 0.2126) + (g * 0.7152) + (b * 0.0722)
}
