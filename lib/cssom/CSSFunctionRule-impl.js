
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-mixins-1/#cssfunctionrule}
 */
class CSSFunctionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this._prelude = serializeCSSComponentValueList(privateData.prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _prelude, _rules } = this
        const rules = _rules.map(rule => rule.cssText).join(' ')
        return `@function ${_prelude} { ${rules} }`
    }
}

module.exports = {
    implementation: CSSFunctionRuleImpl,
}
