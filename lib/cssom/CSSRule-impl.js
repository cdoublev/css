
const { serializeCSSRule } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssrule}
 */
class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     * @param {object} definition
     */
    constructor(globalObject, args, { parentRule, parentStyleSheet }, definition) {
        this._definition = definition
        this._globalObject = globalObject
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     */
    get cssText() {
        return serializeCSSRule(this)
    }
}

module.exports = {
    implementation: CSSRuleImpl,
}
