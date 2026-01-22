
import { INVALID_FONT_FEATURE_VALUE_ERROR, create as error } from '../error.js'
import { isFailure, isList } from '../utils/value.js'
import { parseDeclarationValue, parseGrammar } from '../parse/parser.js'
import root from '../rules/definitions.js'

const features = root.value.rules.find(rule => rule.name === '@font-feature-values').value.rules

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesmap}
 */
export default class CSSFontFeatureValuesMapImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { name, node, parentRule, parentStyleSheet }) {
        this._globalObject = globalObject
        this.parentRule = parentRule
        this.parentStyleSheet = parentStyleSheet
        if (node) {
            const { definition, input } = node
            const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
            const declarations = block.value[0] ?? []
            const entries = declarations.map(({ name, value }) =>
                [name, isList(value) ? value.map(value => value.value) : [value.value]])
            this._definition = definition
            this._map = new Map(entries)
        } else {
            name = `@${name}`
            this._definition = features.find(rule => rule.name === name)
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
        if (isFailure(parseDeclarationValue(values.join(' '), key, this))) {
            throw error(INVALID_FONT_FEATURE_VALUE_ERROR, this._globalObject)
        }
        this._map.set(key, values)
    }
}
