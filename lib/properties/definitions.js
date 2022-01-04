
// Generated from /var/www/packages/css/scripts/initial.js

const createList = require('../values/value.js')

module.exports = {
    '-webkit-background-clip': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'border-box | padding-box | content-box | text | none',
    },
    '-webkit-line-clamp': {
        value: 'none | <integer>',
    },
    '-webkit-text-fill-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    '-webkit-text-stroke': {
        value: '<line-width> || <color>',
    },
    '-webkit-text-stroke-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    '-webkit-text-stroke-width': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'line-width']), value: 0 },
        value: '<line-width>',
    },
    'accent-color': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <color>',
    },
    'align-content': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>',
    },
    'align-items': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | stretch | <baseline-position> | [<overflow-position>? <self-position>]',
    },
    'align-self': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position>',
    },
    'align-tracks': {
        initial: 'normal',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'normal' },
            ],
            ',',
        ),
        value: '[normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>]#',
    },
    'alignment-baseline': {
        initial: 'baseline',
        representation: { type: new Set(['ident', 'keyword']), value: 'baseline' },
        value: 'baseline | text-bottom | alphabetic | ideographic | middle | central | mathematical | text-top',
    },
    'all': {
        value: 'initial | inherit | unset | revert | revert-layer',
    },
    'animation': {
        value: '<single-animation>#',
    },
    'animation-composition': {
        initial: 'replace',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-composition']), value: 'replace' },
            ],
            ',',
        ),
        value: '<single-animation-composition>#',
    },
    'animation-delay': {
        initial: '0s',
        representation: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'animation-direction': {
        initial: 'normal',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-direction']), value: 'normal' },
            ],
            ',',
        ),
        value: '<single-animation-direction>#',
    },
    'animation-duration': {
        initial: '0s',
        representation: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'animation-fill-mode': {
        initial: 'none',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-fill-mode']), value: 'none' },
            ],
            ',',
        ),
        value: '<single-animation-fill-mode>#',
    },
    'animation-iteration-count': {
        initial: '1',
        representation: createList(
            [
                { type: new Set(['integer', 'number', 'single-animation-iteration-count']), value: 1 },
            ],
            ',',
        ),
        value: '<single-animation-iteration-count>#',
    },
    'animation-name': {
        initial: 'none',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'none' },
            ],
            ',',
        ),
        value: '[none | <keyframes-name>]#',
    },
    'animation-play-state': {
        initial: 'running',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-play-state']), value: 'running' },
            ],
            ',',
        ),
        value: '<single-animation-play-state>#',
    },
    'animation-timeline': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-timeline']), value: 'auto' },
            ],
            ',',
        ),
        value: '<single-animation-timeline>#',
    },
    'animation-timing-function': {
        initial: 'ease',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'cubic-bezier-easing-function', 'easing-function']), value: 'ease' },
            ],
            ',',
        ),
        value: '<easing-function>#',
    },
    'appearance': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | auto | textfield | menulist-button | <compat-auto>',
    },
    'aspect-ratio': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: 'auto || <ratio>',
    },
    'backdrop-filter': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <filter-value-list>',
    },
    'backface-visibility': {
        initial: 'visible',
        representation: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden',
    },
    'background': {
        value: '[<bg-layer># ,]? <final-bg-layer>',
    },
    'background-attachment': {
        initial: 'scroll',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'attachment']), value: 'scroll' },
            ],
            ',',
        ),
        value: '<attachment>#',
    },
    'background-blend-mode': {
        initial: 'normal',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'blend-mode']), value: 'normal' },
            ],
            ',',
        ),
        value: '<blend-mode>#',
    },
    'background-clip': {
        initial: 'border-box',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'box']), value: 'border-box' },
            ],
            ',',
        ),
        value: '<box>#',
    },
    'background-color': {
        initial: 'transparent',
        representation: { type: new Set(['ident', 'keyword', 'absolute-color-base', 'color']), value: 'transparent' },
        value: '<color>',
    },
    'background-image': {
        initial: 'none',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'bg-image']), value: 'none' },
            ],
            ',',
        ),
        value: '<bg-image>#',
    },
    'background-origin': {
        initial: 'padding-box',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'box']), value: 'padding-box' },
            ],
            ',',
        ),
        value: '<box>#',
    },
    'background-position': {
        initial: '0% 0%',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['percentage', 'length-percentage', 'bg-position']), value: 0 },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                    ' ',
                    new Set(['bg-position']),
                ),
            ],
            ',',
        ),
        value: '<bg-position>#',
    },
    'background-position-block': {
        initial: '0%',
        representation: createList(
            [
                createList(
                    [
                        { omitted: true, type: new Set([]) },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                ),
            ],
            ',',
        ),
        value: '[center | [start | end]? <length-percentage>?]#',
    },
    'background-position-inline': {
        initial: '0%',
        representation: createList(
            [
                createList(
                    [
                        { omitted: true, type: new Set([]) },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                ),
            ],
            ',',
        ),
        value: '[center | [start | end]? <length-percentage>?]#',
    },
    'background-position-x': {
        initial: '0%',
        representation: createList(
            [
                createList(
                    [
                        { omitted: true, type: new Set([]) },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                ),
            ],
            ',',
        ),
        value: '[center | [[left | right | x-start | x-end]? <length-percentage>?]!]#',
    },
    'background-position-y': {
        initial: '0%',
        representation: createList(
            [
                createList(
                    [
                        { omitted: true, type: new Set([]) },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                ),
            ],
            ',',
        ),
        value: '[center | [[top | bottom | y-start | y-end]? <length-percentage>?]!]#',
    },
    'background-repeat': {
        initial: 'repeat',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'repeat' },
                    ],
                    ' ',
                    new Set(['repeat-style']),
                ),
            ],
            ',',
        ),
        value: '<repeat-style>#',
    },
    'background-size': {
        initial: 'auto',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'auto' },
                    ],
                    ' ',
                    new Set(['bg-size']),
                ),
            ],
            ',',
        ),
        value: '<bg-size>#',
    },
    'baseline-shift': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | sub | super | top | center | bottom',
    },
    'baseline-source': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | first | last',
    },
    'block-ellipsis': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | auto | <string>',
    },
    'block-size': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'width']), value: 'auto' },
        value: "<'width'>",
    },
    'block-step': {
        value: "<'block-step-size'> || <'block-step-insert'> || <'block-step-align'> || <'block-step-round'>",
    },
    'block-step-align': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | center | start | end',
    },
    'block-step-insert': {
        initial: 'margin',
        representation: { type: new Set(['ident', 'keyword']), value: 'margin' },
        value: 'margin | padding',
    },
    'block-step-round': {
        initial: 'up',
        representation: { type: new Set(['ident', 'keyword']), value: 'up' },
        value: 'up | down | nearest',
    },
    'block-step-size': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length>',
    },
    'bookmark-label': {
        initial: 'content(text)',
        representation: createList(
            [
                {
                    name: 'content',
                    type: new Set(['function', 'content()']),
                    value: { type: new Set(['ident', 'keyword']), value: 'text' },
                },
            ],
            ' ',
            new Set(['content-list']),
        ),
        value: '<content-list>',
    },
    'bookmark-level': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <integer>',
    },
    'bookmark-state': {
        initial: 'open',
        representation: { type: new Set(['ident', 'keyword']), value: 'open' },
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
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-block-end-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-block-end-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
        value: "<'border-top-width'>",
    },
    'border-block-start': {
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-block-start-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-block-start-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-block-start-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
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
        initial: 'currentColor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-bottom-left-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-right-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-bottom-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-boundary': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | parent | display',
    },
    'border-clip': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-bottom': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-left': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-right': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-top': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-collapse': {
        initial: 'separate',
        representation: { type: new Set(['ident', 'keyword']), value: 'separate' },
        value: 'separate | collapse',
    },
    'border-color': {
        value: '<color>{1,4}',
    },
    'border-end-end-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
            ' ',
            new Set(['border-top-left-radius']),
        ),
        value: "<'border-top-left-radius'>",
    },
    'border-end-start-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
            ' ',
            new Set(['border-top-left-radius']),
        ),
        value: "<'border-top-left-radius'>",
    },
    'border-image': {
        value: "<'border-image-source'> || <'border-image-slice'> [/ <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'>]? || <'border-image-repeat'>",
    },
    'border-image-outset': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '[<length [0,∞]> | <number [0,∞]>]{1,4}',
    },
    'border-image-repeat': {
        initial: 'stretch',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'stretch' },
            ],
        ),
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'border-image-slice': {
        initial: '100%',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['percentage']), value: 100 },
                    ],
                ),
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[<number [0,∞]> | <percentage [0,∞]>]{1,4} && fill?',
    },
    'border-image-source': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <image>',
    },
    'border-image-width': {
        initial: '1',
        representation: createList(
            [
                { type: new Set(['integer', 'number']), value: 1 },
            ],
        ),
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
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-inline-end-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-inline-end-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
        value: "<'border-top-width'>",
    },
    'border-inline-start': {
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-inline-start-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-inline-start-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-inline-start-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
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
        initial: 'currentColor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-left-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-left-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-limit': {
        initial: 'round',
        representation: { type: new Set(['ident', 'keyword']), value: 'round' },
        value: 'all | round | [sides | corners] <length-percentage [0,∞]>? | [top | right | bottom | left] <length-percentage [0,∞]>',
    },
    'border-radius': {
        value: '<length-percentage [0,∞]>{1,4} [/ <length-percentage [0,∞]>{1,4}]?',
    },
    'border-right': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-right-color': {
        initial: 'currentColor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-right-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-right-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-spacing': {
        initial: '0px 0px',
        representation: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<length>{1,2}',
    },
    'border-start-end-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
            ' ',
            new Set(['border-top-left-radius']),
        ),
        value: "<'border-top-left-radius'>",
    },
    'border-start-start-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
            ' ',
            new Set(['border-top-left-radius']),
        ),
        value: "<'border-top-left-radius'>",
    },
    'border-style': {
        value: '<line-style>{1,4}',
    },
    'border-top': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-top-color': {
        initial: 'currentColor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-top-left-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-right-radius': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-top-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-width': {
        value: '<line-width>{1,4}',
    },
    'bottom': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'box-decoration-break': {
        initial: 'slice',
        representation: { type: new Set(['ident', 'keyword']), value: 'slice' },
        value: 'slice | clone',
    },
    'box-shadow': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <shadow>#',
    },
    'box-sizing': {
        initial: 'content-box',
        representation: { type: new Set(['ident', 'keyword']), value: 'content-box' },
        value: 'content-box | border-box',
    },
    'box-snap': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | block-start | block-end | center | baseline | last-baseline',
    },
    'break-after': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-before': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-inside': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | avoid-page | avoid-column | avoid-region',
    },
    'caption-side': {
        initial: 'top',
        representation: { type: new Set(['ident', 'keyword']), value: 'top' },
        value: 'top | bottom | inline-start | inline-end',
    },
    'caret': {
        value: "<'caret-color'> || <'caret-shape'>",
    },
    'caret-color': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <color>',
    },
    'caret-shape': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | bar | block | underscore',
    },
    'clear': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both-inline | both-block | both | all | none',
    },
    'clip': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'rect() | auto',
    },
    'clip-path': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<clip-source> | [<basic-shape> || <geometry-box>] | none',
    },
    'clip-rule': {
        initial: 'nonzero',
        representation: { type: new Set(['ident', 'keyword']), value: 'nonzero' },
        value: 'nonzero | evenodd',
    },
    'color': {
        initial: 'CanvasText',
        representation: { type: new Set(['ident', 'keyword', 'system-color', 'color']), value: 'canvastext' },
        value: '<color>',
    },
    'color-adjust': {
        value: '<print-color-adjust>',
    },
    'color-interpolation': {
        initial: 'sRGB',
        representation: { type: new Set(['ident', 'keyword']), value: 'srgb' },
        value: 'auto | sRGB | linearRGB',
    },
    'color-interpolation-filters': {
        initial: 'linearRGB',
        representation: { type: new Set(['ident', 'keyword']), value: 'linearrgb' },
        value: 'auto | sRGB | linearRGB',
    },
    'color-scheme': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [light | dark | <custom-ident>]+ && only?',
    },
    'column-count': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <integer [1,∞]>',
    },
    'column-fill': {
        initial: 'balance',
        representation: { type: new Set(['ident', 'keyword']), value: 'balance' },
        value: 'auto | balance | balance-all',
    },
    'column-gap': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length-percentage>',
    },
    'column-rule': {
        value: "<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>",
    },
    'column-rule-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'column-rule-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'column-rule-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'column-span': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <integer [1,∞]> | all | auto',
    },
    'column-width': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length [0,∞]> | min-content | max-content | fit-content(<length-percentage>)',
    },
    'columns': {
        value: "<'column-width'> || <'column-count'>",
    },
    'contain': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | strict | content | [[size | inline-size] || layout || style || paint]',
    },
    'contain-intrinsic-block-size': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-height': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-inline-size': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-size': {
        value: '[none | <length> | auto <length>]{1,2}',
    },
    'contain-intrinsic-width': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'container': {
        value: "<'container-type'> [/ <'container-name'>]?",
    },
    'container-name': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<custom-ident> | <string>]+',
    },
    'container-type': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | style || state || [size | inline-size | block-size]',
    },
    'content': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | <content-list> [/ [<string> | <counter>]+]? | <element()>',
    },
    'content-visibility': {
        initial: 'visible',
        representation: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | auto | hidden',
    },
    'continue': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | overflow | paginate | fragments | discard',
    },
    'copy-into': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [[<custom-ident> <content-level>] [, <custom-ident> <content-level>]*]?',
    },
    'corner-shape': {
        initial: 'round',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'round' },
            ],
        ),
        value: '[round | angle]{1,4}',
    },
    'corners': {
        value: "<'corner-shape'> || <'border-radius'>",
    },
    'counter-increment': {
        initial: 'none',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'custom-ident', 'counter-name']), value: 'none' },
                        { omitted: true, type: new Set([]) },
                    ],
                ),
            ],
        ),
        value: '[<counter-name> <integer>?]+ | none',
    },
    'counter-reset': {
        initial: 'none',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'custom-ident', 'counter-name']), value: 'none' },
                        { omitted: true, type: new Set([]) },
                    ],
                ),
            ],
        ),
        value: '[<counter-name> <integer>? | <reversed-counter-name> <integer>?]+ | none',
    },
    'counter-set': {
        initial: 'none',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'custom-ident', 'counter-name']), value: 'none' },
                        { omitted: true, type: new Set([]) },
                    ],
                ),
            ],
        ),
        value: '[<counter-name> <integer>?]+ | none',
    },
    'cue': {
        value: "<'cue-before'> <'cue-after'>?",
    },
    'cue-after': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<uri> <decibel>? | none',
    },
    'cue-before': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<uri> <decibel>? | none',
    },
    'cursor': {
        initial: 'auto',
        representation: createList(
            [
                createList(
                    [
                    ],
                ),
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[<url> [<x> <y>]?,]* [auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | grab | grabbing | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out]',
    },
    'cx': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'cy': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'd': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <string>',
    },
    'direction': {
        initial: 'ltr',
        representation: { type: new Set(['ident', 'keyword']), value: 'ltr' },
        value: 'ltr | rtl',
    },
    'display': {
        initial: 'inline',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'display-outside']), value: 'inline' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[<display-outside> || <display-inside>] | <display-listitem> | <display-internal> | <display-box> | <display-legacy>',
    },
    'dominant-baseline': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | text-bottom | alphabetic | ideographic | middle | central | mathematical | hanging | text-top',
    },
    'empty-cells': {
        initial: 'show',
        representation: { type: new Set(['ident', 'keyword']), value: 'show' },
        value: 'show | hide',
    },
    'fill': {
        initial: 'black',
        representation: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color', 'paint']), value: 'black' },
        value: '<paint>',
    },
    'fill-break': {
        initial: 'bounding-box',
        representation: { type: new Set(['ident', 'keyword']), value: 'bounding-box' },
        value: 'bounding-box | slice | clone',
    },
    'fill-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'fill-image': {
        initial: 'none',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'paint']), value: 'none' },
            ],
            ',',
        ),
        value: '<paint>#',
    },
    'fill-opacity': {
        initial: '1',
        representation: { type: new Set(['integer', 'number', 'alpha-value', 'opacity']), value: 1 },
        value: "<'opacity'>",
    },
    'fill-origin': {
        initial: 'match-parent',
        representation: { type: new Set(['ident', 'keyword']), value: 'match-parent' },
        value: 'match-parent | fill-box | stroke-box | content-box | padding-box | border-box',
    },
    'fill-position': {
        initial: '0% 0%',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                    ' ',
                    new Set(['position']),
                ),
            ],
            ',',
        ),
        value: '<position>#',
    },
    'fill-repeat': {
        initial: 'repeat',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'repeat' },
                    ],
                    ' ',
                    new Set(['repeat-style']),
                ),
            ],
            ',',
        ),
        value: '<repeat-style>#',
    },
    'fill-rule': {
        initial: 'nonzero',
        representation: { type: new Set(['ident', 'keyword']), value: 'nonzero' },
        value: 'nonzero | evenodd',
    },
    'fill-size': {
        initial: 'auto',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'auto' },
                    ],
                    ' ',
                    new Set(['bg-size']),
                ),
            ],
            ',',
        ),
        value: '<bg-size>#',
    },
    'filter': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <filter-value-list>',
    },
    'flex': {
        value: "none | [<'flex-grow'> <'flex-shrink'>? || <'flex-basis'>]",
    },
    'flex-basis': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'width']), value: 'auto' },
        value: "content | <'width'>",
    },
    'flex-direction': {
        initial: 'row',
        representation: { type: new Set(['ident', 'keyword']), value: 'row' },
        value: 'row | row-reverse | column | column-reverse',
    },
    'flex-flow': {
        value: "<'flex-direction'> || <'flex-wrap'>",
    },
    'flex-grow': {
        initial: '0',
        representation: { type: new Set(['integer', 'number']), value: 0 },
        value: '<number [0,∞]>',
    },
    'flex-shrink': {
        initial: '1',
        representation: { type: new Set(['integer', 'number']), value: 1 },
        value: '<number [0,∞]>',
    },
    'flex-wrap': {
        initial: 'nowrap',
        representation: { type: new Set(['ident', 'keyword']), value: 'nowrap' },
        value: 'nowrap | wrap | wrap-reverse',
    },
    'float': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'block-start | block-end | inline-start | inline-end | snap-block | <snap-block()> | snap-inline | <snap-inline()> | left | right | top | bottom | none | footnote',
    },
    'float-defer': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<integer> | last | none',
    },
    'float-offset': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length> | <percentage>',
    },
    'float-reference': {
        initial: 'inline',
        representation: { type: new Set(['ident', 'keyword']), value: 'inline' },
        value: 'inline | column | region | page',
    },
    'flood-color': {
        initial: 'black',
        representation: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']), value: 'black' },
        value: '<color>',
    },
    'flood-opacity': {
        initial: '1',
        representation: { type: new Set(['integer', 'number', 'alpha-value']), value: 1 },
        value: '<alpha-value>',
    },
    'flow-from': {
        initial: 'none',
        representation: { type: new Set(['ident']), value: 'none' },
        value: '<ident> | none',
    },
    'flow-into': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <ident> [element | content]?',
    },
    'font': {
        value: "[[<'font-style'> || <font-variant-css2> || <'font-weight'> || <font-stretch-css3>]? <'font-size'> [/ <'line-height'>]? <'font-family'>] | caption | icon | menu | message-box | small-caption | status-bar",
    },
    'font-family': {
        initial: 'monospace',
        representation: createList(
            [
                { type: new Set(['ident', 'custom-ident', 'family-name']), value: 'monospace' },
            ],
            ',',
        ),
        value: '[<family-name> | <generic-family>]#',
    },
    'font-feature-settings': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <feature-tag-value>#',
    },
    'font-kerning': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | normal | none',
    },
    'font-language-override': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <string>',
    },
    'font-optical-sizing': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-palette': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | light | dark | <palette-identifier>',
    },
    'font-size': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'absolute-size']), value: 'medium' },
        value: '<absolute-size> | <relative-size> | <length-percentage> | math',
    },
    'font-size-adjust': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [ex-height | cap-height | ch-width | ic-width | ic-height]? [from-font | <number>]',
    },
    'font-stretch': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <percentage> | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded',
    },
    'font-style': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | italic | oblique <angle>?',
    },
    'font-synthesis': {
        initial: 'weight style small-caps',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'weight' },
                { type: new Set(['ident', 'keyword']), value: 'style' },
                { type: new Set(['ident', 'keyword']), value: 'small-caps' },
            ],
        ),
        value: 'none | [weight || style || small-caps]',
    },
    'font-synthesis-small-caps': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-synthesis-style': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-synthesis-weight': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-variant': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | [<common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> || [small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps] || [stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>)] || <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero || <east-asian-variant-values> || <east-asian-width-values> || ruby || [sub | super]]',
    },
    'font-variant-alternates': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>)]',
    },
    'font-variant-caps': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps',
    },
    'font-variant-east-asian': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<east-asian-variant-values> || <east-asian-width-values> || ruby]',
    },
    'font-variant-emoji': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | text | emoji | unicode',
    },
    'font-variant-ligatures': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | [<common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values>]',
    },
    'font-variant-numeric': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero]',
    },
    'font-variant-position': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | sub | super',
    },
    'font-variation-settings': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<string> <number>]#',
    },
    'font-weight': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword', 'font-weight-absolute']), value: 'normal' },
        value: '<font-weight-absolute> | bolder | lighter',
    },
    'footnote-display': {
        initial: 'block',
        representation: { type: new Set(['ident', 'keyword']), value: 'block' },
        value: 'block | inline | compact',
    },
    'footnote-policy': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | line | block',
    },
    'forced-color-adjust': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | preserve-parent-color',
    },
    'gap': {
        value: "<'row-gap'> <'column-gap'>?",
    },
    'glyph-orientation-vertical': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | 0deg | 90deg | 0 | 90',
    },
    'grid': {
        value: "<'grid-template'> | <'grid-template-rows'> / [auto-flow && dense?] <'grid-auto-columns'>? | [auto-flow && dense?] <'grid-auto-rows'>? / <'grid-template-columns'>",
    },
    'grid-area': {
        value: '<grid-line> [/ <grid-line>]{0,3}',
    },
    'grid-auto-columns': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'track-breadth', 'track-size']), value: 'auto' },
            ],
        ),
        value: '<track-size>+',
    },
    'grid-auto-flow': {
        initial: 'row',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'row' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[row | column] || dense',
    },
    'grid-auto-rows': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'track-breadth', 'track-size']), value: 'auto' },
            ],
        ),
        value: '<track-size>+',
    },
    'grid-column': {
        value: '<grid-line> [/ <grid-line>]?',
    },
    'grid-column-end': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-column-start': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-row': {
        value: '<grid-line> [/ <grid-line>]?',
    },
    'grid-row-end': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-row-start': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-template': {
        value: "none | [<'grid-template-rows'> / <'grid-template-columns'>] | [<line-names>? <string> <track-size>? <line-names>?]+ [/ <explicit-track-list>]?",
    },
    'grid-template-areas': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <string>+',
    },
    'grid-template-columns': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>? | masonry',
    },
    'grid-template-rows': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>? | masonry',
    },
    'hanging-punctuation': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [first || [force-end | allow-end] || last]',
    },
    'height': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'hyphenate-character': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <string>',
    },
    'hyphenate-limit-chars': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[auto | <integer>]{1,3}',
    },
    'hyphenate-limit-last': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | always | column | page | spread',
    },
    'hyphenate-limit-lines': {
        initial: 'no-limit',
        representation: { type: new Set(['ident', 'keyword']), value: 'no-limit' },
        value: 'no-limit | <integer>',
    },
    'hyphenate-limit-zone': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'hyphens': {
        initial: 'manual',
        representation: { type: new Set(['ident', 'keyword']), value: 'manual' },
        value: 'none | manual | auto',
    },
    'image-orientation': {
        initial: 'from-image',
        representation: { type: new Set(['ident', 'keyword']), value: 'from-image' },
        value: 'from-image | none | [<angle> || flip]',
    },
    'image-rendering': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | smooth | high-quality | pixelated | crisp-edges',
    },
    'image-resolution': {
        initial: '1dppx',
        representation: createList(
            [
                createList(
                    [
                        { omitted: true, type: new Set([]) },
                        { type: new Set(['dimension', 'resolution']), value: 1 },
                    ],
                ),
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[from-image || <resolution>] && snap?',
    },
    'initial-letter': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <number> <integer> | <number> && [drop | raise]?',
    },
    'initial-letter-align': {
        initial: 'alphabetic',
        representation: createList(
            [
                { omitted: true, type: new Set([]) },
                { type: new Set(['ident', 'keyword']), value: 'alphabetic' },
            ],
        ),
        value: '[border-box? [alphabetic | ideographic | hanging | leading]?]!',
    },
    'initial-letter-wrap': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | first | all | grid | <length-percentage>',
    },
    'inline-size': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'width']), value: 'auto' },
        value: "<'width'>",
    },
    'inline-sizing': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | stretch',
    },
    'input-security': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'inset': {
        value: '<top>{1,4}',
    },
    'inset-block': {
        value: '<top>{1,2}',
    },
    'inset-block-end': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'inset-block-start': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'inset-inline': {
        value: '<top>{1,2}',
    },
    'inset-inline-end': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'inset-inline-start': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'isolation': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword', 'isolation-mode']), value: 'auto' },
        value: '<isolation-mode>',
    },
    'justify-content': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <content-distribution> | <overflow-position>? [<content-position> | left | right]',
    },
    'justify-items': {
        initial: 'legacy',
        representation: { type: new Set(['ident', 'keyword']), value: 'legacy' },
        value: 'normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right] | legacy | legacy && [left | right | center]',
    },
    'justify-self': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right]',
    },
    'justify-tracks': {
        initial: 'normal',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'normal' },
            ],
            ',',
        ),
        value: '[normal | <content-distribution> | <overflow-position>? [<content-position> | left | right]]#',
    },
    'leading-trim': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | start | end | both',
    },
    'left': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'letter-spacing': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length>',
    },
    'lighting-color': {
        initial: 'white',
        representation: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']), value: 'white' },
        value: '<color>',
    },
    'line-break': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | loose | normal | strict | anywhere',
    },
    'line-clamp': {
        value: "none | <integer> <'block-ellipsis'>?",
    },
    'line-grid': {
        initial: 'match-parent',
        representation: { type: new Set(['ident', 'keyword']), value: 'match-parent' },
        value: 'match-parent | create',
    },
    'line-height': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <number> | <length-percentage>',
    },
    'line-height-step': {
        initial: '0px',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'line-padding': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'line-snap': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | baseline | contain',
    },
    'list-style': {
        value: "<'list-style-position'> || <'list-style-image'> || <'list-style-type'>",
    },
    'list-style-image': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<image> | none',
    },
    'list-style-position': {
        initial: 'outside',
        representation: { type: new Set(['ident', 'keyword']), value: 'outside' },
        value: 'inside | outside',
    },
    'list-style-type': {
        initial: 'disc',
        representation: { type: new Set(['ident', 'custom-ident', 'counter-style-name', 'counter-style']), value: 'disc' },
        value: '<counter-style> | <string> | none',
    },
    'margin': {
        value: "<'margin-top'>{1,4}",
    },
    'margin-block': {
        value: "<'margin-top'>{1,2}",
    },
    'margin-block-end': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-block-start': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-bottom': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-break': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | keep | discard',
    },
    'margin-inline': {
        value: "<'margin-top'>{1,2}",
    },
    'margin-inline-end': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-inline-start': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-left': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-right': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-top': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-trim': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | block | inline | [block-start || inline-start || block-end || inline-end]',
    },
    'marker': {
        value: 'none | <marker-ref>',
    },
    'marker-end': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <marker-ref>',
    },
    'marker-mid': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <marker-ref>',
    },
    'marker-side': {
        initial: 'match-self',
        representation: { type: new Set(['ident', 'keyword']), value: 'match-self' },
        value: 'match-self | match-parent',
    },
    'marker-start': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <marker-ref>',
    },
    'mask': {
        value: '<mask-layer>#',
    },
    'mask-border': {
        value: "<'mask-border-source'> || <'mask-border-slice'> [/ <'mask-border-width'>? [/ <'mask-border-outset'>]?]? || <'mask-border-repeat'> || <'mask-border-mode'>",
    },
    'mask-border-mode': {
        initial: 'alpha',
        representation: { type: new Set(['ident', 'keyword']), value: 'alpha' },
        value: 'luminance | alpha',
    },
    'mask-border-outset': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '[<length> | <number>]{1,4}',
    },
    'mask-border-repeat': {
        initial: 'stretch',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'stretch' },
            ],
        ),
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'mask-border-slice': {
        initial: '0',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['integer', 'number', 'number-percentage']), value: 0 },
                    ],
                ),
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<number-percentage>{1,4} fill?',
    },
    'mask-border-source': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <image>',
    },
    'mask-border-width': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[<length-percentage> | <number> | auto]{1,4}',
    },
    'mask-clip': {
        initial: 'border-box',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'box', 'shape-box', 'geometry-box']), value: 'border-box' },
            ],
            ',',
        ),
        value: '[<geometry-box> | no-clip]#',
    },
    'mask-composite': {
        initial: 'add',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'compositing-operator']), value: 'add' },
            ],
            ',',
        ),
        value: '<compositing-operator>#',
    },
    'mask-image': {
        initial: 'none',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'mask-reference']), value: 'none' },
            ],
            ',',
        ),
        value: '<mask-reference>#',
    },
    'mask-mode': {
        initial: 'match-source',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'masking-mode']), value: 'match-source' },
            ],
            ',',
        ),
        value: '<masking-mode>#',
    },
    'mask-origin': {
        initial: 'border-box',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'box', 'shape-box', 'geometry-box']), value: 'border-box' },
            ],
            ',',
        ),
        value: '<geometry-box>#',
    },
    'mask-position': {
        initial: '0% 0%',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                    ' ',
                    new Set(['position']),
                ),
            ],
            ',',
        ),
        value: '<position>#',
    },
    'mask-repeat': {
        initial: 'repeat',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'repeat' },
                    ],
                    ' ',
                    new Set(['repeat-style']),
                ),
            ],
            ',',
        ),
        value: '<repeat-style>#',
    },
    'mask-size': {
        initial: 'auto',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'auto' },
                    ],
                    ' ',
                    new Set(['bg-size']),
                ),
            ],
            ',',
        ),
        value: '<bg-size>#',
    },
    'mask-type': {
        initial: 'luminance',
        representation: { type: new Set(['ident', 'keyword']), value: 'luminance' },
        value: 'luminance | alpha',
    },
    'masonry-auto-flow': {
        initial: 'pack',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'pack' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[pack | next] || [definite-first | ordered]',
    },
    'max-block-size': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'max-width']), value: 'none' },
        value: "<'max-width'>",
    },
    'max-height': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'max-inline-size': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'max-width']), value: 'none' },
        value: "<'max-width'>",
    },
    'max-lines': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <integer>',
    },
    'max-width': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'min-block-size': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'min-width']), value: 0 },
        value: "<'min-width'>",
    },
    'min-height': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'min-inline-size': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'min-width']), value: 0 },
        value: "<'min-width'>",
    },
    'min-intrinsic-sizing': {
        initial: 'legacy',
        representation: { type: new Set(['ident', 'keyword']), value: 'legacy' },
        value: 'legacy | zero-if-scroll || zero-if-extrinsic',
    },
    'min-width': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'mix-blend-mode': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword', 'blend-mode']), value: 'normal' },
        value: '<blend-mode>',
    },
    'nav-down': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-left': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-right': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-up': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'object-fit': {
        initial: 'fill',
        representation: { type: new Set(['ident', 'keyword']), value: 'fill' },
        value: 'fill | none | [contain | cover] || scale-down',
    },
    'object-position': {
        initial: '50% 50%',
        representation: createList(
            [
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
            ],
            ' ',
            new Set(['position']),
        ),
        value: '<position>',
    },
    'offset': {
        value: "[<'offset-position'>? [<'offset-path'> [<'offset-distance'> || <'offset-rotate'>]?]?]! [/ <'offset-anchor'>]?",
    },
    'offset-anchor': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <position>',
    },
    'offset-distance': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'offset-path': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <ray()> | <path()> | <url> | [<basic-shape> && <coord-box>?] | <coord-box>',
    },
    'offset-position': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <position>',
    },
    'offset-rotate': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[auto | reverse] || <angle>',
    },
    'opacity': {
        initial: '1',
        representation: { type: new Set(['integer', 'number', 'alpha-value']), value: 1 },
        value: '<alpha-value>',
    },
    'order': {
        initial: '0',
        representation: { type: new Set(['integer']), value: 0 },
        value: '<integer>',
    },
    'orphans': {
        initial: '2',
        representation: { type: new Set(['integer']), value: 2 },
        value: '<integer>',
    },
    'outline': {
        value: "<'outline-color'> || <'outline-style'> || <'outline-width'>",
    },
    'outline-color': {
        initial: 'invert',
        representation: { type: new Set(['ident', 'keyword']), value: 'invert' },
        value: '<color> | invert',
    },
    'outline-offset': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'outline-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'outline-line-style']), value: 'none' },
        value: 'auto | <outline-line-style>',
    },
    'outline-width': {
        initial: 'medium',
        representation: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'overflow': {
        value: '[visible | hidden | clip | scroll | auto]{1,2}',
    },
    'overflow-anchor': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'overflow-block': {
        initial: 'visible',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'visible' },
            ],
            ' ',
            new Set(['overflow']),
        ),
        value: "<'overflow'>",
    },
    'overflow-clip-margin': {
        initial: '0px',
        representation: createList(
            [
                { omitted: true, type: new Set([]) },
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-inline': {
        initial: 'visible',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'visible' },
            ],
            ' ',
            new Set(['overflow']),
        ),
        value: "<'overflow'>",
    },
    'overflow-wrap': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | break-word | anywhere',
    },
    'overflow-x': {
        initial: 'visible',
        representation: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overflow-y': {
        initial: 'visible',
        representation: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overscroll-behavior': {
        value: '[contain | none | auto]{1,2}',
    },
    'overscroll-behavior-block': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-inline': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-x': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-y': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'padding': {
        value: "<'padding-top'>{1,4}",
    },
    'padding-block': {
        value: "<'padding-top'>{1,2}",
    },
    'padding-block-end': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-block-start': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-bottom': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'padding-inline': {
        value: "<'padding-top'>{1,2}",
    },
    'padding-inline-end': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-inline-start': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-left': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'padding-right': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'padding-top': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'page': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <custom-ident>',
    },
    'page-break-after': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | always | avoid | left | right',
    },
    'page-break-before': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | always | avoid | left | right',
    },
    'page-break-inside': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'avoid | auto',
    },
    'paint-order': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [fill || stroke || markers]',
    },
    'pause': {
        value: "<'pause-before'> <'pause-after'>?",
    },
    'pause-after': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'pause-before': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'perspective': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length [0,∞]>',
    },
    'perspective-origin': {
        initial: '50% 50%',
        representation: createList(
            [
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
            ],
            ' ',
            new Set(['position']),
        ),
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
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | bounding-box | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | none',
    },
    'position': {
        initial: 'static',
        representation: { type: new Set(['ident', 'keyword']), value: 'static' },
        value: 'static | relative | absolute | sticky | fixed | running()',
    },
    'print-color-adjust': {
        initial: 'economy',
        representation: { type: new Set(['ident', 'keyword']), value: 'economy' },
        value: 'economy | exact',
    },
    'quotes': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | [<string> <string>]+',
    },
    'r': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'region-fragment': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | break',
    },
    'resize': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | both | horizontal | vertical | block | inline',
    },
    'rest': {
        value: "<'rest-before'> <'rest-after'>?",
    },
    'rest-after': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'rest-before': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'right': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'rotate': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <angle> | [x | y | z | <number>{3}] && <angle>',
    },
    'row-gap': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length-percentage>',
    },
    'ruby-align': {
        initial: 'space-around',
        representation: { type: new Set(['ident', 'keyword']), value: 'space-around' },
        value: 'start | center | space-between | space-around',
    },
    'ruby-merge': {
        initial: 'separate',
        representation: { type: new Set(['ident', 'keyword']), value: 'separate' },
        value: 'separate | merge | auto',
    },
    'ruby-overhang': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'ruby-position': {
        initial: 'alternate',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'alternate' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[alternate || [over | under]] | inter-character',
    },
    'rx': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: '<length-percentage> | auto',
    },
    'ry': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: '<length-percentage> | auto',
    },
    'scale': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<number> | <percentage>]{1,3}',
    },
    'scroll-behavior': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | smooth',
    },
    'scroll-margin': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<length>{1,4}',
    },
    'scroll-margin-block': {
        value: '<length>{1,2}',
    },
    'scroll-margin-block-end': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-block-start': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-bottom': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-inline': {
        value: '<length>{1,2}',
    },
    'scroll-margin-inline-end': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-inline-start': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-left': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-right': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-top': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-padding': {
        initial: 'auto',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[auto | <length-percentage>]{1,4}',
    },
    'scroll-padding-block': {
        value: '[auto | <length-percentage>]{1,2}',
    },
    'scroll-padding-block-end': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-block-start': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-bottom': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-inline': {
        value: '[auto | <length-percentage>]{1,2}',
    },
    'scroll-padding-inline-end': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-inline-start': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-left': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-right': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-top': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-snap-align': {
        initial: 'none',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'none' },
            ],
        ),
        value: '[none | start | end | center]{1,2}',
    },
    'scroll-snap-stop': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | always',
    },
    'scroll-snap-type': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [x | y | block | inline | both] [mandatory | proximity]?',
    },
    'scrollbar-color': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <color>{2}',
    },
    'scrollbar-gutter': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | stable && both-edges?',
    },
    'scrollbar-width': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | thin | none',
    },
    'shape-image-threshold': {
        initial: '0',
        representation: { type: new Set(['integer', 'number', 'alpha-value']), value: 0 },
        value: '<alpha-value>',
    },
    'shape-inside': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | outside-shape | [<basic-shape> || shape-box] | <image> | display',
    },
    'shape-margin': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'shape-outside': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<basic-shape> || <shape-box>] | <image>',
    },
    'shape-padding': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<length> | none',
    },
    'shape-rendering': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | optimizeSpeed | crispEdges | geometricPrecision',
    },
    'shape-subtract': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<basic-shape>| <uri>]+',
    },
    'spatial-navigation-action': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | focus | scroll',
    },
    'spatial-navigation-contain': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | contain',
    },
    'spatial-navigation-function': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | grid',
    },
    'speak': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | never | always',
    },
    'speak-as': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | spell-out || digits || [literal-punctuation | no-punctuation]',
    },
    'stop-color': {
        initial: 'black',
        representation: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']), value: 'black' },
        value: "<'color'>",
    },
    'stop-opacity': {
        initial: '1',
        representation: { type: new Set(['integer', 'number', 'alpha-value', 'opacity']), value: 1 },
        value: "<'opacity'>",
    },
    'string-set': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<custom-ident> <string>+]#',
    },
    'stroke': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword', 'paint']), value: 'none' },
        value: '<paint>',
    },
    'stroke-align': {
        initial: 'center',
        representation: { type: new Set(['ident', 'keyword']), value: 'center' },
        value: 'center | inset | outset',
    },
    'stroke-alignment': {
        initial: 'center',
        representation: { type: new Set(['ident', 'keyword']), value: 'center' },
        value: 'center | inner | outer',
    },
    'stroke-break': {
        initial: 'bounding-box',
        representation: { type: new Set(['ident', 'keyword']), value: 'bounding-box' },
        value: 'bounding-box | slice | clone',
    },
    'stroke-color': {
        initial: 'transparent',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'absolute-color-base', 'color']), value: 'transparent' },
            ],
            ',',
        ),
        value: '<color>#',
    },
    'stroke-dash-corner': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length>',
    },
    'stroke-dash-justify': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [stretch | compress] || [dashes || gaps]',
    },
    'stroke-dashadjust': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [stretch | compress] [dashes | gaps]?',
    },
    'stroke-dasharray': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <dasharray>',
    },
    'stroke-dashcorner': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length>',
    },
    'stroke-dashoffset': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | <number>',
    },
    'stroke-image': {
        initial: 'none',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'paint']), value: 'none' },
            ],
            ',',
        ),
        value: '<paint>#',
    },
    'stroke-linecap': {
        initial: 'butt',
        representation: { type: new Set(['ident', 'keyword']), value: 'butt' },
        value: 'butt | round | square',
    },
    'stroke-linejoin': {
        initial: 'miter',
        representation: { type: new Set(['ident', 'keyword']), value: 'miter' },
        value: 'miter | miter-clip | round | bevel | arcs',
    },
    'stroke-miterlimit': {
        initial: '4',
        representation: { type: new Set(['integer', 'number']), value: 4 },
        value: '<number>',
    },
    'stroke-opacity': {
        initial: '1',
        representation: { type: new Set(['integer', 'number', 'alpha-value', 'opacity']), value: 1 },
        value: "<'opacity'>",
    },
    'stroke-origin': {
        initial: 'match-parent',
        representation: { type: new Set(['ident', 'keyword']), value: 'match-parent' },
        value: 'match-parent | fill-box | stroke-box | content-box | padding-box | border-box',
    },
    'stroke-position': {
        initial: '0% 0%',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                        { type: new Set(['percentage', 'length-percentage']), value: 0 },
                    ],
                    ' ',
                    new Set(['position']),
                ),
            ],
            ',',
        ),
        value: '<position>#',
    },
    'stroke-repeat': {
        initial: 'repeat',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'repeat' },
                    ],
                    ' ',
                    new Set(['repeat-style']),
                ),
            ],
            ',',
        ),
        value: '<repeat-style>#',
    },
    'stroke-size': {
        initial: 'auto',
        representation: createList(
            [
                createList(
                    [
                        { type: new Set(['ident', 'keyword']), value: 'auto' },
                    ],
                    ' ',
                    new Set(['bg-size']),
                ),
            ],
            ',',
        ),
        value: '<bg-size>#',
    },
    'stroke-width': {
        initial: '1px',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 1 },
        value: '<length-percentage> | <number>',
    },
    'tab-size': {
        initial: '8',
        representation: { type: new Set(['integer', 'number']), value: 8 },
        value: '<number> | <length>',
    },
    'table-layout': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | fixed',
    },
    'text-align': {
        value: 'start | end | left | right | center | justify | match-parent | justify-all',
    },
    'text-align-all': {
        initial: 'start',
        representation: { type: new Set(['ident', 'keyword']), value: 'start' },
        value: 'start | end | left | right | center | justify | match-parent',
    },
    'text-align-last': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | start | end | left | right | center | justify | match-parent',
    },
    'text-anchor': {
        initial: 'start',
        representation: { type: new Set(['ident', 'keyword']), value: 'start' },
        value: 'start | middle | end',
    },
    'text-combine-upright': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | all | [digits <integer>?]',
    },
    'text-decoration': {
        value: "<'text-decoration-line'> || <'text-decoration-thickness'> || <'text-decoration-style'> || <'text-decoration-color'>",
    },
    'text-decoration-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'text-decoration-line': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [underline || overline || line-through || blink] | spelling-error | grammar-error',
    },
    'text-decoration-skip': {
        value: 'none | auto',
    },
    'text-decoration-skip-box': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | all',
    },
    'text-decoration-skip-ink': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | all',
    },
    'text-decoration-skip-inset': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | auto',
    },
    'text-decoration-skip-self': {
        initial: 'objects',
        representation: { type: new Set(['ident', 'keyword']), value: 'objects' },
        value: 'none | objects',
    },
    'text-decoration-skip-spaces': {
        initial: 'start end',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'start' },
                { type: new Set(['ident', 'keyword']), value: 'end' },
            ],
        ),
        value: 'none | all | [start || end]',
    },
    'text-decoration-style': {
        initial: 'solid',
        representation: { type: new Set(['ident', 'keyword']), value: 'solid' },
        value: 'solid | double | dotted | dashed | wavy',
    },
    'text-decoration-thickness': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | from-font | <length> | <percentage>',
    },
    'text-edge': {
        initial: 'leading',
        representation: { type: new Set(['ident', 'keyword']), value: 'leading' },
        value: 'leading | [text | cap | ex | ideographic | ideographic-ink] [text | alphabetic | ideographic | ideographic-ink]?',
    },
    'text-emphasis': {
        value: "<'text-emphasis-style'> || <'text-emphasis-color'>",
    },
    'text-emphasis-color': {
        initial: 'currentcolor',
        representation: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'text-emphasis-position': {
        initial: 'over right',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'over' },
                { type: new Set(['ident', 'keyword']), value: 'right' },
            ],
        ),
        value: '[over | under] && [right | left]?',
    },
    'text-emphasis-skip': {
        initial: 'spaces punctuation',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'spaces' },
                { type: new Set(['ident', 'keyword']), value: 'punctuation' },
                { omitted: true, type: new Set([]) },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: 'spaces || punctuation || symbols || narrow',
    },
    'text-emphasis-style': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [[filled | open] || [dot | circle | double-circle | triangle | sesame]] | <string>',
    },
    'text-group-align': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | start | end | left | right | center',
    },
    'text-indent': {
        initial: '0',
        representation: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
                { omitted: true, type: new Set([]) },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[<length-percentage>] && hanging? && each-line?',
    },
    'text-justify': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | inter-word | inter-character',
    },
    'text-orientation': {
        initial: 'mixed',
        representation: { type: new Set(['ident', 'keyword']), value: 'mixed' },
        value: 'mixed | upright | sideways',
    },
    'text-overflow': {
        initial: 'clip',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'clip' },
            ],
        ),
        value: '[clip | ellipsis | <string> | fade | <fade()>]{1,2}',
    },
    'text-rendering': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | optimizeSpeed | optimizeLegibility | geometricPrecision',
    },
    'text-shadow': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<color>? && <length>{2,4}]#',
    },
    'text-size-adjust': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | <percentage>',
    },
    'text-space-collapse': {
        initial: 'collapse',
        representation: { type: new Set(['ident', 'keyword']), value: 'collapse' },
        value: 'collapse | discard | preserve | preserve-breaks | preserve-spaces',
    },
    'text-space-trim': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | trim-inner || discard-before || discard-after',
    },
    'text-spacing': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | auto | [trim-start | space-start | space-first] || [trim-end | space-end | allow-end] || [trim-adjacent | space-adjacent] || no-compress || ideograph-alpha || ideograph-numeric || punctuation',
    },
    'text-transform': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [capitalize | uppercase | lowercase] || full-width || full-size-kana',
    },
    'text-underline-offset': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length> | <percentage>',
    },
    'text-underline-position': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | [from-font | under] || [left | right]',
    },
    'text-wrap': {
        initial: 'wrap',
        representation: { type: new Set(['ident', 'keyword']), value: 'wrap' },
        value: 'wrap | nowrap | balance | stable | pretty',
    },
    'top': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'touch-action': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | [[pan-x | pan-left | pan-right] || [pan-y | pan-up | pan-down] || pinch-zoom] | manipulation',
    },
    'transform': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <transform-list>',
    },
    'transform-box': {
        initial: 'view-box',
        representation: { type: new Set(['ident', 'keyword']), value: 'view-box' },
        value: 'content-box | border-box | fill-box | stroke-box | view-box',
    },
    'transform-origin': {
        initial: '50% 50%',
        representation: createList(
            [
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[left | center | right | top | bottom | <length-percentage>] | [left | center | right | <length-percentage>] [top | center | bottom | <length-percentage>] <length>? | [[center | left | right] && [center | top | bottom]] <length>?',
    },
    'transform-style': {
        initial: 'flat',
        representation: { type: new Set(['ident', 'keyword']), value: 'flat' },
        value: 'flat | preserve-3d',
    },
    'transition': {
        value: '<single-transition>#',
    },
    'transition-delay': {
        initial: '0s',
        representation: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'transition-duration': {
        initial: '0s',
        representation: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'transition-property': {
        initial: 'all',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-transition-property']), value: 'all' },
            ],
            ',',
        ),
        value: 'none | <single-transition-property>#',
    },
    'transition-timing-function': {
        initial: 'ease',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword', 'cubic-bezier-easing-function', 'easing-function']), value: 'ease' },
            ],
            ',',
        ),
        value: '<easing-function>#',
    },
    'translate': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length-percentage> [<length-percentage> <length>?]?',
    },
    'unicode-bidi': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | embed | isolate | bidi-override | isolate-override | plaintext',
    },
    'user-select': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | text | none | contain | all',
    },
    'vector-effect': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | non-scaling-stroke | non-scaling-size | non-rotation | fixed-position',
    },
    'vertical-align': {
        value: "[first | last] || <'alignment-baseline'> || <'baseline-shift'>",
    },
    'visibility': {
        initial: 'visible',
        representation: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden | collapse',
    },
    'voice-balance': {
        initial: 'center',
        representation: { type: new Set(['ident', 'keyword']), value: 'center' },
        value: '<number> | left | center | right | leftwards | rightwards',
    },
    'voice-duration': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <time>',
    },
    'voice-family': {
        initial: 'female',
        representation: createList(
            [
                createList(
                    [
                    ],
                ),
                { type: new Set(['ident', 'custom-ident', 'family-name', 'keyword', 'gender']), value: 'female' },
            ],
        ),
        value: '[[<family-name> | <generic-voice>],]* [<family-name> | <generic-voice>] | preserve',
    },
    'voice-pitch': {
        initial: 'medium',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'medium' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<frequency> && absolute | [[x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]]',
    },
    'voice-range': {
        initial: 'medium',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'medium' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<frequency> && absolute | [[x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]]',
    },
    'voice-rate': {
        initial: 'normal',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'normal' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[normal | x-slow | slow | medium | fast | x-fast] || <percentage>',
    },
    'voice-stress': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | strong | moderate | none | reduced',
    },
    'voice-volume': {
        initial: 'medium',
        representation: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'medium' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: 'silent | [[x-soft | soft | medium | loud | x-loud] || <decibel>]',
    },
    'white-space': {
        value: 'normal | pre | nowrap | pre-wrap | break-spaces | pre-line | auto',
    },
    'widows': {
        initial: '2',
        representation: { type: new Set(['integer']), value: 2 },
        value: '<integer>',
    },
    'width': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'will-change': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <animateable-feature>#',
    },
    'word-boundary-detection': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | manual | auto(<lang>)',
    },
    'word-boundary-expansion': {
        initial: 'none',
        representation: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | space | ideographic-space',
    },
    'word-break': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | keep-all | break-all | break-word',
    },
    'word-spacing': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length>',
    },
    'word-wrap': {
        initial: 'normal',
        representation: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | break-word | anywhere',
    },
    'wrap-after': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-before': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-flow': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | both | start | end | minimum | maximum | clear',
    },
    'wrap-inside': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid',
    },
    'wrap-through': {
        initial: 'wrap',
        representation: { type: new Set(['ident', 'keyword']), value: 'wrap' },
        value: 'wrap | none',
    },
    'writing-mode': {
        initial: 'horizontal-tb',
        representation: { type: new Set(['ident', 'keyword']), value: 'horizontal-tb' },
        value: 'horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr',
    },
    'x': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'y': {
        initial: '0',
        representation: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'z-index': {
        initial: 'auto',
        representation: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <integer>',
    },
}
