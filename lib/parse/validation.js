
const { combinators } = require('./definition.js')

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isBranch(definition) {
    const { type } = definition
    return type === 'non-terminal' || type === 'property' || isCombination(definition) || isMultiplied(definition)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isCombination({ type }) {
    return combinators.includes(type)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isCompound({ type }) {
    return type === 'block' || type === 'function' || type === 'simple-block'
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isLeaf(definition) {
    const { type } = definition
    return type === 'delimiter' || type === 'structure' || type === 'terminal' || isCompound(definition)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isMultiplied({ type }) {
    return type === 'optional' || type === 'required' || type === 'repeat'
}

/**
 * @param {object} definition
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
