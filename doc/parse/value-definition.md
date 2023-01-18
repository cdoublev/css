
# CSS value definition

The CSS grammar is mostly defined with a basic syntax expressed with the [CSS value definition syntax](https://drafts.csswg.org/css-values-4/#value-defs).

## CSS value definition syntax

The CSS value definition syntax is a variant of the Backus-Naur Form (BNF), which is a metasyntax notation to define the grammar of formal languages like programming languages, using production rules.

A production rule is an axiom schema, ie. an association, a mapping, a declaration, a rewriting rule of a non-terminal symbol, whose name is wrapped between `<` and `>`, with a set of one or more non-terminal and/or terminal symbols. The production, ie. the left hand side of the production rule, is a reference to this set that can be used in other production rules.

In CSS, one or more code points are consumed into a token then one or more tokens are consumed into a single component value: a terminal. Terminals are represented with a single code point in a value definition, possibly wrapped between quotes, or with their name wrapped between `<` and `>`.

By extension, named symbols can also refer to the matching data type.

A single code appearing between quotes in a value definition defines a `<delim-token>` of the corresponding `value`. `/` is the only `<delim-token>` annotated without quotes. `:`, `;`, `,`, ` `, define `<colon-token>`, `<semicolon-token>`, `<comma-token>`, `<whitespace-token>`, respectively.

A sequence of code points defines an `<ident-token>` whose `value` is the corresponding (CSS-wide or pre-defined) keyword, which is a CSS basic data type. The other CSS basic data types are defined with their name wrapped between `<` and `>`:

  - `<number-token>`: `<integer>` or `<number>` depending on the `type` of its `value`
  - `<dimension-token>`: a `<dimension>` (`<length>`, `<time>`, etc) of the corresponding `unit`
  - `<percentage-token>`: `<percentage>`
  - `<hash-token>`: `<hash>` or `<id>` depending on the `type` of its `value`
  - `<string-token>`: `<string>`
  - `<url-token>`: `<url>`

Some component values are compounds of other component values. A simple block, eg. `{ <rule-list> }` or `( <calc-sum> )`, is defined with the symbols defining its `value`, wrapped between its associated code points:

  - `<[-token>` and `<]-token>`: annotated between quotes because `[` and `]` are used to group types
  - `<{-token>` and `<}-token>`: annotated literally
  - `<(-token>` and `<)-token>`: annotated literally

A function is defined like a simple block, but prefixed with its `name`, eg. `round(<rounding-strategy>?, <calc-sum>, <calc-sum>)`, noting that `<function-token>` defines a function `name` and the following `<(-token>`. Similarly, an at-rule is defined with its `name` prefixed with `@` (defined together by `<at-keyword-token>`), before its optional prelude and block value, eg. `@page <page-selector-list>? { <declaration-list> }`.

A non-terminal can have the same name as a CSS property name, wrapped between `<'` and `'>`. It references the same value definition than the corresponding property but ignoring any `#` multiplier at the top-level (not nested in a block).

A CSS value can be a component value, a property/descriptor declaration, a rule, or a list of these values. With multipliers and combinators, non-terminals and terminals allow to define any CSS value, but a CSS type, a property, descriptor, or rule value definition, may be completed with specific rules that cannot be defined with the CSS value definition syntax.

**Non-terminal and terminal types:**

| Type                  | Syntax                                   |
| --------------------- | ---------------------------------------- |
| Delimiter             | `:`, `;`, `,`, `/`, `'+'`, `'-'`, etc.   |
| Keyword               | `keyword`                                |
| Terminal CSS type     | `<number>`, `<length>`, `<string>`, etc. |
| Non-terminal CSS type | `<alpha-value>`, `<color>`, etc.         |
| Property alias        | `<'property'>`                           |
| Simple block          | `( ... )`, `'['...']'`, `{ ... }`        |
| Function              | `fn(...)`                                |
| Rule                  | `@rule ... { ... }`, `@rule ... ;`       |

Numeric productions can be defined a range. Dimensions mixed with `<percentage>` (eg. `<length-percentage>`) and dimensions accepting relative units can only be defined with `0`, `-∞`, `∞`, eg. `<length [0,∞]>` or `<time-percentage [-∞, 0]>`. Dimensions can be defined with non-canoical units, eg. `<angle [0,1turn]>`.

**Combinators:**

| Syntax     | Description                 | Precedence                           |
| ---------- | --------------------------- | ------------------------------------ |
| `a b`      | `a` and `b` in this order   | `a b` == `[a b]`                     |
| `a && b`   | `a` and `b` in any order    | `a && b c` == `a && [b c]`           |
| `a \|\| b` | `a` and/or `b` in any order | `a \|\| b && c` == `a \|\| [b && c]` |
| `a \| b`   | `a` (x)or `b`               | `a \| b \|\| c` == `a \| [b \|\| c]` |

**Multipliers:**

| Syntax   | Range |      Separator |
| -------- | ----- | -------------- |
| `?`      | 0 - 1 |                |
| `*`      | 0 - ∞ |          `' '` |
| `+`      | 1 - ∞ |          `' '` |
| `{n}`    |     n |          `' '` |
| `{n,}`   | n - ∞ |          `' '` |
| `{n,x}`  | n - x |          `' '` |
| `#`      | 1 - ∞ |          `','` |
| `#?`     | 0 - ∞ |          `','` |
| `#{n}`   |     n |          `','` |
| `#{n,}`  | n - ∞ |          `','` |
| `#{n,x}` | n - x |          `','` |
| `+#?`    | 0 - ∞ | `' '` or `','` |
| `+#`     | 1 - ∞ | `' '` or `','` |

`[a? b?]!`: `a` and/or `b` in this order.

Block based values are never defined with a multiplier.

A value is *optional* when there can be zero or more occurrences in the input. A value is *omitted* when there is zero occurrence in the input.

A comma is optional when it is following or preceding an omitted value, eg. `a` matches `a, a?`, even if it is not defined with a multiplier.

A whitespace is almost always optional between component values, eg. `1px+1px` is parsed to the same two component values. It is required before `+` and `-` in `<calc-sum>` and between two `<compound-selector>`s of a `<complex-selector>` when `<combinator>?` is omitted. It is forbidden in `<urange>` and top-level component values in `<compound-selector>`.

## Extracting and curating CSS value definitions

The CSS value definitions are extracted by [`w3c/reffy`](https://github.com/w3c/reffy) from CSS specifications, and then written to these files:

  - `/lib/descriptors/definitions.js`
  - `/lib/properties/definitions.js`
  - `/lib/values/definitions.js`

Rules are manually defined in `lib/rules/definitions.js`.

Some definitions are extracted from specifications whose status is `Unofficial Draft` and/or that have a warning `Not Ready` (for implementation). These specifications are either entirely or partially ignored.

Some definitions cannot be extracted by `w3c/reffy`, are written in prose, or the same CSS value can be defined in different specifications, sometimes with different definitions, for different reasons:

  - a specification is partially or entirely superseded by one or more specifications
  - a definition is duplicated instead of linking to a definition from an authoritative specification
  - a definition only includes new values allowed in the definition from the authoritative specification

The following processing steps are applied to work around these problems:

  - replace a definition written in prose with the appropriate value definition
  - give priority to the definition from the authoritative specification
  - append new values to the definition from the authoritative specification

Additionally, the following steps are applied:

  - skip terminal definitions: they cannot be defined with a value definition
  - skip definitions of legacy property name aliases and mapping properties: they are resolved at parse time
  - remove `initial` shorthand values: shorthands should not have an `initial` value
  - remove `initial` descriptor value defined with `n/a` or a similar value: they should be undefined
  - replace `initial` longhand values with the result from a round trip (parse then serialize): the `initial` value of `border-<side>-color` (among other properties) is defined with `currentColor` instead of `currentcolor` ([issue](https://github.com/w3c/csswg-drafts/issues/7629)) but not all `initial` values must serialize to lowercase (eg. `unicode-range`)
  - trim extra whitespace after `(` and `[` or before `]` and `)` in `value`
  - remove extra `[]` in `value`
