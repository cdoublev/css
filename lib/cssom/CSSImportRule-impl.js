
import { serializeComponentValue, serializeURL } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import MediaList from './MediaList.js'
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
        const [supports, media] = conditions
        this._conditions = conditions
        this.href = location.value
        this.layerName = isOmitted(layer) ? null : serializeComponentValue(layer)
        this.media = MediaList.createImpl(globalObject, undefined, isOmitted(media) ? undefined : { list: media })
        this.supportsText = isOmitted(supports) ? null : serializeComponentValue(supports)
        fetchImport(this)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { href, layerName, media: { mediaText }, supportsText } = this
        const url = serializeURL({ value: href })
        let string = `@import ${url}`
        if (layerName) {
            string += layerName
        }
        if (supportsText) {
            string += ` ${supportsText}`
        }
        if (mediaText) {
            string += ` ${mediaText}`
        }
        return `${string};`
    }
}
