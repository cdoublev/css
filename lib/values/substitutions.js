
const properties = require('../properties/definitions.js')

/**
 * @see {@link https://drafts.csswg.org/css-env-1/#funcdef-env}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-attr}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random-item}
 * @see {@link https://drafts.csswg.org/css-variables-2/#funcdef-var}
 */
const arbitrary = [
    'attr()',
    'env()',
    'random-item()',
    'var()',
]

/**
 * @see {@link https://drafts.css-houdini.org/css-paint-api-1/#funcdef-paint}
 */
const image = ['paint()']

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#defaulting-keywords}
 */
const keywords = properties.all.value.split(' | ')

/**
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-toggle}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-mix}
 */
const topLevel = [
    'mix()',
    'toggle()',
]

/**
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random}
 */
const numeric = [
    'abs()',
    'acos()',
    'asin()',
    'atan()',
    'atan2()',
    'calc()',
    'clamp()',
    'cos()',
    'exp()',
    'hypot()',
    'log()',
    'max()',
    'min()',
    'mod()',
    'pow()',
    'rem()',
    'round()',
    'sign()',
    'sin()',
    'sqrt()',
    'tan()',
]

module.exports = {
    arbitrary,
    image,
    keywords,
    numeric,
    topLevel,
}
