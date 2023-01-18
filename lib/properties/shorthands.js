
const logical = require('./logical.js')
const properties = require('./definitions.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#propdef-all}
 */
const physical = []
const all = []
Object.keys(properties).forEach(property => {
    const { [property]: { initial, group } } = properties
    if (initial && property !== 'direction' && property !== 'unicode-bidi') {
        if (logical[group]?.[1].includes(property)) {
            physical.push(property)
        } else {
            all.push(property)
        }
    }
})
all.push(...physical)

/**
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-block-color}
 */
const borderBlockColor = [
    'border-block-start-color',
    'border-block-end-color',
]

/**
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-block-style}
 */
const borderBlockStyle = [
    'border-block-start-style',
    'border-block-end-style',
]

/**
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-block-width}
 */
const borderBlockWidth = [
    'border-block-start-width',
    'border-block-end-width',
]

/**
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-inline-color}
 */
const borderInlineColor = [
    'border-inline-start-color',
    'border-inline-end-color',
]

/**
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-inline-style}
 */
const borderInlineStyle = [
    'border-inline-start-style',
    'border-inline-end-style',
]

/**
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-inline-width}
 */
const borderInlineWidth = [
    'border-inline-start-width',
    'border-inline-end-width',
]

/**
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-color}
 */
const borderColor = [
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
]

/**
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-image}
 */
const borderImage = [
    'border-image-source',
    'border-image-slice',
    'border-image-width',
    'border-image-outset',
    'border-image-repeat',
]

/**
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
 */
const borderRadius = [
    'border-top-left-radius',
    'border-top-right-radius',
    'border-bottom-right-radius',
    'border-bottom-left-radius',
]

/**
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-style}
 */
const borderStyle = [
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
]

/**
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-width}
 */
const borderWidth = [
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
]

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-variant}
 */
const fontVariant = [
    'font-variant-ligatures',
    'font-variant-caps',
    'font-variant-alternates',
    'font-variant-numeric',
    'font-variant-east-asian',
    'font-variant-position',
    'font-variant-emoji',
]

/**
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-template}
 */
const gridTemplate = [
    'grid-template-rows',
    'grid-template-columns',
    'grid-template-areas',
]

/**
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask-border}
 */
const maskBorder = [
    'mask-border-source',
    'mask-border-slice',
    'mask-border-width',
    'mask-border-outset',
    'mask-border-repeat',
    'mask-border-mode',
]

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#reset-only-sub-property}
 */
const resetOnly = {
    border: borderImage,
    font: [
        'font-feature-settings',
        'font-kerning',
        'font-language-override',
        'font-optical-sizing',
        'font-palette',
        'font-size-adjust',
        'font-variation-settings',
    ],
    mask: maskBorder,
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#concept-shorthands-preferred-order}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-value}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6894}
 *
 * The shorthands are manually sorted in their preferred order, as required by
 * the procedure to serialize a CSS value.
 *
 * The longhands are manually sorted in their canonical order (defined in the
 * shorthand definition table).
 */
const shorthands = new Map([
    ['all', all],
    ['font', [
        'font-style',
        ...fontVariant,
        'font-weight',
        'font-stretch',
        'font-size',
        'line-height',
        'font-family',
        ...resetOnly.font,
    ]],
    ['border', [
        ...borderWidth,
        ...borderStyle,
        ...borderColor,
        ...resetOnly.border,
    ]],
    ['animation', [
        'animation-duration',
        'animation-timing-function',
        'animation-delay',
        'animation-iteration-count',
        'animation-direction',
        'animation-fill-mode',
        'animation-play-state',
        'animation-name',
        'animation-timeline',
    ]],
    ['mask', [
        'mask-image',
        'mask-position',
        'mask-size',
        'mask-repeat',
        'mask-origin',
        'mask-clip',
        'mask-composite',
        'mask-mode',
        ...resetOnly.mask,
    ]],
    ['background', [
        'background-image',
        'background-position',
        'background-size',
        'background-repeat',
        'background-attachment',
        'background-origin',
        'background-clip',
        'background-color',
    ]],
    ['font-variant', fontVariant],
    ['border-block', [
        ...borderBlockWidth,
        ...borderBlockStyle,
        ...borderBlockColor,
    ]],
    ['border-inline', [
        ...borderInlineWidth,
        ...borderInlineStyle,
        ...borderInlineColor,
    ]],
    ['grid', [
        ...gridTemplate,
        'grid-auto-flow',
        'grid-auto-rows',
        'grid-auto-columns',
    ]],
    ['mask-border', maskBorder],
    ['border-image', borderImage],
    ['corners', [
        'corner-shape',
        ...borderRadius,
    ]],
    ['offset', [
        'offset-position',
        'offset-path',
        'offset-distance',
        'offset-rotate',
        'offset-anchor',
    ]],
    ['text-decoration-skip', [
        'text-decoration-skip-self',
        'text-decoration-skip-box',
        'text-decoration-skip-inset',
        'text-decoration-skip-spaces',
        'text-decoration-skip-ink',
    ]],
    /**
     * TODO: support new grammars from CSS Background 4
     *
    ['background-position', [
        'background-position-inline',
        'background-position-block',
        'background-position-x',
        'background-position-y',
    ]],
     */
    ['block-step', [
        'block-step-size',
        'block-step-insert',
        'block-step-align',
        'block-step-round',
    ]],
    /**
     * TODO: support new grammars from CSS Background 4
     *
    ['border-clip', [
        'border-clip-top',
        'border-clip-right',
        'border-clip-bottom',
        'border-clip-left',
    ]],
     */
    ['border-color', borderColor],
    ['border-radius', borderRadius],
    ['border-style', borderStyle],
    ['border-width', borderWidth],
    ['grid-area', [
        'grid-row-start',
        'grid-column-start',
        'grid-row-end',
        'grid-column-end',
    ]],
    ['inset', [
        'top',
        'right',
        'bottom',
        'left',
    ]],
    ['margin', [
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
    ]],
    ['overflow-clip-margin', [
        'overflow-clip-margin-top',
        'overflow-clip-margin-right',
        'overflow-clip-margin-bottom',
        'overflow-clip-margin-left',
    ]],
    ['padding', [
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
    ]],
    ['scroll-margin', [
        'scroll-margin-top',
        'scroll-margin-right',
        'scroll-margin-bottom',
        'scroll-margin-left',
    ]],
    ['scroll-padding', [
        'scroll-padding-top',
        'scroll-padding-right',
        'scroll-padding-bottom',
        'scroll-padding-left',
    ]],
    ['text-decoration', [
        'text-decoration-line',
        'text-decoration-thickness',
        'text-decoration-style',
        'text-decoration-color',
    ]],
    ['transition', [
        'transition-duration',
        'transition-timing-function',
        'transition-delay',
        'transition-property',
    ]],
    ['border-block-end', [
        'border-block-end-width',
        'border-block-end-style',
        'border-block-end-color',
    ]],
    ['border-block-start', [
        'border-block-start-width',
        'border-block-start-style',
        'border-block-start-color',
    ]],
    ['border-inline-end', [
        'border-inline-end-width',
        'border-inline-end-style',
        'border-inline-end-color',
    ]],
    ['border-inline-start', [
        'border-inline-start-width',
        'border-inline-start-style',
        'border-inline-start-color',
    ]],
    ['border-bottom', [
        'border-bottom-width',
        'border-bottom-style',
        'border-bottom-color',
    ]],
    ['border-left', [
        'border-left-width',
        'border-left-style',
        'border-left-color',
    ]],
    ['border-right', [
        'border-right-width',
        'border-right-style',
        'border-right-color',
    ]],
    ['border-top', [
        'border-top-width',
        'border-top-style',
        'border-top-color',
    ]],
    ['column-rule', [
        'column-rule-width',
        'column-rule-style',
        'column-rule-color',
    ]],
    ['font-synthesis', [
        'font-synthesis-weight',
        'font-synthesis-style',
        'font-synthesis-small-caps',
    ]],
    ['flex', [
        'flex-grow',
        'flex-shrink',
        'flex-basis',
    ]],
    ['grid-template', gridTemplate],
    ['line-clamp', [
        'max-lines',
        'block-ellipsis',
        'continue',
    ]],
    ['list-style', [
        'list-style-position',
        'list-style-image',
        'list-style-type',
    ]],
    ['marker', [
        'marker-start',
        'marker-mid',
        'marker-end',
    ]],
    ['outline', [
        'outline-width',
        'outline-style',
        'outline-color',
    ]],
    ['vertical-align', [
        'baseline-source',
        'alignment-baseline',
        'baseline-shift',
    ]],
    ['white-space', [
        'text-space-collapse',
        'text-wrap',
        'text-space-trim',
    ]],
    ['-webkit-line-clamp', [
        'max-lines',
        'block-ellipsis',
        'continue',
    ]],
    /**
     * TODO: support new grammars from Scroll Animations 1 (to be moved in CSS Animations 2)
     *
    ['animation-delay', [
        'animation-delay-start',
        'animation-delay-end',
    ]],
    ['animation-range', [
        'animation-delay-start',
        'animation-delay-end',
    ]],
    */
    ['border-block-color', borderBlockColor],
    ['border-block-style', borderBlockStyle],
    ['border-block-width', borderBlockWidth],
    ['border-inline-color', borderInlineColor],
    ['border-inline-style', borderInlineStyle],
    ['border-inline-width', borderInlineWidth],
    ['caret', [
        'caret-color',
        'caret-shape',
    ]],
    ['columns', [
        'column-width',
        'column-count',
    ]],
    ['contain-intrinsic-size', [
        'contain-intrinsic-width',
        'contain-intrinsic-height',
    ]],
    ['container', [
        'container-name',
        'container-type',
    ]],
    ['cue', [
        'cue-before',
        'cue-after',
    ]],
    ['flex-flow', [
        'flex-direction',
        'flex-wrap',
    ]],
    ['gap', [
        'row-gap',
        'column-gap',
    ]],
    ['grid-column', [
        'grid-column-start',
        'grid-column-end',
    ]],
    ['grid-row', [
        'grid-row-start',
        'grid-row-end',
    ]],
    ['inset-block', [
        'inset-block-start',
        'inset-block-end',
    ]],
    ['inset-inline', [
        'inset-inline-start',
        'inset-inline-end',
    ]],
    ['margin-block', [
        'margin-block-start',
        'margin-block-end',
    ]],
    ['margin-inline', [
        'margin-inline-start',
        'margin-inline-end',
    ]],
    ['order', [
        'layout-order',
        'reading-order',
    ]],
    ['overflow', [
        'overflow-x',
        'overflow-y',
    ]],
    ['overflow-clip-margin-block', [
        'overflow-clip-margin-block-start',
        'overflow-clip-margin-block-end',
    ]],
    ['overflow-clip-margin-inline', [
        'overflow-clip-margin-inline-start',
        'overflow-clip-margin-inline-end',
    ]],
    ['overscroll-behavior', [
        'overscroll-behavior-x',
        'overscroll-behavior-y',
    ]],
    ['padding-block', [
        'padding-block-start',
        'padding-block-end',
    ]],
    ['padding-inline', [
        'padding-inline-start',
        'padding-inline-end',
    ]],
    ['pause', [
        'pause-before',
        'pause-after',
    ]],
    ['place-content', [
        'align-content',
        'justify-content',
    ]],
    ['place-items', [
        'align-items',
        'justify-items',
    ]],
    ['place-self', [
        'align-self',
        'justify-self',
    ]],
    ['rest', [
        'rest-before',
        'rest-after',
    ]],
    ['scroll-margin-block', [
        'scroll-margin-block-start',
        'scroll-margin-block-end',
    ]],
    ['scroll-margin-inline', [
        'scroll-margin-inline-start',
        'scroll-margin-inline-end',
    ]],
    ['scroll-padding-block', [
        'scroll-padding-block-start',
        'scroll-padding-block-end',
    ]],
    ['scroll-padding-inline', [
        'scroll-padding-inline-start',
        'scroll-padding-inline-end',
    ]],
    ['scroll-start', [
        'scroll-start-x',
        'scroll-start-y',
    ]],
    ['scroll-start-target', [
        'scroll-start-target-x',
        'scroll-start-target-y',
    ]],
    ['scroll-timeline', [
        'scroll-timeline-name',
        'scroll-timeline-axis',
    ]],
    ['view-timeline', [
        'view-timeline-name',
        'view-timeline-axis',
    ]],
    ['text-align', [
        'text-align-all',
        'text-align-last',
    ]],
    ['text-emphasis', [
        'text-emphasis-style',
        'text-emphasis-color',
    ]],
    ['-webkit-text-stroke', [
        '-webkit-text-stroke-width',
        '-webkit-text-stroke-color',
    ]],
    // Deprecated
    ['color-adjust', ['print-color-adjust']],
    // Legacy
    ['glyph-orientation-vertical', ['text-orientation']],
    ['page-break-after', ['break-after']],
    ['page-break-before', ['break-before']],
    ['page-break-inside', ['break-inside']],
])

module.exports = Object.assign(shorthands, { resetOnly })
