
const { isBlock, isComma, isDelimiter, isWhitespace } = require('../utils/value.js')
const { getFunction, getRule, isProducedBy } = require('../utils/context.js')
const { list, omitted } = require('../values/value.js')
const Stream = require('./stream.js')
const blocks = require('../values/blocks.js')
const createError = require('../error.js')

const closingTokens = Object.values(blocks.associatedTokens)

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
    stops = [...closingTokens, ...stops]
    const values = []
    input.consume(isWhitespace)
    while (!input.atEnd()) {
        const next = input.next()
        const type = next.types[0]
        if (
            type === '<bad-string-token>'
            || type === '<bad-url-token>'
            || isDelimiter(stops, next)
            || (restricted && (isComma(next) || isBlock(next, '{')))
        ) {
            break
        }
        values.push(input.consume())
    }
    if (isWhitespace(values.at(-1))) {
        values.pop()
    }
    return 0 < values.length ? list(values, '') : null
}

/**
 * @param {object} node
 * @param {object} parser
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-block-contents}
 */
function matchBlockContents(node, parser) {
    if (getRule(node)) {
        return parser.parseBlockContents(node.input, node)
    }
    return parser.parseStyleSheet(node.input, node)
}

/**
 * @param {object} node
 * @param {function} parse
 * @returns {SyntaxError|object[]|null}
 */
function matchCommaContainingValue(node, match) {
    const { input, parent } = node
    const context = getFunction(node)
    // Do not restrict functions defined with a general notation except custom function definitions
    if (context && (context.definition.name || context.input.current.name.startsWith('--'))) {
        if (input.atEnd()) {
            return null
        }
        if (isBlock(input.next(), '{')) {
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
        if (!isProducedBy(context, '<var()>')) {
            return match(input, true)
        }
    }
    return match(input)
}

/**
 * @param {object} node
 * @param {function} parse
 * @returns {SyntaxError|object|null}
 */
function matchDeclaration(node, parser) {
    return parser.parseDeclaration(node.input, '@style')
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
    '<at-rule-list>': matchBlockContents,
    '<block-contents>': matchBlockContents,
    '<declaration-list>': matchBlockContents,
    '<declaration-rule-list>': matchBlockContents,
    '<declaration-value>': node => matchCommaContainingValue(node, matchDeclarationValue),
    '<declaration>': matchDeclaration,
    '<qualified-rule-list>': matchBlockContents,
    '<rule-list>': matchBlockContents,
}
