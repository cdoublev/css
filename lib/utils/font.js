
import { states } from '../state.js'

/**
 * @param {object|object[]} family
 * @returns {number}
 */
export function getFontFamilyMetrics(family) {
    return { ascent: 0.905, descent: 0.212, lineGap: 0.033 }
}

/**
 * @param {object|object[]} family
 * @param {number} size
 * @returns {number}
 */
export function getNormalLineHeight(family, size) {
    const { ascent, descent, lineGap } = getFontFamilyMetrics(family)
    return (ascent + descent + lineGap) * size
}

/**
 * @param {Window} globalObject
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css2/#valdef-font-size-medium}
 */
export function getUserPreferredFontSize(globalObject) {
    return states.get(globalObject).shared.user.fontSize
}
