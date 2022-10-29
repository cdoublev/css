
// https://drafts.csswg.org/cssom-1/#cssstylesheet
[Exposed=Window]
interface CSSStyleSheet : StyleSheet {
    constructor(optional CSSStyleSheetInit options = {});

    readonly attribute CSSRule? ownerRule;
    [SameObject] readonly attribute CSSRuleList cssRules;
    unsigned long insertRule(CSSOMString rule, optional unsigned long index = 0);
    undefined deleteRule(unsigned long index);

    Promise<CSSStyleSheet> replace(USVString text);
    undefined replaceSync(USVString text);
};

// https://drafts.csswg.org/cssom-1/#dictdef-cssstylesheetinit
dictionary CSSStyleSheetInit {
    DOMString baseURL = null;
    (MediaList or DOMString) media = "";
    boolean disabled = false;
};
