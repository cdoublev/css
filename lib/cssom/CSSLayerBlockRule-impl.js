
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSNestedDeclarations from './CSSNestedDeclarations.js'
import CSSRuleList from './CSSRuleList.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#csslayerblockrule}
 */
export default class CSSLayerBlockRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { node, prelude } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const rules = block.value.map(rule => {
            if (Array.isArray(rule)) {
                return CSSNestedDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this.name = serializeComponentValue(prelude)
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, name } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        let string = '@layer '
        if (name) {
            string += `${name} `
        }
        string += rules ? `{ ${rules} }` : '{}'
        return string
    }
}
