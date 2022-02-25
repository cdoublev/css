
const { areEqualNumeric, isCalcOperatorNode, isInfinityOrNaN, isNumeric } = require('./values/validation.js')
const associatedBlockTokens = require('./values/associated-block-tokens.js')
const createList = require('./values/value.js')
const { mathFunctionTypes } = require('./parse/types.js')
const { getCanonicalUnitFromType } = require('./values/dimensions.js')
const { hslToRgb } = require('./utils/colorSpace.js')
const { clamp } = require('./utils/math.js')
const properties = require('./properties/definitions.js')
const { elements: pseudoElements } = require('./values/pseudos.js')
const shorthands = require('./properties/shorthands.js')

/**
 * @param {object} alpha
 * @param {boolean} [is8Bit]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-alphavalue-def}
 */
function serializeAlpha(alpha, is8Bit = false) {
    if (alpha.type.has('percentage')) {
        alpha.value /= 100
    }
    if (is8Bit) {
        const { value: a } = alpha
        const integer = Math.round(a / 2.55)
        // Fix JS precision (eg. `50 * 2.55 === 127.499...` instead of `127.5`) with toPrecision(15)
        const hasInteger = Math.round((integer * 2.55).toPrecision(15)) === a
        alpha.value = hasInteger ? integer / 100 : Math.round(a / 0.255) / 1000
    }
    return serializeNumber(alpha)
}

/**
 * @param {object} angle
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-angle-value}
 */
function serializeAngle(angle) {
    const { unit = 'deg' } = angle
    return serializeNumber(angle) + unit
}

/**
 * @param {object|object[]} notation
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#serialize-an-anb-value}
 */
function serializeAnB({ value: { a, b } }) {
    if (a === 0) {
        return `${b}`
    }
    let result = ''
    if (a === 1) {
        result += 'n'
    } else if (a === -1) {
        result += '-n'
    } else {
        result += `${a}n`
    }
    if (0 < b) {
        result += `+${b}`
    } else if (b < 0) {
        result += b
    }
    return result
}

/**
 * @param {object[][]} radii
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds/#border-radius}
 */
function serializeBorderRadius([horizontal, vertical]) {
    horizontal = serializeSides(horizontal)
    vertical = serializeSides(vertical)
    if (horizontal === vertical) {
        return horizontal
    }
    return `${horizontal} / ${vertical}`
}

/**
 * @param {object} color
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-color-4/#serializing-color-values}
 *
 * "This section updates and replaces that part of CSS Object Model, section
 * Serializing CSS Values, which relates to serializing <color> values."
 *
 * The color function arguments should be clamped "at computed value time" but
 * user agents and this library clamp at "serialize value time".
 */
function serializeColor(color) {

    if (color.type.has('keyword')) {
        return serializeKeyword(color)
    }

    const { name, type, value } = color

    let rgb
    let alpha

    if (type.has('hex-color')) {
        const [n1, n2, n3, n4, n5, n6, n7, n8] = value
        switch (value.length) {
            case 3:
                rgb = [Number(`0x${n1}${n1}`), Number(`0x${n2}${n2}`), Number(`0x${n3}${n3}`)]
                break
            case 4:
                rgb = [Number(`0x${n1}${n1}`), Number(`0x${n2}${n2}`), Number(`0x${n3}${n3}`)]
                alpha = { type: new Set(['number']), value: Number(`0x${n4}${n4}` / 255) }
                break
            case 6:
                rgb = [Number(`0x${n1}${n2}`), Number(`0x${n3}${n4}`), Number(`0x${n5}${n6}`)]
                break
            case 8:
                rgb = [Number(`0x${n1}${n2}`), Number(`0x${n3}${n4}`), Number(`0x${n5}${n6}`)]
                alpha = { type: new Set(['number']), value: Number(`0x${n7}${n8}` / 255) }
                break
            default:
                throw Error('Unexpected length of hexadecimal color value')
        }
    } else if (name === 'hsl' || name === 'hsla') {
        const [h, s, l, a] = value.flat().filter(({ value }) => value !== ',' && value !== '/')
        const hsl = [h, s, l].map(component => {
            const { type, value } = component
            if (type.has('math-function')) {
                const numeric = serializeMathFunction(component, true)
                if (numeric.endsWith('%')) {
                    return numeric.slice(0, -1)
                }
                return numeric
            }
            return value
        })
        // Color should be serialized to <rgb()> or <rgba()>
        rgb = hslToRgb(...hsl)
        alpha = a
    } else if (name === 'rgb' || name === 'rgba') {
        const [r, g, b, a] = value.flat().filter(({ value }) => value !== ',' && value !== '/')
        // RGB should be serialized to unsigned 8 bit integers clamped to 0-255
        rgb = [r, g, b].map(component => {
            let { value } = component
            if (component.type.has('math-function')) {
                value = serializeMathFunction(component, true)
                if (value.endsWith('%')) {
                    value = value.slice(0, -1)
                }
            }
            if (component.type.has('percentage')) {
                value /= 100 * 255
            }
            return Math.round(Math.min(255, Math.max(0, value)))
        })
        alpha = a
    }
    if (alpha) {
        if (alpha.type.has('percentage')) {
            // Fix JS precision, eg. 50 * 2.55 === 127.499... instead of 127.5), with toPrecision(15)
            const value = Math.round((Math.max(0, Math.min(alpha.value, 100)) * 2.55).toPrecision(15))
            alpha = serializeAlpha({ type: new Set(['integer']), value }, true)
        } else {
            alpha.value = Math.max(0, Math.min(1, alpha.value))
            alpha = serializeAlpha(alpha)
        }
        if (alpha < 1) {
            return `rgba(${rgb.join(', ')}, ${alpha})`
        }
    }
    return `rgb(${rgb.join(', ')})`
}

/**
 * @param {object} counter
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-typedef-counter}
 */
function serializeCounter({ name, value }) {
    let list
    if (value.length > 2) {
        list = value.slice(0, 2)
    } else {
        list = value.slice(0, 1)
    }
    const last = list.at(-1)
    if (last.value === 'decimal') {
        list.push(last)
    }
    return `${name}(${serializeCSSComponentValueList(list)})`
}

/**
 * @param {object} declaration
 * @returns {string}
 */
function serializeDeclaration({ name, important, value }) {
    return serializeCSSDeclaration(name, serializeCSSComponentValue(value), important, false)
}

/**
 * @param {object} dimension
 * @returns {string}
 *
 * TODO: figure out the appropriate strategy to serialize `dimension` types.
 */
function serializeDimension(dimension) {
    const { unit } = dimension
    return serializeNumber(dimension) + unit
}

/**
 * @param {object} identifier
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-value-def-identifier}
 */
function serializeIdentifier({ value }) {
    return [...value].reduce(
        (value, char, index) => {
            const codePoint = char.codePointAt(0)
            if (codePoint === 0) {
                return value += '�'
            }
            if ((0x1 <= codePoint && codePoint <= 0x1F) || codePoint === 0x7F) {
                return `${value}\\u${codePoint}`
            }
            if (index === 0) {
                if (0x30 <= codePoint && codePoint <= 0x39) {
                    return `${value}\\u${codePoint}`
                }
                if (codePoint === 0x2D && value.length === 1) {
                    return `${value}\\${char}`
                }
            }
            if (index === 1 && 0x30 <= codePoint && codePoint <= 0x39 && value[0] === 0x2D) {
                return `${value}\\u${codePoint}`
            }
            if (0x80 <= codePoint || /[-\w]/.test(char)) {
                return value += char
            }
            return `${value}\\${char}`
        },
        '')
}

/**
 * @param {object} frequency
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-frequency-value}
 */
function serializeFrequency(frequency) {
    const { unit = 'hz' } = frequency
    return serializeNumber(frequency) + unit
}

/**
 * @param {object} fn
 * @returns {string}
 */
function serializeFunction({ closed = true, name, value }) {
    return `${name}(${serializeCSSComponentValue(value)}${closed ? ')' : ''}`
}

/**
 * @param {object[]} args
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-inset}
 */
function serializeInset([offsets, corners]) {
    offsets = serializeSides(offsets)
    if (corners.omitted) {
        return `inset(${offsets})`
    }
    const [, borderRadius] = corners
    corners = serializeBorderRadius(borderRadius)
    if (corners === '0%' || corners === '0px' || corners === 'calc(0%)' || corners === 'calc(0px)') {
        return `inset(${offsets})`
    }
    return `inset(${offsets} round ${corners})`
}

/**
 * @param {object} keyword
 * @returns {string}
 */
function serializeKeyword({ value }) {
    return value.toLowerCase()
}

/**
 * @param {object} length
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-length-value}
 */
function serializeLength(length) {
    const { unit = 'px' } = length
    return serializeNumber(length) + unit
}

/**
 * @param {string} query
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-media-query}
 */
function serializeMediaQuery(query) {
    /**
     * (name)
     *
     * {
     *   type: ['simple-block', 'media-feature', 'media-in-parens', 'media-condition', 'media-query'],
     *   value: [{
     *     type: ['ident', 'mf-name', 'mf-boolean'],
     *     value: string,
     *   }],
     * }
     */
    /**
     * not (name)
     *
     * [
     *   type: ['media-not', 'media-condition', 'media-query'],
     *   { type: ['ident'], value: 'not' },
     *   {
     *     type: ['simple-block', 'media-feature', 'media-in-parens'],
     *     value: [{
     *       type: ['ident', 'mf-name', 'mf-boolean'],
     *       value: string,
     *     }],
     *   },
     * ]
     */
    /**
     * (name: value)
     *
     * {
     *   type: ['simple-block', 'media-feature', 'media-in-parens', 'media-condition', 'media-query'],
     *   value: [
     *     [
     *       type: ['mf-plain'],
     *       { type: ['ident', 'mf-name'], value: string },
     *       { type: ['delimiter'], value: ':' },
     *       { type: ['ident', 'mf-value'], value: CSSValue },
     *     ],
     *   ],
     * }
     */
    /**
     * (name = value) OR (name < value) OR (name > value) OR (name <= value) OR (name >= value)
     *
     * {
     *   type: ['simple-block', 'media-feature', 'media-in-parens', 'media-condition', 'media-query'],
     *   value: [
     *     [
     *       type: ['mf-range'],
     *       { type: ['ident', 'mf-name'], value: string },
     *       { type: ['delimiter', 'mf-eq', 'mf-comparison'], value: '=' },
     *       { type: ['ident', 'mf-value'], value: CSSValue },
     *     ],
     *   ],
     * }
     *
     * OR inverse name and value positions
     * OR place name between value and comparison at left and comparison and value at right
     */
    /**
     * (name) and (name) and ... OR (name) or (name) or ...
     *
     * [
     *   type: ['media-condition', 'media-query'],
     *   {
     *     type: ['simple-block', 'media-feature', 'media-in-parens', 'media-condition'],
     *     value: [{
     *       type: ['ident', 'mf-name', 'mf-boolean'],
     *       value: string,
     *     }],
     *   },
     *   [
     *     type: ['media-and'],
     *     { type: ['ident'], value: 'and' },
     *     {
     *       type: ['simple-block', 'media-feature', 'media-in-parens', 'media-condition'],
     *       value: [{
     *         type: ['ident', 'mf-name', 'mf-boolean'],
     *         value: string,
     *       }],
     *     },
     *     { type: ['ident'], value: 'and' },
     *     ...
     *   ],
     * ],
     */
    /**
     * not type OR only type
     *
     * [
     *   type: ['media-query'],
     *   { type: ['ident'], value: 'not' },
     *   { type: ['ident', 'media-type'], value: string },
     * ],
     */
    /**
     * not type and (name) OR only type and (name)
     *
     * [
     *   type: ['media-query'],
     *   { type: ['ident'], value: 'not' },
     *   { type: ['ident', 'media-type'], value: string },
     *   [
     *     type: [],
     *     { type: ['ident'], value: 'and' },
     *     {
     *       type: ['simple-block', 'media-feature', 'media-in-parens', 'media-condition-without-or'],
     *       value: [{ type: ['ident', 'mf-boolean'], value: string }],
     *     },
     *   ],
     * ]
     */
    /**
     * not type and not (name) OR only type and not (name)
     *
     * [
     *   type: ['media-query'],
     *   { type: ['ident'], value: 'not' },
     *   { type: ['ident', 'media-type'], value: string },
     *   [
     *     { type: ['ident'], value: 'and' },
     *     [
     *       type: ['media-not', 'media-condition-without-or'],
     *       { type: ['ident'], value: 'not' },
     *       {
     *         type: ['simple-block', 'media-feature', 'media-in-parens'],
     *         value: [{ type: ['ident', 'mf-name', 'mf-boolean', ] }]
     *       },
     *     ]
     *   ],
     * ]
     */
    /**
     * not? ( not? ( ... (name) ... ) ...)
     */
    /**
     * Reduce the result of matching against `<media-query>` into `{ features, negated, type }`
     *
     * <media-query> = <media-condition> | [not | only]? <media-type> [and <media-condition-without-or>]?
     *
     * <media-condition> = <media-not> | <media-in-parens> [ <media-and>* | <media-or>* ]
     * <media-condition-without-or> = <media-not> | <media-in-parens> <media-and>*
     * <media-type> = <ident>
     *
     * <media-not> = not <media-in-parens>
     * <media-in-parens> = (<media-condition>) | <media-feature> | <general-enclosed>
     * <media-and> = and <media-in-parens>
     * <media-or> = or <media-in-parens>
     *
     * <media-feature> = (<mf-plain> | <mf-boolean> | <mf-range>)
     * <general-enclosed> = [ <function-token> <any-value> ) ] | ( <ident> <any-value> )
     *
     * <mf-plain> = <mf-name> : <mf-value>
     * <mf-boolean> = <mf-name>
     * <mf-range> = <mf-name> <mf-comparison> <mf-value>
     *            | <mf-value> <mf-comparison> <mf-name>
     *            | <mf-value> <mf-lt> <mf-name> <mf-lt> <mf-value>
     *            | <mf-value> <mf-gt> <mf-name> <mf-gt> <mf-value>
     *
     * <mf-name> = <ident>
     * <mf-value> = <number> | <dimension> | <ident> | <ratio>
     * <mf-comparison> = <mf-lt> | <mf-gt> | <mf-eq>
     * <mf-lt> = '<' '='?
     * <mf-gt> = '>' '='?
     * <mf-eq> = '='
     */
    let features
    let type
    let negated
    if (query.type.has('media-condition')) {
        type = 'all'
        if (query.type.has('media-not')) {
            ({ value: [, features] } = query)
            negated = true
        } else {
            ({ value: features } = query)
        }
    } else {
        const [{ value: modifier }, mediaType, condition] = query
        negated = modifier === 'not'
        ;({ value: type } = mediaType)
        if (condition.omitted) {
            features = []
        } else {
            ([, features] = condition)
        }
    }
    let s = ''
    if (query.type.has('condition')) {
        s += 'not '
    }
    type = serializeIdentifier({ value: type.toLowerCase() })
    if (features.length === 0) {
        return `${s}${type}`
    }
    if (type !== 'all' || !negated) {
        s += `${type} and `
    }
    return `${s}${features
        .map(({ name, value }) => {
            s += `(${name.toLowerCase()}`
            if (value) {
                s += `: ${serializeCSSComponentValue(value)})`
            }
            return s
        })
        .join(' and ')}`
}

/**
 * @param {object[]} list
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-media-query-list}
 */
function serializeMediaQueryList(list) {
    return serializeCSSComponentValueList(list)
}

/**
 * @param {object} numeric
 * @returns {string}
 */
function serializeInfinityOrNaN({ type, value }) {
    let representation
    if (value === -Infinity) {
        representation = '-infinity'
    } else if (value === Infinity) {
        representation = 'infinity'
    } else {
        representation = 'NaN'
    }
    if (type.has('number')) {
        return representation
    }
    if (type.has('percentage')) {
        return `${representation} * 1%`
    }
    const dimensionType = mathFunctionTypes.find(dimension => type.has(dimension))
    return `${representation} * 1${getCanonicalUnitFromType(dimensionType)}`
}

/**
 * @param {object} node
 * @returns {number}
 */
function getCalculationComponentOrder(node) {
    if (node.type.has('number')) {
        return 0
    } else if (node.type.has('percentage')) {
        return 1
    } else if (node.type.has('dimension')) {
        return 2
    }
    return 3
}

/**
 * @param {object[]} nodes
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#sort-a-calculations-children}
 */
function sortCalculation(nodes) {
    return nodes.sort((a, b) => {
        a = getCalculationComponentOrder(a)
        b = getCalculationComponentOrder(b)
        if (a === 2 && b === 2 && a.unit > b.unit) {
            a++
        }
        return a - b
    })
}

/**
 * @param {object} root
 * @param {boolean} forComputedOrLater
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-calculation-tree}
 */
function serializeCalculationTree(root, forComputedOrLater) {
    const { type, value } = root
    if (isNumeric(root) || (type.has('function') && !type.has('math-function'))) {
        // Deviates from the spec: NaN and Infinity are serialized as in the serialization of a math function
        if (isInfinityOrNaN(root)) {
            return serializeInfinityOrNaN(root)
        }
        return serializeCSSComponentValue(root)
    }
    if (type.has('math-function')) {
        return serializeMathFunction({ ...root, value: root }, forComputedOrLater)
    }
    if (type.has('calc-negate')) {
        return `(-1 * ${serializeCalculationTree(value, forComputedOrLater)})`
    }
    if (type.has('calc-invert')) {
        return `(1 / ${serializeCalculationTree(value, forComputedOrLater)})`
    }
    const [first, ...children] = sortCalculation(value)
    let s = `(${serializeCalculationTree(first, forComputedOrLater)}`
    if (type.has('calc-sum')) {
        children.forEach(child => {
            if (child.type.has('calc-negate')) {
                s += ` - ${serializeCalculationTree(child, forComputedOrLater)}`
            } else if (typeof child.value === 'number' && child.value < 0) {
                s += ` - ${serializeCSSComponentValue({ ...child, value: child.value * -1 })}`
            } else {
                s += ` + ${serializeCalculationTree(child, forComputedOrLater)}`
            }
        })
    } else if (type.has('calc-product')) {
        children.forEach(child => {
            if (child.type.has('calc-invert')) {
                s += ` / ${serializeCalculationTree(child, forComputedOrLater)}`
            } else {
                s += ` * ${serializeCalculationTree(child, forComputedOrLater)}`
            }
        })
    }
    s += ')'
    return s
}

/**
 * @param {object} fn
 * @param {boolean} [forComputedOrLater]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-values-4/#serialize-a-math-function}
 */
function serializeMathFunction({ value: root }, forComputedOrLater = false) {
    const { name, type, range = {}, round } = root
    const isResolved = isNumeric(root)
    // Extract the numeric value from the resolved math function
    if (isResolved) {
        if (forComputedOrLater) {
            let { value } = root
            // The math function replaces an <integer>
            if (round) {
                value = Math.round(value)
            }
            // Clamp to type range if any, otherwise to the min/max JavaScript integer
            let { min = -Infinity, max = Infinity } = range
            if (min === -Infinity) {
                min = Number.MIN_SAFE_INTEGER
            }
            if (max === Infinity) {
                max = Number.MAX_SAFE_INTEGER
            }
            return serializeCSSComponentValue({ type, value: clamp(min, value, max) })
        }
        if (isInfinityOrNaN(root)) {
            return `calc(${serializeInfinityOrNaN(root)})`
        }
    }
    let s
    let children
    if (isResolved || isCalcOperatorNode(root)) {
        // TODO: implement an appropriate data structure for component values
        children = [root]
        s = 'calc('
    } else {
        // TODO: implement an appropriate data structure for component values
        ({ value: children } = root)
        s = `${name.toLowerCase()}(`
    }
    children = children.map(child => {
        child = serializeCalculationTree(child, forComputedOrLater)
        if (child.startsWith('(') && child.endsWith(')')) {
            child = child.slice(1, -1)
        }
        return child
    })
    return `${s}${children.join(', ')})`
}

/**
 * @param {string|object} [range]
 * @returns {string}
 */
function serializeNodeTypeRange(range, prefix = ' ') {
    if (range) {
        if (typeof range === 'string') {
            return range
        }
        const { min, max } = range
        if (min === max) {
            return `${prefix}[${min}]`
        }
        return `${prefix}[${min},${max === Infinity ? '∞' : max}]`
    }
    return ''
}

/**
 * @param {object} [multipler]
 * @returns {string}
 */
function serializeNodeTypeMultiplier(multipler) {
    if (multipler) {
        const { min, max, optional, separator } = multipler
        let repeat = ''
        if (optional) {
            if (separator === ',') {
                repeat += '#'
            }
            repeat += '?'
        } else if (optional === false) {
            repeat += '!'
        } else if (max === 20) {
            if (min === 0) {
                repeat += '*'
            } else if (min === 1) {
                repeat += '+'
                if (separator === ',') {
                    repeat = '#'
                }
            } else {
                repeat += `{${serializeNodeTypeRange({ max, min }, '').slice(1, -1)}}`
            }
        } else {
            if (separator === ',') {
                repeat += '#'
            }
            repeat += `{${serializeNodeTypeRange({ max, min }, '').slice(1, -1)}}`
        }
        return repeat
    }
    return ''
}

/**
 * @param {object} node
 * @param {boolean} [noRepeat]
 * @returns {string}
 */
function serializeNodeType({ type, name, value, range, repeat }, noRepeat = false) {
    range = serializeNodeTypeRange(range)
    if (noRepeat) {
        repeat = ''
    } else {
        repeat = serializeNodeTypeMultiplier(repeat)
    }
    switch (type) {
        case ' ':
        case '&&':
        case '||':
        case '|':
            const [seed, ...types] = value
            const separator = type === ' ' ? type : ` ${type} `
            const combination = types.reduce(
                (all, node) => `${all}${separator}${serializeNodeType(node)}`,
                serializeNodeType(seed))
            if (repeat) {
                return `[${combination}]${repeat}`
            }
            return combination
        case 'delimiter':
            return `${value}${repeat}`
        case 'function':
            return `<${name}(${value})>`
        case 'terminal':
        case 'non-terminal':
            return value === 'keyword'
                ? `${range}${repeat}`
                : `<${value}${range}>${repeat}`
        case 'property':
        case 'structure':
            return `<${value}>${repeat}`
        default:
            throw RangeError('Unexpected node type')
    }
}

/**
 * @param {object} number
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-integer-value}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-number-value}
 *
 * It serializes `number` to the shortest form possible, by rounding it to not
 * produce more than 6 decimals and by removing trailing 0 in decimals.
 *
 * User agents have different (unspecified) behaviors:
 * - Chrome serializes `100000.5` to `100000` and `1000000` to `1e6`
 * - Firefox represents `100000.5` to `100001` and represents `1000000` as is
 */
function serializeNumber({ value }) {
    return `${+value.toFixed(6)}`
}

/**
 * @param {object[]} list
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-list-of-css-page-selectors}
 */
function serializePageSelectorsList(list) {
    // TODO
    return serializeCSSComponentValueList(list)
}

/**
 * @param {object} percentage
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-percentage-value}
 */
function serializePercentage(percentage) {
    return `${serializeNumber(percentage)}%`
}

/**
 * @param {object|object[]} position
 * @returns {string}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#background-position}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#basic-shape-serialization}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/2274}
 */
function serializePosition(position) {
    if (Array.isArray(position)) {
        return position.map(side => {
            if (side.omitted) {
                return 'center'
            }
            // TODO: fix CSS type assigned before backtracking
            const { type } = side
            if (type.has('bg-position')) {
                type.delete('bg-position')
            }
            return serializeCSSComponentValue(side)
        }).join(' ')
    }
    const { type } = position
    let side
    if (type.has('keyword')) {
        side = serializeIdentifier(position)
        if (side === 'top' || side === 'bottom') {
            return `center ${side}`
        }
    } else {
        side = serializeDimension(position)
    }
    return `${side} center`
}

/**
 * @param {object[]} ratio
 * @param {string} numerator
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-ratio-value}
 */
function serializeRatio([numerator,, denumerator]) {
    return `${serializeNumber(numerator)} / ${serializeNumber(denumerator)}`
}

/**
 * @param {object} resolution
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-resolution-value}
 */
function serializeResolution(resolution) {
    const { unit = 'dppx' } = resolution
    return serializeNumber(resolution) + unit
}

/**
 * @param {object[]} sides
 * @returns {string}
 */
function serializeSides(sides) {
    return serializeCSSComponentValueList(simplifySides(sides))
}

/**
 * @param {object} block
 * @returns {string}
 */
function serializeSimpleBlock({ associatedToken, value }) {
    return `${associatedToken}${serializeCSSComponentValue(value)}${associatedBlockTokens[associatedToken]}`
}

/**
 * @param {object} string
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-string-value}
 */
function serializeString({ value }) {
    return [...value].reduce(
        (value, char) => {
            const codePoint = char.codePointAt(0)
            if (codePoint === 0) {
                return value += '�'
            }
            if ((0x1 <= codePoint && codePoint <= 0x1F) || codePoint === 0x7F) {
                return `${value}\\u${codePoint}`
            }
            if (codePoint === 0x22 || codePoint === 0x5C) {
                return `${value}\\${char}`
            }
            return value += char
        },
        '"').concat('"')
}

/**
 * @param {object} time
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-time-value}
 */
function serializeTime(time) {
    const { unit = 'ms' } = time
    return serializeNumber(time) + unit
}

/**
 * @param {object} resource
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#ref-for-url-value}
 */
function serializeURL({ value }) {
    return `url(${serializeString({ value })})`
}

/**
 * @param {object|object[]} component
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-selector}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-simple-selector}
 *
 * It serializes `<selector-list>` without whitespaces between any of the
 * components of a `<compound-selector>` except between the arguments of a
 * functional pseudo class.
 *
 * It serializes `<pseudo-class-selector>` representing CSS2 pseudo-elements
 * prefixed with `::`.
 */
function serializeWithoutWhitespace(component) {
    if (Array.isArray(component)) {
        const { type } = component
        if (type.has('compound-selector')) {
            const [type, subclasses, pseudos] = component
            return [
                serializeCSSComponentValue(type),
                // Join `<subclass-selector>*`
                serializeCSSComponentValueList(subclasses, ''),
                // Flatten then join `[<pseudo-element-selector> <pseudo-class-selector>*]*`
                serializeCSSComponentValueList(pseudos.flat(), ''),
            ].join('')
        }
        return serializeCSSComponentValueList(component, '')
    }
    const { name, type, value } = component
    if (type.has('combinator') && value === ' ') {
        return ''
    }
    if (type.has('attribute-selector')) {
        return `[${serializeCSSComponentValueList(value, '')}]`
    }
    if (type.has('pseudo-element-selector')) {
        return `::${value.toLowerCase()}`
    }
    if (type.has('pseudo-class-selector')) {
        if (name) {
            return `:${serializeFunction(component)}`
        }
        const lowercase = value.toLowerCase()
        if (pseudoElements[lowercase]) {
            return `::${lowercase}`
        }
        return `:${lowercase}`
    }
    return serializeCSSComponentValue(value)
}

/**
 * @param {object|object[]} component
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-component-value}
 */
function serializeCSSComponentValue(component) {
    // Delimiter or custom variable
    if (typeof component === 'string') {
        return component
    }
    const { omitted, representation, type } = component
    // TODO: figure out the appropriate component property values of an omitted value
    if (omitted) {
        return ''
    }
    const types = [...type]
    while (types[0]) {
        // Read from last to first type added
        switch (types.pop()) {
            case 'alpha-value':
                return serializeAlpha(component)
            case 'an+b':
                return serializeAnB(component)
            case 'angle':
                return serializeAngle(component)
            case 'attr-matcher':
            case 'attribute-selector':
            case 'class-selector':
            case 'combinator':
            case 'compound-selector':
            case 'ns-prefix':
            case 'pseudo-class-selector':
            case 'pseudo-element-selector':
            case 'type-selector':
            case 'wq-name':
                return serializeWithoutWhitespace(component)
            case 'bg-position':
            case 'position':
                return serializePosition(component)
            case 'border-radius':
                return serializeBorderRadius(component)
            case 'color':
                return serializeColor(component)
            case 'counter':
                return serializeCounter(component)
            case 'custom-ident':
            case 'custom-property-name':
            case 'ident':
                return serializeIdentifier(component)
            case 'declaration':
                return serializeDeclaration(component)
            case 'delimiter':
                return component.value
            case 'dimension':
                return serializeDimension(component)
            case 'frequency':
                return serializeFrequency(component)
            case 'function':
                return serializeFunction(component)
            case 'inset()':
                return serializeInset(component.value)
            case 'integer':
            case 'number':
                return serializeNumber(component)
            case 'hash':
                return `#${component.value}`
            case 'keyword':
                return serializeKeyword(component)
            case 'length':
                return serializeLength(component)
            case 'math-function': // TODO: the `type` of a math function should have `function`
                return serializeMathFunction(component)
            case 'media-query':
                return serializeMediaQuery(component)
            case 'percentage':
                return serializePercentage(component)
            case 'ratio':
                return serializeRatio(component)
            case 'resolution':
                return serializeResolution(component)
            case 'url-token':
                return serializeURL(component)
            case 'simple-block':
                return serializeSimpleBlock(component)
            case 'string':
                return serializeString(component)
            case 'time':
                return serializeTime(component)
            default:
                continue
        }
    }
    // `<an+b>` and `<urange>`
    if (representation) {
        return representation
    }
    // List of component values
    if (Array.isArray(component)) {
        return serializeCSSComponentValueList(component)
    }
    throw Error('Unexpect component to serialize')
}

/**
 * @param {object[]} list
 * @param {string} [separator]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-value}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-comma-separated-list}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-whitespace-separated-list}
 *
 * It serializes a list of component values by removing its omitted values and
 * joining them with a whitespace unless the second item starts with a comma.
 *
 * This is an abstraction of steps 3-5 of "serialize a CSS value", "serialize a
 * comma-separated list", and "serialize a whitespace separated list", which is
 * used to serialize nested list of component values.
 */
function serializeCSSComponentValueList(list, separator = list.separator ?? ' ') {
    if (separator !== ' ' && separator !== '') {
        separator += ' '
    }
    return list.reduce(
        (value, component) => {
            component = serializeCSSComponentValue(component)
            if (component === '') {
                return value
            }
            if (component.startsWith(',')) {
                return `${value}${component}`
            }
            if (value) {
                return `${value}${separator}${component}`
            }
            return component
        },
        '')
}

/**
 * @param {object[][]} longhandValues
 * @returns {object[]}
 *
 * It transforms the list of longhand values into a list of background layers,
 * removing initial values from each layer (except for `background-position`).
 */
function simplifyBackground(longhandValues) {
    const longhands = shorthands.get('background')
    return longhandValues.reduce((layers, longhandValue, longhandIndex) => {
        const longhand = longhands[longhandIndex]
        const { initial } = properties[longhand]
        if (longhand === 'background-color') {
            const { value } = longhandValue
            if (value !== initial) {
                layers.at(-1).push(serializeCSSComponentValue(longhandValue))
            }
            return layers
        }
        longhandValue.forEach((value, layerIndex) => {
            value = serializeCSSComponentValue(value)
            // Always preserve position (spec compliance)
            if (value === initial && longhand !== 'background-position') {
                return
            }
            if (longhand === 'background-size') {
                value = `/ ${value}`
            }
            const layer = layers[layerIndex]
            if (layer) {
                layer.push(value)
            } else {
                layers.push(createList([value]))
            }
        })
        return layers
    }, createList([], ','))
}

/**
 * @param {object[]} border
 * @returns {object[]}
 *
 * It removes default longhand values until there is only a single value left.
 */
function removeInitialBorderValues(border) {
    if (border.length === 1) {
        return border
    }
    const [width, style, color] = border
    if (color.value === 'currentcolor') {
        border.pop()
    }
    if (style.value === 'none') {
        border.splice(border.indexOf(style), 1)
    }
    if (width.value === 'medium' && 1 < border.length) {
        border.splice(border.indexOf(width), 1)
    }
    return border
}

/**
 * @param {object[]} border
 * @returns {object[]|string[]}
 *
 * It serializes to empty string if at least one of its side has a different
 * width, style, or color than the other sides, otherwise it serializes to the
 * same width, style, and color for all sides.
 */
function simplifyBorder(border) {
    const simplified = []
    for (const [i, component] of border.entries()) {
        // 0-3 for width, 4-7 for style, 8-11 for color
        const type = Math.floor(i / 4 % 3)
        const top = simplified[type]
        if (top) {
            if (top.value === component.value && [...top.type].every(type => component.type.has(type))) {
                continue
            }
            return ['']
        }
        simplified[type] = component
    }
    return simplified
}

/**
 * @param {object[]} sides
 * @returns {object[]}
 */
function simplifySides(sides) {
    let { length } = sides
    while (length-- > 1 && areEqualNumeric(sides[length], sides[length - 2] ?? sides[0])) {
        sides = sides.slice(0, -1)
    }
    return sides
}

/**
 * @param {object} declaration
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-value}
 *
 * It represents the declaration as a list of component values, which can be
 * omitted or replaced to serialize to a shorter representation.
 *
 * It is the implementation of step 2 of "serialize a CSS value".
 */
function representDeclarationValue({ input, name, value }) {
    const isShorthand = shorthands.has(name)
    if (isShorthand) {
        // var() or attr()-containing value
        if (value.some(({ pending }) => pending)) {
            return [value[0].pending]
        }
        const cssWideKeyword = value.find(({ type }) => type.has('css-wide-keyword'))
        // Some longhand values are CSS wide keywords
        if (cssWideKeyword) {
            // All longhand values are the same CSS wide keyword
            if (value.every(({ value }) => value === cssWideKeyword.value)) {
                return [cssWideKeyword.value]
            }
            return ['']
        }
    }
    switch (name) {
        case 'background':
            return simplifyBackground(value)
        case 'border':
            return removeInitialBorderValues(simplifyBorder(value))
        case 'border-bottom':
        case 'border-left':
        case 'border-right':
        case 'border-top':
            return removeInitialBorderValues(value)
        case 'border-top-left-radius':
        case 'border-top-right-radius':
        case 'border-bottom-left-radius':
        case 'border-bottom-right-radius':
        case 'border-color':
        case 'border-style':
        case 'border-width':
        case 'margin':
        case 'padding':
            return simplifySides(value)
        case 'border-radius':
            // `border-radius` is simplified and serialized as the `<border-radius>` CSS type
            return [value.reduce(
                (radii, [h, v]) => {
                    radii[0].push(h)
                    radii[1].push(v)
                    return radii
                },
                createList([[], []], '/', ['border-radius']))]
    }
    if (isShorthand) {
        return value
    }
    if (input?.includes('var(')) {
        return [input]
    }
    return [value]
}

/**
 * @param {object|object[]} list
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-value}
 */
function serializeCSSValue(list) {
    if (Array.isArray(list)) {
        const longhandProperties = list.map(({ name }) => name)
        const shorthand = [...shorthands].find(([, longhands]) =>
            longhands.length === longhandProperties.length
            && longhandProperties.every(property => longhands.includes(property)))
        if (shorthand) {
            const [name] = shorthand
            const inputList = []
            const valueList = []
            list.forEach(({ input, value }) => {
                inputList.push(input)
                valueList.push(value)
            })
            return serializeCSSValue({ input: inputList, name, value: valueList })
        }
        return ''
    }
    const components = representDeclarationValue(list)
    return serializeCSSComponentValueList(components)
}

/**
 * @param {string} property
 * @param {string} value
 * @param {boolean} priority
 * @param {boolean} [appendSemicolon]
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-declaration}
 */
function serializeCSSDeclaration(property, value, priority, appendSemicolon = true) {
    let s = `${property}: ${value}`
    if (priority) {
        s += ' !important'
    }
    if (appendSemicolon) {
        s += ';'
    }
    return s
}

/**
 * @param {Map} declarations
 * @returns {string}
 * @see {@link https://drafts.csswg.org/cssom/#serialize-a-css-declaration-block}
 */
function serializeCSSDeclarationBlock(declarations) {

    const list = []
    const alreadySerialized = []

    declarationLoop: for (const declaration of declarations.values()) {

        const { important, name } = declaration

        if (alreadySerialized.includes(name)) {
            continue declarationLoop
        }

        const shorthandsForProperty = []
        shorthands.forEach((longhands, shorthand) => {
            if (longhands.includes(name)) {
                shorthandsForProperty.push([shorthand, longhands])
            }
        })

        shorthandLoop: for (const [shorthand, longhands] of shorthandsForProperty) {

            // All longhand declarations left that share this shorthand
            const longhandDeclarations = []
            declarations.forEach(declaration => {
                const { name } = declaration
                if (alreadySerialized.includes(name)) {
                    return
                }
                if (shorthandsForProperty.some(([, longhands]) => longhands.includes(name))) {
                    longhandDeclarations.push(declaration)
                }
            })

            // All longhands that map to shorthand should be present in longhand declarations
            if (!longhands.every(longhand => longhandDeclarations.some(({ name }) => name === longhand))) {
                continue shorthandLoop
            }

            const priorities = []
            const currentLonghandDeclarations = []
            longhandDeclarations.forEach(declaration => {
                const { important, name } = declaration
                if (longhands.includes(name)) {
                    currentLonghandDeclarations.push(declaration)
                    priorities.push(important)
                }
            })
            const important = priorities.every(Boolean)

            // None or all longhand declarations for this shorthand should have the important flag
            if (priorities.some(Boolean) && !important) {
                continue shorthandLoop
            }

            const serializedValue = serializeCSSValue(currentLonghandDeclarations)

            if (serializedValue === '') {
                continue shorthandLoop
            }

            const serializedDeclaration = serializeCSSDeclaration(shorthand, serializedValue, important)
            list.push(serializedDeclaration)
            alreadySerialized.push(...longhands)

            continue declarationLoop
        }

        const serializedValue = serializeCSSValue(declaration)
        const serializedDeclaration = serializeCSSDeclaration(name, serializedValue, important)
        list.push(serializedDeclaration)
        alreadySerialized.push(name)
    }
    return list.join(' ')
}

module.exports = {
    serializeCSSComponentValue,
    serializeCSSComponentValueList,
    serializeCSSDeclarationBlock,
    serializeCSSValue,
    serializeIdentifier,
    serializeMediaQuery,
    serializeMediaQueryList,
    serializeNodeType,
    serializePageSelectorsList,
    serializeURL,
}
