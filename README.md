
# CSS

JavaScript implementation of the CSS object model.

# Usage

```js
const { cssom, install } = require('@cdoublev/css')
const myGlobalObject = {} // Array, Object, Number, String, TypeError, are required

install(myGlobalObject)

// Usage:
const { CSSStyleSheet } = myGlobalObject
const styleSheet = new CSSStyleSheet()

// Or via `webidl2js` wrappers stored in `cssom`:
const style = cssom.CSSStyleDeclaration.create(myGlobalObject)
```
