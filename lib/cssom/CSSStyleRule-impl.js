
import { isFailure, isOmitted } from '../utils/value.js'
import { list, omitted } from '../values/value.js'
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSNestedDeclarations from './CSSNestedDeclarations.js'
import CSSRuleList from './CSSRuleList.js'
import CSSScopeRule from './CSSScopeRule.js'
import CSSStyleProperties from './CSSStyleProperties.js'
import CSSStyleRule from './CSSStyleRule.js'
import { ampersand } from '../values/defaults.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValues } from '../serialize.js'

const compound = list([ampersand, list([], '')], '', ['<compound-selector>'])
const complexUnit = list([compound, list([], '')], '', ['<complex-selector-unit>'])
const complexSelector = list([complexUnit, list()], ' ', ['<complex-selector>'])
const relativeSelector = list([omitted, complexSelector], ' ', ['<relative-selector>'])
const relativeSelectorList = list([relativeSelector], ',', ['<relative-selector-list>'])

/**
 * @param {CSSRuleImpl} rule
 * @returns {boolean}
 */
function isNestedInStyleRule({ parentRule }) {
    return parentRule
        && !CSSScopeRule.isImpl(parentRule)
        && (CSSStyleRule.isImpl(parentRule) || isNestedInStyleRule(parentRule))
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssstylerule}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssom-style}
 */
export default class CSSStyleRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { node, prelude } = privateData
        const { definition, input } = node
        const contents = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy').value
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
            : `${selectorText} { }`
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylerule-selectortext}
     * @see {@link https://drafts.csswg.org/css-nesting-1/#cssom}
     */
    get selectorText() {
        const { _selectors } = this
        // Absolutize the selector of a nested style rule
        if (isNestedInStyleRule(this)) {
            return _selectors
                .map(selector => {
                    const string = serializeComponentValues(selector)
                    if (!isOmitted(selector[0]) || !string.includes('&')) {
                        return `& ${string}`
                    }
                    return string
                })
                .join(', ')
        }
        return serializeComponentValues(_selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylerule-selectortext}
     */
    set selectorText(selector) {
        const definition = this.parentRule ? '<relative-selector-list>' : '<selector-list>'
        selector = parseGrammar(selector, definition, this)
        if (!isFailure(selector)) {
            this._selectors = selector
        }
    }
}
