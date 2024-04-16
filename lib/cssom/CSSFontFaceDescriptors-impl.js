
const { implementation: CSSStyleDeclarationImpl } = require('./CSSStyleDeclaration-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-fonts-5/#cssfontfacedescriptors}
 */
class CSSFontFaceDescriptorsImpl extends CSSStyleDeclarationImpl {}

module.exports = {
    implementation: CSSFontFaceDescriptorsImpl,
}
