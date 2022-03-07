
# Shorthand and longhand properties

Related definitions:
  - https://drafts.csswg.org/css-cascade-5/#shorthand
  - https://drafts.csswg.org/css-variables-1/#variables-in-shorthands

Requirements:
  - longhands must be **set** to:
    - their initial value when their value is omitted in the shorthand (exception: see specific shorthand rules)
    - the CSS-wide keyword used to set shorthand
    - a pending-substitution value (serializing to empty string) when the shorthand contains `var()` or `attr()`
  - longhands may have to be **set** according to specific rules:
    - side longhands must be set to an implicit value when their value is omitted in the shorthand
    - `border-image` must be reset to its initial value when `border` is set
      - notes:
        - Firefox sets `border-image` longhands to their initial values instead of removing them (strict vs *soft* compliance)
        - Chrome sets `border-image` longhands to `initial` instead of their initial values (non-compliant behavior)
        - both remove `border-image` longhands when `border` is removed (unspecified behavior)
    - `background-clip` must be set to the value of `background-origin` value when their value is omitted in `background`
    - etc.
  - longhands must **serialize to** `''` when their value is a `var()` or `attr()`-containing value declared with a corresponding shorthand (ie. it is a pending substitution value)
  - shorthand must **serialize** to:
    - the CSS-wide keyword declared for all its longhands
    - the `var()` or `attr()`-containing value declared for all its longhands (strict equality)
    - `''` when some (but not all) its declared longhand values is a CSS-wide keyword
    - `''` when some of its declared longhand values is a `var()` or `attr()`-containing value of its own
    - `''` when some of its declared longhand values is `''`
  - shorthand may have to **serialize** according to specific rules:
    - the shorter representation principle (see note below)
    - some side longhand values must be omitted when they are equal
    - etc.

Note: the procedure to serialize a CSS value defines that *component values can be omitted or replaced with a shorter representation without changing the meaning of the value* but initial values must not (always) be filtered out from a shorthand value otherwise it would be empty if all longhands are set to their initial values, and it can not be replaced by `initial` because some shorthands have an initial value that is not equal to the concatenation of each initial longhand value.

WIP
