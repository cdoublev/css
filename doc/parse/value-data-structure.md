
# Value data structure

A CSS value is either a component value, a declaration, a rule, or a list of these values. This document defines the data structures to represent them.

## Component value

Normalizing the input into tokens is the first parsing step before consuming tokens into component values: the CSS lexical units.

A token represents a delimiter (a single code point, `<--`, or `-->`), a numeric, or an identifier eventually prefixed with `#`, `@`, or wrapped between `"`. In CSS Syntax, it is defined with the following properties:

  - `representation`: `String`
  - `type`: `String`
  - `value`: `String` or `Number`
  - `unit`: `String`

`representation` is assigned the code points consumed to produce the token. It must be an empty string when the token is not produced during tokenization.

`type` is only defined for `<hash-token>`, `<number-token>`, `<dimension-token>`. In this library, it is implemented as `Set [String]` for all tokens, as explained further below.

`value` is a `Number` only for numeric tokens.

`unit` is only defined for `<dimension-token>`. According to this [issue](https://github.com/w3c/csswg-drafts/issues/7381), a `<percentage-token>` can be considered as a dimension therefore it is also implemented with `unit`, to simplify the parsing and serialization of numeric types.

> A component value is one of the preserved tokens, a function, or a simple block.

A component value is the same data structure than the corresponding token, except a function and a simple block, which have a `value` that is a list of component values. A function also has a `name` (`String`) and a simple block also has an `associatedToken` (`String`).

All component values are implemeted as objects, including those representing delimiters. They are not implemented as primitive strings or `String` instances because it guarantees to process (parse and serialize) the same type(s) of data structures with a common interface, and because of the following limitations and potential issues:

  1. a primitive cannot be assigned a property:

    ```js
    const length = '100px'
    length.type = 'length'
    console.log(length.type) // undefined
    ```

  2. `new String('identifier') === 'identifier'` and `['identifier'].includes(new String('identifier'))` are falsy while`` `${new String('identifier')}` === 'identifier'`` and `new String('identifier').startsWith('i')` are truthy (`toString()` conversion)

  3. `new String(0) == ' '` is truthy

    - `==`: the left/right operand is coerced to a primitive if one is an object and the other is a string/number
    - `<`, `<=`, `>`, `>=`: operands are coerced to primitives (with number as a preference `hint` for conversion)
    - an object is converted to a primitive with `valueOf()` if this method exists, otherwise with `toString()`, and receives `number` or nothing as a preference `hint`

      ```js
      class Foo {
        [Symbol.toPrimitive](hint) {
          console.log(hint)
          return 'foo'
        }
      }
      console.log(foo == 'foo')
      // 'default'
      // true
      console.log(foo < 'foo')
      // 'number'
      // false
      ```

A token must expose its name in order to be matched against the corresponding CSS basic data type, and a component value must expose the matched CSS type(s) in order to apply the corresponding serialization rules. For example, `<number>` must match a `<number-token>` and serialize to the shortest possible form.

This library assimilates CSS types and token names by removing the `-token` suffix part, except for `<function-token>` otherwise *consume a component value* would yield an invalid result when processing a function more than once, rather than using classes (eg. `CSSNumber`, `CSSDimension`, etc) or different properties (eg. `tokenType` and `cssTypes`).

While token names are exclusive, CSS types are inclusive. For example, a `<number-token>` can not represent any other token but `<alpha-value>` can also represent a `<number>` or `<percentage>`. Additionally, CSS types must be represented in a hierarchical order: because `<alpha-value>` has a higher order than `<percentage>`, a value matching `<percentage>` and `<alpha-value>` must serialize to a `<number>`, according to the serialization rule of `<alpha-value>`.

As an aside, it should be noted that some value definitions contains token types:

  - `<dimension-token>`
    - `<urange>`
  - `<function-token>`
    - `<general-enclosed>`
    - `<pseudo-class-selector>`
  - `<hash-token>`
    - `<id-selector>`
  - `<ident-token>`
    - `<attribute-selector>`
    - `<class-selector>`
    - `<custom-arg>`
    - `<custom-selector>`
    - `<general-enclosed>`
    - `<ns-prefix>`
    - `<page-selector>`
    - `<pseudo-class-selector>`
    - `<urange>`
    - `<wq-name>`
  - `<number-token>`
    - `<urange>`
  - `<string-token>`
    - `<attribute-selector>`

CSS Syntax defines that the distinction between a token and a component value *makes no difference to any of [its] algorithms*, but there is no input that can match `<function-token>`, because any CSS input must go through *consume a component value*. The three tokens in `<function-token> <any-value>)`, which is used *to allow for future expansion of the grammar* of a media query, a functional pseudo-class, and an url modifier, are consumed into a single function component value. To workaround this problem, they are replaced with `<function>` in `<general-enclosed>`, `<pseudo-class-selector>`, and `<url-modifier>`.

The normalized token name and the matched CSS types are exposed by `type` defined as a `Set`. This has some notable consequences.

`<hash-token>` is defined with a `type` that must be `unrestricted` if not otherwise set to `id` when its `value` is an identifier, `<id>` is defined as matching `<id-selector>`, and `<id-selector>` is defined as matching a `<hash-token>` whose `type` *is* `id`.

```
         <id> = <id-selector>
<id-selector> = <hash-token type="id">
```

Instead, in this library, `<hash-token>` is implemented with a `type` that *has* `id` when its `value` is an identifier, noting that defining `<id-selector>` as matching `<id>`, defined as a CSS basic data type matching a `<hash-token>` whose `type` is/has `id`, would have make more sense.

```
         <id> = <hash-token type="id">
<id-selector> = <hash-token type="id">
# But ideally:
<id-selector> = <id>
```

`<numeric-token>` and `<dimension-token>` are defined with a `type` that is either `integer` or `number`, noting that the `type` of any number specified with the scientific notation is currently defined as `number` (even if eg. `1e1` is an integer), and `<integer>`, `<signed-integer>`, `<signless-integer>`, `<n-dimension>`, `<ndash-dimension>`, `<ndashdigit-dimension>`, are defined as a `<number-token>` whose `type` *is* `integer`.

Instead, in this library, `<numeric-token>` is implemented with a `type` that only *has* `number`, and parsing these CSS types is implemented as matching a `<number-token>` or `<dimension-token>` whose `value` evaluates to an integer. A consequence is that eg. `nth-child(1e1)` or `nth-child(1e1n)` are valid if not otherwise discarded when parsing `<n-dimension>`.

Finally, math functions involve two other type sets, which are also overlapping with CSS types:

  - CSS types: `<number>`, `<dimension>`, `<percentage>`, `<calc-sum>`, `<calc-product>`
  - types of calculation tree nodes: `Sum`, `Product`, `Negate`, `Invert`
  - types of calculations: a `Map` from numeric CSS types to integers, and an optional `percentHint` property which is also assigned a numeric CSS type, ie. `Map { [CSSType]: Integer, percentHint: CSSType }`

The type of a calculation allows to validate its (numeric) CSS type of its tree, and correspond to the type of `CSSNumericValue`, defined in CSS Typed OM. The types of calculation tree nodes allow to represent and simplify a calculation tree, and correspond to the subclasses of `CSSMathValue` (which extends `CSSNumericValue`) defined in Typed OM: `CSSMathSum`, `CSSMathProduct`, `CSSMathNegate`, `CSSMathInvert`.

In this library, `numericType` is a property of a component value representing a math function, and is assigned the resolved type of its calculation.

In this library, the calculation tree nodes are represented as component values whose `type` has `calc-sum`, `calc-product`, `calc-negate`, or `calc-invert`, noting that there is no specification defining the last two.

## List of component values

WIP