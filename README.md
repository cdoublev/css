
# CSS

JavaScript implementation of CSS.

## Usage

```js
const {
  CSSPseudoElement,
  CSSStyleProperties,
  CSSStyleSheet,
  StyleSheetList,
  install,
  matchElementAgainstSelectors,
  matchTreesAgainstSelectors,
  parseGrammar,
  parseListGrammar,
} = require('@cdoublev/css')

// Install CSSOM interfaces on the global object
install()

// Create a CSSStyleSheet or CSSStyleProperties wrapper
const stylesheet = CSSStyleSheet.create(myGlobalObject, undefined, privateProperties)
const style = CSSStyleProperties.create(myGlobalObject, undefined, privateProperties)

// Parse something according to a CSS grammar
const selectors = parseGrammar('div', '<selector-list>')

// Parse a comma-separated list according to a CSS grammar
const list = parseListGrammar('(width < 30rem), (orientation: portrait)', '<media-query-list>')

// Match a tree against a complex selector list
const elements = matchTreesAgainstSelectors([document], selectors)
```

`install()` accepts two optional arguments:

  - a window-like global object (default: `globalThis`) that must have the following properties: `document`, `Array`, `Object`, `Number`, `String`, `TypeError`
  - a shared state object (default: see in [./index.js](./index.js)) that defines the user preferred color theme and font size, the length of the UA interfaces affecting the small/dynamic viewport size, etc

`CSSPseudoElement`, `CSSStyleSheet`, `CSSStyleProperties`, `StyleSheetList`, are [`webidl2js`](https://github.com/jsdom/webidl2js) wrappers intended to implement:

  - [`DocumentOrShadowRoot.styleSheets`](https://drafts.csswg.org/cssom-1/#dom-documentorshadowroot-stylesheets)
  - *create a CSS style sheet*: when processing the content of [`HTMLStyleElement`](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element) or the resource referenced by [`HTMLLinkElement`](https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet) or an HTTP `Link` header with `rel="stylesheet"`
  - [`ElementCSSInlineStyle.style`](https://drafts.csswg.org/cssom/#elementcssinlinestyle)
  - [`Element.pseudo()`](https://drafts.csswg.org/css-pseudo-4/#dom-element-pseudo) and [`Window.getComputedStyle()`](https://drafts.csswg.org/cssom-1/#dom-window-getcomputedstyle)

[**`CSSPseudoElement`**](https://drafts.csswg.org/css-pseudo-4/#csspseudoelement) accept `privateProperties` that correspond to its attributes.

[**`CSSStyleSheet`**](https://drafts.csswg.org/cssom-1/#css-style-sheet) accept the following `privateProperties`:

  - *CSS rules*: `rules` (`String` or `ReadableStream`)
  - *alternate flag*: `alternate` (`Boolean`, optional, default: `false`)
  - *disabled flag*: `disabled` (`Boolean`, optional, default: `false`)
  - *location*: `location` (`String`, optional, default: `null`)
  - *media*: `media` (`String` or `MediaList`)
  - *origin-clean flag*: `originClean` (`Boolean`)
  - *owner CSS rule*: `ownerRule` (`CSSRule`, optional, default: `null`)
  - *owner node*: `ownerNode` (`HTMLElement`)
  - *parent CSS style sheet*: `parentStyleSheet` (`CSSStyleSheet`, optional, default: `null`)
  - *title*: `title` (`String`, optional, default: `''`)

[**`CSSStyleProperties`**](https://drafts.csswg.org/cssom-1/#css-declaration-block) accept the following `privateProperties`:

  - *computed flag*: `computed` (`Boolean`, optional, default: `false`)
  - *declarations*: `declarations` (`[Declaration]`, optional, default: `[]`)
  - *owner node*: `ownerNode` (`HTMLElement`, optional, default: `null`)
  - *parent CSS rule*: `parentRule` (`CSSRule`, optional, default: `null`)

`Declaration` must be a plain object with the following properties:

  - `name`: `String`
  - `value`: `String`
  - `important`: `Boolean` (optional, default: `false`)

`parseGrammar()` and `parseListGrammar()` are implementations of [*parse something according to a CSS grammar*](https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar) and [*parse a comma-separated list according to a CSS grammar*](https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar), which take 3 arguments:

  - `input`: `String`
  - `definition`: `String` (a [CSS value definition](doc/value-definition.md))
  - `context`: `Element` (optional)

`matchElementAgainstSelectors()` and `matchTreesAgainstSelectors()` are intended to implement:

  - [`element.closest()`](https://dom.spec.whatwg.org/#dom-element-closest) with `matchElementAgainstSelectors(ancestor, selectors, { scopes: { inclusive: true, roots: [element] } })`
  - [`element.matches()`](https://dom.spec.whatwg.org/#dom-element-matches) with `matchElementAgainstSelectors(element, selectors, { scopes: { inclusive: true, roots: [element] } })`
  - [`element.querySelector()`](https://dom.spec.whatwg.org/#dom-parentnode-queryselector) with `matchTreesAgainstSelectors([document], selectors, { scopes: { roots: [element] } }, { first: true })`
  - [`element.querySelectorAll()`](https://dom.spec.whatwg.org/#dom-parentnode-queryselectorall) with `matchTreesAgainstSelectors([document], selectors, { scopes: { roots: [element] } })`

`selectors` is expected to be a [`<complex-selector-list>`](https://drafts.csswg.org/selectors-4/#typedef-selector-list) or [`<complex-real-selector-list>`](https://drafts.csswg.org/selectors-4/#typedef-complex-real-selector-list).
