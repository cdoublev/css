
const createError = require('../error.js')

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#digit}
 */
function isDigit(char = '') {
    return /\d/.test(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#hex-digit}
 */
function isHex(char = '') {
    return /[a-f\d]/i.test(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-start-code-point}
 */
function isIdentifierStartChar(char = '') {
    return /[a-z_]/i.test(char) || isNotASCII(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-code-point}
 */
function isIdentifierChar(char = '') {
    return /[-\w]/.test(char) || isNotASCII(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#non-printable-code-point}
 */
function isNonPrintableChar(char = '') {
    const codePoint = char.codePointAt(0)
    return char === '\t'
        || codePoint === 0x7F
        || (0 <= codePoint && codePoint <= 8)
        || (0xE <= codePoint && codePoint <= 0x1F)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#non-ascii-code-point}
 */
function isNotASCII(char = '') {
    return char.codePointAt(0) >= 0x80
}

/**
 * @param {string} [char]
 * @returns {boolean}
 */
function isQuote(char = '') {
    return /["']/.test(char)
}

/**
 * @param {string} char
 * @returns {boolean}
 * @see {@link https://infra.spec.whatwg.org/#surrogate}
 */
function isSurrogate(codePoint) {
    return 0xD800 <= codePoint && codePoint <= 0xDFFF
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#whitespace}
 */
function isWhitespace(char = '') {
    return /[\n\t ]/.test(char)
}

/**
 * @param {string|object} first
 * @param {string} second
 * @returns {boolean}
 */
function startsWithDecimal(first, second) {
    if (typeof first === 'object') {
        second = first.next()
        ;({ current: first } = first)
    }
    return first === '.' && isDigit(second)
}

/**
 * @param {string|object} first
 * @param {string} [second]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#starts-with-a-valid-escape}
 */
function startsWithEscaped(first, second) {
    if (typeof first === 'object') {
        second = first.next()
        ;({ current: first } = first)
    }
    return first === '\\' && second !== '\n'
}

/**
 * @param {string|object} first
 * @param {string} [second]
 * @param {string} [third]
 * @returns {boolean}
 */
function startsWithExponent(first, second, third) {
    if (typeof first === 'object') {
        ([second, third] = first.next(2), { current: first } = first)
    }
    return first?.toLowerCase() === 'e'
        && (isDigit(second) || ((second === '-' || second === '+') && isDigit(third)))
}

/**
 * @param {string|object} first
 * @param {string} [second]
 * @param {string} [third]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#would-start-an-identifier}
 */
function startsWithIdentifier(first, second, third) {
    if (typeof first === 'object') {
        ([second, third] = first.next(2), { current: first } = first)
    }
    switch (first) {
        case '-':
            return isIdentifierStartChar(second)
                || second === '-'
                || startsWithEscaped(second, third)
        case '\\':
            return startsWithEscaped(first, second)
        default:
            return isIdentifierStartChar(first)
    }
}

/**
 * @param {string|object} first
 * @param {string} [second]
 * @param {string} [third]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#starts-with-a-number}
 */
function startsWithNumber(first, second, third) {
    if (typeof first === 'object') {
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
 * @param {string} string
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#convert-string-to-number}
 *
 * TODO: figure out if the conversion match the JS behavior of `Number()`.
 */
function convertStringToNumber(string) {
    return Number(string)
}

/**
 * @param {object} chars
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-remnants-of-bad-url}
 */
function consumeBadUrl(chars) {
    for (const currentChar of chars) {
        if (currentChar === ')') {
            return
        }
        if (startsWithEscaped(chars)) {
            consumeEscaped(chars)
        }
    }
}

/**
 * @param {object} chars
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-comments}
 */
function consumeComments(chars) {
    if (chars.next(2) === '/*') {
        chars.consume(2)
        while (chars.next(2) !== '*/') {
            chars.consume()
            if (chars.atEnd()) {
                createError({ message: 'unclosed comment', type: 'ParseError' })
                return
            }
        }
        chars.consume(2)
        consumeComments(chars)
    }
}

/**
 * @param {object} chars
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-escaped-code-point}
 */
function consumeEscaped(chars) {
    const currentChar = chars.consume()
    if (isHex(currentChar)) {
        let hex = currentChar
        let hexCount = 0
        while (isHex(chars.next()) && hexCount++ < 5) {
            hex += chars.consume()
        }
        chars.consume(' ')
        const number = Number(`0x${hex}`)
        if (number === 0 || isSurrogate(number) || number > 0x10FFFF) {
            return '�'
        }
        return String.fromCodePoint(number)
    }
    if (currentChar === undefined) {
        createError({ message: 'invalid escape sequence', type: 'ParseError' })
        return '�'
    }
    return currentChar
}

/**
 * @param {object} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-ident-like-token}
 */
function consumeIdentLike(chars) {
    const string = consumeIdentifier(chars)
    let representation = string
    if (chars.consume('(')) {
        const type = new Set(['function'])
        representation += '('
        if (string.toLowerCase() === 'url') {
            while (isWhitespace(chars.next()) && isWhitespace(chars.next(2, 1))) {
                representation += chars.consume()
            }
            if (isQuote(chars.next()) || (isWhitespace(chars.next()) && isQuote(chars.next(2, 1)))) {
                return { name: string.toLowerCase(), representation, type, value: [] }
            }
            return consumeUrl(chars, representation)
        }
        return { name: string.toLowerCase(), representation, type, value: [] }
    }
    return { representation: string, type: new Set(['ident']), value: string }
}

/**
 * @param {object} chars
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-name}
 */
function consumeIdentifier(chars) {
    let result = ''
    for (const currentChar of chars) {
        if (isIdentifierChar(currentChar)) {
            result += currentChar
        } else if (startsWithEscaped(chars)) {
            result += consumeEscaped(chars)
        } else {
            chars.reconsume()
            break
        }
    }
    return result
}

/**
 * @param {object} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-number}
 */
function consumeNumber(chars) {
    let type = 'integer'
    let representation = ''
    if (chars.next() === '+' || chars.next() === '-') {
        representation += chars.consume()
    }
    while (isDigit(chars.next())) {
        representation += chars.consume()
    }
    if (startsWithDecimal(...chars.next(2))
        || startsWithExponent(...chars.next(2))
        || startsWithExponent(...chars.next(3))
    ) {
        type = 'number'
        representation += chars.consume(2)
        while (isDigit(chars.next())) {
            representation += chars.consume()
        }
    }
    return { representation, type: new Set([type]), value: convertStringToNumber(representation) }
}

/**
 * @param {object} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-numeric-token}
 */
function consumeNumeric(chars) {
    const number = consumeNumber(chars)
    const { representation, value } = number
    if (startsWithIdentifier(...chars.next(3))) {
        const unit = consumeIdentifier(chars)
        return {
            representation: `${representation}${unit}`,
            type: new Set(['dimension']),
            unit: unit.toLowerCase(),
            value,
        }
    }
    if (chars.consume('%')) {
        // TODO: cleanup validation functions for numerics
        return {
            representation: `${representation}%`,
            type: new Set(['percentage']),
            unit: '%',
            value,
        }
    }
    return number
}

/**
 * @param {object} chars
 * @param {string} endChar
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-string-token}
 */
function consumeString(chars, endChar) {
    let representation = endChar
    let value = ''
    for (const currentChar of chars) {
        switch (currentChar) {
            case endChar:
                representation += endChar
                return { representation, type: new Set(['string']), value }
            case '\n':
                createError({ message: 'unexpected newline in string', type: 'ParseError' })
                chars.reconsume()
                return { representation, type: new Set(['bad-string']), value: '' }
            case '\\':
                if (chars.next() === '\n') {
                    representation += chars.consume()
                } else if (chars.next()) { // Not EOF
                    const escaped = consumeEscaped(chars)
                    representation += escaped
                    value += escaped
                }
                break
            default:
                representation += currentChar
                value += currentChar
                break
        }
    }
    createError({ message: 'unclosed string', type: 'ParseError' })
    return { representation, type: new Set(['string']), value }
}

/**
 * @param {object} chars
 * @param {string} representation
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-url-token}
 */
function consumeUrl(chars, representation) {
    let value = ''
    consumeWhitespace(chars)
    for (const currentChar of chars) {
        if (currentChar === ')') {
            representation += currentChar
            return { representation, type: new Set(['url']), value }
        }
        if (isWhitespace(currentChar)) {
            representation += consumeWhitespace(chars)
            if (chars.consume(')')) {
                return { representation, type: new Set(['url']), value }
            }
            representation += consumeBadUrl(chars)
            return { representation, type: new Set(['bad-url']), value: '' }
        }
        if (isQuote(currentChar) || currentChar === '(' || isNonPrintableChar(currentChar)) {
            createError({ message: `unexpected "${currentChar}" in url`, type: 'ParseError' })
            representation += consumeBadUrl(chars)
            return { representation, type: new Set(['bad-url']), value: '' }
        }
        if (currentChar === '\\') {
            if (startsWithEscaped(chars)) {
                const escaped = consumeEscaped(chars)
                representation += escaped
                value += escaped
                continue
            }
            createError({ message: `invalid escape sequence "\\${chars.next(2)}}" in url`, type: 'ParseError' })
            representation += consumeBadUrl(chars)
            return { representation, type: new Set(['bad-url']), value: '' }
        }
        representation += currentChar
        value += currentChar
    }
    createError({ message: 'unclosed url', type: 'ParseError' })
    return { representation, type: new Set(['url']), value }
}

/**
 * @param {object} input
 * @returns {string}
 */
function consumeWhitespace(chars) {
    while (isWhitespace(chars.next())) {
        chars.consume()
    }
    return ' '
}

/**
 * @param {object} chars
 * @returns {object|string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-token}
 */
function consumeToken(chars) {
    consumeComments(chars)
    const currentChar = chars.consume()
    if (isWhitespace(currentChar)) {
        return consumeWhitespace(chars)
    }
    if (isQuote(currentChar)) {
        return consumeString(chars, currentChar)
    }
    if (currentChar === '#') {
        if (isIdentifierChar(chars.next()) || startsWithEscaped(...chars.next(2))) {
            const type = new Set(['hash'])
            if (startsWithIdentifier(...chars.next(3))) {
                type.add('id')
            }
            const value = consumeIdentifier(chars)
            return { representation: `#${value}`, type, value }
        }
    } else if (currentChar === '+') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars)
        }
    } else if (currentChar === '-') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars)
        }
        if (chars.next(2) === '->') {
            return chars.consume(2)
        }
        if (startsWithIdentifier(chars)) {
            chars.reconsume()
            return consumeIdentLike(chars)
        }
    } else if (currentChar === '.') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars)
        }
    } else if (currentChar === '<') {
        if (chars.next(3) === '!--') {
            return chars.consume(3)
        }
    } else if (currentChar === '@') {
        if (startsWithIdentifier(...chars.next(3))) {
            const value = consumeIdentifier(chars)
            return {
                representation: `@${value}`,
                type: new Set(['at-keyword']),
                value,
            }
        }
    } else if (currentChar === '\\') {
        if (startsWithEscaped(chars)) {
            chars.reconsume()
            return consumeIdentLike(chars)
        }
        createError({ message: 'invalid escape sequence', type: 'ParseError' })
    } else if (isDigit(currentChar)) {
        chars.reconsume()
        return consumeNumeric(chars)
    } else if (isIdentifierStartChar(currentChar)) {
        chars.reconsume()
        return consumeIdentLike(chars)
    }
    // Expected: delimiter or `:`, `,`, `;`, `(`, `)`, `[`, `]`, `{`, `}`
    return currentChar
}

/**
 * @param {object} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-tokenize}
 */
function tokenize(input) {
    const tokens = []
    while (!input.atEnd()) {
        tokens.push(consumeToken(input))
    }
    return tokens
}

module.exports = tokenize
