
const associatedBlockTokens = require('../values/associated-block-tokens.js')
const createStream = require('./stream.js')
const types = require('../values/types.js')

// UAs must support at least 20 repetitions
const MAX_REPEAT = 20

const cache = new Map()
const combinators = ['|', '||', '&&', ' ']

/**
 * @param {object} definition
 * @param {string} currentChar
 * @param {number} [infinity]
 * @returns {number}
 */
function consumeRangeBoundary(definition, currentChar, infinity) {
    let value = currentChar
    while (/\d/.test(definition.next())) {
        value += definition.consume()
    }
    if (value === '' || definition.consume('∞')) {
        return infinity
    }
    return Number(value)
}

/**
 * @param {object} definition
 * @param {number} [infinity]
 * @returns {object}
 */
function consumeRange(definition, infinity = Infinity) {
    const bounds = []
    for (const currentChar of definition) {
        switch (currentChar) {
            case ']':
            case '}':
                const [min, max = bounds[0]] = bounds
                return { max, min }
            case ',':
                bounds.push(consumeRangeBoundary(definition, '', infinity))
                break
            default:
                bounds.push(consumeRangeBoundary(definition, currentChar))
                break
        }
    }
    throw Error('Missing "]" or "}" for closing a range value or a multiplier')
}

/**
 * @param {object} definition
 * @param {object} config
 * @param {object} repeat
 * @returns {object|void}
 * @see {@link https://drafts.csswg.org/css-values-4/#component-multipliers}
 */
function consumeMultiplier(definition, { ignoreHash, max = MAX_REPEAT } = {}, repeat = { max: 1, min: 1 }) {
    for (const currentChar of definition) {
        switch (currentChar) {
            case '?':
                return { ...repeat, optional: true }
            case '!':
                return { ...repeat, optional: false }
            case '*':
                return { max, min: 0 }
            case '+':
                if (definition.consume('#')) {
                    if (definition.consume('?')) {
                        return { max, min: 0, separator: [' ', ','] }
                    }
                    return { max, min: 1, separator: [' ', ','] }
                }
                return { max, min: 1 }
            case '{':
                return consumeRange(definition, max)
            case '#':
                if (ignoreHash) {
                    return
                }
                if (definition.consume('?')) {
                    return { max, min: 1, optional: true, separator: ',' }
                }
                if (definition.consume('{')) {
                    return { ...consumeRange(definition, max), separator: ',' }
                }
                return { max, min: 1, separator: ',' }
            default:
                definition.reconsume()
                return
        }
    }
}

/**
 * @param {string} definition
 * @param {string} type
 * @returns {string}
 *
 * Eg. it returns `bar` from `foo(bar)` when `type` is `foo()`.
 */
function consumeFunctionName(definition, type) {
    return definition.replace(type.slice(0, -1), '').slice(0, -1)
}

/**
 * @param {object} definition
 * @param {string} fn
 * @returns {string}
 */
function consumeFunctionArguments(definition, fn) {
    const args = definition.consumeUntil(')')
    definition.consume()
    // Terminal notation: `fn(<args>)`
    if (args) {
        return args
    }
    // Non-terminal notation: `<fn()>` (or `rect()`)
    definition = types[fn]
    const alias = definition.replace(/[<>]/g, '')
    // `<alias()> = <target()>`
    if (alias.endsWith('()')) {
        return consumeFunctionName(types[alias], alias)
    }
    return consumeFunctionName(definition, fn)
}

/**
 * @param {object} definition
 * @param {string} currentChar
 * @param {repeat} [repeat]
 * @returns {object}
 *
 * All function types are wrapped between `<` and `>`, except `rect()` or when
 * the arguments are directly expanded, eg. `fit-content(<length-percentage)`.
 * When wrapped between `<` and `>`, the function name is `currentChar`.
 */
function consumeIdentifier(definition, currentChar, repeat) {
    let identifier = currentChar
    for (const currentChar of definition) {
        if (!/[-\w]/.test(currentChar)) { // !isIdentifierChar(currentChar)
            // Identifier is a function name
            if (currentChar === '(') {
                const args = consumeFunctionArguments(definition, `${identifier}()`)
                return { name: identifier, type: 'function', value: args }
            }
            // Identifier is a keyword
            definition.reconsume()
            break
        }
        identifier += currentChar
    }
    const node = { type: 'keyword', value: identifier }
    const multiplier = consumeMultiplier(definition, repeat)
    if (multiplier) {
        node.repeat = multiplier
    }
    return node
}

/**
 * @param {object} definition
 * @param {object} [repeat]
 * @returns {object}
 */
function consumeType(definition, repeat) {
    let type = ''
    let range
    for (const currentChar of definition) {
        if (currentChar === ' ') {
            continue
        }
        // <type()>
        if (currentChar === '(') {
            definition.consume(')', false)
            definition.reconsume(2)
            const node = consumeIdentifier(definition, type, repeat)
            definition.consume('>', false)
            return node
        }
        // <type>
        if (currentChar === '>') {
            const node = {}
            if (type.startsWith("'")) {
                node.type = 'property'
                node.value = type.slice(1, -1)
            } else {
                node.type = types[type] ? 'non-terminal' : 'basic'
                node.value = type
            }
            if (range) {
                node.range = range
            }
            const multiplier = consumeMultiplier(definition, repeat)
            if (multiplier) {
                node.repeat = multiplier
            }
            return node
        }
        // <type [...]>
        if (currentChar === '[') {
            range = consumeRange(definition)
            continue
        }
        type += currentChar
    }
    throw Error(`Missing ">" for closing CSS type "${type}>"`)
}

/**
 * @param {object} definition
 * @param {string} delimiter
 * @param {string} [quote]
 * @returns {object}
 */
function consumeDelimiter(definition, value, quote) {
    if (quote) {
        definition.consume(quote, false)
    }
    // A simple block associated to `[` can not be defined with unquoted `[` and `]`
    if (value === '[') {
        return consumeSimpleBlock(definition, value, quote)
    }
    return { type: 'delimiter', value }
}

/**
 * @param {object} definition
 * @param {string} combinator
 * @param {string} currentCombinator
 * @returns {string}
 */
function consumeCombinator(definition, combinator, currentCombinator) {
    const next = definition.next()
    if (combinator === ' ' && (next === '&' || next === '|')) {
        return currentCombinator
    }
    if (combinator === '&') {
        combinator += definition.consume('&', false)
    } else if (combinator === '|') {
        combinator += definition.consume('|', '')
    }
    if (combinator !== ' ') {
        definition.consume(' ', false)
    }
    return combinator
}

/**
 * @param {object} definition
 * @param {string} associatedToken
 * @param {string} [quote]
 * @returns {object}
 */
function consumeSimpleBlock(definition, associatedToken, quote) {
    const endToken = associatedBlockTokens[associatedToken]
    let args = definition.consumeUntil(endToken)
    // A simple block associated to `[` can not be defined with unquoted `[` and `]`
    if (associatedToken === '[') {
        while (definition.consume(endToken) && !definition.consume(quote)) {
            args += `${endToken}${definition.consumeUntil(endToken)}`
        }
        // Remove opening quote
        args = args.slice(0, -1)
    } else {
        definition.consume(endToken)
    }
    return { associatedToken, type: 'simple-block', value: args.trim() }
}

/**
 * @param {object} definition
 * @param {object} [repeat]
 * @returns {object}
 */
function consumeGroup(definition, repeat) {
    let group = ''
    let open = 1
    for (const currentChar of definition) {
        if (currentChar === ']') {
            if (open === 1) {
                const node = parseDefinition(group)
                const multiplier = consumeMultiplier(definition, repeat, node.repeat)
                if (multiplier) {
                    // Do not mutate `node` (it may come from the cache)
                    return { ...node, repeat: multiplier }
                }
                return node
            }
            open--
        } else if (currentChar === '[') {
            open++
        }
        group += currentChar
    }
    throw Error(`Missing "]" for closing group " ${group} ]"`)
}

/**
 * @param {object} definition
 * @param {object} [init]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#value-defs}
 */
function parseDefinition(definition, { combinator, nodes = [], parentCombinator, repeat, useCache = false } = {}) {
    let cacheId
    if (typeof definition === 'string') {
        if (useCache && cache.has(definition)) {
            return cache.get(definition)
        }
        cacheId = definition
        definition = createStream(definition)
    }
    charLoop: for (const currentChar of definition) {
        switch (currentChar) {
            // Group
            case '[':
                definition.consume(' ')
                nodes.push(consumeGroup(definition, repeat))
                break
            // Simple block
            case '(':
                nodes.push(consumeSimpleBlock(definition))
                break
            // Separators
            case ' ':
            case '&':
            case '|':
                const nextCombinator = consumeCombinator(definition, currentChar, combinator)
                // First or same combinator (eg. `a b c`)
                if (!combinator || combinator === nextCombinator) {
                    combinator = nextCombinator
                    break
                }
                // Next combinator has higher precedence (eg. `a && a a`)
                if (combinators.indexOf(combinator) < combinators.indexOf(nextCombinator)) {
                    const init = {
                        combinator: nextCombinator,
                        nodes: [nodes.pop()],
                        parentCombinator: combinator,
                    }
                    nodes.push(parseDefinition(definition, init))
                    break
                }
                // Next combinator has lower precedence than parent combinator (eg. `a && a a | b`) or they are the same (eg. `a && a a && b`)
                if (parentCombinator) {
                    // Back to the leading whitespace before next combinator (can not be a whitespace)
                    definition.reconsume(nextCombinator.length + 1)
                    break charLoop
                }
                // Next combinator has lower precedence and there is no parent combinator (eg. `a a && b`)
                nodes.push({ type: combinator, value: nodes.splice(0) })
                combinator = nextCombinator
                break
            // Delimiter between quotes
            case "'":
            case '"':
                nodes.push(consumeDelimiter(definition, definition.consume(), currentChar))
                break
            // Comma delimiter
            case ',':
                if (combinator && combinator !== ' ') {
                    const comma = consumeDelimiter(definition, currentChar)
                    const init = {
                        combinator: ' ',
                        nodes: definition.source.startsWith(',')
                            ? [comma]
                            : [nodes.pop(), comma],
                        parentCombinator: combinator,
                    }
                    nodes.push(parseDefinition(definition, init))
                    break
                }
                combinator = ' '
                // Falls through
            // Forward slash delimiter
            case '/':
                nodes.push(consumeDelimiter(definition, currentChar))
                break
            // Type
            case '<':
                nodes.push(consumeType(definition, repeat))
                break
            // Keyword or function
            default:
                nodes.push(consumeIdentifier(definition, currentChar, repeat))
                break
        }
    }
    const ast = nodes.length === 1 ? nodes[0] : { type: combinator, value: nodes }
    if (cacheId) {
        cache.set(cacheId, ast)
    }
    return ast
}

module.exports = parseDefinition
