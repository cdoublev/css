
const DOMException = require('domexception')

/**
 * @param {object} description
 * @param {boolean} [silent]
 * @returns {DOMException|undefined}
 */
function create({ context, message, name, type: Type /* make eslint happy */ }, silent = false) {
    if (Type === 'DOMException') {
        return new DOMException(message, name)
    }
    if (Type === 'ParseError' && !silent) {
        if (context) {
            console.log(`---\n\n${context}\n\n---`)
        }
        console.error(`Parse error: ${message}`)
    }
}

module.exports = create
