
const DOMException = require('domexception')

const isTest = typeof process === 'object' && process.env.NODE_ENV === 'test'

/**
 * @param {object} description
 * @param {boolean} [silent]
 * @returns {DOMException|Error}
 */
function create({ context, message, name, type: Type = Error }, silent = !isTest) {
    if (Type === 'DOMException') {
        return new DOMException(message, name)
    }
    if (!silent) {
        if (context) {
            console.log(`---\n\n${context}\n\n---`)
        }
        console.error(`${Type.name}: ${message}`)
    }
    return new Type(message)
}

module.exports = create
