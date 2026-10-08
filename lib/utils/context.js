
import * as compatibility from '../compatibility.js'
import { getRule } from './node.js'
import { serializeIdentifier } from '../serialize.js'
import { toLowerCase } from './string.js'

/**
 * @param {object} context
 * @param {string} name
 * @returns {object|null}
 */
export function getDeclarationDefinition(context, name) {
    const { definition: { name: ruleName, value: { descriptors, properties } } } = getRule({ context })
    if (properties) {
        if (name.startsWith('--')) {
            const definition = properties['--*']
            if (definition) {
                name = serializeIdentifier({ value: name })
                return { name, type: 'declaration', value: definition.value }
            }
            return null
        }
        name = toLowerCase(name)
        name = compatibility.properties.aliases.get(name) ?? name
        const target = compatibility.properties.mappings.get(name)
        const value = properties[target]?.value ?? properties[name]?.value
        if (value) {
            return { name, type: 'declaration', value }
        }
    }
    if (descriptors) {
        if (name.startsWith('--')) {
            const definition = descriptors['--*']
            if (definition) {
                return { name, type: 'declaration', value: definition.value }
            }
            return null
        }
        name = toLowerCase(name)
        name = compatibility.descriptors[ruleName]?.aliases.get(name) ?? name
        const target = compatibility.descriptors[ruleName]?.mappings?.get(name)
        const value = descriptors[target]?.value ?? descriptors[name]?.value ?? descriptors['*']
        if (value) {
            return { name, type: 'declaration', value }
        }
    }
    return null
}

/**
 * @param {object} context
 * @param {string} [name]
 * @returns {object|null}
 */
export function getRuleDefinition({ definition }, name) {
    const { rules } = definition.type === 'rule' ? definition.value : definition
    if (!rules) {
        return null
    }
    if (name) {
        name = `@${toLowerCase(name)}`
        const alias = compatibility.rules.aliases.get(name)
        if (alias) {
            name = alias
        }
        const definitions = rules.filter(rule => rule.name === name || rule.names?.includes(name))
        if (1 < definitions.length) {
            return { type: '|', value: definitions }
        }
        return definitions[0]
    }
    return rules.find(rule => rule.qualified)
}
