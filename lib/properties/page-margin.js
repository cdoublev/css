
const pageProperties = require('./page.js')
const properties = require('./definitions.js')

/**
 * @see {@link https://drafts.csswg.org/css-page-3/#page-margin-property}
 */
const included = ['content', 'overflow', 'unicode-bidi', 'vertical-align', 'z-index']
const entries = included.map(name => [name, properties[name]])
const marginProperties = { ...pageProperties, ...Object.fromEntries(entries) }

module.exports = marginProperties
