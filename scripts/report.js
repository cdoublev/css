
const css = require('@webref/css')
const parseDefinition = require('../lib/parse/definition.js')
const properties = require('../lib/properties/definitions.js')
const types = require('../lib/values/types.js')

function parseDefinitionDeep(name, { type, value }) {
    if (Array.isArray(value)) {
        return value.forEach(type => parseDefinitionDeep(name, type))
    }
    if (type === 'function') {
        return tryParseDefinition(name, value)
    }
    if (type === 'property') {
        if (!properties[value]) {
            throw Error(`There is no definition for the property type <${value}>`)
        }
    } else {
        throw Error(`There is no definition for the type <${value}>`)
    }
}

function tryParseDefinition(name, definition, context = {}) {
    try {
        const ast = parseDefinition(definition)
        if (!context.spec) {
            parseDefinitionDeep(name, ast)
        }
    } catch (e) {
        console.log(`Error while parsing "${name}"`)
        if (context.spec) {
            console.log(context)
        }
        console.log(e.message)
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
