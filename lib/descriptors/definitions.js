
// Generated from /var/www/packages/css/scripts/initial.js

const { list, omitted } = require('../values/value.js')

module.exports = {
    '@color-profile': {
        'components': {
            value: '<ident>#',
        },
        'rendering-intent': {
            initial: {
                parsed: {
                    end: 21,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'rendering-intent'],
                    value: 'relative-colorimetric',
                },
                serialized: 'relative-colorimetric',
            },
            value: 'relative-colorimetric | absolute-colorimetric | perceptual | saturation',
        },
        'src': {
            value: '<url>',
        },
    },
    '@container': {
        'aspect-ratio': {
            type: 'range',
            value: '<ratio>',
        },
        'block-size': {
            type: 'range',
            value: '<length>',
        },
        'height': {
            type: 'range',
            value: '<length>',
        },
        'inline-size': {
            type: 'range',
            value: '<length>',
        },
        'orientation': {
            type: 'discrete',
            value: 'portrait | landscape',
        },
        'overflowing': {
            type: 'discrete',
            value: 'none | top | right | bottom | left | block-start | inline-start | block-end | inline-end',
        },
        'snapped': {
            type: 'discrete',
            value: 'none | x | y | block | inline',
        },
        'stuck': {
            type: 'discrete',
            value: 'none | top | right | bottom | left | block-start | inline-start | block-end | inline-end',
        },
        'width': {
            type: 'range',
            value: '<length>',
        },
    },
    '@counter-style': {
        'additive-symbols': {
            value: '[<integer [0,∞]> && <symbol>]#',
        },
        'fallback': {
            initial: {
                parsed: {
                    types: ['<ident-token>', '<ident>', '<keyword>', '<counter-style-name>', 'fallback'],
                    value: 'decimal',
                },
                serialized: 'decimal',
            },
            value: '<counter-style-name>',
        },
        'negative': {
            initial: {
                parsed: list(
                    [
                        {
                            end: 3,
                            start: 0,
                            types: ['<string-token>', '<string>', '<symbol>'],
                            value: '-',
                        },
                        omitted,
                    ],
                    ' ',
                    ['negative'],
                ),
                serialized: '"-"',
            },
            value: '<symbol> <symbol>?',
        },
        'pad': {
            initial: {
                parsed: list(
                    [
                        {
                            end: 1,
                            start: 0,
                            types: ['<number-token>', '<integer>'],
                            value: 0,
                        },
                        {
                            end: 4,
                            start: 2,
                            types: ['<string-token>', '<string>', '<symbol>'],
                            value: '',
                        },
                    ],
                    ' ',
                    ['pad'],
                ),
                serialized: '0 ""',
            },
            value: '<integer [0,∞]> && <symbol>',
        },
        'prefix': {
            initial: {
                parsed: {
                    end: 2,
                    start: 0,
                    types: ['<string-token>', '<string>', '<symbol>', 'prefix'],
                    value: '',
                },
                serialized: '""',
            },
            value: '<symbol>',
        },
        'range': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'range'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: '[[<integer> | infinite]{2}]# | auto',
        },
        'speak-as': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'speak-as'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | bullets | numbers | words | spell-out | <counter-style-name>',
        },
        'suffix': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<string-token>', '<string>', '<symbol>', 'suffix'],
                    value: '. ',
                },
                serialized: '". "',
            },
            value: '<symbol>',
        },
        'symbols': {
            value: '<symbol>+',
        },
        'system': {
            initial: {
                parsed: {
                    end: 8,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'system'],
                    value: 'symbolic',
                },
                serialized: 'symbolic',
            },
            value: 'cyclic | numeric | alphabetic | symbolic | additive | fixed <integer>? | extends <counter-style-name>',
        },
    },
    '@font-face': {
        'ascent-override': {
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
                    ' ',
                    ['ascent-override'],
                ),
                serialized: 'normal',
            },
            value: '[normal | <percentage [0,∞]>]{1,2}',
        },
        'descent-override': {
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
                    ' ',
                    ['descent-override'],
                ),
                serialized: 'normal',
            },
            value: '[normal | <percentage [0,∞]>]{1,2}',
        },
        'font-display': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'font-display'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | block | swap | fallback | optional',
        },
        'font-family': {
            value: '<family-name>',
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
        'font-named-instance': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'font-named-instance'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | <string>',
        },
        'font-size': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'font-size'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | <number>{1,2}',
        },
        'font-style': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'font-style'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | normal | italic | oblique [<angle [-90deg,90deg]>{1,2}]?',
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
            value: 'normal | [<string> <number>]#',
        },
        'font-weight': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'font-weight'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | <font-weight-absolute>{1,2}',
        },
        'font-width': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'font-width'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: "auto | <'font-width'>{1,2}",
        },
        'line-gap-override': {
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
                    ' ',
                    ['line-gap-override'],
                ),
                serialized: 'normal',
            },
            value: '[normal | <percentage [0,∞]>]{1,2}',
        },
        'size-adjust': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<percentage-token>', '<percentage>', 'size-adjust'],
                    unit: '%',
                    value: 100,
                },
                serialized: '100%',
            },
            value: '<percentage [0,∞]>',
        },
        'src': {
            value: '<font-src-list>',
        },
        'subscript-position-override': {
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
                    ' ',
                    ['subscript-position-override'],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage>]{1,2}',
        },
        'subscript-size-override': {
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
                    ' ',
                    ['subscript-size-override'],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage [0,∞]>]{1,2}',
        },
        'superscript-position-override': {
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
                    ' ',
                    ['superscript-position-override'],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage>]{1,2}',
        },
        'superscript-size-override': {
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
                    ' ',
                    ['superscript-size-override'],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage [0,∞]>]{1,2}',
        },
        'unicode-range': {
            initial: {
                parsed: list(
                    [
                        {
                            from: 0,
                            to: 1114111,
                            types: ['<urange>'],
                        },
                    ],
                    ',',
                    ['unicode-range'],
                ),
                serialized: 'U+0-10FFFF',
            },
            value: '<urange>#',
        },
    },
    '@font-feature-values': {
        'font-display': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'font-display'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | block | swap | fallback | optional',
        },
    },
    '@font-palette-values': {
        'base-palette': {
            value: 'light | dark | <integer [0,∞]>',
        },
        'font-family': {
            value: '<family-name>#',
        },
        'override-colors': {
            value: '[<integer [0,∞]> <color>]#',
        },
    },
    '@function': {
        '--*': {
            value: '<declaration-value>?',
        },
        'result': {
            value: '<declaration-value>?',
        },
    },
    '@media': {
        '-webkit-transform-3d': {
            type: 'discrete',
            value: '<mq-boolean>',
        },
        'any-hover': {
            type: 'discrete',
            value: 'none | hover',
        },
        'any-pointer': {
            type: 'discrete',
            value: 'none | coarse | fine',
        },
        'aspect-ratio': {
            type: 'range',
            value: '<ratio>',
        },
        'color': {
            type: 'range',
            value: '<integer>',
        },
        'color-gamut': {
            type: 'discrete',
            value: 'srgb | p3 | rec2020',
        },
        'color-index': {
            type: 'range',
            value: '<integer>',
        },
        'device-aspect-ratio': {
            type: 'range',
            value: '<ratio>',
        },
        'device-height': {
            type: 'range',
            value: '<length>',
        },
        'device-width': {
            type: 'range',
            value: '<length>',
        },
        'display-mode': {
            type: 'discrete',
            value: 'fullscreen | standalone | minimal-ui | browser | picture-in-picture',
        },
        'dynamic-range': {
            type: 'discrete',
            value: 'standard | high',
        },
        'environment-blending': {
            type: 'discrete',
            value: 'opaque | additive | subtractive',
        },
        'forced-colors': {
            type: 'discrete',
            value: 'none | active',
        },
        'grid': {
            type: 'discrete',
            value: '<mq-boolean>',
        },
        'height': {
            type: 'range',
            value: '<length>',
        },
        'horizontal-viewport-segments': {
            type: 'range',
            value: '<integer>',
        },
        'hover': {
            type: 'discrete',
            value: 'none | hover',
        },
        'inverted-colors': {
            type: 'discrete',
            value: 'none | inverted',
        },
        'monochrome': {
            type: 'range',
            value: '<integer>',
        },
        'nav-controls': {
            type: 'discrete',
            value: 'none | back',
        },
        'orientation': {
            type: 'discrete',
            value: 'portrait | landscape',
        },
        'overflow-block': {
            type: 'discrete',
            value: 'none | scroll | paged',
        },
        'overflow-inline': {
            type: 'discrete',
            value: 'none | scroll',
        },
        'pointer': {
            type: 'discrete',
            value: 'none | coarse | fine',
        },
        'prefers-color-scheme': {
            type: 'discrete',
            value: 'light | dark',
        },
        'prefers-contrast': {
            type: 'discrete',
            value: 'no-preference | less | more | custom',
        },
        'prefers-reduced-data': {
            type: 'discrete',
            value: 'no-preference | reduce',
        },
        'prefers-reduced-motion': {
            type: 'discrete',
            value: 'no-preference | reduce',
        },
        'prefers-reduced-transparency': {
            type: 'discrete',
            value: 'no-preference | reduce',
        },
        'resolution': {
            type: 'range',
            value: '<resolution> | infinite',
        },
        'scan': {
            type: 'discrete',
            value: 'interlace | progressive',
        },
        'scripting': {
            type: 'discrete',
            value: 'none | initial-only | enabled',
        },
        'shape': {
            type: 'discrete',
            value: 'rect | round',
        },
        'update': {
            type: 'discrete',
            value: 'none | slow | fast',
        },
        'vertical-viewport-segments': {
            type: 'range',
            value: '<integer>',
        },
        'video-color-gamut': {
            type: 'discrete',
            value: 'srgb | p3 | rec2020',
        },
        'video-dynamic-range': {
            type: 'discrete',
            value: 'standard | high',
        },
        'width': {
            type: 'range',
            value: '<length>',
        },
    },
    '@page': {
        'bleed': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'bleed'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | <length>',
        },
        'marks': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'marks'],
                    value: 'none',
                },
                serialized: 'none',
            },
            value: 'none | crop || cross',
        },
        'page-orientation': {
            initial: {
                parsed: {
                    end: 7,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'page-orientation'],
                    value: 'upright',
                },
                serialized: 'upright',
            },
            value: 'upright | rotate-left | rotate-right',
        },
        'size': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'size'],
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: '<length [0,∞]>{1,2} | auto | <page-size> || [portrait | landscape]',
        },
    },
    '@property': {
        'inherits': {
            value: 'true | false',
        },
        'initial-value': {
            value: '<declaration-value>?',
        },
        'syntax': {
            value: '<string>',
        },
    },
    '@view-transition': {
        'navigation': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'navigation'],
                    value: 'none',
                },
                serialized: 'none',
            },
            value: 'auto | none',
        },
        'types': {
            initial: {
                parsed: {
                    end: 4,
                    start: 0,
                    types: ['<ident-token>', '<ident>', '<keyword>', 'types'],
                    value: 'none',
                },
                serialized: 'none',
            },
            value: 'none | <custom-ident>+',
        },
    },
}
