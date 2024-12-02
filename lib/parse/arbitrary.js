
const Stream = require('./stream.js')
const createError = require('../error.js')
const { isSimpleBlock } = require('../utils/value.js')
const { omitted } = require('../values/value.js')

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}` })
}

/**
 * @param {object} node
 * @param {function} parse
 * @returns {SyntaxError|object[]|object}
 */
function matchCommaContaining(node, parse) {
    const { context, input, parent } = node
    if (context.function) {
        const next = input.next()
        if (next === undefined) {
            return null
        }
        if (next && isSimpleBlock('{', next)) {
            const block = input.consume()
            const match = parse(new Stream(block.value))
            if (match) {
                return match
            }
            if (parent?.definition.type === 'optional') {
                return omitted
            }
            return error(node)
        }
        return parse(input, context.function.definition.name !== 'var')
    }
    return parse(input)
}

module.exports = {
    '<any-value>': (node, parser) => matchCommaContaining(node, parser.consumeAnyValue),
    '<declaration-value>': (node, parser) => matchCommaContaining(node, parser.consumeDeclarationValue),
    '<declaration>': (node, parser) => parser.consumeDeclaration(node.input),
}
