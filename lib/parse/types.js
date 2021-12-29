
const dimensions = require('../values/dimensions.js')
const { isCalculation } = require('../values/validation.js')

// The ordering of a type's entries always matches this base type ordering:
const baseTypes = [
    'length',
    'angle',
    'time',
    'frequency',
    'resolution',
    'flex',
    'percentage',
]

const mathFunctionTypes = [
    'angle',
    'angle-percentage',
    'flex',
    'frequency',
    'frequency-percentage',
    'integer',
    'length',
    'length-percentage',
    'number',
    'percentage',
    'time',
    'resolution',
]

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
        if (dimension !== 'percentage' && power > 0) {
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
        return type.get('percentage') > 0
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
    if (dimensions.angle.units.includes(unit)) {
        type.set('angle', 1)
    } else if (dimensions.frequency.units.includes(unit)) {
        type.set('frequency', 1)
    } else if (dimensions.length.units.includes(unit)) {
        type.set('length', 1)
    } else if (dimensions.resolution.units.includes(unit)) {
        type.set('resolution', 1)
    } else if (dimensions.time.units.includes(unit)) {
        type.set('time', 1)
    } else if (unit === 'fr') {
        type.set('flex', 1)
    } else if (unit === '%') {
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
 * @returns {Map|null} null is a failure
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
 * @param {object} node
 * @param {string} contextType
 * @returns {Map}
 */
function getCalculationNodeType(node, contextType) {
    return node.type.has('math-function')
        ? getMathFunctionType(node, contextType)
        : getCalculationType(node, contextType)
}

/**
 * @param {object} tree
 * @param {string} [contextType]
 * @returns {Map|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#determine-the-type-of-a-calculation}
 */
function getCalculationType({ type, value }, contextType) {
    if (type.has('calc-sum')) {
        const [left, ...nodes] = value
        return nodes.reduce(
            (leftType, right) => {
                if (leftType) {
                    const rightType = getCalculationNodeType(right, contextType)
                    if (rightType) {
                        return addTypes(leftType, rightType)
                    }
                }
                return null
            },
            getCalculationNodeType(left, contextType))
    }
    if (type.has('calc-product')) {
        const [left, ...nodes] = value
        return nodes.reduce(
            (leftType, right) => {
                if (leftType) {
                    const rightType = getCalculationNodeType(right, contextType)
                    if (rightType) {
                        return multiplyTypes(leftType, rightType)
                    }
                }
                return null
            },
            getCalculationNodeType(left, contextType))
    }
    if (type.has('calc-negate')) {
        return getCalculationType(value[0], contextType)
    }
    if (type.has('calc-invert')) {
        return invertType(getCalculationType(value[0], contextType))
    }
    if (type.has('percentage')) {
        if (contextType && contextType !== 'number') {
            return createType(undefined, [[contextType, 1]])
        }
        return createType(undefined, [['percentage', 1]])
    }
    const dimension = baseTypes.find(t => type.has(t))
    if (dimension) {
        return createType(undefined, [[dimension, 1]])
    }
    if (type.has('calc-constant') || type.has('number') || type.has('integer')) {
        return createType()
    }
    return null
}

/**
 * @param {object} fn
 * @param {string} [contextType]
 * @returns {Map|null}
 */
function getMathFunctionType({ name, value }, contextType) {
    switch (name) {
        case 'abs':
        case 'calc':
            return getCalculationType(value, contextType)
        case 'clamp':
        case 'hypot':
        case 'max':
        case 'min':
        case 'mod':
        case 'rem':
        case 'round':
            return getCalculationType({ type: new Set(['calc-sum']), value: value.filter(isCalculation) }, contextType)
        case 'cos':
        case 'sin':
        case 'tan':
            // Calculation should be <number> or <angle>, and function is resolved to <number>
            const angle = getCalculationType(value)
            if (matchNumericType(angle, 'number') || matchNumericType(angle, 'angle')) {
                return createType(undefined, [['number', 1]])
            }
            return null
        case 'asin':
        case 'acos':
        case 'atan':
            // Calculation should be <number>, and function is resolved to <angle>
            if (matchNumericType(getCalculationType(value), 'number')) {
                return createType(undefined, [['angle', 1]])
            }
            return null
        case 'atan2':
            // Calculations should have the same numeric type, and function is resolved to <angle>
            if (getCalculationType({ type: new Set(['calc-sum']), value: value.filter(isCalculation) })) {
                return createType(undefined, [['angle', 1]])
            }
            return null
        case 'sign':
            // Calculation should be any numeric type, and function is resolved to <number>
            if (getCalculationType(value, contextType)) {
                return createType(undefined, [['number', 1]])
            }
            return null
        case 'exp':
        case 'sqrt':
            // Calculation should be <number>, and function is resolved to <number>
            if (matchNumericType(getCalculationType(value), 'number')) {
                return createType(undefined, [['number', 1]])
            }
            return null
        case 'log':
        case 'pow':
            // Calculations should be <number>s, and function is resolved to <number>
            if (matchNumericType(getCalculationType({ type: new Set(['calc-sum']), value: value.filter(isCalculation) }), 'number')) {
                return createType(undefined, [['number', 1]])
            }
            return null
        default:
            throw RangeError(`Can not get the type of the math function "${name}"`)
    }
}

/**
 * @param {Map} type
 * @param {string} production
 * @returns {boolean}
 * @see {@link https://drafts.css-houdini.org/css-typed-om-1/#cssnumericvalue-match}
 */
function matchNumericType(type, production) {
    // Allow to run this function with a null type resulting from `getMathFunctionType()`
    if (type === null) {
        return false
    }
    const { percentHint } = type
    const nonZero = []
    type.forEach((power, type) => {
        if (power) {
            nonZero.push([type, power])
        }
    })
    if (nonZero.length === 1) {
        const [[actual, power]] = nonZero
        if (power !== 1) {
            return false
        }
        // dimension-percentage or percentage
        if (production.includes('percentage')) {
            const [relative] = production.split('-')
            return actual === relative || actual === 'percentage'
        }
        // dimension
        return actual === production && !percentHint
    }
    return production === 'number' && nonZero.length === 0 && !percentHint
}

module.exports = {
    getCalculationType,
    getMathFunctionType,
    matchNumericType,
    mathFunctionTypes,
}
