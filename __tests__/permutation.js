
const { getNextPermutation, getNthPermutation, getPermutationIndex } = require('../lib/parse/permutation.js')

const a = { position: 0, type: 'keyword', value: 'a' }
const b = { position: 1, type: 'keyword', value: 'b' }
const c = { position: 2, type: 'keyword', value: 'c' }
const d = { position: 3, type: 'keyword', value: 'd' }
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
describe('getNextPermutation()', () => {
    it('excludes all permutations starting with the first type of a permutation failing to match any value', () => {
        const excluded = []
        expect(getNextPermutation(set, [a, b, c, d], [], excluded)).toEqual([b, a, c, d])
        expect(excluded).toEqual([[0]])
        expect(getNextPermutation(set, [d, c, b, a], [d, c, b], excluded)).toEqual([b, a, c])
    })
    it('excludes all permutations starting with the first types of a permutation failing to match more values', () => {
        const excluded = []
        expect(getNextPermutation(set, [a, b, c, d], [a], excluded)).toEqual([a, c, b, d])
        expect(excluded).toEqual([[0, 1]])
        expect(getNextPermutation(set, [d, c, b, a], [d, c, b], excluded)).toEqual([a, c, b])
    })
    it('excludes all length of a permutation including the first remaining type failing to match another value', () => {
        const excluded = []
        expect(getNextPermutation(set, [a, d, c, b], [a], excluded)).toEqual([b, a, c, d])
        expect(excluded).toEqual([[0, 3]])
        expect(getNextPermutation(set, [a, c, d], [a, c], excluded)).toEqual([b, a, c])
        expect(getNextPermutation(set, [a, c], [a], excluded)).toEqual([b, a])
    })
    it('excludes all length of a permutation including the last remaining type failing to match another value', () => {
        const excluded = []
        expect(getNextPermutation(set, [a, b, d, c], [a, b], excluded)).toEqual([a, c, b, d])
        expect(excluded).toEqual([[0, 1, 3]])
        expect(getNextPermutation(set, [a, b, c], [a, b], excluded)).toEqual([a, c, b])
    })
    it('does not exclude permutations based on a permutation that had a match before backtracking', () => {
        const excluded = []
        getNextPermutation(set, [a, b, c], [a, b, c], excluded)
        expect(excluded).toEqual([])
    })
})
