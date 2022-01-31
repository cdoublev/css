
const { getDeclarationsInSpecifiedOrder } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssmarginrule}
 */
class CSSMarginRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { value: { declarations } } = privateData
        const styleProperties = {
            declarations: getDeclarationsInSpecifiedOrder(declarations),
            parentRule: this.parentRule,
        }
        this._declarations = declarations
        this.style = CSSStyleDeclaration.create(this._globalObject, undefined, styleProperties)
    }
}

module.exports = {
    implementation: CSSMarginRuleImpl,
}
