
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSNestedDeclarations = require('./CSSNestedDeclarations.js')
const CSSRuleList = require('./CSSRuleList.js')
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
        const { parentStyleSheet } = this
        const { prelude, value } = privateData
        const rules = parseBlockContents(value, this).map(rule => {
            if (Array.isArray(rule)) {
                return CSSNestedDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._condition = prelude
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
