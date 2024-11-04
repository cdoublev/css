
const properties = require('../properties/definitions.js')

/**
 * @see {@link https://drafts.csswg.org/css-env-1/#funcdef-env}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-attr}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random-item}
 * @see {@link https://drafts.csswg.org/css-variables-2/#funcdef-var}
 */
const arbitrary = [
    { name: 'attr', element: true },
    { name: 'env' },
    { name: 'random-item', element: true },
    { name: 'var', cascade: true },
]

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#cascade-dependent-keyword}
 * @see {@link https://drafts.csswg.org/css-values-4/#css-wide-keywords}
 */
const keywords = properties.all.value.split(' | ')

/**
 * @see {@link https://drafts.css-houdini.org/css-paint-api-1/#funcdef-paint}
 */
const image = ['paint']

/**
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-calc-mix}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-container-progress}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-media-progress}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-progress}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-sibling-count}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-sibling-index}
 */
const numeric = [
    { name: 'abs' },
    { name: 'acos' },
    { name: 'asin' },
    { name: 'atan' },
    { name: 'atan2' },
    { name: 'calc-mix', element: true },
    { name: 'calc' },
    { name: 'clamp' },
    { name: 'cos' },
    { name: 'exp' },
    { name: 'hypot' },
    { name: 'log' },
    { name: 'max' },
    { name: 'min' },
    { name: 'mod' },
    { name: 'pow' },
    { name: 'random', element: true },
    { name: 'rem' },
    { name: 'round' },
    { name: 'sign' },
    { name: 'sin' },
    { name: 'sqrt' },
    { name: 'tan' },
    { name: 'container-progress', element: true },
    { name: 'media-progress' },
    { name: 'progress' },
    { name: 'sibling-count', element: true },
    { name: 'sibling-index', element: true },
]

/**
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-mix}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-first-valid}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-toggle}
 */
const whole = [
    { name: 'first-valid' },
    { name: 'mix', element: true },
    { name: 'toggle', element: true },
]

module.exports = {
    arbitrary,
    image,
    keywords,
    numeric,
    whole,
}
