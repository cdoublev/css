
/**
 * @param {SyntaxError} error
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]}
 *
 * It stops propagating an error from parsing a top-level query in parens, to
 * fallback with <general-enclosed>.
 */
function interceptQueryInParensError(error, node, parser) {
    const { context, input, location } = node
    if (context.trees.length === 1) {
        input.moveTo(location)
        return parser.parseCSSValue(input, '<general-enclosed>', context) ?? error
    }
    return error
}

module.exports = {
    '<media-in-parens>': interceptQueryInParensError,
    '<query-in-parens>': interceptQueryInParensError,
    '<scroll-state-in-parens>': interceptQueryInParensError,
    '<style-in-parens>': interceptQueryInParensError,
    '<supports-in-parens>': interceptQueryInParensError,
}
