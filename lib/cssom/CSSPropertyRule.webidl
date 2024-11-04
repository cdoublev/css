
// https://drafts.css-houdini.org/css-properties-values-api-1/#csspropertyrule
// https://github.com/w3c/css-houdini-drafts/issues/1115
[Exposed=Window]
interface CSSPropertyRule : CSSRule {
    readonly attribute boolean inherits;
    readonly attribute CSSOMString initialValue;
    readonly attribute CSSOMString name;
    readonly attribute CSSOMString syntax;
};
