
// https://drafts.csswg.org/cssom/#the-css.escape()-method
// `interface` replaces `namespace` which is not supported by `webidl2js` yet
[Exposed=Window]
interface CSS {
    CSSOMString escape(CSSOMString ident);
};

// https://drafts.csswg.org/css-conditional-3/#the-css-namespace
partial interface CSS {
    boolean supports(CSSOMString property, CSSOMString value);
    boolean supports(CSSOMString conditionText);
};
