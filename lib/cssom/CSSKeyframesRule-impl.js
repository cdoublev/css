
const { createCSSRule, insertCSSRule, parseCSSGrammar, removeCSSRule } = require('../parse/parser.js')
const { serializeCSSComponentValueList, serializeCSSComponentValue } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const { createContext } = require('../utils/context.js')
const error = require('../error.js')
const idlUtils = require('./utils.js')

const SET_INVALID_NAME_ERROR = {
    message: "Cannot set 'name': invalid value",
    name: 'SyntaxError',
}

/**
 * @param {string} selector
 * @returns {number}
 */
function getLastMatchingRule(selector, rules) {
    let index = rules.length
    selector = parseCSSGrammar(selector, '<keyframe-selector>#', createContext(this))
    if (selector) {
        selector = serializeCSSComponentValueList(selector)
        while (index--) {
            if (rules[index].keyText === selector) {
                return index
            }
        }
    }
    return -1
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
        this._name = prelude
        this._rules = value.rules.map(rule => createCSSRule(rule, this))
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _rules, name } = this
        const rules = _rules.map(rule => rule.cssText).join(' ')
        if (rules) {
            return `@keyframes ${name} { ${rules} }`
        }
        return `@keyframes ${name} {}`
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-length}
     */
    get length() {
        return this._rules.length
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
        name = parseCSSGrammar(CSS.escape(name), '<keyframes-name>', createContext(this))
        if (name) {
            this._name = name
        } else {
            throw error(SET_INVALID_NAME_ERROR)
        }
    }

    /**
     * @param {number} index
     * @returns {CSSKeyframeRuleImpl}
     */
    [idlUtils.indexedGet](index) {
        return this._rules[index]
    }

    /**
     * @param {number} index
     * @returns {boolean}
     */
    [idlUtils.supportsPropertyIndex](index) {
        return 0 <= index && index < this._rules.length
    }

    /**
     * @returns {object}
     */
    [idlUtils.supportedPropertyIndices]() {
        return this._rules.keys()
    }

    /**
     * @param {string} rule
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-appendrule}
     */
    appendRule(rule) {
        insertCSSRule(this._rules, rule, this._rules.length, createContext(this))
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-deleterule}
     */
    deleteRule(selector) {
        const { _rules } = this
        const lastIndex = getLastMatchingRule(selector, _rules)
        if (-1 < lastIndex) {
            removeCSSRule(_rules, lastIndex)
        }
    }

    /**
     * @param {string} selector
     * @returns {CSSKeyframeRuleImpl|null}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-findrule}
     */
    findRule(selector) {
        const { _rules } = this
        return _rules[getLastMatchingRule(selector, _rules)] ?? null
    }
}

module.exports = {
    SET_INVALID_NAME_ERROR,
    implementation: CSSKeyframesRuleImpl,
}
