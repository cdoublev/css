
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSRuleList from './CSSRuleList.js'
import { createDeclarationBlockRule } from '../utils/cssom.js'
import { parseGrammar } from '../parse/parser.js'

/**
 * @see {@link https://drafts.csswg.org/css-transitions-2/#cssstartingstylerule}
 */
export default class CSSStartingStyleRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {Window} globalObject
     * @param {*[]} [args]
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {

        super(globalObject, args, privateData)

        const { node } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const rules = block.value.map(rule => {
            if (Array.isArray(rule)) {
                return createDeclarationBlockRule(definition.value.rules[0].cssom, rule, this)
            }
            return rule
        })

        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const rules = this.cssRules._rules.map(rule => rule.cssText).join(' ')
        return rules
            ? `@starting-style { ${rules} }`
            : '@starting-style { }'
    }
}
