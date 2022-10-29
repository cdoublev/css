
# Substitution value

This document is about parsing and serializing a value containing `<var()>` (aka. a custom variable) or `<attr()>` in `<declaration-value>`, aka. a subsitution value.

## `<var()>`

https://drafts.csswg.org/css-variables-2/#using-variables

Parsing `<var()>` must short-circuit parsing a property value definition because `red var(--foo)` must be a valid `<color>` at parse time, even if `<color>` does not accept multiple component values:

> If a property contains one or more `var()` functions, and those functions are syntactically valid, the entire property’s grammar must be assumed to be valid at parse time. [...]

There is an [open issue](https://github.com/w3c/csswg-drafts/issues/6484) about missing details to serialize a `var()`-containing value, but the intent is to [serialize the same way as for a custom property value](https://drafts.csswg.org/css-variables-2/#serializing-custom-props):

> Specified values of custom properties must be serialized exactly as specified by the author. Simplifications that might occur in other properties, such as dropping comments, normalizing whitespace, reserializing numeric tokens from their value, etc., must not occur.

This requirement exists to allow authors to declare a non-CSS value for a custom property, which is not meant to be used in another property value. It means that serializing a `var()`-containing value must short-circuit *serialize a CSS value* to use the internal representation(s) of the input.

**Note:** Chrome serializes with the list of component values (with the simplifications mentioned above, and without comments) and Firefox does not preserve leading comments.

Leading and trailing whitespaces in declarations (eg. assigned to `CSSStyleDeclaration.cssText` or as part of a higher level value) must be removed, as now defined by *consume a declaration*, following the resolution noted in [this issue](https://github.com/w3c/csswg-drafts/issues/774). But it still remains undefined if they should be removed in the input of `CSSStyleDeclaration.setProperty()`, which is processed by *parse a list of component values* than *consume a component value*, which do not remove them.

**Note:** Chrome does not remove any whitespace and Firefox only removes leading whitespaces in declarations.

This library removes leading and trailing whitespaces from declarations and in *parse a list of component values*, and serializes the unsimplified input but only preserves comments interlaced between other component values.

**Note:** `--foo: initial` must be parsed to a declaration whose value is `initial`, which serializes to `initial` in a component of a specified value (before substituting `initial`) but to an empty string in a component of a computed value:

> The initial value of a custom property is a guaranteed-invalid value. [...]
>
> This value serializes as the empty string, but actually writing an empty value into a custom property, like `--foo: ;`, is a valid (empty) value, not the guaranteed-invalid value.

There are also some specificities for parsing and serializing [a shorthand or one of its longhands which has been set with a `var()`-containing value](https://drafts.csswg.org/css-variables-2/#variables-in-shorthands):

> `var()` functions produce some complications when parsing shorthand properties into their component longhands, and when serializing shorthand properties from their component longhands.
>
> If a shorthand property contains a `var()` function in its value, the longhand properties it’s associated with must instead be filled in with a special, unobservable-to-authors **pending-substitution value** that indicates the shorthand contains a variable, and thus the longhand’s value can’t be determined until variables are substituted. [...]
>
> Pending-substitution values must be serialized as the empty string, if an API allows them to be observed.

In this library, a pending-substitution value is a component value or a list of component values with a `pending` property set to `true`.

A longhand declaration cannot be assigned an empty string as a pending-substitution value, otherwise a shorthand would not be able to serialize to the pending-substitution value:

> Shorthand properties are serialized by gathering the values of their component longhand properties, and synthesizing a value that will parse into the same set of values.
>
> If all of the component longhand properties for a given shorthand are pending-substitution values from the same original shorthand value, the shorthand property must serialize to that original (`var()`-containing) value.

Declaring all longhands with the same value is not equivalent to declaring the shorthand with this value:

> Otherwise, if any of the component longhand properties for a given shorthand are pending-substitution values, or contain `var()` functions of their own that have not yet been substituted, the shorthand property must serialize to the empty string.

## `attr()`

> The `attr()` function substitutes the value of an attribute on an element into a property, similar to how the `var()` function substitutes a custom property value into a function.
>
> `attr() = attr( <wq-name> <attr-type>? , <declaration-value>?)`
>
> [...]
>
> If a property contains one or more `attr()` functions, and those functions are syntactically valid, the entire property’s grammar must be assumed to be valid at parse time. [...]

Implementation: same as `var()` but using `parseAttribute` implemented with `Parser.parse(input, '<attr()>')`.
