
# CSS

JavaScript implementation of the CSS object model.

# Usage

```js

const cssom = require('@cdoublev/css')

for (const interface of cssom) {
  interface.install(window, ['Window'])
}

// Only for using `CSSStyleDeclaration`
const { CSSStyleDeclaration } = cssom
const state = {
  computed: false,      // When running `window.getComputedStyle()`, default: false
  ownerNode: myElement, // When creating `Element.style`, default: null
}
const style = CSSStyleDeclaration.create(window, undefined, state)
```

If you are only interested in using `CSSStyleDeclaration` to parse CSS declarations:

```js
const CSSStyleDeclaration = require('@cdoublev/css/CSSStyleDeclaration.js')
const style = new CSSStyleDeclaration()
```
