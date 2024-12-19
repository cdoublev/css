
// https://drafts.csswg.org/css-nesting-1/#cssnesteddeclarations
[Exposed=Window]
interface CSSNestedDeclarations : CSSRule {
    // https://github.com/w3c/csswg-drafts/issues/11272
    //[SameObject, PutForwards=cssText] readonly attribute CSSStyleProperties style;
    [SameObject, PutForwards=cssText] readonly attribute CSSStyleDeclaration style;
};
