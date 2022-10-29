
const properties = require('../properties/names.js')

/**
 * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rule}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#direct-nesting}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#at-ruledef-nest}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nested-conditional-group-rules}
 */
const rules = {
    media: { prelude: '<media-query-list>' },
    nest: { prelude: '<selector-list>' },
    style: { prelude: '<selector-list>' },
    supports: { prelude: '<supports-condition>' },
}

Object.values(rules).forEach(rule => {
    rule.properties = properties
    rule.qualified = 'style'
    rule.rules = rules
    rule.value = '<style-block>'
})

module.exports = rules.style
