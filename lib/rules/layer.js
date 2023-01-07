
/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#at-ruledef-layer}
 */
const layer = [
    {
        prelude: '<layer-name>?',
        rules: ['import', 'namespace'], // Black list
        type: 'layer',
        value: '<stylesheet>',
    },
    {
        prelude: '<layer-name>#',
        type: 'layer',
    },
]

module.exports = layer
