
const {
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseCSSStyleBlock,
    parseSelectorGroup,
    removeCSSRule,
} = require('../parse/syntax.js')
const CSSRule = require('./CSSRule.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { serializeSelectorGroup } = require('../serialize.js')
const { definition: media } = require('./CSSMediaRule-impl.js')
const { definition: nest } = require('./CSSNestingRule-impl.js')
const { definition: supports } = require('./CSSSupportsRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rules}
 */
const definition = {
    prelude: '<selector-list>',
    value: {
        rules: {
            qualified: {
                prelude: "'&' <selector-list>",
                value: {
                    type: 'style-block',
                },
            },
            media,
            nest,
            supports,
        },
        type: 'style-block',
    },
}
// Allow multiple nesting levels with a circular reference
definition.value.rules.qualified.value.rules = nest.value.rules = definition.value.rules

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstylerule}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssom-style}
 */
class CSSStyleRuleImpl extends CSSRuleImpl {

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
        parseCSSStyleBlock(value, this).forEach(statement =>
            CSSRule.is(statement)
                ? this._rules.push(statement)
                : this._declarations.push(statement))
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    get selectorText() {
        return serializeSelectorGroup(this._selectors)
    }

    /**
     * @param {string} input
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    set selectorText(input) {
        const selectors = parseSelectorGroup(input)
        if (selectors) {
            this._selectors = selectors
        }
    }

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-style}
     */
    get style() {
        const properties = {
            declarations: getDeclarationsInSpecifiedOrder(this._declarations),
            parentRule: this,
        }
        return CSSStyleDeclaration.create(this._globalObject, [], properties)
    }

    /**
     * @param {CSSRule} rule
     * @param {number} index
     * @return {number}
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssstylerule-insertrule}
     */
    insertRule(rule, index) {
        return insertCSSRule(this._rules, rule, index, this)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssstylerule-deleterule}
     */
    deleteRule(index) {
        return removeCSSRule(this._rules, index)
    }
}

module.exports = {
    definition,
    implementation: CSSStyleRuleImpl,
}
