
import * as cssom from '../cssom/index.js'
import { CSSGroupingRule, CSSImportRule, CSSLayerStatementRule, CSSNamespaceRule } from '../cssom/index.js'
import {
    INSERT_INVALID_IMPORT_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    create as error,
} from '../error.js'
import { getRoot, getRule } from './node.js'
import { parseDeclarations, parseRule } from '../parse/parser.js'
import { createContext } from '../parse/context.js'
import { isError } from '../values/value.js'

/**
 * @param {CSSRuleImpl} rule
 * @returns {boolean}
 */
export function isImportOrNamespaceRule(rule) {
    return CSSImportRule.isImpl(rule) || CSSNamespaceRule.isImpl(rule)
}

/**
 * @param {CSSRuleListImpl[]} list
 * @param {CSSRuleImpl} rule
 * @param {number} index
 * @returns {boolean}
 */
export function isInvalidIndexForRule(list, rule, index) {
    if (CSSImportRule.isImpl(rule)) {
        return !list.slice(0, index).every((rule, index, list) => {
            if (CSSLayerStatementRule.isImpl(rule)) {
                return list.slice(0, index).every(CSSLayerStatementRule.isImpl)
            }
            return CSSImportRule.isImpl(rule)
        })
    }
    if (CSSLayerStatementRule.isImpl(rule)) {
        return list.slice(0, index).some(isImportOrNamespaceRule)
            && list.slice(index).some(isImportOrNamespaceRule)
    }
    if (CSSNamespaceRule.isImpl(rule)) {
        return !list.slice(0, index).every((rule, index, list) => {
            if (CSSLayerStatementRule.isImpl(rule)) {
                return list.slice(0, index).every(CSSLayerStatementRule.isImpl)
            }
            return isImportOrNamespaceRule(rule)
        })
        || list.slice(index).some(CSSImportRule.isImpl)
    }
    return list.slice(index).some(isImportOrNamespaceRule)
}

/**
 * @param {CSSRuleListImpl[]} list
 * @param {CSSRuleImpl} rule
 * @returns {boolean}
 */
export function isInvalidNamespaceRule(list, rule) {
    return CSSNamespaceRule.isImpl(rule)
        && !list.every(rule => isImportOrNamespaceRule(rule) || CSSLayerStatementRule.isImpl(rule))
}

/**
 * @param {CSSRuleListImpl} list
 * @param {string} input
 * @param {number} index
 * @param {object} context
 * @param {boolean} [allowImport]
 * @returns {number}
 * @see {@link https://drafts.csswg.org/cssom-1/#insert-a-css-rule}
 */
export function insertRule({ _globalObject, _rules: list }, input, index, context, allowImport) {
    if (list.length < index) {
        throw error(INVALID_RULE_INDEX_ERROR, _globalObject)
    }
    context = createContext(context)
    let rule = parseRule(input, context)
    if (isError(rule)) {
        if (CSSGroupingRule.isImpl(context.value)) {
            const declarations = parseDeclarations(input, context)
            if (0 < declarations.length) {
                const name = context.definition.value.rules[0].cssom
                rule = createDeclarationBlockRule(name, declarations, context.value)
                list.splice(index, 0, rule)
                return index
            }
        }
        throw error(rule, _globalObject)
    }
    if (!allowImport && CSSImportRule.isImpl(rule)) {
        rule._abort()
        throw error(INSERT_INVALID_IMPORT_ERROR, _globalObject)
    }
    if (isInvalidIndexForRule(list, rule, index)) {
        if (CSSImportRule.isImpl(rule)) {
            rule._abort()
        }
        throw error(INVALID_RULE_POSITION_ERROR, _globalObject)
    }
    if (isInvalidNamespaceRule(list, rule)) {
        throw error(INVALID_NAMESPACE_STATE_ERROR, _globalObject)
    }
    list.splice(index, 0, rule)
    return index
}

/**
 * @param {CSSRuleListImpl} list
 * @param {number} index
 * @see {@link https://drafts.csswg.org/cssom-1/#remove-a-css-rule}
 */
export function removeRule({ _globalObject, _rules: list }, index) {
    if (list.length <= index) {
        throw error(INVALID_RULE_INDEX_ERROR, _globalObject)
    }
    const rule = list[index]
    if (isInvalidNamespaceRule(list, rule)) {
        throw error(INVALID_NAMESPACE_STATE_ERROR, _globalObject)
    }
    list.splice(index, 1)
    rule.parentStyleSheet = null
    rule.parentRule = null
    if (rule.cssRules) {
        for (let index = 0; index < rule.cssRules.length; index++) {
            removeRule(rule.cssRules, index)
        }
    }
}

/**
 * @param {string} name
 * @param {object[]} declarations
 * @param {CSSRuleImpl} parentRule
 * @returns {CSSNestedDeclarationsImpl|CSSFunctionDeclarationsImpl|CSSPageDeclarationsImpl}
 */
export function createDeclarationBlockRule(name, declarations, parentRule) {
    const { _globalObject, parentStyleSheet } = parentRule
    return cssom[name].createImpl(_globalObject, undefined, { declarations, parentRule, parentStyleSheet })
}

/**
 * @param {object} node
 * @param {string} [name]
 * @param {object[]} [prelude]
 * @returns {CSSFontFeatureValuesMapImpl|CSSRuleImpl}
 */
export function createRule(node, name, prelude) {
    const parentRule = getRule(node).value
    const parentStyleSheet = getRoot(node).value
    return cssom[node.definition.cssom].createImpl(parentStyleSheet._globalObject, undefined, {
        name,
        node,
        parentRule: parentRule === parentStyleSheet ? null : parentRule,
        parentStyleSheet,
        prelude,
    })
}
