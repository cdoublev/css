
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl')
const CSSRuleList = require('./CSSRuleList.js')
const { createCSSRule } = require('../parse/syntax.js')

class CSSSupportsRuleImpl extends CSSConditionRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { value } = privateData
        this._rules = value.map(rule => createCSSRule(rule, this))
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { _rules, media: { mediaText } } = this
        const rules = _rules.map(({ cssText }) => cssText).join('\n  ')
        if (rules) {
            return `@supports ${mediaText} {\n  ${rules}\n}`
        }
        return `@supports ${mediaText} {}`
    }
}

module.exports = {
    implementation: CSSSupportsRuleImpl,
}
