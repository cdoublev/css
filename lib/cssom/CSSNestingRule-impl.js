
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

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#at-nest}
 */
const definition = {
    prelude: '<selector-list> { <style-block> }',
    value: {
        type: '@nest <selector-list> { <style-block> }',
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssnestingrule}
 */
class CSSNestingRule extends CSSRuleImpl {

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
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-selectortext}
     */
    get selectorText() {
        return serializeSelectorGroup(this._selectors)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-selectortext}
     */
    set selectorText(value) {
        const parsed = parseSelectorGroup(value)
        if (parsed) {
            this._selectors = value
        }
    }

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-style}
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
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-insertrule}
     */
    insertRule(rule, index) {
        return insertCSSRule(this._rules, rule, index, this)
    }

    /**
     * @param {number} index
     * @see {@link https://drafts.csswg.org/css-nesting-1/#dom-cssnestingrule-deleterule}
     */
    deleteRule(index) {
        return removeCSSRule(this._rules, index)
    }
}

module.exports = {
    definition,
    implementation: CSSNestingRule,
}
