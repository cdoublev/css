
/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssrule}
 */
class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { parentRule = null, parentStyleSheet = null, type }) {
        this._globalObject = globalObject
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
        this.type = type
    }
}

module.exports = {
    implementation: CSSRuleImpl,
}
