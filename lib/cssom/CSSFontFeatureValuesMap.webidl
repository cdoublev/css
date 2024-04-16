
// https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesmap
[Exposed=Window]
interface CSSFontFeatureValuesMap {

    // `maplike` is not supported by webidl2js
    //maplike<CSSOMString, sequence<unsigned long>>;
    iterable<CSSOMString, sequence<unsigned long>>;
    readonly attribute unsigned long size;
    undefined clear();
    boolean delete(CSSOMString key);
    sequence<unsigned long> get(CSSOMString key);
    boolean has(CSSOMString key);

    undefined set(CSSOMString key, (unsigned long or sequence<unsigned long>) values);
};
