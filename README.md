
# CSS

JavaScript implementation of CSS.

## Usage

```js
const { cssom, install } = require('@cdoublev/css')
const myGlobalObject = {} // Array, Object, Number, String, TypeError, are required

install(myGlobalObject)

// Usage:
const { CSSStyleSheet } = myGlobalObject
const styleSheet = new CSSStyleSheet()

// Or via `webidl2js` wrappers:
const stylesheet = cssom.CSSStyleSheet.create(myGlobalObject, undefined, privateProperties)
const style = cssom.CSSStyleDeclaration.create(myGlobalObject, undefined, privateProperties)
```

The `webidl2js` wrappers are intended to implement:

- *create a CSS style sheet*: when processing or updating the content of [`HTMLStyleElement`](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element), when processing the resource referenced by [`HTMLLinkElement`](https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet) or an HTTP `Link` header with `rel="stylesheet"`
- (get) [the `style` attribute of an `HTMLElement`](https://html.spec.whatwg.org/multipage/dom.html#the-style-attribute)
- *return a live CSS declaration block* from [`Window.getComputedStyle()`](https://drafts.csswg.org/cssom-1/#extensions-to-the-window-interface)

To sum up, they mostly exist to create `CSSStyleSheet` and `CSSStyleDeclaration` (block). Below is a map between the properties as defined in the corresponding specification and `privateProperties`:

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
