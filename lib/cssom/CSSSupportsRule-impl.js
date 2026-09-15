
import CSSConditionRuleImpl from './CSSConditionRule-impl.js'
import matchCondition from '../match/support.js'

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#csssupportsrule}
 */
export default class CSSSupportsRuleImpl extends CSSConditionRuleImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const rules = this.cssRules._rules.map(rule => rule.cssText).join(' ')
        return rules
            ? `@supports ${this.conditionText} { ${rules} }`
            : `@supports ${this.conditionText} { }`
    }

    /**
     * @returns {boolean}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-csssupportsrule-matches}
     */
    get matches() {
        return matchCondition(this._condition, this._globalObject)
    }
}
