
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { getDeclarationsInSpecifiedOrder } = require('./helpers.js')
const { parseCSSGrammar } = require('../parse/syntax.js')
const { serializeSelectorGroup } = require('../serialize.js')

/**
 * @param {string} input
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-group-of-selectors}
 * @see {@link https://drafts.csswg.org/selectors/#parse-a-selector}
 * @see {@link https://drafts.csswg.org/selectors/#grammar}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6927}
 *
 * TODO: handle specific invalid selector rules in `lib/parse/rules.js`
 */
function parseSelectorGroup(input) {
    return parseCSSGrammar(input, '<selector-list>')
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstylerule}
 */
class CSSStyleRuleImpl extends CSSRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { component: { prelude } } = privateData
        this._selectors = prelude
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    get selectorText() {
        return serializeSelectorGroup(this._selectors)
    }

    /**
     * @param {string} input
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext}
     */
    set selectorText(input) {
        const selectors = parseSelectorGroup(input)
        if (selectors) {
            this._selectors = selectors
        }
    }

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-style}
     */
    get style() {
        const properties = {
            declarations: getDeclarationsInSpecifiedOrder(this._childCSSRules),
            parentRule: this,
        }
        return CSSStyleDeclaration.create(this._globalObject, [], properties)
    }
}

module.exports = {
    implementation: CSSStyleRuleImpl,
    parseSelectorGroup,
}
