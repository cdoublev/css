
/**
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-grid-column-gap}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-grid-gap}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-grid-row-gap}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#font-stretch}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-word-wrap}
 */
const simpleAliases = [
    ['grid-column-gap', 'column-gap'],
    ['grid-gap', 'gap'],
    ['grid-row-gap', 'row-gap'],
    ['font-stretch', 'font-width'],
    ['word-wrap', 'overflow-wrap'],
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-simple-aliases}
 * @see {@link https://drafts.csswg.org/css-ui-4/#propdef--webkit-appearance}
 * @see {@link https://drafts.csswg.org/css-ui-4/#propdef--webkit-user-select}
 */
const webkitAliases = [
    ['align-content'],
    ['align-items'],
    ['align-self'],
    ['animation'],
    ['animation-delay'],
    ['animation-direction'],
    ['animation-duration'],
    ['animation-fill-mode'],
    ['animation-iteration-count'],
    ['animation-name'],
    ['animation-play-state'],
    ['animation-timing-function'],
    ['appearance'],
    ['backface-visibility'],
    ['background-clip'],
    ['background-origin'],
    ['background-size'],
    ['border-bottom-left-radius'],
    ['border-bottom-right-radius'],
    ['border-radius'],
    ['border-top-left-radius'],
    ['border-top-right-radius'],
    ['box-shadow'],
    ['box-sizing'],
    ['filter'],
    ['flex'],
    ['flex-basis'],
    ['flex-direction'],
    ['flex-flow'],
    ['flex-grow'],
    ['flex-shrink'],
    ['flex-wrap'],
    ['justify-content'],
    ['mask'],
    ['mask-box-image', 'mask-border'],
    ['mask-box-image-outset', 'mask-border-outset'],
    ['mask-box-image-repeat', 'mask-border-repeat'],
    ['mask-box-image-slice', 'mask-border-slice'],
    ['mask-box-image-source', 'mask-border-source'],
    ['mask-box-image-width', 'mask-border-width'],
    ['mask-clip'],
    ['mask-composite'],
    ['mask-image'],
    ['mask-origin'],
    ['mask-position'],
    ['mask-repeat'],
    ['mask-size'],
    ['order'],
    ['perspective'],
    ['perspective-origin'],
    ['transform'],
    ['transform-origin'],
    ['transform-style'],
    ['transition'],
    ['transition-delay'],
    ['transition-duration'],
    ['transition-property'],
    ['transition-timing-function'],
    ['user-select'],
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-prefixed-aliases}
 */
const prefixedAliases = [
    'text-size-adjust',
]

export const aliases = new Map([
    ...simpleAliases,
    ...webkitAliases.map(([alias, target = alias]) => [`-webkit-${alias}`, target]),
    ...prefixedAliases.map(target => [`-webkit-${target}`, target]),
])

/**
 * @see {@link https://compat.spec.whatwg.org/#css-property-mappings}
 */
const webkitMappings = [
    ['box-align', 'align-items'],
    ['box-flex', 'flex-grow'],
    ['box-ordinal-group', 'order'],
    ['box-orient', 'flex-direction'],
    ['box-pack', 'justify-content'],
]

export const mappings = new Map(webkitMappings.map(([mapped, target]) => [`-webkit-${mapped}`, target]))
