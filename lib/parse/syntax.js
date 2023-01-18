
const { isColon, isComma, isDelimiter, isOpenCurlyBrace, isSemicolon, isWhitespace } = require('../values/validation.js')
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')
const DOMException = require('domexception')
const Parser = require('./parser.js')
const Stream = require('./stream.js')
const { associatedBlockTokens } = require('../values/blocks.js')
const compatibility = require('../compatibility.js')
const createError = require('../error.js')
const { createList } = require('../values/value.js')
const descriptors = require('../descriptors/definitions.js')
const logical = require('../properties/logical.js')
const nonTerminals = require('../values/definitions.js')
const parseShorthand = require('./shorthand.js')
const properties = require('../properties/definitions.js')
const terminals = require('./terminals.js')
const tokenize = require('./tokenize.js')
const shorthands = require('../properties/shorthands.js')

const endingTokens = Object.values(associatedBlockTokens)

const COMPONENT_VALUE_OVERFLOW_ERROR = {
    message: 'Failed to parse a component value',
    name: 'SyntaxError',
    type: 'DOMException',
}
const DECLARATION_OVERFLOW_ERROR = {
    message: 'Failed to parse a declaration',
    name: 'SyntaxError',
    type: 'DOMException',
}
const EMPTY_COMPONENT_VALUE_ERROR = {
    message: 'Failed to parse a component value',
    name: 'SyntaxError',
    type: 'DOMException',
}
const EMPTY_RULE_ERROR = {
    message: 'Failed to parse a rule',
    name: 'SyntaxError',
    type: 'DOMException',
}
const INSERT_RULE_INVALID_GRAMMAR_ERROR = {
    message: 'Failed to match the grammar of the rule',
    name: 'SyntaxError',
    type: 'DOMException',
}
const INSERT_RULE_INVALID_INDEX_ERROR = {
    message: 'Cannot insert rule at the specified index (negative, or greater than the next index in the list of rules)',
    name: 'IndexSizeError',
    type: 'DOMException',
}
const INSERT_RULE_INVALID_POSITION_ERROR = {
    message: 'Cannot insert rule at the specified index (invalid rules hierarchy)',
    name: 'HierarchyRequestError',
    type: 'DOMException',
}
const INVALID_NAMESPACE_STATE_ERROR = {
    message: 'Cannot insert @namespace when a rule that is not @import or @namespace already exists',
    name: 'InvalidStateError',
    type: 'DOMException',
}
const INVALID_RULE_SYNTAX_ERROR = {
    message: 'Failed to parse a rule',
    name: 'SyntaxError',
    type: 'DOMException',
}
const RULE_OVERFLOW_SYNTAX_ERROR = {
    message: 'Failed to parse a rule',
    name: 'SyntaxError',
    type: 'DOMException',
}

const productions = {
    nonTerminals,
    structures: {
        // Productions that cannot be (directly) parsed against a grammar
        'any-value': list => parseCSSAnyValue(list),
        'declaration': (list, parser) => {
            const declaration = consumeDeclaration(list)
            return declaration
                ? parseCSSDeclaration(declaration, parser)
                : null
        },
        'declaration-list': parseCSSDeclarationList,
        'declaration-value': parseCSSDeclarationValue,
        'font-src-list': (list, parser) =>
            parseCSSGrammarList(list, '<font-src>', parser),
        'forgiving-selector-list': (list, parser) =>
            parseCSSGrammarList(list, '<complex-real-selector>', parser),
        'media-query-list': (list, parser) =>
            parseCSSGrammarList(list, '<media-query>', parser),
        'rule-list': parseCSSRuleList,
        'style-block': parseCSSStyleBlock,
        'stylesheet': parseCSSRuleList,
    },
    terminals,
}

/**
 * @param {Stream} tokens
 * @param {object} fn
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-function}
 */
function consumeFunction(tokens, { representation, value: name }) {
    const type = new Set(['function'])
    const value = createList([], '')
    for (const token of tokens) {
        if (isDelimiter(')', token)) {
            return { name, representation: `${representation})`, type, value }
        }
        tokens.reconsume()
        const component = consumeComponentValue(tokens)
        value.push(component)
        representation += component.representation
    }
    createError({ context: representation, message: 'unclosed function', type: 'ParseError' })
    return { name, representation, type, value }
}

/**
 * @param {Stream} tokens
 * @param {string} associatedToken
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-simple-block}
 */
function consumeSimpleBlock(tokens, { representation, value: associatedToken }) {
    const { [associatedToken]: endingToken } = associatedBlockTokens
    const type = new Set(['simple-block'])
    const value = createList([], '')
    for (const token of tokens) {
        if (isDelimiter(endingToken, token)) {
            return { associatedToken, representation: representation + endingToken, type, value }
        }
        tokens.reconsume()
        const component = consumeComponentValue(tokens)
        value.push(component)
        representation += component.representation
    }
    createError({ context: representation, message: 'unclosed block', type: 'ParseError' })
    return { associatedToken, representation, type, value }
}

/**
 * @param {Stream} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-component-value}
 */
function consumeComponentValue(tokens) {
    const current = tokens.consume()
    const { type, value } = current
    if (associatedBlockTokens[value]) {
        return consumeSimpleBlock(tokens, current)
    }
    if (type.has('function-token')) {
        return consumeFunction(tokens, current)
    }
    return current
}

/**
 * @param {Stream} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-declaration}
 */
function consumeDeclaration(tokens) {
    const { type, value: name } = tokens.consume()
    if (!type.has('ident')) {
        while (!isSemicolon(tokens.next()) && !tokens.atEnd()) {
            consumeComponentValue(tokens)
        }
        createError({
            message: 'invalid declaration (an identifier was expected)',
            type: 'ParseError',
        })
        return
    }
    tokens.consumeRunOf(isWhitespace)
    if (!tokens.consume(isColon)) {
        createError({
            message: `invalid declaration (":" was expected after "${name}")`,
            type: 'ParseError',
        })
        return
    }
    tokens.consumeRunOf(isWhitespace)
    const value = []
    while (!tokens.atEnd()) {
        value.push(consumeComponentValue(tokens))
    }
    while (isWhitespace(value.at(-1))) {
        value.pop()
    }
    const [penultimate, last] = value.slice(-2)
    let important = false
    if (isDelimiter('!', penultimate) && last?.type.has('ident') && last.value === 'important') {
        value.splice(-2)
        important = true
    }
    while (isWhitespace(value.at(-1))) {
        value.pop()
    }
    return { important, name, type: new Set(['declaration']), value }
}

/**
 * @param {Stream} tokens
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-list-of-declarations}
 */
function consumeDeclarationList(tokens) {
    const declarations = []
    for (const token of tokens) {
        if (isWhitespace(token) || isSemicolon(token)) {
            continue
        }
        const { type } = token
        if (type.has('at-keyword')) {
            tokens.reconsume()
            declarations.push(consumeAtRule(tokens))
            continue
        }
        if (type.has('ident')) {
            let declaration = [token]
            while (!isSemicolon(tokens.next()) && !tokens.atEnd()) {
                declaration.push(consumeComponentValue(tokens))
            }
            declaration = consumeDeclaration(new Stream(declaration))
            if (declaration) {
                declarations.push(declaration)
            }
            continue
        }
        tokens.reconsume()
        let context = ''
        while (!isSemicolon(tokens.next()) && !tokens.atEnd()) {
            context += consumeComponentValue(tokens).representation
        }
        createError({ context, message: 'invalid statement in declaration list', type: 'ParseError' })
    }
    return declarations
}

/**
 * @param {Stream} tokens
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-style-block}
 */
function consumeStyleBlock(tokens) {
    const declarations = []
    const rules = []
    for (const token of tokens) {
        if (isWhitespace(token) || isSemicolon(token)) {
            continue
        }
        const { type } = token
        if (type.has('at-keyword')) {
            tokens.reconsume()
            rules.push(consumeAtRule(tokens))
        } else if (type.has('ident') || type.has('function')) {
            let declaration = [token]
            while (!isSemicolon(tokens.next()) && !tokens.atEnd()) {
                declaration.push(consumeComponentValue(tokens))
            }
            declaration = consumeDeclaration(new Stream(declaration))
            if (declaration) {
                declarations.push(declaration)
            }
        } else {
            tokens.reconsume()
            const rule = consumeQualifiedRule(tokens, true)
            if (rule) {
                rules.push(rule)
            }
        }
    }
    return [...declarations, ...rules]
}

/**
 * @param {Stream} tokens
 * @param {boolean} [mixed]
 * @returns {object|undefined}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-qualified-rule}
 */
function consumeQualifiedRule(tokens, mixed = false) {
    const prelude = []
    const type = new Set(['rule', 'qualified-rule'])
    for (const token of tokens) {
        if (isSemicolon(token)) {
            if (mixed) {
                break
            }
            prelude.push(token)
            continue
        }
        if (isOpenCurlyBrace(token)) {
            return { prelude, type, value: consumeSimpleBlock(tokens, token) }
        }
        const { associatedToken, type: blockType } = token
        if (blockType.has('simple-block') && associatedToken === '{') {
            return { prelude, type, value: token }
        }
        tokens.reconsume()
        prelude.push(consumeComponentValue(tokens))
    }
    createError({
        context: prelude.reduce((string, { representation }) => `${string}${representation}`, ''),
        message: 'invalid qualified rule',
        type: 'ParseError',
    })
}

/**
 * @param {Stream} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-an-at-rule}
 */
function consumeAtRule(tokens) {
    const { value: name } = tokens.consume()
    const prelude = []
    const type = new Set(['rule', 'at-rule'])
    for (const token of tokens) {
        if (isSemicolon(token)) {
            return { name, prelude, type }
        }
        if (isOpenCurlyBrace(token)) {
            return { name, prelude, type, value: consumeSimpleBlock(tokens, token) }
        }
        const { associatedToken, type: blockType } = token
        if (blockType.has('simple-block') && associatedToken === '{') {
            return { name, prelude, type, value: token }
        }
        tokens.reconsume()
        prelude.push(consumeComponentValue(tokens))
    }
    createError({ message: 'invalid at rule', type: 'ParseError' })
    return { name, prelude, type }
}

/**
 * @param {Stream} tokens
 * @param {boolean} topLevel
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-list-of-rules}
 */
function consumeRuleList(tokens, topLevel = false) {
    const rules = []
    for (const token of tokens) {
        if (isWhitespace(token)) {
            continue
        }
        if (isDelimiter('<!--', token) || isDelimiter('-->', token)) {
            if (!topLevel) {
                tokens.reconsume()
                const rule = consumeQualifiedRule(tokens)
                if (rule) {
                    rules.push(rule)
                }
            }
            continue
        }
        if (token.type.has('at-keyword')) {
            tokens.reconsume()
            rules.push(consumeAtRule(tokens))
            continue
        }
        tokens.reconsume()
        const rule = consumeQualifiedRule(tokens)
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
    // eslint-disable-next-line no-control-regex
    return input.replace(/\r|\f|\r\n/, '\\n').replace(/[\u0000\uD800-\uDFFF]/g, '�')
}

/**
 * @param {Stream|string} input
 * @returns {Stream}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#normalize-into-a-token-stream}
 */
function normalizeIntoTokens(input) {
    if (typeof input === 'string') {
        input = tokenize(new Stream(preprocess(input)))
    } else if (input.source) {
        // Already a stream
        return input
    }
    return new Stream(input)
}

/**
 * @param {Stream|object[]|string} input
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-component-value}
 */
function parseComponentValue(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(isWhitespace)
    if (input.atEnd()) {
        return createError(EMPTY_COMPONENT_VALUE_ERROR)
    }
    const component = consumeComponentValue(input)
    if (component) {
        return component
    }
    input.consumeRunOf(isWhitespace)
    if (input.atEnd()) {
        return component
    }
    return createError(COMPONENT_VALUE_OVERFLOW_ERROR)
}

/**
 * @param {Stream|object[]|string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-comma-separated-list-of-component-values}
 */
function parseCommaSeparatedComponentValuesList(input) {
    input = normalizeIntoTokens(input)
    const list = createList([], ',')
    const components = []
    for (const token of input) {
        if (isComma(token)) {
            list.push(components.splice(0))
            continue
        }
        components.push(token)
    }
    if (0 < components.length) {
        list.push(components)
    }
    return list
}

/**
 * @param {Stream|object[]|string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-component-values}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6484}
 *
 * It deviates from CSS Syntax by removing any leading or trailing whitespace.
 */
function parseComponentValuesList(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(isWhitespace)
    const list = []
    while (!input.atEnd()) {
        list.push(consumeComponentValue(input))
    }
    while (isWhitespace(list.at(-1))) {
        list.pop()
    }
    return list
}

/**
 * @param {Stream|object[]|string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-declarations}
 */
function parseDeclarationList(input) {
    return consumeDeclarationList(normalizeIntoTokens(input))
}

/**
 * @param {Stream|object[]|string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-style-blocks-contents}
 */
function parseStyleBlock(input) {
    return consumeStyleBlock(normalizeIntoTokens(input))
}

/**
 * @param {Stream|object[]|string} input
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-declaration}
 */
function parseDeclaration(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(isWhitespace)
    if (input.next().type.has('ident')) {
        const declaration = consumeDeclaration(input)
        if (declaration) {
            return declaration
        }
    }
    return createError(DECLARATION_OVERFLOW_ERROR)
}

/**
 * @param {Stream|object[]|string} input
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-rule}
 */
function parseRule(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(isWhitespace)
    if (input.atEnd()) {
        return createError(EMPTY_RULE_ERROR)
    }
    let rule
    if (input.next().type.has('at-keyword')) {
        rule = consumeAtRule(input)
    } else {
        rule = consumeQualifiedRule(input)
        if (!rule) {
            return createError(INVALID_RULE_SYNTAX_ERROR)
        }
    }
    input.consumeRunOf(isWhitespace)
    if (input.atEnd()) {
        return rule
    }
    return createError(RULE_OVERFLOW_SYNTAX_ERROR)
}

/**
 * @param {Stream|object[]|string} input
 * @param {boolean} [topLevel]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-rules}
 */
function parseRuleList(input, topLevel = false) {
    return consumeRuleList(normalizeIntoTokens(input), topLevel)
}

/**
 * @param {Stream|object[]|string} input
 * @param {string} grammar
 * @param {Parser} [parser]
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 */
function parseCSSGrammar(input, grammar, parser = createParser()) {
    return parser.parse(parseComponentValuesList(input), grammar)
}

/**
 * @param {Stream|object[]|string} input
 * @param {string} grammar
 * @param {Parser} [parser]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseCSSGrammarList(input, grammar, parser) {
    input = parseCommaSeparatedComponentValuesList(input)
    const { length } = input
    if (length === 0) {
        input.omitted = true
        return input
    }
    if (length === 1) {
        const [component] = input
        if (component.length === 1 && isWhitespace(component[0])) {
            input.pop()
            return input
        }
    }
    return input.map(list => parseCSSGrammar(list, grammar, parser))
}

/**
 * @param {Stream|object[]|string} list
 * @param {string[]} [exclude]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-any-value}
 */
function parseCSSAnyValue(list, exclude = []) {
    const values = []
    for (const component of list) {
        const { type, value } = component
        if (type.has('bad-string')
            || type.has('bad-url')
            || (type.has('delimiter') && (endingTokens.includes(value) || exclude.includes(value)))) {
            return null
        }
        values.push(component)
    }
    return createList(values, '')
}

/**
 * @param {Stream|object[]|string}
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value}
 */
function parseCSSDeclarationValue(list) {
    return parseCSSAnyValue(list, [';', '!'])
}

/**
 * @param {Stream|object[]|string} value
 * @param {string} descriptor
 * @param {Parser} [parser]
 * @returns {object|object[]}
 */
function parseCSSDescriptorValue(value, descriptor, parser = createParser()) {
    const { descriptors: { mappings } } = compatibility
    if (mappings.has(descriptor)) {
        descriptor = mappings.get(descriptor)
    }
    const definition = descriptors[`@${parser.context.type}`]?.[descriptor]?.value
    if (definition) {
        return parser.parse(parseComponentValuesList(value), definition)
    }
    return null
}

/**
 * @param {Stream|object[]|string} list
 * @param {Parser} [parser]
 * @returns {object[]|null|undefined}
 */
function parseCSSCustomVariables(list, parser = createParser()) {
    let hasCustomVariables = false
    for (const component of list) {
        const { name, type, value } = component
        if (type.has('function')) {
            if (name === 'var') {
                hasCustomVariables = true
                if (parser.parse([component], '<var()>') && parseCSSCustomVariables(value) !== undefined) {
                    continue
                }
                return
            }
            const withCustomVariables = parseCSSCustomVariables(value, parser)
            if (withCustomVariables === undefined) {
                return
            }
            if (withCustomVariables) {
                hasCustomVariables = true
            }
        }
    }
    if (hasCustomVariables) {
        return createList(list, '')
    }
    return null
}

/**
 * @param {Stream|object[]|string} value
 * @param {string} property
 * @param {Parser} [parser]
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-value}
 */
function parseCSSPropertyValue(value, property, parser = createParser()) {
    const list = parseComponentValuesList(value)
    const cssWideKeyword = parser.parse(list, '<css-wide-keyword>')
    if (cssWideKeyword) {
        return cssWideKeyword
    }
    const withCustomVariables = parseCSSCustomVariables(list, parser)
    if (withCustomVariables === undefined) {
        // Invalid `var()`
        return null
    }
    if (withCustomVariables) {
        return withCustomVariables
    }
    if (property.startsWith('--')) {
        return parser.parse(list, '<declaration-value>?')
    }
    const { properties: { mappings } } = compatibility
    if (mappings.has(property)) {
        property = mappings.get(property)
    }
    return parser.parse(list, `<'${property}'>`)
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
 * @param {object} declaration
 * @param {object[]} declarations
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/cssom-1/#set-a-css-declaration}
 */
function setCSSDeclaration(declaration, declarations) {
    const { important, name } = declaration
    const index = declarations.findIndex(declaration => declaration.name === name)
    if (-1 < index) {
        const { [name]: { group } = {} } = properties
        let needsAppend = false
        if (group) {
            const { [group]: mappings } = logical
            const mapping = mappings.find(mapping => !mapping.includes(name))
            needsAppend = declarations
                .slice(index + 1)
                .some(({ name }) => mapping.includes(name))
        }
        if (!needsAppend) {
            const prevDeclaration = declarations[index]
            if (
                serializeCSSValue(declaration) === serializeCSSValue(prevDeclaration)
                && important === prevDeclaration.important
            ) {
                return false
            }
            declarations.splice(index, 1, declaration)
            return true
        }
        declarations.splice(index, 1)
    }
    declarations.push(declaration)
    return true
}

/**
 * @param {object} declaration
 * @param {Parser} [parser]
 * @returns {object}
 *
 * Descriptor declarations appears in the block value of at-rules whose type is
 * <declaration-list>. Some descriptors match a property value definition and
 * are parsed as such.
 *
 * Property declarations appears in the block value of a qualified rule or an
 * at-rule whose block value type is <style-block>, and in the prelude of some
 * at-rules.
 */
function parseCSSDeclaration({ important, name, type, value }, parser = createParser()) {
    const {
        context: {
            definition: {
                cascading,
                properties = [],
                value: blockValueType,
            },
        },
    } = parser
    if (important && !cascading) {
        return null
    }
    if (properties.includes(name) || (name.startsWith('--') && blockValueType === '<style-block>')) {
        const { properties: { aliases } } = compatibility
        if (aliases.has(name)) {
            name = aliases.get(name)
        }
        value = parseCSSPropertyValue(value, name, parser)
    } else {
        const { descriptors: { aliases } } = compatibility
        if (aliases.has(name)) {
            name = aliases.get(name)
        }
        value = parseCSSDescriptorValue(value, name, parser)
    }
    return value ? { important, name, type, value } : null
}

/**
 * @param {*[]} list
 * @param {object} rule
 * @returns {boolean}
 */
function isInvalidCSSNamespaceRule(list, { type }) {
    return type.has('namespace') && list.some(({ type }) => !type.has('import') && !type.has('namespace'))
}

/**
 * @param {*[]} list
 * @param {object} rule
 * @param {number} index
 * @returns {boolean}
 */
function isInvalidIndexForRule(list, rule, index) {
    const { type } = rule
    if (type.has('import')) {
        return list.slice(0, index).some(({ type }) => !type.has('import'))
    }
    if (type.has('namespace')) {
        return isInvalidCSSNamespaceRule(list.slice(0, index), rule)
            || list.slice(index).some(({ type }) => type.has('import'))
    }
    return list.slice(index).some(({ type }) => type.has('import') || type.has('namespace'))
}

/**
 * @param {CSSRuleImpl[]} list
 * @param {object} rule
 * @param {number} index
 * @param {CSSRuleImpl|CSSStyleSheetImpl} [parentRule]
 * @returns {index}
 * @see {@link https://drafts.csswg.org/cssom-1/#insert-a-css-rule}
 */
function insertCSSRule(list, rule, index, parentRule) {
    const { length } = list
    if (length < index) {
        throw createError(INSERT_RULE_INVALID_INDEX_ERROR)
    }
    rule = parseCSSRule(rule, parentRule)
    if (rule instanceof DOMException && rule.name === 'SyntaxError') {
        throw rule
    }
    if (isInvalidIndexForRule(list, rule, index)) {
        throw createError(INSERT_RULE_INVALID_POSITION_ERROR)
    }
    if (isInvalidCSSNamespaceRule(list, rule)) {
        throw createError(INVALID_NAMESPACE_STATE_ERROR)
    }
    list.splice(index, 0, createCSSRule(rule, parentRule))
    return index
}

/**
 * @param {CSSRule[]} list
 * @param {number} index
 * @see {@link https://drafts.csswg.org/cssom-1/#remove-a-css-rule}
 */
function removeCSSRule(list, index) {
    const { length } = list
    if (length <= index) {
        throw createError(INSERT_RULE_INVALID_INDEX_ERROR)
    }
    const rule = list[index]
    if (isInvalidCSSNamespaceRule(list, rule)) {
        throw createError(INVALID_NAMESPACE_STATE_ERROR)
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
    const type = [...rule.type].at(-1)
    const create = createRule[type]
    if (create) {
        const { parentStyleSheet } = parentRule
        const properties = parentStyleSheet
            ? { ...rule, parentRule, parentStyleSheet }
            : { ...rule, parentStyleSheet: parentRule }
        return create(globalThis, undefined, properties)
    }
    throw Error(`Cannot create rule of unknown type ${typeof type === 'string' ? `"${type}"` : '(not a string)'}"`)
}

/**
 * @param {object} rule
 * @param {Parser} parser
 * @returns {object|null}
 */
function matchRule(rule, parser) {
    const alias = compatibility.rules.aliases.get(rule.name)
    if (alias) {
        rule.name = alias
    }
    const { name, type } = rule
    /**
     * Encoding is handled when decoding the byte stream and "all @charset rules
     * are [otherwise] ignored".
     */
    if (name === 'charset') {
        return null
    }
    const { context: parent } = parser
    const context = parent.enter(rule)
    if (!context) {
        createError({ message: 'unrecognized or invalid rule in this context', type: 'ParseError' })
        return null
    }
    parser.context = context
    const { definition: { prelude: preludeDefinition, value: blockDefinition } } = context
    let { prelude, value } = rule
    if (preludeDefinition) {
        prelude = parser.parse(prelude, preludeDefinition)
        if (prelude === null) {
            parser.context = parent
            createError({ message: "invalid rule's prelude", type: 'ParseError' })
            return null
        }
        if (name === 'namespace') {
            const [prefix] = prelude
            context.root.namespaces.push(serializeCSSComponentValue(prefix))
        }
    } else if (prelude.some(component => !isWhitespace(component))) {
        parser.context = parent
        createError({ message: "unexpected rule's prelude", type: 'ParseError' })
        return null
    }
    if (blockDefinition) {
        if (value) {
            const { value: list } = value
            if (blockDefinition === '<style-block>') {
                value = parseCSSStyleBlock(list, parser)
            } else if (blockDefinition === '<declaration-list>') {
                value = parseCSSDeclarationList(list, parser)
            } else {
                value = parseCSSRuleList(list, parser)
            }
        } else {
            parser.context = parent
            createError({ message: "missing rule's block", type: 'ParseError' })
            return null
        }
    } else if (value) {
        parser.context = parent
        createError({ message: "unexpected rule's block", type: 'ParseError' })
        return null
    }
    parser.context = parent
    if (name) {
        if (value) {
            return { name, prelude, type, value }
        }
        return { name, prelude, type }
    }
    return { prelude, type, value }
}

/**
 * @param {string} rule
 * @param {CSSRuleImpl} [parentRule]
 * @returns {DOMException|object}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-rule}
 */
function parseCSSRule(rule, parentRule) {
    rule = parseRule(rule)
    if (rule instanceof DOMException && rule.name === 'SyntaxError') {
        return rule
    }
    rule = matchRule(rule, createParser(parentRule))
    if (rule === null) {
        return createError(INSERT_RULE_INVALID_GRAMMAR_ERROR)
    }
    return rule
}

/**
 * @param {Stream|object[]|string} input
 * @param {Parser} [parser]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-declaration-block}
 */
function parseCSSDeclarationBlock(input, parser = createParser()) {
    const declarations = []
    parseDeclarationList(input).forEach(statement => {
        if (statement.type.has('declaration')) {
            statement = parseCSSDeclaration(statement, parser)
            if (statement) {
                declarations.push(statement)
            }
        }
    })
    return declarations
}

/**
 * @param {Stream|object[]|string} list
 * @param {Parser} parser
 * @returns {object}
 */
function parseCSSDeclarationList(list, parser) {
    const declarations = []
    const rules = []
    parseDeclarationList(list).forEach(statement => {
        if (statement.type.has('at-rule')) {
            statement = matchRule(statement, parser)
            if (statement) {
                rules.push(statement)
            }
        } else {
            statement = parseCSSDeclaration(statement, parser)
            if (statement) {
                declarations.push(statement)
            }
        }
    })
    return { declarations, rules }
}

/**
 * @param {Stream|object[]|string} list
 * @param {Parser} parser
 * @returns {object}
 */
function parseCSSStyleBlock(list, parser) {
    const declarations = []
    const rules = []
    parseStyleBlock(list).forEach(statement => {
        if (statement.type.has('rule')) {
            statement = matchRule(statement, parser)
            if (statement) {
                rules.push(statement)
            }
        } else {
            statement = parseCSSDeclaration(statement, parser)
            if (statement) {
                declarations.push(statement)
            }
        }
    })
    return { declarations, rules }
}

/**
 * @param {Stream|object[]|string} list
 * @param {Parser} parser
 * @param {boolean} [topLevel]
 * @returns {object}
 */
function parseCSSRuleList(list, parser, topLevel = false) {
    const rules = parseRuleList(list, topLevel).reduce(
        (rules, rule) => {
            rule = matchRule(rule, parser)
            if (rule) {
                rules.push(rule)
            }
            return rules
        },
        [])
    return { declarations: [], rules }
}

/**
 * @param {CSSStyleSheetImpl} styleSheet
 * @param {ReadableStream|string} input
 * @param {boolean} ignoreImport
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 *
 * It is run from CSSStyleSheet.
 */
function parseCSSStyleSheet(styleSheet, input, ignoreImport = false) {
    const parser = createParser(styleSheet)
    const { rules: list } = parseCSSRuleList(input, parser, true)
    return list.reduce(
        (rules, rule) => {
            if (!(ignoreImport && rule.name === 'import')
                && !isInvalidCSSNamespaceRule(rules, rule)
                && !isInvalidIndexForRule(rules, rule, rules.length)) {
                rules.push(rule)
            }
            return rules
        },
        [])
}

/**
 * @param {CSSRuleImpl|CSSStyleSheetImpl|null} [block]
 * @returns {Parser}
 */
function createParser(block) {
    return new Parser(block, productions)
}

module.exports = {
    COMPONENT_VALUE_OVERFLOW_ERROR,
    DECLARATION_OVERFLOW_ERROR,
    EMPTY_COMPONENT_VALUE_ERROR,
    EMPTY_RULE_ERROR,
    INSERT_RULE_INVALID_GRAMMAR_ERROR,
    INSERT_RULE_INVALID_INDEX_ERROR,
    INSERT_RULE_INVALID_POSITION_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
    RULE_OVERFLOW_SYNTAX_ERROR,
    createCSSRule,
    createParser,
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseCSSDeclaration,
    parseCSSDeclarationBlock,
    parseCSSDescriptorValue,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSPropertyValue,
    parseCSSStyleSheet,
    parseRule,
    removeCSSRule,
    setCSSDeclaration,
}

// "Late" imports to avoid circular dependency issues until `webidl2js` uses ES modules
// const CSSColorProfileRule = require('../cssom/CSSColorProfileRule.js')
// const CSSContainerRule = require('../cssom/CSSContainerRule.js')
// const CSSCounterStyleRule = require('../cssom/CSSCounterStyleRule.js')
const CSSFontFaceRule = require('../cssom/CSSFontFaceRule.js')
// const CSSFontFeatureValuesRule = require('../cssom/CSSFontFeatureValuesRule.js')
// const CSSFontPaletteValuesRule = require('../cssom/CSSFontPaletteValuesRule.js')
const CSSImportRule = require('../cssom/CSSImportRule.js')
const CSSKeyframeRule = require('../cssom/CSSKeyframeRule.js')
const CSSKeyframesRule = require('../cssom/CSSKeyframesRule.js')
// const CSSLayerBlockRule = require('../cssom/CSSLayerBlockRule.js')
// const CSSLayerStatementRule = require('../cssom/CSSLayerStatementRule.js')
const CSSMarginRule = require('../cssom/CSSMarginRule.js')
const CSSMediaRule = require('../cssom/CSSMediaRule.js')
const CSSNamespaceRule = require('../cssom/CSSNamespaceRule.js')
const CSSPageRule = require('../cssom/CSSPageRule.js')
// const CSSPropertyRule = require('../cssom/CSSPropertyRule.js')
const CSSStyleRule = require('../cssom/CSSStyleRule.js')
const CSSSupportsRule = require('../cssom/CSSSupportsRule.js')

const createRule = {
    // 'color-profile': CSSColorProfileRule.createImpl,
    // 'container': CSSContainerRule.createImpl,
    // 'counter-style': CSSCounterStyleRule.createImpl,
    'font-face': CSSFontFaceRule.createImpl,
    // 'font-feature-values': CSSFontFeatureValuesRule.createImpl,
    // 'font-palette-values': CSSFontPaletteValuesRule.createImpl,
    'import': CSSImportRule.createImpl,
    'keyframe': CSSKeyframeRule.createImpl,
    'keyframes': CSSKeyframesRule.createImpl,
    // 'layer-block': CSSLayerBlockRule.createImpl,
    // 'layer-statement': CSSLayerStatementRule.createImpl,
    'margin': CSSMarginRule.createImpl,
    'media': CSSMediaRule.createImpl,
    'namespace': CSSNamespaceRule.createImpl,
    'page': CSSPageRule.createImpl,
    // 'property': CSSPropertyRule.createImpl,
    'style': CSSStyleRule.createImpl,
    'supports': CSSSupportsRule.createImpl,
}
