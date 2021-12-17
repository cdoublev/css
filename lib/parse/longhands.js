
const createList = require('../values/value.js')
const properties = require('../properties/definitions.js')
const rules = require('./rules.js')
const shorthands = require('../properties/shorthands.js')

const borderTypes = ['line-width', 'line-style', 'color']

/**
 * @param {string[]} longhands
 * @returns {object}
 */
function getInitialLonghandValues(longhands) {
    return longhands.reduce((initial, longhand) => {
        if (shorthands.has(longhand)) {
            initial[longhand] = shorthands.get(longhand).map(getInitialLonghandValues).join(' ')
        } else {
            initial[longhand] = properties[longhand].representation
        }
        return initial
    }, {})
}

/**
 * @param {string} shorthand
 * @param {string|object} value
 * @returns {object}
 *
 * It sets all longhands to the same value.
 */
function setLonghandValues(shorthand, value) {
    return shorthands.get(shorthand).reduce((values, longhand) => {
        values[longhand] = value
        return values
    }, {})
}

/**
 * @param {object[]} list
 * @param {string} shorthand
 * @returns {object}
 *
 * It sets each longhand with the value at the index in `list` that corresponds
 * to its position in the list of longhands sorted by canonical order.
 */
function parseLonghandsByIndex(list, shorthand) {
    return shorthands.get(shorthand).reduce((values, longhand, i) => {
        values[longhand] = list[i] ?? properties[longhand].representation
        return values
    }, {})
}

/**
 * @param {object} list
 * @returns {object}
 * @see https://drafts.csswg.org/css-backgrounds-3/#background
 *
 * It allocates each background layer value to the comma separated list for the
 * corresponding longhand values, replacing an omitted `background-box` value by
 * the `background-clip` value, if any or vice-versa, and replaces other omitted
 * longhand values by their initial values.
 *
 * `background-color` is only allowed in the final background layer therefore it
 * is a single (optional) value instead of a comma separated list.
 *
 * TODO: parse `background-position` as a shorthand (CSS Background 4).
 */
function parseBackground(list) {
    const [bgLayers, [bgColor, ...finalBgLayer]] = list
    const layers = bgLayers.omitted ? [finalBgLayer] : [...bgLayers, finalBgLayer]
    const longhands = shorthands.get('background')
    const values = longhands.reduce((values, longhand) => {
        if (longhand === 'background-color') {
            if (bgColor.omitted) {
                values['background-color'] = properties['background-color'].representation
            } else {
                values['background-color'] = bgColor
            }
        /**
        } else if (longhand === 'background-position') {
            shorthands.get('background-position').forEach(longhand => values[longhand] = createList([], ','))
        */} else {
            values[longhand] = createList([], ',')
        }
        return values
    }, {})
    layers.forEach(([image, positionSize, repeat, attachment, origin, clip]) => {
        let position
        let size
        if (positionSize.omitted) {
            position = size = { omitted: true }
        } else {
            [position, size] = positionSize
            if (!size.omitted) {
                [, size] = size
            }
        }
        longhands.forEach(longhand => {
            if (longhand === 'background-color') {
                return
            }
            let value
            switch (longhand) {
                case 'background-image':
                    value = image
                    break
                case 'background-position':
                    value = position
                    break
                case 'background-size':
                    value = size
                    break
                case 'background-repeat':
                    value = repeat
                    break
                case 'background-attachment':
                    value = attachment
                    break
                case 'background-origin':
                    value = origin.omitted ? clip : origin
                    break
                case 'background-clip':
                    value = clip.omitted ? origin : clip
                    break
            }
            if (value.omitted) {
                const { representation: [initial] } = properties[longhand]
                values[longhand].push(initial)
            } else {
                values[longhand].push(value)
            }
        })
    })
    return values
}

/**
 * @param {object[]} list
 * @param {string} shorthand
 * @returns {object}
 */
function parseBorder(list, shorthand) {
    const longhands = shorthands.get(shorthand)
    const initial = getInitialLonghandValues(longhands)
    let divisor = 1
    let denominator = 3
    if (shorthand === 'border') {
        divisor = denominator = 4
    }
    return longhands.reduce((values, longhand, index) => {
        const typeIndex = Math.floor(index / divisor % denominator)
        const value = list.find(component => component.type.has(borderTypes[typeIndex]))
        if (value) {
            values[longhand] = value
        }
        return values
    }, initial)
}

/**
 * @param {object[]} radius
 * @returns {object}
 */
function parseBorderRadius(value) {
    const [horizontal, vertical] = rules['border-radius'](value)
    return horizontal.map((radius, index) => [radius, vertical[index]])
}

/**
 * @param {object[]} list
 * @returns {object}
 * @see https://drafts.csswg.org/css-fonts/#font-prop
 */
function parseFont(list) {
    const longhands = shorthands.get('font')
    const initial = getInitialLonghandValues(longhands)
    return list.reduce(function findComponent(values, component) {
        if (Array.isArray(component)) {
            return component.reduce(findComponent, values)
        }
        if (typeof component === 'string') {
            return values
        }
        const longhand = longhands.find(longhand => component.type.has(longhand))
        values[longhand] = component
        return values
    }, initial)
}

/**
 * @param {object[]} list
 * @param {string} shorthand
 * @returns {object}
 *
 * It normalizes implicit side value(s) into explicit side value(s).
 */
function parseSides(list, sides = 4) {
    let { length } = list
    while (length < sides) {
        list.push(list[Math.max(0, length++ - 2)])
    }
    return list
}

/**
 * @param {object[]} list
 * @returns {boolean}
 */
function hasPendingValue(list) {
    const { type, value } = list
    if (type.has('var()') || list.type.has('attr()')) {
        return true
    }
    // Search in function arguments
    if (Array.isArray(value)) {
        return value.some(hasPendingValue)
    }
    // Search in list
    if (Array.isArray(list)) {
        return list.some(hasPendingValue)
    }
    return false
}

/**
 * @param {object[]} list
 * @param {string} shorthand
 * @returns {object}
 *
 * It expands a list of component values parsed from a shorthand value into an
 * object mapping each of its longhands to the corresponding component value(s)
 * in their canonical order.
 */
function parseLonghands(list, shorthand) {
    // var() or attr()-containing value
    if (hasPendingValue(list)) {
        return setLonghandValues(shorthand, { pending: list, value: '' })
    }
    // CSS wide keyword
    if (list.type.has('css-wide-keyword')) {
        return setLonghandValues(shorthand, list)
    }
    switch (shorthand) {
        case 'background':
            return parseBackground(list)
        case 'border':
        case 'border-bottom':
        case 'border-left':
        case 'border-right':
        case 'border-top':
            return parseBorder(list, shorthand)
        case 'border-color':
        case 'border-style':
        case 'border-width':
        case 'margin':
        case 'padding':
            return parseLonghandsByIndex(parseSides(list), shorthand)
        case 'border-radius':
            return parseLonghandsByIndex(parseBorderRadius(list), shorthand)
        case 'font':
            return parseFont(list)
        default:
            return parseLonghandsByIndex(list, shorthand)
    }
}

module.exports = parseLonghands
