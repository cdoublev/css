
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#csssupportsrule}
 */
class CSSSupportsRuleImpl extends CSSConditionRuleImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _rules, conditionText } = this
        const rules = _rules.map(rule => rule.cssText).join(' ')
        if (rules) {
            return `@supports ${conditionText} { ${rules} }`
        }
        return `@supports ${conditionText} {}`
    }
}

module.exports = {
    implementation: CSSSupportsRuleImpl,
}
