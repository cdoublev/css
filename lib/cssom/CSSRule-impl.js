
/**
 * @see {@link https://drafts.csswg.org/cssom/#cssrule}
 */
class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { parentRule = null, parentStyleSheet = null }) {
        this._globalObject = this._globalObject
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
    }
}

module.exports = {
    implementation: CSSRuleImpl,
}
