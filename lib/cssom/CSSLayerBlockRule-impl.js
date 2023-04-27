
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const { serializeCSSComponentValue } = require('../serialize')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#csslayerblockrule}
 */
class CSSLayerBlockRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this.name = serializeCSSComponentValue(privateData.prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
     * @see {@link https://github.com/w3c/csswg-drafts/issues/4828#issuecomment-1059910651}
     */
    get cssText() {
        const { _rules, name } = this
        const rules = _rules.map(({ cssText }) => cssText).join('\n  ')
        if (rules) {
            return `@layer ${name} {\n  ${rules}\n}`
        }
        return `@layer ${name} {}`
    }
}

module.exports = {
    implementation: CSSLayerBlockRuleImpl,
}
