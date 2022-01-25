
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { evalCondition } = require('./CSSConditionRule-impl.js')
const { parseCSSStyleSheet } = require('../parse/syntax.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade/#at-import}
 */
const definition = {
    prelude: '[<url> | <string>] [supports([<supports-condition> | <declaration>])]? <media-query-list>?',
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssimportrule}
 */
class CSSImportRuleImpl extends CSSRuleImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssimportrule-stylesheet}
     */
    styleSheet

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData, definition)
        const { prelude } = privateData
        const [{ value: href }, condition] = prelude
        this._condition = condition
        this.href = href
        this._fetchImport()
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssimportrule-media}
     */
    get media() {
        return this.styleSheet?.media
    }

    /**
     * @returns {object}
     * @see {@link https://drafts.csswg.org/css-cascade/#fetch-an-import}
     *
     * TODO: figure out why/if "fetch an @import" has been intentionally removed
     * from Cascade 5 (Cascade 4 is still the "current" draft).
     */
    _fetchImport() {
        if (!evalCondition(this._condition)) {
            return
        }
        try {
            const url = new URL(this.href, this.parentStyleSheet.href)
            /**
             * TODO: implement step 4 of the "fetch an @import" procedure
             *
             * - `function processResponse(response, maybeByteStream)`:
             *   1. return if !(maybeBystream instanceof ReadableStream)
             *   2. return if !response.headers.has('text/css')
             *   3. const originClean = response.type === 'cors' && this.parentStyleSheet.originClean
             *   4. this.styleSheet = parseCSSStyleSheet({ cssRules: maybeByteStream, originClean })
             * - `fetchStyleResource(url, this.parentStyleSheet, 'style', 'no-cors', processResponse)`
             *
             * TODO: implement the "fetch a style resource" procedure
             *
             * https://drafts.csswg.org/css-values-4/#fetch-a-style-resource
             *
             * `async fetchStyleResource(url, sheet, destination, cors, processResponse)` is:
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
}

module.exports = {
    definition,
    implementation: CSSImportRuleImpl,
}
