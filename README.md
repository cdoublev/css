
# CSS

JavaScript implementation of the CSS object model.

# Usage

```js
const cssom = require('@cdoublev/css')
const myGlobalObject = {} // Array, Object, Number, String, TypeError, are required

cssom.install(myGlobalObject)

// Usage with CSSStyleDeclaration
const { CSSStyleDeclaration } = myGlobalObject
const style = new CSSStyleDeclaration()
```
