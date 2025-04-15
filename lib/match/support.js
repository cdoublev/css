
const { isList } = require('../utils/value.js')

/**
 * @param {object[]} condition
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#typedef-supports-condition}
 * @see {@link https://drafts.csswg.org/css-conditional-4/#typedef-supports-feature}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-supports-feature}
 */
function match(condition) {
    if (isList(condition)) {
        const [head, tail] = condition
        if (head.value === 'not') {
            return !match(tail)
        }
        if (0 < tail.length) {
            if (tail[0][0].value === 'and') {
                return match(head) && tail.every(([, condition]) => match(condition))
            }
            return match(head) || tail.some(([, condition]) => match(condition))
        }
        return match(head)
    }
    const { types, value } = condition
    if (types.includes('<supports-feature>')) {
        if (types.includes('<supports-font-format-fn>')) {
            return !value.types.includes('<string>')
        }
        return true
    }
    if (types.includes('<general-enclosed>')) {
        return false
    }
    return match(value)
}

module.exports = match
