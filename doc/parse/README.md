
# Parsing CSS

This document provides an overview of parsing an input against a CSS grammar.

The input of the CSS parser can have different sources:

  - the content referenced by an `HTMLLinkElement` or an HTTP `Link` header
  - the content of an `HTMLStyleElement`
  - the argument of `CSSStyleSheet.insertRule()`
  - the argument of `Element.style.setProperty()`
  - the argument of `Element.querySelector()`
  - the value assigned to `Element.style` or `Element.media`
  - etc

The output can be a list of component values, a declaration, a `CSSRule`, a `CSSStyleDeclaration`, or a `CSSStyleSheet`.

Let's introduce the CSS grammar and look at parsing a declaration specified with `Element.style.setProperty()`, before sketching a complete picture by looking at parsing a style sheet.


## CSS grammar

The CSS grammar is structred on three levels: lexic, syntax, and semantics. Lexic and syntax define the structure of a value while semantics define its contextual meaning. For example, `opacity: red` is a valid `<declaration>` but its value is invalid according to its name.

In CSS specifications, *grammar* always refers to a production or [value definition](./value-definition.md) and implicitly includes any semantic rules defined in prose. Theoretically, the CSS grammar can be defined only with production rules, but encoding semantics is not always trivial. Besides, a CSS value failing to match a production must not always have to cause the entire process to fail.

The following list introduces the different levels of CSS structures:

  - style sheet: list of rules
  - rule:
    - prelude: list of component values
    - block value: list of declarations and/or list of rules
  - declaration
    - name: component value
    - value: list of component values

The input list of tokens (CSS lexical units) may be transformed into a declaration, a rule, or a collection of them (style sheet and rule block), before validating it in the context (style sheet or parent rule) and parsing its contents (the declaration value or the rule prelude and block value) against the corresponding grammar, recursively.

The style sheet and rule block values are represented with one of the few productions that are not defined with a value definition:

  - `<rule-list>`, `<qualified-rule-list>`, `<at-rule-list>`, accept qualified and/or at-rules allowed by the context
  - `<declaration-rule-list>` accept at-rules and `<declaration>` for properties/descriptors allowed by the context
  - `<declaration-list>` accept `<declaration>`s for properties/descriptors allowed by the context


## Parsing a declaration

`Element.style` is an instance of `CSSStyleDeclaration` storing a list of declarations.

A declaration for a property can appear in the prelude (as a feature or style query) or the block value of an at-rule or a qualified rule. A declaration for a descriptor can only appear in the block value of an at-rule. A property applies to one or more elements whereas a descriptor applies to a single resource.

---

**Aside**

In CSSOM, `CSSStyleDeclaration` is named a *CSS declaration block* because it originally represented the block value of a style rule, which previously could only contain a list of declarations. But the CSSOM representation of some at-rules introduced later has also been defined with a `CSSStyleDeclaration` storing their declarations. Assigning a CSS rule to `Element.style` or `Element.style.cssText` does not cause a parse error. However, it is currently ignored:

```html
<!-- `text` is rendered with a `green` color -->
<p style="color: green; @media all { color: red };">text</p>
```

---

[`Element.style.setProperty(property, value)`](https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-setproperty) must store a CSS declaration for `property` in `Element.style` (step 8 or 9), whose value is a list of component values resulting from *parse a CSS value* with the input string `value` (step 5).

*CSS value* is not defined in any CSS specification but is assumed to be any value that can be parsed as a list of component values.

[CSS declaration](https://drafts.csswg.org/css-syntax-3/#declaration):

  > A declaration has a name which is a string, a value consisting of a list of component values, and an `important` flag which is initially unset.

[Component value](https://drafts.csswg.org/css-syntax-3/#component-value):

  > A component value is one of the preserved tokens, a function, or a simple block.

Reading [*parse a CSS value*](https://drafts.csswg.org/cssom-1/#parse-a-css-value) and subjacent procedures in CSSOM and CSS Syntax, a CSS declaration value is a list of component values nearly identical to the list of tokens resulting from normalizing (tokenizing) the input string `value`.

Tokens are either preserved as "primitive" component values, or consumed into structured ones, a function or simple block, or into declarations and rules. To match a property defined with `rgb()`, the list must therefore include a component value whose `name` is `rgb` and whose `value` is a list of component values matching the definition of its arguments:

  > To consume a function from a token stream `input`:
  >
  > Assert: The next token is a `<function-token>`.
  >
  > Consume a token from `input`, and let `function` be a new function with its name equal the returned token’s value, and a value set to an empty list.

`CSSStyleDeclaration` does not store CSS declarations for shorthands. The result from parsing a shorthand value must be expanded to a CSS declaration for each of its longhands. CSSOM is [rather hand-wavy](https://github.com/w3c/csswg-drafts/issues/6451) about this in the procedure for `CSSStyleDeclaration.setProperty()` and `CSSStyleDeclaration.cssText`.

---

This quick overview raises a fundamental question about the result of *parse a CSS value* for `CSSStyleDeclaration.setProperty()`, or *parse a CSS declaration block* for `CSSStyleDeclaration.cssText`: **should they return a boolean, a transformed or mutated input, or something similar to the result of `RegExp.exec()`?**

Their respective steps, *match `list` against the grammar for the property `property` in the CSS specification*, and *let `parsed declaration` be the result of parsing `declaration` according to the appropriate CSS specifications*, are not further defined, but both must imply these processings:

  - searching for an arbitrary substitution in the list of component values
  - matching the list of component values against a value definition, applying any specific rules for `property` or the productions in its value definition
  - matching the list of component values against CSS-wide keywords and other declaration value substitutions

[*Serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value) only enforces idempotence, ie. `assert.equal(serialize(parse(input)), serialize(parse(serialize(parse(input)))))`, but some production rules make it hard to only store the original input, like math functions and `<an+b>`, which require to be parsed into specific representations. Furthermore, component value(s) must be associated the matched productions in some way, to later apply any specific serialization rule.

To overcome these challenges, this library defines the following requirements for the CSS parser:

  - a component value and a list of component values must be implemented with a property assigned a list of the matched production(s) (learn more about the [data structure used to represent a CSS value](value-data-structure.md))
  - the input list of component values must be replaced by the result of parsing against the grammar¹, in which omitted values² must be represented and component values must be sorted according to their position in the value definition
  - production specific rules must be processed either before or after matching the value definition, to discard an invalid value according to the rule, or to create a specific representation of the input value

¹ Therefore the result can be a single component value instead of a list, which is a deviation from *parse a CSS value* but *serialize a CSS value* somewhat handles this with *represent the value of the declaration as a list*, and this is an implementation detail that may change later.

² Omitted values exist in value definitions containing a multiplier allowing zero or more occurrences, or a combination of `||` separated symbols.


## Parsing a style sheet

CSS Syntax defines entry points and algorithms to use to produce a `CSSStyleSheet`:

  > **3. Tokenizing and Parsing CSS**
  >
  > User agents must use the parsing rules described in this specification to generate the CSSOM trees from text/css resources. Together, these rules define what is referred to as the CSS parser.
  >
  > [...]
  >
  > The input to the CSS parsing process consists of a stream of Unicode code points, which is passed through a tokenization stage followed by a tree construction stage. The output is a `CSSStyleSheet` object.

Each *parse* procedure from CSS Syntax is named a *parser entry point* and runs a corresponding *consume* procedure named a *parser algorithm*.

  > [5.4. Parser Entry Points](https://drafts.csswg.org/css-syntax-3/#parser-entry-points)
  >
  > The algorithms defined in this section produce high-level CSS objects from lists of CSS tokens.
  >
  > The algorithms here operate on a token stream as input, but for convenience can also be invoked with a number of other value types.
  >
  > [...]
  >
  > [5.5. Parser Algorithms](https://drafts.csswg.org/css-syntax-3/#parser-algorithms)
  >
  > The following algorithms comprise the parser. They are called by the parser entry points above, and generally should not be called directly by other specifications.
  >
  > [...]

Entry points can receive a string, tokens, or component values, and output the expected structure: a component value, a declaration, a rule, or a list of them. They are not intended to be used at an intermediate step of the recursive parse process, since some algorithms output high-level objects that are not a string, tokens, or component values.

Algorithms for a rule and a declaration require validating them in the context against their grammar:

  > The CSS parser is agnostic as to the contents of blocks — they’re all parsed with the same algorithm [...].
  >
  > Accompanying prose must define what is valid and invalid in this context. [...]

If the grammar of a rule or a property or descriptor value cannot be resolved in the context, it is invalid. For example:

  - the block of `@media` is represented with `<rule-list>`, accepts all top-level rules, or nested group rules when nested in a style rule
  - the block of `@keyframes` is represented with `<rule-list>` and accepts rules matching `<keyframe-selector># { <declaration-list> }`, where `<declaration-list>` accepts declarations for animatable properties
  - the block of `@font-feature-values` is represented with `<declaration-rule-list>` and accepts a declaration for `font-display` and at-rules matching `<font-feature-value-type> { <declaration-list> }`

Some rules like `@charset`, `@import`, `@namespace`, `@layer`, also define the order in which they must appear.

However, CSS Syntax does not prescribe when and how to construct the CSSOM representation.

Parsing a style sheet must run recursively from its top to bottom level, which allows to construct the CSSOM tree in parallel, noting that a `CSSStyleSheet` will never be discarded, or with a second traversal, to avoid discarding `CSSRule`s and cancelling any processing, like fetching a style sheet referenced by a `CSSImportRule`.

---

Other productions require a specific processing.

`<declaration-value>` and `<any-value>` are used in the value definition of custom properties, `@property/initial-value`, substitution functions, container/media/support queries, and pseudo selectors.

  > The `<declaration-value>` production matches any sequence of one or more tokens, so long as the sequence does not contain `<bad-string-token>`, `<bad-url-token>`, unmatched `<)-token>`, `<]-token>`, or `<}-token>`, or top-level `<semicolon-token>` tokens or `<delim-token>` tokens with a value of `!`. It represents the entirety of what a valid declaration can have as its value.
  >
  > The `<any-value>` production is identical to `<declaration-value>`, but also allows top-level `<semicolon-token>` tokens and `<delim-token>` tokens with a value of `!`. It represents the entirety of what valid CSS can be in any context.

`<declaration>` is used in the value definition of feature and style queries.


### Constructing the CSSOM tree

CSSOM and HTML use *create a CSS style sheet* when processing an HTTP `Link` header, `HTMLLinkElement`, `HTMLStyleElement`, but how to initiate parsing is left unspecified, as reported in [this issue](https://github.com/whatwg/html/issues/2997).

  > if you can see the stylesheet, it needs to contain all of its rules fully parsed.

A strict interpretation means that `CSSStyleSheet.constructor()` and `CSSRule.constructor()` must create `CSSRule`s because `CSSRule.parentStyleSheet` and `CSSRule.parentRule` must be references to this `CSSStyleSheet` and `CSSRule`. But it rather means that `CSSStyleSheet` must contain its `CSSRule`s before appearing in the DOM (`Element.sheet`, `document.styleSheets`).

In the meantime, CSS Syntax 3 defines *parse a stylesheet* as *the normal parser entry point for parsing stylesheets*. It creates and returns *a new style sheet, with its location set to `location`*, with *location* linking to its definition in CSSOM as a *state item* of `CSSStyleSheet`. In [CSS Cascade 4](https://drafts.csswg.org/css-cascade-4/#fetch-an-import), its result *must be interpreted as a CSS style sheet* and assigned to `CSSImportRule.styleSheet`, defined as a `CSSStyleSheet`.

CSS Syntax 3 also defines [*parse a CSS stylesheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet), which is not used by any specification and runs *parse a stylesheet*. The type of its return value is not defined but it may be assumed to be an instance of `CSSStyleSheet`, as the name of the procedure suggests and as opposed to an internal representation that would be returned by *parse a stylesheet*.

Similarly, CSSOM defines [*parse a CSS rule*](https://drafts.csswg.org/cssom-1/#parse-a-css-rule), which runs *parse a rule*. The type of its return value must be assumed to be an instance of `CSSRule` because `CSSStyleSheet.insertRule()` or `CSSGroupingRule.insertRule()` adds it into `CSSStyleSheet.cssRules` and `CSSGroupingRule.cssRules`, which represent `CSSRule`s.
