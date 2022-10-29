/**
 * This script generates definitions extracted by @webref/css from latest W3C
 * Editor's Drafts specifications:
 *
 *   - ./lib/descriptors/definitions.js
 *   - ./lib/properties/definitions.js
 *   - ./lib/values/definitions.js
 */
const { addQuotes, logError, tab } = require('../lib/utils/script.js')
const { join, resolve } = require('path')
const compatibility = require('../lib/compatibility.js')
const cssWideKeywords = require('../lib/values/css-wide-keywords.js')
const deprecatedColors = require('../lib/values/deprecated-colors.js')
const { definitions: dimensions } = require('../lib/values/dimensions.js')
const fs = require('node:fs/promises')
const logical = require('../lib/properties/logical.js')
const { listAll } = require('./webref.js')
const namedColors = require('../lib/values/named-colors.js')
const shorthands = require('../lib/properties/shorthands.js')
const structures = require('../lib/values/structures.js')
const systemColors = require('../lib/values/system-colors.js')
const terminals = require('../lib/parse/terminals.js')

const logicalGroups = Object.keys(logical)

const outputPaths = {
    descriptors: resolve(join(__dirname, '..', 'lib', 'descriptors', 'definitions.js')),
    properties: resolve(join(__dirname, '..', 'lib', 'properties', 'definitions.js')),
    types: resolve(join(__dirname, '..', 'lib', 'values', 'definitions.js')),
}

const header = `\n// Generated from ${__filename}\n\nmodule.exports = {\n`

const excludedTypes = [
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
    ...structures,
    ...Object.keys(terminals),
    // Aliases (defined in prose)
    ...compatibility.values.aliases.keys(),
    // https://github.com/w3c/csswg-drafts/issues/7301
    'length-percentages',
]

/* eslint-disable sort-keys */

const initialTypes = {
    // Custom types
    'css-wide-keyword': cssWideKeywords.join(' | '),
    // TODO: report @webref/css issue "`value` written in prose and not extracted"
    'absolute-size': 'xx-small | x-small | small | medium | large | x-large | xx-large',
    'content-level': 'element | content | text | attr(<custom-ident>) | <counter()> | <counters()>',
    'q-name': '<wq-name>',
    'relative-size': 'larger | smaller',
    'x': '<number>',
    'y': '<number>',
}

const replaced = {
    descriptors: {
        '@color-profile': {
            // https://github.com/w3c/webref/issues/707
            'components': {
                initial: '',
            },
            'src': {
                initial: '',
            },
        },
        '@counter-style': {
            // https://github.com/w3c/csswg-drafts/issues/7417
            'negative': {
                initial: '"-"',
            },
            'prefix': {
                initial: '""',
            },
            'suffix': {
                initial: '". "',
            },
            // https://github.com/w3c/webref/issues/707
            'additive-symbols': {
                initial: '',
            },
            'symbols': {
                initial: '',
            },
        },
        '@font-face': {
            // https://github.com/w3c/csswg-drafts/issues/7418
            'font-size': {
                value: 'auto | normal | [<number>]{1,2}',
            },
            'src': {
                initial: '',
            },
            // https://github.com/w3c/webref/issues/707
            'font-family': {
                initial: '',
            },
        },
        '@font-palette-values': {
            // https://github.com/w3c/webref/issues/707
            'base-palette': {
                initial: '',
            },
            'font-family': {
                initial: '',
            },
            'override-colors': {
                initial: '',
            },
        },
        '@property': {
            // https://github.com/w3c/webref/issues/707
            'inherits': {
                initial: '',
            },
            'initial-value': {
                initial: '',
            },
            'syntax': {
                initial: '',
            },
        },
    },
    properties: {
        // Implementation dependent
        'font-family': { initial: 'monospace' },
        'glyph-orientation-vertical': { initial: 'auto' },
        'voice-family': { initial: 'female' },
        // https://github.com/w3c/fxtf-drafts/issues/451
        'background-blend-mode': { value: "<'mix-blend-mode'>#" },
        // https://github.com/w3c/csswg-drafts/issues/7366
        'border-end-end-radius': { initial: '0' },
        'border-end-start-radius': { initial: '0' },
        'border-start-end-radius': { initial: '0' },
        'border-start-start-radius': { initial: '0' },
        // https://github.com/w3c/csswg-drafts/issues/7367
        'border-limit': { value: 'all | round | [sides | corners] <length-percentage [0,∞]>? | [top | right | bottom | left] <length-percentage [0,∞]>' },
        // https://github.com/w3c/csswg-drafts/issues/7350
        'clear': { value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both-inline | both-block | both | all | none' },
        // https://github.com/w3c/csswg-drafts/issues/7219
        'clip': { value: 'rect(<top>, <right>, <bottom>, <left>) | auto' },
        // https://github.com/w3c/csswg-drafts/issues/6744#issuecomment-1059172827
        'contain': { value: 'none | strict | content | [[size | inline-size] || layout || style || paint]' },
        // https://github.com/w3c/csswg-drafts/issues/7351
        'content': { value: 'normal | none | [<content-replacement> | <content-list>] [/ [<string> | <counter>]+]? | <element()>' },
        'position': { value: 'static | relative | absolute | sticky | fixed | running(<custom-ident>)' },
        // https://github.com/w3c/csswg-drafts/issues/7700
        'outline': { value: "<'outline-width'> || <'outline-style'> || <'outline-color'>" },
        // https://github.com/w3c/csswg-drafts/issues/7352
        'shape-padding': { initial: '0', value: '<length-percentage>' },
        // https://github.com/w3c/svgwg/issues/888
        'stop-color': { initial: 'black', value: "<'color'>" },
        'stop-opacity': { initial: '1', value: "<'opacity'>" },
        // TODO: report spec issue "invalid quotes to define non-terminal referencing `opacity`"
        'fill-opacity': { value: "<'opacity'>" },
        'stroke-opacity': { value: "<'opacity'>" },
    },
    types: {
        // https://github.com/w3c/csswg-drafts/issues/7368
        'content-list': '[<string> | <content()> | contents | <image> | <counter> | <quote> | <target> | <leader()>]+',
        // https://github.com/w3c/csswg-drafts/issues/7016
        'general-enclosed': '<function> | (<ident> <any-value>)',
        'pseudo-class-selector': "':' <ident> | ':' <function>",
        // https://github.com/w3c/fxtf-drafts/issues/411
        'path()': "path(<'fill-rule'>?, <string>)",
        // TODO: support new grammars from CSS Images 4
        'conic-gradient()': 'conic-gradient([from <angle>]? [at <position>]?, <angular-color-stop-list>)',
        'linear-gradient()': 'linear-gradient([<angle> | to <side-or-corner>]?, <color-stop-list>)',
        'radial-gradient()': 'radial-gradient([<ending-shape> || <size>]? [at <position>]?, <color-stop-list>)',
        // TODO: support new grammars from CSS Color 5
        'color()': 'color(<colorspace-params> [/ [<alpha-value> | none]]?)',
        'hsl()': 'hsl([<hue> | none] [<percentage> | none] [<percentage> | none] [/ [<alpha-value> | none]]?)',
        'hwb()': 'hwb([<hue> | none] [<percentage> | none] [<percentage> | none] [/ [<alpha-value> | none]]?)',
        'lab()': 'lab([<percentage> | <number> | none] [<percentage> | <number> | none] [<percentage> | <number> | none] [/ [<alpha-value> | none]]?)',
        'lch()': 'lch([<percentage> | <number> | none] [<percentage> | <number> | none] [<hue> | none] [/ [<alpha-value> | none]]?)',
        'oklab()': 'oklab([<percentage> | <number> | none] [<percentage> | <number> | none] [<percentage> | <number> | none] [/ [<alpha-value> | none] ]?)',
        'oklch()': 'oklch([<percentage> | <number> | none] [<percentage> | <number> | none] [<hue> | none] [/ [<alpha-value> | none]]?)',
        'rgb()': 'rgb([<percentage> | none]{3} [/ [<alpha-value> | none]]?) | rgb([<number> | none]{3} [/ [<alpha-value> | none]]?)',
        // Written in prose
        'age': 'child | young | old',
        'basic-shape': '<basic-shape-rect> | <circle()> | <ellipse()> | <polygon()> | <path()>',
        'bottom': '<length> | auto',
        'counter-name': '<custom-ident>',
        'counter-style-name': '<custom-ident>',
        'custom-highlight-name': '<ident>',
        'deprecated-color': deprecatedColors.join(' | '),
        'dimension-unit': `"%" | ${[...dimensions.values()].flatMap(({ units }) => units).join(' | ')}`,
        'end-value': '<number> | <dimension> | <percentage>',
        'ending-shape': 'circle | ellipse',
        'extension-name': '<dashed-ident>',
        'family-name': '<string> | <custom-ident>',
        'gender': 'male | female | neutral',
        'generic-family': 'cursive | emoji | fangsong | fantasy | math | monospace | sans-serif | serif | system-ui | ui-monospace | ui-rounded | ui-sans-serif | ui-serif',
        'hsla()': 'hsla([<hue> | none] [<percentage> | none] [<percentage> | none] [/ [<alpha-value> | none]]?)',
        'id': '<id-selector>',
        'lang': '<ident> | <string>',
        'left': '<length> | auto',
        'mix()': "mix(<percentage> ';' <start-value> ';' <end-value>)",
        'mq-boolean': '<integer [0,1]>',
        'named-color': namedColors.join(' | '),
        'outline-line-style': 'none | dotted | dashed | solid | double | groove | ridge | inset | outset | auto',
        'page-size': 'A5 | A4 | A3 | B5 | B4 | JIS-B5 | JIS-B4 | letter | legal | ledger',
        'palette-identifier': '<custom-ident>',
        'quirky-color': '<number-token> | <ident-token> | <dimension-token>',
        'quirky-length': '<number-token>',
        'repeat()': 'repeat([<integer [1,∞]> | auto-fill | auto-fit], <track-list>)',
        'repeating-conic-gradient()': 'repeating-conic-gradient([from <angle>]? [at <position>]?, <angular-color-stop-list>)',
        'repeating-linear-gradient()': 'repeating-linear-gradient([<angle> | to <side-or-corner>]?, <color-stop-list>)',
        'repeating-radial-gradient()': 'repeating-radial-gradient([<ending-shape> || <size>]? [at <position>]?, <color-stop-list>)',
        'rgba()': 'rgba([<percentage> | none]{3} [/ [<alpha-value> | none]]?) | rgba([<number> | none]{3} [/ [<alpha-value> | none]]?)',
        'right': '<length> | auto',
        'scope-end': '<forgiving-selector-list>',
        'scope-start': '<forgiving-selector-list>',
        'shape': "rect(<'top'>, <'right'>, <'bottom'>, <'left'>)",
        'size-feature': '<media-feature>',
        'src()': 'src(<string> <url-modifier>*)',
        'style-feature': '<declaration>',
        'start-value': '<number> | <dimension> | <percentage>',
        'system-color': systemColors.join(' | '),
        'target-name': '<string>',
        'toggle()': "toggle(<toggle-value> [';' <toggle-value>]+)",
        'top': '<length> | auto',
        'transform-function': '<matrix()> | <translate()> | <translateX()> | <translateY()> | <scale()> | <scaleX()> | <scaleY()> | <rotate()> | <skew()> | <skewX()> | <skewY()>',
        'uri': '<url>',
        'url()': 'url(<string> <url-modifier>*)',
        'url-modifier': '<custom-ident> | <function>',
        'url-set': '<image-set()>',
    },
}

/**
 * Definitions existing in different specifications and which are ignored for
 * the corresponding specification.
 */
const excluded = {
    descriptors: {},
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
            // Prefer definition from CSS Images
            'image-rendering',
            // Prefer definition from CSS Sizing
            'inline-size',
            // Prefer definition from CSS Shapes
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
            // https://github.com/w3c/csswg-drafts/issues/6744#issuecomment-1059172827
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
            // Prefer definition from SVG
            'pointer-events',
        ],
        'fill-stroke': [
            // Prefer definitions from SVG
            'fill',
            'fill-opacity',
            'fill-rule',
            'stroke',
            'stroke-dasharray',
            'stroke-dashoffset',
            'stroke-linecap',
            'stroke-linejoin',
            'stroke-miterlimit',
            'stroke-opacity',
            'stroke-width',
        ],
        'scroll-animations': [
            // TODO: support new grammars from Scroll Animations 1 (to be moved in CSS Animations 2)
            'animation-delay',
            'animation-delay-end',
            'animation-delay-start',
            'animation-range',
        ],
        'svg-strokes': [
            // Superseded by Fill Stroke
            'stroke',
            'stroke-dasharray',
            'stroke-dashoffset',
            'stroke-linecap',
            'stroke-linejoin',
            'stroke-miterlimit',
            'stroke-opacity',
            'stroke-width',
        ],
    },
    types: {
        'CSS': [
            // Obsoleted by CSS Backgrounds
            'border-style',
            'border-width',
            // Obsoleted by CSS Box Model
            'margin-width',
            'padding-width',
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
        'css-backgrounds-4': [
            // https://github.com/w3c/csswg-drafts/issues/7376
            'position',
        ],
        'css-conditional-5': [
            // Duplicate of CSS Fonts
            'font-tech',
        ],
        'css-gcpm': [
            // Prefer definitions from CSS Generated Content
            'content()',
            'string()',
        ],
        'css-images-4': [
            // https://github.com/w3c/csswg-drafts/issues/1981
            'element()',
        ],
        'css-masking': [
            // Superseded by CSS Shapes
            'rect()',
        ],
        'fill-stroke': [
            // Prefer definition from SVG
            'paint',
        ],
        'filter-effects': [
            // Duplicate of CSS Values
            'url',
        ],
        'motion': [
            // https://github.com/w3c/fxtf-drafts/issues/411
            'path()',
        ],
        'scroll-animations': [
            // TODO: support new grammars from Scroll Animations 1 (to be moved in CSS Animations 2)
            'keyframe-selector',
            'timeline-range-name',
        ],
        'svg-strokes': [
            // Superseded by SVG
            'dasharray',
        ],
    },
}

/* eslint-enable sort-keys */

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
 * It removes extra whitespaces and groups (angled brackets).
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
        (string, [property, { initial, value }, key]) => {
            string += `${tab(1)}${addQuotes(property)}: {\n`
            if (!shorthands.has(property)) {
                const group = logicalGroups.find(group => logical[group].some(mapping => mapping.includes(property)))
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
            definitions.sort(sortByName).forEach(([descriptor, { initial, value }]) => {
                string += `${tab(2)}${addQuotes(descriptor)}: {\n`
                if (initial) {
                    string += `${tab(3)}initial: ${addQuotes(initial)},\n`
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
 * @param {string[][]} types [[type, value, key]]
 * @param {object} definitions
 * @param {string} key
 */
function addTypes(types, definitions = {}, key) {
    const { types: { [key]: skip = [] } } = excluded
    Object.entries(definitions).forEach(([type, { value }]) => {
        // `<type>` -> `type`
        type = type.slice(1, -1)
        if (excludedTypes.includes(type) || replaced.types[type] || skip.includes(type)) {
            return
        }
        if (initialTypes[type]) {
            console.error(`The type "${type}" (manually defined) is now extracted from: ${key}`)
            return
        }
        const entry = types.find(([name]) => name === type)
        if (entry) {
            const [base1, v1 = 1] = entry[2].split(/-(\d)$/)
            const [base2, v2 = 1] = key.split(/-(\d)$/)
            if (base1 !== base2) {
                throw Error(`Unhandled duplicate definitions for the type "${type}"`)
            }
            if (v1 < v2) {
                entry.splice(1, 2, value, key)
            }
        } else {
            types.push([type, value, key])
        }
    })
}

/**
 * @param {*[][]} properties [[property, definition, key]]
 * @param {object} definitions
 * @param {string} key
 */
function addProperties(properties, definitions = {}, key) {
    const { properties: { aliases, mappings } } = compatibility
    const { properties: { [key]: skip = [] } } = excluded
    Object.entries(definitions).forEach(([property, definition]) => {
        if (aliases.has(property) || mappings.has(property) || skip.includes(property)) {
            return
        }
        const { properties: { [property]: replacement } } = replaced
        if (replacement) {
            definition = { ...definition, ...replacement }
        }
        const entry = properties.find(([name]) => name === property)
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
                throw Error(`Unhandled duplicate definitions for the property "${property}"`)
            } else if (v1 < v2) {
                entry.splice(1, 2, definition, key)
            }
        } else {
            properties.push([property, definition, key])
        }
    })
}

/**
 * @param {*[][]} descriptors [[rule, [[descriptor, definition, key]]]]
 * @param {object} definitions
 * @param {string} key
 */
function addDescriptors(descriptors, definitions = {}, key) {
    const { descriptors: { aliases, mappings } } = compatibility
    Object.entries(definitions).forEach(([rule, { descriptors: definitions }]) =>
        definitions.forEach(({ initial = '', name, value }) => {
            if (aliases.has(name) || mappings.has(name)) {
                return
            }
            const replacement = replaced.descriptors[rule]?.[name]
            if (replacement) {
                ({ initial = initial, value = value } = replacement)
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
                        throw Error(`Unhandled duplicate definitions for the descriptor "${name}"`)
                    }
                    if (v2 < v1) {
                        return
                    }
                    context.splice(rule.indexOf(entry), 1)
                }
                entries.push([name, { initial, value }, key])
            } else {
                descriptors.push([rule, [[name, { initial, value }, key]]])
            }
        }))
}

/**
 * @param {object} specifications
 * @returns {Promise}
 */
function build(specifications) {

    const descriptors = []
    const properties = []
    const types = [...Object.entries(initialTypes), ...Object.entries(replaced.types)]

    Object.entries(specifications).forEach(([key, definition]) => {
        addDescriptors(descriptors, definition.atrules, key)
        addProperties(properties, definition.properties, key)
        addTypes(types, definition.valuespaces, key)
    })

    return Promise.all([
        fs.writeFile(outputPaths.descriptors, `${header}${serializeDescriptors(descriptors.sort(sortByName))}}\n`),
        fs.writeFile(outputPaths.properties, `${header}${serializeProperties(properties.sort(sortByName))}}\n`),
        fs.writeFile(outputPaths.types, `${header}${serializeTypes(types.sort(sortByName))}}\n`),
    ])
}

listAll().then(build).catch(logError)
