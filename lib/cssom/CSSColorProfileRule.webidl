
// https://drafts.csswg.org/css-color-5/#csscolorprofilerule
[Exposed=Window]
interface CSSColorProfileRule : CSSRule {
    readonly attribute CSSOMString components;
    readonly attribute CSSOMString name;
    readonly attribute CSSOMString renderingIntent;
    readonly attribute CSSOMString src;
};
