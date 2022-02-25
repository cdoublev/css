
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl')

class CSSSupportsRuleImpl extends CSSConditionRuleImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { _rules, conditionText } = this
        const rules = _rules.map(({ cssText }) => cssText).join('\n  ')
        if (rules) {
            return `@supports ${conditionText} {\n  ${rules}\n}`
        }
        return `@supports ${conditionText} {}`
    }
}

module.exports = {
    implementation: CSSSupportsRuleImpl,
}
