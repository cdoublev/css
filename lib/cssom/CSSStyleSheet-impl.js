
const { createCSSRule, insertCSSRule, parseCSSStyleSheet, parseRule, removeCSSRule } = require('../parse/syntax.js')
const CSSRuleList = require('./CSSRuleList.js')
const DOMException = require('domexception')
const MediaList = require('./MediaList.js')
const { implementation: StyleSheetImpl } = require('./StyleSheet-impl.js')
const createError = require('../error.js')
const { serializeMediaQueryList } = require('../serialize.js')
const { wrapperForImpl } = require('./utils.js')

const ACCESS_THIRD_PARTY_STYLESHEET_ERROR = {
    message: 'Access to cross-origin stylesheet is not allowed',
    name: 'SecurityError',
    type: 'DOMException',
}
const INSERT_INVALID_IMPORT_ERROR = {
    message: 'Cannot insert @import in a constructed stylesheet',
    name: 'SyntaxError',
    type: 'DOMException',
}
const UPDATE_LOCKED_STYLESHEET_ERROR = {
    message: 'Cannot insert or replace rules (pending replacement or non-constructed stylesheet)',
    name: 'NotAllowedError',
    type: 'DOMException',
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssstylesheet}
 */
class CSSStyleSheetImpl extends StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#concept-css-style-sheet-type}
     */
    type = 'text/css'

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#concept-css-style-sheet-disallow-modification-flag}
     */
    _disallowModification = false

    /**
     * @param {object} globalObject
     * @param {[CSSStyleSheetInit]} args
     * @param {object} [properties]
     * @see {@link https://drafts.csswg.org/cssom-1/#create-a-constructed-cssstylesheet}
     * @see {@link https://drafts.csswg.org/cssom-1/#dictdef-cssstylesheetinit}
     * @see {@link https://drafts.csswg.org/cssom-1/#create-a-css-style-sheet}
     * @see {@link https://html.spec.whatwg.org/#create-a-css-style-sheet}
     */
    constructor(globalObject, [options], properties) {
        super()
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
                disabled = false,
                location = null,
                media,
                parentStyleSheet = null,
                originClean,
                ownerCSSRule = null,
                ownerNode,
                rules,
                title = '',
            } = properties
            this._alternate = alternate
            this._baseURL = null
            this._constructed = false
            this._document = null
            this._location = location
            this._originClean = originClean
            this._rules = parseCSSStyleSheet(this, rules).map(rule => createCSSRule(rule, this))
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
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-cssrules}
     */
    get cssRules() {
        if (!this._originClean) {
            throw createError(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
        }
        return this._cssRules
    }

    /**
     * @param {string} rule
     * @param {index} [index]
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-insertrule}
     */
    insertRule(rule, index) {
        if (!this._originClean) {
            throw createError(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
        }
        if (this._disallowModification) {
            throw createError(UPDATE_LOCKED_STYLESHEET_ERROR)
        }
        const parsed = parseRule(rule)
        const { name } = parsed
        if (parsed instanceof DOMException && name === 'SyntaxError') {
            return parsed
        }
        if (name === 'import' && this._constructed) {
            throw createError(INSERT_INVALID_IMPORT_ERROR)
        }
        return insertCSSRule(this._rules, rule, index, this)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-deleterule}
     */
    deleteRule(index) {
        if (!this._originClean) {
            throw createError(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
        }
        if (this._disallowModification) {
            throw createError(UPDATE_LOCKED_STYLESHEET_ERROR)
        }
        removeCSSRule(this._rules, index)
    }

    /**
     * @param {string} text
     * @returns {Promise}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-replace}
     */
    replace(text) {
        if (!this._constructed || this._disallowModification) {
            return Promise.reject(createError(UPDATE_LOCKED_STYLESHEET_ERROR))
        }
        this._disallowModification = true
        return Promise.resolve().then(() => {
            const rules = parseCSSStyleSheet(this, text, true).map(rule => createCSSRule(rule, this))
            this._rules.splice(0, this._rules.length, ...rules)
            this._disallowModification = false
            return wrapperForImpl(this)
        })
    }

    /**
     * @param {string} text
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-replacesync}
     */
    replaceSync(text) {
        if (!this._constructed || this._disallowModification) {
            throw createError(UPDATE_LOCKED_STYLESHEET_ERROR)
        }
        const rules = parseCSSStyleSheet(this, text, true).map(rule => createCSSRule(rule, this))
        this._rules.splice(0, this._rules.length, ...rules)
    }
}

module.exports = {
    ACCESS_THIRD_PARTY_STYLESHEET_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    UPDATE_LOCKED_STYLESHEET_ERROR,
    implementation: CSSStyleSheetImpl,
}
