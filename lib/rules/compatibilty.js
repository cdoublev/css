
/**
 * @see {@link https://compat.spec.whatwg.org/#css-at-rules}
 */
const aliases = [
    'keyframes',
]

module.exports = {
    aliases: new Map(aliases.map(target => [`-webkit-${target}`, target])),
    mappings: new Map(),
}
