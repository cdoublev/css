
const { consumeRulesList, normalizeIntoTokens } = require('../parse/syntax.js')

/**
 * @param {string|Blob} input
 * @param {string} [location]
 * @return {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 */
function parseStyleSheet(input, location = null) {
    // TODO: decode input as byte stream
    return { location, value: consumeRulesList(normalizeIntoTokens(input), true) }
}

/**
 * @interface
 * @see {@link https://drafts.csswg.org/cssom/#stylesheet}
 */
class StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-disabled}
     */
    disabled = false
}

module.exports = {
    implementation: StyleSheetImpl,
    parseStyleSheet,
}
