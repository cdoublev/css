
const { getContexts, getDeclarationValueDefinition, getNamespaces, getRuleDefinition } = require('../utils/context.js')
const { isColon, isComma, isDelimiter, isOpenCurlyBrace, isSemicolon, isWhitespace } = require('../values/validation.js')
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')
const ParseTree = require('./tree.js')
const Stream = require('./stream.js')
const { associatedBlockTokens } = require('../values/blocks.js')
const compatibility = require('../compatibility.js')
const createError = require('../error.js')
const { createList } = require('../values/value.js')
const logical = require('../properties/logical.js')
const nonTerminals = require('../values/definitions.js')
const parseShorthand = require('./shorthand.js')
const properties = require('../properties/definitions.js')
const terminals = require('./terminals.js')
const tokenize = require('./tokenize.js')
const shorthands = require('../properties/shorthands.js')
const substitutions = require('../values/substitutions.js')

const endingTokens = Object.values(associatedBlockTokens)

const COMPONENT_VALUE_OVERFLOW_ERROR = {
    message: 'Failed to parse a component value',
    type: SyntaxError,
}
const EMPTY_COMPONENT_VALUE_ERROR = {
    message: 'Failed to parse a component value',
    type: SyntaxError,
}
const EMPTY_RULE_ERROR = {
    message: 'Failed to parse a rule',
    type: SyntaxError,
}
const INVALID_DECLARATION_SYNTAX_ERROR = {
    message: 'Failed to parse a declaration',
    type: SyntaxError,
}
const INVALID_NAMESPACE_STATE_ERROR = {
    message: 'Cannot insert @namespace when a rule that is not @import or @namespace already exists',
    name: 'InvalidStateError',
    type: 'DOMException',
}
const INVALID_RULE_INDEX_ERROR = {
    message: 'Cannot insert rule at the specified index (negative, or greater than the next index in the list of rules)',
    name: 'IndexSizeError',
    type: 'DOMException',
}
const INVALID_RULE_POSITION_ERROR = {
    message: 'Cannot insert rule at the specified index (invalid rules hierarchy)',
    name: 'HierarchyRequestError',
    type: 'DOMException',
}
const INVALID_RULE_SYNTAX_ERROR = {
    message: 'Failed to parse a rule',
    type: SyntaxError,
}
const RULE_OVERFLOW_SYNTAX_ERROR = {
    message: 'Failed to parse a rule',
    type: SyntaxError,
}

const productions = {
    nonTerminals,
    structures: {
        // Productions that cannot be (directly) parsed against a grammar
        'any-value': list => parseCSSAnyValue(list),
        'declaration': list => {
            const declaration = parseDeclaration(list)
            if (declaration instanceof SyntaxError) {
                return null
            }
            return declaration
        },
        'declaration-list': (list, parser) => parser.parseDeclarationList(list),
        'declaration-value': parseCSSDeclarationValue,
        'font-src-list': (list, parser) => parseCSSGrammarList(list, '<font-src>', parser),
        'forgiving-selector-list': (list, parser) => parseCSSGrammarList(list, '<complex-real-selector>', parser),
        'media-query-list': (list, parser) => parseCSSGrammarList(list, '<media-query>', parser),
        'rule-list': (list, parser) => parser.parseRuleList(list),
        'style-block': (list, parser) => parser.parseStyleBlock(list),
        'stylesheet': (list, parser) => parser.parseRuleList(list),
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
    const value = createList()
    for (const token of tokens) {
        if (isDelimiter(')', token)) {
            representation += token.representation
            return { name, representation, type, value }
        }
        tokens.reconsume()
        const component = consumeComponentValue(tokens)
        value.push(component)
        representation += component.representation
    }
    createError({ context: representation, message: 'unclosed function', type: SyntaxError })
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
    const value = createList()
    for (const token of tokens) {
        if (isDelimiter(endingToken, token)) {
            representation += token.representation
            return { associatedToken, representation, type, value }
        }
        tokens.reconsume()
        const component = consumeComponentValue(tokens)
        value.push(component)
        representation += component.representation
    }
    createError({ context: representation, message: 'unclosed block', type: SyntaxError })
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
 * @returns {object|undefined}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-declaration}
 */
function consumeDeclaration(tokens) {
    const { type, value: name } = consumeComponentValue(tokens)
    if (!type.has('ident')) {
        while (!isSemicolon(tokens.next()) && !tokens.atEnd()) {
            consumeComponentValue(tokens)
        }
        createError({ message: 'invalid declaration (an identifier was expected)', type: SyntaxError })
        return
    }
    tokens.consumeRunOf(isWhitespace)
    if (!tokens.consume(isColon)) {
        createError({ message: `invalid declaration (":" was expected after "${name}")`, type: SyntaxError })
        return
    }
    tokens.consumeRunOf(isWhitespace)
    const value = createList()
    while (!tokens.atEnd() && !isSemicolon(tokens.next())) {
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
        createError({ context, message: 'invalid statement in declaration list', type: SyntaxError })
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
        type: SyntaxError,
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
    createError({
        context: prelude.reduce((string, { representation }) => `${string}${representation}`, ''),
        message: 'invalid at-rule',
        type: SyntaxError,
    })
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
    return input.replace(/\f|\r\n?/g, '\n').replace(/[\u0000\uD800-\uDFFF]/g, '�')
}

/**
 * @param {Stream|object[]|string} input
 * @returns {Stream}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#normalize-into-a-token-stream}
 */
function normalizeIntoTokens(input) {
    if (input instanceof Stream) {
        return input
    }
    if (typeof input === 'string') {
        input = tokenize(new Stream(preprocess(input)))
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
    const value = consumeComponentValue(input)
    input.consumeRunOf(isWhitespace)
    if (input.atEnd()) {
        return value
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
        } else {
            components.push(token)
        }
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
 * It deviates from the specification by removing any leading and trailing
 * white spaces.
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
    return consumeDeclaration(input) ?? createError(INVALID_DECLARATION_SYNTAX_ERROR)
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
 * @param {object|string} grammar
 * @param {Parser} [parser]
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 */
function parseCSSGrammar(input, grammar, parser = new Parser()) {
    return parser.parseValue(parseComponentValuesList(input), grammar)
}

/**
 * @param {Stream|object[]|string} input
 * @param {object|string} grammar
 * @param {Parser} [parser]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseCSSGrammarList(input, grammar, parser) {
    input = parseCommaSeparatedComponentValuesList(input)
    if (input.length === 1) {
        const [list] = input
        if (list.length === 1 && isWhitespace(list[0])) {
            input.pop()
            return input
        }
    }
    return input.map(list => parseCSSGrammar(list, grammar, parser))
}

/**
 * @param {Stream} list
 * @param {string[]} [exclude]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-any-value}
 */
function parseCSSAnyValue(list, exclude = []) {
    if (list.atEnd()) {
        return null
    }
    const values = createList()
    for (const component of list) {
        const { type, value } = component
        if (
            type.has('bad-string')
            || type.has('bad-url')
            || (type.has('delimiter') && (endingTokens.includes(value) || exclude.includes(value)))
        ) {
            list.reconsume()
            break
        }
        values.push(component)
    }
    return 0 < values.length ? values : null
}

/**
 * @param {Stream}
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value}
 */
function parseCSSDeclarationValue(list) {
    return parseCSSAnyValue(list, [';', '!'])
}

/**
 * @param {object[]} list
 * @param {Parser} [parser]
 * @returns {Error|object[]|null}
 */
function parseCSSArbitrarySubstitutionValue(list, parser = new Parser()) {
    const matched = createList([])
    let match = false
    for (let component of list) {
        const { name, type, representation, value } = component
        if (type.has('function')) {
            const type = `${name}()`
            if (substitutions.arbitrary.includes(type)) {
                component = parser.parseValue([component], `<${type}>`)
                if (!component) {
                    return createError({
                        context: representation,
                        message: 'invalid substitution function',
                        type: SyntaxError,
                    })
                }
                match = true
            }
            const substitution = parseCSSArbitrarySubstitutionValue(value, parser)
            if (substitution instanceof SyntaxError) {
                return substitution
            }
            if (substitution) {
                match = true
            }
        }
        matched.push(component)
    }
    return match ? matched : null
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
    const { important, name, value } = declaration
    const index = declarations.findIndex(declaration => declaration.name === name)
    if (-1 < index) {
        const { [name]: { group } = {} } = properties
        let needsAppend = false
        if (group) {
            const mapping = logical[group].find(mapping => !mapping.includes(name))
            needsAppend = declarations
                .slice(index + 1)
                .some(({ name }) => mapping.includes(name))
        }
        if (!needsAppend) {
            const prevDeclaration = declarations[index]
            if (
                !value.pending
                && important === prevDeclaration.important
                && serializeCSSValue(declaration) === serializeCSSValue(prevDeclaration)
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
 * @param {CSSRuleImpl|object} rule
 * @returns {boolean}
 */
function isImportOrNamespaceRule({ type }) {
    return type.has('import') || type.has('namespace')
}

/**
 * @param {CSSRuleImpl[]|object[]} list
 * @param {object} rule
 * @returns {boolean}
 */
function isInvalidCSSNamespaceRule(list, rule) {
    return rule.type.has('namespace')
        && !list.every(rule => isImportOrNamespaceRule(rule) || rule.type.has('layer-statement'))
}

/**
 * @param {CSSRuleImpl[]|object[]} list
 * @param {object} rule
 * @param {number} index
 * @returns {boolean}
 */
function isInvalidIndexForRule(list, rule, index) {
    const { type } = rule
    if (type.has('import')) {
        return !list.slice(0, index).every(({ type }, index, list) => {
            if (type.has('layer-statement')) {
                return list.slice(0, index).every(rule => rule.type.has('layer-statement'))
            }
            return type.has('import')
        })
    }
    if (type.has('layer-statement')) {
        return list.slice(0, index).some(isImportOrNamespaceRule)
            && list.slice(index).some(isImportOrNamespaceRule)
    }
    if (type.has('namespace')) {
        return !list.slice(0, index).every((rule, index, list) => {
            if (rule.type.has('layer-statement')) {
                return list.slice(0, index).every(rule => rule.type.has('layer-statement'))
            }
            return isImportOrNamespaceRule(rule)
        })
        || list.slice(index).some(rule => rule.type.has('import'))
    }
    return list.slice(index).some(isImportOrNamespaceRule)
}

/**
 * @param {CSSRuleImpl[]} list
 * @param {object} rule
 * @param {number} index
 * @param {CSSRuleImpl|CSSStyleSheetImpl} [parentRule]
 * @returns {number}
 * @see {@link https://drafts.csswg.org/cssom-1/#insert-a-css-rule}
 */
function insertCSSRule(list, rule, index, parentRule) {
    if (list.length < index) {
        throw createError(INVALID_RULE_INDEX_ERROR)
    }
    rule = parseCSSRule(rule, parentRule)
    if (rule instanceof SyntaxError) {
        throw createError({ ...INVALID_RULE_SYNTAX_ERROR, name: 'SyntaxError', type: 'DOMException' })
    }
    if (isInvalidIndexForRule(list, rule, index)) {
        throw createError(INVALID_RULE_POSITION_ERROR)
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
    if (list.length <= index) {
        throw createError(INVALID_RULE_INDEX_ERROR)
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
 * @param {string} rule
 * @param {CSSRuleImpl} [parentRule]
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-rule}
 */
function parseCSSRule(rule, parentRule) {
    rule = parseRule(rule)
    if (rule instanceof SyntaxError) {
        return rule
    }
    const parser = new Parser(parentRule)
    rule = parser.parseRule(rule)
    if (rule === null) {
        return createError(INVALID_RULE_SYNTAX_ERROR)
    }
    return rule
}

/**
 * @param {Stream|object[]|string} input
 * @param {Parser} [parser]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-declaration-block}
 */
function parseCSSDeclarationBlock(input, parser = new Parser()) {
    const declarations = []
    parseDeclarationList(input).forEach(statement => {
        if (statement.type.has('declaration')) {
            statement = parser.parseDeclaration(statement)
            if (statement) {
                declarations.push(statement)
            }
        }
    })
    return declarations
}

/**
 * @param {CSSStyleSheetImpl} styleSheet
 * @param {ReadableStream|string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 *
 * It is run from CSSStyleSheet.
 */
function parseCSSStyleSheet(styleSheet, input) {
    const parser = new Parser(styleSheet)
    return parser.parseRuleList(input).rules
}

class Parser {

    contexts
    namespaces
    trees = []

    /**
     * @param {CSSRuleImpl|CSSStyleSheetImpl|null} [block]
     */
    constructor(block) {
        this.contexts = getContexts(block)
        this.namespaces = getNamespaces(block)
        this.productions = productions
    }

    /**
     * @returns {object|null}
     */
    get context() {
        return this.contexts.at(-1) ?? null
    }

    /**
     * @returns {ParseTree|null}
     */
    get tree() {
        return this.trees.at(-1) ?? null
    }

    /**
     * @param {object[]} input
     * @param {string} definition
     * @param {boolean} [greedy]
     * @returns {object|object[]|null}
     */
    parseValue(input, definition, greedy = false) {

        const { trees } = this
        const tree = new ParseTree(input, definition, this.tree, this)
        const { list, root } = tree

        trees.push(tree)
        list.consume(isWhitespace)

        let match = tree.enter(root)
        while (match === null || !(greedy || list.atEnd(isWhitespace))) {
            if (tree.isEmpty() || tree.abort) {
                match = null
                break
            }
            match = tree.enter(root)
        }

        trees.pop()

        return match
    }

    /**
     * @param {object} declaration
     * @returns {object}
     *
     * Property declarations appears in <style-block> and in the prelude of some
     * at-rules.
     *
     * Descriptor declarations appears in <declaration-list>.
     */
    parseDeclaration(declaration) {

        const { context } = this

        if (declaration.important && !context.definition.cascading) {
            return null
        }

        const definition = getDeclarationValueDefinition(declaration, context)

        if (!definition) {
            return null
        }

        const { name, type } = definition
        const list = parseComponentValuesList(declaration.value)

        if (type === 'property') {

            const cssWideKeyword = this.parseValue(list, substitutions.keywords.join(' | '))
            if (cssWideKeyword) {
                return { ...declaration, name, value: cssWideKeyword }
            }

            for (const substitution of substitutions.topLevel) {
                const value = this.parseValue(list, { name, type, value: `<${substitution}>` })
                if (value) {
                    return { ...declaration, name, value }
                }
            }

            const substitution = parseCSSArbitrarySubstitutionValue(list, this)
            if (substitution instanceof SyntaxError) {
                return null
            }
            if (substitution) {
                return { ...declaration, name, value: substitution }
            }
        }

        const value = this.parseValue(list, definition)

        return value ? { ...declaration, name, value } : null
    }

    /**
     * @param {object} rule
     * @returns {object|null}
     */
    parseRule(rule) {

        if (rule.name === 'charset') {
            return null
        }

        const alias = compatibility.rules.aliases.get(rule.name)
        if (alias) {
            rule.name = alias
        }

        const { context, contexts } = this
        const definition = getRuleDefinition(rule, context)

        if (!definition) {
            createError({ message: 'unrecognized or invalid rule in this context', type: SyntaxError })
            return null
        }

        contexts.push({ definition, parent: context })

        let { prelude, value } = rule

        if (definition.prelude) {
            prelude = this.parseValue(prelude, definition.prelude)
            if (prelude === null) {
                contexts.pop()
                createError({ message: "invalid rule's prelude", type: SyntaxError })
                return null
            }
        } else if (!prelude.every(isWhitespace)) {
            contexts.pop()
            createError({ message: "unexpected rule's prelude", type: SyntaxError })
            return null
        }

        if (definition.value) {
            if (value) {
                value = productions.structures[definition.value.slice(1, -1)](value.value, this)
            } else {
                contexts.pop()
                createError({ message: "missing rule's block", type: SyntaxError })
                return null
            }
        } else if (value) {
            contexts.pop()
            createError({ message: "unexpected rule's block", type: SyntaxError })
            return null
        }

        contexts.pop()
        rule.type.add(definition.type)

        return value ? { ...rule, prelude, value } : { ...rule, prelude }
    }

    /**
     * @param {Stream|object[]|string} list
     * @param {boolean} [ignoreImport]
     * @returns {object}
     */
    parseRuleList(list, ignoreImport = false) {
        const { context, namespaces } = this
        const topLevel = context.definition.type === 'stylesheet'
        const rules = parseRuleList(list, topLevel).reduce(
            (rules, rule) => {
                rule = this.parseRule(rule)
                if (rule) {
                    if (topLevel) {
                        const { name, prelude } = rule
                        if (
                            (ignoreImport && name === 'import')
                            || isInvalidIndexForRule(rules, rule, rules.length)
                            || isInvalidCSSNamespaceRule(rules, rule)
                        ) {
                            return rules
                        }
                        if (name === 'namespace') {
                            namespaces.push(serializeCSSComponentValue(prelude[0]))
                        }
                    }
                    rules.push(rule)
                }
                return rules
            },
            [])
        return { declarations: [], rules }
    }

    /**
     * @param {Stream|object[]|string} list
     * @returns {object}
     */
    parseDeclarationList(list) {
        const declarations = []
        const rules = []
        parseDeclarationList(list).forEach(statement => {
            if (statement.type.has('at-rule')) {
                statement = this.parseRule(statement)
                if (statement) {
                    rules.push(statement)
                }
            } else {
                statement = this.parseDeclaration(statement)
                if (statement) {
                    declarations.push(statement)
                }
            }
        })
        return { declarations, rules }
    }

    /**
     * @param {Stream|object[]|string} list
     * @returns {object}
     */
    parseStyleBlock(list) {
        const declarations = []
        const rules = []
        parseStyleBlock(list).forEach(statement => {
            if (statement.type.has('rule')) {
                statement = this.parseRule(statement)
                if (statement) {
                    rules.push(statement)
                }
            } else {
                statement = this.parseDeclaration(statement)
                if (statement) {
                    declarations.push(statement)
                }
            }
        })
        return { declarations, rules }
    }
}

module.exports = {
    COMPONENT_VALUE_OVERFLOW_ERROR,
    EMPTY_COMPONENT_VALUE_ERROR,
    EMPTY_RULE_ERROR,
    INVALID_DECLARATION_SYNTAX_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
    Parser,
    RULE_OVERFLOW_SYNTAX_ERROR,
    createCSSRule,
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseCSSDeclarationBlock,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSStyleSheet,
    parseRule,
    productions,
    removeCSSRule,
    setCSSDeclaration,
}

// Deferred imports to avoid cycles
const createRule = {
    'color-profile': require('../cssom/CSSColorProfileRule.js').createImpl,
    'container': require('../cssom/CSSContainerRule.js').createImpl,
    'counter-style': require('../cssom/CSSCounterStyleRule.js').createImpl,
    'font-face': require('../cssom/CSSFontFaceRule.js').createImpl,
    'font-feature-values': require('../cssom/CSSFontFeatureValuesRule.js').createImpl,
    'font-palette-values': require('../cssom/CSSFontPaletteValuesRule.js').createImpl,
    'import': require('../cssom/CSSImportRule.js').createImpl,
    'keyframe': require('../cssom/CSSKeyframeRule.js').createImpl,
    'keyframes': require('../cssom/CSSKeyframesRule.js').createImpl,
    'layer-block': require('../cssom/CSSLayerBlockRule.js').createImpl,
    'layer-statement': require('../cssom/CSSLayerStatementRule.js').createImpl,
    'margin': require('../cssom/CSSMarginRule.js').createImpl,
    'media': require('../cssom/CSSMediaRule.js').createImpl,
    'namespace': require('../cssom/CSSNamespaceRule.js').createImpl,
    'page': require('../cssom/CSSPageRule.js').createImpl,
    'property': require('../cssom/CSSPropertyRule.js').createImpl,
    'style': require('../cssom/CSSStyleRule.js').createImpl,
    'supports': require('../cssom/CSSSupportsRule.js').createImpl,
}
