
const { insertCSSRule, removeCSSRule } = require('./CSSRule-impl.js')
const { parseRule, parseRuleList } = require('../parse/syntax.js')
const CSSImportRule = require('./CSSImportRule.js')
const CSSRuleList = require('./CSSRuleList.js')
const DOMException = require('domexception')
const MediaList = require('./MediaList.js')
const { implementation: StyleSheetImpl, parseStyleSheet } = require('./StyleSheet-impl.js')
const { serializeMediaQueryList } = require('./MediaList-impl.js')

/**
 * @param {string}
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 */
function parseCSSStyleSheet(input) {
    const { rules, ...stylesheet } = parseStyleSheet(input)
    return {
        ...stylesheet,
        rules: rules.reduce(rule => {
            /**
             * 1. Match rule against the grammar corresponding to its type: either a
             * style rule or an at rule.
             *
             * -> eg. `<style-rule> = <selector-list> '{' <style-block> '}'`
             *
             * 2. Filter out and log a parse error for invalid rules
             */
        }, []),
    }
}
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
            this._cssRules = cssRules
            this._document = null
            this._location = location
            this._originClean = originClean
            this.disabled = disabled
            this.media = MediaList.create(globalObject)
            this.media.mediaText = media
            this.ownerNode = ownerNode
            this.ownerRule = ownerCSSRule
            this.parentStyleSheet = parentStyleSheet
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
            this._originClean = true
            this.disabled = disabled
            this.media = MediaList.create(globalObject)
            this.media.mediaText = typeof media === 'object' ? serializeMediaQueryList(media) : media
            this.ownerNode = null
            this.ownerRule = null
            this.parentStyleSheet = null
            this.title = ''
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
        return CSSRuleList.create(this._globalObject, undefined, { rules: this._cssRules })
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
    parseCSSStyleSheet,
}
