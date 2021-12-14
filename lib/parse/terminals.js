
const createList = require('../values/value.js')
const cssWideKeywords = require('../values/cssWideKeywords.js')
const dimensions = require('../values/dimensions.js')

const declarationEndChars = [']', '}', ';', '!']
const hexLengths = [3, 4, 6, 8]

/**
 * @param {object} number
 * @returns {number|null}
 * @see https://drafts.csswg.org/css-values-4/#zero-value
 */
function parseZero(number) {
    return parseNumber(number, { max: 0, min: 0 })
}

/**
 * @param {object} integer
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#integers
 */
function parseInteger(integer, options) {
    integer = parseNumber(integer, options)
    // `1e1` is tokenized into `Number { type: 'number', value: 10 }`
    if (integer && (Number.isInteger(integer.value) || integer.type.has('math-function'))) {
        return integer
    }
    return null
}

/**
 * @param {object} number
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#numbers
 */
function parseNumber(number, options = {}) {
    const { type, unit, value } = number
    const { min = -Infinity, max = Infinity } = options
    if ((type.has('number') || type.has('integer')) && !unit && min <= value && value <= max) {
        return number
    }
    return null
}

/**
 * @param {string} dimensionType
 * @param {object} dimension
 * @param {object} [options]
 * @returns {object|null}
 */
function parseDimension(dimensionType, dimension, options = {}) {
    const { min = -Infinity, max = Infinity } = options
    const { legacyZero = false, units } = dimensions[dimensionType]
    if (legacyZero && parseZero(dimension)) {
        dimension = {
            type: new Set(['dimension']),
            unit: dimensions[dimensionType].canonicalUnit,
            value: 0,
        }
    }
    const { type, unit, value } = dimension
    if (type.has('dimension') && units.includes(unit) && min <= value && value <= max) {
        return dimension
    }
    return null
}

/**
 * @param {object} angle
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#angles
 */
function parseAngle(angle, options) {
    return parseDimension('angle', angle, options)
}

/**
 * @param {object} decibel
 * @param {object} options
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-speech-1/#typedef-voice-volume-decibel
 */
function parseDecibel(decibel, options) {
    return parseDimension('decibel', decibel, options)
}

/**
 * @param {object} frequency
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-grid-2/#fr-unit
 */
function parseFlex(flex, options) {
    return parseDimension('flex', flex, options)
}

/**
 * @param {object} frequency
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#frequency
 */
function parseFrequency(frequency, options) {
    return parseDimension('frequency', frequency, options)
}

/**
 * @param {object} length
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#lengths
 */
function parseLength(length, options) {
    return parseDimension('length', length, options)
}

/**
 * @param {object} resolution
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#resolution
 */
function parseResolution(resolution, options) {
    return parseDimension('resolution', resolution, options)
}

/**
 * @param {object} semitones
 * @param {object} options
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-speech-1/#typedef-voice-pitch-semitones
 */
function parseSemitones(semitones, options) {
    return parseDimension('semitones', semitones, options)
}

/**
 * @param {object} time
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#time
 */
function parseTime(time, options) {
    return parseDimension('time', time, options)
}

/**
 * @param {object} percentage
 * @param {object} [options]
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#percentages
 */
function parsePercentage(percentage, options = {}) {
    const { type, value } = percentage
    const { min = -Infinity, max = Infinity } = options
    if (type.has('percentage') && min <= value && value <= max) {
        return percentage
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#typedef-ident
 */
function parseIdentifier(identifier) {
    return identifier.type.has('ident') ? identifier : null
}

/**
 * @param {object} identifier
 * @param {string} keyword
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#keywords
 */
function parseKeyword(identifier, keyword) {
    if (parseIdentifier(identifier)) {
        const lowercase = identifier.value.toLowerCase()
        if (lowercase === keyword.toLowerCase()) {
            identifier.value = lowercase
            return identifier
        }
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#custom-idents
 */
function parseCustomIdentifier(identifier) {
    if (parseIdentifier(identifier)) {
        const value = identifier.value.toLowerCase()
        if (!(cssWideKeywords.includes(value) || value === 'default')) {
            return identifier
        }
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#dashed-idents
 *
 * Aka. explicitly author-defined identifier or custom property, used as an
 * argument of a custom variable, ie. var(<dashed-ident>).
 */
function parseDashedIdentifier(identifier) {
    return (parseIdentifier(identifier) && identifier.value.startsWith('--')) ? identifier : null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-variables-1/#typedef-custom-property-name
 *
 * W3C decided on 2018/07/04 that `--` is reserved.
 */
function parseCustomPropertyName(identifier) {
    return (parseDashedIdentifier(identifier) && identifier.value !== '--') ? identifier : null
}

/**
 * @param {object} hash
 * @returns {object|null}
 * @see https://drafts.csswg.org/selectors-4/#typedef-id-selector
 *
 * Used in `element()`.
 */
function parseHash(hash) {
    return hash.type.has('hash-token') ? hash : null
}

/**
 * @param {object} hex
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-color-4/#typedef-hex-color
 */
function parseHexColor(hex) {
    if (parseHash(hex)) {
        const { value } = hex
        if ([...value].every(value => /[a-f\d]/i.test(value)) && hexLengths.includes(value.length)) {
            return hex
        }
        return null
    }
    return null
}

/**
 * @param {object} string
 * @returns {object|null}
 * @see https://drafts.csswg.org/css-values-4/#strings
 */
function parseString(string) {
    return string.type.has('string') ? string : null
}

/**
 * @param {object} url
 * @returns {object|null}
 */
function parseUrl(url) {
    return url.type.has('url-token') ? url : null
}

/**
 * @param {object}
 * @returns {object[]|null}
 * @see https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value
 */
function parseDeclarationValue(list) {
    const { index } = list
    const values = createList([], ',')
    let openParenthesis = false
    for (const value of list) {
        const { type } = value
        if (type?.has('bad-string') || type?.has('bad-url') || declarationEndChars.includes(value)) {
            list.moveTo(index)
            return null
        }
        if (value === ')') {
            if (openParenthesis) {
                list.moveTo(index)
                return null
            }
            openParenthesis = false
        } else if (value === '(') {
            openParenthesis = true
        }
        values.push(value)
    }
    return values
}

const terminals = {
    'angle': parseAngle,
    'custom-ident': parseCustomIdentifier,
    'custom-property-name': parseCustomPropertyName,
    'dashed-ident': parseDashedIdentifier,
    'decibel': parseDecibel,
    'declaration-value': parseDeclarationValue,
    'flex': parseFlex,
    'frequency': parseFrequency,
    'hash-token': parseHash,
    'hex-color': parseHexColor,
    'ident': parseIdentifier,
    'integer': parseInteger,
    'keyword': parseKeyword,
    'length': parseLength,
    'number': parseNumber,
    'percentage': parsePercentage,
    'resolution': parseResolution,
    'semitones': parseSemitones,
    'string': parseString,
    'time': parseTime,
    'url-token': parseUrl,
    'zero': parseZero,
}

module.exports = terminals
