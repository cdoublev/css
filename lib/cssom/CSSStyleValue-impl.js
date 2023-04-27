
/**
 * @param {string} property
 * @param {string} cssText
 * @param {boolean} [parseMultiple]
 */
function parseStyleValue(property, cssText, parseMultiple = false) {
    // TODO
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
