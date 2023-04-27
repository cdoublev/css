
const { Parser } = require('./parse/syntax.js')

/**
 * @param {object[]} condition
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-3/#typedef-supports-condition}
 * @see {@link https://drafts.csswg.org/css-conditional-4/#typedef-supports-feature}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-supports-feature}
 */
function matchCondition(condition) {
    if (Array.isArray(condition)) {
        const [head, tail] = condition
        if (tail.type.has('supports-in-parens')) {
            return !matchCondition(tail)
        }
        if (0 < tail.length) {
            if (tail[0][0].value === 'and') {
                return matchCondition(head) && tail.every(([, condition]) => matchCondition(condition))
            }
            return matchCondition(head) || tail.some(([, condition]) => matchCondition(condition))
        }
        return matchCondition(head)
    }
    const { type, value } = condition
    if (type.has('supports-feature')) {
        if (type.has('supports-decl')) {
            const parser = new Parser()
            return parser.parseDeclaration(value) !== null
        }
        if (type.has('supports-font-format-fn')) {
            return !value.type.has('string')
        }
        return true
    }
    if (type.has('general-enclosed')) {
        return false
    }
    return matchCondition(value)
}

module.exports = { matchCondition }
