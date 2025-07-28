
const type = Symbol('node')
const sequences = ['||', '&&', ' ']
const combinators = ['|', ...sequences]
const compounds = ['block', 'declaration', 'function', 'rule']
const types = ['arbitrary', 'forgiving', 'non-terminal', 'rule']

/**
 * @param {object} node
 * @returns {boolean}
 */
function isBranch(node) {
    const { definition: { type } } = node
    return type === 'non-terminal'
        || isCombination(node)
        || isMultiplied(node)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isCSSType(node) {
    return types.includes(node.definition.type)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isCombination(node) {
    return combinators.includes(node.definition.type)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isCompound(node) {
    return compounds.includes(node.definition.type)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isLeaf(node) {
    const { definition: { type } } = node
    return type === 'arbitrary'
        || type === 'forgiving'
        || type === 'token'
        || isCompound(node)
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isMultiplied({ definition: { type } }) {
    return type === 'optional' || type === 'required' || type === 'repetition'
}

/**
 * @param {object} [node]
 * @returns {boolean}
 */
function isNode(node) {
    return node?.type === type
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isSequence({ definition: { type } }) {
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
    isNode,
    isSequence,
    type,
}
