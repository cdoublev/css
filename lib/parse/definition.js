
import { associatedTokens, closingTokens } from '../values/blocks.js'
import { isCombination, isMultipliableWith } from '../utils/definition.js'
import { isDigit, isIdentifierCharacter, startsWithIdentifier } from '../utils/string.js'
import Stream from './stream.js'
import arbitrary from './arbitrary.js'
import { canonicalize } from '../values/dimensions.js'
import forgiving from '../values/forgiving.js'
import properties from '../properties/definitions.js'
import types from '../values/definitions.js'

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
 * @param {Stream} input
 * @param {number} [infinity]
 * @returns {number}
 */
function consumeRangeBoundary(input, infinity) {
    let value = input.consume('-', '') + input.consumeRunOf(isDigit)
    if (value === '-') {
        input.consume('∞', Error)
        return 0 - infinity
    }
    if (input.consume('∞') || value === '') {
        return infinity
    }
    value = Number(value)
    if (input.consume('%')) {
        return value
    }
    const unit = input.consumeRunOf(isIdentifierCharacter)
    if (value == 0 || unit === '' || unit === 'fr') {
        return value
    }
    return canonicalize({ unit, value }).value
}

/**
 * @param {Stream} input
 * @param {number} [infinity]
 * @returns {object}
 */
function consumeRange(input, infinity = Infinity) {
    const closingToken = associatedTokens[input.current]
    const bounds = []
    for (const character of input) {
        switch (character) {
            case closingToken: {
                const [min, max = min] = bounds
                return { max, min }
            }
            case ',':
                input.consume(' ')
                bounds.push(consumeRangeBoundary(input, infinity))
                break
            default:
                input.reconsume()
                bounds.push(consumeRangeBoundary(input, infinity))
                break
        }
    }
    throw SyntaxError(`Missing "${closingToken}"`)
}

/**
 * @param {Stream} input
 * @param {object} value
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeMultiplier(input, value, production) {
    inputLoop: for (const character of input) {
        switch (character) {
            case '!':
                if (isMultipliableWith(value, '!') || input.prev() === ']') {
                    value = { type: 'required', value }
                    continue
                }
                throw SyntaxError('Unexpected !')
            case '?':
                if (isMultipliableWith(value, '?') || input.prev() === ']') {
                    value = { type: 'optional', value }
                    continue
                }
                throw SyntaxError('Unexpected ?')
            case '{':
                if (isMultipliableWith(value, '{') || input.prev() === ']') {
                    value = { ...consumeRange(input, MAX_REPETITIONS), type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected {')
            case '*':
                if (isMultipliableWith(value, '*') || input.prev() === ']') {
                    value = { max: getMaxRepetitions(production), min: 0, type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected *')
            case '+':
                if (isMultipliableWith(value, '+') || input.prev() === ']') {
                    value = { max: getMaxRepetitions(production), min: 1, type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected +')
            case '#': {
                if (isMultipliableWith(value, '#') || input.prev() === ']') {
                    const range = input.consume('{')
                        ? consumeRange(input, MAX_REPETITIONS)
                        : { max: getMaxRepetitions(production), min: 1 }
                    value = { ...range, separator: ',', type: 'repetition', value }
                    continue
                }
                throw SyntaxError('Unexpected #')
            }
            default:
                input.reconsume()
                break inputLoop
        }
    }
    return value
}

/**
 * @param {Stream} input
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeDelimiter(input, production) {
    const quote = input.current
    const value = input.consume()
    input.consume(quote)
    // A [] block must be defined with quotes around `[` and `]`
    if (value === '[') {
        const value = consumeDefinition(input, production)
        input.consume(quote, Error)
        input.consume(']', Error)
        input.consume(quote, Error)
        return { associatedToken: '[', type: 'block', value }
    }
    return { type: 'token', value }
}

/**
 * @param {Stream} input
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeIdentifier(input, production) {
    let identifier = input.current
    if (!startsWithIdentifier(input)) {
        throw SyntaxError(`Unexpected ${identifier}`)
    }
    for (const character of input) {
        if (!isIdentifierCharacter(character)) {
            if (character === '(') {
                if (input.consume(')')) {
                    return { name: identifier, type: 'function' }
                }
                const value = consumeDefinition(input, production)
                input.consume(')', Error)
                return { name: identifier, type: 'function', value }
            }
            input.reconsume()
            break
        }
        identifier += character
    }
    return { name: '<keyword>', range: identifier, type: 'non-terminal', value: '<ident>' }
}

/**
 * @param {Stream} input
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeType(input, production) {
    let name = '<'
    let min
    let max
    if (production) {
        ({ max, min } = production)
    }
    let test
    for (const character of input) {
        if (character === '>') {
            name += character
            break
        }
        if (character === '[') {
            input.consume(' ')
            if (input.next() === '<') {
                test = input.consumeUntil(']')
                input.consume(']', Error)
            } else {
                ({ max, min } = consumeRange(input))
            }
        } else if (character !== ' ') {
            name += character
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
        entries.set('value', consumeDefinition(input, production))
        input.consume(')', Error)
    } else if (name.endsWith('-token>')) {
        entries.set('type', 'token')
    } else if (arbitrary[name]) {
        entries.set('type', 'arbitrary')
    } else if (forgiving[name]) {
        entries.set('type', 'forgiving')
    } else if (types[name]) {
        const { [name]: value } = types
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
 * @param {Stream} input
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeSymbolUnit(input, production) {
    input.consume(' ')
    const character = input.consume()
    switch (character) {
        case '(':
        case '{': {
            const value = consumeDefinition(input, production)
            input.consume(associatedTokens[character], Error)
            return { associatedToken: character, type: 'block', value }
        }
        case '[': {
            const group = consumeDefinition(input, production)
            input.consume(']', Error)
            return group
        }
        case '<':
            return consumeType(input, production)
        case "'":
        case '"':
            return consumeDelimiter(input, production)
        case ',':
        case '/':
        case ':':
        case ';':
            return { type: 'token', value: character }
        default:
            return consumeIdentifier(input, production)
    }
}

/**
 * @param {Stream} input
 * @param {object|null} [production]
 * @returns {object}
 */
function consumeSymbol(input, production) {
    return consumeMultiplier(input, consumeSymbolUnit(input, production), production)
}

/**
 * @param {Stream} input
 * @param {number} [offset]
 * @returns {object|null}
 */
function peekCombinator(input, offset = 0) {
    const type = input.next(1, offset)
    if (type === ' ') {
        return peekCombinator(input, offset + 1)
    }
    if (type === '|') {
        if (input.next(1, offset + 1) === '|') {
            return { end: input.index + offset + 2, precedence: 1, type: '||' }
        }
        return { end: input.index + offset + 1, precedence: 0, type }
    }
    if (type === '&') {
        if (input.next(1, offset + 1) === '&') {
            return { end: input.index + offset + 2, precedence: 2, type: '&&' }
        }
        throw SyntaxError('Unexpected &')
    }
    if (input.atEnd(offset) || closingTokens.includes(type) || (type === "'" && input.next(1, offset + 1) === ']')) {
        input.consume(' ')
        return null
    }
    return { end: input.index + offset, precedence: 3, type: ' ' }
}

/**
 * @param {Stream} input
 * @param {object|null} [production]
 * @param {object} [left]
 * @param {number} [precedence]
 * @returns {object}
 */
function consumeDefinition(input, production, left = consumeSymbol(input, production), precedence = 0) {
    let open = !isCombination(left) || left.type === ' ' || left.type === '|'
    let combinator = peekCombinator(input)
    while (combinator && precedence <= combinator.precedence) {
        const { index } = input
        const { end, precedence, type } = combinator
        input.consume(end - index)
        input.consume(' ')
        let right = consumeSymbol(input, production)
        combinator = peekCombinator(input)
        while (combinator && precedence < combinator.precedence) {
            right = consumeDefinition(input, production, right, precedence + 1)
            combinator = peekCombinator(input)
        }
        if (left.type === type && open) {
            if (type === right.type && (type === ' ' || type === '|')) {
                left.value.push(...right.value)
            } else {
                left.value.push(right)
            }
        } else if (type === right.type && (type === ' ' || type === '|')) {
            left = { type, value: [left, ...right.value] }
        } else {
            left = { type, value: [left, right] }
        }
        open = true
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
