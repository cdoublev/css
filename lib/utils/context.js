
import { isCSSType } from './definition.js'

export const type = Symbol('context')

/**
 * @param {object} node
 * @param {string} name
 * @returns {object}
 */
export function enterContext(node, name) {
    const { context } = node
    const contextDefinition = getRule(node)?.definition.value ?? getRoot(node)
    const definition = contextDefinition.rules.find(rule => rule.name === name)
    return { ...context, context, definition }
}

/**
 * @param {object} node
 * @param {function} accept
 * @param {function} abort
 * @returns {object|null|undefined}
 */
export function findChild({ children }, accept, abort) {
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
 * @param {function} accept
 * @returns {object|null|undefined}
 */
export function findContext({ context }, accept, abort) {
    while (context) {
        if (accept(context)) {
            return context
        }
        if (abort?.(context)) {
            return null
        }
        context = context.context
    }
}

/**
 * @param {object} node
 * @param {function} accept
 * @param {function} [abort]
 * @returns {boolean}
 */
export function findFunction(node, accept, abort) {
    return findContext(
        node,
        node => node.definition.type === 'function' && accept(node),
        node => node.definition.type === 'function' && abort?.(node))
}

/**
 * @param {object} node
 * @param {function} accept
 * @param {function} [abort]
 * @returns {object|null|undefined}
 */
export function findParent({ parent }, accept, abort) {
    while (parent) {
        if (accept(parent)) {
            return parent
        }
        if (abort?.(parent)) {
            return null
        }
        parent = parent.parent
    }
}

/**
 * @param {object[]} tree
 * @param {function} accept
 * @param {function} [abort]
 * @param {boolean} [climb]
 * @returns {object|null|undefined}
 */
export function findSibling({ context, parent }, accept, abort, climb) {
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
    if (climb && context) {
        return findSibling(context, accept, abort, true)
    }
    return null
}

/**
 * @param {object} node
 * @returns {object|undefined}
 */
export function getDeclaration(node) {
    return findContext(node, node => node.definition.type === 'declaration')
}

/**
 * @param {object} node
 * @returns {string|undefined}
 */
export function getDeclarationName(node) {
    return getDeclaration(node)?.definition.name
}

/**
 * @param {object} node
 * @returns {object|undefined}
 */
export function getFunction(node) {
    return findContext(node, node => node.definition.type === 'function')
}

/**
 * @param {object} node
 * @returns {string|undefined}
 */
export function getFunctionName(node) {
    return getFunction(node)?.definition.name
}

/**
 * @param {object} node
 * @returns {object}
 */
export function getProduction(node) {
    return findParent(node, node => isCSSType(node.definition), node => isCSSType(node.definition))
}

/**
 * @param {object} node
 * @returns {object|undefined}
 */
export function getRoot({ context }) {
    let root
    while (context) {
        root = context
        context = context.context
    }
    return root
}

/**
 * @param {object} node
 * @returns {object|undefined}
 */
export function getRule(node) {
    return findContext(node, node => node.definition.type === 'rule')
}

/**
 * @param {object} node
 * @returns {string|undefined}
 */
export function getRuleName(node) {
    return getRule(node)?.definition.name
}

/**
 * @param {object} [node]
 * @returns {boolean}
 */
export function isContext(node) {
    return node?.type === type
}

/**
 * @param {object} node
 * @param {string} name
 * @returns {boolean}
 */
export function isDeclaredBy(node, name) {
    return getDeclarationName(node) === name
}

/**
 * @param {object} node
 * @param {string} name
 * @returns {boolean}
 */
export function isProducedBy(node, name) {
    return getProduction(node)?.definition.name === name
}
