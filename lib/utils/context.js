
const compatibility = require('../compatibility.js')
const root = require('../rules/definitions.js')

const style = root.rules.find(rule => rule.name === '@style')

const ruleTypeMap = {
    CSSColorProfileRuleImpl: '@color-profile',
    CSSContainerRuleImpl: '@container',
    CSSCounterStyleRuleImpl: '@counter-style',
    CSSFontFaceRuleImpl: '@font-face',
    CSSFontFeatureValuesRuleImpl: '@font-feature-values',
    CSSFontPaletteValuesRuleImpl: '@font-palette-values',
    CSSImportRuleImpl: '@import',
    CSSKeyframeRuleImpl: '@keyframe',
    CSSKeyframesRuleImpl: '@keyframes',
    CSSLayerBlockRuleImpl: '@layer-block',
    CSSLayerStatementRuleImpl: '@layer-statement',
    CSSMarginRuleImpl: '@margin',
    CSSMediaRuleImpl: '@media',
    CSSNamespaceRuleImpl: '@namespace',
    CSSPageRuleImpl: '@page',
    CSSPositionTryRuleImpl: '@position-try',
    CSSPropertyRuleImpl: '@property',
    CSSScopeRuleImpl: '@scope',
    CSSStartingStyleRuleImpl: '@starting-style',
    CSSStyleRuleImpl: '@style',
    CSSSupportsRuleImpl: '@supports',
    CSSViewTransitionRuleImpl: '@view-transition',
}

/**
 * @param {object} node
 * @param {function} accept
 * @param {function} abort
 * @returns {object|null|undefined}
 */
function findChild({ children }, accept, abort) {
    for (let i = children.length; i; --i) {
        const node = children[i - 1]
        if (node.children) {
            const match = findChild(node, accept, abort)
            if (match || match === null) {
                return match
            }
        }
        if (accept(node)) {
            return node
        }
        if (abort?.(node)) {
            return null
        }
    }
}

/**
 * @param {string} type
 * @param {object} node
 * @param {function} accept
 * @returns {object|null}
 */
function findContext(type, { context: { [type]: context } }, accept) {
    while (context) {
        if (accept(context)) {
            return context
        }
        context = context.context[type]
    }
    return null
}

/**
 * @param {object} node
 * @param {function} accept
 * @param {function} [abort]
 * @returns {object|null}
 */
function findParent({ parent }, accept, abort) {
    while (parent) {
        if (accept(parent)) {
            return parent
        }
        if (abort?.(parent)) {
            break
        }
        parent = parent.parent
    }
    return null
}

/**
 * @param {object[]} tree
 * @param {function} accept
 * @param {function} [abort]
 * @returns {object|null}
 */
function findSibling({ context, parent }, accept, abort, climb = false) {
    while (parent) {
        const match = findChild(parent, accept, abort)
        if (match) {
            return match
        }
        if (match === null) {
            break
        }
        if (abort?.(parent)) {
            break
        }
        parent = parent.parent
    }
    if (climb && context.function) {
        return findSibling(context.function, accept, abort, true)
    }
    return null
}

/**
 * @param {CSSRuleImpl|CSSStyleSheetImpl} [styleSheet]
 * @returns {Set}
 *
 * `_rules` must be read instead of `cssRules` because the latter would throw
 * an error with a cross-origin style sheet.
 *
 * `_rules` is undefined when the parsed input is a style sheet.
 */
function getNamespaces(styleSheet) {
    const prefixes = new Set(['*'])
    if (styleSheet) {
        const rules = styleSheet.parentStyleSheet?._rules ?? styleSheet._rules ?? []
        for (const rule of rules) {
            if (getRuleType(rule) === '@namespace') {
                prefixes.add(rule.prefix)
            }
        }
    }
    return prefixes
}

/**
 * @param {CSSRule} rule
 * @returns {string}
 */
function getRuleType(rule) {
    const constructor = Object.getPrototypeOf(rule).constructor.name
    if (constructor === 'Object') {
        return rule.types.at(-1)
    }
    return ruleTypeMap[constructor]
}

/**
 * @param {object} declaration
 * @param {object} context
 * @returns {object|null}
 */
function getDeclarationValueDefinition({ name }, context) {
    const { rule: { definition: { name: ruleName, value: { descriptors, properties } } } } = context
    name = name.toLowerCase()
    if (properties) {
        if (name.startsWith('--')) {
            const definition = properties?.['--*']
            if (definition) {
                return { name, type: 'property', value: definition.value }
            }
            return null
        }
        const { properties: { aliases, mappings } } = compatibility
        let value
        if (mappings.has(name)) {
            value = properties[mappings.get(name)]?.value
        } else if (aliases.has(name)) {
            name = aliases.get(name)
            value = properties[name]?.value
        } else {
            value = properties[name]?.value
        }
        if (value) {
            return { name, type: 'property', value }
        }
    }
    if (descriptors) {
        const replacements = compatibility.descriptors[ruleName]
        let value
        if (replacements?.mappings.has(name)) {
            value = descriptors[replacements.mappings.get(name)]?.value
        } else if (replacements?.aliases.has(name)) {
            name = replacements.aliases.get(name)
            value = descriptors[name]?.value
        } else {
            value = descriptors[name]?.value ?? descriptors['*']
        }
        if (value) {
            return { name, type: 'descriptor', value }
        }
    }
    return null
}

/**
 * @param {object} rule
 * @param {object} context
 * @returns {object|null}
 */
function getRuleDefinition({ name, value }, { root, rule }) {
    const contextDefinition = rule ? rule.definition.value : root.definition
    if (!contextDefinition) {
        return null
    }
    if (name) {
        name = `@${name.toLowerCase()}`
        const alias = compatibility.rules.aliases.get(name)
        if (alias) {
            name = alias
        }
        return contextDefinition.rules?.find(rule => {
            switch (rule.name) {
                case name:
                    return true
                case `${name}-block`:
                    return value
                case `${name}-statement`:
                    return !value
                default:
                    return rule.names?.includes(name)
            }
        })
    }
    return contextDefinition.rules?.find(rule => rule.qualified)
}

/**
 * @param {CSSRuleImpl|CSSStyleSheetImpl} [value]
 * @returns {object[]}
 */
function createContext(value) {
    if (value) {
        const parent = value.parentRule ?? value.parentStyleSheet
        // CSSRule
        if (parent) {
            const context = createContext(parent)
            const { root, rule } = context
            const contextDefinition = rule ? rule.definition.value : root.definition
            const key = getRuleType(value)
            const definition = contextDefinition.rules.find(rule => rule.name === key)
            return { ...context, rule: { context, definition, value } }
        }
        // CSSStyleSheet
        return {
            globals: new Map([['namespaces', getNamespaces(value)]]),
            root: { definition: root, value },
            trees: [],
        }
    }
    // CSSStyleRule (default for CSS.supports(), Element.style, Element.media, etc)
    return {
        globals: new Map([['namespaces', new Set()]]),
        rule: { definition: style },
        trees: [],
    }
}

module.exports = {
    createContext,
    findContext,
    findParent,
    findSibling,
    getDeclarationValueDefinition,
    getRuleDefinition,
    getRuleType,
}
