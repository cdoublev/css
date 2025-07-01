
const { isCSSType } = require('./node.js')

const type = Symbol('context')

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
 * @param {function} accept
 * @returns {object|null|undefined}
 */
function findContext({ context }, accept, abort) {
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
function findFunction(node, accept, abort) {
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
function findParent({ parent }, accept, abort) {
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
function findSibling({ context, parent }, accept, abort, climb) {
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
function getDeclaration(node) {
    return findContext(node, node => node.definition.type === 'declaration')
}

/**
 * @param {object} node
 * @returns {string|undefined}
 */
function getDeclarationName(node) {
    return getDeclaration(node)?.definition.name
}

/**
 * @param {object} node
 * @returns {object|undefined}
 */
function getFunction(node) {
    return findContext(node, node => node.definition.type === 'function')
}

/**
 * @param {object} node
 * @returns {string|undefined}
 */
function getFunctionName(node) {
    return getFunction(node)?.definition.name
}

/**
 * @param {object} node
 * @returns {object}
 */
function getProduction(node) {
    return findParent(node, isCSSType, isCSSType)
}

/**
 * @param {object} node
 * @returns {object|undefined}
 */
function getRule(node) {
    return findContext(node, node => node.definition.type === 'rule')
}

/**
 * @param {object} node
 * @returns {string|undefined}
 */
function getRuleName(node) {
    return getRule(node)?.definition.name
}

/**
 * @param {object} [node]
 * @returns {boolean}
 */
function isContext(node) {
    return node?.type === type
}

/**
 * @param {object} node
 * @param {string} name
 * @returns {boolean}
 */
function isDeclaredBy(node, name) {
    return getDeclarationName(node) === name
}

/**
 * @param {object} node
 * @param {string} name
 * @returns {boolean}
 */
function isProducedBy(node, name) {
    return getProduction(node)?.definition.name === name
}

module.exports = {
    findContext,
    findFunction,
    findParent,
    findSibling,
    getDeclaration,
    getDeclarationName,
    getFunction,
    getFunctionName,
    getProduction,
    getRule,
    getRuleName,
    isContext,
    isDeclaredBy,
    isProducedBy,
    type,
}
