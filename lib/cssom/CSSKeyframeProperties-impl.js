
const { implementation: CSSStyleDeclarationImpl } = require('./CSSStyleDeclaration-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframeproperties}
 */
class CSSKeyframePropertiesImpl extends CSSStyleDeclarationImpl {}

module.exports = {
    implementation: CSSKeyframePropertiesImpl,
}
