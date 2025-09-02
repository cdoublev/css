/* eslint-disable @stylistic/js/quote-props */

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#display-state-pseudos}
 */
const display = [
    'fullscreen',
    'modal',
    'open',
    'picture-in-picture',
    'popover-open',
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
    'unchecked',
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
        'current': '<compound-selector-list>',
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
    'interest-source',
    'interest-target',
]

/**
 * @see {@link https://drafts.csswg.org/css-view-transitions-1/#pseudo}}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#pseudo-classes}}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#selectordef-view-transition-group-children}}
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
            'view-transition-group-children': {
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
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#element-backed}
 */
const elemental = {
    functions: {
        'part': {
            classes: [/* filled at the bottom of the file */],
            elements: [/* filled at the bottom of the file */],
            value: '<ident>+',
        },
    },
    identifiers: {
        'details-content': {
            classes: [/* filled at the bottom of the file */],
            elements: [/* filled at the bottom of the file */],
        },
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#highlight-selectors}
 */
const highlight = {
    functions: {
        'highlight': { value: '<custom-ident>' },
    },
    identifiers: {
        'grammar-error': {},
        'search-text': { classes: ['current'] },
        'selection': {},
        'spelling-error': {},
        'target-text': {},
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-checkmark}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-file-selector-button}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-picker}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-picker-icon}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-slider-fill}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-slider-thumb}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-slider-track}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-step-control}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-step-down}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-step-up}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-scroll-button---scroll-button-direction}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-scroll-marker}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-scroll-marker-group}
 * @see {@link https://drafts.csswg.org/css-position-4/#selectordef-backdrop}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#element-like}
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#treelike}
 * @see {@link https://drafts.csswg.org/css-shadow-parts-1/#selectordef-part}
 */
const treeAbiding = {
    functions: {
        ...viewTransitions.elements.functions,
        ...elemental.functions,
        'picker': { value: '<form-control-identifier>+' },
        'scroll-button': { classes: ['disabled'], value: "'*' | <scroll-button-direction>" },
    },
    identifiers: {
        ...elemental.identifiers,
        ...viewTransitions.elements.identifiers,
        'after': { classes: ['empty'], elements: ['marker'] },
        'backdrop': {},
        'before': { classes: ['empty'], elements: ['marker'] },
        'checkmark': {},
        'file-selector-button': {},
        'marker': { classes: indexedNames },
        'picker-icon': {},
        'placeholder': {},
        'scroll-marker': {},
        'scroll-marker-group': {},
        'slider-fill': {},
        'slider-thumb': {},
        'slider-track': { elements: ['slider-fill'] },
        'step-control': { elements: ['step-down', 'step-up'] },
        'step-down': {},
        'step-up': {},
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#typographic-pseudos}
 */
const typographic = {
    'first-letter': { classes: ['empty'], elements: ['prefix', 'suffix'] },
    'first-line': {},
    'prefix': { classes: indexedNames },
    'suffix': { classes: indexedNames },
}

/**
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-high-value}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-low-value}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-optimal-value}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-target-current}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-has-slotted}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-context}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-host-function}
 * @see {@link https://drafts.csswg.org/selectors-4/#compat}
 * @see {@link https://drafts.csswg.org/selectors-4/#defined-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-5/#selectordef-state}
 * @see {@link https://drafts.csswg.org/selectors-5/#heading-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-5/#heading-functional-pseudo}
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
        'heading': '<an+b>#',
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
        'heading',
        'high-value',
        'host',
        'low-value',
        'optimal-value',
        'target-current',
        'xr-overlay',
    ],
}

/**
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-clear-icon}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-color-swatch}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-field-component}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-field-separator}
 * @see {@link https://drafts.csswg.org/css-forms-1/#selectordef-field-text}
 * @see {@link https://drafts.csswg.org/css-multicol-2/#selectordef-column}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#selectordef-nth-fragment}
 * @see {@link https://drafts.csswg.org/css-scoping-1/#selectordef-slotted}
 */
const elements = {
    functions: {
        ...highlight.functions,
        ...treeAbiding.functions,
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
        'clear-icon': {},
        'color-swatch': {},
        'column': { elements: ['scroll-marker'] },
        'field-component': {},
        'field-separator': {},
        'field-text': {},
    },
}

const pseudoClassNames = [
    ...classes.identifiers.filter(name =>
        !structural.identifiers.includes(name)
        && name !== 'host'
        && name !== 'scope'
    ),
    ...Object.keys(classes.functions).filter(name =>
        !structural.functions[name]
        && !name.startsWith('host')),
]
const pseudoElementNames = [
    ...Object.keys(elements.functions).filter(name => name !== 'part'),
    ...Object.keys(elements.identifiers),
]

Object.values(elemental.functions).forEach(({ classes, elements }) => {
    classes.push(...pseudoClassNames)
    elements.push(...pseudoElementNames)
})
Object.values(elemental.identifiers).forEach(({ classes, elements }) => {
    classes.push(...pseudoClassNames)
    elements.push(...pseudoElementNames)
})

export {
    classes,
    elements,
    logical,
    userActions,
}
