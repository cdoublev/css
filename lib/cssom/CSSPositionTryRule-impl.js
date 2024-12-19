
const CSSPositionTryDescriptors = require('./CSSPositionTryDescriptors.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { parseBlockContents } = require('../parse/parser.js')
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
        const [declarations = []] = parseBlockContents(value, this)
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

module.exports = {
    implementation: CSSPositionTryRuleImpl,
}
