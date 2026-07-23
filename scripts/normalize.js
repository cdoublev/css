/**
 * This script rewrites property and descriptor definition files by replacing
 * their `value` with the result from a round-trip (parse and serialize) and
 * their `initial` value with an object associating:
 *
 *   - `parsed` to the result of parsing `initial`
 *   - `serialized` to the result of serializing `parsed`
 */
import { isFailure, isList, isOmitted } from '../lib/utils/value.js'
import { quote, tab } from '../lib/utils/string.js'
import { serializeDefinition, serializeValue } from '../lib/serialize.js'
import contextSensitiveTypes from '../lib/values/context-sensitive.js'
import descriptors from '../lib/descriptors/definitions.js'
import fs from 'node:fs/promises'
import { install } from '@cdoublev/css'
import { parseDeclarationValue } from '../lib/parse/parser.js'
import parseDefinition from '../lib/parse/definition.js'
import path from 'node:path'
import properties from '../lib/properties/definitions.js'
import shorthands from '../lib/properties/shorthands.js'
import types from '../lib/values/definitions.js'

install()

/**
 * @param {string[]} types
 * @returns {string}
 */
function serializeValueTypes(types) {
    return `[${types.map(quote).join(', ')}]`
}

/**
 * @param {string} separator
 * @param {string[]} types
 * @param {string} tabs
 * @returns {string}
 */
function serializeListArguments(separator, types, tabs) {
    // Do not serialize an optional argument with its default value
    if (types.length === 0) {
        if (separator === ' ') {
            return ''
        }
        return `,\n${tabs}'${separator}'`
    }
    return `,\n${tabs}'${separator}',\n${tabs}${serializeValueTypes(types)}`
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
                value = serializeValueTypes(value)
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
 * @param {string} value
 * @returns {string}
 */
function serializeValueDefinition(value, depth = 1) {
    switch (typeof value) {
        case 'function':
            return value
        case 'object': {
            value = Object.entries(value).reduce(
                (string, [key, value]) => {
                    if (key === 'value') {
                        value = serializeValueDefinition(value, depth + 1)
                    } else if (typeof value === 'string') {
                        value = quote(value)
                    }
                    return `${string}${tab(depth + 1)}${key}: ${value},\n`
                },
                '')
            return `{\n${value}${tab(depth)}}`
        }
        case 'string':
            return quote(serializeDefinition(parseDefinition(value)))
        default:
            throw RangeError('Unexpected value definition type')
    }
}

/**
 * @param {object} types
 * @returns {string}
 */
function serializeTypes(types) {
    const imports = ["import definitions from './context-sensitive.js'"]
    types = Object.entries(types).reduce(
        (string, [type, value]) => {
            if (contextSensitiveTypes[type]) {
                return string
            }
            return `${string}${tab(1)}${quote(type)}: ${serializeValueDefinition(value)},\n`
        },
        `${tab(1)}...definitions,\n`)

    return `\n${imports.join('\n')}\n\nexport default {\n${types}}\n`
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
    value = parseDeclarationValue(value, name, context)
    if (isFailure(value)) {
        console.error(`Parse error: cannot parse initial value of "${name}"`)
        return ''
    }
    return [serializeComponentValue(value, depth), serializeValue({ name, value })]
}

/**
 * @param {object} properties
 * @returns {string}
 */
function serializeProperties(properties) {
    const imports = ["import { list, omitted } from '../values/value.js'"]
    properties = Object.entries(properties).reduce(
        (string, [property, { animate, group, inherited, initial, value }]) => {
            string += `${tab(1)}${quote(property)}: {\n`
            if (animate === false || shorthands.get(property)?.flat().every(name => properties[name]?.animate === false)) {
                string += `${tab(2)}animate: false,\n`
            }
            if (group) {
                string += `${tab(2)}group: ${quote(group)},\n`
            }
            if (inherited) {
                string += `${tab(2)}inherited: true,\n`
            }
            if (initial !== undefined) {
                const [parsed, serialized] = getInitialValue(property, initial, '@style', 3)
                string += `${tab(2)}initial: {\n`
                string += `${tab(3)}parsed: ${parsed},\n`
                string += `${tab(3)}serialized: ${quote(serialized)},\n`
                string += `${tab(2)}},\n`
            }
            string += `${tab(2)}value: ${serializeValueDefinition(value)},\n`
            string += `${tab(1)}},\n`
            return string
        },
        '')
    return `\n${imports.join('\n')}\n\nexport default {\n${properties}}\n`
}

/**
 * @param {object} descriptors
 * @returns {string}
 */
function serializeDescriptors(descriptors) {
    const imports = ["import { list, omitted } from '../values/value.js'"]
    descriptors = Object.entries(descriptors).reduce(
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
                string += `${tab(3)}value: ${serializeValueDefinition(value)},\n`
                string += `${tab(2)}},\n`
            })
            string += `${tab(1)}},\n`
            return string
        },
        '')
    return `\n${imports.join('\n')}\n\nexport default {\n${descriptors}}\n`
}

try {
    await Promise.all([
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'descriptors', 'definitions.js'),
            serializeDescriptors(descriptors)),
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'properties', 'definitions.js'),
            serializeProperties(properties)),
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'values', 'definitions.js'),
            serializeTypes(types)),
    ])
} catch (error) {
    console.log('Please report this issue: https://github.com/cdoublev/css/issues/new')
    throw error
}
