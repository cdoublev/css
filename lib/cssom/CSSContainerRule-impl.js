
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-5/#csscontainerrule}
 */
class CSSContainerRuleImpl extends CSSConditionRuleImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _rules, conditionText } = this
        const rules = _rules.map(rule => rule.cssText).join(' ')
        if (rules) {
            return `@container ${conditionText} { ${rules} }`
        }
        return `@container ${conditionText} {}`
    }
}

module.exports = {
    implementation: CSSContainerRuleImpl,
}
