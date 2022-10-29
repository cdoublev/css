
const { insertCSSRule, removeCSSRule } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssgroupingrule}
 */
class CSSGroupingRuleImpl extends CSSRuleImpl {

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
