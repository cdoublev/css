
import * as dimensions from '../values/dimensions.js'
import { isBlock, isFunction, isNumeric, isOmitted } from '../utils/value.js'
import descriptors from '../descriptors/definitions.js'
import { serializeComponentValue } from '../serialize.js'

const features = descriptors['@media']

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
    if (isFunction(value)) {
        return isNumeric(value.value) ? value.value.value : null
    }
    if (value.types.includes('<ratio>')) {
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
    // Assert: value is a <dimension>
    value = dimensions.canonicalize(value)
    for (const dimension of dimensions.definitions.values()) {
        if (dimension.canonicalUnit === value.unit) {
            return value.value
        }
    }
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
 * @param {Window} globalObject
 * @returns {boolean}
 */
function matchFeature(feature, operator, value, globalObject) {
    switch (feature) {
        case 'aspect-ratio': {
            const ratio = globalObject.innerWidth / globalObject.innerHeight
            return compareNumerics(value, operator, ratio)
                || (operator.endsWith('=') && Number.isNaN(value) && Number.isNaN(ratio))
        }
        case 'color':
            return compareNumerics(value, operator, globalObject.screen.colorDepth)
        case 'color-gamut':
        case 'video-color-gamut':
            return compareNumerics(colorSpaceDepth[value], operator, globalObject.screen.colorDepth)
        case 'device-aspect-ratio': {
            const ratio = globalObject.screen.width / globalObject.screen.height
            return compareNumerics(value, operator, ratio)
                || (operator.endsWith('=') && Number.isNaN(value) && Number.isNaN(ratio))
        }
        case 'device-height':
            return compareNumerics(value, operator, globalObject.screen.height)
        case 'device-width':
            return compareNumerics(value, operator, globalObject.screen.width)
        case 'display-mode': {
            switch (value) {
                case 'fullscreen':
                    return globalObject.document.fullscreenEnabled
                case 'picture-in-picture':
                    return globalObject.document.pictureInPictureEnabled
                // `standalone` and `minimal-ui` cannot be evaluated via scripting
                default:
                    return value === 'browser'
            }
        }
        case 'height':
            return compareNumerics(value, operator, globalObject.innerHeight)
        case 'orientation':
            return value === (globalObject.innerHeight < globalObject.innerWidth ? 'landscape' : 'portrait')
        case 'resolution': {
            return compareNumerics(value, operator, globalObject.devicePixelRatio)
        }
        case 'width':
            return compareNumerics(value, operator, globalObject.innerWidth)

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
            throw RangeError('Unexpected feature')
    }
}

/**
 * @param {object} name
 * @param {Window} globalObject
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-boolean}
 */
function matchBoolean({ value: name }, globalObject) {
    if (name.endsWith('aspect-ratio')) {
        return true
    }
    const { [name]: { type, value } } = features
    if (type === 'range' || value === '<mq-boolean>') {
        return !matchFeature(name, '=', 0, globalObject)
    }
    if (value.includes('none')) {
        return !matchFeature(name, '=', 'none', globalObject)
    }
    if (value.includes('no-preference')) {
        return !matchFeature(name, '=', 'no-preference', globalObject)
    }
    return true
}

/**
 * @param {object[]} declaration
 * @param {Window} globalObject
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-plain}
 */
function matchDeclaration([{ value: name },, value], globalObject) {
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
        if (value === null) {
            return false
        }
    } else {
        value = value.value
    }
    return matchFeature(name, operator, value, globalObject)
}

/**
 * @param {object[]} range
 * @param {Window} globalObject
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-range}
 */
function matchRange(range, globalObject) {
    if (range.length === 3) {
        let [left, operator, right] = range
        operator = serializeComponentValue(operator)
        if (left.types.includes('<mf-name>')) {
            operator = associatedOperators[operator]
            right = resolveValue(right)
            return matchFeature(left.value, operator, right, globalObject)
        }
        left = resolveValue(left)
        return matchFeature(right.value, operator, left, globalObject)
    }
    let [leftValue, leftOperator, name, rightOperator, rightValue] = range
    leftValue = resolveValue(leftValue)
    leftOperator = serializeComponentValue(leftOperator)
    rightOperator = associatedOperators[serializeComponentValue(rightOperator)]
    rightValue = resolveValue(rightValue)
    return matchFeature(name.value, leftOperator, leftValue, globalObject)
        && matchFeature(name.value, rightOperator, rightValue, globalObject)
}

/**
 * @param {string} type
 * @param {Window} globalObject
 * @returns {boolean}
 */
function matchMediaType(type, globalObject) {
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
 * @param {Window} globalObject
 * @returns {boolean|string}
 */
function every(conditions, globalObject) {
    let hasUnknown = false
    for (const condition of conditions) {
        const result = match(condition, globalObject)
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
 * @param {Window} globalObject
 * @returns {boolean|string}
 */
function some(conditions, globalObject) {
    let hasUnknown = false
    for (const condition of conditions) {
        const result = match(condition, globalObject)
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
 * @param {Window} globalObject
 * @returns {boolean|string}
 */
export default function match(query, globalObject) {
    if (query.types.includes('<general-enclosed>')) {
        return 'unknown'
    }
    // (<media-condition>) | (<media-feature>)
    if (isBlock(query)) {
        return match(query.value, globalObject)
    }
    // <media-feature>
    if (query.types.includes('<mf-boolean>')) {
        return matchBoolean(query, globalObject)
    }
    if (query.types.includes('<mf-plain>')) {
        return matchDeclaration(query, globalObject)
    }
    if (query.types.includes('<mf-range>')) {
        return matchRange(query, globalObject)
    }
    // <media-query-list>
    if (query.types.includes('<media-query-list>')) {
        if (query.length === 0) {
            return true
        }
        const result = some(query, globalObject)
        return result && result !== 'unknown'
    }
    const [head, body, tail] = query
    // <media-query> = <media-condition> = <media-not>
    // <media-condition-without-or> = <media-not>
    if (query.types.includes('<media-not>')) {
        const result = match(body, globalObject)
        return result === 'unknown' ? 'unknown' : !result
    }
    // <media-and> = and <media-in-parens>
    // <media-or> = or <media-in-parens>
    if (query.types.includes('<media-and>') || query.types.includes('<media-or>')) {
        return match(body, globalObject)
    }
    // <media-condition-without-or> = <media-in-parens> <media-and>*
    // <media-condition> = <media-in-parens> [<media-and>* | <media-or>*]
    if (head.types.includes('<media-in-parens>')) {
        const query = [head, ...body]
        if (body[0]?.types.includes('<media-and>')) {
            return every(query, globalObject)
        }
        return some(query, globalObject)
    }
    // [not | only] <media-type> [and <media-condition-without-or>]?
    if (matchMediaType(body.value)) {
        return head.value !== 'not' && (isOmitted(tail) || match(tail[1], globalObject))
    }
    return head.value === 'not' && (isOmitted(tail) || match(tail[1], globalObject))
}
