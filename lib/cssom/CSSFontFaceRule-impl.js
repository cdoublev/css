
import CSSFontFaceDescriptors from './CSSFontFaceDescriptors.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { parseGrammar } from '../parse/parser.js'

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontfacerule}
 */
export default class CSSFontFaceRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { node } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const declarations = block.value[0] ?? []
        this.style = CSSFontFaceDescriptors.createImpl(globalObject, undefined, { declarations, parentRule: this })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { style: { cssText } } = this
        return cssText
            ? `@font-face { ${cssText} }`
            : '@font-face { }'
    }
}
