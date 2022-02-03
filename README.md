
# CSS

JavaScript implementation of the CSS object model.

## Usage

```js
const { cssom, install } = require('@cdoublev/css')
const myGlobalObject = {} // Array, Object, Number, String, TypeError, are required

install(myGlobalObject)

// Usage:
const { CSSStyleSheet } = myGlobalObject
const styleSheet = new CSSStyleSheet()

// Or via `webidl2js` wrappers:
const style = cssom.CSSStyleSheet.create(myGlobalObject, undefined, privateProperties)
const style = cssom.CSSStyleDeclaration.create(myGlobalObject, undefined, privateProperties)
```

The `webidl2js` wrappers are intended to implement:

- *create a CSS style sheet*: when processing or updating the content of [`<style>`](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element), when processing the resource referenced by [`<link>`](https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet), or when processing an HTTP `Link` header including `rel="stylesheet"`
- [the `style` attribute of an `HTMLElement`](https://html.spec.whatwg.org/multipage/dom.html#the-style-attribute)
- *return a live CSS declaration block* when implementing the extension to `Window` that provides [`getComputedStyle()`](https://drafts.csswg.org/cssom/#extensions-to-the-window-interface)

To sum up, they mostly exist to create a `CSSStyleSheet` and `CSSStyleDeclaration` (CSS declaration block). Below are a map between the properties as defined in the corresponding specification and `privateProperties`:

- `CSSStyleSheet`
  - *CSS rules*: `cssRules` (`String` or `ReadableStream`)
  - *alternate flag*: `alternate` (`Boolean`, optional)
  - *disabled flag*: `disabled` (`Boolean`, optional)
  - *location*: `location` (`String`, optional)
  - *media*: `media` (`String` or `MediaList`)
  - *origin-clean flag*: `originClean` (`Boolean`)
  - *owner CSS rule*: `ownerRule` (`CSSRule`, optional)
  - *owner node*: `ownerNode` (`HTMLElement`)
  - *parent CSS style sheet*: `parentStyleSheet` (`CSSStyleSheet`, optional)
  - *title*: `title` (`String`, optional)
- `CSSStyleDeclaration`
  - *computed flag*: `computed` (`Boolean`, optional)
  - *declarations*: `declarations` (`Map`, optional)
  - *owner node*: `ownerNode` (`HTMLElement`, optional)
  - *parent CSS rule*: `parentRule` (`CSSRule`, optional)

The `declarations` for `CSSStyleDeclaration` should be objects with the following properties:
  - (property) `name`: `String`
  - `value`: TBD
  - `important`: `Boolean`
