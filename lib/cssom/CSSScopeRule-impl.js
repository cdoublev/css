
const { implementation: CSSGroupingRule } = require('./CSSGroupingRule-impl.js')
const { isOmitted } = require('../utils/value.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-6/#cssscoperule}
 */
class CSSScopeRuleImpl extends CSSGroupingRule {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude } = privateData
        if (isOmitted(prelude)) {
            this.start = null
            this.end = null
        } else {
            const [start, end] = prelude
            this.start = isOmitted(start) ? null : serializeCSSComponentValueList(start.value)
            this.end = isOmitted(end) ? null : serializeCSSComponentValueList(end[1].value)
        }
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _rules, end, start } = this
        const rules = _rules.map(rule => rule.cssText).join(' ')
        let string = '@scope'
        if (start) {
            string += ` (${start})`
        }
        if (end) {
            string += ` to (${end})`
        }
        return `${string}${rules ? ` { ${rules} }` : ' {}'}`
    }
}

module.exports = {
    implementation: CSSScopeRuleImpl,
}
