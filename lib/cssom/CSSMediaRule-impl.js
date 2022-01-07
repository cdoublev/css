
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl.js')
const MediaList = require('./MediaList.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssmediarule}
 */
class CSSMediaRuleImpl extends CSSConditionRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { component: { prelude } } = privateData
        this.media = MediaList.create(this._globalObject)
        this.media.mediaText = prelude
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
