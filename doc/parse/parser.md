
# Parser

Established tools like ANTLR or Lex/Yacc take as input a grammar defined with production rules and return as output a parser, often as efficient as any hand-written parser. So why implement one?

This document defines the requirements for a CSS parser, after introducing some concepts from formal language theory, and before presenting the relevant details of its implementation in this library.


## Theory

### Parse tree

Parsing is the process of deriving an unstructured input, by applying production rules, into a representation that exposes its grammatical structure.

A **parse tree** (aka. derivation tree) is a hierarchical representation of this derivation constructed in parallel. A branch node represents a non-terminal, a combination, a repetition, matching zero or more component values. A leaf node represents a terminal matching a single component value.

**Note:** in graph theory, a parse tree is a graph that is acyclic, finite, undirected, connected, rooted, ie. there is exactly one bidirectional path between two nodes and there is a node designated as the root of the tree.

How production rules are applied depends on the derivation order. It can start from the root node, follow a **pre-order**, which means that a parent node is visited before its children, and end to the rightmost leaf node, resulting to a *leftmost derivation*. Or it can start from the leftmost leaf node, follow a **post-order**, which means that a parent node is visited after its children, and end to the root node, resulting to a *rightmost derivation in reverse*.

In abstract terms, the left-hand side of a production is expanded with the symbols on its right-hand side when following the pre-order, which are otherwise folded into its left-hand side when following the post-order. The post-order is known to be more efficient, but it requires encoding large tables of states and actions in the parser, that determine the next node to parse, which is why it is usually generated from the grammar.

**Note:** all parsers read input from left to right, and those that follow the pre-order are *LL parsers* (Left to right, Leftmost derivation), while those that follow the post-order are *LR parsers* (Left to right, Rightmost derivation in reverse).

**Note:** *pre-order* and *post-order* are also named *top-down* and *bottom-up* orders because parse trees are often represented with their root node at the top and their leaves at the bottom, which makes these names coupled to the visual representation of the tree.


### Ambiguity and context

Formal grammars are *generative grammars*, meaning they can generate a language (and a parser) that has no syntactic ambiguity.

An **ambiguity** exists when there are multiple derivations for the same input.

A canonical example to illustrate this is the grammar of inline math expressions, aka. the infix notation. They can include ambiguities that affect their meaning and that must be resolved by associativity and precedence rules.

As in math expressions, whose operators are usually left associative, the parser must read the input from left to right: `1 - 2 + 3` must be interpreted to `2` instead of `4`. But to interpret `1 + 2 * 3` to `7` instead of `9`, precedence rules must be encoded with a more complex value definition than `<calc-value> [['+' | '-' | '*' | '/'] <calc-value>]*`.

Detecting ambiguities is non-trivial when symbols can be combined in any order or multiplied a varying number of times. Generating a parser from a grammar is the only guarantee that it is unambiguous. Generated parsers can be configured to resolve ambiguities, either ahead of time (statically) by defining a priority to the first, last, or longest match, or at parse time (dynamically), based on the context.

Some grammars are said to be **context-free** or **context-sensitive**. In Chomsky hierarchy, which organizes formal grammar classes, context-sensitive productions only varies depending on sibling productions. An example in CSS is `<pseudo-element-selector><pseudo-class-selector>`. But CSS productions can also be sensitive to parent or higher level productions:

  - `<context> = <production>`
  - `context(<production>)`
  - `context: <production>`
  - `@context { <production> }`

The *syntactic context* is any visible object surrounding a value (in CSS: a rule, declaration, function), while the *semantic context* is an invisible wrapper representing sibling and parent productions. Both can change the grammar of a value.


## Requirements

The CSS parser entry points normalize the input into a token stream before any specific processing and parsing against a CSS grammar defined in:

  - [CSS Syntax](https://drafts.csswg.org/css-syntax-3/#rule-defs), with the rule block value types, defined with an algorithm that consumes declarations and rules from the token stream, validates them in the context, and ignore those that are invalid
  - [CSS Value](https://drafts.csswg.org/css-values-4/#value-defs), with the basic data types, defined with their corresponding token, and other CSS types used in many CSS values
  - other CSS specifications, with productions defined either with a value definition and sometimes validation rules written in prose, or with an algorithm

Productions parsed with an algorithm and specific validation rules written in prose immediately exclude parser generators.

And since the rules and declarations are parsed with an algorithm, all that remains is to define the requirements for parsing a prelude, a declaration value, or any other value represented as a list of component values, referred to as a *simple value* in this document.


### Context

A CSS parser must validate rules and declarations *in the context*, which is not defined anywhere nor passed as an argument.

When grouping at-rules like `@media` and `@supports` are nested in a style rule, the grammar of their block value changes. When using `CSSRule.insertRule()`, the node representing `CSSRule` does not exist. So the context must be initialized with its CSSOM representation.

The context representation must allow accessing the parent rule definition, which must tell:

  - which rules are allowed in its block value
  - which properties and descriptors can be declared in its block value
  - whether declarations cascade
  - whether declarations apply to elements

In contexts where declarations cascade or apply to elements, the grammar is implicitly extended with CSS-wide keywords and some arbitrary substitutions, whole value substitutions, and numeric substitutions.

`Element.style` accept declarations for property values applying on `Element`. On the other hand, `Element.sizes` is independent of `Element`: it does not accept the aforementioned element dependent substitutions, and a relative length would resolve based on the initial `font-size` rather than its computed value for `Element`. So the context must be initialized with `CSSStyleProperties` (`Element.style`) to parse `Element.style`, not with `Element`.

Validating a value in the context, before or after matching its definition, often requires traversing the parse tree to access a sibling or parent node. For example, there must be a whitespace preceding `+` and `-` in `<calc-sum>`. So if it is omitted, the validation action associated to the node representing `+` or `-` must return an error if its parent node represents `<calc-sum>`.

Other grammar rules requires modifying the value definition. For example, math functions must support at least 32 arguments, which means the default value (20) of the `#` multiplier of `<calc-sum>` must be overriden. Similarly, `#` must be ignored at the top-level of a production rule for a property value range.

Finally, the context representation must allow to determine the input token marking the end of the parsed node value. So it must be hierarchical, to allow to determine which of a function or block is the closest context, like in `fn([a])` and `[fn(a)]`.


### Backtracking

For a simple value, the parser must backtrack after failing to parse a a node or when the input is not fully consumed in the context. This requirement is unspecified.

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


### Value data structure

The data structure of a token must represent its type in order to be matched against a grammar.

The data structure of a component value must represent the matched productions in parse order, to serialize it according to the appropriate rule. For example, a component value matching `<percentage>` and `<alpha-value>` must serialize as a `<number>` to the shortest possible form, rather than as a `<percentage>`.


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
| `value`      | See below   | The result of (successfully) parsing `input` against `definition`    |

`node.value` is initially `undefined`. For nodes representing a rule, it is assigned its CSSOM representation before parsing its block value. For all other nodes, it is assigned the result of successfully parsing `node`, which can be:

  - a plain object representing a declaration or a token
  - a `List` of component values
  - a `List` of rules

These values are all implemented with a `types` property that includes `node.definition.name`, to serialize it according to the appropriate rule.

`node.definition.name` is also used to resolve specific state transition actions for this production.

A **token** is implemented as a plain object with the following properties:

| Property | Type             | Description                                                                             |
| -------- | ---------------- | --------------------------------------------------------------------------------------- |
| `end`    | `Number`         | The location (index) of the next code point after the token in the input string         |
| `sign`   | `String`         | Only for `<number-token>`, `<dimension-token>`, `<percentage-token>`                    |
| `start`  | `Number`         | The location (index) of the token in the input string.                                  |
| `types`  | `Array`          | The list of productions matched with the token, with the token type as its first entry. |
| `unit`   | `String`         | Only for `<dimension-token>` and `<percentage-token>`                                   |
| `value`  | `Number\|String` | `Number` for numeric tokens, otherwise a `String`                                       |

`token.types[0]` is used to match `token` against a node representing this token type.

**Note:** CSS Syntax defines `<hash-token>`, `<number-token>`, `<dimension-token>`, with a `type` property that has a different meaning than `types`, but is only used to validate a few specific productions of these tokens, which can be achieved without this property.

**Note:** CSS Syntax only defines `unit` for `<dimension-token>`, but `<percentage-token>` can also be considered as a dimension (cf. [#7381](https://github.com/w3c/csswg-drafts/issues/7381)), therefore it is also implemented with this property, to simplify parsing and serializing.

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

A context must be initially created by the parser entry point with an optional instance of `CSSStyleSheet`, `CSSRule`, `CSSFontFeatureValuesMap`, `CSSStyleDeclaration`, or one or more rule production names (to create an arbitrary context).

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

`parseGrammar()` is an implementation of [*parse something according to a CSS grammar*](https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar) that is used to parse *something else* in a context being parsed. It creates a node with the provided input, grammar, and context, before parsing this node with a state machine. It is also responsible for normalizing the input into a stream of tokens, and the grammar and context into apppropriate representations.

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

To parse a rule, its definition must first be resolved from the definitions of rules accepted in the context. If there is an `<at-keyword-token>` at the front of the input, it is the first definition whose `name` matches the value of this token or whose `names` includes it. Otherwise, it must resolve to the definition of the `qualified` rules in this context, if any, which assumes that a context only accepts a single type of `qualified` rules.

After consuming and validating its prelude, its CSSOM representation is created, and its constructor parses its block value. `matchStyleSheet()` validates the order of the rule and registers `@namespace` in `context.globals`.

To parse a declaration, its definition must first be resolved with the `<ident-token>` at the front of the input from the dictionaries of properties and descriptors accepted in the context. Then its value must be validated. When they are allowed in the context, the parser first parses the input against CSS-wide keywords, which must be interpreted like for standard properties in a custom property value, then it looks for an arbitrary substitution, and returns a parse error if it finds a positioned {} block, which would mean that there might be a qualified rule at the front of the input, then it parses the input against the grammar of the property or descriptor, then against the grammar of the whole value substitutions.

**Note:** while looking for an arbitrary substition, it does not *immediately* return `null` if it finds `<bad-*-token>`, `)`, `]`, `}`, `;`, `!`, when they do not close a parent structure in the input, to allow returning a parse error if it later finds a positioned {} block.

Finally, it validates a priority, if any


#### State machine

The state machine allows defining transition actions for a specific production.

| Action        | Description                                                               |
| ------------- | ------------------------------------------------------------------------- |
| `configure`   | Override the node                                                         |
| `preprocess`  | Validate a semantic rule                                                  |
| `postprocess` | Validate a semantic rule, simplify a valid match result                   |
| `replace`     | Replace a match failure with the result from parsing a substitution value |
| `intercept`   | Handle a parse error                                                      |

The next state is based on the output of the previous action, which can be `undefined`, `null`, `Error`, or a valid parse result, except the initial transition action, which must return a node.

When `Error` is returned, it means that the input is guaranteed to be invalid, up to the first context ignoring invalid contents. When `null` is returned, it means that the part of the value at the front of the input is guaranteed be invalid for the node. Returning `undefined` has different meaning depending on the action:

  - `preprocess`: continue parsing with `match`
  - `match`: continue parsing with `replace`
  - `postprocess`: resume `match` to find a longer match
  - `replace`: continue parsing the next alternative of the parent node

Returning `null` or `undefined` from `replace` has the same meaning.

Parsing a node whose state is `accepted` cannot be resumed after backtracking: it must be `matched`. A valid value returned from `preprocess`, `replace`, `intercept`, is `accepted`, while a valid value returned from `match` and `postprocess` is `matched`.

`node` represents a hierarchical state tree in the sense that `node.state` is always `matching` while parsing `node.children`.
