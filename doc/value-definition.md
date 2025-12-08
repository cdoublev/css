
# CSS value definition

The CSS grammar is primarily defined with value definitions. They are sometimes called *"basic syntax"*, but they often also encode semantics.


## Syntax

The [CSS value definition syntax](https://drafts.csswg.org/css-values-4/#value-defs) is a variant of the Backus-Naur Form (BNF), which is a metasyntax to define formal grammars with production rules, aka. derivation rules.

A production rule is a mapping between symbols. The left-hand side is a non-terminal symbol that can be used in the right-hand side of other production rules, which is a set of one or more non-terminal and terminal symbols. Non-terminals are annotated between `<` and `>`.

In CSS, tokens are either annotated like non-terminals, or literally, with the corresponding code point(s), possibly wrapped between quotes.

The formers are produced by the CSS basic data types:

  - `<number-token>`: `<integer>`, `<number>`
  - `<dimension-token>`: `<length>`, `<time>`, etc
  - `<percentage-token>`: `<percentage>`
  - `<hash-token>`: `<id>`, `<hex-color>`, etc
  - `<string-token>`: `<string>`
  - `<url-token>`: `<url>`

Identifiers are shorthand notations for an `<ident-token>` restricted to a specific value, ie. a keyword. Those starting with `@` are shorthands for `<at-keyword-token>` restricted to a specific value.

Literal tokens annotated between quotes represent a `<delim-token>` of the corresponding code point. `/` is the only `<delim-token>` annotated without quotes. `:`, `;`, `,`, `(`, `)`, `{`, `}`, represent the corresponding `<*-token>`. ` ` does not represent `<whitespace-token>`, which is never represented in value definitions.

The notations of rules, functions, simple blocks, are agnostic as to their representation (a list of tokens or a structured object). Their value is annotated between the symbols of their associated tokens, which are wrapped between quotes for `[]` block, because `[...]` is interpreted as a group of symbols.

Non-terminals whose name is wrapped between quotes produce the same value definition than the corresponding property, but ignoring any `#` multiplier at the top-level (not nested in a block).

**Symbols**

| Syntax                              | Categories                                     |
| ----------------------------------- | ---------------------------------------------- |
| `<*-token>`                         | terminal, token, production                    |
| `,`, `;`, `'+'`, `'-'`, etc.        | terminal, token, delimiter                     |
| `(...)`, `'['...']'`, `{ ... }`     | terminal, structure, simple block              |
| `fn(...)`, `<function-token> ... )` | terminal, structure, function                  |
| `@rule ... { ... }`, `@rule ... ;`  | terminal, structure, rule                      |
| `keyword`                           | non-terminal, production, keyword              |
| `<css-type>`                        | non-terminal, production                       |
| `<'property'>`                      | non-terminal, production, property value range |

Numeric productions can be defined a range. Dimension ranges can be defined with non-canonical units, eg. `<angle [0,1turn]>`, but they must be absolute. When mixed with `<percentage>` (eg. `<length-percentage>`), the range can only be defined with `0`, `-∞`, `∞`, eg. `<length [0,∞]>` or `<time-percentage [-∞, 0]>`.

Non-terminals and terminals can be combined to produce an alternation, an arrangement, or a permutation.

**Combinators**

| Syntax   | Description                 | Precedence                       |
| -------- | --------------------------- | -------------------------------- |
| `a b`    | `a` and `b` in this order   | `a b` == `[a b]`                 |
| `a && b` | `a` and `b` in any order    | `a && b c` == `a && [b c]`       |
| `a || b` | `a` and/or `b` in any order | `a || b && c` == `a || [b && c]` |
| `a | b`  | `a` (x)or `b`               | `a | b || c` == `a | [b || c]`   |

Non-terminals and terminals can also be multiplied.

**Multipliers**

| Syntax   | Range | Preceding multiplier allowed |
| -------- | ----- | ---------------------------- |
| `{n}`    |     n | `#`                          |
| `{n,x}`  | n - x | `#`                          |
| `?`      | 0 - 1 | `#`, `{n}`, `{n,x}`          |
| `*`      | 0 - ∞ |                              |
| `+`      | 1 - ∞ |                              |
| `#`      | 1 - ∞ | `+`                          |

Multipliers are interpreted from left to right: `a+#` represents one or more lists separated by `,` of one or more `a` separated by ` `.

A value is *optional* when there can be zero or more occurrences in the input. It is *omitted* when there is zero occurrence.

Even if it is not suffixed with `?`, `,` may be optional when it follows or precedes an omitted value.

A whitespace, or the absence of a whitespace, are meaningless in value definitions.


## Extraction and curation

`scripts/extract.js` generates the following files from the value definitions extracted from the CSS specifications by [`w3c/reffy`](https://github.com/w3c/reffy):

  - `/lib/descriptors/definitions.js`
  - `/lib/properties/definitions.js`
  - `/lib/values/definitions.js`

Rules are manually defined in `lib/rules/definitions.js`.

[CSS Fill and Stroke 3](https://drafts.fxtf.org/fill-stroke-3/) is supposed to supersede [SVG Strokes](https://svgwg.org/specs/strokes/), which is supposed to supersede [SVG 2](https://svgwg.org/svg2-draft/), but browsers only implement the properties from SVG 2, therefore all definitions from CSS Fill and Stroke 3 and SVG Strokes are ignored.

Some definitions cannot be extracted by `w3c/reffy`, are written in prose, or exist in multiple specifications, sometimes with different values, for different reasons:

  - a specification is partially or entirely superseded by one or more specifications
  - a definition is duplicated instead of linking to a definition from an authoritative specification
  - a definition only includes new values allowed in the definition from the authoritative specification

The following processing steps are applied to work around these problems:

  - replace a definition written in prose with the appropriate value definition
  - give priority to the definition from the authoritative specification
  - append new values to the value definition from the authoritative specification

**Note:** `w3c/reffy` already appends new values but only to the value definition in the same specification.

Additionally, the following steps are applied:

  - skip definitions of terminals: they do not have a value definition
  - skip definitions of legacy property name aliases and mapping properties: they are resolved to the target property value definition at parse time
  - remove `initial` shorthand values: they are irrelevant and should not be defined
  - remove `initial` descriptor value defined with `n/a` or a similar value: they should simply not be defined
  - replace `initial` longhand values with the result of a round-trip: they are matched when serializing the shortest shorthand value, but some are defined with values that do not serialize exactly with the same value
  - replace `value` definitions with the result of a round-trip to remove extra groups, quotes, whitespaces


## Parsing

The output from parsing a value definition is a plain object with the following properties:

| Name        | Type                   | Description                                                                                |
| ----------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `max`       | `Number`               | Maximum value for a numeric production                                                     |
| `min`       | `Number`               | Minimum value for a numeric production                                                     |
| `name`      | `String`               | The production name                                                                        |
| `range`     | `String`               | The value of a keyword, an at-keyword, or `<function-token>` to match                      |
| `separator` | `String`               | The delimiter token value separating repetitions                                           |
| `type`      | `String`               | The type of grammar                                                                        |
| `value`     | `[Definition]\|String` | The definitions of child symbols, the value definition of a non-terminal, or a token value |

While the `value` of a non-terminal is parsed just in time (which allows recursion and is less complex), the `value` of a simple block and a function is immediately parsed into a definition object.

**Categories of `definition.type`**

  - branch
    - production
      - `non-terminal`
    - combination
      - ` ` (sequence)
      - `&&` (sequence)
      - `||` (sequence)
      - `|`
    - multiplied
      - `repetition` (sequence)
      - `optional`
      - `required`
  - leaf
    - production
      - `rule`
      - `declaration`
      - `arbitrary`
      - `forgiving`
      - `token`
    - generic
      - `block`
      - `function`
      - `omitted` (ie. `<null-token>`)

A *sequence* defines a branch node that can have one or more children.

**Symbol**

| Symbol             | Definition                                                                        |
| ------------------ | --------------------------------------------------------------------------------- |
| `'+'`              | `{                    type: 'token',        value: '+' }`                         |
| `<number-token>`   | `{ name: '<number>',  type: 'token'         }`                                    |
| `<number [0,]>`    | `{ name: '<number>',  type: 'non-terminal', min: 0, max: Infinity }`              |
| `keyword`          | `{ name: '<keyword>', type: 'non-terminal', value: '<ident>', range: 'keyword' }` |
| `<parent>`         | `{ name: '<parent>',  type: 'non-terminal', value: 'definition...' }`             |
| `<parent [0,]>`    | `{ name: '<parent>',  type: 'non-terminal', value: 'definition...', ... }`        |
| `<fn()>`           | `{ name: '<fn()>',    type: 'non-terminal', value: 'definition...' }`             |
| `<'property'>`     | `{ name: 'property',  type: 'non-terminal', value: 'definition...' }`             |
| `fn(<type>)`       | `{ name: 'fn',        type: 'function',     value: { name: '<type>', ... } }`     |
| `fn(<type>)`       | `{ name: 'fn',        type: 'function',     value: { name: '<type>', ... } }`     |
| `@rule { <type> }` | `{ name: '@rule',     type: 'function',     value: { name: '<type>', ... } }`     |

**Multiplied symbol**

| Type        | Definition                                                                |
| ----------- | ------------------------------------------------------------------------- |
| `a?`        | `{ type: 'optional', value: { ... } }`                                    |
| `a#?`       | `{ type: 'optional', value: { ... } }`                                    |
| `[a?]!`     | `{ type: 'required', value: { ... } }`                                    |
| `a*`        | `{ type: 'repetition', min: 0, max: 20, value: { ... } }`                 |
| `a+`        | `{ type: 'repetition', min: 1, max: 20, value: { ... } }`                 |
| `a#`        | `{ type: 'repetition', min: 1, max: 20, separator: ',', value: { ... } }` |
| `a+#`       | `{ type: 'repetition', min: 1, max: 20, separator: ',', value: { ... } }` |
| `a{0,n}`    | `{ type: 'repetition', min: 0, max: n, value: { ... } }`                  |
| `a#{0,n}`   | `{ type: 'repetition', min: 0, max: n, separator: ',', value: { ... } }`  |

The result of parsing against `<foo>?` is a single component value whereas the result of parsing against `<foo>{0,1}` is a list of zero or one component value. However, any value matching `<foo>?`, `<foo>{0,1}`, `<foo>*`, `<foo>#`, is considered as omitted.

**Combination**

| Type        | Definition                     |
| ----------- | ------------------------------ |
| `a a`       | `{ type: ' ', value: [...] }`  |
| `a && a`    | `{ type: '&&', value: [...] }` |
| `a || a`    | `{ type: '||', value: [...] }` |
| `a | a`     | `{ type: '|', value: [...] }`  |
| `a [a | a]` | `{ type: ' ', value: [...] }`  |
