
const { isComma, isDelimiter, isSimpleBlock, isWhitespace } = require('../utils/value.js')
const { list, omitted } = require('../values/value.js')
const Stream = require('./stream.js')
const blocks = require('../values/blocks.js')
const createError = require('../error.js')

const endingTokens = Object.values(blocks.associatedTokens)

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}` })
}

/**
 * @param {Stream} value
 * @param {boolean} [restricted]
 * @param {string[]} [stops]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-any-value}
 *
 * It deviates from the specification by trimming whitespaces.
 */
function matchAnyValue(input, restricted, stops = []) {
    stops = [...endingTokens, ...stops]
    const values = list([], '')
    input.consume(isWhitespace)
    while (!input.atEnd()) {
        const next = input.next()
        const type = next.types[0]
        if (
            type === '<bad-string-token>'
            || type === '<bad-url-token>'
            || isDelimiter(stops, next)
            || (restricted && (isComma(next) || isSimpleBlock('{', next)))
        ) {
            break
        }
        values.push(input.consume())
    }
    if (isWhitespace(values.at(-1))) {
        values.pop()
    }
    return 0 < values.length ? values : null
}

/**
 * @param {object} node
 * @returns {boolean}
 */
function isGeneralFunctionalNotation({ definition, input }) {
    return !(definition.name || input.current.name.startsWith('--'))
}

/**
 * @param {object} node
 * @param {function} parse
 * @returns {SyntaxError|object[]|object}
 */
function matchCommaContainingValue(node, match) {
    const { context, input, parent } = node
    if (context.function && !isGeneralFunctionalNotation(context.function)) {
        if (input.atEnd()) {
            return null
        }
        if (isSimpleBlock('{', input.next())) {
            const block = input.consume()
            const value = match(new Stream(block.value))
            if (value) {
                return value
            }
            if (parent?.definition.type === 'optional') {
                return omitted
            }
            return error(node)
        }
        if (context.function.definition.name !== 'var') {
            return match(input, true)
        }
    }
    return match(input)
}

/**
 * @param {object} node
 * @param {function} parse
 * @returns {object|null}
 */
function matchDeclaration(node, parser) {
    const declaration = parser.parseDeclaration(node.input, '@style')
    if (declaration instanceof SyntaxError) {
        return null
    }
    return declaration
}

/**
 * @param {Stream} value
 * @param {boolean} [restricted]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value}
 */
function matchDeclarationValue(value, restricted) {
    return matchAnyValue(value, restricted, [';', '!'])
}

module.exports = {
    '<any-value>': node => matchCommaContainingValue(node, matchAnyValue),
    '<declaration-value>': node => matchCommaContainingValue(node, matchDeclarationValue),
    '<declaration>': matchDeclaration,
}
