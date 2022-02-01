
const { getDeclarationsInSpecifiedOrder, parseCSSGrammar } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const createError = require('../error.js')
const { serializeValue } = require('../serialize.js')

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
        const styleProperties = {
            declarations: getDeclarationsInSpecifiedOrder(declarations),
            parentRule: this,
        }
        this._declarations = declarations
        this._keyText = serializeValue(prelude)
        this.style = CSSStyleDeclaration.create(this._globalObject, undefined, styleProperties)
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
            this._keyText = serializeValue(parsed)
        } else {
            throw createError(SET_INVALID_KEY_TEXT_ERROR)
        }
    }
}

module.exports = {
    SET_INVALID_KEY_TEXT_ERROR,
    implementation: CSSKeyframeImpl,
}
