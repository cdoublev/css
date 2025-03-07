
// https://drafts.csswg.org/css-nesting-1/#cssnesteddeclarations
[Exposed=Window]
interface CSSNestedDeclarations : CSSRule {
    [SameObject, PutForwards=cssText] readonly attribute CSSStyleProperties style;
};
