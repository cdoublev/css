
/**
 * @see {@link https://compat.spec.whatwg.org/#css-media-queries-webkit-device-pixel-ratio}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#font-face-font-stretch}
 */
export default {
    '@font-face': {
        aliases: new Map([['font-stretch', 'font-width']]),
    },
    '@media': {
        aliases: new Map([['-webkit-device-pixel-ratio', 'resolution']]),
    },
}
