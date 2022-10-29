
/**
 * @see {@link https://compat.spec.whatwg.org/#css-media-queries}
 *
 * `-webkit-` prefixed legacy descriptor names.
 */
const aliases = [
    'device-pixel-ratio',
    'transform-3d',
]

module.exports = {
    aliases: new Map(aliases.map(target => [`-webkit-${target}`, target])),
    mappings: new Map(),
}
