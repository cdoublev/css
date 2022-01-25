
const { parseCSSGrammar } = require('../parse/syntax.js')
const properties = require('../properties/definitions.js')
const { serializeIdentifier } = require('../serialize.js')

/**
 * @param {string} property
 * @param {string} value
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#ref-for-dom-css-supports}
 */
function supportsValue(property, value) {
    const definition = properties[property.toLowerCase()]
    return definition && parseCSSGrammar(value, definition.value) !== null
}

/**
 * @param {string} conditionText
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#ref-for-dom-css-supports-conditiontext}
 */
function supportsCondition(conditionText) {
    return parseCSSGrammar(conditionText, '<supports-condition>') !== null
        || parseCSSGrammar(`(${conditionText})`, '<supports-condition>') !== null

}

class CSSImpl {

    /**
     * @param {string} ident
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#the-css.escape()-method}
     */
    escape(ident) {
        return serializeIdentifier(ident)
    }

    /**
     * @param {...string} args
     * @returns {boolean}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#the-css-namespace}
     */
    supports([conditionTextOrProperty, value]) {
        return value
            ? supportsValue(conditionTextOrProperty, value)
            : supportsCondition(conditionTextOrProperty)
    }
}

module.exports = {
    implementation: CSSImpl,
}
