
import { isList } from '../utils/value.js'

/**
 * @param {object[]} condition
 * @param {Window} globalObject
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#typedef-supports-condition}
 * @see {@link https://drafts.csswg.org/css-conditional-4/#typedef-supports-feature}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-supports-feature}
 */
export default function match(condition, globalObject) {
    if (isList(condition)) {
        if (condition.types.includes('<any-value>')) {
            return false
        }
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
            case '<supports-at-rule-fn>':
            case '<supports-font-format-fn>':
            case '<supports-font-tech-fn>':
            case '<supports-selector-fn>':
                return true
            case '<supports-decl>':
            case '<supports-in-parens>':
                return match(value, globalObject)
            case '<supports-env-fn>':
                return !value.value.startsWith('--')
                    || globalObject.document._registeredEnvironmentVariables.has(value.value)
            default:
                return false
        }
    }
}
