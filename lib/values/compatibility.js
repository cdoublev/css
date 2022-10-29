
/**
 * @see {@link https://compat.spec.whatwg.org/#css-gradient-fns}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef--webkit-image-set}
 */
const aliases = [
    'linear-gradient',
    'radial-gradient',
    'image-set()',
    'repeating-linear-gradient',
    'repeating-radial-gradient',
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-keyword-mappings}
 */
const mappings = [
    ['box', 'flex'],
    ['flex'],
    ['inline-box', 'inline-flex'],
    ['inline-flex'],
]

module.exports = {
    aliases: new Map(aliases.map(target => [`-webkit-${target}`, target])),
    mappings: new Map(mappings.map(([mapped, target = mapped]) => [`-webkit-${mapped}`, target])),
}
