
// Inheritance order must be taken into account
const interfaces = [
    require('./lib/cssom/CSS.js'),
    require('./lib/cssom/CSSRule.js'),
    require('./lib/cssom/CSSGroupingRule.js'),
    require('./lib/cssom/CSSConditionRule.js'),
    require('./lib/cssom/CSSImportRule.js'),
    require('./lib/cssom/CSSMarginRule.js'),
    require('./lib/cssom/CSSMediaRule.js'),
    require('./lib/cssom/CSSNamespaceRule.js'),
    require('./lib/cssom/CSSPageRule.js'),
    require('./lib/cssom/CSSRuleList.js'),
    require('./lib/cssom/CSSStyleDeclaration.js'),
    require('./lib/cssom/CSSStyleRule.js'),
    require('./lib/cssom/CSSSupportsRule.js'),
    require('./lib/cssom/MediaList.js'),
    require('./lib/cssom/StyleSheet.js'),
    require('./lib/cssom/StyleSheetList.js'),
    require('./lib/cssom/CSSStyleSheet.js'),
]

function install(globalObject) {
    interfaces.forEach(wrapper => wrapper.install(globalObject, ['Window']))
}

module.exports = install
