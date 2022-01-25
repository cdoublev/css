
const pageProperties = require('./page.js')

/**
 * @see {@link https://drafts.csswg.org/css-page-3/#page-margin-property}
 */
module.exports = [...pageProperties, 'content', 'overflow', 'unicode-bidi', 'vertical-align', 'z-index']
