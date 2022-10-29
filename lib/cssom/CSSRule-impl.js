
/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssrule}
 */
class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     *
     * `type` is not part of the `CSSRule` interface but it is used to identify
     * the rule when determining the parsing context, and is not readable from
     * the wrapper class.
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
