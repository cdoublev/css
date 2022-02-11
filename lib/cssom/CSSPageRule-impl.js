
const { createCSSRule, getDeclarationsInSpecifiedOrder } = require('../parse/syntax.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { parsePageSelectorsList } = require('../parse/syntax.js')
const { serializePageSelectorsList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#csspagerule}
 */
class CSSPageRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value: { declarations, rules } } = privateData
        this._declarations = getDeclarationsInSpecifiedOrder(declarations)
        this._rules = rules.map(rule => createCSSRule(rule, this))
        this._selectors = prelude
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
        const styleProperties = {
            declarations: this._declarations,
            parentRule: this,
        }
        this.style = CSSStyleDeclaration.create(this._globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { _rules, selectorText, style: { cssText } } = this
        const value = [cssText, ..._rules.map(({ cssText }) => cssText)].join('\n  ')
        if (selectorText) {
            if (value) {
                return `@page ${selectorText} {\n  ${value}\n}`
            }
            return `@page ${selectorText} {}`
        }
        if (value) {
            return `@page {\n  ${value}\n}`
        }
        return '@page {}'
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-selectortext}
     */
    get selectorText() {
        return serializePageSelectorsList(this._selectors)
    }

    /**
     * @param {string} value
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(value) {
        const parsed = parsePageSelectorsList(value)
        if (parsed) {
            this._selectors = parsed
        }
    }
}

module.exports = {
    implementation: CSSPageRuleImpl,
}
