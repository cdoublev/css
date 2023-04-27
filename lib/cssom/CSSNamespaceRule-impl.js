
const { serializeIdentifier, serializeURL } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssnamespacerule}
 */
class CSSNamespaceRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude: [prefix, { value }] } = privateData
        this.namespaceURI = value
        this.prefix = serializeIdentifier(prefix)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-rule}
     */
    get cssText() {
        const { namespaceURI, prefix } = this
        const url = serializeURL({ value: namespaceURI })
        if (prefix) {
            return `@namespace ${prefix} ${url};`
        }
        return `@namespace ${url};`
    }
}

module.exports = {
    implementation: CSSNamespaceRuleImpl,
}
