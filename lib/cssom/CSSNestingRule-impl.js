
const {
    createCSSRule,
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseSelectorGroup,
    removeCSSRule,
} = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { serializeSelectorGroup } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssnestingrule}
 */
class CSSNestingRule extends CSSRuleImpl {

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
        if (value) {
            return `@nest ${selectorText} {\n  ${value}\n}`
        }
        return `@nest ${selectorText} {}`
    }

    /**
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-selectortext}
     */
    get selectorText() {
        return serializeSelectorGroup(this._selectors)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-selectortext}
     */
    set selectorText(value) {
        const parsed = parseSelectorGroup(value)
        if (parsed) {
            this._selectors = parsed
        }
    }

    /**
     * @param {CSSRule} rule
     * @param {number} index
     * @returns {number}
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-insertrule}
     */
    insertRule(rule, index) {
        return insertCSSRule(this._rules, rule, index, this)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-deleterule}
     */
    deleteRule(index) {
        return removeCSSRule(this._rules, index)
    }
}

module.exports = {
    implementation: CSSNestingRule,
}
