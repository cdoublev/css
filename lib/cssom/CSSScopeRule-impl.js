
const { implementation: CSSGroupingRule } = require('./CSSGroupingRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-cascade-6/#cssscoperule}
 */
class CSSScopeRuleImpl extends CSSGroupingRule {
    // TODO
}

module.exports = {
    implementation: CSSScopeRuleImpl,
}
