
import { consumeComponentValueList, parseGrammar } from './parser.js'
import { findContext } from '../utils/context.js'

/**
 * @param {SyntaxError} error
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-selector-list}
 *
 * It stops propagating an error resulting from parsing an item of a forgiving
 * selector list, to serialize the list with the invalid selector.
 */
function interceptInvalidSelector(error, node) {
    const { context, input } = node
    if (!context.strict && findContext(node, node => node.definition.type === 'forgiving')) {
        return consumeComponentValueList(input, ',', node)
    }
    return error
}

/**
 * @param {SyntaxError} error
 * @param {object} node
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
function interceptQueryInParensError(error, node) {
    return parseGrammar(node.input, '<general-enclosed>', node, 'lazy') ?? error
}

export default {
    '<complex-real-selector>': interceptInvalidSelector,
    '<media-in-parens>': interceptQueryInParensError,
    '<query-in-parens>': interceptQueryInParensError,
    '<scroll-state-in-parens>': interceptQueryInParensError,
    '<style-in-parens>': interceptQueryInParensError,
    '<supports-in-parens>': interceptQueryInParensError,
}
