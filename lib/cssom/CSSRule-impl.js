
import {
    CSSCounterStyleRule,
    CSSFontFaceRule,
    CSSFontFeatureValuesRule,
    CSSImportRule,
    CSSKeyframeRule,
    CSSKeyframesRule,
    CSSMarginRule,
    CSSMediaRule,
    CSSNamespaceRule,
    CSSPageRule,
    CSSStyleRule,
    CSSSupportsRule,
}
from '../cssom/index.js'

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssrule}
 */
export default class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { parentRule = null, parentStyleSheet = null }) {
        this._globalObject = globalObject
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
    }

    /**
     * @return {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-type}
     */
    get type() {
        if (CSSStyleRule.isImpl(this)) {
            return 1
        }
        if (CSSImportRule.isImpl(this)) {
            return 3
        }
        if (CSSMediaRule.isImpl(this)) {
            return 4
        }
        if (CSSFontFaceRule.isImpl(this)) {
            return 5
        }
        if (CSSPageRule.isImpl(this)) {
            return 6
        }
        if (CSSKeyframesRule.isImpl(this)) {
            return 7
        }
        if (CSSKeyframeRule.isImpl(this)) {
            return 8
        }
        if (CSSMarginRule.isImpl(this)) {
            return 9
        }
        if (CSSNamespaceRule.isImpl(this)) {
            return 10
        }
        if (CSSCounterStyleRule.isImpl(this)) {
            return 11
        }
        if (CSSSupportsRule.isImpl(this)) {
            return 12
        }
        if (CSSFontFeatureValuesRule.isImpl(this)) {
            return 14
        }
        return 0
    }
}
