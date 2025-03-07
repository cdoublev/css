
[Exposed=Window]
interface CSSPageDeclarations : CSSRule {
    [SameObject, PutForwards=cssText] readonly attribute CSSPageDescriptors style;
};
