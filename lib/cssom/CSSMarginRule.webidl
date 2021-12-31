
// https://drafts.csswg.org/cssom/#cssmarginrule
[Exposed=Window]
interface CSSMarginRule : CSSRule {
    readonly attribute CSSOMString name;
    [SameObject, PutForwards=cssText] readonly attribute CSSStyleDeclaration style;
};
