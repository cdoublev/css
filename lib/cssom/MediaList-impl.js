
const { serializeMediaQueryList, serializeMediaQuery } = require('../serialize.js')
const DOMException = require('domexception')
const idlUtils = require('./utils.js')
const { parseMediaQueryList } = require('../parse/syntax.js')

/**
 * @param {string} input
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-media-query}
 */
function parseMediaQuery(input) {
    const [query, otherQuery] = parseMediaQueryList(input)
    if (otherQuery) {
        return null
    }
    return query
}

/**
 * @param {object} a
 * @param {object} b
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/cssom/#compare-media-queries}
 */
function compareMediaQueries(a, b) {
    return serializeMediaQuery(a) === serializeMediaQuery(b)
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#medialist}
 */
class MediaListImpl {

    _list = []

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-length}
     */
    get length() {
        return this._list.length
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-mediatext}
     */
    get mediaText() {
        return serializeMediaQueryList(this._list)
    }

    /**
     * @param {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-mediatext}
     */
    set mediaText(text) {
        this._list = text ? parseMediaQueryList(text) : []
    }

    [idlUtils.indexedGet](index) {
        return serializeMediaQuery(this._list[index])
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
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-item}
     */
    item(index) {
        if (this.length <= index) {
            return null
        }
        return this._list[index]
    }

    /**
     * @param {string} medium
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-appendmedium}
     */
    appendMedium(medium) {
        const query = parseMediaQuery(medium)
        if (query && this._list.every(a => !compareMediaQueries(a, query))) {
            this._list.push(query)
        }
    }

    /**
     * @param {string} medium
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-deletemedium}
     */
    deleteMedium(medium) {
        const query = parseMediaQuery(medium)
        if (query === null) {
            return
        }
        const index = this._list.findIndex(a => compareMediaQueries(a, query))
        if (0 <= index) {
            this._list.splice(index, 1)
        } else {
            throw new DOMException(`Failed to delete medium "${medium}": medium not in media list`, 'NotFoundError')
        }
    }
}

module.exports = {
    implementation: MediaListImpl,
}
