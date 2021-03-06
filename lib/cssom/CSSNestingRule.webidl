
// https://drafts.csswg.org/css-nesting-1/#cssnestingrule
[Exposed=Window]
interface CSSNestingRule : CSSRule {
    attribute CSSOMString selectorText;
    [SameObject, PutForwards=cssText] readonly attribute CSSStyleDeclaration style;
    [SameObject] readonly attribute CSSRuleList cssRules;
    unsigned long insertRule(CSSOMString rule, optional unsigned long index = 0);
    undefined deleteRule(unsigned long index);
};
