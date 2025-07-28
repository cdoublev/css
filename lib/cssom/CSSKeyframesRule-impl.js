
const { insertCSSRule, parseBlockContents, parseCSSGrammar, removeCSSRule } = require('../parse/parser.js')
const { serializeCSSComponentValueList, serializeCSSComponentValue } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const error = require('../error.js')
const idlUtils = require('./utils.js')
const { isFailure } = require('../utils/value.js')

const SET_INVALID_NAME_ERROR = {
    message: "Cannot set 'name': invalid value",
}

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframesrule}
 */
class CSSKeyframesRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        const rules = parseBlockContents(value, this)
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
        return serializeCSSComponentValue(this._name).trim()
    }

    /**
     * @param {string} name
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-name}
     */
    set name(name) {
        name = parseCSSGrammar(CSS.escape(name), '<keyframes-name>', this)
        if (isFailure(name)) {
            throw error(SET_INVALID_NAME_ERROR)
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
        insertCSSRule(rules, rule, rules.length, this)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-deleterule}
     */
    deleteRule(selector) {
        selector = parseCSSGrammar(selector, '<keyframe-selector>#', this)
        if (!isFailure(selector)) {
            selector = serializeCSSComponentValueList(selector)
            const rules = this.cssRules._rules
            const index = rules.findLastIndex(rule => rule.keyText === selector)
            if (-1 < index) {
                removeCSSRule(rules, index)
            }
        }
    }

    /**
     * @param {string} selector
     * @returns {CSSKeyframeRuleImpl|null}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-findrule}
     */
    findRule(selector) {
        selector = parseCSSGrammar(selector, '<keyframe-selector>#', this)
        if (!isFailure(selector)) {
            selector = serializeCSSComponentValueList(selector)
            const rules = this.cssRules._rules
            const index = rules.findLastIndex(rule => rule.keyText === selector)
            if (-1 < index) {
                return rules[index]
            }
        }
        return null
    }
}

module.exports = {
    SET_INVALID_NAME_ERROR,
    implementation: CSSKeyframesRuleImpl,
}
