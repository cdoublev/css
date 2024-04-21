
const Stream = require('./stream.js')
const error = require('../error.js')

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#digit}
 */
function isDigit(char = '') {
    return /^\d$/.test(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#hex-digit}
 */
function isHexadecimal(char = '') {
    return /^[a-f\d]$/i.test(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-start-code-point}
 */
function isIdentifierStartCharacter(char = '') {
    return /^[a-z_]$/i.test(char) || isNonASCIIIdentifierCharacter(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-code-point}
 */
function isIdentifierCharacter(char = '') {
    return /^[-\w]$/.test(char) || isNonASCIIIdentifierCharacter(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#non-printable-code-point}
 */
function isNonPrintableCharacter(char = '') {
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
function isNonASCIIIdentifierCharacter(char = '') {
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
function isQuote(char = '') {
    return /["']/.test(char)
}

/**
 * @param {number} codePoint
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
 * @param {Stream|string} first
 * @param {string} second
 * @returns {boolean}
 */
function startsWithDecimal(first, second) {
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
function startsWithEscaped(first, second) {
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
function startsWithExponent(first, second, third) {
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
function startsWithIdentifier(first, second, third) {
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
function startsWithNumber(first, second, third) {
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
 * @param {string} string
 * @returns {number}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#convert-string-to-number}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7472}
 */
function convertStringToNumber(string) {
    const number = Number(string)
    return number === 0 ? 0 : number
}

/**
 * @param {Stream} chars
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-remnants-of-bad-url}
 */
function consumeBadUrl(chars) {
    for (const char of chars) {
        if (char === ')') {
            return
        }
        if (startsWithEscaped(chars)) {
            consumeEscapedCodePoint(chars)
        }
    }
}

/**
 * @param {Stream} chars
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-comments}
 */
function consumeComments(chars) {
    if (chars.next(2) === '/*') {
        chars.consume(2)
        while (chars.next(2) !== '*/') {
            chars.consume()
            if (chars.atEnd()) {
                error({ message: 'Unclosed comment' })
                return
            }
        }
        chars.consume(2)
        consumeComments(chars)
    }
}

/**
 * @param {Stream} chars
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-escaped-code-point}
 */
function consumeEscapedCodePoint(chars) {
    const char = chars.consume()
    if (!char) {
        error({ message: 'Invalid escape sequence (missing code point)' })
        return '�'
    }
    if (isHexadecimal(char)) {
        let hex = char
        let hexCount = 0
        while (isHexadecimal(chars.next()) && hexCount++ < 5) {
            hex += chars.consume()
        }
        if (isWhitespace(chars.next())) {
            chars.consume()
        }
        const number = Number(`0x${hex}`)
        if (number === 0 || isSurrogate(number) || number > 0x10FFFF) {
            return '�'
        }
        return String.fromCodePoint(number)
    }
    return char
}

/**
 * @param {Stream} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-ident-like-token}
 */
function consumeIdentifierLike(chars) {
    const identifier = consumeIdentifier(chars)
    if (chars.consume('(')) {
        const { start, value } = identifier
        const lowercase = value.toLowerCase()
        if (lowercase === 'url') {
            while (isWhitespace(chars.next()) && isWhitespace(chars.next(1, 1))) {
                chars.consume()
            }
            if (isQuote(chars.next()) || (isWhitespace(chars.next()) && isQuote(chars.next(1, 1)))) {
                return { end: chars.index + 1, start, types: ['<function-token>'], value: lowercase }
            }
            return { ...consumeUrl(chars), start }
        }
        return { end: chars.index + 1, start, types: ['<function-token>'], value: lowercase }
    }
    return identifier
}

/**
 * @param {Stream} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-name}
 */
function consumeIdentifier(chars) {
    const start = chars.index + 1
    let value = ''
    for (const char of chars) {
        if (isIdentifierCharacter(char)) {
            value += char
        } else if (startsWithEscaped(chars)) {
            value += consumeEscapedCodePoint(chars)
        } else {
            chars.reconsume()
            break
        }
    }
    return { end: chars.index + 1, start, types: ['<ident-token>'], value }
}

/**
 * @param {Stream} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-number}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7289}
 */
function consumeNumber(chars) {
    const entries = [
        ['start', chars.index + 1],
        ['types', ['<number-token>']],
    ]
    let number = ''
    if (chars.next() === '+' || chars.next() === '-') {
        entries.push(['sign', number += chars.consume()])
    }
    number += chars.consumeRunOf(isDigit)
    if (
        startsWithDecimal(...chars.next(2))
        || startsWithExponent(...chars.next(2))
        || startsWithExponent(...chars.next(3))
    ) {
        number += chars.consume(2) + chars.consumeRunOf(isDigit)
    }
    entries.push(['end', chars.index + 1], ['value', convertStringToNumber(number)])
    return Object.fromEntries(entries)
}

/**
 * @param {Stream} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-numeric-token}
 */
function consumeNumeric(chars) {
    const number = consumeNumber(chars)
    const { start, value } = number
    if (startsWithIdentifier(...chars.next(3))) {
        const unit = consumeIdentifier(chars)
        return { end: chars.index + 1, start, types: ['<dimension-token>'], unit: unit.value.toLowerCase(), value }
    }
    if (chars.consume('%')) {
        return { end: chars.index + 1, start, types: ['<percentage-token>'], unit: '%', value }
    }
    return number
}

/**
 * @param {Stream} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-string-token}
 */
function consumeString(chars) {
    const { current: ending, index: start } = chars
    let value = ''
    for (const char of chars) {
        switch (char) {
            case ending:
                return { end: chars.index + 1, start, types: ['<string-token>'], value }
            case '\n':
                error({ message: 'Unexpected newline' })
                chars.reconsume()
                return { end: chars.index + 1, start, types: ['<bad-string-token>'], value: '' }
            case '\\':
                if (chars.next() === '\n') {
                    chars.consume()
                } else if (!chars.atEnd()) {
                    value += consumeEscapedCodePoint(chars)
                }
                break
            default:
                value += char
                break
        }
    }
    error({ message: 'Unclosed string' })
    return { end: chars.index + 1, start, types: ['<string-token>'], value }
}

/**
 * @param {Stream} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-url-token}
 */
function consumeUrl(chars) {
    const start = chars.index - 3
    let value = ''
    chars.consumeRunOf(isWhitespace)
    for (const char of chars) {
        if (char === ')') {
            return { end: chars.index + 1, start, types: ['<url-token>'], value }
        }
        if (isWhitespace(char)) {
            chars.consumeRunOf(isWhitespace)
            if (chars.consume(')')) {
                return { end: chars.index + 1, start, types: ['<url-token>'], value }
            }
            consumeBadUrl(chars)
            return { end: chars.index + 1, start, types: ['<bad-url-token>'], value: '' }
        }
        if (isQuote(char) || char === '(' || isNonPrintableCharacter(char)) {
            error({ message: `Unexpected "${char}"` })
            consumeBadUrl(chars)
            return { end: chars.index + 1, start, types: ['<bad-url-token>'], value: '' }
        }
        if (char === '\\') {
            if (startsWithEscaped(chars)) {
                value += consumeEscapedCodePoint(chars)
                continue
            }
            consumeBadUrl(chars)
            error({ message: 'Invalid escaped newline' })
            return { end: chars.index + 1, start, types: ['<bad-url-token>'], value: '' }
        }
        value += char
    }
    error({ message: 'Unclosed url' })
    return { end: chars.index + 1, start, types: ['<url-token>'], value }
}

/**
 * @param {Stream} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-token}
 */
function consumeToken(chars) {
    const start = chars.index + 1
    consumeComments(chars)
    const char = chars.consume()
    if (isWhitespace(char)) {
        chars.consumeRunOf(isWhitespace)
        return { end: chars.index + 1, start, types: ['<delimiter-token>'], value: ' ' }
    }
    if (isQuote(char)) {
        return consumeString(chars)
    }
    if (char === '#') {
        if (isIdentifierCharacter(chars.next()) || startsWithEscaped(...chars.next(2))) {
            const types = ['<hash-token>']
            if (startsWithIdentifier(...chars.next(3))) {
                return { ...consumeIdentifier(chars), end: char.index + 1, start, type: 'id', types }
            }
            return { ...consumeIdentifier(chars), end: char.index + 1, start, types }
        }
    } else if (char === '+') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars)
        }
    } else if (char === '-') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars)
        }
        if (chars.next(2) === '->') {
            const value = `-${chars.consume(2)}`
            return { end: chars.index + 1, start, types: ['<delimiter-token>'], value }
        }
        if (startsWithIdentifier(chars)) {
            chars.reconsume()
            return consumeIdentifierLike(chars)
        }
    } else if (char === '.') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars)
        }
    } else if (char === '<') {
        if (chars.next(3) === '!--') {
            const value = `<${chars.consume(3)}`
            return { end: chars.index + 1, start, types: ['<delimiter-token>'], value }
        }
    } else if (char === '@') {
        if (startsWithIdentifier(...chars.next(3))) {
            return { ...consumeIdentifier(chars), end: chars.index + 1, start, types: ['<at-keyword-token>'] }
        }
    } else if (char === '\\') {
        if (startsWithEscaped(chars)) {
            chars.reconsume()
            return consumeIdentifierLike(chars)
        }
        error({ message: 'Invalid escaped newline' })
    } else if (isDigit(char)) {
        chars.reconsume()
        return consumeNumeric(chars)
    }
    if (isIdentifierStartCharacter(char)) {
        chars.reconsume()
        return consumeIdentifierLike(chars)
    }
    // Delimiter (including `:`, `,`, `;`, `(`, `)`, `[`, `]`, `{`, `}`)
    return { end: chars.index + 1, start, types: ['<delimiter-token>'], value: char }
}

/**
 * @param {Stream} input
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

module.exports = Object.assign(
    tokenize,
    {
        isDigit,
        isHexadecimal,
        isIdentifierCharacter,
        isNonASCIIIdentifierCharacter,
        isWhitespace,
    })
