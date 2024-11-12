
const { createContext } = require('../utils/context.js')
const error = require('../error.js')
const { parseCSSGrammar } = require('../parse/parser.js')

const INVALID_FONT_FEATURE_VALUE_ERROR = {
    message: 'Cannot set the feature value (invalid value)',
    name: 'InvalidAccessError',
}

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesmap}
 */
class CSSFontFeatureValuesMapImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { definition, entries }) {
        this._definition = definition
        this._map = new Map(entries)
    }

    /**
     * @returns {object}
     */
    [Symbol.iterator]() {
        return this._map[Symbol.iterator]()
    }

    /**
     * @returns {number}
     */
    get size() {
        return this._map.size
    }

    clear() {
        this._map.clear()
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    delete(key) {
        return this._map.delete(key)
    }

    /**
     * @param {string} key
     * @returns {number[]}
     */
    get(key) {
        return this._map.get(key)
    }

    /**
     * @param {string} key
     * @returns {boolean}
     */
    has(key) {
        return this._map.has(key)
    }

    /**
     * @param {string} key
     * @param {number|number[]} values
     * @see {@link https://drafts.csswg.org/css-fonts-4/#dom-cssfontfeaturevaluesmap-set}
     */
    set(key, values) {
        const { _definition: { name, value }, _map } = this
        const definition = value.descriptors['*']
        const context = createContext('@font-feature-values', name)
        if (!Array.isArray(values)) {
            values = [values]
        }
        if (!parseCSSGrammar(values.join(' '), definition, context)) {
            throw error(INVALID_FONT_FEATURE_VALUE_ERROR)
        }
        _map.set(key, values)
    }
}

module.exports = {
    INVALID_FONT_FEATURE_VALUE_ERROR,
    implementation: CSSFontFeatureValuesMapImpl,
}
