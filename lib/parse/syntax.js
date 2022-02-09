
const DOMException = require('domexception')
const ParserContext = require('./context.js')
const { aliases } = require('../properties/compatibility.js')
const associatedBlockTokens = require('../values/associated-block-tokens.js')
const createError = require('../error.js')
const createList = require('../values/value.js')
const createStream = require('./stream.js')
const keyframeProperties = require('../properties/animatable.js')
const nonTerminals = require('../values/types.js')
const pageProperties = require('../properties/page.js')
const pageMarginProperties = require('../properties/page-margin.js')
const parseGrammar = require('./engine.js') // Ie. parseValue() (returns a list of component values)
const parseLonghands = require('./longhands.js')
const properties = require('../properties/definitions.js')
const terminals = require('./terminals.js')
const tokenize = require('./tokenize.js')
const shorthands = require('../properties/shorthands.js')
const valueRules = require('./rules.js')

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

const pageMarginRuleNames = [
    'top-left-corner',
    'top-left',
    'top-center',
    'top-right',
    'top-right-corner',
    'bottom-left-corner',
    'bottom-left',
    'bottom-center',
    'bottom-right',
    'bottom-right-corner',
    'left-top',
    'left-middle',
    'left-bottom',
    'right-top',
    'right-middle',
    'right-bottom',
]

const pageMarginRules = pageMarginRuleNames.reduce((rules, name) => {
    rules[name] = {
        type: 'margin',
        value: {
            properties: pageMarginProperties,
            type: '<declaration-list>',
        },
    }
    return rules
}, {})

/**
 * TODO:
 * - CSSCounterStyleRule: @counter-style <counter-style-name> { <declaration-list> }
 * - CSSFontFaceRule: @font-face { <declaration-list> }
 * - CSSFontFeatureValuesRule: @font-feature-values <family-name># { <declaration-list> }
 * - CSSPropertyRule: @property <custom-property-name> { <declaration-list> }
 *
 * Not ready yet:
 * @see {@link https://drafts.csswg.org/css-contain-3/#container-rule}
 */
const rules = {
    /**
     * @see {@link https://drafts.csswg.org/css-cascade/#at-import}
     */
    import: {
        prelude: '[<url> | <string>] [supports([<supports-condition> | <declaration>])]? <media-query-list>?',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
     */
    keyframe: {
        prelude: '<keyframe-selector>#',
        type: 'keyframe',
        value: {
            cascading: false,
            properties: keyframeProperties,
            type: '<declaration-list>',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
     */
    keyframes: {
        prelude: '<keyframes-name>',
        value: {
            type: '<rule-list>',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
     */
    ...pageMarginRules,
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-media}
     */
    media: {
        prelude: '<media-query-list>',
        value: {
            rules: ['import', 'namespace'], // Black list
            type: '<stylesheet>',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-namespaces/#syntax}
     */
    namespace: {
        prelude: '<namespace-prefix>? [<string> | <url>]',
    },
    /**
     * @see {@link https://drafts.csswg.org/css-nesting-1/#at-nest}
     */
    nest: {
        name: 'nest',
        prelude: '<selector-list>',
        value: {
            type: '<style-block>',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
     */
    page: {
        prelude: '<page-selector-list>?',
        value: {
            properties: pageProperties,
            rules: pageMarginRules,
            type: '<declaration-list>',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rules}
     */
    qualified: {
        prelude: '<selector-list>',
        value: {
            type: '<style-block>',
        },
    },
    /**
     * @see {@link https://drafts.csswg.org/css-conditional-3/#at-supports}
     */
    supports: {
        prelude: '<supports-condition>',
        value: {
            rules: ['import', 'namespace'], // Black list
            type: '<stylesheet>',
        },
    },
}

const topLevelRules = {
    import: rules.import,
    keyframes: rules.keyframes,
    media: rules.media,
    namespace: rules.namespace,
    page: rules.page,
    qualified: rules.qualified,
    supports: rules.supports,
}

const nestedStyleRule = {
    prelude: "'&' <selector-list>",
    value: {
        type: '<style-block>',
    },
}

rules.keyframes.value.rules = { qualified: rules.keyframe }
// Allow multiple nesting levels with a circular reference
rules.qualified.value.rules = rules.nest.value.rules = nestedStyleRule.value.rules = {
    media: rules.media,
    nest: rules.nest,
    qualified: nestedStyleRule,
    supports: rules.supports,
}

/**
 * `structure` types represent the prelude or content of a CSS rule. The only
 * `structure` types currently parsed with the function for parsing a list of
 * component values are the types used in the prelude of a CSS rule.
 *
 * TODO: figure out if it is worth parsing all `structure` types with the same
 * parse function than for a list of component values.
 */
const types = {
    'structure': {
        'declaration': list => {
            // 1. Parse basic syntax
            const declaration = consumeDeclaration(list)
            // 2. Validate context rules (similarly as in parse/rules.js)
            if (declaration) {
                return parseCSSDeclaration(declaration)
            }
            return null
        },
        'declaration-list': parseCSSDeclarationList, // This will not work
        'media-query-list': parseMediaQueryList,
        'page-selectors-list': parsePageSelectorsList,
        'rule-list': parseCSSRuleList,               // This will not work
        'style-block': parseCSSStyleBlock,           // This will not work
        'stylesheet': parseCSSRuleList,              // This will not work
    },
    'non-terminal': nonTerminals,
    'property': properties,
    'terminal': terminals,
}

const context = new ParserContext(types, valueRules)

/**
 * @param {object} tokens
 * @param {object} fn
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-function}
 */
function consumeFunction(tokens, fn) {
    for (const token of tokens) {
        if (token === ')') {
            return fn
        }
        tokens.reconsume()
        fn.value.push(consumeComponentValue(tokens))
    }
    fn.closed = false
    createError({ message: 'unclosed function', type: 'ParseError' })
    return fn
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
 * @param {string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-declarations}
 */
function parseDeclarationList(input) {
    return consumeDeclarationList(normalizeIntoTokens(input))
}

/**
 * @param {string} input
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-group-of-selectors}
 * @see {@link https://drafts.csswg.org/selectors/#parse-a-selector}
 * @see {@link https://drafts.csswg.org/selectors/#grammar}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6927}
 *
 * TODO: handle specific invalid selector rules in `lib/parse/rules.js`
 */
function parseSelectorGroup(input) {
    return parseCSSGrammar(input, '<selector-list>')
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
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-media-query-list}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list}
 */
function parseMediaQueryList(input) {
    return parseCSSGrammarList(input, '<media-query>')
}

/**
 * @param {string} input
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-list-of-css-page-selectors}
 * @see {@link https://drafts.csswg.org/css-page-3/#typedef-page-selector-list}
 */
function parsePageSelectorsList(input) {
    return parseCSSGrammar(input, '<page-selector-list>')
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
 * @param {string} input
 * @param {string|object} grammar
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 */
function parseCSSGrammar(input, grammar) {
    return parseGrammar(parseComponentValueList(input), grammar, context)
}

/**
 * @param {string} input
 * @param {string|object} grammar
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseCSSGrammarList(input, grammar) {
    input = parseCommaSeparatedComponentValuesList(input)
    if (0 < input.length) {
        return input.map(list => parseCSSGrammar(list, grammar))
    }
    return []
}

/**
 * @param {object} list
 * @returns {object[]|void|null}
 */
function parseCustomVariables(list) {
    let hasCustomVariables = false
    const match = createList()
    for (const component of list) {
        if (component.type?.has('function')) {
            if (component.name === 'var') {
                hasCustomVariables = true
                const variable = parseGrammar(component, '<var()>', context)
                if (variable) {
                    match.push(variable)
                    continue
                }
                return
            }
            const withCustomVariables = parseCustomVariables(component.value)
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
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-value}
 */
function parseCSSDeclarationValue(value, property = '') {
    const list = parseComponentValueList(value)
    const cssWideKeyword = parseGrammar(list, '<css-wide-keyword>', context)
    if (cssWideKeyword) {
        return cssWideKeyword
    }
    const withCustomVariables = parseCustomVariables(list)
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
        return parseGrammar(list, value, context)
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
        }, new Map)
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
 * @param {object} [context]
 * @returns {object}
 */
function parseCSSDeclaration({ important, name, type = new Set(['declaration']), value }, context) {
    if (aliases.has(name)) {
        name = aliases.get(name)
    }
    if (context) {
        const { cascading = true, descriptors = [], properties = [] } = context
        if (descriptors.includes(name)) {
            if (important) {
                return null
            }
        } else if (!properties.includes(name) || (important && !cascading)) {
            return null
        }
    }
    const parsed = parseCSSDeclarationValue(value, name)
    if (parsed) {
        return { name, important, type, value: parsed }
    }
    return null
}

/**
 * @param {string} string
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-declaration-block}
 */
function parseCSSDeclarationBlock(string) {
    const declarations = parseDeclarationList(string)
    const parsedDeclarations = []
    for (const declaration of declarations) {
        const parsed = parseCSSDeclaration(declaration)
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
function isInvalidCSSNamespaceRule(list, { name }) {
    return name === 'namespace' && list.some(({ name }) => name !== 'import' && name !== 'namespace')
}

/**
 * @param {*[]} list
 * @param {object} rule
 * @param {number} [index]
 */
function isInvalidIndexForRule(list, rule, index = list.length - 1) {
    const { name } = rule
    if (name === 'import') {
        return list.slice(0, index).some(({ name }) => name !== 'import')
    }
    if (name === 'namespace') {
        return isInvalidCSSNamespaceRule(list.slice(0, index), rule)
            || list.slice(index).some(({ name }) => name === 'import')
    }
    return list.slice(index).some(({ name }) => name === 'import' || name === 'namespace')
}

/**
 * @param {CSSRule[]} list
 * @param {object} rule
 * @param {number} index
 * @param {CSSStyleSheetImpl|CSSRuleImpl} parentRule
 * @param {string} [name]
 * @returns {index}
 * @see {@link https://drafts.csswg.org/cssom/#insert-a-css-rule}
 *
 * There is an unfortunate conflict between `rule.name`, defined in Syntax and
 * representing the at-rule name (keyword), and `CSSKeyframesRule.name`, defined
 * in CSSOM and representing the authored keyframes name (component values). The
 * last `name` argument overrides `parentRule.name` to compute the expected
 * context rules.
 */
function insertCSSRule(list, rule, index, parentRule, name) {
    const { length } = list
    if (length < index) {
        throw createError(INSERT_RULE_INVALID_INDEX_ERROR)
    }
    const contextRules = getContextRules(name ? { name } : parentRule)
    rule = parseCSSRule(rule, contextRules)
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
    const { type } = rule
    const create = createRule[type]
    if (create) {
        const { parentStyleSheet } = parentRule
        const properties = parentStyleSheet
            ? { ...rule, parentStyleSheet, parentRule }
            : { ...rule, parentStyleSheet: parentRule }
        return create(globalThis, undefined, properties)
    }
    throw Error(`Can not create rule of type ${typeof type === 'string' ? `"${type}"` : '(not a string)'}"`)
}

/**
 * @param {object} rule
 * @param {object} contextRules
 * @returns {string}
 */
function getRuleType({ name }, { qualified }) {
    // At-rule
    if (name) {
        const rule = rules[name]
        if (rule) {
            const { type = name } = rule
            return type
        }
        return 'unknown'
    }
    // Qualified rule
    const { type = 'style' } = qualified
    return type
}

/**
 * @param {object[]} rules
 * @returns {object}
 */
function getIncludedRules(rules) {
    return Object.entries(topLevelRules).reduce((included, [name, rule]) => {
        if (!rules.includes(name)) {
            included[name] = rule
        }
        return included
    }, {})
}

/**
 * @param {object|CSSRuleImpl} [parentRule]
 * @returns {object}
 */
function getContextRules(parentRule) {
    if (CSSStyleSheet.isImpl(parentRule)) {
        return topLevelRules
    }
    const { name = 'qualified' } = parentRule
    const { value: { rules: contextRules, type } } = rules[name]
    if (type === '<stylesheet>') {
        return getIncludedRules(contextRules)
    }
    return contextRules
}

/**
 * @param {object} rule
 * @param {object} contextRules
 * @returns {object|null}
 */
function matchRule(rule, contextRules) {

    if (!contextRules) {
        createError({ message: 'rules are not allowed in this context', type: 'ParseError' })
        return null
    }

    const { name } = rule

    /**
     * Encoding has already been handled when decoding the byte stream and "all
     * `@charset` rules are [otherwise] ignored".
     */
    if (name === 'charset') {
        return null
    }

    const type = getRuleType(rule, contextRules)
    const definition = contextRules[name ?? 'qualified']
    let { prelude, value } = rule

    if (!definition) {
        createError({ message: 'invalid or unrecognized rule', type: 'ParseError' })
        return null
    }

    const { prelude: preludeDefinition, value: blockDefinition } = definition

    if (preludeDefinition) {
        prelude = parseGrammar(prelude, preludeDefinition, context)
        if (prelude === null) {
            createError({ message: "invalid rule's prelude", type: 'ParseError' })
            return null
        }
    } else if (prelude.some(token => token !== ' ')) {
        createError({ message: "unexpected rule's prelude", type: 'ParseError' })
        return null
    }

    if (blockDefinition) {
        if (value) {
            const { associatedToken, type: valueType } = value
            if (valueType.has('simple-block') && associatedToken === '{') {
                ({ value } = value)
                const { rules, type: blockType } = blockDefinition
                if (blockType === '<style-block>') {
                    value = parseCSSStyleBlock(value, rules)
                } else if (blockType === '<declaration-list>') {
                    value = parseCSSDeclarationList(value, rules, blockDefinition)
                } else if (blockType === '<rule-list>') {
                    value = parseCSSRuleList(value, rules)
                } else if (blockType === '<stylesheet>') {
                    value = parseCSSRuleList(value, getIncludedRules(rules))
                } else {
                    throw Error(`Can not parse block of type ${typeof blockType === 'string' ? `"${blockType}"` : '(not a string)'}"`)
                }
            } else {
                createError({ message: "invalid rule's block", type: 'ParseError' })
                return null
            }
        } else {
            createError({ message: "missing rule's block", type: 'ParseError' })
            return null
        }
    } else if (value) {
        createError({ message: "unexpected rule's block", type: 'ParseError' })
        return null
    }

    if (name) {
        if (value) {
            return { name, prelude, type, value }
        }
        return { name, type, prelude }
    }
    return { prelude, type, value }
}

/**
 * @param {string} rule
 * @param {object} contextRules
 * @returns {CSSRuleImpl|DOMException}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-rule}
 */
function parseCSSRule(rule, contextRules) {
    rule = parseRule(rule)
    if (rule instanceof DOMException && rule.name === 'SyntaxError') {
        return rule
    }
    rule = matchRule(rule, contextRules)
    if (rule === null) {
        return createError(INSERT_RULE_INVALID_GRAMMAR_ERROR)
    }
    return rule
}

/**
 * @param {object[]} list
 * @param {object} contextRules
 * @param {string[]} contextDeclarations
 * @returns {object}
 */
function parseCSSDeclarationList(list, contextRules, contextDeclarations) {
    const declarations = []
    const rules = []
    parseDeclarationList(list).forEach(statement => {
        const { type } = statement
        if (type.has('at-rule')) {
            statement = matchRule(statement, contextRules)
            if (statement) {
                rules.push(statement)
            }
        } else {
            statement = parseCSSDeclaration(statement, contextDeclarations)
            if (statement) {
                declarations.push(statement)
            }
        }
    })
    return { declarations, rules }
}

/**
 * @param {object[]} list
 * @param {object} contextRules
 * @returns {object}
 */
function parseCSSStyleBlock(list, contextRules) {
    const declarations = []
    const rules = []
    parseStyleBlock(list).forEach(statement => {
        const { type } = statement
        if (type.has('rule')) {
            statement = matchRule(statement, contextRules)
            if (statement) {
                rules.push(statement)
            }
        } else {
            statement = parseCSSDeclaration(statement)
            if (statement) {
                declarations.push(statement)
            }
        }
    })
    return { declarations, rules }
}

/**
 * @param {string|object[]} list
 * @param {object} contextRules
 * @param {boolean} [topLevel]
 * @returns {object[]}
 */
function parseCSSRuleList(list, contextRules, topLevel = false) {
    return parseRuleList(list, topLevel).reduce((rules, rule) => {
        rule = matchRule(rule, contextRules)
        if (rule) {
            rules.push(rule)
        }
        return rules
    }, [])
}

/**
 * @param {string|ReadableStream} rules
 * @param {boolean} ignoreImport
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 *
 * It is run from `CSSStyleSheet`.
 */
function parseCSSStyleSheet(rules, ignoreImport = false) {
    // TODO: decode rules as byte stream and handle (`@charset`) encoding
    rules = parseCSSRuleList(rules, topLevelRules, true)
    return rules.filter(rule =>
        !(ignoreImport && rule.name === 'import')
            && !isInvalidCSSNamespaceRule(rules, rule)
            && !isInvalidIndexForRule(rules, rule, ))
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
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseCSSDeclarationBlock,
    parseCSSDeclarationList,
    parseCSSDeclarationValue,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSRule,
    parseCSSRuleList,
    parseCSSStyleBlock,
    parseCSSStyleSheet,
    parseCommaSeparatedComponentValuesList,
    parseComponentValue,
    parseComponentValueList,
    parseDeclaration,
    parseDeclarationList,
    parseMediaQueryList,
    parsePageSelectorsList,
    parseRule,
    parseRuleList,
    parseSelectorGroup,
    parseStyleBlock,
    removeCSSRule,
    setCSSDeclaration,
}

// "Late" imports until `webidl2js` uses ES modules to avoid circular dependency issues
const CSSImportRule = require('../cssom/CSSImportRule.js')
const CSSKeyframeRule = require('../cssom/CSSKeyframeRule.js')
const CSSKeyframesRule = require('../cssom/CSSKeyframesRule.js')
const CSSMarginRule = require('../cssom/CSSMarginRule.js')
const CSSMediaRule = require('../cssom/CSSMediaRule.js')
const CSSNamespaceRule = require('../cssom/CSSNamespaceRule.js')
const CSSNestingRule = require('../cssom/CSSNestingRule.js')
const CSSPageRule = require('../cssom/CSSPageRule.js')
const CSSStyleRule = require('../cssom/CSSStyleRule.js')
const CSSStyleSheet = require('../cssom/CSSStyleSheet.js')
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
