
const pageProperties = require('./page.js')

/**
 * @see {@link https://drafts.csswg.org/css-page-3/#page-margin-property}
 */
const marginProperties = [...pageProperties, 'content', 'overflow', 'unicode-bidi', 'vertical-align', 'z-index']

module.exports = marginProperties
