
import * as idlUtils from './utils.js'

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssrulelist}
 */
export default class CSSRuleListImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { rules }) {
        this._globalObject = globalObject
        this._rules = rules
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrulelist-length}
     */
    get length() {
        return this._rules.length
    }

    /**
     * @param {number} index
     * @returns {boolean}
     */
    [idlUtils.supportsPropertyIndex](index) {
        return 0 <= index && index < this._rules.length
    }

    /**
     * @returns {object}
     */
    [idlUtils.supportedPropertyIndices]() {
        return this._rules.keys()
    }

    /**
     * @param {number} index
     * @returns {CSSRuleImpl|null}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrulelist-item}
     */
    item(index) {
        return this._rules[index] ?? null
    }
}
