
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl.js')
const CSSRuleList = require('./CSSRuleList.js')
const MediaList = require('./MediaList.js')
const { parseCSSRuleList } = require('../parse/syntax.js')

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
        const { prelude, value } = privateData
        this._rules = parseCSSRuleList(value, this)
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
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
