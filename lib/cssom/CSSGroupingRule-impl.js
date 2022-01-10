
const { implementation: CSSRuleImpl, insertCSSRule, removeCSSRule } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssgroupingrule}
 */
class CSSGroupingRuleImpl extends CSSRuleImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-cssrules}
     */
    get cssRules() {
        return CSSRuleList.create(this._globalObject, [], { rules: this._childCSSRules })
    }

    /**
     * @param {CSSRule} rule
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-insertrule}
     */
    insertRule(rule, index) {
        return insertCSSRule(this._childCSSRules, rule, index)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-deleterule}
     */
    deleteRule(index) {
        return removeCSSRule(this._childCSSRules, index)
    }
}

module.exports = {
    implementation: CSSGroupingRuleImpl,
}
