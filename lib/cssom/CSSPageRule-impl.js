
const { getDeclarationsInSpecifiedOrder, parseCSSDeclarationList } = require('../parse/syntax.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const CSSRule = require('./CSSRule.js')
const { definition: margin } = require('./CSSMarginRule-impl.js')
const pageProperties = require('../properties/page-margin.js')
const { parsePageSelectorsList } = require('../parse/syntax.js')
const { serializePageSelectorsList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 */
const definition = {
    prelude: '<page-selector-list>? { <declaration-list> }',
    value: {
        properties: pageProperties,
        rules: margin,
        type: 'declaration-list',
    },
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#csspagerule}
 */
class CSSPageRuleImpl extends CSSGroupingRuleImpl {

    _declarations = []
    _rules = []

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData, definition)
        const { prelude, value } = privateData
        this._selectors = prelude
        parseCSSDeclarationList(value, this).forEach(statement =>
            CSSRule.is(statement)
                ? this._rules.push(statement)
                : this._declarations.push(statement))
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

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-style}
     */
    get style() {
        const properties = {
            declarations: getDeclarationsInSpecifiedOrder(this._declarations),
            parentRule: this,
        }
        return CSSStyleDeclaration.create(this._globalObject, undefined, properties)
    }
}

module.exports = {
    definition,
    implementation: CSSPageRuleImpl,
}
