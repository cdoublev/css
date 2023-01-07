
/**
 * @see {@link https://compat.spec.whatwg.org/#css-gradient-fns}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef--webkit-image-set}
 */
const webkitAliases = [
    'linear-gradient()',
    'radial-gradient()',
    'image-set()',
    'repeating-linear-gradient()',
    'repeating-radial-gradient()',
]

/**
 * @see {@link https://drafts.csswg.org/css-images-3/#propdef-image-rendering}
 */
const mappings = [
    ['optimizespeed', 'crisp-edges'],
    ['optimizequality', 'smooth'],
]

/**
 * @see {@link https://compat.spec.whatwg.org/#css-keyword-mappings}
 */
const webkitMappings = [
    ['box', 'flex'],
    ['flex'],
    ['inline-box', 'inline-flex'],
    ['inline-flex'],
]

module.exports = {
    aliases: new Map(webkitAliases.map(target => [`-webkit-${target}`, target])),
    mappings: new Map([
        ...mappings.map(([mapped, target = mapped]) => [mapped, target]),
        ...webkitMappings.map(([mapped, target = mapped]) => [`-webkit-${mapped}`, target]),
    ]),
}
