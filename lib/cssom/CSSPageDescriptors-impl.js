
const { implementation: CSSStyleDeclarationImpl } = require('./CSSStyleDeclaration-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#csspagedescriptors}
 */
class CSSPageDescriptorsImpl extends CSSStyleDeclarationImpl {}

module.exports = {
    implementation: CSSPageDescriptorsImpl,
}
