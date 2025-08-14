
import CSSPageDescriptors from './CSSPageDescriptors.js'
import CSSRuleImpl from './CSSRule-impl.js'

export default class CSSPageDeclarationsImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this.style = CSSPageDescriptors.createImpl(globalObject, undefined, {
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
