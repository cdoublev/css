
class List extends Array {

    /**
     * @see {@link https://github.com/tc39/proposal-rm-builtin-subclassing}
     *
     * It prevents `list([1]).map(id)` from returning `[undefined, 1]`, and is
     * compatible with a future breaking change.
     */
    static get [Symbol.species]() {
        return Array
    }

    constructor(values, separator, types) {
        super()
        this.push(...values)
        this.types = types
        this.separator = separator
    }
    filter(fn) {
        return new List(super.filter(fn), this.separator, this.types)
    }
    map(fn) {
        return new List(super.map(fn), this.separator, this.types)
    }
}

/**
 * @param {object[]} [values]
 * @param {string} [separator]
 * @param {string[]} [types]
 * @returns {List}
 *
 * This factory returns a list of values that can be transformed using `Array`
 * interface while preserving its properties.
 */
function list(values = [], separator = ' ', types = []) {
    return new List(values, separator, types)
}

/**
 * @param {object} component
 * @param {function} transform
 * @param {string[]} newTypes
 * @returns {object}
 */
function map({ end, start, types, value, ...props }, transform, newTypes = []) {
    return { ...props, types: [...types, ...newTypes], value: transform(value) }
}

function delimiter(value, types = []) {
    return { types: ['<delimiter-token>', ...types], value }
}
function dimensionToken(value, unit, types = []) {
    return { types: ['<dimension-token>', ...types], unit, value }
}
function identToken(value, types = []) {
    return { types: ['<ident-token>', ...types], value }
}
function numberToken(value, types = []) {
    return { types: ['<number-token>', ...types], value }
}

function ident(value, types = []) {
    return identToken(value, ['<ident>', ...types])
}
function customIdent(value, types = []) {
    return ident(value, ['<custom-ident>', ...types])
}
function dashedIdent(value, types = []) {
    return customIdent(value, ['<dashed-ident>', ...types])
}
function keyword(value, types = []) {
    return ident(value, ['<keyword>', ...types])
}
function hash(value, types = []) {
    return { types: ['<hash-token>', ...types], value }
}
function integer(value, types = []) {
    return numberToken(value, ['<integer>', ...types])
}
function string(value, types = []) {
    return { types: ['<string-token>', '<string>', ...types], value }
}
function number(value, types = []) {
    return numberToken(value, ['<number>', ...types])
}
function percentage(value, types = []) {
    return { types: ['<percentage-token>', '<percentage>', ...types], unit: '%', value }
}
function dimension(value, unit, types = []) {
    return dimensionToken(value, unit, ['<dimension>', ...types])
}
function angle(value, unit, types = []) {
    return dimension(value, unit, ['<angle>', ...types])
}
function decibel(value, types = []) {
    return dimension(value, 'db', ['<decibel>', ...types])
}
function flex(value, types = []) {
    return dimension(value, 'fr', ['<flex>', ...types])
}
function frequency(value, unit, types = []) {
    return dimension(value, unit, ['<frequency>', ...types])
}
function length(value, unit, types = []) {
    return dimension(value, unit, ['<length>', ...types])
}
function resolution(value, unit, types = []) {
    return dimension(value, unit, ['<resolution>', ...types])
}
function semitones(value, types = []) {
    return dimension(value, 'st', ['<semitones>', ...types])
}
function time(value, unit, types = []) {
    return dimension(value, unit, ['<time>', ...types])
}

function simpleBlock(value = [], types = [], associatedToken = '[') {
    return { associatedToken, types: ['<simple-block>', ...types], value: list(value) }
}

module.exports = {
    angle,
    customIdent,
    dashedIdent,
    decibel,
    delimiter,
    dimension,
    dimensionToken,
    flex,
    frequency,
    hash,
    ident,
    identToken,
    integer,
    keyword,
    length,
    list,
    map,
    number,
    numberToken,
    omitted: { types: [] },
    percentage,
    resolution,
    semitones,
    simpleBlock,
    string,
    time,
}
