
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
 * @param {Element} element
 * @returns {Element|undefined}
 */
export function getParent({ parentElement, parentNode }) {
    return parentElement ?? parentNode?.host
}
