
import logical from './logical.js'
import properties from './definitions.js'

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#propdef-all}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7984}
 *
 * The canonical order is unspecified. Physical properties are still declared
 * last but they are not moved last (as specified for shorthands encompassing
 * longhands of different mapping logic), because this prevents serializing some
 * shorthands with the shortest value. Instead, logical properties are moved
 * before all other properties.
 */
const before = []
const all = []
Object.keys(properties).forEach(property => {
    if (property === '--*') {
        return
    }
    const { [property]: { initial, group } } = properties
    if (initial && property !== 'direction' && property !== 'unicode-bidi') {
        if (logical[group]?.[0].includes(property)) {
            before.push(property)
        } else {
            all.push(property)
        }
    }
})
all.unshift(...before)

/**
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-animation-range}
 */
const animationRange = [
    'animation-range-start',
    'animation-range-end',
]

/**
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-background-repeat}
 */
const backgroundRepeat = [
    'background-repeat-x',
    'background-repeat-y',
]

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
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-color}
 */
const borderColor = [
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
]

/**
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-image}
 */
const borderImage = [
    'border-image-source',
    'border-image-slice',
    'border-image-width',
    'border-image-outset',
    'border-image-repeat',
]

/**
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-style}
 */
const borderStyle = [
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
]

/**
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-width}
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
 * @see {@link https://drafts.csswg.org/css-masking-1/#propdef-mask-border}
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
 * @see {@link https://drafts.csswg.org/css-gaps-1/#propdef-rule-color}
 */
const ruleColor = [
    'row-rule-color',
    'column-rule-color',
]

/**
 * @see {@link https://drafts.csswg.org/css-gaps-1/#propdef-rule-style}
 */
const ruleStyle = [
    'row-rule-style',
    'column-rule-style',
]

/**
 * @see {@link https://drafts.csswg.org/css-gaps-1/#propdef-rule-width}
 */
const ruleWidth = [
    'row-rule-width',
    'column-rule-width',
]

/**
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-timeline-trigger-range}
 */
const timelineTriggerRange = [
    'timeline-trigger-range-start',
    'timeline-trigger-range-end',
]

/**
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-timeline-trigger-exit-range}
 */
const timelineTriggerExitRange = [
    'timeline-trigger-exit-range-start',
    'timeline-trigger-exit-range-end',
]

/**
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-timeline-trigger}
 */
const timelineTrigger = [
    'timeline-trigger-name',
    'timeline-trigger-source',
    ...timelineTriggerRange,
    ...timelineTriggerExitRange,
]

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#concept-shorthands-preferred-order}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-value}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6894}
 *
 * Map([Shorthand, Longhands])
 * Longhands => [Declarable, ResetOnly]
 *
 * The shorthands are manually sorted in their preferred order, as required by
 * the procedure to serialize a CSS value.
 *
 * The longhands are manually sorted in their canonical order (defined in the
 * shorthand definition table).
 */
export default new Map([
    ['all', [all]],
    ['font', [
        [
            'font-style',
            ...fontVariant,
            'font-weight',
            'font-width',
            'font-size',
            'line-height',
            'font-family',
        ],
        [
            'font-feature-settings',
            'font-kerning',
            'font-language-override',
            'font-optical-sizing',
            'font-size-adjust',
            'font-variation-settings',
        ],
    ]],
    ['border', [
        [
            ...borderWidth,
            ...borderStyle,
            ...borderColor,
        ],
        borderImage,
    ]],
    ['mask', [
        [
            'mask-image',
            'mask-position',
            'mask-size',
            'mask-repeat',
            'mask-origin',
            'mask-clip',
            'mask-composite',
            'mask-mode',
        ],
        maskBorder,
    ]],
    ['animation', [
        [
            'animation-duration',
            'animation-timing-function',
            'animation-delay',
            'animation-iteration-count',
            'animation-direction',
            'animation-fill-mode',
            'animation-play-state',
            'animation-name',
            'animation-timeline',
        ],
        [
            'animation-composition',
            ...animationRange,
            'animation-trigger',
        ],
    ]],
    ['background', [
        [
            'background-image',
            'background-position',
            'background-size',
            ...backgroundRepeat,
            'background-attachment',
            'background-origin',
            'background-clip',
            'background-color',
        ],
        ['background-blend-mode'],
    ]],
    ['corner', [[
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-right-radius',
        'border-bottom-left-radius',
        'corner-top-left-shape',
        'corner-top-right-shape',
        'corner-bottom-right-shape',
        'corner-bottom-left-shape',
    ]]],
    ['font-variant', [fontVariant]],
    ['border-block', [[
        ...borderBlockWidth,
        ...borderBlockStyle,
        ...borderBlockColor,
    ]]],
    ['border-inline', [[
        ...borderInlineWidth,
        ...borderInlineStyle,
        ...borderInlineColor,
    ]]],
    ['grid', [[
        ...gridTemplate,
        'grid-auto-flow',
        'grid-auto-rows',
        'grid-auto-columns',
    ]]],
    ['timeline-trigger', [timelineTrigger]],
    ['mask-border', [maskBorder]],
    ['rule', [[
        ...ruleWidth,
        ...ruleStyle,
        ...ruleColor,
    ]]],
    ['border-image', [borderImage]],
    ['box-shadow', [[
        'box-shadow-color',
        'box-shadow-offset',
        'box-shadow-blur',
        'box-shadow-spread',
        'box-shadow-position',
    ]]],
    ['offset', [[
        'offset-position',
        'offset-path',
        'offset-distance',
        'offset-rotate',
        'offset-anchor',
    ]]],
    ['transition', [[
        'transition-duration',
        'transition-timing-function',
        'transition-delay',
        'transition-behavior',
        'transition-property',
    ]]],
    /**
     * https://github.com/w3c/csswg-drafts/issues/9253
     *
    ['background-position', [[
        'background-position-inline',
        'background-position-block',
        'background-position-x',
        'background-position-y',
    ]]],
     */
    ['block-step', [[
        'block-step-size',
        'block-step-insert',
        'block-step-align',
        'block-step-round',
    ]]],
    ['border-clip', [[
        'border-top-clip',
        'border-right-clip',
        'border-bottom-clip',
        'border-left-clip',
    ]]],
    ['border-color', [borderColor]],
    ['border-radius', [[
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-right-radius',
        'border-bottom-left-radius',
    ]]],
    ['border-style', [borderStyle]],
    ['border-width', [borderWidth]],
    ['corner-block-end', [[
        'border-end-start-radius',
        'border-end-end-radius',
        'corner-end-start-shape',
        'corner-end-end-shape',
    ]]],
    ['corner-block-start', [[
        'border-start-start-radius',
        'border-start-end-radius',
        'corner-start-start-shape',
        'corner-start-end-shape',
    ]]],
    ['corner-bottom', [[
        'border-bottom-left-radius',
        'border-bottom-right-radius',
        'corner-bottom-left-shape',
        'corner-bottom-right-shape',
    ]]],
    ['corner-inline-end', [[
        'border-start-end-radius',
        'border-end-end-radius',
        'corner-start-end-shape',
        'corner-end-end-shape',
    ]]],
    ['corner-inline-start', [[
        'border-start-start-radius',
        'border-end-start-radius',
        'corner-start-start-shape',
        'corner-end-start-shape',
    ]]],
    ['corner-left', [[
        'border-top-left-radius',
        'border-bottom-left-radius',
        'corner-top-left-shape',
        'corner-bottom-left-shape',
    ]]],
    ['corner-right', [[
        'border-top-right-radius',
        'border-bottom-right-radius',
        'corner-top-right-shape',
        'corner-bottom-right-shape',
    ]]],
    ['corner-top', [[
        'border-top-left-radius',
        'border-top-right-radius',
        'corner-top-left-shape',
        'corner-top-right-shape',
    ]]],
    ['corner-shape', [[
        'corner-top-left-shape',
        'corner-top-right-shape',
        'corner-bottom-right-shape',
        'corner-bottom-left-shape',
    ]]],
    ['font-synthesis', [[
        'font-synthesis-weight',
        'font-synthesis-style',
        'font-synthesis-small-caps',
        'font-synthesis-position',
    ]]],
    ['grid-area', [[
        'grid-row-start',
        'grid-column-start',
        'grid-row-end',
        'grid-column-end',
    ]]],
    ['inset', [[
        'top',
        'right',
        'bottom',
        'left',
    ]]],
    ['margin', [[
        'margin-top',
        'margin-right',
        'margin-bottom',
        'margin-left',
    ]]],
    ['overflow-clip-margin', [[
        'overflow-clip-margin-top',
        'overflow-clip-margin-right',
        'overflow-clip-margin-bottom',
        'overflow-clip-margin-left',
    ]]],
    ['padding', [[
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
    ]]],
    ['scroll-margin', [[
        'scroll-margin-top',
        'scroll-margin-right',
        'scroll-margin-bottom',
        'scroll-margin-left',
    ]]],
    ['scroll-padding', [[
        'scroll-padding-top',
        'scroll-padding-right',
        'scroll-padding-bottom',
        'scroll-padding-left',
    ]]],
    ['text-decoration', [[
        'text-decoration-line',
        'text-decoration-thickness',
        'text-decoration-style',
        'text-decoration-color',
    ]]],
    ['text-decoration-skip', [[
        'text-decoration-skip-self',
        'text-decoration-skip-box',
        'text-decoration-skip-spaces',
        'text-decoration-skip-ink',
    ]]],
    ['border-block-end', [[
        'border-block-end-width',
        'border-block-end-style',
        'border-block-end-color',
    ]]],
    ['border-block-start', [[
        'border-block-start-width',
        'border-block-start-style',
        'border-block-start-color',
    ]]],
    ['border-bottom', [[
        'border-bottom-width',
        'border-bottom-style',
        'border-bottom-color',
    ]]],
    ['border-inline-end', [[
        'border-inline-end-width',
        'border-inline-end-style',
        'border-inline-end-color',
    ]]],
    ['border-inline-start', [[
        'border-inline-start-width',
        'border-inline-start-style',
        'border-inline-start-color',
    ]]],
    ['border-left', [[
        'border-left-width',
        'border-left-style',
        'border-left-color',
    ]]],
    ['border-right', [[
        'border-right-width',
        'border-right-style',
        'border-right-color',
    ]]],
    ['border-top', [[
        'border-top-width',
        'border-top-style',
        'border-top-color',
    ]]],
    ['caret', [[
        'caret-color',
        'caret-animation',
        'caret-shape',
    ]]],
    ['column-rule', [[
        'column-rule-width',
        'column-rule-style',
        'column-rule-color',
    ]]],
    ['columns', [[
        'column-width',
        'column-count',
        'column-height',
    ]]],
    ['flex', [[
        'flex-grow',
        'flex-shrink',
        'flex-basis',
    ]]],
    ['grid-template', [gridTemplate]],
    ['line-clamp', [[
        'max-lines',
        'block-ellipsis',
        'continue',
    ]]],
    ['list-style', [[
        'list-style-position',
        'list-style-image',
        'list-style-type',
    ]]],
    ['marker', [[
        'marker-start',
        'marker-mid',
        'marker-end',
    ]]],
    ['outline', [[
        'outline-width',
        'outline-style',
        'outline-color',
    ]]],
    ['row-rule', [[
        'row-rule-width',
        'row-rule-style',
        'row-rule-color',
    ]]],
    ['vertical-align', [[
        'baseline-source',
        'alignment-baseline',
        'baseline-shift',
    ]]],
    ['white-space', [[
        'white-space-collapse',
        'text-wrap-mode',
        'white-space-trim',
    ]]],
    ['-webkit-line-clamp', [[
        'max-lines',
        'block-ellipsis',
        'continue',
    ]]],
    ['animation-range', [animationRange]],
    ['background-repeat', [backgroundRepeat]],
    ['border-block-clip', [[
        'border-block-start-clip',
        'border-block-end-clip',
    ]]],
    ['border-block-color', [borderBlockColor]],
    ['border-block-end-radius', [[
        'border-end-start-radius',
        'border-end-end-radius',
    ]]],
    ['border-block-start-radius', [[
        'border-start-start-radius',
        'border-start-end-radius',
    ]]],
    ['border-block-style', [borderBlockStyle]],
    ['border-block-width', [borderBlockWidth]],
    ['border-bottom-radius', [[
        'border-bottom-left-radius',
        'border-bottom-right-radius',
    ]]],
    ['border-inline-clip', [[
        'border-inline-start-clip',
        'border-inline-end-clip',
    ]]],
    ['border-inline-color', [borderInlineColor]],
    ['border-inline-end-radius', [[
        'border-start-end-radius',
        'border-end-end-radius',
    ]]],
    ['border-inline-start-radius', [[
        'border-start-start-radius',
        'border-end-start-radius',
    ]]],
    ['border-inline-style', [borderInlineStyle]],
    ['border-inline-width', [borderInlineWidth]],
    ['border-left-radius', [[
        'border-top-left-radius',
        'border-bottom-left-radius',
    ]]],
    ['border-right-radius', [[
        'border-top-right-radius',
        'border-bottom-right-radius',
    ]]],
    ['border-top-radius', [[
        'border-top-left-radius',
        'border-top-right-radius',
    ]]],
    ['contain-intrinsic-size', [[
        'contain-intrinsic-width',
        'contain-intrinsic-height',
    ]]],
    ['container', [[
        'container-name',
        'container-type',
    ]]],
    ['corner-block-end-shape', [[
        'corner-end-start-shape',
        'corner-end-end-shape',
    ]]],
    ['corner-block-start-shape', [[
        'corner-start-start-shape',
        'corner-start-end-shape',
    ]]],
    ['corner-bottom-left', [[
        'border-bottom-left-radius',
        'corner-bottom-left-shape',
    ]]],
    ['corner-bottom-right', [[
        'border-bottom-right-radius',
        'corner-bottom-right-shape',
    ]]],
    ['corner-bottom-shape', [[
        'corner-bottom-left-shape',
        'corner-bottom-right-shape',
    ]]],
    ['corner-end-end', [[
        'border-end-end-radius',
        'corner-end-end-shape',
    ]]],
    ['corner-end-start', [[
        'border-end-start-radius',
        'corner-end-start-shape',
    ]]],
    ['corner-inline-end-shape', [[
        'corner-start-end-shape',
        'corner-end-end-shape',
    ]]],
    ['corner-inline-start-shape', [[
        'corner-start-start-shape',
        'corner-end-start-shape',
    ]]],
    ['corner-left-shape', [[
        'corner-top-left-shape',
        'corner-bottom-left-shape',
    ]]],
    ['corner-start-end', [[
        'border-start-end-radius',
        'corner-start-end-shape',
    ]]],
    ['corner-start-start', [[
        'border-start-start-radius',
        'corner-start-start-shape',
    ]]],
    ['corner-top-left', [[
        'border-top-left-radius',
        'corner-top-left-shape',
    ]]],
    ['corner-top-right', [[
        'border-top-right-radius',
        'corner-top-right-shape',
    ]]],
    ['corner-top-shape', [[
        'corner-top-left-shape',
        'corner-top-right-shape',
    ]]],
    ['corner-right-shape', [[
        'corner-top-right-shape',
        'corner-bottom-right-shape',
    ]]],
    ['cue', [[
        'cue-before',
        'cue-after',
    ]]],
    ['event-trigger', [[
        'event-trigger-name',
        'event-trigger-source',
    ]]],
    ['flex-flow', [[
        'flex-direction',
        'flex-wrap',
    ]]],
    ['gap', [[
        'row-gap',
        'column-gap',
    ]]],
    ['grid-column', [[
        'grid-column-start',
        'grid-column-end',
    ]]],
    ['grid-row', [[
        'grid-row-start',
        'grid-row-end',
    ]]],
    ['inset-block', [[
        'inset-block-start',
        'inset-block-end',
    ]]],
    ['inset-inline', [[
        'inset-inline-start',
        'inset-inline-end',
    ]]],
    ['interest-delay', [[
        'interest-delay-start',
        'interest-delay-end',
    ]]],
    ['margin-block', [[
        'margin-block-start',
        'margin-block-end',
    ]]],
    ['margin-inline', [[
        'margin-inline-start',
        'margin-inline-end',
    ]]],
    ['overflow', [[
        'overflow-x',
        'overflow-y',
    ]]],
    ['overflow-clip-margin-block', [[
        'overflow-clip-margin-block-start',
        'overflow-clip-margin-block-end',
    ]]],
    ['overflow-clip-margin-inline', [[
        'overflow-clip-margin-inline-start',
        'overflow-clip-margin-inline-end',
    ]]],
    ['overscroll-behavior', [[
        'overscroll-behavior-x',
        'overscroll-behavior-y',
    ]]],
    ['padding-block', [[
        'padding-block-start',
        'padding-block-end',
    ]]],
    ['padding-inline', [[
        'padding-inline-start',
        'padding-inline-end',
    ]]],
    ['pause', [[
        'pause-before',
        'pause-after',
    ]]],
    ['place-content', [[
        'align-content',
        'justify-content',
    ]]],
    ['place-items', [[
        'align-items',
        'justify-items',
    ]]],
    ['place-self', [[
        'align-self',
        'justify-self',
    ]]],
    ['pointer-timeline', [[
        'pointer-timeline-name',
        'pointer-timeline-axis',
    ]]],
    ['position-try', [[
        'position-try-order',
        'position-try-fallbacks',
    ]]],
    ['rest', [[
        'rest-before',
        'rest-after',
    ]]],
    ['rule-break', [[
        'row-rule-break',
        'column-rule-break',
    ]]],
    ['rule-color', [ruleColor]],
    ['rule-style', [ruleStyle]],
    ['rule-width', [ruleWidth]],
    ['rule-outset', [[
        'row-rule-outset',
        'column-rule-outset',
    ]]],
    ['scroll-margin-block', [[
        'scroll-margin-block-start',
        'scroll-margin-block-end',
    ]]],
    ['scroll-margin-inline', [[
        'scroll-margin-inline-start',
        'scroll-margin-inline-end',
    ]]],
    ['scroll-padding-block', [[
        'scroll-padding-block-start',
        'scroll-padding-block-end',
    ]]],
    ['scroll-padding-inline', [[
        'scroll-padding-inline-start',
        'scroll-padding-inline-end',
    ]]],
    ['scroll-timeline', [[
        'scroll-timeline-name',
        'scroll-timeline-axis',
    ]]],
    ['text-box', [[
        'text-box-trim',
        'text-box-edge',
    ]]],
    ['text-spacing', [[
        'text-spacing-trim',
        'text-autospace',
    ]]],
    ['text-wrap', [[
        'text-wrap-mode',
        'text-wrap-style',
    ]]],
    ['timeline-trigger-exit-range', [timelineTriggerExitRange]],
    ['timeline-trigger-range', [timelineTriggerRange]],
    ['view-timeline', [[
        'view-timeline-name',
        'view-timeline-axis',
        'view-timeline-inset',
    ]]],
    ['text-align', [[
        'text-align-all',
        'text-align-last',
    ]]],
    ['text-emphasis', [[
        'text-emphasis-style',
        'text-emphasis-color',
    ]]],
    ['-webkit-text-stroke', [[
        '-webkit-text-stroke-width',
        '-webkit-text-stroke-color',
    ]]],
    // Deprecated
    ['color-adjust', [['print-color-adjust']]],
    // Legacy
    ['glyph-orientation-vertical', [['text-orientation']]],
    ['page-break-after', [['break-after']]],
    ['page-break-before', [['break-before']]],
    ['page-break-inside', [['break-inside']]],
])
