/**
 * This script generates Web IDL definitions of interfaces inheriting from
 * CSSStyleDeclaration with their attributes for descriptors and properties of
 * the corresponding rule.
 */
const Transformer = require('webidl2js')
const compatibility = require('../lib/compatibility.js')
const { cssPropertyToIDLAttribute } = require('../lib/utils/string.js')
const fs = require('node:fs')
const path = require('node:path')
const { rules } = require('../lib/rules/definitions.js')

const targetDir = path.resolve(__dirname, '../lib/cssom')

const transformer = new Transformer({
    implSuffix: '-impl',
    /**
     * TODO: implement support for `[CEReactions]`
     *
    processCEReactions(code) {
        const preSteps = this.addImport("jsdom/custom-elements.js", "ceReactionsPreSteps");
        const postSteps = this.addImport("jsdom/custom-elements.js", "ceReactionsPostSteps");
        return `
            ${preSteps}(globalObject);
            try {
                ${code}
            } finally {
                ${postSteps}(globalObject);
            }
        `;
    },
    */
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

/**
 * @param {string} name
 * @param {string[]} attributes
 * @param {string[]} [extensions]
 */
function createStyleDeclarationChildInterface(name, attributes, extensions = []) {

    // This should be natively supported by WebIDL2JS's Transformer: https://github.com/jsdom/webidl2js/issues/188
    const stream = fs.createWriteStream(path.resolve(targetDir, `${name}.webidl`))

    stream.write('[Exposed=Window]\n')
    stream.write(`interface ${name} : CSSStyleDeclaration {\n`)
    stream.write('\t// https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-camel_cased_attribute\n')
    for (const attribute of attributes) {
        const camelCasedAttribute = cssPropertyToIDLAttribute(attribute)
        const prelude = [...extensions, `ReflectStyle="${attribute}"`]
        stream.write(`\t[${prelude}] attribute [LegacyNullToEmptyString] CSSOMString _${camelCasedAttribute};\n`)
    }
    stream.write('\t// https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-webkit_cased_attribute\n')
    for (const attribute of attributes.filter(name => name.startsWith('-webkit'))) {
        const webkitCasedAttribute = cssPropertyToIDLAttribute(attribute, true)
        const prelude = [...extensions, `ReflectStyle="${attribute}"`]
        stream.write(`\t[${prelude}] attribute [LegacyNullToEmptyString] CSSOMString _${webkitCasedAttribute};\n`)
    }
    stream.write('\t// https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-dashed_attribute\n')
    for (const attribute of attributes) {
        if (!attribute.includes('-')) continue
        const prelude = [...extensions, `ReflectStyle="${attribute}"`]
        stream.write(`\t[${prelude}] attribute [LegacyNullToEmptyString] CSSOMString ${attribute};\n`)
    }
    stream.end('};\n')

    stream.on('finish', () => {
        transformer.addSource(targetDir, targetDir)
        transformer
            .generate(targetDir)
            .catch(error => {
                throw error
            })
    })
}

/**
 * @param {object} attributes
 * @param {Map} [map]
 * @returns {string[]}
 */
function getCompatibilityNames(attributes, map) {
    return map ? [...map.keys()].filter(name => attributes[map.get(name)]) : []
}

/**
 * @param {object} rule
 * @returns {string[]}
 */
function getRuleAttributes({ name, value: { descriptors, properties } }) {
    const attributes = []
    if (descriptors) {
        const replacements = compatibility.descriptors[name]
        attributes.push(
            ...Object.keys(descriptors).filter(name => !name.includes('*')),
            ...getCompatibilityNames(descriptors, replacements?.aliases),
            ...getCompatibilityNames(descriptors, replacements?.mappings))
    }
    if (properties) {
        const { properties: { aliases, mappings } } = compatibility
        attributes.push(
            ...Object.keys(properties).filter(name => !name.includes('*')),
            ...getCompatibilityNames(properties, aliases),
            ...getCompatibilityNames(properties, mappings))
    }
    return attributes
}

const fontFaceRule = rules.find(rule => rule.name === '@font-face')
const keyframeRule = rules.find(rule => rule.name === '@keyframes').value.rules.find(rule => rule.name === '@keyframe')
const pageRule = rules.find(rule => rule.name === '@page')
const marginRule = pageRule.value.rules.find(rule => rule.name === '@margin')
const styleRule = rules.find(rule => rule.name === '@style')
const positionTryRule = rules.find(rule => rule.name === '@position-try')

createStyleDeclarationChildInterface('CSSFontFaceDescriptors', getRuleAttributes(fontFaceRule))
createStyleDeclarationChildInterface('CSSKeyframeProperties', getRuleAttributes(keyframeRule))
createStyleDeclarationChildInterface('CSSMarginDescriptors', getRuleAttributes(marginRule))
createStyleDeclarationChildInterface('CSSPageDescriptors', getRuleAttributes(pageRule))
createStyleDeclarationChildInterface('CSSPositionTryDescriptors', getRuleAttributes(positionTryRule))
createStyleDeclarationChildInterface('CSSStyleProperties', getRuleAttributes(styleRule), ['CEReactions'])
