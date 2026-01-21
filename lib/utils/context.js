
import { isCloseCurlyBrace, isCloseParen, isColon, isComma, isDelimiter, isOpenCurlyBrace, isSemicolon, isWhitespace } from './value.js'
import { associatedTokens } from '../values/blocks.js'
import { isCSSType } from './definition.js'

export const type = Symbol('context')

/**
 * @param {object} node
 * @param {string} name
 * @returns {object}
 */
export function enterContext(node, name) {
    const { context } = node
    const definition = getRoot(node).definition.value.rules.find(rule => rule.name === name)
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
 * @param {object} node
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
 * @param {object} node
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
export function getBlock(node) {
    return findContext(node, node => node.definition.type === 'block')
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
 * @returns {object|null|undefined}
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
 * @param {object} token
 * @param {object} context
 * @returns {boolean}
 */
function isInputAtPreludeEnd(token, context) {
    if (context.definition.name === '@sheet') {
        return false
    }
    if (isOpenCurlyBrace(token)) {
        return context.definition.value
    }
    const nested = getRule(context)?.definition.name !== '@sheet'
    if (isSemicolon(token)) {
        return nested || !context.definition.qualified
    }
    return nested && isCloseCurlyBrace(token)
}

/**
 * @param {object} token
 * @param {object} node
 * @returns {boolean}
 */
function isInputAtContextEnd(node, token) {
    for (const tree of node.context.trees.toReversed()) {
        switch (tree.definition.type) {
            case 'block':
                return isDelimiter(associatedTokens[node.definition.associatedToken], token)
            case 'declaration':
                if (isDelimiter('!', token)) {
                    return node.definition.type !== 'forgiving'
                        && !findContext(node, node => node.definition.type === 'forgiving')
                }
                if (isSemicolon(token)) {
                    return true
                }
                continue
            case 'rule':
                return isInputAtPreludeEnd(token, tree)
            case '|':
                if (tree.definition.value[0].type === 'rule') {
                    return isInputAtPreludeEnd(token, tree)
                }
                // falls through
            default:
                if (isComma(token)) {
                    return node.context.definition.type === 'forgiving'
                }
                if (tree.context.definition.type === 'block') {
                    return isDelimiter(associatedTokens[tree.context.definition.associatedToken], token)
                }
                if (tree.context.definition.type === 'function') {
                    return isCloseParen(token)
                }
                continue
        }
    }
    return false
}

/**
 * @param {object} node
 * @returns {boolean}
 */
export function isInputAtEnd(node) {
    const { input } = node
    if (input.atEnd()) {
        return true
    }
    let token = input.next()
    if (isWhitespace(token) && !(token = input.next(1, 1))) {
        return true
    }
    return isInputAtContextEnd(node, token)
}

/**
 * @param {object} token
 * @returns {boolean}
 */
function isInputAtPreludeStart(token) {
    return token.types[0] === '<at-keyword-token>'
        || isSemicolon(token)
        || isCloseCurlyBrace(token)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
export function isInputAtStart(node) {
    const { input } = node
    if (input.index === -1) {
        return true
    }
    let { current } = input
    if (isWhitespace(current)) {
        current = input.prev()
    }
    if (current === undefined) {
        return true
    }
    for (const tree of node.context.trees.toReversed()) {
        switch (tree.definition.type) {
            case 'block':
                return isDelimiter(node.definition.associatedToken, current)
            case 'declaration':
                if (node.context.definition.type === 'declaration') {
                    return isColon(current)
                }
                return isOpenCurlyBrace(current) || isCloseCurlyBrace(current)
            case 'rule':
                return isInputAtPreludeStart(current)
            case '|':
                if (tree.definition.value[0].type === 'rule') {
                    return isInputAtPreludeStart(current)
                }
                // falls through
            default:
                if (isComma(current)) {
                    return node.context.definition.type === 'forgiving'
                }
                if (tree.context.definition.type === 'block') {
                    return isDelimiter(tree.context.definition.associatedToken, current)
                }
                if (tree.context.definition.type === 'function') {
                    return current.types[0] === '<function-token>'
                }
                continue
        }
    }
    return false
}

/**
 * @param {object} node
 * @param {string} name
 * @returns {boolean}
 */
export function isProducedBy(node, name) {
    return getProduction(node)?.definition.name === name
}
