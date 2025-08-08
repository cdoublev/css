
import { associatedTokens, closingTokens } from '../values/blocks.js'
import { isDigit, isIdentifierCharacter, startsWithIdentifier } from '../utils/string.js'
import Stream from './stream.js'
import arbitrary from './arbitrary.js'
import { canonicalize } from '../values/dimensions.js'
import { create as error } from '../error.js'
import forgiving from '../values/forgiving.js'
import { isMultipliableWith } from '../utils/definition.js'
import nonTerminals from '../values/definitions.js'
import properties from '../properties/definitions.js'

/**
 * @see {@link https://drafts.csswg.org/css-values-4/#calc-syntax}
 */
const MAX_CALCULATION_TERMS = 32

/**
 * @see {@link https://drafts.csswg.org/css-values-4/#component-multipliers}
 */
const MAX_REPETITIONS = 20

/**
 * @param {object|null} [production]
 * @returns {number}
 */
function getMaxRepetitions(production) {
    if (['<calc-product>', '<calc-sum>'].includes(production?.name)) {
        return MAX_CALCULATION_TERMS - 1
    }
    if (['<hypoth()>', '<min()>', '<max()>'].includes(production?.name)) {
        return MAX_CALCULATION_TERMS
    }
    return MAX_REPETITIONS
}

/**
 * @param {Stream} chars
 * @param {number} [infinity]
 * @returns {number}
 */
function consumeRangeBoundary(chars, infinity) {
    let value = chars.consume('-', '') + chars.consumeRunOf(isDigit)
    if (value === '-') {
        chars.consume('∞', Error)
        return 0 - infinity
    }
    if (chars.consume('∞') || value === '') {
        return infinity
    }
    value = Number(value)
    if (chars.consume('%')) {
        return value
    }
    const unit = chars.consumeRunOf(isIdentifierCharacter)
    if (value == 0 || unit === '' || unit === 'fr') {
        return value
    }
    return canonicalize({ unit, value }).value
}

/**
 * @param {Stream} chars
 * @param {number} [infinity]
 * @returns {object}
 */
function consumeRange(chars, infinity = Infinity) {
    const closingToken = associatedTokens[chars.current]
    const bounds = []
    for (const char of chars) {
        switch (char) {
            case closingToken: {
                const [min, max = min] = bounds
                return { max, min }
            }
            case ',':
                chars.consume(' ')
                bounds.push(consumeRangeBoundary(chars, infinity))
                break
            default:
                chars.reconsume()
                bounds.push(consumeRangeBoundary(chars, infinity))
                break
        }
    }
    throw error({ message: `Missing "${closingToken}"` })
}

/**
 * @param {Stream} chars
 * @param {object} value
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeMultiplier(chars, value, production) {
    charLoop: for (const char of chars) {
        switch (char) {
            case '!':
                if (isMultipliableWith(value, '!') || chars.prev() === ']') {
                    value = { type: 'required', value }
                    continue
                }
                throw SyntaxError('Unexpected !')
            case '?':
                if (isMultipliableWith(value, '?') || chars.prev() === ']') {
                    value = { type: 'optional', value }
                    continue
                }
                throw SyntaxError('Unexpected ?')
            case '{':
                if (isMultipliableWith(value, '{') || chars.prev() === ']') {
                    value = { ...consumeRange(chars, MAX_REPETITIONS), type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected {')
            case '*':
                if (isMultipliableWith(value, '*') || chars.prev() === ']') {
                    value = { max: getMaxRepetitions(production), min: 0, type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected *')
            case '+':
                if (isMultipliableWith(value, '+') || chars.prev() === ']') {
                    value = { max: getMaxRepetitions(production), min: 1, type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected +')
            case '#': {
                if (isMultipliableWith(value, '#') || chars.prev() === ']') {
                    const range = chars.consume('{')
                        ? consumeRange(chars, MAX_REPETITIONS)
                        : { max: getMaxRepetitions(production), min: 1 }
                    value = { ...range, separator: ',', type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected #')
            }
            default:
                chars.reconsume()
                break charLoop
        }
    }
    return value
}

/**
 * @param {Stream} chars
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeDelimiter(chars, production) {
    const quote = chars.current
    const value = chars.consume()
    chars.consume(quote)
    // A block associated to `[` cannot be defined with unquoted `[` and `]`
    if (value === '[') {
        const value = consumeDefinition(chars, production)
        chars.consume(quote, Error)
        chars.consume(']', Error)
        chars.consume(quote, Error)
        return { associatedToken: '[', type: 'block', value }
    }
    return { type: 'token', value }
}

/**
 * @param {Stream} chars
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeIdentifier(chars, production) {
    let identifier = chars.current
    if (!startsWithIdentifier(chars)) {
        throw SyntaxError(`Unexpected ${identifier}`)
    }
    for (const char of chars) {
        if (!isIdentifierCharacter(char)) {
            if (char === '(') {
                if (chars.consume(')')) {
                    return { name: identifier, type: 'function' }
                }
                const value = consumeDefinition(chars, production)
                chars.consume(')', Error)
                return { name: identifier, type: 'function', value }
            }
            chars.reconsume()
            break
        }
        identifier += char
    }
    return { name: '<keyword>', range: identifier, type: 'non-terminal', value: '<ident>' }
}

/**
 * @param {Stream} chars
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeType(chars, production) {
    let name = '<'
    let min
    let max
    if (production) {
        ({ max, min } = production)
    }
    let test
    charLoop: for (const char of chars) {
        switch (char) {
            case '>':
                name += char
                break charLoop
            case ' ':
                continue
            case '[': {
                chars.consume(' ')
                if (chars.next() === '<') {
                    test = chars.consumeUntil(']')
                    chars.consume(']', Error)
                } else {
                    ({ max, min } = consumeRange(chars))
                }
                continue
            }
            default:
                name += char
                continue
        }
    }
    const entries = new Map([['name', name]])
    if (typeof min === 'number') {
        entries.set('min', min)
        entries.set('max', max)
    }
    if (test) {
        entries.set('test', test)
    }
    if (name.startsWith("<'")) {
        entries.set('type', 'non-terminal')
        entries.set('value', properties[name.slice(2, -2)]?.value)
    } else if (name === '<function-token>') {
        entries.delete('name')
        entries.set('type', 'function')
        entries.set('value', consumeDefinition(chars, production))
        chars.consume(')', Error)
    } else if (name.endsWith('-token>')) {
        entries.set('type', 'token')
    } else if (arbitrary[name]) {
        entries.set('type', 'arbitrary')
    } else if (forgiving[name]) {
        entries.set('type', 'forgiving')
    } else if (nonTerminals[name]) {
        const { [name]: value } = nonTerminals
        entries.set('type', 'non-terminal')
        switch (typeof value) {
            case 'function':
                entries.set('value', value)
                break
            case 'object':
                entries.set('value', value.value)
                break
            case 'string':
                entries.set('value', value)
                break
            default:
                throw RangeError('Unexpected value definition type')
        }
    } else {
        entries.set('type', 'unknown')
    }
    return Object.fromEntries(entries)
}

/**
 * @param {Stream} chars
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeSymbolUnit(chars, production) {
    chars.consume(' ')
    const char = chars.consume()
    switch (char) {
        case '(':
        case '{': {
            const value = consumeDefinition(chars, production)
            chars.consume(associatedTokens[char], Error)
            return { associatedToken: char, type: 'block', value }
        }
        case '[': {
            const group = consumeDefinition(chars, production)
            chars.consume(']', Error)
            return group
        }
        case '<':
            return consumeType(chars, production)
        case "'":
        case '"':
            return consumeDelimiter(chars, production)
        case ',':
        case '/':
        case ':':
        case ';':
            return { type: 'token', value: char }
        default:
            return consumeIdentifier(chars, production)
    }
}

/**
 * @param {Stream} chars
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeSymbol(chars, production) {
    return consumeMultiplier(chars, consumeSymbolUnit(chars, production), production)
}

/**
 * @param {Stream} chars
 * @param {number} [offset]
 * @returns {object|null}
 */
function peekCombinator(chars, offset = 0) {
    const type = chars.next(1, offset)
    if (type === ' ') {
        return peekCombinator(chars, offset + 1)
    }
    if (type === '|') {
        if (chars.next(1, offset + 1) === '|') {
            return { end: chars.index + offset + 2, precedence: 1, type: '||' }
        }
        return { end: chars.index + offset + 1, precedence: 0, type }
    }
    if (type === '&') {
        if (chars.next(1, offset + 1) === '&') {
            return { end: chars.index + offset + 2, precedence: 2, type: '&&' }
        }
        throw SyntaxError('Unexpected &')
    }
    if (chars.atEnd(offset) || closingTokens.includes(type) || (type === "'" && chars.next(1, offset + 1) === ']')) {
        chars.consume(' ')
        return null
    }
    return { end: chars.index + offset, precedence: 3, type: ' ' }
}

/**
 * @param {Stream} chars
 * @param {object|null} [production]
 * @param {object} [left]
 * @param {number} [precedence]
 * @returns {object}
 */
function consumeDefinition(chars, production, left = consumeSymbol(chars, production), precedence = 0) {
    let combinator = peekCombinator(chars)
    while (combinator && precedence <= combinator.precedence) {
        const { end, precedence, type } = combinator
        chars.moveTo(end)
        chars.consume(' ')
        let right = consumeSymbol(chars, production)
        combinator = peekCombinator(chars)
        while (combinator && precedence < combinator.precedence) {
            right = consumeDefinition(chars, production, right, precedence + 1)
            combinator = peekCombinator(chars)
        }
        if (left.type === type) {
            if (type === right.type) {
                left.value.push(...right.value)
            } else {
                left.value.push(right)
            }
        } else {
            left = { type, value: [left, right] }
        }
    }
    return left
}

/**
 * @param {string} string
 * @param {object|null} [production]
 * @returns {object}
 */
export default function parseDefinition(string, production) {
    const definition = consumeDefinition(new Stream(string), production)
    // Ignore # at the top-level of a property value range
    if (
        production?.name.startsWith("<'")
        && definition.type === 'repetition'
        && definition.separator === ','
    ) {
        return definition.value
    }
    return definition
}
