
const { enter } = require('../utils/context.js')

/**
 * @param {object} node
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#typedef-layer-name}
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#urange-syntax}
 * @see {@link https://drafts.csswg.org/css-values-5/#typedef-attr-name}
 * @see {@link https://drafts.csswg.org/css-values-5/#typedef-syntax}
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#typedef-pt-name-and-class-selector}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#mq-syntax}
 * @see {@link https://drafts.csswg.org/selectors-4/#white-space}
 *
 * It disables consuming a whitespace before parsing a component value.
 */
function disableWhiteSpace({ context, ...props }) {
    return { ...props, context: { ...context, separator: '' } }
}

/**
 * @param {object} node
 * @returns {object}
 */
function enterStyleRule(node) {
    const { context, ...props } = node
    return { context: enter(node, '@style'), ...props }
}

/**
 * @param {object} node
 * @returns {object}
 */
function setStrictParsing({ context, ...props }) {
    return { ...props, context: { ...context, strict: true } }
}

module.exports = {
    '<attr-matcher>': disableWhiteSpace,
    '<attr-name>': disableWhiteSpace,
    '<combinator>': disableWhiteSpace,
    '<complex-selector-unit>': disableWhiteSpace,
    '<compound-selector>': disableWhiteSpace,
    '<layer-name>': disableWhiteSpace,
    '<mf-comparison>': disableWhiteSpace,
    '<page-selector>': disableWhiteSpace,
    '<pt-name-and-class-selector>': disableWhiteSpace,
    '<style-feature>': enterStyleRule,
    '<supports-feature>': setStrictParsing,
    '<syntax-component>': disableWhiteSpace,
    '<urange>': disableWhiteSpace,
    '<wq-name>': disableWhiteSpace,
}
