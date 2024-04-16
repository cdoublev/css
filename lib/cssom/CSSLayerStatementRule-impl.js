
const { implementation: CSSRuleImpl } = require('./CSSRule-impl')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#csslayerstatementrule}
 */
class CSSLayerStatementRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this.nameList = serializeCSSComponentValueList(privateData.prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        return `@layer ${this.nameList};`
    }
}

module.exports = {
    implementation: CSSLayerStatementRuleImpl,
}
