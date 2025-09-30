
import { isFunction, isOmitted } from '../utils/value.js'
import { serializeComponentValue, serializeURL } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import MediaList from './MediaList.js'

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
        if (isFunction(location)) {
            this.href = location.value[0].value
        } else {
            this.href = location.value
        }
        if (isFunction(layer)) {
            this.layerName = serializeComponentValue(layer.value)
        } else if (isOmitted(layer)) {
            this.layerName = null
        } else {
            this.layerName = ''
        }
        this.media = MediaList.createImpl(globalObject, undefined, isOmitted(media) ? undefined : { list: media })
        if (isOmitted(supports)) {
            this.supportsText = null
        } else {
            this.supportsText = serializeComponentValue(supports.value)
        }
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
            string += ` layer(${layerName})`
        } else if (layerName === '') {
            string += ' layer'
        }
        if (supportsText) {
            string += ` supports(${supportsText})`
        }
        if (mediaText && mediaText !== 'all') {
            string += ` ${mediaText}`
        }
        return `${string};`
    }
}
