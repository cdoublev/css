
// https://drafts.csswg.org/cssom-1/#medialist
// https://github.com/jsdom/webidl2js/issues/254
[Exposed=Window]
interface MediaList {
    stringifier attribute [LegacyNullToEmptyString] DOMString mediaText;
    readonly attribute unsigned long length;
    getter CSSOMString? item(unsigned long index);
    undefined appendMedium(CSSOMString medium);
    undefined deleteMedium(CSSOMString medium);
};
