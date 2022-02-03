
# Specification issues

This document lists issues in CSS specifications and how they are handled in this library.

- [parse and serialize a selector](#parse-and-serialize-a-selector)

## Parse and serialize a selector

https://drafts.csswg.org/cssom/#dom-cssstylerule-selectortext
https://drafts.csswg.org/cssom/#selectors

> To **parse a group of selectors** means to parse the value using the `selectors_group` production defined in the Selectors specification and return either a group of selectors if parsing did not fail or null if parsing did fail.
>
> To **serialize a selector** let `s` be the empty string, run the steps below for each part of the chain of the selector, and finally return s:
>
> [...]

Issues:

  1. the `selectors_group` production is not defined in Selector: if parsing `selectors_group` means parsing against `<selector-list>`, then `<compound-selector-list>`, `<simple-selector-list>`, `<relative-selector-list>`, `<simple-selector>`, and `<relative-selector>` will never be a selector type of a style rule
  2. *the chain of the selector* is neither defined in Selector or CSSOM
