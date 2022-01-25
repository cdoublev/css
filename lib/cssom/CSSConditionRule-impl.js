
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const { parseCSSGrammar } = require('../parse/syntax.js')

/**
 * @param {object} condition
 * @returns {string}
 */
function serializeCondition(condition) {
    // TODO
}

/**
 * @param {object} condition
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#typedef-supports-condition}
 */
function evalCondition(condition) {
    // TODO
    return true
}

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssconditionrule}
 */
class CSSConditionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     * @param {object} definition
     */
    constructor(globalObject, args, privateData, definition) {
        super(globalObject, args, privateData, definition)
        const { prelude } = privateData
        this._condition = prelude
    }

    /**
     * @returns {string}
     */
    get conditionText() {
        return serializeCondition(this._condition)
    }

    /**
     * @param {string} text
     */
    set conditionText(text) {
        const definition = this._name === 'media' ? '<media-query-list>' : '<supports-condition>'
        const condition = parseCSSGrammar(text.trim(), definition)
        if (condition) {
            this._condition = condition
        }
    }
}

module.exports = {
    evalCondition,
    implementation: CSSConditionRuleImpl,
}
