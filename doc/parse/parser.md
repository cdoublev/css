
# Parser

The parser entry points normalize the input into a token stream before any specific processing and parsing against a CSS grammar defined in:

  - [CSS Syntax](https://drafts.csswg.org/css-syntax-3/#rule-defs), with the CSS rule block value types, defined with an algorithm that consumes declarations and rules from the token stream, and validates them in the context
  - [CSS Value](https://drafts.csswg.org/css-values-4/#value-defs), with the CSS basic data types, defined with their corresponding token, and other CSS types used in many CSS values
  - other CSS specifications, with productions usually defined with a value definition and possibly specific rules written in prose, sometimes with an algorithm

There are many established tools like Lex + Yacc or ANTLR that take a grammar defined with production rules as input, and return a parser as output, which is often as efficient as any handwritten parser. Then why implement a CSS parser?

This document introduces some concepts of the formal language theory before defining the specific requirements of a CSS parser, and providing an overview of the parser in this library.


## Theory

### Parse tree

Parsing is the process of deriving an unstructured input into a representation exposing its grammatical structure, by applying production rules on the input.

A **derivation** is the path followed to traverse the input and production rules.

**Note:** in functional programming, `traverse` can be described as a more powerful version of `reduce`, and parsing does indeed reduce a string into a parse tree, but both are not powerful enough to parse CSS.

A **derivation tree** (aka. concrete tree or parse tree) is a hierarchical representation of this traversal. A branch node represents a non-terminal, a combination, a repetition, as a container for zero or more component values. A leaf node represents a terminal as a single component value.

**Note:** in graph theory, a parse tree is a graph that is acyclic, finite, undirected, connected, rooted, ie. there is exactly one bidirectional path between two nodes and there is a node designated as the root of the tree.

This traversal can start from the root node, follow a **pre-order**, which means a parent node is visited before its children, and end to the rightmost leaf node, resulting to a *leftmost derivation*. Or it can start from the leftmost leaf node, follow a **post-order**, which means a parent node is visited after its children, and end to the root node, resulting to a *rightmost derivation in reverse*.

**Note:** *pre-order* and *post-order* are also named *top-down* and *bottom-up* orders because parse trees are often represented with their root node at the top and their leaves at the bottom, which makes these names coupled to the visual representation of the tree.

How a production rule is applied depends on the traversal order. When following a pre-order, its left-hand side is *expanded* with the symbols on its right-hand side, which are *folded* into the left-hand side when following a post-order.

An **abstract syntax tree** is the result of simplifying the parse tree in order to be semantically interpreted or compiled by another program (eg. the HTML document renderer or a CSS processing tool).


### Context

Some grammars are said to be **context-sensitive** or **context-free**.

In Chomsky hierarchy, which organizes formal grammar classes, context-sensitive productions only varies depending on sibling productions. An example in CSS is `<pseudo-element-selector><pseudo-class-selector>`.

But CSS productions can also be sensitive to parent or higher level productions:

  - `<context> = <production>`
  - `context(<production>)`
  - `context: <production>`
  - `@context { <production> }`

The *syntactic context* is any visible object (rule, declaration, function) surrounding a value, whereas the *semantic context* is an invisible wrapper. Both can change the grammar of a value.


### Ambiguity

An **ambiguity** exists when there are multiple derivations for the same input.

A canonical example to illustrate a parsing ambiguity is the grammar of math operations, which involves associativity and precedence rules. The priorities associated with these rules are important because the (semantic) result could be different without them.

As in math operations, left associativity is usually expected for parsing programming languages: the parser must read the input from left to right: `1 - 2 + 3` must be interpreted to `2` instead of `4`. But to interpret `1 + 2 * 3` to `7` instead of `9`, precedence rules must be encoded with a more complex value definition than `<calc-value> [['+' | '-' | '*' | '/'] <calc-value>]*`.

For grammars that remain ambiguous, a priority must be decided, either ahead of time (statically), with the first, last, or longest match priority, or at parse time (dynamically), depending on the context.

Detecting ambiguities is non-trivial when symbols can be combined in any order or multiplied a varying number of times. Generating a LL/LR (Left to right, Leftmost/Rightmost derivation) parser from a grammar is the only guarantee that it is unambiguous.


### Automaton

An **automaton** is a machine (computing device) used to study computational problems and the requirements to resolve them in terms of a predetermined sequence of operations (an algorithm) and the complexity (time and memory usage) of these operations.

A **deterministic** automaton is equivalent to a pure function: for a given input and state, it will always transition to the same next state and produce the same output. There cannot be anything else to resolve the next state, like an external state (aka. qualitative state or context) or randomness.

Look-ahead (of more than one input token) and backtracking do not make an automaton undeterministic but both operations increase the complexity. Similarly, an external state stored in memory can be updated in a deterministic way but it makes the machine dependent on the size of its memory, which is affordable with modern computing devices.

Chomsky hierarchy defines a nomenclature of formal grammars:

  - type 1: Context-Sensitive Grammar (CSG)
    - automaton: Linear Bounded Automaton (non-deterministic Turing Machine)
    - production rule
      - left hand side: one or more symbols (at least one non-terminal)
      - right hand side: one or more symbols (at least one terminal)
  - type 2: Context-Free Grammar (CFG)
    - automaton: Push-Down Automaton (non-deterministic or deterministic)
    - production rule
      - left hand side: a single non-terminal
      - right hand side: one or more symbols (at least one terminal)
  - type 3: regular grammar
    - automaton: Deterministic Finite Automaton
    - production rule
      - left hand side: a single non-terminal
      - right hand side: a single terminal optionally followed (usually, otherwise preceded) by a non-terminal
      - no recursion

All regular grammars can be parsed with a Push-Down Automaton, which is said to be *more powerfull* than a Finite Automaton. Similarly, a regular language and grammar can be said to be *simple* as opposed to more *complex* languages and grammars.

A language is said to be finite if there is no recursion in its grammar, which is different than an infinite number of repetitions. The CSS grammar includes some recursions but it defines a limit for both recursion and repetition.


### State of the art

WIP


## Requirements


### Backtracking

A CSS parser must backtrack after failing to match a component value or when the input is not fully consumed. This requirement is unspecified and only applies to parsing a list of component values.

It must successfully parse `a a b` against `[a | a a] b`, or `a a` against `a | a a`, by backtracking, instead of failing to find a match after the first choice in `a | a a` (greedy parser), or instead of looking ahead or re-ordering `a | a a` to `a a | a` to find the longest match (maximal munch parser).

**Note:** an obvious requirement that follows is that an input component value must not be tagged with the name of a production that was matched before backtracking.

Backtracking requires saving the index in the input list of component values, before parsing a node. If the tail node fails to be parsed and cannot yield an alternative result, it must be removed from the tree before backtracking again. Any sequence of symbols combined with `|`, `||`, `&&`, or any symbol qualified by a multiplier where `min < max`, yield alternatives.

One would expect to read combined symbols in the same direction as the input. For example, `a a` would match the first alternative in `[a | a a] a?` (`a?` would not be omitted). But the specifications do not define such priority in alternations (`|`) and arrangements (`||`).

**Note:** the CSS grammar defines some priorities, like `<number>` or `<integer>` over `<length>` (or `<length-percentage>`) when the input is `0`.

It would be useless to try other `<color>` alternatives when matching `#000 false` against `<color> true`. Actually, there are only a few productions that can yield a different result after backtracking, and they would not need it if their alternatives were sorted in left precedence order for longest match priority.

**Note:** this actually has no significant impact on time complexity.

Similarly, backtracking is useless when a function or simple block value failed to match its (context-free) value definition, or when a value is invalid according to a specific rule for the production: the whole input is guaranteed to be invalid. But many functions and simple blocks are defined with alternative value definitions like `rgb(<percentage>#{3}, <alpha-value>?) | rgb(<number>#{3}, <alpha-value>?)` instead of `rgb([<number>#{3} | <percentage>#{3}], <alpha-value>?)`.

**Note:** this actually has no significant impact on time complexity.

The only way to short-circuit recursive parse functions and immediately abort parsing, is to throw an error and catch it in a main parse function. However, error boundaries are needed to resume parsing at a higher level.


### Parsing flow

To [parse a CSS style sheet](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet), the parser must *consume a stylesheet's contents* as objects (rules) from the token stream. Similarly, to [parse a CSS rule](https://drafts.csswg.org/cssom-1/#parse-a-css-rule), it must consume a rule as an object.

But [`@page`](https://drafts.csswg.org/css-page-3/#syntax-page-selector), a top-level rule defined since CSS 1, must be parsed with *parse something according to a CSS grammar*, which runs first *parse a list of component values*, which does not expect a high-level object.

Similarly as for a function or a simple block, `@page <page-selector-list> { <declaration-rule-list> }` does not represent a list of tokens but an object whose `name`, `prelude`, `value`, matches the corresponding part of this value definition.

To parse `<declaration-rule-list>` and other [`<block-contents>` subtypes](https://drafts.csswg.org/css-syntax-3/#typedef-block-contents), the parser must *consume a block’s contents* (rules and declarations), which requires filtering contents invalid in the context, which means any qualified rule, and any at-rule or declaration that is not accepted in `@page` or that does not match the corresponding grammar.

The parser must not only be able to parse a grammar by matching a value definition, but also by validating the result against a specific rule, removing or replacing invalid parts, etc.

For example, to parse `<media-query-list>` in `@media`, `<forgiving-selector-list>` in a style rule, or `<font-src-list>` in `@font-face`, the parser must *parse a comma-separated list according to a CSS grammar*, which matches each list of component values resulting from *parse a comma-separated list of component values* against `<media-query>`, `<complex-real-selector>`, `<font-src>`, respectively, or returns an empty list.

CSSOM implicitly requires creating a `CSSRule` before validating its order but neither CSSOM or CSS Syntax requires creating `CSSStyleSheet` or `CSSRule` before or after parsing it againt its grammar.


### Context

As a reminder, the semantic context is represented by sibling and parent productions, and the syntactic context is represented by the higher level objects: functions, declaration, rules.

When `@media` and `@supports` are nested in a style rule, their block value does not accept the same rules. This raises the question of how to represent and access context.

Looking first at how to access a parent CSS rule value, definition, or both, it can be achieved by ensuring the parser records them. But they would be missing when using `CSSRule.insertRule()`, so the initial context must be initialized with the existing CSSOM tree.

A CSS rule definition must define:

  - the CSS rules allowed or excluded in its block value
  - the properties/descriptors that can or cannot be declared in its block value
  - whether declarations cascade
  - whether it applies to elements

The grammar may be extended depending on the context. Arbitrary and whole value substitutions are not part of a specific property grammar but are accepted for any property, and for descriptors in some contexts. Similarly, some numeric substitutions are only valid in contexts applying to an element.

`Element.style`, `Element.sizes`, `CanvasTextDrawingStyles.font`, `CSSFontFeatureValuesMap.set()`, etc, use parser entry points that take a grammar but no context. However, since CSS Syntax often requires validating values *"in the context"*, it is implicitly required, and the `grammar` argument can remain context-free. It cannot represent a style rule by default, since none of the above interfaces are associated to a style rule.

Reading the semantic context may require traversing the tree from bottom to top. Such requirement is related to the well-known time and space trade off: storing a reference of a parent node in child nodes takes space but traversing a tree takes time. Other trade-offs exist between a static tree path, coupled with the grammar and exposed to the slightest change, and a functional search, whose time complexity could be slightly greater.

As an example of a semantic context rule, there must be a whitespace preceding `+` and `-` in `<calc-sum>`. This raises the question of how to apply semantic context rules.

A simple solution is to define the nodes representing `+` and `-` with a boolean flag like `requireLeadingWhitespace`.

**Note:** whitespaces are usually optionals between component values, which means that failing to consume a whitespace before matching a component value must not cause a parse failure.

Other semantic rules can be encoded in nodes. For example, math functions must support at least 32 arguments, which means the default value (20) of the `#` multiplier of `<calc-sum>` must be overriden. `#` must also be ignored in the top-level value definition expanded from a property value range (eg. `<'color'>`).

A more generic solution is `preprocess(node)` executing any sub-routine associated to the name of the production represented by `node`. It could return `Error` to abort parsing when the whitespace is missing, or `null` to backtrack.

There are many semantic rules that can only be applied after matching the value definition, to validate the result against the context, or to create a different representation (eg. math functions and `<an+b>`). This can be achieved with `postprocess(node)` (or `validate(node)` and `represent(node)`).

All numeric values can be replaced with a math function. This can be achieved with `replace(node)` returning the result from parsing the alternative grammar.


## Implementation

### Data model


#### Nodes


#### Trees


### Processing model


#### Entry points


#### State machine
