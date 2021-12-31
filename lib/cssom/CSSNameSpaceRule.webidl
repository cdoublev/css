
// https://drafts.csswg.org/cssom/#cssnamespacerule
[Exposed=Window]
interface CSSNamespaceRule : CSSRule {
    readonly attribute CSSOMString namespaceURI;
    readonly attribute CSSOMString prefix;
};
