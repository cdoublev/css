
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
    'first-child',
    'first-of-type',
    'fullscreen',
    'future',
    'in-range',
    'indeterminate',
    'invalid',
    'last-child',
    'last-of-type',
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
    // Back-compatibility with CSS2 (pseudo-elements)
    'after',
    'before',
    'first-letter',
    'first-line',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#current-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#dir-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#has-pseudo}
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
    'current()': 'current(<selector-list>)',
    'dir()': 'dir(<ident>)',
    'has()': 'has(<forgiving-relative-selector-list>)',
    'is()': 'is(<forgiving-selector-list>)',
    'lang()': 'lang([<ident> | <string>]#)',
    'not()': 'not(<selector-list>)',
    'nth-child()': 'nth-child(<an+b> [of <selector-list>]?)',
    'nth-col()': 'nth-col(<an+b>)',
    'nth-last-child()': 'nth-last-child(<an+b> [of <selector-list>]?)',
    'nth-last-col()': 'nth-last-col(<an+b>)',
    'nth-last-of-type()': 'nth-last-of-type(<an+b>)',
    'nth-of-type()': 'nth-of-type(<an+b>)',
    'where()': 'where(<forgiving-selector-list>)',
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#pseudo-element-states}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7085}
 */
const pseudoClassing = [
    ...userActions,
    'defined',
    'is()',
    'not()',
    'where()',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/}
 * @see {@link https://fullscreen.spec.whatwg.org/}
 */
const elements = {
    'after': { originating: [...pseudoClassing, 'marker'] },
    'backdrop': { originating: pseudoClassing },
    'before': { originating: [...pseudoClassing, 'marker'] },
    'file-selector-button': { originating: pseudoClassing },
    'first-letter': { originating: [...pseudoClassing, 'prefix', 'postfix'] },
    'first-line': { originating: pseudoClassing },
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
