
// https://drafts.csswg.org/css-conditional-5/#csscontainerrule
[Exposed=Window]
interface CSSContainerRule : CSSConditionRule {
    readonly attribute CSSOMString containerName;
    readonly attribute CSSOMString containerQuery;
};
