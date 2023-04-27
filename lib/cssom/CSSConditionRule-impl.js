
const { Parser, parseCSSGrammar, getDeclarationsInSpecifiedOrder } = require('../parse/syntax.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSStyleRule = require('./CSSStyleRule.js')
const { createList } = require('../values/value.js')
const createOmitted = require('../values/omitted.js')
const { serializeCSSComponentValue } = require('../serialize.js')

const nestingSelector = { type: new Set(['delimiter']), value: '&' }
const compound = createList([nestingSelector], '', ['compound-selector'])
const complexUnit = createList([compound, createList([], '')], '', ['complex-selector-unit'])
const complexSelector = createList([complexUnit, createList()], ' ', ['complex-selector'])
const relativeSelector = createList([createOmitted('<combinator>?'), complexSelector], ' ', ['relative-selector'])
const relativeSelectorList = createList([relativeSelector], ',', ['relative-selector-list'])

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
                value: {
                    declarations: getDeclarationsInSpecifiedOrder(declarations),
                    rules: [],
                },
            }
            this._rules.unshift(CSSStyleRule.create(globalObject, undefined, privateData))
        }
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext}
     */
    get conditionText() {
        return serializeCSSComponentValue(this._condition)
    }

    /**
     * @param {string} condition
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext}
     */
    set conditionText(condition) {
        const definition = this._name === 'media' ? '<media-query-list>' : '<supports-condition>'
        condition = parseCSSGrammar(condition.trim(), definition, new Parser(this))
        if (condition) {
            this._condition = condition
        }
    }
}

module.exports = {
    implementation: CSSConditionRuleImpl,
}
