
// https://drafts.csswg.org/cssom/#csspagerule
[Exposed=Window]
interface CSSPageRule : CSSGroupingRule {
    attribute CSSOMString selectorText;
    [SameObject, PutForwards=cssText] readonly attribute CSSStyleDeclaration style;
};
