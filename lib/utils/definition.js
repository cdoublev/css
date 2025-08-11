
const sequences = ['||', '&&', ' ']
export const combinators = ['|', ...sequences]
const compounds = ['block', 'declaration', 'function', 'rule']
const types = ['arbitrary', 'forgiving', 'non-terminal', 'rule']

/**
 * @param {object} definition
 * @returns {boolean}
 */
export function isCSSType(definition) {
    return types.includes(definition.type)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
export function isCombination(definition) {
    return combinators.includes(definition.type)
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
export function isCompound(definition) {
    return compounds.includes(definition.type)
}

/**
 * @param {string} definition
 * @param {string} multiplier
 * @returns {boolean}
 */
export function isMultipliableWith(definition, multiplier) {
    if (multiplier === '!') {
        return isCombination(definition)
    }
    const { max, min, separator, type } = definition
    if (type === 'repetition') {
        if (multiplier === '?') {
            // #? or #{A}? or {A}? but not *? or +?
            return separator === ',' || (!separator && (1 < min || max < 20))
        }
        if (multiplier.startsWith('#')) {
            // +# or +#{A}
            return !separator && min === 1 && max === 20
        }
        return false
    }
    return isCSSType(definition) || type === 'token'
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
export function isMultiplied({ type }) {
    return type === 'optional' || type === 'required' || type === 'repetition'
}

/**
 * @param {object} definition
 * @returns {boolean}
 */
export function isSequence({ type }) {
    return sequences.includes(type) || type === 'repetition'
}
