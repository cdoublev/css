
const { insertCSSRule, parseCSSRuleList, parseRule, removeCSSRule } = require('../parse/syntax.js')
const CSSImportRule = require('./CSSImportRule.js')
const CSSRuleList = require('./CSSRuleList.js')
const DOMException = require('domexception')
const MediaList = require('./MediaList.js')
const { implementation: StyleSheetImpl } = require('./StyleSheet-impl.js')
const { serializeMediaQueryList } = require('../serialize.js')

const definition = {
    value: {
        rules: [],
        type: '<stylesheet>',
    },
}

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
     * @param {[CSSStyleSheetInit]} args
     * @param {object} [properties]
     * @see {@link https://drafts.csswg.org/cssom/#create-a-constructed-cssstylesheet}
     * @see {@link https://drafts.csswg.org/cssom/#dictdef-cssstylesheetinit}
     * @see {@link https://drafts.csswg.org/cssom/#create-a-css-style-sheet}
     * @see {@link https://html.spec.whatwg.org/#create-a-css-style-sheet}
     */
    constructor(globalObject, [options], properties) {
        super()
        this._definition = definition
        this._globalObject = globalObject
        if (options) {
            // Create a constructed CSS style sheet
            const { baseURL, disabled, media } = options
            const { document } = globalObject
            const { href } = document
            this._alternate = false
            this._baseURL = baseURL
            this._constructed = true
            this._document = document
            this._location = href
            this._originClean = true
            this._rules = []
            this.disabled = disabled
            this.media = MediaList.create(globalObject)
            this.media.mediaText = typeof media === 'object' ? serializeMediaQueryList(media) : media
            this.ownerNode = null
            this.ownerRule = null
            this.parentStyleSheet = null
            this.title = ''
        } else {
            // Create a CSS style sheet (not "constructed")
            const {
                alternate = false,
                cssRules,
                disabled = false,
                location = null,
                media,
                parentStyleSheet = null,
                originClean,
                ownerCSSRule = null,
                ownerNode,
                title = '',
            } = properties
            this._alternate = alternate
            this._baseURL = null
            this._constructed = false
            this._document = null
            this._location = location
            this._originClean = originClean
            this._rules = parseCSSRuleList(cssRules, this)
            this.disabled = disabled
            this.media = MediaList.create(globalObject)
            this.media.mediaText = media
            this.ownerNode = ownerNode
            this.ownerRule = ownerCSSRule
            this.parentStyleSheet = parentStyleSheet
            this.title = title
        }
        this._cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @returns {CSSRuleList}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-cssrules}
     */
    get cssRules() {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        return this._cssRules
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
        if (this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        const parsed = parseRule(rule)
        if (rule instanceof DOMException && rule.name === 'SyntaxError') {
            return parsed
        }
        if (CSSImportRule.is(parsed) && this._constructed) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SyntaxError')
        }
        return insertCSSRule(this._rules, rule, index, this)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-deleterule}
     */
    deleteRule(index) {
        if (!this._originClean) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'SecurityError')
        }
        if (this._disallowModification) {
            throw new DOMException('TODO: check out the error message from browser vendors', 'NotAllowedError')
        }
        removeCSSRule(this._rules, index)
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
        this._rules = parseCSSRuleList(text, definition.value, this)
        this._disallowModification = false
    }
}

module.exports = {
    definition,
    implementation: CSSStyleSheetImpl,
}
