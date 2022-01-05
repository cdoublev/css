
const createStream = require('./stream.js')
const tokenize = require('./tokenize.js')

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
    const { name } = tokens.consume()
    const prelude = []
    const atRule = { name, prelude }
    for (const token of tokens) {
        if (token === ';') {
            return { name, prelude }
        }
        if (token === '{') {
            return { name, prelude, value: consumeSimpleBlock(token) }
        }
        if (token.type?.has('simple-block') && token.associatedToken === '{') {
            return { name, prelude, value: token }
        }
        tokens.reconsume()
        prelude.push(consumeComponentValue(tokens))
    }
    console.error('Parse error: invalid at rule')
    return atRule
}

/**
 * @param {object} tokens
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-declaration}
 */
function consumeDeclaration(tokens) {
    const { value: name } = tokens.consume()
    const value = []
    const declaration = { name, value }
    tokens.consumeRunOf(' ')
    tokens.consume(':', false)
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
        if (token === '@') {
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
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-qualified-rule}
 */
function consumeQualifiedRule(tokens) {
    const prelude = []
    for (const token of tokens) {
        if (token === '{') {
            return { prelude, value: consumeSimpleBlock(tokens) }
        }
        if (token.type?.has('simple-block') && token.associatedToken === '{') {
            return { prelude, value: token }
        }
        tokens.reconsume()
        prelude.push(consumeComponentValue(tokens))
    }
    console.error('Parse error: invalid qualified rule')
}

/**
 * @param {object[]} tokens
 * @param {boolean} topLevel
 * @return {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#consume-a-list-of-rules}
 */
function consumeRulesList(tokens, topLevel = false) {
    const rules = new CSSRuleList()
    for (const token of tokens) {
        if (token === ' ') {
            continue
        }
        if (token === '@') {
            tokens.reconsume()
            rules.push(consumeAtRule(tokens))
            continue
        }
        if (topLevel) {
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
    }
    return createStream(input)
}

/**
 * @param {string} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-component-value}
 */
function parseComponentValue(input) {
    // TODO
}

/**
 * @param {string} input
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-comma-separated-list-of-component-values}
 */
function parseCommaSeparatedComponentValuesList(input) {
    // TODO
}

/**
 * @param {string} input
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-component-values}
 */
function parseComponentValuesList(input) {
    input = normalizeIntoTokens(input)
    const list = []
    while (!input.atEnd()) {
        list.push(consumeComponentValue(input))
    }
    // https://github.com/w3c/csswg-drafts/issues/6484#issuecomment-1001482576
    while (list.at(-1) === ' ') {
        list.pop()
    }
    return createStream(list)
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
    // TODO
}

/**
 * @param {string} input
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-declaration}
 */
function parseDeclaration(input) {
    input = normalizeIntoTokens(input)
    input.consumeRunOf(' ')
    const next = input.next()
    if (next.type.has('ident')) {
        const declaration = consumeDeclaration(input)
        if (declaration) {
            return declaration
        }
    }
    console.log(`Syntax error: could not parse "${next}" as a declaration`)
    return null
}

/**
 * @param {string} input
 * @returns {CSSRule}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-rule}
 */
function parseRule(input) {
    // TODO
}

/**
 * @param {string} input
 * @returns {CSSRuleList}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-list-of-rules}
 */
function parseRuleList(input) {
    // TODO
}

/**
 * @param {string|Blob} input
 * @return {CSSStyleSheet}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-stylesheet}
 */
function parseStyleSheet(input) {
    // TODO
}

/**
 * @param {string}
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#parse-a-css-stylesheet}
 */
function parseCSSStyleSheet(input) {
    // TODO
}

module.exports = {
    parseCSSStyleSheet,
    parseCommaSeparatedComponentValuesList,
    parseComponentValue,
    parseComponentValuesList,
    parseDeclaration,
    parseDeclarationList,
    parseRule,
    parseRuleList,
    parseStyleSheet,
    parseStyleBlock,
}