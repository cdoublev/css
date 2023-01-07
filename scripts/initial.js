/**
 * This script rewrites ./lib/descriptors/definitions.js and
 * ./lib/properties/definitions.js by replacing `initial` field values with an
 * object associating `parsed` to the result from parsing `initial`, and
 * `serialized` to the result from serializing `parsed`.
 */
const { addQuotes, logError, tab } = require('../lib/utils/script.js')
const { createParser, parseCSSDescriptorValue, parseCSSPropertyValue } = require('../lib/parse/syntax.js')
const descriptors = require('../lib/descriptors/definitions.js')
const fs = require('node:fs/promises')
const path = require('path')
const properties = require('../lib/properties/definitions.js')
const { serializeCSSValue } = require('../lib/serialize.js')

const outputPath = {
    descriptors: path.resolve(__dirname, '../lib/descriptors/definitions.js'),
    properties: path.resolve(__dirname, '../lib/properties/definitions.js'),
}
const dependency = "const { createList } = require('../values/value.js')"
const header = `\n// Generated from ${__filename}\n\n${dependency}\n\nmodule.exports = {\n`

// Initialize Parser with style sheet context
const parentStyleSheet = { type: 'text/css' }
const styleRule = { parentStyleSheet, type: new Set(['style']) }
const parser = createParser(parentStyleSheet)
const { context: styleSheetContext } = parser

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
    // Remove default `type` argument (empty set)
    if (types.size === 0) {
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
 * @param {number} [depth]
 * @returns {string}
 */
function serializeComponentValue(component, depth = 3) {
    const tabs = tab(depth + 1)
    if (Array.isArray(component)) {
        const { type, separator } = component
        const childTabs = tab(depth + 2)
        const createListOptionalArguments = serializeListArguments(separator, type, tabs)
        return component
            .reduce(
                (string, component) =>
                    `${string}${childTabs}${serializeComponentValue(component, depth + 2)},\n`,
                `createList(\n${tabs}[\n`)
            .concat(`${tabs}]${createListOptionalArguments},\n${tab(depth)})`)
    }
    return Object.keys(component).sort().reduce(
        (string, key) => {
            let { [key]: value } = component
            if (key === 'type') {
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
 * @param {string} property
 * @param {string} value
 * @returns {string[]}
 */
function getInitialPropertyValue(name, value) {
    parser.context = parser.context.enter(styleRule, styleSheetContext)
    value = parseCSSPropertyValue(value, name, parser)
    if (value === null) {
        console.error(`Parse error: cannot parse initial value of property "${name}"`)
        return ''
    }
    return [serializeCSSValue({ name, value }), serializeComponentValue(value)]
}

/**
 * @param {object} properties
 * @returns {string}
 */
function serializePropertyDefinitions(properties) {
    return Object.entries(properties).reduce(
        (string, [property, { group, initial, value }]) => {
            string += `${tab(1)}${addQuotes(property)}: {\n`
            if (group) {
                string += `${tab(2)}group: ${addQuotes(group)},\n`
            }
            if (initial) {
                const [serialized, parsed] = getInitialPropertyValue(property, initial)
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
 * @param {string} descriptor
 * @param {string} value
 * @param {string} rule
 * @returns {string[]}
 */
function getInitialDescriptorValue(name, value, rule) {
    rule = rule.slice(1)
    rule = { name: rule, parentStyleSheet, type: new Set([rule]) }
    parser.context = parser.context.enter(rule, parser.context.parent)
    value = parseCSSDescriptorValue(value, name, parser)
    if (value === null) {
        console.error(`Parse error: cannot parse initial value of descriptor "${name}"`)
        return ''
    }
    return [serializeCSSValue({ name, value }), serializeComponentValue(value, 4)]
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
                if (initial) {
                    const [serialized, parsed] = getInitialDescriptorValue(descriptor, initial, rule)
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
    return Promise.all([
        fs.writeFile(outputPath.descriptors, `${header}${serializeDescriptorDefinitions(descriptors)}}\n`),
        fs.writeFile(outputPath.properties, `${header}${serializePropertyDefinitions(properties)}}\n`),
    ])
}

serializeDefinitions().catch(logError)
