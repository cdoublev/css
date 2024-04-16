
const { createCSSRule, insertCSSRule, removeCSSRule } = require('../parse/parser.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const { createContext } = require('../utils/context.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssgroupingrule}
 */
class CSSGroupingRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this._rules = privateData.value.rules.map(rule => createCSSRule(rule, this))
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @param {string} rule
     * @param {number} index
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-insertrule}
     */
    insertRule(rule, index) {
        return insertCSSRule(this._rules, rule, index, createContext(this))
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-deleterule}
     */
    deleteRule(index) {
        removeCSSRule(this._rules, index)
    }
}

module.exports = {
    implementation: CSSGroupingRuleImpl,
}
