
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#csssupportsrule}
 */
class CSSSupportsRuleImpl extends CSSConditionRuleImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
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
