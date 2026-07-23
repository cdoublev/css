
import {
    isDigit,
    isHexadecimal,
    isIdentifierCharacter,
    isIdentifierStartCharacter,
    isNonPrintableCharacter,
    isQuote,
    isWhitespace,
    startsWithDecimal,
    startsWithEscape,
    startsWithExponent,
    startsWithIdentifier,
    startsWithNumber,
    toLowerCase,
    toNumber,
} from '../utils/string.js'
import { create as error } from '../error.js'
import { serializeIdentifier } from '../serialize.js'

/**
 * @param {Stream} input
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-remnants-of-bad-url}
 */
function consumeInvalidURL(input) {
    let value = ''
    for (const character of input) {
        value += startsWithEscape(input) ? consumeEscape(input) : character
        if (character === ')') {
            break
        }
    }
    return value
}

/**
 * @param {Stream} input
 * @returns {string|undefined}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-comments}
 */
function consumeComments(input) {
    let comments = ''
    if (input.next(2) === '/*') {
        comments += input.consume(2)
        while (input.next(2) !== '*/') {
            comments += input.consume()
            if (input.atEnd()) {
                error({ message: 'Unclosed comment' })
                return
            }
        }
        comments += input.consume(2)
        comments += consumeComments(input)
    }
    return comments
}

/**
 * @param {Stream} input
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-escaped-code-point}
 */
function consumeEscape(input) {
    const character = input.consume()
    if (!character) {
        error({ message: 'Invalid escape sequence (missing code point)' })
        return '�'
    }
    if (isHexadecimal(character)) {
        let hex = character
        let hexCount = 0
        while (isHexadecimal(input.next()) && hexCount++ < 5) {
            hex += input.consume()
        }
        input.consume(isWhitespace)
        const codePoint = Number(`0x${hex}`)
        if (codePoint === 0 || (0xD800 <= codePoint && codePoint <= 0xDFFF) || codePoint > 0x10FFFF) {
            return '�'
        }
        return String.fromCodePoint(codePoint)
    }
    return character
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-ident-like-token}
 */
function consumeIdentifierLike(input) {
    const identifier = consumeIdentifier(input)
    if (input.consume('(')) {
        const { start, value } = identifier
        const lowercase = toLowerCase(value)
        if (lowercase === 'url') {
            while (isWhitespace(input.next()) && isWhitespace(input.next(1, 1))) {
                input.consume()
            }
            if (isQuote(input.next()) || (isWhitespace(input.next()) && isQuote(input.next(1, 1)))) {
                return { end: input.index + 1, start, types: ['<function-token>'], value: lowercase }
            }
            return consumeURL(input, identifier)
        }
        return { end: input.index + 1, start, types: ['<function-token>'], value: serializeIdentifier({ value }) }
    }
    return identifier
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-name}
 */
function consumeIdentifier(input) {
    const start = input.index + 1
    let value = ''
    for (const character of input) {
        if (isIdentifierCharacter(character)) {
            value += character
        } else if (startsWithEscape(input)) {
            value += consumeEscape(input)
        } else {
            input.reconsume()
            break
        }
    }
    return { end: input.index + 1, start, types: ['<ident-token>'], value }
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-number}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7289}
 */
function consumeNumber(input) {
    const entries = [
        ['start', input.index + 1],
        ['types', ['<number-token>']],
    ]
    let number = ''
    if (input.next() === '+' || input.next() === '-') {
        entries.push(['sign', number += input.consume()])
    }
    number += input.consumeRunOf(isDigit)
    if (
        startsWithDecimal(...input.next(2))
        || startsWithExponent(...input.next(2))
        || startsWithExponent(...input.next(3))
    ) {
        number += input.consume(2) + input.consumeRunOf(isDigit)
    }
    entries.push(['end', input.index + 1], ['value', toNumber(number)])
    return Object.fromEntries(entries)
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-numeric-token}
 */
function consumeNumeric(input) {
    const number = consumeNumber(input)
    const { start, value } = number
    if (startsWithIdentifier(...input.next(3))) {
        const unit = consumeIdentifier(input)
        return { end: input.index + 1, start, types: ['<dimension-token>'], unit: toLowerCase(unit.value), value }
    }
    if (input.consume('%')) {
        return { end: input.index + 1, start, types: ['<percentage-token>'], unit: '%', value }
    }
    return number
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-string-token}
 */
function consumeString(input) {
    const { current: ending, index: start } = input
    let value = ''
    for (const character of input) {
        switch (character) {
            case ending:
                return { end: input.index + 1, start, types: ['<string-token>'], value }
            case '\n':
                error({ message: 'Unexpected newline' })
                input.reconsume()
                value += '\n'
                return { end: input.index + 1, start, types: ['<bad-string-token>'], value }
            case '\\':
                if (input.next() === '\n') {
                    input.consume()
                } else if (!input.atEnd()) {
                    value += consumeEscape(input)
                }
                break
            default:
                value += character
                break
        }
    }
    error({ message: 'Unclosed string' })
    return { end: input.index + 1, start, types: ['<string-token>'], value }
}

/**
 * @param {Stream} input
 * @param {object} identifier
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-url-token}
 */
function consumeURL(input, { start }) {
    let value = ''
    input.consumeRunOf(isWhitespace)
    for (const character of input) {
        if (character === ')') {
            return { end: input.index + 1, start, types: ['<url-token>'], value }
        }
        if (isWhitespace(character)) {
            input.consumeRunOf(isWhitespace)
            if (input.consume(')')) {
                return { end: input.index + 1, start, types: ['<url-token>'], value }
            }
            if (input.atEnd()) {
                break
            }
            error({ message: 'Unexpected whitespace' })
            value += ` ${consumeInvalidURL(input)}`
            return { end: input.index + 1, start, types: ['<bad-url-token>'], value }
        }
        if (isQuote(character) || character === '(' || isNonPrintableCharacter(character)) {
            error({ message: `Unexpected "${character}"` })
            value += `${character}${consumeInvalidURL(input)}`
            return { end: input.index + 1, start, types: ['<bad-url-token>'], value }
        }
        if (character === '\\') {
            if (startsWithEscape(input)) {
                value += consumeEscape(input)
                continue
            }
            error({ message: 'Invalid escaped newline' })
            value += `${character}${consumeInvalidURL(input)}`
            return { end: input.index + 1, start, types: ['<bad-url-token>'], value }
        }
        value += character
    }
    error({ message: 'Unclosed url' })
    return { end: input.index + 1, start, types: ['<url-token>'], value }
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-token}
 */
function consumeToken(input) {
    const start = input.index + 1
    let whitespaces = 0
    for (; input.consumeRunOf(isWhitespace) || consumeComments(input); whitespaces++);
    if (0 < whitespaces) {
        return { end: input.index + 1, start, types: ['<delimiter-token>'], value: ' ' }
    }
    const character = input.consume()
    if (isQuote(character)) {
        return consumeString(input)
    }
    if (character === '#') {
        if (isIdentifierCharacter(input.next()) || startsWithEscape(...input.next(2))) {
            const type = startsWithIdentifier(...input.next(3)) ? 'id' : 'unrestricted'
            return { ...consumeIdentifier(input), type, types: ['<hash-token>'] }
        }
    } else if (character === '+') {
        if (startsWithNumber(input)) {
            input.reconsume()
            return consumeNumeric(input)
        }
    } else if (character === '-') {
        if (startsWithNumber(input)) {
            input.reconsume()
            return consumeNumeric(input)
        }
        if (input.next(2) === '->') {
            const value = `-${input.consume(2)}`
            return { end: input.index + 1, start, types: ['<delimiter-token>'], value }
        }
        if (startsWithIdentifier(input)) {
            input.reconsume()
            return consumeIdentifierLike(input)
        }
    } else if (character === '.') {
        if (startsWithNumber(input)) {
            input.reconsume()
            return consumeNumeric(input)
        }
    } else if (character === '<') {
        if (input.next(3) === '!--') {
            const value = `<${input.consume(3)}`
            return { end: input.index + 1, start, types: ['<delimiter-token>'], value }
        }
    } else if (character === '@') {
        if (startsWithIdentifier(...input.next(3))) {
            return { ...consumeIdentifier(input), types: ['<at-keyword-token>'] }
        }
    } else if (character === '\\') {
        if (startsWithEscape(input)) {
            input.reconsume()
            return consumeIdentifierLike(input)
        }
        error({ message: 'Invalid escaped newline' })
    } else if (isDigit(character)) {
        input.reconsume()
        return consumeNumeric(input)
    }
    if (isIdentifierStartCharacter(character)) {
        input.reconsume()
        return consumeIdentifierLike(input)
    }
    return { end: input.index + 1, start, types: ['<delimiter-token>'], value: character }
}

/**
 * @param {Stream} input
 * @yields {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-tokenize}
 */
export default function* tokenize(input) {
    while (!input.atEnd()) {
        yield consumeToken(input)
    }
}
