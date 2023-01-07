
/**
 * @see {@link https://drafts.csswg.org/selectors-4/#compat}
 */
const aliases = new Map([
    ['-webkit-autofill', 'autofill'],
])

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
 * @see {@link https://drafts.csswg.org/selectors-4/#typed-child-index}
 * @see {@link https://drafts.csswg.org/selectors-4/#table-pseudos}
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
    'visited',
    'scope',
    'target',
    'target-within',
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
 * @see {@link https://drafts.csswg.org/selectors-4/#structural-pseudos}
 * @see {@link https://drafts.csswg.org/selectors-4/#relational}
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
const time = [
    'current',
    'future',
    'past',
]

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

const classes = {
    /**
     * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-context}
     * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-function}
     * @see {@link https://drafts.csswg.org/selectors-4/#selectordef-current}
     */
    functions: {
        ...linguistic,
        ...logical,
        ...structural.functions,
        'current()': '<forgiving-selector-list>',
        'host()': '<compound-selector>',
        'host-context()': '<compound-selector>',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-page-3/#blank-pseudo}
     * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
     * @see {@link https://drafts.csswg.org/selectors-4/#blank-pseudo}
     * @see {@link https://drafts.csswg.org/selectors-4/#defined-pseudo}
     */
    identifiers: [
        ...display,
        ...input,
        ...location,
        ...resource,
        ...snapped,
        ...structural.identifiers,
        ...time,
        ...userActions,
        'blank',
        'defined',
        'host',
    ],
}

// Pseudo-classes that can apply to all pseudo-elements
const universal = [...userActions, 'defined']

/**
 * @see {@link https://drafts.csswg.org/css-highlight-api-1/#custom-highlight-pseudo}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#highlight-selectors}
 */
const highlight = {
    functions: {
        'highlight()': { classes: universal, value: '<custom-highlight-name>' },
    },
    identifiers: {
        'grammar-error': { classes: universal },
        'selection': { classes: universal },
        'spelling-error': { classes: universal },
        'target-text': { classes: universal },
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#treelike}
 */
const treeAbiding = {
    'after': { classes: universal, originating: ['marker'] },
    'before': { classes: universal, originating: ['marker'] },
    'file-selector-button': { classes: universal },
    'marker': { classes: universal },
    'placeholder': { classes: universal },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#typographic-pseudos}
 */
const typographic = {
    'first-letter': { classes: universal, originating: ['prefix', 'postfix'] },
    'first-line': { classes: universal },
    'postfix': { classes: universal },
    'prefix': { classes: universal },
}

/**
 * @see {@link https://drafts.csswg.org/css-view-transitions-1/#pseudo}}
 */
const viewTransitions = {
    functions: {
        'view-transition-group()': {
            classes: universal,
            originating: ['view-transition-image-pair()'],
            structured: true,
            value: '<pt-name-selector>',
        },
        'view-transition-image-pair()': {
            classes: universal,
            originating: ['view-transition-new()', 'view-transition-old()'],
            structured: true,
            value: '<pt-name-selector>',
        },
        'view-transition-new()': {
            classes: universal,
            value: '<pt-name-selector>',
        },
        'view-transition-old()': {
            classes: universal,
            value: '<pt-name-selector>',
        },
    },
    identifiers: {
        'view-transition': {
            classes: universal,
            originating: ['view-transition-group()'],
            structured: true,
        },
    },
}

/**
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7085}
 */
const elements = {
    /**
     * @see {@link https://drafts.csswg.org/css-overflow-4/#selectordef-nth-fragment}
     * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-slotted}
     * @see {@link https://drafts.csswg.org/css-shadow-parts-1/#selectordef-part}
     */
    functions: {
        ...highlight.functions,
        ...viewTransitions.functions,
        'nth-fragment()': { classes: universal, value: '<an+b>' },
        'part()': {
            classes: [
                ...Object.keys(classes.functions).filter(name => !structural.functions[name]),
                ...classes.identifiers.filter(name => !structural.identifiers.includes(name)),
            ],
            originating: [
                ...Object.keys(treeAbiding),
                ...Object.keys(typographic),
                'nth-fragment()',
            ],
            value: '<ident>+',
        },
        'slotted()': {
            classes: universal,
            originating: Object.keys(treeAbiding),
            value: '<compound-selector>',
        },
    },
    /**
     * @see {@link https://fullscreen.spec.whatwg.org/#::backdrop-pseudo-element}
     */
    identifiers: {
        ...highlight.identifiers,
        ...treeAbiding,
        ...typographic,
        ...viewTransitions.identifiers,
        'backdrop': { classes: universal },
    },
}

const child = [
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

module.exports = { aliases, child, classes, elements, logical, originated }
