
# The CSS value definitions

A CSS input is parsed against an abstract syntax tree resulting from parsing a value definition expressed with the [CSS value definition syntax](https://drafts.csswg.org/css-values-4/#value-defs).

## The CSS value definition syntax

The syntax of the CSS value definitions includes terminals and non-terminals: a symbol name wrapped in `<>`, which is a CSS type. With delimiters, multipliers, combinators, they describe how to form a CSS value.

A CSS type may be completed with specific rules that can not be defined with the CSS value definition syntax. A CSS value is most often a `<declaration-value>` that must match the value definition corresponding to the property in the `<declaration>`, but it can also be an input that must match the value definition of a rule, its prelude, or its block.

A terminal is a CSS basic data type: a single component value (token). A delimiter (single code point) is also a component value.

A keyword is a "special" terminal whose value appears literally instead of being represented by a symbol. A keyword represents an `<ident-token>` whose value is the literal value.

A non-terminal is a symbol representing one or more terminals or non-terminals, optionally suffixed with multipliers and interleaved with combinators or delimiters. In the specification of a formal grammar like CSS, a non-terminal is named a production (or production rule).

A function is a "special" non-terminal: the function name appears literally and its argument(s) are wrapped in `()`.

**Component value types:**

| Type           | Description                                               |
| -------------- | --------------------------------------------------------- |
| Delimiter      | Unquoted `,`, `/`, and single quoted `'+'`, `'-'`, etc.   |
| `keyword`      | Global or pre-defined keywords as identifier token        |
| `(...)`        | Simple block (and its content)                            |
| `fn(...)`      | Function (and its arguments)                              |
| `<type>`       | Terminal type (`<type [i,j]>` only for numeric types)     |
| `<expanded>`   | Non-terminal type expanded to other type(s)               |
| `<'property'>` | Non-terminal type expanded to `<property>` (ignoring `#`) |

**Combinators:**

| Syntax     | Description                 | Precedence                           |
| ---------- | --------------------------- | ------------------------------------ |
| `a b`      | `a` and `b` in this order   | `a b` == `[a b]`                     |
| `a && b`   | `a` and `b` in any order    | `a && b c` == `a && [b c]`           |
| `a \|\| b` | `a` and/or `b` in any order | `a \|\| b && c` == `a \|\| [b && c]` |
| `a \| b`   | `a` (x)or `b`               | `a \| b \|\| c` == `a \| [b \|\| c]` |

A comma between types is a combinator subject to the comma-elision rules (detailed further below).

**Multipliers:**

| Syntax   | Range  |          Glue  |
| -------- | ------ | -------------- |
| `?`      | 0 -  1 |                |
| `*`      | 0 - 20 |          `' '` |
| `+`      | 1 - 20 |          `' '` |
| `{n}`    |      n |          `' '` |
| `{n,}`   | n - 20 |          `' '` |
| `{n,x}`  | n -  x |          `' '` |
| `#`      | 1 - 20 |          `','` |
| `#?`     | 0 - 20 |          `','` |
| `#{n}`   |      n |          `','` |
| `#{n,}`  | n - 20 |          `','` |
| `#{n,x}` | n -  x |          `','` |
| `+#`     | 1 - 20 | `' '` or `','` |

`[a? b?]!`: `a` and/or `b` in this order.

Note: `fn()` are never defined with a multiplier, eg. `fn(){1,2}`.

**Whitespace**

A whitespace is not meaningfull in a definition value, except in whitespace-separated list, eg. `a b c`.

A whitespace is required between component values, except in comma-separated list, around delimiters (excluding `'+'` and `'-'` in `<calc-sum>`), and in some productions (eg. in productions of a selector list).

- https://drafts.csswg.org/css-values-4/#component-whitespace
- https://drafts.csswg.org/css-values-4/#calc-syntax

**Comma**

Whitespaces around a comma are optional, both in definition values and list of component values.

Parsing a comma is subject to the [comma-elision rule](https://drafts.csswg.org/css-values-4/#comb-comma):

> Commas specified in the grammar are implicitly omissible in some circumstances, when used to separate optional terms in the grammar. Within a **top-level list** in a **property** or **other CSS value**, or a **function’s argument list**, a comma specified in the grammar must be omitted if:
>
>  1. all items preceding the comma have been omitted
>  2. all items following the comma have been omitted (except in `var()`)
>  3. multiple commas would be adjacent due to the item(s) between the commas being omitted.

The first sentence should be *... when used to separate an optional term with another term in the grammar* otherwise eg. `rgb( <percentage>#{3} , <alpha-value>? )` would not allow `, <alpha-value>` to be omitted because `<alpha-value>#{3}` is not an optional term.

A *top-level list* is any list of component values not nested in a function or block (groups are meaningless to comma-ellision rules, see https://github.com/w3c/csswg-drafts/issues/6557).

An exception to the comma-elision rule is [a trailing comma in `var()`](https://drafts.csswg.org/css-variables-1/#using-variables).

Some cases subject to comma-elision rules:

- `a?, a`: preceding the comma
- `a, a?`: following the comma
- `a, a?, a`: adjacent
- `a, [a?, a]`: adjacent
- `[a?, a?,] a`: preceding the comma
- `[a, && b?,] a`: preceding the comma
- `a [, a? , a?]`: following the comma
- `a [, a && , b?]`: following the comma

Some cases not subject to comma-elision rules:

- `a a?, a`
- `a, a? a`
- `a [a?, a]`
- `a [, a? a]`
- `[a a?,] a `

## Generating value definition list

The CSS definitions are generated from [`@webref/css`](https://github.com/w3c/webref):

- /lib/properties/definitions.js: `Export => { [Property]: { initial: String, value: String } }`
- /lib/values/types.js: `Export => { [Type]: String }`

Definitions output from `@webref/css` (version ~2.2) have several issues:

1. some definitions are duplicated accross multiple specifications
2. some definitions only represent new values from a "delta" version of the current draft specification
3. some definitions are written in prose instead of with the [CSS value definition syntax](https://drafts.csswg.org/css-values-4/#value-defs)
4. some CSS type definitions are missing

To workaround the above issues, the following steps are automatically applied when generating definition exports:

- pick the most up to date `value` and `initial`
- append delta `value`s to the current definition `value`
- replace a `value` written in prose by the corresponding CSS value definition syntax
- append missing types

Additionally, the following steps are applied:

- insert custom/implicit types:
  - `<css-wide-keyword>`
  - `<math-function>`
  - `<hsla()>`
  - `<rgba()>`
  - `<repeating-conic-gradient()>`
  - `<repeating-linear-gradient()>`
  - `<repeating-radial-gradient()>`
  - etc.
- remove terminal types: `<EOF-TOKEN>`, `<length>`, `<percentage>`
- remove `initial` shorthand values
- trim extra whitespace after `(` and `[` or before `]` and `)` in `value`
- remove extra `[]` wrapping `value`

Issues to report on the `w3c/csswg-drafts` repository:
  - replace `<number-percentage>` by `<number> | <percentage>`
    - `mask-border-slice`
    - `<brightness()>`
    - `<contrast()>`
    - `<grayscale()>`
    - `<invert()>`
    - `<opacity()>`
    - `<saturate()>`
    - `<sepia()>`
  - replace `<length> | <percentage>` by `<length-percentage>`
    - `float-offset`
    - `text-decoration-thickness`
    - `text-underline-offset`
    - `<fade()>`
    - `<viewport-length>`
  - replace `<uri>` (defined in prose in CSS2) by `<url>` or `<image>`
    - `cue-after`
    - `cue-before`
    - `shape-subtract`
  - `value` has extra whitespace (meaningfull, eg. `not` is not a function name in `not (<style-query>)`)
    - `supports-font-format-fn`: `font-format (<font-format>)`
    - `supports-font-tech-fn`: `font-tech (<font-tech>)`
  - `value` is missing whitespace (meaningless to the parser but meaningfull to the reader)
    - `<blend-mode>`: `... | color-dodge |color-burn | ...`
    - `<mask-layer>`: `... ||<repeat-style> || ...`
    - `flow-into`: `none | <ident> [element|content]?`
  - `value` has extra grouping `[]` (meaningless to the parser)
    - `cursor`
    - `outline`
    - `<angle-percentage>`
    - `<color-font-tech>`
    - `<common-lig-values>`
    - `<content()>`
    - `<contextual-alt-values>`
    - `<discretionary-lig-values>`
    - `<east-asian-variant-values>`
    - `<east-asian-width-values>`
    - `<font-feature-tech>`
    - `<font-format>`
    - `<font-stretch-css3>`
    - `<font-tech>`
    - `<font-variant-css2>`
    - `<font-weight-absolute>`
    - `<frequency-percentage>`
    - `<generic-voice>`
    - `<gradient>`
    - `<historical-lig-values>`
    - `<image-src>`
    - `<image-tags>`
    - `<length-percentage>`
    - `<media-feature>`
    - `<media()>`
    - `<numeric-figure-values>`
    - `<numeric-fraction-values>`
    - `<numeric-spacing-values>`
    - `<position>`
    - `<ray()>`
    - `<rotate()>`
    - `<rotateX()>`
    - `<rotateY()>`
    - `<rotateZ()>`
    - `<scaleX()>`
    - `<scaleY()>`
    - `<scaleZ()>`
    - `<skewX()>`
    - `<skewY()>`
    - `<time-percentage>`
  - `initial` does not match `value`
    - `-webkit-background-clip`: `none`
    - `bookmark-label`: `content(test)` (`value` is `<content-list>` but its expansion does not include `<content()>`)
    - `border-limit`: `round`
    - `border-start|end-start|end-radius`: `Same as border-top-left-radius`
    - `glyph-orientation-vertical`: `n/a` (SVG 1.1, deprecated by Writing Mode)
    - `shape-padding`: `none`
    - `white-space`: `auto`
  - `newValues` of `[[max|min]-][block|inline]-size` already defined by `<'[[max|min]-][width|height]'>`
  - `newValues` of `contain` is ambiguous
  - `clear` is missing `both-inline | both-block | both` (defined in prose)
  - `content` uses `[<content-replacement> | <content-list>]` instead of `<content-list>` (duplicate `<image>` in expansions)
  - `content` uses `element()` instead of `<element()>`
  - `content-level` (defined in prose in GCPM) uses `attr(<identifier>)` but `<identifier>` should be `<custom-ident>`
  - `<color-stop-list>` and `<angular-color-stop-list>` (Images) can not match a single implicit color stop: https://github.com/w3c/csswg-drafts/issues/6425
  - `<hue>` should not include `<none>` (but `<none>` should be a valid alternative value defined in the value definitions of the color functions, for consistency with other color function arguments)
  - `<size>` (defined in prose, Images) can be defined with `<length-percentage [0,∞]>{1,2}`: https://github.com/w3c/csswg-drafts/issues/6425
  - `<selector()>` (Scroll Animation): https://github.com/w3c/webref/issues/333

Issues to report on the `w3c/webref` repository:
  - `value` is missing (only `name` is extracted)
    - `stop-color`
    - `stop-opacity`
  - `value` is written in prose (and nothing is extracted)
    - `<absolute-size>`
    - `<basic-shape>`
    - `<bottom>`, `<left>`, `<right>`, `<top>` (`<rect()>` arguments)
    - `<content-level>`
    - `<counter-name>`
    - `<counter-style-name>`
    - `<custom-params>`
    - `<current()>`
    - `<dimension>`
    - `<dimension-unit>`
    - `<dir()>`
    - `<extension-name>`
    - `<has()>`
    - `<is()>`
    - `<lang>`
    - `<lang()>`
    - `<named-color>`
    - `<not()>`
    - `<nth-child()>`
    - `<nth-col()>`
    - `<nth-last-child()>`
    - `<nth-last-col()>`
    - `<nth-last-of-type()>`
    - `<nth-of-type()>`
    - `<outline-line-style>`
    - `<q-name>`
    - `<relative-size>`
    - `<size-feature>`
    - `<style-feature>`
    - `<system-color>`
    - `<transform-function>`
    - `<url-modifier>`
    - `<where()>`
    - `<x>`
    - `<xyz>`
    - `<y>`
