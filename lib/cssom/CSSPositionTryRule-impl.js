
const CSSPositionTryDescriptors = require('./CSSPositionTryDescriptors.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { serializeCSSComponentValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-anchor-position-1/#csspositiontryrule}
 */
class CSSPositionTryRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        this.name = serializeCSSComponentValue(prelude)
        this.style = CSSPositionTryDescriptors.createImpl(globalObject, undefined, {
            declarations: value.declarations,
            parentRule: this,
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { name, style: { cssText } } = this
        if (cssText) {
            return `@position-try ${name} { ${cssText} }`
        }
        return `@position-try ${name} {}`
    }
}

module.exports = {
    implementation: CSSPositionTryRuleImpl,
}
