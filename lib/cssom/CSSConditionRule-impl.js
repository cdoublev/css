
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const { parseCSSGrammar } = require('../parse/engine.js')

/**
 * @param {object} condition
 * @returns {string}
 */
function serializeCondition(condition) {
    // TODO
}

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssconditionrule}
 */
class CSSConditionRuleImpl extends CSSGroupingRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { component: { prelude } } = privateData
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
    implementation: CSSConditionRuleImpl,
}
