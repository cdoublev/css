/* eslint-disable sort-keys */

module.exports = {
    // Dependency free
    CSS: require('./CSS.js'),
    CSSFontFeatureValuesMap: require('./CSSFontFeatureValuesMap.js'),
    CSSRule: require('./CSSRule.js'),
    CSSRuleList: require('./CSSRuleList.js'),
    CSSStyleDeclaration: require('./CSSStyleDeclaration.js'),
    MediaList: require('./MediaList.js'),
    StyleSheet: require('./StyleSheet.js'),
    StyleSheetList: require('./StyleSheetList.js'),
    // Depends on StyleSheet and CSSRuleList
    CSSStyleSheet: require('./CSSStyleSheet.js'),
    // Depends on CSSStyleDeclaration
    CSSFontFaceDescriptors: require('./CSSFontFaceDescriptors.js'),
    CSSKeyframeProperties: require('./CSSKeyframeProperties.js'),
    CSSMarginDescriptors: require('./CSSMarginDescriptors.js'),
    CSSPageDescriptors: require('./CSSPageDescriptors.js'),
    CSSPositionTryDescriptors: require('./CSSPositionTryDescriptors.js'),
    CSSStyleProperties: require('./CSSStyleProperties.js'),
    // Depends on CSSRule
    CSSColorProfileRule: require('./CSSColorProfileRule.js'),
    CSSCounterStyleRule: require('./CSSCounterStyleRule.js'),
    CSSFontFaceRule: require('./CSSFontFaceRule.js'),
    CSSFontFeatureValuesRule: require('./CSSFontFeatureValuesRule.js'),
    CSSFontPaletteValuesRule: require('./CSSFontPaletteValuesRule.js'),
    CSSGroupingRule: require('./CSSGroupingRule.js'),
    CSSImportRule: require('./CSSImportRule.js'),
    CSSKeyframeRule: require('./CSSKeyframeRule.js'),
    CSSKeyframesRule: require('./CSSKeyframesRule.js'),
    CSSLayerStatementRule: require('./CSSLayerStatementRule.js'),
    CSSMarginRule: require('./CSSMarginRule.js'),
    CSSNamespaceRule: require('./CSSNamespaceRule.js'),
    CSSPageRule: require('./CSSPageRule.js'),
    CSSPositionTryRule: require('./CSSPositionTryRule.js'),
    CSSPropertyRule: require('./CSSPropertyRule.js'),
    CSSViewTransitionRule: require('./CSSViewTransitionRule.js'),
    // Depends on CSSGroupingRule
    CSSFunctionRule: require('./CSSFunctionRule.js'),
    CSSLayerBlockRule: require('./CSSLayerBlockRule.js'),
    CSSStartingStyleRule: require('./CSSStartingStyleRule.js'),
    CSSStyleRule: require('./CSSStyleRule.js'),
    // Depends on CSSGroupingRule, CSSStyleRule
    CSSScopeRule: require('./CSSScopeRule.js'),
    // Depends on CSSStyleRule
    CSSConditionRule: require('./CSSConditionRule.js'),
    // Depends on CSSConditionRule
    CSSContainerRule: require('./CSSContainerRule.js'),
    CSSMediaRule: require('./CSSMediaRule.js'),
    CSSSupportsRule: require('./CSSSupportsRule.js'),
}
