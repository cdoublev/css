
import * as cssom from '../cssom/index.js'
import { CSSFontFeatureValuesMap, CSSNamespaceRule, CSSRule, CSSStyleSheet } from '../cssom/index.js'
import { getRoot, isNode } from '../utils/node.js'
import root from '../rules/definitions.js'

const type = Symbol('context')

/**
 * @param {CSSFontFeatureValuesMapImpl|CSSRuleImpl|CSSStyleSheetImpl|Element|Window|object|string|string[]} [value]
 * @returns {object}
 */
export function createContext(value) {

    if (value?.type === type) {
        return value
    }
    if (isNode(value)) {
        return { ...value.context, ...value, type }
    }

    const globalObject = value?._globalObject ?? value?.ownerDocument?.defaultView ?? value
    const state = { extended: new Map }

    if (CSSRule.isImpl(value)) {
        const context = createContext(value.parentRule ?? value.parentStyleSheet)
        const definition = context.definition.value.rules.find(definition => cssom[definition.cssom].isImpl(value))
        return { ...context, context, definition, globalObject, state, value }
    }
    if (CSSFontFeatureValuesMap.isImpl(value)) {
        const context = createContext(value.parentRule ?? value.parentStyleSheet)
        const definition = value._definition
        return { ...context, context, definition, globalObject, state, value }
    }

    const namespaces = new Map([['*', '']])
    const context = {
        definition: root,
        globalObject,
        namespaces,
        state,
        trees: [],
        type,
    }

    if (value === globalObject) {
        return context
    }
    if (CSSStyleSheet.isImpl(value)) {
        value._rules?.forEach(rule => {
            if (CSSNamespaceRule.isImpl(rule)) {
                namespaces.set(rule.prefix, rule.namespaceURI)
            }
        })
        return { ...context, globalObject, value }
    }
    // Assert: value is an Element
    const definition = root.value.rules.find(definition => definition.qualified)
    return { ...context, context, definition }
}

/**
 * @param {Window} globalObject
 * @param {object|object[]} name
 * @returns {object}
 */
export function createVirtualContext(globalObject, name) {
    if (typeof name === 'string') {
        name = [name]
    }
    const namespaces = new Map([['*', '']])
    const state = { extended: new Map }
    const context = {
        definition: root,
        globalObject,
        namespaces,
        state,
        trees: [],
        type,
    }
    return name.reduce(
        (context, name) => {
            const definition = context.definition.value.rules.find(rule => rule.name === name)
            return { ...context, context, definition, state: { extended: new Map } }
        },
        context)
}

/**
 * @param {object} node
 * @param {string} name
 * @returns {object}
 */
export function enterVirtualContext(node, name) {
    const { context } = node
    const definition = getRoot(node).definition.value.rules.find(rule => rule.name === name)
    return { ...context, context, definition, state: { extended: new Map } }
}
