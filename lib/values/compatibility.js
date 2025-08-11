
/**
 * @see {@link https://compat.spec.whatwg.org/#css-gradient-fns}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef--webkit-image-set}
 */
export const functions = {
    aliases: new Map([
        ['-webkit-image-set', 'image-set'],
        ['-webkit-linear-gradient', 'linear-gradient'],
        ['-webkit-radial-gradient', 'radial-gradient'],
        ['-webkit-repeating-linear-gradient', 'repeating-linear-gradient'],
        ['-webkit-repeating-radial-gradient', 'repeating-radial-gradient'],
    ]),
    mappings: new Map,
}

/**
 * @see {@link https://compat.spec.whatwg.org/#css-keyword-mappings}
 * @see {@link https://drafts.csswg.org/css-images-3/#propdef-image-rendering}
 * @see {@link https://drafts.csswg.org/css-overflow-3/#valdef-overflow-overlay}
 * @see {@link https://drafts.csswg.org/css-text-3/#valdef-text-justify-distribute}
 */
export const keywords = {
    'alignment-baseline': {
        aliases: new Map([
            ['text-after-edge', 'text-bottom'],
            ['text-before-edge', 'text-top'],
        ]),
    },
    'display': {
        mappings: new Map([
            ['-webkit-box', 'flex'],
            ['-webkit-flex', 'flex'],
            ['-webkit-inline-box', 'inline-flex'],
            ['-webkit-inline-flex', 'inline-flex'],
        ]),
    },
    'image-rendering': {
        mappings: new Map([
            ['optimizespeed', 'crisp-edges'],
            ['optimizequality', 'smooth'],
        ]),
    },
    'overflow': {
        aliases: new Map([
            ['overlay', 'auto'],
        ]),
    },
    'text-justify': {
        aliases: new Map([
            ['distribute', 'inter-character'],
        ]),
    },
}
