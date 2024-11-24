
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
     */
    get cssText() {
        const { _rules, name } = this
        const rules = _rules.map(rule => rule.cssText).join(' ')
        let string = '@layer '
        if (name) {
            string += `${name} `
        }
        string += rules ? `{ ${rules} }` : '{}'
        return string
    }
}

module.exports = {
    implementation: CSSLayerBlockRuleImpl,
}
