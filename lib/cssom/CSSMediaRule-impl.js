
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl.js')
const MediaList = require('./MediaList.js')
const { serializeCSSComponentValueList } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssmediarule}
 */
class CSSMediaRuleImpl extends CSSConditionRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude } = privateData
        this.media = MediaList.create(globalObject)
        this.media.mediaText = serializeCSSComponentValueList(prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssrule-csstext}
     * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-rule}
     */
    get cssText() {
        const { _rules, media: { mediaText } } = this
        const rules = _rules.map(({ cssText }) => cssText).join('\n  ')
        if (rules) {
            return `@media ${mediaText} {\n  ${rules}\n}`
        }
        return `@media ${mediaText} {}`
    }

    /**
     * @returns {string}
     */
    get conditionText() {
        return this.media.mediaText
    }

    /**
     * @param {string} text
     */
    set conditionText(text) {
        this.media.mediaText = text
    }
}

module.exports = {
    implementation: CSSMediaRuleImpl,
}
