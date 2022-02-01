
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssnamespacerule}
 */
class CSSNamespaceRuleImpl extends CSSRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude: [prefix, uri] } = privateData
        this.prefix = prefix
        this.namespaceURI = uri
    }
}

module.exports = {
    implementation: CSSNamespaceRuleImpl,
}
