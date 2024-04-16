
const { groupsByProperty } = require('./groups.js')

const acceptedGroups = ['inset', 'margin', 'self-alignment', 'sizing']
const positionTryProperties = ['inset-area', 'position-anchor']

Object.entries(groupsByProperty).forEach(([property, groups]) => {
    if (groups.some(group => acceptedGroups.includes(group))) {
        positionTryProperties.push(property)
    }
})

module.exports = positionTryProperties
