
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSNestedDeclarations = require('./CSSNestedDeclarations.js')
const CSSRuleList = require('./CSSRuleList.js')
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
        const { parentStyleSheet } = this
        const rules = parseBlockContents(privateData.value, this).map(rule => {
            if (Array.isArray(rule) ) {
                return CSSNestedDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
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
