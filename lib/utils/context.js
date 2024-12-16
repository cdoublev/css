
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
 * @param {boolean} [climb]
 * @returns {object|null}
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
    if (climb && context.function) {
        return findSibling(context.function, accept, abort, true)
    }
    return null
}

module.exports = {
    findContext,
    findParent,
    findSibling,
}
