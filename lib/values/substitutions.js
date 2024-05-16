
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
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random}
 */
const math = [
    'abs',
    'acos',
    'asin',
    'atan',
    'atan2',
    'calc',
    'calc-mix',
    'clamp',
    'cos',
    'exp',
    'hypot',
    'log',
    'max',
    'min',
    'mod',
    'pow',
    'random',
    'rem',
    'round',
    'sign',
    'sin',
    'sqrt',
    'tan',
]

/**
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-sibling-count}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-sibling-index}
 */
const state = ['sibling-count', 'sibling-index']

/**
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-first-valid}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-mix}
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
    numeric: { math, state },
    whole,
}
