
// https://drafts.csswg.org/cssom/#stylesheetlist
[Exposed=Window]
interface StyleSheetList {
    getter CSSStyleSheet? item(unsigned long index);
    readonly attribute unsigned long length;
};
