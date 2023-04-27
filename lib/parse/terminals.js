
const { aliases, mappings } = require('../values/compatibility.js')
const { canonicalize, definitions: dimensions, getTypeFromUnit } = require('../values/dimensions.js')
const { keywords: cssWideKeywords } = require('../values/substitutions.js')

const hexLengths = [3, 4, 6, 8]

/**
 * @param {object} zero
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#zero-value}
 */
function parseZero(zero) {
    return parseNumber(zero, { max: 0, min: 0 })
}

/**
 * @param {object} integer
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#integer-value}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7289}
 */
function parseInteger(integer, node) {
    if (parseNumber(integer, node) && Number.isInteger(integer.value)) {
        return integer
    }
    return null
}

/**
 * @param {object} integer
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-signed-integer}
 */
function parseSignedInteger(integer, node) {
    const { representation: [sign] } = integer
    if ((sign === '+' || sign === '-') && parseInteger(integer, node)) {
        return integer
    }
    return null
}

/**
 * @param {object} integer
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-signless-integer}
 */
function parseSignlessInteger(integer, node) {
    const { representation: [sign] } = integer
    if (sign !== '+' && sign !== '-' && parseInteger(integer, node)) {
        return integer
    }
    return null
}

/**
 * @param {object} number
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#number-token-diagram}
 * @see {@link https://drafts.csswg.org/css-values-4/#number-value}
 */
function parseNumber(number, { min = -Infinity, max = Infinity }) {
    const { type, value } = number
    if (type.has('number') && min <= value && value <= max) {
        return number
    }
    return null
}

/**
 * @param {object} dimension
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#dimension-token-diagram}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-dimension-token}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-dimension}
 */
function parseDimension(dimension, node) {
    const { name } = node
    if (name === 'dimension' || name === 'dimension-token') {
        const { type, unit } = dimension
        if (type.has('dimension')) {
            const dimensionType = getTypeFromUnit(unit)
            if (dimensionType) {
                type.add(dimensionType)
            }
            return dimension
        }
        return null
    }
    if (dimensions.has(name)) {
        const definition = dimensions.get(name)
        const { unit, value } = canonicalize(dimension)
        const min = Math.max(node.min ?? definition.min ?? -Infinity)
        const max = Math.min(node.max ?? definition.max ?? Infinity)
        if (definition.units.includes(unit) && min <= value && value <= max) {
            return dimension
        }
    }
    return null
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
 * @param {object} percentage
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#percentage-token-diagram}
 * @see {@link https://drafts.csswg.org/css-values-4/#percentage-value}
 */
function parsePercentage(percentage, { min = -Infinity, max = Infinity }) {
    const { type, value } = percentage
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
 */
function parseIdentifier(identifier) {
    return identifier.type.has('ident') ? identifier : null
}

/**
 * @param {object} identifier
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#css-keyword}
 */
function parseKeyword(identifier, { value }) {
    if (parseIdentifier(identifier)) {
        const lowercase = identifier.value.toLowerCase()
        value = value.toLowerCase()
        if (lowercase === value || mappings.get(lowercase) === value) {
            identifier.value = lowercase
            return identifier
        }
        if (aliases.get(lowercase) === value) {
            identifier.value = value
            return identifier
        }
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#identifier-value}
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
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-dashed-ident}
 */
function parseDashedIdentifier(identifier) {
    if (parseIdentifier(identifier) && identifier.value.startsWith('--')) {
        return identifier
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-variables-2/#typedef-custom-property-name}
 */
function parseCustomPropertyName(identifier) {
    if (parseDashedIdentifier(identifier) && identifier.value !== '--') {
        return identifier
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-ndashdigit-ident}
 */
function parseNDashDigitIdent(identifier) {
    if (parseIdentifier(identifier)) {
        const lowercase = identifier.value.toLowerCase()
        if (/^n-\d+$/.test(lowercase)) {
            identifier.value = lowercase
            return identifier
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
    if (parseIdentifier(identifier)) {
        const lowercase = identifier.value.toLowerCase()
        if (/^-n-\d+$/.test(lowercase)) {
            identifier.value = lowercase
            return identifier
        }
    }
    return null
}

/**
 * @param {object} hash
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#hash-token-diagram}
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
 * @see {@link https://drafts.csswg.org/css-values-4/#string-value}
 */
function parseString(string) {
    return string.type.has('string') ? string : null
}

/**
 * @param {object} url
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#url-token-diagram}
 */
function parseUrl(url) {
    return url.type.has('url') ? url : null
}

/**
 * @param {object} fn
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#function-token-diagram}
 *
 * This is only used to support future syntaxes, eg. the "functional notation"
 * in <url()>, which is only defined in prose for now.
 */
function parseFunction(fn) {
    return fn.type.has('function') ? fn : null
}

module.exports = {
    'angle': parseDimension,
    'custom-ident': parseCustomIdentifier,
    'custom-property-name': parseCustomPropertyName,
    'dashed-ident': parseDashedIdentifier,
    'dashndashdigit-ident': parseDashNDashDigitIdent,
    'decibel': parseDimension,
    'dimension': parseDimension,
    'dimension-token': parseDimension,
    'flex': parseDimension,
    'frequency': parseDimension,
    'function': parseFunction,
    'function-token': parseFunction,
    'hash': parseHash,
    'hash-token': parseHash,
    'hex-color': parseHexColor,
    'ident': parseIdentifier,
    'ident-token': parseIdentifier,
    'integer': parseInteger,
    'keyword': parseKeyword,
    'length': parseDimension,
    'n-dimension': parseNDimension,
    'ndash-dimension': parseNDashDimension,
    'ndashdigit-dimension': parseNDashDigitDimension,
    'ndashdigit-ident': parseNDashDigitIdent,
    'number': parseNumber,
    'number-token': parseNumber,
    'percentage': parsePercentage,
    'percentage-token': parsePercentage,
    'resolution': parseDimension,
    'semitones': parseDimension,
    'signed-integer': parseSignedInteger,
    'signless-integer': parseSignlessInteger,
    'string': parseString,
    'string-token': parseString,
    'time': parseDimension,
    'url-token': parseUrl,
    'zero': parseZero,
}
