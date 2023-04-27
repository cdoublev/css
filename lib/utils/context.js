
const compatibility = require('../compatibility.js')
const descriptors = require('../descriptors/definitions.js')
const properties = require('../properties/definitions.js')
const root = require('../rules/definitions.js')

const style = root.rules.find(rule => rule.type === 'style')

/**
 * @param {ParseTree|object} source
 * @param {function} accept
 * @param {function} abort
 * @returns {ParseTree|object|null}
 */
function findParent({ parent }, accept, abort) {
    while (parent) {
        if (accept(parent)) {
            return parent
        }
        if (abort?.(parent)) {
            break
        }
        ({ parent } = parent)
    }
    return null
}

/**
 * @param {ParseTree|ParseTree[]|object[]} source
 * @param {function} accept
 * @param {function} [abort]
 * @returns {ParseTree|object|null}
 */
function findLast(source, accept, abort) {
    if (Array.isArray(source)) {
        let { length: i } = source
        for (; i; --i) {
            const item = source[i - 1]
            if (accept(item)) {
                return item
            }
            if (abort?.(item)) {
                break
            }
        }
        return null
    }
    let node = null
    while (!node && source) {
        node = findLast(source.nodes, accept, abort)
        source = source.parent
    }
    return node
}

/**
 * @param {CSSRuleImpl|CSSStyleSheetImpl} [value]
 * @returns {object[]}
 */
function getContexts(value) {
    if (value) {
        const { parentRule, parentStyleSheet, type } = value
        const parent = parentRule ?? parentStyleSheet
        // CSSRule
        if (parent) {
            const key = [...type].at(-1)
            const ancestors = getContexts(parent, root)
            const context = ancestors.at(-1)
            const definition = context.definition.rules.find(rule => rule.type === key)
            return [...ancestors, { definition, parent: context }]
        }
        // CSSStyleSheet
        return [{ definition: root, parent: null }]
    }
    // CSSStyleRule (default for Element.style, Element.media, etc)
    return [{ definition: style, parent: null }]
}

/**
 * @param {CSSRuleImpl|CSSStyleSheetImpl} [styleSheet]
 * @returns {string[]}
 *
 * `_rules` must be read rather than `cssRules` because the latter would throw
 * an error with a cross-origin style sheet.
 *
 * `_rules` is undefined when the parsed input is a style sheet.
 */
function getNamespaces(styleSheet) {
    const prefixes = ['*']
    if (styleSheet) {
        const rules = styleSheet.parentStyleSheet?._rules ?? styleSheet._rules ?? []
        for (const { prefix, type } of rules) {
            if (type.has('namespace')) {
                prefixes.push(prefix)
            }
        }
    }
    return prefixes
}

/**
 * @param {object} declaration
 * @param {object} context
 * @returns {object|null}
 */
function getDeclarationValueDefinition({ name }, { definition }) {
    if (name.startsWith('--')) {
        // The context accept (custom) properties
        if (0 < definition.properties.length) {
            return { name, type: 'property', value: '<declaration-value>?' }
        }
        return null
    }
    if (definition.properties?.includes(name)) {
        const { properties: { aliases, mappings } } = compatibility
        if (mappings.has(name)) {
            return { name, type: 'property', value: properties[mappings.get(name)].value }
        }
        if (aliases.has(name)) {
            name = aliases.get(name)
        }
        return { name, type: 'property', value: properties[name].value }
    }
    const rule = descriptors[`@${definition.type}`]
    if (rule) {
        const { descriptors: { aliases, mappings } } = compatibility
        let definition
        if (aliases.has(name)) {
            name = aliases.get(name)
            definition = rule[name]
        } else if (mappings.has(name)) {
            definition = rule[mappings.get(name)]
        } else {
            definition = rule[name]
        }
        if (definition) {
            return { name, type: 'descriptor', value: definition.value }
        }
    }
    return null
}

/**
 * @param {object} rule
 * @param {object} context
 * @returns {object|null}
 */
function getRuleDefinition({ name, value }, { definition: { qualified = null, rules = [] } }) {
    if (name) {
        return rules.find(({ names, type }) => {
            switch (type) {
                case name:
                    return true
                case `${name}-block`:
                    return value
                case `${name}-statement`:
                    return !value
                default:
                    return names?.includes(name)
            }
        })
    }
    return rules.find(rule => rule.type === qualified)
}

module.exports = {
    findLast,
    findParent,
    getContexts,
    getDeclarationValueDefinition,
    getNamespaces,
    getRuleDefinition,
}
