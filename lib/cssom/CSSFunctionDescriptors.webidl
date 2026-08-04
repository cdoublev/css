
// https://drafts.csswg.org/css-mixins-1/#cssfunctiondescriptors
[Exposed=Window]
interface CSSFunctionDescriptors : CSSStyleDeclaration {
    [ReflectStyle="result"] attribute [LegacyNullToEmptyString] CSSOMString result;
};
