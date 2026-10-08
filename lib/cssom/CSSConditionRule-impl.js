
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSRuleList from './CSSRuleList.js'
import { createDeclarationBlockRule } from '../utils/cssom.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssconditionrule}
 */
export default class CSSConditionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {Window} globalObject
     * @param {*[]} [args]
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {

        super(globalObject, args, privateData)

        const { node, prelude } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const rules = block.value.map(rule => {
            if (Array.isArray(rule)) {
                return createDeclarationBlockRule(definition.value.rules[0].cssom, rule, this)
            }
            return rule
        })

        this._condition = prelude
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext}
     */
    get conditionText() {
        return serializeComponentValue(this._condition)
    }
}
