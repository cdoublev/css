
# CSS

JavaScript implementation of CSS.

## Usage

```js
const {
  CSSStyleProperties,
  CSSStyleSheet,
  StyleSheetList,
  install,
  matchElementAgainstSelectors,
  matchTreesAgainstSelectors,
  parseGrammar,
  parseListGrammar,
} = require('@cdoublev/css')

/**
 * install() expects a window-like global object (default: globalThis) with
 * document, Array, Object, Number, String, TypeError.
 */
install(/*myGlobalObject*/)

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

`CSSStyleSheet`, `CSSStyleProperties`, `StyleSheetList`, are [`webidl2js`](https://github.com/jsdom/webidl2js) wrappers intended to implement:

- *create a CSS style sheet*: when processing or updating the content of [`HTMLStyleElement`](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element), when processing the resource referenced by [`HTMLLinkElement`](https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet) or an HTTP `Link` header with `rel="stylesheet"`
- (get) [the `style` attribute of an `HTMLElement`](https://html.spec.whatwg.org/multipage/dom.html#the-style-attribute)
- *return a live CSS declaration block* from [`Window.getComputedStyle()`](https://drafts.csswg.org/cssom-1/#extensions-to-the-window-interface)
- [`DocumentOrShadowRoot.styleSheets`](https://drafts.csswg.org/cssom-1/#dom-documentorshadowroot-stylesheets)

Below are their accepted `privateProperties`:

[**`CSSStyleSheet`**](https://drafts.csswg.org/cssom-1/#css-style-sheet)

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

[**`CSSStyleProperties`**](https://drafts.csswg.org/cssom-1/#css-declaration-block)

  - *computed flag*: `computed` (`Boolean`, optional, default: `false`)
  - *declarations*: `declarations` (`[Declaration]`, optional, default: `[]`)
  - *owner node*: `ownerNode` (`HTMLElement`, optional, default: `null`)
  - *parent CSS rule*: `parentRule` (`CSSRule`, optional, default: `null`)

`Declaration` must be a plain object with the following properties:

  - `name`: `String`
  - `value`: `String`
  - `important`: `Boolean` (optional, default: `false`)

`matchElementAgainstSelectors()` and `matchTreesAgainstSelectors()` are intended to implement:

  - [`element.closest()`](https://dom.spec.whatwg.org/#dom-element-closest) with `matchElementAgainstSelectors(ancestor, selectors, { scopes: { inclusive: true, roots: [element] } })`
  - [`element.matches()`](https://dom.spec.whatwg.org/#dom-element-matches) with `matchElementAgainstSelectors(element, selectors, { scopes: { inclusive: true, roots: [element] } })`
  - [`element.querySelector()`](https://dom.spec.whatwg.org/#dom-parentnode-queryselector) with `matchTreesAgainstSelectors([document], selectors, { scopes: { roots: [element] } })`
  - [`element.querySelectorAll()`](https://dom.spec.whatwg.org/#dom-parentnode-queryselectorall) with `matchTreesAgainstSelectors([document], selectors, { scopes: { roots: [element] } }, true)`

`selectors` is expected to be a [`<complex-selector-list>`](https://drafts.csswg.org/selectors-4/#typedef-selector-list) or [`<complex-real-selector-list>`](https://drafts.csswg.org/selectors-4/#typedef-complex-real-selector-list).

The third argument can also be assigned an `elementCache` as a `Map` or `WeakMap` of (string) selectors as keys and elements as values. If the result from matching a tree against the subject selector (ie. the rightmost compound selector) is stored in this cache, it will be used to match other selectors with the same subject, which avoids a tree traversal.
