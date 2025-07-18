
const { MAX_INTEGER, MIN_INTEGER } = require('./values/integers.js')
const { canonicalize, definitions: dimensions, getCanonicalUnitFromType } = require('./values/dimensions.js')
const { clamp, isDegenerate, safeFloat, toEightBit } = require('./utils/math.js')
const { combinators, isCombination, isCompound, isMultiplied } = require('./utils/node.js')
const { hslToRgb, hwbToRgb } = require('./utils/color.js')
const { isBlock, isCalculationOperator, isComma, isList, isNumeric, isOmitted } = require('./utils/value.js')
const { isDigit, isIdentifierCharacter, isNonASCIIIdentifierCharacter } = require('./parse/tokenize.js')
const { list, map, string } = require('./values/value.js')
const { auto } = require('./values/defaults.js')
const blocks = require('./values/blocks.js')
const { keywords: cssWideKeywords } = require('./values/substitutions.js')
const display = require('./values/display.js')
const logical = require('./properties/logical.js')
const properties = require('./properties/definitions.js')
const shorthands = require('./properties/shorthands.js')
const types = require('./values/definitions.js')
const whiteSpace = require('./values/white-space.js')

// UAs must support at least 20 repetitions
const MAX_REPETITIONS = 20

const sRGBColorFunctions = ['hsl', 'hsla', 'hwb', 'rgb', 'rgba']

/**
 * @param {object} alpha
 * @param {boolean} [is8Bit]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-4/#serializing-alpha-values}
 */
function serializeAlpha({ types, value }, is8Bit) {
    if (types.includes('<percentage>')) {
        value /= 100
    }
    if (is8Bit) {
        const alpha = Math.round(value * 255)
        const integer = Math.round(value * 100)
        if (Math.round(safeFloat(integer * 2.55)) === alpha) {
            value = integer / 100
        } else {
            value = Math.round(alpha / 0.255) / 1000
        }
    }
    return serializeNumber({ value })
}

/**
 * @param {object[]} value
 * @param {string} context
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-5/#comma-containing-productions}
 */
function serializeCommaContainingValue(value, context) {
    const string = serializeCSSComponentValueList(value, context)
    if (context === 'var') {
        return string.startsWith('{') ? `{${string}}` : string
    }
    if (context && value.some(value => isComma(value) || isBlock(value, '{'))) {
        return `{${string}}`
    }
    return string
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
    const [name, syntax,, fallback] = value.map(serializeCSSComponentValue)
    if (syntax === 'raw-string' && fallback === '""') {
        return `attr(${name})`
    }
    let string = `attr(${name}`
    if (syntax) {
        string += ` ${syntax}`
    }
    if (fallback) {
        string += `, ${fallback}`
    }
    string += ')'
    return string
}

/**
 * @param {object[]} arc
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-2/#typedef-shape-arc-command}
 */
function serializeArcCommand([, endpoint, [[, radius], sweep, size, rotation]]) {
    let string = `arc ${serializeCSSComponentValue(endpoint)} of ${serializeSides(radius)}`
    if (sweep.value === 'cw') {
        string += ' cw'
    }
    if (size.value === 'large') {
        string += ' large'
    }
    rotation = serializeCSSComponentValue(rotation)
    if (rotation && rotation !== 'rotate 0deg') {
        string += ` ${rotation}`
    }
    return string
}

/**
 * @param {object[]} position
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-align-3/#typedef-baseline-position}
 */
function serializeBaselinePosition([place]) {
    if (isOmitted(place) || place.value === 'first') {
        return 'baseline'
    }
    return 'last baseline'
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
    if (isOmitted(corners)) {
        return `${name}(${value})`
    }
    const radius = serializeBorderRadius(corners[1])
    if (radius === '0px') {
        return `${name}(${value})`
    }
    return `${name}(${value} round ${radius})`
}

/**
 * @param {object} block
 * @returns {string}
 */
function serializeBlock({ associatedToken, value }) {
    value = serializeCSSComponentValue(value)
    if (value && associatedToken === '{') {
        value = ` ${value} `
    }
    return `${associatedToken}${value}${blocks.associatedTokens[associatedToken]}`
}

/**
 * @param {object[][]} radii
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-border-radius}
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
 * @param {string[]} types
 * @returns {number}
 */
function getCalculationTypeOrder(types) {
    for (const type of types) {
        if (type === '<number>') {
            return 0
        }
        if (type === '<percentage>') {
            return 1
        }
        if (type === '<dimension>') {
            return 2
        }
    }
    return 3
}

/**
 * @param {object[]} nodes
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#sort-a-calculations-children}
 */
function sortCalculation(nodes) {
    return nodes.sort(({ types: a, unit: ua }, { types: b, unit: ub }) => {
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
 * @param {object} parent
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-calculation-tree}
 */
function serializeCalculation(calculation, parent) {
    const { name, types, value } = calculation
    switch (types[0]) {
        case '<calc-product>': {
            const [head, ...tail] = sortCalculation(calculation)
            const product = tail.reduce(
                (product, child) => {
                    if (child.types[0] === '<calc-invert>') {
                        product += ` / ${serializeCalculation(child.value, calculation)}`
                    } else {
                        product += ` * ${serializeCalculation(child, calculation)}`
                    }
                    return product
                },
                serializeCalculation(head, calculation))
            if (parent && isCalculationOperator(parent)) {
                return `(${product})`
            }
            return product
        }
        case '<calc-sum>': {
            const [head, ...tail] = sortCalculation(calculation)
            const sum = tail.reduce(
                (sum, child) => {
                    const { types, value } = child
                    if (types[0] === '<calc-negate>') {
                        sum += ` - ${serializeCalculation(value, calculation)}`
                    } else if (typeof value === 'number' && value < 0) {
                        sum += ` - ${serializeCalculation({ ...child, value: 0 - value }, calculation)}`
                    } else {
                        sum += ` + ${serializeCalculation(child, calculation)}`
                    }
                    return sum
                },
                serializeCalculation(head, calculation))
            if (parent && isCalculationOperator(parent)) {
                return `(${sum})`
            }
            return sum
        }
        case '<dimension-token>':
        case '<percentage-token>':
            return isDegenerate(calculation.value) ? serializeDegenerate(calculation) : serializeDimension(calculation)
        case '<number-token>':
            return isDegenerate(calculation.value) ? serializeDegenerate(calculation) : serializeNumber(calculation)
        case '<ident-token>':
            return value
        case '<function>':
            if (name === 'calc-interpolate') {
                return serializeInterpolate(calculation)
            }
            if (name === 'random') {
                return serializeRandom(calculation)
            }
            if (name === 'round') {
                return serializeRound(calculation)
            }
            return serializeFunction(calculation)
        default:
            throw RangeError('Unrecognized calculation type')
    }
}

/**
 * @param {object} fn
 * @param {boolean} [forComputedOrLater]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-math-function}
 */
function serializeCalculationFunction({ range = {}, round, value }, forComputedOrLater = false) {
    if (isNumeric(value)) {
        // Unwrap the resolved value from the math function
        if (forComputedOrLater) {
            return serializeCalculation(map(value, value => {
                // Round to match <integer>
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
                return clamp(min, value, max)
            }))
        }
        return `calc(${serializeCalculation(value)})`
    }
    if (isCalculationOperator(value)) {
        return `calc(${serializeCalculation(value)})`
    }
    return serializeCalculation(value)
}

/**
 * @param {object} color
 * @param {string} [context]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-4/#serializing-color-values}
 */
function serializeColor({ name, types, value }, specified) {
    if (types.includes('<keyword>')) {
        return value
    }
    if (types.includes('<color-interpolate()>')) {
        return `color-interpolate(${serializeCSSComponentValueList(value, name)})`
    }
    if (types.includes('<color-mix()>')) {
        return `color-mix(${serializeCSSComponentValueList(value, name)})`
    }
    if (types.includes('<contrast-color()>')) {
        return `contrast-color(${serializeColor(value, name)})`
    }
    if (types.includes('<legacy-device-cmyk-syntax>')) {
        return `device-cmyk(${serializeCSSComponentValueList(list(value))})`
    }
    if (types.includes('<light-dark()>')) {
        return `light-dark(${serializeCSSComponentValueList(value, name)})`
    }
    let alpha
    if (types.includes('<hex-color>')) {
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
        if (alpha && alpha < 1) {
            return `rgba(${value.join(', ')}, ${alpha})`
        }
        return `rgb(${value.join(', ')})`
    }
    // <color-function>
    const isSRGB = sRGBColorFunctions.includes(name)
    let resolved = true
    let source = ''
    value = value.flat(2).reduce((channels, component, index, components) => {
        let { types, value } = component
        if (isOmitted(component) || types[0] === '<delimiter-token>') {
            return channels
        }
        if (types.includes('<color>')) {
            source = `from ${serializeColor(component, name)} `
            return channels
        }
        const isAlpha = (index + 1) === components.length
        if (types.includes('<ident>')) {
            if (value === 'from') {
                return channels
            }
            if (value === 'xyz') {
                value = 'xyz-d65'
            } else if (isSRGB && value === 'none') {
                value = '0'
            }
            if (isAlpha) {
                alpha = value
            } else {
                channels.push(value)
            }
            return channels
        }
        const isHue = types.includes('<hue>')
        if (isHue && types.includes('<angle>')) {
            value = canonicalize(component).value
        } else if (types[0] === '<function>') {
            // Only extract a resolved math function value for sRGB color functions
            if (!isSRGB || value === undefined || !isNumeric(value, true)) {
                resolved = false
                value = serializeCalculationFunction(component)
                if (isAlpha) {
                    alpha = value
                } else {
                    channels.push(value)
                }
                return channels
            }
            ({ types, value } = value)
        }
        if (isAlpha) {
            value = clamp(0, value, types.includes('<percentage>') ? 100 : 1)
            value = serializeAlpha({ types, value }, true)
            if (value < 1) {
                alpha = value
            }
            return channels
        }
        if (isHue) {
            if (Number.isFinite(value)) {
                value %= 360
                if (value < 0) {
                    value += 360
                }
            } else {
                value = 0
            }
            channels.push(value)
            return channels
        }
        index = channels.length
        if (types.includes('<percentage>')) {
            switch (name) {
                case 'color':
                case 'device-cmyk':
                    value *= 0.01
                    break
                case 'ictcp':
                    value *= 0 === index ? 0.01 : 0.005
                    break
                case 'jzazbz':
                    value *= 0 === index ? 0.01 : 0.0021
                    break
                case 'jzczhz':
                    value *= 0 === index ? 0.01 : 0.0026
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
        if (source || specified) {
            channels.push(value)
            return channels
        }
        switch (name) {
            case 'hsl':
            case 'hsla':
                // Clamp saturation and lightness
                value = clamp(0, value, 100)
                break
            case 'hwb':
                // Clamp whiteness and blackness
                value = clamp(0, value, 100)
                break
            case 'lab':
                // Clamp lightness
                value = index === 0 ? clamp(0, value, 100) : value
                break
            case 'lch':
                // Clamp lightness and negative chromaticity
                value = index === 0 ? clamp(0, value, 100) : Math.max(0, value)
                break
            case 'oklab':
                // Clamp lightness
                value = index === 0 ? clamp(0, value, 1) : value
                break
            case 'oklch':
                // Clamp lightness and negative chromaticity
                value = index === 0 ? clamp(0, value, 1) : Math.max(0, value)
                break
            case 'rgb':
            case 'rgba':
                // Clamp all channels
                value = clamp(0, value, 255)
                break
        }
        channels.push(value)
        return channels
    }, [])

    if (!resolved || source || specified) {
        if (name === 'rgba' || name === 'hsla') {
            name = name.slice(0, -1)
        }
        value = value.map(value => typeof value === 'number' ? serializeNumber({ value }) : value).join(' ')
        if (alpha) {
            return `${name}(${source}${value} / ${alpha})`
        }
        return `${name}(${source}${value})`
    }

    if (name === 'hsl' || name === 'hsla') {
        value = hslToRgb(...value).map(toEightBit)
    } else if (name === 'hwb') {
        value = hwbToRgb(...value).map(toEightBit)
    } else if (name === 'rgb') {
        value = value.map(Math.round)
    }
    value = value.map(value => typeof value === 'number' ? serializeNumber({ value }) : value)

    if (alpha) {
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
 * @param {object[]} stop
 * @param {object} node
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-angular-color-stop}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-linear-color-stop}
 */
function serializeColorStop([color, position]) {
    color = serializeCSSComponentValue(color)
    if (isOmitted(position)) {
        return color
    }
    if (position.length === 2) {
        const [p1, p2] = position.map(serializeCSSComponentValue)
        return `${color} ${p1}, ${color} ${p2}`
    }
    return `${color} ${serializeCSSComponentValue(position)}`
}

/**
 * @param {object[]} stripe
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-color-stripe}
 */
function serializeColorStripe([color, thickness]) {
    if (isOmitted(thickness)) {
        thickness = '1fr'
    }
    return serializeCSSComponentValueList([color, thickness])
}

/**
 * @param {object[]} gradient
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-conic-gradient-syntax}
 */
function serializeConicGradientSyntax([configuration,, stops]) {
    stops = serializeCSSComponentValue(stops)
    if (isOmitted(configuration)) {
        return stops
    }
    const [line, interpolation] = configuration
    const options = []
    if (!isOmitted(line)) {
        const [rotation, position] = line.map(serializeCSSComponentValue)
        if (rotation && rotation !== 'from 0deg') {
            options.push(rotation)
        }
        if (position) {
            options.push(position)
        }
    }
    if (!isOmitted(interpolation) && interpolation[1].value !== 'oklab') {
        options.push(serializeCSSComponentValueList(interpolation))
    }
    if (0 === options.length) {
        return stops
    }
    return `${options.join(' ')}, ${stops}`
}

/**
 * @param {object} content
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-content-3/#funcdef-content}
 */
function serializeContent({ value }) {
    value = serializeCSSComponentValue(value)
    if (value === 'text') {
        return 'content()'
    }
    return `content(${value})`
}

/**
 * @param {object} control
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-forms-1/#funcdef-control-value}
 */
function serializeControlValue({ value }) {
    value = serializeCSSComponentValue(value)
    if (value === 'string') {
        return 'control-value()'
    }
    return `control-value(${value})`
}

/**
 * @param {object} counter
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-typedef-counter}
 */
function serializeCounter({ name, value }) {
    const style = value.at(-1)
    if (isOmitted(style) || style.value === 'decimal') {
        value = value.slice(0, -2)
    }
    return `${name}(${serializeCSSComponentValueList(value)})`
}

/**
 * @param {object[]} definition
 * @returns {string}
 */
function serializeCustomFunctionDefinition(definition) {
    const strings = definition.map(serializeCSSComponentValue)
    if (strings.at(-1) === 'returns type(*)') {
        strings.pop()
    }
    return strings.join(' ')
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
 * @param {number} [parentPrecedence]
 * @returns {string}
 */
function serializeDefinition(definition, parentPrecedence = 0) {
    const { associatedToken, max, min, name, range, separator, test, type, value } = definition
    if (isMultiplied({ definition })) {
        let string = ''
        string = serializeDefinition(value)
        if (isCombination({ definition: value }) || isCompound({ definition: value }) || value.type === 'optional' || string.endsWith('}')) {
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
    if (isCombination({ definition })) {
        const [seed, ...types] = value
        const precedence = combinators.indexOf(type)
        const combinator = type === ' ' ? type : ` ${type} `
        const string = types.reduce(
            (all, definition) => `${all}${combinator}${serializeDefinition(definition, precedence)}`,
            serializeDefinition(seed, precedence))
        if (precedence < parentPrecedence) {
            return `[${string}]`
        }
        return string
    }
    if (name === '<keyword>') {
        return range
    }
    if (type === 'block') {
        if (associatedToken === '[') {
            return `'['${serializeDefinition(value)}']'`
        }
        return `${associatedToken}${serializeDefinition(value)}${blocks.associatedTokens[associatedToken]}`
    }
    if (type === 'function') {
        if (name) {
            if (value) {
                return `${name}(${serializeDefinition(value)})`
            }
            return `${name}()`
        }
        return `<function-token> ${serializeDefinition(value)} )`
    }
    if (type === 'token') {
        if (name) {
            return name
        }
        if (value === ',' || value === '/' || value === ':' || value === ';') {
            return value
        }
        return `'${value}'`
    }
    if (min || max) {
        return `${name.slice(0, -1)} [${serializeDefinitionRange(min, max, name)}]>`
    }
    if (test) {
        return `${name.slice(0, -1)}[${test}]>`
    }
    return name
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
    const range = `{${serializeDefinitionRange(min, max)}}`
    return separator === ',' ? `#${range}` : range
}

/**
 * @param {number} min
 * @param {number} max
 * @param {string} type
 * @returns {string}
 */
function serializeDefinitionRange(min, max, type) {
    if (min === -Infinity) {
        min = '-∞'
    } else if (min !== 0 && type !== '<flex>' && dimensions.has(type)) {
        min = `${min}${getCanonicalUnitFromType(type)}`
    }
    if (max === Infinity || max === MAX_REPETITIONS) {
        max = '∞'
    } else if (max !== 0 && type !== '<flex>' && dimensions.has(type)) {
        max = `${max}${getCanonicalUnitFromType(type)}`
    }
    if (min === max) {
        return `${min}`
    }
    return `${min},${max}`
}

/**
 * @param {object} numeric
 * @returns {string}
 */
function serializeDegenerate({ types, unit, value }) {
    let string
    if (value === -Infinity) {
        string = '-infinity'
    } else if (value === Infinity) {
        string = 'infinity'
    } else {
        string = 'NaN'
    }
    if (types.includes('<number>')) {
        return string
    }
    if (types.includes('<percentage>')) {
        return `${string} * 1%`
    }
    for (const { canonicalUnit, units } of dimensions.values()) {
        if (units.includes(unit)) {
            return `${string} * 1${canonicalUnit}`
        }
    }
    throw RangeError('Unrecognized dimension type')
}

/**
 * @param {object} dimension
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#serialization}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-angle-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-frequency-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-length-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-percentage-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-resolution-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-time-value}
 *
 * It escapes the unit of an unknown dimension to disambiguate with scientific
 * notation.
 */
function serializeDimension(dimension) {
    const { types, unit } = dimension
    const value = serializeNumber(dimension)
    if (types[0] === '<dimension-token>' || (unit !== '%' && types.length === 1)) {
        return value + serializeIdentifier({ value: unit })
    }
    return value + unit
}

/**
 * @param {object} ellipse
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-circle}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-ellipse}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/8695}
 * @see {@link https://github.com/w3c/fxtf-drafts/issues/504}
 */
function serializeEllipse({ name, types, value }) {
    const [size, position] = value.map(serializeCSSComponentValue)
    const options = []
    if (size && size !== 'closest-side') {
        options.push(size)
    }
    if (position && (position !== 'at center center' || types.at(-1) === '<offset-path>')) {
        options.push(position)
    }
    return `${name}(${options.join(' ')})`
}

/**
 * @param {object[]} feature
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#feature-tag-value}
 */
function serializeFeatureTagValue(feature) {
    const [name, value] = feature.map(serializeCSSComponentValue)
    if (value && value === '1') {
        return name
    }
    return `${name} ${value}`
}

/**
 * @param {object} filter
 * @returns {string}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-blur}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-brightness}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-contrast}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-drop-shadow}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-grayscale}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-hue-rotate}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-invert}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-opacity}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-saturate}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-sepia}
 */
function serializeFilter({ name, value }) {
    if (name === 'drop-shadow') {
        return `drop-shadow(${serializeShadow(value)})`
    }
    value = serializeCSSComponentValue(value)
    switch (name) {
        case 'blur':
            return value === '0px' ? 'blur()' : `blur(${value})`
        case 'hue-rotate':
            return value === '0deg' ? 'hue-rotate()' : `hue-rotate(${value})`
        default:
            return value === '1' ? `${name}()` : `${name}(${value})`
    }
}

/**
 * @param {object} fn
 * @returns {string}
 */
function serializeFunction({ name, value }) {
    return `${serializeIdentifier({ value: name })}(${serializeCSSComponentValue(value, name)})`
}

/**
 * @param {object} hash
 * @returns {string}
 */
function serializeHash(hash) {
    return `#${hash.type === 'id' ? serializeIdentifier(hash) : hash.value}`
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
            if (isNonASCIIIdentifierCharacter(char) || isIdentifierCharacter(char)) {
                return identifier += char
            }
            return `${identifier}\\${char}`
        },
        '')
}

/**
 * @param {object[]} option
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-image-set-option}
 */
function serializeImageSetOption([image, descriptors]) {
    image = serializeCSSComponentValue(image)
    const [resolution, type] = descriptors.map(serializeCSSComponentValue)
    if (resolution && resolution !== '1x') {
        image += ` ${resolution}`
    }
    if (type) {
        image += ` ${type}`
    }
    return image
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
 * @param {object} interpolate
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-calc-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-color-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-transform-interpolate}
 */
function serializeInterpolate({ name, value: [[progress, ...options],, position,, output,, stops] }) {

    const [timelineEasing, easing, ...tail] = options.map(serializeCSSComponentValue)
    const parameters = [serializeCSSComponentValue(progress)]

    if (timelineEasing && timelineEasing !== 'by linear') {
        parameters.push(timelineEasing)
    }
    if (easing && easing !== 'linear') {
        parameters.push(easing)
    }
    if (0 < tail.length) {
        parameters.push(serializeCSSComponentValueList(tail))
    }

    const [from, to] = position.map(serializeCSSComponentValue)
    output = serializeCSSComponentValue(output)
    const map = [`${from}: ${output}`]

    if (to) {
        map.push(`${to}: ${output}`)
    }

    if (isOmitted(stops)) {
        return `${name}(${parameters.join(' ')}, ${map.join(', ')})`
    }

    stops.forEach(([easing,, position,, output]) => {
        easing = serializeCSSComponentValue(easing)
        const [from, to] = position.map(serializeCSSComponentValue)
        output = serializeCSSComponentValue(output)
        if (easing && easing !== 'linear') {
            map.push(`${easing}, ${from}: ${output}`)
        } else {
            map.push(`${from}: ${output}`)
        }
        if (to) {
            if (easing && easing !== 'linear') {
                map.push(`${easing}, ${to}: ${output}`)
            } else {
                map.push(`${to}: ${output}`)
            }
        }
    })

    return `${name}(${parameters.join(' ')}, ${map.join(', ')})`
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
    switch (selector.types[0]) {
        case '<ident-token>':
            return selector.value === 'from' ? '0%' : '100%'
        case '<function>':
            return serializeCalculationFunction(selector)
        case '<percentage-token>':
            return serializeDimension(selector)
        default:
            return serializeCSSComponentValueList(selector)
    }
}

/**
 * @param {object} names
 * @param {boolean} [allowEmpty]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-names}
 *
 * It serializes empty line name list to empty string (browser conformance).
 */
function serializeLineNames(names, allowEmpty) {
    if (names.value.length === 0) {
        return allowEmpty ? '[]' : ''
    }
    return serializeBlock(names)
}

/**
 * @param {object[]} list
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-name-list}
 *
 * It serializes an empty line name list to empty string (browser conformance).
 */
function serializeLineNameList(list) {
    return list.map(names => {
        if (names.types.includes('<line-names>')) {
            return serializeLineNames(names, true)
        }
        const { name, value: [multiplier,, repeated] } = names
        return `${name}(${serializeCSSComponentValue(multiplier)}, ${serializeLineNameList(repeated)})`
    }).join(' ')
}

/**
 * @param {object} linear
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-easing-2/#funcdef-linear}
 */
function serializeLinear({ value }) {
    let string = 'linear('
    value.forEach(([output, input]) => {
        const [x1, x2] = input.map(serializeCSSComponentValue)
        const y = serializeCSSComponentValue(output)
        string += y
        if (x1) {
            string += ` ${x1}`
            if (x2) {
                string += `, ${y} ${x2}`
            }
        }
    })
    string += ')'
    return string
}

/**
 * @param {object[]} gradient
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-linear-gradient-syntax}
 */
function serializeLinearGradientSyntax([configuration,, stops]) {
    stops = serializeCSSComponentValue(stops)
    if (isOmitted(configuration)) {
        return stops
    }
    const options = []
    const [rotation, interpolation] = configuration.map(serializeCSSComponentValue)
    if (rotation && rotation !== 'to bottom') {
        options.push(rotation)
    }
    if (interpolation && interpolation !== 'in oklab') {
        options.push(interpolation)
    }
    if (0 === options.length) {
        return stops
    }
    return `${options.join(' ')}, ${stops}`
}

/**
 * @param {object[]} query
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-media-query}
 */
function serializeMediaQuery(query) {
    if (!query.types.includes('<media-condition>')) {
        const [modifier, { value }, conditions] = query
        if (isOmitted(modifier) && value === 'all' && !isOmitted(conditions)) {
            return serializeCSSComponentValue(conditions[1])
        }
    }
    return serializeCSSComponentValueList(query)
}

/**
 * @param {object} name
 * @returns {string}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-name}
 *
 * It serializes a media feature name with lowercase (browser conformance).
 */
function serializeMediaFeatureName(name) {
    return name.value.toLowerCase()
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
 * @param {object} path
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-path}
 */
function serializePath({ value }) {
    const [fillRule,, commands] = value.map(serializeCSSComponentValue)
    if (fillRule && fillRule !== 'nonzero') {
        return `path(${fillRule}, ${commands})`
    }
    return `path(${commands})`
}

/**
 * @param {object} pointer
 * @returns {string}
 * @see {@link https://drafts.csswg.org/pointer-animations-1/#funcdef-pointer}
 */
function serializePointer({ value }) {
    const options = []
    if (!isOmitted(value)) {
        const [source, axis] = value.map(serializeCSSComponentValue)
        if (source && source !== 'self') {
            options.push(source)
        }
        if (axis && axis !== 'inline') {
            options.push(axis)
        }
    }
    return `pointer(${options.join(' ')})`
}

/**
 * @param {object} polygon
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-polygon}
 */
function serializePolygon({ value }) {
    const [fillRule, round,, vertices] = value.map(serializeCSSComponentValue)
    const options = []
    if (fillRule && fillRule !== 'nonzero') {
        options.push(fillRule)
    }
    if (round) {
        options.push(round)
    }
    if (0 < options.length) {
        return `polygon(${options.join(' ')}, ${vertices})`
    }
    return `polygon(${vertices})`
}

/**
 * @param {object|object[]} position
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#typedef-bg-position}
 * @see {@link https://drafts.csswg.org/css-values-5/#typedef-position}
 */
function serializePosition(position) {
    if (isList(position)) {
        return serializeCSSComponentValueList(position)
    }
    let side
    if (position.types[0] === '<ident-token>') {
        side = position.value
        if (side === 'top' || side === 'bottom' || side.startsWith('y') || side.startsWith('inline')) {
            return `center ${side}`
        }
    } else if (position.types[0] === '<function>') {
        side = serializeCalculationFunction(position)
    } else {
        side = serializeDimension(position)
    }
    return `${side} center`
}

/**
 * @param {object[]} gradient
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-radial-gradient-syntax}
 */
function serializeRadialGradientSyntax([configuration,, stops]) {
    stops = serializeCSSComponentValue(stops)
    if (isOmitted(configuration)) {
        return stops
    }
    const [line, interpolation] = configuration
    const options = []
    if (!isOmitted(line)) {
        const [aspect, position] = line
        if (!isOmitted(aspect)) {
            const [{ value: shape }, size] = aspect
            if (!isOmitted(size) && size.value !== 'farthest-corner') {
                options.push(serializeCSSComponentValue(size))
            }
            if (shape === 'circle' && (options.length === 0 || !size[0]?.types.includes('<length-percentage>'))) {
                options.unshift('circle')
            }
        }
        if (!isOmitted(position)) {
            options.push(serializeCSSComponentValue(position))
        }
    }
    const sInterpolation = serializeCSSComponentValue(interpolation)
    if (sInterpolation && sInterpolation !== 'in oklab') {
        options.push(sInterpolation)
    }
    if (0 === options.length) {
        return stops
    }
    return `${options.join(' ')}, ${stops}`
}

/**
 * @param {object|object[]} size
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-images-3/#typedef-radial-size}
 * @see {@link https://drafts.csswg.org/css-images-4/#radial-size}
 */
function serializeRadialSize(size) {
    return isList(size) ? serializeSides(size) : size.value
}

/**
 * @param {object} fn
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random}
 */
function serializeRandom(fn) {
    const [options, min, max, step] = fn.value.map(serializeCSSComponentValue)
    const value = []
    if (options && options !== 'auto') {
        value.push(options)
    }
    value.push(min, max)
    if (step) {
        value.push(step)
    }
    return `random(${value.join(', ')})`
}

/**
 * @param {object[]} ratio
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-ratio-value}
 */
function serializeRatio([numerator, denominator]) {
    numerator = serializeCSSComponentValue(numerator)
    denominator = isOmitted(denominator) ? '1' : serializeCSSComponentValue(denominator[1])
    return `${numerator} / ${denominator}`
}

/**
 * @param {object} ray
 * @returns {string}
 * @see {@link https://drafts.fxtf.org/motion-1/#funcdef-ray}
 */
function serializeRay({ name, value }) {
    const [angle, size, contain, position] = value.map(serializeCSSComponentValue)
    let string = `${name}(${angle}`
    if (size && size !== 'closest-side') {
        string += ` ${size}`
    }
    if (contain) {
        string += ` ${contain}`
    }
    if (position) {
        string += ` ${position}`
    }
    string += ')'
    return string
}

/**
 * @param {object[]} point
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-2/#typedef-shape-relative-control-point}
 */
function serializeRelativeControlPoint(point) {
    const [coordinate, from] = point.map(serializeCSSComponentValue)
    return from === 'from start' ? coordinate : `${coordinate} ${from}`
}

/**
 * @param {object|object[]} style
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#typedef-repeat-style}
 */
function serializeRepeatStyle(style) {
    if (isList(style)) {
        const [x, y] = style.map(serializeCSSComponentValue)
        if (y) {
            if (x === y) {
                return x
            }
            if (x === 'repeat' && y === 'no-repeat') {
                return 'repeat-x'
            }
            if (x === 'no-repeat' && y === 'repeat') {
                return 'repeat-y'
            }
            return `${x} ${y}`
        }
        return x
    }
    return style.value
}

/**
 * @param {object} fn
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-round}
 */
function serializeRound(fn) {
    const [strategy, a, b] = fn.value.map(serializeCSSComponentValue)
    const value = []
    if (strategy && strategy !== 'nearest') {
        value.push(strategy)
    }
    value.push(a)
    if (b && b !== '1') {
        value.push(b)
    }
    return `round(${value.join(', ')})`
}

/**
 * @param {object} scale
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-transforms-2/#funcdef-scale}
 */
function serializeScale({ value }) {
    const [x, y] = value.map(serializeCSSComponentValue)
    return x === y ? `scale(${x})` : `scale(${x}, ${y})`
}

/**
 * @param {object} scroll
 * @returns {string}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#funcdef-scroll}
 */
function serializeScroll({ value }) {
    const options = []
    if (isList(value)) {
        const [scroller, axis] = value.map(serializeCSSComponentValue)
        if (scroller && scroller !== 'nearest') {
            options.push(scroller)
        }
        if (axis && axis !== 'block') {
            options.push(axis)
        }
    }
    return `scroll(${options.join(' ')})`
}

/**
 * @param {object[]} shadow
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#typedef-shadow}
 * @see {@link https://drafts.csswg.org/css-borders-4/#typedef-spread-shadow}
 * @see {@link https://drafts.fxtf.org/filter-effects-1/#funcdef-filter-drop-shadow}
 */
function serializeShadow(shadow) {
    const [color, offset, ...options] = shadow.flat(2).map(serializeCSSComponentValue)
    const strings = []
    if (offset === 'none') {
        if (color && color !== 'transparent') {
            strings.push(color)
        }
        strings.push(offset)
    } else if (color === 'currentcolor') {
        strings.push(offset, options.shift())
    } else {
        strings.push(color, offset, options.shift())
    }
    const [blur, spread, position] = options
    if (blur && blur !== '0px') {
        strings.push(blur)
    }
    if (spread && spread !== '0px') {
        strings.push(spread)
    }
    if (position && position !== 'outset') {
        strings.push(position)
    }
    return strings.join(' ')
}

/**
 * @param {object} shape
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-2/#funcdef-shape}
 */
function serializeShape({ value: [fillRule, ...tail] }) {
    tail = serializeCSSComponentValueList(tail)
    if (isOmitted(fillRule) || fillRule.value === 'nonzero') {
        return `shape(${tail})`
    }
    return `shape(${fillRule} ${tail})`
}

/**
 * @param {object[]} sides
 * @returns {string}
 */
function serializeSides(sides) {
    return serializeCSSComponentValueList(representSides(sides.map(serializeCSSComponentValue)))
}

/**
 * @param {object} skew
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-transforms-1/#funcdef-transform-skew}
 */
function serializeSkew({ value: [x,, y] }) {
    x = serializeCSSComponentValue(x)
    y = serializeCSSComponentValue(y)
    return y === '0deg' ? `skew(${x})` : `skew(${x}, ${y})`
}

/**
 * @param {object} snap
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-page-floats-3/#funcdef-float-snap-block}
 * @see {@link https://drafts.csswg.org/css-page-floats-3/#funcdef-float-snap-inline}
 */
function serializeSnap({ name, value: [length,, position] }) {
    length = serializeCSSComponentValue(length)
    if (isOmitted(position) || position.value === 'near') {
        return `${name}(${length})`
    }
    return `${name}(${length}, ${serializeCSSComponentValue(position)})`
}

/**
 * @param {object} steps
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-easing-2/#typedef-step-easing-function}
 */
function serializeStepEasingFunction({ value }) {
    switch (value) {
        case 'step-start':
            return 'steps(1, start)'
        case 'step-end':
            return 'steps(1)'
        default: {
            const [count,, { value: position }] = value
            const steps = serializeCSSComponentValue(count)
            if (position && position !== 'end' && position !== 'jump-end') {
                return `steps(${steps}, ${position})`
            }
            return `steps(${steps})`
        }
    }
}

/**
 * @param {object} string
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-content-3/#funcdef-string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-string-value}
 */
function serializeString({ types, value }) {
    if (types[0] === '<function>') {
        const [name,, location] = value
        const string = `string(${serializeCSSComponentValue(name)}`
        if (isOmitted(location) || location.value === 'first') {
            return `${string})`
        }
        return `${string}, ${serializeCSSComponentValue(location)})`
    }
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
 * @param {object} symbols
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#funcdef-symbols}
 */
function serializeSymbols({ value }) {
    const [type, list] = value.map(serializeCSSComponentValue)
    if (type === 'symbolic') {
        return `symbols(${list})`
    }
    return `symbols(${type} ${list})`
}

/**
 * @param {object} translate
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-transforms-1/#funcdef-transform-translate}
 */
function serializeTranslate({ value: [x,, y] }) {
    x = serializeCSSComponentValue(x)
    y = serializeCSSComponentValue(y)
    return y === '0px' ? `translate(${x})` : `translate(${x}, ${y})`
}

/**
 * @param {object} url
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-url-value}
 */
function serializeURL({ value }) {
    return `url(${serializeString(string(value))})`
}

/**
 * @param {object} range
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-unicode-range-token}
 */
function serializeUnicodeRange({ from, to }) {
    const string = `U+${from.toString(16).toUpperCase()}`
    if (to === 0) {
        return string
    }
    return `${string}-${to.toString(16).toUpperCase()}`
}

/**
 * @param {object} view
 * @returns {string}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#funcdef-view}
 */
function serializeView({ value }) {
    const options = []
    if (isList(value)) {
        const [axis, inset] = value.map(serializeCSSComponentValue)
        if (axis && axis !== 'block') {
            options.push(axis)
        }
        if (inset && inset !== 'auto') {
            options.push(inset)
        }
    }
    return `view(${options.join(' ')})`
}

/**
 * @param {object|object[]} value
 * @param {string} [context]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-component-value}
 */
function serializeCSSComponentValue(value, context) {
    // Custom property value or pre-simplified value
    if (typeof value === 'string') {
        return value
    }
    if (isOmitted(value)) {
        return ''
    }
    const { types } = value
    for (let index = types.length - 1; 0 <= index; --index) {
        switch (types[index]) {
            case "<'border-radius'>":
                return serializeBorderRadius(value)
            case '<alpha-value>':
                return serializeAlpha(value)
            case '<any-value>':
            case '<declaration-value>':
            case '<whole-value>':
                return serializeCommaContainingValue(value, context)
            case '<an+b>':
                return serializeAnB(value)
            case '<angular-color-stop>':
            case '<linear-color-stop>':
                return serializeColorStop(value)
            case '<attr()>':
                return serializeAttribute(value)
            case '<arc-command>':
                return serializeArcCommand(value)
            case '<bad-string-token>':
                return `"${value.value}`
            case '<bad-url-token>':
                return `url(${value.value}`
            case '<baseline-position>':
                return serializeBaselinePosition(value)
            case '<bg-position>':
            case '<position>':
                return serializePosition(value)
            case '<block>':
                return serializeBlock(value)
            case '<blur()>':
            case '<brightness()>':
            case '<contrast()>':
            case '<drop-shadow()>':
            case '<grayscale()>':
            case '<hue-rotate()>':
            case '<invert()>':
            case '<opacity()>':
            case '<saturate()>':
            case '<sepia()>':
                return serializeFilter(value)
            case '<calc-function>':
                return serializeCalculationFunction(value)
            case '<calc-interpolate()>':
            case '<color-interpolate()>':
            case '<interpolate()>':
            case '<transform-interpolate()>':
                return serializeInterpolate(value)
            case '<calc-product>':
            case '<calc-sum>':
            case '<calc-value>':
                return serializeCalculation(value)
            case '<circle()>':
            case '<ellipse()>':
                return serializeEllipse(value)
            case '<color>':
                return serializeColor(value, context)
            case '<color-stripe>':
                return serializeColorStripe(value)
            case '<conic-gradient-syntax>':
                return serializeConicGradientSyntax(value)
            case '<content()>':
                return serializeContent(value)
            case '<control-value()>':
                return serializeControlValue(value)
            case '<counter>':
                return serializeCounter(value)
            case '<custom-function-definition>':
                return serializeCustomFunctionDefinition(value)
            case '<ident>':
            case '<ident-token>':
                return serializeIdentifier(value)
            case '<declaration>':
                return serializeDeclaration(value)
            case '<delimiter-token>':
            case '<keyword>':
                return value.value
            case '<dimension>':
            case '<dimension-token>':
            case '<percentage>':
            case '<percentage-token>':
                return serializeDimension(value)
            case '<feature-tag-value>':
                return serializeFeatureTagValue(value)
            case '<function>':
                return serializeFunction(value)
            case '<hash-token>':
                return serializeHash(value)
            case '<image-set-option>':
                return serializeImageSetOption(value)
            case '<inset()>':
            case '<rect()>':
            case '<xywh()>':
                return serializeBasicShapeRect(value)
            case '<integer>':
                return serializeInteger(value)
            case '<keyframe-selector>':
                return serializeKeyframeSelector(value)
            case '<line-names>':
                return serializeLineNames(value)
            case '<line-name-list>':
                return serializeLineNameList(value)
            case '<linear()>':
                return serializeLinear(value)
            case '<linear-gradient-syntax>':
                return serializeLinearGradientSyntax(value)
            case '<media-query>':
                return serializeMediaQuery(value)
            case '<mf-name>':
                return serializeMediaFeatureName(value)
            case '<number>':
            case '<number-token>':
                return serializeNumber(value)
            case '<path()>':
                return serializePath(value)
            case '<pointer()>':
                return serializePointer(value)
            case '<polygon()>':
                return serializePolygon(value)
            case '<radial-gradient-syntax>':
                return serializeRadialGradientSyntax(value)
            case '<radial-size>':
                return serializeRadialSize(value)
            case '<random()>':
                return serializeRandom(value)
            case '<ratio>':
                return serializeRatio(value)
            case '<ray()>':
                return serializeRay(value)
            case '<relative-control-point>':
                return serializeRelativeControlPoint(value)
            case '<repeat-style>':
                return serializeRepeatStyle(value)
            case '<round()>':
                return serializeRound(value)
            case '<scale()>':
                return serializeScale(value)
            case '<scroll()>':
                return serializeScroll(value)
            case '<shadow>':
                return serializeShadow(value)
            case '<shape()>':
                return serializeShape(value)
            case '<skew()>':
                return serializeSkew(value)
            case '<snap-block()>':
            case '<snap-inline()>':
                return serializeSnap(value)
            case '<step-easing-function>':
                return serializeStepEasingFunction(value)
            case '<string>':
            case '<string()>':
            case '<string-token>':
                return serializeString(value)
            case '<symbols()>':
                return serializeSymbols(value)
            case '<translate()>':
                return serializeTranslate(value)
            case '<urange>':
                return serializeUnicodeRange(value)
            case '<url-token>':
                return serializeURL(value)
            case '<view()>':
                return serializeView(value)
            default:
                continue
        }
    }
    if (isList(value)) {
        return serializeCSSComponentValueList(value, context)
    }
    throw RangeError('Unexpected component value to serialize')
}

/**
 * @param {object[]} list
 * @param {string} [separator]
 * @param {string} [context]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-value}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-comma-separated-list}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-whitespace-separated-list}
 *
 * It is an abstraction of steps 3-5 of the procedures to serialize a CSS value,
 * a comma separated list, and a whitespace separated list.
 *
 * It deviates from the specification by not skipping whitespace, since it is
 * removed from any value but an arbitrary value, which is represented with a
 * list whose separator is an empty string.
 */
function serializeCSSComponentValueList(list, context) {
    const separator = list.separator ?? ' '
    return list.reduce(
        (string, value, index) => {
            value = serializeCSSComponentValue(value, context)
            if (0 < index) {
                switch (separator) {
                    case ' ':
                        if (string && value && value[0] !== ',' && value[0] !== ';' && value !== ':' && !value.startsWith(': ')) {
                            string += separator
                        }
                        break
                    case '':
                        break
                    case ',':
                    case ';':
                        string += value ? `${separator} ` : separator
                        break
                    default:
                        string += ` ${separator} `
                        break
                }
            }
            string += value
            return string
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
    const animations = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            animations[index]?.push(value) ?? animations.push(list([value]))
        })
    }
    // No simplification (on purpose)
    return list(animations, ',')
}

/**
 * @param {object[]} declarations
 * @param {string} name
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-animation-range}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-animation-trigger-exit-range}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-animation-trigger-range}
 */
function representAnimationRange([{ value: starts }, { value: ends }], initial) {
    if (starts.length !== ends.length) {
        return ['']
    }
    const boundaries = starts.map((start, index) =>
        representAnimationRangeValue(start, ends[index], initial))
    return list(boundaries, ',')
}

/**
 * @param {object[]|object[][]} range
 * @param {string} origin
 * @returns {object[]|string[]|object[][]}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-animation-trigger-exit-range-start}
 * @see {@link https://drafts.csswg.org/pointer-animations-1/#animation-range-center}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-animation-range-start}
 */
function representAnimationRangeLonghand(range, origin) {
    let percentage
    if (origin.endsWith('start')) {
        percentage = '0%'
    } else if (origin.endsWith('center')) {
        percentage = '50%'
    } else {
        percentage = '100%'
    }
    return map(range, value => {
        if (isList(value)) {
            const [name, offset] = value.map(serializeCSSComponentValue)
            if (offset === percentage) {
                return name
            }
        }
        return value
    })
}

/**
 * @param {object|object[]} start
 * @param {object|object[]} end
 * @param {string} initial
 * @returns {string}
 */
function representAnimationRangeValue(start, end, initial) {
    let startRange
    if (isList(start)) {
        const [name, offset] = start.map(serializeCSSComponentValue)
        startRange = name
        if (offset && offset !== '0%') {
            startRange += ` ${offset}`
        } else if (end.types.includes('<length-percentage>')) {
            startRange += ' 0%'
        }
    } else {
        startRange = serializeCSSComponentValue(start)
    }
    let endRange
    if (isList(end)) {
        const [name, offset] = end.map(serializeCSSComponentValue)
        endRange = name
        if (offset && offset !== '100%') {
            endRange += ` ${offset}`
        } else if (isList(start) && start[0].value === endRange) {
            return startRange
        }
    } else {
        endRange = serializeCSSComponentValue(end)
        if (!isList(start) && endRange === initial) {
            return startRange
        }
    }
    return `${startRange} ${endRange}`
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-animation-trigger}
 */
function representAnimationTrigger(declarations) {
    const { value: { length } } = declarations.find(({ name }) => name === 'animation-trigger-behavior')
    let triggers = []
    for (const { name, value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        for (const [index, entry] of value.entries()) {
            switch (name) {
                case 'animation-trigger-behavior':
                    triggers.push(list([serializeCSSComponentValue(entry)]))
                    break
                case 'animation-trigger-timeline':
                    triggers[index].push(serializeCSSComponentValue(entry))
                    break
                case 'animation-trigger-exit-range-end':
                case 'animation-trigger-range-end': {
                    const trigger = triggers[index]
                    const start = trigger.pop()
                    const initial = properties[name].initial.serialized
                    const range = representAnimationRangeValue(start, entry, initial)
                    const timeline = trigger[1]
                    if (range !== initial && (timeline === 'auto' || timeline === 'none')) {
                        return ['']
                    }
                    trigger.push(range)
                    break
                }
                default:
                    triggers[index].push(entry)
                    break
            }
        }
    }
    // Simplification
    triggers = triggers.map(trigger => {
        const [type, timeline, range, exitRange] = trigger
        if (exitRange === 'auto') {
            trigger.pop()
            if (range === 'normal') {
                trigger.pop()
                if (timeline === 'auto') {
                    trigger.pop()
                }
            }
        } else if (range === 'normal') {
            trigger.splice(2, 0, 'normal')
        }
        if (type === 'once' && 1 < trigger.length) {
            trigger.shift()
        }
        return trigger
    })
    return list(triggers, ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]|string[][]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-background}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/418}
 */
function representBackground(declarations) {
    const { value: { length } } = declarations.find(({ name }) => name === 'background-image')
    const layers = []
    for (const { name, value } of declarations) {
        if (name === 'background-color') {
            const serialized = serializeCSSComponentValue(value)
            if (serialized !== properties['background-color'].initial) {
                layers.at(-1).push(serialized)
            }
            continue
        }
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            layers[index]?.push(value) ?? layers.push(list([value]))
        })
    }
    // Simplification without initial values
    layers.forEach(layer => {
        let index = layer.length
        while (0 < index-- && 1 < layer.length) {
            const { [index]: { name } } = declarations
            const value = layer[index]
            if (name === 'background-position') {
                const size = layer[index + 1]
                if (size?.startsWith('/')) {
                    layer.splice(index, 2, `${value} ${size}`)
                } else if (value === properties[name].initial.serialized) {
                    layer.splice(index, 1)
                }
            } else if (name === 'background-repeat-y') {
                const x = layer[index - 1]
                if (value === x) {
                    layer.splice(index, 1)
                } else if (value === 'no-repeat' && x === 'repeat') {
                    layer.splice(--index, 2, 'repeat-x')
                } else if (value === 'repeat' && x === 'no-repeat') {
                    layer.splice(--index, 2, 'repeat-y')
                }
            } else if (value == 'background-origin') {
                if (value === layer[index + 1]) {
                    layer.splice(index, 1)
                }
            } else if (value === properties[name].initial.serialized) {
                layer.splice(index, 1)
            } else if (name === 'background-size') {
                layer.splice(index, 1, `/ ${value}`)
            }
        }
    })
    return list(layers, ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-background-repeat}
 */
function representBackgroundRepeat(declarations) {
    const [x, y] = declarations.map(serializeCSSValue)
    if (x === y) {
        return [x]
    }
    if (x === 'repeat' && y === 'no-repeat') {
        return ['repeat-x']
    }
    if (x === 'no-repeat' && y === 'repeat') {
        return ['repeat-y']
    }
    return [`${x} ${y}`]
}

/**
 * @param {object[]|object[][]} size
 * @returns {object[]|object[][]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-background-size}
 */
function representBackgroundSize(size) {
    return map(size, value => {
        if (isList(value) && value[1]?.value === 'auto') {
            return value[0]
        }
        return value
    })
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
        const fallback = values[Math.floor(index / sides % 3)]
        const value = serializeCSSValue(declaration)
        if (fallback) {
            if (fallback === value) {
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
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-clip}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin-block}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin-inline}
 * @see {@link https://svgwg.org/svg2-draft/painting.html#MarkerShorthand}
 */
function representCommonLonghandValue(declarations) {
    const [head, ...tail] = declarations.map(serializeCSSValue)
    return [tail.every(value => value === head) ? head : '']
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-image}
 */
function representBorderImage(declarations) {
    const values = declarations.map(serializeCSSValue)
    let index = values.length
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
 * @param {object[]} slice
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
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-radius}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-top-radius}
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
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-box-shadow}
 */
function representBoxShadow(declarations) {
    const { value: { length } } = declarations.find(({ name }) => name === 'box-shadow-offset')
    const shadows = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => shadows[index]?.push(value) ?? shadows.push(list([value])))
    }
    return list(shadows.map(serializeShadow), ',')
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
 * @param {object|object[]} path
 * @returns {object|string[]}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-clip-path}
 */
function representClipPath(path) {
    if (isList(path)) {
        const [shape, box] = path.map(serializeCSSComponentValue)
        if (box && box !== 'border-box') {
            return [shape, box]
        }
        return [shape]
    }
    return [path]
}

/**
 * @param {object[]} columns
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-multicol-2/#propdef-columns}
 */
function representColumns(columns) {
    const [width, count, height] = columns.map(serializeCSSValue)
    if (height === '' || height === 'auto') {
        if (count === '' || count === 'auto') {
            return [width]
        }
        return [width, count]
    }
    return [width, count, '/', height]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#propdef-container}
 */
function representContainer(declarations) {
    const values = declarations.map(serializeCSSValue)
    const [names, type] = values
    if (type === properties['container-type'].initial.serialized) {
        return isList(names) ? names : [names]
    }
    return list(values, '/')
}

/**
 * @param {object|object[]} counter
 * @param {string} property
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-counter-increment}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-counter-set}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-counter-reset}
 */
function representCounter(counters, property) {
    if (isList(counters)) {
        return counters.map(counter => {
            const values = counter.map(serializeCSSComponentValue)
            const [name, value] = values
            if (property === 'counter-reset') {
                return value === '0' ? name : values
            }
            return value === '1' ? name : values
        })
    }
    return [counters]
}

/**
 * @param {object|object[]} cue
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-speech-1/#propdef-cue-after}
 * @see {@link https://drafts.csswg.org/css-speech-1/#propdef-cue-before}
 */
function representCueLonghands(cue) {
    if (isList(cue)) {
        const [url, volume] = cue.map(serializeCSSComponentValue)
        if (volume && volume !== '0db') {
            return [url, volume]
        }
        return [url]
    }
    return [cue]
}

/**
 * @param {object|object[]} type
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-display-4/#propdef-display}
 */
function representDisplay(type) {
    type = serializeCSSComponentValue(type)
    return [display.aliases.get(type) ?? type]
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
    const systemFont = declarations.find(declaration => declaration.value.types.includes('<system-font()>'))
    if (systemFont) {
        const { value } = systemFont
        if (declarations.every(declaration => declaration.value === value)) {
            return [value.value]
        }
        return ['']
    }
    const values = []
    const { length } = declarations
    for (let index = 0; index < length; ++index) {
        const declaration = declarations[index]
        const { name } = declaration
        let serialized = serializeCSSValue(declaration)
        if (name.startsWith('font-variant')) {
            let variant = declarations[index + 1]
            serialized = [serialized]
            while (variant.name.startsWith('font-variant')) {
                ++index
                serialized.push(serializeCSSValue(variant))
                variant = declarations[index + 1]
            }
            serialized = representFontVariant(serialized)[0]
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
            if (name === 'font-width') {
                if (serialized === 'normal') {
                    continue
                }
                if (!types['<font-width-css3>'].split(' | ').includes(serialized)) {
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
 * @param {object|object[]} range
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-weight}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-width}
 * @see {@link https://drafts.csswg.org/css-fonts-5/#descdef-font-face-font-size}
 */
function representFontRange(range) {
    if (isList(range)) {
        return representSides(range.map(serializeCSSComponentValue))
    }
    return [range]
}

/**
 * @param {object|object[]} style
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-style}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-style}
 */
function representFontStyle(style) {
    if (isList(style)) {
        let angle = style[1]
        angle = isList(angle)
            ? representSides(angle.map(serializeCSSComponentValue))[0]
            : serializeCSSComponentValue(angle)
        if (angle === '0deg') {
            return ['normal']
        }
        return ['oblique', angle]
    }
    return [style]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-synthesis}
 */
function representFontSynthesis(declarations) {
    const values = declarations.map(serializeCSSValue)
    const keywords = shorthands.get('font-synthesis').map(name => name.replace('font-synthesis-', ''))
    const simplified = keywords.filter((_, i) => values[i] !== 'none')
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
 * @returns {object[]|string[]}
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
        || ((autoFlow === 'row' || autoFlow === 'dense') && (autoColumns !== 'auto' || rows !== 'none'))
        || (autoFlow.startsWith('column') && (autoRows !== 'auto' || columns !== 'none'))
    ) {
        return ['']
    }
    const flow = `auto-flow${autoFlow.endsWith('dense') ? ' dense' : ''}`
    if (autoFlow.startsWith('row')) {
        if (autoRows === 'auto') {
            return list([flow, columns], '/')
        }
        return list([list([flow, autoRows]), columns], '/')
    }
    if (autoColumns === 'auto') {
        return list([rows, flow], '/')
    }
    return list([rows, list([flow, autoColumns])], '/')
}

/**
 * @param {object} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-area}
 */
function representGridArea(declarations) {
    const values = declarations.map(serializeCSSValue)
    let index = values.length
    while (1 < index--) {
        const line = values[index]
        const perpendicular = values[index - 2] ?? values[0]
        if (line !== perpendicular || !declarations[index].value.types.includes('<ident>')) {
            break
        }
        values.pop()
    }
    return list(values, '/')
}

/**
 * @param {object[]} flow
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-auto-flow}
 */
function representGridAutoFlow(flow) {
    flow = serializeCSSComponentValueList(flow)
    return [flow === 'row dense' ? 'dense' : flow]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-column}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-row}
 */
function representGridLine(declarations) {
    const values = declarations.map(serializeCSSValue)
    const [start, end] = values
    if (start === end && declarations[0].value.types.includes('<ident>')) {
        return [start]
    }
    return list(values, '/')
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
        return list([rows, columns], '/')
    }
    if (
        !rows.types.includes('<explicit-track-list>')
        || areas.length !== rows[0].length
        || !(columns.value === 'none' || columns.types.includes('<explicit-track-list>'))
    ) {
        return ['']
    }
    const [rowTrackList, lineNames] = rows
    const template = []
    areas.forEach((area, index) => {
        const [lineNames, size] = rowTrackList[index] ?? ['', auto]
        template.push(lineNames)
        template.push(area)
        if (size.value !== 'auto') {
            template.push(size)
        }
    })
    template.push(lineNames)
    if (columns.value === 'none') {
        return list(template)
    }
    return list([list(template), columns], '/')
}

/**
 * @param {object[]} limit
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-hyphenate-limit-chars}
 */
function representHyphenateLimitChars(limit) {
    const values = limit.map(serializeCSSComponentValue)
    const [, before, after] = values
    if (before && before === after) {
        values.pop()
        if (before === 'auto') {
            values.pop()
        }
    }
    return values
}

/**
 * @param {object[]} resolution
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#propdef-image-resolution}
 */
function representImageResolution([resolution, snap]) {
    let [string, value] = resolution.map(serializeCSSComponentValue)
    if (string === '') {
        string = value
    } else if (value !== '1dppx') {
        string += ` ${value}`
    }
    if (isOmitted(snap)) {
        return [string]
    }
    return [string, 'snap']
}

/**
 * @param {object|object[]} letter
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-inline-3/#propdef-initial-letter}
 */
function representInitialLetter(letter) {
    if (isList(letter)) {
        const [head, tail] = letter.map(serializeCSSComponentValue)
        if (tail && tail !== 'drop') {
            return [head, tail]
        }
        return [head]
    }
    return [letter]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-ui-4/#propdef-interest-delay}
 */
function representInterestDelay(declarations) {
    const [start, end] = declarations.map(serializeCSSValue)
    return [start === end ? start : '']
}

/**
 * @param {object[]} declarations
 * @param {boolean} [legacy]
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-line-clamp}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef--webkit-line-clamp}
 */
function representLineClamp(declarations, legacy) {
    const [maxLines, blockEllipsis, fragment] = declarations.map(serializeCSSValue)
    if (legacy) {
        if (maxLines === 'none') {
            if (blockEllipsis === 'auto' && fragment === 'auto') {
                return ['none']
            }
        } else if (blockEllipsis === 'auto' && fragment === '-webkit-legacy') {
            return [maxLines]
        }
    } else if (fragment === 'auto') {
        if (maxLines === 'none' && blockEllipsis === 'none') {
            return ['none']
        }
    } else if (fragment === 'collapse') {
        if (maxLines === 'none') {
            if (blockEllipsis !== 'none') {
                return [blockEllipsis]
            }
        } else if (blockEllipsis === 'auto') {
            return [maxLines]
        } else {
            return [maxLines, blockEllipsis]
        }
    } else if (fragment === '-webkit-legacy') {
        if (maxLines === 'none') {
            return [blockEllipsis, fragment]
        }
        if (blockEllipsis === 'auto') {
            return [maxLines, fragment]
        }
        return [maxLines, blockEllipsis, fragment]
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
    const { ['list-style-position']: { initial, value } } = properties
    if (position === initial.serialized && value.split(' | ').includes(type)) {
        if (image === properties['list-style-image'].initial.serialized) {
            return [position, type]
        }
        return [position, image, type]
    }
    return representWithoutInitialValues(values, longhands)
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask}
 */
function representMask(declarations) {
    const { value: { length } } = declarations.find(({ name }) => name === 'mask-image')
    const masks = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            masks[index]?.push(value) ?? masks.push(list([value]))
        })
    }
    // Simplification without initial values
    masks.forEach(mask => {
        let index = mask.length
        while (0 < index-- && 1 < mask.length) {
            const { [index]: { name } } = declarations
            const value = mask[index]
            if (value === properties[name].initial.serialized || (name === 'mask-origin' && value === mask[index + 1])) {
                mask.splice(index, 1)
            } else if (name === 'mask-size') {
                mask.splice(index, 1, `/ ${value}`)
            }
        }
    })
    return list(masks, ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask-border}
 */
function representMaskBorder(declarations) {
    const values = declarations.map(serializeCSSValue)
    let index = values.length
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
 * @param {object|object[]} value
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#propdef-object-fit}
 */
function representObjectFit(value) {
    if (isList(value)) {
        const [strategy, scale] = value.map(serializeCSSComponentValue)
        if (scale && strategy === 'contain') {
            value = [scale]
        }
    } else {
        value = [value]
    }
    return value
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
    return list([list(values), anchor], '/')
}

/**
 * @param {object|object[]} path
 * @returns {string[]}
 * @see {@link https://drafts.fxtf.org/motion-1/#propdef-offset-path}
 */
function representOffsetPath(path) {
    if (isList(path)) {
        const [shape, box] = path.map(serializeCSSComponentValue)
        if (box && box !== 'border-box') {
            return [shape, box]
        }
        return [shape]
    }
    return [path]
}

/**
 * @param {object[]} rotation
 * @returns {string[]}
 * @see {@link https://drafts.fxtf.org/motion-1/#propdef-offset-rotate}
 */
function representOffsetRotate(rotation) {
    const value = serializeCSSComponentValueList(rotation)
    switch (value) {
        case 'auto 0deg':
        case 'reverse 180deg':
        case 'reverse -180deg':
            return ['auto']
        case 'auto 180deg':
        case 'auto -180deg':
        case 'reverse 0deg':
            return ['reverse']
        default:
            return [value]
    }
}

/**
 * @param {object[]} margin
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin-top}
 */
function representOverflowClipMargin(margin) {
    const [box, length] = margin.map(serializeCSSComponentValue)
    if (box) {
        if (length === '0px') {
            return [box]
        }
        return [box, length]
    }
    return [length]
}

/**
 * @param {object|object[]} order
 * @returns {object[]|string[]}
 * @see {@link https://svgwg.org/svg2-draft/painting.html#PaintOrder}
 */
function representPaintOrder(order) {
    order = serializeCSSComponentValue(order)
    switch (order) {
        case 'fill':
        case 'fill stroke':
        case 'fill stroke markers':
            return ['normal']
        case 'fill markers stroke':
            return ['fill markers']
        case 'markers fill':
        case 'markers fill stroke':
            return ['markers']
        case 'stroke fill':
        case 'stroke fill markers':
            return ['stroke']
        default:
            return [order]
    }
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-place-content}
 */
function representPlaceContent(declarations) {
    const [align, justify] = declarations.map(serializeCSSValue)
    if (align === justify || (justify === 'start' && declarations[0].value.types.includes('<baseline-position>'))) {
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
    return align === justify ? [align] : [align, justify]
}

/**
 * @param {object[]} declarations
 * @param {string[]} longhands
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/pointer-animations-1/#propdef-pointer-timeline}
 */
function representPointerTimeline(declarations, longhands) {
    const { value: { length } } = declarations.find(({ name }) => name === 'pointer-timeline-name')
    if (length === undefined) throw Error('oups')
    const timelines = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            timelines[index]?.push(value) ?? timelines.push(list([value]))
        })
    }
    return list(timelines.map(timeline => representWithoutInitialValues(timeline, longhands)), ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-anchor-position-1/#propdef-position-try}
 */
function representPositionTry(declarations) {
    const [order, options] = declarations.map(serializeCSSValue)
    return order === 'normal' ? [options] : [order, options]
}

/**
 * @param {object|object[]} scale
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-transforms-2/#propdef-scale}
 */
function representScale(scale) {
    if (isList(scale)) {
        const [x, y, z] = scale.map(serializeCSSComponentValue)
        if (z === '1') {
            if (y === x) {
                return [x]
            }
            return [x, y]
        }
        return [x, y, z]
    }
    return [scale]
}

/**
 * @param {object|object[]} type
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-scroll-snap-1/#propdef-scroll-snap-type}
 */
function representScrollSnapType(type) {
    if (isList(type)) {
        const [axis, strictness] = type
        if (!isOmitted(strictness) || strictness.value === 'proximity') {
            return [axis]
        }
        return [axis, strictness]
    }
    return [type]
}

/**
 * @param {object[]} declarations
 * @param {string[]} longhands
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-scroll-timeline}
 */
function representScrollTimeline(declarations, longhands) {
    const { value: { length } } = declarations.find(({ name }) => name === 'scroll-timeline-name')
    const timelines = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            timelines[index]?.push(value) ?? timelines.push(list([value]))
        })
    }
    return list(timelines.map(timeline => representWithoutInitialValues(timeline, longhands)), ',')
}

/**
 * @param {object|object[]} shape
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#propdef-shape-outside}
 */
function representShapeOutside(shape) {
    if (isList(shape)) {
        return shape[1].value === 'margin-box' ? [shape[0]] : shape
    }
    return [shape]
}

/**
 * @param {object|object[]} size
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-page-3/#descdef-page-size}
 */
function representSize(size) {
    if (isList(size)) {
        if (size[0].types.includes('<length>')) {
            return representSides(size.map(serializeCSSComponentValue))
        }
        return size
    }
    return [size]
}

/**
 * @param {object|object[]} syntax
 * @returns {string[]}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#descdef-property-syntax}
 */
function representSyntax(syntax) {
    return [`"${serializeCSSComponentValue(syntax)}"`]
}

/**
 * @param {object|object[]} value
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#descdef-counter-style-system}
 */
function representSystem(value) {
    value = serializeCSSComponentValue(value)
    return [value === 'fixed 1' ? 'fixed' : value]
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
 * @see {@link https://drafts.csswg.org/css-inline-3/#propdef-text-box}
 */
function representTextBox(declarations) {
    const [trim, edge] = declarations.map(serializeCSSValue)
    switch (trim) {
        case 'none':
            return [edge === 'auto' ? 'normal' : '']
        case 'trim-both':
            return [edge === 'auto' ? trim : edge]
        default:
            return edge === 'auto' ? [trim] : [trim, edge]
    }
}

/**
 * @param {object[]} position
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-text-decor-4/#propdef-text-emphasis-position}
 */
function representTextEmphasisPosition(position) {
    const [z, x] = position
    return x.value === 'right' ? [z] : position
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-spacing}
 */
function representTextSpacing(declarations) {
    const [trim, autospace] = declarations.map(serializeCSSValue)
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
    return [`${trim} ${autospace}`]
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
 * @see {@link https://drafts.csswg.org/css-transitions-2/#propdef-transition}
 */
function representTransition(declarations, longhands) {
    const { value: { length } } = declarations.find(({ name }) => name === 'transition-property')
    const transitions = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            transitions[index]?.push(value) ?? transitions.push(list([value]))
        })
    }
    return list(transitions.map(transition => representWithoutInitialValues(transition, longhands)), ',')
}

/**
 * @param {object|object[]} values
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-transforms-2/#propdef-translate}
 */
function representTranslate(values) {
    if (isList(values)) {
        const [x, y, z] = values.flat().map(serializeCSSComponentValue)
        if (z === '' || z === '0px') {
            if (y === '' || y === '0px') {
                return [x]
            }
            return [x, y]
        }
        return [x, y, z]
    }
    return [values]
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
    const { value: { length } } = declarations.find(({ name }) => name === 'view-timeline-name')
    const timelines = []
    for (const { value } of declarations) {
        if (length !== value.length) {
            return ['']
        }
        value.forEach((value, index) => {
            value = serializeCSSComponentValue(value)
            timelines[index]?.push(value) ?? timelines.push(list([value]))
        })
    }
    return list(timelines.map(timeline => representWithoutInitialValues(timeline, longhands)), ',')
}

/**
 * @param {object[]} baseline
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-speech-1/#propdef-voice-pitch}
 * @see {@link https://drafts.csswg.org/css-speech-1/#propdef-voice-range}
 * @see {@link https://drafts.csswg.org/css-speech-1/#propdef-voice-rate}
 */
function representVoicePitch(baseline) {
    const [head, tail] = baseline.map(serializeCSSComponentValue)
    if (head && (!tail || tail === '100%')) {
        return [head]
    }
    return [head, tail]
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-white-space}
 */
function representWhiteSpace(declarations, longhands) {
    for (const [key, values] of whiteSpace) {
        if (values.every(({ value }, index) => value === declarations[index].value.value)) {
            return [key]
        }
    }
    return representWithoutInitialValues(declarations.map(serializeCSSValue), longhands)
}

/**
 * @param {string[]} sides
 * @returns {string[]}
 */
function representSides(sides) {
    sides = [...sides]
    let index = sides.length
    while (1 < index--) {
        const side = sides[index]
        const opposite = sides[index - 2] ?? sides[0]
        if (side !== opposite) {
            break
        }
        sides.pop()
    }
    return sides
}

/**
 * @param {string[]} values
 * @param {string[]} longhands
 * @returns {string[]}
 */
function representWithoutInitialValues(values, longhands) {
    let index = values.length
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
function representDeclarationValue({ name, pending, source, value }) {
    if (name.startsWith('--')) {
        return [source]
    }
    if (shorthands.has(name)) {
        const declarations = []
        for (const declaration of value) {
            const { name: longhand, pending, value: longhandValue } = declaration
            if (pending) {
                // https://github.com/w3c/csswg-drafts/issues/3109
                return (value.every(declaration => declaration.pending === name) || value.length === 1)
                    // All longhands are declared with the same pending substitution
                    ? [longhandValue]
                    // Some longhand is declared with a pending substitution of its own
                    : ['']
            }
            if (cssWideKeywords.includes(longhandValue.value)) {
                const keyword = longhandValue.value
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
            case 'animation-range':
            case 'animation-trigger-exit-range':
            case 'animation-trigger-range':
                return representAnimationRange(declarations, name.includes('exit') ? 'auto' : 'normal')
            case 'animation-trigger':
                return representAnimationTrigger(declarations)
            case 'background':
                return representBackground(declarations)
            case 'background-repeat':
                return representBackgroundRepeat(declarations)
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
            case 'corner-bottom-shape':
            case 'corner-left-shape':
            case 'corner-right-shape':
            case 'corner-shape':
            case 'corner-top-shape':
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
            case 'border-clip':
            case 'marker':
            case 'overflow-clip-margin':
            case 'overflow-clip-margin-block':
            case 'overflow-clip-margin-inline':
                return representCommonLonghandValue(declarations)
            case 'border-image':
                return representBorderImage(declarations)
            case 'box-shadow':
                return representBoxShadow(declarations, longhands)
            case 'columns':
                return representColumns(declarations)
            case 'container':
                return representContainer(declarations)
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
            case 'interest-delay':
                return representInterestDelay(declarations)
            case 'line-clamp':
                return representLineClamp(declarations)
            case 'list-style':
                return representListStyle(declarations, longhands)
            case 'mask':
                return representMask(declarations)
            case 'mask-border':
                return representMaskBorder(declarations)
            case 'offset':
                return representOffset(declarations, longhands)
            case 'page-break-after':
            case 'page-break-before':
            case 'page-break-inside':
                return representBreak(declarations[0].value, name)
            case 'place-content':
                return representPlaceContent(declarations)
            case 'place-items':
                return representPlaceItems(declarations)
            case 'pointer-timeline':
                return representPointerTimeline(declarations, longhands)
            case 'position-try':
                return representPositionTry(declarations)
            case 'scroll-timeline':
                return representScrollTimeline(declarations, longhands)
            case 'text-align':
                return representTextAlign(declarations)
            case 'text-box':
                return representTextBox(declarations)
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
    if (pending) {
        // Longhand with a pending substitution of its own or declared for its legacy shorthand
        // https://github.com/w3c/csswg-drafts/issues/3109
        if (pending === name || shorthands.get(pending)?.length === 1) {
            return [value]
        }
        // Longhand with a pending substitution declared for its shorthand
        return ['']
    }
    // Longhand with a CSS-wide keyword
    if (cssWideKeywords.includes(value.value)) {
        return [value]
    }
    // Longhand with an internal system font value
    if (value.types.includes('<system-font()>')) {
        return ['']
    }
    switch (name) {
        case 'animation-range-center':
        case 'animation-range-end':
        case 'animation-range-start':
        case 'animation-trigger-exit-range-end':
        case 'animation-trigger-exit-range-start':
        case 'animation-trigger-range-end':
        case 'animation-trigger-range-start':
            return representAnimationRangeLonghand(value, name)
        case 'background-size':
            return representBackgroundSize(value)
        case 'ascent-override':
        case 'border-bottom-left-radius':
        case 'border-bottom-right-radius':
        case 'border-end-end-radius':
        case 'border-end-start-radius':
        case 'border-image-outset':
        case 'border-image-repeat':
        case 'border-image-width':
        case 'border-spacing':
        case 'border-start-end-radius':
        case 'border-start-start-radius':
        case 'border-top-left-radius':
        case 'border-top-right-radius':
        case 'descent-override':
        case 'line-gap-override':
        case 'mask-border-outset':
        case 'mask-border-repeat':
        case 'mask-border-width':
        case 'scroll-snap-align':
        case 'subscript-position-override':
        case 'subscript-size-override':
        case 'superscript-position-override':
        case 'superscript-size-override':
            return representSides(value.map(serializeCSSComponentValue))
        case 'border-image-slice':
        case 'mask-border-slice':
            return representBorderSlice(value)
        case 'break-after':
        case 'break-before':
        case 'break-inside':
            return representBreak(value, name)
        case 'clip-path':
            return representClipPath(value)
        case 'counter-increment':
        case 'counter-set':
        case 'counter-reset':
            return representCounter(value, name)
        case 'cue-after':
        case 'cue-before':
            return representCueLonghands(value)
        case 'display':
            return representDisplay(value)
        case 'font-size':
        case 'font-weight':
        case 'font-width':
            return representFontRange(value)
        case 'font-style':
            return representFontStyle(value)
        case 'grid-auto-flow':
            return representGridAutoFlow(value)
        case 'hyphenate-limit-chars':
            return representHyphenateLimitChars(value)
        case 'image-resolution':
            return representImageResolution(value)
        case 'initial-letter':
            return representInitialLetter(value)
        case 'object-fit':
            return representObjectFit(value)
        case 'offset-path':
            return representOffsetPath(value)
        case 'offset-rotate':
            return representOffsetRotate(value)
        case 'overflow-clip-margin-block-end':
        case 'overflow-clip-margin-block-starty':
        case 'overflow-clip-margin-bottom':
        case 'overflow-clip-margin-inline-end':
        case 'overflow-clip-margin-inline-starty':
        case 'overflow-clip-margin-left':
        case 'overflow-clip-margin-right':
        case 'overflow-clip-margin-top':
            return representOverflowClipMargin(value)
        case 'paint-order':
            return representPaintOrder(value)
        case 'scale':
            return representScale(value)
        case 'scroll-snap-type':
            return representScrollSnapType(value)
        case 'shape-outside':
            return representShapeOutside(value)
        case 'size':
            return representSize(value)
        case 'syntax':
            return representSyntax(value)
        case 'system':
            return representSystem(value)
        case 'text-emphasis-position':
            return representTextEmphasisPosition(value)
        case 'text-orientation':
            return representTextOrientation(value, name)
        case 'translate':
            return representTranslate(value)
        case 'voice-pitch':
        case 'voice-range':
        case 'voice-rate':
            return representVoicePitch(value)
        default:
            return [value]
    }
}

/**
 * @param {object} declaration
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-value}
 *
 * It deviates from the specification by receiving a shorthand declaration with
 * longhand declarations as its value, to avoid resolving its name twice.
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
    let string = `${property}: ${value}`
    if (priority) {
        string += ' !important'
    }
    if (appendSemicolon) {
        string += ';'
    }
    return string
}

/**
 * @param {Map} declarations
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-declaration-block}
 *
 * It deviates from the specification by running `serializeCSSValue()` with a
 * shorthand declaration defined with longhand declarations as its value.
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
            // https://github.com/w3c/csswg-drafts/issues/3109
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
