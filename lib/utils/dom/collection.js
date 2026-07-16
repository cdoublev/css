
/**
 * @param {Array|DOMTokenList|HTMLCollection|HTMLSelectElement|NamedNodeMap|NodeList} list
 * @param {function} predicate
 * @returns {boolean}
 */
export function every(list, predicate) {
    for (const item of iterate(list)) {
        if (!predicate(item)) {
            return false
        }
    }
    return true
}

/**
 * @param {Array|DOMTokenList|HTMLCollection|HTMLSelectElement|NamedNodeMap|NodeList} list
 * @param {function} predicate
 * @returns {*[]}
 */
export function filter(list, predicate) {
    if (Array.isArray(list)) {
        return list.filter(predicate)
    }
    const filtered = []
    for (const item of iterate(list)) {
        if (predicate(item)) {
            filtered.push(item)
        }
    }
    return filtered
}

/**
 * @param {Array|DOMTokenList|HTMLCollection|HTMLSelectElement|NamedNodeMap|NodeList} list
 * @yields {*}
 */
export function* iterate(list) {
    if (Array.isArray(list)) {
        return yield* list
    }
    for (let index = 0; index < list.length; index++) {
        yield list.item(index)
    }
}

/**
 * @param {Array|DOMTokenList|HTMLCollection|HTMLSelectElement|NamedNodeMap|NodeList} list
 * @param {function} predicate
 * @returns {boolean}
 */
export function some(list, predicate) {
    for (const item of iterate(list)) {
        if (predicate(item)) {
            return true
        }
    }
    return false
}
