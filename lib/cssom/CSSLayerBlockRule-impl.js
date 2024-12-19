
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSNestedDeclarations = require('./CSSNestedDeclarations.js')
const CSSRuleList = require('./CSSRuleList.js')
const { parseBlockContents } = require('../parse/parser')
const { serializeCSSComponentValue } = require('../serialize')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#csslayerblockrule}
 */
class CSSLayerBlockRuleImpl extends CSSGroupingRuleImpl {

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
            if (Array.isArray(rule) ) {
                return CSSNestedDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this.name = serializeCSSComponentValue(prelude)
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

module.exports = {
    implementation: CSSLayerBlockRuleImpl,
}
