
const { serializeCSSComponentValue, serializeCSSComponentValueList } = require('../serialize.js')
const createError = require('../error.js')
const idlUtils = require('./utils.js')
const { parseCSSGrammar } = require('../parse/syntax.js')

const DELETE_UNEXISTENT_MEDIUM_ERROR = {
    message: 'Failed to delete medium: medium not in media list',
    name: 'NotFoundError',
    type: 'DOMException',
}

/**
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/cssom-1/#compare-media-queries}
 */
function compareMediaQueries(a, b) {
    return serializeCSSComponentValue(a) === serializeCSSComponentValue(b)
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#medialist}
 */
class MediaListImpl {

    _list = []

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-length}
     */
    get length() {
        return this._list.length
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-mediatext}
     */
    get mediaText() {
        return serializeCSSComponentValueList(this._list)
    }

    /**
     * @param {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-mediatext}
     */
    set mediaText(text) {
        this._list = text ? parseCSSGrammar(text, '<media-query-list>') : []
    }

    [idlUtils.indexedGet](index) {
        return serializeCSSComponentValue(this._list[index])
    }

    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this._list.length
    }

    [idlUtils.supportedPropertyIndices]() {
        return this._list.keys()
    }

    /**
     * @param {number} index
     * @returns {string|null}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-item}
     */
    item(index) {
        return this._list[index] ?? null
    }

    /**
     * @param {string} medium
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-appendmedium}
     */
    appendMedium(medium) {
        const query = parseCSSGrammar(medium, '<media-query>')
        if (query && this._list.every(a => !compareMediaQueries(a, query))) {
            this._list.push(query)
        }
    }

    /**
     * @param {string} medium
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-deletemedium}
     */
    deleteMedium(medium) {
        const query = parseCSSGrammar(medium, '<media-query>')
        if (query === null) {
            return
        }
        const index = this._list.findIndex(a => compareMediaQueries(a, query))
        if (0 <= index) {
            this._list.splice(index, 1)
        } else {
            throw createError(DELETE_UNEXISTENT_MEDIUM_ERROR)
        }
    }
}

module.exports = {
    DELETE_UNEXISTENT_MEDIUM_ERROR,
    implementation: MediaListImpl,
}
