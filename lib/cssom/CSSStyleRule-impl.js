
const { list, omitted } = require('../values/value.js')
const { parseBlockContents, parseCSSGrammar } = require('../parse/parser.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSNestedDeclarations = require('./CSSNestedDeclarations.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSScopeRule = require('./CSSScopeRule.js')
const CSSStyleProperties = require('./CSSStyleProperties.js')
const CSSStyleRule = require('./CSSStyleRule.js')
const { isFailure } = require('../utils/value.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

const nestingSelector = { types: ['<delimiter-token>'], value: '&' }
const compound = list([nestingSelector, list([], '')], '', ['<compound-selector>'])
const complexUnit = list([compound, list([], '')], '', ['<complex-selector-unit>'])
const complexSelector = list([complexUnit, list()], ' ', ['<complex-selector>'])
const relativeSelector = list([omitted, complexSelector], ' ', ['<relative-selector>'])
const relativeSelectorList = list([relativeSelector], ',', ['<relative-selector-list>'])

/**
 * @param {CSSRuleImpl|null} parentRule
 * @returns {string}
 */
function isNestedStyleRule(parentRule) {
    return parentRule
        && !CSSScopeRule.isImpl(parentRule)
        && (CSSStyleRule.isImpl(parentRule) || isNestedStyleRule(parentRule.parentRule))
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssstylerule}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssom-style}
 */
class CSSStyleRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { prelude, value } = privateData
        const contents = parseBlockContents(value, this)
        const declarations = Array.isArray(contents[0]) ? contents.shift() : []
        const rules = contents.map(rule => {
            if (Array.isArray(rule)) {
                return CSSNestedDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._selectors = prelude ?? relativeSelectorList
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
        this.style = CSSStyleProperties.createImpl(globalObject, undefined, { declarations, parentRule: this })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, selectorText, style: { cssText } } = this
        let value = cssRules._rules.map(rule => rule.cssText)
        if (cssText) {
            value.unshift(cssText)
        }
        value = value.join(' ')
        return value
            ? `${selectorText} { ${value} }`
            : `${selectorText} {}`
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylerule-selectortext}
     * @see {@link https://drafts.csswg.org/css-nesting-1/#cssom}
     */
    get selectorText() {
        const { _selectors, parentRule } = this
        // Absolutize nested style rules
        if (isNestedStyleRule(parentRule)) {
            return _selectors
                .map(selector => {
                    selector = serializeCSSComponentValueList(selector)
                    if (!selector.includes('&')) {
                        selector = `& ${selector}`
                    }
                    return selector
                })
                .join(', ')
        }
        return serializeCSSComponentValueList(_selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylerule-selectortext}
     */
    set selectorText(selector) {
        const definition = this.parentRule ? '<relative-selector-list>' : '<selector-list>'
        selector = parseCSSGrammar(selector, definition, this)
        if (!isFailure(selector)) {
            this._selectors = selector
        }
    }
}

module.exports = {
    implementation: CSSStyleRuleImpl,
}
