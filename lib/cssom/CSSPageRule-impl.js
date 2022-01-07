
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { getDeclarationsInSpecifiedOrder } = require('./CSSStyleRule-impl.js')
const { parseCSSGrammar } = require('../parse/engine.js')

/**
 * @param {string} input
 * @returns {object[]|null}
 */
function parseCSSPageSelectorsList(input) {
    return parseCSSGrammar(input, '<page-selector-list>')
}

/**
 * @param {object[]} list
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-list-of-css-page-selectors}
 */
function serializeCSSPageSelectorsList(list) {
    // TODO
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#csspagerule}
 */
class CSSPageRuleImpl extends CSSGroupingRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { component: { prelude } } = privateData
        this._selectors = prelude
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-selectortext}
     */
    get selectorText() {
        return serializeCSSPageSelectorsList(this._selectors)
    }

    /**
     * @param {string} input
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(input) {
        const selectors = parseCSSPageSelectorsList(input)
        if (selectors) {
            this._selectors = selectors
        }
    }

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-style}
     */
    get style() {
        const properties = {
            declarations: getDeclarationsInSpecifiedOrder(this._childCSSRules),
            parentRule: this,
        }
        return CSSStyleDeclaration.create(this._globalObject, undefined, properties)
    }
}

module.exports = {
    implementation: CSSPageRuleImpl,
}
