
const { parseBlockContents, parseCSSGrammar } = require('../parse/parser.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const { implementation: CSSScopeRuleImpl } = require('./CSSScopeRule-impl.js')
const CSSStyleProperties = require('./CSSStyleProperties.js')
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
        this._selectors = privateData.prelude
        this.style = CSSStyleProperties.createImpl(globalObject, undefined, {
            declarations: this._declarations,
            parentRule: this,
        })
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
        selector = parseCSSGrammar(selector, definition, this)
        if (selector) {
            this._selectors = selector
        }
    }
}

module.exports = {
    implementation: CSSStyleRuleImpl,
}
