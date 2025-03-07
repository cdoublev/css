
const CSSFunctionDeclarations = require('./CSSFunctionDeclarations.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const { parseBlockContents } = require('../parse/parser.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-mixins-1/#cssfunctionrule}
 */
class CSSFunctionRuleImpl extends CSSGroupingRuleImpl {

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
                return CSSFunctionDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._prelude = serializeCSSComponentValueList(prelude)
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _prelude, cssRules } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        return rules
            ? `@function ${_prelude} { ${rules} }`
            : `@function ${_prelude} {}`
    }
}

module.exports = {
    implementation: CSSFunctionRuleImpl,
}
