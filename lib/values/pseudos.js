
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
        'nth-child()': '<an+b> [of <complex-real-selector-list>]?',
        'nth-col()': '<an+b>',
        'nth-last-child()': '<an+b> [of <complex-real-selector-list>]?',
        'nth-last-col()': '<an+b>',
        'nth-last-of-type()': '<an+b>',
        'nth-of-page()': '<an+b>',
        'nth-of-type()': '<an+b>',
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
    'dir()': '<ident>',
    'lang()': '[<ident> | <string>]#',
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
    'is()': '<forgiving-selector-list>',
    'not()': '<complex-real-selector-list>',
    'where()': '<forgiving-selector-list>',
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
        'has()': '<relative-selector-list>',
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
        'current()': '<forgiving-selector-list>',
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
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-context}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-function}
 * @see {@link https://drafts.csswg.org/selectors-4/#compat}
 * @see {@link https://drafts.csswg.org/selectors-4/#defined-pseudo}
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
        'host()': '<compound-selector>',
        'host-context()': '<compound-selector>',
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
        'defined',
        'host',
    ],
}

/**
 * @see {@link https://drafts.csswg.org/css-highlight-api-1/#custom-highlight-pseudo}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#highlight-selectors}
 */
const highlight = {
    functions: {
        'highlight()': { value: '<custom-highlight-name>' },
    },
    identifiers: {
        'grammar-error': {},
        'selection': {},
        'spelling-error': {},
        'target-text': {},
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#treelike}
 */
const treeAbiding = {
    'after': { originating: ['marker'] },
    'before': { originating: ['marker'] },
    'file-selector-button': {},
    'marker': {},
    'placeholder': {},
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#typographic-pseudos}
 */
const typographic = {
    'first-letter': { originating: ['prefix', 'postfix'] },
    'first-line': {},
    'postfix': {},
    'prefix': {},
}

/**
 * @see {@link https://drafts.csswg.org/css-view-transitions-1/#pseudo}}
 */
const viewTransitions = {
    functions: {
        'view-transition-group()': {
            classes: userActions,
            originating: ['view-transition-image-pair()'],
            structured: true,
            value: '<pt-name-selector>',
        },
        'view-transition-image-pair()': {
            classes: userActions,
            originating: ['view-transition-new()', 'view-transition-old()'],
            structured: true,
            value: '<pt-name-selector>',
        },
        'view-transition-new()': {
            classes: userActions,
            value: '<pt-name-selector>',
        },
        'view-transition-old()': {
            classes: userActions,
            value: '<pt-name-selector>',
        },
    },
    identifiers: {
        'view-transition': {
            classes: userActions,
            originating: ['view-transition-group()'],
            structured: true,
        },
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-overflow-4/#selectordef-nth-fragment}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-slotted}
 * @see {@link https://drafts.csswg.org/css-shadow-parts-1/#selectordef-part}
 * @see {@link https://fullscreen.spec.whatwg.org/#::backdrop-pseudo-element}
 */
const elements = {
    functions: {
        ...highlight.functions,
        ...viewTransitions.functions,
        'nth-fragment()': { value: '<an+b>' },
        'part()': {
            classes: [
                ...classes.identifiers,
                ...Object.keys(classes.functions),
            ],
            originating: Object.keys(treeAbiding),
            value: '<ident>+',
        },
        'slotted()': {
            originating: Object.keys(treeAbiding),
            value: '<compound-selector>',
        },
    },
    identifiers: {
        ...highlight.identifiers,
        ...treeAbiding,
        ...typographic,
        ...viewTransitions.identifiers,
        'backdrop': {},
    },
}

const indexes = [
    ...Object.keys(indexed.functions),
    ...indexed.identifiers,
]

const originated = []
Object.values(elements).forEach(definitions =>
    Object.values(definitions).forEach(({ originating }) => {
        if (originating) {
            originated.push(...originating)
        }
    }))

module.exports = {
    classes,
    elements,
    indexes,
    logical,
    originated,
    userActions,
}
