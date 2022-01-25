
// https://drafts.csswg.org/css-animations-1/#csskeyframesrule
[Exposed=Window]
interface CSSKeyframesRule : CSSRule {
    attribute CSSOMString name;
    readonly attribute CSSRuleList cssRules;
    undefined appendRule(CSSOMString rule);
    undefined deleteRule(CSSOMString select);
    CSSKeyframeRule? findRule(CSSOMString select);
};
