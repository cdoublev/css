
const absoluteUnits = [
    // angle
    'deg',
    'grad',
    'rad',
    'turn',
    // frequency
    'hz',
    'khz',
    // length
    'cm',
    'in',
    'mm',
    'q',
    'pc',
    'pt',
    'px',
    // resolution
    'dpcm',
    'dpi',
    'dppx',
    'x',
    // time
    's',
    'ms',
]

const angle = {
    canonicalUnit: 'deg',
    legacyZero: true,
    units: ['deg', 'grad', 'rad', 'turn'],
}

const decibel = {
    canonicalUnit: 'dB',
    units: ['dB'],
}

const flex = {
    canonicalUnit: 'fr',
    units: ['fr'],
}

const frequency = {
    canonicalUnit: 'hz',
    units: ['hz', 'khz'],
}

const length = {
    canonicalUnit: 'px',
    legacyZero: true,
    units: ['ch', 'cm', 'em', 'ex', 'in', 'lh', 'mm', 'pc', 'pt', 'px', 'q', 'rem', 'vh', 'vmin', 'vmax', 'vw'],
}

const resolution = {
    canonicalUnit: 'dppx',
    units: ['dpcm', 'dpi', 'dppx', 'x'],
}

const semitones = {
    canonicalUnit: 'st',
    units: ['st'],
}

const time = {
    canonicalUnit: 's',
    units: ['ms', 's'],
}

const units = [angle, decibel, flex, frequency, length, resolution, semitones, time].flatMap(({ units }) => units)

/**
 * @param {object} dimension
 * @param {function} [transform]
 * @returns {object}
 */
function canonicalize(dimension, transform = d => d) {
    let { unit, value } = dimension
    switch (unit) {
        case 'cm':
            value *= 96 / 2.54
            unit = 'px'
            break
        case 'dpcm':
            value *= 96 / 2.54
            unit = 'dppx'
            break
        case 'dpi':
            value *= 96
            unit = 'dppx'
            break
        case 'in':
            value *= 96
            unit = 'px'
            break
        case 'grad':
            value *= 360 / 400
            unit = 'deg'
            break
        case 'khz':
            value *= 1000
            unit = 'hz'
            break
        case 'mm':
            value *= 96 / 2.54 / 10
            unit = 'px'
            break
        case 'ms':
            value /= 1000
            unit = 's'
            break
        case 'q':
            value *= 96 / 2.54 / 40
            unit = 'px'
            break
        case 'pc':
            value *= 96 / 6
            unit = 'px'
            break
        case 'pt':
            value *= 96 / 72
            unit = 'px'
            break
        case 'rad':
            value *= 180 / Math.PI
            unit = 'deg'
            break
        case 'turn':
            value *= 360
            unit = 'deg'
            break
        case 'x':
            unit = 'dppx'
            break
        default:
            return { ...dimension, value: transform(value) }
    }
    return { ...dimension, unit, value: transform(value) }
}

/**
 * @param {string} type
 * @returns {string}
 */
function getCanonicalUnitFromType(type) {
    switch (type) {
        case 'angle':
            return 'deg'
        case 'flex':
            return 'fr'
        case 'frequency':
            return 'hz'
        case 'length':
            return 'px'
        case 'percentage':
            return '%'
        case 'time':
            return 's'
        case 'resolution':
            return 'dppx'
        default:
            throw RangeError(`Can not return the canonical unit of the unexpected type "${type}"`)
    }
}

module.exports = {
    absoluteUnits,
    angle,
    canonicalize,
    decibel,
    flex,
    frequency,
    getCanonicalUnitFromType,
    length,
    resolution,
    semitones,
    time,
    units,
}
