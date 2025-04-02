
const { parseBlockContents, parseCSSDeclaration } = require('../parse/parser.js')
const error = require('../error.js')
const root = require('../rules/definitions.js')

const INVALID_FONT_FEATURE_VALUE_ERROR = {
    message: 'Cannot set the feature value (invalid value)',
    name: 'InvalidAccessError',
}

const features = root.rules.find(rule => rule.name === '@font-feature-values').value.rules

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesmap}
 */
class CSSFontFeatureValuesMapImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { name, parentRule, parentStyleSheet, value }) {
        name = `@${name}`
        this._definition = features.find(rule => rule.name === name)
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
        if (value) {
            const declarations = parseBlockContents(value, this)[0] ?? []
            const entries = declarations.map(({ name, value }) =>
                [name, Array.isArray(value) ? [...value.map(component => component.value)] : [value.value]])
            this._map = new Map(entries)
        } else {
            this._map = new Map
        }
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
        if (!Array.isArray(values)) {
            values = [values]
        }
        if (!parseCSSDeclaration(key, values.join(' '), false, this)) {
            throw error(INVALID_FONT_FEATURE_VALUE_ERROR)
        }
        this._map.set(key, values)
    }
}

module.exports = {
    INVALID_FONT_FEATURE_VALUE_ERROR,
    implementation: CSSFontFeatureValuesMapImpl,
}
