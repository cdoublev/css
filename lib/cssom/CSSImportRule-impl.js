
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { serializeCSSComponentValueList, serializeURL } = require('../serialize.js')

/**
 * @param {CSSImportRuleImpl}
 * @returns {CSSStyleSheet|null}
 * @see {@link https://drafts.csswg.org/css-cascade-4/#fetch-an-import}
 *
 * TODO: figure out why/if "fetch an @import" has been intentionally removed
 * from Cascade 5 (Cascade 4 is still the "current" draft).
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
        /**
         * TODO: implement step 4 of "fetch an @import".
         *
         * - `function processResponse(response, maybeByteStream)`:
         *   1. return if !(maybeBystream instanceof ReadableStream)
         *   2. return if !response.headers.has('text/css')
         *   3. const originClean = response.type === 'cors' && parentOriginClean
         *   4. rule.styleSheet = CSSStyleSheet.create({ cssRules: maybeByteStream, media, originClean })
         * - `fetchStyleResource(url, parentStyleSheet, 'style', 'no-cors', processResponse)`
         *
         * TODO: implement "fetch a style resource".
         *
         * https://drafts.csswg.org/css-values-4/#fetch-a-style-resource
         *
         * `async fetchStyleResource(url, sheet, destination, cors, processResponse)`
         *   1. const url = new URL(url, sheet.href || '/')
         *   2. const init = { headers: 'ContentType: text/css', mode: cors }
         *   3. const reponse = try { await fetch(url, init) } catch (e) { // Report error }
         *   4. return processResponse(response, response.body)
         */
    } catch (error) {
        console.error(error.message)
    }
    console.error('Fetching style sheet referenced by @import is not supported yet')
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssimportrule}
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
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
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
        // Fallback to the specified `<media-query-list>` if any
        if (_conditions.every(condition => condition.omitted)) {
            return `@import ${url};`
        }
        return `@import ${url} ${serializeCSSComponentValueList(_conditions)};`
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssimportrule-media}
     */
    get media() {
        return this.styleSheet?.media
    }
}

module.exports = {
    implementation: CSSImportRuleImpl,
}
