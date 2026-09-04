
import { getContrast, getLabLuminance } from '../utils/color.js'
import { getFontFamilyMetrics, getNormalLineHeight, getUserPreferredFontSize } from '../utils/font.js'
import { getPageColorScheme, getUserPreferredColorScheme } from '../utils/color-scheme.js'
import { isBlock, isNumeric, isOmitted, length, map } from '../values/value.js'
import { canonicalize } from '../values/dimensions.js'
import { clamp } from '../utils/math.js'
import descriptors from '../descriptors/definitions.js'
import { getInitialValue } from '../resolve.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValue } from '../serialize.js'
import { simplifyCalculation } from '../simplify.js'
import { states } from '../state.js'

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

const falsy = ['false', 'none', 'no-preference']

/**
 * @param {object} fn
 * @param {Window} globalObject
 * @returns {object}
 */
function getResolvedCalcFunction({ range, round, value }, globalObject) {
    if (!isNumeric(value, { literal: true })) {
        value = simplifyCalculation(
            map(value, value => getResolvedValue(value, globalObject, true)),
            null,
            globalObject.devicePixelRatio)
    }
    let resolved = clamp(range.min, value.value, range.max)
    if (round) {
        resolved = Math.round(resolved)
    }
    return { ...value, value: resolved }
}

/**
 * @param {object} value
 * @param {Window} globalObject
 * @returns {object}
 */
function getResolvedLength(value, globalObject) {
    switch (value.unit) {
        case 'cap':
        case 'rcap': {
            const firstAvailableFontFamily = getInitialValue('font-family')[0]
            const { ascent } = getFontFamilyMetrics(firstAvailableFontFamily)
            const fontSize = getUserPreferredFontSize(globalObject)
            return length(value.value * ascent * fontSize, 'px')
        }
        case 'ch':
        case 'em':
        case 'ic':
        case 'rch':
        case 'rem':
        case 'ric':
            return length(value.value * getUserPreferredFontSize(globalObject), 'px')
        case 'cqb':
        case 'cqh':
            return length(value.value * globalObject.innerHeight, 'px')
        case 'cqi':
        case 'cqw':
            return length(value.value * globalObject.innerWidth, 'px')
        case 'cqmax':
            return length(Math.max(globalObject.innerHeight, globalObject.innerWidth), 'px')
        case 'cqmin':
            return length(Math.min(globalObject.innerHeight, globalObject.innerWidth), 'px')
        case 'dvb':
        case 'dvh': {
            const { shared: { agent: { viewport: { interfaces: { bottom, top } } } } } = states.get(globalObject)
            let { innerHeight } = globalObject
            if (top.expanded) {
                innerHeight -= top.value
            }
            if (bottom.expanded) {
                innerHeight -= bottom.value
            }
            return length(value.value * innerHeight / 100, 'px')
        }
        case 'dvi':
        case 'dvw': {
            const { shared: { agent: { viewport: { interfaces: { left, right } } } } } = states.get(globalObject)
            let { innerWidth } = globalObject
            if (right.expanded) {
                innerWidth -= right.value
            }
            if (left.expanded) {
                innerWidth -= left.value
            }
            return length(value.value * innerWidth / 100, 'px')
        }
        case 'dvmax': {
            const width = getResolvedLength({ ...value, unit: 'dvw' }, globalObject)
            const height = getResolvedLength({ ...value, unit: 'dvh' }, globalObject)
            return width.value < height.value ? height : width
        }
        case 'dvmin': {
            const width = getResolvedLength({ ...value, unit: 'dvw' }, globalObject)
            const height = getResolvedLength({ ...value, unit: 'dvh' }, globalObject)
            return width.value < height.value ? width : height
        }
        case 'ex':
        case 'rex': {
            const fontSize = getUserPreferredFontSize(globalObject)
            return length(value.value * 0.5 * fontSize.value, 'px')
        }
        case 'lh':
        case 'rlh': {
            const firstAvailableFontFamily = getInitialValue('font-family')[0]
            const fontSize = getUserPreferredFontSize(globalObject)
            const lineHeight = getNormalLineHeight(firstAvailableFontFamily, fontSize)
            return length(value.value * lineHeight, 'px')
        }
        case 'lvb':
        case 'lvh':
        case 'vb':
        case 'vh':
            return length(value.value * globalObject.innerHeight / 100, 'px')
        case 'lvi':
        case 'vi':
        case 'lvw':
        case 'vw':
            return length(value.value * globalObject.innerWidth / 100, 'px')
        case 'lvmax':
        case 'vmax': {
            const { innerHeight, innerWidth } = globalObject
            return length(value.value * Math.max(innerHeight, innerWidth) / 100, 'px')
        }
        case 'lvmin':
        case 'vmin': {
            const { innerHeight, innerWidth } = globalObject
            return length(value.value * Math.min(innerHeight, innerWidth) / 100, 'px')
        }
        case 'px':
            return value
        case 'svb':
        case 'svh': {
            const { shared: { agent: { viewport: { interfaces: { bottom, top } } } } } = states.get(globalObject)
            let { innerHeight } = globalObject
            innerHeight -= top.value + bottom.value
            return length(value.value * innerHeight / 100, 'px')
        }
        case 'svi':
        case 'svw': {
            const { shared: { agent: { viewport: { interfaces: { left, right } } } } } = states.get(globalObject)
            let { innerWidth } = globalObject
            innerWidth -= right.value + left.value
            return length(value.value * innerWidth / 100, 'px')
        }
        case 'svmax': {
            const width = getResolvedLength({ ...value, unit: 'svw' }, globalObject)
            const height = getResolvedLength({ ...value, unit: 'svh' }, globalObject)
            return width.value < height.value ? height : width
        }
        case 'svmin': {
            const width = getResolvedLength({ ...value, unit: 'svw' }, globalObject)
            const height = getResolvedLength({ ...value, unit: 'svh' }, globalObject)
            return width.value < height.value ? width : height
        }
        default:
            return canonicalize(value)
    }
}

/**
 * @param {*[]} ratio
 * @param {Window} globalObject
 * @returns {number}
 */
function getResolvedRatio([width, height], globalObject) {
    width = getResolvedValue(width, globalObject)
    if (isOmitted(height)) {
        return width
    }
    height = getResolvedValue(height[1], globalObject)
    return width / height
}

/**
 * @param {object|object[]} value
 * @param {Window} globalObject
 * @param {boolean} [nested]
 * @returns {number|object}
 */
function getResolvedValue(value, globalObject, nested) {
    const { types } = value
    for (let index = types.length - 1; 0 <= index; index--) {
        switch (types[index]) {
            case '<angle>':
            case '<frequency>':
            case '<resolution>':
            case '<time>':
                return canonicalize(value).value
            case '<calc-function>': {
                value = getResolvedCalcFunction(value, globalObject)
                return nested ? value : value.value
            }
            case '<calc-invert>':
            case '<calc-negate>':
                return { ...value, value: getResolvedValue(value.value, globalObject, true) }
            case '<dimension>': {
                value = getResolvedLength(value, globalObject)
                return nested ? value : value.value
            }
            case '<integer>':
            case '<number>':
                return value.value
            case '<keyword>':
                return Infinity
            case '<ratio>':
                return getResolvedRatio(value, globalObject)
        }
    }
    throw RangeError('Unexpected feature value type')
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
        case '-webkit-transform-3d':
            return compareNumerics(value, operator, CSS.supports('transform', 'scaleZ(1)') ? 1 : 0)
        case 'any-hover': {
            const { shared: { system: { pointers } } } = states.get(globalObject)
            if (value === 'none') {
                return pointers.every(pointer => !pointer.motionable)
            }
            return pointers.some(pointer => pointer.motionable)
        }
        case 'any-pointer': {
            const { shared: { system: { pointers } } } = states.get(globalObject)
            if (value === 'none') {
                return pointers.length === 0
            }
            return pointers.some(pointer => pointer.precision === value)
        }
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
        case 'color-index':
            return compareNumerics(value, operator, states.get(globalObject).shared.system.display.colorIndex)
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
            const { shared: { manifest } } = states.get(globalObject)
            if (manifest) {
                return value === manifest.display
            }
            switch (value) {
                case 'fullscreen':
                    return globalObject.document.fullscreenEnabled
                case 'picture-in-picture':
                    return globalObject.document.pictureInPictureEnabled
                default:
                    return value === 'browser'
            }
        }
        case 'display-state':
            return value === states.get(globalObject).shared.agent.viewport.state
        case 'dynamic-range':
        case 'video-dynamic-range':
            return value === (states.get(globalObject).shared.system.display.hdr ? 'high' : 'standard')
        case 'environment-blending':
            return value === states.get(globalObject).shared.system.display.blending
        case 'forced-colors':
            return value === (states.get(globalObject).shared.user.forcedColors ? 'active' : 'none')
        case 'grid':
            return value === (states.get(globalObject).shared.system.display.graphicMode ? 0 : 1)
        case 'height':
            return compareNumerics(value, operator, globalObject.innerHeight)
        case 'horizontal-viewport-segments':
            return compareNumerics(value, operator, states.get(globalObject).shared.system.display.segments[0])
        case 'vertical-viewport-segments':
            return compareNumerics(value, operator, states.get(globalObject).shared.system.display.segments[1])
        case 'hover':
            return value === (states.get(globalObject).shared.system.pointers[0]?.motionable ? 'hover' : 'none')
        case 'inverted-colors':
            return value === (states.get(globalObject).shared.user.invertedColors ? 'inverted' : 'none')
        case 'monochrome':
            return compareNumerics(value, operator, states.get(globalObject).shared.system.display.monochrome)
        case 'nav-controls': {
            const { shared: { agent: { navigation } } } = states.get(globalObject)
            if (value === 'none') {
                return navigation.length === 0
            }
            return navigation.includes(value)
        }
        case 'orientation':
            return value === (globalObject.innerHeight < globalObject.innerWidth ? 'landscape' : 'portrait')
        case 'overflow-block':
            return value === states.get(globalObject).shared.agent.viewport.overflow[1]
        case 'overflow-inline':
            return value === states.get(globalObject).shared.agent.viewport.overflow[0]
        case 'pointer':
            return value === (states.get(globalObject).shared.system.pointers[0]?.precision ?? 'none')
        case 'prefers-color-scheme': {
            const { shared: { user: { forcedColors } } } = states.get(globalObject)
            if (forcedColors) {
                const rgb = parseGrammar(forcedColors.canvas, '<color>', globalObject)
                const luminance = getLabLuminance(rgb)
                if (luminance < 33) {
                    return value === 'dark'
                }
                if (luminance < 67) {
                    return value === 'light'
                }
                return false
            }
            return value === getPageColorScheme(globalObject)[0]
        }
        case 'prefers-contrast': {
            const { shared: { user: { forcedColors, highContrast } } } = states.get(globalObject)
            if (forcedColors) {
                if (value === 'no-preference') {
                    return false
                }
                let { canvas, canvastext } = forcedColors
                canvas = parseGrammar(canvas, '<color>', globalObject)
                canvastext = parseGrammar(canvastext, '<color>', globalObject)
                const contrast = getContrast(canvas, canvastext)
                if (contrast <= 4.5) {
                    return value === 'less'
                }
                if (contrast >= 7) {
                    return value === 'more'
                }
                return value === 'custom'
            }
            return value === (highContrast ? 'more' : 'no-preference')
        }
        case 'prefers-reduced-data':
            return value === (states.get(globalObject).shared.user.reducedData ? 'reduce' : 'no-preference')
        case 'prefers-reduced-motion':
            return value === (states.get(globalObject).shared.user.reducedMotion ? 'reduce' : 'no-preference')
        case 'prefers-reduced-transparency':
            return value === (states.get(globalObject).shared.user.reducedTransparency ? 'reduce' : 'no-preference')
        case 'resizable':
            return value === (states.get(globalObject).shared.agent.viewport.resizable ? 'true' : 'false')
        case 'resolution': {
            return compareNumerics(value, operator, globalObject.devicePixelRatio)
        }
        case 'scan':
            return value === (states.get(globalObject).shared.system.display.interlaced ? 'interlace' : 'progressive')
        case 'scripting':
            return value === states.get(globalObject).shared.agent.scripting
        case 'shape':
            return value === states.get(globalObject).shared.system.display.shape
        case 'ua-color-scheme':
            return value === getUserPreferredColorScheme(globalObject)
        case 'update':
            return value === states.get(globalObject).shared.system.display.update
        case 'width':
            return compareNumerics(value, operator, globalObject.innerWidth)
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
    const falseInBooleanContext = falsy.find(falsy => value.includes(falsy))
    if (falseInBooleanContext) {
        return !matchFeature(name, '=', falseInBooleanContext, globalObject)
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
        value = getResolvedValue(value, globalObject)
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
            right = getResolvedValue(right, globalObject)
            return matchFeature(left.value, operator, right, globalObject)
        }
        left = getResolvedValue(left, globalObject)
        return matchFeature(right.value, operator, left, globalObject)
    }
    let [leftValue, leftOperator, name, rightOperator, rightValue] = range
    leftValue = getResolvedValue(leftValue, globalObject)
    leftOperator = serializeComponentValue(leftOperator)
    rightOperator = associatedOperators[serializeComponentValue(rightOperator)]
    rightValue = getResolvedValue(rightValue, globalObject)
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
        case 'screen':
            return type === states.get(globalObject).shared.agent.type
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
    if (matchMediaType(body.value, globalObject)) {
        return head.value !== 'not' && (isOmitted(tail) || match(tail[1], globalObject))
    }
    return head.value === 'not' && (isOmitted(tail) || match(tail[1], globalObject))
}
