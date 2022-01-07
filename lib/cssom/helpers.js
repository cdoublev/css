
const parseLonghands = require('../parse/longhands.js')
const shorthands = require('../properties/shorthands.js')

/**
 * @param {object[]} declarations
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#concept-declarations-specified-order}
 */
function getDeclarationsInSpecifiedOrder(declarations) {
    return declarations
        .flatMap(declaration => {
            const { important, name, value } = declaration
            if (shorthands.has(name)) {
                const expanded = parseLonghands(value, name)
                return Object.entries(expanded).map(([name, list]) =>
                    ({ important, input: value, name, value: list }))
            }
            return declaration
        })
        .reduce((declarations, declaration) => {
            const { name } = declaration
            const occurrenceIndex = declarations.findIndex(declaration => declaration.name === name)
            if (-1 < occurrenceIndex) {
                declarations.splice(occurrenceIndex, 1)
            }
            declarations.push(declaration)
            return declarations
        }, [])
}

/**
 * @param {CSSRule} rule
 * @param {string} type
 * @returns {boolean}
 */
function isRuleOfType(rule, type) {
    return rule.constructor.name === type
}

/**
 * @param {CSSRule[]} list
 * @param {function[]} types
 * @returns {boolean}
 */
function hasOnlyRuleOfTypes(list, types) {
    return list.every(rule => types.some(type => isRuleOfType(rule, type)))
}

module.exports = {
    getDeclarationsInSpecifiedOrder,
    hasOnlyRuleOfTypes,
    isRuleOfType,
}
