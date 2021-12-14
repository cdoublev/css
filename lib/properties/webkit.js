
/**
 * @see https://compat.spec.whatwg.org/#css-simple-aliases
 * @see https://compat.spec.whatwg.org/#css-prefixed-aliases
 *
 * TODO: append to properties + copy/paste referenced property definition.
 */
const aliases = [
    'appearance', // TODO: report spec issue "`appearance` is still defined in CSS UI 4"
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
    'text-size-adjust', // Can be implemented with vendor prefix (eg. -moz-)
    'transform',
    'transform-origin',
    'transform-style',
    'transition',
    'transition-delay',
    'transition-duration',
    'transition-property',
    'transition-timing-function',
    'user-select', // TODO: report spec issue "`user-select` is missing in CSS compatibility"
]

/**
 * @see https://compat.spec.whatwg.org/#css-property-mappings
 * @see https://compat.spec.whatwg.org/#css-simple-aliases
 *
 * TODO: append to properties + copy/paste referenced property definition.
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

/**
 * @see https://compat.spec.whatwg.org/#css-keyword-mappings
 * @see https://compat.spec.whatwg.org/#css-image-type
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

module.exports = {
    aliases,
    propertyMap,
    typeMap,
}
