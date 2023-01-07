
// https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesrule
[Exposed=Window]
interface CSSFontFeatureValuesRule : CSSRule {
    attribute CSSOMString fontFamily;
    readonly attribute CSSFontFeatureValuesMap annotation;
    readonly attribute CSSFontFeatureValuesMap ornaments;
    readonly attribute CSSFontFeatureValuesMap stylistic;
    readonly attribute CSSFontFeatureValuesMap swash;
    readonly attribute CSSFontFeatureValuesMap characterVariant;
    readonly attribute CSSFontFeatureValuesMap styleset;
};

// https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesmap
// It should be a `maplike <CSSOMString, sequence<unsigned long>>` but `maplike`
// is not supported by webidl2js
[Exposed=Window]
interface CSSFontFeatureValuesMap {
    undefined set(CSSOMString featureValueName, (unsigned long or sequence<unsigned long>) values);
};
