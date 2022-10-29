
/**
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-grid-column-gap}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-grid-gap}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-grid-row-gap}
 *
 * Unprefixed legacy property name aliases.
 */
const aliases = [
    ['grid-column-gap', 'column-gap'],
    ['grid-gap', 'gap'],
    ['grid-row-gap', 'row-gap'],
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-property-mappings}
 *
 * A mapping property has the same value definition than the mapped property but
 * they do not mirror each other.
 */
const mappings = [
    ['box-align', 'align-items'],
    ['box-flex', 'flex-grow'],
    ['box-ordinal-group', 'order'],
    ['box-orient', 'flex-direction'],
    ['box-pack', 'justify-content'],
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-prefixed-aliases}
 *
 * A prefixed legacy property name alias is a legacy property name alias if the
 * user agent supports the unprefixed property, otherwise it is an alias of the
 * vendor prefixed (eg. `-moz-`) property name.
 *
 * It is assumed that all user agents supports the following properties.
 */
const prefixed = [
    'text-size-adjust',
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-simple-aliases}
 * @see {@link https://drafts.csswg.org/css-ui-4/#propdef--webkit-appearance}
 * @see {@link https://drafts.csswg.org/css-ui-4/#propdef--webkit-user-select}
 *
 * `-webkit-` prefixed legacy property names.
 */
const legacy = [
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

module.exports = {
    aliases: new Map([
        ...aliases,
        ...legacy.map(([alias, target = alias]) => [`-webkit-${alias}`, target]),
        ...prefixed.map(target => [`-webkit-${target}`, target]),
    ]),
    mappings: new Map(mappings.map(([mapped, target]) => [`-webkit-${mapped}`, target])),
}
