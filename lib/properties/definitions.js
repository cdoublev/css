
const { list, omitted } = require('../values/value.js')

module.exports = {
    '--*': {
        initial: {
            parsed: null,
            serialized: '',
        },
        value: '<declaration-value>?',
    },
    '-webkit-line-clamp': {
        value: 'none | <integer [1,∞]>',
    },
    '-webkit-text-fill-color': {
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', '-webkit-text-fill-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    '-webkit-text-stroke': {
        value: '<line-width> || <color>',
    },
    '-webkit-text-stroke-color': {
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', '-webkit-text-stroke-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    '-webkit-text-stroke-width': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<line-width>', '-webkit-text-stroke-width'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<line-width>',
    },
    'accent-color': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'accent-color'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <color>',
    },
    'align-content': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'align-content'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>',
    },
    'align-items': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'align-items'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | stretch | <baseline-position> | <overflow-position>? <self-position> | anchor-center',
    },
    'align-self': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'align-self'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position> | anchor-center',
    },
    'alignment-baseline': {
        initial: {
            parsed: {
                end: 8,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'alignment-baseline'],
                value: 'baseline',
            },
            serialized: 'baseline',
        },
        value: 'baseline | text-bottom | alphabetic | ideographic | middle | central | mathematical | text-top',
    },
    'all': {
        value: 'initial | inherit | unset | revert | revert-layer',
    },
    'anchor-name': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'anchor-name'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <dashed-ident>#',
    },
    'anchor-scope': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'anchor-scope'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | all | <dashed-ident>#',
    },
    'animation': {
        animate: false,
        value: '<single-animation>#',
    },
    'animation-composition': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 7,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-animation-composition>'],
                        value: 'replace',
                    },
                ],
                ',',
                ['animation-composition'],
            ),
            serialized: 'replace',
        },
        value: '<single-animation-composition>#',
    },
    'animation-delay': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 2,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<time>'],
                        unit: 's',
                        value: 0,
                    },
                ],
                ',',
                ['animation-delay'],
            ),
            serialized: '0s',
        },
        value: '<time>#',
    },
    'animation-direction': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-animation-direction>'],
                        value: 'normal',
                    },
                ],
                ',',
                ['animation-direction'],
            ),
            serialized: 'normal',
        },
        value: '<single-animation-direction>#',
    },
    'animation-duration': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                ],
                ',',
                ['animation-duration'],
            ),
            serialized: 'auto',
        },
        value: '[auto | <time [0,∞]>]#',
    },
    'animation-fill-mode': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-animation-fill-mode>'],
                        value: 'none',
                    },
                ],
                ',',
                ['animation-fill-mode'],
            ),
            serialized: 'none',
        },
        value: '<single-animation-fill-mode>#',
    },
    'animation-iteration-count': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 1,
                        start: 0,
                        types: ['<number-token>', '<number>', '<single-animation-iteration-count>'],
                        value: 1,
                    },
                ],
                ',',
                ['animation-iteration-count'],
            ),
            serialized: '1',
        },
        value: '<single-animation-iteration-count>#',
    },
    'animation-name': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ',',
                ['animation-name'],
            ),
            serialized: 'none',
        },
        value: '[none | <keyframes-name>]#',
    },
    'animation-play-state': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 7,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-animation-play-state>'],
                        value: 'running',
                    },
                ],
                ',',
                ['animation-play-state'],
            ),
            serialized: 'running',
        },
        value: '<single-animation-play-state>#',
    },
    'animation-range': {
        animate: false,
        value: "[<'animation-range-start'> <'animation-range-end'>?]#",
    },
    'animation-range-end': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'normal',
                    },
                ],
                ',',
                ['animation-range-end'],
            ),
            serialized: 'normal',
        },
        value: '[normal | <length-percentage> | <timeline-range-name> <length-percentage>?]#',
    },
    'animation-range-start': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'normal',
                    },
                ],
                ',',
                ['animation-range-start'],
            ),
            serialized: 'normal',
        },
        value: '[normal | <length-percentage> | <timeline-range-name> <length-percentage>?]#',
    },
    'animation-timeline': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-animation-timeline>'],
                        value: 'auto',
                    },
                ],
                ',',
                ['animation-timeline'],
            ),
            serialized: 'auto',
        },
        value: '<single-animation-timeline>#',
    },
    'animation-timing-function': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<cubic-bezier-easing-function>', '<easing-function>'],
                        value: 'ease',
                    },
                ],
                ',',
                ['animation-timing-function'],
            ),
            serialized: 'ease',
        },
        value: '<easing-function>#',
    },
    'animation-trigger': {
        animate: false,
        value: '<single-animation-trigger>#',
    },
    'animation-trigger-behavior': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-animation-trigger-behavior>'],
                        value: 'once',
                    },
                ],
                ',',
                ['animation-trigger-behavior'],
            ),
            serialized: 'once',
        },
        value: '<single-animation-trigger-behavior>#',
    },
    'animation-trigger-exit-range': {
        animate: false,
        value: "[<'animation-trigger-exit-range-start'> <'animation-trigger-exit-range-end'>?]#",
    },
    'animation-trigger-exit-range-end': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                ],
                ',',
                ['animation-trigger-exit-range-end'],
            ),
            serialized: 'auto',
        },
        value: '[auto | normal | <length-percentage> | <timeline-range-name> <length-percentage>?]#',
    },
    'animation-trigger-exit-range-start': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                ],
                ',',
                ['animation-trigger-exit-range-start'],
            ),
            serialized: 'auto',
        },
        value: '[auto | normal | <length-percentage> | <timeline-range-name> <length-percentage>?]#',
    },
    'animation-trigger-range': {
        animate: false,
        value: "[<'animation-trigger-range-start'> <'animation-trigger-range-end'>?]#",
    },
    'animation-trigger-range-end': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'normal',
                    },
                ],
                ',',
                ['animation-trigger-range-end'],
            ),
            serialized: 'normal',
        },
        value: '[normal | <length-percentage> | <timeline-range-name> <length-percentage>?]#',
    },
    'animation-trigger-range-start': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'normal',
                    },
                ],
                ',',
                ['animation-trigger-range-start'],
            ),
            serialized: 'normal',
        },
        value: '[normal | <length-percentage> | <timeline-range-name> <length-percentage>?]#',
    },
    'animation-trigger-timeline': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-animation-timeline>'],
                        value: 'auto',
                    },
                ],
                ',',
                ['animation-trigger-timeline'],
            ),
            serialized: 'auto',
        },
        value: '<single-animation-timeline>#',
    },
    'appearance': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'appearance'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | auto | base | <compat-auto> | <compat-special>',
    },
    'aspect-ratio': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                    omitted,
                ],
                ' ',
                ['aspect-ratio'],
            ),
            serialized: 'auto',
        },
        value: 'auto || <ratio>',
    },
    'backdrop-filter': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'backdrop-filter'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <filter-value-list>',
    },
    'backface-visibility': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'backface-visibility'],
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden',
    },
    'background': {
        value: '<bg-layer>#? , <final-bg-layer>',
    },
    'background-attachment': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<attachment>'],
                        value: 'scroll',
                    },
                ],
                ',',
                ['background-attachment'],
            ),
            serialized: 'scroll',
        },
        value: '<attachment>#',
    },
    'background-blend-mode': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<blend-mode>', "<'mix-blend-mode'>"],
                        value: 'normal',
                    },
                ],
                ',',
                ['background-blend-mode'],
            ),
            serialized: 'normal',
        },
        value: "<'mix-blend-mode'>#",
    },
    'background-clip': {
        initial: {
            parsed: list(
                [
                    {
                        end: 10,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<visual-box>', '<bg-clip>'],
                        value: 'border-box',
                    },
                ],
                ',',
                ['background-clip'],
            ),
            serialized: 'border-box',
        },
        value: '<bg-clip>#',
    },
    'background-color': {
        initial: {
            parsed: {
                end: 11,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color-base>', '<color>', 'background-color'],
                value: 'transparent',
            },
            serialized: 'transparent',
        },
        value: '<color>',
    },
    'background-image': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<bg-image>'],
                        value: 'none',
                    },
                ],
                ',',
                ['background-image'],
            ),
            serialized: 'none',
        },
        value: '<bg-image>#',
    },
    'background-origin': {
        initial: {
            parsed: list(
                [
                    {
                        end: 11,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<visual-box>'],
                        value: 'padding-box',
                    },
                ],
                ',',
                ['background-origin'],
            ),
            serialized: 'padding-box',
        },
        value: '<visual-box>#',
    },
    'background-position': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 2,
                                start: 0,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                            {
                                end: 5,
                                start: 3,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                        ],
                        ' ',
                        ['<position-two>', '<position>', '<bg-position>'],
                    ),
                ],
                ',',
                ['background-position'],
            ),
            serialized: '0% 0%',
        },
        value: '<bg-position>#',
    },
    'background-position-block': {
        group: 'background-position',
        initial: {
            parsed: list(
                [
                    list(
                        [
                            omitted,
                            {
                                end: 2,
                                start: 0,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                ['background-position-block'],
            ),
            serialized: '0%',
        },
        value: '[center | [[start | end]? <length-percentage>?]!]#',
    },
    'background-position-inline': {
        group: 'background-position',
        initial: {
            parsed: list(
                [
                    list(
                        [
                            omitted,
                            {
                                end: 2,
                                start: 0,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                ['background-position-inline'],
            ),
            serialized: '0%',
        },
        value: '[center | [[start | end]? <length-percentage>?]!]#',
    },
    'background-position-x': {
        group: 'background-position',
        initial: {
            parsed: list(
                [
                    list(
                        [
                            omitted,
                            {
                                end: 2,
                                start: 0,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                ['background-position-x'],
            ),
            serialized: '0%',
        },
        value: '[center | [[left | right | x-start | x-end]? <length-percentage>?]!]#',
    },
    'background-position-y': {
        group: 'background-position',
        initial: {
            parsed: list(
                [
                    list(
                        [
                            omitted,
                            {
                                end: 2,
                                start: 0,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                ['background-position-y'],
            ),
            serialized: '0%',
        },
        value: '[center | [[top | bottom | y-start | y-end]? <length-percentage>?]!]#',
    },
    'background-repeat': {
        value: '<repeat-style>#',
    },
    'background-repeat-block': {
        group: 'background-repeat',
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<repetition>'],
                        value: 'repeat',
                    },
                ],
                ',',
                ['background-repeat-block'],
            ),
            serialized: 'repeat',
        },
        value: '<repetition>#',
    },
    'background-repeat-inline': {
        group: 'background-repeat',
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<repetition>'],
                        value: 'repeat',
                    },
                ],
                ',',
                ['background-repeat-inline'],
            ),
            serialized: 'repeat',
        },
        value: '<repetition>#',
    },
    'background-repeat-x': {
        group: 'background-repeat',
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<repetition>'],
                        value: 'repeat',
                    },
                ],
                ',',
                ['background-repeat-x'],
            ),
            serialized: 'repeat',
        },
        value: '<repetition>#',
    },
    'background-repeat-y': {
        group: 'background-repeat',
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<repetition>'],
                        value: 'repeat',
                    },
                ],
                ',',
                ['background-repeat-y'],
            ),
            serialized: 'repeat',
        },
        value: '<repetition>#',
    },
    'background-size': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 4,
                                start: 0,
                                types: ['<ident-token>', '<ident>', '<keyword>'],
                                value: 'auto',
                            },
                        ],
                        ' ',
                        ['<bg-size>'],
                    ),
                ],
                ',',
                ['background-size'],
            ),
            serialized: 'auto',
        },
        value: '<bg-size>#',
    },
    'baseline-shift': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'baseline-shift'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | sub | super | top | center | bottom',
    },
    'baseline-source': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'baseline-source'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | first | last',
    },
    'block-ellipsis': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'block-ellipsis'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | auto | <string>',
    },
    'block-size': {
        group: 'size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', "<'width'>", 'block-size'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: "<'width'>",
    },
    'block-step': {
        value: "<'block-step-size'> || <'block-step-insert'> || <'block-step-align'> || <'block-step-round'>",
    },
    'block-step-align': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'block-step-align'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | center | start | end',
    },
    'block-step-insert': {
        initial: {
            parsed: {
                end: 10,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'block-step-insert'],
                value: 'margin-box',
            },
            serialized: 'margin-box',
        },
        value: 'margin-box | padding-box | content-box',
    },
    'block-step-round': {
        initial: {
            parsed: {
                end: 2,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'block-step-round'],
                value: 'up',
            },
            serialized: 'up',
        },
        value: 'up | down | nearest',
    },
    'block-step-size': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'block-step-size'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length [0,∞]>',
    },
    'bookmark-label': {
        initial: {
            parsed: list(
                [
                    {
                        end: 13,
                        name: 'content',
                        start: 0,
                        types: ['<function>', '<content()>'],
                        value: {
                            end: 12,
                            start: 8,
                            types: ['<ident-token>', '<ident>', '<keyword>'],
                            value: 'text',
                        },
                    },
                ],
                ' ',
                ['<content-list>', 'bookmark-label'],
            ),
            serialized: 'content()',
        },
        value: '<content-list>',
    },
    'bookmark-level': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'bookmark-level'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <integer [1,∞]>',
    },
    'bookmark-state': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'bookmark-state'],
                value: 'open',
            },
            serialized: 'open',
        },
        value: 'open | closed',
    },
    'border': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-block': {
        value: "<'border-block-start'>",
    },
    'border-block-color': {
        value: "<'border-top-color'>{1,2}",
    },
    'border-block-end': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-block-end-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-block-end-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-block-end-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-block-end-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-block-end-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-block-end-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-block-end-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-block-start': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-block-start-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-block-start-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-block-start-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-block-start-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-block-start-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-block-start-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-block-start-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-block-style': {
        value: "<'border-top-style'>{1,2}",
    },
    'border-block-width': {
        value: "<'border-top-width'>{1,2}",
    },
    'border-bottom': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-bottom-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-bottom-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-bottom-left-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-bottom-left-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-bottom-right-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-bottom-right-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-bottom-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-bottom-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-bottom-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-boundary': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-boundary'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | parent | display',
    },
    'border-clip': {
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-bottom': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-clip-bottom'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-left': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-clip-left'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-right': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-clip-right'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-top': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-clip-top'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-collapse': {
        initial: {
            parsed: {
                end: 8,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-collapse'],
                value: 'separate',
            },
            serialized: 'separate',
        },
        value: 'separate | collapse',
    },
    'border-color': {
        value: '[<color> | <image-1D>]{1,4}',
    },
    'border-end-end-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-end-end-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-end-start-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-end-start-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-image': {
        value: "<'border-image-source'> || <'border-image-slice'> [/ <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'>]? || <'border-image-repeat'>",
    },
    'border-image-outset': {
        initial: {
            parsed: list(
                [
                    {
                        end: 1,
                        start: 0,
                        types: ['<number-token>', '<number>'],
                        value: 0,
                    },
                ],
                ' ',
                ['border-image-outset'],
            ),
            serialized: '0',
        },
        value: '[<length [0,∞]> | <number [0,∞]>]{1,4}',
    },
    'border-image-repeat': {
        initial: {
            parsed: list(
                [
                    {
                        end: 7,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'stretch',
                    },
                ],
                ' ',
                ['border-image-repeat'],
            ),
            serialized: 'stretch',
        },
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'border-image-slice': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 4,
                                start: 0,
                                types: ['<percentage-token>', '<percentage>'],
                                unit: '%',
                                value: 100,
                            },
                        ],
                    ),
                    omitted,
                ],
                ' ',
                ['border-image-slice'],
            ),
            serialized: '100%',
        },
        value: '[<number [0,∞]> | <percentage [0,∞]>]{1,4} && fill?',
    },
    'border-image-source': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-image-source'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <image>',
    },
    'border-image-width': {
        initial: {
            parsed: list(
                [
                    {
                        end: 1,
                        start: 0,
                        types: ['<number-token>', '<number>'],
                        value: 1,
                    },
                ],
                ' ',
                ['border-image-width'],
            ),
            serialized: '1',
        },
        value: '[<length-percentage [0,∞]> | <number [0,∞]> | auto]{1,4}',
    },
    'border-inline': {
        value: "<'border-block-start'>",
    },
    'border-inline-color': {
        value: "<'border-top-color'>{1,2}",
    },
    'border-inline-end': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-inline-end-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-inline-end-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-inline-end-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-inline-end-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-inline-end-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-inline-end-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-inline-end-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-inline-start': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-inline-start-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-inline-start-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-inline-start-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-inline-start-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-inline-start-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-inline-start-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-inline-start-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-inline-style': {
        value: "<'border-top-style'>{1,2}",
    },
    'border-inline-width': {
        value: "<'border-top-width'>{1,2}",
    },
    'border-left': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-left-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-left-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-left-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-left-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-left-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-left-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-left-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-limit': {
        initial: {
            parsed: {
                end: 3,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-limit'],
                value: 'all',
            },
            serialized: 'all',
        },
        value: 'all | [sides | corners] <length-percentage [0,∞]>? | [top | right | bottom | left] <length-percentage [0,∞]>',
    },
    'border-radius': {
        value: '<length-percentage [0,∞]>{1,4} [/ <length-percentage [0,∞]>{1,4}]?',
    },
    'border-right': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-right-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-right-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-right-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-right-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-right-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-right-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-right-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-shape': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'border-shape'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [<basic-shape> <geometry-box>?]{1,2}',
    },
    'border-spacing': {
        initial: {
            parsed: list(
                [
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                    {
                        end: 7,
                        start: 4,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-spacing'],
            ),
            serialized: '0px',
        },
        value: '<length>{1,2}',
    },
    'border-start-end-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-start-end-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-start-start-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-start-start-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-style': {
        value: '<line-style>{1,4}',
    },
    'border-top': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-top-color': {
        group: 'border-color',
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'border-top-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color> | <image-1D>',
    },
    'border-top-left-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-top-left-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-radius': {
        value: '<length-percentage [0,∞]>{1,2} [/ <length-percentage [0,∞]>{1,2}]?',
    },
    'border-top-right-radius': {
        group: 'border-radius',
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['border-top-right-radius'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-style': {
        group: 'border-style',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'border-top-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'border-top-width': {
        group: 'border-width',
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'border-top-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-width': {
        value: '<line-width>{1,4}',
    },
    'bottom': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'bottom'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage> | <anchor()> | <anchor-size()>',
    },
    'box-decoration-break': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'box-decoration-break'],
                value: 'slice',
            },
            serialized: 'slice',
        },
        value: 'slice | clone',
    },
    'box-shadow': {
        value: '<spread-shadow>#',
    },
    'box-shadow-blur': {
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ',',
                ['box-shadow-blur'],
            ),
            serialized: '0px',
        },
        value: '<length [0,∞]>#',
    },
    'box-shadow-color': {
        initial: {
            parsed: list(
                [
                    {
                        end: 12,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<color>'],
                        value: 'currentcolor',
                    },
                ],
                ',',
                ['box-shadow-color'],
            ),
            serialized: 'currentcolor',
        },
        value: '<color>#',
    },
    'box-shadow-offset': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ',',
                ['box-shadow-offset'],
            ),
            serialized: 'none',
        },
        value: '[none | <length>{2}]#',
    },
    'box-shadow-position': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'outset',
                    },
                ],
                ',',
                ['box-shadow-position'],
            ),
            serialized: 'outset',
        },
        value: '[outset | inset]#',
    },
    'box-shadow-spread': {
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ',',
                ['box-shadow-spread'],
            ),
            serialized: '0px',
        },
        value: '<length>#',
    },
    'box-sizing': {
        initial: {
            parsed: {
                end: 11,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'box-sizing'],
                value: 'content-box',
            },
            serialized: 'content-box',
        },
        value: 'content-box | border-box',
    },
    'box-snap': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'box-snap'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | block-start | block-end | center | baseline | last-baseline',
    },
    'break-after': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'break-after'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-before': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'break-before'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-inside': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'break-inside'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | avoid-page | avoid-column | avoid-region',
    },
    'caption-side': {
        initial: {
            parsed: {
                end: 3,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'caption-side'],
                value: 'top',
            },
            serialized: 'top',
        },
        value: 'top | bottom | inline-start | inline-end',
    },
    'caret': {
        value: "<'caret-color'> || <'caret-animation'> || <'caret-shape'>",
    },
    'caret-animation': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'caret-animation'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | manual',
    },
    'caret-color': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'caret-color'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <color>',
    },
    'caret-shape': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'caret-shape'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | bar | block | underscore',
    },
    'clear': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'clear'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both-inline | both-block | both | none',
    },
    'clip': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'clip'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'rect([<length> | auto]{4} | [<length> | auto]#{4}) | auto',
    },
    'clip-path': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'clip-path'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<clip-source> | <basic-shape> || <geometry-box> | none',
    },
    'clip-rule': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'clip-rule'],
                value: 'nonzero',
            },
            serialized: 'nonzero',
        },
        value: 'nonzero | evenodd',
    },
    'color': {
        initial: {
            parsed: {
                end: 10,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<system-color>', '<color>', 'color'],
                value: 'canvastext',
            },
            serialized: 'canvastext',
        },
        value: '<color>',
    },
    'color-adjust': {
        value: "<'print-color-adjust'>",
    },
    'color-interpolation': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'color-interpolation'],
                value: 'srgb',
            },
            serialized: 'srgb',
        },
        value: 'auto | sRGB | linearRGB',
    },
    'color-interpolation-filters': {
        initial: {
            parsed: {
                end: 9,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'color-interpolation-filters'],
                value: 'linearrgb',
            },
            serialized: 'linearrgb',
        },
        value: 'auto | sRGB | linearRGB',
    },
    'color-scheme': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'color-scheme'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [light | dark | <custom-ident>]+ && only?',
    },
    'column-count': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'column-count'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <integer [1,∞]>',
    },
    'column-fill': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'column-fill'],
                value: 'balance',
            },
            serialized: 'balance',
        },
        value: 'auto | balance | balance-all',
    },
    'column-gap': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'column-gap'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage [0,∞]>',
    },
    'column-height': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'column-height'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length [0,∞]>',
    },
    'column-rule': {
        value: "<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>",
    },
    'column-rule-color': {
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'column-rule-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'column-rule-style': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-style>', 'column-rule-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'column-rule-width': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'column-rule-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'column-span': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'column-span'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <integer [1,∞]> | all | auto',
    },
    'column-width': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'column-width'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length [0,∞]> | min-content | max-content | fit-content(<length-percentage>)',
    },
    'column-wrap': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'column-wrap'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | nowrap | wrap',
    },
    'columns': {
        value: "<'column-width'> || <'column-count'> [/ <'column-height'>]?",
    },
    'contain': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'contain'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | strict | content | [size | inline-size] || layout || style || paint',
    },
    'contain-intrinsic-block-size': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ' ',
                ['contain-intrinsic-block-size'],
            ),
            serialized: 'none',
        },
        value: 'auto? [none | <length [0,∞]>]',
    },
    'contain-intrinsic-height': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ' ',
                ['contain-intrinsic-height'],
            ),
            serialized: 'none',
        },
        value: 'auto? [none | <length [0,∞]>]',
    },
    'contain-intrinsic-inline-size': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ' ',
                ['contain-intrinsic-inline-size'],
            ),
            serialized: 'none',
        },
        value: 'auto? [none | <length [0,∞]>]',
    },
    'contain-intrinsic-size': {
        value: '[auto? [none | <length>]]{1,2}',
    },
    'contain-intrinsic-width': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ' ',
                ['contain-intrinsic-width'],
            ),
            serialized: 'none',
        },
        value: 'auto? [none | <length [0,∞]>]',
    },
    'container': {
        animate: false,
        value: "<'container-name'> [/ <'container-type'>]?",
    },
    'container-name': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'container-name'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>+',
    },
    'container-type': {
        animate: false,
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'container-type'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [size | inline-size] || scroll-state',
    },
    'content': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'content'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | none | [<content-replacement> | <content-list>] [/ [<string> | <counter> | <attr()>]+]?',
    },
    'content-visibility': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'content-visibility'],
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | auto | hidden',
    },
    'continue': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'continue'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | discard | collapse | -webkit-legacy | overflow | paginate | fragments',
    },
    'copy-into': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'copy-into'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [<custom-ident> <content-level>]#',
    },
    'corner-block-end-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'corner-block-start-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'corner-bottom-left-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-bottom-left-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-bottom-right-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-bottom-right-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-bottom-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'corner-end-end-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-end-end-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-end-start-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-end-start-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-inline-end-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'corner-inline-start-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'corner-left-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'corner-right-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'corner-shape': {
        value: '<corner-shape-value>{1,4}',
    },
    'corner-start-end-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-start-end-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-start-start-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-start-start-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-top-left-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-top-left-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-top-right-shape': {
        group: 'corner-shape',
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<corner-shape-value>', 'corner-top-right-shape'],
                value: 'round',
            },
            serialized: 'round',
        },
        value: '<corner-shape-value>',
    },
    'corner-top-shape': {
        value: '<corner-shape-value>{1,2}',
    },
    'counter-increment': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'counter-increment'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '[<counter-name> <integer>?]+ | none',
    },
    'counter-reset': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'counter-reset'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '[<counter-name> <integer>? | <reversed-counter-name> <integer>?]+ | none',
    },
    'counter-set': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'counter-set'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '[<counter-name> <integer>?]+ | none',
    },
    'cue': {
        value: "<'cue-before'> <'cue-after'>?",
    },
    'cue-after': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'cue-after'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<uri> <decibel>? | none',
    },
    'cue-before': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'cue-before'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<uri> <decibel>? | none',
    },
    'cursor': {
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                ],
                ' ',
                ['cursor'],
            ),
            serialized: 'auto',
        },
        value: '[[<url> | <url-set>] [<x> <y>]?]#? [auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | grab | grabbing | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out]',
    },
    'cx': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'cx'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'cy': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'cy'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'd': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'd'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | path(<string>)',
    },
    'direction': {
        animate: false,
        initial: {
            parsed: {
                end: 3,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'direction'],
                value: 'ltr',
            },
            serialized: 'ltr',
        },
        value: 'ltr | rtl',
    },
    'display': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<display-outside>'],
                        value: 'inline',
                    },
                    omitted,
                ],
                ' ',
                ['display'],
            ),
            serialized: 'inline',
        },
        value: '<display-outside> || <display-inside> | <display-listitem> | <display-internal> | <display-box> | <display-legacy> | <display-outside> || [<display-inside> | math]',
    },
    'dominant-baseline': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'dominant-baseline'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | text-bottom | alphabetic | ideographic | middle | central | mathematical | hanging | text-top',
    },
    'dynamic-range-limit': {
        initial: {
            parsed: {
                end: 8,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'dynamic-range-limit'],
                value: 'no-limit',
            },
            serialized: 'no-limit',
        },
        value: 'standard | no-limit | constrained | <dynamic-range-limit-mix()>',
    },
    'empty-cells': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'empty-cells'],
                value: 'show',
            },
            serialized: 'show',
        },
        value: 'show | hide',
    },
    'field-sizing': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'field-sizing'],
                value: 'fixed',
            },
            serialized: 'fixed',
        },
        value: 'fixed | content',
    },
    'fill': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<named-color>', '<color-base>', '<color>', '<paint>', 'fill'],
                value: 'black',
            },
            serialized: 'black',
        },
        value: '<paint>',
    },
    'fill-opacity': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', '<opacity-value>', "<'opacity'>", 'fill-opacity'],
                value: 1,
            },
            serialized: '1',
        },
        value: "<'opacity'>",
    },
    'fill-rule': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'fill-rule'],
                value: 'nonzero',
            },
            serialized: 'nonzero',
        },
        value: 'nonzero | evenodd',
    },
    'filter': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'filter'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <filter-value-list>',
    },
    'flex': {
        value: "none | <'flex-grow'> <'flex-shrink'>? || <'flex-basis'>",
    },
    'flex-basis': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', "<'width'>", 'flex-basis'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: "content | <'width'>",
    },
    'flex-direction': {
        initial: {
            parsed: {
                end: 3,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'flex-direction'],
                value: 'row',
            },
            serialized: 'row',
        },
        value: 'row | row-reverse | column | column-reverse',
    },
    'flex-flow': {
        value: "<'flex-direction'> || <'flex-wrap'>",
    },
    'flex-grow': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', 'flex-grow'],
                value: 0,
            },
            serialized: '0',
        },
        value: '<number [0,∞]>',
    },
    'flex-shrink': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', 'flex-shrink'],
                value: 1,
            },
            serialized: '1',
        },
        value: '<number [0,∞]>',
    },
    'flex-wrap': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'flex-wrap'],
                value: 'nowrap',
            },
            serialized: 'nowrap',
        },
        value: 'nowrap | wrap | wrap-reverse',
    },
    'float': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'float'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'block-start | block-end | inline-start | inline-end | snap-block | <snap-block()> | snap-inline | <snap-inline()> | left | right | top | bottom | none | footnote',
    },
    'float-defer': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'float-defer'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<integer> | last | none',
    },
    'float-offset': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'float-offset'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'float-reference': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'float-reference'],
                value: 'inline',
            },
            serialized: 'inline',
        },
        value: 'inline | column | region | page',
    },
    'flood-color': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<named-color>', '<color-base>', '<color>', 'flood-color'],
                value: 'black',
            },
            serialized: 'black',
        },
        value: '<color>',
    },
    'flood-opacity': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', '<opacity-value>', "<'opacity'>", 'flood-opacity'],
                value: 1,
            },
            serialized: '1',
        },
        value: "<'opacity'>",
    },
    'flow-from': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'flow-from'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>',
    },
    'flow-into': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'flow-into'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident> [element | content]?',
    },
    'font': {
        value: "[<'font-style'> || <font-variant-css2> || <'font-weight'> || <font-width-css3>]? <'font-size'> [/ <'line-height'>]? <'font-family'># | <system-family-name>",
    },
    'font-family': {
        initial: {
            parsed: list(
                [
                    {
                        end: 9,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<generic-complete>', '<generic-family>'],
                        value: 'monospace',
                    },
                ],
                ',',
                ['font-family'],
            ),
            serialized: 'monospace',
        },
        value: '[<family-name> | <generic-family>]#',
    },
    'font-feature-settings': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-feature-settings'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <feature-tag-value>#',
    },
    'font-kerning': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-kerning'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | normal | none',
    },
    'font-language-override': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-language-override'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <string>',
    },
    'font-optical-sizing': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-optical-sizing'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-palette': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-palette'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | light | dark | <palette-identifier> | <palette-mix()>',
    },
    'font-size': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<absolute-size>', 'font-size'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<absolute-size> | <relative-size> | <length-percentage [0,∞]> | math',
    },
    'font-size-adjust': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-size-adjust'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [ex-height | cap-height | ch-width | ic-width | ic-height]? [from-font | <number [0,∞]>]',
    },
    'font-style': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-style'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | italic | left | right | oblique <angle [-90deg,90deg]>?',
    },
    'font-synthesis': {
        value: 'none | weight || style || small-caps || position',
    },
    'font-synthesis-position': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-synthesis-position'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-synthesis-small-caps': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-synthesis-small-caps'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-synthesis-style': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-synthesis-style'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | oblique-only',
    },
    'font-synthesis-weight': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-synthesis-weight'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-variant': {
        value: 'normal | none | <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> || [small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps] || stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>) || <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero || <east-asian-variant-values> || <east-asian-width-values> || ruby || [sub | super] || [text | emoji | unicode]',
    },
    'font-variant-alternates': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variant-alternates'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>)',
    },
    'font-variant-caps': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variant-caps'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps',
    },
    'font-variant-east-asian': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variant-east-asian'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <east-asian-variant-values> || <east-asian-width-values> || ruby',
    },
    'font-variant-emoji': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variant-emoji'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | text | emoji | unicode',
    },
    'font-variant-ligatures': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variant-ligatures'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | none | <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values>',
    },
    'font-variant-numeric': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variant-numeric'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero',
    },
    'font-variant-position': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variant-position'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | sub | super',
    },
    'font-variation-settings': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-variation-settings'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<opentype-tag> <number>]#',
    },
    'font-weight': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<font-weight-absolute>', 'font-weight'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: '<font-weight-absolute> | bolder | lighter',
    },
    'font-width': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'font-width'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <percentage [0,∞]> | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded',
    },
    'footnote-display': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'footnote-display'],
                value: 'block',
            },
            serialized: 'block',
        },
        value: 'block | inline | compact',
    },
    'footnote-policy': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'footnote-policy'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | line | block',
    },
    'forced-color-adjust': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'forced-color-adjust'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | preserve-parent-color',
    },
    'gap': {
        value: "<'row-gap'> <'column-gap'>?",
    },
    'glyph-orientation-vertical': {
        animate: false,
        value: 'auto | <angle> | <number>',
    },
    'grid': {
        value: "<'grid-template'> | <'grid-template-rows'> / [auto-flow && dense?] <'grid-auto-columns'>? | [auto-flow && dense?] <'grid-auto-rows'>? / <'grid-template-columns'>",
    },
    'grid-area': {
        value: '<grid-line> [/ <grid-line>]{0,3}',
    },
    'grid-auto-columns': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<track-breadth>', '<track-size>'],
                        value: 'auto',
                    },
                ],
                ' ',
                ['grid-auto-columns'],
            ),
            serialized: 'auto',
        },
        value: '<track-size>+',
    },
    'grid-auto-flow': {
        initial: {
            parsed: list(
                [
                    {
                        end: 3,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'row',
                    },
                    omitted,
                ],
                ' ',
                ['grid-auto-flow'],
            ),
            serialized: 'row',
        },
        value: '[row | column] || dense',
    },
    'grid-auto-rows': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<track-breadth>', '<track-size>'],
                        value: 'auto',
                    },
                ],
                ' ',
                ['grid-auto-rows'],
            ),
            serialized: 'auto',
        },
        value: '<track-size>+',
    },
    'grid-column': {
        value: '<grid-line> [/ <grid-line>]?',
    },
    'grid-column-end': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<grid-line>', 'grid-column-end'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<grid-line>',
    },
    'grid-column-start': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<grid-line>', 'grid-column-start'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<grid-line>',
    },
    'grid-row': {
        value: '<grid-line> [/ <grid-line>]?',
    },
    'grid-row-end': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<grid-line>', 'grid-row-end'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<grid-line>',
    },
    'grid-row-start': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<grid-line>', 'grid-row-start'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<grid-line>',
    },
    'grid-template': {
        value: "none | <'grid-template-rows'> / <'grid-template-columns'> | [<line-names>? <string> <track-size>? <line-names>?]+ [/ <explicit-track-list>]?",
    },
    'grid-template-areas': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'grid-template-areas'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <string>+',
    },
    'grid-template-columns': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'grid-template-columns'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>?',
    },
    'grid-template-rows': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'grid-template-rows'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>?',
    },
    'hanging-punctuation': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'hanging-punctuation'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | first || [force-end | allow-end] || last',
    },
    'height': {
        group: 'size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'height'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | <calc-size()> | <anchor-size()> | stretch | fit-content | contain',
    },
    'hyphenate-character': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'hyphenate-character'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <string>',
    },
    'hyphenate-limit-chars': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                ],
                ' ',
                ['hyphenate-limit-chars'],
            ),
            serialized: 'auto',
        },
        value: '[auto | <integer>]{1,3}',
    },
    'hyphenate-limit-last': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'hyphenate-limit-last'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | always | column | page | spread',
    },
    'hyphenate-limit-lines': {
        initial: {
            parsed: {
                end: 8,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'hyphenate-limit-lines'],
                value: 'no-limit',
            },
            serialized: 'no-limit',
        },
        value: 'no-limit | <integer>',
    },
    'hyphenate-limit-zone': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'hyphenate-limit-zone'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'hyphens': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'hyphens'],
                value: 'manual',
            },
            serialized: 'manual',
        },
        value: 'none | manual | auto',
    },
    'image-orientation': {
        initial: {
            parsed: {
                end: 10,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'image-orientation'],
                value: 'from-image',
            },
            serialized: 'from-image',
        },
        value: 'from-image | none | <angle> || flip',
    },
    'image-rendering': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'image-rendering'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | smooth | high-quality | pixelated | crisp-edges',
    },
    'image-resolution': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            omitted,
                            {
                                end: 5,
                                start: 0,
                                types: ['<dimension-token>', '<dimension>', '<resolution>'],
                                unit: 'dppx',
                                value: 1,
                            },
                        ],
                    ),
                    omitted,
                ],
                ' ',
                ['image-resolution'],
            ),
            serialized: '1dppx',
        },
        value: '[from-image || <resolution>] && snap?',
    },
    'initial-letter': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'initial-letter'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <number [1,∞]> <integer [1,∞]> | <number [1,∞]> && [drop | raise]?',
    },
    'initial-letter-align': {
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 10,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'alphabetic',
                    },
                ],
                ' ',
                ['initial-letter-align'],
            ),
            serialized: 'alphabetic',
        },
        value: '[border-box? [alphabetic | ideographic | hanging | leading]?]!',
    },
    'initial-letter-wrap': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'initial-letter-wrap'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | first | all | grid | <length-percentage>',
    },
    'inline-size': {
        group: 'size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', "<'width'>", 'inline-size'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: "<'width'>",
    },
    'inline-sizing': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'inline-sizing'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | stretch',
    },
    'input-security': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'input-security'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'inset': {
        value: "<'top'>{1,4}",
    },
    'inset-block': {
        value: "<'top'>{1,2}",
    },
    'inset-block-end': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'inset-block-end'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'inset-block-start': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'inset-block-start'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'inset-inline': {
        value: "<'top'>{1,2}",
    },
    'inset-inline-end': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'inset-inline-end'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'inset-inline-start': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'inset-inline-start'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'interactivity': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'interactivity'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | inert',
    },
    'interpolate-size': {
        animate: false,
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'interpolate-size'],
                value: 'numeric-only',
            },
            serialized: 'numeric-only',
        },
        value: 'numeric-only | allow-keywords',
    },
    'isolation': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<isolation-mode>', 'isolation'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<isolation-mode>',
    },
    'justify-content': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'justify-content'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <content-distribution> | <overflow-position>? [<content-position> | left | right]',
    },
    'justify-items': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'justify-items'],
                value: 'legacy',
            },
            serialized: 'legacy',
        },
        value: 'normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right] | legacy | legacy && [left | right | center] | anchor-center',
    },
    'justify-self': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'justify-self'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right] | anchor-center',
    },
    'left': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'left'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage> | <anchor()> | <anchor-size()>',
    },
    'letter-spacing': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'letter-spacing'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage>',
    },
    'lighting-color': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<named-color>', '<color-base>', '<color>', 'lighting-color'],
                value: 'white',
            },
            serialized: 'white',
        },
        value: '<color>',
    },
    'line-break': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'line-break'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | loose | normal | strict | anywhere',
    },
    'line-clamp': {
        value: "none | [<integer [1,∞]> || <'block-ellipsis'>] -webkit-legacy?",
    },
    'line-fit-edge': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'line-fit-edge'],
                value: 'leading',
            },
            serialized: 'leading',
        },
        value: 'leading | <text-edge>',
    },
    'line-grid': {
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'line-grid'],
                value: 'match-parent',
            },
            serialized: 'match-parent',
        },
        value: 'match-parent | create',
    },
    'line-height': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'line-height'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <number [0,∞]> | <length-percentage [0,∞]>',
    },
    'line-height-step': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'line-height-step'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length [0,∞]>',
    },
    'line-padding': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'line-padding'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'line-snap': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'line-snap'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | baseline | contain',
    },
    'link-parameters': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'link-parameters'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <link-param>+',
    },
    'list-style': {
        value: "<'list-style-position'> || <'list-style-image'> || <'list-style-type'>",
    },
    'list-style-image': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'list-style-image'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<image> | none',
    },
    'list-style-position': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'list-style-position'],
                value: 'outside',
            },
            serialized: 'outside',
        },
        value: 'inside | outside',
    },
    'list-style-type': {
        initial: {
            parsed: {
                types: ['<ident-token>', '<ident>', '<keyword>', '<counter-style-name>', '<counter-style>', 'list-style-type'],
                value: 'disc',
            },
            serialized: 'disc',
        },
        value: '<counter-style> | <string> | none',
    },
    'margin': {
        value: "<'margin-top'>{1,4}",
    },
    'margin-block': {
        value: "<'margin-top'>{1,2}",
    },
    'margin-block-end': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'margin-top'>", 'margin-block-end'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'margin-top'>",
    },
    'margin-block-start': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'margin-top'>", 'margin-block-start'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'margin-top'>",
    },
    'margin-bottom': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'margin-bottom'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto | <anchor-size()>',
    },
    'margin-break': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'margin-break'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | keep | discard',
    },
    'margin-inline': {
        value: "<'margin-top'>{1,2}",
    },
    'margin-inline-end': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'margin-top'>", 'margin-inline-end'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'margin-top'>",
    },
    'margin-inline-start': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'margin-top'>", 'margin-inline-start'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'margin-top'>",
    },
    'margin-left': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'margin-left'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto | <anchor-size()>',
    },
    'margin-right': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'margin-right'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto | <anchor-size()>',
    },
    'margin-top': {
        group: 'margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'margin-top'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto | <anchor-size()>',
    },
    'margin-trim': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'margin-trim'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | block || inline | block-start || inline-start || block-end || inline-end',
    },
    'marker': {
        value: 'none | <marker-ref>',
    },
    'marker-end': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'marker-end'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <marker-ref>',
    },
    'marker-mid': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'marker-mid'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <marker-ref>',
    },
    'marker-side': {
        initial: {
            parsed: {
                end: 10,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'marker-side'],
                value: 'match-self',
            },
            serialized: 'match-self',
        },
        value: 'match-self | match-parent',
    },
    'marker-start': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'marker-start'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <marker-ref>',
    },
    'mask': {
        value: '<mask-layer>#',
    },
    'mask-border': {
        value: "<'mask-border-source'> || <'mask-border-slice'> [/ <'mask-border-width'>? [/ <'mask-border-outset'>]?]? || <'mask-border-repeat'> || <'mask-border-mode'>",
    },
    'mask-border-mode': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'mask-border-mode'],
                value: 'alpha',
            },
            serialized: 'alpha',
        },
        value: 'luminance | alpha',
    },
    'mask-border-outset': {
        initial: {
            parsed: list(
                [
                    {
                        end: 1,
                        start: 0,
                        types: ['<number-token>', '<number>'],
                        value: 0,
                    },
                ],
                ' ',
                ['mask-border-outset'],
            ),
            serialized: '0',
        },
        value: '[<length> | <number>]{1,4}',
    },
    'mask-border-repeat': {
        initial: {
            parsed: list(
                [
                    {
                        end: 7,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'stretch',
                    },
                ],
                ' ',
                ['mask-border-repeat'],
            ),
            serialized: 'stretch',
        },
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'mask-border-slice': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 1,
                                start: 0,
                                types: ['<number-token>', '<number>'],
                                value: 0,
                            },
                        ],
                    ),
                    omitted,
                ],
                ' ',
                ['mask-border-slice'],
            ),
            serialized: '0',
        },
        value: '[<number> | <percentage>]{1,4} fill?',
    },
    'mask-border-source': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'mask-border-source'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <image>',
    },
    'mask-border-width': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                ],
                ' ',
                ['mask-border-width'],
            ),
            serialized: 'auto',
        },
        value: '[<length-percentage> | <number> | auto]{1,4}',
    },
    'mask-clip': {
        initial: {
            parsed: list(
                [
                    {
                        end: 10,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<visual-box>', '<paint-box>', '<coord-box>'],
                        value: 'border-box',
                    },
                ],
                ',',
                ['mask-clip'],
            ),
            serialized: 'border-box',
        },
        value: '[<coord-box> | no-clip]#',
    },
    'mask-composite': {
        initial: {
            parsed: list(
                [
                    {
                        end: 3,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<compositing-operator>'],
                        value: 'add',
                    },
                ],
                ',',
                ['mask-composite'],
            ),
            serialized: 'add',
        },
        value: '<compositing-operator>#',
    },
    'mask-image': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<mask-reference>'],
                        value: 'none',
                    },
                ],
                ',',
                ['mask-image'],
            ),
            serialized: 'none',
        },
        value: '<mask-reference>#',
    },
    'mask-mode': {
        initial: {
            parsed: list(
                [
                    {
                        end: 12,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<masking-mode>'],
                        value: 'match-source',
                    },
                ],
                ',',
                ['mask-mode'],
            ),
            serialized: 'match-source',
        },
        value: '<masking-mode>#',
    },
    'mask-origin': {
        initial: {
            parsed: list(
                [
                    {
                        end: 10,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<visual-box>', '<paint-box>', '<coord-box>'],
                        value: 'border-box',
                    },
                ],
                ',',
                ['mask-origin'],
            ),
            serialized: 'border-box',
        },
        value: '<coord-box>#',
    },
    'mask-position': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 2,
                                start: 0,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                            {
                                end: 5,
                                start: 3,
                                types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                                unit: '%',
                                value: 0,
                            },
                        ],
                        ' ',
                        ['<position-two>', '<position>'],
                    ),
                ],
                ',',
                ['mask-position'],
            ),
            serialized: '0% 0%',
        },
        value: '<position>#',
    },
    'mask-repeat': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 6,
                                start: 0,
                                types: ['<ident-token>', '<ident>', '<keyword>', '<repetition>'],
                                value: 'repeat',
                            },
                        ],
                        ' ',
                        ['<repeat-style>'],
                    ),
                ],
                ',',
                ['mask-repeat'],
            ),
            serialized: 'repeat',
        },
        value: '<repeat-style>#',
    },
    'mask-size': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 4,
                                start: 0,
                                types: ['<ident-token>', '<ident>', '<keyword>'],
                                value: 'auto',
                            },
                        ],
                        ' ',
                        ['<bg-size>'],
                    ),
                ],
                ',',
                ['mask-size'],
            ),
            serialized: 'auto',
        },
        value: '<bg-size>#',
    },
    'mask-type': {
        initial: {
            parsed: {
                end: 9,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'mask-type'],
                value: 'luminance',
            },
            serialized: 'luminance',
        },
        value: 'luminance | alpha',
    },
    'math-depth': {
        animate: false,
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<integer>', 'math-depth'],
                value: 0,
            },
            serialized: '0',
        },
        value: 'auto-add | add(<integer>) | <integer>',
    },
    'math-shift': {
        animate: false,
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'math-shift'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | compact',
    },
    'math-style': {
        animate: false,
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'math-style'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | compact',
    },
    'max-block-size': {
        group: 'max-size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', "<'max-width'>", 'max-block-size'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: "<'max-width'>",
    },
    'max-height': {
        group: 'max-size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'max-height'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | <calc-size()> | <anchor-size()> | stretch | fit-content | contain',
    },
    'max-inline-size': {
        group: 'max-size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', "<'max-width'>", 'max-inline-size'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: "<'max-width'>",
    },
    'max-lines': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'max-lines'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <integer [1,∞]>',
    },
    'max-width': {
        group: 'max-size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'max-width'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | <calc-size()> | <anchor-size()> | stretch | fit-content | contain',
    },
    'min-block-size': {
        group: 'min-size',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'min-width'>", 'min-block-size'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'min-width'>",
    },
    'min-height': {
        group: 'min-size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'min-height'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | <calc-size()> | <anchor-size()> | stretch | fit-content | contain',
    },
    'min-inline-size': {
        group: 'min-size',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'min-width'>", 'min-inline-size'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'min-width'>",
    },
    'min-intrinsic-sizing': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'min-intrinsic-sizing'],
                value: 'legacy',
            },
            serialized: 'legacy',
        },
        value: 'legacy | zero-if-scroll || zero-if-extrinsic',
    },
    'min-width': {
        group: 'min-size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'min-width'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | <calc-size()> | <anchor-size()> | stretch | fit-content | contain',
    },
    'mix-blend-mode': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<blend-mode>', 'mix-blend-mode'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: '<blend-mode> | plus-darker | plus-lighter',
    },
    'nav-down': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'nav-down'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-left': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'nav-left'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-right': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'nav-right'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-up': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'nav-up'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'object-fit': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'object-fit'],
                value: 'fill',
            },
            serialized: 'fill',
        },
        value: 'fill | none | [contain | cover] || scale-down',
    },
    'object-position': {
        initial: {
            parsed: list(
                [
                    {
                        end: 3,
                        start: 0,
                        types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                        unit: '%',
                        value: 50,
                    },
                    {
                        end: 7,
                        start: 4,
                        types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                        unit: '%',
                        value: 50,
                    },
                ],
                ' ',
                ['<position-two>', '<position>', 'object-position'],
            ),
            serialized: '50% 50%',
        },
        value: '<position>',
    },
    'object-view-box': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'object-view-box'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <basic-shape-rect>',
    },
    'offset': {
        value: "[<'offset-position'>? [<'offset-path'> [<'offset-distance'> || <'offset-rotate'>]?]?]! [/ <'offset-anchor'>]?",
    },
    'offset-anchor': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'offset-anchor'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <position>',
    },
    'offset-distance': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'offset-distance'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'offset-path': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'offset-path'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <offset-path> || <coord-box>',
    },
    'offset-position': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'offset-position'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | auto | <position>',
    },
    'offset-rotate': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                    omitted,
                ],
                ' ',
                ['offset-rotate'],
            ),
            serialized: 'auto',
        },
        value: '[auto | reverse] || <angle>',
    },
    'opacity': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', '<opacity-value>', 'opacity'],
                value: 1,
            },
            serialized: '1',
        },
        value: '<opacity-value>',
    },
    'order': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<integer>', 'order'],
                value: 0,
            },
            serialized: '0',
        },
        value: '<integer>',
    },
    'orphans': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<integer>', 'orphans'],
                value: 2,
            },
            serialized: '2',
        },
        value: '<integer [1,∞]>',
    },
    'outline': {
        value: "<'outline-width'> || <'outline-style'> || <'outline-color'>",
    },
    'outline-color': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'outline-color'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <color> | <image-1D>',
    },
    'outline-offset': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'outline-offset'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'outline-style': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<outline-line-style>', 'outline-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'auto | <outline-line-style>',
    },
    'outline-width': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<line-width>', 'outline-width'],
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'overflow': {
        value: "<'overflow-block'>{1,2}",
    },
    'overflow-anchor': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overflow-anchor'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'overflow-block': {
        group: 'overflow',
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overflow-block'],
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overflow-clip-margin': {
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-block': {
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-block-end': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-block-end'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-block-start': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-block-start'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-bottom': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-bottom'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-inline': {
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-inline-end': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-inline-end'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-inline-start': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-inline-start'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-left': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-left'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-right': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-right'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-clip-margin-top': {
        group: 'overflow-clip-margin',
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 3,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['overflow-clip-margin-top'],
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-inline': {
        group: 'overflow',
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overflow-inline'],
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overflow-wrap': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overflow-wrap'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | break-word | anywhere',
    },
    'overflow-x': {
        group: 'overflow',
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overflow-x'],
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overflow-y': {
        group: 'overflow',
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overflow-y'],
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overlay': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overlay'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | auto',
    },
    'overscroll-behavior': {
        value: '[contain | none | auto]{1,2}',
    },
    'overscroll-behavior-block': {
        group: 'overscroll-behavior',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overscroll-behavior-block'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-inline': {
        group: 'overscroll-behavior',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overscroll-behavior-inline'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-x': {
        group: 'overscroll-behavior',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overscroll-behavior-x'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-y': {
        group: 'overscroll-behavior',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'overscroll-behavior-y'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'contain | none | auto',
    },
    'padding': {
        value: "<'padding-top'>{1,4}",
    },
    'padding-block': {
        value: "<'padding-top'>{1,2}",
    },
    'padding-block-end': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'padding-top'>", 'padding-block-end'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'padding-top'>",
    },
    'padding-block-start': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'padding-top'>", 'padding-block-start'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'padding-top'>",
    },
    'padding-bottom': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'padding-bottom'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>',
    },
    'padding-inline': {
        value: "<'padding-top'>{1,2}",
    },
    'padding-inline-end': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'padding-top'>", 'padding-inline-end'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'padding-top'>",
    },
    'padding-inline-start': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', "<'padding-top'>", 'padding-inline-start'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: "<'padding-top'>",
    },
    'padding-left': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'padding-left'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>',
    },
    'padding-right': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'padding-right'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>',
    },
    'padding-top': {
        group: 'padding',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'padding-top'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>',
    },
    'page': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'page'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <custom-ident>',
    },
    'page-break-after': {
        value: 'auto | always | avoid | left | right',
    },
    'page-break-before': {
        value: 'auto | always | avoid | left | right',
    },
    'page-break-inside': {
        value: 'avoid | auto',
    },
    'paint-order': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'paint-order'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | fill || stroke || markers',
    },
    'pause': {
        value: "<'pause-before'> <'pause-after'>?",
    },
    'pause-after': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'pause-after'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time [0,∞]> | none | x-weak | weak | medium | strong | x-strong',
    },
    'pause-before': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'pause-before'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time [0,∞]> | none | x-weak | weak | medium | strong | x-strong',
    },
    'perspective': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'perspective'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length [0,∞]>',
    },
    'perspective-origin': {
        initial: {
            parsed: list(
                [
                    {
                        end: 3,
                        start: 0,
                        types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                        unit: '%',
                        value: 50,
                    },
                    {
                        end: 7,
                        start: 4,
                        types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                        unit: '%',
                        value: 50,
                    },
                ],
                ' ',
                ['<position-two>', '<position>', 'perspective-origin'],
            ),
            serialized: '50% 50%',
        },
        value: '<position>',
    },
    'place-content': {
        value: "<'align-content'> <'justify-content'>?",
    },
    'place-items': {
        value: "<'align-items'> <'justify-items'>?",
    },
    'place-self': {
        value: "<'align-self'> <'justify-self'>?",
    },
    'pointer-events': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'pointer-events'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | bounding-box | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | none',
    },
    'position': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'position'],
                value: 'static',
            },
            serialized: 'static',
        },
        value: 'static | relative | absolute | sticky | fixed | <running()>',
    },
    'position-anchor': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'position-anchor'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <anchor-name>',
    },
    'position-area': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'position-area'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <position-area>',
    },
    'position-try': {
        value: "<'position-try-order'>? <'position-try-fallbacks'>",
    },
    'position-try-fallbacks': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'position-try-fallbacks'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: "none | [<dashed-ident> || <try-tactic> | <'position-area'>]#",
    },
    'position-try-order': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'position-try-order'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <try-size>',
    },
    'position-visibility': {
        initial: {
            parsed: list(
                [
                    omitted,
                    {
                        end: 15,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'anchors-visible',
                    },
                    omitted,
                ],
                ' ',
                ['position-visibility'],
            ),
            serialized: 'anchors-visible',
        },
        value: 'always | anchors-valid || anchors-visible || no-overflow',
    },
    'print-color-adjust': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'print-color-adjust'],
                value: 'economy',
            },
            serialized: 'economy',
        },
        value: 'economy | exact',
    },
    'quotes': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'quotes'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | match-parent | [<string> <string>]+',
    },
    'r': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'r'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'reading-flow': {
        animate: false,
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'reading-flow'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | source-order | flex-visual | flex-flow | grid-rows | grid-columns | grid-order',
    },
    'reading-order': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<integer>', 'reading-order'],
                value: 0,
            },
            serialized: '0',
        },
        value: '<integer>',
    },
    'region-fragment': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'region-fragment'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | break',
    },
    'resize': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'resize'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | both | horizontal | vertical | block | inline',
    },
    'rest': {
        value: "<'rest-before'> <'rest-after'>?",
    },
    'rest-after': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'rest-after'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time [0,∞]> | none | x-weak | weak | medium | strong | x-strong',
    },
    'rest-before': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'rest-before'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time [0,∞]> | none | x-weak | weak | medium | strong | x-strong',
    },
    'right': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'right'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage> | <anchor()> | <anchor-size()>',
    },
    'rotate': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'rotate'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <angle> | [x | y | z | <number>{3}] && <angle>',
    },
    'row-gap': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'row-gap'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage [0,∞]>',
    },
    'ruby-align': {
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'ruby-align'],
                value: 'space-around',
            },
            serialized: 'space-around',
        },
        value: 'start | center | space-between | space-around',
    },
    'ruby-merge': {
        initial: {
            parsed: {
                end: 8,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'ruby-merge'],
                value: 'separate',
            },
            serialized: 'separate',
        },
        value: 'separate | merge | auto',
    },
    'ruby-overhang': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'ruby-overhang'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'ruby-position': {
        initial: {
            parsed: list(
                [
                    {
                        end: 9,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'alternate',
                    },
                    omitted,
                ],
                ' ',
                ['ruby-position'],
            ),
            serialized: 'alternate',
        },
        value: 'alternate || [over | under] | inter-character',
    },
    'rx': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'rx'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<length-percentage> | auto',
    },
    'ry': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'ry'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<length-percentage> | auto',
    },
    'scale': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scale'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [<number> | <percentage>]{1,3}',
    },
    'scroll-behavior': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-behavior'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | smooth',
    },
    'scroll-initial-target': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-initial-target'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | nearest',
    },
    'scroll-margin': {
        value: '<length>{1,4}',
    },
    'scroll-margin-block': {
        value: '<length>{1,2}',
    },
    'scroll-margin-block-end': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-block-end'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-margin-block-start': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-block-start'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-margin-bottom': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-bottom'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-margin-inline': {
        value: '<length>{1,2}',
    },
    'scroll-margin-inline-end': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-inline-end'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-margin-inline-start': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-inline-start'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-margin-left': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-left'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-margin-right': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-right'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-margin-top': {
        group: 'scroll-margin',
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', 'scroll-margin-top'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
    },
    'scroll-marker-group': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-marker-group'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | before | after',
    },
    'scroll-padding': {
        value: '[auto | <length-percentage [0,∞]>]{1,4}',
    },
    'scroll-padding-block': {
        value: '[auto | <length-percentage [0,∞]>]{1,2}',
    },
    'scroll-padding-block-end': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-block-end'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-padding-block-start': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-block-start'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-padding-bottom': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-bottom'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-padding-inline': {
        value: '[auto | <length-percentage [0,∞]>]{1,2}',
    },
    'scroll-padding-inline-end': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-inline-end'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-padding-inline-start': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-inline-start'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-padding-left': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-left'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-padding-right': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-right'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-padding-top': {
        group: 'scroll-padding',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-padding-top'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-snap-align': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ' ',
                ['scroll-snap-align'],
            ),
            serialized: 'none',
        },
        value: '[none | start | end | center]{1,2}',
    },
    'scroll-snap-stop': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-snap-stop'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | always',
    },
    'scroll-snap-type': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-snap-type'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [x | y | block | inline | both] [mandatory | proximity]?',
    },
    'scroll-target-group': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scroll-target-group'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | auto',
    },
    'scroll-timeline': {
        animate: false,
        value: "[<'scroll-timeline-name'> <'scroll-timeline-axis'>?]#",
    },
    'scroll-timeline-axis': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 5,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'block',
                    },
                ],
                ',',
                ['scroll-timeline-axis'],
            ),
            serialized: 'block',
        },
        value: '[block | inline | x | y]#',
    },
    'scroll-timeline-name': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ',',
                ['scroll-timeline-name'],
            ),
            serialized: 'none',
        },
        value: '[none | <dashed-ident>]#',
    },
    'scrollbar-color': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scrollbar-color'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <color>{2}',
    },
    'scrollbar-gutter': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scrollbar-gutter'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | stable && both-edges?',
    },
    'scrollbar-width': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'scrollbar-width'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | thin | none',
    },
    'shape-image-threshold': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', '<opacity-value>', 'shape-image-threshold'],
                value: 0,
            },
            serialized: '0',
        },
        value: '<opacity-value>',
    },
    'shape-inside': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'shape-inside'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | outside-shape | <basic-shape> || shape-box | <image> | display',
    },
    'shape-margin': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'shape-margin'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>',
    },
    'shape-outside': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'shape-outside'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <basic-shape> || <shape-box> | <image>',
    },
    'shape-padding': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'shape-padding'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>',
    },
    'shape-rendering': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'shape-rendering'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | optimizeSpeed | crispEdges | geometricPrecision',
    },
    'shape-subtract': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'shape-subtract'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [<basic-shape> | <uri>]+',
    },
    'slider-orientation': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'slider-orientation'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | left-to-right | right-to-left | top-to-bottom | bottom-to-top',
    },
    'spatial-navigation-action': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'spatial-navigation-action'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | focus | scroll',
    },
    'spatial-navigation-contain': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'spatial-navigation-contain'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | contain',
    },
    'spatial-navigation-function': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'spatial-navigation-function'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | grid',
    },
    'speak': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'speak'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | never | always',
    },
    'speak-as': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'speak-as'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | spell-out || digits || [literal-punctuation | no-punctuation]',
    },
    'stop-color': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<named-color>', '<color-base>', '<color>', "<'color'>", 'stop-color'],
                value: 'black',
            },
            serialized: 'black',
        },
        value: "<'color'>",
    },
    'stop-opacity': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', '<opacity-value>', "<'opacity'>", 'stop-opacity'],
                value: 1,
            },
            serialized: '1',
        },
        value: "<'opacity'>",
    },
    'string-set': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'string-set'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '[<custom-ident> <content-list>]# | none',
    },
    'stroke': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<paint>', 'stroke'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<paint>',
    },
    'stroke-dasharray': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'stroke-dasharray'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <dasharray>',
    },
    'stroke-dashoffset': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', 'stroke-dashoffset'],
                value: 0,
            },
            serialized: '0',
        },
        value: '<length-percentage> | <number>',
    },
    'stroke-linecap': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'stroke-linecap'],
                value: 'butt',
            },
            serialized: 'butt',
        },
        value: 'butt | round | square',
    },
    'stroke-linejoin': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'stroke-linejoin'],
                value: 'miter',
            },
            serialized: 'miter',
        },
        value: 'miter | miter-clip | round | bevel | arcs',
    },
    'stroke-miterlimit': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', 'stroke-miterlimit'],
                value: 4,
            },
            serialized: '4',
        },
        value: '<number>',
    },
    'stroke-opacity': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', '<opacity-value>', "<'opacity'>", 'stroke-opacity'],
                value: 1,
            },
            serialized: '1',
        },
        value: "<'opacity'>",
    },
    'stroke-width': {
        initial: {
            parsed: {
                end: 3,
                start: 0,
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'stroke-width'],
                unit: 'px',
                value: 1,
            },
            serialized: '1px',
        },
        value: '<length-percentage> | <number>',
    },
    'tab-size': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<number>', 'tab-size'],
                value: 8,
            },
            serialized: '8',
        },
        value: '<number [0,∞]> | <length [0,∞]>',
    },
    'table-layout': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'table-layout'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | fixed',
    },
    'text-align': {
        value: 'start | end | left | right | center | <string> | justify | match-parent | justify-all',
    },
    'text-align-all': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-align-all'],
                value: 'start',
            },
            serialized: 'start',
        },
        value: 'start | end | left | right | center | <string> | justify | match-parent',
    },
    'text-align-last': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-align-last'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | start | end | left | right | center | justify | match-parent',
    },
    'text-anchor': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-anchor'],
                value: 'start',
            },
            serialized: 'start',
        },
        value: 'start | middle | end',
    },
    'text-autospace': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-autospace'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <autospace> | auto',
    },
    'text-box': {
        value: "normal | <'text-box-trim'> || <'text-box-edge'>",
    },
    'text-box-edge': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-box-edge'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <text-edge>',
    },
    'text-box-trim': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-box-trim'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | trim-start | trim-end | trim-both',
    },
    'text-combine-upright': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-combine-upright'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | all | digits <integer [2,4]>?',
    },
    'text-decoration': {
        value: "<'text-decoration-line'> || <'text-decoration-thickness'> || <'text-decoration-style'> || <'text-decoration-color'>",
    },
    'text-decoration-color': {
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'text-decoration-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'text-decoration-line': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-decoration-line'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | underline || overline || line-through || blink | spelling-error | grammar-error',
    },
    'text-decoration-skip': {
        value: 'none | auto',
    },
    'text-decoration-skip-box': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-decoration-skip-box'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | all',
    },
    'text-decoration-skip-ink': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-decoration-skip-ink'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | all',
    },
    'text-decoration-skip-self': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-decoration-skip-self'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | skip-all | skip-underline || skip-overline || skip-line-through | no-skip',
    },
    'text-decoration-skip-spaces': {
        initial: {
            parsed: list(
                [
                    {
                        end: 5,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'start',
                    },
                    {
                        end: 9,
                        start: 6,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'end',
                    },
                ],
                ' ',
                ['text-decoration-skip-spaces'],
            ),
            serialized: 'start end',
        },
        value: 'none | all | start || end',
    },
    'text-decoration-style': {
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-decoration-style'],
                value: 'solid',
            },
            serialized: 'solid',
        },
        value: 'solid | double | dotted | dashed | wavy',
    },
    'text-decoration-thickness': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-decoration-thickness'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | from-font | <length-percentage>',
    },
    'text-decoration-trim': {
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>'],
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                ['text-decoration-trim'],
            ),
            serialized: '0px',
        },
        value: '<length>{1,2} | auto',
    },
    'text-emphasis': {
        value: "<'text-emphasis-style'> || <'text-emphasis-color'>",
    },
    'text-emphasis-color': {
        initial: {
            parsed: {
                end: 12,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<color>', 'text-emphasis-color'],
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'text-emphasis-position': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'over',
                    },
                    {
                        end: 10,
                        start: 5,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'right',
                    },
                ],
                ' ',
                ['text-emphasis-position'],
            ),
            serialized: 'over',
        },
        value: '[over | under] && [right | left]?',
    },
    'text-emphasis-skip': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'spaces',
                    },
                    {
                        end: 18,
                        start: 7,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'punctuation',
                    },
                    omitted,
                    omitted,
                ],
                ' ',
                ['text-emphasis-skip'],
            ),
            serialized: 'spaces punctuation',
        },
        value: 'spaces || punctuation || symbols || narrow',
    },
    'text-emphasis-style': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-emphasis-style'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [filled | open] || [dot | circle | double-circle | triangle | sesame] | <string>',
    },
    'text-group-align': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-group-align'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | start | end | left | right | center',
    },
    'text-indent': {
        initial: {
            parsed: list(
                [
                    {
                        types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>'],
                        unit: 'px',
                        value: 0,
                    },
                    omitted,
                    omitted,
                ],
                ' ',
                ['text-indent'],
            ),
            serialized: '0px',
        },
        value: '<length-percentage> && hanging? && each-line?',
    },
    'text-justify': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'auto',
                    },
                    omitted,
                ],
                ' ',
                ['text-justify'],
            ),
            serialized: 'auto',
        },
        value: '[auto | none | inter-word | inter-character | ruby] || no-compress',
    },
    'text-orientation': {
        animate: false,
        initial: {
            parsed: {
                end: 5,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-orientation'],
                value: 'mixed',
            },
            serialized: 'mixed',
        },
        value: 'mixed | upright | sideways',
    },
    'text-overflow': {
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'clip',
                    },
                ],
                ' ',
                ['text-overflow'],
            ),
            serialized: 'clip',
        },
        value: '[clip | ellipsis | <string> | fade | <fade()>]{1,2}',
    },
    'text-rendering': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-rendering'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | optimizeSpeed | optimizeLegibility | geometricPrecision',
    },
    'text-shadow': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-shadow'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <shadow>#',
    },
    'text-size-adjust': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-size-adjust'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | <percentage [0,∞]>',
    },
    'text-spacing': {
        value: 'none | auto | <spacing-trim> || <autospace>',
    },
    'text-spacing-trim': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', '<spacing-trim>', 'text-spacing-trim'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: '<spacing-trim> | auto',
    },
    'text-transform': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-transform'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [capitalize | uppercase | lowercase] || full-width || full-size-kana | math-auto',
    },
    'text-underline-offset': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-underline-offset'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'text-underline-position': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-underline-position'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | [from-font | under] || [left | right]',
    },
    'text-wrap': {
        value: "<'text-wrap-mode'> || <'text-wrap-style'>",
    },
    'text-wrap-mode': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-wrap-mode'],
                value: 'wrap',
            },
            serialized: 'wrap',
        },
        value: 'wrap | nowrap',
    },
    'text-wrap-style': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'text-wrap-style'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | balance | stable | pretty | avoid-orphans',
    },
    'timeline-scope': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'timeline-scope'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | all | <dashed-ident>#',
    },
    'top': {
        group: 'inset',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'top'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage> | <anchor()> | <anchor-size()>',
    },
    'touch-action': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'touch-action'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | [pan-x | pan-left | pan-right] || [pan-y | pan-up | pan-down] || pinch-zoom | manipulation',
    },
    'transform': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'transform'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <transform-list>',
    },
    'transform-box': {
        initial: {
            parsed: {
                end: 8,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'transform-box'],
                value: 'view-box',
            },
            serialized: 'view-box',
        },
        value: 'content-box | border-box | fill-box | stroke-box | view-box',
    },
    'transform-origin': {
        initial: {
            parsed: list(
                [
                    {
                        end: 3,
                        start: 0,
                        types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                        unit: '%',
                        value: 50,
                    },
                    {
                        end: 7,
                        start: 4,
                        types: ['<percentage-token>', '<percentage>', '<length-percentage>'],
                        unit: '%',
                        value: 50,
                    },
                    omitted,
                ],
                ' ',
                ['transform-origin'],
            ),
            serialized: '50% 50%',
        },
        value: 'left | center | right | top | bottom | <length-percentage> | [left | center | right | <length-percentage>] [top | center | bottom | <length-percentage>] <length>? | [[center | left | right] && [center | top | bottom]] <length>?',
    },
    'transform-style': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'transform-style'],
                value: 'flat',
            },
            serialized: 'flat',
        },
        value: 'flat | preserve-3d',
    },
    'transition': {
        animate: false,
        value: '<single-transition>#',
    },
    'transition-behavior': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<transition-behavior-value>'],
                        value: 'normal',
                    },
                ],
                ',',
                ['transition-behavior'],
            ),
            serialized: 'normal',
        },
        value: '<transition-behavior-value>#',
    },
    'transition-delay': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 2,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<time>'],
                        unit: 's',
                        value: 0,
                    },
                ],
                ',',
                ['transition-delay'],
            ),
            serialized: '0s',
        },
        value: '<time>#',
    },
    'transition-duration': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 2,
                        start: 0,
                        types: ['<dimension-token>', '<dimension>', '<time>'],
                        unit: 's',
                        value: 0,
                    },
                ],
                ',',
                ['transition-duration'],
            ),
            serialized: '0s',
        },
        value: '<time [0,∞]>#',
    },
    'transition-property': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 3,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<single-transition-property>'],
                        value: 'all',
                    },
                ],
                ',',
                ['transition-property'],
            ),
            serialized: 'all',
        },
        value: '[none | <single-transition-property>]#',
    },
    'transition-timing-function': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>', '<cubic-bezier-easing-function>', '<easing-function>'],
                        value: 'ease',
                    },
                ],
                ',',
                ['transition-timing-function'],
            ),
            serialized: 'ease',
        },
        value: '<easing-function>#',
    },
    'translate': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'translate'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length-percentage> [<length-percentage> <length>?]?',
    },
    'unicode-bidi': {
        animate: false,
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'unicode-bidi'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | embed | isolate | bidi-override | isolate-override | plaintext',
    },
    'user-select': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'user-select'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | text | none | contain | all',
    },
    'vector-effect': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'vector-effect'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | non-scaling-stroke | non-scaling-size | non-rotation | fixed-position',
    },
    'vertical-align': {
        value: "[first | last] || <'alignment-baseline'> || <'baseline-shift'>",
    },
    'view-timeline': {
        value: "[<'view-timeline-name'> [<'view-timeline-axis'> || <'view-timeline-inset'>]?]#",
    },
    'view-timeline-axis': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 5,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'block',
                    },
                ],
                ',',
                ['view-timeline-axis'],
            ),
            serialized: 'block',
        },
        value: '[block | inline | x | y]#',
    },
    'view-timeline-inset': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            {
                                end: 4,
                                start: 0,
                                types: ['<ident-token>', '<ident>', '<keyword>'],
                                value: 'auto',
                            },
                        ],
                    ),
                ],
                ',',
                ['view-timeline-inset'],
            ),
            serialized: 'auto',
        },
        value: '[[auto | <length-percentage>]{1,2}]#',
    },
    'view-timeline-name': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 4,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'none',
                    },
                ],
                ',',
                ['view-timeline-name'],
            ),
            serialized: 'none',
        },
        value: '[none | <dashed-ident>]#',
    },
    'view-transition-class': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'view-transition-class'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>+',
    },
    'view-transition-group': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'view-transition-group'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | contain | nearest | <custom-ident>',
    },
    'view-transition-name': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'view-transition-name'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>',
    },
    'visibility': {
        initial: {
            parsed: {
                end: 7,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'visibility'],
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden | force-hidden | collapse',
    },
    'voice-balance': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'voice-balance'],
                value: 'center',
            },
            serialized: 'center',
        },
        value: '<number> | left | center | right | leftwards | rightwards',
    },
    'voice-duration': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'voice-duration'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <time [0,∞]>',
    },
    'voice-family': {
        initial: {
            parsed: list(
                [
                    list(
                        [
                            omitted,
                            {
                                end: 6,
                                start: 0,
                                types: ['<ident-token>', '<ident>', '<keyword>', '<gender>'],
                                value: 'female',
                            },
                            omitted,
                        ],
                        ' ',
                        ['<generic-voice>'],
                    ),
                ],
                ',',
                ['voice-family'],
            ),
            serialized: 'female',
        },
        value: '[<family-name> | <generic-voice>]# | preserve',
    },
    'voice-pitch': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'medium',
                    },
                    omitted,
                ],
                ' ',
                ['voice-pitch'],
            ),
            serialized: 'medium',
        },
        value: '<frequency [0,∞]> && absolute | [x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]',
    },
    'voice-range': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'medium',
                    },
                    omitted,
                ],
                ' ',
                ['voice-range'],
            ),
            serialized: 'medium',
        },
        value: '<frequency [0,∞]> && absolute | [x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]',
    },
    'voice-rate': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'normal',
                    },
                    omitted,
                ],
                ' ',
                ['voice-rate'],
            ),
            serialized: 'normal',
        },
        value: '[normal | x-slow | slow | medium | fast | x-fast] || <percentage [0,∞]>',
    },
    'voice-stress': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'voice-stress'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | strong | moderate | none | reduced',
    },
    'voice-volume': {
        initial: {
            parsed: list(
                [
                    {
                        end: 6,
                        start: 0,
                        types: ['<ident-token>', '<ident>', '<keyword>'],
                        value: 'medium',
                    },
                    omitted,
                ],
                ' ',
                ['voice-volume'],
            ),
            serialized: 'medium',
        },
        value: 'silent | [x-soft | soft | medium | loud | x-loud] || <decibel>',
    },
    'white-space': {
        value: "normal | pre | pre-wrap | pre-line | <'white-space-collapse'> || <'text-wrap-mode'> || <'white-space-trim'>",
    },
    'white-space-collapse': {
        initial: {
            parsed: {
                end: 8,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'white-space-collapse'],
                value: 'collapse',
            },
            serialized: 'collapse',
        },
        value: 'collapse | discard | preserve | preserve-breaks | preserve-spaces | break-spaces',
    },
    'white-space-trim': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'white-space-trim'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | discard-before || discard-after || discard-inner',
    },
    'widows': {
        initial: {
            parsed: {
                end: 1,
                start: 0,
                types: ['<number-token>', '<integer>', 'widows'],
                value: 2,
            },
            serialized: '2',
        },
        value: '<integer [1,∞]>',
    },
    'width': {
        group: 'size',
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'width'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | <calc-size()> | <anchor-size()> | stretch | fit-content | contain',
    },
    'will-change': {
        animate: false,
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'will-change'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <animateable-feature>#',
    },
    'word-break': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'word-break'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | break-all | keep-all | manual | auto-phrase | break-word',
    },
    'word-space-transform': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'word-space-transform'],
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [space | ideographic-space] && auto-phrase?',
    },
    'word-spacing': {
        initial: {
            parsed: {
                end: 6,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'word-spacing'],
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage>',
    },
    'wrap-after': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'wrap-after'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-before': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'wrap-before'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-flow': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'wrap-flow'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | both | start | end | minimum | maximum | clear',
    },
    'wrap-inside': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'wrap-inside'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid',
    },
    'wrap-through': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'wrap-through'],
                value: 'wrap',
            },
            serialized: 'wrap',
        },
        value: 'wrap | none',
    },
    'writing-mode': {
        animate: false,
        initial: {
            parsed: {
                end: 13,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'writing-mode'],
                value: 'horizontal-tb',
            },
            serialized: 'horizontal-tb',
        },
        value: 'horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr',
    },
    'x': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'x'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'y': {
        initial: {
            parsed: {
                types: ['<dimension-token>', '<dimension>', '<length>', '<length-percentage>', 'y'],
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'z-index': {
        initial: {
            parsed: {
                end: 4,
                start: 0,
                types: ['<ident-token>', '<ident>', '<keyword>', 'z-index'],
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <integer>',
    },
    'zoom': {
        animate: false,
        initial: {
            parsed: list(
                [
                    {
                        end: 1,
                        start: 0,
                        types: ['<number-token>', '<number>'],
                        value: 1,
                    },
                    omitted,
                ],
                ' ',
                ['zoom'],
            ),
            serialized: '1',
        },
        value: '<number [0,∞]> || <percentage [0,∞]>',
    },
}
