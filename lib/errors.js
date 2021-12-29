
/**
 * @see {@link https://webidl.spec.whatwg.org/#nomodificationallowederror}
 */
class NoModificationAllowedError extends Error {
    constructor(message) {
        super(`Uncaught DOMException: ${message}`)
        this.name = 'NoModificationAllowedError'
    }
}

module.exports = {
    NoModificationAllowedError,
}
