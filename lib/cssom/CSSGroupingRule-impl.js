
import { insertCSSRule, removeCSSRule } from '../parse/parser.js'
import CSSRuleImpl from './CSSRule-impl.js'

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssgroupingrule}
 */
export default class CSSGroupingRuleImpl extends CSSRuleImpl {

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
