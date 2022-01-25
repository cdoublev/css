
const { getDeclarationsInSpecifiedOrder, parseCSSDeclarationList } = require('../parse/syntax.js')
const CSSRule = require('./CSSRule.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const pageMarginProperties = require('../properties/page-margin.js')

const pageMarginRuleNames = [
    'top-left-corner',
    'top-left',
    'top-center',
    'top-right',
    'top-right-corner',
    'bottom-left-corner',
    'bottom-left',
    'bottom-center',
    'bottom-right',
    'bottom-right-corner',
    'left-top',
    'left-middle',
    'left-bottom',
    'right-top',
    'right-middle',
    'right-bottom',
]

/**
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 */
const definition = pageMarginRuleNames.reduce((rules, name) => {
    rules[name] = {
        value: {
            properties: pageMarginProperties,
            type: 'declaration-list',
        },
    }
    return rules
}, {})

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssmarginrule}
 */
class CSSMarginRuleImpl extends CSSRuleImpl {

    _declarations = []
    _rules = []

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { name, value } = privateData
        this.name = name
        parseCSSDeclarationList(value, definition.value, this).forEach(statement =>
            CSSRule.is(statement)
                ? this._rules.push(statement)
                : this._declarations.push(statement))
    }

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssmarginrule-style}
     */
    get style() {
        const properties = {
            declarations: getDeclarationsInSpecifiedOrder(this._declarations),
            parentRule: this.parentRule,
        }
        return CSSStyleDeclaration.create(this._globalObject, [], properties)
    }
}

module.exports = {
    definition,
    implementation: CSSMarginRuleImpl,
}
