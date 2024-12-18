
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleRule = require('./CSSStyleRule.js')
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
        const { prelude, value } = privateData
        const { declarations, rules } = parseBlockContents(value, this)
        this.name = serializeCSSComponentValue(prelude)
        // Wrap declarations in nested style rule
        if (0 < declarations.length) {
            const data = { parentRule: this, parentStyleSheet: this.parentStyleSheet }
            const styleRule = CSSStyleRule.createImpl(globalObject, undefined, data)
            styleRule.style._declarations.push(...declarations)
            rules.unshift(styleRule)
        }
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
