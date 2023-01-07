
/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
 */
const keyframe = {
    prelude: '<keyframe-selector>#',
    properties: require('../properties/animatable.js'),
    type: 'keyframe',
    value: '<declaration-list>',
}

module.exports = keyframe
