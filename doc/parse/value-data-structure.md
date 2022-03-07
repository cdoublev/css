
# Value data structure

## Token

Normalization from a string to a list of tokens is the first step of parsing a CSS input.

A token represents a single code point, `<--`, or `-->`, implemented as a primitive string, or an identifier, eventually wrapped between quotes (a string), or a numeric, implemented as a plain object with the following properties:

  - `type`: `Set`
  - `value`: `String`
  - `unit` (only for `<dimension-token>`): `String`

Note: `<dimension-token>` does not have [*the same `type` flag as number*](https://drafts.csswg.org/css-syntax-3/#consume-numeric-token) because it is never used and because a value matching `<number>` can not match `<dimension>` (except `0` for `<length>` and `<angle>`) and vice versa, therefore a `<dimension>` having `number` or `integer` as its `type` is kind of inappropriate.

Identifier and number tokens are neither implemented as primitive strings or `String` instances because of the following limitations and potential issues:

  1. a primitive can not be assigned a property:

    ```js
    const length = '100px'
    length.type = 'length'
    console.log(length.type) // undefined
    ```

  2. `new String('foo') === 'foo'` and `['foo'].includes(new String('foo'))` are falsy (strict equality), while`` `${new String('foo')}` === 'foo'`` and `new String('foo').startsWith('f')` are truthy (`toString()` conversion)

  3. `new String(0) == ' '` is truthy

    - `==`: the left/right operand is coerced to primitive if one is an object and the other is a string/number
    - `<`, `<=`, `>`, `>=`: operands are coerced to primitives (with number as a preference `hint` for conversion)
    - an object is converted to a primitive with `valueOf()` if this method exists and receives `number` or nothing as a preference `hint`, otherwise with `toString()`

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

## CSS component value

> A component value is one of the preserved tokens, a function, or a simple block.

A component value is the same data structure than the corresponding token, except a function and a simple block. A function also has a name (`String`) and a simple block has an `associatedToken` (`String`).

The different specifications for parsing a CSS value involve different kind of types:

- token types: `<ident-token>`, `<number-token>`, `<dimension-token>`, etc.
- CSS types: `<ident>`, `<number>`, `<dimension>`, `<length>`, `<calc-sum>`, `<calc-product>`, etc.
- types of `<math-function>` : a `Map` whose entries are numeric CSS types as keys and integers as values, and which has an optional `percentHint` property assigned a numeric CSS type, ie. `Map { [Type]: Integer, percentHint: Type }`
- types of calculation tree nodes: `Sum`, `Product`, `Negate`, or `Invert`

The types of a `<math-function>` are used to check that a calculation tree matches the numeric CSS type it replaces. The types of calculation tree nodes are used to represent and simplify the calculation tree, and they correspond to the subclasses of `CSSMathValue` (which extends `CSSNumericValue`) defined in Typed OM: `CSSMathSum`, `CSSMathProduct`, `CSSMathNegate`, `CSSMathInvert`.

Token and CSS types are partially overlapping: both are used to parse a CSS input against a CSS value definition. The token types can be used to match a component value against a CSS value definition representing a terminal CSS type. Eg. to match a `<number>`, the input must be an object with `number-token` as its `type`. While the token types are exclusive, ie. a token can only have a single type (but it may have a `type` flag, eg. `number` or `integer` for `<number-token>`), the CSS types are inclusive, ie. some types are subtypes of another CSS type.

Therefore the current implementation assimilates a token type with the corresponding CSS type, by removing the `-token` suffix part in its name when creating the token. Because some value definitions are defined with token types, all token types are aliased to the corresponding CSS type, except `<function-token>` and `<dimension-token>` (see related issue in [the documentation for parsing math functions](./math-function.md)).

All uses of token types:

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

These value definitions are inappropriate because any CSS input will go through *consume a component value*. Eg. `<function-token> (<any-value>)`, which is used *to allow for future expansion of the grammar* of a functional pseudo-class or media query, represents two objects, which will be consumed as a single function component value. Even if Syntax defines that it *makes no difference to any of [its] algorithms*, it prevents matching any CSS input against this value definition.

`<function-token> (<any-value>)` is replaced by `<function>` in the value definition of `<general-enclosed>` and `<pseudo-class-selector>`, and `<function>` matches a component value when its `type` includes `function`.

For the purpose of serialization, a CSS component value must be able to have multiple types and a "main" CSS type. Eg. how a CSS component value matching `<alpha-value>` is serialized depends on whether it also matches either `<number>` or `<percentage>`. This can be implemented with either:

  1. composition: `{ type: 'alpha-value', value: { type: 'number', value: 1 } }`
  2. convention(s) (the main type is the last item in the list): `{ type: ['number', 'alpha-value'], value: 1 }`
  3. heritage: `class AlphaValue extends NumberValue { value: 1 }`

The first implementation makes it harder to read a value matching subtype(s), eg. when serializing a `<color>` that is a `<named-color>` (which is an `<ident>`), the value must be read from `color.value.value.value`.

The second implementation makes checking the type of a value more brittle, eg. when serializing an `<alpha-value>` that is a `<percentage>` implemented as `{ type: ['number', 'percentage', 'alpha-value'], value: 1, unit: '%' }`, ie. as *a `<percentage-token>` with the same value and type flag as [the] number [it represents]*, `<percentage>` must be checked before `<number>`.

The third implementation makes checking the type of a value more brittle, eg. when serializing `<alpha-value>` that is a `PercentageValue` that extends `NumericValue`, `instanceof PercentageValue` must be checked before `instanceof NumberValue`. Not extending `NumberValue` from `PercentageValue` has other drawbacks. Finally, it is cumbersome to represent all types with a set of classes that must eventually interact (inherit, compose) with each other.

The current implementation uses convention and automatically add a matching CSS type to a CSS component value.

## CSS value: one or more component values

WIP
