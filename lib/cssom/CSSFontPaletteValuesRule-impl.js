
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { cssPropertyToIDLAttribute } = require('../utils/string.js')
const descriptors = require('../descriptors/definitions.js')['@font-palette-values']

const descriptorNames = Object.keys(descriptors)

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontpalettevaluesrule}
 */
class CSSFontPaletteValuesRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value: { declarations } } = privateData
        this.name = serializeCSSComponentValue(prelude)
        descriptorNames.forEach(name => {
            const declaration = declarations.find(declaration => declaration.name === name)
            this[cssPropertyToIDLAttribute(name)] = declaration ? serializeCSSValue(declaration) : ''
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const declarations = []
        descriptorNames.forEach(name => {
            const { [cssPropertyToIDLAttribute(name)]: value } = this
            if (value) {
                declarations.push(`${name}: ${value}`)
            }
        })
        return 0 < declarations.length
            ? `@font-palette-values ${this.name} { ${declarations.join('; ')}; }`
            : '@font-palette-values {}'
    }
}

module.exports = {
    implementation: CSSFontPaletteValuesRuleImpl,
}
