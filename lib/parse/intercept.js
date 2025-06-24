
/**
 * @param {SyntaxError} error
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-selector-list}
 *
 * It stops propagating an error resulting from parsing an item of a forgiving
 * selector list, to serialize the list with the invalid selector.
 */
function interceptInvalidSelector(error, { context, input }) {
    if (!context.strict && context.forgiving) {
        input.moveToEnd()
        return input.data
    }
    return error
}

/**
 * @param {SyntaxError} error
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#typedef-supports-in-parens}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-query-in-parens}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-scroll-state-in-parens}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-style-in-parens}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-in-parens}
 *
 * It stops propagating an error resulting from parsing a query in parens, to
 * fallback with <general-enclosed>.
 */
function interceptQueryInParensError(error, { context, input, location }, parser) {
    input.moveTo(location)
    return parser.parseCSSValue(input, '<general-enclosed>', context, 'lazy') ?? error
}

module.exports = {
    '<complex-real-selector>': interceptInvalidSelector,
    '<media-in-parens>': interceptQueryInParensError,
    '<query-in-parens>': interceptQueryInParensError,
    '<scroll-state-in-parens>': interceptQueryInParensError,
    '<style-in-parens>': interceptQueryInParensError,
    '<supports-in-parens>': interceptQueryInParensError,
}
