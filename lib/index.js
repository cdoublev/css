
/* eslint-disable sort-keys */
const cssom = {
    CSS: require('./cssom/CSS.js'),
    StyleSheetList: require('./cssom/StyleSheetList.js'),
    // Required by CSSStyleSheet
    StyleSheet: require('./cssom/StyleSheet.js'),
    // Required by CSSStyleSheet and some CSSRule subclasses
    MediaList: require('./cssom/MediaList.js'),
    CSSRuleList: require('./cssom/CSSRuleList.js'),
    // Required by CSSImportRule
    CSSStyleSheet: require('./cssom/CSSStyleSheet.js'),
    // Required by all CSSRule subclasses
    CSSRule: require('./cssom/CSSRule.js'),
    // Required by CSSConditionRule, CSSLayerBlockRule, CSSLayerStatementRule, CSSPageRule
    CSSGroupingRule: require('./cssom/CSSGroupingRule.js'),
    // Required by CSSMediaRule and CSSSupportsRule
    CSSConditionRule: require('./cssom/CSSConditionRule.js'),
    // "Terminal" CSSRule subclasses
    // CSSColorProfile: require('./cssom/CSSColorProfile.js'),
    // CSSContainerRule: require('./cssom/CSSContainerRule.js'),
    // CSSCounterStyleRule: require('./cssom/CSSCounterStyleRule.js'),
    CSSFontFaceRule: require('./cssom/CSSFontFaceRule.js'),
    // CSSFontFeatureValuesRule: require('./cssom/CSSFontFeatureValuesRule.js'),
    // CSSFontPaletteValuesRule: require('./cssom/CSSFontPaletteValuesRule.js'),
    CSSImportRule: require('./cssom/CSSImportRule.js'),
    CSSKeyframeRule: require('./cssom/CSSKeyframeRule.js'),
    CSSKeyframesRule: require('./cssom/CSSKeyframesRule.js'),
    // CSSLayerBlockRule: require('./cssom/CSSLayerBlockRule.js'),
    // CSSLayerStatementRule: require('./cssom/CSSLayerStatementRule.js'),
    CSSMarginRule: require('./cssom/CSSMarginRule.js'),
    CSSMediaRule: require('./cssom/CSSMediaRule.js'),
    CSSNamespaceRule: require('./cssom/CSSNamespaceRule.js'),
    CSSPageRule: require('./cssom/CSSPageRule.js'),
    // CSSPropertyRule: require('./cssom/CSSPropertyRule.js'),
    CSSStyleDeclaration: require('./cssom/CSSStyleDeclaration.js'),
    CSSStyleRule: require('./cssom/CSSStyleRule.js'),
    CSSSupportsRule: require('./cssom/CSSSupportsRule.js'),
}
/* eslint-enable sort-keys */

/**
 * @param {DocumentOrShadowRoot} globalObject
 */
function install(globalObject = globalThis) {
    Object.values(cssom).forEach(wrapper => wrapper.install(globalObject, ['Window']))
    globalObject.CSS = cssom.CSS.create(globalObject)
}

module.exports = { cssom, install }
