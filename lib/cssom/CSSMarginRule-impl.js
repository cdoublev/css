
const { getDeclarationsInSpecifiedOrder } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { serializeCSSComponentValue } = require('../serialize.js')

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
        const { name, value: { declarations } } = privateData
        this._declarations = getDeclarationsInSpecifiedOrder(declarations)
        const styleProperties = {
            declarations: this._declarations,
            parentRule: this,
        }
        this.name = serializeCSSComponentValue(name)
        this.style = CSSStyleDeclaration.create(globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { name, style: { cssText } } = this
        if (cssText) {
            return `@${name} {\n  ${cssText}\n}`
        }
        return `@${name} {}`
    }
}

module.exports = {
    implementation: CSSMarginRuleImpl,
}
