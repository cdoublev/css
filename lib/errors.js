
/**
 * @see {@link https://webidl.spec.whatwg.org/#nomodificationallowederror}
 */
class NoModificationAllowedError extends Error {
    constructor(message) {
        super(`Uncaught DOMException: ${message}`)
        this.name = 'NoModificationAllowedError'
    }
}

class NotAllowedError extends Error {
    constructor(message) {
        super(`Uncaught DOMException: ${message}`)
        this.name = 'NotAllowedError'
    }
}

/**
 * @see {@link https://webidl.spec.whatwg.org/#securityerror}
 */
class SecurityError extends Error {
    constructor(message) {
        super(`Uncaught DOMException: ${message}`)
        this.name = 'SecurityError'
    }
}

module.exports = {
    NoModificationAllowedError,
    NotAllowedError,
    SecurityError,
}
