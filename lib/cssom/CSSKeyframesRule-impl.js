
const { createCSSRule, insertCSSRule, parseCSSGrammar, removeCSSRule } = require('../parse/syntax.js')
const { serializeCSSComponentValueList, serializeCSSComponentValue } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')

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
        const { prelude, value: { rules } } = privateData
        this._rules = rules.map(rule => createCSSRule(rule, this))
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
        this.name = serializeCSSComponentValue(prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
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
        insertCSSRule(this._rules, rule, this._rules.length, this)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-deleterule}
     */
    deleteRule(selector) {
        const lastIndex = this._getLastRuleIndexMatchingSelector(selector)
        if (-1 < lastIndex) {
            removeCSSRule(this._rules, lastIndex)
        }
    }

    /**
     * @param {string} selector
     * @returns {CSSKeyframeRule|null}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-findrule}
     */
    findRule(selector) {
        return this._rules[this._getLastRuleIndexMatchingSelector(selector)] ?? null
    }

    /**
     * @param {string} selector
     * @returns {number}
     */
    _getLastRuleIndexMatchingSelector(selector) {
        const { _rules: rules } = this
        const { length } = rules
        let index = length
        selector = parseCSSGrammar(selector, '<keyframe-selector>#')
        if (selector) {
            selector = serializeCSSComponentValueList(selector)
            while (index--) {
                const { keyText } = rules[index]
                if (keyText === selector) {
                    return index
                }
            }
        }
        return -1
    }
}

module.exports = {
    implementation: KeyframesImpl,
}
