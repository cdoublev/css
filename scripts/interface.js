
const Transformer = require('webidl2js')
const { aliases } = require('../lib/properties/compatibility.js')
const { cssPropertyToIDLAttribute } = require('../lib/utils/script.js')
const fs = require('fs')
const path = require('path')

const properties = [
    ...aliases.keys(),
    ...Object.keys(require('../lib/properties/definitions.js')),
]
const webkitProperties = properties.filter(property => property.startsWith('-webkit'))

const targetDir = path.resolve(__dirname, '../lib/cssom')

/*
 * This should be natively supported by WebIDL2JS's Transformer
 * https://github.com/jsdom/webidl2js/issues/188
 */
const stream = fs.createWriteStream(path.resolve(targetDir, 'CSSStyleDeclaration-properties.webidl'))

stream.write(`// autogenerated by scripts/convert-idl.js - ${new Date().toISOString()}\n`)
stream.write('partial interface CSSStyleDeclaration {\n')
stream.write('\t// https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-camel_cased_attribute\n')
for (const property of properties) {
    const camelCasedAttribute = cssPropertyToIDLAttribute(property)
    stream.write(`\t[CEReactions,ReflectStyle="${property}"] attribute [LegacyNullToEmptyString] CSSOMString _${camelCasedAttribute};\n`)
}
stream.write('\t// https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-webkit_cased_attribute\n')
for (const property of webkitProperties) {
    const webkitCasedAttribute = cssPropertyToIDLAttribute(property, true)
    stream.write(`\t[CEReactions,ReflectStyle="${property}"] attribute [LegacyNullToEmptyString] CSSOMString _${webkitCasedAttribute};\n`)
}
stream.write('\t// https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-dashed_attribute\n')
for (const property of properties) {
    if (!property.includes('-')) continue
    stream.write(`\t[CEReactions,ReflectStyle="${property}"] attribute [LegacyNullToEmptyString] CSSOMString ${property};\n`)
}
stream.end('};\n') // semicolon is required by webidl2Js

const transformer = new Transformer({
    implSuffix: '-impl',
    // TODO: Add support for `[CEReactions]`
    processReflect(idl, implName) {
        const reflectStyle = idl.extAttrs.find(extAttr => extAttr.name === 'ReflectStyle')
        if (reflectStyle?.rhs?.type !== 'string') {
            throw new Error(`Internal error: Invalid [ReflectStyle] for attribute ${idl.name}`)
        }
        return {
            get: `return ${implName}.getPropertyValue(${reflectStyle.rhs.value});`,
            set: `${implName}.setProperty(${reflectStyle.rhs.value}, V);`,
        }
    },
})

stream.on('finish', () => {
    transformer.addSource(targetDir, targetDir)
    transformer
        .generate(targetDir)
        .catch(error => {
            throw error
        })
})
