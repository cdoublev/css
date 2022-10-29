
// Generated from /var/www/packages/css/scripts/initial.js

const { createList } = require('../values/value.js')

module.exports = {
    '@color-profile': {
        'components': {
            value: '<ident>#',
        },
        'rendering-intent': {
            initial: {
                parsed: {
                    representation: 'relative-colorimetric',
                    type: new Set(['ident', 'keyword']),
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
            value: '<ratio>',
        },
        'block-size': {
            value: '<length>',
        },
        'height': {
            value: '<length>',
        },
        'inline-size': {
            value: '<length>',
        },
        'orientation': {
            value: 'portrait | landscape',
        },
        'width': {
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
                    representation: 'decimal',
                    type: new Set(['ident', 'custom-ident', 'counter-style-name']),
                    value: 'decimal',
                },
                serialized: 'decimal',
            },
            value: '<counter-style-name>',
        },
        'negative': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: '"-"',
                            type: new Set(['string', 'symbol']),
                            value: '-',
                        },
                        {
                            omitted: true,
                            type: new Set([]),
                            value: '<symbol>?',
                        },
                    ],
                ),
                serialized: '"-"',
            },
            value: '<symbol> <symbol>?',
        },
        'pad': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: '0',
                            type: new Set(['number', 'integer']),
                            value: 0,
                        },
                        {
                            representation: '""',
                            type: new Set(['string', 'symbol']),
                            value: '',
                        },
                    ],
                ),
                serialized: '0 ""',
            },
            value: '<integer [0,∞]> && <symbol>',
        },
        'prefix': {
            initial: {
                parsed: {
                    representation: '""',
                    type: new Set(['string', 'symbol']),
                    value: '',
                },
                serialized: '""',
            },
            value: '<symbol>',
        },
        'range': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: '[[<integer> | infinite]{2}]# | auto',
        },
        'speak-as': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | bullets | numbers | words | spell-out | <counter-style-name>',
        },
        'suffix': {
            initial: {
                parsed: {
                    representation: '". "',
                    type: new Set(['string', 'symbol']),
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
                    representation: 'symbolic',
                    type: new Set(['ident', 'keyword']),
                    value: 'symbolic',
                },
                serialized: 'symbolic',
            },
            value: 'cyclic | numeric | alphabetic | symbolic | additive | [fixed <integer>?] | [extends <counter-style-name>]',
        },
    },
    '@font-face': {
        'ascent-override': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: 'normal',
                            type: new Set(['ident', 'keyword']),
                            value: 'normal',
                        },
                    ],
                ),
                serialized: 'normal',
            },
            value: '[normal | <percentage [0,∞]>]{1,2}',
        },
        'descent-override': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: 'normal',
                            type: new Set(['ident', 'keyword']),
                            value: 'normal',
                        },
                    ],
                ),
                serialized: 'normal',
            },
            value: '[normal | <percentage [0,∞]>]{1,2}',
        },
        'font-display': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
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
                    representation: 'normal',
                    type: new Set(['ident', 'keyword']),
                    value: 'normal',
                },
                serialized: 'normal',
            },
            value: 'normal | <feature-tag-value>#',
        },
        'font-language-override': {
            initial: {
                parsed: {
                    representation: 'normal',
                    type: new Set(['ident', 'keyword']),
                    value: 'normal',
                },
                serialized: 'normal',
            },
            value: 'normal | <string>',
        },
        'font-named-instance': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | <string>',
        },
        'font-size': {
            initial: {
                parsed: {
                    representation: 'normal',
                    type: new Set(['ident', 'keyword']),
                    value: 'normal',
                },
                serialized: 'normal',
            },
            value: 'auto | normal | [<number>]{1,2}',
        },
        'font-stretch': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: "auto | <'font-stretch'>{1,2}",
        },
        'font-style': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | normal | italic | oblique [<angle>{1,2}]?',
        },
        'font-variation-settings': {
            initial: {
                parsed: {
                    representation: 'normal',
                    type: new Set(['ident', 'keyword']),
                    value: 'normal',
                },
                serialized: 'normal',
            },
            value: 'normal | [<string> <number>]#',
        },
        'font-weight': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | <font-weight-absolute>{1,2}',
        },
        'line-gap-override': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: 'normal',
                            type: new Set(['ident', 'keyword']),
                            value: 'normal',
                        },
                    ],
                ),
                serialized: 'normal',
            },
            value: '[normal | <percentage [0,∞]>]{1,2}',
        },
        'size-adjust': {
            initial: {
                parsed: {
                    representation: '100%',
                    type: new Set(['percentage']),
                    unit: '%',
                    value: 100,
                },
                serialized: '100%',
            },
            value: '<percentage [0,∞]>',
        },
        'src': {
            value: 'see prose',
        },
        'subscript-position-override': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: 'normal',
                            type: new Set(['ident', 'keyword']),
                            value: 'normal',
                        },
                    ],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage>]{1,2}',
        },
        'subscript-size-override': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: 'normal',
                            type: new Set(['ident', 'keyword']),
                            value: 'normal',
                        },
                    ],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage [0,∞]>]{1,2}',
        },
        'superscript-position-override': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: 'normal',
                            type: new Set(['ident', 'keyword']),
                            value: 'normal',
                        },
                    ],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage>]{1,2}',
        },
        'superscript-size-override': {
            initial: {
                parsed: createList(
                    [
                        {
                            representation: 'normal',
                            type: new Set(['ident', 'keyword']),
                            value: 'normal',
                        },
                    ],
                ),
                serialized: 'normal',
            },
            value: '[normal | from-font | <percentage [0,∞]>]{1,2}',
        },
        'unicode-range': {
            initial: {
                parsed: createList(
                    [
                        {
                            end: 1114111,
                            start: 0,
                            type: new Set(['urange']),
                        },
                    ],
                    ',',
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
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
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
            value: '[<integer [0,∞]> <absolute-color-base>]#',
        },
    },
    '@media': {
        'any-hover': {
            value: 'none | hover',
        },
        'any-pointer': {
            value: 'none | coarse | fine',
        },
        'aspect-ratio': {
            value: '<ratio>',
        },
        'color': {
            value: '<integer>',
        },
        'color-gamut': {
            value: 'srgb | p3 | rec2020',
        },
        'color-index': {
            value: '<integer>',
        },
        'device-aspect-ratio': {
            value: '<ratio>',
        },
        'device-height': {
            value: '<length>',
        },
        'device-width': {
            value: '<length>',
        },
        'display-mode': {
            value: 'fullscreen | standalone | minimal-ui | browser',
        },
        'dynamic-range': {
            value: 'standard | high',
        },
        'environment-blending': {
            value: 'opaque | additive | subtractive',
        },
        'forced-colors': {
            value: 'none | active',
        },
        'grid': {
            value: '<mq-boolean>',
        },
        'height': {
            value: '<length>',
        },
        'horizontal-viewport-segments': {
            value: '<integer>',
        },
        'hover': {
            value: 'none | hover',
        },
        'inverted-colors': {
            value: 'none | inverted',
        },
        'monochrome': {
            value: '<integer>',
        },
        'nav-controls': {
            value: 'none | back',
        },
        'orientation': {
            value: 'portrait | landscape',
        },
        'overflow-block': {
            value: 'none | scroll | paged',
        },
        'overflow-inline': {
            value: 'none | scroll',
        },
        'pointer': {
            value: 'none | coarse | fine',
        },
        'prefers-color-scheme': {
            value: 'light | dark',
        },
        'prefers-contrast': {
            value: 'no-preference | less | more | custom',
        },
        'prefers-reduced-data': {
            value: 'no-preference | reduce',
        },
        'prefers-reduced-motion': {
            value: 'no-preference | reduce',
        },
        'prefers-reduced-transparency': {
            value: 'no-preference | reduce',
        },
        'resolution': {
            value: '<resolution> | infinite',
        },
        'scan': {
            value: 'interlace | progressive',
        },
        'scripting': {
            value: 'none | initial-only | enabled',
        },
        'shape': {
            value: 'rect | round',
        },
        'update': {
            value: 'none | slow | fast',
        },
        'vertical-viewport-segments': {
            value: '<integer>',
        },
        'video-color-gamut': {
            value: 'srgb | p3 | rec2020',
        },
        'video-dynamic-range': {
            value: 'standard | high',
        },
        'width': {
            value: '<length>',
        },
    },
    '@page': {
        'bleed': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | <length>',
        },
        'marks': {
            initial: {
                parsed: {
                    representation: 'none',
                    type: new Set(['ident', 'keyword']),
                    value: 'none',
                },
                serialized: 'none',
            },
            value: 'none | [crop || cross]',
        },
        'page-orientation': {
            initial: {
                parsed: {
                    representation: 'upright',
                    type: new Set(['ident', 'keyword']),
                    value: 'upright',
                },
                serialized: 'upright',
            },
            value: 'upright | rotate-left | rotate-right',
        },
        'size': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: '<length>{1,2} | auto | [<page-size> || [portrait | landscape]]',
        },
    },
    '@property': {
        'inherits': {
            value: 'true | false',
        },
        'initial-value': {
            value: '<declaration-value>',
        },
        'syntax': {
            value: '<string>',
        },
    },
    '@viewport': {
        'viewport-fit': {
            initial: {
                parsed: {
                    representation: 'auto',
                    type: new Set(['ident', 'keyword']),
                    value: 'auto',
                },
                serialized: 'auto',
            },
            value: 'auto | contain | cover',
        },
    },
}
