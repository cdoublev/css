
/**
 * @see {@link https://drafts.csswg.org/css-contain-3/#at-ruledef-container}
 */
const container = {
    prelude: '<container-condition>',
    rules: ['import', 'namespace'], // Black list
    value: '<stylesheet>',
}

module.exports = container
