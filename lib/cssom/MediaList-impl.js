
const { parseMediaQueryList } = require('../parse/value.js')
const { serializeMediaQueryList } = require('../serialize.js')

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
