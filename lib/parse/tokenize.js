
import {
    isDigit,
    isHexadecimal,
    isIdentifierCharacter,
    isIdentifierStartCharacter,
    isNonPrintableCharacter,
    isQuote,
    isSurrogate,
    isWhitespace,
    startsWithDecimal,
    startsWithEscaped,
    startsWithExponent,
    startsWithIdentifier,
    startsWithNumber,
    toNumber,
} from '../utils/string.js'
import { create as error } from '../error.js'

/**
 * @param {Stream} chars
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-remnants-of-bad-url}
 */
function consumeInvalidURL(chars) {
    let value = ''
    for (const char of chars) {
        value += startsWithEscaped(chars) ? consumeEscapedCodePoint(chars) : char
        if (char === ')') {
            break
        }
    }
    return value
}

/**
 * @param {Stream} chars
 * @returns {string|undefined}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-comments}
 */
function consumeComments(chars) {
    let comments = ''
    if (chars.next(2) === '/*') {
        comments += chars.consume(2)
        while (chars.next(2) !== '*/') {
            comments += chars.consume()
            if (chars.atEnd()) {
                error({ message: 'Unclosed comment' })
                return
            }
        }
        comments += chars.consume(2)
        comments += consumeComments(chars)
    }
    return comments
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
        chars.consume(isWhitespace)
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
            return consumeURL(chars, identifier)
        }
        return { end: chars.index + 1, start, types: ['<function-token>'], value: CSS.escape(value) }
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
    entries.push(['end', chars.index + 1], ['value', toNumber(number)])
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
                value += '\n'
                return { end: chars.index + 1, start, types: ['<bad-string-token>'], value }
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
 * @param {object} identifier
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-url-token}
 */
function consumeURL(chars, { start }) {
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
            if (chars.atEnd()) {
                break
            }
            error({ message: 'Unexpected whitespace' })
            value += ` ${consumeInvalidURL(chars)}`
            return { end: chars.index + 1, start, types: ['<bad-url-token>'], value }
        }
        if (isQuote(char) || char === '(' || isNonPrintableCharacter(char)) {
            error({ message: `Unexpected "${char}"` })
            value += `${char}${consumeInvalidURL(chars)}`
            return { end: chars.index + 1, start, types: ['<bad-url-token>'], value }
        }
        if (char === '\\') {
            if (startsWithEscaped(chars)) {
                value += consumeEscapedCodePoint(chars)
                continue
            }
            error({ message: 'Invalid escaped newline' })
            value += `${char}${consumeInvalidURL(chars)}`
            return { end: chars.index + 1, start, types: ['<bad-url-token>'], value }
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
    let whitespaces = 0
    for (; chars.consumeRunOf(isWhitespace) || consumeComments(chars); whitespaces++);
    if (0 < whitespaces) {
        return { end: chars.index + 1, start, types: ['<delimiter-token>'], value: ' ' }
    }
    const char = chars.consume()
    if (isQuote(char)) {
        return consumeString(chars)
    }
    if (char === '#') {
        if (isIdentifierCharacter(chars.next()) || startsWithEscaped(...chars.next(2))) {
            const type = startsWithIdentifier(...chars.next(3)) ? 'id' : 'unrestricted'
            return { ...consumeIdentifier(chars), type, types: ['<hash-token>'] }
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
            return { ...consumeIdentifier(chars), types: ['<at-keyword-token>'] }
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
    return { end: chars.index + 1, start, types: ['<delimiter-token>'], value: char }
}

/**
 * @param {Stream} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-tokenize}
 */
export default function tokenize(input) {
    const tokens = []
    while (!input.atEnd()) {
        tokens.push(consumeToken(input))
    }
    return tokens
}
