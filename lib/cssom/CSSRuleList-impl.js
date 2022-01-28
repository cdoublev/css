
const idlUtils = require('./utils.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssrulelist}
 */
class CSSRuleListImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, { rules }) {
        this._rules = rules
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrulelist-length}
     */
    get length() {
        return this._rules.length
    }

    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this._rules.length
    }

    [idlUtils.supportedPropertyIndices]() {
        return this._rules.keys()
    }

    /**
     * @param {number} index
     * @returns {CSSRule|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrulelist-item}
     */
    item(index) {
        return this._rules[index] ?? null
    }
}

module.exports = {
    implementation: CSSRuleListImpl,
}
