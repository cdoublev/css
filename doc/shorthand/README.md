
# Shorthands

Related definitions:

  - https://drafts.csswg.org/css-cascade-5/#shorthand
  - https://drafts.csswg.org/css-variables-2/#variables-in-shorthands

A **shorthand** allows to declare multiple sub-properties by specifying a single input value. A **sub-property** can also be a shorthand. A **reset-only sub-property** is declared with its initial value whenever its shorthand is set.

There must be a mapping from each shorthand to its longhand sub-properties, in canonical order, to parse a shorthand value to longhand declarations (aka. shorthand expansion) and vice versa, to serialize a shorthand value from longhand declarations. This mapping must include reset-only sub-properties because the shorthand must serialize to `''` when some reset-only sub-property is not declared with its initial value.

**[Issue:](https://github.com/w3c/csswg-drafts/issues/6894)** the canonical order is not clearly defined, and it can correspond to an older syntax if backward compatibility with this syntax must be supported, which is never the case in this library.

## Expansion

The result of parsing a shorthand value must be expanded to the corresponding longhand declarations.

A longhand sub-property can be declared with:

  - the pending-substitution value (containing `var()` or `attr()`) specified for the shorthand value
  - the (single) CSS-wide keyword specified for the shorthand value
  - its initial value when it is omitted in the specified shorthand value (unless otherwise defined by its grammar) or if it is a reset-only sub-property
  - the specified shorthand value, a specific part, or an arbitrary value, according to the shorthand grammar
    - a directional longhand sub-property must be set to an implicit value when its value is omitted
    - `background-clip` must be set to the `background-origin` value when omitted in the `background` value
    - etc.

**Note:** Chrome declares a longhand sub-property to `initial` instead of its initial value when it is omitted, and it does not declare all longhand properties with the value specified for the `all` shorthand.

For each longhand in `lib/properties/definitions.js`, `scripts/initial.js` must assign an `initial` object with `parsed` and `serialized` properties.

`initial.parsed` is assigned the result from parsing the initial value defined in the property definition table. It must be used as the declaration value of a longhand that is omitted in the shorthand value.

**Note:** replacing a longhand value omitted in the shorthand value cannot be abstracted with a single function that would be looking for the longhand name in `component.type` or at a corresponding index in the list of component values, because shorthand grammars are not always/often defined with non-terminals named after each longhand, or as a simple combination of its whitespace separated longhands.

`initial.serialized` is assigned the result from serializing `initial.parsed`. It can be used to omit a longhand declaration value when serializing a shorthand, by comparing it with the result from the serialization of the longhand declaration value. This is easier and less complex than comparing component values.

**[Issue:](https://github.com/w3c/csswg-drafts/issues/7629)** `properties[longhand].initial.serialized` cannot be the initial value as defined in `longhand` definition table, because some initial values do not correspond to the result from a round trip (parse then serialize), eg. the initial value of `border-*-color` is `currentColor` which should serialize to `currentcolor`.

## Serialization

A sub-property must serialize to `''` when the shorthand has been specified with a pending-substitution value.

A shorthand must serialize to:

  - `''` if it *cannot exactly represent the values of all the properties in `list`*
    - some longhand is not declared
    - some longhand is declared with a different priority
    - some longhand is declared with a CSS-wide keyword (except if all are declared with the same keyword)
    - some longhand is declared with a substitution value of its own
    - some longhand is a reset-only sub-property declared with a value that is not its initial value
    - some longhand is declared with a value that the shorthand syntax cannot match
      - `animation` cannot represent all its longhands when `animation-name` has more values than other longhands
      - `background` cannot represent all its longhands when `background-image` has more values than other longhands
      - `font` cannot represent `font-variant` declared with a non-CSS2 value
      - `font` cannot represent `font-stretch` declared with a non-CSS3 value
      - etc.
  - the (loose) equal CSS-wide keyword declared for all its longhands
  - the (strict) equal pending-substitution value declared for all its longhands
  - the value composed from the declaration values for its longhand sup-properties according to the shorthand grammar and the shortest representation principle (detailed further below)
    - some directional longhand sub-property values must be omitted when they are equal
    - etc.

When running the implementation of *serialize a CSS value*, all longhands are guaranteed to have a declaration with the same priority (cf. definitions of `CSSStyleDeclaration.getPropertyValue()`, and *serialize a CSS block*, ie. `(get) CSSStyleDeclaration.cssText`).

This procedure defines that *the first shorthand property, in preferred order, that exactly maps to all of the longhand properties in `list`* must be found, but it is already known in `CSSStyleDeclaration.getPropertyValue()` and `(get) CSSStyleDeclaration.cssText`. Therefore its implementation slightly deviates from this definition to avoid searching for a shorthand twice. Instead of a list of the longhand declarations, it receives a declaration with the shorthand as its name and the list as its value.

This procedure defines that *[if] shorthand cannot exactly represent the values of all the properties in `list`, return the empty string*. Declarations for reset-only sub-properties are filtered out after validating that none is declared with a non-initial value, which makes further processings easier and more efficient in an iteration/loop over the remaining longhand declarations.

It also defines the shortest representation principle: *component values can be omitted or replaced with a shorter representation without changing the meaning of the value*. The initial values cannot all/always be excluded from the serialized shorthand value. Among other reasons, the shorthand would otherwise serialize to `''` when all longhands are declared with their initial value, if the shorthand value definition is a simple combination of its whitespace separated longhands. A [previous version of CSSOM](https://www.w3.org/TR/2011/WD-cssom-20110712/#serializing-css-values) required to include *the first allowed value* if none would remain.

Comparing component values can be non-trivial, therefore initial values are compared against `properties[longhand].initial.serialized` instead of `properties[longhand].initial.parsed`, which means that each longhand declaration value is usually serialized even if it ends up being excluded from the shorthand serialization.

WIP
