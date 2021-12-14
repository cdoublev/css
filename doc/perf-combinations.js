
const { deepStrictEqual } = require('assert')
const expected = require('./perf-combinations-expected.js')
const expectedHeap = require('./perf-combinations-expected-heap.js')

const inputS = ['a', 'b', 'c']
const inputM = ['a', 'b', 'c', 'd']
const inputL = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
const inputXL = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'/* heap or call stack size exceeded if more*/]

function measure() {
    let i = 2
    while (i--) {
        [
            // [Implementation, compatible = false]
            [heapNonRecursive, 1], //  1.5,  1.4,  1.5
            [heap, 1],             //  6.5,  6.1,  7.0
            [lex1, 2],             //  2.1,  2.1,  2.3
            [lex2, 2],             //  1.5,  1.5,  1.7
            [lex2Gen, 2],          //  7.7,  8.8,  7.0
            [lex3, 2],             // 10.3,  7.4,  7.1
            [lex3Gen, 2],          // 12.2, 12.1, 19.2
            [lex4, 2],             //  8.1,  8.3,  8.3
            [lex5, 2],             // 12.8, 12.8, 13.4
            [lex5Gen, 2],          // 18.7, 18.5, 19.8
        ]
        .forEach(([fn, compatible]) => {
            // First implementation suffers from cold code while the others are not
            const warm = i === 0
            if (warm) console.time(fn.name)
            const actual = fn(inputL)
            if (warm) console.timeEnd(fn.name)
            switch (compatible) {
                case 1:
                    deepStrictEqual(actual, expectedHeap)
                    break
                case 2:
                    deepStrictEqual(actual, expected)
                    break
            }
        })
    }
}
measure()


/**
 * Permutation
 * http://combos.org/perm
 */

// https://en.wikipedia.org/wiki/Heap%27s_algorithm
function heap(nodes) {
    function permute(nodes, l) {
        if (l === 1) {
            result.push([...nodes])
        } else {
            permute(nodes, l - 1)
            for (let i = 0; i < l - 1; i++) {
                const j = l % 2 ? 0 : i
                const k = l - 1
                const tmp = nodes[k]
                nodes[k] = nodes[j]
                nodes[j] = tmp
                permute(nodes, l - 1)
            }
        }
    }
    const result = []
    permute([...nodes], nodes.length)
    return result
}
function heapNonRecursive(nodes) {
    const { length } = nodes
    function permute(nodes) {
        const c = nodes.map((_, i) => i)
        for (let i = 0; i < length; i++) {
            c[i] = 0
        }
        result.push([...nodes])
        let i = 0
        while (i < length) {
            if (c[i] < i) {
                const j = i % 2 ? c[i] : 0
                const tmp = nodes[i]
                nodes[i] = nodes[j]
                nodes[j] = tmp
                result.push([...nodes])
                ++c[i]
                i = 0
            } else {
                c[i] = 0
                ++i
            }
        }
    }
    const result = []
    permute([...nodes], nodes.length)
    return result
}
// https://en.wikipedia.org/wiki/Permutation#Generation_in_lexicographic_order
function lex1(nodes) {
    const { length } = nodes
    let permutation = [...nodes]
    const result = [[...permutation]]
    while (true) {
        let i = length - 2
        for (; i >= 0 && nodes.indexOf(permutation[i]) > nodes.indexOf(permutation[i + 1]); --i);
        if (i < 0) {
            return result
        }
        let j = length - 1
        for (; nodes.indexOf(permutation[j]) < nodes.indexOf(permutation[i]); --j);
        swap(permutation, i, j)
        j = length
        while (++i < j) {
            swap(permutation, i, --j)
        }
        result.push([...permutation])
    }
}
function swap(permutation, left, right) {
    const tmp = permutation[left]
    permutation[left] = permutation[right]
    permutation[right] = tmp
}
// https://gist.github.com/OrKoN/d1034ccb0994f4653d09640e58fe45d8
function permute(source, order) {
    const { length } = source
    const permutation = [...source]
    let k = length - 2
    for (; order.get(permutation[k]) >= order.get(permutation[k + 1]); k--);
    if (k < 0) {
        return
    }
    let l = length - 1
    for (; order.get(permutation[k]) >= order.get(permutation[l]); l--);
    if (l < 0) {
        return
    }
    swap(permutation, l, k)
    const start = k + 1
    const end = length - 1
    const middle = start + (end - start) / 2
    for (let i = start; i < middle; i++) {
        swap(permutation, i, end - (i - start))
    }
    return permutation
}
function lex2(nodes) {
    const order = nodes.reduce((map, node, index) => map.set(node, index), new Map)
    const permutations = []
    let permutation = nodes
    while (permutation) {
        permutations.push(permutation)
        permutation = permute(permutation, order)
    }
    return permutations
}
function lex2Gen(nodes) {
    function* createPermutationIterator(nodes) {
        let permutation = nodes
        while (permutation) {
            yield permutation
            permutation = permute(permutation, order)
        }
    }
    // Boilerplate
    const order = nodes.reduce((map, node, index) => map.set(node, index), new Map)
    const iter = createPermutationIterator(nodes, order)
    const result = []
    let next = iter.next()
    while (!next.done) {
        result.push(next.value)
        next = iter.next()
    }
    return result
}
// https://stackoverflow.com/a/32551801/7947839
// https://github.com/acarl005/generatorics/blob/a11d286241ac173ad2d323554e3b8b3f97fda2b7/generatorics.js#L131
function lex3(nodes, size = nodes.length) {
    const { length } = nodes
    const result = []
    const used = []
    const data = []
    function permute(p) {
        if (p === size) {
            result.push([...data])
        } else {
            for (let i = 0; i < length; ++i) {
                if (!used[i]) {
                    used[i] = true
                    data[p] = nodes[i]
                    permute(p + 1)
                    used[i] = false
                }
            }
        }
    }
    permute(0)
    return result
}
function lex3Gen(nodes) {
    const { length } = nodes
    const used = []
    const data = []
    function* permute(p) {
        if (p === length) {
            return yield [...data]
        } else {
            for (let i = 0; i < length; ++i) {
                if (!used[i]) {
                    used[i] = true
                    data[p] = nodes[i]
                    yield* permute(p + 1)
                    used[i] = false
                }
            }
        }
    }
    // Boilerplate
    const result = []
    const iter = permute(0)
    let next = iter.next()
    while (!next.done) {
        result.push(next.value)
        next = iter.next()
    }
    return result
}
// https://www.geeksforgeeks.org/lexicographic-permutations-of-string/
// https://stackoverflow.com/a/29928986/7947839
function lex4(nodes) {
    const { length } = nodes
    const result = [[...nodes]]
    let permutation = [...nodes]
    while (true) {
        let i = length - 2
        for (; i >= 0 && nodes.indexOf(permutation[i]) >= nodes.indexOf(permutation[i + 1]); --i);
        if (i > -1) {
            let j = i + 1
            let k = j
            for(; k < length && permutation[k]; ++k) {
                if (permutation[k] > permutation[i] && permutation[k] < permutation[j]) {
                    j = k
                }
            }
            const tmp = permutation[i]
            permutation[i] = permutation[j]
            permutation[j] = tmp
            permutation = [...permutation.slice(0, i), permutation[i], ...permutation.slice(i + 1).sort()]
            result.push([...permutation])
            continue
        }
        return result
    }
}
/**
 * @param {number} n
 * @param {number} k
 * @returns {number}
 * @link https://en.wikipedia.org/wiki/Permutation
 *
 * `P(n, k)`
 */
function permutation(n, k) {
    if (k === 0) {
        return 1
    }
    if (n < k) {
        return 0
    }
    let p = 1
    while (k--) {
        p *= n--
    }
    return p
}
/**
 * @param {number} n
 * @returns {number}
 * @link https://en.wikipedia.org/wiki/Factorial
 *
 * `n!` === `P(n, n)`.
 *
 */
function factorial(n) {
    return permutation(n, n)
}
/**
 * @param {number} n
 * @param {number} l number of digits
 * @link https://en.wikipedia.org/wiki/Factorial_number_system
 *
 * It returns the factoradic representation of `n` in least significant order.
 */
function factoradic(n, l = 0) {
    if (n < 0) {
        return
    }
    let bn = n
    let bf = 1
    if (!l) {
        for (l = 1; bf < bn; bf *= ++l);
        if (bn < bf) {
            bf /= l--
        }
    } else {
        bf = factorial(l)
    }
    const digits = [0]
    for (; l; bf /= l--) {
        digits[l] = Math.floor(Number(bn / bf))
        bn %= bf
    }
    return digits
}
// https://levelup.gitconnected.com/efficient-permutations-in-lexicographic-order-8e004f94b4b8
// https://github.com/dankogai/js-combinatorics/blob/main/combinatorics.js
function lex5(nodes, size = nodes.length) {
    const seed = [...nodes]
    const length = permutation(seed.length, size)
    const results = []
    for (let i = 0; i < length; i++) {
        const offset = seed.length - size
        const skip = factorial(offset)
        let digits = factoradic(i * skip, seed.length)
        let source = seed.slice();
        let result = []
        for (let i = seed.length - 1; offset <= i; i--) {
            result.push(source.splice(digits[i], 1)[0])
        }
        results.push(result)
    }
    return results
}
function lex5Gen(nodes) {
    function* createPermutationIterator(nodes, size = nodes.length) {
        const seed = [...nodes]
        const length = permutation(seed.length, size)
        for (let i = 0; i < length; i++) {
            const offset = seed.length - size
            const skip = factorial(offset)
            const digits = factoradic(i * skip, seed.length)
            const source = [...seed]
            const result = []
            for (let i = seed.length - 1; offset <= i; i--) {
                result.push(source.splice(digits[i], 1)[0])
            }
            yield result
        }
    }
    // Boilerplate
    const result = []
    const iter = createPermutationIterator(nodes)
    let next = iter.next()
    while (!next.done) {
        result.push(next.value)
        next = iter.next()
    }
    return result
}

/**
 * Implementation(s) of a generator function yielding combination in lexical
 * order, with the ability to specify the combination length.
 */
function* createCombinationIterator1(nodes, every = true) {
    let { length: size } = nodes
    while (true) {
        // [START] lex3Gen
        const { length } = nodes
        const used = []
        const data = []
        function* permute(p) {
            if (p === size) {
                return yield [...data]
            }
            for (let i = 0; i < length; ++i) {
                if (!used[i]) {
                    used[i] = true
                    data[p] = nodes[i]
                    yield* permute(p + 1)
                    used[i] = false
                }
            }
        }
        yield* permute(0)
        // [END] lex3Gen
        if (every || --size === 0) {
            return
        }
    }
}
function* createCombinationIterator2(nodes, every = true) {
    let { length: size } = nodes
    while (true) {
        // [START] lex5Gen
        const seed = [...nodes]
        const length = permutation(seed.length, size)
        for (let i = 0; i < length; i++) {
            const offset = seed.length - size
            const skip = factorial(offset)
            const digits = factoradic(i * skip, seed.length)
            const source = [...seed]
            const result = []
            for (let i = seed.length - 1; offset <= i; i--) {
                result.push(source.splice(digits[i], 1)[0])
            }
            yield result
        }
        // [END] lex5Gen
        if (every || --size === 0) {
            return
        }
    }
}
// const iter = createCombinationIterator2(inputS, false)
// const iter = createCombinationIterator2(inputXL, false)
// const result = []
// let next = iter.next()
// while (!next.done) {
//     result.push(next.value)
//     next = iter.next()
// }
// console.log(result)
// console.log(result.some(p => p.join(' ') === 'a b d e c'))

/**
 * Implementation(s) of a function returning the specified nth combination in
 * lexical order, with the ability to specify the specified combination length.
 */
function getCombination(nodes, nth = 0, size = nodes.length) {
    const { length } = nodes
    const offset = length - size
    const skip = factorial(offset)
    const digits = factoradic(nth * skip, length)
    const source = [...nodes]
    const result = []
    for (let i = length - 1; offset <= i; i--) {
        result.push(source.splice(digits[i], 1)[0])
    }
    return result
}

/**
 * 0. a || b || c
 * 1. a || c || b
 * 2. b || a || c
 * 3. b || c || a
 * 4. c || a || b
 * 5. c || b || a
 * 6. a || b
 * 7. a || c
 * 8. b || a
 * 9. b || c
 * 10. c || a
 * 11. c || b
 * 12. a
 * 13. b
 * 14. c
 */

/**
  a b c d e
  a b c e d
  ...
  a e d c b
  ...
  b a c d
  ...
  a b c
  ...
  a b
  a c
  a d
  ...
  a
  b
  c
  d
 */
