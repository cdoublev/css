
/**
 * @param {number} n
 * @returns {number}
 */
function factorial(n) {
    return 1 < n ? n * factorial(n - 1) : 1
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
 * @returns {number[]}
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
 * @param {object[]} sequence
 * @param {number} nth
 * @returns {object[]}
 */
function getNthPermutation(sequence, nth) {
    const n = sequence.length
    let k = n
    let skip = factorial(n)
    while (skip <= nth) {
        nth -= skip
        skip = getPermutationsLength(n, --k)
    }
    const offset = n - k
    const representation = getFactoradicRepresentation(nth * factorial(offset), n)
    const permutation = []
    sequence = [...sequence]
    for (let i = n - 1; offset <= i; i--) {
        permutation.push(...sequence.splice(representation[i], 1))
    }
    return permutation
}

/**
 * @param {object[]} sequence
 * @param {object[]} permutation
 * @returns {number}
 */
function getPermutationIndex(sequence, permutation) {
    const representation = []
    const n = sequence.length
    const k = permutation.length
    sequence = [...sequence]
    permutation.forEach(value => {
        const index = sequence.indexOf(value)
        representation.push(index)
        sequence.splice(index, 1)
    })
    representation.push(...sequence.keys())
    const decimal = representation.reverse().reduce((nth, value, index) => nth += value * factorial(index))
    let index = Math.floor(decimal / factorial(n - k))
    let o = n
    while (k < o) {
        index += getPermutationsLength(n, o--)
    }
    return index
}

/**
 * @param {object[][]} excluded
 * @param {object[]} permutation
 * @returns {boolean}
 *
 * It returns the first permutation pattern to match the given permutation. For
 * example, [a] matches [a, b], [a, c, b], etc.
 */
function findExcludedPermutationPattern(excluded, permutation) {
    return excluded.find(sequence => sequence.length <= permutation.length
        && sequence.every((node, index) => node === permutation[index]))
}

/**
 * @param {object[]} sequence
 * @param {boolean} [full]
 * @param {number} [index]
 * @returns {object}
 */
function* createPermutationIterator(sequence, full, index = 0) {
    const n = sequence.length
    const lastIndex = full ? factorial(n) : getAllPermutationsLength(n)
    const excluded = []
    let permutation = 0 < index ? getNthPermutation(sequence, index) : sequence
    let valid = yield permutation
    while (true) {
        const k = permutation.length
        const l = valid + 1
        let pattern
        // Do not exclude a valid permutation
        if (valid < k) {
            pattern = permutation.slice(0, l)
            excluded.push(pattern)
            index += l < k ? getPermutationsLength(n - l, k - l) : 1
        } else {
            ++index
        }
        if (lastIndex === index) {
            return
        }
        // Find the next permutation that is not excluded
        permutation = getNthPermutation(sequence, index)
        pattern = findExcludedPermutationPattern(excluded, permutation)
        while (pattern) {
            const k = permutation.length
            const l = pattern.length
            index += l < k ? getPermutationsLength(n - l, k - l) : 1
            if (lastIndex === index) {
                return
            }
            permutation = getNthPermutation(sequence, index)
            pattern = findExcludedPermutationPattern(excluded, permutation)
        }
        valid = yield permutation
    }
}

module.exports = {
    createPermutationIterator, // Main
    getNthPermutation,
    getPermutationIndex,
}
