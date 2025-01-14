
# CSS

JavaScript implementation of CSS.

## Usage

```js
const { cssom, install, parser: { parseCSSGrammar, parseCSSStyleSheet } } = require('@cdoublev/css')

/**
 * install() expects a window-like global object (default: globalThis) with
 * document, Array, Object, Number, String, TypeError.
 */
install(/*myGlobalObject*/)

// Parse a style sheet and get a (non-constructed) CSSStyleSheet
const stylesheet = parseCSSStyleSheet('style {}')

// Create a (constructed) CSSStyleSheet
const styleSheet = new /*myGlobalObject.*/CSSStyleSheet()

// Create a CSSStyleSheet or CSSStyleDeclaration wrapper
const stylesheet = cssom.CSSStyleSheet.create(myGlobalObject, undefined, privateProperties)
const style = cssom.CSSStyleDeclaration.create(myGlobalObject, undefined, privateProperties)

// Parse a value according to a CSS grammar
const value = parseCSSGrammar('(width < 30rem), (orientation: portrait)', '<media-query-list>')
```

The `webidl2js` wrappers are intended to implement:

- *create a CSS style sheet*: when processing or updating the content of [`HTMLStyleElement`](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element), when processing the resource referenced by [`HTMLLinkElement`](https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet) or an HTTP `Link` header with `rel="stylesheet"`
- (get) [the `style` attribute of an `HTMLElement`](https://html.spec.whatwg.org/multipage/dom.html#the-style-attribute)
- *return a live CSS declaration block* from [`Window.getComputedStyle()`](https://drafts.csswg.org/cssom-1/#extensions-to-the-window-interface)

To sum up, they mostly exist to create `CSSStyleSheet` and `CSSStyleDeclaration`. Below are the properties defined in the CSSOM specification and their associated property read in `privateProperties`:

**`CSSStyleSheet`**

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

**`CSSStyleDeclaration`**

  - *computed flag*: `computed` (`Boolean`, optional, default: `false`)
  - *declarations*: `declarations` (`[Declaration]`, optional, default: `[]`)
  - *owner node*: `ownerNode` (`HTMLElement`, optional, default: `null`)
  - *parent CSS rule*: `parentRule` (`CSSRule`, optional, default: `null`)

`Declaration` must be a plain object with the following properties:

  - `name`: `String`
  - `value`: `String`
  - `important`: `Boolean` (optional, default: `false`)
