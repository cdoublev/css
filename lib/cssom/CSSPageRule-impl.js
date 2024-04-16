
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSPageDescriptors = require('./CSSPageDescriptors.js')
const { createContext } = require('../utils/context.js')
const { parseCSSGrammar } = require('../parse/parser.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

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
        const { prelude, value } = privateData
        this._selectors = prelude
        this.style = CSSPageDescriptors.createImpl(globalObject, undefined, {
            declarations: value.declarations,
            parentRule: this,
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _rules, selectorText, style: { cssText } } = this
        const value = [cssText, ..._rules.map(rule => rule.cssText)].join(' ')
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
        return serializeCSSComponentValueList(this._selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(selector) {
        selector = parseCSSGrammar(selector, '<page-selector-list>', createContext(this))
        if (selector) {
            this._selectors = selector
        }
    }
}

module.exports = {
    implementation: CSSPageRuleImpl,
}
