
const createError = require('../error.js')

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
function isHex(char = '') {
    return /^[a-f\d]$/i.test(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-start-code-point}
 */
function isIdentifierStartCharacter(char = '') {
    return /^[a-z_]$/i.test(char) || isNonASCIIIdentifierChar(char)
}

/**
 * @param {string} [char]
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#identifier-code-point}
 */
function isIdentifierCharacter(char = '') {
    return /^[-\w]$/.test(char) || isNonASCIIIdentifierChar(char)
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
function isNonASCIIIdentifierChar(char = '') {
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
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7472}
 */
function convertStringToNumber(string) {
    const number = Number(string)
    return number === 0 ? 0 : number
}

/**
 * @param {object} chars
 * @param {string} representation
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-remnants-of-bad-url}
 */
function consumeBadUrl(chars, representation) {
    for (const char of chars) {
        representation += char
        if (char === ')') {
            return representation
        }
        if (startsWithEscaped(chars)) {
            representation += consumeEscaped(chars).representation
        }
    }
    return representation
}

/**
 * @param {object} chars
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-comments}
 */
function consumeComments(chars) {
    let representation = ''
    if (chars.next(2) === '/*') {
        representation += chars.consume(2)
        while (chars.next(2) !== '*/') {
            representation += chars.consume()
            if (chars.atEnd()) {
                createError({
                    context: representation,
                    message: 'unclosed comment',
                    type: 'ParseError',
                })
                return
            }
        }
        representation += chars.consume(2) + consumeComments(chars)
    }
    return representation
}

/**
 * @param {object} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-escaped-code-point}
 */
function consumeEscaped(chars) {
    const char = chars.consume()
    let representation = ''
    if (char === null) {
        createError({ message: 'invalid escape sequence (missing code point)', type: 'ParseError' })
        return { representation, value: '�' }
    }
    if (isHex(char)) {
        let hex = char
        let hexCount = 0
        while (isHex(chars.next()) && hexCount++ < 5) {
            hex += chars.consume()
        }
        representation += hex
        if (isWhitespace(chars.next())) {
            representation += chars.consume()
        }
        const number = Number(`0x${hex}`)
        if (number === 0 || isSurrogate(number) || number > 0x10FFFF) {
            return { representation, value: '�' }
        }
        return { representation, value: String.fromCodePoint(number) }
    }
    return { representation: char, value: char }
}

/**
 * @param {object} chars
 * @param {string} representation
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-ident-like-token}
 */
function consumeIdentifierLike(chars, representation) {
    const identifier = consumeIdentifier(chars, representation)
    if (chars.consume('(')) {
        const lowercase = identifier.value.toLowerCase()
        let { representation } = identifier
        representation += '('
        if (lowercase === 'url') {
            while (isWhitespace(chars.next()) && isWhitespace(chars.next(1, 1))) {
                representation += chars.consume()
            }
            if (isQuote(chars.next()) || (isWhitespace(chars.next()) && isQuote(chars.next(1, 1)))) {
                return { representation, type: new Set(['function-token']), value: lowercase }
            }
            return consumeUrl(chars, representation)
        }
        return { representation, type: new Set(['function-token']), value: lowercase }
    }
    return { ...identifier, type: new Set(['ident']) }
}

/**
 * @param {object} chars
 * @param {string} representation
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-name}
 */
function consumeIdentifier(chars, representation) {
    let value = ''
    for (const char of chars) {
        if (isIdentifierCharacter(char)) {
            representation += char
            value += char
        } else if (startsWithEscaped(chars)) {
            const escaped = consumeEscaped(chars)
            representation += `\\${escaped.representation}`
            value += escaped.value
        } else {
            chars.reconsume()
            break
        }
    }
    return { representation, value }
}

/**
 * @param {object} chars
 * @param {string} representation
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-number}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7289}
 */
function consumeNumber(chars, representation) {
    if (chars.next() === '+' || chars.next() === '-') {
        representation += chars.consume()
    }
    representation += chars.consumeRunOf(isDigit)
    if (startsWithDecimal(...chars.next(2))
        || startsWithExponent(...chars.next(2))
        || startsWithExponent(...chars.next(3))
    ) {
        representation += chars.consume(2) + chars.consumeRunOf(isDigit)
    }
    return {
        representation,
        type: new Set(['number']),
        value: convertStringToNumber(representation),
    }
}

/**
 * @param {object} chars
 * @param {string} representation
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-numeric-token}
 */
function consumeNumeric(chars, representation) {
    const number = consumeNumber(chars, representation)
    if (startsWithIdentifier(...chars.next(3))) {
        const unit = consumeIdentifier(chars, number.representation)
        return {
            representation: unit.representation,
            type: new Set(['dimension']),
            unit: unit.value.toLowerCase(),
            value: number.value,
        }
    }
    if (chars.consume('%')) {
        return {
            representation: `${number.representation}%`,
            type: new Set(['percentage']),
            unit: '%',
            value: number.value,
        }
    }
    return number
}

/**
 * @param {object} chars
 * @param {string} representation
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-string-token}
 */
function consumeString(chars, representation) {
    const { current: ending } = chars
    let value = ''
    representation += ending
    for (const char of chars) {
        representation += char
        switch (char) {
            case ending:
                return { representation, type: new Set(['string']), value }
            case '\n':
                createError({
                    context: `${representation}\n`,
                    message: 'unexpected newline in string',
                    type: 'ParseError',
                })
                chars.reconsume()
                return { representation, type: new Set(['bad-string']), value: '' }
            case '\\':
                if (chars.next() === '\n') {
                    representation += chars.consume()
                } else if (!chars.atEnd()) {
                    const escaped = consumeEscaped(chars)
                    representation += escaped.representation
                    value += escaped.value
                }
                break
            default:
                value += char
                break
        }
    }
    createError({ context: representation, message: 'unclosed string', type: 'ParseError' })
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
    representation += chars.consumeRunOf(isWhitespace)
    for (const char of chars) {
        representation += char
        if (char === ')') {
            return {
                representation,
                type: new Set(['url']),
                value,
            }
        }
        if (isWhitespace(char)) {
            representation += chars.consumeRunOf(isWhitespace)
            if (chars.consume(')')) {
                return {
                    representation: `${representation})`,
                    type: new Set(['url']),
                    value,
                }
            }
            return {
                representation: consumeBadUrl(chars, representation),
                type: new Set(['bad-url']),
                value: '',
            }
        }
        if (isQuote(char) || char === '(' || isNonPrintableChar(char)) {
            createError({
                context: representation,
                message: `unexpected "${char}" in url`,
                type: 'ParseError',
            })
            return {
                representation: consumeBadUrl(chars, representation),
                type: new Set(['bad-url']),
                value: '',
            }
        }
        if (char === '\\') {
            if (startsWithEscaped(chars)) {
                const escaped = consumeEscaped(chars)
                representation += escaped.representation
                value += escaped.value
                continue
            }
            representation += consumeBadUrl(chars, representation)
            createError({
                context: representation,
                message: 'invalid escaped newline',
                type: 'ParseError',
            })
            return { representation, type: new Set(['bad-url']), value: '' }
        }
        value += char
    }
    createError({ context: representation, message: 'unclosed url', type: 'ParseError' })
    return {
        representation,
        type: new Set(['url']),
        value,
    }
}

/**
 * @param {object} chars
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-token}
 */
function consumeToken(chars) {
    const representation = consumeComments(chars)
    const char = chars.consume()
    if (isWhitespace(char)) {
        return {
            representation: representation + char + chars.consumeRunOf(isWhitespace),
            type: new Set(['delimiter']),
            value: ' ',
        }
    }
    if (isQuote(char)) {
        return consumeString(chars, representation)
    }
    if (char === '#') {
        if (isIdentifierCharacter(chars.next()) || startsWithEscaped(...chars.next(2))) {
            const type = new Set(['hash'])
            if (startsWithIdentifier(...chars.next(3))) {
                type.add('id')
            }
            return { ...consumeIdentifier(chars, `#${representation}`), type }
        }
    } else if (char === '+') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars, representation)
        }
    } else if (char === '-') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars, representation)
        }
        if (chars.next(2) === '->') {
            const value = `-${chars.consume(2)}`
            return { representation: representation + value, type: new Set(['delimiter']), value }
        }
        if (startsWithIdentifier(chars)) {
            chars.reconsume()
            return consumeIdentifierLike(chars, representation)
        }
    } else if (char === '.') {
        if (startsWithNumber(chars)) {
            chars.reconsume()
            return consumeNumeric(chars, representation)
        }
    } else if (char === '<') {
        if (chars.next(3) === '!--') {
            const value = `<${chars.consume(3)}`
            return {
                representation: representation + value,
                type: new Set(['delimiter']),
                value,
            }
        }
    } else if (char === '@') {
        if (startsWithIdentifier(...chars.next(3))) {
            return {
                ...consumeIdentifier(chars, `@${representation}`),
                type: new Set(['at-keyword']),
            }
        }
    } else if (char === '\\') {
        if (startsWithEscaped(chars)) {
            chars.reconsume()
            return consumeIdentifierLike(chars, representation)
        }
        createError({ message: 'invalid escaped newline', type: 'ParseError' })
    } else if (isDigit(char)) {
        chars.reconsume()
        return consumeNumeric(chars, representation)
    }
    if (isIdentifierStartCharacter(char)) {
        chars.reconsume()
        return consumeIdentifierLike(chars, representation)
    }
    // Delimiter (including `:`, `,`, `;`, `(`, `)`, `[`, `]`, `{`, `}`)
    return {
        representation: representation + char,
        type: new Set(['delimiter']),
        value: char,
    }
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

module.exports = Object.assign(
    tokenize,
    {
        isDigit,
        isHex,
        isIdentifierCharacter,
        isNonASCIIIdentifierChar,
        isWhitespace,
    })
