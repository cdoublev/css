
const { getDeclarationsInSpecifiedOrder, parseCSSDeclarationList } = require('../parse/syntax.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { parsePageSelectorsList } = require('../parse/syntax.js')
const { serializePageSelectorsList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#csspagerule}
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
        const { declarations, rules } = parseCSSDeclarationList(value, this)
        const styleProperties = {
            declarations: getDeclarationsInSpecifiedOrder(declarations),
            parentRule: this,
        }
        this._declarations = declarations
        this._rules = rules
        this._selectors = prelude
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules })
        this.style = CSSStyleDeclaration.create(this._globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-selectortext}
     */
    get selectorText() {
        return serializePageSelectorsList(this._selectors)
    }

    /**
     * @param {string} input
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(input) {
        const selectors = parsePageSelectorsList(input)
        if (selectors) {
            this._selectors = selectors
        }
    }
}

module.exports = {
    implementation: CSSPageRuleImpl,
}
