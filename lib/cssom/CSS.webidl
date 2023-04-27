
// https://drafts.csswg.org/cssom-1/#namespacedef-css
// https://drafts.csswg.org/css-conditional-3/#the-css-namespace
// `namespace` is not supported by `webidl2js`
[Exposed=Window]
// namespace CSS {
interface CSS {
    CSSOMString escape(CSSOMString ident);
    boolean supports(CSSOMString property, CSSOMString value);
    boolean supports(CSSOMString conditionText);
};
