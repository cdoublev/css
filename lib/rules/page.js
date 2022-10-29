
/**
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 */
const page = {
    prelude: '<page-selector-list>?',
    properties: require('../properties/page.js'),
    rules: { margin: require('./page-margin.js') },
    value: '<declaration-list>',
}

module.exports = page
