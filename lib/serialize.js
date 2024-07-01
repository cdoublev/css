
const { MAX_INTEGER, MIN_INTEGER } = require('./values/integers.js')
const { canonicalize, definitions: dimensions, getCanonicalUnitFromType } = require('./values/dimensions.js')
const { clamp, safeFloat, toEightBit } = require('./utils/math.js')
const { combinators, isCombination, isCompound, isMultiplied } = require('./utils/definition.js')
const { numeric: { math: mathFunctions }, keywords: cssWideKeywords } = require('./values/substitutions.js')
const { hasPendingSubstitution, isCalculation, isCalculationOperator, isInfinityOrNaN, isNumeric, isOmitted } = require('./utils/value.js')
const { hslToRgb, hwbToRgb } = require('./utils/color.js')
const { isDigit, isIdentifierCharacter, isNonASCIIIdentifierCharacter } = require('./parse/tokenize.js')
const { list, string } = require('./values/value.js')
const { auto } = require('./values/defaults.js')
const blocks = require('./values/blocks.js')
const display = require('./values/display.js')
const logical = require('./properties/logical.js')
const properties = require('./properties/definitions.js')
const shorthands = require('./properties/shorthands.js')
const types = require('./values/definitions.js')
const whiteSpace = require('./values/white-space.js')

// UAs must support at least 20 repetitions
const MAX_REPETITIONS = 20

const sRGBColorFunctions = ['hex-color', 'hsl', 'hsla', 'hwb', 'rgb', 'rgba']

/**
 * @param {object} alpha
 * @param {boolean} [is8Bit]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-4/#serializing-alpha-values}
 */
function serializeAlpha({ types, value }, is8Bit = false) {
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
 * @param {object[]} command
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-2/#typedef-shape-arc-command}
 */
function serializeArcCommand([, byTo, coordinate,, radius, options]) {
    let string = `arc ${serializeCSSComponentValue(byTo)} ${serializeCSSComponentValueList(coordinate)} of`
    const [horizontal, vertical] = radius.map(serializeCSSComponentValue)
    if (horizontal !== '' || horizontal !== vertical) {
        string += ` ${horizontal}`
    }
    if (!isOmitted(options)) {
        const [sweep, size, rotation] = options.map(serializeCSSComponentValue)
        if (sweep === 'cw') {
            string += ' cw'
        }
        if (size === 'large') {
            string += ' large'
        }
        if (rotation && rotation !== 'rotate 0deg') {
            string += ` ${rotation}`
        }
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
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-string-value}
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
 * @param {object[][]} radii
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
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
 * @param {object} color
 * @param {boolean} mixed
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-4/#serializing-color-values}
 */
function serializeColor({ name, types, value }, mixed = false) {
    if (types.includes('<keyword>')) {
        return value
    }
    if (types.includes('<color-mix()>')) {
        let [interpolation,, [[c1, p1], [c2, p2]]] = value
        interpolation = serializeCSSComponentValue(interpolation)
        c1 = serializeColor(c1, true)
        c2 = serializeColor(c2, true)
        if (isOmitted(p2)) {
            if (isOmitted(p1)) {
                return `color-mix(${interpolation}, ${c1}, ${c2})`
            }
            return `color-mix(${interpolation}, ${c1} ${serializeCSSComponentValue(p1)}, ${c2})`
        }
        if (p2.types.includes('<percentage>')) {
            if (p1.types.includes('<percentage>')) {
                if (p1.value + p2.value === 100) {
                    if (p1.value === 50) {
                        return `color-mix(${interpolation}, ${c1}, ${c2})`
                    }
                    return `color-mix(${interpolation}, ${c1} ${serializeCSSComponentValue(p1)}, ${c2})`
                }
                return `color-mix(${interpolation}, ${c1} ${serializeCSSComponentValue(p1)}, ${c2} ${serializeCSSComponentValue(p2)})`
            }
            if (isOmitted(p1)) {
                return `color-mix(${interpolation}, ${c1} ${serializeCSSComponentValue({ ...p2, value: 100 - p2.value })}, ${c2})`
            }
            return `color-mix(${interpolation}, ${c1} ${serializeCSSComponentValue(p1)}, ${c2} ${serializeCSSComponentValue(p2)})`
        }
        p2 = serializeCSSComponentValue(p2)
        if (isOmitted(p1)) {
            return `color-mix(${interpolation}, ${c1}, ${c2} ${p2})`
        }
        return `color-mix(${interpolation}, ${c1} ${serializeCSSComponentValue(p1)}, ${c2} ${p2})`
    }
    if (types.includes('<legacy-device-cmyk-syntax>')) {
        return `device-cmyk(${serializeCSSComponentValueList(value, ' ')})`
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
    let source = ''
    value = value.flat(2).reduce((channels, component, index, components) => {
        let { types, value } = component
        if (isOmitted(component) || types[0] === '<delimiter-token>') {
            return channels
        }
        if (types.includes('<color>')) {
            source = `from ${serializeColor(component, true)} `
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
            if (!isSRGB || !isNumeric(value, true)) {
                value = serializeMathFunction(component)
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
        if (source || mixed) {
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
                value = Math.round(clamp(0, value, 255))
                break
        }
        channels.push(value)
        return channels
    }, [])

    if (source || mixed) {
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
    const { associatedToken, max, min, name, range, separator, type, value } = definition
    if (isMultiplied(definition)) {
        let string = ''
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
    if (type === 'function') {
        if (value) {
            return `${name}(${serializeDefinition(value)})`
        }
        return `${name}()`
    }
    if (type === 'simple-block') {
        if (associatedToken === '[') {
            return `'['${serializeDefinition(value)}']'`
        }
        return `${associatedToken}${serializeDefinition(value)}${blocks.associatedTokens[associatedToken]}`
    }
    if (type === 'property') {
        return `<'${name}'>`
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
    const { types, unit } = dimension
    const value = serializeNumber(dimension)
    if (types[0] === '<dimension-token>' || (unit !== '%' && types.length === 1)) {
        return value + serializeIdentifier({ value: unit })
    }
    return value + unit
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
    return `${name}(${serializeCSSComponentValue(value)})`
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
 * @param {object} selector
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframe-selector}
 *
 * It serializes the selector with a percentage when declared with a keyword
 * (browser conformance).
 */
function serializeKeyframeSelector(selector) {
    if (selector.types.includes('<keyword>')) {
        return selector.value === 'from' ? '0%' : '100%'
    }
    return serializeDimension(selector)
}

/**
 * @param {object} names
 * @param {boolean} [allowEmpty]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-names}
 *
 * It serializes empty line name list to empty string (browser conformance).
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
 * @param {object} numeric
 * @returns {string}
 */
function serializeInfinityOrNaN({ types, unit, value }) {
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
 * @param {boolean} forComputedOrLater
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-calculation-tree}
 */
function serializeCalculationTree(root, forComputedOrLater) {
    const { types, value } = root
    if (isNumeric(root)) {
        // https://github.com/w3c/csswg-drafts/issues/7456
        if (isInfinityOrNaN(root)) {
            return serializeInfinityOrNaN(root)
        }
        return serializeCSSComponentValue(root)
    }
    if (types.includes('<function>')) {
        if (mathFunctions.includes(root.name)) {
            return serializeMathFunction({ value: root }, forComputedOrLater)
        }
        return serializeCSSComponentValue(root)
    }
    if (types.includes('<calc-negate>')) {
        return `(-1 * ${serializeCalculationTree(value, forComputedOrLater)})`
    }
    if (types.includes('<calc-invert>')) {
        return `(1 / ${serializeCalculationTree(value, forComputedOrLater)})`
    }
    const [first, ...children] = sortCalculation(value)
    let string = `(${serializeCalculationTree(first, forComputedOrLater)}`
    if (types.includes('<calc-sum>')) {
        children.forEach(child => {
            const { types, value } = child
            if (types.includes('<calc-negate>')) {
                string += ` - ${serializeCalculationTree(value, forComputedOrLater)}`
            } else if (typeof value === 'number' && value < 0) {
                string += ` - ${serializeCSSComponentValue({ ...child, value: 0 - value })}`
            } else {
                string += ` + ${serializeCalculationTree(child, forComputedOrLater)}`
            }
        })
    } else if (types.includes('<calc-product>')) {
        children.forEach(child => {
            const { types, value } = child
            if (types.includes('<calc-invert>')) {
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
 * @param {object} fn
 * @param {boolean} [forComputedOrLater]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-math-function}
 */
function serializeMathFunction({ value: root }, forComputedOrLater = false) {
    const { name, types, range = {}, round } = root
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
            return serializeCSSComponentValue({ types, value: clamp(min, value, max) })
        }
        if (isInfinityOrNaN(root)) {
            return `calc(${serializeInfinityOrNaN(root)})`
        }
    }
    let string
    if (isResolved || isCalculationOperator(root)) {
        string = 'calc('
    } else {
        root = root.value
        string = `${name.toLowerCase()}(`
    }
    if (Array.isArray(root)) {
        root = root.reduce(
            (root, child, index) => {
                if (isOmitted(child) || child.value === 'nearest'/** && name === 'round' */) {
                    return root
                }
                if (isCalculation(child)) {
                    child = serializeCalculationTree(child, forComputedOrLater)
                    if (child === '1' && index === 2 && name === 'round') {
                        return root
                    }
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
    const [fillRule,, ...args] = value.map(serializeCSSComponentValue)
    let string = `${name}(`
    if (fillRule && fillRule !== 'nonzero') {
        string += `${fillRule}, `
    }
    return `${string}${serializeCSSComponentValueList(args)})`
}

/**
 * @param {object|object[]} position
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-position}
 */
function serializePosition(position) {
    if (Array.isArray(position)) {
        return serializeCSSComponentValueList(position)
    }
    let side
    if (position.types.includes('<keyword>')) {
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
            if (!isOmitted(size)) {
                const [horizontal, vertical] = size.map(serializeCSSComponentValue)
                if (vertical && vertical !== 'farthest-corner') {
                    options.push(horizontal, vertical)
                } else if (horizontal !== 'farthest-corner') {
                    options.push(horizontal)
                }
            }
            if (shape === 'circle' && (options.length === 0 || size[0]?.types.includes('<radial-extent>'))) {
                options.unshift('circle')
            } else if (shape === 'ellipse' && (options.length === 1 && size[0].types.includes('<length-percentage>'))) {
                options.push('farthest-corner')
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
 * @param {object[]} ratio
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-ratio-value}
 */
function serializeRatio([numerator, denumerator]) {
    return `${serializeNumber(numerator)} / ${isOmitted(denumerator) ? '1' : serializeNumber(denumerator[1])}`
}

/**
 * @param {object} ray
 * @returns {string}
 * @see {@link https://drafts.fxtf.org/motion-1/#funcdef-ray}
 */
function serializeRay({ name, value }) {
    const [angle, size, contain, position] = value.map(serializeCSSComponentValue)
    let string = `${name}(${serializeCSSComponentValue(angle)}`
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
 * @param {object|object[]} style
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#typedef-repeat-style}
 */
function serializeRepeatStyle(style) {
    if (Array.isArray(style)) {
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
    return serializeCSSComponentValue(style)
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
    if (Array.isArray(value)) {
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
 * @param {object} block
 * @returns {string}
 */
function serializeSimpleBlock({ associatedToken, value }) {
    return `${associatedToken}${serializeCSSComponentValue(value)}${blocks.associatedTokens[associatedToken]}`
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
 * @see {@link https://drafts.csswg.org/css-easing-2/#funcdef-step-easing-function-steps}
 */
function serializeSteps({ value: [count,, { value: position }] }) {
    count = serializeInteger(count)
    if (position && position !== 'end' && position !== 'jump-end') {
        return `steps(${count}, ${position})`
    }
    return `steps(${count})`
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
    const result = `U+${from.toString(16).toUpperCase()}`
    if (to === 0) {
        return result
    }
    return `${result}-${to.toString(16).toUpperCase()}`
}

/**
 * @param {object} view
 * @returns {string}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#funcdef-view}
 */
function serializeView({ value }) {
    const options = []
    if (Array.isArray(value)) {
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
 * @param {object|object[]} component
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom-1/#serialize-a-css-component-value}
 */
function serializeCSSComponentValue(component) {
    // Custom property value or pre-simplified value
    if (typeof component === 'string') {
        return component
    }
    if (isOmitted(component)) {
        return ''
    }
    const { types } = component
    for (let index = types.length - 1; 0 <= index; --index) {
        switch (types[index]) {
            case '<alpha-value>':
                return serializeAlpha(component)
            case '<an+b>':
                return serializeAnB(component)
            case '<attr()>':
                return serializeAttribute(component)
            case '<arc-command>':
                return serializeArcCommand(component)
            case '<baseline-position>':
                return serializeBaselinePosition(component)
            case '<bg-position>':
            case '<position>':
                return serializePosition(component)
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
                return serializeFilter(component)
            case '<color>':
                return serializeColor(component)
            case '<color-stripe>':
                return serializeColorStripe(component)
            case '<conic-gradient-syntax>':
                return serializeConicGradientSyntax(component)
            case '<content()>':
                return serializeContent(component)
            case '<counter>':
                return serializeCounter(component)
            case '<ident>':
            case '<ident-token>':
                return serializeIdentifier(component)
            case '<declaration>':
                return serializeDeclaration(component)
            case '<delimiter-token>':
            case '<keyword>':
                return component.value
            case '<dimension>':
            case '<dimension-token>':
            case '<percentage>':
            case '<percentage-token>':
                return serializeDimension(component)
            case '<feature-tag-value>':
                return serializeFeatureTagValue(component)
            case '<function>':
                return serializeFunction(component)
            case '<hash-token>':
                return serializeHash(component)
            case '<image-set-option>':
                return serializeImageSetOption(component)
            case '<inset()>':
            case '<rect()>':
            case '<xywh()>':
                return serializeBasicShapeRect(component)
            case '<integer>':
                return serializeInteger(component)
            case '<keyframe-selector>':
                return serializeKeyframeSelector(component)
            case '<line-names>':
                return serializeLineNames(component)
            case '<line-name-list>':
                return serializeLineNameList(component)
            case '<linear-gradient-syntax>':
                return serializeLinearGradientSyntax(component)
            case '<math-function>':
                return serializeMathFunction(component)
            case '<media-query>':
                return serializeMediaQuery(component)
            case '<number>':
            case '<number-token>':
                return serializeNumber(component)
            case '<path()>':
            case '<polygon()>':
                return serializePath(component)
            case '<radial-gradient-syntax>':
                return serializeRadialGradientSyntax(component)
            case '<ratio>':
                return serializeRatio(component)
            case '<ray()>':
                return serializeRay(component)
            case '<repeat-style>':
                return serializeRepeatStyle(component)
            case '<scale()>':
                return serializeScale(component)
            case '<scroll()>':
                return serializeScroll(component)
            case '<shadow>':
                return serializeShadow(component)
            case '<shape()>':
                return serializeShape(component)
            case '<simple-block>':
                return serializeSimpleBlock(component)
            case '<skew()>':
                return serializeSkew(component)
            case '<snap-block()>':
            case '<snap-inline()>':
                return serializeSnap(component)
            case '<steps()>':
                return serializeSteps(component)
            case '<string>':
            case '<string()>':
            case '<string-token>':
                return serializeString(component)
            case '<symbols()>':
                return serializeSymbols(component)
            case '<translate()>':
                return serializeTranslate(component)
            case '<urange>':
                return serializeUnicodeRange(component)
            case '<url-token>':
                return serializeURL(component)
            case '<view()>':
                return serializeView(component)
            case 'border-radius':
                return serializeBorderRadius(component)
            default:
                continue
        }
    }
    // List of component values
    if (Array.isArray(component)) {
        return serializeCSSComponentValueList(component)
    }
    throw RangeError('Unexpect component value to serialize')
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
 * a comma-separated list, and a whitespace separated list.
 *
 * It omits omitted values and join other values with a whitespace unless the
 * tail value starts with a comma.
 */
function serializeCSSComponentValueList(list, separator = list.separator ?? ' ') {
    switch (separator) {
        case ' ':
        case '':
            break
        case ',':
        case ';':
            separator += ' '
            break
        default:
            separator = ` ${separator} `
            break
    }
    return list.reduce(
        (value, component) => {
            component = serializeCSSComponentValue(component)
            if (component === ' ' || component === '') {
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
    return list(animations.map(animation => list(animation)), ',')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-animation-range}
 */
function representAnimationRange([{ value: start }, { value: end }]) {
    if (start.length !== end.length) {
        return ['']
    }
    const ranges = start.map((startRange, index) => {
        let endRange = end[index]
        if (Array.isArray(startRange)) {
            const [name, offset] = startRange.map(serializeCSSComponentValue)
            startRange = name
            if (offset && offset !== '0%') {
                startRange += ` ${offset}`
            } else if (endRange.types.includes('<length-percentage>')) {
                startRange += ' 0%'
            }
        } else {
            startRange = serializeCSSComponentValue(startRange)
        }
        if (Array.isArray(endRange)) {
            const [name, offset] = endRange.map(serializeCSSComponentValue)
            endRange = name
            if (offset && offset !== '100%') {
                endRange += ` ${offset}`
            } else if (Array.isArray(start[index]) && start[index][0].value === endRange) {
                return startRange
            }
        } else {
            endRange = serializeCSSComponentValue(endRange)
            if (endRange === 'normal') {
                return startRange
            }
        }
        return list([startRange, endRange])
    })
    return list(ranges, ',')
}

/**
 * @param {object[]|object[][]} range
 * @param {string} origin
 * @returns {object[]|string[]|object[][]}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-animation-range-start}
 */
function representAnimationRangeBoundary(range, origin) {
    const percentage = origin === 'animation-range-start' ? '0%' : '100%'
    return range.map(value => {
        if (Array.isArray(value)) {
            const [name, offset] = value.map(serializeCSSComponentValue)
            if (offset === percentage) {
                return name
            }
        }
        return value
    })
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
        let { length: index } = layer
        while (0 < index-- && 1 < layer.length) {
            const { [index]: { name } } = declarations
            const value = layer[index]
            if (
                value === properties[name].initial.serialized
                || (name === 'background-origin' && value === layer[index + 1])
            ) {
                layer.splice(index, 1)
            } else if (name === 'background-size') {
                layer.splice(index, 1, `/ ${value}`)
            }
        }
    })
    return list(layers, ',')
}

/**
 * @param {object[]|object[][]} size
 * @returns {object[]|object[][]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-background-size}
 */
function representBackgroundSize(size) {
    return size.map(component => {
        if (Array.isArray(component) && component[1]?.value === 'auto') {
            return component[0]
        }
        return component
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
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-clip}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin-block}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-overflow-clip-margin-inline}
 * @see {@link https://svgwg.org/svg2-draft/painting.html#MarkerShorthand}
 */
function representCommonLonghandValue(declarations) {
    const [head, ...tail] = declarations.map(serializeCSSValue)
    return tail.every(value => value === head) ? [head] : ['']
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
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
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
    if (Array.isArray(path)) {
        const [shape, box] = path.map(serializeCSSComponentValue)
        if (box && box !== 'border-box') {
            return [shape, box]
        }
        return [shape]
    }
    return [path]
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
        return Array.isArray(names) ? names : [names]
    }
    return list(values, '/')
}

/**
 * @param {object[]} declarations
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-corners}
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
 * @param {object|object[]} counter
 * @param {string} property
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-counter-increment}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-counter-set}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-counter-reset}
 */
function representCounter(counters, property) {
    if (Array.isArray(counters)) {
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
    if (Array.isArray(cue)) {
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
 * @param {object|object[]} family
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-family}
 */
function representFontFamily(family) {
    return family.types.at(-1) === 'font-family' ? [family] : ['']
}

/**
 * @param {object|object[]} range
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-weight}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-font-width}
 * @see {@link https://drafts.csswg.org/css-fonts-5/#descdef-font-face-font-size}
 */
function representFontRange(range) {
    if (Array.isArray(range)) {
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
    if (Array.isArray(style)) {
        let [, angle] = style
        angle = Array.isArray(angle)
            ? representSides(angle.map(serializeCSSComponentValue))[0]
            : serializeCSSComponentValue(angle)
        if (angle === '14deg') {
            return ['oblique']
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
    let { length: index } = values
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
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-row}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-column}
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
    if (Array.isArray(letter)) {
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
    } else if (fragment === 'auto') {
        if (maxLines === 'none' && blockEllipsis === 'none') {
            return ['none']
        }
    } else if (fragment === 'discard') {
        if (maxLines === 'none') {
            if (blockEllipsis !== 'none') {
                return [blockEllipsis]
            }
        } else if (blockEllipsis === 'auto') {
            return [maxLines]
        } else {
            return [maxLines, blockEllipsis]
        }
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
        let { length: index } = mask
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
 * @param {object[]} values
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-grid-3/#propdef-masonry-auto-flow}
 */
function representMasonryAutoFlow(flow) {
    const [distribution, selection] = flow.map(serializeCSSComponentValue)
    if (selection && selection !== 'definite-first') {
        if (distribution === 'pack') {
            return [selection]
        }
        if (distribution) {
            return [distribution, selection]
        }
    }
    return [distribution]
}

/**
 * @param {object|object[]} value
 * @returns {object[]|string[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#propdef-object-fit}
 */
function representObjectFit(value) {
    if (Array.isArray(value)) {
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
    if (Array.isArray(path)) {
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
 * @returns {string[]}
 * @see {@link https://drafts.csswg.org/css-anchor-position-1/#propdef-position-try}
 */
function representPositionTry(declarations) {
    const [order, options] = declarations.map(serializeCSSValue)
    return order === 'normal' ? [options] : [order, options]
}

/**
 * @param {object|object[]} scale
 * @returns {object|string[]}
 * @see {@link https://drafts.csswg.org/css-transforms-2/#propdef-scale}
 */
function representScale(scale) {
    if (Array.isArray(scale)) {
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
    if (Array.isArray(type)) {
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
    const { value: { length = 1 } } = declarations.find(({ name }) => name === 'scroll-timeline-name')
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
    if (Array.isArray(shape)) {
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
    if (Array.isArray(size)) {
        if (size[0].types.includes('<length>')) {
            return representSides(size.map(serializeCSSComponentValue))
        }
        return size
    }
    return [size]
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
 * @see {@link https://drafts.csswg.org/css-transitions-1/#propdef-transition}
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
    if (Array.isArray(values)) {
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
    const { value: { length = 1 } } = declarations.find(({ name }) => name === 'view-timeline-name')
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
    for (const [key, values] of whiteSpace.entries()) {
        if (values.every(({ value }, index) => value === declarations[index].value.value)) {
            return [key]
        }
    }
    return representWithoutInitialValues(declarations.map(serializeCSSValue), longhands)
}

/**
 * @param {string[]} list
 * @returns {string[]}
 */
function representSides(list) {
    list = [...list]
    let { length: index } = list
    while (1 < index--) {
        const side = list[index]
        const opposite = list[index - 2] ?? list[0]
        if (side !== opposite) {
            break
        }
        list.pop()
    }
    return list
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
function representDeclarationValue({ name, source, value }) {
    if (name.startsWith('--')) {
        return [source]
    }
    if (shorthands.has(name)) {
        const declarations = []
        for (const declaration of value) {
            const { name: longhand, value: longhandValue } = declaration
            if (hasPendingSubstitution(longhandValue)) {
                return value.every(declaration => declaration.value === longhandValue)
                    // All longhands are declared with the same shorthand pending-substitution value
                    ? [longhandValue]
                    // Some longhand is declared with a pending-substitution value of its own
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
                return representAnimationRange(declarations)
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
            case 'position-try':
                return representPositionTry(declarations)
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
    // Longhand with a pending-substitution value declared for its shorthand
    if (value.pending) {
        // https://github.com/w3c/csswg-drafts/issues/8022
        for (const longhands of shorthands.values()) {
            if (longhands.length === 1 && longhands.includes(name)) {
                return [value]
            }
        }
        return ['']
    }
    // Longhand with a CSS-wide keyword or a pending-substitution value of its own
    if (cssWideKeywords.includes(value.value) || hasPendingSubstitution(value)) {
        return [value]
    }
    // Longhand with an internal system font value
    if (value.types.includes('<system-font()>')) {
        return ['']
    }
    switch (name) {
        case 'animation-range-end':
        case 'animation-range-start':
            return representAnimationRangeBoundary(value, name)
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
        case 'font-family':
            return representFontFamily(value)
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
        case 'masonry-auto-flow':
            return representMasonryAutoFlow(value)
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
        case 'scale':
            return representScale(value)
        case 'scroll-snap-type':
            return representScrollSnapType(value)
        case 'shape-outside':
            return representShapeOutside(value)
        case 'size':
            return representSize(value)
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
