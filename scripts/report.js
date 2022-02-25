
const css = require('@webref/css')
const parseDefinition = require('../lib/parse/definition.js')
const properties = require('../lib/properties/definitions.js')
const structures = require('../lib/values/structures.js')
const terminals = require('../lib/parse/terminals.js')
const types = require('../lib/values/types.js')

const nodeTypes = [
    'function',
    'non-terminal',
    'property',
    'structure',
    'terminal',
]

function parseDefinitionDeep(name, { type, value }) {
    if (Array.isArray(value)) {
        return value.forEach(type => parseDefinitionDeep(name, type))
    }
    if (nodeTypes.includes(type)) {
        if (type === 'function') {
            return tryParseDefinition(name, value)
        }
        if (!(structures.includes(value) || properties[value] || types[value] || terminals[value])) {
            throw Error(`There is no definition for the production type <${value}>`)
        }
    }
}

function tryParseDefinition(name, definition, context = {}) {
    try {
        const ast = parseDefinition(definition)
        if (!context.spec) {
            parseDefinitionDeep(name, ast)
        }
    } catch ({ message }) {
        console.log(`Error while parsing "${name}": ${message}`)
        if (context.spec) {
            console.log(context)
        }
    }
}

/**
 * Test of parsing all property/type `value` or `newValues` from `@webref/css`.
 *
 * Parsing is shallow: the definition values of non-terminal and property types
 * are not expanded.
 */
function testParseAllDefinitionValues() {
    return css.listAll().then(specifications => {
        console.group('Definition errors in @webref/css (shallow parsing)')
        Object.values(specifications).forEach(({ properties, spec, valuespaces }) => {
            Object.entries(properties).forEach(([property, { newValues, value }]) => {
                if (newValues) {
                    value = newValues
                }
                if (value) {
                    const context = { field: newValues ? 'newValues' : 'value', spec, value }
                    tryParseDefinition(property, value, context)
                }
                // Some properties have neither `value` or `newValues`, eg. aliases
            })
            Object.entries(valuespaces).forEach(([type, { value }]) => {
                if (value) {
                    const context = { field: 'value', spec, value }
                    tryParseDefinition(type, value, context)
                }
                // Some types do not have `value`, eg. when written in prose
            })
        })
        console.groupEnd('Definition errors @webref/css (shallow parsing)')
    })
}

testParseAllDefinitionValues()

/**
 * Test of parsing all type values in `lib/values/types.js`.
 *
 * Parsing is deep: the definition values of non-terminal and property types are
 * expanded, or an error is thrown if the expanded definition can not be found,
 * as well as if the parse function of a basic type can not be found.
 */
function testParseTypeDefinition() {
    console.group('Definition errors in lib/values/types.js (deep parsing)')
    Object.entries(types).forEach(([type, definition]) => tryParseDefinition(type, definition))
    console.groupEnd('Definition errors in lib/values/types.js (deep parsing)')
}

testParseTypeDefinition()
