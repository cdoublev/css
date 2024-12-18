
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
        this.media = MediaList.createImpl(globalObject)
        this.media.mediaText = serializeCSSComponentValueList(privateData.prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, media: { mediaText } } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        if (mediaText) {
            if (rules) {
                return `@media ${mediaText} { ${rules} }`
            }
            return `@media ${mediaText} {}`
        }
        if (rules) {
            return `@media { ${rules} }`
        }
        return '@media {}'
    }

    /**
     * @returns {string}
     */
    get conditionText() {
        return this.media.mediaText
    }
}

module.exports = {
    implementation: CSSMediaRuleImpl,
}
