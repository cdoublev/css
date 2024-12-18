
const { list, omitted } = require('../values/value.js')
const { implementation: CSSGroupingRuleImpl } = require('./CSSGroupingRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const CSSStyleRule = require('./CSSStyleRule.js')
const { isOmitted } = require('../utils/value.js')
const { parseBlockContents } = require('../parse/parser.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

const colon = { types: ['<delimiter-token>'], value: ':' }
const scope = { types: ['<ident-token>'], value: 'scope' }
const subclassSelector = list([colon, scope], '', ['<pseudo-class-selector>', '<subclass-selector>'])
const subclassSelectorList = list([subclassSelector], '')
const compound = list([omitted, subclassSelectorList], '', ['<compound-selector>'])
const complexUnit = list([compound, list([], '')], '', ['<complex-selector-unit>'])
const complexSelector = list([complexUnit, list()], ' ', ['<complex-selector>'])
const relativeSelector = list([omitted, complexSelector], ' ', ['<relative-selector>'])
const relativeSelectorList = list([relativeSelector], ',', ['<relative-selector-list>'])

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
        const { prelude, value } = privateData
        const { declarations, rules } = parseBlockContents(value, this)
        if (isOmitted(prelude)) {
            this.start = null
            this.end = null
        } else {
            const [start, end] = prelude
            this.start = isOmitted(start) ? null : serializeCSSComponentValueList(start.value)
            this.end = isOmitted(end) ? null : serializeCSSComponentValueList(end[1].value)
        }
        // Wrap declarations in nested style rule
        if (0 < declarations.length) {
            const data = {
                parentRule: this,
                parentStyleSheet: this.parentStyleSheet,
                prelude: relativeSelectorList,
            }
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
