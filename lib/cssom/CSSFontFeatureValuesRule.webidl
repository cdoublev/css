
// https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesrule
// https://github.com/w3c/csswg-drafts/issues/9412
[Exposed=Window]
interface CSSFontFeatureValuesRule : CSSRule {
    readonly attribute CSSFontFeatureValuesMap annotation;
    readonly attribute CSSFontFeatureValuesMap characterVariant;
    readonly attribute CSSOMString fontFamily;
    readonly attribute CSSFontFeatureValuesMap ornaments;
    readonly attribute CSSFontFeatureValuesMap styleset;
    readonly attribute CSSFontFeatureValuesMap stylistic;
    readonly attribute CSSFontFeatureValuesMap swash;
};
