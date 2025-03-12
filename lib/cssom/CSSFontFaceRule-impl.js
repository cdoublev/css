
const CSSFontFaceDescriptors = require('./CSSFontFaceDescriptors.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { parseBlockContents } = require('../parse/parser.js')

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
        const declarations = parseBlockContents(privateData.value, this)[0] ?? []
        this.style = CSSFontFaceDescriptors.createImpl(globalObject, undefined, { declarations, parentRule: this })
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
