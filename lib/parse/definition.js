
const { MAX_TERMS: MAX_MATH_FUNCTION_TERMS } = require('./math-functions.js')
const { isDigit, isIdentifierCharacter } = require('./tokenize.js')
const Stream = require('./stream.js')
const { associatedBlockTokens } = require('../values/blocks.js')
const { canonicalize } = require('../values/dimensions.js')
const properties = require('../properties/definitions.js')

// UAs must support at least 20 repetitions
const MAX_REPEAT = 20

const cache = new Map()
const combinators = ['|', '||', '&&', ' ']

/**
 * @param {object} [parent]
 * @returns {number}
 */
function getMaxRepeat(parent) {
    switch (parent?.definition.name) {
        case 'calc-sum':
        case 'calc-product':
            return MAX_MATH_FUNCTION_TERMS - 1
        case 'hypoth':
        case 'min':
        case 'max':
            return MAX_MATH_FUNCTION_TERMS
        default:
            return MAX_REPEAT
    }
}

/**
 * @param {object} string
 * @param {number} [infinity]
 * @returns {number}
 */
function consumeRangeBoundary(string, infinity) {
    let value = ''
    value += string.consume('-', '')
    value += string.consumeRunOf(isDigit)
    if (value === '-') {
        string.consume('∞', Error)
        return 0 - infinity
    }
    if (string.consume('∞')) {
        return infinity
    }
    value = Number(value)
    const unit = string.consumeRunOf(isIdentifierCharacter)
    if (unit) {
        ({ value } = canonicalize({ unit, value }))
    }
    return value
}

/**
 * @param {object} string
 * @param {number} [infinity]
 * @returns {object}
 */
function consumeRange(string, infinity = Infinity) {
    const { [string.current]: endingToken } = associatedBlockTokens
    const bounds = []
    for (const char of string) {
        switch (char) {
            case endingToken:
                const [min, max = min] = bounds
                return { max, min }
            case ',':
                string.consume(' ')
                bounds.push(consumeRangeBoundary(string, infinity))
                break
            default:
                string.reconsume()
                bounds.push(consumeRangeBoundary(string, infinity))
                break
        }
    }
    throw Error(`Missing "${endingToken}"`)
}

/**
 * @param {object} string
 * @param {object} value
 * @param {object} [parent]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#component-multipliers}
 */
function consumeMultiplier(string, value, parent) {
    charLoop: for (const char of string) {
        switch (char) {
            case '?':
                return { type: 'optional', value }
            case '!':
                return { type: 'required', value }
            case '*':
                return { max: getMaxRepeat(parent), min: 0, type: 'repeat', value }
            case '+':
                value = { max: getMaxRepeat(parent), min: 1, type: 'repeat', value }
                continue
            case '{':
                return { type: 'repeat', value, ...consumeRange(string, MAX_REPEAT) }
            case '#':
                if (parent?.definition.type === 'property' && parent.parent) {
                    return value
                }
                if (string.consume('{')) {
                    return { separator: ',', type: 'repeat', value, ...consumeRange(string, MAX_REPEAT) }
                }
                value = { max: getMaxRepeat(parent), min: 1, separator: ',', type: 'repeat', value }
                continue
            default:
                string.reconsume()
                break charLoop
        }
    }
    return value
}

/**
 * @param {object} string
 * @param {object} [parent]
 * @returns {object}
 */
function consumeIdentifier(string, parent) {
    let { current: identifier } = string
    for (const char of string) {
        if (!isIdentifierCharacter(char)) {
            // Function
            if (char === '(') {
                // `clip` is defined with `rect()` instead of `<rect()>`
                if (identifier === 'rect' && string.consume(')')) {
                    return { type: 'non-terminal', value: 'rect()' }
                }
                const value = string.consumeUntil(')')
                if (value === '') {
                    throw Error(`The arguments of the function named "${identifier}" are undefined`)
                }
                string.consume()
                return { name: identifier, type: 'function', value }
            }
            string.reconsume()
            break
        }
        identifier += char
    }
    // Keyword
    return consumeMultiplier(string, { name: 'keyword', type: 'terminal', value: identifier }, parent)
}

/**
 * @param {object} string
 * @param {object} productions
 * @param {object} [parent]
 * @returns {object}
 */
function consumeType(string, productions, parent = { definition: {} }) {
    let { definition: { max, min } } = parent
    let name = ''
    charLoop: for (const char of string) {
        switch (char) {
            case '>':
                break charLoop
            case ' ':
                continue
            case '[':
                ({ max, min } = consumeRange(string))
                continue
            default:
                name += char
                continue
        }
    }
    let type
    let value
    if (name.startsWith("'")) {
        name = name.slice(1, -1)
        type = 'property'
        value = properties[name].value
    } else if (productions.structures[name]) {
        type = 'structure'
    } else if (productions.terminals[name]) {
        type = 'terminal'
    } else if (productions.nonTerminals[name]) {
        type = 'non-terminal'
        value = productions.nonTerminals[name]
    } else {
        throw RangeError(`Unrecognized CSS type "<${name}>"`)
    }
    let definition
    if (value) {
        definition = typeof max === 'number' ? { max, min, name, type, value } : { name, type, value }
    } else {
        definition = typeof max === 'number' ? { max, min, name, type } : { name, type }
    }
    return consumeMultiplier(string, definition, parent)
}

/**
 * @param {object} string
 * @returns {object}
 */
function consumeDelimiter(string) {
    const { current: quote } = string
    const value = string.consume()
    string.consume(quote, false)
    // A simple block associated to `[` cannot be defined with unquoted `[` and `]`
    if (value === '[') {
        return consumeSimpleBlock(string, value, quote)
    }
    return consumeMultiplier(string, { type: 'delimiter', value })
}

/**
 * @param {object} string
 * @returns {string}
 */
function consumeCombinator(string) {
    let { current } = string
    const next = string.next()
    if (next === '&' || next === '|') {
        current = string.consume()
        if (current === '&') {
            current += string.consume('&', Error)
        } else if (current === '|') {
            current += string.consume('|', '')
        }
        string.consume(' ')
    }
    return current
}

/**
 * @param {object} string
 * @param {string} [quote]
 * @returns {object}
 */
function consumeSimpleBlock(string, associatedToken = string.current, quote) {
    const endToken = associatedBlockTokens[associatedToken]
    let value = string.consumeUntil(endToken)
    if (associatedToken === '[') {
        // Consume nested combination group(s)
        while (string.consume(endToken) && !string.consume(quote)) {
            value += `${endToken}${string.consumeUntil(endToken)}`
        }
        // Remove closing quote preceding `]`
        value = value.slice(0, -1)
    } else {
        string.consume(endToken)
    }
    return { associatedToken, type: 'simple-block', value: value.trim() }
}

/**
 * @param {object} string
 * @param {object} productions
 * @param {object} [parent]
 * @returns {object}
 */
function consumeGroup(string, productions, parent) {
    let group = ''
    let open = 1
    string.consume(' ')
    for (const char of string) {
        if (char === ']') {
            if (open === 1) {
                return consumeMultiplier(string, parseDefinition(group, productions), parent)
            }
            open--
        } else if (char === '[') {
            open++
        }
        group += char
    }
    throw Error(`Missing "]" for closing group " ${group} ]"`)
}

/**
 * @param {Stream|string} string
 * @param {object} productions
 * @param {object} [init]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#value-defs}
 */
function parseDefinition(string, productions, { parent, type, useCache = false, value = [] } = {}) {
    let cacheId
    if (typeof string === 'string') {
        if (useCache && cache.has(string)) {
            return cache.get(string)
        }
        cacheId = string
        string = new Stream(string)
    }
    charLoop: for (const char of string) {
        switch (char) {
            // Group
            case '[':
                value.push(consumeGroup(string, productions, parent))
                break
            // Simple block
            case '(':
                value.push(consumeSimpleBlock(string))
                break
            // Combination
            case ' ':
            case '&':
            case '|':
                const { index } = string
                const combinator = consumeCombinator(string)
                // First or same combinator (eg. `a a a`)
                if (!type || type === combinator) {
                    type = combinator
                    break
                }
                // Next combinator has higher precedence (eg. `a && a a`)
                if (combinators.indexOf(type) < combinators.indexOf(combinator)) {
                    const init = {
                        parent: { definition: { type } },
                        type: combinator,
                        value: [value.pop()],
                    }
                    value.push(parseDefinition(string, productions, init))
                    break
                }
                // Resume parent combination (eg. `a && a a | b` or `a && a a && b`)
                if (combinators.includes(parent?.definition.type)) {
                    string.moveTo(index - 1)
                    break charLoop
                }
                // Next combinator has lower precedence (eg. `a a && b`)
                value.push({ type, value: value.splice(0) })
                type = combinator
                break
            // Delimiter
            case "'":
            case '"':
                value.push(consumeDelimiter(string))
                break
            case ':':
            case ',':
            case '/':
                const definition = { type: 'delimiter', value: char }
                if (type === ' ') {
                    value.push(definition)
                    break
                }
                const init = {
                    parent: { definition: { type } },
                    type: ' ',
                    value: string.source.startsWith(char) ? [definition] : [value.pop(), definition],
                }
                value.push(parseDefinition(string, productions, init))
                break
            // Production
            case '<':
                value.push(consumeType(string, productions, parent))
                break
            // Keyword or function
            default:
                value.push(consumeIdentifier(string, parent))
                break
        }
    }
    const definition = type ? { type, value } : value[0]
    if (cacheId) {
        cache.set(cacheId, definition)
    }
    return definition
}

module.exports = Object.assign(parseDefinition, {
    combinators,
})
