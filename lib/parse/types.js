
const dimensions = require('../values/dimensions.js')
const { isCalculation } = require('../utils/value.js')
const nonTerminal = require('../values/definitions.js')

const dimensionTypes = [...dimensions.definitions.keys()]
const baseTypes = [...dimensionTypes, '<percentage>']
const types = [...baseTypes, '<number>']

const staticCalcKeywords = nonTerminal['<calc-keyword>'].split(' | ')

/**
 * @param {Map} type1
 * @param {Map} type2
 * @param {boolean} [left]
 * @returns {boolean}
 */
function areEqualTypes(type1, type2, left = true) {
    for (const [type, power] of type1) {
        if (power === 0 && !type2.has(type)) {
            continue
        }
        if (power !== type2.get(type)) {
            return false
        }
    }
    return left ? areEqualTypes(type2, type1, false) : true
}

/**
 * @param {Map} map
 * @returns {boolean}
 */
function hasDimensionType(type) {
    for (const [dimension, power] of type) {
        if (dimension !== 'percentage' && 0 < power) {
            return true
        }
    }
    return false
}

/**
 * @param {Map} type
 * @returns {boolean}
 */
function hasPercentageType(type) {
    if (type.has('percentage')) {
        return 0 < type.get('percentage')
    }
    return false
}

/**
 * @param {Map} type
 * @param {string} hint
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#apply-the-percent-hint}
 */
function applyPercentageHint(type, hint) {
    type.percentHint = hint
    if (!type.has(hint)) {
        type.set(hint, 0)
    }
    if (type.has('percentage') && hint !== 'percentage') {
        type.set(hint, type.get(hint) + type.get('percentage'))
        type.set('percentage', 0)
    }
}

/**
 * @param {Map} final
 * @param {Map} type1
 * @param {Map} type2
 */
function applyTypes(final, type1, type2) {
    type1.forEach((power, type) => final.set(type, power))
    type2.forEach((power, type) => {
        if (!final.has(type)) {
            final.set(type, power)
        }
    })
    final.percentHint = type1.percentHint
}

/**
 * @param {Map} type
 * @returns {Map}
 */
function copyType(type) {
    return createType(null, type)
}

/**
 * @param {string|null} [unit]
 * @param {*[]} [entries]
 * @param {string|null} [percentHint]
 * @returns {Map}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-create-a-type}
 */
function createType(unit, entries = [], percentHint = entries.percentHint ?? null) {
    const type = new Map(entries)
    type.percentHint = percentHint
    if (unit === '%') {
        type.set('percentage', 1)
    } else if (unit) {
        for (const [dimension, { units }] of dimensions.definitions) {
            if (units.includes(unit)) {
                type.set(dimension, 1)
                return type
            }
        }
    }
    return type
}

/**
 * @param {Map} type
 * @returns {Map}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-invert-a-type}
 */
function invertType(type) {
    const inverted = createType(null, [], type.percentHint)
    type.forEach((exponent, unit) => inverted.set(unit, -1 * exponent))
    return inverted
}

/**
 * @param {Map} type1
 * @param {Map} type2
 * @returns {Map|null}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-multiply-two-types}
 */
function multiplyTypes(type1, type2) {
    type1 = copyType(type1)
    type2 = copyType(type2)
    if (type1.percentHint) {
        if (type2.percentHint) {
            if (type2.percentHint !== type1.percentHint) {
                return null
            }
        } else {
            applyPercentageHint(type2, type1.percentHint)
        }
    } else if (type2.percentHint) {
        applyPercentageHint(type1, type2.percentHint)
    }
    const finalType = createType(undefined, type1)
    type2.forEach((power, type) => {
        if (finalType.has(type)) {
            finalType.set(type, finalType.get(type) + power)
        } else {
            finalType.set(type, power)
        }
    })
    return finalType
}

/**
 * @param {Map} type1
 * @param {Map} type2
 * @returns {Map|null}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-add-two-types}
 */
function addTypes(type1, type2) {
    type1 = copyType(type1)
    type2 = copyType(type2)
    if (type1.percentHint) {
        if (type2.percentHint) {
            if (type2.percentHint !== type1.percentHint) {
                return null
            }
        } else {
            applyPercentageHint(type2, type1.percentHint)
        }
    } else if (type2.percentHint) {
        applyPercentageHint(type1, type2.percentHint)
    }
    const finalType = createType()
    if (areEqualTypes(type1, type2)) {
        applyTypes(finalType, type1, type2)
        return finalType
    }
    if ((hasPercentageType(type1) || hasPercentageType(type2)) && (hasDimensionType(type1) || hasDimensionType(type2))) {
        for (let baseType of baseTypes) {
            if (baseType === '<percentage>') {
                continue
            }
            const t1 = copyType(type1)
            const t2 = copyType(type2)
            baseType = baseType.slice(1, -1)
            applyPercentageHint(t1, baseType)
            applyPercentageHint(t2, baseType)
            if (areEqualTypes(t1, t2)) {
                applyTypes(finalType, t1, t2)
                finalType.percentHint = baseType
                return finalType
            }
        }
    }
    return null
}

/**
 * @param {Map} base
 * @param {Map} input
 * @returns {Map|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#css-make-a-type-consistent}
 */
function makeConsistentType(base, { percentHint }) {
    if (base.percentHint && percentHint && base.percentHint !== percentHint) {
        return null
    }
    if (base.percentHint === null) {
        base.percentHint = percentHint
    }
    return base
}

/**
 * @param {function} combine
 * @param {object[]} calculations
 * @param {string} [resolutionType]
 * @returns {Map|null}
 */
function combineCalculationTypes(combine, [left, ...calculations], resolutionType) {
    left = getCalculationType(left, resolutionType)
    for (let right of calculations) {
        if (left === null) {
            return left
        }
        right = getCalculationType(right, resolutionType)
        if (right === null) {
            return null
        }
        left = combine(left, right)
    }
    return left
}

/**
 * @param {object} fn
 * @param {string} [resolutionType]
 * @returns {Map|null}
 */
function getCalculationFunctionType({ name, value }, resolutionType) {
    switch (name) {
        case 'abs':
        case 'calc':
            return getCalculationType(value, resolutionType)
        case 'acos':
        case 'asin':
        case 'atan': {
            const type = getCalculationType(value, resolutionType)
            if (matchNumericType(type, '<number>', resolutionType)) {
                return makeConsistentType(createType(undefined, [['angle', 1]]), type)
            }
            return null
        }
        case 'atan2': {
            const type = combineCalculationTypes(addTypes, value.filter(isCalculation), resolutionType)
            if (type) {
                return makeConsistentType(createType(undefined, [['angle', 1]]), type)
            }
            return null
        }
        case 'calc-mix': {
            const [,, start,, end] = value
            return combineCalculationTypes(addTypes, [start, end], resolutionType)
        }
        case 'clamp':
        case 'hypot':
        case 'max':
        case 'min':
        case 'mod':
        case 'random':
        case 'rem':
        case 'round':
            return combineCalculationTypes(addTypes, value.filter(isCalculation), resolutionType)
        case 'progress': {
            const type = combineCalculationTypes(addTypes, value.filter(isCalculation), resolutionType)
            if (type) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        case 'cos':
        case 'sin':
        case 'tan': {
            const type = getCalculationType(value, resolutionType)
            if (matchNumericType(type, ['<number>', '<angle>'], resolutionType)) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        case 'exp':
        case 'sqrt': {
            const type = getCalculationType(value, resolutionType)
            if (matchNumericType(type, '<number>', resolutionType)) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        case 'log':
        case 'pow': {
            const type = combineCalculationTypes(addTypes, value.filter(isCalculation), resolutionType)
            if (matchNumericType(type, '<number>', resolutionType)) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        case 'sibling-count':
        case 'sibling-index':
            return createType()
        case 'sign': {
            const type = getCalculationType(value, resolutionType)
            if (type) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        default:
            return null
    }
}

/**
 * @param {object} calculation
 * @param {string} [resolutionType]
 * @returns {Map|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#determine-the-type-of-a-calculation}
 */
function getCalculationType(calculation, resolutionType) {
    const { types, unit, value } = calculation
    for (let index = types.length - 1; 0 <= index; --index) {
        switch (types[index]) {
            case '<calc-invert>': {
                const type = getCalculationType(value, resolutionType)
                return type ? invertType(type) : null
            }
            case '<calc-keyword>': {
                if (staticCalcKeywords.includes(value) || !resolutionType || resolutionType === '<number>') {
                    return createType()
                }
                return createType(undefined, [[resolutionType.slice(1, -1), 1]])
            }
            case '<calc-negate>':
                return getCalculationType(value, resolutionType)
            case '<calc-product>':
                return combineCalculationTypes(multiplyTypes, calculation, resolutionType)
            case '<calc-sum>':
                return combineCalculationTypes(addTypes, calculation, resolutionType)
            case '<dimension>': {
                const type = dimensions.getTypeFromUnit(unit)
                return type ? createType(undefined, [[type.slice(1, -1), 1]]) : null
            }
            case '<function>':
                return getCalculationFunctionType(calculation, resolutionType)
            case '<integer>':
            case '<number>':
                return createType()
            case '<percentage>':
                if (resolutionType && resolutionType !== '<number>') {
                    return createType(undefined, [[resolutionType.slice(1, -1), 1]], resolutionType.slice(1, -1))
                }
                return createType(undefined, [['percentage', 1]], 'percentage')
        }
    }
    return null
}

/**
 * @param {Map|null} type
 * @param {string|string[]} production
 * @param {string|null} [resolutionType]
 * @returns {boolean}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-match}
 */
function matchNumericType(type, production, resolutionType = null) {
    // For convenience, allow running this function with a type failure
    if (type === null) {
        return false
    }
    // Allow running this function with some productions to match
    if (Array.isArray(production)) {
        return production.some(production => matchNumericType(type, production, resolutionType))
    }
    const nonZeroEntries = []
    type.forEach((power, type) => {
        if (power) {
            nonZeroEntries.push([type, power])
        }
    })
    production = production.slice(1, -1)
    if (resolutionType) {
        resolutionType = resolutionType?.slice(1, -1)
    }
    const { length } = nonZeroEntries
    if (length === 1) {
        const [[entry, power]] = nonZeroEntries
        // Future CSS types may have power > 1
        if (power !== 1) {
            return false
        }
        if (production === entry) {
            if (production === 'percentage') {
                return type.percentHint === 'percentage'
            }
            return !type.percentHint || type.percentHint === resolutionType
        }
        return false
    }
    if (length === 0 && production === 'number') {
        switch (type.percentHint) {
            case null:
                return true
            case 'percentage':
                return resolutionType === 'number'
            default:
                return type.percentHint === resolutionType
        }
    }
    return false
}

module.exports = {
    getCalculationType,
    matchNumericType,
    types,
}
