
// https://drafts.csswg.org/css-contain-3/#csscontainerrule
[Exposed=Window]
interface CSSContainerRule : CSSConditionRule {
    readonly attribute CSSOMString containerName;
    readonly attribute CSSOMString containerQuery;
};
