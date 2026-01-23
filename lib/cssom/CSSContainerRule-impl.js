
import CSSConditionRuleImpl from './CSSConditionRule-impl.js'

/**
 * @see {@link https://drafts.csswg.org/css-conditional-5/#csscontainerrule}
 */
export default class CSSContainerRuleImpl extends CSSConditionRuleImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, conditionText } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        return rules
            ? `@container ${conditionText} { ${rules} }`
            : `@container ${conditionText} { }`
    }
}
