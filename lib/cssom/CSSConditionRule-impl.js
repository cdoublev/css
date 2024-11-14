
const { list, omitted } = require('../values/value.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSStyleRule = require('./CSSStyleRule.js')
const { serializeCSSComponentValue } = require('../serialize.js')

const nestingSelector = { types: ['<delimiter-token>'], value: '&' }
const compound = list([nestingSelector, list([], '')], '', ['<compound-selector>'])
const complexUnit = list([compound, list([], '')], '', ['<complex-selector-unit>'])
const complexSelector = list([complexUnit, list()], ' ', ['<complex-selector>'])
const relativeSelector = list([omitted, complexSelector], ' ', ['<relative-selector>'])
const relativeSelectorList = list([relativeSelector], ',', ['<relative-selector-list>'])

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssconditionrule}
 */
class CSSConditionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value: { declarations } } = privateData
        this._condition = prelude
        if (0 < declarations.length) {
            const privateData = {
                prelude: relativeSelectorList,
                value: { declarations, rules: [] },
            }
            this._rules.unshift(CSSStyleRule.createImpl(globalObject, undefined, privateData))
        }
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext}
     */
    get conditionText() {
        return serializeCSSComponentValue(this._condition)
    }
}

module.exports = {
    implementation: CSSConditionRuleImpl,
}
