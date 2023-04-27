
const { getMathFunctionType, matchNumericType } = require('./types.js')
const { getNumericContextTypes, simplifyCalculationTree } = require('./math-functions.js')

const deprecated = {
    'system-color': '<deprecated-color>',
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|null}
 */
function replaceDeprecated(parser, node) {
    const { definition: { name } } = node
    const match = parser.parseValue(parser.tree.list, deprecated[name], true)
    if (match) {
        match.type.add(name)
    }
    return match
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#math-function}
 *
 * `contextType` is the context production: <type-percentage> or <type>.
 *
 * `resolutionType` is the type in <type-percentage> or it is undefined.
 *
 * `numericType` is a map of base types to integers representing a power.
 */
function replaceNumeric(parser, node) {
    const { productions, tree: { list } } = parser
    const { name: mathFnName } = list.next()
    const mathFn = `${mathFnName}()`
    if (!productions.nonTerminals[mathFn]) {
        return null
    }
    const match = parser.parseValue(list, `<${mathFn}>`, true)
    if (!match) {
        return null
    }
    const { definition: { name, range }, parent } = node
    // <number> -> <number> | <dimension> | ... -> <calc-value>
    const topLevel = parent?.parent?.definition.name !== 'calc-value'
    // Eg. do not match the type of `min(1)` when parsing `translateX(calc(1px * min(1)))`
    if (topLevel) {
        const { contextType, resolutionType } = getNumericContextTypes(node)
        const numericType = getMathFunctionType(match, resolutionType)
        if (matchNumericType(numericType, contextType)) {
            const value = simplifyCalculationTree(mathFnName === 'calc' ? match.value : match, resolutionType)
            const round = name === 'integer'
            return { ...match, numericType, range, round, value }
        }
        return null
    }
    return match
}

module.exports = {
    'angle': replaceNumeric,
    'flex': replaceNumeric,
    'frequency': replaceNumeric,
    'integer': replaceNumeric,
    'length': replaceNumeric,
    'number': replaceNumeric,
    'percentage': replaceNumeric,
    'resolution': replaceNumeric,
    'system-color': replaceDeprecated,
    'time': replaceNumeric,
}
