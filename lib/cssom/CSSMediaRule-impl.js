
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl.js')
const MediaList = require('./MediaList.js')
const { parseCSSRuleList } = require('../parse/syntax.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#at-media}
 */
const definition = {
    prelude: '<media-query-list>',
    value: {
        rules: ['charset', 'import', 'namespace'], // Black list
        type: 'stylesheet',
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssmediarule}
 */
class CSSMediaRuleImpl extends CSSConditionRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        this.media = MediaList.create(this._globalObject)
        this.media.mediaText = prelude
        this._rules = parseCSSRuleList(value, definition.value, this)
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
    definition,
    implementation: CSSMediaRuleImpl,
}
