
# Parsing CSS

This document provides an overview of parsing an input against a CSS grammar.

The input of the CSS parser can have different sources:

  - the content referenced by an `HTMLLinkElement` or an HTTP `Link` header
  - the content of an `HTMLStyleElement`
  - the argument of `CSSStyleSheet.insertRule()`
  - the argument of `Element.style.setProperty()`
  - the argument of `Element.querySelector()`
  - the value assigned to `Element.style`, `Element.media`, `Element.sizes`
  - etc

The output can be a `CSSStyleSheet`, a `CSSRule`, a `CSSStyleDeclaration`, a declaration, or a list of component values.

Let's introduce the CSS grammar and look at parsing a declaration value specified with `Element.style.setProperty()`, before sketching a complete picture by looking at parsing a style sheet.


## CSS grammar

The CSS grammar is layered on three levels: lexic, syntax, and semantics. Lexic and syntax define the structure. Semantics defines the contextual meaning.

In CSS specifications, *grammar* always refers to a production or [value definition](./value-definition.md). It implicitly includes any semantic rule defined in prose.

The CSS grammar could be defined only with production rules, but encoding semantics is not always trivial, and a CSS value failing to match a production must not always cause the entire process to fail. Therefore, some productions are defined with an algorithm that handle invalid parts of the value.

The input list of tokens (lexical units) can be transformed into a rule, a declaration, a collection of these values, after parsing its contents against the corresponding grammar in the context, represented by any higher-level structure or grammar.

The following list describes the different levels of CSS value structures:

  - style sheet: list of rules
  - rule:
    - prelude: list of component values
    - block value: list of declarations and/or list of rules
  - declaration
    - name: component value
    - value: list of component values
  - function and block: list of component values

The style sheet and rule block values are represented with one of the few productions defined with an algorithm:

  - `<rule-list>`, `<qualified-rule-list>`, `<at-rule-list>`, accept qualified and/or at-rules allowed in the context
  - `<declaration-rule-list>` accept at-rules and declarations for properties/descriptors allowed in the context
  - `<declaration-list>` accept declarations for properties/descriptors allowed in the context

Custom property values, `@property/initial-value`, substitution functions, container/media/support queries, pseudo selectors, are represented with `<declaration-value>` or `<any-value>`, representing an arbitrary value range.


## Parsing a declaration value

Declarations are stored in instances of `CSSStyleDeclaration` associated with an `Element` or a `CSSRule`.

<details>
<summary><strong>Aside:</strong> <code>CSSStyleDeclaration</code> was a confusing name from the start.</summary>
<br>

It suggests that `CSSStyleDeclaration` represents a single declaration accepted in the block value of a style rule. Initially, it actually represented a list of declarations accepted in the block value of a style rule. Later, it also represented a list of declarations accepted in the block value of some at-rules like `@font-face` and `@page`.

Before the introduction of these at-rules and nested style and group rules, it could have been used to represent the block value of a style rule. Assigning a value containing a rule to `Element.style` or `CSSStyleDeclaration.cssText` must not cause a parse error. The rule must simply be ignored:

```html
<!-- `text` is rendered with a `green` color -->
<p style="color: green; @media all { color: red };">text</p>
```

Instead of modifying this behavior to interpret rules, the CSSWG decided to represent lists of declarations appearing after a nested rule, with a `CSSStyleDeclaration` contained in `CSSNestedDeclarations`, which is a "transparent" rule that can only contain this list of declarations.

`CSSStyleDeclaration` is now extended by subclasses defined with a restricted set of property and descriptor attributes: `CSSStyleProperties`, `CSSFontFaceDescriptors`, `CSSPageDescriptors`, etc. Their names also helped to remove confusion about the context in which these declarations are accepted.

</details>

[`Element.style.setProperty(property, value)`](https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-setproperty) must [parse](https://drafts.csswg.org/cssom-1/#parse-a-css-value) the input string `value` into a list of component values matched against the grammar of `property`.

If `property` is a longhand, it must store a declaration for `property` with this list as its value. If `property` is a shorthand, it must expand the list and store a declaration for each longhand.

Matching a value against a grammar of a property is not further specified but implies:

  - matching against CSS-wide keywords
  - searching for an arbitrary substitution
  - matching against the value definition of the property and validating any semantic rule for the property or productions
  - matching against other declaration value substitutions

Based on underlying procedures, the parsed list is nearly identical to the list of tokens resulting from [tokenizing](https://drafts.csswg.org/css-syntax-3/#css-tokenize) `value`. Most tokens are preserved as "primitive" component values. Others are consumed into a function or simple block.

For example, the declaration value of a property defined with `rgb(...)` includes a component value whose `name` is `rgb` and whose `value` is a list of component values matching its argument grammar:

  > To consume a function from a token stream `input`:
  >
  > Assert: The next token is a `<function-token>`.
  >
  > Consume a token from `input`, and let `function` be a new function with its name equal the returned token’s value, and a value set to an empty list.

The list is not specified as being transformed or returned from matching it against the grammar. However, some values like math functions and `<an+b>` must be parsed into a specific representation.

Furthermore, while [*serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value) only enforces idempotence, ie. `assert.equal(serialize(parse(input)), serialize(parse(serialize(parse(input)))))`, a component value must be associated the matched productions in order to apply their serialization rules.

To overcome these challenges, this library defines the following requirements for the CSS parser:

  - component values must be implemented with a property assigned a list of the matched productions (learn more about the [data structure used to represent a CSS value](value-data-structure.md))
  - the input list of component values must be replaced with the result of parsing against the grammar¹, representing omitted values and sorting component values according to their position in the value definition
  - production specific rules must be processed either before or after matching the value definition, to discard an invalid value according to the rule, or to create a specific representation of the input value

¹ Therefore the result can be a single component value instead of a list, which is a deviation from *parse a CSS value* but *serialize a CSS value* somewhat handles this with *represent the value of the declaration as a list*, which are implementation details.


## Parsing a style sheet

CSS Syntax defines [entry points](https://drafts.csswg.org/css-syntax-3/#parser-entry-points) (*parse* procedures) and [algorithms](https://drafts.csswg.org/css-syntax-3/#parser-algorithms) (*consume* procedures) to parse a style sheet and represent it with a `CSSStyleSheet`:

  > **3. Tokenizing and Parsing CSS**
  >
  > User agents must use the parsing rules described in this specification to generate the CSSOM trees from text/css resources. Together, these rules define what is referred to as the CSS parser.
  >
  > [...]
  >
  > The input to the CSS parsing process consists of a stream of Unicode code points, which is passed through a tokenization stage followed by a tree construction stage. The output is a `CSSStyleSheet` object.

The parser entry points can receive a string, tokens, or component values, and output the expected structure: a component value, a declaration, a rule, or a list of them. For a [rule](https://drafts.csswg.org/css-syntax-3/#consume-at-rule) and a [declaration](https://drafts.csswg.org/css-syntax-3/#consume-declaration), it must be validated against its grammar in the context. If its grammar cannot be resolved in this context, it is invalid. `@charset`, `@import`, `@namespace`, `@layer`, also define the order in which they can appear.

<details>
<summary>CSS Syntax does not prescribe when and how to construct CSSOM representations, which creates some confusion.</summary>
<br>

CSSOM and HTML use [*create a CSS style sheet*](https://drafts.csswg.org/cssom-1/#create-a-css-style-sheet) when processing an HTTP `Link` header, `HTMLLinkElement`, `HTMLStyleElement`, but when and how to initiate parsing its contents is left unspecified.

While CSS Syntax defines [*parse a stylesheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet) as *the normal parser entry point for parsing stylesheets*,  which creates and returns *a new style sheet, with its location set to `location`* (and *location* linking to its [definition](https://drafts.csswg.org/cssom-1/#concept-css-style-sheet-location) in CSSOM as a *state item* of `CSSStyleSheet`), and while its result *must be interpreted as a CSS style sheet* and assigned to `CSSImportRule.styleSheet` in [CSS Cascade 4](https://drafts.csswg.org/css-cascade-4/#fetch-an-import), it also defines [*parse a CSS stylesheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet), which is not used by any specification and runs *parse a stylesheet*, and whose return value type is not defined but could be considered an instance of `CSSStyleSheet`, as its name suggests, and as opposed to an internal representation that would be returned by *parse a stylesheet*.

Similarly, CSSOM defines [*parse a CSS rule*](https://drafts.csswg.org/cssom-1/#parse-a-css-rule), which runs *parse a rule*. The type of its return value may be assumed to be an instance of `CSSRule` because `CSSStyleSheet.insertRule()` or `CSSGroupingRule.insertRule()` adds it into `CSSStyleSheet.cssRules` and `CSSGroupingRule.cssRules`, which represent `CSSRule`s.

This library constructs the CSSOM tree in parallel and initiates parsing a style sheet by creating a `CSSStyleSheet`, providing the list of rules as a string to its constructor. This allows creating `CSSRule` by passing to its constructor a reference to its `CSSStyleSheet` and to any parent `CSSRule`.

</details>
