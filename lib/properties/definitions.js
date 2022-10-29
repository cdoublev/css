
// Generated from /var/www/packages/css/scripts/initial.js

const { createList } = require('../values/value.js')

module.exports = {
    '-webkit-line-clamp': {
        value: 'none | <integer>',
    },
    '-webkit-text-fill-color': {
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', '-webkit-text-fill-color']),
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
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', '-webkit-text-stroke-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    '-webkit-text-stroke-width': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'line-width', '-webkit-text-stroke-width']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'accent-color']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <color>',
    },
    'align-content': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'align-content']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>',
    },
    'align-items': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'align-items']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | stretch | <baseline-position> | [<overflow-position>? <self-position>]',
    },
    'align-self': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'align-self']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position>',
    },
    'align-tracks': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'normal',
                        type: new Set(['ident', 'keyword']),
                        value: 'normal',
                    },
                ],
                ',',
                new Set(['align-tracks']),
            ),
            serialized: 'normal',
        },
        value: '[normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>]#',
    },
    'alignment-baseline': {
        initial: {
            parsed: {
                representation: 'baseline',
                type: new Set(['ident', 'keyword', 'alignment-baseline']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'anchor-name']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <dashed-ident>',
    },
    'animation': {
        value: '<single-animation>#',
    },
    'animation-composition': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'replace',
                        type: new Set(['ident', 'keyword', 'single-animation-composition']),
                        value: 'replace',
                    },
                ],
                ',',
                new Set(['animation-composition']),
            ),
            serialized: 'replace',
        },
        value: '<single-animation-composition>#',
    },
    'animation-delay': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0s',
                        type: new Set(['dimension', 'time']),
                        unit: 's',
                        value: 0,
                    },
                ],
                ',',
                new Set(['animation-delay']),
            ),
            serialized: '0s',
        },
        value: '<time>#',
    },
    'animation-direction': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'normal',
                        type: new Set(['ident', 'keyword', 'single-animation-direction']),
                        value: 'normal',
                    },
                ],
                ',',
                new Set(['animation-direction']),
            ),
            serialized: 'normal',
        },
        value: '<single-animation-direction>#',
    },
    'animation-duration': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0s',
                        type: new Set(['dimension', 'time']),
                        unit: 's',
                        value: 0,
                    },
                ],
                ',',
                new Set(['animation-duration']),
            ),
            serialized: '0s',
        },
        value: '<time [0s,∞]>#',
    },
    'animation-fill-mode': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'none',
                        type: new Set(['ident', 'keyword', 'single-animation-fill-mode']),
                        value: 'none',
                    },
                ],
                ',',
                new Set(['animation-fill-mode']),
            ),
            serialized: 'none',
        },
        value: '<single-animation-fill-mode>#',
    },
    'animation-iteration-count': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '1',
                        type: new Set(['number', 'single-animation-iteration-count']),
                        value: 1,
                    },
                ],
                ',',
                new Set(['animation-iteration-count']),
            ),
            serialized: '1',
        },
        value: '<single-animation-iteration-count>#',
    },
    'animation-name': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'none',
                        type: new Set(['ident', 'keyword']),
                        value: 'none',
                    },
                ],
                ',',
                new Set(['animation-name']),
            ),
            serialized: 'none',
        },
        value: '[none | <keyframes-name>]#',
    },
    'animation-play-state': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'running',
                        type: new Set(['ident', 'keyword', 'single-animation-play-state']),
                        value: 'running',
                    },
                ],
                ',',
                new Set(['animation-play-state']),
            ),
            serialized: 'running',
        },
        value: '<single-animation-play-state>#',
    },
    'animation-timeline': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword', 'single-animation-timeline']),
                        value: 'auto',
                    },
                ],
                ',',
                new Set(['animation-timeline']),
            ),
            serialized: 'auto',
        },
        value: '<single-animation-timeline>#',
    },
    'animation-timing-function': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'ease',
                        type: new Set(['ident', 'keyword', 'cubic-bezier-easing-function', 'easing-function']),
                        value: 'ease',
                    },
                ],
                ',',
                new Set(['animation-timing-function']),
            ),
            serialized: 'ease',
        },
        value: '<easing-function>#',
    },
    'appearance': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'appearance']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | auto | <compat-auto> | <compat-special>',
    },
    'aspect-ratio': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword']),
                        value: 'auto',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<ratio>',
                    },
                ],
                ' ',
                new Set(['aspect-ratio']),
            ),
            serialized: 'auto',
        },
        value: 'auto || <ratio>',
    },
    'backdrop-filter': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'backdrop-filter']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <filter-value-list>',
    },
    'backface-visibility': {
        initial: {
            parsed: {
                representation: 'visible',
                type: new Set(['ident', 'keyword', 'backface-visibility']),
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden',
    },
    'background': {
        value: '[<bg-layer>#,]? <final-bg-layer>',
    },
    'background-attachment': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'scroll',
                        type: new Set(['ident', 'keyword', 'attachment']),
                        value: 'scroll',
                    },
                ],
                ',',
                new Set(['background-attachment']),
            ),
            serialized: 'scroll',
        },
        value: '<attachment>#',
    },
    'background-blend-mode': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'normal',
                        type: new Set(['ident', 'keyword', 'blend-mode', 'mix-blend-mode']),
                        value: 'normal',
                    },
                ],
                ',',
                new Set(['background-blend-mode']),
            ),
            serialized: 'normal',
        },
        value: "<'mix-blend-mode'>#",
    },
    'background-clip': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'border-box',
                        type: new Set(['ident', 'keyword', 'box']),
                        value: 'border-box',
                    },
                ],
                ',',
                new Set(['background-clip']),
            ),
            serialized: 'border-box',
        },
        value: '<box>#',
    },
    'background-color': {
        initial: {
            parsed: {
                representation: 'transparent',
                type: new Set(['ident', 'keyword', 'absolute-color-base', 'color', 'background-color']),
                value: 'transparent',
            },
            serialized: 'transparent',
        },
        value: '<color>',
    },
    'background-image': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'none',
                        type: new Set(['ident', 'keyword', 'bg-image']),
                        value: 'none',
                    },
                ],
                ',',
                new Set(['background-image']),
            ),
            serialized: 'none',
        },
        value: '<bg-image>#',
    },
    'background-origin': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'padding-box',
                        type: new Set(['ident', 'keyword', 'box']),
                        value: 'padding-box',
                    },
                ],
                ',',
                new Set(['background-origin']),
            ),
            serialized: 'padding-box',
        },
        value: '<box>#',
    },
    'background-position': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                        ' ',
                        new Set(['bg-position']),
                    ),
                ],
                ',',
                new Set(['background-position']),
            ),
            serialized: '0% 0%',
        },
        value: '<bg-position>#',
    },
    'background-position-block': {
        group: 'background-position',
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                omitted: true,
                                type: new Set([]),
                                value: '[start | end]?',
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                new Set(['background-position-block']),
            ),
            serialized: '0%',
        },
        value: '[center | [start | end]? <length-percentage>?]#',
    },
    'background-position-inline': {
        group: 'background-position',
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                omitted: true,
                                type: new Set([]),
                                value: '[start | end]?',
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                new Set(['background-position-inline']),
            ),
            serialized: '0%',
        },
        value: '[center | [start | end]? <length-percentage>?]#',
    },
    'background-position-x': {
        group: 'background-position',
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                omitted: true,
                                type: new Set([]),
                                value: '[left | right | x-start | x-end]?',
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                new Set(['background-position-x']),
            ),
            serialized: '0%',
        },
        value: '[center | [[left | right | x-start | x-end]? <length-percentage>?]!]#',
    },
    'background-position-y': {
        group: 'background-position',
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                omitted: true,
                                type: new Set([]),
                                value: '[top | bottom | y-start | y-end]?',
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                new Set(['background-position-y']),
            ),
            serialized: '0%',
        },
        value: '[center | [[top | bottom | y-start | y-end]? <length-percentage>?]!]#',
    },
    'background-repeat': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'repeat',
                                type: new Set(['ident', 'keyword']),
                                value: 'repeat',
                            },
                        ],
                        ' ',
                        new Set(['repeat-style']),
                    ),
                ],
                ',',
                new Set(['background-repeat']),
            ),
            serialized: 'repeat',
        },
        value: '<repeat-style>#',
    },
    'background-size': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'auto',
                                type: new Set(['ident', 'keyword']),
                                value: 'auto',
                            },
                        ],
                        ' ',
                        new Set(['bg-size']),
                    ),
                ],
                ',',
                new Set(['background-size']),
            ),
            serialized: 'auto',
        },
        value: '<bg-size>#',
    },
    'baseline-shift': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'baseline-shift']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'baseline-source']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | first | last',
    },
    'block-ellipsis': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'block-ellipsis']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'width', 'block-size']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'block-step-align']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | center | start | end',
    },
    'block-step-insert': {
        initial: {
            parsed: {
                representation: 'margin',
                type: new Set(['ident', 'keyword', 'block-step-insert']),
                value: 'margin',
            },
            serialized: 'margin',
        },
        value: 'margin | padding',
    },
    'block-step-round': {
        initial: {
            parsed: {
                representation: 'up',
                type: new Set(['ident', 'keyword', 'block-step-round']),
                value: 'up',
            },
            serialized: 'up',
        },
        value: 'up | down | nearest',
    },
    'block-step-size': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'block-step-size']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length [0,∞]>',
    },
    'bookmark-label': {
        initial: {
            parsed: createList(
                [
                    {
                        name: 'content',
                        representation: 'content(text)',
                        type: new Set(['function', 'content()']),
                        value: {
                            representation: 'text',
                            type: new Set(['ident', 'keyword']),
                            value: 'text',
                        },
                    },
                ],
                ' ',
                new Set(['content-list', 'bookmark-label']),
            ),
            serialized: 'content(text)',
        },
        value: '<content-list>',
    },
    'bookmark-level': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'bookmark-level']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <integer [1,∞]>',
    },
    'bookmark-state': {
        initial: {
            parsed: {
                representation: 'open',
                type: new Set(['ident', 'keyword', 'bookmark-state']),
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
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-block-end-color': {
        group: 'border-color',
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'border-top-color', 'border-block-end-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: "<'border-top-color'>",
    },
    'border-block-end-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-top-style', 'border-block-end-style']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: "<'border-top-style'>",
    },
    'border-block-end-width': {
        group: 'border-width',
        initial: {
            parsed: {
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-top-width', 'border-block-end-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: "<'border-top-width'>",
    },
    'border-block-start': {
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-block-start-color': {
        group: 'border-color',
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'border-top-color', 'border-block-start-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: "<'border-top-color'>",
    },
    'border-block-start-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-top-style', 'border-block-start-style']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: "<'border-top-style'>",
    },
    'border-block-start-width': {
        group: 'border-width',
        initial: {
            parsed: {
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-top-width', 'border-block-start-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: "<'border-top-width'>",
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
                representation: 'currentColor',
                type: new Set(['ident', 'keyword', 'color', 'border-bottom-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'border-bottom-left-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-bottom-left-radius']),
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-right-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-bottom-right-radius']),
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-bottom-style']),
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
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-bottom-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-boundary': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'border-boundary']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | parent | display',
    },
    'border-collapse': {
        initial: {
            parsed: {
                representation: 'separate',
                type: new Set(['ident', 'keyword', 'border-collapse']),
                value: 'separate',
            },
            serialized: 'separate',
        },
        value: 'separate | collapse',
    },
    'border-color': {
        value: '<color>{1,4}',
    },
    'border-end-end-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-top-left-radius', 'border-end-end-radius']),
            ),
            serialized: '0px',
        },
        value: "<'border-top-left-radius'>",
    },
    'border-end-start-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-top-left-radius', 'border-end-start-radius']),
            ),
            serialized: '0px',
        },
        value: "<'border-top-left-radius'>",
    },
    'border-image': {
        value: "<'border-image-source'> || <'border-image-slice'> [/ <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'>]? || <'border-image-repeat'>",
    },
    'border-image-outset': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['number']),
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-image-outset']),
            ),
            serialized: '0',
        },
        value: '[<length [0,∞]> | <number [0,∞]>]{1,4}',
    },
    'border-image-repeat': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'stretch',
                        type: new Set(['ident', 'keyword']),
                        value: 'stretch',
                    },
                ],
                ' ',
                new Set(['border-image-repeat']),
            ),
            serialized: 'stretch',
        },
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'border-image-slice': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: '100%',
                                type: new Set(['percentage']),
                                unit: '%',
                                value: 100,
                            },
                        ],
                    ),
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'fill?',
                    },
                ],
                ' ',
                new Set(['border-image-slice']),
            ),
            serialized: '100%',
        },
        value: '[<number [0,∞]> | <percentage [0,∞]>]{1,4} && fill?',
    },
    'border-image-source': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'border-image-source']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <image>',
    },
    'border-image-width': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '1',
                        type: new Set(['number']),
                        value: 1,
                    },
                ],
                ' ',
                new Set(['border-image-width']),
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
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-inline-end-color': {
        group: 'border-color',
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'border-top-color', 'border-inline-end-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: "<'border-top-color'>",
    },
    'border-inline-end-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-top-style', 'border-inline-end-style']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: "<'border-top-style'>",
    },
    'border-inline-end-width': {
        group: 'border-width',
        initial: {
            parsed: {
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-top-width', 'border-inline-end-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: "<'border-top-width'>",
    },
    'border-inline-start': {
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-inline-start-color': {
        group: 'border-color',
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'border-top-color', 'border-inline-start-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: "<'border-top-color'>",
    },
    'border-inline-start-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-top-style', 'border-inline-start-style']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: "<'border-top-style'>",
    },
    'border-inline-start-width': {
        group: 'border-width',
        initial: {
            parsed: {
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-top-width', 'border-inline-start-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: "<'border-top-width'>",
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
                representation: 'currentColor',
                type: new Set(['ident', 'keyword', 'color', 'border-left-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'border-left-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-left-style']),
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
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-left-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-limit': {
        initial: {
            parsed: {
                representation: 'round',
                type: new Set(['ident', 'keyword', 'border-limit']),
                value: 'round',
            },
            serialized: 'round',
        },
        value: 'all | round | [sides | corners] <length-percentage [0,∞]>? | [top | right | bottom | left] <length-percentage [0,∞]>',
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
                representation: 'currentColor',
                type: new Set(['ident', 'keyword', 'color', 'border-right-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'border-right-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-right-style']),
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
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-right-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'border-spacing': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0px',
                        type: new Set(['dimension', 'length']),
                        unit: 'px',
                        value: 0,
                    },
                    {
                        representation: '0px',
                        type: new Set(['dimension', 'length']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-spacing']),
            ),
            serialized: '0px 0px',
        },
        value: '<length>{1,2}',
    },
    'border-start-end-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-top-left-radius', 'border-start-end-radius']),
            ),
            serialized: '0px',
        },
        value: "<'border-top-left-radius'>",
    },
    'border-start-start-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-top-left-radius', 'border-start-start-radius']),
            ),
            serialized: '0px',
        },
        value: "<'border-top-left-radius'>",
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
                representation: 'currentColor',
                type: new Set(['ident', 'keyword', 'color', 'border-top-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'border-top-left-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-top-left-radius']),
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-right-radius': {
        group: 'border-radius',
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['border-top-right-radius']),
            ),
            serialized: '0px',
        },
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-style': {
        group: 'border-style',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']),
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
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'bottom']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'box-decoration-break': {
        initial: {
            parsed: {
                representation: 'slice',
                type: new Set(['ident', 'keyword', 'box-decoration-break']),
                value: 'slice',
            },
            serialized: 'slice',
        },
        value: 'slice | clone',
    },
    'box-shadow': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'box-shadow']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <shadow>#',
    },
    'box-sizing': {
        initial: {
            parsed: {
                representation: 'content-box',
                type: new Set(['ident', 'keyword', 'box-sizing']),
                value: 'content-box',
            },
            serialized: 'content-box',
        },
        value: 'content-box | border-box',
    },
    'box-snap': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'box-snap']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | block-start | block-end | center | baseline | last-baseline',
    },
    'break-after': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'break-after']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-before': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'break-before']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-inside': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'break-inside']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | avoid-page | avoid-column | avoid-region',
    },
    'caption-side': {
        initial: {
            parsed: {
                representation: 'top',
                type: new Set(['ident', 'keyword', 'caption-side']),
                value: 'top',
            },
            serialized: 'top',
        },
        value: 'top | bottom | inline-start | inline-end',
    },
    'caret': {
        value: "<'caret-color'> || <'caret-shape'>",
    },
    'caret-color': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'caret-color']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <color>',
    },
    'caret-shape': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'caret-shape']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | bar | block | underscore',
    },
    'clear': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'clear']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both-inline | both-block | both | all | none',
    },
    'clip': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'clip']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'rect(<top>, <right>, <bottom>, <left>) | auto',
    },
    'clip-path': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'clip-path']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<clip-source> | [<basic-shape> || <geometry-box>] | none',
    },
    'clip-rule': {
        initial: {
            parsed: {
                representation: 'nonzero',
                type: new Set(['ident', 'keyword', 'clip-rule']),
                value: 'nonzero',
            },
            serialized: 'nonzero',
        },
        value: 'nonzero | evenodd',
    },
    'color': {
        initial: {
            parsed: {
                representation: 'CanvasText',
                type: new Set(['ident', 'keyword', 'system-color', 'color']),
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
                representation: 'sRGB',
                type: new Set(['ident', 'keyword', 'color-interpolation']),
                value: 'srgb',
            },
            serialized: 'srgb',
        },
        value: 'auto | sRGB | linearRGB',
    },
    'color-interpolation-filters': {
        initial: {
            parsed: {
                representation: 'linearRGB',
                type: new Set(['ident', 'keyword', 'color-interpolation-filters']),
                value: 'linearrgb',
            },
            serialized: 'linearrgb',
        },
        value: 'auto | sRGB | linearRGB',
    },
    'color-scheme': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'color-scheme']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [light | dark | <custom-ident>]+ && only?',
    },
    'column-count': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'column-count']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <integer [1,∞]>',
    },
    'column-fill': {
        initial: {
            parsed: {
                representation: 'balance',
                type: new Set(['ident', 'keyword', 'column-fill']),
                value: 'balance',
            },
            serialized: 'balance',
        },
        value: 'auto | balance | balance-all',
    },
    'column-gap': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'column-gap']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage [0,∞]>',
    },
    'column-rule': {
        value: "<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>",
    },
    'column-rule-color': {
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'column-rule-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'column-rule-style': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-style', 'column-rule-style']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<line-style>',
    },
    'column-rule-width': {
        initial: {
            parsed: {
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'column-rule-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'column-span': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'column-span']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <integer [1,∞]> | all | auto',
    },
    'column-width': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'column-width']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length [0,∞]> | min-content | max-content | fit-content(<length-percentage>)',
    },
    'columns': {
        value: "<'column-width'> || <'column-count'>",
    },
    'contain': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'contain']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | strict | content | [[size | inline-size] || layout || style || paint]',
    },
    'contain-intrinsic-block-size': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'contain-intrinsic-block-size']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-height': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'contain-intrinsic-height']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-inline-size': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'contain-intrinsic-inline-size']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-size': {
        value: '[none | <length> | auto <length>]{1,2}',
    },
    'contain-intrinsic-width': {
        group: 'contain-intrinsic-size',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'contain-intrinsic-width']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length> | auto <length>',
    },
    'container': {
        value: "<'container-name'> [/ <'container-type'>]?",
    },
    'container-name': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'container-name']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>+',
    },
    'container-type': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'container-type']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | size | inline-size',
    },
    'content': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'content']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | none | [<content-replacement> | <content-list>] [/ [<string> | <counter>]+]? | <element()>',
    },
    'content-visibility': {
        initial: {
            parsed: {
                representation: 'visible',
                type: new Set(['ident', 'keyword', 'content-visibility']),
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | auto | hidden',
    },
    'continue': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'continue']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | overflow | paginate | fragments | discard',
    },
    'copy-into': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'copy-into']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [[<custom-ident> <content-level>] [, <custom-ident> <content-level>]*]?',
    },
    'corner-shape': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'round',
                        type: new Set(['ident', 'keyword']),
                        value: 'round',
                    },
                ],
                ' ',
                new Set(['corner-shape']),
            ),
            serialized: 'round',
        },
        value: '[round | angle]{1,4}',
    },
    'corners': {
        value: "<'corner-shape'> || <'border-radius'>",
    },
    'counter-increment': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'none',
                                type: new Set(['ident', 'custom-ident', 'counter-name']),
                                value: 'none',
                            },
                            {
                                omitted: true,
                                type: new Set([]),
                                value: '<integer>?',
                            },
                        ],
                    ),
                ],
                ' ',
                new Set(['counter-increment']),
            ),
            serialized: 'none',
        },
        value: '[<counter-name> <integer>?]+ | none',
    },
    'counter-reset': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'none',
                                type: new Set(['ident', 'custom-ident', 'counter-name']),
                                value: 'none',
                            },
                            {
                                omitted: true,
                                type: new Set([]),
                                value: '<integer>?',
                            },
                        ],
                    ),
                ],
                ' ',
                new Set(['counter-reset']),
            ),
            serialized: 'none',
        },
        value: '[<counter-name> <integer>? | <reversed-counter-name> <integer>?]+ | none',
    },
    'counter-set': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'none',
                                type: new Set(['ident', 'custom-ident', 'counter-name']),
                                value: 'none',
                            },
                            {
                                omitted: true,
                                type: new Set([]),
                                value: '<integer>?',
                            },
                        ],
                    ),
                ],
                ' ',
                new Set(['counter-set']),
            ),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'cue-after']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<uri> <decibel>? | none',
    },
    'cue-before': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'cue-before']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<uri> <decibel>? | none',
    },
    'cursor': {
        initial: {
            parsed: createList(
                [
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '[<url> | <url-set> [<x> <y>]?]#?',
                    },
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword']),
                        value: 'auto',
                    },
                ],
                ' ',
                new Set(['cursor']),
            ),
            serialized: 'auto',
        },
        value: '[[<url> | <url-set>] [<x> <y>]?]#? [auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | grab | grabbing | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out]',
    },
    'cx': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'cx']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'cy']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'd']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <string>',
    },
    'direction': {
        initial: {
            parsed: {
                representation: 'ltr',
                type: new Set(['ident', 'keyword', 'direction']),
                value: 'ltr',
            },
            serialized: 'ltr',
        },
        value: 'ltr | rtl',
    },
    'display': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'inline',
                        type: new Set(['ident', 'keyword', 'display-outside']),
                        value: 'inline',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<display-inside>',
                    },
                ],
                ' ',
                new Set(['display']),
            ),
            serialized: 'inline',
        },
        value: '[<display-outside> || <display-inside>] | <display-listitem> | <display-internal> | <display-box> | <display-legacy> | <display-outside> || [<display-inside> | math]',
    },
    'dominant-baseline': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'dominant-baseline']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | text-bottom | alphabetic | ideographic | middle | central | mathematical | hanging | text-top',
    },
    'empty-cells': {
        initial: {
            parsed: {
                representation: 'show',
                type: new Set(['ident', 'keyword', 'empty-cells']),
                value: 'show',
            },
            serialized: 'show',
        },
        value: 'show | hide',
    },
    'fill': {
        initial: {
            parsed: {
                representation: 'black',
                type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color', 'paint', 'fill']),
                value: 'black',
            },
            serialized: 'black',
        },
        value: '<paint>',
    },
    'fill-break': {
        initial: {
            parsed: {
                representation: 'bounding-box',
                type: new Set(['ident', 'keyword', 'fill-break']),
                value: 'bounding-box',
            },
            serialized: 'bounding-box',
        },
        value: 'bounding-box | slice | clone',
    },
    'fill-color': {
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'fill-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'fill-image': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'none',
                        type: new Set(['ident', 'keyword', 'paint']),
                        value: 'none',
                    },
                ],
                ',',
                new Set(['fill-image']),
            ),
            serialized: 'none',
        },
        value: '<paint>#',
    },
    'fill-opacity': {
        initial: {
            parsed: {
                representation: '1',
                type: new Set(['number', 'alpha-value', 'opacity', 'fill-opacity']),
                value: 1,
            },
            serialized: '1',
        },
        value: "<'opacity'>",
    },
    'fill-origin': {
        initial: {
            parsed: {
                representation: 'match-parent',
                type: new Set(['ident', 'keyword', 'fill-origin']),
                value: 'match-parent',
            },
            serialized: 'match-parent',
        },
        value: 'match-parent | fill-box | stroke-box | content-box | padding-box | border-box',
    },
    'fill-position': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                        ' ',
                        new Set(['position']),
                    ),
                ],
                ',',
                new Set(['fill-position']),
            ),
            serialized: '0% 0%',
        },
        value: '<position>#',
    },
    'fill-repeat': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'repeat',
                                type: new Set(['ident', 'keyword']),
                                value: 'repeat',
                            },
                        ],
                        ' ',
                        new Set(['repeat-style']),
                    ),
                ],
                ',',
                new Set(['fill-repeat']),
            ),
            serialized: 'repeat',
        },
        value: '<repeat-style>#',
    },
    'fill-rule': {
        initial: {
            parsed: {
                representation: 'nonzero',
                type: new Set(['ident', 'keyword', 'fill-rule']),
                value: 'nonzero',
            },
            serialized: 'nonzero',
        },
        value: 'nonzero | evenodd',
    },
    'fill-size': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'auto',
                                type: new Set(['ident', 'keyword']),
                                value: 'auto',
                            },
                        ],
                        ' ',
                        new Set(['bg-size']),
                    ),
                ],
                ',',
                new Set(['fill-size']),
            ),
            serialized: 'auto',
        },
        value: '<bg-size>#',
    },
    'filter': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'filter']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <filter-value-list>',
    },
    'flex': {
        value: "none | [<'flex-grow'> <'flex-shrink'>? || <'flex-basis'>]",
    },
    'flex-basis': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'width', 'flex-basis']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: "content | <'width'>",
    },
    'flex-direction': {
        initial: {
            parsed: {
                representation: 'row',
                type: new Set(['ident', 'keyword', 'flex-direction']),
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
                representation: '0',
                type: new Set(['number', 'flex-grow']),
                value: 0,
            },
            serialized: '0',
        },
        value: '<number [0,∞]>',
    },
    'flex-shrink': {
        initial: {
            parsed: {
                representation: '1',
                type: new Set(['number', 'flex-shrink']),
                value: 1,
            },
            serialized: '1',
        },
        value: '<number [0,∞]>',
    },
    'flex-wrap': {
        initial: {
            parsed: {
                representation: 'nowrap',
                type: new Set(['ident', 'keyword', 'flex-wrap']),
                value: 'nowrap',
            },
            serialized: 'nowrap',
        },
        value: 'nowrap | wrap | wrap-reverse',
    },
    'float': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'float']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'block-start | block-end | inline-start | inline-end | snap-block | <snap-block()> | snap-inline | <snap-inline()> | left | right | top | bottom | none | footnote',
    },
    'float-defer': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'float-defer']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<integer> | last | none',
    },
    'float-offset': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'float-offset']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length> | <percentage>',
    },
    'float-reference': {
        initial: {
            parsed: {
                representation: 'inline',
                type: new Set(['ident', 'keyword', 'float-reference']),
                value: 'inline',
            },
            serialized: 'inline',
        },
        value: 'inline | column | region | page',
    },
    'flood-color': {
        initial: {
            parsed: {
                representation: 'black',
                type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color', 'flood-color']),
                value: 'black',
            },
            serialized: 'black',
        },
        value: '<color>',
    },
    'flood-opacity': {
        initial: {
            parsed: {
                representation: '1',
                type: new Set(['number', 'alpha-value', 'flood-opacity']),
                value: 1,
            },
            serialized: '1',
        },
        value: '<alpha-value>',
    },
    'flow-from': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'flow-from']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<ident> | none',
    },
    'flow-into': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'flow-into']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <ident> [element|content]?',
    },
    'font': {
        value: "[[<'font-style'> || <font-variant-css2> || <'font-weight'> || <font-stretch-css3>]? <'font-size'> [/ <'line-height'>]? <'font-family'>] | caption | icon | menu | message-box | small-caption | status-bar",
    },
    'font-family': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'monospace',
                        type: new Set(['ident', 'custom-ident', 'family-name']),
                        value: 'monospace',
                    },
                ],
                ',',
                new Set(['font-family']),
            ),
            serialized: 'monospace',
        },
        value: '[<family-name> | <generic-family>]#',
    },
    'font-feature-settings': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-feature-settings']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <feature-tag-value>#',
    },
    'font-kerning': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'font-kerning']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | normal | none',
    },
    'font-language-override': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-language-override']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <string>',
    },
    'font-optical-sizing': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'font-optical-sizing']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-palette': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-palette']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | light | dark | <palette-identifier>',
    },
    'font-size': {
        initial: {
            parsed: {
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'absolute-size', 'font-size']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<absolute-size> | <relative-size> | <length-percentage [0,∞]> | math',
    },
    'font-size-adjust': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'font-size-adjust']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [ex-height | cap-height | ch-width | ic-width | ic-height]? [from-font | <number>]',
    },
    'font-stretch': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-stretch']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <percentage [0,∞]> | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded',
    },
    'font-style': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-style']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | italic | oblique <angle [-90deg,90deg]>?',
    },
    'font-synthesis': {
        value: 'none | [weight || style || small-caps]',
    },
    'font-synthesis-small-caps': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'font-synthesis-small-caps']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-synthesis-style': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'font-synthesis-style']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-synthesis-weight': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'font-synthesis-weight']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'font-variant': {
        value: 'normal | none | [[<common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values>] || [small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps] || [stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>)] || [<numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero] || [<east-asian-variant-values> || <east-asian-width-values> || ruby] || [sub | super] || [text | emoji | unicode]]',
    },
    'font-variant-alternates': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variant-alternates']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>)]',
    },
    'font-variant-caps': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variant-caps']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps',
    },
    'font-variant-east-asian': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variant-east-asian']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<east-asian-variant-values> || <east-asian-width-values> || ruby]',
    },
    'font-variant-emoji': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variant-emoji']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | text | emoji | unicode',
    },
    'font-variant-ligatures': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variant-ligatures']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | none | [<common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values>]',
    },
    'font-variant-numeric': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variant-numeric']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero]',
    },
    'font-variant-position': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variant-position']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | sub | super',
    },
    'font-variation-settings': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-variation-settings']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [<string> <number>]#',
    },
    'font-weight': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'font-weight-absolute', 'font-weight']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: '<font-weight-absolute> | bolder | lighter',
    },
    'footnote-display': {
        initial: {
            parsed: {
                representation: 'block',
                type: new Set(['ident', 'keyword', 'footnote-display']),
                value: 'block',
            },
            serialized: 'block',
        },
        value: 'block | inline | compact',
    },
    'footnote-policy': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'footnote-policy']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | line | block',
    },
    'forced-color-adjust': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'forced-color-adjust']),
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
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'glyph-orientation-vertical']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | 0deg | 90deg | 0 | 90',
    },
    'grid': {
        value: "<'grid-template'> | <'grid-template-rows'> / [auto-flow && dense?] <'grid-auto-columns'>? | [auto-flow && dense?] <'grid-auto-rows'>? / <'grid-template-columns'>",
    },
    'grid-area': {
        value: '<grid-line> [/ <grid-line>]{0,3}',
    },
    'grid-auto-columns': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword', 'track-breadth', 'track-size']),
                        value: 'auto',
                    },
                ],
                ' ',
                new Set(['grid-auto-columns']),
            ),
            serialized: 'auto',
        },
        value: '<track-size>+',
    },
    'grid-auto-flow': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'row',
                        type: new Set(['ident', 'keyword']),
                        value: 'row',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'dense',
                    },
                ],
                ' ',
                new Set(['grid-auto-flow']),
            ),
            serialized: 'row',
        },
        value: '[row | column] || dense',
    },
    'grid-auto-rows': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword', 'track-breadth', 'track-size']),
                        value: 'auto',
                    },
                ],
                ' ',
                new Set(['grid-auto-rows']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'grid-line', 'grid-column-end']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<grid-line>',
    },
    'grid-column-start': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'grid-line', 'grid-column-start']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'grid-line', 'grid-row-end']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<grid-line>',
    },
    'grid-row-start': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'grid-line', 'grid-row-start']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<grid-line>',
    },
    'grid-template': {
        value: "none | [<'grid-template-rows'> / <'grid-template-columns'>] | [<line-names>? <string> <track-size>? <line-names>?]+ [/ <explicit-track-list>]?",
    },
    'grid-template-areas': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'grid-template-areas']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <string>+',
    },
    'grid-template-columns': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'grid-template-columns']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>? | masonry',
    },
    'grid-template-rows': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'grid-template-rows']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>? | masonry',
    },
    'hanging-punctuation': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'hanging-punctuation']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [first || [force-end | allow-end] || last]',
    },
    'height': {
        group: 'size',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'height']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | stretch | fit-content | contain',
    },
    'hyphenate-character': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'hyphenate-character']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <string>',
    },
    'hyphenate-limit-chars': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword']),
                        value: 'auto',
                    },
                ],
                ' ',
                new Set(['hyphenate-limit-chars']),
            ),
            serialized: 'auto',
        },
        value: '[auto | <integer>]{1,3}',
    },
    'hyphenate-limit-last': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'hyphenate-limit-last']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | always | column | page | spread',
    },
    'hyphenate-limit-lines': {
        initial: {
            parsed: {
                representation: 'no-limit',
                type: new Set(['ident', 'keyword', 'hyphenate-limit-lines']),
                value: 'no-limit',
            },
            serialized: 'no-limit',
        },
        value: 'no-limit | <integer>',
    },
    'hyphenate-limit-zone': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'hyphenate-limit-zone']),
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
                representation: 'manual',
                type: new Set(['ident', 'keyword', 'hyphens']),
                value: 'manual',
            },
            serialized: 'manual',
        },
        value: 'none | manual | auto',
    },
    'image-orientation': {
        initial: {
            parsed: {
                representation: 'from-image',
                type: new Set(['ident', 'keyword', 'image-orientation']),
                value: 'from-image',
            },
            serialized: 'from-image',
        },
        value: 'from-image | none | [<angle> || flip]',
    },
    'image-rendering': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'image-rendering']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | smooth | high-quality | pixelated | crisp-edges',
    },
    'image-resolution': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                omitted: true,
                                type: new Set([]),
                                value: 'from-image',
                            },
                            {
                                representation: '1dppx',
                                type: new Set(['dimension', 'resolution']),
                                unit: 'dppx',
                                value: 1,
                            },
                        ],
                    ),
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'snap?',
                    },
                ],
                ' ',
                new Set(['image-resolution']),
            ),
            serialized: '1dppx',
        },
        value: '[from-image || <resolution>] && snap?',
    },
    'initial-letter': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'initial-letter']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <number [1,∞]> <integer [1,∞]> | <number [1,∞]> && [drop | raise]?',
    },
    'initial-letter-align': {
        initial: {
            parsed: createList(
                [
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'border-box?',
                    },
                    {
                        representation: 'alphabetic',
                        type: new Set(['ident', 'keyword']),
                        value: 'alphabetic',
                    },
                ],
                ' ',
                new Set(['initial-letter-align']),
            ),
            serialized: 'alphabetic',
        },
        value: '[border-box? [alphabetic | ideographic | hanging | leading]?]!',
    },
    'initial-letter-wrap': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'initial-letter-wrap']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'width', 'inline-size']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: "<'width'>",
    },
    'inline-sizing': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'inline-sizing']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | stretch',
    },
    'input-security': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'input-security']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'inset': {
        value: '<top>{1,4}',
    },
    'inset-block': {
        value: '<top>{1,2}',
    },
    'inset-block-end': {
        group: 'inset',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'inset-block-end']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'inset-block-start']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'inset-inline': {
        value: '<top>{1,2}',
    },
    'inset-inline-end': {
        group: 'inset',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'inset-inline-end']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'inset-inline-start']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'isolation': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'isolation-mode', 'isolation']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<isolation-mode>',
    },
    'justify-content': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'justify-content']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <content-distribution> | <overflow-position>? [<content-position> | left | right]',
    },
    'justify-items': {
        initial: {
            parsed: {
                representation: 'legacy',
                type: new Set(['ident', 'keyword', 'justify-items']),
                value: 'legacy',
            },
            serialized: 'legacy',
        },
        value: 'normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right] | legacy | legacy && [left | right | center]',
    },
    'justify-self': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'justify-self']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right]',
    },
    'justify-tracks': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'normal',
                        type: new Set(['ident', 'keyword']),
                        value: 'normal',
                    },
                ],
                ',',
                new Set(['justify-tracks']),
            ),
            serialized: 'normal',
        },
        value: '[normal | <content-distribution> | <overflow-position>? [<content-position> | left | right]]#',
    },
    'leading-trim': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'leading-trim']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | start | end | both',
    },
    'left': {
        group: 'inset',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'left']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'letter-spacing': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'letter-spacing']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage>',
    },
    'lighting-color': {
        initial: {
            parsed: {
                representation: 'white',
                type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color', 'lighting-color']),
                value: 'white',
            },
            serialized: 'white',
        },
        value: '<color>',
    },
    'line-break': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'line-break']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | loose | normal | strict | anywhere',
    },
    'line-clamp': {
        value: "none | <integer> <'block-ellipsis'>?",
    },
    'line-grid': {
        initial: {
            parsed: {
                representation: 'match-parent',
                type: new Set(['ident', 'keyword', 'line-grid']),
                value: 'match-parent',
            },
            serialized: 'match-parent',
        },
        value: 'match-parent | create',
    },
    'line-height': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'line-height']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <number> | <length-percentage>',
    },
    'line-height-step': {
        initial: {
            parsed: {
                representation: '0px',
                type: new Set(['dimension', 'length', 'line-height-step']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'line-padding']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'line-snap']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | baseline | contain',
    },
    'list-style': {
        value: "<'list-style-position'> || <'list-style-image'> || <'list-style-type'>",
    },
    'list-style-image': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'list-style-image']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<image> | none',
    },
    'list-style-position': {
        initial: {
            parsed: {
                representation: 'outside',
                type: new Set(['ident', 'keyword', 'list-style-position']),
                value: 'outside',
            },
            serialized: 'outside',
        },
        value: 'inside | outside',
    },
    'list-style-type': {
        initial: {
            parsed: {
                representation: 'disc',
                type: new Set(['ident', 'custom-ident', 'counter-style-name', 'counter-style', 'list-style-type']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-top', 'margin-block-end']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-top', 'margin-block-start']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-bottom']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto',
    },
    'margin-break': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'margin-break']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-top', 'margin-inline-end']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-top', 'margin-inline-start']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-left']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto',
    },
    'margin-right': {
        group: 'margin',
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-right']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto',
    },
    'margin-top': {
        group: 'margin',
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage> | auto',
    },
    'margin-trim': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'margin-trim']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | block | inline | [block-start || inline-start || block-end || inline-end]',
    },
    'marker': {
        value: 'none | <marker-ref>',
    },
    'marker-end': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'marker-end']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <marker-ref>',
    },
    'marker-mid': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'marker-mid']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <marker-ref>',
    },
    'marker-side': {
        initial: {
            parsed: {
                representation: 'match-self',
                type: new Set(['ident', 'keyword', 'marker-side']),
                value: 'match-self',
            },
            serialized: 'match-self',
        },
        value: 'match-self | match-parent',
    },
    'marker-start': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'marker-start']),
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
                representation: 'alpha',
                type: new Set(['ident', 'keyword', 'mask-border-mode']),
                value: 'alpha',
            },
            serialized: 'alpha',
        },
        value: 'luminance | alpha',
    },
    'mask-border-outset': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['number']),
                        value: 0,
                    },
                ],
                ' ',
                new Set(['mask-border-outset']),
            ),
            serialized: '0',
        },
        value: '[<length> | <number>]{1,4}',
    },
    'mask-border-repeat': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'stretch',
                        type: new Set(['ident', 'keyword']),
                        value: 'stretch',
                    },
                ],
                ' ',
                new Set(['mask-border-repeat']),
            ),
            serialized: 'stretch',
        },
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'mask-border-slice': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: '0',
                                type: new Set(['number']),
                                value: 0,
                            },
                        ],
                    ),
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'fill?',
                    },
                ],
                ' ',
                new Set(['mask-border-slice']),
            ),
            serialized: '0',
        },
        value: '[<number> | <percentage>]{1,4} fill?',
    },
    'mask-border-source': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'mask-border-source']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <image>',
    },
    'mask-border-width': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword']),
                        value: 'auto',
                    },
                ],
                ' ',
                new Set(['mask-border-width']),
            ),
            serialized: 'auto',
        },
        value: '[<length-percentage> | <number> | auto]{1,4}',
    },
    'mask-clip': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'border-box',
                        type: new Set(['ident', 'keyword', 'box', 'shape-box', 'geometry-box']),
                        value: 'border-box',
                    },
                ],
                ',',
                new Set(['mask-clip']),
            ),
            serialized: 'border-box',
        },
        value: '[<geometry-box> | no-clip]#',
    },
    'mask-composite': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'add',
                        type: new Set(['ident', 'keyword', 'compositing-operator']),
                        value: 'add',
                    },
                ],
                ',',
                new Set(['mask-composite']),
            ),
            serialized: 'add',
        },
        value: '<compositing-operator>#',
    },
    'mask-image': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'none',
                        type: new Set(['ident', 'keyword', 'mask-reference']),
                        value: 'none',
                    },
                ],
                ',',
                new Set(['mask-image']),
            ),
            serialized: 'none',
        },
        value: '<mask-reference>#',
    },
    'mask-mode': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'match-source',
                        type: new Set(['ident', 'keyword', 'masking-mode']),
                        value: 'match-source',
                    },
                ],
                ',',
                new Set(['mask-mode']),
            ),
            serialized: 'match-source',
        },
        value: '<masking-mode>#',
    },
    'mask-origin': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'border-box',
                        type: new Set(['ident', 'keyword', 'box', 'shape-box', 'geometry-box']),
                        value: 'border-box',
                    },
                ],
                ',',
                new Set(['mask-origin']),
            ),
            serialized: 'border-box',
        },
        value: '<geometry-box>#',
    },
    'mask-position': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                        ' ',
                        new Set(['position']),
                    ),
                ],
                ',',
                new Set(['mask-position']),
            ),
            serialized: '0% 0%',
        },
        value: '<position>#',
    },
    'mask-repeat': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'repeat',
                                type: new Set(['ident', 'keyword']),
                                value: 'repeat',
                            },
                        ],
                        ' ',
                        new Set(['repeat-style']),
                    ),
                ],
                ',',
                new Set(['mask-repeat']),
            ),
            serialized: 'repeat',
        },
        value: '<repeat-style>#',
    },
    'mask-size': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'auto',
                                type: new Set(['ident', 'keyword']),
                                value: 'auto',
                            },
                        ],
                        ' ',
                        new Set(['bg-size']),
                    ),
                ],
                ',',
                new Set(['mask-size']),
            ),
            serialized: 'auto',
        },
        value: '<bg-size>#',
    },
    'mask-type': {
        initial: {
            parsed: {
                representation: 'luminance',
                type: new Set(['ident', 'keyword', 'mask-type']),
                value: 'luminance',
            },
            serialized: 'luminance',
        },
        value: 'luminance | alpha',
    },
    'masonry-auto-flow': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'pack',
                        type: new Set(['ident', 'keyword']),
                        value: 'pack',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'definite-first | ordered',
                    },
                ],
                ' ',
                new Set(['masonry-auto-flow']),
            ),
            serialized: 'pack',
        },
        value: '[pack | next] || [definite-first | ordered]',
    },
    'math-depth': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['number', 'integer', 'math-depth']),
                value: 0,
            },
            serialized: '0',
        },
        value: 'auto-add | add(<integer>) | <integer>',
    },
    'math-shift': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'math-shift']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | compact',
    },
    'math-style': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'math-style']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'max-width', 'max-block-size']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'max-height']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | stretch | fit-content | contain',
    },
    'max-inline-size': {
        group: 'max-size',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'max-width', 'max-inline-size']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: "<'max-width'>",
    },
    'max-lines': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'max-lines']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <integer>',
    },
    'max-width': {
        group: 'max-size',
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'max-width']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | stretch | fit-content | contain',
    },
    'min-block-size': {
        group: 'min-size',
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'min-width', 'min-block-size']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'min-height']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | stretch | fit-content | contain',
    },
    'min-inline-size': {
        group: 'min-size',
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'min-width', 'min-inline-size']),
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
                representation: 'legacy',
                type: new Set(['ident', 'keyword', 'min-intrinsic-sizing']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'min-width']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | stretch | fit-content | contain',
    },
    'mix-blend-mode': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'blend-mode', 'mix-blend-mode']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: '<blend-mode> | plus-darker | plus-lighter',
    },
    'nav-down': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'nav-down']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-left': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'nav-left']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-right': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'nav-right']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-up': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'nav-up']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'object-fit': {
        initial: {
            parsed: {
                representation: 'fill',
                type: new Set(['ident', 'keyword', 'object-fit']),
                value: 'fill',
            },
            serialized: 'fill',
        },
        value: 'fill | none | [contain | cover] || scale-down',
    },
    'object-position': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '50%',
                        type: new Set(['percentage', 'length-percentage']),
                        unit: '%',
                        value: 50,
                    },
                    {
                        representation: '50%',
                        type: new Set(['percentage', 'length-percentage']),
                        unit: '%',
                        value: 50,
                    },
                ],
                ' ',
                new Set(['position', 'object-position']),
            ),
            serialized: '50% 50%',
        },
        value: '<position>',
    },
    'object-view-box': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'object-view-box']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'offset-anchor']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <position>',
    },
    'offset-distance': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'offset-distance']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'offset-path']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <ray()> | <path()> | <url> | [<basic-shape> && <coord-box>?] | <coord-box>',
    },
    'offset-position': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'offset-position']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <position>',
    },
    'offset-rotate': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'auto',
                        type: new Set(['ident', 'keyword']),
                        value: 'auto',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<angle>',
                    },
                ],
                ' ',
                new Set(['offset-rotate']),
            ),
            serialized: 'auto',
        },
        value: '[auto | reverse] || <angle>',
    },
    'opacity': {
        initial: {
            parsed: {
                representation: '1',
                type: new Set(['number', 'alpha-value', 'opacity']),
                value: 1,
            },
            serialized: '1',
        },
        value: '<alpha-value>',
    },
    'order': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['number', 'integer', 'order']),
                value: 0,
            },
            serialized: '0',
        },
        value: '<integer>',
    },
    'orphans': {
        initial: {
            parsed: {
                representation: '2',
                type: new Set(['number', 'integer', 'orphans']),
                value: 2,
            },
            serialized: '2',
        },
        value: '<integer [0,∞]>',
    },
    'outline': {
        value: "<'outline-width'> || <'outline-style'> || <'outline-color'>",
    },
    'outline-color': {
        initial: {
            parsed: {
                representation: 'invert',
                type: new Set(['ident', 'keyword', 'outline-color']),
                value: 'invert',
            },
            serialized: 'invert',
        },
        value: '<color> | invert',
    },
    'outline-offset': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'outline-offset']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'outline-line-style', 'outline-style']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'auto | <outline-line-style>',
    },
    'outline-width': {
        initial: {
            parsed: {
                representation: 'medium',
                type: new Set(['ident', 'keyword', 'line-width', 'outline-width']),
                value: 'medium',
            },
            serialized: 'medium',
        },
        value: '<line-width>',
    },
    'overflow': {
        value: '[visible | hidden | clip | scroll | auto]{1,2}',
    },
    'overflow-anchor': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'overflow-anchor']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'overflow-block': {
        group: 'overflow',
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'visible',
                        type: new Set(['ident', 'keyword']),
                        value: 'visible',
                    },
                ],
                ' ',
                new Set(['overflow', 'overflow-block']),
            ),
            serialized: 'visible',
        },
        value: "<'overflow'>",
    },
    'overflow-clip-margin': {
        initial: {
            parsed: createList(
                [
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<visual-box>',
                    },
                    {
                        representation: '0px',
                        type: new Set(['dimension', 'length']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['overflow-clip-margin']),
            ),
            serialized: '0px',
        },
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-inline': {
        group: 'overflow',
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'visible',
                        type: new Set(['ident', 'keyword']),
                        value: 'visible',
                    },
                ],
                ' ',
                new Set(['overflow', 'overflow-inline']),
            ),
            serialized: 'visible',
        },
        value: "<'overflow'>",
    },
    'overflow-wrap': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'overflow-wrap']),
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
                representation: 'visible',
                type: new Set(['ident', 'keyword', 'overflow-x']),
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
                representation: 'visible',
                type: new Set(['ident', 'keyword', 'overflow-y']),
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overscroll-behavior': {
        value: '[contain | none | auto]{1,2}',
    },
    'overscroll-behavior-block': {
        group: 'overscroll-behavior',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'overscroll-behavior-block']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'overscroll-behavior-inline']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'overscroll-behavior-x']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'overscroll-behavior-y']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-top', 'padding-block-end']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-top', 'padding-block-start']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-bottom']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-top', 'padding-inline-end']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-top', 'padding-inline-start']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-left']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-right']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'page']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <custom-ident>',
    },
    'page-break-after': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'page-break-after']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | always | avoid | left | right',
    },
    'page-break-before': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'page-break-before']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | always | avoid | left | right',
    },
    'page-break-inside': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'page-break-inside']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'avoid | auto',
    },
    'page-transition-tag': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'page-transition-tag']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>',
    },
    'paint-order': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'paint-order']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | [fill || stroke || markers]',
    },
    'pause': {
        value: "<'pause-before'> <'pause-after'>?",
    },
    'pause-after': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'pause-after']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'pause-before': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'pause-before']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'perspective': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'perspective']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length [0,∞]>',
    },
    'perspective-origin': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '50%',
                        type: new Set(['percentage', 'length-percentage']),
                        unit: '%',
                        value: 50,
                    },
                    {
                        representation: '50%',
                        type: new Set(['percentage', 'length-percentage']),
                        unit: '%',
                        value: 50,
                    },
                ],
                ' ',
                new Set(['position', 'perspective-origin']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'pointer-events']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | bounding-box | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | none',
    },
    'position': {
        initial: {
            parsed: {
                representation: 'static',
                type: new Set(['ident', 'keyword', 'position']),
                value: 'static',
            },
            serialized: 'static center',
        },
        value: 'static | relative | absolute | sticky | fixed | running(<custom-ident>)',
    },
    'position-fallback': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'position-fallback']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <dashed-ident>',
    },
    'print-color-adjust': {
        initial: {
            parsed: {
                representation: 'economy',
                type: new Set(['ident', 'keyword', 'print-color-adjust']),
                value: 'economy',
            },
            serialized: 'economy',
        },
        value: 'economy | exact',
    },
    'quotes': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'quotes']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | [<string> <string>]+',
    },
    'r': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'r']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'region-fragment': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'region-fragment']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | break',
    },
    'resize': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'resize']),
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
                representation: 'none',
                type: new Set(['ident', 'keyword', 'rest-after']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'rest-before': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'rest-before']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'right': {
        group: 'inset',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'right']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'rotate': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'rotate']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <angle> | [x | y | z | <number>{3}] && <angle>',
    },
    'row-gap': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'row-gap']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage [0,∞]>',
    },
    'ruby-align': {
        initial: {
            parsed: {
                representation: 'space-around',
                type: new Set(['ident', 'keyword', 'ruby-align']),
                value: 'space-around',
            },
            serialized: 'space-around',
        },
        value: 'start | center | space-between | space-around',
    },
    'ruby-merge': {
        initial: {
            parsed: {
                representation: 'separate',
                type: new Set(['ident', 'keyword', 'ruby-merge']),
                value: 'separate',
            },
            serialized: 'separate',
        },
        value: 'separate | merge | auto',
    },
    'ruby-overhang': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'ruby-overhang']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none',
    },
    'ruby-position': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'alternate',
                        type: new Set(['ident', 'keyword']),
                        value: 'alternate',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'over | under',
                    },
                ],
                ' ',
                new Set(['ruby-position']),
            ),
            serialized: 'alternate',
        },
        value: '[alternate || [over | under]] | inter-character',
    },
    'rx': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'rx']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<length-percentage> | auto',
    },
    'ry': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'ry']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: '<length-percentage> | auto',
    },
    'scale': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'scale']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [<number> | <percentage>]{1,3}',
    },
    'scroll-behavior': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-behavior']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | smooth',
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-block-end']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-block-start']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-bottom']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-inline-end']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-inline-start']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-left']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-right']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'scroll-margin-top']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length>',
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-block-end']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-block-start']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-bottom']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-inline-end']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-inline-start']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-left']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-right']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-padding-top']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]>',
    },
    'scroll-snap-align': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'none',
                        type: new Set(['ident', 'keyword']),
                        value: 'none',
                    },
                ],
                ' ',
                new Set(['scroll-snap-align']),
            ),
            serialized: 'none',
        },
        value: '[none | start | end | center]{1,2}',
    },
    'scroll-snap-stop': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'scroll-snap-stop']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | always',
    },
    'scroll-snap-type': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'scroll-snap-type']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [x | y | block | inline | both] [mandatory | proximity]?',
    },
    'scroll-start': {
        value: '[auto | start | end | center | left | right | top | bottom | <length-percentage [0,∞]>]{1,2}',
    },
    'scroll-start-block': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-start-block']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | start | end | center | <length-percentage [0,∞]>',
    },
    'scroll-start-inline': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-start-inline']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | start | end | center | <length-percentage [0,∞]>',
    },
    'scroll-start-target': {
        value: 'none | auto',
    },
    'scroll-start-x': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-start-x']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | start | end | center | <length-percentage [0,∞]>',
    },
    'scroll-start-y': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scroll-start-y']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | start | end | center | <length-percentage [0,∞]>',
    },
    'scroll-timeline': {
        value: "<'scroll-timeline-name'> || <'scroll-timeline-axis'>",
    },
    'scroll-timeline-axis': {
        initial: {
            parsed: {
                representation: 'block',
                type: new Set(['ident', 'keyword', 'scroll-timeline-axis']),
                value: 'block',
            },
            serialized: 'block',
        },
        value: 'block | inline | vertical | horizontal',
    },
    'scroll-timeline-name': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'scroll-timeline-name']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>',
    },
    'scrollbar-color': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scrollbar-color']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <color>{2}',
    },
    'scrollbar-gutter': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scrollbar-gutter']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | stable && both-edges?',
    },
    'scrollbar-width': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'scrollbar-width']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | thin | none',
    },
    'shape-image-threshold': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['number', 'alpha-value', 'shape-image-threshold']),
                value: 0,
            },
            serialized: '0',
        },
        value: '<alpha-value>',
    },
    'shape-inside': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'shape-inside']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | outside-shape | [<basic-shape> || shape-box] | <image> | display',
    },
    'shape-margin': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'shape-margin']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'shape-outside': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'shape-outside']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [<basic-shape> || <shape-box>] | <image>',
    },
    'shape-padding': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'shape-padding']),
                unit: 'px',
                value: 0,
            },
            serialized: '0px',
        },
        value: '<length-percentage>',
    },
    'shape-rendering': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'shape-rendering']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | optimizeSpeed | crispEdges | geometricPrecision',
    },
    'shape-subtract': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'shape-subtract']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [<basic-shape>| <uri>]+',
    },
    'spatial-navigation-action': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'spatial-navigation-action']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | focus | scroll',
    },
    'spatial-navigation-contain': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'spatial-navigation-contain']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | contain',
    },
    'spatial-navigation-function': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'spatial-navigation-function']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | grid',
    },
    'speak': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'speak']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | never | always',
    },
    'speak-as': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'speak-as']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | spell-out || digits || [literal-punctuation | no-punctuation]',
    },
    'stop-color': {
        initial: {
            parsed: {
                representation: 'black',
                type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color', 'stop-color']),
                value: 'black',
            },
            serialized: 'black',
        },
        value: "<'color'>",
    },
    'stop-opacity': {
        initial: {
            parsed: {
                representation: '1',
                type: new Set(['number', 'alpha-value', 'opacity', 'stop-opacity']),
                value: 1,
            },
            serialized: '1',
        },
        value: "<'opacity'>",
    },
    'string-set': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'custom-ident', 'keyword', 'string-set']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '[<custom-ident> <content-list>]# | none',
    },
    'stroke': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'paint', 'stroke']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: '<paint>',
    },
    'stroke-align': {
        initial: {
            parsed: {
                representation: 'center',
                type: new Set(['ident', 'keyword', 'stroke-align']),
                value: 'center',
            },
            serialized: 'center',
        },
        value: 'center | inset | outset',
    },
    'stroke-alignment': {
        initial: {
            parsed: {
                representation: 'center',
                type: new Set(['ident', 'keyword', 'stroke-alignment']),
                value: 'center',
            },
            serialized: 'center',
        },
        value: 'center | inner | outer',
    },
    'stroke-break': {
        initial: {
            parsed: {
                representation: 'bounding-box',
                type: new Set(['ident', 'keyword', 'stroke-break']),
                value: 'bounding-box',
            },
            serialized: 'bounding-box',
        },
        value: 'bounding-box | slice | clone',
    },
    'stroke-color': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'transparent',
                        type: new Set(['ident', 'keyword', 'absolute-color-base', 'color']),
                        value: 'transparent',
                    },
                ],
                ',',
                new Set(['stroke-color']),
            ),
            serialized: 'transparent',
        },
        value: '<color>#',
    },
    'stroke-dash-corner': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'stroke-dash-corner']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length>',
    },
    'stroke-dash-justify': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'stroke-dash-justify']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [stretch | compress] || [dashes || gaps]',
    },
    'stroke-dashadjust': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'stroke-dashadjust']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [stretch | compress] [dashes | gaps]?',
    },
    'stroke-dasharray': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'stroke-dasharray']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <dasharray>',
    },
    'stroke-dashcorner': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'stroke-dashcorner']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length>',
    },
    'stroke-dashoffset': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['number', 'length-percentage', 'stroke-dashoffset']),
                value: 0,
            },
            serialized: '0',
        },
        value: '<length-percentage> | <number>',
    },
    'stroke-image': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'none',
                        type: new Set(['ident', 'keyword', 'paint']),
                        value: 'none',
                    },
                ],
                ',',
                new Set(['stroke-image']),
            ),
            serialized: 'none',
        },
        value: '<paint>#',
    },
    'stroke-linecap': {
        initial: {
            parsed: {
                representation: 'butt',
                type: new Set(['ident', 'keyword', 'stroke-linecap']),
                value: 'butt',
            },
            serialized: 'butt',
        },
        value: 'butt | round | square',
    },
    'stroke-linejoin': {
        initial: {
            parsed: {
                representation: 'miter',
                type: new Set(['ident', 'keyword', 'stroke-linejoin']),
                value: 'miter',
            },
            serialized: 'miter',
        },
        value: 'miter | miter-clip | round | bevel | arcs',
    },
    'stroke-miterlimit': {
        initial: {
            parsed: {
                representation: '4',
                type: new Set(['number', 'stroke-miterlimit']),
                value: 4,
            },
            serialized: '4',
        },
        value: '<number>',
    },
    'stroke-opacity': {
        initial: {
            parsed: {
                representation: '1',
                type: new Set(['number', 'alpha-value', 'opacity', 'stroke-opacity']),
                value: 1,
            },
            serialized: '1',
        },
        value: "<'opacity'>",
    },
    'stroke-origin': {
        initial: {
            parsed: {
                representation: 'match-parent',
                type: new Set(['ident', 'keyword', 'stroke-origin']),
                value: 'match-parent',
            },
            serialized: 'match-parent',
        },
        value: 'match-parent | fill-box | stroke-box | content-box | padding-box | border-box',
    },
    'stroke-position': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                            {
                                representation: '0%',
                                type: new Set(['percentage', 'length-percentage']),
                                unit: '%',
                                value: 0,
                            },
                        ],
                        ' ',
                        new Set(['position']),
                    ),
                ],
                ',',
                new Set(['stroke-position']),
            ),
            serialized: '0% 0%',
        },
        value: '<position>#',
    },
    'stroke-repeat': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'repeat',
                                type: new Set(['ident', 'keyword']),
                                value: 'repeat',
                            },
                        ],
                        ' ',
                        new Set(['repeat-style']),
                    ),
                ],
                ',',
                new Set(['stroke-repeat']),
            ),
            serialized: 'repeat',
        },
        value: '<repeat-style>#',
    },
    'stroke-size': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: 'auto',
                                type: new Set(['ident', 'keyword']),
                                value: 'auto',
                            },
                        ],
                        ' ',
                        new Set(['bg-size']),
                    ),
                ],
                ',',
                new Set(['stroke-size']),
            ),
            serialized: 'auto',
        },
        value: '<bg-size>#',
    },
    'stroke-width': {
        initial: {
            parsed: {
                representation: '1px',
                type: new Set(['dimension', 'length', 'length-percentage', 'stroke-width']),
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
                representation: '8',
                type: new Set(['number', 'tab-size']),
                value: 8,
            },
            serialized: '8',
        },
        value: '<number> | <length>',
    },
    'table-layout': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'table-layout']),
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
                representation: 'start',
                type: new Set(['ident', 'keyword', 'text-align-all']),
                value: 'start',
            },
            serialized: 'start',
        },
        value: 'start | end | left | right | center | justify | match-parent',
    },
    'text-align-last': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-align-last']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | start | end | left | right | center | justify | match-parent',
    },
    'text-anchor': {
        initial: {
            parsed: {
                representation: 'start',
                type: new Set(['ident', 'keyword', 'text-anchor']),
                value: 'start',
            },
            serialized: 'start',
        },
        value: 'start | middle | end',
    },
    'text-combine-upright': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-combine-upright']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | all | [digits <integer [2,4]>?]',
    },
    'text-decoration': {
        value: "<'text-decoration-line'> || <'text-decoration-thickness'> || <'text-decoration-style'> || <'text-decoration-color'>",
    },
    'text-decoration-color': {
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'text-decoration-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'text-decoration-line': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-decoration-line']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [underline || overline || line-through || blink] | spelling-error | grammar-error',
    },
    'text-decoration-skip': {
        value: 'none | auto',
    },
    'text-decoration-skip-box': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-decoration-skip-box']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | all',
    },
    'text-decoration-skip-ink': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-decoration-skip-ink']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | all',
    },
    'text-decoration-skip-self': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-decoration-skip-self']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | skip-all | [skip-underline || skip-overline || skip-line-through] | no-skip',
    },
    'text-decoration-skip-spaces': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'start',
                        type: new Set(['ident', 'keyword']),
                        value: 'start',
                    },
                    {
                        representation: 'end',
                        type: new Set(['ident', 'keyword']),
                        value: 'end',
                    },
                ],
                ' ',
                new Set(['text-decoration-skip-spaces']),
            ),
            serialized: 'start end',
        },
        value: 'none | all | [start || end]',
    },
    'text-decoration-style': {
        initial: {
            parsed: {
                representation: 'solid',
                type: new Set(['ident', 'keyword', 'text-decoration-style']),
                value: 'solid',
            },
            serialized: 'solid',
        },
        value: 'solid | double | dotted | dashed | wavy',
    },
    'text-decoration-thickness': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-decoration-thickness']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | from-font | <length> | <percentage>',
    },
    'text-decoration-trim': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length']),
                        unit: 'px',
                        value: 0,
                    },
                ],
                ' ',
                new Set(['text-decoration-trim']),
            ),
            serialized: '0px',
        },
        value: '<length>{1,2} | auto',
    },
    'text-edge': {
        initial: {
            parsed: {
                representation: 'leading',
                type: new Set(['ident', 'keyword', 'text-edge']),
                value: 'leading',
            },
            serialized: 'leading',
        },
        value: 'leading | [text | cap | ex | ideographic | ideographic-ink] [text | alphabetic | ideographic | ideographic-ink]?',
    },
    'text-emphasis': {
        value: "<'text-emphasis-style'> || <'text-emphasis-color'>",
    },
    'text-emphasis-color': {
        initial: {
            parsed: {
                representation: 'currentcolor',
                type: new Set(['ident', 'keyword', 'color', 'text-emphasis-color']),
                value: 'currentcolor',
            },
            serialized: 'currentcolor',
        },
        value: '<color>',
    },
    'text-emphasis-position': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'over',
                        type: new Set(['ident', 'keyword']),
                        value: 'over',
                    },
                    {
                        representation: 'right',
                        type: new Set(['ident', 'keyword']),
                        value: 'right',
                    },
                ],
                ' ',
                new Set(['text-emphasis-position']),
            ),
            serialized: 'over right',
        },
        value: '[over | under] && [right | left]?',
    },
    'text-emphasis-skip': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'spaces',
                        type: new Set(['ident', 'keyword']),
                        value: 'spaces',
                    },
                    {
                        representation: 'punctuation',
                        type: new Set(['ident', 'keyword']),
                        value: 'punctuation',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'symbols',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'narrow',
                    },
                ],
                ' ',
                new Set(['text-emphasis-skip']),
            ),
            serialized: 'spaces punctuation',
        },
        value: 'spaces || punctuation || symbols || narrow',
    },
    'text-emphasis-style': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-emphasis-style']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [[filled | open] || [dot | circle | double-circle | triangle | sesame]] | <string>',
    },
    'text-group-align': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-group-align']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | start | end | left | right | center',
    },
    'text-indent': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0',
                        type: new Set(['dimension', 'length', 'length-percentage']),
                        unit: 'px',
                        value: 0,
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'hanging?',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: 'each-line?',
                    },
                ],
                ' ',
                new Set(['text-indent']),
            ),
            serialized: '0px',
        },
        value: '[<length-percentage>] && hanging? && each-line?',
    },
    'text-justify': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-justify']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | inter-word | inter-character',
    },
    'text-orientation': {
        initial: {
            parsed: {
                representation: 'mixed',
                type: new Set(['ident', 'keyword', 'text-orientation']),
                value: 'mixed',
            },
            serialized: 'mixed',
        },
        value: 'mixed | upright | sideways',
    },
    'text-overflow': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'clip',
                        type: new Set(['ident', 'keyword']),
                        value: 'clip',
                    },
                ],
                ' ',
                new Set(['text-overflow']),
            ),
            serialized: 'clip',
        },
        value: '[clip | ellipsis | <string> | fade | <fade()>]{1,2}',
    },
    'text-rendering': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-rendering']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | optimizeSpeed | optimizeLegibility | geometricPrecision',
    },
    'text-shadow': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-shadow']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <shadow>#',
    },
    'text-size-adjust': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-size-adjust']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | <percentage [0,∞]>',
    },
    'text-space-collapse': {
        initial: {
            parsed: {
                representation: 'collapse',
                type: new Set(['ident', 'keyword', 'text-space-collapse']),
                value: 'collapse',
            },
            serialized: 'collapse',
        },
        value: 'collapse | discard | preserve | preserve-breaks | preserve-spaces',
    },
    'text-space-trim': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-space-trim']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | trim-inner || discard-before || discard-after',
    },
    'text-spacing': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'text-spacing']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | none | auto | no-compress || [trim-start | space-start | space-first] || [trim-end | space-end | allow-end] || [trim-adjacent | space-adjacent] || ideograph-alpha || ideograph-numeric || punctuation',
    },
    'text-transform': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'text-transform']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | [capitalize | uppercase | lowercase] || full-width || full-size-kana | math-auto | math-bold | math-italic | math-bold-italic | math-double-struck | math-bold-fraktur | math-script | math-bold-script | math-fraktur | math-sans-serif | math-bold-sans-serif | math-sans-serif-italic | math-sans-serif-bold-italic | math-monospace | math-initial | math-tailed | math-looped | math-stretched',
    },
    'text-underline-offset': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-underline-offset']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length> | <percentage>',
    },
    'text-underline-position': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'text-underline-position']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | [from-font | under] || [left | right]',
    },
    'text-wrap': {
        initial: {
            parsed: {
                representation: 'wrap',
                type: new Set(['ident', 'keyword', 'text-wrap']),
                value: 'wrap',
            },
            serialized: 'wrap',
        },
        value: 'wrap | nowrap | balance | stable | pretty',
    },
    'top': {
        group: 'inset',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'top']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage>',
    },
    'touch-action': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'touch-action']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | none | [[pan-x | pan-left | pan-right] || [pan-y | pan-up | pan-down] || pinch-zoom] | manipulation',
    },
    'transform': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'transform']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <transform-list>',
    },
    'transform-box': {
        initial: {
            parsed: {
                representation: 'view-box',
                type: new Set(['ident', 'keyword', 'transform-box']),
                value: 'view-box',
            },
            serialized: 'view-box',
        },
        value: 'content-box | border-box | fill-box | stroke-box | view-box',
    },
    'transform-origin': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '50%',
                        type: new Set(['percentage', 'length-percentage', 'transform-origin']),
                        unit: '%',
                        value: 50,
                    },
                    {
                        representation: '50%',
                        type: new Set(['percentage', 'length-percentage']),
                        unit: '%',
                        value: 50,
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<length>?',
                    },
                ],
                ' ',
                new Set(['transform-origin']),
            ),
            serialized: '50% 50%',
        },
        value: '[left | center | right | top | bottom | <length-percentage>] | [left | center | right | <length-percentage>] [top | center | bottom | <length-percentage>] <length>? | [[center | left | right] && [center | top | bottom]] <length>?',
    },
    'transform-style': {
        initial: {
            parsed: {
                representation: 'flat',
                type: new Set(['ident', 'keyword', 'transform-style']),
                value: 'flat',
            },
            serialized: 'flat',
        },
        value: 'flat | preserve-3d',
    },
    'transition': {
        value: '<single-transition>#',
    },
    'transition-delay': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0s',
                        type: new Set(['dimension', 'time']),
                        unit: 's',
                        value: 0,
                    },
                ],
                ',',
                new Set(['transition-delay']),
            ),
            serialized: '0s',
        },
        value: '<time>#',
    },
    'transition-duration': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: '0s',
                        type: new Set(['dimension', 'time']),
                        unit: 's',
                        value: 0,
                    },
                ],
                ',',
                new Set(['transition-duration']),
            ),
            serialized: '0s',
        },
        value: '<time [0s,∞]>#',
    },
    'transition-property': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'all',
                        type: new Set(['ident', 'keyword', 'single-transition-property']),
                        value: 'all',
                    },
                ],
                ',',
                new Set(['transition-property']),
            ),
            serialized: 'all',
        },
        value: 'none | <single-transition-property>#',
    },
    'transition-timing-function': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'ease',
                        type: new Set(['ident', 'keyword', 'cubic-bezier-easing-function', 'easing-function']),
                        value: 'ease',
                    },
                ],
                ',',
                new Set(['transition-timing-function']),
            ),
            serialized: 'ease',
        },
        value: '<easing-function>#',
    },
    'translate': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'translate']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <length-percentage> [<length-percentage> <length>?]?',
    },
    'unicode-bidi': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'unicode-bidi']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | embed | isolate | bidi-override | isolate-override | plaintext',
    },
    'user-select': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'user-select']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | text | none | contain | all',
    },
    'vector-effect': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'vector-effect']),
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
        value: "[<'view-timeline-name'> || <'view-timeline-axis'>]#",
    },
    'view-timeline-axis': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'block',
                        type: new Set(['ident', 'keyword']),
                        value: 'block',
                    },
                ],
                ',',
                new Set(['view-timeline-axis']),
            ),
            serialized: 'block',
        },
        value: '[block | inline | vertical | horizontal]#',
    },
    'view-timeline-inset': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                            {
                                representation: '0',
                                type: new Set(['dimension', 'length', 'length-percentage']),
                                unit: 'px',
                                value: 0,
                            },
                        ],
                    ),
                ],
                ',',
                new Set(['view-timeline-inset']),
            ),
            serialized: '0px',
        },
        value: '[[auto | <length-percentage>]{1,2}]#',
    },
    'view-timeline-name': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'view-timeline-name']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | <custom-ident>#',
    },
    'visibility': {
        initial: {
            parsed: {
                representation: 'visible',
                type: new Set(['ident', 'keyword', 'visibility']),
                value: 'visible',
            },
            serialized: 'visible',
        },
        value: 'visible | hidden | collapse',
    },
    'voice-balance': {
        initial: {
            parsed: {
                representation: 'center',
                type: new Set(['ident', 'keyword', 'voice-balance']),
                value: 'center',
            },
            serialized: 'center',
        },
        value: '<number> | left | center | right | leftwards | rightwards',
    },
    'voice-duration': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'voice-duration']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <time>',
    },
    'voice-family': {
        initial: {
            parsed: createList(
                [
                    createList(
                        [
                        ],
                    ),
                    {
                        representation: 'female',
                        type: new Set(['ident', 'custom-ident', 'family-name', 'keyword', 'gender']),
                        value: 'female',
                    },
                ],
                ' ',
                new Set(['voice-family']),
            ),
            serialized: 'female',
        },
        value: '[[<family-name> | <generic-voice>],]* [<family-name> | <generic-voice>] | preserve',
    },
    'voice-pitch': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'medium',
                        type: new Set(['ident', 'keyword']),
                        value: 'medium',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<frequency> | <semitones> | <percentage>',
                    },
                ],
                ' ',
                new Set(['voice-pitch']),
            ),
            serialized: 'medium',
        },
        value: '<frequency> && absolute | [[x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]]',
    },
    'voice-range': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'medium',
                        type: new Set(['ident', 'keyword']),
                        value: 'medium',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<frequency> | <semitones> | <percentage>',
                    },
                ],
                ' ',
                new Set(['voice-range']),
            ),
            serialized: 'medium',
        },
        value: '<frequency> && absolute | [[x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]]',
    },
    'voice-rate': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'normal',
                        type: new Set(['ident', 'keyword']),
                        value: 'normal',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<percentage>',
                    },
                ],
                ' ',
                new Set(['voice-rate']),
            ),
            serialized: 'normal',
        },
        value: '[normal | x-slow | slow | medium | fast | x-fast] || <percentage>',
    },
    'voice-stress': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'voice-stress']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | strong | moderate | none | reduced',
    },
    'voice-volume': {
        initial: {
            parsed: createList(
                [
                    {
                        representation: 'medium',
                        type: new Set(['ident', 'keyword']),
                        value: 'medium',
                    },
                    {
                        omitted: true,
                        type: new Set([]),
                        value: '<decibel>',
                    },
                ],
                ' ',
                new Set(['voice-volume']),
            ),
            serialized: 'medium',
        },
        value: 'silent | [[x-soft | soft | medium | loud | x-loud] || <decibel>]',
    },
    'white-space': {
        value: 'normal | pre | nowrap | pre-wrap | break-spaces | pre-line',
    },
    'widows': {
        initial: {
            parsed: {
                representation: '2',
                type: new Set(['number', 'integer', 'widows']),
                value: 2,
            },
            serialized: '2',
        },
        value: '<integer [0,∞]>',
    },
    'width': {
        group: 'size',
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'width']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <length-percentage [0,∞]> | min-content | max-content | fit-content(<length-percentage [0,∞]>) | stretch | fit-content | contain',
    },
    'will-change': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'will-change']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <animateable-feature>#',
    },
    'word-boundary-detection': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'word-boundary-detection']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | manual | auto(<lang>)',
    },
    'word-boundary-expansion': {
        initial: {
            parsed: {
                representation: 'none',
                type: new Set(['ident', 'keyword', 'word-boundary-expansion']),
                value: 'none',
            },
            serialized: 'none',
        },
        value: 'none | space | ideographic-space',
    },
    'word-break': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'word-break']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | keep-all | break-all | break-word',
    },
    'word-spacing': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'word-spacing']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | <length-percentage>',
    },
    'word-wrap': {
        initial: {
            parsed: {
                representation: 'normal',
                type: new Set(['ident', 'keyword', 'word-wrap']),
                value: 'normal',
            },
            serialized: 'normal',
        },
        value: 'normal | break-word | anywhere',
    },
    'wrap-after': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'wrap-after']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-before': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'wrap-before']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-flow': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'wrap-flow']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | both | start | end | minimum | maximum | clear',
    },
    'wrap-inside': {
        initial: {
            parsed: {
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'wrap-inside']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | avoid',
    },
    'wrap-through': {
        initial: {
            parsed: {
                representation: 'wrap',
                type: new Set(['ident', 'keyword', 'wrap-through']),
                value: 'wrap',
            },
            serialized: 'wrap',
        },
        value: 'wrap | none',
    },
    'writing-mode': {
        initial: {
            parsed: {
                representation: 'horizontal-tb',
                type: new Set(['ident', 'keyword', 'writing-mode']),
                value: 'horizontal-tb',
            },
            serialized: 'horizontal-tb',
        },
        value: 'horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr',
    },
    'x': {
        initial: {
            parsed: {
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'x']),
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
                representation: '0',
                type: new Set(['dimension', 'length', 'length-percentage', 'y']),
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
                representation: 'auto',
                type: new Set(['ident', 'keyword', 'z-index']),
                value: 'auto',
            },
            serialized: 'auto',
        },
        value: 'auto | <integer>',
    },
}
