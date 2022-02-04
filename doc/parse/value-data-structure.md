
# Value data structures

## Component value

> A component value is one of the preserved tokens, a function, or a simple block.

A component value is the same data structure than the corresponding token, except for a function and a simple block.

A token is implemented as a plain object with `type` as a `Set`, and `value` as an `Array` for `<function-token>`, otherwise as a `String`.

A `<dimension-token>` has an additional `unit`. It does not have [*the same `type` flag as number*](https://drafts.csswg.org/css-syntax-3/#consume-numeric-token) because it does not bring anything usefull but only additional complexity when looking at the CSS type(s) to decide how a component value should be serialized. Furthermore, a value matching `<number>` can not match `<dimension>` (except `0` for `<length>` and `<angle>`) and vice versa, therefore a `<dimension>` having `number` or `integer` as its `type` is kind of inappropriate.

A `<function-token>` has an additional `name` property assigned the `string` resulting from *consume an ident-like token*.

A simple block component value has an `associatedToken` property assigned the current input token when running *consume a simple block*.

Tokens are neither implemented as primitive strings or `String` instances because of the following limitations and potential issues:

- a primitive can not be assigned a property:

  ```js
  const length = '100px'
  length.type = 'length'
  console.log(length.type) // undefined
  ```

- `new String('foo') === 'foo'` and `['foo'].includes(new String('foo'))` are falsy (strict equality), while`` `${new String('foo')}` === 'foo'`` and `new String('foo').startsWith('f')` are truthy (`toString()` conversion)

- `new String(0) == ' '` is truthy

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

## CSS value

### Type system

The different specifications for parsing a CSS value involve different kind of types:

- token types: `<ident-token>`, `<number-token>`, `<dimension-token>`, etc.
- CSS types: `<ident>`, `<number>`, `<dimension>`, `<length>`, `<calc-sum>`, `<calc-product>`, etc.
- types of `<math-function>` : a `Map` whose entries are numeric CSS types as keys and an integers as values, and which has an optional `percentHint` property assigned a numeric CSS type, ie. `Map { [Type]: Integer, percentHint: Type }`
- types of calculation tree nodes: `Sum`, `Product`, `Negate`, or `Invert`

The types of a `<math-function>` and a calculation tree are used when parsing a `<math-function>`: the formers are used to check that the calculation tree matches the numeric CSS type it replaces, and the latters are used to represent and simplify the calculation tree and corresponds to subtypes of `CSSNumericValue`: a JavaScript interface defined in Typed OM to represent and interact with numeric values and `<math-function>`s (eg. `CSSMathSum`, `CSSMathProduct`, `CSSMathNegate`, `CSSMathInvert`, which extends `CSSMathValue`, which extends `CSSNumericValue`).

The token types are used to parse the syntax of all values, while CSS types are used to parse and serialize a list of component values according to the corresponding production. The token types are exclusive, ie. a token can only have a single type, but it may have a `type` flag (eg. `number` or `integer` for `<number-token>`), while the CSS types are inclusive, ie.some types are subtypes of another CSS type.

Token and terminal CSS types share similar names and a CSS component value is *one of the preserved tokens, a function, or a simple block*, ie. it is the same data structure than the matching token. For example, to match `<number>`, a CSS component value should be a `<number-token>`.

Therefore the current implementation assimilates a token type with the corresponding CSS type when creating a token, by removing the `-token` suffix part in its name. Because some productions are defined with token types, these productions are also modified in the same way. An alternative would be to make token types aliases of the corresponding CSS types but this direction feels awkward, while the other way around makes harder to implement the parse functions of these CSS terminal types.

For the purpose of serialization, a CSS component value should be able to have multiple types and a "main" CSS type. Eg. how a CSS component value matching `<alpha-value>` is serialized depends on whether it also matches either `<number>` or `<percentage>`. This can be implemented with either:

1. composition: `{ type: 'alpha-value', value: { type: 'number', value: 1 } }`
2. convention(s) (the main type is the last item in the list): `{ type: ['number', 'alpha-value'], value: 1 }`
3. heritage: `class AlphaValue extends NumberValue { value: 1 }`

The first implementation makes it harder to read a value matching subtype(s), eg. when serializing a `<color>` that is a `<named-color>` (which is an `<ident>`), the value should be read from `color.value.value.value`.

The second implementation makes checking the type of a value more brittle, eg. when serializing an `<alpha-value>` that is a `<percentage>` implemented as `{ type: ['number', 'percentage', 'alpha-value'], value: 1, unit: '%' }`, ie. as *a `<percentage-token>` with the same value and type flag as [the] number [it represents]*, `<percentage>` should be checked before `<number>`.

The third implementation makes checking the type of a value more brittle, eg. when serializing `<alpha-value>` that is a `PercentageValue` that extends `NumericValue`, `instanceof PercentageValue` should be checked before `instanceof NumberValue`. Not extending `NumberValue` from `PercentageValue` has other drawbacks. Finally, it is cumbersome to represent all types with a set of classes that should eventually interact (inherit, compose) with each other.

The current implementation uses convention and automatically add a matching CSS type to a CSS component value.

### Single component value and a list of component values

WIP
