
/**
 * @see {@link https://drafts.csswg.org/selectors-4/#display-state-pseudos}
 */
const display = {
    'fullscreen': {},
    'modal': {},
    'open': {},
    'picture-in-picture': {},
    'popover-open': {},
}

/**
 * @see {@link https://drafts.csswg.org/css-gcpm-4/#page-selector-pseudo-classes}
 * @see {@link https://drafts.csswg.org/selectors-4/#child-index}
 * @see {@link https://drafts.csswg.org/selectors-4/#typed-child-index}
 * @see {@link https://drafts.csswg.org/selectors-5/#grid-structural-selectors}
 */
const indexed = {
    'first-child': {},
    'first-of-page': {},
    'first-of-type': {},
    'last-child': {},
    'last-of-page': {},
    'last-of-type': {},
    'nth-child()': { value: '<a-n-plus-b> [of <complex-real-selector-list>]?' },
    'nth-col()': { value: '<a-n-plus-b>' },
    'nth-last-child()': { value: '<a-n-plus-b> [of <complex-real-selector-list>]?' },
    'nth-last-col()': { value: '<a-n-plus-b>' },
    'nth-last-of-type()': { value: '<a-n-plus-b>' },
    'nth-of-page()': { value: '<a-n-plus-b>' },
    'nth-of-type()': { value: '<a-n-plus-b>' },
    'only-child': {},
    'only-of-type': {},
    'start-of-page': {},
}
const indexedNames = Object.keys(indexed)

/**
 * @see {@link https://drafts.csswg.org/css-forms-1/}
 * @see {@link https://drafts.csswg.org/selectors-4/#input-pseudos}
 * @see {@link https://drafts.csswg.org/selectors-5/#input-pseudos}
 *
 * Fully-styleable (tree-abiding) form pseudo-elements are located in the
 * tree-abiding group.
 */
const form = {
    classes: {
        'autofill': {},
        'blank': {},
        'checked': {},
        'default': {},
        'disabled': {},
        'enabled': {},
        'high-value': {},
        'in-range': {},
        'indeterminate': {},
        'invalid': {},
        'low-value': {},
        'optimal-value': {},
        'optional': {},
        'out-of-range': {},
        'placeholder-shown': {},
        'read-only': {},
        'read-write': {},
        'required': {},
        'unchecked': {},
        'user-invalid': {},
        'user-valid': {},
        'valid': {},
    },
    elements: {
        'clear-icon': {},
        'color-swatch': {},
        'field-component': {},
        'field-separator': {},
        'field-text': { elements: ['field-component', 'field-separator'] },
        'reveal-icon': {},
    },
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#linguistic-pseudos}
 */
const linguistic = {
    'dir()': { value: '<ident>' },
    'lang()': { value: '[<ident> | <string>]#' },
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#logical-combination}
 */
const logical = {
    'is()': { value: '<forgiving-selector-list>' },
    'not()': { value: '<complex-real-selector-list>' },
    'where()': { value: '<forgiving-selector-list>' },
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#location}
 * @see {@link https://drafts.csswg.org/selectors-5/#location}
 */
const navigation = {
    'any-link': {},
    'link': {},
    'local-link': {},
    'local-link()': { value: '<level>' },
    'target': {},
    'visited': {},
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#resource-pseudos}
 */
const resource = {
    'buffering': {},
    'muted': {},
    'paused': {},
    'playing': {},
    'seeking': {},
    'stalled': {},
    'volume-locked': {},
}

/**
 * @see {@link https://drafts.csswg.org/css-scroll-snap-2/#snapped}
 */
const snapped = {
    'snapped': {},
    'snapped-block': {},
    'snapped-inline': {},
    'snapped-x': {},
    'snapped-y': {},
}

/**
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host-context}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-host-function}
 * @see {@link https://drafts.csswg.org/selectors-4/#relational}
 * @see {@link https://drafts.csswg.org/selectors-4/#scope-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-4/#structural-pseudos}
 */
const structural = {
    ...indexed,
    'empty': {},
    'has()': { value: '<relative-selector-list>' },
    'host': {},
    'host()': { value: '<compound-selector>' },
    'host-context()': { value: '<compound-selector>' },
    'root': {},
    'scope': {},
}

/**
 * @see {@link https://drafts.csswg.org/selectors-5/#time-pseudos}
 */
const time = {
    'current': {},
    'current()': { value: '<compound-selector-list>' },
    'future': {},
    'past': {},
}

/**
 * @see {@link https://drafts.csswg.org/selectors-4/#useraction-pseudos}
 * @see {@link https://drafts.csswg.org/selectors-5/#useraction-pseudos}
 */
const userActions = {
    'active': {},
    'focus': {},
    'focus-visible': {},
    'focus-within': {},
    'hover': {},
    'interest-source': {},
    'interest-target': {},
}

/**
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#pseudo}}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#pseudo-classes-for-selective-vt}}
 */
const viewTransitions = {
    classes: {
        'active-view-transition': {},
        'active-view-transition-type()': { value: '<custom-ident>#' },
    },
    elements: {
        'view-transition': {
            classes: ['empty'],
        },
        'view-transition-group()': {
            classes: ['empty', ...indexedNames],
            value: '<pt-name-and-class-selector>',
        },
        'view-transition-group-children()': {
            classes: ['empty', ...indexedNames],
            value: '<pt-name-and-class-selector>',
        },
        'view-transition-image-pair()': {
            classes: ['empty', ...indexedNames],
            value: '<pt-name-and-class-selector>',
        },
        'view-transition-new()': {
            classes: indexedNames,
            value: '<pt-name-and-class-selector>',
        },
        'view-transition-old()': {
            classes: indexedNames,
            value: '<pt-name-and-class-selector>',
        },
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#element-backed}
 */
const elemental = {
    'details-content': {
        classes: [/* filled at the bottom of the file */],
        elements: [/* filled at the bottom of the file */],
    },
    'part()': {
        classes: [/* filled at the bottom of the file */],
        elements: [/* filled at the bottom of the file */],
        value: '<ident>+',
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#highlight-selectors}
 */
const highlight = {
    'grammar-error': {},
    'highlight()': { value: '<custom-ident>' },
    'search-text': { classes: ['current'] },
    'selection': {},
    'spelling-error': {},
    'target-text': {},
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
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-part}
 */
const treeAbiding = {
    ...elemental,
    ...viewTransitions.elements,
    'after': { classes: ['empty'], elements: ['marker'] },
    'backdrop': {},
    'before': { classes: ['empty'], elements: ['marker'] },
    'checkmark': {},
    'file-selector-button': {},
    'marker': { classes: indexedNames },
    'picker()': { value: '<form-control-identifier>+' },
    'picker-icon': {},
    'placeholder': {},
    'scroll-button()': { classes: ['disabled'], value: "'*' | <scroll-button-direction>" },
    'scroll-marker': {},
    'scroll-marker-group': {},
    'slider-fill': {},
    'slider-thumb': {},
    'slider-track': { elements: ['slider-fill'] },
    'step-control': { elements: ['step-down', 'step-up'] },
    'step-down': {},
    'step-up': {},
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
 * @see {@link https://drafts.csswg.org/css-image-animation-1/#selectordef-animated-image}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-target-after}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-target-before}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-target-current}
 * @see {@link https://drafts.csswg.org/selectors-4/#compat}
 * @see {@link https://drafts.csswg.org/selectors-4/#defined-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-5/#selectordef-state}
 * @see {@link https://drafts.csswg.org/selectors-5/#heading-pseudo}
 * @see {@link https://drafts.csswg.org/selectors-5/#heading-functional-pseudo}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-has-slotted}
 * @see {@link https://immersive-web.github.io/dom-overlays/#selectordef-xr-overlay}
 */
const classes = {
    ...display,
    ...form.classes,
    ...linguistic,
    ...logical,
    ...navigation,
    ...resource,
    ...snapped,
    ...structural,
    ...time,
    ...userActions,
    ...viewTransitions.classes,
    'animated-image': {},
    'defined': {},
    'has-slotted': {},
    'heading': {},
    'heading()': { value: '<level>#' },
    'state()': { value: '<ident>' },
    'target-after': {},
    'target-before': {},
    'target-current': {},
    'xr-overlay': {},
}

/**
 * @see {@link https://drafts.csswg.org/css-multicol-2/#selectordef-column}
 * @see {@link https://drafts.csswg.org/css-overflow-5/#selectordef-nth-fragment}
 * @see {@link https://drafts.csswg.org/css-shadow-1/#selectordef-slotted}
 */
const elements = {
    ...form.elements,
    ...highlight,
    ...treeAbiding,
    ...typographic,
    'column': { elements: ['scroll-marker'] },
    'nth-fragment()': { value: '<a-n-plus-b>' },
    'slotted()': {
        elements: Object.keys(treeAbiding),
        value: '<compound-selector>',
    },
}

const pseudoClassNames = Object.keys(classes).filter(name => !structural[name])
const pseudoElementNames = Object.keys(elements).filter(name => name !== 'part()')

Object.values(elemental).forEach(({ classes, elements }) => {
    classes.push(...pseudoClassNames)
    elements.push(...pseudoElementNames)
})

const aliases = {
    classes: new Map([
        ['-webkit-autofill', 'autofill'],
    ]),
}

export {
    aliases,
    classes,
    elements,
    logical,
    userActions,
}
