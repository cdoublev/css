
// https://drafts.css-houdini.org/css-properties-values-api/#csspropertyrule
[Exposed=Window]
interface CSSPropertyRule : CSSRule {
    readonly attribute CSSOMString name;
    readonly attribute CSSOMString syntax;
    readonly attribute boolean inherits;
    readonly attribute CSSOMString? initialValue;
};
