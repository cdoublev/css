
import pageProperties from './page.js'
import properties from './definitions.js'

/**
 * @see {@link https://drafts.csswg.org/css-page-3/#page-margin-property}
 */
const included = ['content', 'overflow', 'unicode-bidi', 'vertical-align', 'z-index']
const entries = included.map(name => [name, properties[name]])

export default { ...pageProperties, ...Object.fromEntries(entries) }
