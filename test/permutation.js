
import { createPermutationIterator, getNthPermutation, getPermutationIndex } from '../lib/parse/permutation.js'
import assert from 'node:assert'
import test from 'node:test'

const a = { type: 'keyword', value: 'a' }
const b = { type: 'keyword', value: 'b' }
const c = { type: 'keyword', value: 'c' }
const d = { type: 'keyword', value: 'd' }
const set = [a, b, c, d]
const permutations = [
    ['[a, b, c, d]', [a, b, c, d]],
    ['[a, b, d, c]', [a, b, d, c]],
    ['[a, c, b, d]', [a, c, b, d]],
    ['[a, c, d, b]', [a, c, d, b]],
    ['[a, d, b, c]', [a, d, b, c]],
    ['[a, d, c, b]', [a, d, c, b]],
    ['[b, a, c, d]', [b, a, c, d]],
    ['[b, a, d, c]', [b, a, d, c]],
    ['[b, c, a, d]', [b, c, a, d]],
    ['[b, c, d, a]', [b, c, d, a]],
    ['[b, d, a, c]', [b, d, a, c]],
    ['[b, d, c, a]', [b, d, c, a]],
    ['[c, a, b, d]', [c, a, b, d]],
    ['[c, a, d, b]', [c, a, d, b]],
    ['[c, b, a, d]', [c, b, a, d]],
    ['[c, b, d, a]', [c, b, d, a]],
    ['[c, d, a, b]', [c, d, a, b]],
    ['[c, d, b, a]', [c, d, b, a]],
    ['[d, a, b, c]', [d, a, b, c]],
    ['[d, a, c, b]', [d, a, c, b]],
    ['[d, b, a, c]', [d, b, a, c]],
    ['[d, b, c, a]', [d, b, c, a]],
    ['[d, c, a, b]', [d, c, a, b]],
    ['[d, c, b, a]', [d, c, b, a]],
    ['[a, b, c]', [a, b, c]],
    ['[a, b, d]', [a, b, d]],
    ['[a, c, b]', [a, c, b]],
    ['[a, c, d]', [a, c, d]],
    ['[a, d, b]', [a, d, b]],
    ['[a, d, c]', [a, d, c]],
    ['[b, a, c]', [b, a, c]],
    ['[b, a, d]', [b, a, d]],
    ['[b, c, a]', [b, c, a]],
    ['[b, c, d]', [b, c, d]],
    ['[b, d, a]', [b, d, a]],
    ['[b, d, c]', [b, d, c]],
    ['[c, a, b]', [c, a, b]],
    ['[c, a, d]', [c, a, d]],
    ['[c, b, a]', [c, b, a]],
    ['[c, b, d]', [c, b, d]],
    ['[c, d, a]', [c, d, a]],
    ['[c, d, b]', [c, d, b]],
    ['[d, a, b]', [d, a, b]],
    ['[d, a, c]', [d, a, c]],
    ['[d, b, a]', [d, b, a]],
    ['[d, b, c]', [d, b, c]],
    ['[d, c, a]', [d, c, a]],
    ['[d, c, b]', [d, c, b]],
    ['[a, b]', [a, b]],
    ['[a, c]', [a, c]],
    ['[a, d]', [a, d]],
    ['[b, a]', [b, a]],
    ['[b, c]', [b, c]],
    ['[b, d]', [b, d]],
    ['[c, a]', [c, a]],
    ['[c, b]', [c, b]],
    ['[c, d]', [c, d]],
    ['[d, a]', [d, a]],
    ['[d, b]', [d, b]],
    ['[d, c]', [d, c]],
    ['[a]', [a]],
    ['[b]', [b]],
    ['[c]', [c]],
    ['[d]', [d]],
]

test('getPermutationIndex()', () => {
    permutations.forEach(([label, permutation], index) =>
        assert.equal(getPermutationIndex(set, permutation), index, `Expected ${label} to be at index ${index}`))
})
test('getNthPermutation()', () => {
    permutations.forEach(([label, permutation], index) =>
        assert.deepEqual(getNthPermutation(set, index), permutation, `Expected ${label} at index ${index}`))
})
test('createPermutationIterator()', () => {

    const permutations = createPermutationIterator(set, true)

    assert.equal(permutations.next().value, set)
    assert.deepEqual(permutations.next(1).value, [a, c, b, d])
    assert.deepEqual(permutations.next(2).value, [a, c, d, b])
    assert.deepEqual(permutations.next(3).value, [a, d, b, c])
    assert.deepEqual(permutations.next(1).value, [b, a, c, d])
    assert.deepEqual(permutations.next(0).value, [c, a, b, d])
    assert.deepEqual(permutations.next(0).value, [d, a, b, c])
    assert.equal(permutations.next(0).value, undefined)

    const arrangements = createPermutationIterator(set)

    assert.equal(arrangements.next().value, set)
    assert.deepEqual(arrangements.next(0).value, [b, a, c, d])
    assert.deepEqual(arrangements.next(1).value, [b, c, a, d])
    assert.deepEqual(arrangements.next(1).value, [b, d, a, c])
    assert.deepEqual(arrangements.next(1).value, [c, a, b, d])
    assert.deepEqual(arrangements.next(0).value, [d, a, b, c])
    assert.deepEqual(arrangements.next(0).value, [b])
    assert.equal(arrangements.next(0).value, undefined)
})
