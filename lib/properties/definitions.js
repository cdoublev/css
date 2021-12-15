
// Generated from /var/www/packages/css/scripts/initial.js

const createList = require('../values/value.js')

module.exports = {
    '-webkit-background-clip': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'border-box | padding-box | content-box | text | none',
    },
    '-webkit-text-fill-color': {
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    '-webkit-text-stroke': {
        value: '<line-width> || <color>',
    },
    '-webkit-text-stroke-color': {
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    '-webkit-text-stroke-width': {
        initial: { type: new Set(['dimension', 'length', 'line-width']), value: 0 },
        value: '<line-width>',
    },
    'accent-color': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <color>',
    },
    'align-content': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>',
    },
    'align-items': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | stretch | <baseline-position> | [<overflow-position>? <self-position>]',
    },
    'align-self': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? <self-position>',
    },
    'align-tracks': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'normal' },
            ],
            ',',
        ),
        value: '[normal | <baseline-position> | <content-distribution> | <overflow-position>? <content-position>]#',
    },
    'alignment-baseline': {
        initial: { type: new Set(['ident', 'keyword']), value: 'baseline' },
        value: 'baseline | text-bottom | alphabetic | ideographic | middle | central | mathematical | text-top',
    },
    'all': {
        value: 'initial | inherit | unset | revert | revert-layer',
    },
    'animation': {
        value: '<single-animation>#',
    },
    'animation-composition': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-composition']), value: 'replace' },
            ],
            ',',
        ),
        value: '<single-animation-composition>#',
    },
    'animation-delay': {
        initial: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'animation-direction': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-direction']), value: 'normal' },
            ],
            ',',
        ),
        value: '<single-animation-direction>#',
    },
    'animation-duration': {
        initial: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'animation-fill-mode': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-fill-mode']), value: 'none' },
            ],
            ',',
        ),
        value: '<single-animation-fill-mode>#',
    },
    'animation-iteration-count': {
        initial: createList(
            [
                { type: new Set(['integer', 'number', 'single-animation-iteration-count']), value: 1 },
            ],
            ',',
        ),
        value: '<single-animation-iteration-count>#',
    },
    'animation-name': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'none' },
            ],
            ',',
        ),
        value: '[none | <keyframes-name>]#',
    },
    'animation-play-state': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-play-state']), value: 'running' },
            ],
            ',',
        ),
        value: '<single-animation-play-state>#',
    },
    'animation-timeline': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-animation-timeline']), value: 'auto' },
            ],
            ',',
        ),
        value: '<single-animation-timeline>#',
    },
    'animation-timing-function': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'cubic-bezier-easing-function', 'easing-function']), value: 'ease' },
            ],
            ',',
        ),
        value: '<easing-function>#',
    },
    'appearance': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | auto | textfield | menulist-button | <compat-auto>',
    },
    'aspect-ratio': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: 'auto || <ratio>',
    },
    'backdrop-filter': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <filter-value-list>',
    },
    'backface-visibility': {
        initial: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden',
    },
    'background': {
        value: '[<bg-layer># ,]? <final-bg-layer>',
    },
    'background-attachment': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'attachment']), value: 'scroll' },
            ],
            ',',
        ),
        value: '<attachment>#',
    },
    'background-blend-mode': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'blend-mode']), value: 'normal' },
            ],
            ',',
        ),
        value: '<blend-mode>#',
    },
    'background-clip': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'box', 'bg-clip']), value: 'border-box' },
            ],
            ',',
        ),
        value: '<bg-clip>#',
    },
    'background-color': {
        initial: { type: new Set(['ident', 'keyword', 'absolute-color-base', 'color']), value: 'transparent' },
        value: '<color>',
    },
    'background-image': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'bg-image']), value: 'none' },
            ],
            ',',
        ),
        value: '<bg-image>#',
    },
    'background-origin': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'box']), value: 'padding-box' },
            ],
            ',',
        ),
        value: '<box>#',
    },
    'background-position': {
        initial: createList(
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
    'background-position-block': {
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | sub | super | top | center | bottom',
    },
    'baseline-source': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | first | last',
    },
    'block-ellipsis': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | auto | <string>',
    },
    'block-size': {
        initial: { type: new Set(['ident', 'keyword', 'width']), value: 'auto' },
        value: "<'width'> | stretch | fit-content | contain",
    },
    'block-step': {
        value: "<'block-step-size'> || <'block-step-insert'> || <'block-step-align'> || <'block-step-round'>",
    },
    'block-step-align': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | center | start | end',
    },
    'block-step-insert': {
        initial: { type: new Set(['ident', 'keyword']), value: 'margin' },
        value: 'margin | padding',
    },
    'block-step-round': {
        initial: { type: new Set(['ident', 'keyword']), value: 'up' },
        value: 'up | down | nearest',
    },
    'block-step-size': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length>',
    },
    'bookmark-label': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <integer>',
    },
    'bookmark-state': {
        initial: { type: new Set(['ident', 'keyword']), value: 'open' },
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
        initial: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-block-end-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-block-end-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
        value: "<'border-top-width'>",
    },
    'border-block-start': {
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-block-start-color': {
        initial: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-block-start-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-block-start-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
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
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-bottom-left-radius': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-right-radius': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-bottom-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-bottom-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-boundary': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | parent | display',
    },
    'border-clip': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-bottom': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-left': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-right': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-clip-top': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<length-percentage [0,∞]> | <flex>]+',
    },
    'border-collapse': {
        initial: { type: new Set(['ident', 'keyword']), value: 'separate' },
        value: 'separate | collapse',
    },
    'border-color': {
        value: '<color>#{1,4}',
    },
    'border-end-end-radius': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
            ' ',
            new Set(['border-top-left-radius']),
        ),
        value: "<'border-top-left-radius'>",
    },
    'border-end-start-radius': {
        initial: createList(
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
        initial: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '[<length [0,∞]> | <number [0,∞]>]{1,4}',
    },
    'border-image-repeat': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'stretch' },
            ],
        ),
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'border-image-slice': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <image>',
    },
    'border-image-width': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-inline-end-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-inline-end-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
        value: "<'border-top-width'>",
    },
    'border-inline-start': {
        value: "<'border-top-width'> || <'border-top-style'> || <color>",
    },
    'border-inline-start-color': {
        initial: { type: new Set(['ident', 'keyword', 'color', 'border-top-color']), value: 'currentcolor' },
        value: "<'border-top-color'>",
    },
    'border-inline-start-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style', 'border-top-style']), value: 'none' },
        value: "<'border-top-style'>",
    },
    'border-inline-start-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width', 'border-top-width']), value: 'medium' },
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
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-left-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-left-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-limit': {
        initial: { type: new Set(['ident', 'keyword']), value: 'round' },
        value: 'all | round | [sides | corners] <length-percentage [0,∞]>? | [top | right | bottom | left] <length-percentage [0,∞]>',
    },
    'border-radius': {
        initial: createList(
            [
                createList(
                    [
                        { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
                    ],
                ),
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,4} [/ <length-percentage [0,∞]>{1,4}]?',
    },
    'border-right': {
        value: '<line-width> || <line-style> || <color>',
    },
    'border-right-color': {
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-right-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-right-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-spacing': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<length>{1,2}',
    },
    'border-start-end-radius': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
            ' ',
            new Set(['border-top-left-radius']),
        ),
        value: "<'border-top-left-radius'>",
    },
    'border-start-start-radius': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'border-top-left-radius': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-right-radius': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
            ],
        ),
        value: '<length-percentage [0,∞]>{1,2}',
    },
    'border-top-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'border-top-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'border-width': {
        value: '<line-width>{1,4}',
    },
    'bottom': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'box-decoration-break': {
        initial: { type: new Set(['ident', 'keyword']), value: 'slice' },
        value: 'slice | clone',
    },
    'box-shadow': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <shadow>#',
    },
    'box-sizing': {
        initial: { type: new Set(['ident', 'keyword']), value: 'content-box' },
        value: 'content-box | border-box',
    },
    'box-snap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | block-start | block-end | center | baseline | last-baseline',
    },
    'break-after': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-before': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | always | all | avoid-page | page | left | right | recto | verso | avoid-column | column | avoid-region | region',
    },
    'break-inside': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | avoid-page | avoid-column | avoid-region',
    },
    'caption-side': {
        initial: { type: new Set(['ident', 'keyword']), value: 'top' },
        value: 'top | bottom | inline-start | inline-end',
    },
    'caret': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'caret-color', 'caret-shape']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: "<'caret-color'> || <'caret-shape'>",
    },
    'caret-color': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <color>',
    },
    'caret-shape': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | bar | block | underscore',
    },
    'clear': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both | none',
    },
    'clip': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'rect() | auto',
    },
    'clip-path': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<clip-source> | [<basic-shape> || <geometry-box>] | none',
    },
    'clip-rule': {
        initial: { type: new Set(['ident', 'keyword']), value: 'nonzero' },
        value: 'nonzero | evenodd',
    },
    'color': {
        initial: { type: new Set(['ident', 'keyword', 'system-color', 'color']), value: 'canvastext' },
        value: '<color>',
    },
    'color-adjust': {
        value: '<print-color-adjust>',
    },
    'color-interpolation': {
        initial: { type: new Set(['ident', 'keyword']), value: 'srgb' },
        value: 'auto | sRGB | linearRGB',
    },
    'color-interpolation-filters': {
        initial: { type: new Set(['ident', 'keyword']), value: 'linearrgb' },
        value: 'auto | sRGB | linearRGB',
    },
    'color-scheme': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [light | dark | <custom-ident>]+ && only?',
    },
    'column-count': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <integer [1,∞]>',
    },
    'column-fill': {
        initial: { type: new Set(['ident', 'keyword']), value: 'balance' },
        value: 'auto | balance | balance-all',
    },
    'column-gap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length-percentage>',
    },
    'column-rule': {
        value: "<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>",
    },
    'column-rule-color': {
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'column-rule-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style']), value: 'none' },
        value: '<line-style>',
    },
    'column-rule-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'column-span': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <integer [1,∞]> | all | auto',
    },
    'column-width': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length [0,∞]> | min-content | max-content | fit-content(<length-percentage>)',
    },
    'columns': {
        value: "<'column-width'> || <'column-count'>",
    },
    'contain': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | strict | content | [size || layout || style || paint]',
    },
    'contain-intrinsic-block-size': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-height': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-inline-size': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'contain-intrinsic-size': {
        value: '[none | <length> | auto <length>]{1,2}',
    },
    'contain-intrinsic-width': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length> | auto <length>',
    },
    'content': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | [<content-replacement> | <content-list>] [/ [<string> | <counter>]+]? | element()',
    },
    'content-visibility': {
        initial: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | auto | hidden',
    },
    'continue': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | overflow | paginate | fragments | discard',
    },
    'copy-into': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [[<custom-ident> <content-level>] [, <custom-ident> <content-level>]*]?',
    },
    'corner-shape': {
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<uri> <decibel>? | none',
    },
    'cue-before': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<uri> <decibel>? | none',
    },
    'cursor': {
        initial: createList(
            [
                createList(
                    [
                    ],
                ),
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[[<url> [<x> <y>]?,]* [auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | grab | grabbing | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out]]',
    },
    'cx': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'cy': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'd': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <string>',
    },
    'direction': {
        initial: { type: new Set(['ident', 'keyword']), value: 'ltr' },
        value: 'ltr | rtl',
    },
    'display': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'display-outside']), value: 'inline' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[<display-outside> || <display-inside>] | <display-listitem> | <display-internal> | <display-box> | <display-legacy>',
    },
    'dominant-baseline': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | text-bottom | alphabetic | ideographic | middle | central | mathematical | hanging | text-top',
    },
    'empty-cells': {
        initial: { type: new Set(['ident', 'keyword']), value: 'show' },
        value: 'show | hide',
    },
    'fill': {
        initial: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color', 'paint']), value: 'black' },
        value: '<paint>',
    },
    'fill-break': {
        initial: { type: new Set(['ident', 'keyword']), value: 'bounding-box' },
        value: 'bounding-box | slice | clone',
    },
    'fill-color': {
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'fill-image': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'paint']), value: 'none' },
            ],
            ',',
        ),
        value: '<paint>#',
    },
    'fill-opacity': {
        initial: { type: new Set(['integer', 'number', 'alpha-value', 'opacity']), value: 1 },
        value: "<'opacity'>",
    },
    'fill-origin': {
        initial: { type: new Set(['ident', 'keyword']), value: 'match-parent' },
        value: 'match-parent | fill-box | stroke-box | content-box | padding-box | border-box',
    },
    'fill-position': {
        initial: createList(
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
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'nonzero' },
        value: 'nonzero | evenodd',
    },
    'fill-size': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <filter-value-list>',
    },
    'flex': {
        initial: createList(
            [
                createList(
                    [
                        { type: new Set(['integer', 'number', 'flex-grow']), value: 0 },
                        { type: new Set(['integer', 'number', 'flex-shrink']), value: 1 },
                    ],
                ),
                { type: new Set(['ident', 'keyword', 'width', 'flex-basis']), value: 'auto' },
            ],
        ),
        value: "none | [<'flex-grow'> <'flex-shrink'>? || <'flex-basis'>]",
    },
    'flex-basis': {
        initial: { type: new Set(['ident', 'keyword', 'width']), value: 'auto' },
        value: "content | <'width'>",
    },
    'flex-direction': {
        initial: { type: new Set(['ident', 'keyword']), value: 'row' },
        value: 'row | row-reverse | column | column-reverse',
    },
    'flex-flow': {
        value: "<'flex-direction'> || <'flex-wrap'>",
    },
    'flex-grow': {
        initial: { type: new Set(['integer', 'number']), value: 0 },
        value: '<number [0,∞]>',
    },
    'flex-shrink': {
        initial: { type: new Set(['integer', 'number']), value: 1 },
        value: '<number [0,∞]>',
    },
    'flex-wrap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'nowrap' },
        value: 'nowrap | wrap | wrap-reverse',
    },
    'float': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'block-start | block-end | inline-start | inline-end | snap-block | <snap-block()> | snap-inline | <snap-inline()> | left | right | top | bottom | none | footnote',
    },
    'float-defer': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<integer> | last | none',
    },
    'float-offset': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length> | <percentage>',
    },
    'float-reference': {
        initial: { type: new Set(['ident', 'keyword']), value: 'inline' },
        value: 'inline | column | region | page',
    },
    'flood-color': {
        initial: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']), value: 'black' },
        value: '<color>',
    },
    'flood-opacity': {
        initial: { type: new Set(['integer', 'number', 'alpha-value']), value: 1 },
        value: '<alpha-value>',
    },
    'flow-from': {
        initial: { type: new Set(['ident']), value: 'none' },
        value: '<ident> | none',
    },
    'flow-into': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <ident> [element | content]?',
    },
    'font': {
        value: "[[<'font-style'> || <font-variant-css2> || <'font-weight'> || <font-stretch-css3>]? <'font-size'> [/ <'line-height'>]? <'font-family'>] | caption | icon | menu | message-box | small-caption | status-bar",
    },
    'font-family': {
        initial: createList(
            [
                { type: new Set(['ident', 'custom-ident', 'family-name']), value: 'monospace' },
            ],
            ',',
        ),
        value: '[<family-name> | <generic-family>]#',
    },
    'font-feature-settings': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <feature-tag-value>#',
    },
    'font-kerning': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | normal | none',
    },
    'font-language-override': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <string>',
    },
    'font-optical-sizing': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-palette': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | light | dark | <palette-identifier>',
    },
    'font-size': {
        initial: { type: new Set(['ident', 'keyword', 'absolute-size']), value: 'medium' },
        value: '<absolute-size> | <relative-size> | <length-percentage> | math',
    },
    'font-size-adjust': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [ex-height | cap-height | ch-width | ic-width | ic-height]? [from-font | <number>]',
    },
    'font-stretch': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <percentage> | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded',
    },
    'font-style': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | italic | oblique <angle>?',
    },
    'font-synthesis': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'weight' },
                { type: new Set(['ident', 'keyword']), value: 'style' },
                { type: new Set(['ident', 'keyword']), value: 'small-caps' },
            ],
        ),
        value: 'none | [weight || style || small-caps]',
    },
    'font-synthesis-small-caps': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-synthesis-style': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-synthesis-weight': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'font-variant': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | [<common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> || [small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps] || [stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>)] || <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero || <east-asian-variant-values> || <east-asian-width-values> || ruby || [sub | super]]',
    },
    'font-variant-alternates': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name>#) || character-variant(<feature-value-name>#) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>)]',
    },
    'font-variant-caps': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps',
    },
    'font-variant-east-asian': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<east-asian-variant-values> || <east-asian-width-values> || ruby]',
    },
    'font-variant-emoji': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | text | emoji | unicode',
    },
    'font-variant-ligatures': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | [<common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values>]',
    },
    'font-variant-numeric': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero]',
    },
    'font-variant-position': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | sub | super',
    },
    'font-variation-settings': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [<string> <number>]#',
    },
    'font-weight': {
        initial: { type: new Set(['ident', 'keyword', 'font-weight-absolute']), value: 'normal' },
        value: '<font-weight-absolute> | bolder | lighter',
    },
    'footnote-display': {
        initial: { type: new Set(['ident', 'keyword']), value: 'block' },
        value: 'block | inline | compact',
    },
    'footnote-policy': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | line | block',
    },
    'forced-color-adjust': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | preserve-parent-color',
    },
    'gap': {
        value: "<'row-gap'> <'column-gap'>?",
    },
    'glyph-orientation-vertical': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | 0deg | 90deg | 0 | 90',
    },
    'grid': {
        initial: { type: new Set(['ident', 'keyword', 'grid-template']), value: 'none' },
        value: "<'grid-template'> | <'grid-template-rows'> / [auto-flow && dense?] <'grid-auto-columns'>? | [auto-flow && dense?] <'grid-auto-rows'>? / <'grid-template-columns'>",
    },
    'grid-area': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
                createList(
                    [
                    ],
                ),
            ],
        ),
        value: '<grid-line> [/ <grid-line>]{0,3}',
    },
    'grid-auto-columns': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'track-breadth', 'track-size']), value: 'auto' },
            ],
        ),
        value: '<track-size>+',
    },
    'grid-auto-flow': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'row' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[row | column] || dense',
    },
    'grid-auto-rows': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'track-breadth', 'track-size']), value: 'auto' },
            ],
        ),
        value: '<track-size>+',
    },
    'grid-column': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<grid-line> [/ <grid-line>]?',
    },
    'grid-column-end': {
        initial: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-column-start': {
        initial: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-row': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<grid-line> [/ <grid-line>]?',
    },
    'grid-row-end': {
        initial: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-row-start': {
        initial: { type: new Set(['ident', 'keyword', 'grid-line']), value: 'auto' },
        value: '<grid-line>',
    },
    'grid-template': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: "none | [<'grid-template-rows'> / <'grid-template-columns'>] | [<line-names>? <string> <track-size>? <line-names>?]+ [/ <explicit-track-list>]?",
    },
    'grid-template-areas': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <string>+',
    },
    'grid-template-columns': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>? | masonry',
    },
    'grid-template-rows': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <track-list> | <auto-track-list> | subgrid <line-name-list>? | masonry',
    },
    'hanging-punctuation': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [first || [force-end | allow-end] || last]',
    },
    'height': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'hyphenate-character': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <string>',
    },
    'hyphenate-limit-chars': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[auto | <integer>]{1,3}',
    },
    'hyphenate-limit-last': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | always | column | page | spread',
    },
    'hyphenate-limit-lines': {
        initial: { type: new Set(['ident', 'keyword']), value: 'no-limit' },
        value: 'no-limit | <integer>',
    },
    'hyphenate-limit-zone': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'hyphens': {
        initial: { type: new Set(['ident', 'keyword']), value: 'manual' },
        value: 'none | manual | auto',
    },
    'image-orientation': {
        initial: { type: new Set(['ident', 'keyword']), value: 'from-image' },
        value: 'from-image | none | [<angle> || flip]',
    },
    'image-rendering': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | smooth | high-quality | pixelated | crisp-edges',
    },
    'image-resolution': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <number> <integer> | <number> && [drop | raise]?',
    },
    'initial-letter-align': {
        initial: createList(
            [
                { omitted: true, type: new Set([]) },
                { type: new Set(['ident', 'keyword']), value: 'alphabetic' },
            ],
        ),
        value: '[border-box? [alphabetic | ideographic | hanging | leading]?]!',
    },
    'initial-letter-wrap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | first | all | grid | <length-percentage>',
    },
    'inline-size': {
        initial: { type: new Set(['ident', 'keyword', 'width']), value: 'auto' },
        value: "<'width'> | stretch | fit-content | contain",
    },
    'inline-sizing': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | stretch',
    },
    'input-security': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'inset': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'top']), value: 'auto' },
            ],
        ),
        value: '<top>{1,4}',
    },
    'inset-block': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'top']), value: 'auto' },
            ],
        ),
        value: '<top>{1,2}',
    },
    'inset-block-end': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'inset-block-start': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'inset-inline': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'top']), value: 'auto' },
            ],
        ),
        value: '<top>{1,2}',
    },
    'inset-inline-end': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'inset-inline-start': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'isolation': {
        initial: { type: new Set(['ident', 'keyword', 'isolation-mode']), value: 'auto' },
        value: '<isolation-mode>',
    },
    'justify-content': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <content-distribution> | <overflow-position>? [<content-position> | left | right]',
    },
    'justify-items': {
        initial: { type: new Set(['ident', 'keyword']), value: 'legacy' },
        value: 'normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right] | legacy | legacy && [left | right | center]',
    },
    'justify-self': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | normal | stretch | <baseline-position> | <overflow-position>? [<self-position> | left | right]',
    },
    'justify-tracks': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'normal' },
            ],
            ',',
        ),
        value: '[normal | <content-distribution> | <overflow-position>? [<content-position> | left | right]]#',
    },
    'leading-trim': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | start | end | both',
    },
    'left': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'letter-spacing': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length>',
    },
    'lighting-color': {
        initial: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']), value: 'white' },
        value: '<color>',
    },
    'line-break': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | loose | normal | strict | anywhere',
    },
    'line-clamp': {
        value: "none | <integer> <'block-ellipsis'>?",
    },
    'line-grid': {
        initial: { type: new Set(['ident', 'keyword']), value: 'match-parent' },
        value: 'match-parent | create',
    },
    'line-height': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <number> | <length-percentage>',
    },
    'line-height-step': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'line-padding': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'line-snap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | baseline | contain',
    },
    'list-style': {
        value: "<'list-style-position'> || <'list-style-image'> || <'list-style-type'>",
    },
    'list-style-image': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<image> | none',
    },
    'list-style-position': {
        initial: { type: new Set(['ident', 'keyword']), value: 'outside' },
        value: 'inside | outside',
    },
    'list-style-type': {
        initial: { type: new Set(['ident', 'custom-ident', 'counter-style-name', 'counter-style']), value: 'disc' },
        value: '<counter-style> | <string> | none',
    },
    'margin': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
            ],
        ),
        value: "<'margin-top'>{1,4}",
    },
    'margin-block': {
        value: "<'margin-top'>{1,2}",
    },
    'margin-block-end': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-block-start': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-bottom': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-break': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | keep | discard',
    },
    'margin-inline': {
        value: "<'margin-top'>{1,2}",
    },
    'margin-inline-end': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-inline-start': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'margin-top']), value: 0 },
        value: "<'margin-top'>",
    },
    'margin-left': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-right': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-top': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | auto',
    },
    'margin-trim': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | in-flow | all',
    },
    'marker': {
        value: 'none | <marker-ref>',
    },
    'marker-end': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <marker-ref>',
    },
    'marker-mid': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <marker-ref>',
    },
    'marker-side': {
        initial: { type: new Set(['ident', 'keyword']), value: 'match-self' },
        value: 'match-self | match-parent',
    },
    'marker-start': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <marker-ref>',
    },
    'mask': {
        value: '<mask-layer>#',
    },
    'mask-border': {
        value: "<'mask-border-source'> || <'mask-border-slice'> [/ <'mask-border-width'>? [/ <'mask-border-outset'>]?]? || <'mask-border-repeat'> || <'mask-border-mode'>",
    },
    'mask-border-mode': {
        initial: { type: new Set(['ident', 'keyword']), value: 'alpha' },
        value: 'luminance | alpha',
    },
    'mask-border-outset': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '[<length> | <number>]{1,4}',
    },
    'mask-border-repeat': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'stretch' },
            ],
        ),
        value: '[stretch | repeat | round | space]{1,2}',
    },
    'mask-border-slice': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <image>',
    },
    'mask-border-width': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[<length-percentage> | <number> | auto]{1,4}',
    },
    'mask-clip': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'box', 'shape-box', 'geometry-box']), value: 'border-box' },
            ],
            ',',
        ),
        value: '[<geometry-box> | no-clip]#',
    },
    'mask-composite': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'compositing-operator']), value: 'add' },
            ],
            ',',
        ),
        value: '<compositing-operator>#',
    },
    'mask-image': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'mask-reference']), value: 'none' },
            ],
            ',',
        ),
        value: '<mask-reference>#',
    },
    'mask-mode': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'masking-mode']), value: 'match-source' },
            ],
            ',',
        ),
        value: '<masking-mode>#',
    },
    'mask-origin': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'box', 'shape-box', 'geometry-box']), value: 'border-box' },
            ],
            ',',
        ),
        value: '<geometry-box>#',
    },
    'mask-position': {
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'luminance' },
        value: 'luminance | alpha',
    },
    'masonry-auto-flow': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'pack' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[pack | next] || [definite-first | ordered]',
    },
    'max-block-size': {
        initial: { type: new Set(['ident', 'keyword', 'max-width']), value: 'none' },
        value: "<'max-width'> | stretch | fit-content | contain",
    },
    'max-height': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'max-inline-size': {
        initial: { type: new Set(['ident', 'keyword', 'max-width']), value: 'none' },
        value: "<'max-width'> | stretch | fit-content | contain",
    },
    'max-lines': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <integer>',
    },
    'max-width': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'min-block-size': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'min-width']), value: 0 },
        value: "<'min-width'> | stretch | fit-content | contain",
    },
    'min-height': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'min-inline-size': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'min-width']), value: 0 },
        value: "<'min-width'> | stretch | fit-content | contain",
    },
    'min-intrinsic-sizing': {
        initial: { type: new Set(['ident', 'keyword']), value: 'legacy' },
        value: 'legacy | zero-if-scroll || zero-if-extrinsic',
    },
    'min-width': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'mix-blend-mode': {
        initial: { type: new Set(['ident', 'keyword', 'blend-mode']), value: 'normal' },
        value: '<blend-mode>',
    },
    'nav-down': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-left': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-right': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'nav-up': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <id> [current | root | <target-name>]?',
    },
    'object-fit': {
        initial: { type: new Set(['ident', 'keyword']), value: 'fill' },
        value: 'fill | none | [contain | cover] || scale-down',
    },
    'object-position': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <position>',
    },
    'offset-distance': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'offset-path': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <ray()> | <path()> | <url> | [<basic-shape> && <coord-box>?] | <coord-box>',
    },
    'offset-position': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <position>',
    },
    'offset-rotate': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[auto | reverse] || <angle>',
    },
    'opacity': {
        initial: { type: new Set(['integer', 'number', 'alpha-value']), value: 1 },
        value: '<alpha-value>',
    },
    'order': {
        initial: { type: new Set(['integer']), value: 0 },
        value: '<integer>',
    },
    'orphans': {
        initial: { type: new Set(['integer']), value: 2 },
        value: '<integer>',
    },
    'outline': {
        value: "[<'outline-color'> || <'outline-style'> || <'outline-width'>]",
    },
    'outline-color': {
        initial: { type: new Set(['ident', 'keyword']), value: 'invert' },
        value: '<color> | invert',
    },
    'outline-offset': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'outline-style': {
        initial: { type: new Set(['ident', 'keyword', 'line-style', 'outline-line-style']), value: 'none' },
        value: 'auto | <outline-line-style>',
    },
    'outline-width': {
        initial: { type: new Set(['ident', 'keyword', 'line-width']), value: 'medium' },
        value: '<line-width>',
    },
    'overflow': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'visible' },
            ],
        ),
        value: '[visible | hidden | clip | scroll | auto]{1,2}',
    },
    'overflow-anchor': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'overflow-block': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'visible' },
            ],
            ' ',
            new Set(['overflow']),
        ),
        value: "<'overflow'>",
    },
    'overflow-clip-margin': {
        initial: createList(
            [
                { omitted: true, type: new Set([]) },
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<visual-box> || <length [0,∞]>',
    },
    'overflow-inline': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'visible' },
            ],
            ' ',
            new Set(['overflow']),
        ),
        value: "<'overflow'>",
    },
    'overflow-wrap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | break-word | anywhere',
    },
    'overflow-x': {
        initial: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overflow-y': {
        initial: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden | clip | scroll | auto',
    },
    'overscroll-behavior': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[contain | none | auto]{1,2}',
    },
    'overscroll-behavior-block': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-inline': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-x': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'overscroll-behavior-y': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'contain | none | auto',
    },
    'padding': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
            ],
        ),
        value: "<'padding-top'>{1,4}",
    },
    'padding-block': {
        value: "<'padding-top'>{1,2}",
    },
    'padding-block-end': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-block-start': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-bottom': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'padding-inline': {
        value: "<'padding-top'>{1,2}",
    },
    'padding-inline-end': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-inline-start': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage', 'padding-top']), value: 0 },
        value: "<'padding-top'>",
    },
    'padding-left': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'padding-right': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'padding-top': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'page': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <custom-ident>',
    },
    'page-break-after': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | always | avoid | left | right',
    },
    'page-break-before': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | always | avoid | left | right',
    },
    'page-break-inside': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'avoid | auto',
    },
    'paint-order': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | [fill || stroke || markers]',
    },
    'pause': {
        value: "<'pause-before'> <'pause-after'>?",
    },
    'pause-after': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'pause-before': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'perspective': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length [0,∞]>',
    },
    'perspective-origin': {
        initial: createList(
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
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'align-content']), value: 'normal' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: "<'align-content'> <'justify-content'>?",
    },
    'place-items': {
        value: "<'align-items'> <'justify-items'>?",
    },
    'place-self': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'align-self']), value: 'auto' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: "<'align-self'> <'justify-self'>?",
    },
    'pointer-events': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | bounding-box | visiblePainted | visibleFill | visibleStroke | visible | painted | fill | stroke | all | none',
    },
    'position': {
        initial: { type: new Set(['ident', 'keyword']), value: 'static' },
        value: 'static | relative | absolute | sticky | fixed | running()',
    },
    'print-color-adjust': {
        initial: { type: new Set(['ident', 'keyword']), value: 'economy' },
        value: 'economy | exact',
    },
    'quotes': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | [<string> <string>]+',
    },
    'r': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'region-fragment': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | break',
    },
    'resize': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | both | horizontal | vertical | block | inline',
    },
    'rest': {
        value: "<'rest-before'> <'rest-after'>?",
    },
    'rest-after': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'rest-before': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<time> | none | x-weak | weak | medium | strong | x-strong',
    },
    'right': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'rotate': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <angle> | [x | y | z | <number>{3}] && <angle>',
    },
    'row-gap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length-percentage>',
    },
    'ruby-align': {
        initial: { type: new Set(['ident', 'keyword']), value: 'space-around' },
        value: 'start | center | space-between | space-around',
    },
    'ruby-merge': {
        initial: { type: new Set(['ident', 'keyword']), value: 'separate' },
        value: 'separate | merge | auto',
    },
    'ruby-overhang': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none',
    },
    'ruby-position': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'alternate' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[alternate || [over | under]] | inter-character',
    },
    'rx': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: '<length-percentage> | auto',
    },
    'ry': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: '<length-percentage> | auto',
    },
    'scale': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<number> | <percentage>]{1,3}',
    },
    'scroll-behavior': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | smooth',
    },
    'scroll-margin': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<length>{1,4}',
    },
    'scroll-margin-block': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<length>{1,2}',
    },
    'scroll-margin-block-end': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-block-start': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-bottom': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-inline': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length']), value: 0 },
            ],
        ),
        value: '<length>{1,2}',
    },
    'scroll-margin-inline-end': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-inline-start': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-left': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-right': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-margin-top': {
        initial: { type: new Set(['dimension', 'length']), value: 0 },
        value: '<length>',
    },
    'scroll-padding': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[auto | <length-percentage>]{1,4}',
    },
    'scroll-padding-block': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[auto | <length-percentage>]{1,2}',
    },
    'scroll-padding-block-end': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-block-start': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-bottom': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-inline': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'auto' },
            ],
        ),
        value: '[auto | <length-percentage>]{1,2}',
    },
    'scroll-padding-inline-end': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-inline-start': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-left': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-right': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-padding-top': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'scroll-snap-align': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'none' },
            ],
        ),
        value: '[none | start | end | center]{1,2}',
    },
    'scroll-snap-stop': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | always',
    },
    'scroll-snap-type': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [x | y | block | inline | both] [mandatory | proximity]?',
    },
    'scrollbar-color': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <color>{2}',
    },
    'scrollbar-gutter': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | stable && both-edges?',
    },
    'scrollbar-width': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | thin | none',
    },
    'shape-image-threshold': {
        initial: { type: new Set(['integer', 'number', 'alpha-value']), value: 0 },
        value: '<alpha-value>',
    },
    'shape-inside': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | outside-shape | [<basic-shape> || shape-box] | <image> | display',
    },
    'shape-margin': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'shape-outside': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<basic-shape> || <shape-box>] | <image>',
    },
    'shape-padding': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: '<length> | none',
    },
    'shape-rendering': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | optimizeSpeed | crispEdges | geometricPrecision',
    },
    'shape-subtract': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<basic-shape>| <uri>]+',
    },
    'spatial-navigation-action': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | focus | scroll',
    },
    'spatial-navigation-contain': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | contain',
    },
    'spatial-navigation-function': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | grid',
    },
    'speak': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | never | always',
    },
    'speak-as': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | spell-out || digits || [literal-punctuation | no-punctuation]',
    },
    'stop-color': {
        initial: { type: new Set(['ident', 'keyword', 'named-color', 'absolute-color-base', 'color']), value: 'black' },
        value: "<'color'>",
    },
    'stop-opacity': {
        initial: { type: new Set(['integer', 'number', 'alpha-value', 'opacity']), value: 1 },
        value: "<'opacity'>",
    },
    'string-set': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<custom-ident> <string>+]#',
    },
    'stroke': {
        initial: { type: new Set(['ident', 'keyword', 'paint']), value: 'none' },
        value: '<paint>',
    },
    'stroke-align': {
        initial: { type: new Set(['ident', 'keyword']), value: 'center' },
        value: 'center | inset | outset',
    },
    'stroke-alignment': {
        initial: { type: new Set(['ident', 'keyword']), value: 'center' },
        value: 'center | inner | outer',
    },
    'stroke-break': {
        initial: { type: new Set(['ident', 'keyword']), value: 'bounding-box' },
        value: 'bounding-box | slice | clone',
    },
    'stroke-color': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'absolute-color-base', 'color']), value: 'transparent' },
            ],
            ',',
        ),
        value: '<color>#',
    },
    'stroke-dash-corner': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length>',
    },
    'stroke-dash-justify': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [stretch | compress] || [dashes || gaps]',
    },
    'stroke-dashadjust': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [stretch | compress] [dashes | gaps]?',
    },
    'stroke-dasharray': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <dasharray>',
    },
    'stroke-dashcorner': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length>',
    },
    'stroke-dashoffset': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage> | <number>',
    },
    'stroke-image': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'paint']), value: 'none' },
            ],
            ',',
        ),
        value: '<paint>#',
    },
    'stroke-linecap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'butt' },
        value: 'butt | round | square',
    },
    'stroke-linejoin': {
        initial: { type: new Set(['ident', 'keyword']), value: 'miter' },
        value: 'miter | miter-clip | round | bevel | arcs',
    },
    'stroke-miterlimit': {
        initial: { type: new Set(['integer', 'number']), value: 4 },
        value: '<number>',
    },
    'stroke-opacity': {
        initial: { type: new Set(['integer', 'number', 'alpha-value', 'opacity']), value: 1 },
        value: "<'opacity'>",
    },
    'stroke-origin': {
        initial: { type: new Set(['ident', 'keyword']), value: 'match-parent' },
        value: 'match-parent | fill-box | stroke-box | content-box | padding-box | border-box',
    },
    'stroke-position': {
        initial: createList(
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
        initial: createList(
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
        initial: createList(
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
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 1 },
        value: '<length-percentage> | <number>',
    },
    'tab-size': {
        initial: { type: new Set(['integer', 'number']), value: 8 },
        value: '<number> | <length>',
    },
    'table-layout': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | fixed',
    },
    'text-align': {
        initial: { type: new Set(['ident', 'keyword']), value: 'start' },
        value: 'start | end | left | right | center | justify | match-parent | justify-all',
    },
    'text-align-all': {
        initial: { type: new Set(['ident', 'keyword']), value: 'start' },
        value: 'start | end | left | right | center | justify | match-parent',
    },
    'text-align-last': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | start | end | left | right | center | justify | match-parent',
    },
    'text-anchor': {
        initial: { type: new Set(['ident', 'keyword']), value: 'start' },
        value: 'start | middle | end',
    },
    'text-combine-upright': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | all | [digits <integer>?]',
    },
    'text-decoration': {
        value: "<'text-decoration-line'> || <'text-decoration-thickness'> || <'text-decoration-style'> || <'text-decoration-color'>",
    },
    'text-decoration-color': {
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'text-decoration-line': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [underline || overline || line-through || blink] | spelling-error | grammar-error',
    },
    'text-decoration-skip': {
        value: 'none | auto',
    },
    'text-decoration-skip-box': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | all',
    },
    'text-decoration-skip-ink': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | all',
    },
    'text-decoration-skip-inset': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | auto',
    },
    'text-decoration-skip-self': {
        initial: { type: new Set(['ident', 'keyword']), value: 'objects' },
        value: 'none | objects',
    },
    'text-decoration-skip-spaces': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'start' },
                { type: new Set(['ident', 'keyword']), value: 'end' },
            ],
        ),
        value: 'none | all | [start || end]',
    },
    'text-decoration-style': {
        initial: { type: new Set(['ident', 'keyword']), value: 'solid' },
        value: 'solid | double | dotted | dashed | wavy',
    },
    'text-decoration-thickness': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | from-font | <length> | <percentage>',
    },
    'text-edge': {
        initial: { type: new Set(['ident', 'keyword']), value: 'leading' },
        value: 'leading | [text | cap | ex | ideographic | ideographic-ink] [text | alphabetic | ideographic | ideographic-ink]?',
    },
    'text-emphasis': {
        value: "<'text-emphasis-style'> || <'text-emphasis-color'>",
    },
    'text-emphasis-color': {
        initial: { type: new Set(['ident', 'keyword', 'color']), value: 'currentcolor' },
        value: '<color>',
    },
    'text-emphasis-position': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'over' },
                { type: new Set(['ident', 'keyword']), value: 'right' },
            ],
        ),
        value: '[over | under] && [right | left]?',
    },
    'text-emphasis-skip': {
        initial: createList(
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
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [[filled | open] || [dot | circle | double-circle | triangle | sesame]] | <string>',
    },
    'text-group-align': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | start | end | left | right | center',
    },
    'text-indent': {
        initial: createList(
            [
                { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
                { omitted: true, type: new Set([]) },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[<length-percentage>] && hanging? && each-line?',
    },
    'text-justify': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | inter-word | inter-character',
    },
    'text-orientation': {
        initial: { type: new Set(['ident', 'keyword']), value: 'mixed' },
        value: 'mixed | upright | sideways',
    },
    'text-overflow': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'clip' },
            ],
        ),
        value: '[clip | ellipsis | <string> | fade | <fade()>]{1,2}',
    },
    'text-rendering': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | optimizeSpeed | optimizeLegibility | geometricPrecision',
    },
    'text-shadow': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [<color>? && <length>{2,4}]#',
    },
    'text-size-adjust': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | <percentage>',
    },
    'text-space-collapse': {
        initial: { type: new Set(['ident', 'keyword']), value: 'collapse' },
        value: 'collapse | discard | preserve | preserve-breaks | preserve-spaces',
    },
    'text-space-trim': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | trim-inner || discard-before || discard-after',
    },
    'text-spacing': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | none | auto | [trim-start | space-start | space-first] || [trim-end | space-end | allow-end] || [trim-adjacent | space-adjacent] || no-compress || ideograph-alpha || ideograph-numeric || punctuation',
    },
    'text-transform': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | [capitalize | uppercase | lowercase] || full-width || full-size-kana',
    },
    'text-underline-offset': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length> | <percentage>',
    },
    'text-underline-position': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | [from-font | under] || [left | right]',
    },
    'text-wrap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'wrap' },
        value: 'wrap | nowrap | balance | stable | pretty',
    },
    'top': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage>',
    },
    'touch-action': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | none | [[pan-x | pan-left | pan-right] || [pan-y | pan-up | pan-down] || pinch-zoom] | manipulation',
    },
    'transform': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <transform-list>',
    },
    'transform-box': {
        initial: { type: new Set(['ident', 'keyword']), value: 'view-box' },
        value: 'content-box | border-box | fill-box | stroke-box | view-box',
    },
    'transform-origin': {
        initial: createList(
            [
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
                { type: new Set(['percentage', 'length-percentage']), value: 50 },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[left | center | right | top | bottom | <length-percentage>] | [left | center | right | <length-percentage>] [top | center | bottom | <length-percentage>] <length>? | [[center | left | right] && [center | top | bottom]] <length>?',
    },
    'transform-style': {
        initial: { type: new Set(['ident', 'keyword']), value: 'flat' },
        value: 'flat | preserve-3d',
    },
    'transition': {
        value: '<single-transition>#',
    },
    'transition-delay': {
        initial: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'transition-duration': {
        initial: createList(
            [
                { type: new Set(['dimension', 'time']), value: 0 },
            ],
            ',',
        ),
        value: '<time>#',
    },
    'transition-property': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'single-transition-property']), value: 'all' },
            ],
            ',',
        ),
        value: 'none | <single-transition-property>#',
    },
    'transition-timing-function': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword', 'cubic-bezier-easing-function', 'easing-function']), value: 'ease' },
            ],
            ',',
        ),
        value: '<easing-function>#',
    },
    'translate': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | <length-percentage> [<length-percentage> <length>?]?',
    },
    'unicode-bidi': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | embed | isolate | bidi-override | isolate-override | plaintext',
    },
    'user-select': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | text | none | contain | all',
    },
    'vector-effect': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | non-scaling-stroke | non-scaling-size | non-rotation | fixed-position',
    },
    'vertical-align': {
        initial: createList(
            [
                { omitted: true, type: new Set([]) },
                { type: new Set(['ident', 'keyword', 'alignment-baseline']), value: 'baseline' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: "[first | last] || <'alignment-baseline'> || <'baseline-shift'>",
    },
    'visibility': {
        initial: { type: new Set(['ident', 'keyword']), value: 'visible' },
        value: 'visible | hidden | collapse',
    },
    'voice-balance': {
        initial: { type: new Set(['ident', 'keyword']), value: 'center' },
        value: '<number> | left | center | right | leftwards | rightwards',
    },
    'voice-duration': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <time>',
    },
    'voice-family': {
        initial: createList(
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
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'medium' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<frequency> && absolute | [[x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]]',
    },
    'voice-range': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'medium' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '<frequency> && absolute | [[x-low | low | medium | high | x-high] || [<frequency> | <semitones> | <percentage>]]',
    },
    'voice-rate': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'normal' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: '[normal | x-slow | slow | medium | fast | x-fast] || <percentage>',
    },
    'voice-stress': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | strong | moderate | none | reduced',
    },
    'voice-volume': {
        initial: createList(
            [
                { type: new Set(['ident', 'keyword']), value: 'medium' },
                { omitted: true, type: new Set([]) },
            ],
        ),
        value: 'silent | [[x-soft | soft | medium | loud | x-loud] || <decibel>]',
    },
    'white-space': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'normal | pre | nowrap | pre-wrap | break-spaces | pre-line | auto',
    },
    'widows': {
        initial: { type: new Set(['integer']), value: 2 },
        value: '<integer>',
    },
    'width': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <length-percentage> | min-content | max-content | fit-content(<length-percentage>) | stretch | fit-content | contain',
    },
    'will-change': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <animateable-feature>#',
    },
    'word-boundary-detection': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | manual | auto(<lang>)',
    },
    'word-boundary-expansion': {
        initial: { type: new Set(['ident', 'keyword']), value: 'none' },
        value: 'none | space | ideographic-space',
    },
    'word-break': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | keep-all | break-all | break-word',
    },
    'word-spacing': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | <length>',
    },
    'word-wrap': {
        initial: { type: new Set(['ident', 'keyword']), value: 'normal' },
        value: 'normal | break-word | anywhere',
    },
    'wrap-after': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-before': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid | avoid-line | avoid-flex | line | flex',
    },
    'wrap-flow': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | both | start | end | minimum | maximum | clear',
    },
    'wrap-inside': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | avoid',
    },
    'wrap-through': {
        initial: { type: new Set(['ident', 'keyword']), value: 'wrap' },
        value: 'wrap | none',
    },
    'writing-mode': {
        initial: { type: new Set(['ident', 'keyword']), value: 'horizontal-tb' },
        value: 'horizontal-tb | vertical-rl | vertical-lr | sideways-rl | sideways-lr',
    },
    'x': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'y': {
        initial: { type: new Set(['dimension', 'length', 'length-percentage']), value: 0 },
        value: '<length-percentage>',
    },
    'z-index': {
        initial: { type: new Set(['ident', 'keyword']), value: 'auto' },
        value: 'auto | <integer>',
    },
}
