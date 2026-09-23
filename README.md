
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
  states,
} = require('@cdoublev/css')

// Install CSSOM interfaces on the global object
install(myGlobalObject, { user: { fontSize: 20 } })

// Create a CSSStyleSheet or CSSStyleProperties wrapper
const stylesheet = CSSStyleSheet.create(myGlobalObject, undefined, privateData)
const style = CSSStyleProperties.create(myGlobalObject, undefined, privateData)

// Parse something according to a CSS grammar
const selector = parseGrammar('div', '<complex-selector>')

// Parse a comma-separated list according to a CSS grammar
const selectors = parseListGrammar('div, :invalid', '<complex-selector>')

// Match a tree against a complex selector list
const elements = matchTreesAgainstSelectors([document], selectors.filter(Boolean))

// Add a pointing device
states.get(myGlobalObject).system.pointers.push({ precision: 'fine', motionable: true })
// Change the user preferred font size
states.get(myGlobalObject).user.fontSize = 16
```

`install()` accepts two optional arguments:

  - a window-like global object (default: `globalThis`) that must have the following properties: `document`, `Array`, `Object`, `Number`, `String`, `TypeError`
  - <details>
    <summary>an object defining the user agent, system, and preferences (default: see below)</summary><br>

    They ​​will be recursively merged with the default values.

    | Property                         | Default                         | Affected values
    | -------------------------------- | ------------------------------- | ----------------------------------------------- |
    | `agent.colorSchemes`             | `['light', 'dark']`             | `@media/*-color-scheme`                         |
    | `agent.navigation`               | `['back']`                      | `@media/nav-controls`                           |
    | `agent.scripting`                | `'enabled'`                     | `@media/scripting`                              |
    | `agent.styleSheet`               | `CSSStyleSheet`                 | *                                               |
    | `agent.type`                     | `'screen'`                      | `@media` (`<media-type>`)                       |
    | `agent.viewport.interfaces.*`    | `{ expanded: false, value: 0 }` | `<length>`                                      |
    | `agent.viewport.overflow`        | `['scroll', 'scroll']`          | `@media/overflow-*`                             |
    | `agent.viewport.resizable`       | `true`                          | `@media/resizable`                              |
    | `agent.viewport.state`           | `'normal'`                      | `@media/display-state`                          |
    | `document.manifest`              | `null`                          | `@media/display-mode`                           |
    | `document.customProperties`      | `new Map`                       | `<var()>`                                       |
    | `document.environmentVariables`  | `new Map`                       | `<env()>`                                       |
    | `document.focused`               | `null`                          | `:focus-*`                                      |
    | `document.randomCacheNames`      | `[]`                            | `<random()>`                                    |
    | `system.display.blending`        | `'opaque'`                      | `@media/environment-blending`                   |
    | `system.display.colorIndex`      | `0`                             | `@media/color-index`                            |
    | `system.display.graphicMode`     | `true`                          | `@media/grid`                                   |
    | `system.display.hdr`             | `false`                         | `@media/*-dynamic-range`                        |
    | `system.display.interlaced`      | `false`                         | `@media/scan`                                   |
    | `system.display.monochrome`      | `0`                             | `@media/monochrome`                             |
    | `system.display.segments`        | `[1, 1]`                        | `@media/*-segments`                             |
    | `system.display.shape`           | `'rect'`                        | `@media/shape`                                  |
    | `system.display.update`          | `'fast'`                        | `@media/update`                                 |
    | `system.pointers`                | See below                       | `@media/*-hover`, `@media/*-pointer`            |
    | `user.colorScheme`               | `'light'`                       | `@media/*-color-scheme`, `<system-color>`       |
    | `user.forcedColors`              | `null`                          | `@media/forced-colors`, `@media/prefers-color-scheme`, `@media/prefers-contrast`, `<system-color>` |
    | `user.highContrast`              | `false`                         | `@media/prefers-contrast`                       |
    | `user.fontSize`                  | `16`                            | `font-size`                                     |
    | `user.invertedColors`            | `false`                         | `@media/inverted-colors`                        |
    | `user.reducedData`               | `false`                         | `@media/prefers-reduced-data`                   |
    | `user.reducedMotion`             | `false`                         | `@media/prefers-reduced-motion`                 |
    | `user.reducedTransparency`       | `false`                         | `@media/prefers-reduced-transparency`           |
    | `user.styleSheet`                | `CSSStyleSheet`                 | *                                               |
    | `user.visibleFocus`              | `false`                         | `:focus-visible`                                |

    `agent.colorSchemes` represents the color schemes supported by the user agent. The first entry is the default color scheme.

    `agent.styleSheet` and `user.styleSheet` are parsed into `CSSStyleSheet`s.

    `agent.viewport.interfaces` represents the user agent interfaces affecting the viewport area when expanded. It must be an object with the properties `bottom`, `left`, `right`, `top`, assigned `{ expanded: Boolean, value: Number }`.

    `agent.viewport.overflow` represents the overflow behavior in the inline and block direction, respectively.

    `document.manifest` (parsed JSON) must be defined only when emulating a Web application environment.

    `document.customProperties` represents custom properties registered with `CSS.registerProperty()`.

    `document.environmentVariables` represents environment variables registered with an interface that has not yet been defined in specifications.

    `document.fontFaces` represents font faces registered with `@font-face`.

    `document.randomCacheNames` represents `random()` base values associated with the data that determines when they are shared.

    `system.display.segments` represents the number of horizontal and vertical segments, respectively.

    `system.pointers` must be a list of pointer definitions as `{ motionable: Boolean, precision: 'coarse|fine' }`. The first entry represents the primary pointer, which defaults to `{ motionable: true, precision: 'fine' }`.

    `user.colorScheme` represents the user's preferred color scheme, which is assumed to be included in `agent.colorSchemes`. Prefix the color scheme with `overriding-` to indicate an overriding preference.

    `user.forcedColors` represents the colors from the high contrast mode in Windows or Firefox. It must be an object mapping a `<system-color>` keyword in lowercase to a resolved legacy `<rgb()>`. When it is defined, `user.highContrast` must not be defined: it will be evaluated based on the WCAG contrast ratio between `canvas` and `canvastext`, which are assumed to always be defined.

    `user.highContrast` corresponds to the high contrast mode in macOS, which does not activate the forced color mode, so `user.forcedColors` is assumed to be undefined.

    </details>

`CSSPseudoElement`, `CSSStyleSheet`, `CSSStyleProperties`, `StyleSheetList`, are [`webidl2js`](https://github.com/jsdom/webidl2js) wrappers intended to implement:

  - [`DocumentOrShadowRoot.styleSheets`](https://drafts.csswg.org/cssom-1/#dom-documentorshadowroot-stylesheets)
  - *create a CSS style sheet*: when processing the content of [`HTMLStyleElement`](https://html.spec.whatwg.org/multipage/semantics.html#the-style-element) or the resource referenced by [`HTMLLinkElement`](https://html.spec.whatwg.org/multipage/links.html#link-type-stylesheet) or an HTTP `Link` header with `rel="stylesheet"`
  - [`ElementCSSInlineStyle.style`](https://drafts.csswg.org/cssom/#elementcssinlinestyle)
  - [`Element.pseudo()`](https://drafts.csswg.org/css-pseudo-4/#dom-element-pseudo) and [`Window.getComputedStyle()`](https://drafts.csswg.org/cssom-1/#dom-window-getcomputedstyle)

[**`CSSPseudoElement`**](https://drafts.csswg.org/css-pseudo-4/#csspseudoelement) accepts `privateProperties` that correspond to its attributes.

[**`CSSStyleSheet`**](https://drafts.csswg.org/cssom-1/#css-style-sheet) accepts the following `privateProperties`:

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

[**`CSSStyleProperties`**](https://drafts.csswg.org/cssom-1/#css-declaration-block) accepts the following `privateProperties`:

  - *computed flag*: `computed` (`Boolean`, optional, default: `false`)
  - *declarations*: `declarations` (`[Declaration]`, optional, default: `[]`)
  - *owner node*: `ownerNode` (`HTMLElement`, optional, default: `null`)
  - *parent CSS rule*: `parentRule` (`CSSRule`, optional, default: `null`)

`Declaration` must be a plain object with the following properties:

  - `name`: `String`
  - `value`: `Object|[Object]` (parsed value)
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
