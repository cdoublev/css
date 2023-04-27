
# Parsing CSS

A CSS input can have different sources:

  - the content of a style sheet referenced by an `HTMLLinkElement` or an HTTP `Link` header
  - the content of an `HTMLStyleElement`
  - the argument of `CSSStyleSheet.insertRule()`
  - the argument of `Element.style.setProperty()`
  - the argument of `Element.querySelector()`
  - the value assigned to `Element.style` or `Element.media`
  - etc

This document provides an overview of parsing an input against a CSS grammar, by first looking at a declaration specified with `Element.style.setProperty()`, before looking at a rule and a style sheet. The implementation details of the [CSS parser](./parser.md) and the [value data structures](./value-data-structure.md) are purposely left undefined as much as possible.

It uses the [CSS value definition syntax](value-definition.md), eg. `<foo>`, which represents the result from parsing a production named `foo` in the CSS grammar.

## CSS grammar

The CSS grammar is composed of three levels of rules: lexic, syntax, and semantic. Lexic and syntax define the structure while the semantic defines the contextual meaning. For example, `opacity: red` is a valid `<declaration>` but its value is invalid according to the grammar of its name: `<'opacity'>`.

In CSS specifications, *grammar* always refers to a production or a value definition, and implicitly includes any specific rules written in prose. Theoretically, the CSS grammar can be defined only with production rules, but hard-coding semantic rules in production rules is not always trivial.

Instead, a set of algorithms transforms the input as a list of component values (CSS lexical units) into a declaration, a rule, or a collection of them, then rules and declarations are validated according to the context (style sheet or parent rule), rule's preludes and block values are parsed against the corresponding grammar, and declaration values are parsed against the grammar of the property or descriptor.

Furthermore, an error when parsing a rule or declaration must not cause the whole process to fail.

The following list introduces the different levels of CSS structures:

  - rule
    - qualified rule: prelude + block
    - statement at-rule: `<at-keyword>` + prelude
    - block at-rule: `<at-keyword>` + prelude + block
  - rule's prelude: list of component values
  - rule's block value
    - `<stylesheet>`
    - `<rule-list>`
    - `<style-block>`
    - `<declaration-list>`
  - `<declaration>`: `<ident>:` + list of component values

Rule's block values are defined with one of the few productions that cannot be defined with a value definition:

  - `<stylesheet>` accepts all top-level rules excluding those not allowed by the context
  - `<rule-list>` accepts the rules allowed by the context
  - `<declaration-list>` and `<style-block>` accept `<declaration>`s for properties/descriptors allowed by the context
  - `<declaration-list>` also accepts (for back-compatibility with CSS 2) at-rules allowed by the context
  - `<style-block>` also accepts nested style and group rules (at-rules whose block value is `<style-block>`)

The output of the CSS parser can be a list of component values, a declaration, a `CSSStyleDeclaration`, a `CSSRule`, or a `CSSStyleSheet` (aka. CSSOM tree).

## Parse a declaration

`Element.style` is an instance of `CSSStyleDeclaration` representing a list of declarations. A declaration is a property or descriptor name followed by `:`, a value, eventually suffixed with `!important`.

`CSSStyleDeclaration` is also named a *CSS declaration block* in CSSOM, but a block implies the presence of its *associated tokens* (`{` and `}`) wrapping its value, whereas `Element.style` only represents its value. More precisely, it is a *CSS declaration block's value*.

Assigning a CSS rule to `Element.style` or `Element.style.cssText` does not cause a parse error, but it is currently ignored:

```html
<!-- `text` is rendered with a `green` color -->
<p style="color: green; @media all { color: red };">text</p>
```

[`Element.style.setProperty(property, value)`](https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-setproperty) must store a CSS declaration for `property` in `Element.style` (step 8 or 9), whose value is a list of component values resulting from *parse a CSS value* with the input string `value` (step 5).

**Note:** a *CSS value* is not defined in any CSS specification but it is assumed to be one or more component values.

[CSS declaration](https://drafts.csswg.org/cssom-1/#css-declaration):

  > A CSS declaration is an abstract concept that is not exposed as an object in the DOM. A CSS declaration has the following associated properties:
  >
  > - **property name:** the property name of the declaration
  > - **value:** the value of the declaration represented as a list of component values
  > - **important flag:** either set or unset, can be changed

The above quote should use *property or descriptor name* instead of *property name*. A declaration for a descriptor can only appear in an at-rule's block value. A declaration for a property can appear in the block value or the prelude (as a feature or style query) of any rule. A descriptor is always tied to a `CSSRule` subclass whereas a property is generally tied to an `Element`.

[Component value](https://drafts.csswg.org/css-syntax-3/#component-value):

  > A component value is one of the preserved tokens, a function, or a simple block.

Reading [*parse a CSS value*](https://drafts.csswg.org/cssom-1/#parse-a-css-value) and subjacent procedures in CSSOM and CSS Syntax, a CSS declaration value is a list of component values nearly identical to the list of tokens resulting from normalizing (tokenizing) the input string `value`:

  > Note: The only difference between a list of tokens and a list of component values is that some objects that "contain" things, like functions or blocks, are a single entity in the component-value list, but are multiple entities in a token list. This makes no difference to any of the algorithms in this specification.

Functions and simple blocks are assigned other component values when parsing a list of component values. Therefore, to match a property defined with `rgb()`, the list must include a component value whose `name` is `rgb` and whose `value` is a list of component values representing its arguments:

  > To consume a function:
  >
  > Create a function with its name equal to the value of the current input token and with its value initially set to an empty list. [...]

This nesting of component values in a simple block, a function, a declaration, and a rule, is important to keep in mind because it defines the parsing context.

`CSSStyleDeclaration` does not store CSS declarations for shorthands. The result from parsing the input to set a shorthand must be expanded to a CSS declaration for each of its longhands. CSSOM is [rather hand-wavy](https://github.com/w3c/csswg-drafts/issues/6451) about this expansion in the procedure for `CSSStyleDeclaration.setProperty()` and `CSSStyleDeclaration.cssText`.

But there is also a fundamental question about the result returned from *parse a CSS value* for `CSSStyleDeclaration.setProperty()`, and from *parse a CSS declaration block* for `CSSStyleDeclaration.cssText`: **should they return a simple boolean or a transformed/mutated list of component values?**

Their respective steps, *match `list` against the grammar for the property `property` in the CSS specification*, and *parsing `declaration` according to the appropriate CSS specifications*, are not further defined, but both mean matching the list of component values against a value definition and applying any specific rules for `property` or the productions in its value definition.

[*Serialize a CSS value*](https://drafts.csswg.org/cssom-1/#serialize-a-css-value) only enforces idempotence, ie. `assert.strictEqual(serialize(parse(input)), serialize(parse(serialize(parse(input)))))`, but the parse of some productions make it hard not to transform/mutate the input. For example, math functions, `<urange>`, and `<an+b>`, require to be parsed into specific representations. Furthermore, the matching component value(s) must be associated to the productions in some way, to later apply their specific serialization rules.

To overcome these challenges, this library defines the following requirements for the CSS parser:

  - a component value or a list of component values must be implemented with a `type` property as a `Set` filled with the matching production(s) (learn more about the [data structure used to represent a CSS value](value-data-structure.md))
  - the input list of component values must be replaced with the result of matching a value definition¹, in which component values must be automatically sorted according to their position in the value definition
  - omitted values² must be represented in the result of matching a value definition
  - production specific rules must be processed either before or after matching the value definition, to discard an invalid value according to the rule, or to create a specific representation of the input value (math function, `<urange>`, `<an+b>`)

¹ Therefore the result can be a single component value instead of a list, which is a deviation from *parse a CSS value* but *serialize a CSS value* somewhat handles this with *represent the value of the declaration as a list*, and this is an implementation detail that may change later.

² Omitted values exist in value definitions containing a multiplier allowing 0 or more occurrences, or a combination of `||` separated symbols.

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

Parsing an input with the algorithms from CSS Syntax is not recursive and is limited to the syntax, ie. to the construction of the structures corresponding to the parsed productions.

For example, *parse a style sheet* results to a plain object containing its list of rules, which are also represented as plain objects. However:

  - the list may include non top-level rules
  - the rule's order may be invalid
  - a rule's prelude may be invalid according to the rule's grammar
  - a rule's block value is left unparsed as a list of component values potentially representing invalid contents

This means that parsing a style sheet must run recursively from its top to bottom level, which allows to construct the CSSOM tree in parallel, or with a second traversal to avoid constructing then removing a rule appearing in an invalid order, like `@import` preceding `@charset`, or `@namespace` preceding `@charset` or `@import`.

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

**Note:** the parser's output can also consist of a list of component values representing a declaration value, or a single component value representing an `attr()` value or an `Element` attribute value.

Each *parse* procedure from CSS Syntax, which is named a *parser entry point*, runs a corresponding *consume* procedure, named a *parser algorithm*. The entry points can receive a string, tokens, or component values, and output the corresponding structure: a component value, a list of component values, a declaration, a rule, a list of rules and/or declarations.

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

| Entry point                        | Steps                                                          | Return type
| ---------------------------------- | -------------------------------------------------------------- | -----------
| *Parse a stylesheet*               | Normalize, consume a list of rules (top-level flag set)        | object
| *Parse a list of rules*            | Normalize, consume a list of rules (top-level flag unset)      | array
| *Parse a style block's contents*   | Normalize, consume a style block's content                     | array
| *Parse a list of declarations*     | Normalize, consume a list of declarations (and at-rules)       | array
| *Parse a rule*                     | Normalize, trim leading/trailing ws, consume qualified/at-rule | object
| *Parse a declaration*              | Normalize, trim leading ws, consume declaration                | object
| *Parse a list of component values* | Normalize, map token to consume component value                | array
| *Parse a component value*          | Normalize, trim leading/trailing ws, consume component value   | object

See the full list of [the CSS parser entry points](entry-points.md).

Entry points should not be called at an intermediate parsing step, ie. *parse a rule* and *parse a declaration* cannot receive an object that would result from another entry point, but only a string provided to an interface. Furthermore, whereas the entry points for a list of rules, a list of declarations, a style block's content, do nothing more than the corresponding algorithms, *parse a rule* and *parse a declaration* return syntax errors when the input has zero or more than one rule and when a property name cannot be found, respectively.

Actually, all entry points can be wrapped in a corresponding *parse a CSS* function completing the procedure with parsing consumed content(s) against the appropriate grammars(s) and with any context validation.

Each production representing a rule's block value is associated the corresponding parser algorithm:

  > - The `<style-block>` production [...] must be parsed using the *consume a style block’s contents* algorithm.
  > - The `<declaration-list>` production [...] must be parsed using the *consume a list of declarations* algorithm.
  > - Similarly, the `<rule-list>` production [...] must be parsed using the *consume a list of rules* algorithm.
  > - Finally, the `<stylesheet>` production [...] is identical to `<rule-list>`, except that blocks using it default to accepting all rules that aren’t otherwise limited to a particular context.

The algorithm for parsing `<stylesheet>` is not explicitly defined but it is assumed to be *consume a list of rules*. It must not be parsed with *parse a stylesheet*, as explained above but also because HTML comments must only be handled at the top-level of the style sheet, ie. when *consume a list of rules* is run with the top-level flag set, but not eg. for the block value of `@media`.

**Issues in *Examples* of [`<declaration-list>`, `<rule-list>`, and `<stylesheet>`](https://drafts.csswg.org/css-syntax-3/#declaration-rule-list):**

  - `@font` (`@font-face`?) is listed as an example for `<declaration-list>` but `@font` does not exist
  - `@font-feature-values` is listed as an example for `<rule-list>` but it is defined with `@font-feature-values <family-name># { <declaration-list> }`

There are a few other productions that must be parsed with an algorithm.

`<declaration-value>` and `<any-value>` are used in productions representing substitution values (`<var()>`, `<attr()>`, `<env()>`, `<mix()>`, etc), the `initial-value` descriptor of `@property`, and some parts of the prelude of style rules, `@supports`, `@media`, and `@contain`.

  > The `<declaration-value>` production matches any sequence of one or more tokens, so long as the sequence does not contain `<bad-string-token>`, `<bad-url-token>`, unmatched `<)-token>`, `<]-token>`, or `<}-token>`, or top-level `<semicolon-token>` tokens or `<delim-token>` tokens with a value of `!`. It represents the entirety of what a valid declaration can have as its value.
  >
  > The `<any-value>` production is identical to `<declaration-value>`, but also allows top-level `<semicolon-token>` tokens and `<delim-token>` tokens with a value of `!`. It represents the entirety of what valid CSS can be in any context.

`<declaration>` is used in the prelude of `@supports` or `@contain` (in a feature or style query).

  > A CSS processor is considered to support a declaration (consisting of a property and value) if it accepts that declaration (rather than discarding it as a parse error) within a style rule. If a processor does not implement, with a usable level of support, the value given, then it must not accept the declaration or claim support for it.

  > The syntax of a `<style-feature>` is the same as for a declaration [...].

### Validate context rules

  > For rules that use `<style-block>` or `<declaration-list>`, the spec for the rule must define which properties, descriptors, and/or at-rules are valid inside the rule [...]. Any declarations or at-rules found inside the block that are not defined as valid must be removed from the rule’s value.
  >
  > Within a `<style-block>` or `<declaration-list>`, `!important` is automatically invalid on any descriptors. If the rule accepts properties, the spec for the rule must define whether the properties interact with the cascade, and with what specificity. If they don’t interact with the cascade, properties containing `!important` are automatically invalid; otherwise using `!important` is valid and causes the declaration to be important for the purposes of the cascade.

**Issue:** the properties allowed in style and nested group rules are not defined, as well as their interaction with the cascade, but it is assumed that all existing properties are allowed and interact "normally" with the cascade.

  > For rules that use `<rule-list>`, the spec for the rule must define what types of rules are valid inside the rule, same as `<declaration-list>`, and unrecognized rules must similarly be removed from the rule’s value.
  >
  > For rules that use `<stylesheet>`, all rules are allowed by default, but the spec for the rule may define what types of rules are invalid inside the rule.

Some examples:

  - `@media` contains `<stylesheet>` accepting all top-level rules but contains `<style-block>` when nested in a style rule
  - `@keyframes` contains `<rule-list>` accepting rules matching `<keyframe-selector># { <declaration-list> }`, where `<declaration-list>` accepts a list of declarations for animatable properties
  - `@font-feature-values` contains `<declaration-list>` accepting a declaration for `font-display` and at-rules matching `<font-feature-value-type> { <declaration-list> }`

Some rules like `@charset`, `@import`, `@namespace`, also define the order in which they must appear.

### Construct the CSSOM tree

The scripting interface of the CSSOM is defined with the Web Interface Definition Language ([Web IDL](https://webidl.spec.whatwg.org/)). [`webidl2js`](https://github.com/jsdom/webidl2js) is *a code generator that takes Web IDL as input, and generates JavaScript files as output which implement the specified Web IDL semantic*.

**Memos `webidl2js`:**

  - a wrapper class cannot be constructed when the `.webidl` does not define a `constructor()`, even if it is implemented in the implementation class
  - in a wrapper class, a getter qualified with `?` can return `undefined` but some CSS specifications expect `null`
  - in a wrapper class, an instance of an implementation class is returned as an instance of a wrapper class by a getter or method when its return value type is defined with the appropriate Web IDL type in the `.webidl`
  - `wrapper.install()` must run before `wrapper.create()` or `wrapper.createImpl()`
  - `wrapper.create()` is usefull to construct an instance of the wrapper class when its `.webidl` does not define `constructor()` or when it must be constructed with different state values (`privateData`) than when using `new`
  - `wrapper.createImpl()` is an alias for `wrapper.convert(wrapper.create())` and is usefull to write "private" properties of an instance of the implementation class from outside
  - `wrapper.convert()` converts a wrapper instance to an implementation instance

**What must be the implementation for the procedures named *create an `<interface>` object*?**

*Create a CSS style sheet* must initialize an instance of `CSSStyleSheet` receiving/assigned different properties/values than *create a constructed `CSSStyleSheet`*. Because some of these properties are read-only or must be considered private (internal state), *create a CSS style sheet* must run `CSSStyleSheetWrapper.create()` with the third `privateData` argument received by `CSSStyleSheetImplementation.constructor()`.

  > A constructor for your implementation class, with signature `(globalObject, constructorArgs, privateData)` can serve several purposes:
  >
  > [...]
  >
  > Processing any private data `privateData` [...]. This is useful for constructing instances with specific state that cannot be constructed via the wrapper class constructor.

**Note:** a good convention is to only use `constructorArgs` when creating *constructed* object.

*Create a CSS style sheet* requires to *add a CSS style sheet*, which would be better implemented outside of `CSSStyleSheet.constructor()`, for a better separatation of concerns, but also because it would be inconsistent to implemented *remove a CSS style sheet*, which must update a property of the document or shadow root that is read-only, from outside of `CSSStyleSheet`. Furthermore, `CSSStyleSheet` has no appropriate interface in which it could be implemented.

Instead, *create an `<interface>` object* must be implemented where it needs to run, and only state properties are initialized in the constructor of the interface.

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

**What are the main steps to get a `CSSStyleSheet` or `CSSRule` from parsing a style sheet or rule input?**

Constructing `CSSStyleSheet` and `CSSRule` (subclass) is defined in a rather vague way in CSS Syntax and CSSOM.

  > To *parse a CSS stylesheet*, first *parse a stylesheet*.

The return value of [*parse a CSS Stylesheet*](https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet) and [*parse a CSS rule*](https://drafts.csswg.org/cssom-1/#parse-a-css-rule) is not defined.

It could be logically assumed to be an instance of `CSSStyleSheet` and `CSSRule` subclass, as hinted by their name and as opposed to the return value of *parse a stylesheet*, *parse a rule*, and other entry points, which is a plain array or object.

Alternatively, it could be assumed to be a plain array or object to use to construct a `CSSStyleSheet` or `CSSRule` because coincidentally:

  - *parse a CSS declaration block* is defined to return a plain array
  - *parse a CSS value* and the procedures that could be named *parse a CSS style block's content* and *parse a CSS declaration list*, can only return a plain object or array because there is no corresponding CSSOM interface to construct
  - the procedures to parse `<stylesheet>` and `<rule-list>`, which could be named *parse a CSS list of rules*, cannot construct a `CSSRuleList` because `CSSStyleSheet.cssRules` and `CSSRule.cssRules` must always remain the same `CSSRuleList` (which does not allow to add rules), even when running `CSSStyleSheet.replace()`

`CSSStyleSheet.insertRule()` must result to a new `CSSRule` appended to `CSSStyleSheet.cssRules` but its procedure and subjacent procedures (*parse a rule*, *parse a CSS rule*, *insert a CSS rule*) do not define setting `CSSRule.parentStyleSheet`, which should be *initialized [...] when the rule is created*, which means either `CSSRule` must be *the result of parsing rule according to the appropriate CSS specifications* in *parse a CSS rule*, or it must be created in *insert a CSS rule*.

For consistency with other *parse CSS* procedures, *parse a CSS stylesheet* and *parse a CSS rule* would also return a plain array and object, and *parse a CSS stylesheet* would be initiated in `CSSStyleSheet.constructor()` or from a function whose result would have to be passed to `CSSStyleSheet.create()`.

Other observations:

  - step 3 of *parse a stylesheet* is *create a new stylesheet, with its location set to `location`*, with *location* anchored to its definition in CSSOM, described as a *state item* of `CSSStyleSheet`, which would mean that *parse a stylesheet* returns a `CSSStyleSheet` that *parse a CSS stylesheet* should interpret
  - CSS Cascade 4 defines *fetch an `@import`*, whose step 4 sets `CSSImportRule.styleSheet` to the result of *parse a stylesheet* and the next section defines that *it must be interpreted as a CSS style sheet*, but the procedure has been removed in Cascade 5
  - CSS Syntax 3 defines that *"parse a stylesheet" is intended to be the normal parser entry point, for parsing stylesheets* but in the HTML specification, the procedures for processing `HTMLStyleElement` or `HTMLLinkElement` must create a CSS style sheet object, and initiating the parsing of their CSS content is left undefined (see issue below)
  - CSSOM defines that an HTTP `Link` header referencing a style sheet must *create a CSS style sheet*, whose steps neither include *parse a stylesheet* or *parse a CSS stylesheet*
  - `CSSStyleSheet.constructor()` (and `CSSStyleSheet.replace()` and `CSSStyleSheet.replaceSync()`) has been added to CSSOM to facilitate creating style sheets in `ShadowRoot`, which was limited to using `<style>` before
  - `CSSRule.parentStyleSheet` and `CSSRule.parentRule` must respectively reference a `CSSStyleSheet` and `CSSRule`, therefore `CSSStyleSheet.constructor()` and `CSSRule.constructor()` are the only places to create child `CSSRule`s by passing the corresponding reference to the child `CSSRule.constructor()`

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

A strict interpretation of *rules require to be parsed before you can see the stylesheet* would mean that *parse a CSS stylesheet* should run in `CSSStyleSheet.constructor()`, which should receive the raw CSS rules. But it rather means that the style sheet must be associated all its parsed rules before appearing outside of the CSS parser.

Parsing must always apply before validating context. For example, `@import` must not be discarded in `@namespace <invalid>; @import "valid";`.

The result of *parse a CSS rule* could be taken by `CSSRule.constructor()`, or it could run in `CSSRule.constructor()`. But potential issues may arise when constructing the corresponding `CSSRule` subclass before validating the context. For example, constructing `CSSImportRule` automatically starts fetching the style sheet referenced by `@import`.

`@charset`, `@import`, `@layer`, `@namespace`, are currently the only rules that can be invalid according to the context while valid according to their grammar.
