
/**
 * @see {@link https://drafts.csswg.org/cssom/#concept-shorthands-preferred-order}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6894}
 *
 * The longhands are ordered in their canonical order defined in the property
 * definition table.
 */
module.exports = new Map([
    ['border', [
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
        'border-top-style',
        'border-right-style',
        'border-bottom-style',
        'border-left-style',
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
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
    ['font', [
        'font-style',
        'font-variant',
        'font-weight',
        'font-stretch',
        'font-size',
        'line-height',
        'font-family',
        'font-variant',
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
    ]],
    ['border-block', [
        'border-block-start-width',
        'border-block-end-width',
        'border-block-start-style',
        'border-block-end-style',
        'border-block-start-color',
        'border-block-end-color',
    ]],
    ['border-inline', [
        'border-inline-start-width',
        'border-inline-end-width',
        'border-inline-start-style',
        'border-inline-end-style',
        'border-inline-start-color',
        'border-inline-end-color',
    ]],
    ['grid', [
        'grid-template-rows',
        'grid-template-columns',
        'grid-template-areas',
        'grid-auto-rows',
        'grid-auto-columns',
        'grid-auto-flow',
    ]],
    ['mask-border', [
        'mask-border-source',
        'mask-border-slice',
        'mask-border-width',
        'mask-border-outset',
        'mask-border-repeat',
        'mask-border-mode',
    ]],
    ['border-image', [
        'border-image-source',
        'border-image-slice',
        'border-image-width',
        'border-image-outset',
        'border-image-repeat',
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
     * TODO: support new `background-position` grammar (as shorthand) from Background 4
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
    ['border-color', [
        'border-top-color',
        'border-right-color',
        'border-bottom-color',
        'border-left-color',
    ]],
    ['border-radius', [
        'border-top-left-radius',
        'border-top-right-radius',
        'border-bottom-right-radius',
        'border-bottom-left-radius',
    ]],
    ['border-style', [
        'border-top-style',
        'border-right-style',
        'border-bottom-style',
        'border-left-style',
    ]],
    ['border-width', [
        'border-top-width',
        'border-right-width',
        'border-bottom-width',
        'border-left-width',
    ]],
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
    ['padding', [
        'padding-top',
        'padding-right',
        'padding-bottom',
        'padding-left',
    ]],
    ['text-decoration', [
        'text-decoration-line',
        'text-decoration-thickness',
        'text-decoration-style',
        'text-decoration-color',
    ]],
    ['transition', [
        'transition-property',
        'transition-duration',
        'transition-timing-function',
        'transition-delay',
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
    ['flex', [
        'flex-grow',
        'flex-shrink',
        'flex-basis',
    ]],
    ['grid-template', [
        'grid-template-rows',
        'grid-template-columns',
        'grid-template-areas',
    ]],
    ['line-clamp', [
        'max-lines',
        'block-ellipsis',
        'continue',
    ]],
    ['list-style', [
        'list-style-type',
        'list-style-image',
        'list-style-position',
    ]],
    ['marker', [
        'marker-start',
        'marker-mid',
        'marker-end',
    ]],
    ['outline', [
        'outline-color',
        'outline-style',
        'outline-width',
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
    ['border-block-color', [
        'border-block-start-color',
        'border-block-end-color',
    ]],
    ['border-block-style', [
        'border-block-start-style',
        'border-block-end-style',
    ]],
    ['border-block-width', [
        'border-block-start-width',
        'border-block-end-width',
    ]],
    ['border-inline-color', [
        'border-inline-start-color',
        'border-inline-end-color',
    ]],
    ['border-inline-style', [
        'border-inline-start-style',
        'border-inline-end-style',
    ]],
    ['border-inline-width', [
        'border-inline-start-width',
        'border-inline-end-width',
    ]],
    ['caret', [
        'caret-color',
        'caret-shape',
    ]],
    ['columns', [
        'columns-width',
        'columns-count',
    ]],
    ['contain-intrinsic-size', [
        'contain-intrinsic-width',
        'contain-intrinsic-height',
    ]],
    ['container', [
        'container-type',
        'container-name',
    ]],
    ['corners', [
        'corner-shape',
        'border-radius',
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
    ['overflow', [
        'overflow-x',
        'overflow-y',
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
])
