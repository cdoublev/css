
# Serializing CSS

This document explains how a CSS value is serialized. It focuses on CSS *property* values because their serialization can vary depending on the interface, whereas other values always serialize as specified values.

Serialization is somewhat under specified therefore it is prone to many browser inconsistencies and non-conforming behaviors. As long as browser outputs are the same and conform to the specifications, this library should produce the same output.

## General principles

The general serialization principles are defined in the procedure for [*serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value) (step 2) and can be summarized as follows:

  1. round trip from parsing to serializing must not change the meaning of the value
  2. find the simplest way to re-specify the input in the most backward compatible way

The first principle means that the result from parsing an input must be the same data representation than the result from parsing the serialization of the data representation. The initial input and the serialization may vary but can be considered as equivalent. It does not apply to shorthands, which should serialize to an empty string when they cannot exactly represent the values of all their sub-properties.

The second principle means sorting component values in the canonical order defined by the grammar and removing component values that can be omitted. But backward compatibility with older syntaxes may require to sort in a different order and to keep or add component values that can be omitted in newer syntaxes.

## Declared to actual value

`Element.style`, and multiple `CSSRule.style` and `HTMLElementStyle.style` existing at different locations, can have different declaration values for the same property and applying to the same `Element`. CSS cascade defines how to resolve a *cascaded value* from these declared values, and other values at later processing steps:

  - *authored value*: the input value used to set the property
  - [declared value](https://drafts.csswg.org/css-cascade-5/#declared): *each property declaration applied to an element contributes a declared value for that property*
  - [cascaded value](https://drafts.csswg.org/css-cascade-5/#cascaded): *the declared value that wins the cascade*
  - [specified value](https://drafts.csswg.org/css-cascade-5/#specified): *the result of putting the cascaded value through the defaulting processes*, ie. the *inherited value* (as a computed value) when there is no declared/cascaded value, or the *initial value* defined for the property when it does not inherit or when there is no inherited value
  - [resolved value](https://drafts.csswg.org/cssom-1/#resolved-values): either the computed or used value
  - [computed value](https://drafts.csswg.org/css-cascade-5/#computed): *the result of resolving the specified value as defined in the “Computed Value” line of the property definition table*
  - [used value](https://drafts.csswg.org/css-cascade-5/#used): *the result of taking the computed value and completing any remaining calculations to make it the absolute theoretical value*
  - [actual value](https://drafts.csswg.org/css-cascade-5/#actual): *the used value after any such [user agent dependent] adjustments have been made*

The specified value may serialize to a slightly different value than the authored value, according to the general serialization principles, and because the lexical parser does not keep minor details like trailing decimal 0, letter case, etc.

The computed value is computed from the specified value according to the `Computed` line of the property definition table. It can be the same value than the specified value, or a value closer to its absolute equivalent, computed using data available before rendering, like property values of another `Element` or the viewport size.

The used value may be further resolved after rendering the document.

There are a few property/type specific rules defining their computed or used values across the specifications.

This is not defined in *serialize a CSS value* but how to serialize a value depends on how it is queried:

  - the specified value when queried from CSSOM or `Element` (`Element.style`, `Element.sizes`, `Element.srcset`, etc)
  - the resolved value when queried from `getComputedStyle()` or the `Computed` tab of browser development tools
  - the actual value when queried from the `Style` tab of browser development tools

Therefore this library is only concerned with the specified and resolved values.

## Model

## Specified value

CSS values are currently represented either as a `List` or a plain object, with a `type` property.

*Serialize a CSS value* accepts a single longhand declaration, or a list of declarations for a shorthand that must be reduced into a single declaration. Then the declaration value is represented as a list (plain array) of CSS component values, as defined in step 2.

This step 2 must reduce the list to represent the declaration value according to the shortest-serialization principle.

`serializeCSSComponentValueList()` is a custom abstraction of its steps 3 to 5, which serialize the list without regard to any defined `type`, and can be used by other serialization functions:

  > 3. Remove any `<whitespace-token>`s from components.
  > 4. Replace each component value in components with the result of invoking serialize a CSS component value.
  > 5. Join the items of components into a single string, inserting `" "` (U+0020 SPACE) between each pair of items unless the second item is a `","` (U+002C COMMA). Return the result.

The implementation of *serialize a CSS component value* does not expect a `type`-less value.

## Resolved value
