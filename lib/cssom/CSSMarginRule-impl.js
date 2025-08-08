
import CSSMarginDescriptors from './CSSMarginDescriptors.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { parseBlockContents } from '../parse/parser.js'

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssmarginrule}
 */
export default class CSSMarginRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { name, value } = privateData
        const declarations = parseBlockContents(value, this)[0] ?? []
        this.name = name
        this.style = CSSMarginDescriptors.createImpl(globalObject, undefined, { declarations, parentRule: this })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { name, style: { cssText } } = this
        return cssText
            ? `@${name} { ${cssText} }`
            : `@${name} {}`
    }
}
