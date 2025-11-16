
# Serializing CSS

This document focuses primarily on the serializaton of property values, given that descriptor values do not cascade and do not include relative values, and that the procedure to [serialize a rule](https://drafts.csswg.org/cssom-1/#serialize-a-css-rule) is quite explicit.

Property values are either exposed as [resolved values](https://drafts.csswg.org/cssom-1/#resolved-values) from `getComputedStyle()`, or as [declared values](https://drafts.csswg.org/css-cascade-5/#declared) from `CSSStyleDeclaration`.

The document may hold declared values for the same `Element` and property in `document.styleSheets`, `document.adoptedStyleSheets`, and `Element.style`. CSS cascade defines how to resolve a single [cascaded value](https://drafts.csswg.org/css-cascade-5/#cascaded). At later processing stages, it becomes a resolved value, which is either the [computed value](https://drafts.csswg.org/css-cascade-5/#computed) or the [used value](https://drafts.csswg.org/css-cascade-5/#used).

Declared property values (and descriptor values, rule preludes) may serialize to a slightly different value than the authored value, according to the general serialization principles, and because the lexical parser does not keep minor details like trailing decimal 0, unit character case, etc.

The computed and later value may serialize to the same value than the declared value, or a value closer to its absolute equivalent, computed using data that may not be available while parsing the declared value, like property values declared for an ancestor `Element` or the size of the block container.


## General principles

General serialization principles are defined in step 2 of the procedure to [*serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value), and can be summarized as follows:

  1. round-trip from parsing to serializing must not change the meaning of the value
  2. find the simplest way to re-specify the input in the most backward compatible way

The first principle means that the representation resulting from parsing an input must be the same as the representation resulting from parsing its serialization. It does not apply to shorthands, which might be serialized with an empty string when they cannot represent all their longhands.

The second principle means sorting component values in the canonical order defined by the grammar and removing component values that can be omitted.

Omitting component values is primarily intended for backward compatibility.


## Implementation

`serializeValue()` is an implementation of the procedure to [serialize a CSS value](https://drafts.csswg.org/cssom-1/#serialize-a-css-value). It takes either a single longhand declaration or for a shorthand, a list of declarations that must be reduced to a single declaration (step 1). Then it represents the declaration value as a list of CSS component values simplified according to the shortest serialization principle (step 2).

`serializeComponentValueList()` is an implementation of steps 3 to 5, which [serialize [each] component value](https://drafts.csswg.org/cssom-1/#serialize-a-css-component-value) according to its type, which is implemented with `serializeComponentValue()`, and separates them with a whitespace when appropriate.

`serializeComponentValueList()` ignores any existing type on the provided list, like `<position>` for `background-position`, which requires serializing two component values even when it was declared with one. Therefore `serializeValue()` is implemented with `serializeComponentValue()` instead, which accepts a component value as a single object but also as a list of component values or a plain `String` produced at step 2 of `serializeValue()`, which is implemented with `representDeclarationValue()`.

`represent<PropertyOrDescriptor>()` takes a single declaration for a longhand or a list of declarations for a shorthand, and returns a simplified/reified value that is often partially or fully serialized (and is then passed to `serializeComponentValue()`), which avoids writing imperative code to serialize each part.

`serialize<Type>()` takes a component value or a list of component values, and returns a simplified and fully serialized value according to specific rules defined for `Type`.
