
const DOMException = require('domexception')
const { hasOnlyRuleOfTypes, isRuleOfType } = require('./helpers.js')
const { parseCSSGrammar } = require('../parse/engine.js')
const { parseRule } = require('../parse/syntax.js')
const types = require('../values/types.js')

/**
 * @param {string} string
 * @returns {object}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-rule}
 */
function parseCSSRule(string) {
    const rule = parseRule(string)
    if (rule instanceof SyntaxError) {
        return rule
    }
    /**
     * TODO: figure out if this is the appropriate implementation.
     *
     * "Let parsed rule be the result of parsing rule according to the
     * appropriate CSS specifications"
     * -> what are these specifications?
     *
     * "If the whole style rule is dropped, return a syntax error."
     * -> does it mean that this function should only parse style rules?
     * -> or should it be based on `rule.name` or `rule.type`?
     *
     * TODO: return a new instance of the corresponding CSSRule subclass from
     * the received component value in `lib/parse/rules.js`.
     */
    const { value: type } = rule.type.values().next()
    const definition = types[type]
    const parsed = parseCSSGrammar(rule, definition)
    if (parsed) {
        return parsed
    }
    return new DOMException('Could not parse a CSS rule', 'SyntaxError')
}

/**
 * @param {object[]} list
 * @param {object} rule
 * @param {number} index
 * @return {index}
 * @see {@link https://drafts.csswg.org/cssom/#insert-a-css-rule}
 */
function insertCSSRule(list, rule, index) {
    const { length } = list
    if (length < index) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'IndexSizeError')
    }
    rule = parseCSSRule(rule)
    if (rule instanceof SyntaxError) {
        throw rule
    }
    // TODO: handle requirements of rule hierarchy
    if (isRuleOfType(rule, 'CSSNamespaceRule') && !hasOnlyRuleOfTypes(list, ['CSSImportRule', 'CSSNamespaceRule'])) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'InvalidStateError')
    }
    list[index] = rule
    return index
}

/**
 * @param {CSSRuleList} list
 * @param {number} index
 * @see {@link https://drafts.csswg.org/cssom/#remove-a-css-rule}
 */
function removeCSSRule(list, index) {
    const { length } = list
    if (length < index) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'IndexSizeError')
    }
    const rule = list[index]
    if (isRuleOfType(rule, 'CSSNamespaceRule') && !hasOnlyRuleOfTypes(list, ['CSSImportRule', 'CSSNamespaceRule'])) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'InvalidStateError')
    }
    list.splice(index, 1)
    // TODO: figure out how read-only `rule.parentRule` and `rule.parentStyleSheet` can be set to `null`
}

/**
 * @param {CSSRule} rule
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
 */
function serializeCSSRule(rule) {
    // TODO
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssrule}
 */
class CSSRuleImpl {

    constructor(globalObject, args, { component, parentRule, parentStyleSheet }) {
        const { name, value } = component
        this._childCSSRules = value
        this._globalObject = globalObject
        this._name = name
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
        this.text = serializeCSSRule(component)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     */
    get cssText() {
        return this.text
    }
}

module.exports = {
    implementation: CSSRuleImpl,
    insertCSSRule,
    removeCSSRule,
}
