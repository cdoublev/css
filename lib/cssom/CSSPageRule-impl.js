
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSPageDeclarations from './CSSPageDeclarations.js'
import CSSPageDescriptors from './CSSPageDescriptors.js'
import CSSRuleList from './CSSRuleList.js'
import { isFailure } from '../utils/value.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#csspagerule}
 */
export default class CSSPageRuleImpl extends CSSGroupingRuleImpl {

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
                return CSSPageDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._selectors = prelude
        this.style = CSSPageDescriptors.createImpl(globalObject, undefined, { declarations, parentRule: this })
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
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
        if (selectorText) {
            if (value) {
                return `@page ${selectorText} { ${value} }`
            }
            return `@page ${selectorText} { }`
        }
        if (value) {
            return `@page { ${value} }`
        }
        return '@page { }'
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    get selectorText() {
        return serializeComponentValue(this._selectors)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-selectortext}
     */
    set selectorText(selector) {
        selector = parseGrammar(selector, '<page-selector-list>?', this)
        if (!isFailure(selector)) {
            this._selectors = selector
        }
    }
}
