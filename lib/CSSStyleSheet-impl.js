
/**
 * @param {CSSStyleSheetInit} options
 * @returns {CSSStyleSheetImpl}
 * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylesheet-cssstylesheet}
 */
function CSSStyleSheet(options) {
    return new CSSStyleSheetImpl(options)
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstylesheet}
 */
class CSSStyleSheetImpl {

    Document
    alternate
    baseURL
    constructed
    location
    originClean
    ownerCSSRule
    ownerNode
    parent
    title

    /**
     * @param {CSSStyleSheetInit} options
     * @see {@link https://drafts.csswg.org/cssom/#create-a-constructed-cssstylesheet}
     */
    constructor(options) {

    }
}

module.exports = {
    CSSStyleSheet,
    implementation: CSSStyleSheetImpl,
}
