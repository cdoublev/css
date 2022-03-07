
# Serialization to the shortest representation

The procedure to serialize a CSS value defines that *component values can be omitted or replaced with a shorter representation without changing the meaning of the value* but initial values must not (always) be filtered out from a shorthand value otherwise it would be empty if all longhands are specified to their initial values, and it can not be replaced by `initial` because some shorthands have an initial value that is not equal to the concatenation of each initial longhand value.

TODO: add a note about the general state of the different browser behaviors regarding this rule, a link to the HTML test pages to get a view at the different outputs, and the "master" rule of this library (always stick to the specification, then adapat to user agents when they all have the same behavior).

TODO: add a note about the Github issue related to the serialization rules (not officially specified yet) for `<position>`, `<bg-position>`, and `<position>`-like grammars, which act against the shortest representation principle but this is required to avoid simplifying to an empty value for the `background-position` property.

https://github.com/w3c/csswg-drafts/issues/368
