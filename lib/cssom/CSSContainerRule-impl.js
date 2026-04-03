
import CSSConditionRuleImpl from './CSSConditionRule-impl.js'
import { serializeComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-conditional-5/#csscontainerrule}
 */
export default class CSSContainerRuleImpl extends CSSConditionRuleImpl {

    /**
     * @param {Window} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const conditions = privateData.prelude.map(([name, query]) => Object.freeze({
            name: serializeComponentValue(name),
            query: serializeComponentValue(query),
        }))
        this.conditions = Object.freeze(conditions)
        if (this.conditions.length === 1) {
            const [{ name, query }] = conditions
            this.containerName = name
            this.containerQuery = query
        } else {
            this.containerName = ''
            this.containerQuery = ''
        }
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, conditionText } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        return rules
            ? `@container ${conditionText} { ${rules} }`
            : `@container ${conditionText} { }`
    }
}
