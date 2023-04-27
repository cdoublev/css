
const { createCSSRule, insertCSSRule, removeCSSRule } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')

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
        const { value: { rules } } = privateData
        this._rules = rules.map(rule => createCSSRule(rule, this))
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @param {string} rule
     * @param {number} index
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-insertrule}
     */
    insertRule(rule, index) {
        return insertCSSRule(this._rules, rule, index, this)
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
