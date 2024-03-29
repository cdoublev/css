
# Parser

Parser entry points normalize the input into a list of component values before any specific processing, and before parsing against a production of the CSS grammar.

The CSS grammar is defined in:

  - [CSS Syntax](https://drafts.csswg.org/css-syntax-3/#rule-defs), with the productions of rule block values, defined with algorithms that consume a list of declarations and/or rules from the list of component values, and with generic rules written in prose to validate them according to their context
  - [CSS Value](https://drafts.csswg.org/css-values-4/#value-defs), with the productions of CSS basic data types, which are terminals defined with their corresponding token, and other productions used in many CSS values
  - other CSS specifications, with productions usually defined with a value definition and possibly with specific rules written in prose

There are many established tools like Lex + Yacc or ANTLR that take a grammar defined with production rules as input, and return a parser as output, which is often as efficient as any handwritten parser. Then why implement a CSS parser?

This document introduces some concepts of the formal language theory before defining the specific requirements of a CSS parser, and providing an overview of the parser used in this library.

## Theory

### Parse tree

Parsing is the process of deriving an unstructured input into a representation that exposes its syntactic structure, by applying the production rules of the grammar that corresponds to the input language.

A **derivation** is the path followed to traverse the input and production rules.

**Note:** in functional programming, `traverse` is a function that could be described as a more powerfull version of the `reduce` function, and parsing does indeed reduce a string into an object, but both functions are not powerfull enough to parse CSS.

A **derivation tree** (aka. concrete tree or parse tree) is a hierarchical representation of this traversal. A branch node represents a non-terminal, a combination, or a repetition, as a container for zero or more component values. A leaf node represents a terminal as a component value.

**Note:** in graph theory, a parse tree is a graph that is acyclic, finite, undirected, connected, rooted, ie. there is exactly one bidirectional path between two nodes and there is a node designated as the root of the tree.

This traversal can start from the root node, follow a **pre-order**, which means a parent node is visited before its children, and end to the rightmost leaf node, resulting to a *leftmost derivation*. Or it can start from the leftmost leaf node, follow a **post-order**, which means a parent node is visited after its children, and end to the root node, resulting to a *rightmost derivation in reverse*.

**Note:** *pre-order* and *post-order* are also named *top-down* and *bottom-up* orders because parse trees are often represented with their root node at the top and their leaves at the bottom, which makes these names coupled to the visual representation of the tree.

How a production rule is applied depends on the traversal order. When following a pre-order, it is applied by *expanding* its left-hand side with the symbols on its right-hand side. When following a post-order, the right-hand side is *reduced* into its left-hand side.

An **abstract syntax tree** is the result of simplifying the parse tree in order to be semantically interpreted or compiled by another program (eg. the HTML document renderer or a CSS processing tool).

### Context

Some grammars are said to be **context-sensitive** or **context-free**.

In Chomsky hierarchy, which organizes formal grammar classes, the productions of context-sensitive grammars vary depending on sibling productions. In CSS, an example is `<pseudo-element-selector><pseudo-class-selector>`.

But CSS productions can also be sensitive to a higher level context:

  - a production: `<parent> = <children>`
  - a function: `parent(<children>)`
  - a declaration: `parent: <children>`
  - a rule: `@parent { <children> }`

### Ambiguity

An **ambiguity** exists when multiple derivations exist for the same input.

When a grammar is ambiguous, a priority must be decided, either ahead of time (statically), per production or with first, last, or longest match priority, or at parse time (dynamically), depending on the context.

A canonical example to illustrate a parsing ambiguity is the grammar of math operations, which involves associativity and precedence rules. The priorities associated with these rules are important because the (semantic) result could be different.

As in math operations, left associativity is usually expected for parsing programming languages. The parser must read the input from left to right: `1 - 2 + 3` must be interpreted to `2` instead of `4`.

Precedence rules must be hard-coded in production rules. `1 + 2 * 3` must be interpreted to `7` instead of `9`, which means that a calculation must be defined with a slighlty more complex value definition than `<calc-value> [['+' | '-' | '*' | '/'] <calc-value>]*`.

Detecting ambiguities is non-trivial when symbols can be combined in any order or multiplied a varying number of times. Generating a LL/LR (Left to right, Leftmost/Rightmost derivation) parser from a grammar is the only guarantee that it is unambiguous.

### Automaton

An **automaton** is a machine (computing device) used to study computational problems and the requirements to resolve them in terms of a predetermined sequence of operations (an algorithm) and the complexity (time and memory usage) of these operations.

A **deterministic** automaton is equivalent to a pure function: for a given (internal) state and input, it will always transition to the same next state and produce the same output. There cannot be anything else to resolve the next state, like an external state (aka. qualitative state or context) or randomness.

Look-ahead (of more than one input token) and backtracking do not make an automaton undeterministic but these operations have a higher complexity. Similarly, an external state stored in memory can be updated in a deterministic way but it makes the machine dependent on the size of its memory (space complexity), which is totally acceptable for modern computing devices.

Chomsky hierarchy defines a nomenclature of formal grammars:

  - type 1: Context-Sensitive Grammar (CSG)
    - automaton: Linear Bounded Automaton (non-deterministic Turing Machine)
    - production rule
      - left hand side: one or more symbols (at least one non-terminal)
      - right hand side: one or more symbols (at least one terminal)
  - type 2: Context-Free Grammar (CFG)
    - automaton: Push-Down Automaton (non-deterministic or deterministic)
    - production rule
      - left hand side: only a single non-terminal on the left hand side
      - right hand side: one or more symbols (at least one terminal)
  - type 3: regular grammar
    - automaton: Deterministic Finite Automaton
    - production rule
      - left hand side: only a single non-terminal
      - right hand side: only a single terminal optionally followed (usually, otherwise preceded) by a non-terminal
      - no recursion

All regular grammars can be parsed with a NPDA, which is said to be *more powerfull* than a DPDA and a FA. Similarly, a regular language and grammar can be said to be *simple* as opposed to more *complex* languages and grammars.

A language is said to be finite if there is no recursion in its grammar, which is different than an infinite number of repetitions. The CSS grammar includes some recursions but it defines a limit for both recursion and repetition.

WIP

### State of the art

WIP

## Requirements

### Backtracking

The following quotes from [these](https://github.com/w3c/csswg-drafts/issues/2921) [issues](https://github.com/w3c/csswg-drafts/issues/7027) expose the main requirement for matching a list of component values against a CSS value definition (*parsing grammar* or *parsing*): **find a match with backtracking**.

  > - **tabatkins:** CSS tokenization is <a href="#greedy">greedy</a> [...] but [grammar] parsing is definitely <a href="#non-greedy">non-greedy</a>. [...]
  > - **tabatkins:** the tokenization algorithm is designed to implement <a href="#longest match">"longest match"</a> <a href="#greedy">greedy</a> semantics for a theoretical equivalent grammar, because that is the semantics that CSS2 had when it did specify tokenization with a grammar. [...]
  > - **tabatkins:** parsing grammar is <dfn id="non-greedy">non-greedy; if the first branch that starts to match eventually fails, you just move on to the second branch and try again. There is no need to order the branches in any particular way to accommodate this [...]. You have to be able to backtrack.</dfn>
  > - **cdoublev** I must move "one step backwards" and try with another branch, if any, even if it means matching a type that the parser already had a match for.
  > - **tabatkins** Right, that's a backtracking parser vs a greedy/first-match parser [...].
  > - **tabatkins** CSS grammars obey longest match semantics, not ordered-match semantics, but that's not stated anywhere.
  > - **cdoublev:** Is there a difference between obey longest match semantics and greedy? Is it possible to obey longest match semantics without being greedy?
  > - **tabatkins:** Yes, <dfn id="greedy">greedy means the first thing to match a segment claims that segment forever, even if it would cause the overall match to fail.</dfn> <dfn id="longest match">Longest match is somewhat greedy - the parse that consumes the most tokens for a production is the one that wins, even if it would cause the overall match to fail, but that is not necessarily the "first" (it depends on how you order the productions).</dfn> [...]
  > - **tabatkins:** CSS grammar parsing is not longest match, at least in general.

When given `a a` as input, a backtracking parser successfully matches `a | a a` after backtracking instead of failing after matching the first choice (greedy), or instead of re-ordering `a | a a` to `a a | a` (longest match).

One would expect to read combined symbols in the same direction as the input. For example, `a a` would match the first alternative in `[a | a a] a?` (`a?` would not be omitted). But the CSS value definition syntax does not define such priority in alternations (`|`) and arrangements (`||`).

**Note:** the CSS grammar defines some priorities, like `<number>` or `<integer>` over `<length>` (or `<length-percentage>`) when the input is `0`.

And when parsing `a a a` against `[a | a a] a`, assuming the parser first finds a match against the first alternative, it must not immediately try to find a longer match in other alternatives. It would rarely make sense. For example, `<color>` is defined with `<hex-color> | <named-color> | transparent | <rgb()> | <rgba()> | ...`. Instead, while the input is not fully consumed, it backtracks to find an overall match.

It would be useless to try other alternatives when matching `#000 false` against `<color> true`. Actually, there are only a few productions that can yield a different match with backtracking, and they would not need it if they were defined with left precedence and their alternatives were sorted in a different order.

It would also be useless to parse multiple times a function block value that matched its (context-free) value definition. For example, a gradient function as the only input value for `background` would be parsed many times, even when all permutations not starting with `<bg-image>` are skipped.

Similarly, backtracking is useless when a function block value failed to match its (context-free) value definition, or when a value is invalid according to a production specific rule written in prose: the whole input is guaranteed to be invalid.

When running parse functions recursively, the only way to short-circuit recursions and immediately abort parsing is to throw an error handled in a main parse function. However, there should be appropriate error boundaries to let the parser continue at a higher level, noting that `catch {}` increases time complexity.

Any value definition including a choice can yield a different result after backtracking: symbols combined with `|`, `||`, `&&`, or qualified by a multiplier where `min < max`.

Backtracking requires to save an **execution state** to move back at the parse tree node (derivation step) and the index in the list of component values that corresponds to the last choice, and to discard the corresponding matched component values.

### Parsing flow

To [parse a CSS style sheet](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet), the parser must first *parse a styleseet*, which must *consume a list of rules* as high level objects. Similarly, `CSSStyleSheet.replace()`, `CSSStyleSheet.replaceSync()`, `CSSStyleSheet.insertRule()`, `CSSRule.insertRule()`, `CSSRule.appendRule()`, must *parse a list of rules* or *parse a rule*, which consume rule(s) as high level object(s) from the top-level rule(s) in their input.

**Note**: *parse a stylesheet* receives `location` but only from [*fetch an @import*](https://drafts.csswg.org/css-cascade-4/#fetch-an-import), defined in Cascade 4 but removed in Cascade 5, therefore it can be replaced with *parse a list of rules* implemented with a `topLevel` flag (unset by default), noting that `CSSStyleSheet.replace()` and `CSSStyleSheet.replaceSync()` do not need to set this flag because they do not require to be backward-compatible when handling `<!--` and `-->` wrapping a top-level qualified rule.

But [`@page`](https://drafts.csswg.org/css-page-3/#syntax-page-selector), a top-level rule existing since CSS 1, must be parsed with *parse something according to a CSS grammar*, which must *parse a list of component values*, which does not consume rules as objects, before matching the list against `@page <page-selector-list> { <declaration-list> }`.

What a rule's value definition like `@page <page-selector-list> { <declaration-list> }` represents is unclear because of this problem. It could be either:

  1. an `<at-keyword-token>` whose value is `page`, followed by component values matching `<page-selector-list>`, then `<{-token>`, then component values matching `<declaration-list>`, then `<}-token>`
  2. a single object whose `name`, `prelude`, and `value`, match the corresponding parts of the value definition, similarly as for a function `name` and `value`

This means there is a problem either in CSS Paged Media, which should not define `@page` to be parsed with *parse something according to a CSS grammar*, or in CSS Syntax, which should define *consume an at-rule* and *consume a qualified rule* so that they return a list of component values instead of an object with a `name`, `prelude`, `value`, assigned the corresponding slices of the list.

[`<declaration-list>`](https://drafts.csswg.org/css-syntax-3/#typedef-declaration-list) must be parsed with *consume a list of declarations*, which must *consume an at-rule* or *consume a declaration*. All parser algorithms defined in CSS Syntax can handle a list of tokens or component values as input, and consume component values from tokens, which means that no input can match a production representing a token. Yet some value definitions include productions representing tokens (see [value-data-structure.md](./value-data-structure.md)).

The parser must not only be able to parse a grammar by matching a value definition, but also by applying a syntax algorithm before validating the result against the context, then matching it against the appropriate grammar(s), and possibly excluding or replacing invalid parts.

To parse `<declaration-list>`, `<style-block>`, `<rule-list>`, `<stylesheet>`, the parser must first run *consume a list of declarations*, *consume a style block's content*, *consume a list of rules*, respectively, then validate their contents (rules and/or declarations) according to the context, and parse them against the corresponding grammar.

  > If any style rule is invalid, or any at-rule is not recognized or is invalid according to its grammar or context, it’s a parse error. Discard that rule.
  >
  > [...]
  >
  > Declarations for an unknown CSS property or whose value does not match the syntax defined by the property are invalid and must be ignored. The validity of the style rule’s contents have no effect on the validity of the style rule itself. [...]

Assuming the result from parsing `<declaration-list>` in `@page` would be matched against `[<declaration> ;]* [<@top-left-corner> | <@top-left> | ...]*`, an invalid declaration or rule would cause a parse failure for the entire block's value instead of just being ignored.

To parse `<media-query-list>` and `<forgiving-selector-list>`, the parser must *parse a comma-separated list according to a CSS grammar*, which returns an empty list for an input of zero or more white spaces, or runs *parse a comma-separated list of component values* before matching each resulting list of component values against `<media-query>` or `<complex-real-selector>`, respectively. Then `<media-query-list>` requires to replace invalid results with `not all`, whereas `<forgiving-selector-list>` requires to remove them.

### Context

As a reminder, the context is either a sibling or parent production (representing one or more sibling component values), a containing function, declaration, or rule.

For example, parsing a prelude may require to know which rule it belongs to. This raises the question of how to represent, access, and apply context rules.

Looking first at how to access the context value, definition, or both, it can be achieved by ensuring the parser keeps track of each parsed value with a parse tree node. But there will be none representing the context of `CSSRule` when using `CSSRule.insertRule()`.

For example, the block value of `@media` and `@supports` must be defined with `<style-block>` instead of `<stylesheet>`, when they are nested in a style rule.

The whole context of CSS rules can only be resolved from the CSSOM tree. Actually, it is also required to validate that any namespace prefix used in a selector has been declared in a top-level `@namespace`.

**Note:** `*` and null are the only valid namespace prefixes allowed in `Element.querySelector[All]()` because this interface does not provide a way to resolve declared namespaces.

CSS rule definitions could be stored in the CSSOM tree resulting from parsing, noting that objects from CSS Syntax do not have `parentRule` like `CSSRule`. But a better solution would be to use a `CSSRule` property as an identifier to resolve the definition in a separate data structure.

A CSS rule definition must define:

  - the CSS rules allowed or excluded in its block value
  - the property/descriptor names that can or cannot be declared in its block value
  - how property/descriptor declarations participate to the cascade

---

A production can also be sensitive to the context defined by a sibling or parent production.

For example, there must be a white space preceding `+` and `-` in `<calc-sum>`: the semantic context is `<calc-sum>` and the syntactic context is the white space.

Semantic context rules require to traverse the parse tree from bottom to top. Such requirement is related to the well-known time and space trade off: storing a reference of a parent node in its child node(s) takes more memory space, whereas traversing the tree takes more time.

To apply this rule, value definition objects representing `+` and `-` could have `requireLeadingWhitespace` as a boolean flag, or `preprocess` as a function receiving the input list and returning `Error` to abort parsing the whole input when the white space is missing, whereas `null` could be returned as a parse failure before backtracking.

**Note:** white spaces are usually optionals between component values, which means that failing to consume a white space before matching a component value must not cause a parse failure.

Other production specific rules can be encoded in value definition objects. For example, math functions must support at least 32 arguments: the default value (20) of the `#` multiplier qualifying `<calc-sum>` must be overriden. `#` must also be ignored in a top-level value definition when the context is a production bearing the same name as a property.

There are many production specific rules that can only be applied after matching their value definition, to discard an invalid match, or to create a different representation like for math functions, `<urange>`, and `<an+b>`. It can be achieved with a `postprocess` function, similar to `preprocess`.

All numeric values can be replaced with a math function and `<rgb()>` accepts a separate legacy value definition. This can be achieved with a `replace` function receiving the input list and returning the result from parsing the alternative grammar.

Instead of assigning functions to value definition objects, the parser could receive a mapping from production names to these functions, and more advanced patterns (observer, state machine) can be implemented to automatically apply them.

## Implementation

### Model


### Context tree

`ParseContext` is a tree built in parallel to parsing rules and represents the current context `definition`, `value`, and any `parent` context.

A rule definition must be resolved from the current context definition using some data of the rule object.

At-rules have a `name` when parsed as CSS Syntax objects but it is not always exposed by the corresponding CSSOM interface (extending `CSSRule`), or it may represent a different value, therefore it is used to resolve a type against the current context definition, and is added to the private `type` of the implementation class of the `CSSRule` interface.

This type is also used to resolve the `CSSRule` subclass:

  - `page` for `CSSPageRule`
  - `margin` for `CSSMarginRule`
  - `keyframe` for `CSSKeyframeRule`
  - `style` for `CSSStyleRule`
  - etc

When initializing `ParseContext` with an existing `CSSRule`, its definition is resolved (recursively, from bottom to top, via `CSSRule.parentRule` and `CSSRule.parentStyleSheet`) with the last `CSSRule.type` entry.

Most at-rules have a `type` directly resolved from their `name`. For margin rules, it is resolved from the `type` of the first rule in the current context definition whose `names` include `rule.name`. For qualified rules, it resolves to the `qualified` value defined in the current context definition (a rule's block value can only contain a single type of qualified rules).

**Note:** it may seem that the margin rule type could be resolved the same way as for a `qualified` rule, eg. with `atRule` defined on the current context definition, but searching for the `name` also validates `rule.name`.

Rule definitions are also represented with a tree whose root node defines a style sheet. Representing relations between rules, some of which are context-sensitive, is less complex with a multi-level structure and pointers than with a flat list and literal keys.

Rule definitions must have a `prelude` and/or a `value` defined with the corresponding CSS value definition, and may have one or more of the following properties:

  - whether or not the declarations of properties or descriptors matching a property are `cascading`
  - the `names` of the at-rules accepted in its block value
  - the `descriptors` that can be declared in its prelude or block value
  - the `properties` that can be declared in its block value
  - the `qualified` rule type accepted in its block value
  - the `rules` allowed or excluded in its block value: a sub-context definition tree or a list of excluded rule types.

`ParseContext` must have the following properties:

  - `ParseContext.value`: the input context value
  - `ParseContext.definition`: the context definition
  - `ParseContext.parent`: the `ParseContext` for the `parentCSSRule`
  - `ParseContext.root`: the `ParseContext` for the `parentCSSStyleSheet`
  - `ParseContext.namespaces` (only for `CSSStyleSheet`): the namespaces declared in the CSS style sheet

`ParseContext.constructor(block?, parent?)` can receive a `CSSStyleSheet` or `CSSRule` as `block`. The `parent` argument is private and only used by `ParseContext.enter()`. When `block` is omitted, the context definition is the definition of a style rule. It corresponds to the required context when using `Element.style.setProperty()`: `Element.style.parentRule` is `null` but all `properties` must be allowed as in a style rule.

`ParseContext.enter(rule, parent?)` must return a child `ParseContext` if `rule` is valid according to the current `ParseContext`. The `parent` argument is private, is only used in `scripts/initial.js`, and default to `this`. It returns a `ParseContext` to use for parsing `rule.prelude` and/or `rule.value`.

### Parse tree

Single symbol definitions:

| Symbol          | Definition                                                                          |
| --------------- | ----------------------------------------------------------------------------------- |
| `'+'`           | `{                  type: 'delimiter',    value: '+' }`                             |
| `keyword`       | `{ name: 'keyword', type: 'terminal',     value: 'keyword' }`                       |
| `<number [0,]>` | `{ name: 'number',  type: 'terminal',     range: { min: 0, max: Infinity } }`       |
| `fn(<type>)`    | `{ name: 'fn',      type: 'function',     value: '<type>' }`                        |
| `<parent>`      | `{ name: 'parent',  type: 'non-terminal', value: 'definition...' }`                 |
| `<parent [0,]>` | `{ name: 'parent',  type: 'non-terminal', value: 'definition...', range: { ... } }` |
| `<fn()>`        | `{ name: 'fn()',    type: 'non-terminal', value: 'definition...' }`                 |
| `<'prop'>`      | `{ name: 'prop',    type: 'property',     value: 'definition...' }`                 |

Sequence definitions:

| Type        | Node                                                                  |
| ----------- | ----------------------------------------------------------------------|
| `a?`        | `{ type: 'optional', value: { ... } }`                                |
| `a#?`       | `{ type: 'optional', value: { ... } }`                                |
| `[a?]!`     | `{ type: 'required', value: { ... } }`                                |
| `a*`        | `{ type: 'repeat', min: 0, max: 20, value: { ... } }`                 |
| `a+`        | `{ type: 'repeat', min: 1, max: 20, value: { ... } }`                 |
| `a#`        | `{ type: 'repeat', min: 1, max: 20, separator: ',', value: { ... } }` |
| `a+#`       | `{ type: 'repeat', min: 1, max: 20, separator: ',', value: { ... } }` |
| `a{0,n}`    | `{ type: 'repeat', min: 0, max: n, value: { ... } }`                  |
| `a#{0,n}`   | `{ type: 'repeat', min: 0, max: n, separator: ',', value: { ... } }`  |
| `a a`       | `{ type: ' ', value: [...] }`                                         |
| `a && a`    | `{ type: '&&', value: [...] }`                                        |
| `a || a`    | `{ type: '||', value: [...] }`                                        |
| `a | a`     | `{ type: '|', value: [...] }`                                         |
| `a && a a`  | `{ type: '&&', value: [...] }`                                        |
| `a [a | a]` | `{ type: ' ', value: [...] }`                                         |

### Hooks

### Whitespace

### Separator of multiplied value

### Comma-elision rules

Parsing a comma is subject to the [comma-elision rules](https://drafts.csswg.org/css-values-4/#comb-comma):

  > Commas specified in the grammar are implicitly omissible in some circumstances, when used to separate optional terms in the grammar. Within a top-level list in a property or other CSS value, or a function’s argument list, a comma specified in the grammar must be omitted if:
  >
  >  - all items preceding the comma have been omitted
  >  - all items following the comma have been omitted
  >  - multiple commas would be adjacent (ignoring white space/comments), due to the items between the commas being omitted.

**Issue:** the first sentence should be *[...] when used to separate an optional term* because it is not required that the preceding and the following term are both optional.

An exception to the comma-elision rules is [a trailing comma in `var()`](https://drafts.csswg.org/css-variables-2/#using-variables).

Some cases subject to comma-elision rules:

  - `a?, x`: preceding the comma
  - `x, a?`: following the comma
  - `x, a?, x`: adjacent
  - `a?, a?, x`: preceding the comma or adjacent
  - `x, a?, a?`: following the comma or adjacent
  - `[x, && a?,] x`: preceding the comma or adjacent
  - `x [, x && , a?]`: following the comma or adjacent

Some cases not subject to comma-elision rules:

  - `x a?, x`
  - `x, a? x`
