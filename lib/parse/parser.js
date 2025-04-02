
const { isCloseCurlyBrace, isColon, isComma, isComputationallyIndependent, isDelimiter, isOpenCurlyBrace, isSemicolon, isSimpleBlock, isWhitespace } = require('../utils/value.js')
const Stream = require('./stream.js')
const blocks = require('../values/blocks.js')
const compatibility = require('../compatibility.js')
const error = require('../error.js')
const expandShorthandDeclaration = require('./shorthand.js')
const grammar = require('./grammar.js')
const { list } = require('../values/value.js')
const tokenize = require('./tokenize.js')
const root = require('../rules/definitions.js')
const shorthands = require('../properties/shorthands.js')
const substitutions = require('../values/substitutions.js')

const contextType = Symbol('context')
const endingTokens = Object.values(blocks.associatedTokens)

const EXTRA_COMPONENT_VALUE_ERROR = {
    message: 'Cannot parse more than a single component value',
}
const EXTRA_RULE_ERROR = {
    message: 'Cannot parse more than a single rule',
}
const INSERT_INVALID_IMPORT_ERROR = {
    message: 'Cannot insert @import in a constructed style sheet',
    name: 'SyntaxError',
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

/**
 * @param {object[]} declarations
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#concept-declarations-specified-order}
 */
function getDeclarationsInSpecifiedOrder(declarations) {
    return declarations
        .flatMap(declaration =>
            shorthands.has(declaration.name)
                ? expandShorthandDeclaration(declaration)
                : declaration)
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
 * @param {CSSRuleImpl} rule
 * @returns {boolean}
 */
function isImportOrNamespaceRule(rule) {
    return CSSImportRule.isImpl(rule) || CSSNamespaceRule.isImpl(rule)
}

/**
 * @param {CSSFontPaletteValuesRuleImpl} rule
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#at-ruledef-font-palette-values}
 */
function isInvalidFontPaletteValuesRule(rule) {
    return CSSFontPaletteValuesRule.isImpl(rule) && !rule.fontFamily
}

/**
 * @param {CSSRuleImpl[]} list
 * @param {CSSRuleImpl} rule
 * @param {number} index
 * @returns {boolean}
 */
function isInvalidIndexForRule(list, rule, index) {
    if (CSSImportRule.isImpl(rule)) {
        return !list.slice(0, index).every((rule, index, list) => {
            if (CSSLayerStatementRule.isImpl(rule)) {
                return list.slice(0, index).every(CSSLayerStatementRule.isImpl)
            }
            return CSSImportRule.isImpl(rule)
        })
    }
    if (CSSLayerStatementRule.isImpl(rule)) {
        return list.slice(0, index).some(isImportOrNamespaceRule)
            && list.slice(index).some(isImportOrNamespaceRule)
    }
    if (CSSNamespaceRule.isImpl(rule)) {
        return !list.slice(0, index).every((rule, index, list) => {
            if (CSSLayerStatementRule.isImpl(rule)) {
                return list.slice(0, index).every(CSSLayerStatementRule.isImpl)
            }
            return isImportOrNamespaceRule(rule)
        })
        || list.slice(index).some(CSSImportRule.isImpl)
    }
    return list.slice(index).some(isImportOrNamespaceRule)
}

/**
 * @param {CSSRuleImpl[]} list
 * @param {object} rule
 * @returns {boolean}
 */
function isInvalidNamespaceRule(list, rule) {
    return CSSNamespaceRule.isImpl(rule)
        && !list.every(rule => isImportOrNamespaceRule(rule) || CSSLayerStatementRule.isImpl(rule))
}

/**
 * @param {CSSPropertyRuleImpl} rule
 * @returns {boolean}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#at-ruledef-property}
 */
function isInvalidPropertyRule(rule) {
    if (!CSSPropertyRule.isImpl(rule)) {
        return false
    }
    const { inherits, initialValue, syntax } = rule
    if (inherits === undefined || syntax === undefined) {
        return true
    }
    if (syntax === '"*"') {
        return substitutions.keywords.includes(initialValue)
    }
    if (initialValue) {
        const parsed = parseCSSGrammar(initialValue, syntax.slice(1, -1), '@style')
        return !(parsed && isComputationallyIndependent(parsed))
    }
    return true
}

/**
 * @param {CSSRuleImpl[]} list
 * @param {CSSRuleImpl} rule
 * @param {number} index
 * @param {object} context
 * @param {boolean} [allowImport]
 * @returns {number}
 * @see {@link https://drafts.csswg.org/cssom-1/#insert-a-css-rule}
 */
function insertCSSRule(list, rule, index, context, allowImport = false) {
    if (list.length < index) {
        throw error(INVALID_RULE_INDEX_ERROR)
    }
    rule = parseRule(rule, context)
    if (rule instanceof SyntaxError) {
        throw error(rule)
    }
    if (!allowImport && CSSImportRule.isImpl(rule)) {
        throw error(INSERT_INVALID_IMPORT_ERROR)
    }
    if (isInvalidIndexForRule(list, rule, index)) {
        throw error(INVALID_RULE_POSITION_ERROR)
    }
    if (isInvalidNamespaceRule(list, rule)) {
        throw error(INVALID_NAMESPACE_STATE_ERROR)
    }
    list.splice(index, 0, rule)
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
 * @param {string|null} name
 * @param {object[]} prelude
 * @param {Stream|null} [value]
 * @param {object} definition
 * @param {object} context
 * @returns {CSSRuleImpl|CSSFontFeatureValuesMapImpl}
 */
function createCSSRule(name, prelude, value, definition, context) {
    return cssom[definition.cssom].createImpl(globalThis, undefined, {
        name,
        parentRule: context.rule?.value,
        parentStyleSheet: context.root.value,
        prelude,
        value,
    })
}

/**
 * @param {string} name
 * @param {CSSRuleImpl|Element|string} context
 * @returns {string}
 */
function getDeclarationName(name, context) {
    context = createContext(context)
    const { rule: { definition: { name: ruleName, value } } } = context
    if (name.startsWith('--')) {
        return CSS.escape(name)
    }
    name = name.toLowerCase()
    if (value.properties) {
        return compatibility.properties.aliases.get(name) ?? name
    }
    return compatibility.descriptors[ruleName]?.aliases.get(name) ?? name
}

/**
 * @param {string} name
 * @param {object} context
 * @returns {object|null}
 */
function getDeclarationValueDefinition(name, context) {
    name = getDeclarationName(name, context)
    const { rule: { definition: { name: ruleName, value: { descriptors, properties } } } } = context
    if (properties) {
        if (name.startsWith('--')) {
            const definition = properties?.['--*']
            if (definition) {
                return { name, type: 'property', value: definition.value }
            }
            return null
        }
        const target = compatibility.properties.mappings.get(name)
        const value = properties[target]?.value ?? properties[name]?.value
        if (value) {
            return { name, type: 'property', value }
        }
    }
    if (descriptors) {
        if (name.startsWith('--')) {
            const definition = descriptors?.['--*']
            if (definition) {
                return { name, type: 'descriptor', value: definition.value }
            }
            return null
        }
        const target = compatibility.descriptors[ruleName]?.mappings?.get(name)
        const value = descriptors[target]?.value ?? descriptors[name]?.value ?? descriptors['*']
        if (value) {
            return { name, type: 'descriptor', value }
        }
    }
    return null
}

/**
 * @param {object} context
 * @param {string} [name]
 * @param {object[]} [prelude]
 * @param {string} [type]
 * @returns {object|null}
 */
function getRuleDefinition({ root, rule }, name, prelude, type) {
    const contextDefinition = rule ? rule.definition.value : root.definition
    if (!contextDefinition) {
        return null
    }
    if (name) {
        name = `@${name}`
        const alias = compatibility.rules.aliases.get(name)
        if (alias) {
            name = alias
        }
        return contextDefinition.rules?.find(rule =>
            !rule.qualified
            && (rule.name === name || rule.names?.includes(name))
            && (rule.prelude ? true : prelude.length === 0)
            && (rule.value ? 'block' : 'statement') === type)
    }
    return contextDefinition.rules?.find(rule => rule.qualified)
}

/**
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|CSSStyleSheetImpl|Element|null|...string} [value] CSSOM value or rule name(s)
 * @returns {object[]}
 */
function createContext(...identifiers) {
    const value = identifiers[0] ?? null
    if (value?.type === contextType) {
        return value
    }
    if (CSSRule.isImpl(value)) {
        const { parentRule, parentStyleSheet } = value
        const context = createContext(parentRule ?? parentStyleSheet)
        const { root, rule } = context
        const contextDefinition = rule ? rule.definition.value : root.definition
        const definition = contextDefinition.rules.find(definition => cssom[definition.cssom].isImpl(value))
        return { ...context, rule: { context, definition, value } }
    }
    if (CSSFontFeatureValuesMap.isImpl(value)) {
        const { parentRule, parentStyleSheet } = value
        const context = createContext(parentRule ?? parentStyleSheet)
        const definition = value._definition
        return { ...context, rule: { context, definition, value } }
    }
    const namespaces = new Set(['*'])
    value?._rules?.forEach(rule => {
        if (CSSNamespaceRule.isImpl(rule)) {
            namespaces.add(rule.prefix)
        }
    })
    const globals = new Map([['namespaces', namespaces]])
    const trees = []
    const context = {
        globals,
        root: { definition: root, value },
        trees,
        type: contextType,
    }
    if (CSSStyleSheet.isImpl(value)) {
        return context
    }
    // Rule name(s)
    if (typeof value === 'string') {
        return identifiers.reduce(
            (context, name) => {
                const { root, rule } = context
                const contextDefinition = rule ? rule.definition.value : root.definition
                const definition = contextDefinition.rules.find(rule => rule.name === name)
                return { ...context, rule: { context, definition } }
            },
            context)
    }
    // Assert: value is an Element
    if (value) {
        const definition = root.rules.find(definition => definition.qualified)
        return { ...context, rule: { definition } }
    }
    return { globals, trees, type: contextType }
}

/**
 * @param {Stream} tokens
 * @param {object} token
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-function}
 *
 * It deviates from the specification by trimming whitespaces.
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
 * It deviates from the specification by trimming whitespaces.
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
 * emitting a parse error when processing `}` while the list is not nested.
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
 * @param {boolean} forCustomProperty
 * @param {boolean} [nested]
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-the-remnants-of-a-bad-declaration}
 *
 * It deviates from the specification by stopping consuming after a (positioned)
 * {}-block in a declaration not for a custom property.
 */
function consumeBadDeclaration(tokens, forCustomProperty, nested) {
    while (!tokens.atEnd()) {
        if (tokens.consume(isSemicolon)) {
            return
        }
        const next = tokens.next()
        if (isOpenCurlyBrace(next)) {
            consumeComponentValue(tokens)
            if (!forCustomProperty) {
                return
            }
        } else if (isCloseCurlyBrace(next)) {
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
 * @param {boolean} forCustomProperty
 * @param {boolean} [nested]
 * @returns {SyntaxError|object|undefined}
 */
function consumeDeclarationValue(tokens, forCustomProperty, nested) {
    const value = list([], '')
    let token
    while (token = tokens.next()) {
        if (isWhitespace(token)) {
            value.push(tokens.consume())
            continue
        }
        // Stop token
        if (isDelimiter('!', token) || isSemicolon(token) || (nested && isCloseCurlyBrace(token))) {
            break
        }
        // Invalid token
        if (token.types[0].startsWith('<bad-') || isDelimiter(endingTokens, token)) {
            return error(INVALID_DECLARATION_SYNTAX_ERROR)
        }
        const component = consumeComponentValue(tokens)
        if (forCustomProperty) {
            value.push(component)
            continue
        }
        // Positioned {}-block
        if (value.some(component => !isWhitespace(component)) && isSimpleBlock('{', component)) {
            return
        }
        const prev = value.findLast(component => !isWhitespace(component))
        if (prev && isSimpleBlock('{', prev)) {
            return
        }
        value.push(component)
    }
    if (isWhitespace(value.at(-1))) {
        value.pop()
    }
    return value
}

/**
 * @param {Stream} tokens
 * @param {object} context
 * @param {boolean} [nested]
 * @returns {SyntaxError|object|undefined}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-declaration}
 *
 * It deviates from the specification by consuming the remnants of an invalid
 * declaration, and returning an error instead of nothing, when it cannot be
 * parsed as a rule, to resume parsing the next content instead of backtracking.
 *
 * It deviates from the specification by consuming the declaration value like a
 * <declaration-value> but accepting positioned {}-blocks for a custom property.
 */
function consumeDeclaration(tokens, context, nested) {

    let name = tokens.consume(token => token.types[0] === '<ident-token>')
    if (!name) {
        return
    }
    const definition = getDeclarationValueDefinition(name.value, context)
    if (!definition) {
        return
    }
    name = definition.name

    tokens.consume(isWhitespace)
    if (!tokens.consume(isColon)) {
        return
    }
    tokens.consume(isWhitespace)

    const forCustomProperty = name.startsWith('--')

    let value = consumeDeclarationValue(tokens, forCustomProperty, nested)
    if (value instanceof SyntaxError) {
        consumeBadDeclaration(tokens, forCustomProperty, nested)
        return value
    }
    if (!value) {
        return value
    }

    let important = false
    if (tokens.consume(isDelimiter('!'))) {
        tokens.consume(isWhitespace)
        if (!tokens.consume(({ types, value }) => types[0] === '<ident-token>' && value === 'important')) {
            consumeBadDeclaration(tokens, forCustomProperty, nested)
            return error(INVALID_DECLARATION_SYNTAX_ERROR)
        }
        important = true
        tokens.consume(isWhitespace)
    }
    if (important && !context.rule.definition.cascading) {
        return error(INVALID_DECLARATION_SYNTAX_ERROR)
    }

    value = parseCSSGrammar(value, definition, { ...context, declaration: { context, definition } })
    if (value) {
        const types = ['<declaration>']
        if (forCustomProperty) {
            const source = 0 < value.length ? tokens.source.slice(value[0].start, value.at(-1).end) : ''
            return { important, name, source, types, value }
        }
        if (context.globals.has('pending')) {
            context.globals.delete('pending')
            return { important, name, pending: name, types, value }
        }
        return { important, name, types, value }
    }
    consumeBadDeclaration(tokens, true, nested)
    return error(INVALID_DECLARATION_SYNTAX_ERROR)
}

/**
 * @param {Stream} tokens
 * @param {object} context
 * @param {boolean} [nested]
 * @returns {CSSRuleImpl|SyntaxError}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-qualified-rule}
 *
 * It deviates from the specification by returning an error instead of nothing.
 *
 * It deviates from the specification by consuming a list of component values
 * with the appropriate stop tokens for its prelude.
 */
function consumeQualifiedRule(tokens, context, nested) {
    let prelude = consumeComponentValueList(tokens, nested ? ['{', '}', ';'] : ['{'])
    if (tokens.consume(isOpenCurlyBrace)) {
        // `--custom: ...` cannot produce a valid rule
        const [head, ...tail] = prelude
        if (head?.types[0] === '<ident-token>' && head.value.startsWith('--')) {
            for (const component of tail) {
                if (isWhitespace(component)) {
                    continue
                }
                if (isColon(component)) {
                    tokens.reconsume()
                    if (nested) {
                        consumeBadDeclaration(tokens, true, true)
                    } else {
                        consumeComponentValue(tokens)
                    }
                    return error(INVALID_RULE_SYNTAX_ERROR)
                }
                break
            }
        }
        const definition = getRuleDefinition(context)
        if (definition && (prelude = parseCSSGrammar(prelude, definition.prelude, { ...context, definition }))) {
            return createCSSRule(null, prelude, tokens, definition, context)
        }
        tokens.reconsume()
        consumeComponentValue(tokens)
    }
    return error(INVALID_RULE_SYNTAX_ERROR)
}

/**
 * @param {Stream} tokens
 * @param {object} context
 * @param {boolean} [nested]
 * @returns {CSSRuleImpl|CSSFontFeatureValuesMapImpl|SyntaxError}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-an-at-rule}
 *
 * It deviates from the specification by returning an error instead of nothing.
 *
 * It deviates from the specification by consuming a list of component values
 * with the appropriate stop tokens for its prelude.
 */
function consumeAtRule(tokens, context, nested) {
    const name = tokens.consume().value.toLowerCase()
    let prelude = consumeComponentValueList(tokens, nested ? ['{', ';', '}'] : ['{', ';'])
    // Block at-rule
    if (tokens.consume(isOpenCurlyBrace)) {
        const definition = getRuleDefinition(context, name, prelude, 'block')
        if (!definition || (definition.prelude && !(prelude = parseCSSGrammar(prelude, definition.prelude, { ...context, definition })))) {
            tokens.reconsume()
            consumeComponentValue(tokens)
            return error(INVALID_RULE_SYNTAX_ERROR)
        }
        const rule = createCSSRule(name, prelude, tokens, definition, context)
        if (isInvalidFontPaletteValuesRule(rule) || isInvalidPropertyRule(rule)) {
            return error(INVALID_RULE_SYNTAX_ERROR)
        }
        return rule
    }
    // Statement at-rule
    const definition = getRuleDefinition(context, name, prelude, 'statement')
    tokens.consume(isSemicolon)
    if (definition?.prelude && !definition.value && (prelude = parseCSSGrammar(prelude, definition.prelude, { ...context, definition }))) {
        return createCSSRule(name, prelude, null, definition, context)
    }
    return error(INVALID_RULE_SYNTAX_ERROR)
}

/**
 * @param {Stream} tokens
 * @param {object} context
 * @param {boolean} [ignoreCloseCurlyBlock]
 * @returns {*[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-block}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-blocks-contents}
 * @see {@link https://github.com/w3c/csswg-drafts/pull/9821}
 *
 * It deviates from the specification by asserting that the current token is `{`
 * and consuming contents in place.
 *
 * It deviates from the specification by not backtracking after consuming a
 * declaration whose value contains <bad-*-token>, `]`, `)`.
 *
 * It deviates from the specification by sorting declarations in specified
 * order.
 */
function consumeBlock(tokens, context, ignoreCloseCurlyBlock) {
    const rules = []
    const declarations = []
    while (!tokens.atEnd()) {
        if (tokens.consume(isWhitespace) || tokens.consume(isSemicolon)) {
            continue
        }
        if (tokens.consume(isCloseCurlyBrace)) {
            if (ignoreCloseCurlyBlock) {
                continue
            }
            break
        }
        if (tokens.next().types[0] === '<at-keyword-token>') {
            const rule = consumeAtRule(tokens, context, true)
            if (!(rule instanceof SyntaxError)) {
                if (0 < declarations.length) {
                    rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0), context))
                }
                rules.push(rule)
            }
            continue
        }
        const { index } = tokens
        const declaration = consumeDeclaration(tokens, context, true)
        if (declaration instanceof SyntaxError) {
            continue
        }
        if (declaration) {
            declarations.push(declaration)
            continue
        }
        tokens.moveTo(index)
        const rule = consumeQualifiedRule(tokens, context, true)
        if (!(rule instanceof SyntaxError)) {
            if (0 < declarations.length) {
                rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0), context))
            }
            rules.push(rule)
        }
    }
    if (0 < declarations.length) {
        rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0), context))
    }
    return rules
}

/**
 * @param {Stream} tokens
 * @param {object} context
 * @param {boolean} [allowImport]
 * @returns {CSSRuleImpl[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-stylesheets-contents}
 *
 * It deviates from the specification by validating and/or discarding rules here
 * instead of in consumeAtRule() or CSSStyleSheet.replace*().
 */
function consumeStyleSheet(tokens, context, allowImport) {
    const rules = list([], ' ', ['<block-contents>'])
    while (!tokens.atEnd()) {
        if (tokens.consume(token => isDelimiter([' ', '<!--', '-->'], token))) {
            continue
        }
        if (tokens.next().types[0] === '<at-keyword-token>') {
            const rule = consumeAtRule(tokens, context)
            if (
                rule instanceof SyntaxError
                || (!allowImport && CSSImportRule.isImpl(rule))
                || isInvalidIndexForRule(rules, rule, rules.length)
                || isInvalidNamespaceRule(rules, rule)
            ) {
                continue
            }
            if (CSSNamespaceRule.isImpl(rule)) {
                context.globals.get('namespaces').add(rule.prefix)
            }
            rules.push(rule)
            continue
        }
        const rule = consumeQualifiedRule(tokens, context)
        if (!(rule instanceof SyntaxError)) {
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
 * @param {CSSRuleImpl|Element|string} context
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-declaration}
 */
function parseDeclaration(input, context) {
    input = normalizeIntoTokens(input)
    input.consume(isWhitespace)
    context = createContext(context)
    return consumeDeclaration(input, context) ?? error(INVALID_DECLARATION_SYNTAX_ERROR)
}

/**
 * @param {Stream|string|object[]} input
 * @param {CSSRuleImpl|CSSStyleSheet} context
 * @returns {SyntaxError|CSSRuleImpl}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-rule}
 */
function parseRule(input, context) {
    input = normalizeIntoTokens(input)
    input.consume(isWhitespace)
    if (input.atEnd()) {
        return error(MISSING_RULE_ERROR)
    }
    context = createContext(context)
    const rule = input.next().types[0] === '<at-keyword-token>'
        ? consumeAtRule(input, context)
        : consumeQualifiedRule(input, context)
    if (rule instanceof SyntaxError) {
        return rule
    }
    input.consume(isWhitespace)
    return input.atEnd() ? rule : error(EXTRA_RULE_ERROR)
}

/**
 * @param {Stream|string|object[]} input
 * @param {CSSRuleImpl|Element} context
 * @returns {object[]}
 */
function parseDeclarationBlock(input, context) {
    input = normalizeIntoTokens(input)
    context = createContext(context)
    const declarations = consumeBlock(input, context, true).filter(Array.isArray).flat()
    return getDeclarationsInSpecifiedOrder(declarations)
}

/**
 * @param {Stream|string|object[]} input
 * @param {CSSRuleImpl|Element} context
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-blocks-contents}
 */
function parseBlockContents(input, context) {
    return consumeBlock(normalizeIntoTokens(input), createContext(context))
}

/**
 * @param {ReadableStream|Stream|string|object[]} input
 * @param {CSSStyleSheetImpl} context
 * @param {boolean} [allowImport]
 * @returns {CSSRuleImpl[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 */
function parseStyleSheet(input, context, allowImport = false) {
    return consumeStyleSheet(normalizeIntoTokens(input), createContext(context), allowImport)
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} grammar
 * @param {CSSRuleImpl|Element|string} [context]
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 *
 * It deviates from the specification by normalizing the input in a lower level
 * entry point.
 */
function parseCSSGrammar(input, grammar, context) {
    const match = parseCSSValue(input, grammar, createContext(context))
    return match instanceof SyntaxError ? null : match
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} grammar
 * @param {CSSRuleImpl|Element|string} [context]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseCSSGrammarList(input, grammar, context) {
    input = parseCommaSeparatedComponentValueList(input)
    if (input.length === 1) {
        const list = input[0]
        if (list.length === 1 && isWhitespace(list[0])) {
            input.pop()
            return input
        }
    }
    context = createContext(context)
    return list(input.map(list => parseCSSGrammar(list, grammar, context)), ',')
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {SyntaxError|object|null}
 */
function parseCSSArbitrarySubstitution(input, context) {
    const { rule: { definition: { cascading, elemental } } } = context
    for (const { cascade, element, name, type = `<${name}()>` } of substitutions.arbitrary) {
        if (!elemental && (element || (cascade && !cascading && name !== '@function'))) {
            continue
        }
        if (!parseCSSGrammar(input.name, name)) {
            continue
        }
        return parseCSSValue([input], type, context)
            ?? error({ message: 'Invalid substitution' })
    }
    return null
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {SyntaxError|object[]|null}
 */
function parseCSSArbitrarySubstitutionContainingValue(input, context) {
    const matched = list([], '')
    let match = false
    for (let component of input) {
        let { types, value } = component
        switch (types[0]) {
            case '<function>': {
                const substitution = parseCSSArbitrarySubstitution(component, context)
                if (substitution instanceof SyntaxError) {
                    return substitution
                }
                if (substitution) {
                    component = substitution
                    match = true
                }
            }
            // falls through
            case '<simple-block>': {
                value = parseCSSArbitrarySubstitutionContainingValue(
                    new Stream(value),
                    { ...context, function: { context, input } })
                if (value instanceof SyntaxError) {
                    return value
                }
                if (value) {
                    match = true
                }
            }
            // falls through
            default:
                matched.push(component)
        }
    }
    if (match) {
        context.globals.set('pending', true)
        return matched
    }
    return null
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
    for (const { element, name, pending } of substitutions.whole) {
        if (elemental || !element) {
            const match = parseCSSValue(input, `<${name}()>`, context, 'greedy')
            if (match instanceof SyntaxError) {
                return match
            }
            if (match) {
                if (pending) {
                    context.globals.set('pending', true)
                }
                return match
            }
        }
    }
    return null
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
    const { forgiving, trees } = context

    // Try parsing arbitrary substitution containing value
    if (trees.length === 0 && (type === 'descriptor' || type === 'property')) {
        const substitution = parseCSSArbitrarySubstitutionContainingValue(input, context)
        if (substitution) {
            return substitution
        }
        input.reset()
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
                throw Error('Unrecognized parse state')
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
            return (forgiving && !context.function?.context.forgiving) ? null : match
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
 * @param {string} name
 * @param {string} value
 * @param {boolean} important
 * @param {CSSRuleImpl|Element|string} context
 * @returns {object|null}
 */
function parseCSSDeclaration(name, value, important, context) {

    context = createContext(context)

    if (important && !context.rule.definition.cascading) {
        return null
    }

    const definition = getDeclarationValueDefinition(name, context)
    if (!definition) {
        return null
    }
    name = definition.name

    const forCustomProperty = name.startsWith('--')
    const source = value
    const tokens = normalizeIntoTokens(value)

    tokens.consume(isWhitespace)

    value = consumeDeclarationValue(tokens, forCustomProperty)
    if (!value || value instanceof SyntaxError || !tokens.atEnd()) {
        return null
    }

    context = { ...context, declaration: { context, definition } }
    value = new Stream(value, source)
    value = parseCSSGrammar(value, definition, context)
    if (!value) {
        return null
    }
    if (forCustomProperty) {
        return { important, name, source, value }
    }
    if (context.globals.has('pending')) {
        context.globals.delete('pending')
        return { important, name, pending: name, value }
    }
    return { important, name, value }
}

/**
 * @param {ReadableStream|Stream|string|object[]} rules
 * @returns {CSSStyleSheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 */
function parseCSSStyleSheet(rules) {
    return CSSStyleSheet.create(globalThis, undefined, { rules })
}

const parser = module.exports = {
    createContext,
    getDeclarationName,
    getDeclarationValueDefinition,
    insertCSSRule,
    parseBlockContents,
    parseCSSDeclaration,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSStyleSheet,
    parseCSSValue,
    parseCommaSeparatedComponentValueList,
    parseComponentValue,
    parseComponentValueList,
    parseDeclaration,
    parseDeclarationBlock,
    parseRule,
    parseStyleSheet,
    removeCSSRule,
}
// Import cssom after exporting parser (circular dependency)
const cssom = require('../cssom/index.js')
const {
    CSSImportRule,
    CSSLayerStatementRule,
    CSSNamespaceRule,
    CSSPropertyRule,
    CSSFontFeatureValuesMap,
    CSSFontPaletteValuesRule,
    CSSRule,
    CSSStyleSheet,
} = cssom
