
/**
 * @see {@link https://compat.spec.whatwg.org/#css-gradient-fns}
 * @see {@link https://compat.spec.whatwg.org/#css-keyword-mappings}
 * @see {@link https://drafts.csswg.org/css-images-3/#propdef-image-rendering}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef--webkit-image-set}
 * @see {@link https://drafts.csswg.org/css-overflow-3/#valdef-overflow-overlay}
 * @see {@link https://drafts.csswg.org/css-text-3/#valdef-text-justify-distribute}
 */
const values = {
    '*': new Map([
        ['image-set()', { aliases: ['-webkit-image-set()'] }],
        ['linear-gradient()', { aliases: ['-webkit-linear-gradient()'] }],
        ['radial-gradient()', { aliases: ['-webkit-radial-gradient()'] }],
        ['repeating-linear-gradient()', { aliases: ['-webkit-repeating-linear-gradient()'] }],
        ['repeating-radial-gradient()', { aliases: ['-webkit-repeating-radial-gradient()'] }],
    ]),
    'alignment-baseline': new Map([
        ['text-bottom', { aliases: ['text-after-edge'] }],
        ['text-top', { aliases: ['text-before-edge'] }],
    ]),
    'display': new Map([
        ['flex', { mappings: ['-webkit-box', '-webkit-flex'] }],
        ['inline-flex', { mappings: ['-webkit-inline-box', '-webkit-inline-flex'] }],
    ]),
    'image-rendering': new Map([
        ['crisp-edges', { mappings: ['optimizespeed'] }],
        ['smooth', { mappings: ['optimizequality'] }],
    ]),
    'overflow': new Map([
        ['auto', { aliases: ['overlay'] }],
    ]),
    'text-justify': new Map([
        ['inter-character', { aliases: ['distribute'] }],
    ]),
}

module.exports = values
