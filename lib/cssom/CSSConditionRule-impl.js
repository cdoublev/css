
const { createCSSRule, createParser, parseCSSGrammar, getDeclarationsInSpecifiedOrder } = require('../parse/syntax.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { serializeCSSComponentValue } = require('../serialize.js')

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
        const { prelude, value: { declarations, rules } } = privateData
        this._declarations = getDeclarationsInSpecifiedOrder(declarations)
        this._rules = rules.map(rule => createCSSRule(rule, this))
        this._condition = prelude
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
        const styleProperties = {
            declarations: this._declarations,
            parentRule: this,
        }
        this.style = CSSStyleDeclaration.create(globalObject, undefined, styleProperties)
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
        condition = parseCSSGrammar(condition.trim(), definition, createParser(this))
        if (condition) {
            this._condition = condition
        }
    }
}

module.exports = {
    implementation: CSSConditionRuleImpl,
}
