
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
        const value = type2.get(type)
        if (power === 0 && !value) {
            continue
        }
        if (power !== value) {
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
    if (!type.has(hint)) {
        type.set(hint, 0)
    }
    if (type.has('percentage')) {
        type.set(hint, type.get(hint) + type.get('percentage'))
        type.set('percentage', 0)
    }
    type.percentHint = hint
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
    const result = createType(null, [], type.percentHint)
    type.forEach((exponent, unit) => result.set(unit, -1 * exponent))
    return result
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
    left = getCalculationNodeType(left, resolutionType)
    for (let right of calculations) {
        if (left === null) {
            return left
        }
        right = getCalculationNodeType(right, resolutionType)
        if (right === null) {
            return null
        }
        left = combine(left, right)
    }
    return left
}

/**
 * @param {object} calculation
 * @param {string} [resolutionType]
 * @returns {Map|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#determine-the-type-of-a-calculation}
 */
function getCalculationType({ types, unit, value }, resolutionType) {
    for (let index = types.length - 1; 0 <= index; --index) {
        switch (types[index]) {
            case '<calc-invert>':
                return invertType(getCalculationNodeType(value, resolutionType))
            case '<calc-keyword>': {
                if (staticCalcKeywords.includes(value) || !resolutionType || resolutionType === '<number>') {
                    return createType()
                }
                return createType(undefined, [[resolutionType.slice(1, -1), 1]])
            }
            case '<integer>':
            case '<number>':
                return createType()
            case '<calc-negate>':
                return getCalculationNodeType(value, resolutionType)
            case '<calc-product>':
                return combineCalculationTypes(multiplyTypes, value, resolutionType)
            case '<calc-sum>':
                return combineCalculationTypes(addTypes, value, resolutionType)
            case '<dimension>': {
                const type = dimensions.getTypeFromUnit(unit)
                return type ? createType(undefined, [[type.slice(1, -1), 1]]) : null
            }
            case '<percentage>':
                if (resolutionType && resolutionType !== '<number>') {
                    return createType(undefined, [[resolutionType.slice(1, -1), 1]], resolutionType.slice(1, -1))
                }
                return createType(undefined, [['percentage', 1]])
        }
    }
    return null
}

/**
 * @param {object} node
 * @param {string} [resolutionType]
 * @returns {Map|null}
 *
 * It resolves the type of any calculation tree node.
 */
function getCalculationNodeType(node, resolutionType) {
    return node.types[0] === '<function>'
        ? getMathFunctionType(node, resolutionType)
        : getCalculationType(node, resolutionType)
}

/**
 * @param {object} fn
 * @param {string} [resolutionType]
 * @returns {Map|null}
 */
function getMathFunctionType({ name, value }, resolutionType) {
    switch (name) {
        case 'abs':
        case 'calc':
            return getCalculationNodeType(value, resolutionType)
        case 'acos':
        case 'asin':
        case 'atan': {
            const type = getCalculationNodeType(value, resolutionType)
            if (matchNumericType(type, '<number>')) {
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
        case 'calc-mix':
        case 'clamp':
        case 'hypot':
        case 'max':
        case 'min':
        case 'mod':
        case 'random':
        case 'rem':
        case 'round':
            return combineCalculationTypes(addTypes, value.flat().filter(isCalculation), resolutionType)
        case 'cos':
        case 'sin':
        case 'tan': {
            const type = getCalculationNodeType(value, resolutionType)
            if (matchNumericType(type, '<number>', '<angle>')) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        case 'exp':
        case 'sqrt': {
            const type = getCalculationNodeType(value, resolutionType)
            if (matchNumericType(type, '<number>')) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        case 'log':
        case 'pow': {
            const type = combineCalculationTypes(addTypes, value.filter(isCalculation), resolutionType)
            if (matchNumericType(type, '<number>')) {
                return makeConsistentType(createType(), type)
            }
            return null
        }
        case 'sign': {
            const type = getCalculationNodeType(value, resolutionType)
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
 * @param {Map|null} type
 * @param {...string} productions
 * @returns {boolean}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-match}
 */
function matchNumericType(type, ...productions) {
    // Allow running this function with null type resulting from `getMathFunctionType()`
    if (type === null) {
        return false
    }
    // Allow running this function with some productions to match
    if (1 < productions.length) {
        return productions.some(production => matchNumericType(type, production))
    }
    const production = productions[0].slice(1, -1)
    const nonZeroEntries = []
    type.forEach((power, type) => {
        if (power) {
            nonZeroEntries.push([type, power])
        }
    })
    const { length } = nonZeroEntries
    if (length === 1) {
        const [[entry, power]] = nonZeroEntries
        if (power !== 1) {
            return false
        }
        // <dimension-percentage> or <percentage>
        if (production.includes('percentage')) {
            const [dimension] = production.split('-')
            return entry === dimension || entry === 'percentage'
        }
        // <dimension>
        return entry === production && !type.percentHint
    }
    if (production === 'number') {
        return length === 0 && !type.percentHint
    }
    return production === 'number-percentage' && length === 0
}

module.exports = {
    getCalculationType,
    getMathFunctionType,
    matchNumericType,
    types,
}
