
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#csslayerstatementrule}
 */
class CSSLayerStatementRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude } = privateData
        this.nameList = serializeCSSComponentValueList(prelude)
    }
}

module.exports = {
    implementation: CSSLayerStatementRuleImpl,
}
