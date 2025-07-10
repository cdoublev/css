/* eslint-disable sort-keys */

const properties = require('../properties/definitions.js')

/**
 * @see {@link https://drafts.csswg.org/css-env-1/#funcdef-env}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-attr}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-inherit}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random-item}
 * @see {@link https://drafts.csswg.org/css-variables-2/#funcdef-var}
 */
const arbitrary = [
    { definition: '<dashed-function>', element: true, name: '<dashed-ident>' },
    { definition: '<attr-args>', element: true, name: 'attr' },
    { definition: '<env-args>', name: 'env' },
    { definition: '<inherit-args>', cascade: true, name: 'inherit' },
    { definition: '<random-item-args>', element: true, name: 'random-item' },
    { definition: '<var-args>', cascade: true, name: 'var' },
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
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-calc-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-calc-mix}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-progress}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-sibling-count}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-sibling-index}
 */
const numeric = [
    { definition: '<abs()>', name: 'abs' },
    { definition: '<acos()>', name: 'acos' },
    { definition: '<asin()>', name: 'asin' },
    { definition: '<atan()>', name: 'atan' },
    { definition: '<atan2()>', name: 'atan2' },
    { definition: '<calc-interpolate()>', name: 'calc-interpolate', element: true },
    { definition: '<calc-mix()>', name: 'calc-mix' },
    { definition: '<calc()>', name: 'calc' },
    { definition: '<clamp()>', name: 'clamp' },
    { definition: '<cos()>', name: 'cos' },
    { definition: '<exp()>', name: 'exp' },
    { definition: '<hypot()>', name: 'hypot' },
    { definition: '<log()>', name: 'log' },
    { definition: '<max()>', name: 'max' },
    { definition: '<min()>', name: 'min' },
    { definition: '<mod()>', name: 'mod' },
    { definition: '<pow()>', name: 'pow' },
    { definition: '<progress()>', name: 'progress' },
    { definition: '<random()>', name: 'random', element: true },
    { definition: '<rem()>', name: 'rem' },
    { definition: '<round()>', name: 'round' },
    { definition: '<sibling-count()>', name: 'sibling-count', element: true },
    { definition: '<sibling-index()>', name: 'sibling-index', element: true },
    { definition: '<sign()>', name: 'sign' },
    { definition: '<sin()>', name: 'sin' },
    { definition: '<sqrt()>', name: 'sqrt' },
    { definition: '<tan()>', name: 'tan' },
]

/**
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-first-valid}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-toggle}
 */
const whole = [
    { definition: '<first-valid()>', name: 'first-valid' },
    { definition: '<interpolate()>', name: 'interpolate', element: true, pending: true },
    { definition: '<toggle()>', name: 'toggle', element: true, pending: true },
]

module.exports = {
    arbitrary,
    image,
    keywords,
    numeric,
    whole,
}
