
/**
 * @param {string} value
 * @returns {string}
 */
function addQuotes(value) {
    return value.includes("'") ? `"${value}"` : `'${value}'`
}

/**
 * @param {string} property
 * @param {boolean} [lowercaseFirst]
 * @see {@link https://drafts.csswg.org/cssom-1/#css-property-to-idl-attribute}
 */
function cssPropertyToIDLAttribute(property, lowercaseFirst = false) {

    let output = ''
    let uppercaseNext = false

    if (lowercaseFirst) {
        property = property.substring(1)
    }

    for (const c of property) {
        if (c === '-') {
            uppercaseNext = true
        } else if (uppercaseNext) {
            uppercaseNext = false
            output += c.toUpperCase()
        } else {
            output += c
        }
    }

    return output
}

/**
 * @param {string} attribute
 * @param {boolean} [dashPrefix]
 * @see {@link https://drafts.csswg.org/cssom-1/#idl-attribute-to-css-property}
 */
function idlAttributeToCSSProperty(attribute, dashPrefix = false) {
    let output = dashPrefix ? '-' : ''
    output += attribute.replace(/[A-Z]/g, '-$&').toLowerCase()
    return output
}

/**
 * @param {object} error
 */
function logError(error) {
    if (error) {
        console.error(error.message)
    }
}

/**
 * @param {number} depth
 * @returns {string}
 */
function tab(depth) {
    let ws = depth * 4
    let tabs = ''
    while (ws-- > 0) {
        tabs += ' '
    }
    return tabs
}

module.exports = {
    addQuotes,
    cssPropertyToIDLAttribute,
    idlAttributeToCSSProperty,
    logError,
    tab,
}
