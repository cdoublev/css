
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
        second = first.next()
        third = first.next(2)
        ;({ current: first } = first)
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
        second = first.next()
        third = first.next(2)
        ;({ current: first } = first)
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
        second = first.next()
        third = first.next(2)
        ;({ current: first } = first)
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
    if (chars.next() === '/' && chars.next(2) === '*') {
        chars.consume(2)
        while (chars.next() !== '*' && chars.next(2) !== '/') {
            chars.consume()
            if (chars.atEnd()) {
                console.error('Parse error: unclosed comment')
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
        console.error('Parse error: invalid escape sequence')
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
    if (chars.consume('(')) {
        if (string.toLowerCase() === 'url') {
            while (isWhitespace(chars.next()) && isWhitespace(chars.next(2))) {
                chars.consume()
            }
            if (isQuote(chars.next()) || (isWhitespace(chars.next()) && isQuote(chars.next(2)))) {
                return { name: string.toLowerCase(), type: new Set(['function']), value: [] }
            }
            return consumeUrl(chars)
        }
        return { name: string.toLowerCase(), type: new Set(['function']), value: [] }
    }
    return { type: new Set(['ident']), value: string }
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
    if (startsWithDecimal(chars.next(), chars.next(2))
        || startsWithExponent(chars.next(), chars.next(2))
        || startsWithExponent(chars.next(), chars.next(2), chars.next(3))) {
        type = 'number'
        representation += chars.consume(2)
        while (isDigit(chars.next())) {
            representation += chars.consume()
        }
    }
    return { type: new Set([type]), value: convertStringToNumber(representation) }
}

/**
 * @param {object} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-numeric-token}
 */
function consumeNumeric(chars) {
    const number = consumeNumber(chars)
    const { value } = number
    if (startsWithIdentifier(chars.next(), chars.next(2), chars.next(3))) {
        return { type: new Set(['dimension']), unit: consumeIdentifier(chars).toLowerCase(), value }
    }
    if (chars.consume('%')) {
        // TODO: cleanup validation functions for numerics
        return { type: new Set(['percentage']), unit: '%', value }
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
    const string = { type: new Set(['string']), value: '' }
    for (const currentChar of chars) {
        switch (currentChar) {
            case endChar:
                return string
            case '\n':
                console.error('Parse error: unexpected newline in string')
                chars.reconsume()
                string.type.add('bad-string')
                string.value = ''
                return string
            case '\\':
                if (chars.next() === '\n') {
                    chars.consume()
                } else if (chars.next()) { // Not EOF
                    string.value += consumeEscaped(chars)
                }
                break
            default:
                string.value += currentChar
                break
        }
    }
    console.error('Parse error: unclosed string')
    return string
}

/**
 * @param {object} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-url-token}
 */
function consumeUrl(chars) {
    const url = { type: new Set(['url']), value: '' }
    consumeWhitespace(chars)
    for (const currentChar of chars) {
        if (currentChar === ')') {
            return url
        }
        if (isWhitespace(currentChar)) {
            consumeWhitespace(chars)
            if (chars.consume(')')) {
                return url
            }
            consumeBadUrl(chars)
            url.type.add('bad-url')
            url.value = ''
            return url
        }
        if (isQuote(currentChar) || currentChar === '(' || isNonPrintableChar(currentChar)) {
            console.error(`Parse error: unexpected "${currentChar}" in url`)
            consumeBadUrl(chars)
            url.type.add('bad-url')
            url.value = ''
            return url
        }
        if (currentChar === '\\') {
            if (startsWithEscaped(chars)) {
                url.value += consumeEscaped(chars)
                continue
            }
            console.error(`Parse error: invalid escape sequence "\\${chars.next()}${chars.next(2)}" in url`)
            consumeBadUrl(chars)
            url.type.add('bad-url')
            url.value = ''
            return url
        }
        url.value += currentChar
    }
    console.error('Parse error: unclosed url')
    return url
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
        if (isIdentifierChar(chars.next()) || startsWithEscaped(chars.next(), chars.next(2))) {
            const hash = { type: new Set(['hash']) }
            if (startsWithIdentifier(chars.next(), chars.next(2), chars.next(3))) {
                hash.type.add('id')
            }
            hash.value = consumeIdentifier(chars)
            return hash
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
        if (chars.next() === '-' && chars.next(2) === '>') {
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
    } else if (currentChar === '<' && chars.next() === '-' && chars.next(2) === '-' && chars.next(3) === '-') {
        return chars.consume(3)
    } else if (currentChar === '@') {
        if (startsWithIdentifier(chars.next(), chars.next(2), chars.next(3))) {
            return {
                type: new Set(['at-keyword']),
                value: consumeIdentifier(chars),
            }
        }
    } else if (currentChar === '\\') {
        if (startsWithEscaped(chars)) {
            chars.reconsume()
            return consumeIdentLike(chars)
        }
        console.error('Parse error: invalid escape sequence')
    } else if (isDigit(currentChar)) {
        chars.reconsume()
        return consumeNumeric(chars)
    } else if (isIdentifierStartChar(currentChar)) {
        chars.reconsume()
        return consumeIdentLike(chars)
    }
    // Delimiter or '(', ')', ',', ':', ';', '<', '[', ']', '{', '}'
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
