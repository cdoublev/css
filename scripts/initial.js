/**
 * This script rewrites property and descriptor definition files by replacing
 * their `initial` value with an object associating:
 *
 *   - `parsed` to the result from parsing `initial`
 *   - `serialized` to the result from serializing `parsed`
 */
const { addQuotes, logError, tab } = require('../lib/utils/string.js')
const descriptors = require('../lib/descriptors/definitions.js')
const fs = require('node:fs/promises')
const { isOmitted } = require('../lib/utils/value.js')
const { parseCSSDeclaration } = require('../lib/parse/parser.js')
const path = require('node:path')
const properties = require('../lib/properties/definitions.js')
const { serializeCSSValue } = require('../lib/serialize.js')
const shorthands = require('../lib/properties/shorthands.js')

/**
 * @param {string[]} types
 * @returns {string}
 */
function serializeTypes(types) {
    return `[${types.map(addQuotes).join(', ')}]`
}

/**
 * @param {string} separator
 * @param {string[]} types
 * @param {string} tabs
 * @returns {string}
 */
function serializeListArguments(separator, types, tabs) {
    // Remove default `types` argument (empty set)
    if (types.length === 0) {
        // Remove default `separator` argument (whitespace)
        if (separator === ' ') {
            return ''
        }
        return `,\n${tabs}'${separator}'`
    }
    return `,\n${tabs}'${separator}',\n${tabs}${serializeTypes(types)}`
}

/**
 * @param {object|object[]} component
 * @param {number} depth
 * @returns {string}
 */
function serializeComponentValue(component, depth) {
    const tabs = tab(depth + 1)
    if (Array.isArray(component)) {
        const { types, separator } = component
        const childTabs = tab(depth + 2)
        const listOptionalArguments = serializeListArguments(separator, types, tabs)
        return component
            .reduce(
                (string, component) =>
                    `${string}${childTabs}${serializeComponentValue(component, depth + 2)},\n`,
                `list(\n${tabs}[\n`)
            .concat(`${tabs}]${listOptionalArguments},\n${tab(depth)})`)
    }
    if (isOmitted(component)) {
        return 'omitted'
    }
    return Object.keys(component).sort().reduce(
        (string, key) => {
            let { [key]: value } = component
            if (key === 'types') {
                value = serializeTypes(value)
            } else if (typeof value === 'string') {
                value = addQuotes(value)
            } else if (typeof value === 'object') {
                value = serializeComponentValue(value, depth + 1)
            }
            return `${string}${tabs}${key}: ${value},\n`
        },
        '{\n')
        .concat(`${tab(depth)}}`)
}

/**
 * @param {string} name
 * @param {string} value
 * @param {object} context
 * @returns {string[]}
 */
function getInitialValue(name, value, context, depth) {
    if (value === null) {
        return [null, '']
    }
    value = parseCSSDeclaration({ name, value }, context)
    if (value === null) {
        console.error(`Parse error: cannot parse initial value of "${name}"`)
        return ''
    }
    ({ value } = value)
    return [serializeComponentValue(value, depth), serializeCSSValue({ name, value })]
}

/**
 * @param {object} properties
 * @returns {string}
 */
function serializePropertyDefinitions(properties) {
    return Object.entries(properties).reduce(
        (string, [property, { animate, group, initial, value }]) => {
            string += `${tab(1)}${addQuotes(property)}: {\n`
            if (animate === false || shorthands.get(property)?.every(name => properties[name]?.animate === false)) {
                string += `${tab(2)}animate: false,\n`
            }
            if (group) {
                string += `${tab(2)}group: ${addQuotes(group)},\n`
            }
            if (initial !== undefined) {
                const [parsed, serialized] = getInitialValue(property, initial, '@style', 3)
                string += `${tab(2)}initial: {\n`
                string += `${tab(3)}parsed: ${parsed},\n`
                string += `${tab(3)}serialized: ${addQuotes(serialized)},\n`
                string += `${tab(2)}},\n`
            }
            string += `${tab(2)}value: ${addQuotes(value)},\n`
            string += `${tab(1)}},\n`
            return string
        },
        '')
}

/**
 * @param {object} descriptors
 * @returns {string}
 */
function serializeDescriptorDefinitions(descriptors) {
    return Object.entries(descriptors).reduce(
        (string, [rule, definitions]) => {
            string += `${tab(1)}${addQuotes(rule)}: {\n`
            Object.entries(definitions).forEach(([descriptor, { initial, type, value }]) => {
                string += `${tab(2)}${addQuotes(descriptor)}: {\n`
                if (initial !== undefined) {
                    const [parsed, serialized] = getInitialValue(descriptor, initial, rule, 4)
                    string += `${tab(3)}initial: {\n`
                    string += `${tab(4)}parsed: ${parsed},\n`
                    string += `${tab(4)}serialized: ${addQuotes(serialized)},\n`
                    string += `${tab(3)}},\n`
                } else if (type) {
                    string += `${tab(3)}type: '${type}',\n`
                }
                string += `${tab(3)}value: ${addQuotes(value)},\n`
                string += `${tab(2)}},\n`
            })
            string += `${tab(1)}},\n`
            return string
        },
        '')
}

/**
 * @returns {Promise}
 */
function serializeDefinitions() {
    const dependency = "const { list, omitted } = require('../values/value.js')"
    const header = `\n${dependency}\n\nmodule.exports = {\n`
    return Promise.all([
        fs.writeFile(
            path.join(__dirname, '..', 'lib', 'descriptors', 'definitions.js'),
            `${header}${serializeDescriptorDefinitions(descriptors)}}\n`),
        fs.writeFile(
            path.join(__dirname, '..', 'lib', 'properties', 'definitions.js'),
            `${header}${serializePropertyDefinitions(properties)}}\n`),
    ])
}

serializeDefinitions().catch(logError)
