
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
 * @param {object|object[]} value
 * @returns {boolean}
 */
function isCalculation(value) {
    return value.types.includes('<calc-value>') || isCalculationOperator(value)
}

/**
 * @param {object|object[]} value
 * @returns {boolean}
 */
function isCalculationOperator(value) {
    return calculationOperators.includes(value.types[0])
}

/**
 * @param {object|object[]} value
 * @param {string} [resolutionType]
 * @returns {boolean}
 */
function isCombinable({ types, unit, value }, resolutionType) {
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
 * @param {object|object[]} value
 * @returns {boolean}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#computationally-independent}
 */
function isComputationallyIndependent(value) {
    if (isList(value)) {
        return value.every(isComputationallyIndependent)
    }
    switch (value.types[0]) {
        case '<dimension-token>':
            return !computationallyDependentUnits.includes(value.unit)
        case '<function>':
            return isComputationallyIndependent(value.value)
        default:
            if (Array.isArray(value.value)) {
                return value.value.every(isComputationallyIndependent)
            }
            return true
    }
}

/**
 * @param {string|string[]} delimiter
 * @param {object|object[]} [value]
 * @returns {boolean|function}
 */
function isDelimiter(delimiter, value) {
    if (value) {
        if (Array.isArray(delimiter)) {
            return delimiter.some(delimiter => isDelimiter(delimiter, value))
        }
        return value.types[0] === '<delimiter-token>'
            && value.value === delimiter
    }
    return value => value && isDelimiter(delimiter, value)
}

/**
 * @param {object|object[]} value
 * @param {string} [separator]
 */
function isList(value, separator) {
    if (List.is(value)) {
        if (typeof separator === 'string') {
            return value.separator === separator
        }
        return true
    }
    return false
}

/**
 * @param {object|object[]} value
 * @param {boolean} [literal]
 * @returns {boolean}
 */
function isNumeric(value, literal) {
    return value.types.some(type =>
        type === '<dimension>'
        || type === '<number>'
        || type === '<percentage>'
        || (!literal && type === '<calc-keyword>'))
}

/**
 * @param {object|object[]} [value]
 * @returns {boolean}
 */
function isOmitted(value) {
    if (isList(value)) {
        if (value.separator && value.separator !== ' ') {
            return value.every(value => isList(value) && value.every(isOmitted))
        }
        return value.every(isOmitted)
    }
    return value === omitted
}

/**
 * @param {object|object[]} value
 * @param {string|string[]} [associatedToken]
 * @returns {boolean|function}
 */
function isSimpleBlock(associatedToken, value) {
    if (value) {
        if (Array.isArray(associatedToken)) {
            return associatedToken.some(associatedToken => isDelimiter(associatedToken, block))
        }
        return value.types[0] === '<simple-block>' && value.associatedToken === associatedToken
    }
    return value => value && isSimpleBlock(associatedToken, value)
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
