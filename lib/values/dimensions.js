
export const definitions = new Map([
    [
        '<angle>',
        {
            absoluteUnits: ['deg', 'grad', 'rad', 'turn'],
            canonicalUnit: 'deg',
            units: ['deg', 'grad', 'rad', 'turn'],
        },
    ],
    [
        '<decibel>',
        {
            canonicalUnit: 'db',
            units: ['db'],
        },
    ],
    [
        '<flex>',
        {
            canonicalUnit: 'fr',
            min: 0,
            units: ['fr'],
        },
    ],
    [
        '<frequency>', {
            absoluteUnits: ['hz', 'khz'],
            canonicalUnit: 'hz',
            units: ['hz', 'khz'],
        },
    ],
    [
        '<length>',
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
        '<resolution>',
        {
            absoluteUnits: ['dpcm', 'dpi', 'dppx', 'x'],
            canonicalUnit: 'dppx',
            min: 0,
            units: ['dpcm', 'dpi', 'dppx', 'x'],
        },
    ],
    [
        '<semitones>',
        {
            canonicalUnit: 'st',
            units: ['st'],
        },
    ],
    [
        '<time>',
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
export function canonicalize(dimension) {
    const { types, unit, value } = dimension
    switch (unit) {
        case 'cm':
            return { types, unit: 'px', value: value * 96 / 2.54 }
        case 'dpcm':
            return { types, unit: 'dppx', value: value * 96 / 2.54 }
        case 'dpi':
            return { types, unit: 'dppx', value: value * 96 }
        case 'in':
            return { types, unit: 'px', value: value * 96 }
        case 'grad':
            return { types, unit: 'deg', value: value * 360 / 400 }
        case 'khz':
            return { types, unit: 'hz', value: value * 1000 }
        case 'mm':
            return { types, unit: 'px', value: value * 96 / 2.54 / 10 }
        case 'ms':
            return { types, unit: 's', value: value / 1000 }
        case 'q':
            return { types, unit: 'px', value: value * 96 / 2.54 / 40 }
        case 'pc':
            return { types, unit: 'px', value: value * 96 / 6 }
        case 'pt':
            return { types, unit: 'px', value: value * 96 / 72 }
        case 'rad':
            return { types, unit: 'deg', value: value * 180 / Math.PI }
        case 'turn':
            return { types, unit: 'deg', value: value * 360 }
        case 'x':
            return { types, unit: 'dppx', value }
        default:
            return dimension
    }
}

/**
 * @param {string} type
 * @returns {string}
 */
export function getCanonicalUnitFromType(type) {
    return definitions.get(type).canonicalUnit
}

/**
 * @param {string} unit
 * @returns {string|null}
 */
export function getTypeFromUnit(unit) {
    for (const [type, { units }] of definitions) {
        if (units.includes(unit)) {
            return type
        }
    }
    return null
}
