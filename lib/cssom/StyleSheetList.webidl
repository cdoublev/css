
// https://drafts.csswg.org/cssom-1/#stylesheetlist
[Exposed=Window]
interface StyleSheetList {
    getter CSSStyleSheet? item(unsigned long index);
    readonly attribute unsigned long length;
};
