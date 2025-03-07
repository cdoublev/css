/**
 * This script generates the Web IDL definitions of the interfaces inheriting
 * from CSSStyleDeclaration:
 *
 *   - ./lib/cssom/CSSFontFaceDescriptors.webidl
 *   - ./lib/cssom/CSSFunctionDescriptors.webidl
 *   - ./lib/cssom/CSSKeyframeProperties.webidl
 *   - ./lib/cssom/CSSMarginDescriptors.webidl
 *   - ./lib/cssom/CSSPageDescriptors.webidl
 *   - ./lib/cssom/CSSPositionTryDescriptors.webidl
 *   - ./lib/cssom/CSSStyleProperties.webidl
 *
 * Then it generates the wrapper classes from all lib/cssom/*.webidl.
 */
const { cssPropertyToIDLAttribute, tab } = require('../lib/utils/string.js')
const Transformer = require('webidl2js')
const compatibility = require('../lib/compatibility.js')
const fs = require('node:fs/promises')
const path = require('node:path')
const { rules } = require('../lib/rules/definitions.js')

const targetDir = path.join(__dirname, '..', 'lib', 'cssom')

const fontFaceRule = rules.find(rule => rule.name === '@font-face')
const functionRule = rules.find(rule => rule.name === '@function')
const keyframeRule = rules.find(rule => rule.name === '@keyframes').value.rules.find(rule => rule.name === '@keyframe')
const pageRule = rules.find(rule => rule.name === '@page')
const marginRule = pageRule.value.rules.find(rule => rule.name === '@margin')
const styleRule = rules.find(rule => rule.name === '@style')
const positionTryRule = rules.find(rule => rule.name === '@position-try')

const definitions = [
    {
        name: 'CSSFontFaceDescriptors',
        link: 'https://drafts.csswg.org/css-fonts-4/#cssfontfacedescriptors',
        rule: fontFaceRule,
    },
    {
        link: 'https://drafts.csswg.org/css-mixins-1/#cssfunctiondescriptors',
        name: 'CSSFunctionDescriptors',
        rule: functionRule,
    },
    {
        name: 'CSSKeyframeProperties',
        rule: keyframeRule,
    },
    {
        link: 'https://github.com/w3c/csswg-drafts/issues/10106',
        name: 'CSSMarginDescriptors',
        rule: marginRule,
    },
    {
        name: 'CSSPageDescriptors',
        link: 'https://drafts.csswg.org/cssom-1/#csspagedescriptors',
        rule: pageRule,
    },
    {
        name: 'CSSPositionTryDescriptors',
        link: 'https://drafts.csswg.org/css-anchor-position-1/#csspositiontrydescriptors',
        rule: positionTryRule,
    },
    {
        name: 'CSSStyleProperties',
        link: 'https://drafts.csswg.org/cssom-1/#cssstyleproperties',
        rule: styleRule,
    },
]

/**
 * @see {@link https://webidl.spec.whatwg.org/#idl-types}
 *
 * These Web IDL types cannot be used as attribute names, which must otherwise
 * be escaped with `_`, which is unfortunate because attributes must be defined
 * with a type and because the workaround is not documented.
 */
const reserved = [
    'any',
    'bigint',
    'boolean',
    'byte',
    'double',
    'float',
    'long',
    'object',
    'octet',
    'short',
    'symbol',
    'undefined',
]

/**
 * @param {object} definition
 * @returns {Promise}
 * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyleproperties-dashed-attribute}
 * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-camel-cased-attribute}
 * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyleproperties-webkit-cased-attribute}
 */
function createStyleDeclarationChildInterface({ extensions = [], link, name, rule }) {
    let content = ''
    if (link) {
        content += `\n// ${link}\n`
    }
    content += `[Exposed=Window]\ninterface ${name} : CSSStyleDeclaration {\n`
    for (let attribute of getRuleAttributes(rule)) {
        const prelude = [...extensions, `ReflectStyle="${attribute}"`]
        if (attribute.includes('-')) {
            content += `${tab(1)}[${prelude}] attribute [LegacyNullToEmptyString] CSSOMString ${cssPropertyToIDLAttribute(attribute)};\n`
            if (attribute.startsWith('-webkit-')) {
                content += `${tab(1)}[${prelude}] attribute [LegacyNullToEmptyString] CSSOMString ${cssPropertyToIDLAttribute(attribute, true)};\n`
            }
        } else if (reserved.includes(attribute)) {
            attribute = `_${attribute}`
        }
        content += `${tab(1)}[${prelude}] attribute [LegacyNullToEmptyString] CSSOMString ${attribute};\n`
    }
    content += '};\n'
    return fs.writeFile(path.join(targetDir, `${name}.webidl`), content)
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

/**
 * @returns {Promise}
 */
function createInterfaces() {
    const transformer = new Transformer({
        implSuffix: '-impl',
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
    transformer.addSource(targetDir, targetDir)
    return transformer.generate(targetDir)
}

/**
 * @returns {Promise[]}
 */
function createDefinitions() {
    return Promise.all(definitions.map(createStyleDeclarationChildInterface))
}

createDefinitions()
    .then(createInterfaces)
    .catch(error => {
        console.log('Please report this issue: https://github.com/cdoublev/css/issues/new')
        throw error
    })
