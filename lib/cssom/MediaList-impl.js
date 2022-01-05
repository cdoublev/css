
const { serializeMediaQueryList, serializeMediaQuery } = require('../serialize.js')
const { parseCommaSeparatedComponentValuesList } = require('../parse/syntax.js')
const parseDefinition = require('../parse/definition.js')
const parseRootNode = require('../parse/engine.js')

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
 * @param {string} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-media-query-list}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list}
 */
function parseMediaQueryList(input) {
    const list = parseCommaSeparatedComponentValuesList(input)
    return list.map(parseRootNode(list, parseDefinition('<media-query>')))
}

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
 * @see {@link https://drafts.csswg.org/cssom/#medialist}
 */
class MediaListImpl {

    #mediaQueries = []
    #mediaText

    /**
     * @param {object} globalObject
     * @param {*[]} args
     * @see {@link https://drafts.csswg.org/cssom/#create-a-medialist-object}
     */
    constructor(globalObject, [mediaText]) {
        this.#mediaText = mediaText
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-length}
     */
    get length() {
        return this.#mediaQueries.length
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-medialist-mediatext}
     */
    get mediaText() {
        return serializeMediaQueryList(this.#mediaText)
    }
    set mediaText(mediaText) {
        this.#mediaQueries = []
        if (mediaText === '') {
            return
        }
        this.#mediaQueries = parseMediaQueryList(mediaText)
    }
}

module.exports = {
    serializeMediaQueryList,
    implementation: MediaListImpl,
}
