
/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#at-ruledef-media}
 */
const media = {
    prelude: '<media-query-list>',
    qualified: 'style',
    rules: ['import', 'namespace'], // Black list
    value: '<stylesheet>',
}

module.exports = media
