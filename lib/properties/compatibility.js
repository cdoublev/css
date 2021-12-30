
const legacy = {
    'grid-column-gap': 'column-gap',
    'grid-gap': 'gap',
    'grid-row-gap': 'row-gap',
}

/**
 * @see {@link https://compat.spec.whatwg.org/#css-simple-aliases}
 *
 * A legacy (aka. simple) alias is a `-webkit-` prefixed property aliased to the
 * corresponding property without this prefix. All vendors must support these
 * aliases.
 */
const simple = [
    'appearance', // TODO: report spec issue "`-webkit-appearance` should be listed in legacy name aliases in Compatibility"
    'align-content',
    'align-items',
    'align-self',
    'animation',
    'animation-delay',
    'animation-direction',
    'animation-duration',
    'animation-fill-mode',
    'animation-iteration-count',
    'animation-name',
    'animation-play-state',
    'animation-timing-function',
    'backface-visibility',
    'background-origin',
    'background-size',
    'border-bottom-left-radius',
    'border-bottom-right-radius',
    'border-radius',
    'border-top-left-radius',
    'border-top-right-radius',
    'box-shadow',
    'box-sizing',
    'filter',
    'flex',
    'flex-basis',
    'flex-direction',
    'flex-flow',
    'flex-grow',
    'flex-shrink',
    'flex-wrap',
    'justify-content',
    'mask',
    'mask-clip',
    'mask-composite',
    'mask-image',
    'mask-origin',
    'mask-position',
    'mask-repeat',
    'mask-size',
    'order',
    'perspective',
    'perspective-origin',
    'transform',
    'transform-origin',
    'transform-style',
    'transition',
    'transition-delay',
    'transition-duration',
    'transition-property',
    'transition-timing-function',
    // "Details of the aliasing mechanism [of the property below] is intentionally left up to the UA"
    'user-select',
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-prefixed-aliases}
 *
 * A prefixed alias is a simple alias that should be itself an alias of a vendor
 * prefixed (eg. `-moz-`) property if it does not implement the unprefixed
 * property.
 *
 * It is assumed that all user agents implement these unprefixed properties.
 */
const prefixed = [
    'text-size-adjust',
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-property-mappings}
 * @see {@link https://compat.spec.whatwg.org/#css-simple-aliases}
 *
 * A `-webkit-` prefixed property can be mapped to an unprefixed property whose
 * name does not correspond to the prefixed property name.
 */
const propertyMap = {
    'box-align': 'align-items',
    'box-flex': 'flex-grow',
    'box-ordinal-group': 'order',
    'box-orient': 'flex-direction',
    'box-pack': 'justify-content',
    // (Incorrectly?) listed as aliases instead of mapped properties
    'mask-box-image': 'mask-border',
    'mask-box-image-outset': 'mask-border-outset',
    'mask-box-image-repeat': 'mask-border-repeat',
    'mask-box-image-slice': 'mask-border-slice',
    'mask-box-image-source': 'mask-border-source',
    'mask-box-image-width': 'mask-border-width',
}

const aliases = new Map([
    ...Object.entries(legacy).map(([alias, target]) => [alias, target]),
    ...simple.map(target => [`-webkit-${target}`, target]),
    ...prefixed.map(target => [`-webkit-${target}`, target]),
    ...Object.entries(propertyMap).map(([alias, target]) => [`-webkit-${alias}`, target]),
])

/**
 * @see {@link https://compat.spec.whatwg.org/#css-keyword-mappings}
 * @see {@link https://compat.spec.whatwg.org/#css-image-type}
 *
 * TODO: append to type definition values.
 */
const typeMap = [
    'box',
    'flex',
    'inline-box',
    'inline-flex',
    'linear-gradient()',
    'radial-gradient()',
    'repeating-linear-gradient()',
    'repeating-radial-gradient()',
    // Missing in CSS compatibility (defined in CSS Overflow 3)
    'discard',
]

module.exports = { aliases }
