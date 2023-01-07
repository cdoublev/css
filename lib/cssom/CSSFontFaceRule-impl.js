
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { getDeclarationsInSpecifiedOrder } = require('../parse/syntax.js')

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontfacerule}
 */
class CSSFontFaceRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { value: { declarations } } = privateData
        this._declarations = getDeclarationsInSpecifiedOrder(declarations)
        const styleProperties = {
            declarations: this._declarations,
            parentRule: this,
        }
        this.style = CSSStyleDeclaration.create(globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
     */
    get cssText() {
        const { style: { cssText } } = this
        if (cssText) {
            return `@font-face {\n  ${cssText}\n}`
        }
        return '@font-face {}'
    }
}

module.exports = {
    implementation: CSSFontFaceRuleImpl,
}
