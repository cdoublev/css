
// https://drafts.csswg.org/cssom-1/#cssrulelist
[Exposed=Window]
interface CSSRuleList {
    getter CSSRule? item(unsigned long index);
    readonly attribute unsigned long length;
};
