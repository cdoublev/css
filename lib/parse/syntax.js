
const { hasPendingSubstitution } = require('../utils/value.js')
const parseDefinition = require('./definition.js')

/**
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#computationally-independent}
 */
const computationallyDependent = {
    keywords: [
        'auto',
        'auto-add',
        'bolder', 'lighter',
        'both', 'clear', 'maximum', 'minimum',
        'clip', 'visible',
        'end', 'x-end', 'start', 'x-start',
        'larger', 'smaller',
        'legacy',
        'match-parent',
        'math',
        'normal',
    ],
    units: [
        'em', 'rem',
        'lh', 'rlh',
        'ex', 'rex', 'cap', 'rcap', 'ch', 'rch', 'ic', 'ric',
        'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax',
    ],
}

/**
 * @param {object|object[]} initial
 * @returns {boolean}
 */
function isComputationallyIndependent(initial) {
    if (Array.isArray(initial)) {
        return initial.every(isComputationallyIndependent)
    }
    if (hasPendingSubstitution(initial)) {
        return false
    }
    for (const type of initial.types) {
        if (type === '<keyword>') {
            return !computationallyDependent.keywords.includes(initial.value)
        }
        if (type === '<length>') {
            return !computationallyDependent.units.includes(initial.unit)
        }
    }
    return true
}

/**
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#css-supported-syntax-component-name}
 */
const supportedSyntaxComponentName = [
    '<angle>',
    '<color>',
    '<custom-ident>',
    '<image>',
    '<integer>',
    '<length-percentage>',
    '<length>',
    '<number>',
    '<percentage>',
    '<resolution>',
    '<string>',
    '<time>',
    '<transform-function>',
    '<transform-list>',
    '<url>',
]

/**
 * @param {object} syntax
 * @param {object} parser
 * @returns {boolean}
 */
function isSupportedSyntax({ max, min, name, range, type, value }, parser) {
    if (name === '<keyword>') {
        return parser.parseCSSGrammar(range, '<custom-ident>')
    }
    switch (type) {
        case '|':
            return value.every(value => isSupportedSyntax(value, parser))
        case 'repetition':
            return min === 1 && max === 20 && value.type !== 'repetition' && value.type !== 'optional'
        case 'non-terminal':
            return supportedSyntaxComponentName.includes(name)
        default:
            return false
    }
}

/**
 * @param {string} syntax
 * @param {object} parser
 * @param {object} context
 * @returns {object|string|null}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#consume-a-syntax-definition}
 */
function parseSyntax(syntax, parser, context) {
    syntax = syntax.trim()
    if (syntax === '*') {
        return syntax
    }
    try {
        syntax = parseDefinition(syntax, context)
        if (isSupportedSyntax(syntax, parser)) {
            return syntax
        }
    } catch {}
    return null
}

module.exports = { isComputationallyIndependent, parseSyntax }
