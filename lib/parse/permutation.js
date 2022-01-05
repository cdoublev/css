
/**
 * @param {number} n
 * @returns {number}
 */
function factorial(n) {
    return 0 < n ? n * factorial(n - 1) : 1
}

/**
 * @param {number} n
 * @param {number} [k]
 * @returns {number}
 */
function getPermutationsLength(n, k = n) {
    let total = n
    while (--k) {
        total *= --n
    }
    return total
}

/**
 * @param {number} n
 * @returns {number}
 */
function getAllPermutationsLength(n) {
    const k = n
    let total = factorial(n)
    while (--n) {
        total += getPermutationsLength(k, n)
    }
    return total
}

/**
 * @param {number} nth
 * @param {number} n
 * @return {number[]}
 */
function getFactoradicRepresentation(nth, n) {
    const representation = [0]
    let k = 1
    while (k++ < n) {
        representation.push(nth % k)
        nth = Math.floor(nth / k)
    }
    return representation
}

/**
 * @param {object[]} nodes
 * @param {number} nth
 * @returns {object[]}
 */
function getNthPermutation(nodes, nth) {
    const { length: n } = nodes
    let k = n
    let skip = factorial(n)
    while (skip <= nth) {
        nth -= skip
        skip = getPermutationsLength(n, --k)
    }
    const offset = n - k
    const representation = getFactoradicRepresentation(nth * factorial(offset), n)
    const permutation = []
    nodes = [...nodes]
    for (let i = n - 1; offset <= i; i--) {
        permutation.push(...nodes.splice(representation[i], 1))
    }
    return permutation
}

/**
 * @param {object[]} nodes
 * @param {object[]} permutation
 * @returns {number}
 */
function getPermutationIndex(nodes, permutation) {
    const representation = []
    const { length } = nodes
    const { length: k } = permutation
    nodes = [...nodes]
    for (const value of permutation) {
        const index = nodes.indexOf(value)
        representation.push(index)
        nodes.splice(index, 1)
    }
    representation.push(...nodes.keys())
    const decimal = representation.reverse().reduce((nth, value, index) => nth += value * factorial(index))
    let index = Math.floor(decimal / factorial(length - k))
    let n = length
    while (k < n) {
        index += getPermutationsLength(length, n--)
    }
    return index
}

/**
 * @param {number[][]} excluded
 * @param {number[]} permutation
 * @returns {boolean}
 *
 * It returns wether `permutation` starts with the same type positions than one
 * of the `excluded` position patterns.
 */
function isExcludedPermutation(excluded, permutation) {
    return excluded.some(positions =>
        positions.length <= permutation.length
        && positions.every((position, index) => position === permutation[index]))
}

/**
 * @param {object[]} nodes
 * @param {object[]} permutation
 * @returns {boolean}
 */
function isFirstOrLastPermutation(nodes, permutation) {
    const index = getPermutationIndex(nodes, permutation)
    if (index === 0) {
        return true
    }
    const { length: n } = nodes
    return (index + 1) === getPermutationsLength(n)
}

/**
 * @param {number[][]} excluded
 * @param {number[]} representation
 *
 * It adds the given `representation` to the `excluded` representation patterns
 * if it is not already excluded by an already existing (shorter) pattern.
 */
function addExcludedTypesRepresentation(excluded, representation) {
    if (isExcludedPermutation(excluded, representation)) {
        return
    }
    excluded.push(representation)
}

/**
 * @param {object[]} permutation
 * @param {object[]} values
 * @param {number[][]} excluded
 */
function setExcludedTypes(permutation, values, excluded) {
    const { length: kv } = values.filter(({ position }) => permutation.some(type => type.position === position))
    const types = permutation.slice(kv)
    const { length: kt } = types
    for (let offset = 0; offset < (kt - 1); ++offset) {
        const subsetPermutation = types.slice(offset)
        const subset = [...subsetPermutation].sort(({ position: a }, { position: b }) => a - b)
        if (kv === 0 || isFirstOrLastPermutation(subset, subsetPermutation)) {
            const representation = permutation.slice(0, kv + offset + 1).map(({ position }) => position)
            addExcludedTypesRepresentation(excluded, representation)
            return
        }
    }
}

/**
 * @param {object[]} nodes
 * @param {object[]} permutation
 * @param {object[]} values
 * @param {number[][]} excluded
 * @param {boolean} [full]
 * @return {object[]|void}
 */
function getNextPermutation(nodes, permutation, values, excluded, full = false) {
    setExcludedTypes(permutation, values, excluded)
    const current = getPermutationIndex(nodes, permutation)
    const { length: n } = nodes
    const last = full ? factorial(n) : getAllPermutationsLength(n)
    let next = current + 1
    if (next === last) {
        return
    }
    permutation = getNthPermutation(nodes, next)
    while (isExcludedPermutation(excluded, permutation.map(({ position }) => position))) {
        if (++next === last) {
            return
        }
        permutation = getNthPermutation(nodes, next)
    }
    return permutation
}

module.exports = {
    getNextPermutation, // Main
    getNthPermutation,
    getPermutationIndex,
    isExcludedPermutation,
}
