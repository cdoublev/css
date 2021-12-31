
// https://www.w3.org/TR/css-conditional-3/#cssmediarule
[Exposed=Window]
interface CSSMediaRule : CSSConditionRule {
    [SameObject, PutForwards=mediaText] readonly attribute MediaList media;
};
