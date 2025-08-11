
import { groupsByProperty } from './groups.js'
import properties from './definitions.js'

/**
 * @see {@link https://drafts.csswg.org/css-anchor-position-1/#accepted-position-try-properties}
 */
const acceptedGroups = ['inset', 'margin', 'self-alignment', 'sizing']
const included = ['position-anchor', 'position-area']

Object.entries(groupsByProperty).forEach(([property, groups]) => {
    if (groups.some(group => acceptedGroups.includes(group))) {
        included.push(property)
    }
})

export default Object.fromEntries(included.map(name => [name, properties[name]]))
