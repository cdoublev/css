
const createList = require('../values/value.js')
const { isNumericRepresentationOf } = require('../values/validation.js')

const center = { type: new Set(['ident', 'keyword']), value: 'center' }
const reservedMediaQueryTypes = ['and', 'not', 'only', 'or']

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds/#border-radius}
 *
 * It replaces omitted radius values by the corresponding default value.
 */
function postParseBorderRadius(list) {
    const { type } = list
    const [horizontal, vertical] = list
    const [h1, h2 = h1, h3 = h1, h4 = h2] = horizontal
    if (vertical.omitted) {
        return createList([createList([h1, h2, h3, h4]), createList([h1, h2, h3, h4])], '/', type)
    }
    const [, [v1 = h1, v2 = v1, v3 = v1, v4 = v2]] = vertical
    return createList([createList([h1, h2, h3, h4]), createList([v1, v2, v3, v4])], '/', type)
}

/**
 * @param {object} leaf
 * @returns {object}
 */
function resolveNestedCalcOperator(leaf) {
    if (leaf.type.has('simple-block') || leaf.type.has('math-function')) {
        return leaf.value
    }
    if (Array.isArray(leaf.value)) {
        leaf.value = leaf.value.map(resolveNestedCalcOperator)
    }
    return leaf
}

/**
 * @param {object[]} list
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#parse-a-calculation}
 *
 * It collects sum and negate nodes (step 4), unwraps the calculation tree from
 * nested calculation operator nodes (step 5), and simplifies the calculation
 * tree (step 6).
 */
function postParseCalcSum([left, components]) {
    let values = components.reduce((sum, [operator, right]) => {
        if (operator.value === '-') {
            right = { type: new Set(['calc-negate']), value: [right] }
        }
        sum.push(right)
        return sum
    }, [left])
    if (values.length === 1 && (left.type.has('calc-product') || left.type.has('simple-block'))) {
        // TODO: implement an appropriate data structure for component values
        if (left.type.has('simple-block')) {
            values = left.value
        } else {
            values = left
        }
    } else {
        values = { type: new Set(['calc-sum']), value: values }
    }
    values.value = values.value.map(resolveNestedCalcOperator)
    return values
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#parse-a-calculation}
 *
 * It collects product and invert nodes (step 3).
 */
function postParseCalcProduct([left, components]) {
    if (components.length === 0) {
        return left
    }
    return components.reduce((product, [operator, right]) => {
        if (operator.value === '/') {
            right = { type: new Set(['calc-invert']), value: [right] }
        }
        product.value.push(right)
        return product
    }, { type: new Set(['calc-product']), value: [left] })
}

/**
 * @param {object} list
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-circle}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-ellipse}
 *
 * It replaces an omitted circle/ellipse position value by `center` (default).
 */
function postParseCircle(list) {
    const [, position] = list
    if (position.omitted) {
        list[1] = createList([{ type: new Set(['delimiter']), value: 'at' }, createList([center, center])])
    }
    return list
}

/**
 * @param {object[]} list
 * @returns {object[]}
 *
 * It normalizes implicit to explicit color stops, ie. from a single color stop
 * defined with two positions into two color stops with a single position.
 */
function postParseColorStopList(list) {
    const { type } = list
    const [stop,, stops] = list
    const [color, position] = stop
    // Invalid: list should contain at least two (implicit or explicit) color stops
    if (stops.omitted && (position.omitted || position.length !== 2)) {
        return null
    }
    const stopList = createList([], ',', type)
    if (position.length > 1) {
        stopList.push(createList([color, position[0]]))
        stopList.push(createList([color, position[1]]))
    } else {
        stopList.push(stop)
    }
    if (stops.omitted) {
        return stopList
    }
    return stops.reduce((list, [stopOrHint,, stop]) => {
        // <color-stop>
        if (stopOrHint.type.has('angular-color-stop') || stopOrHint.type.has('linear-color-stop')) {
            const [color, position] = stopOrHint
            // <color> <length-percentage>{1,2}
            if (position.length > 1) {
                list.push(createList([color, position[0]]))
                list.push(createList([color, position[1]]))
            } else {
                list.push(stopOrHint)
            }
        } else {
            // <color-hint>, <color-stop>
            list.push(stopOrHint)
            list.push(stop)
        }
        return list
    }, stopList)
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#conic-gradient-syntax}
 *
 * It removes a gradient rotation value representing its default value.
 *
 * It replaces an omitted gradient position value by `center` (default).
 */
function postParseConicGradient(list) {
    const [rotation, origin, comma] = list
    if (!rotation.omitted && isNumericRepresentationOf(rotation[1], 0, 'deg')) {
        rotation.omitted = true
    }
    if (origin.omitted) {
        list[1] = createList([
            { type: new Set(['delimiter']), value: 'at' },
            createList([center, center]),
        ])
        comma.omitted = false
    }
    return list
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-3/#linear-gradient-syntax}
 *
 * It removes a gradient direction value representing its default value.
 */
function postParseLinearGradient(list) {
    const [direction] = list
    // TODO: cleanup this shit
    if (!direction.omitted && (
        (!direction.type.has('keyword') && isNumericRepresentationOf(direction, 180, 'deg'))
        || (Array.isArray(direction) && direction[1][0].omitted && direction[1][1].value === 'bottom')
    )) {
        return list.slice(2)
    }
    return list
}

/**
 * @param {object[]} list
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#mq-syntax}
 *
 * It returns null (parse failure) when the media type is `only`, `not`, `and`,
 * or `or`.
 *
 * TODO: return failure in `parseDelimiter()` when there is no whitespace around
 * the comparison operator.
 */
function postParseMediaQuery(list) {
    if (!list.type.has('media-condition')) {
        const [type] = list
        if (reservedMediaQueryTypes(type)) {
            return null
        }
    }
    return list
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-path}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-polygon}
 *
 * User agents simplify arguments by removing the optional fill-rule when it is
 * `nonzero` (default).
 */
function postParsePath(list) {
    const [optionalFillRule] = list
    if (optionalFillRule.type.has('fill-rule') && optionalFillRule.value === 'nonzero') {
        return list.slice(2)
    }
    return list
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-3/#radial-gradient-syntax}
 *
 * It returns null (parse failure):
 * - if the gradient shape is a circle whose size is authored with two values
 * or a percentage, or a negative value
 * - if the gradient shape is an ellipse whose size is authored with a single
 * value, or negative value(s)
 *
 * It replaces an omitted gradient position value by `center` (default).
 *
 * It removes an explicit gradient shape representing an ellipse or whose size
 * has been authored with numeric value(s).
 */
function postParseRadialGradient(list) {
    const [aspect, origin, comma] = list
    if (!aspect.omitted) {
        const [shape, size] = aspect
        if (Array.isArray(size)) {
            // TODO: return null for a size value < 0
            // Invalid: circle size should be a single `<length>`
            if (
                (shape.value === 'circle' && (size.length > 1 || size[0].type.has('percentage')))
                || (size.length === 1 && size[0].type.has('percentage'))
            ) {
                return null
            }
            // Invalid: ellipse size should be two <length-percentage>
            if (shape.value === 'ellipse' && size.length < 2) {
                return null
            }
        }
        // Remove default size
        if (size.value === 'farthest-corner') {
            size.omitted = true
        }
        // Remove shape when it is `ellipse` or when size is neither omitted or a keyword
        if (shape.value === 'ellipse' || (!size.omitted && !size.type.has('keyword'))) {
            shape.omitted = true
        }
    }
    if (origin.omitted) {
        list[1] = createList([
            { type: new Set(['delimiter']), value: 'at' },
            createList([center, center]),
        ])
        comma.omitted = false
    }
    return list
}

/**
 * @param {object[]} list
 * @returns {object[]}
 *
 * It replaces omitted side values by the corresponding default value.
 */
function postParseSideLengths(list) {
    const longhandLength = 4
    let { length: currentLength } = list
    while (currentLength < longhandLength) {
        list.push(list[Math.max(0, currentLength++ - 2)])
    }
    return list
}

module.exports = {
    'angular-color-stop-list': postParseColorStopList,
    'border-radius': postParseBorderRadius,
    'calc-product': postParseCalcProduct,
    'calc-sum': postParseCalcSum,
    'circle()': postParseCircle,
    'color-stop-list': postParseColorStopList,
    'conic-gradient()': postParseConicGradient,
    'ellipse()': postParseCircle,
    'linear-gradient()': postParseLinearGradient,
    'margin': postParseSideLengths,
    'media-query': postParseMediaQuery,
    'padding': postParseSideLengths,
    'path()': postParsePath,
    'polygon()': postParsePath,
    'radial-gradient()': postParseRadialGradient,
    'repeating-conic-gradient()': postParseConicGradient,
    'repeating-linear-gradient()': postParseLinearGradient,
    'repeating-radial-gradient()': postParseRadialGradient,
}
