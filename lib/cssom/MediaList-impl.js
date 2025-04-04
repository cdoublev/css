
const { serializeCSSComponentValue, serializeCSSComponentValueList } = require('../serialize.js')
const { list: createList } = require('../values/value.js')
const error = require('../error.js')
const idlUtils = require('./utils.js')
const { parseCSSGrammar } = require('../parse/parser.js')

const DELETE_UNEXISTENT_MEDIUM_ERROR = {
    message: 'Cannot delete a medium that is not in the media list',
    name: 'NotFoundError',
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
 * @param {string} input
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-media-query}
 */
function parseMediaQuery(input) {
    input = parseCSSGrammar(input, '<media-query-list>')
    return input.length === 1 ? input[0] : null
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#medialist}
 */
class MediaListImpl {

    constructor(globalObject, args, { list = createList([], ',') }) {
        this._list = list
    }

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
     * @param {string} text
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-mediatext}
     */
    set mediaText(text) {
        this._list.splice(0, this._list.length, ...parseCSSGrammar(text, '<media-query-list>'))
    }

    /**
     * @param {number} index
     * @returns {boolean}
     */
    [idlUtils.supportsPropertyIndex](index) {
        return 0 <= index && index < this._list.length
    }

    /**
     * @returns {object}
     */
    [idlUtils.supportedPropertyIndices]() {
        return this._list.keys()
    }

    /**
     * @param {number} index
     * @returns {string|null}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-item}
     */
    item(index) {
        const item = this._list[index]
        return item ? serializeCSSComponentValue(item) : null
    }

    /**
     * @param {string} medium
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-appendmedium}
     */
    appendMedium(medium) {
        medium = parseMediaQuery(medium)
        if (medium && this._list.every(a => !compareMediaQueries(a, medium))) {
            this._list.push(medium)
        }
    }

    /**
     * @param {string} medium
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-medialist-deletemedium}
     */
    deleteMedium(medium) {
        medium = parseMediaQuery(medium)
        if (medium) {
            const { _list } = this
            let index = _list.length - 1
            let removed = 0
            for (; 0 <= index; --index) {
                if (compareMediaQueries(_list[index], medium)) {
                    _list.splice(index, 1)
                    ++removed
                }
            }
            if (removed === 0) {
                throw error(DELETE_UNEXISTENT_MEDIUM_ERROR)
            }
        }
    }
}

module.exports = {
    DELETE_UNEXISTENT_MEDIUM_ERROR,
    implementation: MediaListImpl,
}
