
# Parsing permutations

When matching a value definition representing a sequence of `||` separated symbols, the longest match must be found. When the parser does not find a match for a symbol, it must backtrack and reorder or omit symbols.

For example, given all permutations of `a || b || c` in lexicographic order, it must move to the third permutation if it does not find a match for `a`, otherwise it must backtrack if it does not find a match for `b` and if it does not find an alternative match for `a`, it must move to the second permutation.

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

Following the lexicographic order is required for ambiguous cases. For example, when parsing a declaration value for `background`, which is defined with  `... || <visual-box> || <visual-box>`, it prevents matching a value for `background-origin` with a value specified for `background-clip`.

## Definitions

*Permutation* and *combination* come from the mathematic fields of combinatorics and group theory. *Combination* is more used in everyday language, eg. a poker hand or a digit lock, but it should be named a *permutation* in the latter case.

A *permutation* is a **reordering of a set of elements**. All permutations have the same length as the set. Weaker meanings of *permutation* includes *k-permutation of n*, sometimes named an *arrangement*, ie. the permutations of `k` elements from a set of `n` elements.

A *combination* is a **selection of a subset of elements**. The order does not matter: `a b` and `b a` are the same combination.

`&&` separated elements match any permutation. Lexicographic ordering of permutations gives priority to the left most element.

`||` separated elements match any k-permutation (arrangement). The priority is given to the longest permutation.

The **Lehmer code** uses the factorial number system (factoradic) to encode/decode permutations, as a solution to get the permutation at a given position, or the position of a given permutation.

On one hand, the number of permutations of a set of `n` elements is `factorial(n)`, represented by `n!`. For example, the number of permutations of 3 elements is `3 * 2 * 1`.

On the other hand, factorial values can be combined (following a procedure detailed further below) to represent any decimal value. For example, `5` is the result of `(0! * 0) + (1! * 1) + (2! * 2)` and is represented as `[0, 1, 2]` in a positional factoradic: each number is a factor applied on the (place value) value at the corresponding (zero based) position.

|       Radix | 1  | 2  | 3  |
| ----------- | -- | -- | -- |
|    Position | 0  | 1  | 2  |
| ----------- | -- | -- | -- |
| Place value | 0! | 1! | 2! |
| ----------- | -- | -- | -- |
|    * factor | 0  | 1  | 2  |
|           = | 0  | 1  | 4  |

This relation means that permutations have a factoradic representation (lehmer code, resolved following a procedure detailed further below). For example, `c b a`, which is the 5th permutation of `a b c` can be represented with the lehmer code `[2, 1, 0]`, which is the factoradic representation of `5` in reverse order.

## Implementations

`n!`: the number of permutations of a set `s` of `n` elements is `factorial(n)`.

```js
/**
 * @param {number} n Length of the set
 * @returns {number} Number of permutations
 *
 * n! (recursive)
 */
function factorial(n) {
  return 1 < n ? n * factorial(--n) : 1
}
/**
 * @param {number} n Length of the set
 * @returns {number} Number of permutations
 *
 * n! (non-recursive)
 */
function factorial(n) {
  let r = 1 < n ? n : 1
  while (1 < --n) {
    r *= n
  }
  return r
}
```

`P(n, k)`: the number of permutations of `k` elements of a set `s` of `n` elements is `n! / (n - k)!`.

For example, the number of permutations of `2` elements of a set of `4` elements is:

```
   n!      4 * 3 * 2 * 1
-------- = ------------- = 12
(n - k)!       2 * 1
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

For example, the number of combinations of `2` elements from a set of `4` elements is:

```
P(n, k)   12       24     4!           n!
------- = -- = 6 = -- = ------ = -------------
   k!      2        4   2 * 2!   k! * (n - k)!
```

```js
/**
 * @param {number} n   Length of the set
 * @param {number} [k] Length of the combination
 * @returns {number}   Number of combinations of `k` elements
 *
 * `C(n, k) === P(n, k) / k!`
 */
function getCombinationsLength(n, k = n) {
  return getPermutationsLength(n, k) / factorial(k)
}
```

To get a factoradic `representation` of a decimal value `k`, starting with `r` (radix) equal to `1`, push `k % r` (remainder of the integer division `k // r`) into `representation`, repeat by replacing `k` with `k // r` and incrementing `r` until `k` is `0` (excluded).

For example, for `100`:

|            `k // r` | `k % r` | `representation` |
| ------------------- | ------- | ---------------- |
| Math.floor(100 / 1) | 100 % 1 | [0]              |
| Math.floor(100 / 2) | 100 % 2 | [0,0]            |
| Math.floor( 50 / 3) |  50 % 3 | [0,0,2]          |
| Math.floor( 16 / 4) |  16 % 4 | [0,0,2,0]        |
| Math.floor(  4 / 5) |   4 % 5 | [0,0,2,0,4]      |

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

To get a decimal value from its factoradic representation, add the products of each `representation` value with the factorial place value at the corresponding index.

For example, for `[0,0,2,0,4]`: `(0! * 0) + (1! * 0) + (2! * 2) + (3! * 0) + (4! * 4) === 0 + 0 + 4 + 0 + 96`.

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

To get the (0 based) `k`th permutation, shift `k % r` into a list initially defined with `[0]` and starting with `r` equal to `2`, repeat by replacing `k` with `k // r` and incrementing `r` until it is equal to the length of the permutations (included), then remove the corresponding permutation element for each number in the list and push it into a list representing the `k`th permutation.

For example, to get the 3rd permutation `[b, c, a]` of `[a, b, c]`:

|          `k // r` | `k % r` | lehmer code |
| ----------------- | ------- | ----------- |
| Math.floor(3 / 2) |   3 % 2 |       [1,0] |
| Math.floor(1 / 3) |   1 % 3 |     [1,1,0] |

<details>
  <summary>Other examples</summary>

  To get the 5th permutation `[c, b, a]` of `[a, b, c]`:

  |          `k // r` | `k % r` | lehmer code |
  | ----------------- | ------- | ----------- |
  | Math.floor(5 / 2) |   5 % 2 |       [1,0] |
  | Math.floor(2 / 3) |   2 % 3 |     [2,1,0] |

  To get the 23rd permutation `[d, c, b, a]` of `[a, b, c]`:

  |           `k // r` | `k % r` | lehmer code |
  | ------------------ | ------- | ----------- |
  | Math.floor(23 / 2) |  23 % 2 |       [1,0] |
  | Math.floor(11 / 3) |  11 % 3 |     [2,1,0] |
  | Math.floor( 3 / 4) |   3 % 4 |   [3,2,1,0] |
</details>

There are multiple alternatives to resolve the factoradic representation, which are more or less equivalent.

<details>
  <summary>Alternative 1</summary>

  To get the (0 based) `k`th permutation, get `k % r` starting with `r` equal to `k`, remove the permutation element at the corresponding index and shift it into a list representing the `k`th permutation, repeat by replacing `k` with `k // r` and decrementing `r` until `k // r` is `0` (included).

  For example, to get the 3rd permutation `[b, c, a]` of `[a, b, c]` (ie. `0 || 1 || 2`):

  |          `k // r` | `k % r` | lehmer code | permutation |
  | ----------------- | ------- | ----------- | ----------- |
  | Math.floor(3 / 3) |   3 % 3 |         [0] | [a]         |
  | Math.floor(1 / 2) |   1 % 2 |       [1,0] | [c,a]       |
  | Math.floor(0 / 1) |   0 % 1 |     [0,1,0] | [b,c,a]     |

  To get the 5th permutation `[c, b, a]` of `[a, b, c]`:

  |          `k // r` | `k % r` | lehmer code | permutation |
  | ----------------- | ------- | ----------- | ----------- |
  | Math.floor(5 / 3) |   5 % 3 |         [2] | [c]         |
  | Math.floor(1 / 2) |   1 % 2 |       [2,1] | [c,b]       |
  | Math.floor(0 / 1) |   0 % 1 |     [2,1,0] | [c,b,a]     |

  To get the 23rd permutation `[d, c, b, a]` of `[a, b, c]`:

  |           `k // r` | `k % r` | lehmer code | permutation |
  | ------------------ | ------- | ----------- | ----------- |
  | Math.floor(23 / 4) |  23 % 4 |         [3] | [d]         |
  | Math.floor( 5 / 3) |   5 % 3 |       [3,2] | [d,c]       |
  | Math.floor( 1 / 2) |   1 % 2 |     [3,2,1] | [d,c]       |
  | Math.floor( 0 / 1) |   0 % 1 |   [3,2,1,0] | [d,c,b,a]   |

  To get the 23rd permutation `[d, c, b, a]` of `[a, b, c]`:

  |                  `k // r` |       `k % r` | lehmer code | permutation |
  | ------------------------- | ------------- | ----------- | ----------- |
  | Math.floor(23 / (4 - 1)!) | 23 % (4 - 1)! |         [3] | [d]         |
  | Math.floor( 5 / (4 - 2)!) |  5 % (4 - 2)! |       [3,2] | [d,c]       |
  | Math.floor( 1 / (4 - 3)!) |  1 % (4 - 3)! |     [3,2,1] | [d,c]       |
  | Math.floor( 0 / (4 - 4)!) |  0 % (4 - 4)! |   [3,2,1,0] | [d,c,b,a]   |
</details>

<details>
  <summary>Alternative 2</summary>

  To get the (0 based) `k`th permutation, get `k // r` starting with `r` equal to `(k - 1)!`, remove the permutation element at the corresponding index and shift it into a list representing the `k`th permutation, repeat by replacing `k` with `k % r` and `r` with (updated) `(k - 1)!` until `k // r` is `0` (included).

  For example, to get the 3rd permutation `b c a` of `a b c` (ie. `0 || 1 || 2`):

  |                 `k // r` |      `k % r` | lehmer code | permutation |
  | ------------------------ | ------------ | ----------- | ----------- |
  | Math.floor(3 / (3 - 1)!) | 3 % (3 - 1)! |         [1] | [b]         |
  | Math.floor(1 / (3 - 2)!) | 1 % (3 - 2)! |       [1,1] | [d,c]       |
  | Math.floor(0 / (3 - 3)!) | 0 % (3 - 3)! |     [1,1,0] | [d,c]       |

  To get the 5th permutation `[c, b, a]` of `[a, b, c]`:

  |                 `k // r` |      `k % r` | lehmer code | permutation |
  | ------------------------ | ------------ | ----------- | ----------- |
  | Math.floor(5 / (3 - 1)!) | 5 % (3 - 1)! |         [2] | [c]         |
  | Math.floor(1 / (3 - 2)!) | 1 % (3 - 2)! |       [2,1] | [c,b]       |
  | Math.floor(0 / (3 - 3)!) | 0 % (3 - 3)! |     [2,1,0] | [c,b,a]     |

  To get the 23rd permutation `[d, c, b, a]` of `[a, b, c]`:

  |                  `k // r` |       `k % r` | lehmer code | permutation |
  | ------------------------- | ------------- | ----------- | ----------- |
  | Math.floor(23 / (4 - 1)!) | 23 % (4 - 1)! |         [3] | [d]         |
  | Math.floor( 5 / (4 - 2)!) |  5 % (4 - 2)! |       [3,2] | [d,c]       |
  | Math.floor( 1 / (4 - 3)!) |  1 % (4 - 3)! |     [3,2,1] | [d,c]       |
  | Math.floor( 0 / (4 - 4)!) |  0 % (4 - 4)! |   [3,2,1,0] | [d,c,b,a]   |
</details>

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
  const representation = getFactoradicRepresentation(nth, set.length).reverse()
  const permutation = []
  set = [...set]
  for (const index of representation) {
    permutation.push(...set.splice(index, 1))
  }
  return permutation
}
```

```js
/**
 * @param {*[]} set
 * @param {*[]} permutation
 * @returns {number}
 */
function getPermutationIndex(set, permutation) {
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
  const { length: n } = set
  let k = n
  let skip = factorial(n)
  while (skip <= nth) {
    nth -= skip
    skip = getPermutationsLength(n, --k)
  }
  const offset = n - k
  const representation = getFactoradicRepresentation(nth * factorial(offset), n)
  const permutation = []
  set = [...set]
  for (let i = n - 1; offset <= i; i--) {
    permutation.push(...set.splice(representation[i], 1))
  }
  return permutation
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
