
const { definitions: dimensions } = require('../values/dimensions.js')
const { isCalculation } = require('../values/validation.js')

const dimensionTypes = [...dimensions.keys()]
const baseTypes = [...dimensionTypes, 'percentage']
const types = [...baseTypes, 'number']

/**
 * @param {Map} type1
 * @param {Map} type2
 * @returns {boolean}
 */
function areEqualTypes(type1, type2) {
    if (type1.size !== type2.size) {
        return false
    }
    for (const [type, power] of type1) {
        if (type2.get(type) !== power) {
            return false
        }
    }
    return true
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
    if (type.has(!hint)) {
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
    const { percentHint } = type
    type = new Map(type)
    type.percentHint = percentHint
    return type
}

/**
 * @param {string} [unit]
 * @param {entry[]} [entries]
 * @param {string|null} [percentHint]
 * @returns {Map}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-create-a-type}
 */
function createType(unit, entries = [], percentHint = entries.percentHint ?? null) {
    const type = new Map(entries)
    type.percentHint = percentHint
    for (const [dimension, { units }] of dimensions) {
        if (units.includes(unit)) {
            type.set(dimension, 1)
            return type
        }
    }
    if (unit === '%') {
        type.set('percentage', 1)
    }
    return type
}

/**
 * @param {Map} type
 * @returns {Map}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-invert-a-type}
 */
function invertType(type) {
    const result = createType()
    type.forEach((exponent, unit) => {
        result.set(unit, -1 * exponent)
    })
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
        for (const baseType of baseTypes) {
            if (baseType === 'percentage') {
                continue
            }
            const t1 = copyType(type1)
            const t2 = copyType(type2)
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
        right = getCalculationNodeType(right, resolutionType, left)
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
 *
 * It resolves the type of an operator node or a leaf node.
 */
function getCalculationType({ type, value }, resolutionType) {
    if (type.has('calc-sum')) {
        return combineCalculationTypes(addTypes, value, resolutionType)
    }
    if (type.has('calc-product')) {
        return combineCalculationTypes(multiplyTypes, value, resolutionType)
    }
    if (type.has('calc-negate')) {
        return getCalculationNodeType(value, resolutionType)
    }
    if (type.has('calc-invert')) {
        const type = getCalculationNodeType(value, resolutionType)
        return type ? invertType(type) : type
    }
    if (type.has('percentage')) {
        if (resolutionType && resolutionType !== 'number') {
            return createType(undefined, [[resolutionType, 1]])
        }
        return createType(undefined, [['percentage', 1]])
    }
    const dimension = dimensionTypes.find(t => type.has(t))
    if (dimension) {
        return createType(undefined, [[dimension, 1]])
    }
    if (type.has('calc-constant') || type.has('number') || type.has('integer')) {
        return createType()
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
    return node.type.has('function')
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
        case 'atan':
            if (matchNumericType(getCalculationNodeType(value), 'number')) {
                return createType(undefined, [['angle', 1]])
            }
            return null
        case 'atan2':
            if (combineCalculationTypes(addTypes, value.filter(isCalculation), resolutionType)) {
                return createType(undefined, [['angle', 1]])
            }
            return null
        case 'clamp':
        case 'hypot':
        case 'max':
        case 'min':
            return combineCalculationTypes(addTypes, value, resolutionType)
        case 'cos':
        case 'sin':
        case 'tan':
            if (matchNumericType(getCalculationNodeType(value, resolutionType), 'number', 'angle')) {
                return createType()
            }
            return null
        case 'exp':
        case 'sqrt':
            if (matchNumericType(getCalculationNodeType(value), 'number')) {
                return createType()
            }
            return null
        case 'mod':
        case 'rem':
        case 'round':
            return combineCalculationTypes(addTypes, value.filter(isCalculation), resolutionType)
        case 'log':
        case 'pow':
            if (value.filter(isCalculation).every(calculation => matchNumericType(getCalculationNodeType(calculation), 'number'))) {
                return createType()
            }
            return null
        case 'sign':
            if (getCalculationNodeType(value, resolutionType)) {
                return createType()
            }
            return null
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
    // Allow to run this function with null type resulting from `getMathFunctionType()`
    if (type === null) {
        return false
    }
    // Allow to run this function with some productions to match
    if (1 < productions.length) {
        return productions.some(production => matchNumericType(type, production))
    }
    const [production] = productions
    const { percentHint } = type
    const nonZeroEntries = []
    type.forEach((power, type) => {
        if (power) {
            nonZeroEntries.push([type, power])
        }
    })
    const { length } = nonZeroEntries
    if (length === 1) {
        const [[type, power]] = nonZeroEntries
        if (power !== 1) {
            return false
        }
        // <dimension-percentage> or <percentage>
        if (production.includes('percentage')) {
            const [dimension] = production.split('-')
            return type === dimension || type === 'percentage'
        }
        // <dimension>
        return type === production && !percentHint
    }
    if (production === 'number') {
        return length === 0 && !percentHint
    }
    return production === 'number-percentage' && length === 0
}

module.exports = {
    getCalculationType,
    getMathFunctionType,
    matchNumericType,
    types,
}
