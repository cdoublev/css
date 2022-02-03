
/**
 * @see {@link https://drafts.csswg.org/cssom/#cssrule}
 */
class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     *
     * `name` is only a public property of some `CSSRule` subclasses which will
     * otherwise only remain accessible from an instance of the implementation
     * classes, and is also used to validate inserting, replacing, or removing
     * rules.
     */
    constructor(globalObject, args, { name, parentRule = null, parentStyleSheet = null }) {
        this._globalObject = globalObject
        this.name = name
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
    }
}

module.exports = {
    implementation: CSSRuleImpl,
}
