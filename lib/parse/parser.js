
import * as compatibility from '../compatibility.js'
import * as cssom from '../cssom/index.js'
import * as grammar from './grammar.js'
import * as substitutions from '../values/substitutions.js'
import {
    CSSFontFeatureValuesMap,
    CSSGroupingRule,
    CSSImportRule,
    CSSLayerStatementRule,
    CSSNamespaceRule,
    CSSNestedDeclarations,
    CSSRule,
    CSSStyleSheet,
} from '../cssom/index.js'
import {
    EXTRA_RULE_ERROR,
    INSERT_INVALID_IMPORT_ERROR,
    INVALID_DECLARATION_ERROR,
    INVALID_DECLARATION_VALUE_ERROR,
    INVALID_NAMESPACE_STATE_ERROR,
    INVALID_RULE_ERROR,
    INVALID_RULE_INDEX_ERROR,
    INVALID_RULE_POSITION_ERROR,
    MISSING_RULE_ERROR,
    create as error,
} from '../error.js'
import { associatedTokens, closingTokens, openingTokens } from '../values/blocks.js'
import { type as contextType, getRoot, getRule, isContext, isInputAtEnd } from '../utils/context.js'
import { delimiter, list } from '../values/value.js'
import {
    isBlock,
    isCloseCurlyBrace,
    isCloseParen,
    isColon,
    isComma,
    isDelimiter,
    isError,
    isFailure,
    isOpenCurlyBrace,
    isSemicolon,
    isWhitespace,
} from '../utils/value.js'
import { isNode, type as nodeType } from '../utils/node.js'
import Stream from './stream.js'
import expandDeclaration from './shorthand.js'
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
                ? expandDeclaration(declaration)
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
 * @param {CSSRuleListImpl[]} list
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
 * @param {CSSRuleListImpl[]} list
 * @param {CSSRuleImpl} rule
 * @returns {boolean}
 */
function isInvalidNamespaceRule(list, rule) {
    return CSSNamespaceRule.isImpl(rule)
        && !list.every(rule => isImportOrNamespaceRule(rule) || CSSLayerStatementRule.isImpl(rule))
}

/**
 * @param {CSSRuleListImpl[]} list
 * @param {string} input
 * @param {number} index
 * @param {object} context
 * @param {boolean} [allowImport]
 * @returns {number}
 * @see {@link https://drafts.csswg.org/cssom-1/#insert-a-css-rule}
 */
function insertRule(list, input, index, context, allowImport) {
    if (list.length < index) {
        throw error(INVALID_RULE_INDEX_ERROR)
    }
    let rule = parseRule(input, context)
    if (isError(rule)) {
        if (CSSGroupingRule.isImpl(context)) {
            const declarations = parseDeclarationList(input, context)
            if (0 < declarations.length) {
                rule = CSSNestedDeclarations.createImpl(context._globalObject, undefined, {
                    declarations,
                    parentRule: context,
                    parentStyleSheet: context.parentStyleSheet,
                })
                list.splice(index, 0, rule)
                return index
            }
        }
        throw error(rule)
    }
    if (!allowImport && CSSImportRule.isImpl(rule)) {
        rule._abort()
        throw error(INSERT_INVALID_IMPORT_ERROR)
    }
    if (isInvalidIndexForRule(list, rule, index)) {
        if (CSSImportRule.isImpl(rule)) {
            rule._abort()
        }
        throw error(INVALID_RULE_POSITION_ERROR)
    }
    if (isInvalidNamespaceRule(list, rule)) {
        throw error(INVALID_NAMESPACE_STATE_ERROR)
    }
    list.splice(index, 0, rule)
    return index
}

/**
 * @param {CSSRuleListImpl[]} list
 * @param {number} index
 * @see {@link https://drafts.csswg.org/cssom-1/#remove-a-css-rule}
 */
function removeRule(list, index) {
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
 * @returns {CSSFontFeatureValuesMapImpl|CSSRuleImpl}
 */
function createRule(node, name, prelude) {
    const parentRule = getRule(node).value
    const parentStyleSheet = getRoot(node).value
    const properties = {
        name,
        node,
        parentRule: parentRule === parentStyleSheet ? null : parentRule,
        parentStyleSheet,
        prelude,
    }
    return cssom[node.definition.cssom].createImpl(globalThis, undefined, properties)
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-function}
 */
function consumeFunction(input) {
    const { current: { start, value: name } } = input
    const value = consumeComponentValueList(input, [')'])
    if (!input.consume(isCloseParen)) {
        error({ message: 'Unclosed function' })
    }
    return { end: input.current.end, name, start, types: ['<function>'], value }
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-simple-block}
 */
function consumeBlock(input) {
    const { current: { start, value: associatedToken } } = input
    const closingToken = associatedTokens[associatedToken]
    const value = consumeComponentValueList(input, [closingToken])
    if (!input.consume(isDelimiter(closingToken))) {
        error({ message: 'Unclosed block' })
    }
    return { associatedToken, end: input.current.end, start, types: ['<block>'], value }
}

/**
 * @param {Stream} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-component-value}
 */
function consumeComponentValue(input) {
    const token = input.consume()
    if (associatedTokens[token.value]) {
        return consumeBlock(input)
    }
    if (token.types[0] === '<function-token>') {
        return consumeFunction(input)
    }
    return token
}

/**
 * @param {Stream} input
 * @param {string} [stop]
 * @param {object} [context]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-list-of-component-values}
 */
function consumeComponentValueList(input, stop, context) {
    const values = []
    input.consume(isWhitespace)
    while (context ? !isInputAtEnd(context) : !input.atEnd()) {
        if (stop && isDelimiter(stop, input.next())) {
            break
        }
        values.push(consumeComponentValue(input))
    }
    if (isWhitespace(values.at(-1))) {
        values.pop()
    }
    return list(values, '')
}

/**
 * @param {Stream} input
 * @param {boolean} forCustomProperty
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-the-remnants-of-a-bad-declaration}
 */
function consumeInvalidDeclaration(input, forCustomProperty) {
    while (!input.atEnd()) {
        if (isCloseCurlyBrace(input.next())) {
            return
        }
        const component = consumeComponentValue(input)
        if (isSemicolon(component)) {
            return
        }
        if (!forCustomProperty && isBlock(component, '{')) {
            return
        }
    }
}

/**
 * @param {Stream} input
 * @param {boolean} nested
 * @param {boolean} [forAtRule]
 */
function consumeInvalidRule(input, nested, forAtRule) {
    while (!input.atEnd()) {
        if (nested && isCloseCurlyBrace(input.next())) {
            return
        }
        const component = consumeComponentValue(input)
        if ((nested || forAtRule) && isSemicolon(component)) {
            return
        }
        if (isBlock(component, '{')) {
            return
        }
    }
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|null}
 */
function matchToken(node) {
    if (isInputAtEnd(node)) {
        return null
    }
    const token = node.input.consume()
    switch (token.types[0]) {
        case node.definition.name:
            return token
        case '<bad-string-component>':
        case '<bad-url-token>':
            return error({ message: 'Invalid token' })
        case '<delimiter-token>':
            if (node.definition.value === token.value) {
                return token
            }
            if (closingTokens.includes(token.value)) {
                return error({ message: 'Invalid token' })
            }
            // falls through
        default:
            return null
    }
}

/**
 * @param {object} node
 * @returns {object|null}
 */
function matchFunction(node) {
    if (isInputAtEnd(node)) {
        return null
    }
    const { definition, input } = node
    const name = parseGrammar(input, { name: '<function-token>', range: definition.name, type: 'token' }, node, 'lazy')
    if (isFailure(name)) {
        return name
    }
    let value
    if (definition.value) {
        value = parseGrammar(input, definition.value, node)
        if (isFailure(value)) {
            return value
        }
    } else {
        value = list()
    }
    input.consume(isWhitespace)
    if (!input.consume(isCloseParen)) {
        error({ message: 'Unclosed function' })
    }
    return {
        end: input.current.end,
        name: name.value,
        start: name.start,
        types: ['<function>'],
        value,
    }
}

/**
 * @param {object} node
 * @returns {object|null}
 */
function matchBlock(node) {
    if (isInputAtEnd(node)) {
        return null
    }
    const { definition, input } = node
    if (!input.consume(isDelimiter(definition.associatedToken))) {
        return null
    }
    const associatedToken = input.current
    const value = parseGrammar(input, definition.value, node)
    if (isFailure(value)) {
        return value
    }
    input.consume(isWhitespace)
    if (!input.consume(isDelimiter(associatedTokens[associatedToken.value]))) {
        error({ message: 'Unclosed block' })
    }
    return {
        associatedToken: associatedToken.value,
        end: input.current.end,
        start: associatedToken.start,
        types: ['<block>'],
        value,
    }
}

/**
 * @param {object} node
 * @returns {SyntaxError|object|null}
 */
function matchDeclaration(node) {

    const { context, definition, input } = node

    // Assert: the next token is valid according to node.definition.name
    input.consume()

    input.consume(isWhitespace)
    if (!input.consume(isColon)) {
        return null
    }
    input.consume(isWhitespace)

    // Validate the value
    const value = parseDeclarationValue(input, { ...definition, type: 'non-terminal' }, node)
    if (isFailure(value)) {
        if (isError(value) && value.message === INVALID_DECLARATION_ERROR.message) {
            return null
        }
        return error(INVALID_DECLARATION_VALUE_ERROR)
    }
    input.consume(isWhitespace)

    // Validate the priority (if any)
    let important = false
    if (input.consume(isDelimiter('!'))) {
        input.consume(isWhitespace)
        if (!input.consume(({ types, value }) => types[0] === '<ident-token>' && value === 'important')) {
            return error(INVALID_DECLARATION_VALUE_ERROR)
        }
        if (!isInputAtEnd(node)) {
            return error(INVALID_DECLARATION_VALUE_ERROR)
        }
        important = true
    }
    if (important && !getRule({ context }).definition.cascading) {
        return error(INVALID_DECLARATION_VALUE_ERROR)
    }

    const { name } = definition

    if (name.startsWith('--')) {
        const source = 0 < value.length ? input.source.slice(value[0].start, value.at(-1).end) : ''
        return { important, name, source, types: [], value }
    }
    if (context.globals.has('pending')) {
        context.globals.delete('pending')
        return { important, name, pending: name, types: [], value }
    }
    return { important, name, types: [], value }
}

/**
 * @param {object} node
 * @returns {DOMException|SyntaxError|CSSRuleImpl}
 */
function matchQualifiedRule(node) {
    const { definition, input } = node
    const prelude = parseGrammar(input, definition.prelude, node)
    if (isFailure(prelude)) {
        return error(INVALID_RULE_ERROR)
    }
    input.consume(isWhitespace)
    if (input.peek(isOpenCurlyBrace)) {
        return createRule(node, undefined, prelude)
    }
    return error(INVALID_RULE_ERROR)
}

/**
 * @param {object} node
 * @returns {CSSFontFeatureValuesMapImpl|CSSRuleImpl|DOMException|SyntaxError|null}
 */
function matchAtRule(node) {

    const { definition, input } = node
    // Assert: the next token matches the definition name
    const name = input.consume().value.toLowerCase()

    input.consume(isWhitespace)

    if (definition.prelude) {

        const prelude = parseGrammar(input, definition.prelude, node)
        if (isFailure(prelude)) {
            return null
        }

        input.consume(isWhitespace)

        if (definition.value) {
            if (input.peek(isOpenCurlyBrace)) {
                return createRule(node, name, prelude)
            }
            return null
        }

        if (input.consume(isSemicolon) || isInputAtEnd(node)) {
            return createRule(node, name, prelude)
        }
        return null
    }

    // Assert: all at-rules with no prelude are defined with a block value
    if (input.peek(isOpenCurlyBrace)) {
        return createRule(node, name)
    }
    return null
}

/**
 * @param {object} node
 * @returns {CSSFontFeatureValuesMapImpl|CSSRuleImpl|DOMException|SyntaxError}
 */
function matchRule(node) {
    return node.definition.qualified ? matchQualifiedRule(node) : matchAtRule(node)
}

/**
 * @param {object} node
 * @returns {CSSFontFeatureValuesMapImpl[]|CSSRuleImpl[]}
 */
function matchBlockContents(node) {

    const { context, input } = node
    const nested = context.definition.type === 'block'

    const rules = []
    const declarations = []

    while (!isInputAtEnd(node)) {

        if (input.consume(isWhitespace) || input.consume(isSemicolon)) {
            continue
        }
        if (!nested && input.consume(isCloseCurlyBrace)) {
            continue
        }

        const token = input.next()

        if (token.types[0] === '<at-keyword-token>') {

            const definition = getRuleDefinition(node, token.value)
            const rule = definition ? parseGrammar(input, definition, node, 'lazy') : null

            if (isFailure(rule)) {
                consumeInvalidRule(input, nested, true)
                continue
            }
            if (0 < declarations.length) {
                rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0)))
            }
            rules.push(rule)
            continue
        }

        if (token.types[0] === '<ident-token>') {

            const definition = getDeclarationDefinition(node, token.value)
            const declaration = definition ? parseGrammar(input, definition, node, 'lazy') : null

            if (isError(declaration)) {
                consumeInvalidDeclaration(input, definition.name.startsWith('--'))
                continue
            }
            if (declaration) {
                declarations.push(declaration)
                continue
            }
        }

        const definition = getRuleDefinition(node)
        const rule = definition ? parseGrammar(input, definition, node, 'lazy') : null
        if (isFailure(rule)) {
            consumeInvalidRule(input, nested)
            continue
        }
        if (0 < declarations.length) {
            rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0)))
        }
        rules.push(rule)
    }
    if (0 < declarations.length) {
        rules.push(getDeclarationsInSpecifiedOrder(declarations.splice(0)))
    }
    return list(rules)
}

/**
 * @param {object} node
 * @returns {CSSRuleImpl[]}
 */
function matchStyleSheet(node) {

    const { context, input } = node

    const rules = []

    while (!isInputAtEnd(node)) {

        if (input.consume(token => isDelimiter([' ', '<!--', '-->'], token))) {
            continue
        }

        const [token, middle, tail] = input.next(3)
        const { types: [type], value } = token

        // --custom: ... { ... }
        if (
            type === '<ident-token>'
            && value.startsWith('--')
            && ((middle && isColon(middle)) || (tail && isWhitespace(middle) && isColon(tail)))
        ) {
            consumeInvalidRule(input)
            continue
        }

        const definition = getRuleDefinition(node, type === '<at-keyword-token>' ? value : null)
        const rule = definition ? parseGrammar(input, definition, node, 'lazy') : null

        if (isFailure(rule)) {
            consumeInvalidRule(input, false, type === '<at-keyword-token>')
            continue
        }
        if (isInvalidIndexForRule(rules, rule, rules.length) || isInvalidNamespaceRule(rules, rule)) {
            if (CSSImportRule.isImpl(rule)) {
                rule._abort()
            }
            continue
        }

        if (CSSNamespaceRule.isImpl(rule)) {
            context.globals.get('namespaces').add(rule.prefix)
        }
        rules.push(rule)
    }
    return list(rules)
}

/**
 * @param {CSSRuleImpl|Element|object|string} context
 * @param {string} name
 * @returns {string}
 */
function getDeclarationName(context, name) {
    context = createContext(context)
    const { definition: { name: ruleName, value } } = getRule({ context })
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
    const { definition: { name: ruleName, value: { descriptors, properties } } } = getRule({ context })
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
 * @returns {object|null}
 */
function getRuleDefinition({ definition }, name) {
    const { rules } = definition.type === 'rule' ? definition.value : definition
    if (!rules) {
        return null
    }
    if (name) {
        name = `@${name.toLowerCase()}`
        const alias = compatibility.rules.aliases.get(name)
        if (alias) {
            name = alias
        }
        const definitions = rules.filter(rule => rule.name === name || rule.names?.includes(name))
        if (1 < definitions.length) {
            return { type: '|', value: definitions }
        }
        return definitions[0]
    }
    return rules.find(rule => rule.qualified)
}

/**
 * @param {CSSFontFeatureValuesMapImpl|CSSRuleImpl|CSSStyleSheetImpl|Element|object|string|string[]} [value]
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
        const definition = context.definition.value.rules.find(definition => cssom[definition.cssom].isImpl(value))
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
                const definition = context.definition.value.rules.find(rule => rule.name === name)
                return { ...context, context, definition }
            },
            context)
    }
    // Assert: value is an Element
    const definition = root.value.rules.find(definition => definition.qualified)
    return { ...context, context, definition }
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
 * @param {object} input
 * @param {object} context
 * @returns {SyntaxError|object|null}
 */
function parseArbitrarySubstitution(input, context) {
    context = createContext(context)
    const { definition: { cascading, elemental } } = getRule(context) ?? { definition: {} }
    for (const { cascade, definition, element, name } of substitutions.arbitrary) {
        if (!elemental && (element || (cascade && !cascading))) {
            continue
        }
        const node = { context, definition, input, type: nodeType }
        if (isFailure(parseGrammar([input.next()], { name: '<function-token>', range: name, type: 'token' }, node))) {
            continue
        }
        return parseGrammar(input, definition, node, 'lazy')
            ?? error({ message: 'Invalid substitution' })
    }
    return null
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {SyntaxError|object[]|null}
 */
function parseArbitrarySubstitutionContainingValue(input, context) {

    const node = { context, definition: { type: 'arbitrary' }, input, type: nodeType }
    const { index } = input
    const { definition: { name } } = context
    const allowPositionedBlock = name.startsWith('--') || name === 'initial-value' || name === 'result'

    let hasArbitrarySubstitution = false
    let hasBadToken = false

    function parseLevel(closingToken) {

        const tokens = []

        input.consume(isWhitespace)

        while (closingToken ? (!input.atEnd() && !input.peek(isDelimiter(closingToken))) : !isInputAtEnd(node)) {

            const token = input.next()
            const type = token.types[0]

            // Bad token preserved to parse a value against a forgiving grammar
            if (
                (!closingToken && isDelimiter(['!', ';'], token))
                || isDelimiter(closingTokens, token)
                || type === '<bad-string-token>'
                || type === '<bad-url-token>'
            ) {
                hasBadToken = true
                tokens.push(input.consume())
                continue
            }

            if (isDelimiter(openingTokens, token)) {

                // Top-level positioned {} block
                if (!closingToken && token.value === '{' && !allowPositionedBlock && 0 < tokens.length) {
                    return error(INVALID_DECLARATION_ERROR)
                }

                input.consume()

                const associatedToken = associatedTokens[token.value]
                const value = parseLevel(associatedToken)

                if (isFailure(value)) {
                    return value
                }

                tokens.push(token, ...value, input.consume(isDelimiter(associatedToken)) ?? delimiter(associatedToken))

                // Top-level positioned {} block
                if (!closingToken && token.value === '{' && !allowPositionedBlock && !isInputAtEnd(node)) {
                    return error(INVALID_DECLARATION_ERROR)
                }
                continue
            }

            if (type === '<function-token>') {

                const substitution = parseArbitrarySubstitution(input, context)

                if (isError(substitution)) {
                    return substitution
                }
                if (substitution) {
                    hasArbitrarySubstitution = true
                    tokens.push(substitution)
                    if (isWhitespace(input.current)) {
                        tokens.push(input.current)
                    }
                    continue
                }

                input.consume()
                const value = parseLevel(')')
                if (isFailure(value)) {
                    return value
                }
                tokens.push(token, ...value, input.consume(isCloseParen) ?? delimiter(')'))
                continue
            }

            tokens.push(input.consume())
        }
        if (isWhitespace(tokens.at(-1))) {
            tokens.pop()
        }
        return list(tokens, '')
    }

    const value = parseLevel()
    if (isError(value)) {
        return value
    }
    if (hasArbitrarySubstitution && !hasBadToken) {
        context.globals.set('pending', true)
        return value
    }
    input.backtrack(index)
    return null
}

/**
 * @param {Stream} input
 * @param {object} context
 * @returns {SyntaxError|object|null}
 */
function parseValueSubstitution(input, context) {
    const { definition: { elemental } } = getRule(context)
    for (const { definition, element, name, pending } of substitutions.whole) {
        if (element && !elemental) {
            continue
        }
        const node = { context, definition, input, type: nodeType }
        if (isFailure(parseGrammar([input.next()], { name: '<function-token>', range: name, type: 'token' }, node))) {
            continue
        }
        const match = parseGrammar(input, definition, context, 'greedy')
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
 * @returns {object|null}
 */
function parseCSSWideKeyword(input, context) {
    const { definition: { cascading, elemental } } = getRule(context)
    if (cascading || elemental) {
        return parseGrammar(input, substitutions.keywords.join(' | '), context)
    }
    return null
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} definition
 * @param {CSSFontFeatureValuesMapImpl|CSSRuleImpl|Element|object|string|string[]} [context]
 * @returns {SyntaxError|object|object[]|null}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-css-value}
 */
function parseDeclarationValue(input, definition, context) {
    input = normalizeIntoTokens(input)
    context = createContext(context)
    if (typeof definition === 'string') {
        definition = getDeclarationDefinition(context, definition)
        if (!definition) {
            return null
        }
        context = { ...context, context, definition }
        definition = { ...definition, type: 'non-terminal' }
    }
    return parseCSSWideKeyword(input, context)
        ?? parseArbitrarySubstitutionContainingValue(input, context)
        ?? parseGrammar(input, definition, context)
        ?? parseValueSubstitution(input, context)
}

/**
 * @param {string} name
 * @param {string} value
 * @param {boolean} important
 * @param {CSSRuleImpl|Element|object|string|string[]} context
 * @returns {object|null}
 */
function parseDestructuredDeclaration(name, value, important, context) {

    context = createContext(context)

    if (important && !getRule({ context }).definition.cascading) {
        return null
    }

    const definition = getDeclarationDefinition(context, name)
    if (!definition) {
        return null
    }

    const source = value
    const input = normalizeIntoTokens(value)
    const node = { context, definition, input, type: nodeType }

    value = parseDeclarationValue(input, { ...definition, type: 'non-terminal' }, node)

    if (isFailure(value)) {
        return value
    }

    name = definition.name

    if (name.startsWith('--')) {
        return { important, name, source, value }
    }
    if (context.globals.has('pending')) {
        context.globals.delete('pending')
        return { important, name, pending: name, value }
    }
    return { important, name, value }
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
    const token = input.next()
    const definition = token.types[0] === '<at-keyword-token>'
        ? getRuleDefinition(context, token.value)
        : getRuleDefinition(context)
    if (!definition) {
        return error(INVALID_RULE_ERROR)
    }
    const rule = parseGrammar(input, definition, context, 'lazy')
    if (isFailure(rule)) {
        return rule ?? error(INVALID_RULE_ERROR)
    }
    input.consume(isWhitespace)
    if (input.atEnd()) {
        return rule
    }
    return error(EXTRA_RULE_ERROR)
}

/**
 * @param {Stream|string|object[]} input
 * @param {CSSRuleImpl|Element|object|string|string[]} context
 * @returns {object[]}
 */
function parseDeclarationList(input, context) {
    context = createContext(context)
    return parseGrammar(input, context.definition.value, context)
        .filter(Array.isArray)
        .flat()
}

/**
 * @param {Stream|string|object[]} input
 * @param {string} definition
 * @param {CSSFontFeatureValuesMapImpl|CSSRuleImpl|CSSStyleSheetImpl|Element|object|string|string[]} [context]
 * @param {string} [strategy]
 * @returns {SyntaxError|object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-something-according-to-a-css-grammar}
 */
function parseGrammar(input, definition, context, strategy = 'backtrack') {

    input = normalizeIntoTokens(input)
    input.consume(isWhitespace)
    context = createContext(context)

    const root = grammar.create(definition, input, { ...context, separator: ' ' })

    context.trees.push(root)

    let match = grammar.parse(root)
    while (!isFailure(match) && !isInputAtEnd(root)) {
        if (strategy === 'greedy') {
            match = error({ message: 'Unexpected remaining tokens' })
            break
        }
        if (strategy === 'lazy') {
            break
        }
        match = grammar.parse(root)
    }

    context.trees.pop()

    if (isError(match) && context.definition.type === 'forgiving') {
        return null
    }
    return match
}

/**
 * @param {Stream|string|object[]} input
 * @param {object|string} definition
 * @param {CSSFontFeatureValuesMapImpl|CSSRuleImpl|CSSStyleSheetImpl|Element|object|string|string[]} [context]
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#css-parse-a-comma-separated-list-according-to-a-css-grammar}
 */
function parseGrammarList(input, definition, context) {
    input = normalizeIntoTokens(input)
    context = createContext(context)
    if (isInputAtEnd(context)) {
        return list([], ',')
    }
    const match = parseGrammar(input, definition, context)
    const value = [match]
    if (isFailure(match)) {
        consumeComponentValueList(input, ',', context)
    }
    while (input.consume(isComma)) {
        const match = parseGrammar(input, definition, context)
        value.push(match)
        if (isFailure(match)) {
            consumeComponentValueList(input, ',', context)
        }
    }
    return list(value, ',')
}

export {
    consumeComponentValueList,
    createContext,
    getDeclarationDefinition,
    getDeclarationName,
    insertRule,
    matchBlock,
    matchBlockContents,
    matchDeclaration,
    matchFunction,
    matchRule,
    matchStyleSheet,
    matchToken,
    parseArbitrarySubstitution,
    parseDeclarationList,
    parseDeclarationValue,
    parseDestructuredDeclaration,
    parseGrammar,
    parseGrammarList,
    parseRule,
    removeRule,
}
