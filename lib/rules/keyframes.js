
/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#at-ruledef-keyframes}
 */
const keyframes = {
    prelude: '<keyframes-name>',
    qualified: 'keyframe',
    rules: { keyframe: require('./keyframe.js') },
    value: '<rule-list>',
}

module.exports = keyframes
