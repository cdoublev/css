
const { implementation: CSSStyleDeclarationImpl } = require('./CSSStyleDeclaration-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-mixins-1/#cssfunctiondescriptors}
 */
class CSSFunctionDescriptorsImpl extends CSSStyleDeclarationImpl {}

module.exports = {
    implementation: CSSFunctionDescriptorsImpl,
}
