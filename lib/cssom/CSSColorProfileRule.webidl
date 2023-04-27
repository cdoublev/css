
// https://drafts.csswg.org/css-color-5/#csscolorprofilerule
[Exposed=Window]
interface CSSColorProfileRule : CSSRule {
    readonly attribute CSSOMString name;
    readonly attribute CSSOMString src;
    readonly attribute CSSOMString renderingIntent;
    readonly attribute CSSOMString components;
};
