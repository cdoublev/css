
// https://drafts.csswg.org/css-cascade-6/#cssscoperule
[Exposed=Window]
interface CSSScopeRule : CSSGroupingRule {
    readonly attribute CSSOMString start;
    readonly attribute CSSOMString end;
};
