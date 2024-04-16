
// https://drafts.csswg.org/css-view-transitions-2/#cssviewtransitionrule
[Exposed=Window]
interface CSSViewTransitionRule : CSSRule {
    readonly attribute ViewTransitionNavigation navigation;
    [SameObject] readonly attribute FrozenArray<CSSOMString> types;
};

enum ViewTransitionNavigation { "auto", "none" };
