
const definitions = new Map([
    [
        'angle',
        {
            absoluteUnits: ['deg', 'grad', 'rad', 'turn'],
            canonicalUnit: 'deg',
            units: ['deg', 'grad', 'rad', 'turn'],
        },
    ],
    [
        'decibel',
        {
            canonicalUnit: 'dB',
            units: ['dB'],
        },
    ],
    [
        'flex',
        {
            canonicalUnit: 'fr',
            units: ['fr'],
        },
    ],
    [
        'frequency', {
            absoluteUnits: ['hz', 'khz'],
            canonicalUnit: 'hz',
            units: ['hz', 'khz'],
        },
    ],
    [
        'length',
        {
            absoluteUnits: ['cm', 'in', 'mm', 'q', 'pc', 'pt', 'px'],
            canonicalUnit: 'px',
            units: [
                'cap',
                'ch',
                'cm',
                'cqb',
                'cqh',
                'cqi',
                'cqmax',
                'cqmin',
                'cqw',
                'dvb',
                'dvh',
                'dvi',
                'dvmax',
                'dvmin',
                'dvw',
                'em',
                'ex',
                'ic',
                'in',
                'lh',
                'lvb',
                'lvh',
                'lvi',
                'lvmax',
                'lvmin',
                'lvw',
                'mm',
                'pc',
                'pt',
                'px',
                'q',
                'rcap',
                'rch',
                'rem',
                'rex',
                'ric',
                'rlh',
                'svb',
                'svh',
                'svi',
                'svmax',
                'svmin',
                'svw',
                'vb',
                'vh',
                'vi',
                'vmax',
                'vmin',
                'vw',
            ],
        },
    ],
    [
        'resolution',
        {
            absoluteUnits: ['dpcm', 'dpi', 'dppx', 'x'],
            canonicalUnit: 'dppx',
            min: 0,
            units: ['dpcm', 'dpi', 'dppx', 'x'],
        },
    ],
    [
        'semitones',
        {
            canonicalUnit: 'st',
            units: ['st'],
        },
    ],
    [
        'time',
        {
            absoluteUnits: ['s', 'ms'],
            canonicalUnit: 's',
            units: ['ms', 's'],
        },
    ],
])

/**
 * @param {object} dimension
 * @returns {object}
 */
function canonicalize(dimension) {
    const { type, unit, value } = dimension
    switch (unit) {
        case 'cm':
            return { type, unit: 'px', value: value * 96 / 2.54 }
        case 'dpcm':
            return { type, unit: 'dppx', value: value * 96 / 2.54 }
        case 'dpi':
            return { type, unit: 'dppx', value: value * 96 }
        case 'in':
            return { type, unit: 'px', value: value * 96 }
        case 'grad':
            return { type, unit: 'deg', value: value * 360 / 400 }
        case 'khz':
            return { type, unit: 'hz', value: value * 1000 }
        case 'mm':
            return { type, unit: 'px', value: value * 96 / 2.54 / 10 }
        case 'ms':
            return { type, unit: 's', value: value / 1000 }
        case 'q':
            return { type, unit: 'px', value: value * 96 / 2.54 / 40 }
        case 'pc':
            return { type, unit: 'px', value: value * 96 / 6 }
        case 'pt':
            return { type, unit: 'px', value: value * 96 / 72 }
        case 'rad':
            return { type, unit: 'deg', value: value * 180 / Math.PI }
        case 'turn':
            return { type, unit: 'deg', value: value * 360 }
        case 'x':
            return { type, unit: 'dppx', value }
        default:
            return dimension
    }
}

/**
 * @param {string} type
 * @returns {string}
 */
function getCanonicalUnitFromType(type) {
    return definitions.get(type).canonicalUnit
}

/**
 * @param {string} unit
 * @returns {string|null}
 */
function getTypeFromUnit(unit) {
    for (const [type, { units }] of definitions.entries()) {
        if (units.includes(unit)) {
            return type
        }
    }
    return null
}

module.exports = {
    canonicalize,
    definitions,
    getCanonicalUnitFromType,
    getTypeFromUnit,
}
