
const { insertCSSRule, removeCSSRule } = require('../parse/parser.js')
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
        return insertCSSRule(this.cssRules._rules, rule, index, this)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-deleterule}
     */
    deleteRule(index) {
        removeCSSRule(this.cssRules._rules, index)
    }
}

module.exports = {
    implementation: CSSGroupingRuleImpl,
}
