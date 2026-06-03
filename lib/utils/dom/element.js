
import { iterate } from './collection.js'
import { serializeComponentValue } from '../../serialize.js'
import { traverse } from './tree.js'

/**
 * @param {ElementImpl} element
 * @param {boolean} first
 * @yields {ElementImpl}
 */
export function* ancestors(element, first) {
    let parentElement = getParent(element)
    while (parentElement) {
        yield parentElement
        if (first || parentElement.shadowRoot) {
            return
        }
        parentElement = getParent(parentElement)
    }
}

/**
 * @param {Element} element
 * @param {function} accept
 * @param {function} [reject]
 * @returns {Element|undefined}
 */
export function findAncestor({ parentElement, parentNode }, accept, reject) {
    while (parentElement) {
        if (accept(parentElement)) {
            return parentElement
        }
        if (reject?.(parentElement)) {
            return
        }
        ({ parentElement, parentNode } = parentElement)
    }
    if (parentNode) {
        const { host } = parentNode
        if (host && accept(host)) {
            return host
        }
    }
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {number}
 */
export function findFirstSiblingIndex(element, predicate) {
    const parent = getParent(element)
    if (!parent) {
        return predicate(element) ? 0 : -1
    }
    let index = -1
    for (const child of iterate(parent.children)) {
        if (predicate(child)) {
            index++
            if (child === element) {
                return index
            }
        }
    }
    return -1
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {number}
 */
export function findLastSiblingIndex(element, predicate) {
    const parent = getParent(element)
    if (!parent) {
        return predicate(element) ? 0 : -1
    }
    const { children } = parent
    const end = -1
    let index = -1
    for (let start = children.length - 1; end < start; start--) {
        const child = children.item(start)
        if (predicate(child)) {
            index++
            if (child === element) {
                return index
            }
        }
    }
    return -1
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {ElementImpl|undefined}
 */
export function findNextSibling({ nextElementSibling }, predicate) {
    while (nextElementSibling) {
        if (predicate(nextElementSibling)) {
            return nextElementSibling
        }
        nextElementSibling = nextElementSibling.nextElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @param {function} predicate
 * @returns {ElementImpl|undefined}
 */
export function findPreviousSibling({ previousElementSibling }, predicate) {
    while (previousElementSibling) {
        if (predicate(previousElementSibling)) {
            return previousElementSibling
        }
        previousElementSibling = previousElementSibling.previousElementSibling
    }
}

/**
 * @param {Element} element
 * @returns {Element|undefined}
 */
export function getParent({ parentElement, parentNode }) {
    return parentElement ?? parentNode?.host
}

/**
 * @param {ElementImpl} element
 * @param  {...string} types
 * @returns {boolean}
 */
export function isOfType({ namespaceURI, localName }, ...types) {
    return namespaceURI && types.includes(localName)
}

/**
 * @param {ElementImpl} element
 * @param {object} combinator
 * @yields {ElementImpl}
 */
export function* leftCombined(element, combinator) {
    switch (serializeComponentValue(combinator)) {
        case '>':
            return yield* ancestors(element, true)
        case '+':
            if (element.previousElementSibling) {
                yield element.previousElementSibling
            }
            return
        case '~':
            return yield* previousSiblings(element)
        case '||':
            return
        default:
            return yield* ancestors(element)
    }
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
export function* nextSiblings({ nextElementSibling }) {
    while (nextElementSibling) {
        yield nextElementSibling
        nextElementSibling = nextElementSibling.nextElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
export function* previousSiblings({ previousElementSibling }) {
    while (previousElementSibling) {
        yield previousElementSibling
        previousElementSibling = previousElementSibling.previousElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @param {object} combinator
 * @yields {ElementImpl}
 */
export function* rightCombined(element, combinator) {
    switch (serializeComponentValue(combinator)) {
        case '>':
            return yield* iterate(element.children)
        case '+':
            if (element.nextElementSibling) {
                yield element.nextElementSibling
            }
            return
        case '~':
            return yield* nextSiblings(element)
        case '||':
            return
        default:
            return yield* traverse(element)
    }
}
