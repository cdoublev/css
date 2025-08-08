
import { createPermutationIterator, getNthPermutation, getPermutationIndex } from '../lib/parse/permutation.js'

const a = { type: 'keyword', value: 'a' }
const b = { type: 'keyword', value: 'b' }
const c = { type: 'keyword', value: 'c' }
const d = { type: 'keyword', value: 'd' }
const set = [a, b, c, d]
const permutations = [
    ['[a, b, c, d]', [a, b, c, d], 0],
    ['[a, b, d, c]', [a, b, d, c], 1],
    ['[a, c, b, d]', [a, c, b, d], 2],
    ['[a, c, d, b]', [a, c, d, b], 3],
    ['[a, d, b, c]', [a, d, b, c], 4],
    ['[a, d, c, b]', [a, d, c, b], 5],
    ['[b, a, c, d]', [b, a, c, d], 6],
    ['[b, a, d, c]', [b, a, d, c], 7],
    ['[b, c, a, d]', [b, c, a, d], 8],
    ['[b, c, d, a]', [b, c, d, a], 9],
    ['[b, d, a, c]', [b, d, a, c], 10],
    ['[b, d, c, a]', [b, d, c, a], 11],
    ['[c, a, b, d]', [c, a, b, d], 12],
    ['[c, a, d, b]', [c, a, d, b], 13],
    ['[c, b, a, d]', [c, b, a, d], 14],
    ['[c, b, d, a]', [c, b, d, a], 15],
    ['[c, d, a, b]', [c, d, a, b], 16],
    ['[c, d, b, a]', [c, d, b, a], 17],
    ['[d, a, b, c]', [d, a, b, c], 18],
    ['[d, a, c, b]', [d, a, c, b], 19],
    ['[d, b, a, c]', [d, b, a, c], 20],
    ['[d, b, c, a]', [d, b, c, a], 21],
    ['[d, c, a, b]', [d, c, a, b], 22],
    ['[d, c, b, a]', [d, c, b, a], 23],
    ['[a, b, c]', [a, b, c], 24],
    ['[a, b, d]', [a, b, d], 25],
    ['[a, c, b]', [a, c, b], 26],
    ['[a, c, d]', [a, c, d], 27],
    ['[a, d, b]', [a, d, b], 28],
    ['[a, d, c]', [a, d, c], 29],
    ['[b, a, c]', [b, a, c], 30],
    ['[b, a, d]', [b, a, d], 31],
    ['[b, c, a]', [b, c, a], 32],
    ['[b, c, d]', [b, c, d], 33],
    ['[b, d, a]', [b, d, a], 34],
    ['[b, d, c]', [b, d, c], 35],
    ['[c, a, b]', [c, a, b], 36],
    ['[c, a, d]', [c, a, d], 37],
    ['[c, b, a]', [c, b, a], 38],
    ['[c, b, d]', [c, b, d], 39],
    ['[c, d, a]', [c, d, a], 40],
    ['[c, d, b]', [c, d, b], 41],
    ['[d, a, b]', [d, a, b], 42],
    ['[d, a, c]', [d, a, c], 43],
    ['[d, b, a]', [d, b, a], 44],
    ['[d, b, c]', [d, b, c], 45],
    ['[d, c, a]', [d, c, a], 46],
    ['[d, c, b]', [d, c, b], 47],
    ['[a, b]', [a, b], 48],
    ['[a, c]', [a, c], 49],
    ['[a, d]', [a, d], 50],
    ['[b, a]', [b, a], 51],
    ['[b, c]', [b, c], 52],
    ['[b, d]', [b, d], 53],
    ['[c, a]', [c, a], 54],
    ['[c, b]', [c, b], 55],
    ['[c, d]', [c, d], 56],
    ['[d, a]', [d, a], 57],
    ['[d, b]', [d, b], 58],
    ['[d, c]', [d, c], 59],
    ['[a]', [a], 60],
    ['[b]', [b], 61],
    ['[c]', [c], 62],
    ['[d]', [d], 63],
]

describe('getPermutationIndex()', () => {
    it.each(permutations)('returns %# as the index of the permutation %s', (_, permutation, index) => {
        expect(getPermutationIndex(set, permutation)).toBe(index)
    })
})
describe('getNthPermutation()', () => {
    it.each(permutations)('returns %s as the %#th permutation', (_, permutation, index) => {
        expect(getNthPermutation(set, index)).toEqual(permutation)
    })
})
describe('createPermutationIterator()', () => {
    it('returns the next permutation based on the given number of valid value(s)', () => {
        const permutations = createPermutationIterator(set, true)
        expect(permutations.next().value).toBe(set)
        expect(permutations.next(1).value).toEqual([a, c, b, d])
        expect(permutations.next(2).value).toEqual([a, c, d, b])
        expect(permutations.next(3).value).toEqual([a, d, b, c])
        expect(permutations.next(1).value).toEqual([b, a, c, d])
        expect(permutations.next(0).value).toEqual([c, a, b, d])
        expect(permutations.next(0).value).toEqual([d, a, b, c])
        expect(permutations.next(0).value).toBeUndefined()
    })
    it('returns the next k-permutation based on the given number of valid value(s)', () => {
        const permutations = createPermutationIterator(set)
        expect(permutations.next().value).toBe(set)
        expect(permutations.next(0).value).toEqual([b, a, c, d])
        expect(permutations.next(1).value).toEqual([b, c, a, d])
        expect(permutations.next(1).value).toEqual([b, d, a, c])
        expect(permutations.next(1).value).toEqual([c, a, b, d])
        expect(permutations.next(0).value).toEqual([d, a, b, c])
        expect(permutations.next(0).value).toEqual([b])
        expect(permutations.next(0).value).toBeUndefined()
    })
})
