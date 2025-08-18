
import { associatedTokens, closingTokens, openingTokens } from '../values/blocks.js'
import { delimiter, list, omitted } from '../values/value.js'
import { enterContext, getFunction, getRule, isInputAtEnd, isProducedBy } from '../utils/context.js'
import { getDeclarationDefinition, matchBlockContents, matchStyleSheet, parseGrammar } from './parser.js'
import { isCloseCurlyBrace, isDelimiter, isError, isOpenCurlyBrace, isWhitespace } from '../utils/value.js'
import { create as createError } from '../error.js'

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}` })
}

/**
 * @param {object} node
 * @param {string[]} [stops]
 * @param {string} [closingToken]
 * @returns {SyntaxError|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-any-value}
 */
function matchAnyValue(node, stops, closingToken) {

    const { input } = node
    const tokens = list([], '')

    input.consume(isWhitespace)

    while (closingToken ? (!input.atEnd() && !input.peek(isDelimiter(closingToken))) : (!isInputAtEnd(node) && !input.peek(isDelimiter(stops)))) {

        const token = input.consume()
        const type = token.types[0]

        if (isDelimiter(closingTokens, token) || type === '<bad-string-token>' || type === '<bad-url-token>') {
            return error(node)
        }
        if (isDelimiter(openingTokens, token) || type === '<function-token>') {
            const associatedToken = type === '<delimiter-token>' ? associatedTokens[token.value] : ')'
            const value = matchAnyValue(node, stops, associatedToken)
            if (!value) {
                break
            }
            if (isError(value)) {
                return value
            }
            tokens.push(token, ...value, input.consume(isDelimiter(associatedToken)) ?? delimiter(associatedToken))
            continue
        }
        tokens.push(token)
    }

    if (isWhitespace(tokens.at(-1))) {
        tokens.pop()
    }

    // Allow empty value only if nested
    if (!closingToken && tokens.length === 0) {
        return null
    }
    return tokens
}

/**
 * @param {object} node
 * @param {function} match
 * @returns {SyntaxError|object[]|null}
 */
function matchCommaContainingValue(node, match) {
    const { input, parent } = node
    const fn = getFunction(node)
    // Do not restrict functions defined with a general notation except custom function definitions
    if (fn && (fn.definition.name || isProducedBy(node, '<default-value>'))) {
        if (isInputAtEnd(node)) {
            if (parent?.definition.type === 'optional') {
                return omitted
            }
            return null
        }
        if (input.consume(isOpenCurlyBrace)) {
            const value = match(node, ['}'])
            if (isError(value)) {
                return value
            }
            input.consume(isCloseCurlyBrace)
            if (value) {
                return value
            }
            if (parent?.definition.type === 'optional') {
                return omitted
            }
            return error(node)
        }
        if (!isProducedBy(fn, '<var()>')) {
            return match(node, [',', '{'])
        }
    }
    return match(node)
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|null}
 */
function matchDeclaration(node) {
    const { input } = node
    const token = input.next()
    if (token.types[0] === '<ident-token>') {
        const definition = getDeclarationDefinition(node, token.value)
        if (definition) {
            return parseGrammar(input, definition, node)
        }
    }
    return null
}

/**
 * @param {object} node
 * @param {string[]} stops
 * @returns {SyntaxError|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value}
 */
function matchDeclarationValue(node, stops = []) {
    return matchAnyValue(node, [...stops, ';', '!'])
}

export default {
    '<any-value>': node => matchCommaContainingValue(node, matchAnyValue),
    '<at-rule-list>': matchBlockContents,
    '<block-contents>': matchBlockContents,
    '<declaration-list>': matchBlockContents,
    '<declaration-rule-list>': matchBlockContents,
    '<declaration-value>': node => matchCommaContainingValue(node, matchDeclarationValue),
    '<declaration>': matchDeclaration,
    '<qualified-rule-list>': matchBlockContents,
    '<rule-list>': node => getRule(node).definition.name === '@sheet'
        ? matchStyleSheet(node)
        : matchBlockContents(node),
}
