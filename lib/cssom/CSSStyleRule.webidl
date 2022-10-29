
// https://drafts.csswg.org/cssom-1/#cssstylerule
[Exposed=Window]
interface CSSStyleRule : CSSRule {
    attribute CSSOMString selectorText;
    [SameObject, PutForwards=cssText] readonly attribute CSSStyleDeclaration style;
};

// https://drafts.csswg.org/css-nesting-1/#ref-for-cssstylerule%E2%91%A0
partial interface CSSStyleRule {
    [SameObject] readonly attribute CSSRuleList cssRules;
    unsigned long insertRule(CSSOMString rule, optional unsigned long index = 0);
    undefined deleteRule(unsigned long index);
};
