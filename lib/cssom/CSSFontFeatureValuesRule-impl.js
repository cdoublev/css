
import { serializeCSSComponentValueList, serializeCSSValue } from '../serialize.js'
import CSSFontFeatureValuesMap from './CSSFontFeatureValuesMap.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { parseBlockContents } from '../parse/parser.js'
import root from '../rules/definitions.js'
import { toIDLAttribute } from '../utils/string.js'

const features = root.value.rules.find(rule => rule.name === '@font-feature-values').value.rules

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontfeaturevaluesrule}
 */
export default class CSSFontFeatureValuesRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { prelude, value } = privateData
        const declarations = []
        const rules = []
        for (const content of parseBlockContents(value, this)) {
            if (Array.isArray(content)) {
                declarations.push(...content)
            } else {
                rules.push(content)
            }
        }
        this.fontFamily = serializeCSSComponentValueList(prelude)
        declarations.forEach(declaration =>
            this[toIDLAttribute(declaration.name)] = serializeCSSValue(declaration))
        features.forEach(({ name }) => {
            const rule = rules.findLast(rule => rule._definition.name === name)
                ?? CSSFontFeatureValuesMap.createImpl(globalObject, args, {
                    name: name.slice(1),
                    parentRule: this,
                    parentStyleSheet,
                })
            this[toIDLAttribute(name.slice(1))] = rule
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
            const { _map } = this[toIDLAttribute(name.slice(1))]
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
