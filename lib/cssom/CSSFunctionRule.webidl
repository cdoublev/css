
// https://drafts.csswg.org/css-mixins-1/#cssfunctionrule
[Exposed=Window]
interface CSSFunctionRule : CSSGroupingRule {
    readonly attribute CSSOMString name;
    sequence<FunctionParameter> getParameters();
    readonly attribute CSSOMString returnType;
};

// https://drafts.csswg.org/css-mixins-1/#dictdef-functionparameter
dictionary FunctionParameter {
    required CSSOMString name;
    required CSSOMString type;
    CSSOMString? defaultValue;
};
