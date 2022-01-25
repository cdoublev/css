
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl')
const { parseCSSRuleList } = require('../parse/syntax.js')

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#at-supports}
 */
const definition = {
    prelude: '<supports-condition>',
    value: {
        rules: ['charset', 'import', 'namespace'], // Black list
        type: 'stylesheet',
    },
}

class CSSSupportsRuleImpl extends CSSConditionRuleImpl {

    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { value } = privateData
        this._rules = parseCSSRuleList(value, definition.value, this)
    }
}

module.exports = {
    definition,
    implementation: CSSSupportsRuleImpl,
}
