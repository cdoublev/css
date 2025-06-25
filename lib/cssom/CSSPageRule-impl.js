
const { parseBlockContents, parseCSSGrammar } = require('../parse/parser.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSPageDeclarations = require('./CSSPageDeclarations.js')
const CSSPageDescriptors = require('./CSSPageDescriptors.js')
const CSSRuleList = require('./CSSRuleList.js')
const { isFailure } = require('../utils/value.js')
const { serializeCSSComponentValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#csspagerule}
 */
class CSSPageRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { prelude, value } = privateData
        const contents = parseBlockContents(value, this)
        const declarations = Array.isArray(contents[0]) ? contents.shift() : []
        const rules = contents.map(rule => {
            if (Array.isArray(rule)) {
                return CSSPageDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._selectors = prelude
        this.style = CSSPageDescriptors.createImpl(globalObject, undefined, { declarations, parentRule: this })
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, selectorText, style: { cssText } } = this
        let value = cssRules._rules.map(rule => rule.cssText)
        if (cssText) {
            value.unshift(cssText)
        }
        value = value.join(' ')
        if (selectorText) {
            if (value) {
                return `@page ${selectorText} { ${value} }`
            }
            return `@page ${selectorText} {}`
        }
        if (value) {
            return `@page { ${value} }`
        }
        return '@page {}'
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    get selectorText() {
        return serializeCSSComponentValue(this._selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(selector) {
        selector = parseCSSGrammar(selector, '<page-selector-list>', this)
        if (!isFailure(selector)) {
            this._selectors = selector
        }
    }
}

module.exports = {
    implementation: CSSPageRuleImpl,
}
