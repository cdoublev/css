
const { parseBlockContents, parseCSSGrammar } = require('../parse/parser.js')
const CSSKeyframeProperties = require('./CSSKeyframeProperties.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl')
const error = require('../error.js')
const { isFailure } = require('../utils/value.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

const SET_INVALID_KEY_TEXT_ERROR = {
    message: "Cannot set 'keyText': invalid value",
    name: 'SyntaxError',
}

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframerule}
 */
class CSSKeyframeRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        const declarations = parseBlockContents(value, this)[0] ?? []
        this._keyText = prelude
        this.style = CSSKeyframeProperties.createImpl(globalObject, undefined, { declarations, parentRule: this })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { keyText, style: { cssText } } = this
        return cssText
            ? `${keyText} { ${cssText} }`
            : `${keyText} {}`
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
        selector = parseCSSGrammar(selector, '<keyframe-selector>#', this)
        if (isFailure(selector)) {
            throw error(SET_INVALID_KEY_TEXT_ERROR)
        }
        this._keyText = selector
    }
}

module.exports = {
    SET_INVALID_KEY_TEXT_ERROR,
    implementation: CSSKeyframeRuleImpl,
}
