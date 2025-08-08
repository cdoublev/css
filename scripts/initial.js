/**
 * This script rewrites property and descriptor definition files by replacing
 * their `initial` value with an object associating:
 *
 *   - `parsed` to the result from parsing `initial`
 *   - `serialized` to the result from serializing `parsed`
 */
import { isFailure, isList, isOmitted } from '../lib/utils/value.js'
import { quote, tab } from '../lib/utils/string.js'
import descriptors from '../lib/descriptors/definitions.js'
import fs from 'node:fs/promises'
import { install } from '../lib/index.js'
import { parseCSSDeclaration } from '../lib/parse/parser.js'
import path from 'node:path'
import properties from '../lib/properties/definitions.js'
import { serializeCSSValue } from '../lib/serialize.js'
import shorthands from '../lib/properties/shorthands.js'

install()

/**
 * @param {string[]} types
 * @returns {string}
 */
function serializeTypes(types) {
    return `[${types.map(quote).join(', ')}]`
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
 * @param {object|object[]} object
 * @param {number} depth
 * @returns {string}
 */
function serializeComponentValue(object, depth) {
    const tabs = tab(depth + 1)
    if (isList(object)) {
        const { types, separator } = object
        const childTabs = tab(depth + 2)
        const listOptionalArguments = serializeListArguments(separator, types, tabs)
        return object
            .reduce(
                (string, object) =>
                    `${string}${childTabs}${serializeComponentValue(object, depth + 2)},\n`,
                `list(\n${tabs}[\n`)
            .concat(`${tabs}]${listOptionalArguments},\n${tab(depth)})`)
    }
    if (isOmitted(object)) {
        return 'omitted'
    }
    return Object.keys(object).sort().reduce(
        (string, key) => {
            let { [key]: value } = object
            if (key === 'types') {
                value = serializeTypes(value)
            } else if (typeof value === 'string') {
                value = quote(value)
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
    if (!value) {
        return [null, '']
    }
    value = parseCSSDeclaration(name, value, false, context)
    if (isFailure(value)) {
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
            string += `${tab(1)}${quote(property)}: {\n`
            if (animate === false || shorthands.get(property)?.flat().every(name => properties[name]?.animate === false)) {
                string += `${tab(2)}animate: false,\n`
            }
            if (group) {
                string += `${tab(2)}group: ${quote(group)},\n`
            }
            if (initial !== undefined) {
                const [parsed, serialized] = getInitialValue(property, initial, '@style', 3)
                string += `${tab(2)}initial: {\n`
                string += `${tab(3)}parsed: ${parsed},\n`
                string += `${tab(3)}serialized: ${quote(serialized)},\n`
                string += `${tab(2)}},\n`
            }
            string += `${tab(2)}value: ${quote(value)},\n`
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
            string += `${tab(1)}${quote(rule)}: {\n`
            Object.entries(definitions).forEach(([descriptor, { initial, type, value }]) => {
                string += `${tab(2)}${quote(descriptor)}: {\n`
                if (initial !== undefined) {
                    const [parsed, serialized] = getInitialValue(descriptor, initial, rule, 4)
                    string += `${tab(3)}initial: {\n`
                    string += `${tab(4)}parsed: ${parsed},\n`
                    string += `${tab(4)}serialized: ${quote(serialized)},\n`
                    string += `${tab(3)}},\n`
                } else if (type) {
                    string += `${tab(3)}type: '${type}',\n`
                }
                string += `${tab(3)}value: ${quote(value)},\n`
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
    const dependency = "import { list, omitted } from '../values/value.js'"
    const header = `\n${dependency}\n\nexport default {\n`
    return Promise.all([
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'descriptors', 'definitions.js'),
            `${header}${serializeDescriptorDefinitions(descriptors)}}\n`),
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'properties', 'definitions.js'),
            `${header}${serializePropertyDefinitions(properties)}}\n`),
    ])
}

try {
    await serializeDefinitions()
} catch (error) {
    console.log('Please report this issue: https://github.com/cdoublev/css/issues/new')
    throw error
}
