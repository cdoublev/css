
const idlUtils = require('./utils.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#stylesheetlist}
 */
class StyleSheetListImpl {

    _styleSheets = []

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheetlist-length}
     */
    get length() {
        return this._styleSheets.length
    }

    /**
     * @param {number} index
     * @returns {boolean}
     */
    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this._styleSheets.length
    }

    /**
     * @returns {object}
     */
    [idlUtils.supportedPropertyIndices]() {
        return this._styleSheets.keys()
    }

    /**
     * @param {number} index
     * @returns {CSSStyleSheet|null}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheetlist-item}
     */
    item(index) {
        return this._styleSheets[index] ?? null
    }
}

module.exports = {
    implementation: StyleSheetListImpl,
}
