
import { associatedTokens, closingTokens, openingTokens } from '../values/blocks.js'
import { enterContext, getFunction, getRule, isInputAtEnd, isProducedBy } from '../utils/context.js'
import { getDeclarationDefinition, matchBlockContents, matchStyleSheet, parseGrammar } from './parser.js'
import { isCloseCurlyBrace, isDelimiter, isError, isOpenCurlyBrace, isWhitespace } from '../utils/value.js'
import { list, omitted } from '../values/value.js'
import { create as createError } from '../error.js'

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}` })
}

/**
 * @param {Stream} value
 * @param {string[]} [stops]
 * @param {string} [closingToken]
 * @returns {SyntaxError|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-any-value}
 *
 * It deviates from the specification by trimming whitespaces.
 */
function matchAnyValue(node, stops, closingToken) {

    const { input } = node
    const tokens = list([], '')

    input.consume(isWhitespace)

    while (closingToken ? !input.atEnd() : !isInputAtEnd(node) && !input.peek(isDelimiter(stops))) {

        const token = input.consume()
        const type = token.types[0]

        if (type === '<bad-string-token>' || type === '<bad-url-token>') {
            return error(node)
        }
        if (isDelimiter(openingTokens, token) || type === '<function-token>') {
            const closingToken = type === '<delimiter-token>' ? associatedTokens[token.value] : ')'
            const value = matchAnyValue(node, stops, closingToken)
            if (!value) {
                break
            }
            if (isError(value)) {
                return value
            }
            tokens.push(token, ...value)
            continue
        }
        if (isDelimiter(closingTokens, token)) {
            if (token.value === closingToken) {
                tokens.push(token)
                break
            }
            // Orphan closing token
            return error(node)
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
 * @returns {CSSFontFeatureValuesMapImpl[]|CSSRuleImpl[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-block-contents}
 */
function matchStyleSheetOrRuleBlockValue(node) {
    if (getRule(node).definition.name === '@sheet') {
        return matchStyleSheet(node)
    }
    return matchBlockContents(node)
}

/**
 * @param {object} node
 * @param {function} parse
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
    const token = node.input.next()
    if (token.types[0] === '<ident-token>') {
        const context = enterContext(node, '@style')
        const definition = getDeclarationDefinition(context, token.value)
        if (definition) {
            return parseGrammar(node.input, definition, context)
        }
    }
    return null
}

/**
 * @param {Stream} value
 * @param {boolean} [restricted]
 * @returns {SyntaxError|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value}
 */
function matchDeclarationValue(node, stops = []) {
    return matchAnyValue(node, [...stops, ';', '!'])
}

export default {
    '<any-value>': node => matchCommaContainingValue(node, matchAnyValue),
    '<at-rule-list>': matchStyleSheetOrRuleBlockValue,
    '<block-contents>': matchStyleSheetOrRuleBlockValue,
    '<declaration-list>': matchStyleSheetOrRuleBlockValue,
    '<declaration-rule-list>': matchStyleSheetOrRuleBlockValue,
    '<declaration-value>': node => matchCommaContainingValue(node, matchDeclarationValue),
    '<declaration>': matchDeclaration,
    '<qualified-rule-list>': matchStyleSheetOrRuleBlockValue,
    '<rule-list>': matchStyleSheetOrRuleBlockValue,
}
