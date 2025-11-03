
import * as idlUtils from './utils.js'

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#stylesheetlist}
 */
export default class StyleSheetListImpl {

    _list = []

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheetlist-length}
     */
    get length() {
        return this._list.length
    }

    /**
     * @param {number} index
     * @returns {boolean}
     */
    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this._list.length
    }

    /**
     * @returns {object}
     */
    [idlUtils.supportedPropertyIndices]() {
        return this._list.keys()
    }

    /**
     * @param {number} index
     * @returns {CSSStyleSheet|null}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheetlist-item}
     */
    item(index) {
        return this._list[index] ?? null
    }
}
