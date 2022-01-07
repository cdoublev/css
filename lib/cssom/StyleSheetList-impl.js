
const idlUtils = require('./utils.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#stylesheetlist}
 */
class StyleSheetListImpl {

    _styleSheets = []

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheetlist-length}
     */
    get length() {
        return this._styleSheets.length
    }

    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this._styleSheets.length
    }

    [idlUtils.supportedPropertyIndices]() {
        return this._styleSheets.keys()
    }

    /**
     * @param {number} index
     * @returns {CSSStyleSheet|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheetlist-item}
     */
    item(index) {
        return this._styleSheets[index] ?? null
    }
}

module.exports = {
    implementation: StyleSheetListImpl,
}
