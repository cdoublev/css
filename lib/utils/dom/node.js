
import { DOCUMENT_FRAGMENT_NODE_TYPE, DOCUMENT_NODE_TYPE, ELEMENT_NODE_TYPE, HTML_NAMESPACE, SVG_NAMESPACE } from './constants.js'
import { iterate } from './collection.js'
import { serializeComponentValue } from '../../serialize.js'

/**
 * @param {DocumentImpl} document
 * @returns {boolean}
 * @see {@link https://dom.spec.whatwg.org/#html-document}
 */
export function isHTMLDocument(document) {
    return document.contentType === 'text/html'
}

/**
 * @param {Element} element
 * @param  {...string} types
 * @returns {boolean}
 * @see {@link https://html.spec.whatwg.org/multipage/infrastructure.html#html-elements}
 */
export function isHTMLElement(element, ...types) {
    return element.namespaceURI === HTML_NAMESPACE
        && (types.includes(element.localName) || types.length === 0)
}

/**
 * @param {NodeImpl} node
 * @returns {boolean}
 */
export function isShadowRoot(node) {
    return node.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE && node.host
}

/**
 * @param {Element} element
 * @param  {...string} types
 * @returns {boolean}
 */
export function isSVGElement(element, ...types) {
    return element.namespaceURI === SVG_NAMESPACE
        && (types.includes(element.localName) || types.length === 0)
}

/**
 * @param {DocumentImpl} document
 * @returns {boolean}
 * @see {@link https://dom.spec.whatwg.org/#xml-document}
 */
export function isXMLDocument(document) {
    return !isHTMLDocument(document)
}


/**
 * @param {Element} element
 * @returns {Element|undefined}
 */
export function getParentElement(element) {
    return element.parentElement ?? element.parentNode?.host
}


/**
 * @param {Element} element
 * @param {function} accept
 * @param {function} [reject]
 * @returns {Element|undefined}
 */
export function findAncestorElement({ parentElement, parentNode }, accept, reject) {
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
export function findFirstSiblingElementIndex(element, predicate) {
    if (!element.parentNode) {
        return predicate(element) ? 0 : -1
    }
    let index = -1
    for (const child of iterate(element.parentNode.children)) {
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
export function findLastSiblingElementIndex(element, predicate) {
    const { parentNode } = element
    if (!parentNode) {
        return predicate(element) ? 0 : -1
    }
    const { children } = parentNode
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
export function findNextSiblingElement({ nextElementSibling }, predicate) {
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
export function findPreviousSiblingElement({ previousElementSibling }, predicate) {
    while (previousElementSibling) {
        if (predicate(previousElementSibling)) {
            return previousElementSibling
        }
        previousElementSibling = previousElementSibling.previousElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @param {boolean} first
 * @yields {ElementImpl}
 */
export function* ancestorElements(element, first) {
    let parentElement = getParentElement(element)
    while (parentElement) {
        yield parentElement
        if (first || parentElement.shadowRoot) {
            return
        }
        parentElement = getParentElement(parentElement)
    }
}

/**
 * @param {ElementImpl} element
 * @param {object} combinator
 * @yields {ElementImpl}
 */
export function* leftCombinedElements(element, combinator) {
    switch (serializeComponentValue(combinator)) {
        case '>':
            return yield* ancestorElements(element, true)
        case '+':
            if (element.previousElementSibling) {
                yield element.previousElementSibling
            }
            return
        case '~':
            return yield* previousSiblingElements(element)
        case '||':
            return
        default:
            return yield* ancestorElements(element)
    }
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
export function* nextSiblingElements({ nextElementSibling }) {
    while (nextElementSibling) {
        yield nextElementSibling
        nextElementSibling = nextElementSibling.nextElementSibling
    }
}

/**
 * @param {ElementImpl} element
 * @yields {ElementImpl}
 */
export function* previousSiblingElements({ previousElementSibling }) {
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
export function* rightCombinedElements(element, combinator) {
    switch (serializeComponentValue(combinator)) {
        case '>':
            return yield* iterate(element.children)
        case '+':
            if (element.nextElementSibling) {
                yield element.nextElementSibling
            }
            return
        case '~':
            return yield* nextSiblingElements(element)
        case '||':
            return
        default:
            return yield* traverse(element)
    }
}

/**
 * @param {DocumentImpl|ShadowRootImpl|ElementImpl} tree
 * @param {object} [options]
 * @yields {ElementImpl}
 */
export function* traverse(tree, { includeSubtrees, inclusive, limits, nodeTypes = [ELEMENT_NODE_TYPE] } = {}) {
    if (limits?.includes(tree)) {
        return
    }
    if (inclusive) {
        yield isShadowRoot(tree) ? tree.host : tree
    } else if (tree.nodeType === DOCUMENT_NODE_TYPE) {
        tree = tree.documentElement
        if (!tree) {
            return
        }
        yield tree
    }
    const { childNodes, shadowRoot } = tree
    const options = { includeSubtrees, inclusive: true, limits, nodeTypes }
    if (shadowRoot && includeSubtrees) {
        for (const child of iterate(shadowRoot.childNodes)) {
            yield* traverse(child, options)
        }
    }
    for (const child of iterate(childNodes)) {
        if (nodeTypes.includes(child.nodeType)) {
            yield* traverse(child, options)
        }
    }
}
