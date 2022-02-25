
const DOMException = require('domexception')
const Parser = require('./parser.js')
const { aliases } = require('../properties/compatibility.js')
const associatedBlockTokens = require('../values/associated-block-tokens.js')
const createError = require('../error.js')
const createList = require('../values/value.js')
const createStream = require('./stream.js')
const nonTerminals = require('../values/types.js')
const parseLonghands = require('./longhands.js')
const properties = require('../properties/definitions.js')
const terminals = require('./terminals.js')
const tokenize = require('./tokenize.js')
const { serializeCSSComponentValue } = require('../serialize.js')
const shorthands = require('../properties/shorthands.js')
const rules = require('./rules.js')

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
    message: 'Can not insert rule at the specified index (negative, or greater than the next index in the list of rules)',
    name: 'IndexSizeError',
    type: 'DOMException',
}
const INSERT_RULE_INVALID_POSITION_ERROR = {
    message: 'Can not insert rule at the specified index (invalid rules hierarchy)',
    name: 'HierarchyRequestError',
    type: 'DOMException',
}
const INVALID_NAMESPACE_STATE_ERROR = {
    message: 'Can not insert @namespace when a rule that is not @import or @namespace already exists',
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

const types = {
    production: {
        ...nonTerminals,
        // Productions that can not be parsed using CSS value definition syntax
        'any-value': parseAnyValue,
        'declaration': (list, parser) => {
            const declaration = consumeDeclaration(list)
            if (declaration) {
                return parseCSSDeclaration(declaration, parser)
            }
            return null
        },
        'declaration-list': parseCSSDeclarationList,
        'declaration-value': parseDeclarationValue,
        'forgiving-relative-selector-list': parseCSSForgivingRelativeSelectorList,
        'forgiving-selector-list': parseCSSForgivingSelectorList,
        'media-query-list': parseCSSMediaQueryList,
        'rule-list': parseCSSRuleList,
        'style-block': parseCSSStyleBlock,
        'stylesheet': parseCSSRuleList,
    },
    property: properties,
    terminal: terminals,
}

/**
 * @param {object} tokens
 * @param {object} fn
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-function}
 */
function consumeFunction(tokens, { representation, value, ...fn }) {
    for (const token of tokens) {
        if (token === ')') {
            return { ...fn, value }
        }
        tokens.reconsume()
        value.push(consumeComponentValue(tokens))
    }
    createError({ message: 'unclosed function', type: 'ParseError' })
    return { ...fn, closed: false, value }
}

/**
 * @param {object} tokens
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-component-value}
 */
function consumeComponentValue(tokens) {
    const currentToken = tokens.consume()
    if (associatedBlockTokens[currentToken]) {
        return consumeSimpleBlock(tokens, currentToken)
    }
    if (currentToken.type?.has('function')) {
        return consumeFunction(tokens, currentToken)
    }
    return currentToken
}

/**
 * @param {object} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-style-block}
 */
function consumeStyleBlock(tokens) {
    const declarations = []
    const rules = []
    for (const token of tokens) {
        if (token === ' ' || token === ';') {
            continue
        }
        if (token.type?.has('at-keyword')) {
            tokens.reconsume()
            rules.push(consumeAtRule(tokens))
        } else if (token.type?.has('ident')) {
            const tmp = [token]
            while (tokens.next() !== ';' && !tokens.atEnd()) {
                tmp.push(consumeComponentValue(tokens))
            }
            const declaration = consumeDeclaration(createStream(tmp))
            if (declaration) {
                declarations.push(declaration)
            }
        } else if (token === '&') {
            tokens.reconsume()
            const rule = consumeQualifiedRule(tokens)
            if (rule) {
                rules.push(rule)
            }
        } else {
            createError({
                input: tokens,
                message: `invalid token "${token.value ?? token}" in style block`,
                type: 'ParseError',
            })
            tokens.reconsume()
            while (tokens.next() !== ';' && !tokens.atEnd()) {
                consumeComponentValue(tokens)
            }
        }
    }
    return [...declarations, ...rules]
}

/**
 * @param {object} tokens
 * @param {string} associatedToken
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-simple-block}
 */
function consumeSimpleBlock(tokens, associatedToken) {
    const endToken = associatedBlockTokens[associatedToken]
    const block = { associatedToken, type: new Set(['simple-block']), value: [] }
    for (const token of tokens) {
        if (token === endToken) {
            return block
        }
        tokens.reconsume()
        block.value.push(consumeComponentValue(tokens))
    }
    createError({ message: 'unclosed block', type: 'ParseError' })
    return block
}

/**
 * @param {object} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-an-at-rule}
 */
function consumeAtRule(tokens) {
    const { value: name } = tokens.consume()
    const prelude = []
    const type = new Set(['rule', 'at-rule'])
    for (const token of tokens) {
        if (token === ';') {
            return { name, prelude, type }
        }
        if (token === '{') {
            return { name, prelude, type, value: consumeSimpleBlock(tokens, token) }
        }
        if (token.type?.has('simple-block') && token.associatedToken === '{') {
            return { name, prelude, type, value: token }
        }
        tokens.reconsume()
        prelude.push(consumeComponentValue(tokens))
    }
    createError({ message: 'invalid at rule', type: 'ParseError' })
    return { name, prelude, type }
}

/**
 * @param {object} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-declaration}
 */
function consumeDeclaration(tokens) {
    const { value: name } = tokens.consume()
    const value = []
    const declaration = { name, type: new Set(['declaration']), value }
    tokens.consumeRunOf(' ')
    try {
        tokens.consume(':', false)
    } catch ({ message }) {
        createError({ message: `invalid declaration (${message})`, type: 'ParseError' })
        return
    }
    tokens.consumeRunOf(' ')
    while (!tokens.atEnd()) {
        value.push(consumeComponentValue(tokens))
    }
    while (declaration.value.at(-1) === ' ') {
        value.pop()
    }
    const [penultimate, last] = value.slice(-2)
    if (penultimate === '!' && last.type?.has('ident') && last.value === 'important') {
        value.splice(-2, 2)
        declaration.important = true
    }
    while (value.at(-1) === ' ') {
        value.pop()
    }
    return declaration
}

/**
 * @param {object} tokens
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-list-of-declarations}
 */
function consumeDeclarationList(tokens) {
    const declarations = []
    for (const token of tokens) {
        if (token === ' ' || token === ';') {
            continue
        }
        if (token.type?.has('at-keyword')) {
            tokens.reconsume()
            declarations.push(consumeAtRule(tokens))
            continue
        }
        if (token.type?.has('ident')) {
            let declaration = [token]
            while (tokens.next() !== ';' && tokens.next()) {
                declaration.push(consumeComponentValue(tokens))
            }
            declaration = consumeDeclaration(createStream(declaration))
            if (declaration) {
                declarations.push(declaration)
            }
            continue
        }
        createError({ message: 'invalid declaration', type: 'ParseError' })
        tokens.reconsume()
        while (tokens.next() !== ';' && tokens.next()) {
            consumeComponentValue(tokens)
        }
    }
    return declarations
}

/**
 * @param {object[]} tokens
 * @returns {object|void}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-qualified-rule}
 */
function consumeQualifiedRule(tokens) {
    const prelude = []
    const type = new Set(['rule', 'qualified-rule'])
    for (const token of tokens) {
        if (token === '{') {
            return { prelude, type, value: consumeSimpleBlock(tokens, token) }
        }
        if (token.type?.has('simple-block') && token.associatedToken === '{') {
            return { prelude, type, value: token }
        }
        tokens.reconsume()
        prelude.push(consumeComponentValue(tokens))
    }
    createError({ message: 'invalid qualified rule', type: 'ParseError' })
}

/**
 * @param {object[]} tokens
 * @param {boolean} topLevel
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-list-of-rules}
 */
function consumeRuleList(tokens, topLevel = false) {
    const rules = []
    for (const token of tokens) {
        if (token === ' ') {
            continue
        }
        if (token === '<--' || token === '-->') {
            if (!topLevel) {
                tokens.reconsume()
                const rule = consumeQualifiedRule(tokens)
                if (rule) {
                    rules.push(rule)
                }
            }
            continue
        }
        if (token.type?.has('at-keyword')) {
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
 * @param {string|object} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#normalize-into-a-token-stream}
 */
function normalizeIntoTokens(input) {
    if (typeof input === 'string') {
        input = tokenize(createStream(preprocess(input)))
    } else if (input.source) {
        // Already a list wrapped in a stream
        return input
    }
    return createStream(input)
}

/**
 * @param {string} input
 * @returns {object|SyntaxError}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-component-value}
 */
function parseComponentValue(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(' ')
    if (input.atEnd()) {
        return createError(EMPTY_COMPONENT_VALUE_ERROR)
    }
    const component = consumeComponentValue(input)
    if (component) {
        return component
    }
    input.consumeRunOf(' ')
    if (input.atEnd()) {
        return component
    }
    return createError(COMPONENT_VALUE_OVERFLOW_ERROR)
}

/**
 * @param {string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-comma-separated-list-of-component-values}
 */
function parseCommaSeparatedComponentValuesList(input) {
    input = normalizeIntoTokens(input)
    const list = []
    const components = []
    for (const token of input) {
        if (token === ',') {
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
 * @param {string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-component-values}
 */
function parseComponentValueList(input) {
    input = normalizeIntoTokens(input)
    const list = []
    while (!input.atEnd()) {
        list.push(consumeComponentValue(input))
    }
    // https://github.com/w3c/csswg-drafts/issues/6484#issuecomment-1001482576
    while (list.at(-1) === ' ') {
        list.pop()
    }
    return list
}

/**
 * @param {object[]} list
 * @param {boolean} [excludeEndChars]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-any-value}
 */
function parseAnyValue(list, excludeEndChars = false) {
    const { index } = list
    const values = createList([], ',')
    let openParenthesis = false
    for (const value of list) {
        const { type } = value
        const isInvalid = type?.has('bad-string')
            || type?.has('bad-url')
            || value === ']'
            || value === '}'
            || (excludeEndChars && (value === ';' || value === '!'))
        if (isInvalid) {
            list.moveTo(index)
            return null
        }
        if (value === ')') {
            if (openParenthesis) {
                list.moveTo(index)
                return null
            }
            openParenthesis = false
        } else if (value === '(') {
            openParenthesis = true
        }
        values.push(value)
    }
    return values
}

/**
 * @param {object[]}
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value}
 */
function parseDeclarationValue(list) {
    return parseAnyValue(list, true)
}

/**
 * @param {string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-declarations}
 */
function parseDeclarationList(input) {
    return consumeDeclarationList(normalizeIntoTokens(input))
}

/**
 * @param {string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-style-blocks-contents}
 */
function parseStyleBlock(input) {
    return consumeStyleBlock(normalizeIntoTokens(input))
}

/**
 * @param {string} input
 * @returns {object|SyntaxError}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-declaration}
 */
function parseDeclaration(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(' ')
    const next = input.next()
    if (next.type?.has('ident')) {
        const declaration = consumeDeclaration(input)
        if (declaration) {
            return declaration
        }
    }
    return createError(DECLARATION_OVERFLOW_ERROR)
}

/**
 * @param {string} input
 * @returns {object|SyntaxError}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-rule}
 */
function parseRule(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(' ')
    if (input.atEnd()) {
        return createError(EMPTY_RULE_ERROR)
    }
    let rule
    if (input.next().type?.has('at-keyword')) {
        rule = consumeAtRule(input)
    } else {
        rule = consumeQualifiedRule(input)
        if (!rule) {
            return createError(INVALID_RULE_SYNTAX_ERROR)
        }
    }
    input.consumeRunOf(' ')
    if (input.atEnd()) {
        return rule
    }
    return createError(RULE_OVERFLOW_SYNTAX_ERROR)
}

/**
 * @param {string} input
 * @param {boolean} [topLevel]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-rules}
 */
function parseRuleList(input, topLevel = false) {
    return consumeRuleList(normalizeIntoTokens(input), topLevel)
}

/**
 * @param {string|object[]} input
 * @param {string} grammar
 * @param {Parser} [parser]
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 */
function parseCSSGrammar(input, grammar, parser = createParser()) {
    return parser.parse(parseComponentValueList(input), grammar)
}

/**
 * @param {string|object[]} input
 * @param {string} grammar
 * @param {Parser} [parser]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseCSSGrammarList(input, grammar, parser = createParser()) {
    input = parseCommaSeparatedComponentValuesList(input)
    if (input.length === 1) {
        const [component] = input
        if (component.length === 1) {
            const [whitespace] = component
            if (whitespace === ' ') {
                return []
            }
        }
    }
    return input.map(list => parseCSSGrammar(list, grammar, parser))
}

/**
 * @param {string|object[]} input
 * @param {Parser} [parser]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-media-query-list}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list}
 */
function parseCSSMediaQueryList(input, parser = createParser()) {
    return parseCSSGrammarList(input, '<media-query>', parser)
}

/**
 * @param {string} input
 * @param {Parser} [parser]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/selectors/#typedef-forgiving-selector-list}
 */
function parseCSSForgivingSelectorList(input, parser) {
    const list = parseCSSGrammarList(input, '<complex-selector>', parser)
        .filter(selector => {
            if (selector) {
                return !selector.flat(Infinity).some(({ type }) => type.has('pseudo-element-selector'))
            }
            return false
        })
    return createList(list, ',')
}

/**
 * @param {object} input
 * @param {Parser} [parser]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/selectors/#typedef-forgiving-relative-selector-list}
 *
 * TODO: report a spec issue "[selector-4] Forgiving relative selector should be
 * parsed against `<relative-selector>`" (instead of `<complex-selector>`).
 */
function parseCSSForgivingRelativeSelectorList(input, parser) {
    const { name } = parser.parentList.next()
    const list = parseCSSGrammarList(input, '<relative-selector>', parser)
        .filter(selector => {
            if (name !== 'has') {
                return !selector.flat(Infinity).some(({ type }) => type.has('pseudo-element-selector'))
            }
            return selector
        })
    return createList(list, ',')
}

/**
 * @param {object} list
 * @param {Parser} [parser]
 * @returns {object[]|void|null}
 */
function parseCSSCustomVariables(list, parser = createParser()) {
    let hasCustomVariables = false
    const match = createList()
    for (const component of list) {
        if (component.type?.has('function')) {
            if (component.name === 'var') {
                hasCustomVariables = true
                const variable = parser.parse(component, '<var()>')
                if (variable) {
                    match.push(variable)
                    continue
                }
                return
            }
            const withCustomVariables = parseCSSCustomVariables(component.value, parser)
            if (withCustomVariables === undefined) {
                return
            }
            if (withCustomVariables) {
                hasCustomVariables = true
                component.value = withCustomVariables
            }
        }
        if (component !== ' ') {
            match.push(component)
        }
    }
    if (hasCustomVariables) {
        if (match.length === 1) {
            return match[0]
        }
        return match
    }
    return null
}

/**
 * @param {string} value
 * @param {string} [property]
 * @param {Parser} [parser]
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-value}
 */
function parseCSSPropertyValue(value, property = '', parser = createParser()) {
    const list = parseComponentValueList(value)
    const cssWideKeyword = parser.parse(list, '<css-wide-keyword>')
    if (cssWideKeyword) {
        return cssWideKeyword
    }
    const withCustomVariables = parseCSSCustomVariables(list, parser)
    // Invalid `var()`
    if (withCustomVariables === undefined) {
        return null
    }
    if (withCustomVariables) {
        return withCustomVariables
    }
    if (property.startsWith('--')) {
        return createList(list)
    }
    const definition = properties[property]
    if (definition) {
        const { value } = definition
        return parser.parse(list, value)
    }
    return null
}

/**
 * @param {object[]} declarations
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/cssom/#concept-declarations-specified-order}
 */
function getDeclarationsInSpecifiedOrder(declarations) {
    return declarations
        .flatMap(declaration => {
            const { important, name, value } = declaration
            if (shorthands.has(name)) {
                const expanded = parseLonghands(value, name)
                return Object.entries(expanded).map(([name, list]) =>
                    ({ important, input: value, name, value: list }))
            }
            return declaration
        })
        .reduce((declarations, declaration) => {
            const { name, important } = declaration
            if (!important && declarations.get(name)?.important) {
                return declarations
            }
            declarations.set(name, declaration)
            return declarations
        }, new Map())
}

/**
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function isEqual(a, b) {
    if (Array.isArray(a)) {
        return Array.isArray(b) && a.length === b.length && a.every((aa, index) => isEqual(aa, b[index]))
    }
    return a === b
}

/**
 * @param {object} declaration
 * @param {Map} declarations
 * @param {string[]} declared
 * @returns {void}
 * @see {@link https://drafts.csswg.org/cssom/#set-a-css-declaration}
 */
function setCSSDeclaration(declaration, declarations, declared) {
    const { important, name, value } = declaration
    if (declarations.has(name)) {
        const { important: prevImportant, value: prevValue } = declarations.get(name)
        if (isEqual(value, prevValue) && prevImportant === important) {
            return false
        }
    } else {
        declared.push(name)
    }
    declarations.set(name, declaration)
    return true
}

/**
 * @param {object} declaration
 * @param {Parser} [parser]
 * @returns {object}
 */
function parseCSSDeclaration({ important, name, type = new Set(['declaration']), value }, parser = createParser()) {
    if (aliases.has(name)) {
        name = aliases.get(name)
    }
    const { context: { current: { cascading = true, descriptors = [], properties = [] } } } = parser
    if (descriptors.includes(name)) {
        if (important) {
            return null
        }
    } else if ((!name.startsWith('--') && !properties.includes(name)) || (important === true && !cascading)) {
        return null
    }
    const parsed = parseCSSPropertyValue(value, name, parser)
    if (parsed) {
        return { important, name, type, value: parsed }
    }
    return null
}

/**
 * @param {string} string
 * @param {Parser} [parser]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-declaration-block}
 */
function parseCSSDeclarationBlock(string, parser = createParser()) {
    const declarations = parseDeclarationList(string)
    const parsedDeclarations = []
    for (const declaration of declarations) {
        const parsed = parseCSSDeclaration(declaration, parser)
        if (parsed) {
            parsedDeclarations.push(parsed)
        }
    }
    return parsedDeclarations
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
 * @param {CSSRule[]} list
 * @param {object} rule
 * @param {number} index
 * @param {CSSRuleImpl} [parentRule]
 * @returns {index}
 * @see {@link https://drafts.csswg.org/cssom/#insert-a-css-rule}
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
 * @see {@link https://drafts.csswg.org/cssom/#remove-a-css-rule}
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
 * @param {CSSStyleSheetImpl|CSSRuleImpl} parentRule
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
    throw Error(`Can not create rule of type ${typeof type === 'string' ? `"${type}"` : '(not a string)'}"`)
}

/**
 * @param {object} rule
 * @param {Parser} parser
 * @returns {object|null}
 */
function matchRule(rule, parser) {
    const { name, type } = rule
    /**
     * Encoding is handled when decoding the byte stream and "all `@charset`
     * rules are [otherwise] ignored".
     */
    if (name === 'charset') {
        return null
    }
    const { context } = parser
    const definition = context.enter(rule)
    if (!definition) {
        createError({ message: 'unrecognized or invalid rule in this context', type: 'ParseError' })
        return null
    }
    const { prelude: preludeDefinition, value: blockDefinition } = definition
    let { prelude, value } = rule
    if (preludeDefinition) {
        prelude = parser.parse(prelude, preludeDefinition)
        if (prelude === null) {
            context.exit()
            createError({ message: "invalid rule's prelude", type: 'ParseError' })
            return null
        }
        if (name === 'namespace') {
            const [prefix] = prelude
            context.namespaces.push(serializeCSSComponentValue(prefix))
        }
    } else if (prelude.some(token => token !== ' ')) {
        context.exit()
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
            context.exit()
            createError({ message: "missing rule's block", type: 'ParseError' })
            return null
        }
    } else if (value) {
        context.exit()
        createError({ message: "unexpected rule's block", type: 'ParseError' })
        return null
    }
    context.exit()
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
 * @returns {object|DOMException}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-rule}
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
 * @param {object[]} list
 * @param {Parser} parser
 * @returns {object}
 */
function parseCSSDeclarationList(list, parser) {
    const declarations = []
    const rules = []
    parseDeclarationList(list).forEach(statement => {
        const { type } = statement
        if (type.has('at-rule')) {
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
 * @param {object[]} list
 * @param {Parser} parser
 * @returns {object}
 */
function parseCSSStyleBlock(list, parser) {
    const declarations = []
    const rules = []
    parseStyleBlock(list).forEach(statement => {
        const { type } = statement
        if (type.has('rule')) {
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
 * @param {string|object[]} list
 * @param {Parser} parser
 * @param {boolean} [topLevel]
 * @returns {object}
 */
function parseCSSRuleList(list, parser, topLevel = false) {
    const rules = parseRuleList(list, topLevel).reduce((rules, rule) => {
        rule = matchRule(rule, parser)
        if (rule) {
            rules.push(rule)
        }
        return rules
    }, [])
    return { declarations: [], rules }
}

/**
 * @param {CSSStyleSheetImpl} styleSheet
 * @param {string|ReadableStream} input
 * @param {boolean} ignoreImport
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 *
 * It is run from `CSSStyleSheet`.
 */
function parseCSSStyleSheet(styleSheet, input, ignoreImport = false) {
    // TODO: decode rules as byte stream and handle (`@charset`) encoding
    const parser = createParser(styleSheet)
    const { rules: list } = parseCSSRuleList(input, parser, true)
    return list.reduce((rules, rule) => {
        const { name } = rule
        if (!(ignoreImport && name === 'import')
            && !isInvalidCSSNamespaceRule(rules, rule)
            && !isInvalidIndexForRule(rules, rule, rules.length)) {
            rules.push(rule)
        }
        return rules
    }, [])
}

/**
 * @param {CSSStyleSheetImpl|CSSRuleImpl} [block]
 * @returns {Parser} parser
 */
function createParser(block) {
    return new Parser(types, rules, block)
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
    parseCSSDeclarationBlock,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSMediaQueryList,
    parseCSSPropertyValue,
    parseCSSStyleSheet,
    parseRule,
    removeCSSRule,
    setCSSDeclaration,
}

// "Late" imports to avoid circular dependency issues until `webidl2js` uses ES modules
const CSSImportRule = require('../cssom/CSSImportRule.js')
const CSSKeyframeRule = require('../cssom/CSSKeyframeRule.js')
const CSSKeyframesRule = require('../cssom/CSSKeyframesRule.js')
const CSSMarginRule = require('../cssom/CSSMarginRule.js')
const CSSMediaRule = require('../cssom/CSSMediaRule.js')
const CSSNamespaceRule = require('../cssom/CSSNamespaceRule.js')
const CSSNestingRule = require('../cssom/CSSNestingRule.js')
const CSSPageRule = require('../cssom/CSSPageRule.js')
const CSSStyleRule = require('../cssom/CSSStyleRule.js')
const CSSSupportsRule = require('../cssom/CSSSupportsRule.js')

const createRule = {
    import: CSSImportRule.createImpl,
    keyframe: CSSKeyframeRule.createImpl,
    keyframes: CSSKeyframesRule.createImpl,
    margin: CSSMarginRule.createImpl,
    media: CSSMediaRule.createImpl,
    namespace: CSSNamespaceRule.createImpl,
    nest: CSSNestingRule.createImpl,
    page: CSSPageRule.createImpl,
    style: CSSStyleRule.createImpl,
    supports: CSSSupportsRule.createImpl,
}
