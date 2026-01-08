/**
 * This script generates definitions extracted by w3c/reffy from latest W3C
 * Editor's Drafts specifications:
 *
 *   - ./lib/descriptors/definitions.js
 *   - ./lib/properties/definitions.js
 *   - ./lib/values/definitions.js
 *
 * It also reports missing or outdated definitions from:
 *
 *   - ./lib/properties/logical.js
 *   - ./lib/rules/definitions.js
 *   - ./lib/values/pseudos.js
 */
import * as colors from '../lib/values/colors.js'
import * as compatibility from '../lib/compatibility.js'
import * as environment from '../lib/utils/environment.js'
import * as pseudos from '../lib/values/pseudos.js'
import * as webref from './webref.js'
import { quote, tab } from '../lib/utils/string.js'
import arbitrary from '../lib/parse/arbitrary.js'
import contextSensitiveTypes from '../lib/values/context-sensitive.js'
import { definitions as dimensions } from '../lib/values/dimensions.js'
import { findRule } from '../lib/utils/definition.js'
import forgiving from '../lib/values/forgiving.js'
import fs from 'node:fs/promises'
import logical from '../lib/properties/logical.js'
import parseDefinition from '../lib/parse/definition.js'
import path from 'node:path'
import { serializeDefinition } from '../lib/serialize.js'
import shorthands from '../lib/properties/shorthands.js'

const logicalGroups = Object.keys(logical)

/* eslint-disable sort-keys */
const initial = {
    descriptors: {
        '@function': {
            // https://github.com/w3c/reffy/issues/1567
            '--*': { initial: null, value: '<declaration-value>?' },
        },
    },
    properties: {
        // https://github.com/w3c/reffy/issues/1567
        '--*': { initial: null, value: '<declaration-value>?' },
    },
    types: {
        // https://github.com/w3c/csswg-drafts/issues/13092
        '<anchored-feature>': '<media-feature>',
        // https://github.com/w3c/csswg-drafts/issues/13167
        '<custom-function-definition>': '<function-token> <function-parameter>#? ) [returns <css-type>]?',
        // https://github.com/w3c/csswg-drafts/issues/10558
        '<dashed-function>': {
            name: '<dashed-function>',
            type: 'non-terminal',
            value: {
                name: '<dashed-ident>',
                type: 'function',
                value: '<declaration-value>#?',
            },
        },
        // https://github.com/w3c/csswg-drafts/issues/12440
        '<env-args>': 'env(<declaration-value> , <declaration-value>?)',
        // TODO: fix parsing/serializing `<radial-gradient-syntax>`, `<radial-size>`
        '<radial-radius>': 'closest-side | farthest-side | <length-percentage [0,∞]>',
        // https://github.com/w3c/csswg-drafts/issues/8835
        '<urange>': "u '+' <ident-token> '?'* | u <dimension-token> '?'* | u <number-token> '?'* | u <number-token> <dimension-token> | u <number-token> <number-token> | u '+' '?'+",
    },
}
const replaced = {
    descriptors: {
        '@font-face': {
            // https://github.com/w3c/csswg-drafts/issues/8835
            'unicode-range': { value: '<urange>#' },
        },
        '@property': {
            // https://github.com/w3c/webref/issues/707
            'initial-value': { initial: null },
        },
    },
    properties: {
        // https://github.com/w3c/fxtf-drafts/issues/547
        'background-blend-mode': { value: "<'mix-blend-mode'>#" },
        // https://github.com/w3c/csswg-drafts/issues/7366
        'border-end-end-radius': { initial: '0' },
        'border-end-start-radius': { initial: '0' },
        'border-start-end-radius': { initial: '0' },
        'border-start-start-radius': { initial: '0' },
        // TODO: fix `value` of `clip`
        'clip': { value: 'rect([<length> | auto]{4} | [<length> | auto]#{4}) | auto' },
        // TODO: fix `value` of `container-type`
        'container-type': 'normal | [size | inline-size] || scroll-state || anchored',
        // TODO: fix `value` of `copy-into`
        'copy-into': { value: 'none | [<custom-ident> <content-level>]#' },
        // https://github.com/w3c/svgwg/issues/320
        'd': { value: 'none | path(<string>)' },
        // TODO: fix `value` of `fill-opacity`, `stroke-opacity`
        'fill-opacity': { value: "<'opacity'>" },
        'stroke-opacity': { value: "<'opacity'>" },
        // TODO: fix `value` of `voice-family`
        // Implementation dependent
        'font-family': { initial: 'monospace' },
        'voice-family': { initial: 'female', value: '[<family-name> | <generic-voice>]# | preserve' },
        // https://github.com/w3c/csswg-drafts/issues/8032
        'glyph-orientation-vertical': { value: 'auto | <angle> | <number>' },
        // https://github.com/w3c/svgwg/issues/888
        'stop-color': { initial: 'black', value: "<'color'>" },
        'stop-opacity': { initial: '1', value: "<'opacity'>" },
        // TODO: fix `value` of `transition-property`
        'transition-property': { value: '[none | <single-transition-property>]#' },
    },
    types: {
        // Extensions (https://github.com/w3c/reffy/issues/1647)
        '<color>': '<color-base> | currentColor | <system-color> | <contrast-color()> | <device-cmyk()> | <light-dark()> | <color-interpolate()>',
        '<display-inside>': 'flow | flow-root | table | flex | grid | ruby | math | layout(<ident>)',
        '<keyframe-selector>': 'from | to | <percentage [0,100]> | <timeline-range-name> <percentage>',
        '<image>': '<url> | <image()> | <image-set()> | <cross-fade()> | <element()> | <gradient> | <paint()>',
        '<query-in-parens>': '(<container-query>) | (<size-feature>) | anchored(<anchored-query>) | style(<style-query>) | scroll-state(<scroll-state-query>) | <general-enclosed>',
        '<single-animation-timeline>': 'auto | none | <dashed-ident> | <pointer()> | <scroll()> | <view()>',
        '<transform-list>': '<transform-function>+ | <transform-mix()> | <transform-interpolate()>',
        // Missing production rules
        '<absolute-size>': 'xx-small | x-small | small | medium | large | x-large | xx-large',
        '<age>': 'child | young | old',
        '<angle>': '<dimension>',
        '<animation-action>': 'none | play | play-once | play-forwards | play-backwards | pause | reset | replay',
        '<attr-unit>': `"%" | ${[...dimensions.values()].flatMap(dimension => dimension.units).join(' | ')}`,
        '<basic-shape>': '<basic-shape-rect> | <circle()> | <ellipse()> | <polygon()> | <path()> | <shape()>',
        '<counter-name>': '<custom-ident>',
        '<counter-style-name>': '<custom-ident>',
        '<custom-ident>': '<ident>',
        '<custom-property-name>': '<dashed-ident>',
        '<dashed-ident>': '<custom-ident>',
        '<dashndashdigit-ident>': '<ident-token>',
        '<decibel>': '<dimension>',
        '<deprecated-color>': colors.deprecated.join(' | '),
        '<dimension>': '<dimension-token>',
        '<extension-name>': '<dashed-ident>',
        '<flex>': '<dimension>',
        '<frequency>': '<dimension>',
        '<gender>': 'male | female | neutral',
        '<hex-color>': '<hash-token>',
        '<id>': '<id-selector>',
        '<ident>': '<ident-token>',
        '<integer>': '<number-token>',
        '<length>': '<dimension>',
        '<level>': '<number-token>',
        '<mq-boolean>': '<integer [0,1]>',
        '<n-dimension>': '<dimension-token>',
        '<named-color>': colors.named.join(' | '),
        '<ndash-dimension>': '<dimension-token>',
        '<ndashdigit-dimension>': '<dimension-token>',
        '<ndashdigit-ident>': '<ident-token>',
        '<number>': '<number-token>',
        '<outline-line-style>': 'none | dotted | dashed | solid | double | groove | ridge | inset | outset | auto',
        '<page-size>': 'A5 | A4 | A3 | B5 | B4 | JIS-B5 | JIS-B4 | letter | legal | ledger',
        '<palette-identifier>': '<dashed-ident>',
        '<percentage>': '<percentage-token>',
        '<quirky-color>': '<number-token> | <ident-token> | <dimension-token>',
        '<quirky-length>': '<number-token>',
        '<relative-size>': 'larger | smaller',
        '<resolution>': '<dimension>',
        '<scope-end>': '<complex-real-selector>#',
        '<scope-start>': '<complex-real-selector>#',
        '<scroll-button-direction>': 'up | down | left | right | block-start | block-end | inline-start | inline-end | prev | next',
        '<scroll-state-feature>': '<media-feature>',
        '<semitones>': '<dimension>',
        '<sibling-count()>': 'sibling-count()',
        '<sibling-index()>': 'sibling-index()',
        '<signed-integer>': '<number-token>',
        '<signless-integer>': '<number-token>',
        '<size-feature>': '<media-feature>',
        '<size-keyword>': '<ident>',
        '<string>': '<string-token>',
        '<style-feature-name>': '<ident>',
        '<supports-condition-name>': '<extension-name>',
        '<system-color>': colors.system.join(' | '),
        '<target-name>': '<string>',
        '<time>': '<dimension>',
        '<timeline-range-center-subject>': 'source | target',
        '<timeline-range-name>': 'contain | cover | entry | entry-crossing | exit | exit-crossing | fill | fit',
        '<transform-function>': '<matrix()> | <matrix3d()> | <perspective()> | <translate()> | <translateX()> | <translateY()> | <translateZ()> | <translate3d()> | <scale()> | <scaleX()> | <scaleY()> | <scaleZ()> | <scale3d()> | <rotate()> | <rotateX()> | <rotateY()> | <rotateZ()> | <rotate3d()> | <skew()> | <skewX()> | <skewY()>',
        '<uri>': '<url>',
        '<url-modifier>': '<request-url-modifier> | <param()> | <ident> | <function-token> <any-value>? )',
        '<url-set>': '<image-set()>',
        '<whole-value>': '<declaration-value>?',
        '<zero>': '<number-token>',
        // https://github.com/w3c/csswg-drafts/issues/12849
        '<bg-layer>': "<'background-image'> || <'background-position'> [/ <'background-size'>]? || <'background-repeat'> || <'background-attachment'> || <'background-origin'> || <'background-clip'>",
        '<final-bg-layer>': "<'background-image'> || <'background-position'> [/ <'background-size'>]? || <'background-repeat'> || <'background-attachment'> || <'background-origin'> || <'background-clip'> || <'background-color'>",
        // https://github.com/w3c/csswg-drafts/issues/10457#issuecomment-3126400963
        '<boolean-expr-group>': '<test> | (<boolean-expr[<test>]>) | <general-enclosed>',
        // https://github.com/w3c/csswg-drafts/pull/8367#issuecomment-1408147460, https://github.com/w3c/csswg-drafts/issues/9729, https://github.com/w3c/csswg-drafts/issues/10833
        '<conic-gradient-syntax>': '[[[from [<angle> | <zero>]]? [at <position>]?]! || <color-interpolation-method>]? , <angular-color-stop-list>',
        '<radial-gradient-syntax>': '[[[<radial-shape> || <radial-size>]? [at <position>]?]! || <color-interpolation-method>]? , <color-stop-list>',
        '<radial-size>': 'closest-corner | farthest-corner | <radial-radius>{1,2}',
        // https://github.com/w3c/csswg-drafts/issues/11842
        '<control-value()>': 'control-value(<syntax-type-name>?)',
        // https://github.com/w3c/csswg-drafts/issues/13010
        '<event-trigger-event>': 'activate | click | touch | dblclick | keypress(<string>)',
        // https://github.com/w3c/csswg-drafts/issues/12487
        '<if-args-branch>': '<declaration-value> [: <declaration-value>?]?',
        // https://github.com/w3c/fxtf-drafts/issues/532
        '<mask-reference>': 'none | <image>',
        // https://github.com/w3c/csswg-drafts/pull/10131
        '<media-feature>': '<mf-plain> | <mf-boolean> | <mf-range>',
        '<media-in-parens>': '(<media-condition>) | (<media-feature>) | <general-enclosed>',
        // TODO: fix `value` of `<pseudo-page>`
        '<pseudo-page>': ': [left | right | first | blank | nth(<an+b> [of <custom-ident>]?)]',
        // https://github.com/w3c/csswg-drafts/issues/7897
        '<single-transition>': '<time> || <easing-function> || <time> || <transition-behavior-value> || [none | <single-transition-property>]',
        // https://github.com/w3c/csswg-drafts/issues/12426
        '<style-feature-plain>': '<declaration>',
        // https://github.com/w3c/csswg-drafts/issues/12425
        '<style-range-value>': '<custom-property-name> | <number> | <percentage> | <dimension>',
        // https://github.com/w3c/csswg-drafts/pull/12460
        '<superellipse()>': 'superellipse(<number> | infinity | -infinity)',
    },
}
const excluded = {
    descriptors: {},
    functions: {
        'css-grid': [
            // Defined inline
            'fit-content()',
            'minmax()',
            // Informative
            'repeat()',
        ],
        'css-images-4': [
            // Aliases do not need to have a value definition
            '-webkit-image-set()',
            // Defined inline
            'type()',
        ],
        'css-sizing': [
            // Defined inline
            'fit-content()',
            // Prefer CSS Values 5
            'calc-size()',
        ],
        'css-values-5': [
            // Defined inline
            'cross-origin()',
            'integrity()',
            'referrer-policy()',
        ],
    },
    properties: {
        'CSS': [
            // Superseded by CSS Backgrounds and CSS Borders
            'background',
            'background-attachment',
            'background-color',
            'background-image',
            'background-position',
            'background-repeat',
            // Superseded by CSS Basic User Interface
            'cursor',
            'outline',
            'outline-color',
            'outline-style',
            'outline-width',
            // Superseded by CSS Borders
            'border',
            'border-bottom',
            'border-bottom-color',
            'border-bottom-style',
            'border-bottom-width',
            'border-color',
            'border-left',
            'border-left-color',
            'border-left-style',
            'border-left-width',
            'border-right',
            'border-right-color',
            'border-right-style',
            'border-right-width',
            'border-style',
            'border-top',
            'border-top-color',
            'border-top-style',
            'border-top-width',
            'border-width',
            // Superseded by CSS Box Model
            'margin',
            'margin-bottom',
            'margin-left',
            'margin-right',
            'margin-top',
            'padding',
            'padding-bottom',
            'padding-left',
            'padding-right',
            'padding-top',
            // Superseded by CSS Box Sizing
            'height',
            'max-height',
            'max-width',
            'min-height',
            'min-width',
            'width',
            // Superseded by CSS Color
            'color',
            // Superseded by CSS Display
            'display',
            'visibility',
            // Superseded by CSS Fonts
            'font',
            'font-family',
            'font-size',
            'font-style',
            'font-variant',
            'font-weight',
            // Superseded by CSS Fragmentation
            'orphans',
            'widows',
            // Superseded by CSS Generated Content
            'content',
            'quotes',
            // Superseded by CSS Inline Layout
            'line-height',
            'vertical-align',
            // Superseded by CSS Lists and Counters
            'counter-increment',
            'counter-reset',
            'list-style',
            'list-style-image',
            'list-style-position',
            'list-style-type',
            // Superseded by CSS Masking
            'clip',
            // Superseded by CSS Overflow
            'overflow',
            // Superseded by CSS Page Floats
            'clear',
            'float',
            // Superseded by CSS Positioned Layout
            'bottom',
            'left',
            'position',
            'right',
            'top',
            // Superseded by CSS Table
            'border-collapse',
            'border-spacing',
            'caption-side',
            'empty-cells',
            'table-layout',
            // Superseded by CSS Text
            'letter-spacing',
            'text-align',
            'text-decoration',
            'text-indent',
            'text-transform',
            'white-space',
            'word-spacing',
            // Superseded by CSS Writing Modes
            'direction',
            'unicode-bidi',
        ],
        'SVG': [
            // Prefer CSS Images
            'image-rendering',
            // Prefer CSS Sizing
            'inline-size',
            // Prefer CSS Shapes
            'shape-inside',
            'shape-margin',
        ],
        'css-backgrounds': [
            // Superseded by CSS Borders
            'border',
            'border-color',
            'border-bottom',
            'border-bottom-color',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-bottom-style',
            'border-bottom-width',
            'border-image',
            'border-image-outset',
            'border-image-repeat',
            'border-image-slice',
            'border-image-source',
            'border-image-width',
            'border-left',
            'border-left-color',
            'border-left-style',
            'border-left-width',
            'border-radius',
            'border-right',
            'border-right-color',
            'border-right-style',
            'border-right-width',
            'border-style',
            'border-top',
            'border-top-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-top-style',
            'border-top-width',
            'border-width',
            'box-shadow',
        ],
        'css-backgrounds-4': [
            // Not ready
            'background-tbd',
        ],
        'css-content': [
            // https://github.com/w3c/csswg-drafts/issues/6435
            'string-set',
        ],
        'css-flexbox': [
            // Superseded by CSS Box Alignment
            'align-content',
            'align-items',
            'align-self',
            'justify-content',
        ],
        'css-forms': [
            // https://github.com/w3c/csswg-drafts/issues/11865
            'appearance',
        ],
        'css-gcpm': [
            // https://github.com/w3c/csswg-drafts/issues/1981
            'content',
        ],
        'css-logical': [
            // Superseded by CSS Borders
            'border-block',
            'border-block-color',
            'border-block-end',
            'border-block-end-color',
            'border-block-end-style',
            'border-block-end-width',
            'border-block-start',
            'border-block-start-color',
            'border-block-start-style',
            'border-block-start-width',
            'border-block-style',
            'border-block-width',
            'border-end-end-radius',
            'border-end-start-radius',
            'border-inline',
            'border-inline-color',
            'border-inline-end',
            'border-inline-end-color',
            'border-inline-end-style',
            'border-inline-end-width',
            'border-inline-start',
            'border-inline-start-color',
            'border-inline-start-style',
            'border-inline-start-width',
            'border-inline-style',
            'border-inline-width',
            'border-start-end-radius',
            'border-start-start-radius',
            // Superseded by CSS Page Floats
            'clear',
            'float',
            // Superseded by CSS Positioned Layout
            'inset',
            'inset-block',
            'inset-inline',
            'inset-block-end',
            'inset-block-start',
            'inset-inline-end',
            'inset-inline-start',
            // https://github.com/w3c/csswg-drafts/issues/7371
            'text-align',
        ],
        'css-round-display': [
            // https://github.com/w3c/csswg-drafts/issues/6433
            'shape-inside',
        ],
        'css-ui': [
            // Prefer SVG
            'pointer-events',
        ],
        'mathml-core': [
            // https://github.com/w3c/csswg-drafts/issues/9399, https://github.com/w3c/css-houdini-drafts/issues/1074
            'display',
        ],
    },
    rules: {},
    selectors: {
        '*': [
            // https://github.com/w3c/reffy/issues/1137
            '&',
            '+',
            '>',
            '||',
            '~',
            // Non-required alias
            ':matches()',
        ],
    },
    specifications: [
        // Not ready
        'css-color-6',
        'css-conditional-values',
        'css-extensions',
        'css-grid-3',
        'webvtt',
        // Prefer SVG 2
        'fill-stroke',
        'svg-strokes',
        // Discontinued (preserved by w3c/weberef for cross-reference concerns)
        'selectors-nonelement',
    ],
    types: {
        '*': [
            // Terminals
            '<(-token>',
            '<)-token>',
            '<[-token>',
            '<]-token>',
            '<{-token>',
            '<}-token>',
            '<CDC-token>',
            '<CDO-token>',
            '<at-keyword-token>',
            '<bad-string-token>',
            '<bad-url-token>',
            '<colon-token>',
            '<comma-token>',
            '<delim-token>',
            '<dimension-token>',
            '<eof-token>',
            '<function-token>',
            '<hash-token>',
            '<ident-token>',
            '<number-token>',
            '<percentage-token>',
            '<semicolon-token>',
            '<string-token>',
            '<url-token>',
            '<whitespace-token>',
            ...Object.keys(arbitrary),
            ...Object.keys(forgiving),
        ],
        'CSS': [
            // Obsoleted by CSS Backgrounds
            '<border-style>',
            '<border-width>',
            // Obsoleted by CSS Box Model
            '<margin-width>',
            '<padding-width>',
            // Obsoleted by CSS Masking
            '<shape>',
            // Superseded by CSS Color
            '<color>',
            // Superseded by CSS Fonts
            '<family-name>',
            '<generic-family>',
            // Superseded by CSS Lists and Counters
            '<counter>',
            '<counter()>',
            '<counters()>',
            // https://github.com/w3c/fxtf-drafts/pull/468
            '<bottom>',
            '<left>',
            '<right>',
            '<top>',
        ],
        'css-backgrounds': [
            // Superseded by CSS Borders
            '<line-style>',
            '<line-width>',
        ],
        'css-color': [
            // Dangling
            '<color-space>',
            // Prefer CSS Color HDR
            '<color-function>',
            '<predefined-rgb>',
        ],
        'css-color-5': [
            // Dangling
            '<color-space>',
            // Prefer CSS Color HDR
            '<color-function>',
            '<predefined-rgb>',
        ],
        'css-conditional-5': [
            // https://github.com/w3c/csswg-drafts/pull/12640
            '<boolean-condition>',
            // https://github.com/w3c/csswg-drafts/issues/12425, https://github.com/w3c/csswg-drafts/issues/12426
            '<style-feature-value>',
        ],
        'css-forms': [
            // https://github.com/w3c/csswg-drafts/issues/11842
            '<type>',
        ],
        'css-gcpm': [
            // Prefer CSS Generated Content
            '<content()>',
            '<content-list>',
            // https://github.com/w3c/csswg-drafts/issues/1981
            '<element()>',
        ],
        'css-images': [
            // Dangling
            '<color-stop>',
            // TODO: fix parsing/serializing `<radial-gradient-syntax>`, `<radial-size>`
            '<radial-extent>',
        ],
        'css-masking': [
            // https://github.com/w3c/fxtf-drafts/pull/468
            '<bottom>',
            '<left>',
            '<right>',
            '<rect()>',
            '<top>',
            // https://github.com/w3c/fxtf-drafts/issues/532
            '<mask-source>',
        ],
        'css-values-5': [
            // https://github.com/w3c/csswg-drafts/issues/6245#issuecomment-2955775713
            '<output-value>',
        ],
        'filter-effects': [
            // Duplicate of CSS Values
            '<url>',
        ],
        'pointer-animations': [
            // https://github.com/w3c/csswg-drafts/issues/12285
            '<axis>',
        ],
    },
}

const descriptors = Object.keys(initial.descriptors).map(rule => [rule, Object.entries(initial.descriptors[rule])])
const properties = Object.entries(initial.properties)
const types = [...Object.entries(initial.types), ...Object.entries(replaced.types)]

// TODO: periodically review this list to remove errors that no longer occur
const errors = {
    '@apply': { cause: 'It is not yet supported.' },
    '@charset': {
        cause: 'It should always be ignored in a CSS input.',
        link: ['https://drafts.csswg.org/css-syntax-3/#charset-rule'],
    },
    '@container': {
        cause: 'It should be defined with <rule-list> instead of <block-contents>.',
        links: ['https://github.com/w3c/csswg-drafts/pull/9215'],
    },
    '@contents': { cause: 'It is not yet supported.' },
    '@custom-media': { cause: 'It is not yet supported.' },
    '@custom-selector': { cause: 'It is not yet supported.' },
    '@else': { cause: 'It is not yet supported.' },
    '@env': { cause: 'It is not yet supported.' },
    '@function': { cause: 'In this library, its prelude value definition is folded into a production to allow validating the rule before creating CSSFunctionRule.' },
    '@historical-forms': {
        cause: 'It should be removed.',
        links: ['https://github.com/w3c/csswg-drafts/issues/9926'],
    },
    '@layer': { cause: 'It is the only rule with alternative definitions therefore only the first (block) definition is correctly checked.' },
    '@mixin': { cause: 'It is not yet supported.' },
    '@supports-condition': { cause: 'It is not yet supported.' },
    '@when': { cause: 'It is not yet supported.' },
    '<box>': {
        cause: 'It is a generic type that is not used anywhere, and should not be exported.',
        links: [
            'https://github.com/w3c/csswg-drafts/commit/7dc439c83df8bd34885f74689f8cbc7dff77b5e0',
            'https://github.com/w3c/csswg-drafts/commit/798ba91a41295c5d8e084ba7e93c4073e720b4f3',
            'https://github.com/w3c/csswg-drafts/commit/3a1c2a859a5e28a553f03757b45c237d9444680b',
        ],
    },
    '<identifier>': { cause: 'It is equivalent to <ident>. Since most of CSS 2.2 is superseded, it is not worth requesting a change.' },
    '<palette-mix()>': { cause: 'It is extracted by w3c/reffy without its value definition, which is basically a problem with the definition markup.' },
    '<repeat()>': {
        cause: 'It is a generic type whose production rule is incorrectly defined, that is not used anywhere, and should not be exported.',
        links: ['https://github.com/w3c/csswg-drafts/issues/11385'],
    },
    '<segment-options>': {
        cause: 'It is a generic type that should be defined informatively.',
        links: ['https://github.com/w3c/csswg-drafts/issues/6245'],
    },
    '<unicode-range-token>': {
        cause: 'It is intended to replace <urange> but there are ongoing problems with consuming this token therefore it is not yet implemented.',
        links: ['https://github.com/w3c/csswg-drafts/issues/8835'],
    },
    ':nth()': { cause: 'It should be restricted to <pseudo-page> (CSS Page 3). Its name should not include the leading colon.' },
}
/* eslint-enable sort-keys */

/**
 * @param {string} spec
 * @param {string} name
 * @param {string} message
 */
function reportError(spec, name, message) {
    if (environment.development && !errors[name]) {
        console.log(`[${spec}] ${message}`)
    }
}

/**
 * @param {object[]} selectors
 * @param {string} key
 */
function reportMissingPseudoSelectors(selectors, key) {
    const { classes, elements } = pseudos
    const { selectors: { '*': skipFromAllSpecs = [], [key]: skip = [] } } = excluded
    selectors.forEach(({ name, values }) => {
        if (skip.includes(name) || skipFromAllSpecs.includes(name)) {
            return
        }
        addTypes(values, key)
        if (name.startsWith('::')) {
            if (name.endsWith('()')) {
                if (!elements.functions[name.slice(2, -2)]) {
                    reportError(key, name, `${name} is a new pseudo-element`)
                }
            } else if (!elements.identifiers[name.slice(2)]) {
                reportError(key, name, `${name} is a new pseudo-element`)
            }
            return
        }
        if (name.endsWith('()')) {
            if (!classes.functions[name.slice(1, -2)]) {
                reportError(key, name, `${name} is a new pseudo-class`)
            }
            return
        }
        // Ignore pseudo-elements with legacy syntax and `:lang()` incorrectly named `:lang` in CSS 2
        if (!classes.identifiers.includes(name.slice(1)) && key !== 'CSS') {
            reportError(key, name, `${name} is a new pseudo-class`)
        }
    })
}

/**
 * @param {string} name
 * @param {string} value
 * @param {object} rule
 * @returns {boolean}
 */
function isUpdatedRule(name, value, { prelude, value: block }) {
    let definition = name
    if (prelude) {
        definition += ` ${prelude}`
    }
    definition += block ? ` { ${block.name} }` : ' ;'
    value = value
        .replace(/[([] | [)\],]/g, match => match.trim())
        .replace('};', '}')
    return value !== definition
}

/**
 * @param {string} value
 * @returns {string}
 */
function serializeValueDefinition(value, depth = 1) {
    switch (typeof value) {
        case 'function':
            return value
        case 'object': {
            value = Object.entries(value).reduce(
                (string, [key, value]) => {
                    if (key === 'value') {
                        value = serializeValueDefinition(value, depth + 1)
                    } else if (typeof value === 'string') {
                        value = quote(value)
                    }
                    return `${string}${tab(depth + 1)}${key}: ${value},\n`
                },
                '')
            return `{\n${value}${tab(depth)}}`
        }
        case 'string':
            return quote(serializeDefinition(parseDefinition(value)))
        default:
            throw RangeError('Unexpected value definition type')
    }
}

/**
 * @param {string[][]} types
 * @returns {string}
 */
function serializeTypes(types) {
    const imports = ["import definitions from './context-sensitive.js'"]
    types = types.reduce(
        (string, [type, value]) =>
            `${string}${tab(1)}${quote(type)}: ${serializeValueDefinition(value)},\n`,
        `${tab(1)}...definitions,\n`)
    return `\n${imports.join('\n')}\n\nexport default {\n${types}}\n`
}

/**
 * @param {*[][]} properties
 * @returns {string}
 */
function serializeProperties(properties) {
    properties = properties.reduce(
        (string, [property, { animationType, initial, logicalPropertyGroup, value }, key]) => {
            string += `${tab(1)}${quote(property)}: {\n`
            if (animationType === 'not animatable') {
                string += `${tab(2)}animate: false,\n`
            }
            if (!shorthands.has(property)) {
                const group = logicalGroups.find(group => logical[group].some(mapping => mapping.includes(property)))
                if (logicalPropertyGroup && !group) {
                    console.log(`[${key}] ${property} is missing in the logical property group "${logicalPropertyGroup}"`)
                }
                if (group) {
                    string += `${tab(2)}group: ${quote(group)},\n`
                }
                string += `${tab(2)}initial: ${initial ? quote(initial) : null},\n`
            }
            if (key === 'CSS') {
                value = value.replace(/ \| inherit$/, '')
            }
            string += `${tab(2)}value: ${serializeValueDefinition(value)},\n${tab(1)}},\n`
            return string
        },
        '')
    return `\nexport default {\n${properties}}\n`
}

/**
 * @param {*[][]} descriptors
 * @returns {string}
 */
function serializeDescriptors(descriptors) {
    descriptors = descriptors.reduce(
        (string, [rule, definitions]) => {
            string += `${tab(1)}${quote(rule)}: {\n`
            definitions.sort(sortByName).forEach(([descriptor, { initial, type, value }]) => {
                string += `${tab(2)}${quote(descriptor)}: {\n`
                if (initial && !initial.toLowerCase().startsWith('n/a')) {
                    string += `${tab(3)}initial: ${quote(initial)},\n`
                } else if (type) {
                    string += `${tab(3)}type: '${type}',\n`
                }
                string += `${tab(3)}value: ${serializeValueDefinition(value)},\n${tab(2)}},\n`
            })
            string += `${tab(1)}},\n`
            return string
        },
        '')
    return `\nexport default {\n${descriptors}}\n`
}

/**
 * @param {*[]} a [name]
 * @param {*[]} b [name]
 * @returns {number}
 */
function sortByName([a], [b]) {
    return a < b ? -1 : 0
}

/**
 * @param {object} definitions
 * @param {string} key
 */
function addTypes(definitions = [], key) {
    const { types: { '*': skipFromAllSpecs = [], [key]: skip = [] } } = excluded
    const excludedFunctions = excluded.functions[key] ?? []
    definitions.forEach(({ name, type, value, values }) => {
        if (type === 'value') {
            if (!/^<.+>$/.test(name)) {
                return
            }
            // Not a proper production value definition
            if (name === value) {
                return
            }
            type = 'type'
        } else if (type === 'function') {
            if (excludedFunctions.includes(name)) {
                return
            }
            name = `<${name}>`
            type = 'type'
        }
        if (type === 'type') {
            if (replaced.types[name] || skip.includes(name) || skipFromAllSpecs.includes(name)) {
                addTypes(values, key)
                return
            }
            if (initial.types[name] || contextSensitiveTypes[name]) {
                if (value && environment.development) {
                    reportError(key, name, `${name} is now assigned a value definition`)
                }
                return
            }
            if (!value) {
                if (environment.development && !replaced[name]) {
                    reportError(key, name, `${name} is defined in prose and must be replaced with a value definiton`)
                }
                return
            }
            const entry = types.find(([type]) => type === name)
            if (entry) {
                const [base1, v1 = 1] = entry[2].split(/-(\d)$/)
                const [base2, v2 = 1] = key.split(/-(\d)$/)
                if (base1 !== base2) {
                    throw Error(`Unhandled duplicate definitions of ${name}`)
                }
                if (v1 < v2) {
                    entry.splice(1, 2, value, key)
                }
            } else {
                types.push([name, value, key])
            }
        }
        addTypes(values, key)
    })
}

/**
 * @param {object} definitions
 * @param {string} key
 */
function addProperties(definitions = [], key) {
    const { properties: { aliases, mappings } } = compatibility
    const { properties: { '*': skipFromAllSpecs = [], [key]: skip = [] } } = excluded
    definitions.forEach(({ name, values, ...definition }) => {
        if (aliases.has(name) || mappings.has(name) || skip.includes(name) || skipFromAllSpecs.includes(name)) {
            return
        }
        if (initial.properties[name]) {
            if (environment.development) {
                reportError(key, name, `${name} (property) is now extracted`)
            }
            return
        }
        const replacement = replaced.properties[name]
        if (replacement) {
            definition = { ...definition, ...replacement }
        }
        const entry = properties.find(([property]) => property === name)
        if (entry) {
            const [, prevDefinition, prevKey] = entry
            const prevNewValues = prevDefinition.newValues
            const { newValues, value } = definition
            const [base1, v1 = 1] = prevKey.split(/-(\d)$/)
            const [base2, v2 = 1] = key.split(/-(\d)$/)
            if (newValues) {
                prevDefinition[prevNewValues ? 'newValues' : 'value'] += ` | ${newValues}`
            } else if (prevNewValues) {
                entry.splice(1, 1, { ...definition, value: `${value} | ${prevNewValues}` }, key)
            } else if (base1 !== base2) {
                throw Error(`Unhandled duplicate definitions of the property "${name}"`)
            } else if (v1 < v2) {
                entry.splice(1, 2, { ...prevDefinition, ...definition }, key)
            } else {
                entry.splice(1, 1, { ...definition, ...prevDefinition })
            }
        } else {
            properties.push([name, definition, key])
        }
        addTypes(values, key)
    })
}

/**
 * @param {object[]} definitions
 * @param {string} rule
 * @param {string} key
 */
function addDescriptors(definitions = [], rule, key) {
    const { descriptors: { [rule]: { aliases, mappings } = {} } } = compatibility
    const { descriptors: { [rule]: initialDescriptors } } = initial
    const { descriptors: { '*': skipFromAllSpecs = [], [key]: skip = [] } } = excluded
    definitions.forEach(({ initial = '', name, type, value, values }) => {
        // https://github.com/w3c/reffy/issues/1390
        if (type === 'at-rule') {
            addRules([{ descriptors: [], name, value }], key)
            return
        }
        if (aliases?.has(name) || mappings?.has(name) || skip.includes(name) || skipFromAllSpecs.includes(name)) {
            return
        }
        if (initialDescriptors?.[name]) {
            if (environment.development) {
                reportError(key, name, `${name} (descriptor for ${rule}) is now extracted`)
            }
            return
        }
        const replacement = replaced.descriptors[rule]?.[name]
        if (replacement) {
            ({ initial = initial, type, value = value, values } = replacement)
        }
        const context = descriptors.find(([key]) => key === rule)
        if (context) {
            const entries = context[1]
            const index = entries.findIndex(([key]) => key === name)
            if (-1 < index) {
                const entry = entries[index]
                const [, prevDefinition, prevKey] = entry
                const [base1, v1 = 1] = prevKey.split(/-(\d)$/)
                const [base2, v2 = 1] = key.split(/-(\d)$/)
                if (base1 !== base2) {
                    throw Error(`Unhandled duplicate definitions of the descriptor "${name}"`)
                }
                if (v1 < v2) {
                    const definition = {
                        initial: initial ?? prevDefinition.initial,
                        type: type ?? prevDefinition.type,
                        value: value ?? prevDefinition.value,
                    }
                    entry.splice(1, 2, definition, key)
                } else {
                    const definition = {
                        initial: prevDefinition.initial ?? initial,
                        type: prevDefinition.type ?? type,
                        value: prevDefinition.value ?? value,
                    }
                    entry.splice(1, 1, definition)
                }
            } else {
                entries.push([name, { initial, type, value }, key])
            }
        } else {
            descriptors.push([rule, [[name, { initial, type, value }, key]]])
        }
        addTypes(values, key)
    })
}

/**
 * @param {object[]} definitions
 * @param {string} key
 */
function addRules(definitions = [], key) {
    const { rules: { aliases, mappings } } = compatibility
    definitions.forEach(({ descriptors: definitions, name, value }) => {
        if (aliases.has(name) || mappings.has(name)) {
            return
        }
        const rule = findRule(name)
        if (rule) {
            if (environment.development && value && isUpdatedRule(name, value, rule)) {
                reportError(key, name, `${name} has a new definition`)
            }
            addDescriptors(definitions, name, key)
        } else if (environment.development) {
            reportError(key, name, `${name} is a new rule`)
        }
    })
}

/**
 * @param {object} specifications
 * @returns {Promise}
 */
function build(specifications) {

    Object.entries(specifications).forEach(([key, { atrules, properties, selectors, values }]) => {
        if (excluded.specifications.includes(key)) {
            return
        }
        addProperties(properties, key)
        addTypes(values, key)
        addRules(atrules, key)
        reportMissingPseudoSelectors(selectors, key)
    })

    return Promise.all([
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'descriptors', 'definitions.js'),
            serializeDescriptors(descriptors.sort(sortByName))),
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'properties', 'definitions.js'),
            serializeProperties(properties.sort(sortByName))),
        fs.writeFile(
            path.join(import.meta.dirname, '..', 'lib', 'values', 'definitions.js'),
            serializeTypes(types.sort(sortByName))),
    ])
}

try {
    const specifications = await webref.listAll()
    await build(specifications)
} catch (error) {
    console.log('Please report this issue: https://github.com/cdoublev/css/issues/new')
    throw error
}
