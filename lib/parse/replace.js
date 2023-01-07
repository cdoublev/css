
const { getMathFunctionType, matchNumericType } = require('./types.js')
const { getNumericContextTypes, simplifyCalculationTree } = require('./math-functions.js')

const deprecated = {
    'system-color': '<deprecated-color>',
}

const legacy = {
    'hsl()': 'hsl(<hue>, <percentage>, <percentage>, <alpha-value>?)',
    'hsla()': 'hsla(<hue>, <percentage>, <percentage>, <alpha-value>?)',
    'rgb()': 'rgb(<percentage>#{3}, <alpha-value>?) | rgb(<number>#{3}, <alpha-value>?)',
    'rgba()': 'rgba(<percentage>#{3}, <alpha-value>?) | rgba(<number>#{3}, <alpha-value>?)',
    'url': '<url-token>',
}

/**
 * @param {Parser} parser
 * @param {object} node
 * @returns {object|null}
 */
function replaceLegacyOrDeprecated(parser, node) {
    const { definition: { name } } = node
    const match = parser.parse(parser.tree.list, legacy[name] ?? deprecated[name], true)
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
    const { nonTerminals: { [mathFn]: mathFnDefinition } } = productions
    if (!mathFnDefinition) {
        return null
    }
    const match = parser.parse(list, `<${mathFn}>`, true)
    if (!match) {
        return null
    }
    const { definition: { name, range }, parent } = node
    // <number> -> <number> | <dimension> | ... -> <calc-value>
    const topLevel = parent?.parent?.definition.name !== 'calc-value'
    // Eg. do not match the type of `min(1)` when parsing `calc(1px * min(1))` against <length>
    if (topLevel) {
        const { contextType, resolutionType } = getNumericContextTypes(name, parent?.definition)
        const numericType = getMathFunctionType(match, resolutionType)
        if (matchNumericType(numericType, contextType)) {
            let { value } = match
            value = simplifyCalculationTree(mathFnName === 'calc' ? value : match, resolutionType)
            if (Number.isNaN(value.value)) {
                value = { ...value, value: 0 }
            }
            return { ...match, numericType, range, round: name === 'integer', value }
        }
        return null
    }
    return match
}

module.exports = {
    'angle': replaceNumeric,
    'flex': replaceNumeric,
    'frequency': replaceNumeric,
    'hsl()': replaceLegacyOrDeprecated,
    'hsla()': replaceLegacyOrDeprecated,
    'integer': replaceNumeric,
    'length': replaceNumeric,
    'number': replaceNumeric,
    'percentage': replaceNumeric,
    'resolution': replaceNumeric,
    'rgb()': replaceLegacyOrDeprecated,
    'rgba()': replaceLegacyOrDeprecated,
    'system-color': replaceLegacyOrDeprecated,
    'time': replaceNumeric,
    'url': replaceLegacyOrDeprecated,
}
