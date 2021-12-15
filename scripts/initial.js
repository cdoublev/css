/**
 * This script replaces the `initial` field value of each property definition in
 *  `./lib/properties/definitions.js` by the data structure that would result
 * from parsing the initial string value against the definition `value` field.
 */
const { addQuotes, logError, tab } = require('../lib/utils/script.js')
const fs = require('fs')
const path = require('path')
const { parseValue } = require('../lib/parse/value.js')
const properties = require('../lib/properties/definitions.js')

const outputPath = path.resolve(__dirname, '../lib/properties/definitions.js')
const dependency = "const createList = require('../values/value.js')"
const header = `// Generated from ${__filename}\n\n${dependency}`

/**
 * @param {Set} type
 * @returns {string}
 */
function serializeTypes(type) {
    return `new Set([${[...type].map(addQuotes).join(', ')}])`
}

/**
 * @param {string} separator
 * @param {Set} types
 * @param {string} tabs
 * @returns {string}
 */
function serializeListArguments(separator, types, tabs) {
    // Remove `type` argument if the list has no type
    if (types.size === 0) {
        // Remove `separator` argument if the list has no type and separator is whitespace (default)
        if (separator === ' ') {
            return ''
        }
        return `,\n${tabs}'${separator}'`
    }
    return `,\n${tabs}'${separator}',\n${tabs}${serializeTypes(types)}`
}

/**
 * @param {object|object[]} component
 * @param {number} [depth]
 * @returns {string}
 */
function serializeComponentValue(component, depth = 2) {
    if (Array.isArray(component)) {
        const { type, separator } = component
        const tabs = tab(depth + 1)
        const childTabs = tab(depth + 2)
        const createListOptionalArguments = serializeListArguments(separator, type, tabs)
        return component
            .reduce(
                (string, component) =>
                    `${string}${childTabs}${serializeComponentValue(component, depth + 2)},\n`,
                `createList(\n${tabs}[\n`)
            .concat(`${tabs}]${createListOptionalArguments},\n${tab(depth)})`)
    }
    const { name, omitted, type, value } = component
    const types = serializeTypes(type)
    if (omitted) {
        return `{ omitted: true, type: ${types} }`
    }
    if (typeof value === 'object') {
        const tabs = tab(depth + 1)
        return `{\n${tabs}name: '${name}',\n${tabs}type: ${types},\n${tabs}value: ${serializeComponentValue(value, depth + 2)},\n${tab(depth)}}`
    }
    if (typeof value === 'number') {
        return `{ type: ${types}, value: ${value} }`
    }
    return `{ type: ${types}, value: ${addQuotes(value)} }`
}

/**
 * @param {string} property
 * @param {string} definition
 * @param {string} value
 * @returns {string}
 */
function getInitialValue(property, value) {
    const parsed = parseValue(value, property)
    if (parsed === null) {
        console.error(`Parse error: can not parse initial value "${value}" of property "${property}"`)
        return ''
    }
    return serializeComponentValue(parsed)
}

/**
 * @param {*[]} entries
 * @param {string} [property]
 * @returns {string}
 */
function serialize(entries, property) {
    return Object.entries(entries).reduce((string, [key, value]) => {
        if (property) {
            if (key === 'initial') {
                value = getInitialValue(property, value)
            } else {
                value = addQuotes(value)
            }
            return `${string}${tab(2)}${key}: ${value},\n`
        }
        const tabs = tab(1)
        return `${string}${tabs}${addQuotes(key)}: {\n${serialize(value, key)}${tabs}},\n`
    }, '')
}

fs.writeFile(outputPath, `\n${header}\n\nmodule.exports = {\n${serialize(properties)}}\n`, logError)
