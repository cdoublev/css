
/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-supports}
 */
const supports = {
    prelude: '<supports-condition>',
    properties: require('../properties/names.js'),
    qualified: 'style',
    rules: ['import', 'namespace'], // Black list
    value: '<stylesheet>',
}

module.exports = supports
