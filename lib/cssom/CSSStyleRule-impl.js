
const {
    createCSSRule,
    createParser,
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseCSSGrammar,
    removeCSSRule,
} = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstylerule}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssom-style}
 */
class CSSStyleRuleImpl extends CSSRuleImpl {

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
        this.style = CSSStyleDeclaration.create(globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { _rules, selectorText, style: { cssText } } = this
        const value = [cssText, ..._rules.map(({ cssText }) => cssText)].join('\n  ')
        if (value) {
            return `${selectorText} {\n  ${value}\n}`
        }
        return `${selectorText} {}`
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    get selectorText() {
        return serializeCSSComponentValueList(this._selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    set selectorText(selector) {
        selector = parseCSSGrammar(selector, '<selector-list>', createParser(this))
        if (selector) {
            this._selectors = selector
        }
    }

    /**
     * @param {CSSRuleImpl} rule
     * @param {number} index
     * @returns {number}
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssstylerule-insertrule}
     */
    insertRule(rule, index) {
        return insertCSSRule(this._rules, rule, index, this)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssstylerule-deleterule}
     */
    deleteRule(index) {
        return removeCSSRule(this._rules, index)
    }
}

module.exports = {
    implementation: CSSStyleRuleImpl,
}
