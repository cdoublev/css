
const { implementation: MediaList, serializeMediaQueryList } = require('./MediaList-impl.js')
const { NoModificationAllowedError, NotAllowedError, SecurityError } = require('./errors.js')
const { parseRule, parseRuleList } = require('./parse/syntax.js')
const { implementation: StyleSheetImpl } = require('./StyleSheet-impl.js')
const { insertCSSRule } = require('./CSSRule.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstylesheet}
 */
class CSSStyleSheetImpl extends StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-alternate-flag}
     */
    #alternate = false

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-stylesheet-base-url}
     */
    #baseURL = null

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-constructed-flag}
     */
    #constructed = false

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-constructor-document}
     */
    #document = null

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-disallow-modification-flag}
     */
    #disallowModification = false

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-origin-clean-flag}
     */
    #originClean = true

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-owner-css-rule}
     */
    #ownerCSSRule = null

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-css-rules}
     */
    #rules

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-type}
     */
    #type = 'text/css'

    /**
     * @param {object} globalObject
     * @param {*[]} args
     * @param {object} [properties]
     * @see {@link https://drafts.csswg.org/cssom/#create-a-constructed-cssstylesheet}
     * @see {@link https://drafts.csswg.org/cssom/#create-a-css-style-sheet}
     */
    constructor(globalObject, [{ baseURL, disabled, media }]) {
        const { document } = globalObject
        const { baseURL: documentBaseURL } = document
        this.#constructed = true
        this.#document = document
        this.#location = documentBaseURL
        this.#baseURL = baseURL
        if (typeof media === 'object') {
            media = serializeMediaQueryList(media)
        }
        this.#media = new MediaList(media)
        this.disabled = disabled
    }

    /**
     * @returns {CSSRuleList}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-cssrules}
     */
    get cssRules() {
        if (!this.#originClean) {
            throw new SecurityError('TODO: check out the error message from browser vendors')
        }
        // TODO: figure out if `Object.freeze()` is the expected way to return a read-only value
        return Object.freeze(this.#rules)
    }

    /**
     * @returns {CSSRule|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-ownerrule}
     */
    get ownerRule() {
        return this.#ownerCSSRule
    }

    /**
     * @param {string} rule
     * @param {index} [index]
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-insertrule}
     */
    insertRule(rule, index = 0) {
        if (!this.#originClean) {
            throw new SecurityError('TODO: check out the error message from browser vendors')
        }
        if (!this.#disallowModification) {
            throw new NoModificationAllowedError('TODO: check out the error message from browser vendors')
        }
        const parsed = parseRule(rule)
        if (parsed instanceof SyntaxError) {
            return parsed
        }
        if (parsed.name === 'import' && this.#constructed) {
            throw new SyntaxError('TODO: check out the error message from browser vendors')
        }
        return insertCSSRule(this.#rules, parsed, index)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-deleterule}
     */
    deleteRule(index) {
        if (!this.#originClean) {
            throw new SecurityError('TODO: check out the error message from browser vendors')
        }
        if (!this.#disallowModification) {
            throw new NoModificationAllowedError('TODO: check out the error message from browser vendors')
        }
        removeCSSRule(this.#rules, index)
    }

    /**
     * @async
     * @param {string} text
     * @returns {Promise}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-replace}
     */
    replace(text) {
        return new Promise((resolve, reject) => {
            try {
                this.replaceSync(text)
                resolve(this)
            } catch (e) {
                reject(e)
            }
        })
    }

    /**
     * @param {string} text
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-replacesync}
     */
    replaceSync(text) {
        if (!this.#constructed || this.#disallowModification) {
            throw new NotAllowedError('TODO: check out the error message from browser vendors')
        }
        this.#disallowModification = true
        this.#rules = (parseRuleList(text) ?? []).filter(({ name }) => name !== 'import')
        this.#disallowModification = false
    }
}

module.exports = {
    implementation: CSSStyleSheetImpl,
}
