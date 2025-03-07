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
    // Depends on StyleSheet, CSSRuleList, MediaList
    CSSStyleSheet: require('./CSSStyleSheet.js'),
    // Depends on CSSStyleDeclaration
    CSSFontFaceDescriptors: require('./CSSFontFaceDescriptors.js'),
    CSSFunctionDescriptors: require('./CSSFunctionDescriptors.js'),
    CSSKeyframeProperties: require('./CSSKeyframeProperties.js'),
    CSSMarginDescriptors: require('./CSSMarginDescriptors.js'),
    CSSPageDescriptors: require('./CSSPageDescriptors.js'),
    CSSPositionTryDescriptors: require('./CSSPositionTryDescriptors.js'),
    CSSStyleProperties: require('./CSSStyleProperties.js'),
    // Depends on CSSRule and possibly CSSRuleList, CSS*Descriptors, CSS*Properties
    CSSColorProfileRule: require('./CSSColorProfileRule.js'),
    CSSCounterStyleRule: require('./CSSCounterStyleRule.js'),
    CSSFontFaceRule: require('./CSSFontFaceRule.js'),
    CSSFontPaletteValuesRule: require('./CSSFontPaletteValuesRule.js'),
    CSSFunctionDeclarations: require('./CSSFunctionDeclarations.js'),
    CSSGroupingRule: require('./CSSGroupingRule.js'),
    CSSImportRule: require('./CSSImportRule.js'),
    CSSKeyframeRule: require('./CSSKeyframeRule.js'),
    CSSKeyframesRule: require('./CSSKeyframesRule.js'),
    CSSLayerStatementRule: require('./CSSLayerStatementRule.js'),
    CSSMarginRule: require('./CSSMarginRule.js'),
    CSSNamespaceRule: require('./CSSNamespaceRule.js'),
    CSSNestedDeclarations: require('./CSSNestedDeclarations.js'),
    CSSPageDeclarations: require('./CSSPageDeclarations.js'),
    CSSPositionTryRule: require('./CSSPositionTryRule.js'),
    CSSPropertyRule: require('./CSSPropertyRule.js'),
    CSSViewTransitionRule: require('./CSSViewTransitionRule.js'),
    // Depends on CSSNestedDeclarations (non-exhaustive)
    CSSConditionRule: require('./CSSConditionRule.js'),
    CSSFontFeatureValuesRule: require('./CSSFontFeatureValuesRule.js'),
    CSSFunctionRule: require('./CSSFunctionRule.js'),
    CSSLayerBlockRule: require('./CSSLayerBlockRule.js'),
    CSSPageRule: require('./CSSPageRule.js'),
    CSSScopeRule: require('./CSSScopeRule.js'),
    CSSStartingStyleRule: require('./CSSStartingStyleRule.js'),
    // Depends on CSSConditionRule (non-exhaustive)
    CSSContainerRule: require('./CSSContainerRule.js'),
    CSSMediaRule: require('./CSSMediaRule.js'),
    CSSSupportsRule: require('./CSSSupportsRule.js'),
    // Depends on CSSScopeRule (non-exhaustive)
    CSSStyleRule: require('./CSSStyleRule.js'),
}
