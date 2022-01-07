
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssimportrule}
 */
class CSSImportRuleImpl extends CSSRuleImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssimportrule-stylesheet}
     */
    styleSheet

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { component: { prelude } } = privateData
        this.href = prelude
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssimportrule-media}
     */
    get media() {
        return this.styleSheet?.media
    }
}

module.exports = {
    implementation: CSSImportRuleImpl,
}
