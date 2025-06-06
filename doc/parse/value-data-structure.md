
# Value data structure

A CSS value is either a component value, a declaration, a rule, or a list of these values. This document defines the data structures to represent them.

## Component value

Consuming the input into tokens is the first parse step before consuming tokens into component values.

A token represents either:

  - a numeric
  - an identifier (possibly prefixed with `#` or `@`)
  - a string (wrapped between `"` or `'`)
  - a specific sequence of code points (`<function-token>`, `<url-token>`, `<unicode-range-token>`)
  - a delimiter (a single code point, `<--`, or `-->`)

A token is defined in CSS Syntax with the following properties:

  - `value`: a `Number` for numeric tokens, otherwise a `String`
  - `sign`: a `String`, only for `<number-token>`, `<dimension-token>`, `<percentage-token>`
  - `type`: a `String`, only for `<hash-token>`, `<number-token>`, `<dimension-token>`
  - `unit`: a `String`, only for `<dimension-token>`

Except for functions and simple blocks, a component value is the same object than the consumed token: a preserved token. The `value` of functions and simple blocks is a list of component values. A function also has a `name` and a simple block has an `associatedToken`, which are both `String`.

A preserved token must expose its type in order to be matched against a token production. Some production rules directly include a token type:

  - `<function-token>`
    - `<general-enclosed>`
    - `<pseudo-class-selector>`
  - `<hash-token>`
    - `<id-selector>`
  - `<ident-token>`
    - `<attribute-selector>`
    - `<class-selector>`
    - `<custom-arg>`
    - `<ns-prefix>`
    - `<page-selector>`
    - `<pseudo-class-selector>`
    - `<wq-name>`
  - `<string-token>`
    - `<attribute-selector>`

**[Issue](https://github.com/w3c/csswg-drafts/issues/7016):** `<function-token>` cannot be matched because any CSS input goes through *consume a component value* before grammar validation.

A component value must expose its matched CSS type(s) in parse order, to apply any associated parsing and serialization rule. For example, a component value matching `<percentage>` and `<alpha-value>` must serialize as a `<number>` to the shortest possible form rather than as a `<percentage>`, therefore `<alpha-value>` must be read before `<percentage>`.

---

All component values are represented as plain objects exposing token and CSS types with a `types` property, rather than using classes (eg. `CSSNumber`, `CSSDimension`, etc) or separate properties (eg. `tokenType` and `cssTypes`).

A `<percentage-token>` can also be considered as a dimension (cf. [#7381](https://github.com/w3c/csswg-drafts/issues/7381)), therefore it is also implemented with a `unit` property, to simplify parsing and serializing.

In CSS Syntax:

  - `<number-token>` and `<dimension-token>` are defined with a `type` that is either `integer` or `number`
  - `<*-integer>` and `<*-dimension>` produced by `<an+b>` match `<number-token>` and `<dimension-token>` whose `type` is `integer`
  - `type` is `number` when the value is specified with `.` or the scientific notation (even `1.0` or `1e1`)

In this library, `<number-token>` and `<dimension-token>` do not have `type` and `<integer>`, `<*-integer>`, `<*-dimension>`, match a corresponding token whose `value` is an integer, which means `nth-child(1e1)` or `nth-child(1e1n)` should be discarded.

## Declaration and rule

A declaration is represented as a plain object with `types` including `<declaration>`, in order to be serialized when it appears in a list of component values (the prelude of `@supports`).

A rule and a style sheet are directly represented as a CSSOM object.
