
const createList = require('../values/value.js')
const cssWideKeywords = require('../values/cssWideKeywords.js')
const dimensions = require('../values/dimensions.js')

const hexLengths = [3, 4, 6, 8]

/**
 * @param {object} number
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#zero-value}
 */
function parseZero(number) {
    return parseNumber(number, { max: 0, min: 0 })
}

/**
 * @param {object} integer
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#integers}
 *
 * It corresponds to a subset of the `<number-token>` production.
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
 * @param {object} integer
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-signed-integer}
 */
function parseSignedInteger(integer, options = {}) {
    return parseInteger(integer, { ...options, signless: false })
}

/**
 * @param {object} integer
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-signless-integer}
 */
function parseSignlessInteger(integer, options = {}) {
    return parseInteger(integer, { ...options, signless: true })
}

/**
 * @param {object} number
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#number-token-diagram}
 * @see {@link https://drafts.csswg.org/css-values-4/#numbers}
 *
 * It corresponds to the `<number-token>` production.
 */
function parseNumber(number, options = {}) {
    const { signed, type, unit, value } = number
    const { min = -Infinity, max = Infinity, signless } = options
    if (typeof signless === 'boolean' && signless === signed) {
        return null
    }
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
 * @see {@link https://drafts.csswg.org/css-syntax-3/#dimension-token-diagram}
 * @see {@link https://drafts.csswg.org/css-values-4/#dimensions}
 *
 * It corresponds to the `<dimension-token>` production.
 */
function parseDimension(dimensionType, dimension, options = {}) {
    const { min = -Infinity, max = Infinity } = options
    const { legacyZero = false, units } = dimensions[dimensionType]
    if (legacyZero && parseZero(dimension)) {
        const { signed } = dimension
        dimension = {
            signed,
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
 * @see {@link https://drafts.csswg.org/css-values-4/#angles}
 */
function parseAngle(angle, options) {
    return parseDimension('angle', angle, options)
}

/**
 * @param {object} decibel
 * @param {object} options
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-speech-1/#typedef-voice-volume-decibel}
 */
function parseDecibel(decibel, options) {
    return parseDimension('decibel', decibel, options)
}

/**
 * @param {object} frequency
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-flex}
 */
function parseFlex(flex, options) {
    return parseDimension('flex', flex, options)
}

/**
 * @param {object} frequency
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#frequency}
 */
function parseFrequency(frequency, options) {
    return parseDimension('frequency', frequency, options)
}

/**
 * @param {object} length
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#lengths}
 */
function parseLength(length, options) {
    return parseDimension('length', length, options)
}

/**
 * @param {object} n
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-n-dimension}
 */
function parseNDimension(n) {
    const { type, value, unit } = n
    if (type.has('dimension') && Number.isInteger(value) && unit === 'n') {
        return n
    }
    return null
}

/**
 * @param {object} ndash
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-ndash-dimension}
 */
function parseNDashDimension(ndash) {
    const { type, value, unit } = ndash
    if (type.has('dimension') && Number.isInteger(value) && unit === 'n-') {
        return ndash
    }
    return null
}

/**
 * @param {object} ndashdigit
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-ndashdigit-dimension}
 */
function parseNDashDigitDimension(ndashdigit) {
    const { type, value, unit } = ndashdigit
    if (type.has('dimension') && Number.isInteger(value) && /^n-\d+$/.test(unit)) {
        return ndashdigit
    }
    return null
}

/**
 * @param {object} resolution
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#resolution}
 */
function parseResolution(resolution, options) {
    return parseDimension('resolution', resolution, options)
}

/**
 * @param {object} semitones
 * @param {object} options
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-speech-1/#typedef-voice-pitch-semitones}
 */
function parseSemitones(semitones, options) {
    return parseDimension('semitones', semitones, options)
}

/**
 * @param {object} time
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#time}
 */
function parseTime(time, options) {
    return parseDimension('time', time, options)
}

/**
 * @param {object} percentage
 * @param {object} [options]
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#percentage-token-diagram}
 * @see {@link https://drafts.csswg.org/css-values-4/#percentages}
 *
 * It corresponds to the `<percentage-token>` production.
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
 * @see {@link https://drafts.csswg.org/css-syntax-3/#ident-token-diagram}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-ident}
 *
 * It corresponds to the `<ident-token>` production.
 */
function parseIdentifier(identifier) {
    return identifier.type.has('ident') ? identifier : null
}

/**
 * @param {object} identifier
 * @param {string} keyword
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#keywords}
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
 * @see {@link https://drafts.csswg.org/css-values-4/#custom-idents}
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
 * @see {@link https://drafts.csswg.org/css-values-4/#dashed-idents}
 */
function parseDashedIdentifier(identifier) {
    return (parseIdentifier(identifier) && identifier.value.startsWith('--')) ? identifier : null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-variables-1/#typedef-custom-property-name}
 *
 * W3C decided on 2018/07/04 that `--` is reserved.
 */
function parseCustomPropertyName(identifier) {
    return (parseDashedIdentifier(identifier) && identifier.value !== '--') ? identifier : null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-ndashdigit-ident}
 */
function parseNDashDigitIdent(identifier) {
    const parsed = parseIdentifier(identifier)
    if (parsed) {
        const { value, ...ident } = parsed
        const lowercase = value.toLowerCase()
        if (/^n-\d+$/.test(lowercase)) {
            return { value: lowercase, ...ident }
        }
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-dashndashdigit-ident}
 */
function parseDashNDashDigitIdent(identifier) {
    const parsed = parseIdentifier(identifier)
    if (parsed) {
        const { value, ...ident } = parsed
        const lowercase = value.toLowerCase()
        if (/^-n-\d+$/.test(lowercase)) {
            return { value: lowercase, ...ident }
        }
    }
    return null
}

/**
 * @param {object} hash
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#hash-token-diagram}
 *
 * It corresponds to the `<hash-token>` production.
 */
function parseHash(hash) {
    return hash.type.has('hash') ? hash : null
}

/**
 * @param {object} hex
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-color-4/#typedef-hex-color}
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
 * @see {@link https://drafts.csswg.org/css-syntax-3/#string-token-diagram}
 * @see {@link https://drafts.csswg.org/css-values-4/#strings}
 *
 * It corresponds to the `<string-token>` production.
 */
function parseString(string) {
    return string.type.has('string') ? string : null
}

/**
 * @param {object} url
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#url-token-diagram}
 *
 * It corresponds to the `<url-token>` production.
 */
function parseUrl(url) {
    return url.type.has('url') ? url : null
}

/**
 * @param {object} fn
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#function-token-diagram}
 *
 * It corresponds to the `<function-token>` production.
 *
 * This is only used to support future syntaxes, eg. the "functional notation"
 * in `<url()>`, which is only defined in prose for now.
 */
function parseFunction(fn) {
    return fn.type.has('function') ? fn : null
}

/**
 * @param {object[]} list
 * @param {boolean} [excludeEndChars]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-any-value}
 */
function parseAnyValue(list, excludeEndChars = false) {
    const { index } = list
    const values = createList([], ',')
    let openParenthesis = false
    for (const value of list) {
        const { type } = value
        const isInvalid = type?.has('bad-string')
            || type?.has('bad-url')
            || value === ']'
            || value === '}'
            || (excludeEndChars && (value === ';' || value === '!'))
        if (isInvalid) {
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

/**
 * @param {object[]}
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-declaration-value}
 */
function parseDeclarationValue(list) {
    return parseAnyValue(list, true)
}

const terminals = {
    'angle': parseAngle,
    'any-value': parseAnyValue,
    'custom-ident': parseCustomIdentifier,
    'custom-property-name': parseCustomPropertyName,
    'dashed-ident': parseDashedIdentifier,
    'dashndashdigit-ident': parseDashNDashDigitIdent,
    'decibel': parseDecibel,
    'declaration-value': parseDeclarationValue,
    'flex': parseFlex,
    'frequency': parseFrequency,
    'function': parseFunction,
    'hash': parseHash,
    'hex-color': parseHexColor,
    'ident': parseIdentifier,
    'integer': parseInteger,
    'keyword': parseKeyword,
    'length': parseLength,
    'n-dimension': parseNDimension,
    'ndash-dimension': parseNDashDimension,
    'ndashdigit-dimension': parseNDashDigitDimension,
    'ndashdigit-ident': parseNDashDigitIdent,
    'number': parseNumber,
    'percentage': parsePercentage,
    'resolution': parseResolution,
    'semitones': parseSemitones,
    'signed-integer': parseSignedInteger,
    'signless-integer': parseSignlessInteger,
    'string': parseString,
    'time': parseTime,
    'url-token': parseUrl,
    'zero': parseZero,
}

module.exports = terminals
