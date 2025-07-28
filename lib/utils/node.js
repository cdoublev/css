
const { isCombination, isCompound, isMultiplied } = require('./definition.js')

const type = Symbol('node')

/**
 * @param {object} node
 * @returns {boolean}
 */
function isBranch({ definition }) {
    return definition.type === 'non-terminal'
        || isCombination(definition)
        || isMultiplied(definition)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isLeaf({ definition }) {
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
function isNode(node) {
    return node?.type === type
}

module.exports = {
    isBranch,
    isLeaf,
    isNode,
    type,
}
