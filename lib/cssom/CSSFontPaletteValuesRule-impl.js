
import { serializeComponentValue, serializeValue } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import descriptors from '../descriptors/definitions.js'
import { parseGrammar } from '../parse/parser.js'
import { toIDLAttribute } from '../utils/string.js'

const descriptorNames = Object.keys(descriptors['@font-palette-values'])

/**
 * @see {@link https://drafts.csswg.org/css-fonts-4/#cssfontpalettevaluesrule}
 */
export default class CSSFontPaletteValuesRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { node, prelude } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const declarations = block.value[0] ?? []
        this.name = serializeComponentValue(prelude)
        descriptorNames.forEach(name => {
            const declaration = declarations.find(declaration => declaration.name === name)
            this[toIDLAttribute(name)] = declaration ? serializeValue(declaration) : ''
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const declarations = []
        descriptorNames.forEach(name => {
            const value = this[toIDLAttribute(name)]
            if (value) {
                declarations.push(`${name}: ${value}`)
            }
        })
        return 0 < declarations.length
            ? `@font-palette-values ${this.name} { ${declarations.join('; ')}; }`
            : `@font-palette-values ${this.name} { }`
    }
}
