
import environment from '../values/environment.js'
import { findRule } from '../utils/definition.js'
import { isList } from '../utils/value.js'

/**
 * @param {object[]} condition
 * @param {object} globalObject
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#typedef-supports-condition}
 * @see {@link https://drafts.csswg.org/css-conditional-4/#typedef-supports-feature}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-supports-feature}
 */
export default function match(condition, globalObject) {
    if (isList(condition)) {
        const [head, tail] = condition
        if (head.value === 'not') {
            return !match(tail, globalObject)
        }
        if (0 < tail.length) {
            if (tail[0][0].value === 'and') {
                return match(head, globalObject) && tail.every(([, condition]) => match(condition, globalObject))
            }
            return match(head, globalObject) || tail.some(([, condition]) => match(condition, globalObject))
        }
        return match(head, globalObject)
    }
    const { types, value } = condition
    if (types.includes('<supports-at-rule-fn>')) {
        const definition = findRule(`@${value.value}`)
        return definition && !definition.qualified
    }
    if (types.includes('<supports-env-fn>')) {
        if (value.value.startsWith('--')) {
            return !!globalObject.document._registeredEnvironmentVariables.has(value.value)
        }
        return !!environment[value.value]
    }
    if (types.includes('<supports-feature>')) {
        if (types.includes('<supports-font-format-fn>')) {
            return !value.types.includes('<string>')
        }
        return true
    }
    if (types.includes('<general-enclosed>')) {
        return false
    }
    return match(value, globalObject)
}
