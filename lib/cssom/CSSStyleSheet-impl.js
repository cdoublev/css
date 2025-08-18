
import { ACCESS_THIRD_PARTY_STYLESHEET_ERROR, UPDATE_LOCKED_STYLESHEET_ERROR, create as error } from '../error.js'
import { insertRule, parseGrammar, removeRule } from '../parse/parser.js'
import CSSImportRule from './CSSImportRule.js'
import CSSRuleList from './CSSRuleList.js'
import MediaList from './MediaList.js'
import StyleSheetImpl from './StyleSheet-impl.js'
import root from '../rules/definitions.js'
import { wrapperForImpl } from './utils.js'

/**
 * @param {MediaListImpl|string} list
 * @param {object} globalObject
 * @returns {MediaListImpl}
 */
function createMediaList(list, globalObject) {
    if (MediaList.isImpl(list)) {
        list = list.mediaText
    }
    list = parseGrammar(list, '<media-query-list>')
    return MediaList.createImpl(globalObject, undefined, { list })
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssstylesheet}
 */
export default class CSSStyleSheetImpl extends StyleSheetImpl {

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
            this._alternate = false
            this._baseURL = baseURL
            this._constructed = true
            this._document = document
            this._location = document.href
            this._originClean = true
            this._rules = []
            this.disabled = disabled
            this.media = createMediaList(media, globalObject)
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
                media = '',
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
            this._rules = parseGrammar(rules, root.value, this)
            this.disabled = disabled
            this.media = createMediaList(media, globalObject)
            this.ownerNode = ownerNode
            this.ownerRule = ownerCSSRule
            this.parentStyleSheet = parentStyleSheet
            this.title = title
        }
        this._cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @returns {CSSRuleListImpl}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-cssrules}
     */
    get cssRules() {
        if (!this._originClean) {
            throw error(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
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
            throw error(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
        }
        if (this._disallowModification) {
            throw error(UPDATE_LOCKED_STYLESHEET_ERROR)
        }
        return insertRule(this._rules, rule, index, this, !this._constructed)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-deleterule}
     */
    deleteRule(index) {
        if (!this._originClean) {
            throw error(ACCESS_THIRD_PARTY_STYLESHEET_ERROR)
        }
        if (this._disallowModification) {
            throw error(UPDATE_LOCKED_STYLESHEET_ERROR)
        }
        removeRule(this._rules, index)
    }

    /**
     * @param {string} text
     * @returns {Promise}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-replace}
     */
    async replace(text) {
        if (!this._constructed || this._disallowModification) {
            return Promise.reject(error(UPDATE_LOCKED_STYLESHEET_ERROR))
        }
        this._disallowModification = true
        await Promise.resolve()
        this._rules.splice(0)
        const rules = parseGrammar(text, root.value, this).filter(rule => !CSSImportRule.isImpl(rule))
        this._rules.push(...rules)
        this._disallowModification = false
        return wrapperForImpl(this)
    }

    /**
     * @param {string} text
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylesheet-replacesync}
     */
    replaceSync(text) {
        if (!this._constructed || this._disallowModification) {
            throw error(UPDATE_LOCKED_STYLESHEET_ERROR)
        }
        this._rules.splice(0)
        const rules = parseGrammar(text, root.value, this).filter(rule => !CSSImportRule.isImpl(rule))
        this._rules.push(...rules)
    }
}
