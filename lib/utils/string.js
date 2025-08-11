
import Stream from '../parse/stream.js'

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#digit}
 */
export function isDigit(char = '') {
    return /^\d$/.test(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#hex-digit}
 */
export function isHexadecimal(char = '') {
    return /^[a-f\d]$/i.test(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-start-code-point}
 */
export function isIdentifierStartCharacter(char = '') {
    return /^[a-z_]$/i.test(char) || isNonASCIIIdentifierCharacter(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-code-point}
 */
export function isIdentifierCharacter(char = '') {
    return /^[-\w]$/.test(char) || isNonASCIIIdentifierCharacter(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#non-printable-code-point}
 */
export function isNonPrintableCharacter(char = '') {
    const codePoint = char.codePointAt(0)
    return char === '\t'
        || codePoint === 0x7F
        || (0 <= codePoint && codePoint <= 8)
        || (0xE <= codePoint && codePoint <= 0x1F)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#non-ascii-ident-code-point}
 */
export function isNonASCIIIdentifierCharacter(char = '') {
    const codePoint = char.codePointAt(0)
    return codePoint === 0xB7
        || (0xC0 <= codePoint && codePoint <= 0xD6)
        || (0xD8 <= codePoint && codePoint <= 0xF6)
        || (0xF8 <= codePoint && codePoint <= 0x37D)
        || (0x37F <= codePoint && codePoint <= 0x1FFF)
        || codePoint === 0x200C
        || codePoint === 0x200D
        || codePoint === 0x203F
        || codePoint === 0x2040
        || (0x2070 <= codePoint && codePoint <= 0x218F)
        || (0x2C00 <= codePoint && codePoint <= 0x2FEF)
        || (0x3001 <= codePoint && codePoint <= 0xD7FF)
        || (0xF900 <= codePoint && codePoint <= 0xFDCF)
        || (0xFDF0 <= codePoint && codePoint <= 0xFFFD)
        || 0x10000 <= codePoint
}

/**
 * @param {string} [char]
 * @returns {boolean}
 */
export function isQuote(char = '') {
    return /["']/.test(char)
}

/**
 * @param {number} codePoint
 * @returns {boolean}
 * @see {@link https://infra.spec.whatwg.org/#surrogate}
 */
export function isSurrogate(codePoint) {
    return 0xD800 <= codePoint && codePoint <= 0xDFFF
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#whitespace}
 */
export function isWhitespace(char = '') {
    return /[\n\t ]/.test(char)
}

/**
 * @param {string} value
 * @returns {string}
 */
export function quote(value) {
    return value.includes("'") ? `"${value}"` : `'${value}'`
}

/**
 * @param {number} depth
 * @returns {string}
 */
export function tab(depth) {
    let ws = depth * 4
    let tabs = ''
    while (ws-- > 0) {
        tabs += ' '
    }
    return tabs
}

/**
 * @param {Stream|string} first
 * @param {string} second
 * @returns {boolean}
 */
export function startsWithDecimal(first, second) {
    if (first instanceof Stream) {
        second = first.next()
        ;({ current: first } = first)
    }
    return first === '.' && isDigit(second)
}

/**
 * @param {Stream|string} first
 * @param {string} [second]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#starts-with-a-valid-escape}
 */
export function startsWithEscaped(first, second) {
    if (first instanceof Stream) {
        second = first.next()
        ;({ current: first } = first)
    }
    return first === '\\' && second !== '\n'
}

/**
 * @param {Stream|string} first
 * @param {string} [second]
 * @param {string} [third]
 * @returns {boolean}
 */
export function startsWithExponent(first, second, third) {
    if (first instanceof Stream) {
        ([second, third] = first.next(2), { current: first } = first)
    }
    return first?.toLowerCase() === 'e'
        && (isDigit(second) || ((second === '-' || second === '+') && isDigit(third)))
}

/**
 * @param {Stream|string} first
 * @param {string} [second]
 * @param {string} [third]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#would-start-an-identifier}
 */
export function startsWithIdentifier(first, second, third) {
    if (first instanceof Stream) {
        ([second, third] = first.next(2), { current: first } = first)
    }
    switch (first) {
        case '-':
            return isIdentifierStartCharacter(second)
                || second === '-'
                || startsWithEscaped(second, third)
        case '\\':
            return startsWithEscaped(first, second)
        default:
            return isIdentifierStartCharacter(first)
    }
}

/**
 * @param {Stream|string} first
 * @param {string} [second]
 * @param {string} [third]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#starts-with-a-number}
 */
export function startsWithNumber(first, second, third) {
    if (first instanceof Stream) {
        ([second, third] = first.next(2), { current: first } = first)
    }
    switch (first) {
        case '-':
        case '+':
            return isDigit(second) || (second === '.' && isDigit(third))
        case '.':
            return isDigit(second)
        default:
            return isDigit(first)
    }
}

/**
 * @param {string} attribute
 * @param {boolean} [dashPrefix]
 * @see {@link https://drafts.csswg.org/cssom-1/#idl-attribute-to-css-property}
 */
export function toCSSProperty(attribute, dashPrefix) {
    let output = dashPrefix ? '-' : ''
    output += attribute.replace(/[A-Z]/g, '-$&').toLowerCase()
    return output
}

/**
 * @param {string} property
 * @param {boolean} [lowercaseFirst]
 * @see {@link https://drafts.csswg.org/cssom-1/#css-property-to-idl-attribute}
 */
export function toIDLAttribute(property, lowercaseFirst) {

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
 * @param {string} string
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#convert-string-to-number}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7472}
 */
export function toNumber(string) {
    const number = Number(string)
    return number === 0 ? 0 : number
}
