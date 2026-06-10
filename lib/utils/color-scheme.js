
import { isFailure, isOmitted } from './value.js'
import { getSpecifiedValue } from '../resolve.js'
import { matchTreesAgainstSelectors } from '../match/selector.js'
import { parseGrammar } from '../parse/parser.js'
import properties from '../properties/definitions.js'

/**
 * @param {string[]} UASupport
 * @param {object[]|null} support
 * @param {string|null} preference
 * @returns {*[]}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#determine-the-used-color-scheme}
 */
function getUsedColorScheme(UASupport, support = null, preference = null) {

    // Assert: the first UA supported color scheme is its default color scheme

    if (!support?.some(scheme => UASupport.includes(scheme[0].value))) {
        return [UASupport[0], true]
    }

    const [schemes, only] = support

    if (!preference) {
        return [schemes[0].value]
    }

    preference = preference.split('overriding-')
    let overriding
    if (preference.length === 2) {
        overriding = true
        preference = preference[1]
    } else {
        overriding = false
        preference = preference[0]
    }

    if (/*UASupport.includes(preference) && */schemes.some(scheme => scheme.value === preference)) {
        return [preference]
    }
    if (!isOmitted(only)) {
        return [schemes[0].value]
    }
    if (overriding) {
        return [preference]
    }
    return [schemes[0].value]
}

/**
 * @param {Window} globalObject
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#pages-supported-color-scheme}
 * @see {@link https://html.spec.whatwg.org/multipage/semantics.html#meta-color-scheme}
 */
function getPageSupportedColorSchemes({ document }) {
    const selector = parseGrammar('meta[name=color-scheme][content]', '<selector-list>')
    const definition = properties['color-scheme'].value
    for (const meta of matchTreesAgainstSelectors([document], selector)) {
        const colorScheme = parseGrammar(meta.getAttribute('content'), definition)
        if (isFailure(colorScheme)) {
            continue
        }
        return colorScheme
    }
    return null
}

/**
 * @param {Window} globalObject
 * @returns {string[]}
 */
function getUASupportedColorScheme(globalObject) {
    return ['light', 'dark']
}

/**
 * @param {Window} globalObject
 * @returns {string|null}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#preferred-color-scheme}
 */
export function getUserPreferredColorScheme(globalObject) {
    return 'light'
}

/**
 * @param {Window} globalObject
 * @returns {string|null}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#preferred-color-scheme}
 */
function getPreferredColorScheme(globalObject) {
    if (globalObject?.frameElement) {
        return getElementColorScheme(globalObject.frameElement)
    }
    return getUserPreferredColorScheme(globalObject)
}

/**
 * @param {Window} globalObject
 * @returns {*[]}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#page-color-scheme}
 */
export function getPageColorScheme(globalObject) {
    return getUsedColorScheme(
        getUASupportedColorScheme(globalObject),
        getPageSupportedColorSchemes(globalObject),
        getPreferredColorScheme(globalObject))
}

/**
 * @param {Element} element
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#element-color-scheme}
 */
export function getElementColorScheme(element) {
    const { ownerDocument: { defaultView } } = element
    const support = getSpecifiedValue('color-scheme', element)
    if (support.value === 'normal') {
        return getPageColorScheme(defaultView)[0]
    }
    return getUsedColorScheme(
        getUASupportedColorScheme(defaultView),
        support,
        getPreferredColorScheme(defaultView))[0]
}
