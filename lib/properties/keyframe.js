
import properties from './definitions.js'

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
 */
const excluded = [
    '-webkit-animation',
    '-webkit-animation-delay',
    '-webkit-animation-direction',
    '-webkit-animation-duration',
    '-webkit-animation-fill-mode',
    '-webkit-animation-iteration-count',
    '-webkit-animation-name',
    '-webkit-animation-play-state',
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
const entries = Object.entries(properties).filter(([property]) => !excluded.includes(property))

export default Object.fromEntries(entries)
