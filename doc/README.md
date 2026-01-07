
# Parsing CSS

Established tools like ANTLR or Lex/Yacc take as input a grammar defined with production rules, and return as output a parser, often as efficient as any hand-written parser. So why implement one?

This section defines the requirements for a CSS parser before presenting the relevant details of its implementation in this library.


## Requirements

### Theory

Parsing is the process of deriving an unstructured input, by applying production rules, into a representation that exposes its grammatical structure.

A ***parse tree*** (aka. derivation tree) is a hierarchical representation of this derivation. A branch node represents zero or more tokens matching a non-terminal, a combination, a repetition. A leaf node represents a single token matching a terminal.

**Note:** in graph theory, a parse tree is a graph that is acyclic, finite, undirected, connected, rooted, ie. there is exactly one bidirectional path between two nodes and there is a node designated as the root of the tree.

How production rules are applied depends on the derivation order. It can start from the root node, follow a *pre-order*, which means that a parent node is visited before its children, and end at the rightmost leaf node, resulting in a *leftmost derivation*. Or it can start from the leftmost leaf node, follow a *post-order*, which means that a parent node is visited after its children, and end at the root node, resulting in a *rightmost derivation in reverse*.

**Note:** *pre-order* and *post-order* are also named *top-down* and *bottom-up* orders because parse trees are often represented with their root node at the top and their leaves at the bottom, which makes these names coupled to the visual representation of the tree.

**Note:** all parsers read input from left to right, and those that follow the pre-order are *LL parsers* (Left to right, Leftmost derivation), while those that follow the post-order are *LR parsers* (Left to right, Rightmost derivation in reverse).

In abstract terms, LL parsers expand the left-hand side of a production with the symbols on the right-hand side, while LR parsers fold them onto the left-hand side. LR parsers are known to be more efficient, but they require encoding large tables of states and actions, which determine the next node to parse. This is why they are usually generated from the grammar.

Formal grammars are *generative grammars*: they can generate a language (and a parser) that has no ambiguity.

An *ambiguity* exists when there are multiple derivations for the same input. A canonical example is the grammar of inline math expressions, aka. the infix notation, whose ambiguities must be resolved by associativity and precedence rules.

As in math expressions, whose operators are usually left associative, the parser must read the input from left to right: `1 - 2 + 3` must be interpreted to `2` instead of `4`. But to interpret `1 + 2 * 3` to `7` instead of `9`, precedence rules must be encoded with a more elaborate value definition than `<calc-value> [['+' | '-' | '*' | '/'] <calc-value>]*`.

Detecting ambiguities is non-trivial when symbols can be combined in any order or multiplied a varying number of times. Generating a parser from a grammar is the only guarantee that it is unambiguous. Generated parsers can be configured to resolve ambiguities, either ahead of time (statically) by defining a priority to the first, last, or longest match, or at parse time (dynamically), based on the context.

Some grammars are said to be *context-free* or *context-sensitive*. In Chomsky hierarchy, which organizes formal grammar classes, context-sensitive productions only vary depending on sibling productions. An example in CSS is `<pseudo-element-selector><pseudo-class-selector>`. But CSS productions can also be sensitive to parent or higher level productions:

  - `<context> = <production>`
  - `context(<production>)`
  - `context: <production>`
  - `@context { <production> }`

The *syntactic context* is any visible object surrounding a value (in CSS: a rule, declaration, function), while the *semantic context* is an invisible wrapper representing sibling and parent productions. Both can change the grammar of a value.


### CSS Grammar

The CSS grammar is layered on three levels: tokens, syntax, and semantics. Tokens and syntax define the structure. Semantics defines the contextual meaning.

The following list defines the different levels of CSS structures:

  - style sheet: list of rules
  - rule:
    - prelude: list of component values
    - block value: list of declarations and/or list of rules
  - declaration
    - name: component value
    - value: list of component values
  - function and simple block: list of component values

A component value is a preserved token, a function, or a simple block.

The CSS grammar could be defined only with production rules, but encoding semantics is not always trivial. Therefore, semantic rules are often defined in prose. More importantly, an invalid part of a value must not always cause the entire process to fail. Therefore, some productions are defined with an algorithm to skip invalid parts, which excludes generated parsers.

The CSS grammar is defined in:

  - [CSS Syntax](https://drafts.csswg.org/css-syntax-3/#rule-defs), with types representing the style sheet and rule block values, defined with an algorithm that consumes declarations and rules from the token stream, validates them in the context, and ignore those that are invalid, and with types representing an arbitrary value range for custom properties, `@property/initial-value`, substitution function arguments, container/media/support queries, pseudo selectors
  - [CSS Value](https://drafts.csswg.org/css-values-4/#value-defs), with the basic data types, defined with their corresponding token, and other CSS types used in many CSS values
  - other CSS specifications, with productions defined either with a [value definition](./value-definition.md) and sometimes validation rules written in prose, or with an algorithm

Since the rules and declarations are parsed with an algorithm, all that remains is to define the requirements for constructing the CSSOM tree, and parsing a prelude, a declaration value, or any other value represented as a list of component values, referred to as a *simple value* in this document.


### Processing model

CSS Syntax defines [entry points](https://drafts.csswg.org/css-syntax-3/#parser-entry-points) (*parse* procedures) and [algorithms](https://drafts.csswg.org/css-syntax-3/#parser-algorithms) (*consume* procedures) to parse a CSS input, which can have different sources:

  - the content referenced by an `HTMLLinkElement` or an HTTP `Link` header
  - the content of an `HTMLStyleElement`
  - the argument of `CSSStyleSheet.insertRule()`
  - the argument of `Element.style.setProperty()`
  - the argument of `Element.querySelector()`
  - the value assigned to `Element.style`, `Element.media`, `Element.sizes`
  - etc

The output can be a `CSSStyleSheet`, a `CSSRule`, a `CSSStyleDeclaration`, a declaration, or a simple value.

Entry points [normalize the input into a token stream](https://drafts.csswg.org/css-syntax-3/#normalize-into-a-token-stream) before any specific processing. Rules and declarations must be validated in the context. If the grammar for a rule or a declaration at the front of the input cannot be resolved in the context, it is invalid.

<details>
<summary><strong>Note:</strong> CSS Syntax does not prescribe when and how to construct CSSOM representations, which causes some confusion.</summary>
<br>

CSSOM and HTML use [*create a CSS style sheet*](https://drafts.csswg.org/cssom-1/#create-a-css-style-sheet) when processing an HTTP `Link` header, `HTMLLinkElement`, `HTMLStyleElement`, but when and how to initiate parsing its contents is left unspecified.

While [*parse a stylesheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet) is defined as *the normal parser entry point for parsing stylesheets*, creates and returns *a new style sheet, with its location set to `location`* (and *location* linking to its [definition](https://drafts.csswg.org/cssom-1/#concept-css-style-sheet-location) as a *state item* of `CSSStyleSheet`), and that *must be interpreted as a CSS style sheet* assigned to `CSSImportRule.styleSheet` when [fetching an `@import`](https://drafts.csswg.org/css-cascade-4/#fetch-an-import), [*parse a CSS stylesheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet), which is not used by any specification, runs *parse a stylesheet* and returns a value whose type is not defined but could be considered an instance of `CSSStyleSheet`, as its name suggests, and as opposed to an internal representation that would be returned by *parse a stylesheet*.

Similarly, CSSOM defines [*parse a CSS rule*](https://drafts.csswg.org/cssom-1/#parse-a-css-rule), which runs *parse a rule*. The type of its return value may be assumed to be an instance of `CSSRule` because `CSSStyleSheet.insertRule()` or `CSSGroupingRule.insertRule()` adds it into `CSSStyleSheet.cssRules` and `CSSGroupingRule.cssRules`, which represent `CSSRule`s.

</details>

Declarations are stored in instances of `CSSStyleDeclaration` associated with an `Element` or a `CSSRule`.

<details>
<summary><strong>Note:</strong> <code>CSSStyleDeclaration</code> was a confusing name from the start.</summary>
<br>

It suggests that `CSSStyleDeclaration` represents a single declaration accepted in the block value of a style rule. Initially, it actually represented a list of declarations accepted in the block value of a style rule. Later, it also represented a list of declarations accepted in the block value of some at-rules like `@font-face` and `@page`.

Before the introduction of these at-rules and nested style and group rules, it could have been used to represent the block value of a style rule. Assigning a value containing a rule to `Element.style` or `CSSStyleDeclaration.cssText` must not cause a parse error. The rule must simply be ignored:

```html
<!-- `text` is rendered with a `green` color -->
<p style="color: green; @media all { color: red };">text</p>
```

Instead of modifying this behavior to interpret rules, the CSSWG decided to represent lists of declarations appearing after a nested rule, with a `CSSStyleDeclaration` contained in `CSSNestedDeclarations`, which is a "transparent" rule that only contains this list of declarations.

```css
/* CSSStyleRule { */
style {
  /* CSSStyleRule.style { */
  foo: 1;
  bar: 1;
  /* } */
  /* CSSStyleRule.cssRules { */
  @media all {}
  /*   CSSNestedDeclarations { */
  /*     CSSNestedDeclarations.style { */
  baz: 1;
  qux: 1;
  /*     } */
  /*   } */
  /* } */
}
```

`CSSStyleDeclaration` is now extended by subclasses defined with a restricted set of property and descriptor attributes: `CSSStyleProperties`, `CSSFontFaceDescriptors`, `CSSPageDescriptors`, etc. Their names also helped to remove confusion about the context in which these declarations are accepted.

</details>

[`Element.style.setProperty(property, value)`](https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-setproperty) must [parse](https://drafts.csswg.org/cssom-1/#parse-a-css-value) the input string `value` into a list of component values matched against the grammar of `property`.

If `property` is a longhand, it must store a declaration for `property` with this list as its value. If `property` is a shorthand, it must expand the list and store a declaration for each longhand.

Matching a value against a grammar of a property is not further defined but implies:

  - matching against CSS-wide keywords
  - searching for an arbitrary substitution
  - matching against the value definition of the property and validating any semantic rule for the property or productions
  - matching against other declaration value substitutions

Based on underlying procedures, the parsed list is nearly identical to the list of tokens resulting from tokenizing `value`. They are preserved as "primitive" component values, or consumed into a function or simple block.

For example, the declaration value of a property defined with `rgb(...)` includes a component value whose `name` is `rgb` and whose `value` is a list of component values matching its argument grammar:

  > To consume a function from a token stream `input`:
  >
  > Assert: The next token is a `<function-token>`.
  >
  > Consume a token from `input`, and let `function` be a new function with its name equal the returned token’s value, and a value set to an empty list.

However, the list is not specified as being produced and returned from matching against the grammar, whereas some values like math functions or `<an+b>` must be parsed into a specific representation.

Furthermore, while [*serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value) only enforces idempotence, ie. `assert.equal(serialize(parse(input)), serialize(parse(serialize(parse(input)))))`, a component value must be associated the matched productions to apply their serialization rules. For example, a component value matching `<percentage>` and `<alpha-value>` must serialize as a `<number>` to the shortest possible form, rather than as a `<percentage>`.

To overcome these challenges, this library defines the following requirements for parsing a simple value:

  - the parse result must be derived from matching the input tokens against the grammar, and it must represent omitted values and sort component values according to their canonical order (ie. their position in the value definition)
  - production specific rules must be processed either before or after matching their value definition, to discard an invalid value according to the rule, or to create a specific representation of the input value
  - component values must be implemented with a property assigned a list of the matched productions, to serialize it according to the appropriate rule


### Context

A CSS parser must validate rules and declarations *in the context*, which is not defined anywhere nor passed as an argument.

When grouping at-rules like `@media` and `@supports` are nested in a style rule, the grammar of their block value changes. When using `CSSRule.insertRule()`, the node representing `CSSRule` does not exist. So the context must be initialized with its CSSOM representation.

The context representation must allow accessing the parent rule definition, which must tell:

  - which rules are allowed in its block value
  - which properties and descriptors can be declared in its block value
  - whether declarations cascade
  - whether declarations apply to elements

In contexts where declarations cascade or apply to elements, the grammar is implicitly extended with CSS-wide keywords and some arbitrary substitutions, whole value substitutions, and numeric substitutions.

`Element.style` accept declarations for property values applying on `Element`. On the other hand, `Element.sizes` is independent of `Element`: it does not accept the aforementioned element dependent substitutions, and a relative length would resolve based on the initial `font-size` rather than its computed value for `Element`. So the context must be initialized with `Element` to parse `Element.style` but not `Element.sizes`.

Validating a value in the context, before or after matching its definition, often requires traversing the parse tree to access a sibling or parent node. For example, there must be a whitespace preceding `+` and `-` in `<calc-sum>`. So if it is omitted, the validation action associated to the node representing `+` or `-` must return an error if its parent node represents `<calc-sum>`.

Other grammar rules require modifying the value definition. For example, math functions must support at least 32 arguments, which means the default value (20) of the `#` multiplier of `<calc-sum>` must be overridden. Similarly, `#` must be ignored at the top-level of a production rule for a property value range.

Finally, the context representation must allow to determine the input token marking the end of the parsed node value. So it must be hierarchical, to allow to determine which of a function or block is the closest context, like in `fn([a])` and `[fn(a)]`.


### Backtracking

The simple value parser must backtrack after failing to parse a node or when the input is not fully consumed in the context. This requirement is unspecified.

It must successfully parse `a a b` against `[a | a a] b`, or `a a` against `a | a a`, by backtracking, instead of failing to find a match after the first choice in `a | a a` (greedy parser), or instead of looking ahead or re-ordering `a | a a` to `a a | a` to find the longest match (maximal munch parser).

**Note:** a requirement that follows is that an input token must not be tagged with the name of a production that was matched before backtracking.

Backtracking requires saving the index of the input list of tokens when creating a node. If the tail node fails to be parsed and cannot yield an alternative child node, it must be removed from the tree before resuming parsing the previous sibling or parent node. Any sequence of symbols combined with `|`, `||`, `&&`, or any symbol qualified by a multiplier where `min < max`, yield alternatives.

One would expect to read combined symbols in the same direction as the input. For example, `a a` would match the first alternative in `[a | a a] a?` (`a?` would not be omitted). But the specifications do not define such priority in alternations (`|`) and arrangements (`||`).

**Note:** the CSS grammar defines some priorities, like `<number>` or `<integer>` over `<length>` (or `<length-percentage>`) when the input token represents `0`.

It would be useless to try other `<color>` alternatives when matching `#000 false` against `<color> true`. Actually, there are only a few productions that can yield a different result after backtracking, and they would not need it if their alternatives were sorted in left precedence order for longest match priority.

**Note:** this actually has no significant impact on time complexity.

Similarly, backtracking is useless after a function or simple block value failed to match its (context-free) value definition, or when a value is invalid according to a specific rule for the production: the whole input is guaranteed to be invalid. But many functions and simple blocks are defined with alternative value definitions like `rgb(<percentage>#{3}, <alpha-value>?) | rgb(<number>#{3}, <alpha-value>?)` instead of `rgb([<number>#{3} | <percentage>#{3}], <alpha-value>?)`.

**Note:** this actually has no significant impact on time complexity.

The only way to short-circuit recursive parse functions and immediately abort parsing, is to throw an error and catch it in a main parse function. However, error boundaries are needed to resume parsing at a higher level, because some grammars (`<media-query-list>`, `<selector-list>`, `@font-face/src`) must forgive invalid parts of the value.


## Implementation

### Data model

A **node** is implemented as a plain object with the following properties:

| Property     | Type        | Description                                                          |
| ------------ | ----------- | -------------------------------------------------------------------- |
| `children`   | `Array`     | The parsed child nodes                                               |
| `context`    | `Object`    | The parent context                                                   |
| `definition` | `Object`    | The parsed [value definition](../memos/value-definition.md) to match |
| `input`      | `Stream`    | The list of tokens                                                   |
| `location`   | `Number`    | The location (`input.index`) where `value` can be found              |
| `parent`     | `Node`      | The parent node                                                      |
| `state`      | `String`    | The current processing state                                         |
| `value`      | See below   | The result of successfully parsing `input` against `definition`      |

`node.value` is initially `undefined`. Nodes representing a rule are is assigned its CSSOM representation before parsing its block value. All other nodes are assigned the successful parse result, which can be:

  - a plain object representing a declaration or a token
  - a `List` of component values
  - a `List` of rules

These values are all implemented with a `types` property that includes `node.definition.name`, to serialize it according to the appropriate rule.

`node.definition.name` is also used to resolve specific state transition actions for this production.

A **token** is implemented as a plain object with the following properties:

| Property | Type             | Description                                                                            |
| -------- | ---------------- | -------------------------------------------------------------------------------------- |
| `end`    | `Number`         | The location (index) of the next code point after the token in the input string        |
| `sign`   | `String`         | Only for `<number-token>`, `<dimension-token>`, `<percentage-token>`                   |
| `start`  | `Number`         | The location (index) of the token in the input string.                                 |
| `types`  | `Array`          | The list of productions matched with the token, with the token type as its first entry |
| `unit`   | `String`         | Only for `<dimension-token>` and `<percentage-token>`                                  |
| `value`  | `Number\|String` | `Number` for numeric tokens, otherwise a `String`                                      |

`token.types[0]` is used to match `token` against a node representing this token type.

**Note:** CSS Syntax defines `<hash-token>`, `<number-token>`, `<dimension-token>`, with a `type` property that has a different meaning than `types`, but is only used to validate a few specific productions of these tokens, which can be achieved without this property.

**Note:** CSS Syntax only defines `unit` for `<dimension-token>`, but `<percentage-token>` can also be considered as a dimension (cf. w3c/csswg-drafts#7381), therefore it is also implemented with this property, to simplify parsing and serializing.

A **context** is a node that does not have any child nodes, but is the "origin" of one or more nodes. It can represent:

  - a style sheet
  - a rule
  - a declaration
  - a function
  - a block
  - a value replaced with a substitution value
  - a value defined with a forgiving grammar

It is extended with the following properties:

| Property    | Type      | Description                                                               |
| ----------- | --------- | ------------------------------------------------------------------------- |
| `globals`   | `Map`     | The global registered resources and execution state                       |
| `separator` | `String`  | Defines whether a whitespace can appear or must be omitted between tokens |
| `strict`    | `Boolean` | Defines whether forgiving grammars must be parsed unforgivingly           |
| `trees`     | `[Node]`  | The list of root nodes                                                    |

Examples of `context.globals` entries are `namespaces` from `@namespace` rules, and the number of `calc-terms` nested in a top-level math function.

`context.separator` is reset before parsing the originated nodes, to allow a whitespace between tokens.

`context.trees` allows to traverse root nodes in order to access the root of the current tree with `trees.at(-1)`, find a higher level tree with `trees.findLast(accept)`, etc.

A context must be initially created by the parser entry point with an optional instance of `CSSStyleSheet`, `CSSRule`, `CSSFontFeatureValuesMap`, `CSSStyleDeclaration`, or one or more rule production names (to create an arbitrary context). Any other context value is assumed to be an instance of `Element`.

It can be overriden in `configure` transition actions, eg. by returning `{ ...context, strict: true }`.

How to represent and traverse the context chain and the parse tree is related to the well-known time and space trade off. Storing a reference of a parent node in child nodes takes space, but traversing a linear tree takes time. Similarly, accessing a parent node via a static path on the tree would be coupled with the grammar and could break with future grammar changes, but a functional search might have an impact on time complexity.

This library favors low code complexity to time/space complexity. All context utilities exported from `lib/utils/context.js` search for the closest sibling, parent, or context node, and take an optional predicate to abort the traversal:

  - `findSibling()`: the closest previous node in reverse (rtl) pre-order
  - `findParent()`: the closest ancestor node
  - `findContext()`: the closest context node

For example, to `findSibling()` of `d` while parsing `[a || b] && [c | d]`, the provided predicate will be called with a node representing `c`, `b`, `a`, `||`.


### Processing model

#### Entry points and algorithms

The parser implementation does not exactly match the procedures defined in CSS Syntax, which has been written to prioritize understandability over efficiency.

As a quick overview, a conforming HTML parser creates a style sheet with unparsed rules provided as a string or byte stream, then `CSSStyleSheet.constructor()` runs `parseGrammar()` with the rules, the grammar of a style sheet, and a reference to this `CSSStyleSheet`.

`parseGrammar()` is an implementation of [*parse something according to a CSS grammar*](https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar) that is also used to parse *something else* in the context being parsed. It creates a node with the provided input, grammar, and context, before parsing this node with a state machine. It is also responsible for normalizing the input into a stream of tokens, and the grammar and context into apppropriate representations.

When the node transitions to the `matching` state, the machine runs the associated action, `matchStyleSheet()`, which is an implementation of [*consume a style sheet's contents*](https://drafts.csswg.org/css-syntax-3/#consume-a-stylesheets-contents).

The parser algorithms follow the naming pattern *"consume a ..."* but the validation of rules and declarations was added later. So `match...()` are implementations that consume tokens *if* the value must be valid, while `consume...()` are implementations that consume tokens *unconditionally* and are mostly intended for invalid values.

A prelude or a declaration value containing a bad token (`<bad-*-token>` and orphan `)`, `]`, `}`) must be entirely invalid, even when this bad token is nested in a function or simple block. But when matching a forgiving grammar, only the part containing this bad token must be invalid. So this library assumes that component values must be produced *after* validating their tokens, and does not implement these preliminary entry points:

  - [*parse a list of component values*](https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-component-values), which is only used in *parse something according to a CSS grammar*
  - [*parse a comma-separated list of component values*](https://drafts.csswg.org/css-syntax-3/#parse-a-comma-separated-list-of-component-values), which is only used in *parse a comma-separated list according to a CSS grammar*
  - [*parse a component value*](https://drafts.csswg.org/css-syntax-3/#parse-a-component-value), which is not used anywhere

Other entry points are not implemented:

  - [*parse a style sheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet), which is only used in [*fetch an `@import`*](https://drafts.csswg.org/css-cascade-4/#fetch-an-import) (but should not, cf. [issue](https://github.com/w3c/csswg-drafts/issues/13049)) and [*parse a CSS style sheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet), which is unused, barely specified, and also not implemented
  - [*parse a style sheet's contents*](https://drafts.csswg.org/css-cascade-4/#fetch-an-import), which is only used to parse rules from `CSSStyleSheet.replace()`, and is replaced with `parseGrammar()`
  - [*parse a CSS declaration block*](https://drafts.csswg.org/cssom-1/#parse-a-css-declaration-block), which is only used to parse `CSSStyleDeclaration.cssText` (a list of declarations) by validating the declarations returned by [*parse a block's contents*](https://drafts.csswg.org/css-syntax-3/#parse-a-blocks-contents) (implemented with `parseDeclarationList()`), whereas they are already validated
  - [*parse a CSS rule*](https://drafts.csswg.org/cssom-1/#parse-a-css-rule), which is only used to parse the argument of `CSSStyleSheet.insertRule()` by validating the rule returned by [*parse a rule*](https://drafts.csswg.org/css-syntax-3/#parse-a-rule), whereas it is already validated
  - [*parse a declaration*](https://drafts.csswg.org/css-syntax-3/#parse-a-declaration), which is only used to parse `<declaration>`, and is replaced with `matchDeclaration()`

Below is a list of all implemented entry points:

  - `parseGrammar(input, grammar, context, strategy?)`
  - `parseGrammarList(input, grammar, context)`
  - `parseDeclarationList(input, context)`
  - `parseRule(input, context)`
  - `parseDestructuredDeclaration(name, value, important, context)`
  - `parseDeclarationValue(input, grammar, context)`

`parseDestructuredDeclaration()` is used to validate the arguments of `CSSStyleDeclaration.setProperty()`, which is defined to be handled with [*parse a CSS value*](https://drafts.csswg.org/cssom-1/#parse-a-css-value), but it does not validate the priority argument (cf. w3c/csswg-drafts#9241).

`parseDeclarationValue()` is a generalized implementation of *parse a CSS value* that can also be used to parse a declaration value from `matchDeclaration()`, `parseDestructuredDeclaration()`, `set CSS*Rule.[descriptor]()`.


#### Rules and declarations

To parse a rule, its definition must first be resolved from the definitions of rules accepted in the context. If there is an `<at-keyword-token>` at the front of the input, it is the first definition whose `name` matches the value of this token or whose `names` include it. Otherwise, it must resolve to the definition of the `qualified` rules in this context, if any, which assumes that a context only accepts a single type of `qualified` rules.

After consuming and validating its prelude, its CSSOM representation is created, and its constructor parses its block value. `matchStyleSheet()` validates the order of the rule and registers `@namespace` in `context.globals`.

To parse a declaration, its definition must first be resolved with the `<ident-token>` at the front of the input from the dictionaries of properties and descriptors accepted in the context. Then its value must be validated. When they are allowed in the context, the parser first parses the input against CSS-wide keywords, which must be interpreted like for standard properties in a custom property value, then it looks for an arbitrary substitution, and returns a parse error if it finds a positioned {} block, which would mean that there might be a qualified rule at the front of the input, then it parses the input against the grammar of the property or descriptor, then against the grammar of the whole value substitutions.

**Note:** while looking for an arbitrary substitution, it does not *immediately* return `null` if it finds `<bad-*-token>`, `)`, `]`, `}`, `;`, `!`, which are all invalid tokens in `<declaration-value>`, when they do not close a parent structure in the input, to allow returning a parse error if it later finds a positioned {} block.

Finally, it validates a priority, if any.


#### State machine

The state machine allows defining transition actions for a specific production.

| Action        | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| `configure`   | Override the node                                                       |
| `preprocess`  | Validate a semantic rule                                                |
| `postprocess` | Validate a semantic rule, simplify a valid match result                 |
| `replace`     | Replace a match failure with the result of parsing a substitution value |
| `intercept`   | Handle a parse error                                                    |

The next state is based on the output of the previous action, which can be `undefined`, `null`, `Error`, or a valid parse result, except the initial transition action, which must return a node.

When `Error` is returned, it means that the input is guaranteed to be invalid, up to the first context ignoring invalid contents. When `null` is returned, it means that the part of the value at the front of the input is guaranteed be invalid for the node. Returning `undefined` has different meaning depending on the action:

  - `preprocess`: continue parsing with `match`
  - `match`: continue parsing with `replace`
  - `postprocess`: resume `match` to find a longer match
  - `replace`: continue parsing the next alternative of the parent node

Returning `null` or `undefined` from `replace` has the same meaning.

Parsing a node whose state is `accepted` cannot be resumed after backtracking: it must be `matched`. A valid value returned from `preprocess`, `replace`, `intercept`, is `accepted`, while a valid value returned from `match` and `postprocess` is `matched`.

`node` represents a hierarchical state tree in the sense that `node.state` is always `matching` while parsing `node.children`.


# Serializing CSS

This section focuses primarily on the serializaton of property values, given that descriptor values do not cascade and do not include relative values, and that the procedure to [serialize a rule](https://drafts.csswg.org/cssom-1/#serialize-a-css-rule) is quite explicit.

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
