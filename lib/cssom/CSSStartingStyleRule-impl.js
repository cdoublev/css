
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleRule = require('./CSSStyleRule.js')
const { parseBlockContents } = require('../parse/parser.js')

/**
 * @see {@link https://drafts.csswg.org/css-transitions-2/#cssstartingstylerule}
 */
class CSSStartingStyleRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { declarations, rules } = parseBlockContents(privateData.value, this)
        // Wrap declarations in nested style rule
        if (0 < declarations.length) {
            const data = { parentRule: this, parentStyleSheet: this.parentStyleSheet }
            const styleRule = CSSStyleRule.createImpl(globalObject, undefined, data)
            styleRule.style._declarations.push(...declarations)
            rules.unshift(styleRule)
        }
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const rules = this.cssRules._rules.map(rule => rule.cssText).join(' ')
        return rules
            ? `@starting-style { ${rules} }`
            : '@starting-style {}'
    }
}

module.exports = {
    implementation: CSSStartingStyleRuleImpl,
}
