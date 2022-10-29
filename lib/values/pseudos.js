
/**
 * @see {@link https://drafts.csswg.org/selectors-4/#useraction-pseudos}
 */
const userActions = [
    'active',
    'focus',
    'focus-visible',
    'focus-within',
    'hover',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/}
 * @see {@link https://drafts.csswg.org/css-page-3/#spread-pseudos}
 * @see {@link https://drafts.csswg.org/css-page-3/#first-pseudo}
 * @see {@link https://drafts.csswg.org/css-page-3/#blank-pseudo}
 */
const classes = [
    ...userActions,
    'any-link',
    'blank',
    'buffering',
    'checked',
    'current',
    'default',
    'defined',
    'disabled',
    'empty',
    'enabled',
    'first',
    'first-child',
    'first-of-type',
    'fullscreen',
    'future',
    'in-range',
    'indeterminate',
    'invalid',
    'last-child',
    'last-of-type',
    'left',
    'link',
    'local-link',
    'muted',
    'only-child',
    'only-of-type',
    'optional',
    'out-of-range',
    'past',
    'paused',
    'placeholder-shown',
    'playing',
    'read-only',
    'read-write',
    'required',
    'root',
    'right',
    'scope',
    'seeking',
    'stalled',
    'target-within',
    'target',
    'user-invalid',
    'user-valid',
    'valid',
    'visited',
    'volume-locked',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#current-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#dir-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#has-pseudo}
 * @see {@link https://drafts.csswg.org/css-highlight-api-1/#selectordef-highlight-custom-highlight-name}
 * @see {@link https://drafts.csswg.org/selectors-4/#matches-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#lang-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#negation-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#nth-child-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#nth-col-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#nth-last-child-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#nth-last-col-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#nth-last-of-type-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#nth-of-type-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#where-pseudo}
 */
const functions = {
    'current': '<selector-list>',
    'dir': '<ident>',
    'has': '<forgiving-relative-selector-list>',
    'highlight': '<custom-highlight-name>',
    'is': '<forgiving-selector-list>',
    'lang': '[<ident> | <string>]#',
    'not': '<selector-list>',
    'nth-child': '<an+b> [of <forgiving-selector-list>]?',
    'nth-col': '<an+b>',
    'nth-last-child': '<an+b> [of <forgiving-selector-list>]?',
    'nth-last-col': '<an+b>',
    'nth-last-of-type': '<an+b>',
    'nth-of-type': '<an+b>',
    'where': '<forgiving-selector-list>',
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#pseudo-element-states}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7085}
 */
const pseudoClassing = [
    ...userActions,
    'defined',
    'is',
    'not',
    'where',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/}
 * @see {@link https://fullscreen.spec.whatwg.org/}
 *
 * `legacy` defines a pre-CSS3 pseudo-element that can be preceded by a single
 * colon (like pseudo-classes) for backward compatibility.
 */
const elements = {
    'after': { legacy: true, originating: [...pseudoClassing, 'marker'] },
    'backdrop': { originating: pseudoClassing },
    'before': { legacy: true, originating: [...pseudoClassing, 'marker'] },
    'file-selector-button': { originating: pseudoClassing },
    'first-letter': { legacy: true, originating: [...pseudoClassing, 'prefix', 'postfix'] },
    'first-line': { legacy: true, originating: pseudoClassing },
    'fullscreen': { originating: pseudoClassing },
    'grammar-error': { originating: pseudoClassing },
    'marker': { originating: pseudoClassing },
    'placeholder': { originating: pseudoClassing },
    'postfix': { originating: pseudoClassing },
    'prefix': { originating: pseudoClassing },
    'selection': { originating: pseudoClassing },
    'spelling-error': { originating: pseudoClassing },
    'target-text': { originating: pseudoClassing },
}

module.exports = { classes, elements, functions }
