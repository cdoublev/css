
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { getDeclarationsInSpecifiedOrder } = require('./helpers.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssmarginrule}
 */
class CSSMarginRuleImpl extends CSSRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { component: { name } } = privateData
        this.name = name
    }

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssmarginrule-style}
     */
    get style() {
        const properties = {
            declarations: getDeclarationsInSpecifiedOrder(this._childCSSRules),
            parentRule: this.parentRule,
        }
        return CSSStyleDeclaration.create(this._globalObject, [], properties)
    }
}

module.exports = {
    implementation: CSSMarginRuleImpl,
}
