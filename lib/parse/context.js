
const { getTopLevelTree } = require('../utils/context.js')
const root = require('../rules/definitions.js')

/**
 * @param {string} [name]
 * @param {object} definition
 * @returns {string|null}
 */
function findType(name, { qualified = null, value, rules = {} }) {
    // At-rule
    if (name) {
        if (value === '<stylesheet>') {
            if (rules.some(type => type === name)) {
                return null
            }
            ({ rules } = root)
        }
        return Object.keys(rules).find(type => type === name || rules[type].names?.includes(name))
    }
    return qualified
}

/**
 * @param {string} type
 * @param {object} definition
 * @returns {object}
 */
function getDefinition(type, { rules, value }) {
    if (value === '<stylesheet>') {
        ({ rules } = root)
    }
    return rules[type]
}

/**
 * @param {CSSStyleSheetImpl} styleSheet
 * @returns {string[]}
 *
 * `_rules` must be read instead of `cssRules` because reading cross-origin
 * `styleSheet.cssRules` will otherwise throw an error.
 */
function getNamespaces({ _rules = [] }) {
    const prefixes = ['*']
    for (const { prefix, type } of _rules) {
        if (type.has('namespace')) {
            prefixes.push(prefix)
        }
    }
    return prefixes
}

class ParseContext {

    /**
     * @param {CSSStyleSheetImpl|CSSRuleImpl|null} [value]
     * @param {ParseContext} [parent]
     */
    constructor(value, parent) {
        if (value) {
            const { parentRule, parentStyleSheet, type } = value
            if (type === 'text/css') {
                // CSSStyleSheet
                this.definition = root
                this.namespaces = getNamespaces(value)
                this.type = 'root'
            } else {
                // CSSRule or CSSStyleDeclaration
                this.parent = parent ?? new ParseContext(parentRule ?? parentStyleSheet)
                this.type = [...type].at(-1)
                this.definition = getDefinition(this.type, this.parent.definition)
            }
        } else {
            // Default to CSSStyleRule to allow Element.style.setProperty()
            this.definition = root.rules.style
            this.namespaces = ['*']
            this.type = 'style'
        }
    }

    /**
     * @returns {ParseContext}
     */
    get root() {
        return getTopLevelTree(this)
    }

    /**
     * @param {object} rule
     * @param {ParseContext} [parent]
     * @returns {ParseContext|null}
     */
    enter(rule, parent = this) {
        const type = findType(rule.name, parent.definition)
        if (type) {
            rule.type.add(type)
            return new ParseContext(rule, parent)
        }
        return null
    }
}

module.exports = ParseContext
