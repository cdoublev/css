
const CSSRuleList = require('../cssom/CSSRuleList.js')
const DOMException = require('domexception')
const ParserContext = require('./context.js')
const { aliases } = require('../properties/compatibility.js')
const createList = require('../values/value.js')
const createStream = require('./stream.js')
const nonTerminals = require('../values/types.js')
const parseGrammar = require('./engine.js') // Ie. parseValue() (returns a list of component values)
const parseLonghands = require('./longhands.js')
const properties = require('../properties/definitions.js')
const terminals = require('./terminals.js')
const tokenize = require('./tokenize.js')
const shorthands = require('../properties/shorthands.js')
const valueRules = require('./rules.js')

/**
 * TODO: figure out if it is worth defining `<declaration-list>`, `<rule-list>`,
 * `<style-block>`, and `<stylesheet>`, which are currently not parsed with the
 * "parse engine", which is currently limited to parsing a list of component
 * values.
 *
 * TODO: rename `block` to something else more accurate.
 */
const types = {
    'block': {
        'declaration': parseCSSDeclaration,
        'declaration-list': parseCSSDeclarationList,
        'media-query-list': parseMediaQueryList,
        'page-selectors-list': parsePageSelectorsList,
        'rule-list': parseCSSRuleList,
        'style-block': parseCSSStyleBlock,
        'stylesheet': parseCSSRuleList,
    },
    'non-terminal': nonTerminals,
    'property': properties,
    'terminal': terminals,
}

const context = new ParserContext(types, valueRules)

const endBlockToken = {
    '(': ')',
    '[': ']',
    '{': '}',
}
const startBlockToken = Object.keys(endBlockToken)

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
    console.error('Parse error: unclosed function')
    return fn
}

/**
 * @param {object} tokens
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-component-value}
 */
function consumeComponentValue(tokens) {
    const currentToken = tokens.consume()
    if (startBlockToken.includes(currentToken)) {
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
            console.error(`Parse error: invalid token "${token.value ?? token}" in style block`)
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
    const endToken = endBlockToken[associatedToken]
    const block = { associatedToken, type: new Set(['simple-block']), value: [] }
    for (const token of tokens) {
        if (token === endToken) {
            return block
        }
        tokens.reconsume()
        block.value.push(consumeComponentValue(tokens))
    }
    console.error('Parse error: unclosed block')
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
    console.error('Parse error: invalid at rule')
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
        console.error(`Parse error: invalid declaration (${message})`)
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
            break
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
        console.error('Parse error: invalid declaration')
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
    console.error('Parse error: invalid qualified rule')
}

/**
 * @param {object[]} tokens
 * @param {boolean} topLevel
 * @return {object[]}
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
        return new DOMException('Failed to parse a component value', 'SyntaxError')
    }
    const component = consumeComponentValue(input)
    if (component) {
        return component
    }
    input.consumeRunOf(' ')
    if (input.atEnd()) {
        return component
    }
    return new DOMException('Failed to parse a component value', 'SyntaxError')
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
            list.push(...components.splice(0))
            continue
        }
        list.push(token)
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
    return new DOMException('Failed to parse a declaration', 'SyntaxError')
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
        return new DOMException('Failed to parse a rule', 'SyntaxError')
    }
    let rule
    if (input.next().type?.has('at-keyword')) {
        rule = consumeAtRule(input)
    } else {
        const qualified = consumeQualifiedRule(input)
        if (qualified) {
            rule = qualified
        }
    }
    input.consumeRunOf(' ')
    if (input.atEnd()) {
        return new DOMException('Failed to parse a rule', 'SyntaxError')
    }
    return rule
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
 * @param {string|Blob} input
 * @param {string} [location]
 * @return {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 *
 * TODO: decode input as byte stream.
 */
function parseStyleSheet(input, location = null) {
    return { location, value: parseRuleList(input, true) }
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
 * @param {string} property
 * @param {string} [testDefinition]
 * @param {boolean} [parseGlobals]
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-value}
 *
 * The optional arguments only exist for testing purposes.
 */
function parseCSSValue(value, property, testDefinition, parseGlobals = true) {
    const list = parseComponentValueList(value)
    if (parseGlobals) {
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
    }
    if (property.startsWith('--')) {
        return createList(list)
    }
    const { value: definition = testDefinition } = properties[property] ?? {}
    return parseGrammar(list, definition, context)
}

/**
 * @param {object[]} declarations
 * @returns {object[]}
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
            const { name } = declaration
            const occurrenceIndex = declarations.findIndex(declaration => declaration.name === name)
            if (-1 < occurrenceIndex) {
                declarations.splice(occurrenceIndex, 1)
            }
            declarations.push(declaration)
            return declarations
        }, [])
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
 * @returns {object}
 */
function parseCSSDeclaration(declaration) {
    const { value, ...props } = declaration
    let { name } = declaration
    if (aliases.has(name)) {
        name = aliases.get(name)
    }
    const parsedDeclaration = parseCSSValue(value, name)
    if (parsedDeclaration) {
        return { ...props, value: parsedDeclaration }
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
 * @param {CSSRule} rule
 * @param {CSSRule[]} prevRules
 * @returns {boolean}
 */
function isInvalidCSSNamespaceRule(rule, prevRules) {
    return CSSNamespaceRule.is(rule) && prevRules.some(rule => CSSImportRule.is(rule) || CSSNamespaceRule.is(rule))
}

/**
 * @param {CSSRuleList} list
 * @param {object} rule
 * @param {number} index
 * @param {object} grammar
 * @param {CSSStyleSheet|CSSRule} parentRule
 * @return {index}
 * @see {@link https://drafts.csswg.org/cssom/#insert-a-css-rule}
 */
function insertCSSRule(list, rule, index, grammar, parentRule) {
    const { length } = list
    if (length < index) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'IndexSizeError')
    }
    rule = parseCSSRule(rule, grammar, parentRule)
    if (rule instanceof SyntaxError) {
        throw rule
    }
    // TODO: handle requirements of rule hierarchy
    if (isInvalidCSSNamespaceRule(rule)) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'InvalidStateError')
    }
    list[index] = rule
    return index
}

/**
 * @param {CSSRuleList} list
 * @param {number} index
 * @see {@link https://drafts.csswg.org/cssom/#remove-a-css-rule}
 */
function removeCSSRule(list, index) {
    const { length } = list
    if (length < index) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'IndexSizeError')
    }
    const rule = list[index]
    if (isInvalidCSSNamespaceRule(rule)) {
        throw new DOMException('TODO: check out the error message from browser vendors', 'InvalidStateError')
    }
    delete list[index]
    // TODO: figure out how read-only `rule.parentRule` and `rule.parentStyleSheet` can be set to `null`
}

/**
 * @param {object} rule
 * @param {object} grammar
 * @param {CSSStyleSheet|CSSRule} parentRule
 * @returns {CSSRule|null}
 */
function matchRule({ name = 'qualified', prelude, type, value }, grammar, parentRule) {
    const { prelude: preludeDefinition, value: blockDefinition } = grammar
    if (preludeDefinition) {
        prelude = parseGrammar(prelude, preludeDefinition, context)
        if (prelude === null) {
            console.error("Parse error: invalid rule's prelude")
            return null
        }
    } else if (prelude) {
        console.error("Parse error: unexpected rule's prelude")
        return null
    }
    if (blockDefinition) {
        const { associatedToken, type } = value
        if (!type.has('simple-block') || associatedToken !== '{') {
            console.error("Parse error: invalid rule's block")
            return null
        }
        ;({ value } = value)
    } else if (value) {
        console.error("Parse error: unexpected rule's block")
        return null
    }
    let privateData
    if (CSSStyleSheet.isImpl(parentRule)) {
        privateData = { name, parentStyleSheet: parentRule, prelude, type, value }
    } else {
        privateData = { name, parentRule, prelude, type, value }
    }
    return create[name](globalThis, undefined, privateData)
}

/**
 * @param {string} rule
 * @param {object} grammar
 * @param {CSSStyleSheet|CSSRule} parentRule
 * @returns {object|SyntaxError}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-rule}
 */
function parseCSSRule(rule, grammar, parentRule) {
    rule = parseRule(rule)
    if (rule instanceof SyntaxError) {
        return rule
    }
    rule = matchRule(rule, grammar, parentRule)
    if (rule === null) {
        return new DOMException('Failed to match the grammar of the rule', 'SyntaxError')
    }
    return rule
}

/**
 * @param {object[]} list
 * @param {object} definition
 * @param {CSSRule} parentRule
 * @returns {*[]}
 */
function parseCSSDeclarationList(list, { properties = [], rules = [] }, parentRule) {
    return parseDeclarationList(list).reduce((statements, statement) => {
        const { name, type } = statement
        let parsed
        if (type.has('at-rule')) {
            const definition = rules[name]
            if (definition) {
                parsed = matchRule(statement, definition, parentRule)
            }
        } else if (properties.includes(name)) {
            parsed = parseCSSDeclaration(statement)
        }
        if (parsed) {
            statements.push(parsed)
        } else {
            console.error('Parse error: invalid rule or declaration')
        }
        return statements
    }, [])
}

/**
 * @param {object[]} list
 * @param {object} definition
 * @param {CSSStyleRule} rule
 * @returns {*[]}
 */
function parseCSSStyleBlock(list, definition, parentRule) {
    return parseStyleBlock(list).reduce((statements, statement) => {
        const { name, type } = statement
        if (type?.has('rule')) {
            if (type.has('at-rule') && name !== 'media' && name !== 'nest') {
                return statements
            }
            statement = matchRule(statement, definition, parentRule)
        } else {
            statement = parseCSSDeclaration(statement)
        }
        if (statement) {
            statements.push(statement)
        } else {
            console.error('Parse error: invalid rule')
        }
        return statements
    }, [])
}

/**
 * @param {object[]} list
 * @param {object} grammar
 * @param {CSSStyleSheet|CSSRule} parentRule
 * @returns {CSSRuleList}
 */
function parseCSSRuleList(list, { type, rules }, parentRule) {
    let included
    let excluded
    if (type === '<stylesheet>') {
        // Prevent non top-level rule to be used as a top-level rule, eg. `@top-left` in `@media`
        included = topLevelRules
        excluded = rules
    } else {
        included = rules
    }
    const topLevel = CSSStyleSheet.isImpl(parentRule)
    const parsed = parseRuleList(list, topLevel).reduce((rules, rule) => {
        const { name = 'qualified' } = rule
        const definition = included[name]
        if (!definition || excluded.includes(name)) {
            return rules
        }
        rule = matchRule(rule, definition, parentRule)
        if (rule) {
            rules.push(rule)
        }
        return rules
    }, [])
    return CSSRuleList.create(globalThis, undefined, { rules: parsed })
}

/**
 * @param {object} properties
 * @returns {CSSStyleSheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 * @see {@link https://github.com/whatwg/html/issues/2997}
 */
function parseCSSStyleSheet(properties) {
    return CSSStyleSheet.create(globalThis, undefined, properties)
    // return parseCSSGrammar(input, '<stylesheet>') // It works but HTML comments are not handled yet
}

module.exports = {
    getDeclarationsInSpecifiedOrder,
    insertCSSRule,
    parseCSSDeclarationBlock,
    parseCSSDeclarationList,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSRule,
    parseCSSRuleList,
    parseCSSStyleBlock,
    parseCSSStyleSheet,
    parseCSSValue,
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
    parseStyleSheet,
    removeCSSRule,
    setCSSDeclaration,
}

const CSSStyleSheet = require('../cssom/CSSStyleSheet.js')
/**
 * TODO:
 * - CSSCharsetRule: @charset <???-charset-name>;
 * - CSSCounterStyleRule: @counter-style <counter-style-name> { <declaration-list> }
 * - CSSFontFaceRule: @font-face { <declaration-list> }
 * - CSSFontFeatureValuesRule: @font-feature-values <family-name># { <declaration-list> }
 * - CSSNestingRule: @nest <selector-list> { <style-block> }
 * - CSSPropertyRule: @property <custom-property-name> { <declaration-list> }
 *
 * Not ready yet:
 * @see {@link https://drafts.csswg.org/css-contain-3/#container-rule}
 */
const CSSImportRule = require('../cssom/CSSImportRule.js')
const CSSKeyframeRule = require('../cssom/CSSKeyframeRule.js')
const CSSKeyframesRule = require('../cssom/CSSKeyframesRule.js')
const CSSMarginRule = require('../cssom/CSSMarginRule.js')
const CSSMediaRule = require('../cssom/CSSMediaRule.js')
const CSSNamespaceRule = require('../cssom/CSSNamespaceRule.js')
const CSSPageRule = require('../cssom/CSSPageRule.js')
const CSSStyleRule = require('../cssom/CSSStyleRule.js')
const CSSSupportsRule = require('../cssom/CSSSupportsRule.js')

const { definition: importDefinition } = require('../cssom/CSSImportRule-impl.js')
const { definition: keyframes } = require('../cssom/CSSKeyframesRule-impl.js')
const { definition: media } = require('../cssom/CSSMediaRule-impl.js')
const { definition: namespace } = require('../cssom/CSSNamespaceRule-impl.js')
const { definition: page } = require('../cssom/CSSPageRule-impl.js')
const { definition: qualified } = require('../cssom/CSSStyleRule-impl.js')
const { definition: supports } = require('../cssom/CSSSupportsRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade/#at-import}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rules}
 * @see {@link https://drafts.csswg.org/css-page-3/#syntax-page-selector}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#at-media}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#at-supports}
 * @see {@link https://drafts.csswg.org/css-namespaces/#syntax}
 *
 * TODO:
 * - CSSCharsetRule: @charset <???-charset-name>;
 * - CSSCounterStyleRule: @counter-style <counter-style-name> { <declaration-list> }
 * - CSSFontFaceRule: @font-face { <declaration-list> }
 * - CSSFontFeatureValuesRule: @font-feature-values <family-name># { <declaration-list> }
 * - CSSNestingRule: @nest <selector-list> { <style-block> }
 * - CSSPropertyRule: @property <custom-property-name> { <declaration-list> }
 *
 * Not ready yet:
 * @see {@link https://drafts.csswg.org/css-contain-3/#container-rule}
 */
const topLevelRules = {
    import: importDefinition,
    keyframes,
    media,
    namespace,
    page,
    qualified,
    supports,
}

const create = {
    import: CSSImportRule.create,
    keyframe: CSSKeyframeRule.create,
    keyframes: CSSKeyframesRule.create,
    ...[
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
    ].reduce((rules, name) => (rules[name] = CSSMarginRule.create, rules), {}),
    media: CSSMediaRule.create,
    namespace: CSSNamespaceRule.create,
    page: CSSPageRule.create,
    qualified: CSSStyleRule.create,
    supports: CSSSupportsRule.create,
}
