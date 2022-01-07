
const { implementation: CSSConditionRuleImpl } = require('./CSSConditionRule-impl')

class CSSSupportsRuleImpl extends CSSConditionRuleImpl {}

module.exports = {
    implementation: CSSSupportsRuleImpl,
}
