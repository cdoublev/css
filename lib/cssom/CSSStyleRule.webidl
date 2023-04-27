
// https://drafts.csswg.org/cssom-1/#cssstylerule
// https://drafts.csswg.org/css-nesting-1/#ref-for-cssstylerule%E2%91%A0
[Exposed=Window]
interface CSSStyleRule : CSSRule {
    [SameObject] readonly attribute CSSRuleList cssRules;
    attribute CSSOMString selectorText;
    [SameObject, PutForwards=cssText] readonly attribute CSSStyleDeclaration style;
    unsigned long insertRule(CSSOMString rule, optional unsigned long index = 0);
    undefined deleteRule(unsigned long index);
};
