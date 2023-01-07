
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const { serializeCSSComponentValueList } = require('../serialize')

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
        const { prelude } = privateData
        this.name = serializeCSSComponentValueList(prelude)
    }
}

module.exports = {
    implementation: CSSLayerBlockRuleImpl,
}
