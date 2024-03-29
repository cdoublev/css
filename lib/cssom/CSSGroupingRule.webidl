
// https://drafts.csswg.org/cssom-1/#cssgroupingrule
[Exposed=Window]
interface CSSGroupingRule : CSSRule {
    [SameObject] readonly attribute CSSRuleList cssRules;
    unsigned long insertRule(CSSOMString rule, optional unsigned long index = 0);
    undefined deleteRule(unsigned long index);
};
