
// https://drafts.csswg.org/cssom-1/#stylesheetlist
[Exposed=Window]
interface StyleSheetList {
    readonly attribute unsigned long length;
    getter CSSStyleSheet? item(unsigned long index);
};
