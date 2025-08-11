
import * as compatibility from '../compatibility.js'
import * as substitutions from '../values/substitutions.js'
import {
    CSSFontFeatureValuesMap,
    CSSFontPaletteValuesRule,
    CSSImportRule,
    CSSLayerStatementRule,
    CSSNamespaceRule,
    CSSPropertyRule,
    CSSRule,
    CSSStyleSheet,
} from '../cssom/index.js'
import {
    EXTRA_COMPONENT_VALUE_ERROR,
    EXTRA_RULE_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    INVALID_DECLARATION_VALUE_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    INVALID_RULE_SYNTAX_ERROR,
    MISSING_COMPONENT_VALUE_ERROR,
    MISSING_RULE_ERROR,
    create as error,
} from '../error.js'
import { associatedTokens, closingTokens } from '../values/blocks.js'
import { type as contextType, getRoot, getRule, isContext } from '../utils/context.js'
import {
    isBlock,
    isCloseCurlyBrace,
    isColon,
    isComma,
    isComputationallyIndependent,
    isDelimiter,
    isError,
    isFailure,
    isOpenCurlyBrace,
    isSemicolon,
    isWhitespace,
} from '../utils/value.js'
import { create as createGrammar, parse as parseGrammar } from './grammar.js'
import { isNode, type as nodeType } from '../utils/node.js'
import Stream from './stream.js'
import { cssom } from '../index.js'
import expandShorthandDeclaration from './shorthand.js'
import { list } from '../values/value.js'
import root from '../rules/definitions.js'
import shorthands from '../properties/shorthands.js'
import tokenize from './tokenize.js'

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
        const match = parseCSSGrammar(initialValue, syntax.slice(1, -1), '@style')
        return isFailure(match) || !isComputationallyIndependent(match)
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
    if (isError(rule)) {
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
 * @param {object} node
 * @param {string} [name]
 * @param {object[]} [prelude]
 * @param {Stream} [value]
 * @returns {CSSRuleImpl|CSSFontFeatureValuesMapImpl}
 */
function createCSSRule(node, name, prelude, value) {
    const properties = {
        name,
        parentRule: getRule(node)?.value,
        parentStyleSheet: getRoot(node).value,
        prelude,
        value,
    }
    return cssom[node.definition.cssom].createImpl(globalThis, undefined, properties)
}

/**
 * @param {CSSRuleImpl|Element|object|string} context
 * @param {string} name
 * @returns {string}
 */
function getDeclarationName(context, name) {
    context = createContext(context)
    const { definition: { name: ruleName, value } } = context
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
 * @param {object} context
 * @param {string} name
 * @returns {object|null}
 */
function getDeclarationDefinition(context, name) {
    const { definition: { name: ruleName, value: { descriptors, properties } } } = context
    name = getDeclarationName(context, name)
    if (properties) {
        if (name.startsWith('--')) {
            const definition = properties?.['--*']
            if (definition) {
                return { name, type: 'declaration', value: definition.value }
            }
            return null
        }
        const target = compatibility.properties.mappings.get(name)
        const value = properties[target]?.value ?? properties[name]?.value
        if (value) {
            return { name, type: 'declaration', value }
        }
    }
    if (descriptors) {
        if (name.startsWith('--')) {
            const definition = descriptors?.['--*']
            if (definition) {
                return { name, type: 'declaration', value: definition.value }
            }
            return null
        }
        const target = compatibility.descriptors[ruleName]?.mappings?.get(name)
        const value = descriptors[target]?.value ?? descriptors[name]?.value ?? descriptors['*']
        if (value) {
            return { name, type: 'declaration', value }
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
function getRuleDefinition(context, name, prelude, type) {
    const contextDefinition = context.definition.value ?? context.definition
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
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|CSSStyleSheetImpl|Element|object|string|string[]} [value]
 * @returns {object}
 */
function createContext(value) {

    if (isContext(value)) {
        return value
    }
    if (isNode(value)) {
        return { ...value.context, ...value, type: contextType }
    }
    if (CSSRule.isImpl(value)) {
        const { parentRule, parentStyleSheet } = value
        const context = createContext(parentRule ?? parentStyleSheet)
        const contextDefinition = context.definition.value ?? context.definition
        const definition = contextDefinition.rules.find(definition => cssom[definition.cssom].isImpl(value))
        return { ...context, context, definition, value }
    }
    if (CSSFontFeatureValuesMap.isImpl(value)) {
        const { parentRule, parentStyleSheet } = value
        const context = createContext(parentRule ?? parentStyleSheet)
        const definition = value._definition
        return { ...context, context, definition, value }
    }

    const namespaces = new Set(['*'])
    const context = {
        definition: root,
        globals: new Map([['namespaces', namespaces]]),
        trees: [],
        type: contextType,
    }

    if (!value) {
        return context
    }
    if (CSSStyleSheet.isImpl(value)) {
        value._rules?.forEach(rule => {
            if (CSSNamespaceRule.isImpl(rule)) {
                namespaces.add(rule.prefix)
            }
        })
        return { ...context, value }
    }
    // Rule name(s)
    if (typeof value === 'string') {
        value = [value]
    }
    if (Array.isArray(value)) {
        return value.reduce(
            (context, name) => {
                const contextDefinition = context.definition.value ?? context.definition
                const definition = contextDefinition.rules.find(rule => rule.name === name)
                return { ...context, context, definition }
            },
            context)
    }
    // Assert: value is an Element
    const definition = root.rules.find(definition => definition.qualified)
    return { ...context, context, definition }
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
function consumeBlock(tokens, { start, value: associatedToken }) {
    const closingToken = associatedTokens[associatedToken]
    const value = consumeComponentValueList(tokens, [closingToken])
    if (!tokens.consume(isDelimiter(closingToken))) {
        error({ message: 'Unclosed block' })
    }
    return { associatedToken, end: tokens.current.end, start, types: ['<block>'], value }
}

/**
 * @param {Stream} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-component-value}
 */
function consumeComponentValue(tokens) {
    const current = tokens.consume()
    if (associatedTokens[current.value]) {
        return consumeBlock(tokens, current)
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
    const values = []
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
    return list(values, '')
}

/**
 * @param {Stream} tokens
 * @param {boolean} forCustomProperty
 * @param {boolean} [nested]
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-the-remnants-of-a-bad-declaration}
 *
 * It deviates from the specification by stopping consuming after a (positioned)
 * {} block in a declaration not for a custom property.
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
    const values = []
    let token
    while (token = tokens.next()) {
        if (isWhitespace(token)) {
            values.push(tokens.consume())
            continue
        }
        // End token
        if (isDelimiter('!', token) || isSemicolon(token) || (nested && isCloseCurlyBrace(token))) {
            break
        }
        // Invalid token
        if (token.types[0].startsWith('<bad-') || isDelimiter(closingTokens, token)) {
            return error(INVALID_DECLARATION_VALUE_ERROR)
        }
        const value = consumeComponentValue(tokens)
        if (forCustomProperty) {
            values.push(value)
            continue
        }
        // Positioned {} block
        if (values.some(value => !isWhitespace(value)) && isBlock(value, '{')) {
            return
        }
        const prev = values.findLast(value => !isWhitespace(value))
        if (prev && isBlock(prev, '{')) {
            return
        }
        values.push(value)
    }
    if (isWhitespace(values.at(-1))) {
        values.pop()
    }
    return list(values, '')
}

/**
 * @param {Stream} tokens
 * @param {object} context
 * @param {boolean} [nested]
 * @returns {SyntaxError|object|null|undefined}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-declaration}
 *
 * It deviates from the specification by consuming the remnants of an invalid
 * declaration and returning an error, when it cannot be parsed as a rule, to
 * resume parsing the next content. Otherwise, it just return nothing, to try
 * parsing a rule after backtracking.
 *
 * It deviates from the specification by consuming the declaration value like a
 * <declaration-value> but accepting positioned {} blocks for a custom property.
 */
function consumeDeclaration(tokens, context, nested) {

    let name = tokens.consume(token => token.types[0] === '<ident-token>')
    if (!name) {
        return null
    }
    const definition = getDeclarationDefinition(context, name.value)
    if (!definition) {
        return null
    }
    name = definition.name

    const node = { context, definition, type: nodeType }

    tokens.consume(isWhitespace)
    if (!tokens.consume(isColon)) {
        return null
    }
    tokens.consume(isWhitespace)

    const forCustomProperty = name.startsWith('--')

    let value = consumeDeclarationValue(tokens, forCustomProperty, nested)
    if (isError(value)) {
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
            return error(INVALID_DECLARATION_VALUE_ERROR)
        }
        important = true
        tokens.consume(isWhitespace)
    }
    if (important && !context.definition.cascading) {
        return error(INVALID_DECLARATION_VALUE_ERROR)
    }

    value = parseCSSDeclarationValue(value, { ...definition, type: 'non-terminal' }, node)
    if (isFailure(value)) {
        consumeBadDeclaration(tokens, true, nested)
        return error(INVALID_DECLARATION_VALUE_ERROR)
    }
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
            for (const value of tail) {
                if (isWhitespace(value)) {
                    continue
                }
                if (isColon(value)) {
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
        const node = { context, definition, type: nodeType }
        if (definition && !isFailure(prelude = parseCSSGrammar(prelude, definition.prelude, node))) {
            return createCSSRule(node, undefined, prelude, tokens)
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
        const node = { context, definition, type: nodeType }
        if (!definition || (definition.prelude && isFailure(prelude = parseCSSGrammar(prelude, definition.prelude, node)))) {
            tokens.reconsume()
            consumeComponentValue(tokens)
            return error(INVALID_RULE_SYNTAX_ERROR)
        }
        const rule = createCSSRule(node, name, prelude, tokens)
        if (isInvalidFontPaletteValuesRule(rule) || isInvalidPropertyRule(rule)) {
            return error(INVALID_RULE_SYNTAX_ERROR)
        }
        return rule
    }
    // Statement at-rule
    const definition = getRuleDefinition(context, name, prelude, 'statement')
    const node = { context, definition, type: nodeType }
    tokens.consume(isSemicolon)
    if (definition?.prelude && !definition.value && !isFailure(prelude = parseCSSGrammar(prelude, definition.prelude, node))) {
        return createCSSRule(node, name, prelude)
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
function consumeBlockContents(tokens, context, ignoreCloseCurlyBlock) {
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
            if (!isError(rule)) {
                if (0 < declarations.length) {
                    rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0)))
                }
                rules.push(rule)
            }
            continue
        }
        const { index } = tokens
        const declaration = consumeDeclaration(tokens, context, true)
        if (isError(declaration)) {
            continue
        }
        if (declaration) {
            declarations.push(declaration)
            continue
        }
        tokens.moveTo(index)
        const rule = consumeQualifiedRule(tokens, context, true)
        if (!isError(rule)) {
            if (0 < declarations.length) {
                rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0)))
            }
            rules.push(rule)
        }
    }
    if (0 < declarations.length) {
        rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0)))
    }
    return list(rules, ' ', ['<block-contents>'])
}

/**
 * @param {Stream} tokens
 * @param {object} context
 * @returns {CSSRuleImpl[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-stylesheets-contents}
 *
 * It deviates from the specification by validating and/or discarding rules here
 * instead of in consumeAtRule().
 */
function consumeStyleSheet(tokens, context) {
    const rules = []
    while (!tokens.atEnd()) {
        if (tokens.consume(token => isDelimiter([' ', '<!--', '-->'], token))) {
            continue
        }
        if (tokens.next().types[0] === '<at-keyword-token>') {
            const rule = consumeAtRule(tokens, context)
            if (
                isError(rule)
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
        if (!isError(rule)) {
            rules.push(rule)
        }
    }
    return list(rules, ' ', ['<block-contents>'])
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
    const value = [consumeComponentValueList(input, [','])]
    while (input.consume(isComma)) {
        value.push(consumeComponentValueList(input, [',']))
    }
    return list(value, ',')
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
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|Element|object|string|string[]} context
 * @returns {SyntaxError|object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-declaration}
 *
 * It deviates from the specification by returning null when the declaration is
 * invalid regardless of its value.
 */
function parseDeclaration(input, context) {
    input = normalizeIntoTokens(input)
    input.consume(isWhitespace)
    context = createContext(context)
    return consumeDeclaration(input, context) ?? null
}

/**
 * @param {Stream|string|object[]} input
 * @param {CSSRuleImpl|CSSStyleSheetImpl|object|string|string[]} context
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
    if (isError(rule)) {
        return rule
    }
    input.consume(isWhitespace)
    if (input.atEnd()) {
        return rule
    }
    return error(EXTRA_RULE_ERROR)
}

/**
 * @param {Stream|string|object[]} input
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|Element|object|string|string[]} context
 * @returns {object[]}
 */
function parseDeclarationBlock(input, context) {
    input = normalizeIntoTokens(input)
    context = createContext(context)
    const declarations = consumeBlockContents(input, context, true).filter(Array.isArray).flat()
    return getDeclarationsInSpecifiedOrder(declarations)
}

/**
 * @param {Stream|string|object[]} input
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|Element|object|string|string[]} context
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-blocks-contents}
 */
function parseBlockContents(input, context) {
    return consumeBlockContents(normalizeIntoTokens(input), createContext(context))
}

/**
 * @param {ReadableStream|Stream|string|object[]} input
 * @param {CSSStyleSheetImpl} context
 * @returns {CSSRuleImpl[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 */
function parseStyleSheet(input, context) {
    return consumeStyleSheet(normalizeIntoTokens(input), createContext(context))
}

/**
 * @param {object} value
 * @param {object} context
 * @returns {SyntaxError|object|null}
 */
function parseCSSArbitrarySubstitution(value, context) {
    if (value.types[0] !== '<function>') {
        return null
    }
    const { definition: { cascading, elemental } } = getRule(context) ?? { definition: {} }
    for (const { cascade, definition, element, name } of substitutions.arbitrary) {
        if (!elemental && (element || (cascade && !cascading))) {
            continue
        }
        if (isFailure(parseCSSGrammar(value.name, name, context))) {
            continue
        }
        return parseCSSGrammar([value], definition, context) ?? error({ message: 'Invalid substitution' })
    }
    return null
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {SyntaxError|object[]|null}
 */
function parseCSSArbitrarySubstitutionContainingValue(input, context) {
    const values = []
    let containsSubstitution = false
    for (let value of input) {
        const { types: [type], value: nested } = value
        if (type === '<function>' || type === '<block>') {
            let match = parseCSSArbitrarySubstitution(value, context)
            if (isError(match)) {
                return match
            }
            if (match) {
                values.push(match)
                containsSubstitution = true
                continue
            }
            match = parseCSSArbitrarySubstitutionContainingValue(new Stream(nested), context)
            if (isError(match)) {
                return match
            }
            if (match) {
                containsSubstitution = true
            }
        }
        values.push(value)
    }
    if (containsSubstitution) {
        context.globals.set('pending', true)
        return list(values, '')
    }
    input.reset()
    return null
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {SyntaxError|object|null}
 */
function parseCSSValueSubstitution(input, context) {
    const { definition: { elemental } } = getRule(context)
    const next = input.next()
    if (next?.types[0] !== '<function>') {
        return null
    }
    for (const { definition, element, name, pending } of substitutions.whole) {
        if (element && !elemental) {
            continue
        }
        if (isFailure(parseCSSGrammar(next.name, name, context))) {
            continue
        }
        const match = parseCSSGrammar(input, definition, context, 'greedy')
        if (isFailure(match)) {
            return error({ message: 'Invalid substitution' })
        }
        if (pending) {
            context.globals.set('pending', true)
        }
        return match
    }
    return null
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {object||null}
 */
function parseCSSWideKeyword(input, context) {
    const { definition: { cascading, elemental } } = getRule(context)
    if (cascading || elemental) {
        return parseCSSGrammar(input, substitutions.keywords.join(' | '), context)
    }
    return null
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} definition
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|Element|object|string|string[]} [context]
 * @returns {SyntaxError|object|object[]|null}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-value}
 */
function parseCSSDeclarationValue(input, definition, context) {
    if (typeof input === 'string') {
        input = new Stream(parseComponentValueList(input), input)
    } else if (Array.isArray(input)) {
        input = new Stream(input)
    }
    context = createContext(context)
    if (typeof definition === 'string') {
        definition = getDeclarationDefinition(context, definition)
    }
    return parseCSSWideKeyword(input, context)
        ?? parseCSSArbitrarySubstitutionContainingValue(input, context)
        ?? parseCSSGrammar(input, definition, context)
        ?? parseCSSValueSubstitution(input, context)
}

/**
 * @param {string} name
 * @param {string} value
 * @param {boolean} important
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|Element|object|string|string[]} context
 * @returns {object|null}
 */
function parseCSSDeclaration(name, value, important, context) {

    context = createContext(context)

    if (important && !context.definition.cascading) {
        return null
    }

    const definition = getDeclarationDefinition(context, name)
    if (!definition) {
        return null
    }
    name = definition.name

    const forCustomProperty = name.startsWith('--')
    const source = value
    const tokens = normalizeIntoTokens(value)
    const node = { context, definition, type: nodeType }

    tokens.consume(isWhitespace)

    value = consumeDeclarationValue(tokens, forCustomProperty)
    if (isFailure(value)) {
        return value
    }
    if (!value || !tokens.atEnd()) {
        return null
    }

    value = new Stream(value, source)
    value = parseCSSDeclarationValue(value, { ...definition, type: 'non-terminal' }, node)
    if (isFailure(value)) {
        return value
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

/**
 * @param {Stream|string|object[]} input
 * @param {string} definition
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|CSSStyleSheetImpl|Element|object|string|string[]} [context]
 * @param {string} [strategy]
 * @returns {SyntaxError|object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 */
function parseCSSGrammar(input, definition, context, strategy = 'backtrack') {

    if (typeof input === 'string') {
        input = new Stream(parseComponentValueList(input), input)
    } else if (Array.isArray(input)) {
        input = new Stream(input)
    }
    context = createContext(context)

    const root = createGrammar(definition, input, { ...context, separator: ' ' })

    context.trees.push(root)

    let match = parseGrammar(root)
    while (!input.atEnd() && !isFailure(match)) {
        if (strategy === 'greedy') {
            match = error({ message: 'Unexpected remaining component values' })
            break
        }
        if (strategy === 'lazy') {
            break
        }
        match = parseGrammar(root)
    }

    context.trees.pop()

    if (isError(match) && context.definition.type === 'forgiving') {
        return null
    }
    return match
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} grammar
 * @param {CSSRuleImpl|CSSFontFeatureValuesMap|CSSStyleSheetImpl|Element|object|string|string[]} [context]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseCSSGrammarList(input, grammar, context) {
    input = parseCommaSeparatedComponentValueList(input)
    if (input.length === 1) {
        const value = input[0]
        if (value.length === 1 && isWhitespace(value[0])) {
            input.pop()
            return input
        }
    }
    context = createContext(context)
    return list(input.map(value => parseCSSGrammar(value, grammar, context)), ',')
}

export {
    consumeComponentValueList,
    createContext,
    getDeclarationDefinition,
    getDeclarationName,
    insertCSSRule,
    parseBlockContents,
    parseCommaSeparatedComponentValueList,
    parseComponentValue,
    parseComponentValueList,
    parseCSSArbitrarySubstitution,
    parseCSSDeclaration,
    parseCSSDeclarationValue,
    parseCSSGrammar,
    parseCSSGrammarList,
    parseCSSStyleSheet,
    parseDeclaration,
    parseDeclarationBlock,
    parseRule,
    parseStyleSheet,
    removeCSSRule,
}
