
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSPageDescriptors = require('./CSSPageDescriptors.js')
const { parseCSSGrammar } = require('../parse/parser.js')
const { serializeCSSComponentValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#csspagerule}
 */
class CSSPageRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this._selectors = privateData.prelude
        this.style = CSSPageDescriptors.createImpl(globalObject, undefined, {
            declarations: this._declarations,
            parentRule: this,
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _rules, selectorText, style: { cssText } } = this
        let value = _rules.map(rule => rule.cssText)
        if (cssText) {
            value.unshift(cssText)
        }
        value = value.join(' ')
        if (selectorText) {
            if (value) {
                return `@page ${selectorText} { ${value} }`
            }
            return `@page ${selectorText} {}`
        }
        if (value) {
            return `@page { ${value} }`
        }
        return '@page {}'
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    get selectorText() {
        return serializeCSSComponentValue(this._selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(selector) {
        selector = parseCSSGrammar(selector, '<page-selector-list>', this)
        if (selector) {
            this._selectors = selector
        }
    }
}

module.exports = {
    implementation: CSSPageRuleImpl,
}
