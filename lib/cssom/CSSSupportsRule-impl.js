
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl')
const CSSRuleList = require('./CSSRuleList.js')
const { parseCSSRuleList } = require('../parse/syntax.js')

class CSSSupportsRuleImpl extends CSSConditionRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { value } = privateData
        this._rules = parseCSSRuleList(value, this)
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
    }
}

module.exports = {
    implementation: CSSSupportsRuleImpl,
}
