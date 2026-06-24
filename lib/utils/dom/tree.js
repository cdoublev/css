
import { DOCUMENT_FRAGMENT_NODE_TYPE, DOCUMENT_NODE_TYPE, ELEMENT_NODE_TYPE } from './constants.js'
import { iterate } from './collection.js'

/**
 * @param {DocumentImpl} document
 * @returns {boolean}
 * @see {@link https://dom.spec.whatwg.org/#html-document}
 */
export function isHTMLDocument(document) {
    return document.contentType === 'text/html'
}

/**
 * @param {NodeImpl} node
 * @returns {boolean}
 */
export function isShadowRoot(node) {
    return node.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE && node.host
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
