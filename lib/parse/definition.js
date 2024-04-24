
const { isDigit, isIdentifierCharacter } = require('./tokenize.js')
const { MAX_TERMS: MAX_MATH_FUNCTION_TERMS } = require('./math-function.js')
const Stream = require('./stream.js')
const arbitrary = require('./arbitrary.js')
const blocks = require('../values/blocks.js')
const { canonicalize } = require('../values/dimensions.js')
const error = require('../error.js')
const forgiving = require('../values/forgiving.js')
const nonTerminal = require('../values/definitions.js')
const properties = require('../properties/definitions.js')

const closingBlockTokens = Object.values(blocks.associatedTokens)

// UAs must support at least 20 repetitions
const MAX_REPETITIONS = 20

/**
 * @param {object|null} production
 * @returns {number}
 */
function getMaxRepetitions(production) {
    if (['<calc-product>', '<calc-sum>'].includes(production?.definition.name)) {
        return MAX_MATH_FUNCTION_TERMS - 1
    }
    if (['<hypoth()>', '<min()>', '<max()>'].includes(production?.definition.name)) {
        return MAX_MATH_FUNCTION_TERMS
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
    const endingToken = blocks.associatedTokens[chars.current]
    const bounds = []
    for (const char of chars) {
        switch (char) {
            case endingToken: {
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
    throw error({ message: `Missing "${endingToken}"` })
}

/**
 * @param {Stream} chars
 * @param {object} value
 * @param {object|null} production
 * @returns {object}
 */
function consumeMultiplier(chars, value, production) {
    charLoop: for (const char of chars) {
        switch (char) {
            case '?':
                return { type: 'optional', value }
            case '!':
                return { type: 'required', value }
            case '*':
                return { max: getMaxRepetitions(production), min: 0, type: 'repetition', value }
            case '+':
                value = { max: getMaxRepetitions(production), min: 1, type: 'repetition', value }
                continue
            case '{':
                return { type: 'repetition', value, ...consumeRange(chars, MAX_REPETITIONS) }
            case '#': {
                if (chars.consume('{')) {
                    return { separator: ',', type: 'repetition', value, ...consumeRange(chars, MAX_REPETITIONS) }
                }
                value = { max: getMaxRepetitions(production), min: 1, separator: ',', type: 'repetition', value }
                continue
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
 * @param {object|null} production
 * @returns {object}
 */
function consumeDelimiter(chars, production) {
    const quote = chars.current
    const value = chars.consume()
    chars.consume(quote)
    // A simple block associated to `[` cannot be defined with unquoted `[` and `]`
    if (value === '[') {
        const value = consumeDefinition(chars, production)
        chars.consume(quote, Error)
        chars.consume(']', Error)
        chars.consume(quote, Error)
        return { associatedToken: '[', type: 'simple-block', value }
    }
    return { type: 'token', value }
}

/**
 * @param {Stream} chars
 * @param {object|null} production
 * @returns {object}
 */
function consumeIdentifier(chars, production) {
    let { current: identifier } = chars
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
 * @param {object|null} production
 * @returns {object}
 */
function consumeType(chars, production) {
    let min
    let max
    if (production) {
        ({ definition: { max, min } } = production)
    }
    let name = '<'
    charLoop: for (const char of chars) {
        switch (char) {
            case '>':
                name += char
                break charLoop
            case ' ':
                continue
            case '[':
                ({ max, min } = consumeRange(chars))
                continue
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
    if (name.startsWith("<'")) {
        name = name.slice(2, -2)
        entries.set('type', 'property')
        entries.set('value', properties[name].value)
    } else if (name.endsWith('-token>') || name === '<function>') {
        entries.set('type', 'token')
    } else if (arbitrary[name]) {
        entries.set('type', 'arbitrary')
    } else if (blocks.contents.includes(name)) {
        entries.set('type', 'block-contents')
    } else if (forgiving[name]) {
        entries.set('type', 'forgiving')
    } else if (nonTerminal[name]) {
        entries.set('type', 'non-terminal')
        entries.set('value', nonTerminal[name])
    } else {
        throw RangeError(`Unrecognized CSS type "${name}"`)
    }
    entries.set('name', name)
    return Object.fromEntries(entries)
}

/**
 * @param {Stream} chars
 * @param {object|null} production
 * @returns {object}
 */
function consumeSymbolUnit(chars, production) {
    chars.consume(' ')
    const char = chars.consume()
    switch (char) {
        case '(':
        case '{': {
            const value = consumeDefinition(chars, production)
            chars.consume(blocks.associatedTokens[char], Error)
            return { associatedToken: char, type: 'simple-block', value }
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
 * @param {object|null} production
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
    if (chars.atEnd(offset) || closingBlockTokens.includes(type) || (type === "'" && chars.next(1, offset + 1) === ']')) {
        chars.consume(' ')
        return null
    }
    return { end: chars.index + offset, precedence: 3, type: ' ' }
}

/**
 * @param {Stream} chars
 * @param {object|null} production
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
 * @param {object|null} production
 * @returns {object}
 */
function parseDefinition(string, production) {
    const definition = consumeDefinition(new Stream(string), production)
    // Ignore # at the top-level of a property value range
    if (
        production?.parent
        && production.definition.type === 'property'
        && definition.type === 'repetition'
        && definition.separator === ','
    ) {
        return definition.value
    }
    return definition
}

module.exports = parseDefinition
