
const {
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseCSSStyleBlock,
    parseSelectorGroup,
    removeCSSRule,
} = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { serializeSelectorGroup } = require('../serialize.js')

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
        const { prelude, value } = privateData
        const { declarations, rules } = parseCSSStyleBlock(value, this)
        const styleProperties = {
            declarations: getDeclarationsInSpecifiedOrder(declarations),
            parentRule: this,
        }
        this._declarations = declarations
        this._rules = rules
        this._selectors = prelude
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules })
        this.style = CSSStyleDeclaration.create(this._globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    get selectorText() {
        return serializeSelectorGroup(this._selectors)
    }

    /**
     * @param {string} input
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    set selectorText(input) {
        const selectors = parseSelectorGroup(input)
        if (selectors) {
            this._selectors = selectors
        }
    }

    /**
     * @param {CSSRule} rule
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
