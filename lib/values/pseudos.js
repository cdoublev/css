
/**
 * @see {@link https://drafts.csswg.org/selectors-4/#display-state-pseudos}
 */
const display = [
    'closed',
    'fullscreen',
    'modal',
    'open',
    'picture-in-picture',
]

/**
 * @see {@link https://drafts.csswg.org/css-gcpm-4/#page-selector-pseudo-classes}
 * @see {@link https://drafts.csswg.org/selectors-4/#child-index}
 * @see {@link https://drafts.csswg.org/selectors-4/#table-pseudos}
 * @see {@link https://drafts.csswg.org/selectors-4/#typed-child-index}
 */
const indexed = {
    functions: {
        'nth-child': '<an+b> [of <complex-real-selector-list>]?',
        'nth-col': '<an+b>',
        'nth-last-child': '<an+b> [of <complex-real-selector-list>]?',
        'nth-last-col': '<an+b>',
        'nth-last-of-type': '<an+b>',
        'nth-of-page': '<an+b>',
        'nth-of-type': '<an+b>',
    },
    identifiers: [
        'first-child',
        'first-of-page',
        'first-of-type',
        'last-child',
        'last-of-page',
        'last-of-type',
        'only-child',
        'only-of-type',
        'start-of-page',
    ],
}
const indexedNames = [...indexed.identifiers, ...Object.keys(indexed.functions)]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#input-pseudos}
 */
const input = [
    'autofill',
    'blank',
    'checked',
    'default',
    'disabled',
    'enabled',
    'in-range',
    'indeterminate',
    'invalid',
    'optional',
    'out-of-range',
    'placeholder-shown',
    'read-only',
    'read-write',
    'required',
    'user-invalid',
    'user-valid',
    'valid',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#linguistic-pseudos}
 */
const linguistic = {
    'dir': '<ident>',
    'lang': '[<ident> | <string>]#',
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#location}
 */
const location = [
    'any-link',
    'link',
    'local-link',
    'scope',
    'target',
    'target-within',
    'visited',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#logical-combination}
 */
const logical = {
    'is': '<forgiving-selector-list>',
    'not': '<complex-real-selector-list>',
    'where': '<forgiving-selector-list>',
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#resource-pseudos}
 */
const resource = [
    'buffering',
    'muted',
    'paused',
    'playing',
    'seeking',
    'stalled',
    'volume-locked',
]

/**
 * @see {@link https://drafts.csswg.org/css-scroll-snap-2/#snapped}
 */
const snapped = [
    'snapped',
    'snapped-block',
    'snapped-inline',
    'snapped-x',
    'snapped-y',
]

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#relational}
 * @see {@link https://drafts.csswg.org/selectors-4/#structural-pseudos}
 */
const structural = {
    functions: {
        ...indexed.functions,
        'has': '<relative-selector-list>',
    },
    identifiers: [
        ...indexed.identifiers,
        'empty',
        'root',
    ],
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#time-pseudos}
 */
const time = {
    functions: {
        'current': '<forgiving-selector-list>',
    },
    identifiers: [
        'current',
        'future',
        'past',
    ],
}

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
 * @see {@link https://drafts.csswg.org/css-view-transitions-1/#pseudo}}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#pseudo-classes}}
 */
const viewTransitions = {
    classes: {
        functions: {
            'active-view-transition-type': '<custom-ident>#',
        },
        identifiers: [
            'active-view-transition',
        ],
    },
    elements: {
        functions: {
            'view-transition-group': {
                classes: ['empty', ...indexedNames],
                value: '<pt-name-selector>',
            },
            'view-transition-image-pair': {
                classes: ['empty', ...indexedNames],
                value: '<pt-name-selector>',
            },
            'view-transition-new': {
                classes: indexedNames,
                value: '<pt-name-selector>',
            },
            'view-transition-old': {
                classes: indexedNames,
                value: '<pt-name-selector>',
            },
        },
        identifiers: {
            'view-transition': {
                classes: ['empty'],
            },
        },
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-has-slotted}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-context}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-function}
 * @see {@link https://drafts.csswg.org/selectors-4/#compat}
 * @see {@link https://drafts.csswg.org/selectors-4/#defined-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-5/#selectordef-state}
 * @see {@link https://html.spec.whatwg.org/#selector-popover-open}
 * @see {@link https://immersive-web.github.io/dom-overlays/#selectordef-xr-overlay}
 */
const classes = {
    aliases: new Map([
        ['-webkit-autofill', 'autofill'],
    ]),
    functions: {
        ...linguistic,
        ...logical,
        ...structural.functions,
        ...time.functions,
        ...viewTransitions.classes.functions,
        'host': '<compound-selector>',
        'host-context': '<compound-selector>',
        'state': '<ident>',
    },
    identifiers: [
        ...display,
        ...input,
        ...location,
        ...resource,
        ...snapped,
        ...structural.identifiers,
        ...time.identifiers,
        ...userActions,
        ...viewTransitions.classes.identifiers,
        'defined',
        'has-slotted',
        'host',
        'popover-open',
        'xr-overlay',
    ],
}

/**
 * @see {@link https://drafts.csswg.org/css-highlight-api-1/#custom-highlight-pseudo}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#highlight-selectors}
 */
const highlight = {
    functions: {
        'highlight': { value: '<custom-highlight-name>' },
    },
    identifiers: {
        'grammar-error': {},
        'selection': {},
        'spelling-error': {},
        'target-text': {},
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-position-4/#selectordef-backdrop}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#treelike}
 * @see {@link https://drafts.csswg.org/css-shadow-parts-1/#selectordef-part}
 */
const treeAbiding = {
    functions: {
        'part': {
            classes: [
                ...classes.identifiers,
                ...Object.keys(classes.functions),
            ],
            elements: [/* filled at the bottom of the file */],
            value: '<ident>+',
        },
        'picker': {
            value: '<ident>+',
        }
    },
    identifiers: {
        'after': { classes: ['empty'], elements: ['marker'] },
        'backdrop': {},
        'before': { classes: ['empty'], elements: ['marker'] },
        'details-content': {},
        'file-selector-button': {},
        'marker': { classes: indexedNames },
        'placeholder': {},
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#typographic-pseudos}
 */
const typographic = {
    'first-letter': { classes: ['empty'], elements: ['prefix', 'postfix'] },
    'first-line': {},
    'postfix': { classes: indexedNames },
    'prefix': { classes: indexedNames },
}

/**
 * @see {@link https://drafts.csswg.org/css-overflow-4/#selectordef-nth-fragment}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-slotted}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-scroll-marker}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-scroll-marker-group}
 */
const elements = {
    functions: {
        ...highlight.functions,
        ...treeAbiding.functions,
        ...viewTransitions.elements.functions,
        'nth-fragment': { value: '<an+b>' },
        'slotted': {
            elements: [
                ...Object.keys(treeAbiding.identifiers),
                ...Object.keys(treeAbiding.functions),
            ],
            value: '<compound-selector>',
        },
    },
    identifiers: {
        ...highlight.identifiers,
        ...treeAbiding.identifiers,
        ...typographic,
        ...viewTransitions.elements.identifiers,
        'scroll-marker': {},
        'scroll-marker-group': {},
    },
}

treeAbiding.functions.part.elements.push(...Object.keys(elements.functions), ...Object.keys(elements.identifiers))

module.exports = {
    classes,
    elements,
    logical,
    userActions,
}
