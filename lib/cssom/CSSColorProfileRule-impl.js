
import { serializeCSSComponentValue, serializeCSSValue } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import descriptors from '../descriptors/definitions.js'
import { parseBlockContents } from '../parse/parser.js'
import { toIDLAttribute } from '../utils/string.js'

const descriptorNames = Object.keys(descriptors['@color-profile'])

/**
 * @see {@link https://drafts.csswg.org/css-color-5/#csscolorprofilerule}
 */
export default class CSSColorProfileRuleImpl extends CSSRuleImpl {

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
            this[toIDLAttribute(name)] = declaration ? serializeCSSValue(declaration) : ''
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
            ? `@color-profile ${this.name} { ${declarations.join('; ')}; }`
            : `@color-profile ${this.name} {}`
    }
}
