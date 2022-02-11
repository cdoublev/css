
/**
 * @see {@link https://drafts.csswg.org/cssom/#cssrule}
 */
class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     *
     * `name` is not a public property of all `CSSRule` subclasses, but it will
     * only remain accessible from an instance of an implementation class. It is
     * used internally to validate inserting, replacing, or removing rules.
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
