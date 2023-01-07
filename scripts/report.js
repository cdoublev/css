
const descriptors = require('../lib/descriptors/definitions.js')
const parseDefinition = require('../lib/parse/definition.js')
const properties = require('../lib/properties/definitions.js')
const structures = require('../lib/values/structures.js')
const terminals = require('../lib/parse/terminals.js')
const types = require('../lib/values/definitions.js')
const webref = require('./webref.js')

const definitions = {
    properties: new Map(),
    types: new Map(),
}

function reportDuplicates(definitions) {
    definitions.forEach((entries, name) => {
        if (1 < entries.length) {
            console.group(`Duplicate definitions of ${name}`)
            console.table(entries)
            console.groupEnd(`Duplicate definitions of ${name}`)
        }
    })
}

function registerDefinition(type, name, value, url) {
    const { [type]: entries } = definitions
    if (entries.has(name)) {
        entries.get(name).push([value, url])
    } else {
        entries.set(name, [[value, url]])
    }
}

function parseDefinitionDeep(parent, { name, type, value }, context) {
    switch (type) {
        case ' ':
        case '&&':
        case '||':
        case '|':
            return value.forEach(type => parseDefinitionDeep(parent, type, context))
        case 'function':
        case 'simple-block':
            return tryParseDefinition(parent, value, context)
        case 'optional':
        case 'repeat':
        case 'required':
            return parseDefinitionDeep(parent, value, context)
        case 'non-terminal':
        case 'property':
        case 'structure':
        case 'terminal':
            if (structures.includes(name) || terminals[name] || types[name] || properties[name]) {
                return
            }
            throw Error(`There is no definition of the ${type} production <${name}>`)
        case 'delimiter':
            return
        default:
            throw Error('Unexpected node type')
    }
}

function tryParseDefinition(name, definition, context) {
    try {
        const node = parseDefinition(definition, { useCache: true })
        if (!context) {
            parseDefinitionDeep(name, node, context)
        }
    } catch ({ message }) {
        console.log(`Error while parsing "${name}": ${message}`)
        if (context) {
            console.log(context)
        }
    }
}

/**
 * Test parsing all property and type definitions from @webref/css.
 *
 * It reports syntax errors and duplicate definitions.
 */
function testParseWebrefDefinitions() {
    return webref.listAll().then(specifications => {
        console.group('Errors in @webref/css definitions')
        Object.values(specifications).forEach(({ properties, spec: { url }, values }) => {
            properties.forEach(({ name: property, newValues, value }) => {
                if (newValues) {
                    tryParseDefinition(property, newValues, { newValues, property, url })
                } else if (value) {
                    tryParseDefinition(property, value, { property, url, value })
                    registerDefinition('properties', property, value, url)
                }
                // Some properties (eg. aliases) have neither `newValues`, `value`, `values`
            })
            values.forEach(({ name: type, value }) => {
                if (value) {
                    tryParseDefinition(type, value, { type, url, value })
                    registerDefinition('types', type, value, url)
                }
                // Some types do not have `value`, eg. when written in prose
            })
        })
        reportDuplicates(definitions.properties)
        reportDuplicates(definitions.types)
        console.groupEnd('Errors in @webref/css definitions')
    })
}

/**
 * Test parsing all property, descriptor, and type definitions from w3c/webref,
 * curated in scripts/definitions.js, and used in this library.
 *
 * It reports syntax errors, missing type definitions or parse functions.
 */
function testParseCuratedDefinitions() {
    console.group('Errors in curated definitions')
    Object.entries(descriptors).forEach(([descriptor, definitions]) =>
        Object.values(definitions).forEach(({ value }) => tryParseDefinition(descriptor, value)))
    Object.entries(properties).forEach(([property, { value }]) => tryParseDefinition(property, value))
    Object.entries(types).forEach(([type, definition]) => tryParseDefinition(type, definition))
    console.groupEnd('Errors in curated definitions')
}

testParseWebrefDefinitions()
testParseCuratedDefinitions()
