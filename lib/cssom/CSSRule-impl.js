
const { parseBlockContents } = require('../parse/parser.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssrule}
 */
class CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { parentRule = null, parentStyleSheet = null, value }) {
        this._globalObject = globalObject
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
        if (value) {
            const { declarations, rules } = parseBlockContents(value, this)
            this._declarations = declarations
            this._rules = rules
        } else {
            this._declarations = []
            this._rules = []
        }
    }
}

module.exports = {
    implementation: CSSRuleImpl,
}
