
const CSSFontFaceDescriptors = require('./CSSFontFaceDescriptors.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

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
        this.style = CSSFontFaceDescriptors.createImpl(globalObject, undefined, {
            declarations: privateData.value.declarations,
            parentRule: this,
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { style: { cssText } } = this
        return cssText
            ? `@font-face { ${cssText} }`
            : '@font-face {}'
    }
}

module.exports = {
    implementation: CSSFontFaceRuleImpl,
}
