
/**
 * @param {ParseTree|object} source
 * @param {function} predicate
 * @returns {ParseTree|object|null}
 */
function findParent({ parent }, predicate) {
    while (parent) {
        if (predicate(parent)) {
            return parent
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

module.exports = {
    findLast,
    findParent,
}
