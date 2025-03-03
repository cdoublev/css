
/**
 * @see {@link https://compat.spec.whatwg.org/#css-at-rules}
 */
const aliases = [
    ['@-webkit-keyframes', '@keyframes'],
]

module.exports = {
    aliases: new Map(aliases),
    mappings: new Map,
}
