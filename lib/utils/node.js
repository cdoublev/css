
import { isCombination, isCompound, isMultiplied } from './definition.js'

export const type = Symbol('node')

/**
 * @param {object} node
 * @returns {boolean}
 */
export function isBranch({ definition }) {
    return definition.type === 'non-terminal'
        || isCombination(definition)
        || isMultiplied(definition)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
export function isLeaf({ definition }) {
    const { type } = definition
    return type === 'arbitrary'
        || type === 'forgiving'
        || type === 'token'
        || isCompound(definition)
}

/**
 * @param {object} [node]
 * @returns {boolean}
 */
export function isNode(node) {
    return node?.type === type
}
