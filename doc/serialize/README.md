
# Serializing CSS

The procedure to [*serialize a CSS rule*](https://drafts.csswg.org/cssom-1/#serialize-a-css-rule) is rather explicit so this document focuses on serializing property values, which depends on the interface:

  - `Element.style`, `CSSRule.style`, `CSSRule.cssText`: the declared value
  - `getComputedStyle()`: the resolved value

`Element.style` and each `CSSRule.style` and `HTMLStyleElement.style` in the document can hold a declaration value for the same property and `Element`. CSS cascade defines how to resolve a *cascaded value* and other values at later processing stages:

  - *authored value*: the input value used to set the property
  - [declared value](https://drafts.csswg.org/css-cascade-5/#declared): *each property declaration applied to an element contributes a declared value for that property*
  - [cascaded value](https://drafts.csswg.org/css-cascade-5/#cascaded): *the declared value that wins the cascade*
  - [specified value](https://drafts.csswg.org/css-cascade-5/#specified): *the result of putting the cascaded value through the defaulting processes*, ie. the *inherited value* (as a computed value) when there is no cascaded value, or the *initial value* defined for the property when it does not inherit or when there is no inherited value
  - [resolved value](https://drafts.csswg.org/cssom-1/#resolved-values): either the computed or used value
  - [computed value](https://drafts.csswg.org/css-cascade-5/#computed): *the result of resolving the specified value as defined in the “Computed Value” line of the property definition table*
  - [used value](https://drafts.csswg.org/css-cascade-5/#used): *the result of taking the computed value and completing any remaining calculations to make it the absolute theoretical value*
  - [actual value](https://drafts.csswg.org/css-cascade-5/#actual): *the used value after any such [user agent dependent] adjustments have been made*

The declared value may serialize to a slightly different value than the authored value, according to the general serialization principles, and because the lexical parser does not keep minor details like trailing decimal 0, unit character case, etc.

The computed and later value may serialize to the same value than the declared value, or a value closer to its absolute equivalent, computed using data that may not be available while parsing the declared value, like property values declared for an ancestor `Element` or the size of the block container.


## General principles

General serialization principles are defined in step 2 of the procedure to [*serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value), and can be summarized as follows:

  1. round-trip from parsing to serializing must not change the meaning of the value
  2. find the simplest way to re-specify the input in the most backward compatible way

The first principle means that the representation resulting from parsing an input must be the same as the representation resulting from parsing its serialization. It does not apply to shorthands, which might be serialized with an empty string when they cannot represent all their longhands.

The second principle means sorting component values in the canonical order defined by the grammar and removing component values that can be omitted.


## Implementation

CSS values are currently represented either as a `List` or a plain object, with a `types` property.

*Serialize a CSS value* accepts a single longhand declaration, or a list of declarations for a shorthand that must be reduced into a single declaration. Then the declaration value is represented as a list (plain array) of CSS component values (step 2), simplified according to the shortest serialization principle.

`serializeCSSComponentValueList()` is a custom abstraction of steps 4 to 5 that can be used by other specific serialization functions, and serializes the provided list ignoring its `types` and using its `separator` (default: whitespace), whereas `serializeCSSComponentValue()` is the implementation of *serialize a CSS component value*, and run any specific serialization function according to its `types`:

  > 3. Remove any `<whitespace-token>`s from components.
  > 4. Replace each component value in components with the result of invoking *serialize a CSS component value*.
  > 5. Join the items of components into a single string, inserting `" "` (U+0020 SPACE) between each pair of items unless the second item is a `","` (U+002C COMMA). Return the result.

Step 3 is skipped since `<whitespace-token>`s are already removed from the representation of all productions but arbitrary ones (this could otherwise prevent validating a parent production like `<whole-value>`), which are represented with a `List` whose `separator` is an empty string.
