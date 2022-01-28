
const DOMException = require('domexception')

/**
 * @param {object} description
 * @param {boolean} [silent]
 * @returns {DOMException|Error|void}
 *
 * TODO: outputs proper parse error messages.
 */
function create({ message, name, type: Type /* make eslint happy */ }, silent = false) {
    if (Type === 'DOMException') {
        return new DOMException(message, name)
    }
    if (Type === 'ParseError') {
        if (!silent) {
            console.error(`Parse error: ${message}`)
        }
        return
    }
    if (typeof Type === 'function') {
        return new Type(message)
    }
    return new Error(message)
}

module.exports = create
