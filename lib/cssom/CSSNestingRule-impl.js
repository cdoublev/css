
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
        const styleProperties = {
            declarations: getDeclarationsInSpecifiedOrder(declarations),
            parentRule: this,
        }
        this._declarations = declarations
        this._rules = rules.map(rule => createCSSRule(rule, this))
        this._selectors = prelude
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
        this.style = CSSStyleDeclaration.create(this._globalObject, undefined, styleProperties)
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
            this._selectors = value
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
