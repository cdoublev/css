
const DOMException = require('domexception')

/**
 * @param {object} description
 * @param {boolean} [silent]
 * @returns {DOMException|void}
 *
 * TODO: output detailed parse error messages.
 */
function create({ message, name, type: Type /* make eslint happy */ }, silent = false) {
    if (Type === 'DOMException') {
        return new DOMException(message, name)
    }
    if (Type === 'ParseError' && !silent) {
        console.error(`Parse error: ${message}`)
    }
}

module.exports = create
