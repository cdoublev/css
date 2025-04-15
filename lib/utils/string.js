
/**
 * @param {string} property
 * @param {boolean} [lowercaseFirst]
 * @see {@link https://drafts.csswg.org/cssom-1/#css-property-to-idl-attribute}
 */
function cssPropertyToIDLAttribute(property, lowercaseFirst) {

    let output = ''
    let uppercaseNext = false

    if (lowercaseFirst) {
        property = property.substring(1)
    }

    for (const char of property) {
        if (char === '-') {
            uppercaseNext = true
        } else if (uppercaseNext) {
            uppercaseNext = false
            output += char.toUpperCase()
        } else {
            output += char
        }
    }

    return output
}

/**
 * @param {string} attribute
 * @param {boolean} [dashPrefix]
 * @see {@link https://drafts.csswg.org/cssom-1/#idl-attribute-to-css-property}
 */
function idlAttributeToCSSProperty(attribute, dashPrefix) {
    let output = dashPrefix ? '-' : ''
    output += attribute.replace(/[A-Z]/g, '-$&').toLowerCase()
    return output
}
/**
 * @param {string} value
 * @returns {string}
 */
function quote(value) {
    return value.includes("'") ? `"${value}"` : `'${value}'`
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
    cssPropertyToIDLAttribute,
    idlAttributeToCSSProperty,
    quote,
    tab,
}
