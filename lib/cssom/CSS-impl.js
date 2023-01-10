
const { aliases, mappings } = require('../properties/compatibility.js')
const { matchCondition } = require('../condition.js')
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
    if (aliases.has(property)) {
        property = aliases.get(property)
    } else if (mappings.has(property)) {
        property = mappings.get(property)
    }
    const definition = properties[property.toLowerCase()]
    return definition && parseCSSGrammar(value, definition.value) !== null
}

/**
 * @param {string} conditionText
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#ref-for-dom-css-supports-conditiontext}
 */
function supportsCondition(conditionText) {
    const parsed = parseCSSGrammar(`(${conditionText})`, '<supports-condition>')
    return parsed ? matchCondition(parsed) : false

}

class CSSImpl {

    /**
     * @param {string} ident
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-css-escape}
     */
    escape(ident) {
        return serializeIdentifier({ value: ident })
    }

    /**
     * @param {string} conditionTextOrProperty
     * @param {string} [value]
     * @returns {boolean}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-css-supports}
     */
    supports(conditionTextOrProperty, value) {
        return value
            ? supportsValue(conditionTextOrProperty, value)
            : supportsCondition(conditionTextOrProperty)
    }
}

module.exports = {
    implementation: CSSImpl,
}
