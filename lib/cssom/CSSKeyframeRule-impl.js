
const { getDeclarationsInSpecifiedOrder, parseCSSGrammar } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const createError = require('../error.js')
const { serializeComponentValues } = require('../serialize.js')

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
        const { prelude: keyText, value: { declarations } } = privateData
        this._declarations = getDeclarationsInSpecifiedOrder(declarations)
        this._keyText = serializeComponentValues(keyText)
        const styleProperties = {
            declarations: this._declarations,
            parentRule: this,
        }
        this.style = CSSStyleDeclaration.create(this._globalObject, undefined, styleProperties)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { _keyText, style: { cssText } } = this
        if (cssText) {
            return `${_keyText} {\n  ${cssText}\n}`
        }
        return `${_keyText} {}`
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    get keyText() {
        return this._keyText
    }

    /**
     * @param {string} select
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    set keyText(select) {
        const parsed = parseCSSGrammar(select, '<keyframe-selector>#')
        if (parsed) {
            this._keyText = serializeComponentValues(parsed)
        } else {
            throw createError(SET_INVALID_KEY_TEXT_ERROR)
        }
    }
}

module.exports = {
    SET_INVALID_KEY_TEXT_ERROR,
    implementation: CSSKeyframeImpl,
}
