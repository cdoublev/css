
const properties = require('./names.js')

const animationProperties = [
    'animation',
    'animation-delay',
    'animation-direction',
    'animation-duration',
    'animation-fill-mode',
    'animation-iteration-count',
    'animation-name',
    'animation-play-state',
]

module.exports = properties.filter(property => !animationProperties.includes(property))
