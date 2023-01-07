
/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-feature-values}
 */
const fontFeatureValues = {
    prelude: '<family-name>#',
    rules: {
        'font-feature-value-type': {
            names: [
                '@annotation',
                '@character-variant',
                '@historical-forms',
                '@ornaments',
                '@styleset',
                '@stylistic',
                '@swash',
            ],
            value: '<declaration-list>',
        },
    },
    value: '<declaration-list>',
}

module.exports = fontFeatureValues
