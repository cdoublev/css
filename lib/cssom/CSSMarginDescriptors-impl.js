
const { implementation: CSSStyleDeclarationImpl } = require('./CSSStyleDeclaration-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssmargindescriptors}
 */
class CSSMarginDescriptorsImpl extends CSSStyleDeclarationImpl {}

module.exports = {
    implementation: CSSMarginDescriptorsImpl,
}
