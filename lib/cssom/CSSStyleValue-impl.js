
const { parseCSSDeclarationValue } = require('./CSSStyleDeclaration-impl.js')
const properties = require('../properties/definitions.js')

/**
 * @param {string} property
 * @param {string} cssText
 * @param {boolean} [parseMultiple]
 */
function parseStyleValue(property, cssText, parseMultiple = false) {
    if (!property.startsWith('--')) {
        property = property.toLowerCase()
        if (!properties[property]) {
            return
        }
    }
    const values = parseCSSDeclarationValue(cssText, property)
    if (values === null) {
        // values is already subdivided into iterations by `parseCSSDeclarationValue()`
        if (parseMultiple) {
            return values[0]
        }
        return values
    }
    throw Error('Failed to parse a CSS value')
}

class CSSStyleValue {

    /**
     * @param {*} property
     * @param {*} cssText
     * @returns {CSSStyleValue}
     */
    static parse(property, cssText) {
        return parseStyleValue(property, cssText)
    }

    /**
     * @param {*} property
     * @param {*} cssText
     * @returns {CSSStyleValue[]}
     */
    static parseAll(property, cssText) {
        return parseStyleValue(property, cssText, true)
    }
}
