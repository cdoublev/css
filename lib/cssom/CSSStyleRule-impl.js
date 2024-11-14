
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const { implementation: CSSScopeRuleImpl } = require('./CSSScopeRule-impl.js')
const CSSStyleProperties = require('./CSSStyleProperties.js')
const { createContext } = require('../utils/context.js')
const { parseCSSGrammar } = require('../parse/parser.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @param {CSSRuleImpl} [parentRule]
 * @returns {string}
 */
function getParentSelector(parentRule) {
    if (parentRule) {
        if (parentRule instanceof CSSStyleRuleImpl) {
            return '&'
        }
        if (parentRule instanceof CSSScopeRuleImpl) {
            return ''
        }
        return getParentSelector(parentRule.parentRule)
    }
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
        const { prelude, value } = privateData
        this._selectors = prelude
        this.style = CSSStyleProperties.createImpl(globalObject, undefined, {
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
        const rules = _rules.map(rule => rule.cssText).join(' ')
        if (cssText) {
            if (rules) {
                return `${selectorText} { ${cssText} ${rules} }`
            }
            return `${selectorText} { ${cssText} }`
        }
        if (rules) {
            return `${selectorText} { ${rules} }`
        }
        return `${selectorText} {}`
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylerule-selectortext}
     * @see {@link https://drafts.csswg.org/css-nesting-1/#cssom}
     */
    get selectorText() {
        const { _selectors, parentRule } = this
        const parentSelector = getParentSelector(parentRule)
        if (parentSelector) {
            return _selectors
                .map(selector => {
                    selector = serializeCSSComponentValueList(selector)
                    if (!selector.includes('&') && !selector.includes(':scope')) {
                        selector = `${parentSelector} ${selector}`
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
        selector = parseCSSGrammar(selector, definition, createContext(this))
        if (selector) {
            this._selectors = selector
        }
    }
}

module.exports = {
    implementation: CSSStyleRuleImpl,
}
