
const properties = require('./names.js')

const exclude = [
    'animation',
    'animation-delay',
    'animation-direction',
    'animation-duration',
    'animation-fill-mode',
    'animation-iteration-count',
    'animation-name',
    'animation-play-state',
    'animation-timeline',
]

const keyframeProperties = properties.filter(property => !exclude.includes(property))

module.exports = keyframeProperties
