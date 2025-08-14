
import { SET_INVALID_KEY_TEXT_ERROR, create as error } from '../error.js'
import CSSKeyframeProperties from './CSSKeyframeProperties.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { isFailure } from '../utils/value.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeCSSComponentValueList } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframerule}
 */
export default class CSSKeyframeRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { node, prelude, value } = privateData
        const declarations = parseGrammar(value, { associatedToken: '{', type: 'block', value: node.definition.value }, { ...node, value: this }, 'lazy').value[0] ?? []
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
        selector = parseGrammar(selector, '<keyframe-selector>#', this)
        if (isFailure(selector)) {
            throw error(SET_INVALID_KEY_TEXT_ERROR)
        }
        this._keyText = selector
    }
}
