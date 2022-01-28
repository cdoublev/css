
const properties = require('./definitions.js')

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

const animatable = Object.keys(properties).filter(property => !animationProperties.includes(property))

module.exports = animatable
