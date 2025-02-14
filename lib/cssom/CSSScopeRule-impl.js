
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSNestedDeclarations = require('./CSSNestedDeclarations.js')
const CSSRuleList = require('./CSSRuleList.js')
const { isOmitted } = require('../utils/value.js')
const { parseBlockContents } = require('../parse/parser.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-6/#cssscoperule}
 */
class CSSScopeRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { prelude, value } = privateData
        const rules = parseBlockContents(value, this).map(rule => {
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
        const { cssRules, end, start } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        let string = '@scope '
        if (start) {
            string += `(${start}) `
        }
        if (end) {
            string += `to (${end}) `
        }
        return `${string}${rules ? `{ ${rules} }` : '{}'}`
    }
}

module.exports = {
    implementation: CSSScopeRuleImpl,
}
