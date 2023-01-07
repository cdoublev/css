
/**
 * @see {@link https://compat.spec.whatwg.org/#css-media-queries-webkit-device-pixel-ratio}
 */
const webkitAliases = [
    ['device-pixel-ratio', 'resolution'],
]

module.exports = {
    aliases: new Map(webkitAliases.map(([alias, target = alias]) => [`-webkit-${alias}`, target])),
    mappings: new Map(),
}
