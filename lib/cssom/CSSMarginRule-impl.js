
const CSSMarginDescriptors = require('./CSSMarginDescriptors.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssmarginrule}
 */
class CSSMarginRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this.name = privateData.name
        this.style = CSSMarginDescriptors.createImpl(globalObject, undefined, {
            declarations: this._declarations,
            parentRule: this,
        })
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

module.exports = {
    implementation: CSSMarginRuleImpl,
}
