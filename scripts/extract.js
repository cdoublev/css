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
const { addQuotes, tab } = require('../lib/utils/string.js')
const { join, resolve } = require('node:path')
const arbitrary = require('../lib/parse/arbitrary.js')
const blocks = require('../lib/values/blocks.js')
const colors = require('../lib/values/colors.js')
const compatibility = require('../lib/compatibility.js')
const { definitions: dimensions } = require('../lib/values/dimensions.js')
const font = require('../lib/values/font.js')
const forgiving = require('../lib/values/forgiving.js')
const fs = require('node:fs/promises')
const logical = require('../lib/properties/logical.js')
const parseDefinition = require('../lib/parse/definition.js')
const pseudos = require('../lib/values/pseudos.js')
const { rules } = require('../lib/rules/definitions.js')
const { serializeDefinition } = require('../lib/serialize.js')
const shorthands = require('../lib/properties/shorthands.js')
const webref = require('./webref.js')

const logicalGroups = Object.keys(logical)

const reportErrors = process.env.NODE_ENV === 'development'

/* eslint-disable sort-keys */
const initial = {
    descriptors: {},
    properties: {
        // https://github.com/w3c/reffy/issues/1567
        '--*': { initial: null, value: '<declaration-value>?' },
    },
    types: {
        // Missing definitions
        '<x>': '<number>',
        '<y>': '<number>',
        '<whole-value>': '<declaration-value>?',
        // https://github.com/w3c/csswg-drafts/issues/9410
        '<generic-family-name>': font.family.generic.join(' | '),
        // https://github.com/w3c/csswg-drafts/issues/8835
        '<urange>': "u '+' <ident-token> '?'* | u <dimension-token> '?'* | u <number-token> '?'* | u <number-token> <dimension-token> | u <number-token> <number-token> | u '+' '?'+",
    },
}
const replaced = {
    descriptors: {
        '@property': {
            // https://github.com/w3c/webref/issues/707
            'initial-value': { initial: '' },
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
        // TODO: fix `value` of `copy-into`
        'copy-into': { value: 'none | [<custom-ident> <content-level>]#' },
        // TODO: fix `value` of `fill-opacity`, `stroke-opacity`
        'fill-opacity': { value: "<'opacity'>" },
        'stroke-opacity': { value: "<'opacity'>" },
        // https://github.com/w3c/csswg-drafts/issues/9160
        'flow-from': { value: 'none | <custom-ident>' },
        'flow-into': { value: 'none | <custom-ident> [element | content]?' },
        // TODO: fix `value` of `voice-family`
        // Implementation dependent
        'font-family': { initial: 'monospace' },
        'voice-family': { initial: 'female', value: '[<family-name> | <generic-voice>]# | preserve' },
        // https://github.com/w3c/csswg-drafts/issues/8032
        'glyph-orientation-vertical': { value: 'auto | <angle> | <number>' },
        // https://github.com/w3c/csswg-drafts/issues/7700
        'outline': { value: "<'outline-width'> || <'outline-style'> || <'outline-color'>" },
        // https://github.com/w3c/svgwg/issues/888
        'stop-color': { initial: 'black', value: "<'color'>" },
        'stop-opacity': { initial: '1', value: "<'opacity'>" },
        // TODO: fix `value` of `transition-property`
        'transition-property': { value: '[none | <single-transition-property>]#' },
    },
    types: {
        // Extensions
        '<radial-size>': '<radial-extent>{1,2} | <length-percentage [0,∞]>{1,2}',
        // Missing production rules
        '<absolute-size>': 'xx-small | x-small | small | medium | large | x-large | xx-large',
        '<age>': 'child | young | old',
        '<angle>': '<dimension>',
        '<basic-shape>': '<basic-shape-rect> | <circle()> | <ellipse()> | <polygon()> | <path()> | <shape()>',
        '<counter-name>': '<custom-ident>',
        '<counter-style-name>': '<custom-ident>',
        '<custom-highlight-name>': '<ident-token>',
        '<custom-ident>': '<ident>',
        '<custom-property-name>': '<dashed-ident>',
        '<dashed-ident>': '<custom-ident>',
        '<dashndashdigit-ident>': '<ident-token>',
        '<decibel>': '<dimension>',
        '<deprecated-color>': colors.deprecated.join(' | '),
        '<dimension>': '<dimension-token>',
        '<dimension-unit>': `"%" | ${[...dimensions.values()].flatMap(dimension => dimension.units).join(' | ')}`,
        '<extension-name>': '<dashed-ident>',
        '<flex>': '<dimension>',
        '<frequency>': '<dimension>',
        '<gender>': 'male | female | neutral',
        '<hex-color>': '<hash-token>',
        '<id>': '<id-selector>',
        '<ident>': '<ident-token>',
        '<integer>': '<number-token>',
        '<intrinsic-size-keyword>': '<custom-ident>',
        '<length>': '<dimension>',
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
        '<scope-end>': '<forgiving-selector-list>',
        '<scope-start>': '<forgiving-selector-list>',
        '<semitones>': '<dimension>',
        '<sibling-count()>': 'sibling-count()',
        '<sibling-index()>': 'sibling-index()',
        '<signed-integer>': '<number-token>',
        '<signless-integer>': '<number-token>',
        '<size-feature>': '<media-feature>',
        '<string>': '<string-token>',
        '<style-feature>': '<declaration> | <ident>',
        '<system-color>': colors.system.join(' | '),
        '<target-name>': '<string>',
        '<time>': '<dimension>',
        '<timeline-range-name>': 'contain | cover | entry | entry-crossing | exit | exit-crossing',
        '<transform-function>': '<matrix()> | <translate()> | <translateX()> | <translateY()> | <scale()> | <scaleX()> | <scaleY()> | <rotate()> | <skew()> | <skewX()> | <skewY()>',
        '<uri>': '<url>',
        '<url-modifier>': '<custom-ident> | <function>',
        '<url-set>': '<image-set()>',
        '<zero>': '<number-token>',
        // https://github.com/w3c/csswg-drafts/issues/8346, https://github.com/w3c/csswg-drafts/pull/8367#issuecomment-1408147460
        '<angular-color-hint>': '<angle-percentage> | <zero>',
        '<color-stop-angle>': '[<angle-percentage> | <zero>]{1,2}',
        '<conic-gradient-syntax>': '[[[from [<angle> | <zero>]]? [at <position>]?]! || <color-interpolation-method>]? , <angular-color-stop-list>',
        '<linear-gradient-syntax>': '[[<angle> | <zero> | to <side-or-corner>] || <color-interpolation-method>]? , <color-stop-list>',
        '<radial-gradient-syntax>': '[[[<radial-shape> || <radial-size>]? [at <position>]?]! || <color-interpolation-method>]? , <color-stop-list>',
        // TODO: fix `value` of `@container`, `<container-condition>`
        '<container-condition>': '[<container-name>]? <container-query>#',
        // https://github.com/w3c/csswg-drafts/issues/7016
        '<general-enclosed>': '<function> | (<any-value>?)',
        '<pseudo-class-selector>': ': <ident> | : <function>',
        // https://github.com/w3c/csswg-drafts/issues/9410
        '<generic-family>': 'generic(<custom-ident>+) | <generic-family-name>',
        // https://github.com/w3c/fxtf-drafts/issues/532
        '<mask-reference>': 'none | <image>',
        // https://github.com/w3c/csswg-drafts/pull/10131
        '<media-feature>': '<mf-plain> | <mf-boolean> | <mf-range>',
        '<media-in-parens>': '(<media-condition>) | (<media-feature>) | <general-enclosed>',
        // TODO: fix `value` of `<mix()>`
        '<mix()>': 'mix(<progress> ; <whole-value> ; <whole-value>) | mix(<progress> && of <keyframes-name>)',
        // TODO: fix `value` of `<progress>`
        '<progress>': "[<percentage> | <number> | <'animation-timeline'>] && [by <easing-function>]?",
        // TODO: fix `value` of `<pseudo-page>`
        '<pseudo-page>': ': [left | right | first | blank | nth(<an+b> [of <custom-ident>]?)]',
        // https://github.com/w3c/csswg-drafts/issues/7897
        '<single-transition>': '<time> || <easing-function> || <time> || <transition-behavior-value> || [none | <single-transition-property>]',
        // TODO: fix `value` of `<step-easing-function>`
        '<step-easing-function>': 'step-start | step-end | <steps()>',
    },
}
const excluded = {
    descriptors: {
        'css-round-display': [
            // https://github.com/w3c/csswg-drafts/issues/8097
            'viewport-fit',
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
            'border-color',
            'border-bottom',
            'border-bottom-color',
            'border-bottom-left-radius',
            'border-bottom-right-radius',
            'border-bottom-style',
            'border-bottom-width',
            'border-left',
            'border-left-color',
            'border-left-style',
            'border-left-width',
            'border-radius',
            'border-right',
            'border-right-color',
            'border-right-style',
            'border-right-width',
            'border-top',
            'border-top-color',
            'border-top-left-radius',
            'border-top-right-radius',
            'border-top-style',
            'border-top-width',
            'box-shadow',
        ],
        'css-backgrounds-4': [
            // https://github.com/w3c/csswg-drafts/issues/9253
            'background-position',
            // https://github.com/w3c/csswg-drafts/pull/9084
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
        'css-sizing-4': [
            // https://github.com/w3c/csswg-drafts/issues/7370
            'block-size',
            'inline-size',
            'max-block-size',
            'max-inline-size',
            'min-block-size',
            'min-inline-size',
        ],
        'css-ui': [
            // Prefer SVG
            'pointer-events',
        ],
        'mathml-core': [
            // https://github.com/w3c/mathml-core/issues/246
            'text-transform',
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
        'css-color-hdr',
        'css-conditional-values',
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
            '<EOF-token>',
            '<at-keyword-token>',
            '<bad-string-token>',
            '<bad-url-token>',
            '<colon-token>',
            '<comma-token>',
            '<delim-token>',
            '<dimension-token>',
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
            ...blocks.contents,
            ...Object.keys(forgiving),
            // Legacy webkit function name aliases
            ...[...compatibility.values['*'].values()].flatMap(replacements => replacements.aliases),
            // TODO: remove `value` of `fit-content()`, `minmax()`
            '<fit-content()>',
            '<minmax()>',
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
        'css-gcpm': [
            // Prefer CSS Generated Content
            '<content()>',
            '<content-list>',
        ],
        'css-images-4': [
            // https://github.com/w3c/csswg-drafts/issues/1981
            '<element()>',
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
        'filter-effects': [
            // Duplicate of CSS Values
            '<url>',
        ],
    },
}
/* eslint-enable sort-keys */

const descriptors = [...Object.keys(initial.descriptors).map(rule => [rule, Object.entries(initial.descriptors[rule])])]
const properties = [...Object.entries(initial.properties)]
const types = [...Object.entries(initial.types), ...Object.entries(replaced.types)]

/**
 * @param {object[]} selectors
 * @param {string} key
 */
function reportMissingPseudoSelectors(selectors, key) {
    const { classes, elements } = pseudos
    const { selectors: { '*': skipFromAllSpecs = [], [key]: skip = [] } } = excluded
    selectors.forEach(({ name }) => {
        if (skip.includes(name) || skipFromAllSpecs.includes(name)) {
            return
        }
        if (name.startsWith('::')) {
            if (name.endsWith('()')) {
                if (!elements.functions[name.slice(2, -2)]) {
                    console.log(`[${key}] ${name} is a new pseudo-element`)
                }
            } else if (!elements.identifiers[name.slice(2)]) {
                console.log(`[${key}] ${name} is a new pseudo-element`)
            }
            return
        }
        if (name.endsWith('()')) {
            if (!classes.functions[name.slice(1, -2)]) {
                console.log(`[${key}] ${name} is a new pseudo-class`)
            }
            return
        }
        // Ignore pseudo-elements with legacy syntax and `:lang()` incorrectly named `:lang` in CSS 2
        if (!classes.identifiers.includes(name.slice(1)) && key !== 'CSS') {
            console.log(`[${key}] ${name} is a new pseudo-class`)
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
 * @param {string} type
 * @param {object[]} [rules]
 * @param {number} [depth]
 * @returns {object|null}
 */
function findRule(type, rules = [], depth = 1) {
    if (depth < 3) {
        for (const rule of rules) {
            const { name, names, value } = rule
            if (name === type || name === `${type}-block` || name === `${type}-statement` || names?.includes(type)) {
                return rule
            }
            if (value) {
                const child = findRule(type, value.rules, depth + 1)
                if (child) {
                    return child
                }
            }
        }
    }
    return null
}

/**
 * @param {string} value
 * @returns {string}
 */
function serializeValueDefinition(value) {
    return serializeDefinition(parseDefinition(value))
}

/**
 * @param {string[][]} types
 * @returns {string}
 */
function serializeTypes(types) {
    return types.reduce(
        (string, [type, value]) =>
            `${string}${tab(1)}${addQuotes(type)}: ${addQuotes(serializeValueDefinition(value))},\n`,
        '')
}

/**
 * @param {*[][]} properties
 * @returns {string}
 */
function serializeProperties(properties) {
    return properties.reduce(
        (string, [property, { animatable, animationType, initial, logicalPropertyGroup, value }, key]) => {
            string += `${tab(1)}${addQuotes(property)}: {\n`
            if (animationType === 'not animatable') {
                string += `${tab(2)}animate: false,\n`
            }
            if (!shorthands.has(property)) {
                const group = logicalGroups.find(group => logical[group].some(mapping => mapping.includes(property)))
                if (logicalPropertyGroup && !group) {
                    console.log(`[${key}] ${property} is missing in the logical property group "${logicalPropertyGroup}"`)
                }
                if (group) {
                    string += `${tab(2)}group: ${addQuotes(group)},\n`
                }
                string += `${tab(2)}initial: ${initial ? addQuotes(initial) : null},\n`
            }
            if (key === 'CSS') {
                value = value.replace(/ \| inherit$/, '')
            }
            string += `${tab(2)}value: ${addQuotes(serializeValueDefinition(value))},\n${tab(1)}},\n`
            return string
        },
        '')
}

/**
 * @param {*[][]} descriptors
 * @returns {string}
 */
function serializeDescriptors(descriptors) {
    return descriptors.reduce(
        (string, [rule, definitions]) => {
            string += `${tab(1)}${addQuotes(rule)}: {\n`
            definitions.sort(sortByName).forEach(([descriptor, { initial, type, value }]) => {
                string += `${tab(2)}${addQuotes(descriptor)}: {\n`
                if (initial && !initial.toLowerCase().startsWith('n/a')) {
                    string += `${tab(3)}initial: ${addQuotes(initial)},\n`
                } else if (type) {
                    string += `${tab(3)}type: '${type}',\n`
                }
                string += `${tab(3)}value: ${addQuotes(serializeValueDefinition(value))},\n${tab(2)}},\n`
            })
            string += `${tab(1)}},\n`
            return string
        },
        '')
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
            name = `<${name}>`
            type = 'type'
        }
        if (type === 'type') {
            if (replaced.types[name] || skip.includes(name) || skipFromAllSpecs.includes(name)) {
                addTypes(values, key)
                return
            }
            if (initial.types[name]) {
                if (value && reportErrors) {
                    console.log(`[${key}] ${name} is now extracted`)
                }
                return
            }
            if (!value) {
                if (reportErrors && !replaced[name]) {
                    console.log(`[${key}] ${name} is defined in prose and must be replaced with a value definiton`)
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
            if (reportErrors) {
                console.log(`[${key}] ${name} (property) is now extracted`)
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
            if (reportErrors) {
                console.log(`[${key}] ${name} (descriptor for ${rule}) is now extracted`)
            }
            return
        }
        const replacement = replaced.descriptors[rule]?.[name]
        if (replacement) {
            ({ initial = initial, type, value = value, values } = replacement)
        }
        const context = descriptors.find(([key]) => key === rule)
        if (context) {
            const [, entries] = context
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
        const rule = findRule(name, rules)
        if (rule) {
            if (reportErrors && value && isUpdatedRule(name, value, rule)) {
                console.log(`[${key}] ${name} has a new definition`)
            }
            addDescriptors(definitions, name, key)
        } else if (reportErrors) {
            console.log(`[${key}] ${name} is a new rule`)
        }
    })
}

/**
 * @param {object} specifications
 * @returns {Promise}
 */
function build(specifications) {

    const header = `\n// Generated from ${__filename}\n\nmodule.exports = {\n`

    Object.entries(specifications).forEach(([key, { atrules, properties, selectors, values }]) => {
        if (excluded.specifications.includes(key)) {
            return
        }
        addProperties(properties, key)
        addTypes(values, key)
        addRules(atrules, key)
        if (reportErrors) {
            reportMissingPseudoSelectors(selectors, key)
        }
    })

    return Promise.all([
        fs.writeFile(
            resolve(join(__dirname, '..', 'lib', 'descriptors', 'definitions.js')),
            `${header}${serializeDescriptors(descriptors.sort(sortByName))}}\n`),
        fs.writeFile(
            resolve(join(__dirname, '..', 'lib', 'properties', 'definitions.js')),
            `${header}${serializeProperties(properties.sort(sortByName))}}\n`),
        fs.writeFile(
            resolve(join(__dirname, '..', 'lib', 'values', 'definitions.js')),
            `${header}${serializeTypes(types.sort(sortByName))}}\n`),
    ])
}

webref.listAll()
    .then(build)
    .catch(error => {
        console.log('Please report this issue: https://github.com/cdoublev/css/issues/new')
        throw error
    })
