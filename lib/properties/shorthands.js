
/**
 * @see https://drafts.csswg.org/cssom/#concept-shorthands-preferred-order
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
    ['flex', [
        'flex-grow',
        'flex-shrink',
        'flex-basis',
    ]],
    ['outline', [
        'outline-color',
        'outline-style',
        'outline-width',
    ]],
])
