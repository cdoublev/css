
const parseDefinition = require('./definition.js')

/**
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#computationally-independent}
 */
const computationallyDependentUnits = [
    'em', 'rem',
    'lh', 'rlh',
    'ex', 'rex', 'cap', 'rcap', 'ch', 'rch', 'ic', 'ric',
    'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax',
]

/**
 * @param {object|object[]} initial
 * @returns {boolean}
 */
function isComputationallyIndependent(initial) {
    if (Array.isArray(initial)) {
        return initial.every(isComputationallyIndependent)
    }
    const { name, types, value, unit } = initial
    if (name) {
        return name !== 'var' && isComputationallyIndependent(value)
    }
    // <calc-*>
    if (Array.isArray(value)) {
        return value.every(isComputationallyIndependent)
    }
    if (types[0] === '<dimension-token>') {
        return !computationallyDependentUnits.includes(unit)
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
 * @returns {object|string|null}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#consume-a-syntax-definition}
 */
function parseSyntax(syntax, parser) {
    syntax = syntax.trim()
    if (syntax === '*') {
        return syntax
    }
    try {
        syntax = parseDefinition(syntax)
        if (isSupportedSyntax(syntax, parser)) {
            return syntax
        }
    } catch {}
    return null
}

module.exports = { isComputationallyIndependent, parseSyntax }
