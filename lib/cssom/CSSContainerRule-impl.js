
const { serializeCSSComponentValue, serializeCSSComponentValueList } = require('../serialize.js')
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-5/#csscontainerrule}
 */
class CSSContainerRuleImpl extends CSSConditionRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude: [name, queries] } = privateData
        this.containerName = serializeCSSComponentValue(name)
        this.containerQuery = serializeCSSComponentValueList(queries)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _rules, conditionText } = this
        const rules = _rules.map(rule => rule.cssText).join(' ')
        if (rules) {
            return `@container ${conditionText} { ${rules} }`
        }
        return `@container ${conditionText} {}`
    }
}

module.exports = {
    implementation: CSSContainerRuleImpl,
}
