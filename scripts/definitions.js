/**
 * This script generates:
 * - `./lib/values/types.js`: CSS type definitions
 * - `./lib/properties/definitions.js`: CSS property definitions (`value` and
 * `initial` fields)
 *
 * Definitions are extracted by `@webref/css` from latest W3C Editor's Drafts
 * specifications.
 */
const { addQuotes, logError, tab } = require('../lib/utils/script.js')
const { aliases: webKitAliases, propertyMap } = require('../lib/properties/webkit.js')
const fs = require('fs')
const { listAll } = require('@webref/css')
const namedColors = require('../lib/values/namedColors.js')
const path = require('path')
const systemColors = require('../lib/values/systemColors.js')

const outputPaths = {
    properties: path.resolve(__dirname, '../lib/properties/definitions.js'),
    type: path.resolve(__dirname, '../lib/values/types.js'),
}
const header = `// Generated from ${__filename}`

// Properties/types missing from specifications or customs
const initial = {
    properties: {},
    types: {
        // Legacy types
        'hsla()': '<hsl()>',
        'rgba()': '<rgb()>',
        // Implicit types
        'repeating-conic-gradient()': '<conic-gradient()>',
        'repeating-linear-gradient()': '<linear-gradient()>',
        'repeating-radial-gradient()': '<radial-gradient()>',
        // Custom types
        'css-wide-keyword': 'inherit | initial | revert | unset',
        'math-function': '<calc()> | <min()> | <max()> | <clamp()> | <round()> | <mod()> | <rem()> | <sin()> | <cos()> | <tan()> | <asin()> | <acos()> | <atan()> | <atan2()> | <pow()> | <sqrt()> | <hypot()> | <log()> | <exp()> | <abs()> | <sign()>',
        // TODO: report spec issue "the grammar of `url()` is missing `<function-token>`"
        'url-modifier': '<custom-ident>',
        // TODO: report @webref/css issue related to missing type definitions (written in prose)
        'absolute-size': 'xx-small | x-small | small | medium | large | x-large | xx-large',
        'basic-shape': '<inset()> | <circle()> | <ellipse()> | <polygon()> | <path()>',
        'bottom': '<length> | auto',
        'colorspace-params': '<custom-params> | <predefined-rgb-params> | <xyz-params>',
        'content-level': 'element | content | text',
        'counter-name': '<custom-ident>',
        'counter-style-name': '<custom-ident>',
        'custom-params': '<dashed-ident> [ <number> | <percentage> ]#',
        'dimension': '<length> | <time> | <frequency> | <resolution> | <angle>',
        'dimension-unit': '"%" | <angle> | <flex> | <frequency> | <length> | <time>',
        'extent-keyword': 'closest-corner | closest-side | farthest-corner | farthest-side',
        'lang': '<ident> | <string>',
        'left': '<length> | auto',
        'named-color': namedColors.join(' | '),
        'outline-line-style': '<line-style> | auto',
        'predefined-rgb-params': '<predefined-rgb> [ <number> | <percentage> ]{3}',
        'predefined-rgb': 'srgb | display-p3 | a98-rgb | prophoto-rgb | rec2020',
        'relative-size': 'larger | smaller',
        'right': '<length> | auto',
        'rounding-strategy': 'nearest | up | down | to-zero',
        'system-color': systemColors.join(' | '),
        'top': '<length> | auto',
        'transform-function': '<matrix()> | <translate()> | <translateX()> | <translateY()> | <scale()> | <scaleX()> | <scaleY()> | <rotate()> | <skew()> | <skewX()> | <skewY()>',
        'x': '<number>',
        'xyz-params': 'xyz <number>{3}',
        'y': '<number>',
        // TODO: report spec issue "replace `<uri>` by `<url-token>`"
        'uri': '<url-token>',
        // TODO: report spec issue "replace `<number-percentage>` by `<number> | <percentage>`"
        'number-percentage': '<number> | <percentage>',
    },
}

// Overriden properties/types
const replaced = {
    properties: {
        // Implementation dependent
        'font-family': { initial: 'monospace' },
        'voice-family': { initial: 'female' },
        // TODO: resolve to inital `background-position-x` or `background-position-y` depending on `writing-mode`
        'background-position-block': { initial: '0%' },
        'background-position-inline': { initial: '0%' },
        // TODO: report @webref/css issue related to missing field values (written in prose)
        '-webkit-line-clamp': {
            initial: 'see individual properties',
            value: 'none | <integer>',
        },
        'stop-color': {
            initial: 'black',
            value: "<'color'>",
        },
        'stop-opacity': {
            initial: '1',
            value: "<'opacity'>",
        },
        // TODO: report spec issue "replace initial value by `see individual properties`"
        // 'background-position': {
        //     initial: 'see individual properties',
        // },
        'fill': { initial: 'see individual properties' },
        'line-clamp': { initial: 'see individual properties' },
        'stroke': {
            initial: 'see individual properties',
            // TODO: figure out the meaning of `"<'background'> with modifications"`
            value: "<'background'>",
        },
        'text-decoration': { initial: 'see individual properties' },
        // TODO: report spec issue "replace `same as border-top-left-radius` by the initial value of `border-top-left-radius`"
        'border-start-start-radius': { initial: '0' },
        'border-start-end-radius': { initial: '0' },
        'border-end-start-radius': { initial: '0' },
        'border-end-end-radius': { initial: '0' },
        // TODO: report spec issue "replace `n/a` by `auto` (defined in SVG 1.1)"
        'glyph-orientation-vertical': { initial: 'auto' },
        // TODO: report spec issue "the grammar of `-webkit-background-clip` is missing `none`"
        '-webkit-background-clip': { value: 'border-box | padding-box | content-box | text | none' },
        'shape-padding': { value: '<length> | none' },
        // TODO: report spec issue "the grammar of `border-limit` is missing `round`"
        'border-limit': { value: 'all | round | [sides | corners] <length-percentage [0,∞]>? | [top | right | bottom | left] <length-percentage [0,∞]>' },
        // TODO: report spec issue "the grammar of `white-space` is missing `auto`"
        'white-space': { value: 'normal | pre | nowrap | pre-wrap | break-spaces | pre-line | auto' },
        // TODO: report spec issue "the grammar of `clear` is missing `both`"
        'clear': { value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both | none' },
        // TODO: report spec issue "the grammar of `flow-into` is missing whitespaces"
        'flow-into': { value: 'none | <ident> [element | content]?' },
    },
    types: {
        // Written in prose
        'age': 'child | young | old',
        'ending-shape': 'circle | ellipse',
        'family-name': '<string> | <custom-ident>',
        'gender': 'male | female | neutral',
        'generic-family': 'cursive | emoji | fangsong | fantasy | math | monospace | sans-serif | serif | system-ui | ui-monospace | ui-rounded | ui-sans-serif | ui-serif',
        'id': '<id-selector>',
        'page-size': 'A5 | A4 | A3 | B5 | B4 | JIS-B5 | JIS-B4 | letter | legal | ledger',
        'palette-identifier': '<custom-ident>',
        'shape': "rect(<'top'>, <'right'>, <'bottom'>, <'left'>)",
        'target-name': '<string>',
        // Written in prose and modified to fix https://github.com/w3c/csswg-drafts/issues/6425
        'size': 'closest-side | closest-corner | farthest-side | farthest-corner | sides | <length-percentage [0,∞]>{1,2}',
        // Modified to be consistent with `polygon()`
        'path()': "path(<'fill-rule'>? , <string>)",
        // Modified to include legacy `<url-token>`
        'url': '<url-token> | url(<string> <url-modifier>*) | src(<string> <url-modifier>*)',
        /**
         * TODO: report spec issue "define grammars with explicit channel keywords" (CSS Color 5)
         * TODO: report spec issue "replace `<number-percentage>` by `<number> | <percentage>`"
         *
         * CSS Color 5: color([from <color>]? <colorspace-params> [/ <alpha-value>]?)
         * CSS Color 4: color([<ident> | <dashed-ident>] [<number-percentage>+] [/ <alpha-value>]?)
         * CSS Color 4 + fix of `<number-percentage>`:
         */
        'color()': 'color([<ident> | <dashed-ident>] [<number> | <percentage>]+ [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: hsl([from <color>]? <hue> <percentage> <percentage> [/ <alpha-value>]?)
         * CSS Color 4 + legacy definition (comma-separated arguments):
         */
        'hsl()': 'hsl(<hue> <percentage> <percentage> [/ <alpha-value>]? | <hue> , <percentage> , <percentage> , <alpha-value>?)',
        /**
         * TODO: report spec issue "define grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: hwb([from <color>]? <hue> <percentage> <percentage> [/ <alpha-value>]?)
         * CSS Color 4:
         */
        'hwb()': 'hwb(<hue> <percentage> <percentage> [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: lab([from <color>]? <percentage> <number> <number> [/ <alpha-value>]?)
         * CSS Color 4:
         */
        'lab()': 'lab(<percentage> <number> <number> [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: lch([from <color>]? <percentage> <number> <hue> [/ <alpha-value>]?)
         * CSS Color 4:
         */
        'lch()': 'lch(<percentage> <number> <hue> [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define grammars with explicit channel keywords" (CSS Color 5)
         * TODO: handle repeated function name in definition value
         *
         * CSS Color 5: rgb(<percentage>{3} [/ <alpha-value>]?) | rgb(<number>{3} [/ <alpha-value>]?) | rgb([from <color>]? [<number> | <percentage>]{3} [/ <alpha-value>]?)
         * CSS Color 4: rgb(<percentage>{3} [/ <alpha-value>]?) | rgb(<number>{3} [/ <alpha-value>]?)
         * CSS Color 4 + legacy definition (comma-separated arguments) + fix to handle repeated function name
         */
        'rgb()': 'rgb(<percentage>{3} [/ <alpha-value>]? | <number>{3} [/ <alpha-value>]? | <percentage>#{3} , <alpha-value>? | <number>#{3} , <alpha-value>?)',
        // TODO: report spec issue "the grammar of `blend-mode` is missing a space before `color-burn`"
        'blend-mode': 'normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity',
        // TODO: report spec issue "the grammar of `content-list` is missing `content()`
        'content-list': '[<string> | <content()> | contents | <image> | <counter> | <quote> | <target> | <leader()>]+',
        // TODO: fix https://github.com/w3c/webref/issues/333
        'selector()': 'selector(<id-selector>)',
        // TODO: fix https://github.com/w3c/csswg-drafts/issues/6425
        'angular-color-stop-list': '<angular-color-stop> , [<angular-color-hint>? , <angular-color-stop>]#?',
        'color-stop-list': '<linear-color-stop> , [<linear-color-hint>? , <linear-color-stop>]#?',
    },
}

const aliases = [
    ['column-gap', ['grid-column-gap']],
    ['gap', ['grid-gap']],
    ['row-gap', ['grid-row-gap']],
].concat(webKitAliases.map(property => [property, [`-webkit-${property}`]]))

// Add mapped webkit properties to aliases
Object.entries(propertyMap).forEach(([property, target]) => {
    const map = aliases.find(([property]) => property === target)
    if (map) {
        const [, aliases] = map
        aliases.push(`-webkit-${property}`)
    } else {
        const map = [property, [`-webkit-${property}`]]
        aliases.push(map)
    }
})

const terminals = ['EOF-token', 'length', 'percentage']

/**
 * @param {*[]} entries
 * @returns {string}
 *
 * PropertyDefinition => [
 *   String,
 *   {
 *     initial: String|[[String, URL]],
 *     newValues: String|[[String, URL]],
 *     value: String|[[String, URL]],
 *   }
 * ]
 * TypeDefinition => [String, String|[[String, URL]]]
 */
function serializeEntries(entries, depth = 1) {
    return entries.reduce((string, [key, value]) => {
        const tabs = tab(depth)
        // [[String, URL]]
        if (Array.isArray(value)) {
            const altTabs = tab(depth + 1)
            const altValueTabs = tab(depth + 2)
            const alts = value
                .map(alt => `[\n${altValueTabs}${alt.map(addQuotes).join(`,\n${altValueTabs}`)},\n${altTabs}]`)
                .join(`,\n${altTabs}`)
            return `${string}${tabs}${key}: [\n${altTabs}${alts},\n${tabs}],\n`
        }
        return `${string}${tabs}${key}: ${addQuotes(value)},\n`
    }, '')
}

/**
 * @param {*[]} definitions
 * @returns {string}
 */
function serializeProperties(definitions) {
    return definitions.reduce(
        (string, [property, fields]) => {
            const tabs = tab(1)
            property = addQuotes(property)
            fields = serializeEntries(fields.sort(sortByName), 2)
            return `${string}${tabs}${property}: {\n${fields}${tabs}},\n`
        },
        '')
}

/**
 * @param {*[]} definitions
 * @returns {string}
 */
function serializeTypes(definitions) {
    return definitions.reduce(
        (string, [type, [[, value]]]) =>
            `${string}${serializeEntries([[addQuotes(type), value]])}`,
        '')
}

/**
 * @param {*[]} aa
 * @param {*[]} bb
 * @returns {number}
 */
function sortByName([a], [b]) {
    let left = a.charCodeAt(0)
    let right = b.charCodeAt(0)
    let i = 0
    while (left === right) {
        left = ++i < a.length ? a.charCodeAt(i) : 0
        right = i < b.length ? b.charCodeAt(i) : 0
    }
    return left - right
}

/**
 * @param {*[]} definition [PropertyName, { [Field]: String }]
 * @returns {*[]}
 */
function concatNewValues(definition) {
    const [name, fields] = definition
    let newValues
    let value
    fields.forEach(([field, v]) => {
        if (field === 'newValues' && typeof v === 'string') {
            newValues = v
        } else if (field === 'value' && typeof v === 'string') {
            value = v
        }
    })
    // TODO: `value` and `newValues` should be a single `String` at this point
    if (!value || !newValues) {
        return definition
    }
    const newAlternatives = newValues.split(' | ')
    const currentAlternatives = value.split(' | ')
    if (newAlternatives.every(alt => currentAlternatives.some(value => value.includes(alt)))) {
        // `value` already includes `newValues`: remove `newValues`
        return [name, fields.filter(([field]) => field !== 'newValues')]
    } else if (newAlternatives.every(alt => currentAlternatives.every(value => value !== alt))) {
        // `value` is missing all `newValues`: append them to `value` and remove `newValues`
        return [
            name,
            fields.reduce((fields, [field, value]) => {
                if (field === 'initial') {
                    fields.push(['initial', value])
                } else if (field === 'value') {
                    fields.push(['value', value += ` | ${newValues}`])
                }
                return fields
            }, []),
        ]
    }
    return definition
}

/**
 * @param {*[]} definition
 * @returns {*[]}
 */
function flattenFieldValues([name, fields]) {
    return [name, fields.map(([field, values]) => {
        if (values.length === 1) {
            const [[value]] = values
            return [field, value]
        }
        console.error(`"${name}" has still multiple "${field}" values.`)
        return [field, values]
    })]
}

/**
 * @param {string} url
 * @param {string[]} values
 * @returns {boolean}
 */
function isOutdatedSpecification(url, values) {
    return url === 'https://drafts.csswg.org/css2/'
        || url === 'https://svgwg.org/svg2-draft/'
        || (url === 'https://drafts.csswg.org/css-logical-1/' && values.some(([, url]) =>
            url === 'https://drafts.csswg.org/css-position/'))
        || (url === 'https://drafts.csswg.org/css-flexbox-1/' && values.some(([, url]) =>
            url === 'https://drafts.csswg.org/css-align/'))
}

/**
 * @param {*[]} definition [PropertyName|TypeName, [[String, URL]]]
 * @returns {*[]}
 *
 * It removes a type item when type has more than one item and item URL is:
 * (1) https://drafts.csswg.org/css2/
 * (2) https://svgwg.org/svg2-draft/
 * (3) https://drafts.csswg.org/css-logical-1/ and some item URL is
 * https://drafts.csswg.org/css-position/
 * (4) https://drafts.csswg.org/css-flexbox-1/ and some item URL is
 * https://drafts.csswg.org/css-align/
 * (5) referencing a lower specification version than some other item URL
 */
function removeOutdatedFieldValues([name, fields]) {
    // TODO: flatten while iterating (reduce)
    return [
        name,
        fields.map(([field, values]) => {
            if (values.length === 1) {
                return [field, values]
            }
            return [
                field,
                values.filter(([, url], index) => {
                    // (1-5)
                    if (isOutdatedSpecification(url, values)) {
                        return false
                    }
                    // (6)
                    const [baseURL, v1 = 1] = url.slice(0, -1).split(/-(\d)$/)
                    const specUrls = values.filter(([, url], i) => i !== index && url.startsWith(baseURL))
                    for (const [, url] of specUrls) {
                        const [, v2 = 1] = url.split(/-(\d)\/$/)
                        if (v1 < v2) {
                            return false
                        }
                    }
                    return true
                }),
            ]
        }),
    ]
}

/**
 * @param {string} value
 * @returns {string}
 */
function removeExtraGroup(value) {
    if (!(value.startsWith('[') && value.endsWith(']'))) {
        return value
    }
    let depth = 0
    let i = 0
    while (++i < value.length - 2) {
        const char = value[i]
        if (char === ']' && depth-- === 0) {
            return value
        }
        if (char === '[') {
            ++depth
        }
    }
    return value.slice(1, -1)
}

/**
 * @param {string} property
 * @returns {boolean}
 */
function isAlias(property) {
    return aliases.some(([, aliases]) => aliases.some(alias => alias === property))
}

/**
 * @param {object} definitions
 * @param {string} name
 * @param {string} field
 * @param {string} value
 * @param {string} url
 */
function addFieldValue(definitions, name, field, value, url) {
    const definition = definitions.find(([property]) => property === name)
    if (definition) {
        const [, fields] = definition
        const current = fields.find(([name]) => name === field)
        if (current) {
            const [, values] = current
            // Skip duplicated field value
            if (values.every(([v]) => v !== value)) {
                values.push([value, url])
            }
        } else {
            fields.push([field, [[value, url]]])
        }
    } else {
        definitions.push([name, [[field, [[value, url]]]]])
    }
}

/**
 * @param {*[]} types
 * @param {object} definitions
 * @param {string} url
 * @returns {*[]}
 */
function extractTypeDefinitions(types, definitions, url) {
    return Object.entries(definitions).reduce((types, [type, { value }]) => {
        // Remove wrapping brackets <>
        type = type.slice(1, -1)
        // Skip terminal types
        if (terminals.includes(type)) {
            return types
        }
        const replacement = replaced.types[type]
        if (replacement) {
            value = replacement
        } else {
            // Remove extra whitespaces and angled brackets
            value = removeExtraGroup(value.replace(/([([]) | [)\]]/g, match => match.trim()))
        }
        if (value) {
            addFieldValue(types, type, 'value', value, url)
            return types
        }
        throw Error(`Missing value to replace the definition of "<${type}>" written in prose (${url})`)
    }, types)
}

/**
 * @param {*[]} properties
 * @param {object} definitions
 * @param {string} url
 * @returns {*[]}
 */
function extractPropertyDefinitions(properties, definitions, url) {
    return Object.entries(definitions).reduce((properties, [property, { initial, newValues, value }]) => {
        if (newValues) {
            addFieldValue(properties, property, 'newValues', newValues, url)
            return properties
        }
        const replacement = replaced.properties[property]
        if (replacement) {
            ({ initial = initial, value = value } = replacement)
        }
        if (isAlias(property)) {
            return properties
        } else if (!initial) {
            throw Error(`Missing "initial" field in the definition of "${property}"`)
        } else if (!value) {
            throw Error(`Missing "value" field in the definition of "${property}"`)
        }
        // Skip initial shorthand value
        if (!/(individual|shorthand)/.test(initial.toLowerCase())) {
            addFieldValue(properties, property, 'initial', initial, url)
        }
        // Remove CSS-wide keyword `inherit`
        if (url === 'https://drafts.csswg.org/css2/') {
            value = value.replace(' | inherit', '')
        }
        // Remove extra whitespaces
        value = value.replace(/([([]) | [)\]]/g, match => match.trim())
        addFieldValue(properties, property, 'value', value, url)
        return properties
    }, properties)
}

/**
 * @param {object} specifications
 * @returns {object}
 */
function build(specifications) {

    // Format initial definitions
    const initialProperties = Object.entries(initial.properties)
        .map(([property, fields]) => [
            property,
            Object.entries(fields).map(([field, value]) => [field, [[value]]]),
        ])
    const initialTypes = Object.entries(initial.types)
        .map(([type, value]) => [type, [['value', [[value]]]]])

    const [properties, types] = Object.values(specifications)
        // Extract definition fields from the list exported by `@webref/css`
        .reduce(
            ([initialProperties, initialTypes], { properties, spec: { url }, valuespaces = {} }) => [
                extractPropertyDefinitions(initialProperties, properties, url),
                extractTypeDefinitions(initialTypes, valuespaces, url),
            ],
            [initialProperties, initialTypes])
        // Cleanup definitions
        .map(definitions => definitions
            .map(removeOutdatedFieldValues)
            .map(flattenFieldValues)
            .map(concatNewValues)
            // TODO: add alias properties
            .sort(sortByName))

    const typesOuput = `\n${header}\nmodule.exports = {\n${serializeTypes(types)}}\n`
    const propertiesOuput = `\n${header}\nmodule.exports = {\n${serializeProperties(properties)}}\n`

    return Promise.all([
        fs.writeFile(outputPaths.type, typesOuput, logError),
        fs.writeFile(outputPaths.properties, propertiesOuput, logError),
    ])
}

listAll().then(build)
