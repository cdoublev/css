
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { cssPropertyToIDLAttribute } = require('../utils/string.js')
const { parseBlockContents } = require('../parse/parser.js')
const descriptors = require('../descriptors/definitions.js')['@color-profile']

const descriptorNames = Object.keys(descriptors)

/**
 * @see {@link https://drafts.csswg.org/css-color-5/#csscolorprofilerule}
 */
class CSSColorProfileRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        const declarations = parseBlockContents(value, this)[0] ?? []
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
            const value = this[cssPropertyToIDLAttribute(name)]
            if (value) {
                declarations.push(`${name}: ${value}`)
            }
        })
        return 0 < declarations.length
            ? `@color-profile ${this.name} { ${declarations.join('; ')}; }`
            : `@color-profile ${this.name} {}`
    }
}

module.exports = {
    implementation: CSSColorProfileRuleImpl,
}
