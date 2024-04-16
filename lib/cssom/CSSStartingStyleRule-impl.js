
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')

/**
 * @see {@link https://drafts.csswg.org/css-transitions-2/#cssstartingstylerule}
 */
class CSSStartingStyleRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const rules = this._rules.map(rule => rule.cssText).join(' ')
        if (rules) {
            return `@starting-style { ${rules} }`
        }
        return '@starting-style {}'
    }
}

module.exports = {
    implementation: CSSStartingStyleRuleImpl,
}
