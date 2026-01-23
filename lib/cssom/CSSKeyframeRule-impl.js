
import { SET_INVALID_KEYFRAME_SELECTOR_ERROR, create as error } from '../error.js'
import CSSKeyframeProperties from './CSSKeyframeProperties.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { isFailure } from '../utils/value.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValueList } from '../serialize.js'

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
        const { node, prelude } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const declarations = block.value[0] ?? []
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
            : `${keyText} { }`
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    get keyText() {
        return serializeComponentValueList(this._keyText)
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    set keyText(selector) {
        selector = parseGrammar(selector, '<keyframe-selector>#', this)
        if (isFailure(selector)) {
            throw error(SET_INVALID_KEYFRAME_SELECTOR_ERROR, this._globalObject)
        }
        this._keyText = selector
    }
}
