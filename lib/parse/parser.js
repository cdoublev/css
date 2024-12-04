
const { createContext, getDeclarationValueDefinition, getRuleDefinition, getRuleType } = require('../utils/context.js')
const { isCloseCurlyBrace, isColon, isComma, isDelimiter, isOpenCurlyBrace, isSemicolon, isSimpleBlock, isWhitespace } = require('../utils/value.js')
const Stream = require('./stream.js')
const blocks = require('../values/blocks.js')
const error = require('../error.js')
const grammar = require('./grammar.js')
const { list } = require('../values/value.js')
const parseShorthand = require('./shorthand.js')
const tokenize = require('./tokenize.js')
const { serializeCSSComponentValue } = require('../serialize.js')
const shorthands = require('../properties/shorthands.js')
const substitutions = require('../values/substitutions.js')

const endingTokens = Object.values(blocks.associatedTokens)

const EXTRA_COMPONENT_VALUE_ERROR = {
    message: 'Cannot parse more than a single component value',
}
const EXTRA_RULE_ERROR = {
    message: 'Cannot parse more than a single rule',
}
const INVALID_DECLARATION_SYNTAX_ERROR = {
    message: 'Cannot parse invalid declaration',
}
const INVALID_NAMESPACE_STATE_ERROR = {
    message: 'Cannot insert @namespace when any other rule than @import or @namespace already exists',
    name: 'InvalidStateError',
}
const INVALID_RULE_INDEX_ERROR = {
    message: 'Cannot insert rule at the specified index (negative, or greater than the next index in the list of rules)',
    name: 'IndexSizeError',
}
const INVALID_RULE_POSITION_ERROR = {
    message: 'Cannot insert rule at the specified index (invalid rules hierarchy)',
    name: 'HierarchyRequestError',
}
const INVALID_RULE_SYNTAX_ERROR = {
    message: 'Cannot parse invalid rule',
}
const MISSING_COMPONENT_VALUE_ERROR = {
    message: 'Cannot parse missing component value',
}
const MISSING_RULE_ERROR = {
    message: 'Cannot parse missing rule',
}
const UNKNOWN_RULE_ERROR = {
    message: 'Cannot parse unrecognized rule',
}

/**
 * @param {Stream} tokens
 * @param {object} token
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-function}
 *
 * It deviates from the specification by trimming whitespaces in its value.
 */
function consumeFunction(tokens, { start, value: name }) {
    const value = consumeComponentValueList(tokens, [')'])
    if (!tokens.consume(isDelimiter(')'))) {
        error({ message: 'Unclosed function' })
    }
    return { end: tokens.current.end, name, start, types: ['<function>'], value }
}

/**
 * @param {Stream} tokens
 * @param {object} token
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-simple-block}
 *
 * It deviates from the specification by trimming whitespaces in its value.
 */
function consumeSimpleBlock(tokens, { start, value: associatedToken }) {
    const endingToken = blocks.associatedTokens[associatedToken]
    const value = consumeComponentValueList(tokens, [endingToken])
    if (!tokens.consume(isDelimiter(endingToken))) {
        error({ message: 'Unclosed block' })
    }
    return { associatedToken, end: tokens.current.end, start, types: ['<simple-block>'], value }
}

/**
 * @param {Stream} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-component-value}
 */
function consumeComponentValue(tokens) {
    const current = tokens.consume()
    if (blocks.associatedTokens[current.value]) {
        return consumeSimpleBlock(tokens, current)
    }
    if (current.types[0] === '<function-token>') {
        return consumeFunction(tokens, current)
    }
    return current
}

/**
 * @param {Stream} tokens
 * @param {string} [stop]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-list-of-component-values}
 *
 * It deviates from the specification by trimming whitespaces.
 *
 * It deviates from the specification by receiving `}` as a stop token and not
 * emitting a parse error when processing it while the list is not nested.
 */
function consumeComponentValueList(tokens, stops = []) {
    const values = list([], '')
    tokens.consume(isWhitespace)
    while (!tokens.atEnd()) {
        if (isDelimiter(stops, tokens.next())) {
            break
        }
        values.push(consumeComponentValue(tokens))
    }
    if (isWhitespace(values.at(-1))) {
        values.pop()
    }
    return values
}

/**
 * @param {Stream} tokens
 * @param {boolean} [nested]
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-the-remnants-of-a-bad-declaration}
 */
function consumeBadDeclaration(tokens, nested) {
    while (!tokens.atEnd()) {
        if (tokens.consume(isSemicolon)) {
            return
        }
        if (isCloseCurlyBrace(tokens.next())) {
            if (nested) {
                return
            }
            tokens.consume()
        } else {
            consumeComponentValue(tokens)
        }
    }
}

/**
 * @param {Stream} tokens
 * @param {boolean} [nested]
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-declaration}
 *
 * It deviates from the specification by returning null instead of nothing, to
 * backtrack and consume a qualified rule, or error, to consume next content.
 *
 * It deviates from the specification by consuming the declaration value like
 * for parsing <declaration-value> but returning an error for <bad-*-token>,
 * `]`, `)`, or null for a positioned {}-block, `!` not followed by `important`.
 *
 * It deviates from the specification by not validating the declaration in the
 * context.
 */
function consumeDeclaration(tokens, nested) {

    if (!tokens.consume(token => token.types[0] === '<ident-token>')) {
        return null
    }

    const name = tokens.current.value
    tokens.consume(isWhitespace)

    if (!tokens.consume(isColon)) {
        return null
    }

    tokens.consume(isWhitespace)

    let value = list([], '')
    let important = false
    let token

    // Consume declaration value
    while (token = tokens.next()) {
        const { types: [type] } = token
        // Stop token
        if (isSemicolon(token) || (nested && isCloseCurlyBrace(token))) {
            break
        }
        // Bad token
        if (type === '<bad-string-token>' || type === '<bad-url-token>' || isDelimiter(endingTokens, token)) {
            consumeBadDeclaration(tokens, nested)
            return error({ message: 'Invalid declaration value' })
        }
        // Ignore whitespace
        if (isWhitespace(token)) {
            value.push(tokens.consume())
            continue
        }
        // `!` not followed by `important`
        if (isDelimiter('!', token)) {
            tokens.consume()
            tokens.consume(isWhitespace)
            const next = tokens.consume()
            if (next?.types[0] === '<ident-token>' && next.value === 'important') {
                important = true
                break
            }
            return null
        }
        const component = consumeComponentValue(tokens)
        if (name.startsWith('--')) {
            value.push(component)
            continue
        }
        // Positioned {}-block
        if (value.some(component => !isWhitespace(component)) && isSimpleBlock('{', component)) {
            return null
        }
        const prev = value.findLast(component => !isWhitespace(component))
        if (prev && isSimpleBlock('{', prev)) {
            return null
        }
        value.push(component)
    }

    if (isWhitespace(value.at(-1))) {
        value.pop()
    }
    const types = ['<declaration>']
    if (name.startsWith('--')) {
        const source = 0 < value.length ? tokens.source.slice(value[0].start, value.at(-1).end) : ''
        return { important, name, source, types, value }
    }
    return { important, name, types, value }
}

/**
 * @param {Stream} tokens
 * @param {boolean} [nested]
 * @returns {object|undefined}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-qualified-rule}
 *
 * It deviates from the specification by consuming a list of component values
 * for its prelude with the appropriate stop tokens.
 *
 * It deviates from the specification by returning nothing without considering
 * a nested context, since a statement starting with `--` followed by `:` is
 * consumed as a declaration and not validated in this context.
 *
 * It deviates from the specification by not validating the rule in the context.
 */
function consumeQualifiedRule(tokens, nested) {
    const prelude = consumeComponentValueList(tokens, nested ? ['{', '}', ';'] : ['{'])
    if (tokens.consume(isOpenCurlyBrace)) {
        const value = consumeBlock(tokens)
        const [ident, colon] = prelude.filter(component => !isWhitespace(component))
        if (ident?.types[0] === '<ident-token>' && ident.value.startsWith('--') && isColon(colon)) {
            return
        }
        return { prelude, types: ['<rule>', '<qualified-rule>'], value }
    }
    error({ message: 'Invalid qualified rule' })
}

/**
 * @param {Stream} tokens
 * @param {boolean} [nested]
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-an-at-rule}
 *
 * It deviates from the specification by consuming a list of component values
 * for its prelude with the appropriate stop tokens.
 *
 * It deviates from the specification by not validating the rule in the context.
 */
function consumeAtRule(tokens, nested) {
    const name = tokens.consume().value.toLowerCase()
    const prelude = consumeComponentValueList(tokens, nested ? ['{', ';', '}'] : ['{', ';'])
    const types = ['<rule>', '<at-rule>']
    if (tokens.consume(isOpenCurlyBrace)) {
        return { name, prelude, source: tokens.source, types, value: consumeBlock(tokens) }
    }
    if (tokens.atEnd() || tokens.consume(isSemicolon) || (nested && isCloseCurlyBrace(tokens.next()))) {
        return { name, prelude, types }
    }
    error({ message: 'Invalid at-rule' })
}

/**
 * @param {Stream} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-block}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-blocks-contents}
 *
 * It deviates from the specification by asserting that the current token is `{`
 * and consuming contents in place.
 *
 * It deviates from the specification by not backtracking after consuming a
 * declaration whose value contains <bad-*-token>, ], ).
 */
function consumeBlock(tokens) {
    const declarations = []
    const rules = []
    const types = ['<block-contents>']
    while (!tokens.atEnd()) {
        if (tokens.consume(isWhitespace) || tokens.consume(isSemicolon)) {
            continue
        }
        if (tokens.consume(isCloseCurlyBrace)) {
            break
        }
        if (tokens.next().types[0] === '<at-keyword-token>') {
            const rule = consumeAtRule(tokens, true)
            if (rule) {
                rules.push(rule)
            }
            continue
        }
        tokens.markers.push(tokens.index)
        const declaration = consumeDeclaration(tokens, true)
        if (declaration instanceof Error) {
            continue
        }
        if (declaration) {
            declarations.push(declaration)
            tokens.markers.pop()
            continue
        }
        tokens.moveTo(tokens.markers.pop())
        const rule = consumeQualifiedRule(tokens, true)
        if (rule) {
            rules.push(rule)
        }
    }
    return { declarations, rules, types }
}

/**
 * @param {Stream} tokens
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-stylesheets-contents}
 */
function consumeStyleSheet(tokens) {
    const rules = list([], ' ', ['<block-contents>'])
    while (!tokens.atEnd()) {
        if (tokens.consume(token => isDelimiter([' ', '<!--', '-->'], token))) {
            continue
        }
        const rule = tokens.next().types[0] === '<at-keyword-token>'
            ? consumeAtRule(tokens)
            : consumeQualifiedRule(tokens)
        if (rule) {
            rules.push(rule)
        }
    }
    return rules
}

/**
 * @param {string} input
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#input-preprocessing}
 */
function preprocess(input) {
    return input.replace(/\f|\r\n?/g, '\n').replace(/[\u0000\uD800-\uDFFF]/g, '�')
}

/**
 * @param {Stream|string|object[]} input
 * @returns {Stream}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#normalize-into-a-token-stream}
 */
function normalizeIntoTokens(input) {
    if (input instanceof Stream) {
        return input
    }
    if (typeof input === 'string') {
        return new Stream(tokenize(new Stream(preprocess(input))), input)
    }
    return new Stream(input)
}

/**
 * @param {Stream|string|object[]} input
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-component-value}
 */
function parseComponentValue(input) {
    input = normalizeIntoTokens(input)
    input.consume(isWhitespace)
    if (input.atEnd()) {
        return error(MISSING_COMPONENT_VALUE_ERROR)
    }
    const value = consumeComponentValue(input)
    input.consume(isWhitespace)
    if (input.atEnd()) {
        return value
    }
    return error(EXTRA_COMPONENT_VALUE_ERROR)
}

/**
 * @param {Stream|string|object[]} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-comma-separated-list-of-component-values}
 */
function parseCommaSeparatedComponentValueList(input) {
    input = normalizeIntoTokens(input)
    if (input.atEnd()) {
        return list([], ',')
    }
    const value = list([consumeComponentValueList(input, [','])], ',')
    while (input.consume(isComma)) {
        value.push(consumeComponentValueList(input, [',']))
    }
    return value
}

/**
 * @param {Stream|string|object[]} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-component-values}
 */
function parseComponentValueList(input) {
    return consumeComponentValueList(normalizeIntoTokens(input))
}

/**
 * @param {Stream|string|object[]} input
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-declaration}
 */
function parseDeclaration(input) {
    input = normalizeIntoTokens(input)
    input.consume(isWhitespace)
    return consumeDeclaration(input) ?? error(INVALID_DECLARATION_SYNTAX_ERROR)
}

/**
 * @param {Stream|string|object[]} input
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-rule}
 */
function parseRule(input) {
    input = normalizeIntoTokens(input)
    input.consume(isWhitespace)
    if (input.atEnd()) {
        return error(MISSING_RULE_ERROR)
    }
    const rule = input.next().types[0] === '<at-keyword-token>'
        ? consumeAtRule(input)
        : consumeQualifiedRule(input)
    if (rule) {
        input.consume(isWhitespace)
        if (input.atEnd()) {
            return rule
        }
        return error(EXTRA_RULE_ERROR)
    }
    return error(INVALID_RULE_SYNTAX_ERROR)
}

/**
 * @param {Stream|string|object[]} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-blocks-contents}
 */
function parseBlockContents(input) {
    return consumeBlock(normalizeIntoTokens(input))
}

/**
 * @param {ReadableStream|Stream|string|object[]} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 */
function parseStyleSheet(input) {
    return consumeStyleSheet(normalizeIntoTokens(input))
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} grammar
 * @param {object} [context]
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 *
 * It deviates from the specification by normalizing the input in a lower level
 * entry point.
 */
function parseCSSGrammar(input, grammar, context = createContext()) {
    const match = parseCSSValue(input, grammar, context)
    return match instanceof SyntaxError ? null : match
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} grammar
 * @param {object} [context]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseCSSGrammarList(input, grammar, context = createContext()) {
    input = parseCommaSeparatedComponentValueList(input)
    if (input.length === 1) {
        const [list] = input
        if (list.length === 1 && isWhitespace(list[0])) {
            input.pop()
            return input
        }
    }
    return list(input.map(list => parseCSSGrammar(list, grammar, context)), ',')
}

/**
 * @param {Stream} input
 * @param {object} context
 * @param {string[]} names
 * @returns {SyntaxError|object[]|null}
 */
function parseCSSArbitrarySubstitution(input, names, context) {
    const matched = list([], '')
    let match = false
    for (let component of input) {
        const { name, types: [type], value } = component
        if (type === '<function>' || type === '<simple-block>') {
            if (type === '<function>') {
                if (names.includes(name)) {
                    component = parseCSSValue([component], `<${name}()>`, context)
                    if (component === null || component instanceof SyntaxError) {
                        return error({ message: 'Invalid substitution' })
                    }
                    match = true
                }
                context = { ...context, function: { context, input } }
            }
            const substitution = parseCSSArbitrarySubstitution(new Stream(value), names, context)
            if (substitution instanceof SyntaxError) {
                return substitution
            }
            if (substitution) {
                match = true
            }
        }
        matched.push(component)
    }
    input.reset()
    return match ? matched : null
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {SyntaxError|object|object[]|null}
 */
function parseCSSValueSubstitution(input, context) {
    const { rule: { definition: { cascading, elemental } } } = context
    // Try parsing CSS-wide keyword
    if (cascading || elemental) {
        const match = parseCSSValue(input, substitutions.keywords.join(' | '), context, 'greedy')
        if (match) {
            return match
        }
    }
    // Try parsing <whole-value> function
    const whole = elemental
        ? substitutions.whole
        : substitutions.whole.filter(definition => !definition.element)
    const definition = whole.map(definition => `<${definition.name}()>`).join(' | ')
    return parseCSSValue(input, definition, context, 'greedy')
}

/**
 * @param {Stream|string|object[]} input
 * @param {string} definition
 * @param {object} context
 * @param {string} [strategy]
 * @returns {SyntaxError|object|object[]|null}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-value}
 */
function parseCSSValue(input, definition, context, strategy = 'backtrack') {

    if (typeof input === 'string') {
        input = new Stream(parseComponentValueList(input), input)
    } else if (Array.isArray(input)) {
        input = new Stream(input)
    }

    const root = grammar.create(definition, input, { ...context, separator: ' ' })
    const { definition: { type } } = root
    const { forgiving, rule, trees } = context

    // Try parsing arbitrary substitutions
    if (trees.length === 0 && (type === 'descriptor' || type === 'property')) {
        const { definition: { cascading, elemental, name } } = rule
        const definitions = elemental
            ? substitutions.arbitrary
            : substitutions.arbitrary.filter(({ cascade, element }) =>
                !element && (!cascade || cascading || name === '@function'))
        const names = definitions.map(definition => definition.name)
        const substitution = parseCSSArbitrarySubstitution(input, names, context)
        if (substitution) {
            return substitution
        }
    }

    trees.push(root)

    let match = grammar.parse(root, parser)
    parsing: while (!input.atEnd()) {
        switch (root.state) {
            case 'aborted':
            case 'rejected':
                break parsing
            case 'accepted':
            case 'matched':
                break
            default:
                throw Error('Unrecognized parsing state')
        }
        switch (strategy) {
            case 'greedy':
                match = error({ message: 'Unexpected remaining component values' })
            case 'lazy':
                break parsing
            default:
                match = grammar.parse(root, parser)
        }
    }

    trees.pop()

    switch (root.state) {
        // The top-level list is guaranteed to be invalid (match is SyntaxError)
        case 'aborted':
            return forgiving ? null : match
        // The current list is invalid (match is null or undefined)
        case 'rejected': {
            if (type === 'descriptor' || type === 'property') {
                return parseCSSValueSubstitution(input, context)
            }
            return null
        }
        default:
            return match
    }
}

/**
 * @param {object} declaration
 * @param {object} [context]
 * @returns {object|null}
 */
function parseCSSDeclaration(declaration, context = createContext()) {
    if (declaration.important && !context.rule.definition.cascading) {
        return null
    }
    const definition = getDeclarationValueDefinition(declaration, context)
    if (definition) {
        const node = { context, definition, input: declaration }
        const value = parseCSSGrammar(declaration.value, definition, { ...context, declaration: node })
        if (value) {
            return { ...declaration, name: definition.name, value }
        }
    }
    return null
}

/**
 * @param {object[]} declarations
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#concept-declarations-specified-order}
 */
function getDeclarationsInSpecifiedOrder(declarations) {
    return declarations
        .flatMap(declaration => {
            const { important, name, value } = declaration
            if (shorthands.has(name)) {
                const declarations = []
                parseShorthand(value, name).forEach((value, name) =>
                    declarations.push({ important, name, value }))
                return declarations
            }
            return declaration
        })
        .reduce(
            (declarations, declaration) => {
                const { name, important } = declaration
                const index = declarations.findIndex(declaration => declaration.name === name)
                if (-1 < index) {
                    if (!important && declarations[index].important) {
                        return declarations
                    }
                    declarations.splice(index, 1)
                }
                declarations.push(declaration)
                return declarations
            },
            [])
}

/**
 * @param {Stream|string|object[]} contents
 * @param {object} context
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-declaration-block}
 */
function parseCSSDeclarationBlock(contents, context) {
    const declarations = []
    parseBlockContents(contents).declarations.forEach(statement => {
        statement = parseCSSDeclaration(statement, context)
        if (statement) {
            declarations.push(statement)
        }
    })
    return getDeclarationsInSpecifiedOrder(declarations)
}

/**
 * @param {CSSRuleImpl|object} rule
 * @returns {boolean}
 */
function isImportOrNamespaceRule(rule) {
    const type = getRuleType(rule)
    return type === '@import' || type === '@namespace'
}

/**
 * @param {CSSRuleImpl[]|object[]} list
 * @param {object} rule
 * @returns {boolean}
 */
function isInvalidNamespaceRule(list, rule) {
    return getRuleType(rule) === '@namespace'
        && !list.every(rule => isImportOrNamespaceRule(rule) || getRuleType(rule) === '@layer-statement')
}

/**
 * @param {CSSRuleImpl[]|object[]} list
 * @param {object} rule
 * @param {number} index
 * @returns {boolean}
 */
function isInvalidIndexForRule(list, rule, index) {
    switch (getRuleType(rule)) {
        case '@import':
            return !list.slice(0, index).every((rule, index, list) => {
                const type = getRuleType(rule)
                if (type === '@layer-statement') {
                    return list.slice(0, index).every(rule => getRuleType(rule) === '@layer-statement')
                }
                return type === '@import'
            })
        case '@layer-statement':
            return list.slice(0, index).some(isImportOrNamespaceRule)
                && list.slice(index).some(isImportOrNamespaceRule)
        case '@namespace':
            return !list.slice(0, index).every((rule, index, list) => {
                if (getRuleType(rule) === '@layer-statement') {
                    return list.slice(0, index).every(rule => getRuleType(rule) === '@layer-statement')
                }
                return isImportOrNamespaceRule(rule)
            })
            || list.slice(index).some(rule => getRuleType(rule) === '@import')
        default:
            return list.slice(index).some(isImportOrNamespaceRule)
    }
}

/**
 * @param {CSSRuleImpl[]} list
 * @param {object|string} rule
 * @param {number} index
 * @param {object} context
 * @returns {number}
 * @see {@link https://drafts.csswg.org/cssom-1/#insert-a-css-rule}
 */
function insertCSSRule(list, rule, index, context) {
    if (list.length < index) {
        throw error(INVALID_RULE_INDEX_ERROR)
    }
    rule = parseCSSRule(rule, context)
    if (rule instanceof SyntaxError) {
        throw error(rule)
    }
    if (isInvalidIndexForRule(list, rule, index)) {
        throw error(INVALID_RULE_POSITION_ERROR)
    }
    if (isInvalidNamespaceRule(list, rule)) {
        throw error(INVALID_NAMESPACE_STATE_ERROR)
    }
    list.splice(index, 0, createCSSRule(rule, context.rule?.value ?? context.root.value))
    return index
}

/**
 * @param {CSSRuleImpl[]} list
 * @param {number} index
 * @see {@link https://drafts.csswg.org/cssom-1/#remove-a-css-rule}
 */
function removeCSSRule(list, index) {
    if (list.length <= index) {
        throw error(INVALID_RULE_INDEX_ERROR, true)
    }
    const rule = list[index]
    if (isInvalidNamespaceRule(list, rule)) {
        throw error(INVALID_NAMESPACE_STATE_ERROR, true)
    }
    list.splice(index, 1)
    rule.parentStyleSheet = null
    rule.parentRule = null
}

/**
 * @param {object} rule
 * @param {CSSRuleImpl|CSSStyleSheetImpl} parentRule
 * @returns {CSSRule}
 */
function createCSSRule(rule, parentRule) {
    const type = rule.types.at(-1)
    const create = createRule[type]
    if (create) {
        const { parentStyleSheet } = parentRule
        const properties = parentStyleSheet
            ? { ...rule, parentRule, parentStyleSheet }
            : { ...rule, parentStyleSheet: parentRule }
        return create(globalThis, undefined, properties)
    }
    throw RangeError(`Cannot create rule of unknown type ${typeof type === 'string' ? `"${type}"` : '(not a string)'}`)
}

/**
 * @param {object|string} rule
 * @param {object} context
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-rule}
 */
function parseCSSRule(rule, context) {
    if (typeof rule === 'string') {
        rule = parseRule(rule)
        if (rule instanceof SyntaxError) {
            return rule
        }
    }
    const definition = getRuleDefinition(rule, context)
    if (definition) {
        return grammar.parse(grammar.create(definition, rule, context), parser)
    }
    return error(UNKNOWN_RULE_ERROR)
}

/**
 * @param {Stream|object|string} contents
 * @param {object} context
 * @returns {object}
 *
 * Block contents are recursively consumed since commit ed19498.
 *
 * The previous implementation could be restored to allow parsing block contents
 * with parseCSSGrammar(). Otherwise the conditional block can be removed.
 */
function parseCSSBlockContents(contents, context) {
    if (contents instanceof Stream || typeof contents === 'string') {
        contents = parseBlockContents(contents)
    }
    const declarations = []
    const rules = []
    contents.declarations.forEach(declaration => {
        declaration = parseCSSDeclaration(declaration, context)
        if (declaration) {
            declarations.push(declaration)
        }
    })
    contents.rules.forEach(rule => {
        rule = parseCSSRule(rule, context)
        if (!(rule instanceof SyntaxError)) {
            rules.push(rule)
        }
    })
    return { declarations: getDeclarationsInSpecifiedOrder(declarations), rules }
}

/**
 * @param {ReadableStream|Stream|string|object[]} contents
 * @param {object} context
 * @param {boolean} [allowImport]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 */
function parseCSSStyleSheet(contents, context, allowImport = true) {
    const rules = []
    parseStyleSheet(contents).forEach(rule => {
        const { name } = rule
        if (name === 'import' && !allowImport) {
            return
        }
        rule = parseCSSRule(rule, context)
        if (rule instanceof SyntaxError) {
            return
        }
        if (isInvalidIndexForRule(rules, rule, rules.length) || isInvalidNamespaceRule(rules, rule)) {
            return
        }
        if (name === 'namespace') {
            context.globals.get('namespaces').add(serializeCSSComponentValue(rule.prelude[0]))
        }
        rules.push(rule)
    })
    return rules
}

const parser = module.exports = {
    EXTRA_COMPONENT_VALUE_ERROR,
    EXTRA_RULE_ERROR,
    INVALID_DECLARATION_SYNTAX_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
    MISSING_COMPONENT_VALUE_ERROR,
    MISSING_RULE_ERROR,
    UNKNOWN_RULE_ERROR,
    consumeDeclaration,
    createCSSRule,
    insertCSSRule,
    parseBlockContents,
    parseCSSBlockContents,
    parseCSSDeclaration,
    parseCSSDeclarationBlock,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSRule,
    parseCSSStyleSheet,
    parseCSSValue,
    parseCommaSeparatedComponentValueList,
    parseComponentValue,
    parseComponentValueList,
    parseDeclaration,
    parseRule,
    parseStyleSheet,
    removeCSSRule,
}

// Deferred imports to avoid cycles
const createRule = {
    '@color-profile': require('../cssom/CSSColorProfileRule.js').createImpl,
    '@container': require('../cssom/CSSContainerRule.js').createImpl,
    '@counter-style': require('../cssom/CSSCounterStyleRule.js').createImpl,
    '@font-face': require('../cssom/CSSFontFaceRule.js').createImpl,
    '@font-feature-values': require('../cssom/CSSFontFeatureValuesRule.js').createImpl,
    '@font-palette-values': require('../cssom/CSSFontPaletteValuesRule.js').createImpl,
    '@function': require('../cssom/CSSFunctionRule.js').createImpl,
    '@import': require('../cssom/CSSImportRule.js').createImpl,
    '@keyframe': require('../cssom/CSSKeyframeRule.js').createImpl,
    '@keyframes': require('../cssom/CSSKeyframesRule.js').createImpl,
    '@layer-block': require('../cssom/CSSLayerBlockRule.js').createImpl,
    '@layer-statement': require('../cssom/CSSLayerStatementRule.js').createImpl,
    '@margin': require('../cssom/CSSMarginRule.js').createImpl,
    '@media': require('../cssom/CSSMediaRule.js').createImpl,
    '@namespace': require('../cssom/CSSNamespaceRule.js').createImpl,
    '@page': require('../cssom/CSSPageRule.js').createImpl,
    '@position-try': require('../cssom/CSSPositionTryRule.js').createImpl,
    '@property': require('../cssom/CSSPropertyRule.js').createImpl,
    '@scope': require('../cssom/CSSScopeRule.js').createImpl,
    '@starting-style': require('../cssom/CSSStartingStyleRule.js').createImpl,
    '@style': require('../cssom/CSSStyleRule.js').createImpl,
    '@supports': require('../cssom/CSSSupportsRule.js').createImpl,
    '@view-transition': require('../cssom/CSSViewTransitionRule.js').createImpl,
}
