
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
    for (const type of types) {
        switch (type) {
            case '<block>':
            case '<function>':
                continue
            case '<declaration>':
            case '<supports-font-tech-fn>':
            case '<supports-selector-fn>':
                return true
            case '<supports-at-rule-fn>': {
                const definition = findRule(`@${value.value}`)
                return definition && !definition.qualified
            }
            case '<supports-font-format-fn>':
                return !value.types.includes('<string>')
            case '<supports-decl>':
            case '<supports-in-parens>':
                return match(value, globalObject)
            case '<supports-env-fn>':
                if (value.value.startsWith('--')) {
                    return globalObject.document._registeredEnvironmentVariables.has(value.value)
                }
                return !!environment[value.value]
            default:
                return false
        }
    }
}
