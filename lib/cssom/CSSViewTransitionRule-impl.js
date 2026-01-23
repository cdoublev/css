
import { serializeComponentValue, serializeValue } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { isList } from '../utils/value.js'
import { parseGrammar } from '../parse/parser.js'

/**
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#cssviewtransitionrule}
 */
export default class CSSViewTransitionRuleImpl extends CSSRuleImpl {

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
        const navigation = declarations.find(declaration => declaration.name === 'navigation')
        if (navigation) {
            this.navigation = serializeValue(navigation)
        }
        const types = declarations.find(declaration => declaration.name === 'types')
        this.types = Object.freeze(isList(types?.value) ? types.value.map(serializeComponentValue) : [])
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { navigation, types } = this
        const declarations = []
        if (navigation) {
            declarations.push(`navigation: ${navigation}`)
        }
        if (0 < types.length) {
            declarations.push(`types: ${types.join(' ')}`)
        }
        return 0 < declarations.length
            ? `@view-transition { ${declarations.join('; ')}; }`
            : '@view-transition { }'
    }
}
