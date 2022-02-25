
const topLevel = require('../values/rules.js')

/**
 * @param {CSSStyleSheetImpl} styleSheet
 * @returns {string[]}
 *
 * `_rules` has to be read instead of `cssRules` because reading `styleSheet`
 * from cross-origin will otherwise throw an error.
 */
function getStyleSheetNamespaces({ _rules = [] }) {
    const prefixes = ['*']
    for (const { prefix, type } of _rules) {
        if (type.has('namespace')) {
            prefixes.push(prefix)
        }
    }
    return prefixes
}

class ParserContext {

    /**
     * @param {CSSStyleSheetImpl|CSSRuleImpl} [block]
     */
    constructor(block = {}) {
        const { type } = block
        if (type === 'text/css') {
            this._stack = [topLevel]
            this._namespaces = getStyleSheetNamespaces(block)
        } else if (type) {
            const { parentRule, parentStyleSheet } = block
            const context = this.#getRuleContext(block)
            const parentContext = parentRule ? this.#getRuleContext(parentRule) : topLevel
            this._stack = [parentContext, context]
            this._namespaces = getStyleSheetNamespaces(parentStyleSheet)
        } else {
            this._namespaces = ['*']
            this._stack = [topLevel]
        }
    }

    /**
     * @returns {object}
     */
    get current() {
        return this._stack.at(-1)
    }

    /**
     * @returns {string}
     */
    get namespaces() {
        return this._namespaces
    }

    /**
     * @returns {object}
     */
    get parent() {
        return this._stack.at(-2)
    }

    /**
     * @returns {number}
     */
    get length() {
        return this._stack.length
    }

    /**
     * @param {object} rule
     * @returns {object|null}
     */
    enter(rule) {
        const type = this.#getChildRuleType(rule)
        if (type !== 'unknown') {
            const { name } = rule
            const context = this.#getChildRuleContext(type, name)
            if (context) {
                rule.type.add(type)
                this._stack.push(context)
                return context
            }
        }
        return null
    }

    exit() {
        this._stack.pop()
    }

    /**
     * @param {CSSRuleImpl} [rule]
     * @returns {object}
     */
    #getRuleContext({ parentRule, type }) {
        if (type) {
            type = [...type].at(-1)
            if (parentRule) {
                return this.#getRuleContext(parentRule).rules[type]
            }
            return topLevel.rules[type]
        }
        return topLevel
    }

    /**
     * @param {object} rule
     * @returns {string}
     */
    #getChildRuleType({ name }) {
        const { current: { qualified = 'style', type, rules = {} } } = this
        // At-rule
        if (name) {
            let rule
            if (type === '<stylesheet>') {
                rule = topLevel.rules[name]
            } else {
                rule = rules[name]
            }
            if (rule) {
                const { type = name } = rule
                return type
            }
            return 'unknown'
        }
        // Qualified rule
        return qualified
    }

    /**
     * @param {string} type
     * @param {string} [name]
     * @returns {object}
     */
    #getChildRuleContext(type, name) {
        let { current: { rules = {} } } = this
        if (Array.isArray(rules)) {
            // context.type === '<stylesheet>'
            if (rules.includes(type)) {
                return null
            }
            ({ rules } = topLevel)
        }
        return rules[type] ?? rules[name]
    }
}

module.exports = ParserContext
