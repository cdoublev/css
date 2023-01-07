
/**
 * @param {Parser} parser
 * @see {@link https://drafts.csswg.org/css-fonts-4/#font-face-src-parsing}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-selector-list}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list}
 */
function enableForgiving({ tree }) {
    tree.forgiving = true
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @param {string} event
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#urange-syntax}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#mq-syntax}
 * @see {@link https://drafts.csswg.org/selectors-4/#white-space}
 *
 * It disables consuming a whitespace before parsing a node and its child nodes.
 */
function disableWhitespace({ tree }, { state }, event) {
    if (event === 'ENTER') {
        state.prevSeparator = tree.separator
        tree.separator = ''
    } else {
        tree.separator = state.prevSeparator
    }
}

module.exports = {
    'attr-matcher': disableWhitespace,
    'combinator': disableWhitespace,
    'complex-selector-unit': disableWhitespace,
    'compound-selector': disableWhitespace,
    'font-src-list': enableForgiving,
    'forgiving-selector-list': enableForgiving,
    'media-query-list': enableForgiving,
    'mf-comparison': disableWhitespace,
    'page-selector': disableWhitespace,
    'urange': disableWhitespace,
    'wq-name': disableWhitespace,
}
