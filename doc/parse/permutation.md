
# Parsing permutations

One of the only cases for which the parser must be *greedy*, ie. make choices aiming at matching as many types as possible, is when parsing a multiplied type or `||` combined types. This also means that the first result that can be parsed by matching types from left to right (in their canonical order) must be favored.

This last requirement prevents eg. `background-origin` and `background-clip` values from being switched when matched against `... || <attachment> || <box> || <box>`, if the `background-attachment` value is placed between the two `<box>` values.

When the parser can not match a value against one of the `||` combined types, it means that this value is either omitted or placed at a different position, ie. another permutation must be matched. The permutations must be sorted in the canonical order of types starting from the permutation with the most types and ending with the last single type, eg.:

  1. `a || b || c`
  2. `a || c || b`
  3. `b || a || c`
  4. `b || c || a`
  5. `c || a || b`
  6. `c || b || a`
  7. `a || b`
  8. `a || c`
  9. `b || a`
  10. `b || c`
  11. `c || a`
  12. `c || b`
  13. `a`
  14. `b`
  15. `c`

The parser must go from 1 to 3 if it can not find a match for `a`, otherwise it must go from 1 to 2 if it finds a match for `a` but not for `b`, then it must backtrack before `a` if it can not find a match for `c`. When backtracking, the parser must try again to match a type associated to a state, which is a hint indicating that it can yield a different match result. This result would not (always) be obtained when trying another permutation on the first failure instead of backtracking.

## Definitions

*Permutation* and *combination* come from the mathematic fields of combinatorics and group theory. *Combination* is more used in everyday language, eg. a poker hand or a digit lock, but it should be named a *permutation* in the latter case.

A *combination* is a **subset of elements**, including the complete set. The order does not matter: `a b` and `b a` are the same combination.

A *permutation* is a **reordering of a set of elements**. All permutations have the same length as the set. Weaker meanings of *permutation* includes *k-permutation of n*, ie. the permutations of `k` elements from a set of `n` elements, which is sometimes called an *arrangement*. Lexicographic ordering of permutations gives priority to the left most element of the set.

`&&` combined types can match any permutation of these types.

`||` combined types can match any k-permutation (arrangement) of these types. The priority is given to the permutation of the highest length and the order still matters, especially when two values can match the type of the other and vice versa, eg. `background = ... || <box> || <box>`.

The **Lehmer code** use the factorial number system (factoradic) to encode/decode permutations, as a solution to get the `nth` permutation or to know the position of a permutation.

| Factorial radix | 1 | 2 | 3 | 4 |  5 | ... |
| --------------- | - | - | - | - | -- | --- |
| Factorial value | 0 | 1 | 2 | 3 |  4 | ... |
| Decimal value   | 1 | 1 | 2 | 6 | 24 | ... |

Factorial values can be combined to represent any decimal values, eg. `5` can be represented as `[0, 2, 1]`, ie. the result of `0 * 1! + 2 * 2! + 1 * 3!`. Because the number of permutations of a set of `n` elements is `factorial(n)`, it means that each permutation can be represented with a factoradic representation, by associating each type to its index in the first permutation, eg. the 5th permutation can be represented as `[0, 2, 1]`.

## Implementations

`n!`: the number of permutations of a set `s` of `n` elements is `factorial(n)`.

```js
/**
 * @param {number} n Length of the set
 * @returns {number}  Number of permutations
 *
 * n! (recursive)
 */
function factorial(n) {
  return 1 < n ? n * factorial(--n) : 1
}
/**
 * @param {number} n Length of the set
 * @returns {number}  Number of permutations
 *
 * n! (non-recursive)
 */
function factorial(n) {
  let r = 1 < n ? n : 1
  while (1 < n--) {
    r *= n
  }
  return r
}
```

Note: it is not required to handle `n <= 0` because CSS combined types requires that *one or more* components must occur.

`P(n, k)`: the number of permutations of `k` elements from a set `s` of `n` elements is `n! / (n - k)!`.

Eg. the number of permutations of `2` elements from a set of `4` elements is:

```
   n!      4 * 3 * (2 * 1)
-------- = --------------- = 4 * 3 = 12
(n - k)!        2 * 1
```

```js
/**
 * @param {number} n   Length of the set
 * @param {number} [k] Length of the permutation
 * @returns {number}   Number of permutations of `k` elements
 *
 * `P(n, k)` or `A(n, k)`
 *
 * More efficient than `factorial(k) / factorial(n - k)`
 */
function getPermutationsLength(n, k = n) {
  let total = n
  while (--k) {
    total *= --n
  }
  return total
}
```

The number of permutations of `0 < k <= n` elements of a set `s` of `4` elements is `4! + (4! / 3!) + (4! / 2!) + (4! / 1!)`.

```js
/**
 * @param {number} n Length of the set
 * @returns {number} Number of permutations
 */
function getAllPermutationsLength(n) {
  let total = factorial(n)
  let k = n
  while (--n) {
    total += getPermutationsLength(k, n)
  }
  return total
}
```

`C(n, k)`: the number of combinations of `k` elements from a set `s` of `n` elements is `P(n, k) / k!`, more commonly written `n! / k! * (n - k)!`.

Eg. the number of combinations of `2` elements from a set of `4` elements is:

```
P(n, k)   12
------- = -- = 6
   k!      2

       n!         4!     24
------------- = ------ = -- = 6
k! * (n - k)!   2 * 2!    4
```

```js
/**
 * @param {number} n   Length of the set
 * @param {number} [k] Length of the combination
 * @returns {number}   Number of combinations of `k` elements
 *
 * `C(n, k)`
 */
function getCombinationsLength(n, k = n) {
  return getPermutationsLength(n, k) / getPermutationsLength(k, k)
}
```

To get a factoradic representation of a decimal value `v`, compute the integer division of `v` by `n` starting with `n` equal to `1`, replace `v` by the result of the division, push the remainder in a list, increment `n`, then repeat until `v` is `0`.

Eg. for `100`:

|                 `v` |     `r` | `representation` |
| ------------------- | ------- | ---------------- |
| Math.floor(100 / 1) | 100 % 1 | [0]              |
| Math.floor(100 / 2) | 100 % 2 | [0,0]            |
|  Math.floor(50 / 3) |  50 % 3 | [0,0,2]          |
|  Math.floor(16 / 4) |  16 % 4 | [0,0,2,0]        |
|   Math.floor(4 / 5) |   4 % 5 | [0,0,2,0,4]      |

```js
/**
 * @param {number} decimal
 * @returns {number[]}
 */
function getFactoradicRepresentation(decimal) {
  const representation = [0]
  let radix = 2
  while (0 < decimal) {
    representation.push(decimal % radix)
    decimal = Math.floor(decimal / radix)
    ++radix
  }
  return representation
}
```

To get a decimal value from its factoradic representation, compute the sum of each product of the values and their factorial at the corresponding index (radix) in the representation.

```js
/**
 * @param {number[]} representation
 * @returns {number}
 */
function getDecimalFromFactoradicRepresentation(representation) {
  return representation.reduce((nth, value, index) => nth += value * factorial(index))
}
```

Adapted to permutations in lexicographic order:

```js
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
```

```js
/**
 * @param {*[]} set
 * @param {number} nth
 * @returns {*[]}
 */
function getNthPermutation(set, nth) {
  const representation = getFactoradicRepresentation(nth).reverse()
  const permutation = []
  set = [...set]
  for (const index of representation) {
    permutation.push(...set.splice(index, 1))
  }
  return permutation
}
```

Eg. to get the 3rd permutation of `a || b || c` (ie. `0 || 1 || 2`):

|              `nth` |    `r` | `representation`   |
| ------------------ | ------ | ------------------ |
| Math.floor(3 / 1!) | 3 % 1! | [0]                |
| Math.floor(3 / 2!) | 1 % 2! | [0,1]              |
| Math.floor(1 / 3!) | 0 % 3! | [0,1,1]            |
|                    |        | [1,1,0] -> [b,c,a] |

```js
/**
 * @param {*[]} permutation
 * @param {*[]} set
 * @returns {number}
 */
function getPermutationIndex(permutation, set) {
  const representation = []
  set = [...set]
  for (const value of permutation) {
    const index = set.indexOf(value)
    representation.push(index)
    set.splice(index, 1)
  }
  return getDecimalFromFactoradicRepresentation(representation)
}
```

Adapted to permutations of `0 < k` elements in lexicographic order:

```js
/**
 * @param {*[]} set
 * @param {number} nth
 * @returns {*[]}
 */
function getNthPermutation(set, nth) {

}
```

```js
/**
 * @param {*[]} permutation
 * @param {*[]} set
 * @returns {number}
 */
function getPermutationIndex(set, permutation) {
  const representation = []
  const { length } = set
  const { length: k } = permutation
  set = [...set]
  for (const value of permutation) {
    const index = set.indexOf(value)
    representation.push(index)
    set.splice(index, 1)
  }
  representation.push(...set.keys())
  const decimal = representation.reverse().reduce((nth, value, index) => nth += value * factorial(index))
  let index = Math.floor(decimal / factorial(length - k))
  let n = length
  while (k < n) {
    index += getPermutationsLength(length, n--)
  }
  return index
}
```

# Heuristics

When failing to match any value against the first (sub-)permutation of a set of types, all permutations starting with its first type can be excluded, eg.:
  - when failing to match any value against `a || b || c`, exclude `a || c || b`, `a || b`, `a || c`, and `a`
  - when failing to match no more value than `a` against `a || b || c || d`, exclude `a || b || c`, `a || b || d`, and `a || b`

When failing to match the last sub-permutation of a set of types, all length of the permutation including the first type of the sub-permutation can be excluded, eg.:
  - when failing to match no more value than `a` against `a || d || c || a`, exclude `a || d || c` and `a || d`
  - when failing to match no more value than `a` against `a || c || b`, exclude `a || c`
