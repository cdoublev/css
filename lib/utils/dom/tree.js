
import { DOCUMENT_NODE_TYPE } from './constants.js'
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
 * @param {DocumentImpl|ShadowRootImpl|ElementImpl} tree
 * @param {object} [context]
 * @param {boolean} [inclusive]
 * @yields {ElementImpl}
 */
export function* traverse(tree, context = {}, inclusive = context.scopes?.inclusive) {
    const { includeSubtrees, scopes } = context
    if (scopes?.limits?.includes(tree)) {
        return
    }
    if (inclusive) {
        yield tree
    } else if (tree.nodeType === DOCUMENT_NODE_TYPE) {
        tree = tree.documentElement
        if (!tree) {
            return
        }
        yield tree
    } else if (tree.nodeType === DOCUMENT_FRAGMENT_NODE_TYPE && tree.host) {
        yield tree.host
    }
    const { children, shadowRoot } = tree
    if (shadowRoot && includeSubtrees) {
        for (const child of iterate(shadowRoot.children)) {
            yield* traverse(child, {}, true)
        }
    }
    for (const child of iterate(children)) {
        yield* traverse(child, context, true)
    }
}
