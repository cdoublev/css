
/**
 * @param {DOMTokenList|HTMLCollection|HTMLSelectElement|NamedNodeMap|NodeList} list
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
 * @param {DOMTokenList|HTMLCollection|HTMLSelectElement|NamedNodeMap|NodeList} list
 * @yields {*}
 */
export function* iterate(list) {
    for (let index = 0; index < list.length; index++) {
        yield list.item(index)
    }
}

/**
 * @param {DOMTokenList|HTMLCollection|HTMLSelectElement|NamedNodeMap|NodeList} list
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
