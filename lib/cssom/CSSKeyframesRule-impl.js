
const { createCSSRule, insertCSSRule, removeCSSRule } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const { serializeCSSComponentValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframesrule}
 */
class KeyframesImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        this._rules = value.map(rule => createCSSRule(rule, this))
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
        this.name = serializeCSSComponentValue(prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { _rules, name } = this
        const rules = _rules.map(({ cssText }) => cssText).join('\n  ')
        if (rules) {
            return `@keyframes ${name} {\n  ${rules}\n}`
        }
        return `@keyframes ${name} {}`
    }

    /**
     * @param {string} rule
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-appendrule}
     */
    appendRule(rule) {
        // TODO: fix https://github.com/w3c/csswg-drafts/issues/6972
        insertCSSRule(this._rules, rule, this._rules.length, this, 'keyframes')
    }

    /**
     * @param {string} select
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-deleterule}
     */
    deleteRule(select) {
        const lastIndex = this._lastRuleIndexWithSelector(select)
        if (-1 < lastIndex) {
            removeCSSRule(this._rules, lastIndex)
        }
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-findrule}
     */
    findRule(select) {
        return this._rules[this._lastRuleIndexWithSelector(select)]
    }

    /**
     * @param {string} select
     * @returns {number}
     */
    _lastRuleIndexWithSelector(select) {
        const { _rules: rules } = this
        const { length } = rules
        let index = length
        select = select.split(/\s*,\s*/).join(', ')
        while (index--) {
            const { keyText } = rules[index]
            if (keyText === select) {
                return index
            }
        }
        return -1
    }
}

module.exports = {
    implementation: KeyframesImpl,
}
