
const sequences = ['||', '&&', ' ']
const combinators = ['|', ...sequences]
const compounds = ['block', 'function', 'rule']

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isBranch(definition) {
    const { type } = definition
    return type === 'declaration'
        || type === 'non-terminal'
        || isCombination(definition)
        || isMultiplied(definition)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isCSSType({ name, type }) {
    // type = arbitrary | descriptor | forgiving | non-terminal | property | rule
    return name && type !== 'function' && type !== 'token'
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
    return compounds.includes(type)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isLeaf(definition) {
    const { type } = definition
    return type === 'arbitrary'
        || type === 'forgiving'
        || type === 'token'
        || isCompound(definition)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isMultiplied({ type }) {
    return type === 'optional' || type === 'required' || type === 'repetition'
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
function isSequence({ type }) {
    return sequences.includes(type) || type === 'repetition'
}

module.exports = {
    combinators,
    isBranch,
    isCSSType,
    isCombination,
    isCompound,
    isLeaf,
    isMultiplied,
    isSequence,
}
