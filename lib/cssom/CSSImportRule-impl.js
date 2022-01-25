
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade/#at-import}
 */
const definition = {
    prelude: '[<url> | <string>] [supports([<supports-condition> | <declaration>])]? <media-query-list>?',
}

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
        const { prelude } = privateData
        const [{ value: href }, condition] = prelude
        this.href = href
        this._condition = condition
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssimportrule-media}
     */
    get media() {
        return this.styleSheet?.media
    }
}

module.exports = {
    definition,
    implementation: CSSImportRuleImpl,
}
