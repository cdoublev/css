
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#cssnesteddeclarations}
 */
class CSSNestedDeclarationsImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        // https://github.com/w3c/csswg-drafts/issues/11272
        this.style = CSSStyleDeclaration.create(globalObject, undefined, {
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

module.exports = {
    implementation: CSSNestedDeclarationsImpl,
}
