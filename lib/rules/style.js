
const properties = require('../properties/names.js')

/**
 * @see {@link https://drafts.csswg.org/css-nesting-1/#syntax}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#mixing}
 */
const rules = {
    media: { prelude: '<media-query-list>' },
    style: { prelude: '<relative-selector-list>' },
    supports: { prelude: '<supports-condition>' },
}

Object.values(rules).forEach(rule => {
    rule.cascading = true
    rule.properties = properties
    rule.qualified = 'style'
    rule.rules = rules
    rule.value = '<style-block>'
})

/**
 * @see {@link https://drafts.csswg.org/css-syntax-3/#style-rule}
 */
const style = { ...rules.style, prelude: '<selector-list>' }

module.exports = style
