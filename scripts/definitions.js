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
const { addQuotes, logError, tab } = require('../lib/utils/script.js')
const { join, resolve } = require('path')
const { productions: { structures, terminals } } = require('../lib/parse/syntax.js')
const compatibility = require('../lib/compatibility.js')
const colors = require('../lib/values/colors.js')
const { definitions: dimensions } = require('../lib/values/dimensions.js')
const font = require('../lib/values/font.js')
const fs = require('node:fs/promises')
const logical = require('../lib/properties/logical.js')
const pseudos = require('../lib/values/pseudos.js')
const { rules } = require('../lib/rules/definitions.js')
const shorthands = require('../lib/properties/shorthands.js')
const webref = require('./webref.js')

const logicalGroups = Object.keys(logical)

const reportErrors = process.env.NODE_ENV === 'development'
const outputPaths = {
    descriptors: resolve(join(__dirname, '..', 'lib', 'descriptors', 'definitions.js')),
    properties: resolve(join(__dirname, '..', 'lib', 'properties', 'definitions.js')),
    types: resolve(join(__dirname, '..', 'lib', 'values', 'definitions.js')),
}
const header = `\n// Generated from ${__filename}\n\nmodule.exports = {\n`

/* eslint-disable sort-keys */
const initialTypes = {
    // TODO: report w3c/csswg-drafts issue "Define `<type>` with a production rule"
    'absolute-size': 'xx-small | x-small | small | medium | large | x-large | xx-large',
    'content-level': 'element | content | text | attr(<custom-ident>) | <counter()> | <counters()>',
    'relative-size': 'larger | smaller',
    'x': '<number>',
    'y': '<number>',
    // https://github.com/w3c/csswg-drafts/issues/7632
    'font-src': '<url> [format(<font-format>)]? [tech(<font-tech>#)]? | local(<family-name>)',
    // https://github.com/w3c/csswg-drafts/issues/8091, https://github.com/w3c/csswg-drafts/issues/8384
    'toggle()': "toggle(<declaration-value>? [';' <declaration-value>?]+)",
}
const replaced = {
    descriptors: {
        '@color-profile': {
            // https://github.com/w3c/webref/issues/707
            'components': { initial: '' },
            'src': { initial: '' },
        },
        '@counter-style': {
            // https://github.com/w3c/csswg-drafts/issues/7417
            'negative': { initial: '"-"' },
            'prefix': { initial: '""' },
            'suffix': { initial: '". "' },
            // https://github.com/w3c/webref/issues/707
            'additive-symbols': { initial: '' },
            'symbols': { initial: '' },
        },
        '@font-face': {
            // https://github.com/w3c/csswg-drafts/issues/7418
            'font-size': { initial: 'auto' },
            // https://github.com/w3c/csswg-drafts/issues/7632
            'src': { initial: '', value: '<font-src-list>' },
            // https://github.com/w3c/webref/issues/707
            'font-family': { initial: '' },
        },
        '@font-palette-values': {
            // https://github.com/w3c/webref/issues/707
            'base-palette': { initial: '' },
            'font-family': { initial: '' },
            'override-colors': { initial: '' },
        },
        '@property': {
            // https://github.com/w3c/webref/issues/707
            'inherits': { initial: '' },
            'initial-value': { initial: '' },
            'syntax': { initial: '' },
        },
    },
    properties: {
        // https://github.com/w3c/fxtf-drafts/issues/451
        'background-blend-mode': { value: "<'mix-blend-mode'>#" },
        // https://github.com/w3c/csswg-drafts/issues/7366
        'border-end-end-radius': { initial: '0' },
        'border-end-start-radius': { initial: '0' },
        'border-start-end-radius': { initial: '0' },
        'border-start-start-radius': { initial: '0' },
        // https://github.com/w3c/csswg-drafts/issues/7350
        'clear': { value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both-inline | both-block | both | all | none' },
        // https://github.com/w3c/csswg-drafts/issues/7219
        'clip': { value: 'rect(<top>, <right>, <bottom>, <left>) | auto' },
        // https://github.com/w3c/csswg-drafts/issues/8600
        'contain': { value: 'none | strict | content | [[size | inline-size] || layout || style || paint]' },
        // https://github.com/w3c/csswg-drafts/issues/7351
        'content': { value: 'normal | none | [<content-replacement> | <content-list>] [/ [<string> | <counter>]+]? | <element()>' },
        'position': { value: 'static | relative | absolute | sticky | fixed | running(<custom-ident>)' },
        // TODO: report w3c/csswg-drafts issue "invalid quotes to define non-terminal referencing `opacity`"
        'fill-opacity': { value: "<'opacity'>" },
        'stroke-opacity': { value: "<'opacity'>" },
        // Implementation dependent
        'font-family': { initial: 'monospace' },
        'glyph-orientation-vertical': { initial: 'auto' },
        'voice-family': { initial: 'female' },
        // https://github.com/w3c/csswg-drafts/issues/7700
        'outline': { value: "<'outline-width'> || <'outline-style'> || <'outline-color'>" },
        // https://github.com/w3c/csswg-drafts/issues/7352
        'shape-padding': { initial: '0', value: '<length-percentage>' },
        // https://github.com/w3c/csswg-drafts/issues/8440, https://github.com/w3c/csswg-drafts/issues/8567
        'scroll-timeline-name': { value: '[none | <custom-ident>]#' },
        'transition-property': { value: '[none | <single-transition-property>]#' },
        'view-timeline-name': { value: '[none | <custom-ident>]#' },
        // https://github.com/w3c/svgwg/issues/888
        'stop-color': { initial: 'black', value: "<'color'>" },
        'stop-opacity': { initial: '1', value: "<'opacity'>" },
    },
    types: {
        // TODO: report w3c/csswg-drafts issue "Define `<type>` with a production rule"
        'age': 'child | young | old',
        'basic-shape': '<basic-shape-rect> | <circle()> | <ellipse()> | <polygon()> | <path()>',
        'bottom': '<length> | auto',
        'counter-name': '<custom-ident>',
        'counter-style-name': '<custom-ident>',
        'custom-highlight-name': '<ident>',
        'deprecated-color': colors.deprecated.join(' | '),
        'dimension-unit': `"%" | ${[...dimensions.values()].flatMap(({ units }) => units).join(' | ')}`,
        'extension-name': '<dashed-ident>',
        'gender': 'male | female | neutral',
        'generic-family': font.genericFamilies.join(' | '),
        'id': '<id-selector>',
        'lang': '<ident> | <string>',
        'left': '<length> | auto',
        'mq-boolean': '<integer [0,1]>',
        'named-color': colors.named.join(' | '),
        'outline-line-style': 'none | dotted | dashed | solid | double | groove | ridge | inset | outset | auto',
        'page-size': 'A5 | A4 | A3 | B5 | B4 | JIS-B5 | JIS-B4 | letter | legal | ledger',
        'palette-identifier': '<custom-ident>',
        'quirky-color': '<number-token> | <ident-token> | <dimension-token>',
        'quirky-length': '<number-token>',
        'right': '<length> | auto',
        'scope-end': '<forgiving-selector-list>',
        'scope-start': '<forgiving-selector-list>',
        'size-feature': '<media-feature>',
        'system-color': colors.system.join(' | '),
        'target-name': '<string>',
        'timeline-range-name': 'contain | cover | entry | entry-crossing | exit | exit-crossing',
        'top': '<length> | auto',
        'transform-function': '<matrix()> | <translate()> | <translateX()> | <translateY()> | <scale()> | <scaleX()> | <scaleY()> | <rotate()> | <skew()> | <skewX()> | <skewY()>',
        'uri': '<url>',
        'url-modifier': '<custom-ident> | <function>',
        'url-set': '<image-set()>',
        // https://github.com/w3c/csswg-drafts/issues/8346, https://github.com/w3c/csswg-drafts/pull/8367#issuecomment-1408147460
        'angular-color-hint': '<angle-percentage> | <zero>',
        'color-stop-angle': '[<angle-percentage> | <zero>]{1,2}',
        'conic-gradient()': 'conic-gradient([[[from [<angle> | <zero>]]? [at <position>]?]! || <color-interpolation-method>]?, <angular-color-stop-list>)',
        'linear-gradient()': 'linear-gradient([[<angle> | <zero> | to <side-or-corner>] || <color-interpolation-method>]?, <color-stop-list>)',
        'radial-gradient()': 'radial-gradient([[[<rg-ending-shape> || <rg-size>]? [at <position>]?]! || <color-interpolation-method>]?, <color-stop-list>)',
        // https://github.com/w3c/csswg-drafts/issues/8384
        'attr()': 'attr(<wq-name> <attr-type>?, <declaration-value>?)',
        'random()': 'random(<random-caching-options>?, <calc-sum>, <calc-sum>, [by <calc-sum>]?)',
        'random-item()': "random-item(<random-caching-options> ';' <declaration-value>? [';' <declaration-value>?]*)",
        // https://github.com/w3c/csswg-drafts/issues/7368
        'content-list': '[<string> | <content()> | contents | <image> | <counter> | <quote> | <target> | <leader()>]+',
        // https://github.com/w3c/csswg-drafts/issues/8187
        'family-name': '<custom-ident>+ | <string>',
        // https://github.com/w3c/csswg-drafts/issues/7016
        'general-enclosed': '<function> | (<any-value>?)',
        'pseudo-class-selector': "':' <ident> | ':' <function>",
        // https://github.com/w3c/csswg-drafts/issues/7900, https://github.com/w3c/csswg-drafts/issues/8346
        'repeating-conic-gradient()': 'repeating-conic-gradient([[[from [<angle> | <zero>]]? [at <position>]?]! || <color-interpolation-method>]?, <angular-color-stop-list>)',
        'repeating-linear-gradient()': 'repeating-linear-gradient([[<angle> | <zero> | to <side-or-corner>] || <color-interpolation-method>]?, <color-stop-list>)',
        'repeating-radial-gradient()': 'repeating-radial-gradient([[[<rg-ending-shape> || <rg-size>]? [at <position>]?]! || <color-interpolation-method>]?, <color-stop-list>)',
        // https://github.com/w3c/fxtf-drafts/issues/411
        'path()': "path(<'fill-rule'>?, <string>)",
        // https://github.com/w3c/csswg-drafts/issues/7897
        'single-transition': '<time> || <easing-function> || <time> || [none | <single-transition-property>]',
        // https://github.com/w3c/csswg-drafts/issues/8127
        'style-feature': '<declaration> | <ident>',
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
            // Superseded by CSS Backgrounds and Borders
            'background',
            'background-attachment',
            'background-color',
            'background-image',
            'background-position',
            'background-repeat',
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
            // Superseded by CSS Basic User Interface
            'cursor',
            'outline',
            'outline-color',
            'outline-style',
            'outline-width',
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
        'css-backgrounds-4': [
            // TODO: support new grammars from CSS Background 4
            'background-clip',
            'background-position',
            'border-bottom-color',
            'border-clip',
            'border-clip-bottom',
            'border-clip-left',
            'border-clip-right',
            'border-clip-top',
            'border-color',
            'border-left-color',
            'border-right-color',
            'border-top-color',
        ],
        'css-contain-3': [
            // https://github.com/w3c/csswg-drafts/issues/8600
            'contain',
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
        'css-gcpm': [
            // https://github.com/w3c/csswg-drafts/issues/7351
            'content',
            'position',
        ],
        'css-logical': [
            // https://github.com/w3c/csswg-drafts/issues/7371
            'text-align',
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
        ],
        'css-round-display': [
            // https://github.com/w3c/csswg-drafts/issues/6433
            'shape-inside',
        ],
        'css-scroll-snap-2': [
            // Not defined yet
            'scroll-start-target',
            'scroll-start-target-block',
            'scroll-start-target-inline',
            'scroll-start-target-x',
            'scroll-start-target-y',
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
        // TODO: support new grammars from CSS Color 5
        'css-color-5',
        // Not ready
        'css-color-6',
        'css-color-hdr',
        'css-conditional-values',
        'css-gcpm-4',
        'selectors-nonelement',
        'webvtt',
        // Prefer SVG 2
        'fill-stroke',
        'svg-strokes',
    ],
    types: {
        '*': [
            // Terminals
            '(-token',
            ')-token',
            '[-token',
            ']-token',
            '{-token',
            '}-token',
            'CDC-token',
            'CDO-token',
            'EOF-token',
            'at-keyword-token',
            'bad-string-token',
            'bad-url-token',
            'colon-token',
            'comma-token',
            'delim-token',
            'semicolon-token',
            'whitespace-token',
            ...Object.keys(structures),
            ...Object.keys(terminals),
            // Aliases
            ...compatibility.values.aliases.keys(),
        ],
        'CSS': [
            // Obsoleted by CSS Backgrounds
            'border-style',
            'border-width',
            // Obsoleted by CSS Box Model
            'margin-width',
            'padding-width',
            // Obsoleted by CSS Masking
            'shape',
            // Superseded by CSS Color
            'color',
            // Superseded by CSS Fonts
            'family-name',
            'generic-family',
            // Superseded by CSS Lists and Counters
            'counter',
            'counter()',
            'counters()',
        ],
        'css-conditional-5': [
            // https://github.com/w3c/csswg-drafts/issues/8110
            'font-format',
            'font-tech',
        ],
        'css-gcpm': [
            // Prefer CSS Generated Content
            'content()',
            'string()',
        ],
        'css-images-4': [
            // https://github.com/w3c/csswg-drafts/issues/1981
            'element()',
        ],
        'css-masking': [
            // https://github.com/w3c/fxtf-drafts/pull/468
            'rect()',
        ],
        'filter-effects': [
            // Duplicate of CSS Values
            'url',
        ],
    },
}
/* eslint-enable sort-keys */

const descriptors = []
const properties = []
const types = [...Object.entries(initialTypes), ...Object.entries(replaced.types)]

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
            if (!elements[name.endsWith('()') ? 'functions' : 'identifiers'][name.slice(2)]) {
                console.log(`There is a new pseudo-element: ${name} [${key}]`)
            }
            return
        }
        if (name.endsWith('()')) {
            if (!classes.functions[name.slice(1)]) {
                console.log(`There is a new pseudo-class: ${name} [${key}]`)
            }
            return
        }
        // Ignore pseudo-elements with legacy syntax and `:lang()` incorrectly named `:lang` in CSS 2
        if (!classes.identifiers.includes(name.slice(1)) && key !== 'CSS') {
            console.log(`There is a new pseudo-class: ${name} [${key}]`)
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
    if (block) {
        definition += ` { ${block} }`
    } else {
        definition += ' ;'
    }
    value = normalizeValue(value).replace('};', '}')
    return value !== definition
}

/**
 * @param {string} name
 * @param {object[]} [rules]
 * @param {number} [depth]
 * @returns {object|null}
 */
function findRule(name, rules = [], depth = 1) {
    if (depth < 3) {
        for (const rule of rules) {
            const { names, rules: children, type, value } = rule
            if (type === name || type === `${name}-block` || type === `${name}-statement` || names?.includes(name)) {
                return rule
            }
            if (value && value !== '<stylesheet>') {
                const child = findRule(name, children, depth + 1)
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
function removeExtraGroup(value) {
    if (value.startsWith('[') && value.endsWith(']')) {
        const { length } = value
        const end = length - 2
        let depth = 0
        let index = 0
        while (++index < end) {
            const char = value[index]
            if (char === ']' && depth-- === 0) {
                return value
            }
            if (char === '[') {
                ++depth
            }
        }
        return removeExtraGroup(value.slice(1, -1))
    }
    if (value.endsWith(')')) {
        const { length } = value
        for (let index = 0; index < length; ++index) {
            const left = value[index]
            if (left === ' ') {
                break
            }
            if (left === '(') {
                return `${value.slice(0, index)}(${removeExtraGroup(value.slice(index + 1, -1))})`
            }
        }
    }
    return value
}

/**
 * @param {string} value
 * @returns {string}
 *
 * It removes extra white spaces and groups (angled brackets).
 */
function normalizeValue(value) {
    return removeExtraGroup(value.replace(/[([] | [)\],]/g, match => match.trim()))
}

/**
 * @param {string[][]} types
 * @returns {string}
 */
function serializeTypes(types) {
    return types.reduce(
        (string, [type, value]) =>
            `${string}${tab(1)}${addQuotes(type)}: ${addQuotes(normalizeValue(value))},\n`,
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
            if (animatable === 'no' || animationType === 'not animatable') {
                string += `${tab(2)}animate: false,\n`
            }
            if (!shorthands.has(property)) {
                const group = logicalGroups.find(group => logical[group].some(mapping => mapping.includes(property)))
                if (logicalPropertyGroup && !group) {
                    console.log(`${property} is missing in the logical property group "${logicalPropertyGroup}" [${key}]`)
                }
                if (group) {
                    string += `${tab(2)}group: ${addQuotes(group)},\n`
                }
                string += `${tab(2)}initial: ${addQuotes(initial)},\n`
            }
            if (key === 'CSS') {
                value = value.replace(/ \| inherit$/, '')
            }
            string += `${tab(2)}value: ${addQuotes(normalizeValue(value))},\n${tab(1)}},\n`
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
                if (initial) {
                    string += `${tab(3)}initial: ${addQuotes(initial)},\n`
                } else if (type) {
                    string += `${tab(3)}type: '${type}',\n`
                }
                string += `${tab(3)}value: ${addQuotes(normalizeValue(value))},\n${tab(2)}},\n`
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
            // Type only defined with a prose specific to its namespace
            if (value === name) {
                return
            }
            type = 'type'
        }
        if (type === 'type' || type === 'function') {
            // `<type>` -> `type`
            if (type === 'type') {
                name = name.slice(1, -1)
            }
            if (replaced.types[name] || skip.includes(name) || skipFromAllSpecs.includes(name)) {
                addTypes(values, key)
                return
            }
            if (initialTypes[name]) {
                if (value && reportErrors) {
                    console.log(`<${name}> is now extracted from [${key}]`)
                }
                return
            }
            if (!value) {
                if (reportErrors && !(replaced[name] || structures[name])) {
                    console.log(`<${name}> is defined in prose in [${key}] and must be replaced with a value definiton`)
                }
                return
            }
            const entry = types.find(([type]) => type === name)
            if (entry) {
                const [base1, v1 = 1] = entry[2].split(/-(\d)$/)
                const [base2, v2 = 1] = key.split(/-(\d)$/)
                if (base1 !== base2) {
                    throw Error(`Unhandled duplicate definitions of <${name}>`)
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
        const { properties: { [name]: replacement } } = replaced
        if (replacement) {
            definition = { ...definition, ...replacement }
        }
        const entry = properties.find(([property]) => property === name)
        if (entry) {
            const [, prevDefinition, prevKey] = entry
            const { newValues: prevNewValues } = prevDefinition
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
                entry.splice(1, 2, definition, key)
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
    const { descriptors: { '*': skipFromAllSpecs = [], [key]: skip = [] } } = excluded
    definitions.forEach(({ initial = '', name, type, value, values }) => {
        if (skip.includes(name) || skipFromAllSpecs.includes(name)) {
            return
        }
        const replacement = replaced.descriptors[rule]?.[name]
        if (replacement) {
            ({ initial = initial, type, value = value, values } = replacement)
        }
        const context = descriptors.find(([key]) => key === rule)
        if (context) {
            const [, entries] = context
            const entry = entries.find(([key]) => key === name)
            if (entry) {
                const [,, prevKey] = entry
                const [base1, v1 = 1] = prevKey.split(/-(\d)$/)
                const [base2, v2 = 1] = key.split(/-(\d)$/)
                if (base1 !== base2) {
                    throw Error(`Unhandled duplicate definitions of the descriptor "${name}"`)
                }
                if (v2 < v1) {
                    return
                }
                context.splice(rule.indexOf(entry), 1)
            }
            entries.push([name, { initial, type, value }, key])
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
    definitions.forEach(({ name, descriptors: definitions, value }) => {
        const id = name.slice(1)
        if (aliases.has(id) || mappings.has(id)) {
            return
        }
        const rule = findRule(id, rules)
        if (rule) {
            if (reportErrors && value && isUpdatedRule(name, value, rule)) {
                console.log(`${name} has a new definition in [${key}]`)
            }
            addDescriptors(definitions, name, key)
        } else if (reportErrors) {
            console.log(`There is a new rule: ${name} [${key}]`)
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
        if (reportErrors) {
            reportMissingPseudoSelectors(selectors, key)
        }
    })

    return Promise.all([
        fs.writeFile(outputPaths.descriptors, `${header}${serializeDescriptors(descriptors.sort(sortByName))}}\n`),
        fs.writeFile(outputPaths.properties, `${header}${serializeProperties(properties.sort(sortByName))}}\n`),
        fs.writeFile(outputPaths.types, `${header}${serializeTypes(types.sort(sortByName))}}\n`),
    ])
}

webref.listAll().then(build).catch(logError)
