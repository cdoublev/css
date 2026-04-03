
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSNestedDeclarations from './CSSNestedDeclarations.js'
import CSSRuleList from './CSSRuleList.js'
import { isOmitted } from '../utils/value.js'
import { omitted } from '../values/value.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValues } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-cascade-6/#cssscoperule}
 */
export default class CSSScopeRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {Window} globalObject
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
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
        const [start, end] = isOmitted(prelude) ? [omitted, omitted] : prelude
        this._start = start
        this._end = end
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, end, start } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        let string = '@scope '
        if (start) {
            string += `(${start}) `
        }
        if (end) {
            string += `to (${end}) `
        }
        string += rules ? `{ ${rules} }` : '{ }'
        return string
    }

    /**
     * @returns {string|null}
     * @see {@link https://drafts.csswg.org/css-cascade-6/#dom-cssscoperule-end}
     */
    get end() {
        return isOmitted(this._end) ? null : serializeComponentValues(this._end[1].value)
    }

    /**
     * @returns {string|null}
     * @see {@link https://drafts.csswg.org/css-cascade-6/#dom-cssscoperule-start}
     */
    get start() {
        return isOmitted(this._start) ? null : serializeComponentValues(this._start.value)
    }
}
