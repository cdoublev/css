
class List extends Array {

    types = []

    /**
     * @param {*} value
     * @returns {boolean}
     */
    static is(value) {
        return value instanceof this
    }

    /**
     * @see {@link https://github.com/tc39/proposal-rm-builtin-subclassing}
     *
     * It enforces returning Array rather than a List, which is consistent with
     * the TC39 proposal above.
     */
    static get [Symbol.species]() {
        return Array
    }
}

/**
 * @param {object[]} [values]
 * @param {string} [separator]
 * @param {string[]} [types]
 * @returns {List}
 */
function list(values = [], separator = ' ', types = []) {
    const value = new List(...values)
    value.separator = separator
    value.types.push(...types)
    return value
}

/**
 * @param {object[]} value
 * @param {function} predicate
 * @returns {object[]}
 */
function filter(value, predicate, types = value.types) {
    return list(value.filter(predicate), value.separator, types)
}

/**
 * @param {object|object[]} value
 * @param {function} transform
 * @param {string[]} [types]
 * @returns {object|object[]}
 */
function map(value, transform, types = []) {
    types = [...value.types, ...types]
    if (List.is(value)) {
        return list(value.map(transform), value.separator, types)
    }
    const { end, start, ...props } = value
    return { ...props, types, value: transform(props.value) }
}

function block(value = [], types = [], associatedToken = '[') {
    return { associatedToken, types: ['<block>', ...types], value: list(value) }
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

module.exports = {
    List,
    angle,
    block,
    customIdent,
    dashedIdent,
    decibel,
    delimiter,
    dimension,
    dimensionToken,
    filter,
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
    string,
    time,
}
