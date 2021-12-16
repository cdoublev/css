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
const { aliases } = require('../lib/properties/compatibility.js')
const cssWideKeywords = require('../lib/values/cssWideKeywords.js')
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

/**
 * Terminal types
 *
 * These types are and always will be defined only in prose and therefore can
 * not but be replaced by a definition using the CSS syntax.
 */
const terminals = ['EOF-token', 'integer', 'length', 'percentage']

/**
 * Legacy, custom, or missing type definitions
 *
 * Missing type definitions are defined in prose in specifications instead of
 * with the CSS syntax.
 *
 * Legacy and extended types are only defined in prose in specifications. They
 * should be supported either as simple aliases with an identical behavior than
 * the target type (legacy types), or with a specific behavior (extended types).
 *
 * Custom types are only defined in this library, to simplify parsing.
 *
 * This map is normalized into entries of multi-value field entries for further
 * processing.
 */
const initialTypes = Object.entries({
    // Legacy types
    'hsla()': '<hsl()>',
    'rgba()': '<rgb()>',
    // Extended types
    'repeating-conic-gradient()': '<conic-gradient()>',
    'repeating-linear-gradient()': '<linear-gradient()>',
    'repeating-radial-gradient()': '<radial-gradient()>',
    // Custom types
    'css-wide-keyword': cssWideKeywords.join(' | '),
    'math-function': '<calc()> | <min()> | <max()> | <clamp()> | <round()> | <mod()> | <rem()> | <sin()> | <cos()> | <tan()> | <asin()> | <acos()> | <atan()> | <atan2()> | <pow()> | <sqrt()> | <hypot()> | <log()> | <exp()> | <abs()> | <sign()>',
    // TODO: report @webref/css issue related to missing definitions (written in prose)
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
    'system-color': systemColors.join(' | '),
    'top': '<length> | auto',
    'transform-function': '<matrix()> | <translate()> | <translateX()> | <translateY()> | <scale()> | <scaleX()> | <scaleY()> | <rotate()> | <skew()> | <skewX()> | <skewY()>',
    'url-modifier': '<custom-ident> | <function-token>',
    'x': '<number>',
    'xyz-params': 'xyz <number>{3}',
    'y': '<number>',
    // TODO: report spec issue "replace `<number-percentage>` by `<number> | <percentage>`"
    'number-percentage': '<number> | <percentage>',
    // TODO: report spec issue "replace `<uri>` by `<url-token>`"
    'uri': '<url-token>',
}).map(([type, value]) => [type, [['value', [[value]]]]])

/**
 * Overriden property/type definitions
 */
const replaced = {
    properties: {
        // Implementation dependent
        'font-family': { initial: 'monospace' },
        'voice-family': { initial: 'female' },
        // TODO: resolve to inital `background-position-x` or `background-position-y` depending on `writing-mode`
        'background-position-block': { initial: '0%' },
        'background-position-inline': { initial: '0%' },
        // TODO: report @webref/css issue related to missing definitions (written in prose)
        'stop-color': {
            initial: 'black',
            value: "<'color'>",
        },
        'stop-opacity': {
            initial: '1',
            value: "<'opacity'>",
        },
        // TODO: report spec issue "replace `n/a` by `auto` (defined in SVG 1.1)"
        'glyph-orientation-vertical': { initial: 'auto' },
        // TODO: report spec issue "replace `same as border-top-left-radius` by the initial value of `border-top-left-radius`"
        'border-start-start-radius': { initial: '0' },
        'border-start-end-radius': { initial: '0' },
        'border-end-start-radius': { initial: '0' },
        'border-end-end-radius': { initial: '0' },
        // TODO: report spec issue "replace initial value by `see individual properties`"
        'line-clamp': { initial: 'see individual properties' },
        'text-decoration': { initial: 'see individual properties' },
        // TODO: report spec issue "the grammar of `-webkit-background-clip` is missing `none`"
        '-webkit-background-clip': { value: 'border-box | padding-box | content-box | text | none' },
        // TODO: report spec issue "the grammar of `border-limit` is missing `round`"
        'border-limit': { value: 'all | round | [sides | corners] <length-percentage [0,∞]>? | [top | right | bottom | left] <length-percentage [0,∞]>' },
        // TODO: report spec issue "the grammar of `clear` is missing `both`"
        'clear': { value: 'inline-start | inline-end | block-start | block-end | left | right | top | bottom | both | none' },
        // TODO: report spec issue "the grammar of `flow-into` is missing whitespaces"
        'flow-into': { value: 'none | <ident> [element | content]?' },
        // TODO: report spec issue "the grammar of `shape-padding` is missing `none`"
        'shape-padding': { value: '<length> | none' },
        // TODO: report spec issue "the grammar of `white-space` is missing `auto`"
        'white-space': { value: 'normal | pre | nowrap | pre-wrap | break-spaces | pre-line | auto' },
        // TODO: support new border syntax from Background 4
        'border-bottom-color': { value: '<color>' },
        'border-left-color': { value: '<color>' },
        'border-right-color': { value: '<color>' },
        'border-top-color': { value: '<color>' },
    },
    types: {
        // Modified to be consistent with `polygon()`
        'path()': "path(<'fill-rule'>? , <string>)",
        // Modified to include legacy `<url-token>`
        'url': '<url-token> | url(<string> <url-modifier>*) | src(<string> <url-modifier>*)',
        // TODO: fix https://github.com/w3c/webref/issues/333
        'selector()': 'selector(<id-selector>)',
        // TODO: fix https://github.com/w3c/csswg-drafts/issues/6425
        'angular-color-stop-list': '<angular-color-stop> , [<angular-color-hint>? , <angular-color-stop>]#?',
        'color-stop-list': '<linear-color-stop> , [<linear-color-hint>? , <linear-color-stop>]#?',
        /**
         * TODO: report spec issue "define color function grammars with explicit channel keywords" (CSS Color 5)
         * TODO: report spec issue "replace `<number-percentage>` by `<number> | <percentage>`"
         *
         * CSS Color 5: color([from <color>]? <colorspace-params> [/ <alpha-value>]?)
         * CSS Color 4: color([<ident> | <dashed-ident>] [<number-percentage>+] [/ <alpha-value>]?)
         * CSS Color 4 + fix of `<number-percentage>`:
         */
        'color()': 'color([<ident> | <dashed-ident>] [<number> | <percentage>]+ [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define color function grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: hsl([from <color>]? <hue> <percentage> <percentage> [/ <alpha-value>]?)
         * CSS Color 4 + legacy definition (comma-separated arguments):
         */
        'hsl()': 'hsl(<hue> <percentage> <percentage> [/ <alpha-value>]? | <hue> , <percentage> , <percentage> , <alpha-value>?)',
        /**
         * TODO: report spec issue "define color function grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: hwb([from <color>]? <hue> <percentage> <percentage> [/ <alpha-value>]?)
         * CSS Color 4:
         */
        'hwb()': 'hwb(<hue> <percentage> <percentage> [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define color function grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: lab([from <color>]? <percentage> <number> <number> [/ <alpha-value>]?)
         * CSS Color 4:
         */
        'lab()': 'lab(<percentage> <number> <number> [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define color function grammars with explicit channel keywords" (CSS Color 5)
         *
         * CSS Color 5: lch([from <color>]? <percentage> <number> <hue> [/ <alpha-value>]?)
         * CSS Color 4:
         */
        'lch()': 'lch(<percentage> <number> <hue> [/ <alpha-value>]?)',
        /**
         * TODO: report spec issue "define color function grammars with explicit channel keywords" (CSS Color 5)
         * TODO: handle repeated function name in definition value
         *
         * CSS Color 5: rgb(<percentage>{3} [/ <alpha-value>]?) | rgb(<number>{3} [/ <alpha-value>]?) | rgb([from <color>]? [<number> | <percentage>]{3} [/ <alpha-value>]?)
         * CSS Color 4: rgb(<percentage>{3} [/ <alpha-value>]?) | rgb(<number>{3} [/ <alpha-value>]?)
         * CSS Color 4 + legacy definition (comma-separated arguments) + fix to handle repeated function name
         */
        'rgb()': 'rgb(<percentage>{3} [/ <alpha-value>]? | <number>{3} [/ <alpha-value>]? | <percentage>#{3} , <alpha-value>? | <number>#{3} , <alpha-value>?)',
        // TODO: report spec issue "the grammar of `content-list` is missing `content()`
        'content-list': '[<string> | <content()> | contents | <image> | <counter> | <quote> | <target> | <leader()>]+',
        // TODO: report spec issue "the grammar of `blend-mode` is missing a space before `color-burn`"
        'blend-mode': 'normal | multiply | screen | overlay | darken | lighten | color-dodge | color-burn | hard-light | soft-light | difference | exclusion | hue | saturation | color | luminosity',
        // TODO: report spec issue "the grammar of `start-color` and `end-color` are missing"
        'end-value': '<number> | <dimension> | <percentage>',
        'start-value': '<number> | <dimension> | <percentage>',
        // TODO: support new gradient syntax from Images 4
        'conic-gradient()': 'conic-gradient([from <angle>]? [at <position>]?, <angular-color-stop-list>)',
        'linear-gradient()': 'linear-gradient([<angle> | to <side-or-corner>]? , <color-stop-list>)',
        'radial-gradient()': 'radial-gradient([<ending-shape> || <size>]? [at <position>]? , <color-stop-list>)',
        // Written in prose
        'age': 'child | young | old',
        'ending-shape': 'circle | ellipse',
        'family-name': '<string> | <custom-ident>',
        'gender': 'male | female | neutral',
        'generic-family': 'cursive | emoji | fangsong | fantasy | math | monospace | sans-serif | serif | system-ui | ui-monospace | ui-rounded | ui-sans-serif | ui-serif',
        'id': '<id-selector>',
        'page-size': 'A5 | A4 | A3 | B5 | B4 | JIS-B5 | JIS-B4 | letter | legal | ledger',
        'paint': 'none | <color> | <url> [none | <color>]? | context-fill | context-stroke',
        'palette-identifier': '<custom-ident>',
        'shape': "rect(<'top'>, <'right'>, <'bottom'>, <'left'>)",
        'target-name': '<string>',
        // Written in prose and modified to fix https://github.com/w3c/csswg-drafts/issues/6425
        'size': 'closest-side | closest-corner | farthest-side | farthest-corner | sides | <length-percentage [0,∞]>{1,2}',
    },
}

/**
 * @param {string[][]} entries [[field, value]]
 * @returns {string}
 */
function serializeEntries(entries, depth = 1) {
    return entries.reduce((string, [key, value]) => {
        const tabs = tab(depth)
        /**
         * The definition field `value` should have been reduced to a single
         * value at this point but process it for further inspection.
         */
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
 * @param {*[]} properties [[name, [[field, value]]]]
 * @returns {string}
 */
function serializeProperties(properties) {
    return properties.reduce(
        (string, [property, fields]) => {
            const tabs = tab(1)
            property = addQuotes(property)
            fields = serializeEntries(fields.sort(sortByName), 2)
            return `${string}${tabs}${property}: {\n${fields}${tabs}},\n`
        },
        '')
}

/**
 * @param {*[][]} types [[name, [[field, value]]]]
 * @returns {string}
 */
function serializeTypes(types) {
    return types.reduce(
        (string, [type, [[, value]]]) =>
            `${string}${serializeEntries([[addQuotes(type), value]])}`,
        '')
}

/**
 * @param {*[]} aa [name, [field, [[value]]]]
 * @param {*[]} bb [name, [field, [[value]]]]
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
 * @param {*[]} definition [name, [[field, value]]]
 * @returns {*[]}
 */
function concatNewValues(definition) {
    const [name, fields] = definition
    let initial
    let newValues
    let value
    /**
     * The definition field `value` should have been reduced to a single value
     * at this point but ignore it otherwise for further inspection.
     */
    for (const [field, v] of fields) {
        if (Array.isArray(v)) {
            return definition
        }
        switch (field) {
            case 'newValues':
                newValues = v.split(' | ')
                break
            case 'value':
                value = v.split(' | ')
                break
            case 'initial':
                initial = v
                break
        }
    }
    if (newValues) {
        newValues.forEach(alt => {
            if (!value.includes(alt)) {
                value.push(alt)
            }
        })
        return [name, [['initial', initial], ['value', value.join(' | ')]]]
    }
    return definition
}

/**
 * @param {string} url
 * @param {string[]} values
 * @returns {boolean}
 *
 * These properties/types are defined in different specifications and sometimes
 * with different values, for different reasons:
 * - some definitions are simply duplicated instead of linking to the definition
 * in the authoritative specification
 * - some definitions exist in two different levels of a specification but the
 * last level does not include all definitions from the previous level, which
 * means that definitions should be extracted from both levels
 * - some specification are partially superseded by another new authoritative
 * specification
 */
function isSupersededSpecification(name, url, values) {
    // Specific cases
    switch (name) {
        case 'content()':
        case 'string-set':
        case 'string()':
            return !url.includes('css-content')
        case 'display':
            return !url.includes('css-display')
        case 'dasharray':
        case 'fill':
        case 'fill-opacity':
        case 'fill-rule':
        case 'pointer-events':
        case 'stroke':
        case 'stroke-dasharray':
        case 'stroke-dashoffset':
        case 'stroke-linecap':
        case 'stroke-linejoin':
        case 'stroke-miterlimit':
        case 'stroke-opacity':
        case 'stroke-width':
            return url !== 'https://svgwg.org/svg2-draft/'
        case 'element()':
        case 'image-rendering':
            return !url.includes('css-images')
        case 'fit-content()':
            return !url.includes('css-sizing')
        case 'font-tech':
            return !url.includes('css-fonts')
        case 'float':
            return !url.includes('css-page-floats') && !url.includes('css-gcpm')
        case 'inline-size':
            return !url.includes('css-logical')
        case 'url':
        case 'position':
            return !url.includes('css-position')
                && !url.includes('css-gcpm')
                // TODO: parse `background-position` as a shorthand (CSS Background 4)
                && !url.includes('css-values')
        case 'path()':
        case 'shape-inside':
        case 'shape-margin':
            return !url.includes('css-shapes')
    }
    // General cases
    return url === 'https://drafts.csswg.org/css2/'
        || (url === 'https://drafts.csswg.org/css-logical-1/' && values.some(([, url]) =>
            url === 'https://drafts.csswg.org/css-position/'))
        || (url === 'https://drafts.csswg.org/css-flexbox-1/' && values.some(([, url]) =>
            url === 'https://drafts.csswg.org/css-align/'))
}

/**
 * @param {*[]} definition [name, [[field, [[value, URL]]]]]
 * @returns {*[]} [[name, [[field, value]]]]
 *
 * It reduces each definition field to a single value by removing field values
 * from superseded/outdated specifications.
 */
function reduceFieldValues([name, fields]) {
    fields = fields.reduce((fields, [field, values]) => {
        if (1 < values.length) {
            values = values.filter(([, url], index) => {
                // Filter out superseded specification
                if (isSupersededSpecification(name, url, values)) {
                    return false
                }
                // Filter out previous levels of the specification
                const [baseURL, v1 = 1] = url.slice(0, -1).split(/-(\d)$/)
                const specUrls = values.filter(([, url], i) => i !== index && url.startsWith(baseURL))
                for (const [, url] of specUrls) {
                    const [, v2 = 1] = url.split(/-(\d)\/$/)
                    if (v1 < v2) {
                        return false
                    }
                }
                return true
            })
        }
        if (values.length === 1) {
            const [[value]] = values
            fields.push([field, value])
        } else if (1 < values.length) {
            const urls = values.map(([, url]) => url).join('\n  • ')
            // TODO: run in development mode only.
            console.error(`"${name}" has still multiple "${field}" values from:\n  • ${urls}`)
            fields.push([field, values])
        }
        return fields
    }, [])
    return [name, fields]
}

/**
 * @param {string} value
 * @returns {string}
 *
 * TODO: remove extra grouping `[]` around function arguments.
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
 * @param {*[][]} definitions [[name, [[field, [[value, URL]]]]]]
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
            values.push([value, url])
        } else {
            fields.push([field, [[value, url]]])
        }
    } else {
        definitions.push([name, [[field, [[value, url]]]]])
    }
}

/**
 * @param {*[][]} types [[name, [[field, [[value, URL]]]]]]
 * @param {object} definitions
 * @param {string} url
 * @returns {*[][]}
 */
function extractTypeDefinitions(types, definitions, url) {
    return Object.entries(definitions).reduce((types, [type, { value }]) => {
        // Strip `<type>` to `type`
        type = type.slice(1, -1)
        if (terminals.includes(type)) {
            return types
        }
        // TODO: run in development mode only.
        if (types.some(t => t === type)) {
            console.error(`"${type}" has been defined as a missing/custom/legacy type but is now defined in: ${url}`)
        }
        const replacement = replaced.types[type]
        if (replacement) {
            value = replacement
        } else if (!value) {
            throw Error(`Missing value to replace the definition of "<${type}>" written in prose (${url})`)
        } else {
            // Remove extra whitespaces and angled brackets
            value = removeExtraGroup(value.replace(/([([]) | [)\]]/g, match => match.trim()))
        }
        addFieldValue(types, type, 'value', value, url)
        return types
    }, types)
}

/**
 * @param {*[][]} properties [[name, [[field, [[value, URL]]]]]]
 * @param {object} definitions
 * @param {string} url
 * @returns {*[][]}
 */
function extractPropertyDefinitions(properties, definitions, url) {
    return Object.entries(definitions).reduce((properties, [property, { initial, newValues, value }]) => {
        if (aliases.has(property)) {
            return properties
        }
        // It is assumed that definitions do not define both `value` and `newValues`
        if (newValues) {
            addFieldValue(properties, property, 'newValues', newValues, url)
            return properties
        }
        const replacement = replaced.properties[property]
        if (replacement) {
            ({ initial = initial, value = value } = replacement)
        }
        if (!initial) {
            throw Error(`The "initial" field is missing in the definition of "${property}"`)
        } else if (!value) {
            throw Error(`The "value" field is missing in the definition of "${property}"`)
        } else {
            // Remove extra whitespaces
            value = value.replace(/([([]) | [)\]]/g, match => match.trim())
        }
        // Skip initial shorthand value
        if (!/(individual|shorthand)/.test(initial.toLowerCase())) {
            addFieldValue(properties, property, 'initial', initial, url)
        }
        // Remove CSS-wide keyword `inherit`
        if (url === 'https://drafts.csswg.org/css2/') {
            value = value.replace(' | inherit', '')
        }
        addFieldValue(properties, property, 'value', value, url)
        return properties
    }, properties)
}

/**
 * @param {object} specifications
 * @returns {Promise}
 */
function build(specifications) {

    // Extract property/type definitions from the record exported by `@webref/css`
    let [properties, types] = Object.values(specifications).reduce(
        ([initialProperties, initialTypes], { properties, spec: { url }, valuespaces = {} }) => [
            extractPropertyDefinitions(initialProperties, properties, url),
            extractTypeDefinitions(initialTypes, valuespaces, url),
        ],
        [[], initialTypes])

    // Cleanup definitions
    properties = properties
        .map(reduceFieldValues)
        .map(concatNewValues)
        .sort(sortByName)
    types = types
        .map(reduceFieldValues)
        .sort(sortByName)

    const typesOuput = `\n${header}\nmodule.exports = {\n${serializeTypes(types)}}\n`
    const propertiesOuput = `\n${header}\nmodule.exports = {\n${serializeProperties(properties)}}\n`

    return Promise.all([
        fs.writeFile(outputPaths.type, typesOuput, logError),
        fs.writeFile(outputPaths.properties, propertiesOuput, logError),
    ])
}

listAll().then(build)
