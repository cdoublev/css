
import * as idlUtils from './utils.js'
import { SET_INVALID_KEYFRAMES_NAME_ERROR, create as error } from '../error.js'
import { insertRule, parseGrammar, removeRule } from '../parse/parser.js'
import { serializeComponentValue, serializeComponentValueList } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import CSSRuleList from './CSSRuleList.js'
import { isFailure } from '../utils/value.js'

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframesrule}
 */
export default class CSSKeyframesRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { node, prelude } = privateData
        const { definition, input } = node
        const rules = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy').value
        this._name = prelude
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, name } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        return rules
            ? `@keyframes ${name} { ${rules} }`
            : `@keyframes ${name} {}`
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-length}
     */
    get length() {
        return this.cssRules._rules.length
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-name}
     */
    get name() {
        return serializeComponentValue(this._name).trim()
    }

    /**
     * @param {string} name
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-name}
     */
    set name(name) {
        name = parseGrammar(CSS.escape(name), '<keyframes-name>', this)
        if (isFailure(name)) {
            throw error(SET_INVALID_KEYFRAMES_NAME_ERROR)
        }
        this._name = name
    }

    /**
     * @param {number} index
     * @returns {CSSKeyframeRuleImpl|undefined}
     */
    [idlUtils.indexedGet](index) {
        return this.cssRules._rules[index]
    }

    /**
     * @param {number} index
     * @returns {boolean}
     */
    [idlUtils.supportsPropertyIndex](index) {
        return 0 <= index && index < this.cssRules._rules.length
    }

    /**
     * @returns {object}
     */
    [idlUtils.supportedPropertyIndices]() {
        return this.cssRules._rules.keys()
    }

    /**
     * @param {string} rule
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-appendrule}
     */
    appendRule(rule) {
        const rules = this.cssRules._rules
        insertRule(rules, rule, rules.length, this)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-deleterule}
     */
    deleteRule(selector) {
        selector = parseGrammar(selector, '<keyframe-selector>#', this)
        if (!isFailure(selector)) {
            selector = serializeComponentValueList(selector)
            const rules = this.cssRules._rules
            const index = rules.findLastIndex(rule => rule.keyText === selector)
            if (-1 < index) {
                removeRule(rules, index)
            }
        }
    }

    /**
     * @param {string} selector
     * @returns {CSSKeyframeRuleImpl|null}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-findrule}
     */
    findRule(selector) {
        selector = parseGrammar(selector, '<keyframe-selector>#', this)
        if (!isFailure(selector)) {
            selector = serializeComponentValueList(selector)
            const rules = this.cssRules._rules
            const index = rules.findLastIndex(rule => rule.keyText === selector)
            if (-1 < index) {
                return rules[index]
            }
        }
        return null
    }
}
