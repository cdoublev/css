
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleRule = require('./CSSStyleRule.js')
const { parseBlockContents } = require('../parse/parser.js')
const { serializeCSSComponentValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssconditionrule}
 */
class CSSConditionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        const { declarations, rules } = parseBlockContents(value, this)
        this._condition = prelude
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
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext}
     */
    get conditionText() {
        return serializeCSSComponentValue(this._condition)
    }
}

module.exports = {
    implementation: CSSConditionRuleImpl,
}
