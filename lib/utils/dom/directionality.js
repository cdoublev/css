
import { ELEMENT_NODE_TYPE, TEXT_NODE_TYPE } from './constants.js'
import { getParent, isOfType } from './element.js'
import { isShadowRoot, traverse } from './tree.js'
import LTR from '../../values/ltr.js'
import RTL from '../../values/rtl.js'

const textInputTypes = ['button', 'email', 'hidden', 'password', 'reset', 'search', 'submit', 'tel', 'text', 'url']

/**
 * @param {ElementImpl} element
 * @param {boolean} [canExcludeRoot]
 * @returns {string|undefined}
 * @see {@link https://html.spec.whatwg.org/multipage/dom.html#contained-text-auto-directionality}
 */
function findContainedTextAutoDirectionality(element, canExcludeRoot) {
    if (canExcludeRoot && (element.dir || isOfType(element, 'bdi', 'script', 'style', 'textarea'))) {
        return
    }
    for (const child of traverse(element, { nodeTypes: [ELEMENT_NODE_TYPE, TEXT_NODE_TYPE] })) {
        if (child.nodeType === ELEMENT_NODE_TYPE) {
            if (child.dir || isOfType(child, 'bdi', 'script', 'style', 'textarea')) {
                return
            }
            if (isOfType(child, 'slot')) {
                const root = child.getRootNode({})
                if (isShadowRoot(root)) {
                    return getDirectionality(root.host)
                }
            }
        } else if (child.nodeType === TEXT_NODE_TYPE) {
            const direction = findTextNodeDirectionality(child)
            if (direction) {
                return direction
            }
        }
    }
}

/**
 * @param {string} text
 * @returns {string|undefined}
 */
function findStringDirectionality(string) {
    for (const char of string) {
        const codePoint = char.codePointAt(0)
        if (RTL.find(([from, to = from]) => from <= codePoint && codePoint <= to)) {
            return 'rtl'
        }
        if (LTR.find(([from, to = from]) => from <= codePoint && codePoint <= to)) {
            return 'ltr'
        }
    }
}

/**
 * @param {TextImpl} text
 * @returns {string|undefined}
 * @see {@link https://html.spec.whatwg.org/multipage/dom.html#text-node-directionality}
 */
function findTextNodeDirectionality(text) {
    return findStringDirectionality(text.data)
}

/**
 * @param {ElementImpl} element
 * @returns {string|null}
 * @see {@link https://html.spec.whatwg.org/multipage/dom.html#auto-directionality-form-associated-elements}
 */
function getAutoDirectionality(element) {
    if (isOfType(element, 'textarea') || (isOfType(element, 'input') && textInputTypes.includes(element.type))) {
        if (element.value.length === 0) {
            return null
        }
        return findStringDirectionality(element.value) ?? 'ltr'
    }
    if (isOfType(element, 'slot') && isShadowRoot(element.getRootNode({}))) {
        const nodes = element.assignedNodes({})
        if (0 < nodes.length) {
            for (const node of nodes) {
                const direction = node.nodeType === TEXT_NODE_TYPE
                    ? findTextNodeDirectionality(node)
                    : findContainedTextAutoDirectionality(node, true)
                if (direction) {
                    return direction
                }
            }
            return null
        }
    }
    return findContainedTextAutoDirectionality(element) ?? null
}

/**
 * @param {ElementImpl} element
 * @returns {string}
 * @see {@link https://html.spec.whatwg.org/multipage/dom.html#the-directionality}
 */
export default function getDirectionality(element) {
    switch (element.dir) {
        case 'ltr':
        case 'rtl':
            return element.dir
        case 'auto':
            return getAutoDirectionality(element) ?? 'ltr'
        default: {
            if (isOfType(element, 'bdi')) {
                return getAutoDirectionality(element) ?? 'ltr'
            }
            if (isOfType(element, 'input') && element.type === 'tel') {
                return 'ltr'
            }
            const parent = getParent(element)
            return parent ? getDirectionality(parent) : 'ltr'
        }
    }
}
