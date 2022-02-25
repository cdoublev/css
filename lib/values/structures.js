
/**
 * The following productions are defined in `lib/parse/syntax.js`. They can not
 * be defined using the CSS value definition syntax and are assigned functions,
 * but they are not terminal values.
 */
const structures = [
    'any-value',
    'declaration',
    'declaration-list',
    'declaration-value',
    'forgiving-relative-selector-list',
    'forgiving-selector-list',
    'media-query-list',
    'rule-list',
    'style-block',
    'stylesheet',
]

module.exports = structures
