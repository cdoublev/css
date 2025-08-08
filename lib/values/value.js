
export const omitted = { types: [] }

export class List extends Array {

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
export function list(values = [], separator = ' ', types = []) {
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
export function filter(value, predicate, types = value.types) {
    return list(value.filter(predicate), value.separator, types)
}

/**
 * @param {object|object[]} value
 * @param {function} transform
 * @param {string[]} [types]
 * @returns {object|object[]}
 */
export function map(value, transform, types = []) {
    types = [...value.types, ...types]
    if (List.is(value)) {
        return list(value.map(transform), value.separator, types)
    }
    const { end, start, ...props } = value
    return { ...props, types, value: transform(props.value) }
}

export function block(value = [], types = [], associatedToken = '[') {
    return { associatedToken, types: ['<block>', ...types], value: list(value) }
}

export function delimiter(value, types = []) {
    return { types: ['<delimiter-token>', ...types], value }
}
export function dimensionToken(value, unit, types = []) {
    return { types: ['<dimension-token>', ...types], unit, value }
}
export function identToken(value, types = []) {
    return { types: ['<ident-token>', ...types], value }
}
export function numberToken(value, types = []) {
    return { types: ['<number-token>', ...types], value }
}

export function ident(value, types = []) {
    return identToken(value, ['<ident>', ...types])
}
export function customIdent(value, types = []) {
    return ident(value, ['<custom-ident>', ...types])
}
export function dashedIdent(value, types = []) {
    return customIdent(value, ['<dashed-ident>', ...types])
}
export function keyword(value, types = []) {
    return ident(value, ['<keyword>', ...types])
}
export function hash(value, types = []) {
    return { types: ['<hash-token>', ...types], value }
}
export function integer(value, types = []) {
    return numberToken(value, ['<integer>', ...types])
}
export function string(value, types = []) {
    return { types: ['<string-token>', '<string>', ...types], value }
}
export function number(value, types = []) {
    return numberToken(value, ['<number>', ...types])
}
export function percentage(value, types = []) {
    return { types: ['<percentage-token>', '<percentage>', ...types], unit: '%', value }
}
export function dimension(value, unit, types = []) {
    return dimensionToken(value, unit, ['<dimension>', ...types])
}
export function angle(value, unit, types = []) {
    return dimension(value, unit, ['<angle>', ...types])
}
export function decibel(value, types = []) {
    return dimension(value, 'db', ['<decibel>', ...types])
}
export function flex(value, types = []) {
    return dimension(value, 'fr', ['<flex>', ...types])
}
export function frequency(value, unit, types = []) {
    return dimension(value, unit, ['<frequency>', ...types])
}
export function length(value, unit, types = []) {
    return dimension(value, unit, ['<length>', ...types])
}
export function resolution(value, unit, types = []) {
    return dimension(value, unit, ['<resolution>', ...types])
}
export function semitones(value, types = []) {
    return dimension(value, 'st', ['<semitones>', ...types])
}
export function time(value, unit, types = []) {
    return dimension(value, unit, ['<time>', ...types])
}
