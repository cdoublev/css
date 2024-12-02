
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
        const { prelude: [prefix, location] } = privateData
        this.namespaceURI = location.value
        this.prefix = serializeIdentifier(prefix)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { namespaceURI, prefix } = this
        const url = serializeURL({ value: namespaceURI })
        return prefix
            ? `@namespace ${prefix} ${url};`
            : `@namespace ${url};`
    }
}

module.exports = {
    implementation: CSSNamespaceRuleImpl,
}
