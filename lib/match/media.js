
const { '@media': features } = require('../descriptors/definitions.js')
const { serializeCSSComponentValue } = require('../serialize.js')
const { isNumeric, isOmitted } = require('../utils/value.js')
const dimensions = require('../values/dimensions.js')

const associatedOperators = {
    '<': '>',
    '<=': '>=',
    '=': '=',
    '>': '<',
    '>=': '<=',
}

const colorSpaceDepth = {
    p3: 30,
    rec2020: 36,
    srgb: 24,
}

/**
 * @param {object|object[]} value
 * @returns {number|null}
 */
function resolveValue(value) {
    // Resolved math function
    if (value.types[0] === '<function>') {
        return isNumeric(value.value) ? value.value.value : null
    }
    if (value.types[0] === '<ratio>') {
        let [width, maybeHeight] = value
        width = resolveValue(width)
        if (width === null) {
            return null
        }
        if (isOmitted(maybeHeight)) {
            return width
        }
        const height = resolveValue(maybeHeight[1])
        if (height === null) {
            return null
        }
        return width / height
    }
    if (value.types.includes('<integer>') || value.types.includes('<number>')) {
        return value.value
    }
    if (value.value === 'infinite') {
        return Infinity
    }
    // <dimension>
    value = dimensions.canonicalize(value)
    for (const dimension of dimensions.definitions.values()) {
        if (dimension.canonicalUnit === value.unit) {
            return value.value
        }
    }
    // <dimension> with a relative unit
    return null
}

/**
 * @param {number} a
 * @param {string} operator
 * @param {number} b
 * @returns {boolean}
 */
function compareNumerics(a, operator, b) {
    switch (operator) {
        case '<':
            return a < b
        case '<=':
            return a <= b
        case '>':
            return b < a
        case '>=':
            return b <= a
        default:
            return a === b
    }
}

/**
 * @param {string} feature
 * @param {string} operator
 * @param {number|string} value
 * @param {Window} window
 * @returns {boolean}
 */
function matchFeature(feature, operator, value, window) {
    switch (feature) {
        case 'aspect-ratio': {
            const ratio = window.innerWidth / window.innerHeight
            return compareNumerics(value, operator, ratio)
                || (operator.endsWith('=') && Number.isNaN(value) && Number.isNaN(ratio))
        }
        case 'color':
            return compareNumerics(value, operator, window.screen.colorDepth)
        case 'color-gamut':
        case 'video-color-gamut':
            return compareNumerics(colorSpaceDepth[value], operator, window.screen.colorDepth)
        case 'device-aspect-ratio': {
            const ratio = window.screen.width / window.screen.height
            return compareNumerics(value, operator, ratio)
                || (operator.endsWith('=') && Number.isNaN(value) && Number.isNaN(ratio))
        }
        case 'device-height':
            return compareNumerics(value, operator, window.screen.height)
        case 'device-width':
            return compareNumerics(value, operator, window.screen.width)
        case 'display-mode': {
            switch (value) {
                case 'fullscreen':
                    return window.document.fullscreenEnabled
                case 'picture-in-picture':
                    return window.document.pictureInPictureEnabled
                // `standalone` and `minimal-ui` cannot be evaluated via scripting
                default:
                    return value === 'browser'
            }
        }
        case 'height':
            return compareNumerics(value, operator, window.innerHeight)
        case 'orientation':
            return value === (window.innerHeight < window.innerWidth ? 'landscape' : 'portrait')
        case 'resolution': {
            return compareNumerics(value, operator, window.devicePixelRatio)
        }
        case 'width':
            return compareNumerics(value, operator, window.innerWidth)

        // Features that cannot be evaluated via scripting
        case '-webkit-transform-3d':
            return compareNumerics(value, operator, 1)
        case 'any-hover':
        case 'hover':
            return value === 'hover'
        case 'any-pointer':
        case 'pointer':
            return value === 'fine'
        case 'color-index':
            return compareNumerics(value, operator, 0)
        case 'dynamic-range':
        case 'video-dynamic-range':
            return value === 'standard'
        case 'environment-blending':
            return value === 'opaque'
        case 'forced-colors':
        case 'inverted-colors':
        case 'nav-controls':
            return value === 'none'
        case 'grid':
            return compareNumerics(value, operator, 0)
        case 'horizontal-viewport-segments':
        case 'vertical-viewport-segments':
            return compareNumerics(value, operator, 1)
        case 'monochrome':
            return compareNumerics(value, operator, 0)
        case 'overflow-block':
        case 'overflow-inline':
            return value === 'scroll'
        case 'prefers-color-scheme':
            return value === 'light'
        case 'prefers-contrast':
        case 'prefers-reduced-data':
        case 'prefers-reduced-motion':
        case 'prefers-reduced-transparency':
            return value === 'no-preference'
        case 'scan':
            return value === 'progressive'
        case 'scripting':
            return value === 'enabled'
        case 'shape':
            return value === 'rect'
        case 'update':
            return value === 'fast'
        default:
            throw Error('Unhandled feature')
    }
}

/**
 * @param {object} name
 * @param {Window} window
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-boolean}
 */
function matchBoolean({ value: name }, window) {
    if (name.endsWith('aspect-ratio')) {
        return true
    }
    const { [name]: { type, value } } = features
    if (type === 'range' || value === '<mq-boolean>') {
        return !matchFeature(name, '=', 0, window)
    }
    if (value.includes('none')) {
        return !matchFeature(name, '=', 'none', window)
    }
    if (value.includes('no-preference')) {
        return !matchFeature(name, '=', 'no-preference', window)
    }
    return true
}

/**
 * @param {object[]} declaration
 * @param {Window} window
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-plain}
 */
function matchDeclaration([{ value: name },, value], window) {
    let operator
    if (name.startsWith('min-')) {
        operator = '<='
        name = name.slice(4)
    } else if (name.startsWith('max-')) {
        operator = '>='
        name = name.slice(4)
    } else {
        operator = '='
    }
    const definition = features[name]
    if (definition.type === 'range' || definition.value === '<mq-boolean>') {
        value = resolveValue(value)
        // value includes a <dimension> with a relative unit
        if (value === null) {
            return false
        }
    } else {
        value = value.value
    }
    return matchFeature(name, operator, value, window)
}

/**
 * @param {object[]} range
 * @param {Window} window
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-range}
 */
function matchRange(range, window) {
    if (range.length === 3) {
        let [left, operator, right] = range
        operator = serializeCSSComponentValue(operator)
        if (left.types.includes('<mf-name>')) {
            operator = associatedOperators[operator]
            right = resolveValue(right)
            return matchFeature(left.value, operator, right, window)
        }
        left = resolveValue(left)
        return matchFeature(right.value, operator, left, window)
    }
    let [leftValue, leftOperator, name, rightOperator, rightValue] = range
    leftValue = resolveValue(leftValue)
    leftOperator = serializeCSSComponentValue(leftOperator)
    rightOperator = associatedOperators[serializeCSSComponentValue(rightOperator)]
    rightValue = resolveValue(rightValue)
    return matchFeature(name.value, leftOperator, leftValue, window)
        && matchFeature(name.value, rightOperator, rightValue, window)
}

/**
 * @param {string} type
 * @param {Window} window
 * @returns {boolean}
 */
function matchMediaType(type, window) {
    switch (type) {
        case 'all':
            return true
        case 'print':
            return false
        case 'screen':
            return true
        default:
            return false
    }
}

/**
 * @param {object[]} conditions
 * @param {Window} window
 * @returns {boolean|string}
 */
function every(conditions, window) {
    let hasUnknown = false
    for (const condition of conditions) {
        const result = match(condition, window)
        if (!result) {
            return false
        }
        if (result === 'unknown') {
            hasUnknown = true
        }
    }
    return hasUnknown ? 'unknown' : true
}

/**
 * @param {object[]} conditions
 * @param {Window} window
 * @returns {boolean|string}
 */
function some(conditions, window) {
    let hasUnknown = false
    for (const condition of conditions) {
        const result = match(condition, window)
        if (result === true) {
            return true
        }
        if (result === 'unknown') {
            hasUnknown = true
        }
    }
    return hasUnknown ? 'unknown' : false
}

/**
 * @param {object|object[]} query
 * @param {Window} window
 * @returns {boolean|string}
 * @see {@link https://drafts.csswg.org/cssom-view/#mediaquerylist-matches-state}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#filtering}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#conditional-import}
 * @see {@link https://html.spec.whatwg.org/#processing-the-media-attribute}
 *
 * It is intended to be used:
 * - to return the matches state of MediaQueryList
 * - to filter declared values
 * - to avoid fetching/applying the style sheet of @import or <link>
 */
function match(query, window) {
    if (query.types[1] === '<general-enclosed>') {
        return 'unknown'
    }
    // (<media-condition>) | (<media-feature>)
    if (query.types[0] === '<block>') {
        return match(query.value, window)
    }
    // <media-feature>
    if (query.types.at(-2) === '<mf-boolean>') {
        return matchBoolean(query, window)
    }
    if (query.types.at(-2) === '<mf-plain>') {
        return matchDeclaration(query, window)
    }
    if (query.types.at(-2) === '<mf-range>') {
        return matchRange(query, window)
    }
    // <media-query-list>
    if (query.types.at(-1) === '<media-query-list>') {
        const result = some(query, window)
        return result && result !== 'unknown'
    }
    const [head, body, tail] = query
    // <media-query> = <media-condition> = <media-not>
    // <media-condition-without-or> = <media-not>
    if (query.types[0] === '<media-not>') {
        const result = match(body, window)
        return result === 'unknown' ? 'unknown' : !result
    }
    // <media-and> = and <media-in-parens>
    // <media-or> = or <media-in-parens>
    if (query.types[0] === '<media-and>' || query.types[0] === '<media-or>') {
        return match(body, window)
    }
    // <media-condition-without-or> = <media-in-parens> <media-and>*
    // <media-condition> = <media-in-parens> [<media-and>* | <media-or>*]
    if (head.types.at(-1) === '<media-in-parens>') {
        const query = [head, ...body]
        if (body[0]?.types[0] === '<media-and>') {
            return every(query, window)
        }
        return some(query, window)
    }
    // [not | only] <media-type> [and <media-condition-without-or>]?
    if (matchMediaType(body.value)) {
        return head.value !== 'not' && (isOmitted(tail) || match(tail[1], window))
    }
    return head.value === 'not' && (isOmitted(tail) || match(tail[1], window))
}

module.exports = match
