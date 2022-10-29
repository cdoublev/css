
# Parsing CSS

A CSS input can have different sources:

  - the content of a resource referenced by an `HTMLLinkElement` or an HTTP `Link` header
  - the inner content of an `HTMLStyleElement`
  - the value assigned to `Element.style` or `Element.media`
  - the argument of `Element.querySelector()`
  - the argument of `Element.style.setProperty()`
  - the argument of `CSSStyleSheet.insertRule()`
  - etc

This document introduces the CSS grammar and provides an overview of how a CSS input is parsed, by first looking at a declaration specified with `Element.style.setProperty()`, before looking at parsing a rule and a style sheet. The implementation details of the [CSS parser](./parser.md) and the [value data structures](./value-data-structure.md) are purposely left undefined as much as possible.

It uses the [CSS value definition syntax](value-definition.md), eg. `<foo>`, which represents the result from parsing a production named `foo` in the CSS grammar.

## The CSS grammar: syntax and semantic

The CSS grammar is composed of three levels of rules: lexic, syntax, and semantic. The lexic and syntax, aka. the basic syntax, define structures while the semantic define their meaning in a given context. For example, `opacity: red` is a valid `<declaration>` but its value is invalid according to the value definition of its (property) name.

In CSS specifications, *grammar* always refers to a production or a value definition, and implicitly includes any specific rules written in prose. Theoretically, the CSS grammar can be defined only with production rules, but hard-coding semantic rules in production rules is not always trivial. Furthermore, an error when parsing a rule or declaration must not cause the whole process to fail.

Instead, a set of algorithms transforms the input as a list of component values (the CSS lexical units), into a declaration, a rule, or a collection of them, then rules and declarations are validated according to the context, rule's preludes and block values are parsed against the corresponding grammar, and declaration values are parsed against the grammar of the declaration target (a property or a descriptor).

The following list introduces the different levels of CSS structures:

  - rule
    - qualified rule: prelude + block
    - at-rule
      - statement at-rule: `<at-keyword>` + prelude
      - block at-rule: `<at-keyword>` + prelude + block
  - rule's prelude: list of component values
  - rule's block value
    - `<stylesheet>`
    - `<rule-list>`
    - `<style-block>`
    - `<declaration-list>`
  - `<declaration>`: `<ident>:` + list of component values

CSS rule's block values are defined with one of the few productions that cannot be defined with a value definition in a non-trivial way. Nested rules and declarations must be validated according to the context defined by the parent rule(s):

  - `<stylesheet>` accepts all rules excluding those defined by the context
  - `<rule-list>` accepts the rules defined by the context
  - `<declaration-list>` and `<style-block>` accept `<declaration>`s for properties/descriptors defined by the context
  - `<declaration-list>` also accepts (for back-compatibility with CSS 2) at-rules defined by the context
  - `<style-rule>` also accepts style rules (whose selectors start with `&`), `@nest`, `@media`, and `@supports`

The output of the CSS parser can be a list of component values, a declaration, a `CSSStyleDeclaration`, a `CSSRule`, or a `CSSStyleSheet` (aka. CSSOM tree).

## Parse a declaration

`Element.style` is an instance of `CSSStyleDeclaration` representing a list of declarations. A declaration is a property or descriptor name followed by `:`, a value, eventually suffixed with `!important`.

`CSSStyleDeclaration` is also named a *CSS declaration block* in CSSOM, but a block implies the presence of its *associated tokens* (`{` and `}`) wrapping its value, whereas `Element.style` only accept its value. More precisely, `CSSStyleDeclaration` is a *CSS declaration block's value*.

Rules do not cause a parse error when specified in the value assigned to `Element.style` or `Element.style.cssText`, but they are ignored:

```html
<!-- `text` is rendered with a `green` color -->
<p style="color: green; @media all { color: red };">text</p>
```

[`Element.style.setProperty(property, value)`](https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-setproperty) must store a CSS declaration in `Element.style` for `property` (step 8 or 9), whose value is a list of component values resulting from *parse a CSS value* with the input string `value` (step 5).

[CSS declaration](https://drafts.csswg.org/cssom-1/#css-declaration):

  > A CSS declaration is an abstract concept that is not exposed as an object in the DOM. A CSS declaration has the following associated properties:
  >
  > - **property name:** the property name of the declaration
  > - **value:** the value of the declaration represented as a list of component values
  > - **important flag:** either set or unset, can be changed

The above quote should use *property or descriptor name* instead of *property name*. A declaration for a descriptor can only appear in an at-rule's block value. A declaration for a property can appear in the block value or the prelude (as a feature or style query) of any rule. A descriptor is always tied to an instance of a `CSSRule` subclass whereas a property is usually tied to an `Element`.

[Component value](https://drafts.csswg.org/css-syntax-3/#component-value):

  > A component value is one of the preserved tokens, a function, or a simple block.

Reading *parse a CSS value* and subjacent procedures from CSSOM and CSS Syntax, a CSS declaration value is a list of component values nearly identical to the list of tokens resulting from normalizing (tokenizing) the input string `value`:

- [parse a CSS value](https://drafts.csswg.org/cssom-1/#parse-a-css-value):
  > 1. Let `list` be the value returned by invoking **parse a list of component values** from `value`.
  > 2. Match `list` against the grammar for the property `property` in the CSS specification.
  > 3. If the above step failed, return `null`.
  > 4. Return `list`.
- [parse a list of component values](https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-component-values):
  > 1. **Normalize `input`**, and set `input` to the result.
  > 2. Repeatedly **consume a component value** from `input` until an `<EOF-token>` is returned, appending the returned values (except the final `<EOF-token>`) into a list. Return the list.
- [normalize into a token stream](https://drafts.csswg.org/css-syntax-3/#normalize-into-a-token-stream):
  > - If `input` is a list of CSS tokens, return `input`.
  > - If `input` is a list of CSS component values, return `input`.
  > - If `input` is a string, then filter code points from `input`, **tokenize** the result, and return the final result.
  >
  >   Note: The only difference between a list of tokens and a list of component values is that some objects that "contain" things, like functions or blocks, are a single entity in the component-value list, but are multiple entities in a token list. This makes no difference to any of the algorithms in this specification.

**Note:** a *CSS value* is not defined in any CSS specification but it is assumed as any level of value, from a single component value to a style sheet, but in the context of this procedure, it means a property value.

Functions and simple blocks are assigned other component values when parsing a list of component values (step 2, repeatedly [consume a component value](https://drafts.csswg.org/css-syntax-3/#consume-a-component-value)):

  > Consume the next input token.
  >
  > If the current input token is a `<{-token>`, `<[-token>`, or `<(-token>`, **consume a simple block** and return it.
  >
  > Otherwise, if the current input token is a `<function-token>`, **consume a function** and return it.
  >
  > Otherwise, return the current input token.

Therefore, to match a property defined with `rgb()`, the list of component values must include a component value whose `name` is `rgb` and whose `value` is a list of component values representing its arguments:

  > To consume a function:
  >
  > Create a function with its name equal to the value of the current input token and with its value initially set to an empty list. [...]

This nesting of component values in a simple block, a function, a declaration, and a rule, is important to keep in mind because it defines the parsing context.

`CSSStyleDeclaration` does not store CSS declarations for shorthand properties. The result from parsing the input value to set a shorthand must be expanded to a CSS declaration for each of its longhand sub-properties, according to its grammar. CSSOM is [rather hand-wavy](https://github.com/w3c/csswg-drafts/issues/6451) about this expansion in the procedure for `CSSStyleDeclaration.setProperty()` and `CSSStyleDeclaration.cssText`.

The previous sections raises a fundamental question about the result returned from *parse a CSS value* for `CSSStyleDeclaration.setProperty()`, and from *parse a CSS declaration block* for `CSSStyleDeclaration.cssText`. Their respective steps, *match `list` against the grammar for the property `property` in the CSS specification* and *parsing `declaration` according to the appropriate CSS specifications*, are not further defined but both mean matching the list of component values against a value definition and applying any specific rules for `property` or the productions contained in its value definition. The question is: **should they return a simple boolean or a transformed/mutated list of component values?**

[*Serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value) only enforces idempotence, ie. `assert.strictEqual(serialize(parse(input)), serialize(parse(serialize(parse(input)))))`, but the parsing of some productions make it hard not to transform/mutate the input. For example, math functions, `<urange>`, and `<an+b>`, require to be parsed into specific representations, and component value(s) must be associated to the matched productions in order to later apply their specific serialization rules.

`linear-gradient(red 0% 50%)` is valid but the trailing comma after `<linear-color-stop>` in `<color-stop-list>` (the main argument of `linear-gradient()`), defined as `<linear-color-stop> , [ <linear-color-hint>? , <linear-color-stop> ]#`, cannot be omitted. So it is expected that component values are inserted in the input list in order to get a match with `red 0%, red 50%`, ie. `,` and `red` must be inserted between `0%` and `50%`.

To overcome these challenges, this library defines the following requirements for the CSS parser:

  - a component value must be implemented as a plain object with a `type` property as a `Set` filled¹ with the matching production(s) (learn more about the [data structure used to represent a CSS value](value-data-structure.md))
  - the input list of component values must be replaced by the result of matching a value definition², in which component values must be automatically sorted according to their position in the value definition
  - omitted values³ must be represented in the resulting list with a data structure similar to a component value
  - production specific rules must be processed in functions (hooks) running either before matching the value definition, or after, on its result, to discard an invalid value according to the rule, to add or remove optional component values⁴, to create a specific representation of the input value (math function, `<urange>`, `<an+b>`)

¹ Mutations on the input list would be problematic when backtracking to match an alternative value definition, but replacing component values takes place on a new list.

² Therefore the result can be a single component value instead of a list, which is a deviation from *parse a CSS value* but *serialize a CSS value* somewhat handles this with *represent the value of the declaration as a list*, and it is an implementation detail that may change later.

³ Omitted values exist in value definitions containing a multiplier allowing 0 or more occurrences, or a combination of `||` separated symbols.

⁴ When no specific serialization rules prevents it, optional values are removed once at parse time instead of at serialization time, but this is an implementation detail that may change later.

## Parse a style sheet

The processing flow of parsing a style sheet can be represented as follows:

```
Input ─► Tokenization ─► Syntax ─► Semantic ─► CSSOM tree
                            ▲         │
                            └─────────┘
Input ─► Tokenization ─► Syntax ─► CSSOM tree ─► Semantic
                            ▲                       │
                            └───────────────────────┘
```

### Parse basic syntax

Parsing an input with the algorithms from CSS Syntax is not recursive and is limited to the basic syntax, ie. to the construction of the structures corresponding to the parsed production. For example, *parse a style sheet* results to a plain object containing its list of rules, which are also represented as plain objects, but:

  - the list may include non top-level rules
  - the rule's order may be invalid
  - a rule's prelude may be invalid according to the rule's grammar
  - a rule's block value is left unparsed as a list of component values potentially representing invalid contents

This means that parsing must run recursively from the top to bottom level of the style sheet, which allows to construct the corresponding CSSOM tree in parallel instead of with a second traversal, eg. to avoid constructing then removing an invalid `CSSImportRule` preceding `@charset`.

  > [3. Tokenizing and Parsing CSS](https://drafts.csswg.org/css-syntax-3/#tokenizing-and-parsing)
  >
  > User agents must use the parsing rules described in this specification to generate the CSSOM trees from text/css resources. Together, these rules define what is referred to as the CSS parser.
  >
  > [...]
  >
  > [3.1 Overview of the Parsing Model](https://drafts.csswg.org/css-syntax-3/#parsing-overview)
  >
  > The input to the CSS parsing process consists of a stream of Unicode code points, which is passed through a tokenization stage followed by a tree construction stage. The output is a `CSSStyleSheet` object.
  >
  > [...]
  >
  > [5. Parsing](https://drafts.csswg.org/css-syntax-3/#parsing)
  >
  > The input to the parsing stage is a stream or list of tokens from the tokenization stage. The output depends on how the parser is invoked, as defined by the entry points listed later in this section. The parser output can consist of at-rules, qualified rules, and/or declarations.
  >
  > The parser’s output is constructed according to the fundamental syntax of CSS, without regards for the validity of any specific item. Implementations may check the validity of items as they are returned by the various parser algorithms and treat the algorithm as returning nothing if the item was invalid according to the implementation’s own grammar knowledge, or may construct a full tree as specified and "clean up" afterwards by removing any invalid items.

**Note:** the output can also consist of a list of component values representing a declaration value, or a single component value representing an `attr()` value or an `Element` attribute value.

Each *parse* procedure from CSS Syntax, named a *parser entry point*, runs a corresponding *consume* procedure, named a *parser algorithm*. The entry points can receive a string, tokens, or component values, and outputs the corresponding structure: a component value, a list of component values, a declaration, a rule, a list of rules and/or declarations.

  > [5.3. Parser Entry Points](https://drafts.csswg.org/css-syntax-3/#parser-entry-points)
  >
  > The algorithms defined in this section produce high-level CSS objects from lists of CSS tokens.
  >
  > The algorithms here are operate on a token stream as input, but for convenience can also be invoked with a number of other value types.
  >
  > [...]
  >
  > Note: Other specs can define additional entry points for their own purposes.
  >
  > [5.4. Parser Algorithms](https://drafts.csswg.org/css-syntax-3/#parser-algorithms)
  >
  > The following algorithms comprise the parser. They are called by the parser entry points above.
  >
  > These algorithms may be called with a list of either tokens or of component values.
  >
  > [...]
  >
  > *Parse something according to a CSS grammar*, and *parse a comma-separated list according to a CSS grammar*, are usually the only parsing algorithms other specs will want to call. The remaining parsing algorithms are meant mostly for CSSOM and related "explicitly constructing CSS structures" cases.

Because *parse something according to a CSS grammar* runs *parse a list of component values*, which transforms tokens into component values, the *CSS grammar* cannot contain token productions.

**[Issue](https://github.com/w3c/csswg-drafts/issues/7016):** as noted in [value-data-structure.md](./value-data-structure.md), some value definitions include token productions.

**Issue:** as noted in [parser.md](./value-data-structure.md), `@page` is defined to be parsed with *parse something according to a CSS grammar*, but this entry point cannot receive an object such as a top-level rule resulting from *parsing a style sheet*.

| Entry point                        | Steps                                                         | Return type
| ---------------------------------- | ------------------------------------------------------------- | -----------
| *Parse a stylesheet*               | Normalize, consume a list of rules (top-level flag set)       | object
| *Parse a list of rules*            | Normalize, consume a list of rules (top-level flag unset)     | array
| *Parse a style block's contents*   | Normalize, consume a style block's content                    | array
| *Parse a list of declarations*     | Normalize, consume a list of declarations (and at-rules)      | array
| *Parse a rule*                     | Normalize, trim ws before/after, consume qualified/at-rule    | object
| *Parse a declaration*              | Normalize, trim ws before, consume ident, consume declaration | object
| *Parse a list of component values* | Normalize, map token to consume component value               | array
| *Parse a component value*          | Normalize, trim ws before/after, consume component value      | object

See the full list of [the CSS parser entry points](entry-points.md).

The entry points should not be called on an intermediate parsing step, ie. *parse a rule* and *parse a declaration* cannot receive an object that would result from another entry point, but only a string provided to an interface. Furthermore, whereas the entry points for a list of rules, a list of declarations, and a style block's content, do nothing more than the corresponding *consume* algorithms, *parse a declaration* and *parse a rule* return syntax errors when a property name cannot be found and when the input has zero or more than one rule, respectively.

Actually, all the above entry points can be wrapped in a corresponding *parse a CSS* function completing the procedure with the recursive parsing of the consumed contents according to the context and the corresponding grammar.

Each production for a rule's block value is associated the corresponding parser algorithm:

  > - The `<style-block>` production [...] must be parsed using the *consume a style block’s contents* algorithm.
  > - The `<declaration-list>` production [...] must be parsed using the *consume a list of declarations* algorithm.
  > - Similarly, the `<rule-list>` production [...] must be parsed using the *consume a list of rules* algorithm.
  > - Finally, the `<stylesheet>` production [...] is identical to `<rule-list>`, except that blocks using it default to accepting all rules that aren’t otherwise limited to a particular context.

The algorithm for parsing `<stylesheet>` is not explicitly defined but it is assumed to be *consume a list of rules*. It must not be parsed with *parse a stylesheet*, as explained above but also because HTML comments must only be handled at the top-level of the style sheet, ie. when *consume a list of rules* is run with the top-level flag set, but not eg. for the block value of `@media`.

**Issues in *Examples* of [`<declaration-list>`, `<rule-list>`, and `<stylesheet>`](https://drafts.csswg.org/css-syntax-3/#declaration-rule-list):**

  - `@font` (`@font-face`?) is listed as an example for `<declaration-list>` but `@font` does not exist
  - `@font-feature-values` is listed as an example for `<rule-list>` but it is defined as `@font-feature-values <family-name># { <declaration-list> }` with `font-display` as the only allowed descriptor

There are a few other productions that must be parsed with an algorithm:

  > The `<declaration-value>` production matches any sequence of one or more tokens, so long as the sequence does not contain `<bad-string-token>`, `<bad-url-token>`, unmatched `<)-token>`, `<]-token>`, or `<}-token>`, or top-level `<semicolon-token>` tokens or `<delim-token>` tokens with a value of `!`. It represents the entirety of what a valid declaration can have as its value.
  >
  > The `<any-value>` production is identical to `<declaration-value>`, but also allows top-level `<semicolon-token>` tokens and `<delim-token>` tokens with a value of `!`. It represents the entirety of what valid CSS can be in any context.

`<declaration-value>` is used in `<attr()>`, `<env()>`, `<paint()>`, `<var()>`, and for the `initial-value` descriptor of `@property`, and `<any-value>` is used in the prelude of style rules, `@supports`, `@media`, and `@contain`.

`<declaration>` is used in a feature or style query and it must be parsed with *parse a declaration*.

  > A CSS processor is considered to support a declaration (consisting of a property and value) if it accepts that declaration (rather than discarding it as a parse error) within a style rule. If a processor does not implement, with a usable level of support, the value given, then it must not accept the declaration or claim support for it.

  > The syntax of a `<style-feature>` is the same as for a declaration [...].

As noted before, a declaration value must match the value definition of the declaration property or descriptor, but for a property, it can also match a CSS-wide keyword or `<var()>`. This means that the result of *parse a declaration* must be validated with step 3 of *parse a CSS declaration block*, which could have been extracted and named *parse a CSS declaration*, and whose step 3.1 corresponds to running *parse a CSS value* (executed for `CSSStyleDeclaration.setProperty()`), which could have been named *parse a CSS property value*, assuming that it must try to match a CSS-wide keyword or `<var()>` before/after parsing the input against the property value definition.

### Validate context rules

  > For rules that use `<style-block>` or `<declaration-list>`, the spec for the rule must define which properties, descriptors, and/or at-rules are valid inside the rule [...]. Any declarations or at-rules found inside the block that are not defined as valid must be removed from the rule’s value.
  >
  > Within a `<style-block>` or `<declaration-list>`, `!important` is automatically invalid on any descriptors. If the rule accepts properties, the spec for the rule must define whether the properties interact with the cascade, and with what specificity. If they don’t interact with the cascade, properties containing `!important` are automatically invalid; otherwise using `!important` is valid and causes the declaration to be important for the purposes of the cascade.

**Issue:** the properties allowed in directly nested style rules, `@nest`, and conditional at-rules (`@media` and `@supports`) nested in a style rule, are not defined, as well as their interaction with the cascade, but it is assumed that all existing properties are allowed and interact "normally" with the cascade.

  > For rules that use `<rule-list>`, the spec for the rule must define what types of rules are valid inside the rule, same as `<declaration-list>`, and unrecognized rules must similarly be removed from the rule’s value.
  >
  > For rules that use `<stylesheet>`, all rules are allowed by default, but the spec for the rule may define what types of rules are invalid inside the rule.

Some examples:

  - `@media` contains `<stylesheet>` expanded to all rules excluding non top-level rules, but it contains `<style-block>` when nested in a style rule or `@nest`
  - `@keyframes` contains `<rule-list>` expanded to a list of rules matching `<keyframe-selector># { <declaration-list> }`, where `<declaration-list>` is expanded to a list of declarations for animatable properties
  - `@font-feature-values` contains `<declaration-list>` expanded to a declaration for `font-display` or at-rules matching `<font-feature-value-type> { <declaration-list> }`

Some rules like `@charset`, `@import`, `@namespace`, also define the order in which they must appear, and a `<declaration>` in `<style-block>` must appear before any rule.

### Construct the CSSOM tree

The scripting interface of the CSSOM is defined with the Web Interface Definition Language ([Web IDL](https://webidl.spec.whatwg.org/)). [`webidl2js`](https://github.com/jsdom/webidl2js) is *a code generator that takes Web IDL as input, and generates JavaScript files as output which implement the specified Web IDL semantic*.

**Memos `webidl2js`:**

  - a wrapper class cannot be instantiated when the `.webidl` does not define a `constructor()`, even if the implementation class implements a `constructor()`
  - in the wrapper class, the getter for a property qualified with `?` returns `undefined` when the property is `undefined` in the instance of the implementation class, but some CSS specifications expect `null`
  - an instance of an implementation class (eg. created with `wrapper.createImpl()`) returned or received by an implemented method called from an instance of the wrapper class, will be converted to an instance of the wrapper class if the return/argument value is appropriately defined in the `.webidl`, ie. as a type that can be defined with Web IDL
  - `wrapper.install()` must run before `wrapper.create()` or `wrapper.createImpl()`
  - `wrapper.create()` is usefull to create an instance of a wrapper class when the `.webidl` does not define a `constructor()` or when an instance must be created with state values (`privateData`) that are different than when creating a constructed instance
  - `wrapper.createImpl()` is an alias for `wrapper.convert(wrapper.create())` and is usefull to write "private" properties of an instance of the implementation class from outside
  - `wrapper.convert()` converts a wrapper instance to an implementation instance

**What must be the implementation for the procedures named *create an `<interface>` object*?**

For example, *create a CSS style sheet* must initialize an instance of `CSSStyleSheet` with different properties and/or values than *create a constructed `CSSStyleSheet`*. Because some of these properties are read-only or must be considered private (internal state), the appropriate way to implement *create a CSS style sheet* is to run `CSSStyleSheetWrapper.create()` with the third `privateData` argument received by `CSSStyleSheetImplementation.constructor()`.

  > A constructor for your implementation class, with signature `(globalObject, constructorArgs, privateData)` can serve several purposes:
  >
  > [...]
  >
  > Processing any private data `privateData` [...]. This is useful for constructing instances with specific state that cannot be constructed via the wrapper class constructor.

**Note:** a good convention is to only use `constructorArgs` when creating *constructed* object.

*Create a CSS style sheet* includes *add a CSS style sheet*, which would be better run outside of `CSSStyleSheet.constructor()`, for a better separatation of concerns but also because there is *remove a CSS style sheet*, which must update a property of the document or shadow root that is read-only. Furthermore, there is no appropriate `CSSStyleSheet` interface in which it could be implemented.

It would be inconsistent to implement *create a CSS style sheet* inside `CSSStyleSheet` but to implement *remove a CSS style sheet* outside. Instead, *create an `<interface>` object* must be implemented where it needs to run, and only state properties are initialized in the constructor of the interface.

If `globalObject` (`Document` or `ShadowRoot`) could be assumed as an instance of a wrapper class generated by `webidl2js`, then *remove a CSS style sheet* (and *create a CSS style sheet*) could be implemented in a utility function:

```js
/**
 * @param {Document} document Wrapper instance of `Document`
 */
function removeCSSStyleSheet(document, styleSheet) {
  const wrapper = implForWrapper(document)
  wrapper._styleSheets.splice(wrapper.styleSheets.indexOf(styleSheet), 1)
  // ...
}
```

But this would make the implementation brittle because it would be coupled to `webidl2js` and the name of the property in the implementation class of `Document` or `ShadowRoot`.

**What are the main steps to get a `CSSStyleSheet` from parsing a style sheet or `HTMLStyleElement.innerText`?**

The construction of `CSSStyleSheet` (and `CSSRule` subclasses) is defined in a rather vague way in CSS Syntax and CSSOM.

  > To *parse a CSS stylesheet*, first *parse a stylesheet*.

The return value of [*parse a CSS Stylesheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet) is not defined. It could be assumed as an instance of `CSSStyleSheet`, similarly as *parse a CSS rule*, whose return value is also not defined, and could be assumed as an instance of a `CSSRule` subclass, because:

  - *the output [of the CSS parsing process] is a `CSSStyleSheet` object*
  - *parse a component value* returns a component value
  - *parse a declaration* returns a declaration
  - *parse a rule* returns a rule
  - etc

But it could also be assumed to be a plain array to use to create a `CSSStyleSheet`. Coincidentally, *parse a CSS value*, *parse a CSS declaration block*, and the procedures that could be named *parse a CSS style block's content* and *parse a CSS declaration list*, can only return a plain object or array.

Furthermore, the procedure to parse `<stylesheet>` or `<rule-list>`, which can be named *parse a CSS list of rules*, cannot return an instance of `CSSRuleList` because `CSSStyleSheet.cssRules` or `CSSRule.cssRules` must always be the same `CSSRuleList` (which does not allow to add rules), even when running `CSSStyleSheet.replace()`, which must parse its input into a list of rules as instances of `CSSRule` subclasses.

**[Related issue](https://github.com/w3c/csswg-drafts/issues/6995):** `CSSStyleSheet.replace()` should parse rules according to the appropriate CSS specifications.

**Related issue:** `CSSStyleSheet.insertRule()` must result to a new instance of a `CSSRule` subclass appended to `CSSStyleSheet.cssRules` but `CSSRule.parentStyleSheet`, *initialized [...] when the rule is created*, does not appear in the procedure for `CSSStyleSheet.insertRule()` or its subjacent procedures, which means that this instance must either be *the result of parsing rule according to the appropriate CSS specifications* in *parse a CSS rule*, or it must be created in *insert a CSS rule*.

To be consistant, *parse a CSS rule* and *parse a CSS stylesheet* would also return a plain object, and *parse a CSS stylesheet* would be initiated in `CSSStyleSheet.constructor()` or from a function whose result would have to be be passed to `CSSStyleSheet.create()`.

Other observations:

  - step 3 of *parse a stylesheet* is *create a new stylesheet, with its location set to `location`*, with *location* anchored to its definition in CSSOM as a *state item* of `CSSStyleSheet`, which would mean that *parse a stylesheet* should create and return a `CSSStyleSheet` whose *value* should then be *interpreted* as defined by *parse a CSS stylesheet*, but returning `CSSStyleSheet` from *parse a stylesheet* would be discordant with *parse a rule*, which must return a plain object
  - CSS Cascade 4 defines *fetch an `@import`*, whose step 4 sets `CSSImportRule.styleSheet` to the result of *parse a stylesheet* and the next section defines that *it must be interpreted as a CSS style sheet*, but the procedure has been removed in Cascade 5
  - CSS Syntax 3 defines that *"parse a stylesheet" is intended to be the normal parser entry point, for parsing stylesheets* but in the HTML specification, the procedures for processing `HTMLStyleElement` or `HTMLLinkElement` must create a CSS style sheet object, and initiating the parsing of their CSS content is left undefined (see issue below)
  - CSSOM defines that an HTTP `Link` header referencing a style sheet must *create a CSS style sheet*, whose steps neither include *parse a stylesheet* or *parse a CSS stylesheet*
  - `CSSStyleSheet.constructor()` (and `CSSStyleSheet.replace()` and `CSSStyleSheet.replaceSync()`) has been added to CSSOM to facilitate creating style sheets in `ShadowRoot`, which was limited to using `<style>` before
  - `CSSRule.parentStyleSheet` must reference the parent `CSSStyleSheet` and `CSSStyleSheet.cssRules` must be a read-only `CSSRuleList` referencing the child `CSSRule`, therefore `CSSStyleSheet.constructor()` and the parent `CSSRule.constructor()` are the only places to create instances of `CSSRule` subclasses, if writing a private property value from the outside its implementation class must be avoided

Related issue: https://github.com/whatwg/html/issues/696

  > [...] CSS parsing should be observed atomic, so things will happen in this order
  >
  > 1. Loading completes
  > 2. Stylesheet is parsed
  > 3. `CSSStyleSheet` object is ready (including `cssRules` being populated)
  > 4. `.sheet` is associated with the object
  > 5. `document.styleSheets` reflects the object
  >
  > [...]
  >
  > [...] webcompat requires stylesheets to appear to be parsed atomically - if you can see the stylesheet, it needs to contain all of its rules fully parsed. [...]

A strict interpretation of *before you can see the stylesheet* would mean that *parse a CSS stylesheet* should run in `CSSStyleSheet.constructor()`, which would have to receive the raw CSS rules. This way, *parse a CSS stylesheet* and *parse a stylesheet* would both be kind of returning a `CSSStyleSheet`.

But it rather means that the style sheet must contain all its rules before appearing outside of the CSS parser.
