
const { Parser, getDeclarationsInSpecifiedOrder, parseCSSGrammar } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const createError = require('../error.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

const SET_INVALID_KEY_TEXT_ERROR = {
    message: 'Failed to parse the value for keyText',
    name: 'SyntaxError',
    type: 'DOMException',
}

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframerule}
 */
class CSSKeyframeImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value: { declarations } } = privateData
        this._declarations = getDeclarationsInSpecifiedOrder(declarations)
        this._keyText = prelude
        const styleProperties = {
            declarations: this._declarations,
            parentRule: this,
        }
        this.style = CSSStyleDeclaration.create(globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
     */
    get cssText() {
        const { keyText, style: { cssText } } = this
        if (cssText) {
            return `${keyText} {\n  ${cssText}\n}`
        }
        return `${keyText} {}`
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    get keyText() {
        return serializeCSSComponentValueList(this._keyText)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    set keyText(selector) {
        selector = parseCSSGrammar(selector, '<keyframe-selector>#', new Parser(this))
        if (selector) {
            this._keyText = selector
        } else {
            throw createError(SET_INVALID_KEY_TEXT_ERROR)
        }
    }
}

module.exports = {
    SET_INVALID_KEY_TEXT_ERROR,
    implementation: CSSKeyframeImpl,
}
