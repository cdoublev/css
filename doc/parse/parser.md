
# Parser

The parser entry points transform the input into a list of component values before any additional processing specific to the entry point, and before parsing against a production of the CSS grammar.

The CSS grammar is defined in:

  - [CSS Syntax](https://drafts.csswg.org/css-syntax-3/#rule-defs), with the productions that correspond to rule block values, defined with algorithms that consume a list of declarations and/or rules from the list of component values, and with generic rules written in prose to validate these items according to their context
  - [CSS Value](https://drafts.csswg.org/css-values-4/#value-defs), with the productions that correspond to CSS basic data types, which are terminals defined with the corresponding token to match, and other productions used in many CSS values
  - other CSS specifications, with productions usually defined with a value definition and possibly with specific rules written in prose

There are many established tools like Lex + Yacc or ANTLR that take a grammar defined with production rules as input and return a parser (automaton) as output, often as performant as any handwritten parser. Then why implement a CSS parser?

This document introduces some concepts of the formal language theory before defining the specific requirements of a CSS parser, and providing an overview of its implementation in this library.

## Theory

### Parse tree

Parsing is the process of deriving an unstructured input into a representation that exposes its syntactic structure, by applying the production rules of the grammar that corresponds to the input language.

A **derivation** is the path followed to traverse the input and the production rules.

A **derivation tree** (aka. concrete tree or parse tree) is a hierarchical representation of this traversal. In a derivation tree, a leaf node represents a terminal as a component value, and a branch node represents a non-terminal, a combination, or a repetition, as a container for zero or more component values.

This traversal can start from the root node, follow a **pre-order**, which means that a parent node is visited before its child nodes, and end to the rightmost leaf node, resulting to a *leftmost derivation*. Or it can start from the leftmost leaf node, follow a **post-order**, which means that a parent node is visited after its child nodes, and end to the root node, resulting to a *rightmost derivation in reverse*.

**Note:** *pre-order* and *post-order* are also named *top-down* and *bottom-up* orders because parse trees are often represented with their root node at the top and their leaves at the bottom, which makes these names coupled to the visual representation of the tree.

How a rule is applied depends on the traversal order. When following a pre-order, a rule is applied by *expanding* its left-hand side with the symbols appearing on its right-hand side. When following a post-order, the right-hand side is *reduced* into its left-hand side.

An **abstract syntax tree** is the result of simplifying the parse tree in order to be semantically interpreted or compiled by another program (eg. the HTML document renderer or a CSS processing tool).

### Context

Some grammars are said to be **context-sensitive** or **context-free**.

In Chomsky hierarchy, which organizes formal grammar classes, a context-sensitive grammar is a grammar whose production rules varies depending on the production(s) preceding and/or following the production to match: the syntactic context.

But syntactic context-sensitivity almost never occurs in programming languages. However, in CSS, some grammars are sensitive to the context defined by higher level production(s):

  - a parent production: `<parent> = <children>`
  - a production of a function or simple block: `parent(<children>)` or `(<children>)`
  - a production of a rule: `@parent { <children> }`

### Ambiguity

An **ambiguity** exists when multiple derivations exist for the same input. When a grammar is ambiguous, a priority must be decided, either ahead of time (statically), per production or with first, last, or longest match priority, or at parse time (dynamically), depending on the context or with backtracking.

A canonical example to illustrate a parsing ambiguity is the grammar of math operations, wich involve associativity and precedence rules. The priorities associated to these rules are important because the (semantic) result can be different.

Left associativity is usually expected for parsing programming languages, which means that the parser must read the value definition and the input from left to right: `1 - 2 + 3` must be interpreted to `2` instead of `4`.

The precedence rules can be hard-coded in the value definition. `1 + 2 * 3` must be interpreted to `7` instead of `9`, which means that a calculation must be defined with a slighlty more complex grammar than `<calc-value> [['+' | '-' | '*' | '/'] <calc-value>]*`.

Many ambiguities can be resolved with backtracking: when given `a a` as input, a parser must successfully match `a | a a` after backtracking instead of failing after matching the first choice or instead of (the longest match by) re-ordering `a | a a` to `a a | a`

It can be hard to detect ambiguities when the production symbols (non-terminals or terminals) can be combined in random order or multiplied a non-fixed number of times. A few productions have ambiguities that are "fixed" by defining a priority in prose instead of hard-coding it in their value definition.

Generating a LL/LR (Left to right, Leftmost/Rightmost derivation) parser from a grammar is the only guarantee that it is unambiguous.

### Automaton

An **automaton** is a machine (computing device) used to study computational problems and the requirements to resolve them in terms of a predetermined sequence of operations (an algorithm) and the complexity (time and memory usage) of these operations.

A **deterministic** automaton is equivalent to a pure function: for a given (internal) state and input, it will always transition to the same next state and produce the same output. There cannot be anything else to resolve the next state, like an external state (aka. qualitative state or context) or randomness.

Look-ahead of more than one input token and backtracking do not make an automaton undeterministic but these operations have a higher time complexity. Similarly, the external state (stored in memory) can be updated in a deterministic way but it makes the machine dependent on the size of its memory (space complexity), which is totally acceptable with modern computing devices.

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

### State of the art

## Requirements

### Backtracking

The following quotes from [these](https://github.com/w3c/csswg-drafts/issues/2921) [issues](https://github.com/w3c/csswg-drafts/issues/7027) expose the main requirement for matching a list of component values against a [CSS value definition](value-definition.md) (*parsing grammar* or *parsing*): **find a match with backtracking**.

> **tabatkins:** CSS tokenization is <a href="#greedy">greedy</a> [...] but [grammar] parsing is definitely <a href="#non-greedy">non-greedy</a>. [...]
>
> **tabatkins:** the tokenization algorithm is designed to implement <a href="#longest match">"longest match"</a> <a href="#greedy">greedy</a> semantics for a theoretical equivalent grammar, because that is the semantics that CSS2 had when it did specify tokenization with a grammar. [...]
>
> **tabatkins:** parsing grammar is <dfn id="non-greedy">non-greedy; if the first branch that starts to match eventually fails, you just move on to the second branch and try again. There is no need to order the branches in any particular way to accommodate this [...]. You have to be able to backtrack.</dfn>
>
> **cdoublev** I must move "one step backwards" and try with another branch, if any, even if it means matching a type that the parser already had a match for.
>
> **tabatkins** Right, that's a backtracking parser vs a greedy/first-match parser [...].
>
> **tabatkins** CSS grammars obey longest match semantics, not ordered-match semantics, but that's not stated anywhere.
>
> **cdoublev:** Is there a difference between obey longest match semantics and greedy? Is it possible to obey longest match semantics without being greedy?
>
> **tabatkins:** Yes, <dfn id="greedy">greedy means the first thing to match a segment claims that segment forever, even if it would cause the overall match to fail.</dfn> <dfn id="longest match">Longest match is somewhat greedy - the parse that consumes the most tokens for a production is the one that wins, even if it would cause the overall match to fail, but that is not necessarily the "first" (it depends on how you order the productions).</dfn> [...]
>
> **tabatkins:** CSS grammar parsing is not longest match, at least in general.
>
> **cdoublev:** the parser should try with the second alternative in `<wq-name> | <ns-prefix>? '*'` even if a match for `<wq-name>` were found. If it fails with `<ns-prefix>? '*'` then it returns its match for `<wq-name>`, right? [...]
>
> **cdoublev:** That is, to match `foo bar baz` against `foo | foo bar | foo bar baz`, the parser should try each alternative before returning a result for the grammar, instead of trying each alternative as a result of backtracking (until the whole input is consumed).

Even if the last two statements were neither contradicted nor answered, the match must result from backtracking instead of trying each alternative. When parsing `a a a` against `[a | a a] a`, the parser must not immediately look for `a a` in `[a | a a]`. Instead, while the input is not fully consumed, it backtracks to find an overall match.

It would not make sense to search for the longest-match. For example, `<color>` is defined with `<hex-color> | <named-color> | transparent | <rgb()> | <rgba()> | ...`: it would be useless to try other alternatives after successfully matching `<hex-color>`, noting that `<named-color>` expands to even more alternatives than `<color>`.

Similarly, it would be useless to try other alternatives when matching `red false` against `<color> true`. Actually, `<bg-position>` seems to be the only productions that can yield a different match with backtracking, and it would not need it if its alternatives were sorted in a different order.

Any value definition that includes a choice can yield a different result after backtracking: symbols combined with `|`, `||`, `&&`, or qualified by a multiplier where `min < max`. Backtracking requires to save an **execution state** to move back at the parse tree node that corresponds to the last choice, which means discarding matched component values and restoring the input index.

It would be useless to parse again a function whose block value matched its (context-free) value definition. For example, even when skipping all permutations not starting with `<bg-image>`, a gradient function as the only input value for `background` would be parsed many times.

Similarly, backtracking is useless when a function block value failed to match its (context-free) value definition: the whole input is guaranteed to be invalid.

Some production specific rules written in prose can also make a whole input to be guaranteed as invalid.

When running parse functions recursively, the only escape to short-circuit and abort parsing, is to throw an error handled in a main parse function, noting that `try {} catch` increases time complexity.

### Parsing flow

To [parse a CSS style sheet](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet), the parser must first *parse a styleseet*, which must *consume a list of rules* as high level objects. Similarly, `CSSStyleSheet.replace()`, `CSSStyleSheet.replaceSync()`, `CSSStyleSheet.insertRule()`, `CSSRule.insertRule()`, `CSSRule.appendRule()`, must *parse a list of rules* or *parse a rule*, which consume rule(s) as high level object(s) from the top-level rule(s) in their input.

**Note**: *parse a stylesheet* receives a `location` argument but only from [*fetch an @import*](https://drafts.csswg.org/css-cascade-4/#fetch-an-import), defined in Cascade 4 but removed in Cascade 5, therefore it can be replaced by *parse a list of rules* implemented with a `topLevel` flag (unset by default), noting that `CSSStyleSheet.replace()` and `CSSStyleSheet.replaceSync()` do not need to set this flag because they do not require to be backward-compatible regarding the handling of `<!--` and `-->` wrapping a top-level qualified rule.

But [`@page`](https://drafts.csswg.org/css-page-3/#syntax-page-selector), a top-level rule existing since CSS 1, must be parsed with *parse something according to a CSS grammar*, which must *parse a list of component values*, which must not consume a rule as an object, before matching the list against `@page <page-selector-list> { <declaration-list> }`.

This means that there is a problem either in CSS Paged Media, which should not define `@page` to be parsed with *parse something according to a CSS grammar*, or in CSS Syntax, which should define *consume an at-rule* and *consume a qualified rule* so that they return a list of component values instead of an object with a `name`, `prelude`, `value`, assigned the corresponding slices of the list.

What a rule's value definition represents is not clear because of this problem. What does `@page <page-selector-list> { <declaration-list> }` represents?

  1. an `<at-keyword-token>` whose value is `page`, followed by component values matching `<page-selector-list>`, followed by a simple block whose `value` is a sublist of component values matching `<declaration-list>`
  2. a single object whose `name`, `prelude`, and `value`, match the corresponding parts of the value definition, similarly as for a function `name` and `value`

[`<declaration-list>`](https://drafts.csswg.org/css-syntax-3/#typedef-declaration-list) must be parsed with *consume a list of declarations*, which must *consume an at-rule* or *consume a declaration*. All parser algorithms defined in CSS Syntax can handle a list of tokens or component values as input, and consume component values from tokens, which means that no input can match a production representing a token. Yet, some value definitions contains productions representing tokens (see [value-data-structure.md](./value-data-structure.md)).

The parser must not only be able to parse a grammar by matching a value definition, but also by applying a syntax algorithm before validating the result against the context, then matching the parts of the result against the appropriate grammars, and possibly excluding or replacing invalid parts from the returned result.

To parse `<declaration-list>`, `<style-block>`, `<rule-list>`, `<stylesheet>`, the parser must first run *consume a list of declarations*, *consume a style block's content*, *consume a list of rules*, respectively, then validate their contents (rules and/or declarations) according to the context, and parse them against the corresponding grammar.

  > If any style rule is invalid, or any at-rule is not recognized or is invalid according to its grammar or context, it’s a parse error. Discard that rule.
  >
  > [...]
  >
  > Declarations for an unknown CSS property or whose value does not match the syntax defined by the property are invalid and must be ignored. The validity of the style rule’s contents have no effect on the validity of the style rule itself. [...]

Assuming the result from parsing `<declaration-list>` in `@page` would be matched against `[<declaration> ;]* [<@top-left-corner> | <@top-left> | ...]*`, any invalid declaration or rule would cause a parse failure for the entire block's value instead of just being ignored.

To parse `<declaration>`, the parser must first *consume a declaration*, then it must validate the declaration object by matching its `value` against the grammar of its (property or descriptor) `name`.

To parse `<media-query-list>`, `<forgiving-selector-list>`, `<forgiving-relative-selector-list>`, the parser must *parse a comma-separated list according to a CSS grammar*, which first runs *parse a comma-separated list of component values*, before matching each resulting list of component values against `<media-query>`, `<complex-selector>`, `<relative-selector>`, respectively. For `<media-query-list>`, it must also replace invalid results by `not all`. For `<forgiving-selector-list>` and `<forgiving-relative-selector-list>`, it must also remove any invalid result.

### Context

Parsing a list of component values against a grammar may require to know the context of the list. For example, parsing against `<complex-selector>` requires knowing whether the list is the `prelude` of a nested style rule and must include `&`. This raises the question of how to represent, access, and apply context rules: the context *definition*.

As a reminder, the context *value* is the object that is assigned the list of component values, but the context also represents any higher level parent object(s). The parser "enters" in a context when it starts to parse a style sheet, a rule, a declaration, a function, or a simple block.

Looking at how to access it first, it can be achieved either by passing it between parse functions, or by ensuring the parser keeps track of each parsed production (like with the parse tree) for each level of list of component values.

But both solutions will not work when using an interface like `CSSRule.insertRule()` and some grammar is sensitive to a context at a higher level than the `CSSRule`. For example, the rule's block value of `@media` and `@supports` must be defined with `<style-block>` instead of `<stylesheet>`, when these rules are nested in a style rule. The parse tree does not know the whole context. It can only be resolved from the CSSOM tree.

Actually, the CSSOM tree is also required to validate that any namespace prefix used in a selector has been declared in a top-level `@namespace`.

**Note:** `*` and null are the only valid namespace prefixes allowed in `Element.querySelector[All]()` because this interface does not provide a way to resolve the declared namespaces to the parser.

The context definition could be stored in the CSSOM tree resulting from parsing, noting that objects from CSS Syntax do not define `parentRule` as `CSSRule` does, but a better alternative would be to use a common property as an identifier to resolve the context in a separate data structure.

This static context definition must define:

  - the rules allowed or excluded in a rule's block value
  - the property/descriptor names that can be declared in a rule's block value
  - how property/descriptor declarations participate to the cascade

A production can not only be sensitive to the context defined by a containing object but also to the context defined by a parent or sibling production. For example, a whitespace must precede `+` and `-` in `<calc-product>`: the semantic context is `<calc-product>` and the syntactic context is the whitespace.

The semantic context rules require to traverse the parse tree from bottom to top. Such requirement is related to the well-known time and space trade off: storing a reference of a parent node in its child node(s) takes more memory space, whereas finding a parent by reading the tree from top to bottom takes more time.

To apply this rule, the value definition object representing `+` and `-` could have a `requireWhitespaceBefore` property assigned a boolean flag, or a `preprocess` property assigned a function receiving the input list and returning `null` to signal a parse failure when the leading whitespace is missing.

**Note:** whitespaces are otherwise optionals between component values, which means that failing to consume a whitespace before matching a component value must not cause a parse failure.

Other production specific rules can be encoded in value definition objects. For example, math functions are limited to 32 arguments: the `#` multiplier qualifying `<calc-sum>` can be parsed to this custom limit. Similarly, `#` must be ignored in a top-level value definition of a production referencing a property value definition.

There are many production specific rules that can only be applied after matching their value definition, to discard an invalid match, or to create a different representation like for math functions, `<urange>`, and `<an+b>`. Simarly as with `preprocess`, applying these rules can be achieved with a `postprocess` function.

All numeric values can be replaced by a math function and `<rgb()>` accepts a legacy value definition that is separate from its main value definition. Applying these rules can be handled with a `replace` function receiving the input list and returning the result from parsing the alternative grammar, when failing to match the main value definition.

Instead of assigning functions to value definition objects, the parser could also receive an object mapping production names to these hook functions, and more advanded patterns (observer, state machine) can be implemented to automatically apply them.

## Implementation

### Model


### Context tree

Because some rule definitions depend on their own context, a parent rule or the style sheet, rule definitions are represented with a hierarchical data structure: a tree whose root node defines the context of a style sheet.

A `ParseContext` is built in parallel to parsing rules, to give access to definitions and values of the current and parent contexts. It is also represented as a tree to represent the entire context instead of just the context of the parent rule. For example, this is required to validate that each `<compound-selector>` of a style rule prelude is prefixed with `&` when the rule is nested, ie. when `ParseContext.parent.definition.value` is `<style-block>`.

Some data in the rule must be used to resolve its definition against the current context definition.

At-rules have a `name` when parsed as plain objects but it is not always exposed by the corresponding CSSOM interface extending `CSSRule`, or it may represent a different value. To overcome this, a `type` is resolved from the plain object `rule.name` against the current context definition, and is added to `rule.type`.

**Note:** `type` is not part of the `CSSRule` interface but it is only readable from the implementation class.

When initializing `ParseContext` with an existing `CSSRule` (recursively, from bottom to top, via `CSSRule.parentRule` and `CSSRule.parentStyleSheet`), its definition is resolved from its last `type` entry, still against the current context definition.

The last rule `type` entry is also used to resolve the `CSSRule` subclass to instantiate: `page` for `CSSPageRule`, `margin` for `CSSMarginRule`, `style` for `CSSStyleRule`, `keyframe` for `CSSKeyframeRule`, etc.

Most at-rules have a `type` directly resolved from their `name`. For margin rules, it is resolved from the `type` of the first rule definition in the current context, whose `names` include `rule.name`. For qualified rules, it resolves to the `qualified` value defined on the current context, noting that a rule's block value can only contain a single type of qualified rules.

**Note:** it may seem that the type of margin rules could be resolved the same way as for a `qualified` rule, with an `atRule` defined on the current context, but searching for the `name` also allows to validate the rule name.

Context definition nodes must have a `prelude` and/or a `value` defined with the corresponding CSS value definitions, and may have one or more of the following properties:

  - whether or not the declarations of properties or descriptors matching a property are `cascading`
  - the `names` of the rules accepted in its block value
  - the `descriptors` that can be declared in its prelude or block value
  - the `properties` that can be declared in its block value
  - the `qualified` rule type accepted in its block value
  - the `rules` allowed or excluded in its block value: a sub-context definition tree or a list of excluded rule types.

`ParseContext` must have the following properties:

  - `ParseContext.value`: the input context value
  - `ParseContext.definition`: the context definition
  - `ParseContext.type`: the context type (key)
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
| `[a?]!`     | `{ type: 'required', value: { ... } }`                                |
| `a*`        | `{ type: 'repeat', min: 0, max: 20, value: { ... } }`                 |
| `a+`        | `{ type: 'repeat', min: 1, max: 20, value: { ... } }`                 |
| `a#`        | `{ type: 'repeat', min: 1, max: 20, separator: ',', value: { ... } }` |
| `a#?`       | `{ type: 'repeat', min: 0, max: 20, separator: ',', value: { ... } }` |
| `a{0,n}`    | `{ type: 'repeat', min: 0, max: n, value: { ... } }`                  |
| `a+#`       | `{ type: 'repeat', min: 0, max: 20, separator: ',', value: { ... } }` |
| `a+#?`      | `{ type: 'optional', value: { type: 'repeat', ... } }`                |
| `a#{0,n}`   | `{ type: 'repeat', min: 0, max: n, separator: ',', value: { ... } }`  |
| `a a`       | `{ type: ' ', value: [...] }`                                         |
| `a && a`    | `{ type: '&&', value: [...] }`                                        |
| `a || a`    | `{ type: '||', value: [...] }`                                        |
| `a | a`     | `{ type: '|', value: [...] }`                                         |
| `a a && a`  | `{ type: '&&', value: [...] }`                                        |
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

A hook for pre/postprocessing `,` depends on looking behind/ahead `list.current`:

  - cases with `list.index === -1`
    - `,` must be omitted when matching   `b` against `a?, b`
    - `,` must be invalid when matching `, b` against `a?, b`
  - cases with `list.next(2).includes(',')` or `list.prev(2).includes(',')`
    - `,` must be omitted when matching  `a, c` against `a, b?, c`
    - `,` must be invalid when matching `a,, c` against `a, b?, c`
  - cases with `list.consume(' ', true) && list.atEnd()`
    - `,` must be omitted when matching  `a` against `a, b?`
    - `,` must be invalid when matching `a,` against `a, b?`

A `replace` hook cannot prevent leading/adjacent/trailing `,`. A single `preprocess` hook or a combination of a `postprocess` and `replace` hooks must be used.
