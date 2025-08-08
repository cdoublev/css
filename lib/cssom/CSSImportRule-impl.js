
import { serializeCSSComponentValue, serializeCSSComponentValueList, serializeURL } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { isOmitted } from '../utils/value.js'

/**
 * @param {CSSImportRuleImpl} rule
 * @returns {CSSStyleSheet|null|undefined}
 * @see {@link https://drafts.csswg.org/css-cascade-4/#fetch-an-import}
 */
function fetchImport(rule) {
    const { _conditions: [{ match }], href, parentStyleSheet } = rule
    // Do not fetch style sheet if <supports-condition> does not match
    if (!match) {
        rule.styleSheet = null
        return
    }
    try {
        const { href: base, originClean: parentOriginClean } = parentStyleSheet
        const url = new URL(href, base)
    } catch (error) {
        console.error(error.message)
    }
    console.error('Fetching style sheet referenced by @import is not supported yet')
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssimportrule}
 */
export default class CSSImportRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude: [location, layer, conditions] } = privateData
        const supports = conditions[0]
        this._conditions = conditions
        this.href = location.value
        this.layerName = isOmitted(layer) ? null : serializeCSSComponentValue(layer)
        this.supportsText = isOmitted(supports) ? null : serializeCSSComponentValue(supports)
        fetchImport(this)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _conditions, href, layerName, media } = this
        const url = serializeURL({ value: href })
        let string = `@import ${url}`
        if (layerName) {
            string += layerName
        }
        // Support conditions are matching otherwise `media` would be undefined
        if (media) {
            const { mediaText } = media
            const supports = _conditions[0]
            if (isOmitted(supports)) {
                return `${string} ${mediaText};`
            }
            return `${string} ${serializeCSSComponentValueList(supports)} ${mediaText};`
        }
        // Fallback to the declared `<media-query-list>` if any
        if (isOmitted(_conditions)) {
            return `${string};`
        }
        return `${string} ${serializeCSSComponentValueList(_conditions)};`
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssimportrule-media}
     */
    get media() {
        return this.styleSheet?.media
    }
}
