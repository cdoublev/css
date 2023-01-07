
/**
 * @param {ParseTree} tree
 * @param {function} predicate
 * @returns {ParseTree|null}
 */
function findParentTree({ parent }, predicate) {
    while (parent) {
        if (predicate(parent)) {
            return parent
        }
        ({ parent } = parent)
    }
    return null
}

/**
 * @param {object[]} nodes
 * @param {function} accept
 * @param {function} [abort]
 * @returns {object|null}
 */
function findLastNode(nodes, accept, abort) {
    let { length: i } = nodes
    for (; i; --i) {
        const node = nodes[i - 1]
        if (accept(node)) {
            return node
        }
        if (abort?.(node)) {
            break
        }
    }
    return null
}

/**
 * @param {ParseTree} tree
 * @returns {ParseTree}
 */
function getTopLevelTree(tree) {
    let { parent } = tree
    while (parent) {
        ({ parent } = tree = parent )
    }
    return tree
}

module.exports = {
    findLastNode,
    findParentTree,
    getTopLevelTree,
}
