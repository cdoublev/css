
const { serializeCSSComponentValueList, serializeURL } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { isOmitted } = require('../values/validation.js')

/**
 * @param {CSSImportRuleImpl}
 * @returns {CSSStyleSheet|null}
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
class CSSImportRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude } = privateData
        const [{ value: href }, supports, media] = prelude
        this._conditions = [supports, media]
        this.href = href
        fetchImport(this)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
     * @see {@link https://github.com/w3c/csswg-drafts/issues/4828#issuecomment-1059910651}
     */
    get cssText() {
        const { _conditions, href, media } = this
        const url = serializeURL({ value: href })
        // Support conditions are matching otherwise `media` would be undefined
        if (media) {
            const { mediaText } = media
            const [supports] = _conditions
            if (supports.omitted) {
                return `@import ${url} ${mediaText};`
            }
            return `@import ${url} ${serializeCSSComponentValueList(supports)} ${mediaText};`
        }
        // Fallback to the declared `<media-query-list>` if any
        if (_condition.every(isOmitted)) {
            return `@import ${url};`
        }
        return `@import ${url} ${serializeCSSComponentValueList(_conditions)};`
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssimportrule-media}
     */
    get media() {
        return this.styleSheet?.media
    }
}

module.exports = {
    implementation: CSSImportRuleImpl,
}
