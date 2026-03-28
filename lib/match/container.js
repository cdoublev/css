
import { getComputedValue } from '../resolve.js'
import { isOmitted } from '../utils/value.js'
import { serializeComponentValue } from '../serialize.js'

/**
 * @param {*} query
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-container-query}
 */
function matchQuery(query, element) {
    return isOmitted(query)
}

/**
 * @param {object} name
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-container-name}
 */
function matchName(name, element) {
    return isOmitted(name) || name.value === serializeComponentValue(getComputedValue('container-name', element))
}

/**
 * @param {*[]} conditions
 * @param {Element} element
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-container-condition}
 */
export default function match(conditions, element) {
    return conditions.some(([name, query]) => matchName(name, element) && matchQuery(query, element))
}
