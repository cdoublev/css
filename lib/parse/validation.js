
const { combinators } = require('./definition.js')

/**
 * @param {object} node
 * @returns {boolean}
 */
function isBranch(node) {
    const { type } = node
    return type === 'non-terminal' || type === 'property' || isCombination(node) || isMultiplied(node)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isCombination({ type }) {
    return combinators.includes(type)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isCompound({ type }) {
    return type === 'block' || type === 'function' || type === 'simple-block'
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isLeaf(node) {
    const { type } = node
    return type === 'delimiter' || type === 'structure' || type === 'terminal' || isCompound(node)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isMultiplied({ type }) {
    return type === 'optional' || type === 'required' || type === 'repeat'
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isSequence({ type }) {
    return type === ' ' || type === '&&' || type === '||' || type === 'repeat'
}

module.exports = {
    isBranch,
    isCombination,
    isCompound,
    isLeaf,
    isMultiplied,
    isSequence,
}
