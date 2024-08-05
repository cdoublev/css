
/* eslint-disable sort-keys */
const cssom = {
    // Dependency free
    CSS: require('./cssom/CSS.js'),
    CSSFontFeatureValuesMap: require('./cssom/CSSFontFeatureValuesMap.js'),
    CSSRule: require('./cssom/CSSRule.js'),
    CSSRuleList: require('./cssom/CSSRuleList.js'),
    CSSStyleDeclaration: require('./cssom/CSSStyleDeclaration.js'),
    MediaList: require('./cssom/MediaList.js'),
    StyleSheet: require('./cssom/StyleSheet.js'),
    StyleSheetList: require('./cssom/StyleSheetList.js'),
    // Depends on StyleSheet and CSSRuleList
    CSSStyleSheet: require('./cssom/CSSStyleSheet.js'),
    // Depends on CSSStyleDeclaration
    CSSFontFaceDescriptors: require('./cssom/CSSFontFaceDescriptors.js'),
    CSSKeyframeProperties: require('./cssom/CSSKeyframeProperties.js'),
    CSSMarginDescriptors: require('./cssom/CSSMarginDescriptors.js'),
    CSSPageDescriptors: require('./cssom/CSSPageDescriptors.js'),
    CSSPositionTryDescriptors: require('./cssom/CSSPositionTryDescriptors.js'),
    CSSStyleProperties: require('./cssom/CSSStyleProperties.js'),
    // Depends on CSSRule
    CSSGroupingRule: require('./cssom/CSSGroupingRule.js'),
    CSSColorProfileRule: require('./cssom/CSSColorProfileRule.js'),
    CSSCounterStyleRule: require('./cssom/CSSCounterStyleRule.js'),
    CSSFontFaceRule: require('./cssom/CSSFontFaceRule.js'),
    CSSFontFeatureValuesRule: require('./cssom/CSSFontFeatureValuesRule.js'),
    CSSFontPaletteValuesRule: require('./cssom/CSSFontPaletteValuesRule.js'),
    CSSImportRule: require('./cssom/CSSImportRule.js'),
    CSSKeyframeRule: require('./cssom/CSSKeyframeRule.js'),
    CSSKeyframesRule: require('./cssom/CSSKeyframesRule.js'),
    CSSLayerStatementRule: require('./cssom/CSSLayerStatementRule.js'),
    CSSMarginRule: require('./cssom/CSSMarginRule.js'),
    CSSNamespaceRule: require('./cssom/CSSNamespaceRule.js'),
    CSSPageRule: require('./cssom/CSSPageRule.js'),
    CSSPositionTryRule: require('./cssom/CSSPositionTryRule.js'),
    CSSPropertyRule: require('./cssom/CSSPropertyRule.js'),
    CSSViewTransitionRule: require('./cssom/CSSViewTransitionRule.js'),
    // Depends on CSSGroupingRule
    CSSFunctionRule: require('./cssom/CSSFunctionRule.js'),
    CSSLayerBlockRule: require('./cssom/CSSLayerBlockRule.js'),
    CSSScopeRule: require('./cssom/CSSScopeRule.js'),
    CSSStartingStyleRule: require('./cssom/CSSStartingStyleRule.js'),
    CSSStyleRule: require('./cssom/CSSStyleRule.js'),
    // Depends on CSSStyleRule
    CSSConditionRule: require('./cssom/CSSConditionRule.js'),
    // Depends on CSSConditionRule
    CSSContainerRule: require('./cssom/CSSContainerRule.js'),
    CSSMediaRule: require('./cssom/CSSMediaRule.js'),
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
