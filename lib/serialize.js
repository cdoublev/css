
const { MAX_INTEGER, MIN_INTEGER } = require('./values/integers.js')
const {
    hasArbitrarySubstitution,
    isCalculation,
    isInfinityOrNaN,
    isNumeric,
    isNumericRepresentationOf,
} = require('./values/validation.js')
const { clamp, safeFloat, toEightBit } = require('./utils/math.js')
const { hslToRgb, hwbToRgb, sRGB } = require('./utils/color.js')
const { isCombination, isCompound, isMultiplied } = require('./parse/validation.js')
const { isDigit, isIdentifierCharacter, isNonASCIIIdentifierChar } = require('./parse/tokenize.js')
const { associatedBlockTokens } = require('./values/blocks.js')
const { auto } = require('./values/defaults.js')
const { createList } = require('./values/value.js')
const { keywords: cssWideKeywords } = require('./values/substitutions.js')
const { definitions: dimensions } = require('./values/dimensions.js')
const display = require('./values/display.js')
const font = require('./values/font.js')
const { isCalculationOperator } = require('./values/validation.js')
const logical = require('./properties/logical.js')
const properties = require('./properties/definitions.js')
const shorthands = require('./properties/shorthands.js')
const types = require('./values/definitions.js')
const whiteSpace = require('./values/white-space.js')

/**
 * @param {object} alpha
 * @param {boolean} [is8Bit]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-alphavalue-def}
 */
function serializeAlpha({ type, value }, is8Bit = false) {
    if (type.has('percentage')) {
        value /= 100
    }
    if (is8Bit) {
        const a = Math.round(value * 255)
        const integer = Math.round(value * 100)
        if (Math.round(safeFloat(integer * 2.55)) === a) {
            value = integer / 100
        } else {
            value = Math.round(a / 0.255) / 1000
        }
    }
    return serializeNumber({ value })
}

/**
 * @param {object|object[]} notation
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#serialize-an-anb-value}
 */
function serializeAnB({ value: { a, b } }) {
    if (a === 0) {
        return `${b}`
    }
    let string = ''
    if (a === 1) {
        string += 'n'
    } else if (a === -1) {
        string += '-n'
    } else {
        string += `${a}n`
    }
    if (0 < b) {
        string += `+${b}`
    } else if (b < 0) {
        string += b
    }
    return string
}

/**
 * @param {object} attribute
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-attr}
 */
function serializeAttribute({ value }) {
    const [name, type,, fallback] = value.map(serializeCSSComponentValue)
    let string = `attr(${name}`
    if (type && type !== 'string') {
        string += ` ${type}`
    }
    if (fallback && (fallback !== '""' || type !== 'string')) {
        string += `, ${fallback}`
    }
    string += ')'
    return string
}

/**
 * @param {object} shape
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#typedef-basic-shape-rect}
 */
function serializeBasicShapeRect({ name, value }) {
    const corners = value.at(-1)
    value = name === 'inset'
        ? serializeSides(value[0])
        : serializeCSSComponentValueList(value.slice(0, -1))
    if (corners.omitted) {
        return `${name}(${value})`
    }
    const [, borderRadius] = corners
    if (borderRadius.every(radii => radii.every(radius => isNumericRepresentationOf(radius, 0)))) {
        return `${name}(${value})`
    }
    return `${name}(${value} round ${serializeBorderRadius(borderRadius)})`
}

/**
 * @param {object[][]} radii
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
 *
 * It serializes radii without explicit component values (browser conformance).
 */
function serializeBorderRadius([horizontal, vertical]) {
    horizontal = serializeSides(horizontal)
    vertical = serializeSides(vertical)
    if (horizontal === vertical) {
        return horizontal
    }
    return `${horizontal} / ${vertical}`
}

/**
 * @param {object} shape
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-circle}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-ellipse}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#basic-shape-serialization}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/2274}
 */
function serializeCircle({ name, value }) {
    let string = `${name}(${serializeCSSComponentValueList(value)}`
    if (value.at(-1).omitted) {
        if (!string.endsWith('(')) {
            string += ' '
        }
        string += 'at center center'
    }
    string += ')'
    return string
}

/**
 * @param {object} color
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-4/#serializing-color-values}
 */
function serializeColor(color) {
    const { name, type } = color
    // <deprecated-color>, <named-color>, <system-color>, transparent, currentcolor
    if (type.has('keyword')) {
        return color.value
    }
    // Color functions and <hex-color>
    const isSRGB = sRGB.some(t => type.has(t))
    let { value } = color
    let alpha = 1
    if (type.has('hex-color')) {
        const [n1, n2, n3, n4, n5, n6, n7, n8] = value
        switch (value.length) {
            case 3:
                value = [Number(`0x${n1}${n1}`), Number(`0x${n2}${n2}`), Number(`0x${n3}${n3}`)]
                break
            case 4:
                value = [Number(`0x${n1}${n1}`), Number(`0x${n2}${n2}`), Number(`0x${n3}${n3}`)]
                alpha = `0x${n4}${n4}` / 255
                break
            case 6:
                value = [Number(`0x${n1}${n2}`), Number(`0x${n3}${n4}`), Number(`0x${n5}${n6}`)]
                break
            case 8:
                value = [Number(`0x${n1}${n2}`), Number(`0x${n3}${n4}`), Number(`0x${n5}${n6}`)]
                alpha = `0x${n7}${n8}` / 255
                break
        }
    } else {
        value = value.flat(2).reduce(
            (channels, component, index, input) => {
                let { omitted, type, value } = component
                if (omitted || type.has('delimiter')) {
                    return channels
                }
                const isAlpha = (index + 1) === input.length
                // `none` or color space
                if (type.has('ident')) {
                    if (value === 'none') {
                        value = isSRGB ? 0 : value
                        if (isAlpha) {
                            alpha = value
                            return channels
                        }
                    } else if (value === 'xyz') {
                        value = 'xyz-d65'
                    }
                    channels.push(value)
                    return channels
                }
                const isHue = type.has('hue')
                if (type.has('function')) {
                    ({ type, value } = value)
                }
                // <alpha-value>
                if (isAlpha) {
                    component.value = clamp(0, value, type.has('percentage') ? 100 : 1)
                    alpha = serializeAlpha(component, true)
                    return channels
                }
                if (isHue) {
                    value %= 360
                    if (value < 0) {
                        value += 360
                    }
                    channels.push(value)
                    return channels
                }
                if (type.has('percentage')) {
                    switch (name) {
                        case 'color':
                            value *= 0.01
                            break
                        case 'lab':
                            value = 0 < index ? value * 1.25 : value
                            break
                        case 'lch':
                            value = 0 < index ? value * 1.5 : value
                            break
                        case 'oklab':
                        case 'oklch':
                            value = 0 < index ? value * 0.004 : value * 0.01
                            break
                        case 'rgb':
                        case 'rgba':
                            value = safeFloat(value * 2.55)
                            break
                    }
                }
                switch (name) {
                    case 'hsl':
                    case 'hsla':
                    case 'hwb':
                        value = clamp(0, value, 100)
                        break
                    case 'lab':
                        value = index === 0 ? clamp(0, value, 100) : value
                        break
                    case 'oklab':
                        value = index === 0 ? clamp(0, value, 1) : value
                        break
                    case 'lch':
                        value = index === 0 ? clamp(0, value, 100) : Math.max(0, value)
                        break
                    case 'oklch':
                        value = index === 0 ? clamp(0, value, 1) : Math.max(0, value)
                        break
                    case 'rgb':
                    case 'rgba':
                        value = Math.round(clamp(0, value, 255))
                        break
                }
                channels.push(value)
                return channels
            },
            [])
        if (name === 'hsl' || name === 'hsla') {
            value = hslToRgb(...value).map(toEightBit)
        } else if (name === 'hwb') {
            value = hwbToRgb(...value).map(toEightBit)
        }
        value = value.map(value => typeof value === 'number' ? serializeNumber({ value }) : value)
    }
    if (alpha < 1 || alpha === 'none') {
        if (isSRGB) {
            return `rgba(${value.join(', ')}, ${alpha})`
        }
        return `${name}(${value.join(' ')} / ${alpha})`
    }
    if (isSRGB) {
        return `rgb(${value.join(', ')})`
    }
    return `${name}(${value.join(' ')})`
}

/**
 * @param {object} gradient
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-conic-gradient}
 */
function serializeConicGradient({ name, value: [configuration,, stops] }) {
    stops = serializeCSSComponentValue(stops)
    if (configuration.omitted) {
        return `${name}(at center center, ${stops})`
    }
    const [line, interpolation] = configuration
    const options = []
    if (line.omitted) {
        options.push('at center center')
    } else {
        const [rotation, position] = line
        if (!rotation.omitted && !isNumericRepresentationOf(rotation[1], 0, 'deg')) {
            options.push(serializeCSSComponentValue(rotation))
        }
        options.push(position.omitted ? 'at center center' : serializeCSSComponentValue(position))
    }
    if (!interpolation.omitted && interpolation[1].value !== 'oklab') {
        options.push(serializeCSSComponentValueList(interpolation))
    }
    return `${name}(${options.join(' ')}, ${stops})`
}

/**
 * @param {object} counter
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-typedef-counter}
 */
function serializeCounter({ name, value }) {
    const list = value.slice(0, 2 < value.length ? 2 : 1)
    const last = list.at(-1)
    if (last.value === 'decimal') {
        list.push(last)
    }
    return `${name}(${serializeCSSComponentValueList(list)})`
}

/**
 * @param {object} declaration
 * @returns {string}
 */
function serializeDeclaration(declaration) {
    const { name, important } = declaration
    return serializeCSSDeclaration(name, serializeCSSValue(declaration), important, false)
}

/**
 * @param {object} definition
 * @returns {string}
 */
function serializeDefinition(definition) {
    const { max, min, name, separator, type, value } = definition
    let string = ''
    if (isMultiplied(definition)) {
        string = serializeDefinition(value)
        if (isCombination(value) || isCompound(value) || value.type === 'optional' || string.endsWith('}')) {
            string = `[${string}]`
        }
        if (type === 'optional') {
            string += '?'
        } else if (type === 'required') {
            string += '!'
        } else {
            string += serializeDefinitionMultiplier(min, max, separator)
        }
        return string
    }
    if (isCombination(definition)) {
        const [seed, ...types] = value
        const combinator = type === ' ' ? type : ` ${type} `
        return types.reduce(
            (all, definition) => `${all}${combinator}${serializeDefinition(definition)}`,
            serializeDefinition(seed))
    }
    if (type === 'delimiter' || name === 'keyword') {
        return value
    }
    if (type === 'function') {
        return `${name}(${value})`
    }
    if (type === 'simple-block') {
        return `(${value})`
    }
    string += name
    if (max) {
        string += ` ${serializeDefinitionRange(min, max, '[')}`
    }
    return `<${string}>`
}

/**
 * @param {number} min
 * @param {number} max
 * @param {string} [separator]
 * @returns {string}
 */
function serializeDefinitionMultiplier(min, max, separator) {
    if (min === 0 && 20 <= max) {
        return '*'
    }
    if (min === 1 && 20 <= max) {
        return separator === ',' ? '#' : '+'
    }
    const range = `${serializeDefinitionRange(min, max, '{')}`
    if (separator === ',') {
        return `#${range}`
    }
    return range
}

/**
 * @param {number} min
 * @param {number} max
 * @param {string} startingToken
 * @returns {string}
 */
function serializeDefinitionRange(min, max, startingToken) {
    let range = `${startingToken}${min}`
    if (min !== max) {
        range += `,${max === Infinity ? '∞' : max}`
    }
    range += associatedBlockTokens[startingToken]
    return range
}

/**
 * @param {object} dimension
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-angle-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-frequency-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-length-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-percentage-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-resolution-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-time-value}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#serialization}
 *
 * It escapes the unit of an unknown dimension to disambiguate with scientific
 * notation.
 */
function serializeDimension(dimension) {
    const value = serializeNumber(dimension)
    const { type, unit } = dimension
    if (type.has('dimension-token') || (unit !== '%' && type.size === 1)) {
        return value + serializeIdentifier({ value: unit })
    }
    return value + unit
}

/**
 * @param {object} component
 * @returns {string}
 */
function serializeFunction(fn) {
    const { name, numericType, value } = fn
    if (numericType) {
        return serializeMathFunction(fn)
    }
    return `${name}(${serializeCSSComponentValue(value)})`
}

/**
 * @param {object} component
 * @returns {string}
 */
function serializeHash(component) {
    const { type, value } = component
    if (type.has('id')) {
        return `#${serializeIdentifier(component)}`
    }
    return `#${value}`
}

/**
 * @param {object} identifier
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-value-def-identifier}
 */
function serializeIdentifier({ value }) {
    const { length } = value
    return [...value].reduce(
        (identifier, char, index) => {
            const codePoint = char.codePointAt(0)
            if (codePoint === 0) {
                return identifier += '�'
            }
            if ((0x1 <= codePoint && codePoint <= 0x1F) || codePoint === 0x7F) {
                return `${identifier}\\${codePoint.toString(16)} `
            }
            if (index === 0) {
                if (isDigit(char)) {
                    return `${identifier}\\${codePoint.toString(16)} `
                }
                if (char === '-' && length === 1) {
                    return `${identifier}\\-`
                }
            } else if (index === 1 && isDigit(char) && identifier[0] === '-') {
                return `${identifier}\\${codePoint.toString(16)} `
            }
            if (isNonASCIIIdentifierChar(char) || isIdentifierCharacter(char)) {
                return identifier += char
            }
            return `${identifier}\\${char}`
        },
        '')
}

/**
 * @param {object} integer
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-integer-value}
 *
 * It clamps the integer into the 32 bits range (browser conformance).
 */
function serializeInteger({ value }) {
    return `${clamp(MIN_INTEGER, value, MAX_INTEGER)}`
}

/**
 * @param {object} selector
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframe-selector}
 *
 * It serializes the selector with a percentage when declared with a keyword
 * (browser conformance).
 */
function serializeKeyframeSelector(selector) {
    const { type, value } = selector
    if (type.has('keyword')) {
        return value === 'from' ? '0%' : '100%'
    }
    return serializeDimension(selector)
}

/**
 * @param {object} names
 * @param {boolean} [allowEmpty]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-names}
 *
 * It allows to serialize line names to empty string (browser conformance).
 */
function serializeLineNames(names, allowEmpty = false) {
    if (names.value.length === 0) {
        return allowEmpty ? '[]' : ''
    }
    return serializeSimpleBlock(names)
}

/**
 * @param {object[]} list
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-name-list}
 *
 * It allows to serialize line names in list to empty string (browser
 * conformance).
 */
function serializeLineNameList(list) {
    return list.map(names => {
        if (names.type.has('line-names')) {
            return serializeLineNames(names, true)
        }
        const { name, value: [multiplier,, repeated] } = names
        return `${name}(${serializeCSSComponentValue(multiplier)}, ${serializeLineNameList(repeated)})`
    }).join(' ')
}

/**
 * @param {object} numeric
 * @returns {string}
 */
function serializeInfinityOrNaN({ type, value }) {
    let string
    if (value === -Infinity) {
        string = '-infinity'
    } else if (value === Infinity) {
        string = 'infinity'
    } else {
        string = 'NaN'
    }
    if (type.has('number')) {
        return string
    }
    if (type.has('percentage')) {
        return `${string} * 1%`
    }
    for (const [dimension, { canonicalUnit }] of dimensions) {
        if (type.has(dimension)) {
            return `${string} * 1${canonicalUnit}`
        }
    }
    throw Error('Unrecognized dimension type')
}

/**
 * @param {Set} type
 * @returns {number}
 */
function getCalculationTypeOrder(type) {
    if (type.has('number')) {
        return 0
    } else if (type.has('percentage')) {
        return 1
    } else if (type.has('dimension')) {
        return 2
    }
    return 3
}

/**
 * @param {object[]} nodes
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#sort-a-calculations-children}
 */
function sortCalculation(nodes) {
    return nodes.sort(({ type: a, unit: ua }, { type: b, unit: ub }) => {
        a = getCalculationTypeOrder(a)
        b = getCalculationTypeOrder(b)
        if (a === 2 && b === 2 && ua < ub) {
            return -1
        }
        return a - b
    })
}

/**
 * @param {object} root
 * @param {boolean} forComputedOrLater
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-calculation-tree}
 */
function serializeCalculationTree(root, forComputedOrLater) {
    const { type, value } = root
    if (isNumeric(root)) {
        // https://github.com/w3c/csswg-drafts/issues/7456
        if (isInfinityOrNaN(root)) {
            return serializeInfinityOrNaN(root)
        }
        return serializeCSSComponentValue(root)
    }
    if (type.has('function')) {
        return serializeMathFunction({ value: root }, forComputedOrLater)
    }
    if (type.has('calc-negate')) {
        return `(-1 * ${serializeCalculationTree(value, forComputedOrLater)})`
    }
    if (type.has('calc-invert')) {
        return `(1 / ${serializeCalculationTree(value, forComputedOrLater)})`
    }
    const [first, ...children] = sortCalculation(value)
    let string = `(${serializeCalculationTree(first, forComputedOrLater)}`
    if (type.has('calc-sum')) {
        children.forEach(child => {
            const { type, value } = child
            if (type.has('calc-negate')) {
                string += ` - ${serializeCalculationTree(value, forComputedOrLater)}`
            } else if (typeof value === 'number' && value < 0) {
                string += ` - ${serializeCSSComponentValue({ ...child, value: 0 - value })}`
            } else {
                string += ` + ${serializeCalculationTree(child, forComputedOrLater)}`
            }
        })
    } else if (type.has('calc-product')) {
        children.forEach(child => {
            const { type, value } = child
            if (type.has('calc-invert')) {
                string += ` / ${serializeCalculationTree(value, forComputedOrLater)}`
            } else {
                string += ` * ${serializeCalculationTree(child, forComputedOrLater)}`
            }
        })
    }
    string += ')'
    return string
}

/**
 * @param {object} gradient
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-linear-gradient}
 */
function serializeLinearGradient({ name, value: [configuration,, stops] }) {
    let options = []
    if (!configuration.omitted) {
        const [rotation, interpolation] = configuration
        if (!rotation.omitted && !isNumericRepresentationOf(rotation, 180, 'deg')) {
            options.push(serializeCSSComponentValue(rotation))
        }
        if (!interpolation.omitted && interpolation[1].value !== 'oklab') {
            options.push(serializeCSSComponentValue(interpolation))
        }
    }
    options = options.join(' ')
    stops = serializeCSSComponentValue(stops)
    return `${name}(${options}${options ? `, ${stops}` : stops})`
}

/**
 * @param {object} fn
 * @param {boolean} [forComputedOrLater]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-math-function}
 */
function serializeMathFunction({ value: root }, forComputedOrLater = false) {
    const { name, type, range = {}, round } = root
    const isResolved = isNumeric(root)
    if (isResolved) {
        // Unwrap the resolved value from the math function
        if (forComputedOrLater) {
            let { value } = root
            // Round to replace an <integer>
            if (round) {
                value = Math.round(value)
            }
            // Clamp to type range (if any) or JavaScript min/max safe integer (browser conformance)
            let { min = -Infinity, max = Infinity } = range
            if (min === -Infinity) {
                min = Number.MIN_SAFE_INTEGER
            }
            if (max === Infinity) {
                max = Number.MAX_SAFE_INTEGER
            }
            return serializeCSSComponentValue({ type, value: clamp(min, value, max) })
        }
        if (isInfinityOrNaN(root)) {
            return `calc(${serializeInfinityOrNaN(root)})`
        }
    }
    let string
    if (isResolved || isCalculationOperator(root)) {
        string = 'calc('
    } else {
        ({ value: root } = root)
        string = `${name.toLowerCase()}(`
    }
    if (Array.isArray(root)) {
        root = root.reduce(
            (root, child) => {
                if (child.value === 'nearest') {
                    return root
                }
                if (isCalculation(child)) {
                    child = serializeCalculationTree(child, forComputedOrLater)
                    if (child.startsWith('(') && child.endsWith(')')) {
                        child = child.slice(1, -1)
                    }
                } else {
                    child = serializeCSSComponentValue(child)
                }
                root.push(child)
                return root
            },
            [])
        string += root.join(', ')
    } else {
        root = serializeCalculationTree(root, forComputedOrLater)
        if (root.startsWith('(') && root.endsWith(')')) {
            root = root.slice(1, -1)
        }
        string += root
    }
    string += ')'
    return string
}

/**
 * @param {object} number
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-number-value}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6471}
 */
function serializeNumber({ value }) {
    return `${+value.toFixed(6)}`
}

/**
 * @param {object} shape
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-path}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-polygon}
 */
function serializePath({ name, value }) {
    const [{ omitted, value: fillRule },, ...args] = value
    let string = `${name}(`
    if (!omitted && fillRule !== 'nonzero') {
        string += `${fillRule}, `
    }
    return `${string}${serializeCSSComponentValueList(args)})`
}

/**
 * @param {object|object[]} position
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-position}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/2274}
 *
 * It serializes the position with 2 or 4 values by adding `center` when the
 * position is specified with 1 value, otherwise by replacing `center` with
 * `left 50%`, `top 50%`, or by replacing an omitted offset with `0%`.
 */
function serializePosition(position) {
    if (Array.isArray(position)) {
        position = position.flat()
        const { length } = position
        if (length === 3) {
            position[0].value === 'center'
                ? position.splice(0, 1, 'left 50%')
                : position.splice(2, 1, 'top 50%')
        }
        return serializeCSSComponentValueList(position.map(component => {
            if (component.omitted) {
                return length === 2 ? 'center' : '0%'
            }
            return component
        }))
    }
    let side
    if (position.type.has('keyword')) {
        side = serializeIdentifier(position)
        if (side === 'top' || side === 'bottom') {
            return `center ${side}`
        }
    } else {
        side = serializeDimension(position)
    }
    return `${side} center`
}

/**
 * @param {object} gradient
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-radial-gradient}
 */
function serializeRadialGradient({ name, value: [configuration,, stops] }) {
    stops = serializeCSSComponentValue(stops)
    if (configuration.omitted) {
        return `${name}(at center center, ${stops})`
    }
    const [line, interpolation] = configuration
    const options = []
    if (line.omitted) {
        options.push('at center center')
    } else {
        const [aspect, position] = line
        if (!aspect.omitted) {
            const [shape, size] = aspect
            if (shape.value === 'circle' && !size.type.has('length')) {
                options.push('circle')
            }
            if (size.value !== 'farthest-corner') {
                options.push(serializeCSSComponentValue(size))
            }
        }
        options.push(position.omitted ? 'at center center' : serializeCSSComponentValue(position))
    }
    if (!interpolation.omitted && interpolation[1].value !== 'oklab') {
        options.push(serializeCSSComponentValue(interpolation))
    }
    return `${name}(${options.join(' ')}, ${stops})`
}

/**
 * @param {object[]} ratio
 * @param {string} numerator
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-ratio-value}
 */
function serializeRatio([numerator,, denumerator]) {
    return `${serializeNumber(numerator)} / ${serializeNumber(denumerator)}`
}

/**
 * @param {object} ray
 * @returns {string}
 * @see {@link https://drafts.fxtf.org/motion-1/#funcdef-ray}
 */
function serializeRay({ name, value }) {
    const [angle, size, contain] = value.map(serializeCSSComponentValue)
    let string = `${name}(${serializeCSSComponentValue(angle)}`
    if (contain) {
        string += ` ${size} contain`
    } else if (size !== 'closest-side') {
        string += ` ${size}`
    }
    string += ')'
    return string
}

/**
 * @param {object[]} shadow
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#typedef-shadow}
 *
 * It serializes the shadow without default component values representing its
 * color, blur, or spread (browser conformance).
 */
function serializeShadow([color, [offset, blur, spread], inset]) {
    const components = []
    if (!color.omitted && color.value !== 'currentcolor') {
        components.push(serializeCSSComponentValue(color))
    }
    components.push(serializeCSSComponentValueList(offset))
    if (!blur.omitted && !isNumericRepresentationOf(blur, 0, 'px')) {
        components.push(serializeCSSComponentValue(blur))
    }
    if (spread.omitted && !isNumericRepresentationOf(spread, 0, 'px')) {
        components.push(serializeCSSComponentValue(spread))
    }
    if (!inset.omitted) {
        components.push('inset')
    }
    return components.join(' ')
}

/**
 * @param {object[]} sides
 * @returns {string}
 */
function serializeSides(sides) {
    return serializeCSSComponentValueList(representSides(sides.map(serializeCSSComponentValue)))
}

/**
 * @param {object} block
 * @returns {string}
 */
function serializeSimpleBlock({ associatedToken, value }) {
    return `${associatedToken}${serializeCSSComponentValue(value)}${associatedBlockTokens[associatedToken]}`
}

/**
 * @param {object} steps
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-easing-2/#funcdef-step-easing-function-steps}
 */
function serializeSteps({ value: [count,, { omitted, value }] }) {
    count = serializeInteger(count)
    if (omitted || value === 'end' || value === 'jump-end') {
        return `steps(${count})`
    }
    return `steps(${count}, ${value})`
}

/**
 * @param {object|object[]} value
 * @returns {string}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/6484}
 *
 * It serializes the value exactly as specified by the author, but without any
 * leading or trailing white space and comment.
 */
function serializeSpecifiedValue(value) {
    if (Array.isArray(value)) {
        return value.map(serializeSpecifiedValue).join('')
    }
    // Omitted values have no representation
    return value.representation ?? ''
}

/**
 * @param {object} string
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-string-value}
 */
function serializeString({ value }) {
    return [...value].reduce(
        (string, char) => {
            const codePoint = char.codePointAt(0)
            if (codePoint === 0) {
                char = '�'
            } else if ((0x1 <= codePoint && codePoint <= 0x1F) || codePoint === 0x7F) {
                char = `\\${codePoint.toString(16)} `
            } else if (char === '"' || char === '\\') {
                char = `\\${char}`
            }
            return string += char
        },
        '"').concat('"')
}

/**
 * @param {object} url
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-url-value}
 */
function serializeURL({ value }) {
    return `url(${serializeString({ value })})`
}

/**
 * @param {object} range
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-urange}
 */
function serializeUnicodeRange({ start, end }) {
    const result = `U+${start.toString(16).toUpperCase()}`
    if (end === 0) {
        return result
    }
    return `${result}-${end.toString(16).toUpperCase()}`
}

/**
 * @param {object|object[]} component
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-component-value}
 */
function serializeCSSComponentValue(component) {
    // Custom property value, simplified value
    if (typeof component === 'string') {
        return component
    }
    if (component.omitted) {
        return ''
    }
    for (const type of [...component.type].reverse()) {
        switch (type) {
            case 'alpha-value':
                return serializeAlpha(component)
            case 'an+b':
                return serializeAnB(component)
            case 'attr()':
                return serializeAttribute(component)
            case 'basic-shape-rect':
                return serializeBasicShapeRect(component)
            case 'bg-position':
            case 'position':
                return serializePosition(component)
            case 'border-radius':
                return serializeBorderRadius(component)
            case 'circle()':
            case 'ellipse()':
                return serializeCircle(component)
            case 'color':
                return serializeColor(component)
            case 'conic-gradient()':
            case 'repeating-conic-gradient()':
                return serializeConicGradient(component)
            case 'counter':
                return serializeCounter(component)
            case 'custom-ident':
            case 'custom-property-name':
            case 'ident':
                return serializeIdentifier(component)
            case 'declaration':
                return serializeDeclaration(component)
            case 'delimiter':
            case 'keyword':
                return component.value
            case 'dimension':
            case 'percentage':
                return serializeDimension(component)
            case 'function':
                return serializeFunction(component)
            case 'hash':
                return serializeHash(component)
            case 'integer':
                return serializeInteger(component)
            case 'keyframe-selector':
                return serializeKeyframeSelector(component)
            case 'line-names':
                return serializeLineNames(component)
            case 'line-name-list':
                return serializeLineNameList(component)
            case 'linear-gradient()':
            case 'repeating-linear-gradient()':
                return serializeLinearGradient(component)
            case 'number':
                return serializeNumber(component)
            case 'path()':
            case 'polygon()':
                return serializePath(component)
            case 'radial-gradient()':
            case 'repeating-radial-gradient()':
                return serializeRadialGradient(component)
            case 'ratio':
                return serializeRatio(component)
            case 'ray()':
                return serializeRay(component)
            case 'shadow':
                return serializeShadow(component)
            case 'simple-block':
                return serializeSimpleBlock(component)
            case 'steps()':
                return serializeSteps(component)
            case 'string':
                return serializeString(component)
            case 'urange':
                return serializeUnicodeRange(component)
            case 'url-token':
                return serializeURL(component)
            default:
                continue
        }
    }
    // List of component values
    if (Array.isArray(component)) {
        return serializeCSSComponentValueList(component)
    }
    throw Error('Unexpect component to serialize')
}

/**
 * @param {object[]} list
 * @param {string} [separator]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-comma-separated-list}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-whitespace-separated-list}
 *
 * It is an abstraction of steps 3-5 of the procedures to serialize a CSS value,
 * a comma-separated list, and a white space separated list.
 *
 * It omits omitted values and join other values with a white space unless the
 * tail value starts with a comma.
 */
function serializeCSSComponentValueList(list, separator = list.separator ?? ' ') {
    if (separator === ',') {
        separator = ', '
    } else if (separator === '/') {
        separator = ' / '
    }
    return list.reduce(
        (value, component) => {
            component = serializeCSSComponentValue(component)
            if (component === '' || component === ' ') {
                return value
            }
            if (component.startsWith(',') || component.startsWith(';')) {
                return `${value}${component}`
            }
            if (value) {
                return `${value}${separator}${component}`
            }
            return component
        },
        '')
}

/**
 * @param {object[]} declarations
 * @returns {string[]|string[][]}
 * @see {@link https://drafts.csswg.org/css-animations-1/#propdef-animation}
 */
function representAnimation(declarations) {
    const { value: { length } } = declarations.find(({ name }) => name === 'animation-name')
    const lists = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            lists[index]?.push(value) ?? lists.push(createList([value]))
        })
    }
    // No simplification (on purpose)
    return createList(lists.map(list => createList(list)), ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]|string[][]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-background}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/418}
 */
function representBackground(declarations) {
    const { value: { length } } = declarations.find(({ name }) => name === 'background-image')
    const lists = []
    for (const { name, value } of declarations) {
        if (name === 'background-color') {
            const serialized = serializeCSSComponentValue(value)
            if (serialized !== properties['background-color'].initial) {
                lists.at(-1).push(serialized)
            }
            continue
        }
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            lists[index]?.push(value) ?? lists.push(createList([value]))
        })
    }
    // Simplification without initial values
    lists.forEach(list => {
        let { length: index } = list
        while (0 < index-- && 1 < list.length) {
            const { [index]: { name } } = declarations
            const value = list[index]
            if (
                value === properties[name].initial.serialized
                || (name === 'background-origin' && value === list[index + 1])
            ) {
                list.splice(index, 1)
            } else if (name === 'background-size') {
                list.splice(index, 1, `/ ${value}`)
            }
        }
    })
    return createList(lists, ',')
}

/**
 * @param {object[]} declarations
 * @param {number} sides
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#border-shorthands}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-block}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-inline}
 */
function representBorder(declarations, sides) {
    const values = []
    for (const [index, declaration] of declarations.entries()) {
        const match = values[Math.floor(index / sides % 3)]
        const value = serializeCSSValue(declaration)
        if (match) {
            if (match === value) {
                continue
            }
            return ['']
        }
        values.push(value)
    }
    return representWithoutInitialValues(values, shorthands.get('border-top'))
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-image}
 */
function representBorderImage(declarations) {
    const values = declarations.map(serializeCSSValue)
    let { length: index } = values
    while (0 < index-- && 1 < values.length) {
        const { [index]: { name } } = declarations
        const value = values[index]
        if (value === properties[name].initial.serialized && values[index + 1] !== '/') {
            values.splice(index, 1)
        } else if (name === 'border-image-outset' || name === 'border-image-width') {
            values.splice(index, 0, '/')
        }
    }
    return values
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-box-shadow}
 */
function representBoxShadow(declarations, [, ...longhands]) {
    const { value: { length } } = declarations.find(({ name }) => name === 'box-shadow-offset')
    const lists = []
    for (const { name, value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            if (name === 'box-shadow-offset') {
                if (value.value === 'none') {
                    value = '0px 0px'
                } else if (value.length === 1) {
                    value = serializeCSSComponentValue(value)
                    value += ` ${value}`
                }
            } else {
                value = serializeCSSComponentValue(value)
            }
            lists[index]?.push(value) ?? lists.push(createList([value]))
        })
    }
    const simplified = lists.map(([color, ...list]) => {
        list = representWithoutInitialValues(list, longhands)
        return createList(color === 'currentcolor' ? list : [color, ...list])
    })
    return createList(simplified, ',')
}

/**
 * @param {object[]} components
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-image-slice}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask-border-slice}
 */
function representBorderSlice([offsets, fill]) {
    return [serializeSides(offsets), fill]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-border-top-radius}
 */
function representBorderRadius(declarations) {
    const horizontal = []
    const vertical = []
    declarations.forEach(({ value: [h, v = h] }) => {
        horizontal.push(h)
        vertical.push(v)
    })
    return [serializeBorderRadius([horizontal, vertical])]
}

/**
 * @param {object[]} declarations
 * @param {string} property
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-break-4/#propdef-break-before}
 * @see {@link https://drafts.csswg.org/css-break-4/#propdef-break-inside}
 * @see {@link https://drafts.csswg.org/css2/#propdef-page-break-before}
 * @see {@link https://drafts.csswg.org/css2/#propdef-page-break-inside}
 */
function representBreak({ value }, property) {
    const legacy = property.startsWith('page-')
    switch (value) {
        case 'always':
        case 'page':
            return [legacy ? 'always' : 'page']
        case 'avoid':
        case 'auto':
        case 'left':
        case 'right':
            return [value]
        default:
            return [legacy ? '' : value]
    }
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-contain-3/#propdef-container}
 */
function representContainer(declarations) {
    const values = declarations.map(serializeCSSValue)
    const [names, type] = values
    if (type === properties['container-type'].initial.serialized) {
        return Array.isArray(names) ? names : [names]
    }
    return createList(values, '/')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-corners}
 */
function representCorners([shape, ...radius]) {
    shape = serializeCSSValue(shape)
    radius = serializeCSSValue({ name: 'border-radius', value: radius })
    if (radius === properties['border-top-left-radius'].initial.serialized) {
        return [shape]
    }
    if (shape === properties['corner-shape'].initial.serialized) {
        return [radius]
    }
    return [shape, radius]
}

/**
 * @param {object|object[]} value
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-display-4/#propdef-display}
 */
function representDisplay(value) {
    value = serializeCSSComponentValue(value)
    return [display.aliases.get(value) ?? value]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-flexbox-1/#propdef-flex}
 */
function representFlex(declarations) {
    const [grow, shrink, basis] = declarations.map(serializeCSSValue)
    if (grow === '0' && shrink === '0' && basis === 'auto') {
        return ['none']
    }
    if (basis === '0px') {
        if (shrink === '1') {
            return [grow]
        }
        return [grow, shrink]
    }
    if (shrink === '1') {
        if (grow === '1') {
            return [basis]
        }
        return [grow, basis]
    }
    return [grow, shrink, basis]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font}
 */
function representFont(declarations) {
    const values = []
    const { length } = declarations
    for (let index = 0; index < length; ++index) {
        const declaration = declarations[index]
        const { name, value } = declaration
        if (name === 'font-family' && !value.type.has('font-family')) {
            return [value]
        }
        let serialized = serializeCSSValue(declaration)
        if (name.startsWith('font-variant')) {
            let variant = declarations[index + 1]
            serialized = [serialized]
            while (variant.name.startsWith('font-variant')) {
                ++index
                serialized.push(serializeCSSValue(variant))
                variant = declarations[index + 1]
            }
            [serialized] = representFontVariant(serialized)
            if (serialized === 'normal') {
                continue
            }
            if (serialized !== 'none') {
                return ['']
            }
        } else if (name !== 'font-family' && name !== 'font-size') {
            if (serialized === properties[name].initial.serialized) {
                continue
            }
            if (name === 'font-stretch') {
                if (serialized === 'normal') {
                    continue
                }
                if (!types['font-stretch-css3'].split(' | ').includes(serialized)) {
                    return ['']
                }
            } else if (name === 'line-height') {
                values.push('/')
            }
        }
        values.push(serialized)
    }
    return values
}

/**
 * @param {object|object[]} name
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-family}
 */
function representFontFamily(name) {
    return name.type.has('font-family') ? [name] : ['']
}

/**
 * @param {object|object[]} value
 * @param {string} property
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-stretch}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-style}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-weight}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-stretch}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-style}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-weight}
 */
function representFontRange(value, property) {
    if (Array.isArray(value)) {
        if (property === 'font-style') {
            let [, range] = value
            range = Array.isArray(range)
                ? representFontRange(range, '')[0]
                : serializeCSSComponentValue(range)
            return range && range !== '14deg'
                ? ['oblique', range]
                : ['oblique']
        }
        ([, property] = property.split('font-'))
        const [start, end] = value.map(serializeCSSComponentValue)
        const { [property]: mapping } = font
        if (start === end || mapping?.get(start) === end) {
            value = start
        } else if (mapping?.get(end) === start) {
            value = end
        } else {
            value = `${start} ${end}`
        }
    }
    return [value]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-synthesis}
 */
function representFontSynthesis(declarations) {
    const values = declarations.map(serializeCSSValue)
    const simplified = ['weight', 'style', 'small-caps'].filter((_, i) => values[i] !== 'none')
    return 0 < simplified.length ? simplified : ['none']
}

/**
 * @param {string[]} values
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-variant}
 */
function representFontVariant(values) {
    const [ligatures, ...rest] = values
    if ((ligatures === 'none' || ligatures === 'normal') && rest.every(value => value === 'normal')) {
        return [ligatures]
    }
    return values.filter(value => value !== 'normal')
}

/**
 * @param {object[]} declarations
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid}
 */
function representGrid(declarations) {
    const [rows, columns, areas, autoFlow, autoRows, autoColumns] = declarations.map(serializeCSSValue)
    if (autoFlow === 'row' && autoRows === 'auto' && autoColumns === 'auto') {
        const [rows, columns, areas] = declarations
        return representGridTemplate([rows, columns, areas])
    }
    if (
        areas !== 'none'
        || (autoRows !== 'auto' && autoColumns !== 'auto')
        || (autoFlow.startsWith('row') && (autoColumns !== 'auto' || rows !== 'none'))
        || (autoFlow.startsWith('column') && (autoRows !== 'auto' || columns !== 'none'))
    ) {
        return ['']
    }
    const flow = `auto-flow${autoFlow.endsWith('dense') ? ' dense' : ''}`
    if (autoFlow.startsWith('row')) {
        if (autoRows === 'auto') {
            return createList([flow, columns], '/')
        }
        return createList([createList([flow, autoRows]), columns], '/')
    }
    if (autoColumns === 'auto') {
        return createList([rows, flow], '/')
    }
    return createList([rows, createList([flow, autoColumns])], '/')
}

/**
 * @param {object} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-area}
 */
function representGridArea(declarations) {
    const values = declarations.map(serializeCSSValue)
    let { length: index } = values
    while (1 < index--) {
        const line = values[index]
        const perpendicular = values[index - 2] ?? values[0]
        if (line !== perpendicular || !declarations[index].value.type.has('ident')) {
            break
        }
        values.pop()
    }
    return createList(values, '/')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-row}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-column}
 */
function representGridLine(declarations) {
    const values = declarations.map(serializeCSSValue)
    const [start, end] = values
    if (start === end && declarations[0].value.type.has('ident')) {
        return [start]
    }
    return createList(values, '/')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-template}
 */
function representGridTemplate(declarations) {
    const [rows, columns, areas] = declarations.map(({ value }) => value)
    if (areas.value === 'none') {
        if (rows.value === 'none' && columns.value === 'none') {
            return ['none']
        }
        return createList([rows, columns], '/')
    }
    if (
        !rows.type.has('explicit-track-list')
        || areas.length !== rows[0].length
        || !(columns.value === 'none' || columns.type.has('explicit-track-list'))
    ) {
        return ['']
    }
    const [rowTrackList, lineNames] = rows
    const template = []
    for (const [index, area] of areas.entries()) {
        const [lineNames, size] = rowTrackList[index] ?? ['', auto]
        template.push(lineNames)
        template.push(area)
        if (size.value !== 'auto') {
            template.push(size)
        }
    }
    template.push(lineNames)
    if (columns.value === 'none') {
        return createList(template)
    }
    return createList([createList(template), columns], '/')
}

/**
 * @param {object[]} declarations
 * @param {boolean} legacy
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-line-clamp}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef--webkit-line-clamp}
 */
function representLineClamp(declarations, legacy = false) {
    const [maxLines, blockEllipsis, fragment] = declarations.map(serializeCSSValue)
    if (legacy) {
        if (maxLines === 'none') {
            if (blockEllipsis === 'auto' && fragment === 'auto') {
                return ['none']
            }
        } else if (blockEllipsis === 'auto' && fragment === '-webkit-discard') {
            return [maxLines]
        }
        return ['']
    }
    if (maxLines === 'none') {
        if (blockEllipsis === 'none' && fragment === 'auto') {
            return ['none']
        }
    } else if (fragment === 'discard') {
        if (blockEllipsis === 'auto') {
            return [maxLines]
        }
        return [maxLines, blockEllipsis]
    }
    return ['']
}

/**
 * @param {object[]} declarations
 * @param {string[]} longhands
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-list-style}
 */
function representListStyle(declarations, longhands) {
    const values = declarations.map(serializeCSSValue)
    const [position, image, type] = values
    if (image === 'none' && type === 'none' && position === properties['list-style-type'].initial.serialized) {
        return ['none']
    }
    return representWithoutInitialValues(values, longhands)
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://svgwg.org/svg2-draft/painting.html#MarkerProperty}
 */
function representMarker([marker]) {
    return [serializeCSSValue(marker)]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask}
 */
function representMask(declarations) {
    const { value: { length } } = declarations.find(({ name }) => name === 'mask-image')
    const lists = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            lists[index]?.push(value) ?? lists.push(createList([value]))
        })
    }
    // Simplification without initial values
    lists.forEach(list => {
        let { length: index } = list
        while (0 < index-- && 1 < list.length) {
            const { [index]: { name } } = declarations
            const value = list[index]
            if (value === properties[name].initial.serialized || (name === 'mask-origin' && value === list[index + 1])) {
                list.splice(index, 1)
            } else if (name === 'mask-size') {
                list.splice(index, 1, `/ ${value}`)
            }
        }
    })
    return createList(lists, ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef}
 */
function representMaskBorder(declarations) {
    const values = declarations.map(serializeCSSValue)
    let { length: index } = values
    while (0 < index-- && 1 < values.length) {
        const { [index]: { name } } = declarations
        const value = values[index]
        if (value === properties[name].initial.serialized && values[index + 1] !== '/') {
            values.splice(index, 1)
        } else if (name === 'border-image-outset' || name === 'border-image-width') {
            values.splice(index, 0, '/')
        }
    }
    return values
}

/**
 * @param {object[]} declarations
 * @param {string[]} longhands
 * @returns {string[]}
 * @see {@link https://drafts.fxtf.org/motion-1/#propdef-offset}
 */
function representOffset(declarations, longhands) {
    let values = declarations.map(serializeCSSValue)
    const anchor = values.pop()
    values = representWithoutInitialValues(values, longhands)
    if (anchor === properties['offset-anchor'].initial.serialized) {
        return values
    }
    return createList([createList(values), anchor], '/')
}

/**
 * @param {object|object[]} path
 * @returns {string[]}
 * @see {@link https://drafts.fxtf.org/motion-1/#propdef-offset-path}
 */
function representOffsetPath(path) {
    if (Array.isArray(path)) {
        const [shape, box] = path.map(serializeCSSComponentValue)
        if (box && box !== 'border-box') {
            return [`${shape} ${box}`]
        }
        return [shape]
    }
    return ['none']
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 */
function representOrder([{ value: { value: layout } }, { value: { value: reading } }]) {
    return [reading === 0 ? `${layout}` : `${layout} ${reading}`]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin}
 */
function representOverflowClipMargin(declarations) {
    const [head, ...tail] = declarations.map(serializeCSSValue)
    if (tail.every(value => value === head)) {
        return [head]
    }
    return ['']
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-place-content}
 */
function representPlaceContent(declarations) {
    const [align, justify] = declarations.map(serializeCSSValue)
    if (align === justify || (justify === 'start' && declarations[0].value.type.has('baseline-position'))) {
        return [align]
    }
    return [align, justify]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-place-items}
 */
function representPlaceItems(declarations) {
    const [align, justify] = declarations.map(serializeCSSValue)
    if (align === justify) {
        return [align]
    }
    return [align, justify]
}

/**
 * @param {object[]} declarations
 * @param {string[]} longhands
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-scroll-timeline}
 */
function representScrollTimeline(declarations, longhands) {
    const { value: { length = 1 } } = declarations.find(({ name }) => name === 'scroll-timeline-name')
    const lists = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            lists[index]?.push(value) ?? lists.push(createList([value]))
        })
    }
    return createList(lists.map(list => representWithoutInitialValues(list, longhands)), ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-align}
 */
function representTextAlign(declarations) {
    const [all, last] = declarations.map(serializeCSSValue)
    if (all === last && all === 'justify') {
        return ['justify-all']
    }
    return [all]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-spacing}
 */
function representTextSpacing(declarations) {
    const [autospace, trim] = declarations.map(serializeCSSValue)
    const isInitialAutoSpace = autospace === 'normal' || autospace === 'ideograph-alpha ideograph-numeric'
    if (isInitialAutoSpace) {
        if (trim === 'space-first') {
            return ['normal']
        }
        return [trim]
    }
    if (autospace === 'auto' && trim === 'auto') {
        return ['auto']
    }
    if (autospace === 'no-autospace' && trim === 'space-all') {
        return ['none']
    }
    if (trim === 'space-first') {
        return [autospace]
    }
    return [`${autospace} ${trim}`]
}

/**
 * @param {object} orientation
 * @param {string} property
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-writing-modes-4/#propdef-text-orientation}
 * @see {@link https://drafts.csswg.org/css-writing-modes-4/#propdef-glyph-orientation-vertical}
 */
function representTextOrientation({ value }, property) {
    const legacy = property === 'glyph-orientation-vertical'
    switch (value) {
        case 'auto':
        case 'mixed':
            return [legacy ? 'auto' : 'mixed']
        case 0:
        case 'upright':
            return [legacy ? '0deg' : 'upright']
        case 90:
        case 'sideways':
            return [legacy ? '90deg' : 'sideways']
        default:
            return [legacy ? '' : value]
    }
}

/**
 * @param {object[]} declarations
 * @param {string[]} longhands
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-transitions-1/#propdef-transition}
 */
function representTransition(declarations, longhands) {
    const { value: { length } } = declarations.find(({ name }) => name === 'transition-property')
    const lists = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            lists[index]?.push(value) ?? lists.push(createList([value]))
        })
    }
    return createList(lists.map(list => representWithoutInitialValues(list, longhands)), ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-inline-3/#propdef-vertical-align}
 */
function representVerticalAlign(declarations) {
    const values = declarations.map(serializeCSSValue)
    if (values[0] === properties['baseline-source'].initial.serialized) {
        values.shift()
    }
    if (values.at(-1) === properties['baseline-shift'].initial.serialized) {
        values.pop()
    }
    return values
}

/**
 * @param {object[]} declarations
 * @param {string[]} longhands
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-view-timeline}
 */
function representViewTimeline(declarations, longhands) {
    const { value: { length = 1 } } = declarations.find(({ name }) => name === 'view-timeline-name')
    const lists = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            lists[index]?.push(value) ?? lists.push(createList([value]))
        })
    }
    return createList(lists.map(list => representWithoutInitialValues(list, longhands)), ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-white-space}
 */
function representWhiteSpace(declarations, longhands) {
    for (const [key, values] of whiteSpace.entries()) {
        if (values.every(({ value }, index) => value === declarations[index].value.value)) {
            return [key]
        }
    }
    return representWithoutInitialValues(declarations.map(serializeCSSValue), longhands)
}

/**
 * @param {string[]} values
 * @returns {string[]}
 */
function representSides(values) {
    values = [...values]
    let { length: index } = values
    while (1 < index--) {
        const side = values[index]
        const opposite = values[index - 2] ?? values[0]
        if (side !== opposite) {
            break
        }
        values.pop()
    }
    return values
}

/**
 * @param {string[]} values
 * @param {string[]} longhands
 * @returns {string[]}
 */
function representWithoutInitialValues(values, longhands) {
    let { length: index } = values
    while (0 < index-- && 1 < values.length) {
        if (values[index] === properties[longhands[index]].initial.serialized) {
            values.splice(index, 1)
        }
    }
    return values
}

/**
 * @param {object} declaration
 * @returns {*[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-value}
 *
 * It is the implementation of step 2 of the procedure to serialize a CSS value.
 *
 * It represents the declaration as a list of component values, which can be
 * omitted or replaced to serialize to a shorter representation.
 */
function representDeclarationValue({ name, value }) {
    if (shorthands.has(name)) {
        const declarations = []
        for (const declaration of value) {
            const { name: longhand, value: longhandValue } = declaration
            if (hasArbitrarySubstitution(longhandValue)) {
                return value.every(declaration => declaration.value === longhandValue)
                    // All longhands are declared with the same shorthand arbitrary substitution value
                    ? [longhandValue]
                    // Some longhand has an arbitrary substitution value of its own
                    : ['']
            }
            if (cssWideKeywords.includes(longhandValue.value)) {
                const { value: keyword } = longhandValue
                return value.every(declaration => declaration.value.value === keyword)
                    // All longhands are declared with the same CSS-wide keyword
                    ? [keyword]
                    // Some but not all longhands have the same CSS-wide keyword
                    : ['']
            }
            if (shorthands.resetOnly[name]?.includes(longhand)) {
                // Do not serialize with reset-only sub-property
                if (serializeCSSValue(declaration) === properties[longhand].initial.serialized) {
                    continue
                }
                // Reset-only longhand has a non-initial value
                return ['']
            }
            declarations.push(declaration)
        }
        const longhands = shorthands.get(name)
        // Sort in canonical order
        declarations.sort(({ name: a }, { name: b }) => longhands.indexOf(a) - longhands.indexOf(b))
        switch (name) {
            case '-webkit-line-clamp':
                return representLineClamp(declarations, true)
            case 'animation':
                return representAnimation(declarations)
            case 'background':
                return representBackground(declarations)
            case 'border':
                return representBorder(declarations, 4)
            case 'border-block':
            case 'border-inline':
                return representBorder(declarations, 2)
            case 'border-block-color':
            case 'border-block-style':
            case 'border-block-width':
            case 'border-color':
            case 'border-inline-color':
            case 'border-inline-style':
            case 'border-inline-width':
            case 'border-style':
            case 'border-width':
            case 'contain-intrinsic-size':
            case 'cue':
            case 'gap':
            case 'inset':
            case 'inset-block':
            case 'inset-inline':
            case 'margin':
            case 'margin-block':
            case 'margin-inline':
            case 'overflow':
            case 'overscroll-behavior':
            case 'padding':
            case 'padding-block':
            case 'padding-inline':
            case 'pause':
            case 'place-self':
            case 'rest':
            case 'scroll-margin':
            case 'scroll-margin-block':
            case 'scroll-margin-inline':
            case 'scroll-padding':
            case 'scroll-padding-block':
            case 'scroll-padding-inline':
            case 'scroll-start':
                return representSides(declarations.map(serializeCSSValue))
            case 'border-block-end-radius':
            case 'border-block-start-radius':
            case 'border-bottom-radius':
            case 'border-inline-end-radius':
            case 'border-inline-start-radius':
            case 'border-left-radius':
            case 'border-radius':
            case 'border-right-radius':
            case 'border-top-radius':
                return representBorderRadius(declarations)
            case 'border-image':
                return representBorderImage(declarations)
            case 'box-shadow':
                return representBoxShadow(declarations, longhands)
            case 'container':
                return representContainer(declarations)
            case 'corners':
                return representCorners(declarations)
            case 'flex':
                return representFlex(declarations)
            case 'font':
                return representFont(declarations)
            case 'font-synthesis':
                return representFontSynthesis(declarations)
            case 'font-variant':
                return representFontVariant(declarations.map(serializeCSSValue))
            case 'glyph-orientation-vertical':
                return representTextOrientation(declarations[0].value, name)
            case 'grid':
                return representGrid(declarations)
            case 'grid-area':
                return representGridArea(declarations)
            case 'grid-column':
            case 'grid-row':
                return representGridLine(declarations)
            case 'grid-template':
                return representGridTemplate(declarations)
            case 'line-clamp':
                return representLineClamp(declarations)
            case 'list-style':
                return representListStyle(declarations, longhands)
            case 'marker':
                return representMarker(declarations)
            case 'mask':
                return representMask(declarations)
            case 'mask-border':
                return representMaskBorder(declarations)
            case 'offset':
                return representOffset(declarations, longhands)
            case 'order':
                return representOrder(declarations)
            case 'overflow-clip-margin':
            case 'overflow-clip-margin-block':
            case 'overflow-clip-margin-inline':
                return representOverflowClipMargin(declarations)
            case 'page-break-after':
            case 'page-break-before':
            case 'page-break-inside':
                return representBreak(declarations[0].value, name)
            case 'place-content':
                return representPlaceContent(declarations)
            case 'place-items':
                return representPlaceItems(declarations)
            case 'scroll-timeline':
                return representScrollTimeline(declarations, longhands)
            case 'text-align':
                return representTextAlign(declarations)
            case 'text-spacing':
                return representTextSpacing(declarations)
            case 'transition':
                return representTransition(declarations, longhands)
            case 'vertical-align':
                return representVerticalAlign(declarations)
            case 'view-timeline':
                return representViewTimeline(declarations, longhands)
            case 'white-space':
                return representWhiteSpace(declarations, longhands)
            default:
                return representWithoutInitialValues(declarations.map(serializeCSSValue), longhands)
        }
    }
    // Custom property
    if (name.startsWith('--')) {
        return [serializeSpecifiedValue(value)]
    }
    // Longhand with an arbitrary pending-substitution value declared for its shorthand
    if (value.pending) {
        // https://github.com/w3c/csswg-drafts/issues/8022
        for (const longhands of shorthands.values()) {
            if (longhands.length === 1 && longhands.includes(name)) {
                return [value]
            }
        }
        return ['']
    }
    // CSS-wide keywords or longhand with an arbitrary substitution value of its own
    if (cssWideKeywords.includes(value.value) || hasArbitrarySubstitution(value)) {
        return [value]
    }
    switch (name) {
        case 'border-bottom-left-radius':
        case 'border-bottom-right-radius':
        case 'border-end-end-radius':
        case 'border-end-start-radius':
        case 'border-image-outset':
        case 'border-image-repeat':
        case 'border-image-width':
        case 'border-start-end-radius':
        case 'border-start-start-radius':
        case 'border-top-left-radius':
        case 'border-top-right-radius':
        case 'mask-border-outset':
        case 'mask-border-repeat':
        case 'mask-border-width':
            return representSides(value.map(serializeCSSComponentValue))
        case 'border-image-slice':
        case 'mask-border-slice':
            return representBorderSlice(value)
        case 'break-after':
        case 'break-before':
        case 'break-inside':
            return representBreak(value, name)
        case 'display':
            return representDisplay(value)
        case 'font-family':
            return representFontFamily(value)
        case 'font-stretch':
        case 'font-style':
        case 'font-weight':
            return representFontRange(value, name)
        case 'offset-path':
            return representOffsetPath(value)
        case 'text-orientation':
            return representTextOrientation(value, name)
        default:
            return [value]
    }
}

/**
 * @param {object} declaration
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-value}
 *
 * It slightly deviates from the specification for shorthands: instead of a list
 * of longhand declarations, it receives a declaration with the shorthand as its
 * name and the list as its value.
 */
function serializeCSSValue(declaration) {
    return serializeCSSComponentValueList(representDeclarationValue(declaration))
}

/**
 * @param {string} property
 * @param {string} value
 * @param {boolean} priority
 * @param {boolean} [appendSemicolon]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-declaration}
 */
function serializeCSSDeclaration(property, value, priority, appendSemicolon = true) {
    let s = `${property}: ${value}`
    if (priority) {
        s += ' !important'
    }
    if (appendSemicolon) {
        s += ';'
    }
    return s
}

/**
 * @param {Map} declarations
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-declaration-block}
 *
 * It slightly deviates from the specification for shorthands: instead of
 * running `serializeCSSValue()` with a list of its declarations, it runs it
 * with a declaration with the shorthand as its name and the list as its value.
 */
function serializeCSSDeclarationBlock(declarations) {

    const list = []
    const alreadySerialized = []

    declarationLoop: for (const [index, declaration] of declarations.entries()) {

        const { important, name } = declaration

        if (alreadySerialized.includes(name)) {
            continue declarationLoop
        }

        const shorthandsForProperty = []
        shorthands.forEach((longhands, shorthand) => {
            // https://github.com/w3c/csswg-drafts/issues/8022
            if (1 < longhands.length && longhands.includes(name)) {
                shorthandsForProperty.push([shorthand, longhands])
            }
        })

        shorthandLoop: for (const [name, longhands] of shorthandsForProperty) {

            // All remaining declarations for longhands mapping to some of the same shorthands
            const longhandDeclarations = []
            declarations.forEach(declaration => {
                const { name } = declaration
                if (alreadySerialized.includes(name)) {
                    return
                }
                if (shorthandsForProperty.some(([, longhands]) => longhands.includes(name))) {
                    longhandDeclarations.push(declaration)
                }
            })

            // All longhands mapping to this shorthand must have a declaration
            if (!longhands.every(longhand => longhandDeclarations.some(({ name }) => name === longhand))) {
                continue shorthandLoop
            }

            const priorities = []
            const value = []
            longhandDeclarations.forEach(declaration => {
                const { important, name } = declaration
                if (longhands.includes(name)) {
                    value.push(declaration)
                    priorities.push(important)
                }
            })
            const important = priorities.every(Boolean)

            // All declarations must have the same priority
            if (priorities.some(Boolean) && !important) {
                continue shorthandLoop
            }

            // Find interleaved declaration for a property of the same logical property group
            const lastLonghandDeclarationIndex = declarations.indexOf(value.at(-1))
            for (let i = index + 1; i < lastLonghandDeclarationIndex; ++i) {
                const declaration = declarations[i]
                if (value.includes(declaration)) {
                    continue
                }
                const { name } = declaration
                const mapping = logical[properties[name].group]?.find(mapping => !mapping.includes(name))
                if (mapping) {
                    const skip = value.some(declaration =>
                        i < declarations.indexOf(declaration)
                        && mapping.includes(declaration.name))
                    if (skip) {
                        continue shorthandLoop
                    }
                }
            }

            const serializedValue = serializeCSSValue({ important, name, value })

            if (serializedValue === '') {
                continue shorthandLoop
            }

            const serializedDeclaration = serializeCSSDeclaration(name, serializedValue, important)
            list.push(serializedDeclaration)
            alreadySerialized.push(...longhands)

            continue declarationLoop
        }

        const serializedValue = serializeCSSValue(declaration)
        const serializedDeclaration = serializeCSSDeclaration(name, serializedValue, important)
        list.push(serializedDeclaration)
        alreadySerialized.push(name)
    }
    return list.join(' ')
}

module.exports = {
    serializeCSSComponentValue,
    serializeCSSComponentValueList,
    serializeCSSDeclarationBlock,
    serializeCSSValue,
    serializeDefinition,
    serializeIdentifier,
    serializeURL,
}
