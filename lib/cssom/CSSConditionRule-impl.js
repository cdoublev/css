
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
        const { _declarations, _rules, parentStyleSheet } = this
        this._condition = privateData.prelude
        // Wrap declarations in nested style rule
        if (0 < _declarations.length) {
            const data = {
                parentRule: this,
                parentStyleSheet,
                prelude: relativeSelectorList,
            }
            const styleRule = CSSStyleRule.createImpl(globalObject, undefined, data)
            styleRule._declarations.push(..._declarations.splice(0))
            _rules.unshift(styleRule)
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
