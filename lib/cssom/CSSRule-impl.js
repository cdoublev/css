
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
}
