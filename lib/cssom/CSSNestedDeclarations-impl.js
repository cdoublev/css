
import CSSRuleImpl from './CSSRule-impl.js'
import CSSStyleProperties from './CSSStyleProperties.js'

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssnesteddeclarations}
 */
export default class CSSNestedDeclarationsImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this.style = CSSStyleProperties.createImpl(globalObject, undefined, {
            declarations: privateData.declarations,
            parentRule: this,
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        return this.style.cssText
    }
}
