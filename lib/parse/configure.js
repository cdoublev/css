
/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#urange-syntax}
 * @see {@link https://drafts.csswg.org/selectors-4/#white-space}
 *
 * It disables consuming a whitespace before parsing a node and its child nodes.
 */
function disableWhitespace(parser, { state }, event) {
    if (event === 'ENTER') {
        state.prevSeparator = parser.separator
        parser.separator = ''
    } else {
        parser.separator = state.prevSeparator
    }
}

module.exports = {
    'attr-matcher': disableWhitespace,
    'combinator': disableWhitespace,
    'compound-selector': disableWhitespace,
    'page-selector': disableWhitespace,
    'urange': disableWhitespace,
    'wq-name': disableWhitespace,
}
