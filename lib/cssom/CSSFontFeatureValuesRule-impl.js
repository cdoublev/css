
const { serializeCSSComponentValueList, serializeCSSValue } = require('../serialize.js')
const CSSFontFeatureValuesMap = require('./CSSFontFeatureValuesMap.js')
const CSSNestedDeclarations = require('./CSSNestedDeclarations.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { cssPropertyToIDLAttribute } = require('../utils/string.js')
const { parseBlockContents } = require('../parse/parser.js')
const root = require('../rules/definitions.js')

const features = root.rules.find(rule => rule.name === '@font-feature-values').value.rules

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesrule}
 */
class CSSFontFeatureValuesRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { prelude, value } = privateData
        const contents = parseBlockContents(value, this)
        const declarations = Array.isArray(contents[0]) ? contents.shift() : []
        const rules = contents.map(rule => {
            if (Array.isArray(rule)) {
                return CSSNestedDeclarations.createImpl(globalObject, undefined, {
                    declarations,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this.fontFamily = serializeCSSComponentValueList(prelude)
        declarations.forEach(declaration =>
            this[cssPropertyToIDLAttribute(declaration.name)] = serializeCSSValue(declaration))
        features.forEach(({ name }) => {
            const rule = rules.find(rule => rule._definition.name === name)
                ?? CSSFontFeatureValuesMap.createImpl(globalObject, args, {
                    name: name.slice(1),
                    parentRule: this,
                    parentStyleSheet,
                })
            this[cssPropertyToIDLAttribute(name.slice(1))] = rule
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { fontDisplay, fontFamily } = this
        const statements = []
        if (fontDisplay) {
            statements.push(`font-display: ${fontDisplay};`)
        }
        features.forEach(({ name }) => {
            const { _map } = this[cssPropertyToIDLAttribute(name.slice(1))]
            if (0 < _map.size) {
                const declarations = []
                _map.forEach((value, key) => declarations.push(`${key}: ${value.join(' ')}`))
                statements.push(`${name} { ${declarations.join('; ')}; }`)
            }
        })
        return 0 < statements.length
            ? `@font-feature-values ${fontFamily} { ${statements.join(' ')} }`
            : `@font-feature-values ${fontFamily} {}`
    }
}

module.exports = {
    implementation: CSSFontFeatureValuesRuleImpl,
}
