
import CSSPositionTryDescriptors from './CSSPositionTryDescriptors.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { parseBlockContents } from '../parse/parser.js'
import { serializeCSSComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-anchor-position-1/#csspositiontryrule}
 */
export default class CSSPositionTryRuleImpl extends CSSRuleImpl {

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
        this.style = CSSPositionTryDescriptors.createImpl(globalObject, undefined, { declarations, parentRule: this })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { name, style: { cssText } } = this
        return cssText
            ? `@position-try ${name} { ${cssText} }`
            : `@position-try ${name} {}`
    }
}
