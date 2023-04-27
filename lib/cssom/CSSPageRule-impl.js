
const { Parser, getDeclarationsInSpecifiedOrder, parseCSSGrammar } = require('../parse/syntax.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

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
        const { prelude, value: { declarations } } = privateData
        this._declarations = getDeclarationsInSpecifiedOrder(declarations)
        this._selectors = prelude
        const styleProperties = {
            declarations: this._declarations,
            parentRule: this,
        }
        this.style = CSSStyleDeclaration.create(globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
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
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    get selectorText() {
        return serializeCSSComponentValueList(this._selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(selector) {
        selector = parseCSSGrammar(selector, '<page-selector-list>', new Parser(this))
        if (selector) {
            this._selectors = selector
        }
    }
}

module.exports = {
    implementation: CSSPageRuleImpl,
}
