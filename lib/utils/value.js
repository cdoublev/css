
const { List, omitted } = require('../values/value.js')
const dimensions = require('../values/dimensions.js')

const calculationOperators = ['<calc-invert>', '<calc-negate>', '<calc-product>', '<calc-sum>']
const computationallyDependentUnits = [
    'em', 'rem',
    'lh', 'rlh',
    'ex', 'rex', 'cap', 'rcap', 'ch', 'rch', 'ic', 'ric',
    'cqw', 'cqh', 'cqi', 'cqb', 'cqmin', 'cqmax',
]

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function isCalculation(component) {
    return component.types.includes('<calc-value>') || isCalculationOperator(component)
}

/**
 * @param {object|object[]} component
 * @returns {boolean}
 */
function isCalculationOperator(component) {
    return calculationOperators.includes(component.types[0])
}

/**
 * @param {object|object[]} component
 * @param {string} [resolutionType]
 * @returns {boolean}
 */
function isCombinable(component, resolutionType) {
    const { types, unit, value } = component
    if (types.includes('<calc-invert>')) {
        return isCombinable(value, resolutionType)
    }
    if (types.includes('<dimension>')) {
        for (const dimension of dimensions.definitions.values()) {
            if (dimension.canonicalUnit === unit) {
                return true
            }
        }
        return false
    }
    if (types.includes('<percentage>')) {
        return !resolutionType
    }
    return types.includes('<number>')
}

/**
 * @param {object|object[]} initial
 * @returns {boolean}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#computationally-independent}
 */
function isComputationallyIndependent(component) {
    if (isList(component)) {
        return component.every(isComputationallyIndependent)
    }
    const { types, value, unit } = component
    if (types[0] === '<function>') {
        return isComputationallyIndependent(value)
    }
    if (types[0] === '<dimension-token>') {
        return !computationallyDependentUnits.includes(unit)
    }
    if (Array.isArray(value)) {
        return value.every(isComputationallyIndependent)
    }
    return true
}

/**
 * @param {string|string[]} delimiter
 * @param {object|object[]} [component]
 * @returns {boolean|function}
 */
function isDelimiter(delimiter, component) {
    if (component) {
        if (Array.isArray(delimiter)) {
            return delimiter.some(delimiter => isDelimiter(delimiter, component))
        }
        return component.types[0] === '<delimiter-token>'
            && component.value === delimiter
    }
    return component => component && isDelimiter(delimiter, component)
}

/**
 * @param {object|object[]} component
 * @param {string} [separator]
 */
function isList(component, separator) {
    if (List.is(component)) {
        if (typeof separator === 'string') {
            return component.separator === separator
        }
        return true
    }
    return false
}

/**
 * @param {object|object[]} component
 * @param {boolean} [literal]
 * @returns {boolean}
 */
function isNumeric(component, literal) {
    return component.types.some(type =>
        type === '<dimension>'
        || type === '<number>'
        || type === '<percentage>'
        || (!literal && type === '<calc-keyword>'))
}

/**
 * @param {object|object[]} [component]
 * @returns {boolean}
 */
function isOmitted(component) {
    if (isList(component)) {
        if (component.separator && component.separator !== ' ') {
            return component.every(component => isList(component) && component.every(isOmitted))
        }
        return component.every(isOmitted)
    }
    return component === omitted
}

/**
 * @param {object|object[]} component
 * @param {string|string[]} [associatedToken]
 * @returns {boolean|function}
 */
function isSimpleBlock(associatedToken, component) {
    if (component) {
        if (Array.isArray(associatedToken)) {
            return associatedToken.some(associatedToken => isDelimiter(associatedToken, block))
        }
        return component.types[0] === '<simple-block>' && component.associatedToken === associatedToken
    }
    return component => component && isSimpleBlock(associatedToken, component)
}

module.exports = {
    isCalculation,
    isCalculationOperator,
    isCloseCurlyBrace: isDelimiter('}'),
    isColon: isDelimiter(':'),
    isCombinable,
    isComma: isDelimiter(','),
    isComputationallyIndependent,
    isDelimiter,
    isList,
    isNumeric,
    isOmitted,
    isOpenCurlyBrace: isDelimiter('{'),
    isSemicolon: isDelimiter(';'),
    isSimpleBlock,
    isWhitespace: isDelimiter(' '),
}
