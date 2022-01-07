
const { insertCSSRule, removeCSSRule } = require('./CSSRule-impl.js')
const { parseRule, parseRuleList } = require('../parse/syntax.js')
const CSSImportRule = require('./CSSImportRule.js')
const CSSRuleList = require('./CSSRuleList.js')
const DOMException = require('domexception')
const MediaList = require('./MediaList.js')
const { implementation: StyleSheetImpl } = require('./StyleSheet-impl.js')
const { serializeMediaQueryList } = require('./MediaList-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstylesheet}
 */
class CSSStyleSheetImpl extends StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-type}
     */
    type = 'text/css'

    /**
     * @see {@link https://drafts.csswg.org/cssom/#concept-css-style-sheet-disallow-modification-flag}
     */
    _disallowModification = false

    /**
     * @param {object} globalObject
     * @param {*[]} args
     * @param {object} [properties]
     * @see {@link https://drafts.csswg.org/cssom/#create-a-constructed-cssstylesheet}
     * @see {@link https://drafts.csswg.org/cssom/#create-a-css-style-sheet}
     * @see {@link https://html.spec.whatwg.org/#create-a-css-style-sheet}
     */
    constructor(globalObject, args, properties) {
        super()
        this._globalObject = globalObject
        if (properties) {
            // Create a CSS style sheet (not "constructed")
            const {
                alternate,
                cssRules,
                location,
                media,
                parent,
                originClean,
                ownerCSSRule,
                ownerNode,
                title,
            } = properties
            this._alternate = alternate
            this._baseURL = null
            this._constructed = false
            this._cssRules = cssRules
            this._document = null
            this._location = location
            this._media = serializeMediaQueryList(media)
            this._parent = parent
            this._originClean = originClean
            this.ownerNode = ownerNode
            this.ownerRule = ownerCSSRule
            this.title = title
        } else {
            // Create a constructed CSS style sheet
            const [{ baseURL, disabled, media }] = args
            const { document } = globalObject
            const { baseURL: documentBaseURL } = document
            this._alternate = false
            this._baseURL = baseURL
            this._constructed = true
            this._cssRules = []
            this._document = document
            this._location = documentBaseURL
            this._media = MediaList.create(globalObject)
            this._media.mediaText = typeof media === 'object' ? serializeMediaQueryList(media) : media
            this._originClean = true
            this.disabled = disabled
            this.ownerRule = null
        }
    }

    /**
     * @returns {CSSRuleList}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-cssrules}
     */
    get cssRules() {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        return CSSRuleList.create(this.globalObject, undefined, this._cssRules)
    }

    /**
     * @param {string} rule
     * @param {index} [index]
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-insertrule}
     */
    insertRule(rule, index = 0) {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        if (!this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        const parsed = parseRule(rule)
        if (parsed instanceof SyntaxError) {
            return parsed
        }
        const { name } = parsed
        if (name === 'import' && this._constructed) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SyntaxError')
        }
        return insertCSSRule(this._cssRules, parsed, index)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-deleterule}
     */
    deleteRule(index) {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        if (!this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        removeCSSRule(this._cssRules, index)
    }

    /**
     * @param {string} text
     * @returns {Promise}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-replace}
     */
    async replace(text) {
        return this.replaceSync(text)
    }

    /**
     * @param {string} text
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-replacesync}
     */
    replaceSync(text) {
        if (!this._constructed || this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        this._disallowModification = true
        try {
            // TODO: figure out if/how `parseRuleList()` can return a `CSSRule` subclass
            const rules = parseRuleList(text)
            rules.forEach((rule, index) => {
                if (CSSImportRule.is(rule)) {
                    removeCSSRule(rules, index)
                }
            })
            this._cssRules = rules
        } catch {
            this._cssRules = []
        }
        this._disallowModification = false
    }
}

module.exports = {
    implementation: CSSStyleSheetImpl,
}
