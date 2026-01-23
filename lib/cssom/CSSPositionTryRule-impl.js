
import CSSPositionTryDescriptors from './CSSPositionTryDescriptors.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-anchor-position-1/#csspositiontryrule}
 */
export default class CSSPositionTryRuleImpl extends CSSRuleImpl {

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
        this.name = serializeComponentValue(prelude)
        this.style = CSSPositionTryDescriptors.createImpl(globalObject, undefined, { declarations, parentRule: this })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { name, style: { cssText } } = this
        return cssText
            ? `@position-try ${name} { ${cssText} }`
            : `@position-try ${name} { }`
    }
}
