
const properties = require('../properties/definitions.js')

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

const numeric = {
    math,
    state: ['sibling-count', 'sibling-index'],
}

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#defaulting-keywords}
 * @see {@link https://drafts.csswg.org/css-env-1/#funcdef-env}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-mix}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-attr}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random-item}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-toggle}
 * @see {@link https://drafts.csswg.org/css-variables-2/#funcdef-var}
 */
const property = {
    arbitrary: [
        'attr',
        'env',
        'random-item',
        'var',
    ],
    keywords: properties.all.value.split(' | '),
    whole: [
        'first-valid',
        'mix',
        'toggle',
    ],
}

module.exports = {
    image,
    numeric,
    property,
}
