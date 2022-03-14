
const { classes: pseudoClasses, elements: pseudoElements, functions: pseudoFunctions } = require('../values/pseudos.js')
const createList = require('../values/value.js')
const { isNumericRepresentationOf } = require('../values/validation.js')
const parseDefinition = require('./definition.js')

const MAXIMUM_CODE_POINT = 0x10FFFF
const center = { type: new Set(['ident', 'keyword']), value: 'center' }
const reservedMediaQueryTypes = ['and', 'not', 'only', 'or']

/**
 * @param {object|object[]} notation
 * @param {Parser} parser
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#the-anb-type}
 *
 * It invalidates the notation when a whitespace is missing between `+` and `n`.
 *
 * It represents the notation as a plain object with `a` and `b` properties.
 */
function postParseAnB(notation, { list: { source } }) {
    const { location, type, value } = notation
    if (value === 'even') {
        return { location, type, value: { a: 2, b: 0 } }
    }
    if (value === 'odd') {
        return { location, type, value: { a: 2, b: 1 } }
    }
    if (!Array.isArray(notation)) {
        notation = [notation]
    }
    let text = ''
    for (const { location, omitted, value, representation = value } of notation.flat()) {
        if (!omitted && value === '+' && text === '' && source[location + 2] === ' ') {
            return null
        }
        text += representation
    }
    let a
    let b
    if (text.includes('n')) {
        ([a, b] = text.split('n'))
        if (a === '' || a === '+') {
            a = 1
        } else if (a === '-') {
            a = -1
        } else {
            a = Number(a)
        }
    } else {
        a = 0
        b = text
    }
    return { location, type, value: { a, b: b ? Number(b) : 0 } }
}

/**
 * @param {object[]} matcher
 * @param {Parser} parser
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-attr-matcher}
 *
 * It invalidates an attribute matcher when there is a whitespace between its
 * specific matcher delimiter and `=`.
 */
function postParseAttributeMatcher(matcher, { list }) {
    const [left] = matcher
    if (!left.omitted && list.prev() === ' ') {
        return null
    }
    return matcher
}

/**
 * @param {object[]} radii
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#border-radius}
 *
 * It represents the radii with omitted radii replaced by the corresponding
 * default value.
 */
function postParseBorderRadius(radii) {
    const { type } = radii
    const [horizontal, vertical] = radii
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
 * @param {object[]} sum
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
 * @param {object[]} product
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
 * @param {object} args
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-circle}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-ellipse}
 *
 * It replaces an omitted circle/ellipse position value by `center` (default).
 */
function postParseCircle(args) {
    const [, position] = args
    if (position.omitted) {
        args[1] = createList([{ type: new Set(['delimiter']), value: 'at' }, createList([center, center])])
    }
    return args
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-class-selector}
 *
 * It invalidates the selector when there is a whitespace between `.` and the
 * class name.
 */
function postParseClassSelector(selector, { list }) {
    return list.prev() === ' ' ? null : selector
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#color-stop-list}
 *
 * It represents the list by normalizing implicit color stops defined with two
 * positions, to two explicit color stops defined with a single position.
 */
function postParseColorStopList(list) {
    const { type } = list
    const [stop,, stops] = list
    const [color, position] = stop
    // Invalid: list must contain at least two (implicit or explicit) color stops
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
 * @param {string|string[]} combinator
 * @param {Parser} parser
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-combinator}
 *
 * It invalidates the combinator when it is `| |`.
 */
function postParseCombinator(combinator, { list }) {
    if (Array.isArray(combinator) && list.prev() === ' ') {
        return null
    }
    return combinator
}

/**
 * @param {object[]} selector
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-complex-selector}
 * @see {@link https://drafts.csswg.org/selectors-4/#pseudo-element-structure}
 *
 * It invalidates the selector when it includes a compound selector ending with
 * a pseudo-element without a defined internal structure, combined with another
 * selector.
 */
function postParseComplexSelector(selector) {
    const [parent, chain] = selector
    // Single <compound-selector>
    if (chain.length === 0) {
        return selector
    }
    // Filter out <nesting-selector>
    const selectors = chain.reduce((selectors, [, selector]) => {
        if (selector.type.has('compound-selector')) {
            selectors.push(selector)
        }
        return selectors
    }, parent.type.has('compound-selector') ? [parent] : [])
    // Read last item in the pseudo selector chain of <compound-selector>
    let structured = true
    for (const [,, pseudoChain] of selectors) {
        if (!structured) {
            return null
        }
        const lastPseudo = pseudoChain.flat().filter(({ type }) => type.has('pseudo-element-selector')).at(-1)
        if (lastPseudo) {
            ({ structured = false } = lastPseudo)
        }
    }
    return selector
}

/**
 * @param {object[]} selector
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-compound-selector}
 * @see {@link https://drafts.csswg.org/selectors-4/#sub-pseudo-elements}
 *
 * It invalidates the selector when it includes a pseudo-element that:
 * - precedes a pseudo-class that can not apply to this pseudo-element
 * - is not an originating element but precedes another pseudo-element
 */
function postParseCompoundSelector(selector) {
    const [,, pseudoChain] = selector
    let originating
    for (const { value, name } of pseudoChain.flat(2)) {
        if (originating && !originating.includes(name ? `${name}()` : value)) {
            return null
        }
        const pseudoElement = pseudoElements[value]
        if (pseudoElement) {
            ({ originating = [] } = pseudoElement)
        } else {
            originating = []
        }
    }
    return selector
}

/**
 * @param {object[]} args
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#conic-gradient-syntax}
 *
 * It represents the arguments by removing a rotation with a default value, and
 * by replacing an omitted position by `center` (default).
 */
function postParseConicGradient(args) {
    const [rotation, origin, comma] = args
    if (!rotation.omitted && isNumericRepresentationOf(rotation[1], 0, 'deg')) {
        rotation.omitted = true
    }
    if (origin.omitted) {
        args[1] = createList([
            { type: new Set(['delimiter']), value: 'at' },
            createList([center, center]),
        ])
        comma.omitted = false
    }
    return args
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-relative-selector-list}
 *
 * It filters out invalid selectors, and pseudo-elements if the selector is not
 * an argument of `has()`.
 */
function postParseForgivingRelativeSelectorList(selector, { parentList }) {
    const { name } = parentList.next()
    if (name === 'has') {
        return selector.filter(Boolean)
    }
    return postParseForgivingSelectorList(selector)
}

/**
 * @param {object[]} selector
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-selector-list}
 *
 * It filters out invalid selectors and pseudo-elements.
 */
function postParseForgivingSelectorList(selector) {
    return selector.filter(selector => {
        if (selector) {
            return !selector.flat(Infinity).some(({ type }) => type.has('pseudo-element-selector'))
        }
        return false
    })
}

/**
 * @param {object} selector
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-id-selector}
 *
 * It invalidates the selector when it is an hexadecimal number.
 *
 * Ideally, it would be parsed as a terminal but <id-selector> is expanded to
 * <hash> (token) in Selectors.
 */
function postParseIDSelector(selector) {
    return selector.type.has('id') ? selector : null
}

/**
 * @param {object[]} args
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#linear-gradient-syntax}
 *
 * It represents the arguments by removing a direction with a default value.
 */
function postParseLinearGradient(args) {
    const [direction] = args
    // TODO: cleanup this shit
    if (!direction.omitted && (
        (!direction.type.has('keyword') && isNumericRepresentationOf(direction, 180, 'deg'))
        || (Array.isArray(direction) && direction[1][0].omitted && direction[1][1].value === 'bottom')
    )) {
        return args.slice(2)
    }
    return args
}

/**
 * @param {object[]} list
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#mq-syntax}
 *
 * It invalidates a media query when its type is `only`, `not`, `and`, or `or`.
 *
 * TODO: return failure in `parseDelimiter()` when there is no whitespace around
 * the comparison operator.
 */
function postParseMediaQuery(list) {
    if (!list.type.has('media-condition')) {
        const [type] = list
        if (reservedMediaQueryTypes.includes(type)) {
            return null
        }
    }
    return list
}

/**
 * @param {object[]} prefix
 * @param {Parser} parser
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-ns-prefix}
 *
 * It invalidates the prefix when it has not been declared or when there is a
 * whitespace between the prefix and `|`.
 */
function postParseNSPrefix(prefix, { list, context }) {
    const [{ omitted, value }] = prefix
    if (!omitted && (list.prev() === ' ' || !context.namespaces.includes(value))) {
        return null
    }
    return prefix
}

/**
 * @param {object} selector
 * @param {object} context
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#nesting-selector}
 *
 * It invalidates the selector when it is not used in a nested style rule.
 */
function postParseNestingSelector(selector, { context: { parent } }) {
    return parent?.value === '<style-block>' ? selector : null
}

/**
 * @param {object[]} args
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-path}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-polygon}
 *
 * It represents the arguments by removing the fill rule with a default value.
 */
function postParsePath(args) {
    const [optionalFillRule] = args
    if (optionalFillRule.type.has('fill-rule') && optionalFillRule.value === 'nonzero') {
        return args.slice(2)
    }
    return args
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-class-selector}
 *
 * It invalidates:
 * - a pseudo-class or pseudo-element preceded by a whitespace
 * - a pseudo-class or pseudo-element whose name is invalid
 * - a pseudo-element not defined in CSS2 and preceded by a single colon
 * - a pseudo-element used as an argument in `current()` or `not()`
 *
 * It represents the selector without `:`.
 */
function postParsePseudoClassSelector(selector, parser) {
    const { parentList, list } = parser
    if (list.prev() === ' ') {
        return null
    }
    const [, identOrFunction] = selector
    const { location, name, type, value } = identOrFunction
    // Functional pseudo-class
    if (name) {
        const type = `${name.toLowerCase()}()`
        if (pseudoFunctions[type]) {
            parser.list.reconsume()
            const parsed = parser.parseFunction(parseDefinition(`<${type}>`))
            if (parsed) {
                parsed.type.add('pseudo-class-selector')
            }
            return parsed
        }
        return null
    }
    // Pseudo-class or pseudo-element
    const lowercase = value.toLowerCase()
    const pseudoElement = pseudoElements[lowercase]
    if (pseudoElement) {
        // Pseudo-element with a single colon but not a CSS2 pseudo-element
        if (!pseudoClasses.includes(lowercase) && list.prev(2, 1) !== ':') {
            return null
        }
        // Pseudo-element not allowed in functional pseudo-class
        const parentFunction = parentList?.next()
        if (parentFunction) {
            const { name } = parentFunction
            if (name === 'current' || name === 'is' || name === 'not' || name === 'where') {
                return null
            }
        }
        type.add('pseudo-element-selector')
        const { structured = false } = pseudoElement
        return { location, structured, type, value: lowercase }
    }
    if (pseudoClasses.includes(lowercase) && list.prev(2, 1) !== ':') {
        type.add('pseudo-class-selector')
        return { location, type, value: lowercase }
    }
    return null
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-element-selector}
 *
 * It invalidates the selector when there is a whitespace between the two `:`.
 */
function postParsePseudoElementSelector([, pseudo], { list }) {
    return list.prev(2, 1) === ' ' ? null : pseudo
}

/**
 * @param {object[]} args
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#radial-gradient-syntax}
 *
 * It invalidates the arguments when the shape is:
 * - a circle with a size authored with two values, a percentage, or a negative
 * value
 * - an ellipse with a size authored with a single value or negative value(s)
 *
 * It represents the arguments by replacing an omitted position by `center`
 * (default) and by removing the shape when it is an ellipse with a size
 * authored with numeric values.
 */
function postParseRadialGradient(args) {
    const [aspect, origin, comma] = args
    if (!aspect.omitted) {
        const [shape, size] = aspect
        if (Array.isArray(size)) {
            // Invalid: circle size must be a single <length>
            if (
                (shape.value === 'circle' && (size.length > 1 || size[0].type.has('percentage')))
                || (size.length === 1 && size[0].type.has('percentage'))
            ) {
                return null
            }
            // Invalid: ellipse size must be two <length-percentage>
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
        args[1] = createList([
            { type: new Set(['delimiter']), value: 'at' },
            createList([center, center]),
        ])
        comma.omitted = false
    }
    return args
}

/**
 * @param {object[]} sides
 * @returns {object[]}
 *
 * It represents the sides by replacing omitted sides by the corresponding
 * default value.
 */
function postParseSideLengths(sides) {
    const longhandLength = 4
    let { length: currentLength } = sides
    while (currentLength < longhandLength) {
        sides.push(sides[Math.max(0, currentLength++ - 2)])
    }
    return sides
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-type-selector}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-wq-name}
 *
 * It invalidates the selector when it is qualified with a namespace prefix and
 * there is a whitespace between `|` and the type or attribute.
 */
function postParseTypeSelector(selector, { list }) {
    const [prefix] = selector
    if (!prefix.omitted && list.prev() === ' ') {
        return null
    }
    return selector
}

/**
 * @param {object[]} range
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-urange}
 *
 * It invalidates the range when:
 * - it does not start with `U+` or `u+`
 * - its start or end values has 0 or more than 6 hexadecimal digits
 * - its start and end values are not separated with `-`
 * - its start has a value greater than its end value
 * - its end has a value greather than `10FFFF` (max. allowed code point)
 * - it includes an invalid wildcard `?`
 *
 * It represents the range as a plain object with `start` and `end` properties.
 */
function postParseUnicodeRange(range) {
    const { location, type } = range
    const representation = range.flat().flatMap(component => {
        if (typeof component === 'string') {
            return [...component]
        }
        const { representation, unit = '', value } = component
        if (representation) {
            return [...representation]
        }
        return [...`${value}`, ...unit]
    })
    const [, ...text] = representation
    if (text.shift() !== '+') {
        return null
    }
    let consumed = ''
    while (/^[a-f\d]$/i.test(text[0])) {
        consumed += text.shift()
    }
    while (text[0] === '?') {
        consumed += text.shift()
    }
    const { length: startLength } = consumed
    if (startLength === 0 || 6 < startLength) {
        return null
    }
    const input = representation.join('')
    const { length } = text
    if (consumed.endsWith('?')) {
        if (0 < length) {
            return null
        }
        return {
            end: Number(`0x${consumed.replaceAll('?', '0')}`),
            location,
            representation: input,
            start: Number(`0x${consumed.replaceAll('?', '0')}`),
            type,
        }
    }
    const start = Number(`0x${consumed}`)
    if (length === 0) {
        if (MAXIMUM_CODE_POINT < start) {
            return null
        }
        return { end: start, location, representation: input, start, type }
    }
    const dash = text.shift()
    if (dash !== '-') {
        return null
    }
    consumed = ''
    while (/^[a-f\d]$/i.test(text[0])) {
        consumed += text.shift()
    }
    const { length: endLength } = consumed
    if (endLength === 0 || 6 < endLength || 0 < text.length || MAXIMUM_CODE_POINT < consumed || consumed < start) {
        return null
    }
    return { end: Number(`0x${consumed}`), location, representation: input, start, type }
}

/**
 * @param {object} space
 * @returns {object}
 *
 * It replaces the `xyz` alias by its target.
 */
function postParseXYZSpace(space) {
    const { value, ...props } = space
    if (value === 'xyz') {
        return { value: 'xyz-d65', ...props }
    }
    return space
}

module.exports = {
    'an+b': postParseAnB,
    'angular-color-stop-list': postParseColorStopList,
    'attr-matcher': postParseAttributeMatcher,
    'border-radius': postParseBorderRadius,
    'calc-product': postParseCalcProduct,
    'calc-sum': postParseCalcSum,
    'circle()': postParseCircle,
    'class-selector': postParseClassSelector,
    'color-stop-list': postParseColorStopList,
    'combinator': postParseCombinator,
    'complex-selector': postParseComplexSelector,
    'compound-selector': postParseCompoundSelector,
    'conic-gradient()': postParseConicGradient,
    'ellipse()': postParseCircle,
    'forgiving-relative-selector-list': postParseForgivingRelativeSelectorList,
    'forgiving-selector-list': postParseForgivingSelectorList,
    'id-selector': postParseIDSelector,
    'linear-gradient()': postParseLinearGradient,
    'margin': postParseSideLengths,
    'media-query': postParseMediaQuery,
    'nesting-selector': postParseNestingSelector,
    'ns-prefix': postParseNSPrefix,
    'padding': postParseSideLengths,
    'path()': postParsePath,
    'polygon()': postParsePath,
    'pseudo-class-selector': postParsePseudoClassSelector,
    'pseudo-element-selector': postParsePseudoElementSelector,
    'radial-gradient()': postParseRadialGradient,
    'repeating-conic-gradient()': postParseConicGradient,
    'repeating-linear-gradient()': postParseLinearGradient,
    'repeating-radial-gradient()': postParseRadialGradient,
    'type-selector': postParseTypeSelector,
    'urange': postParseUnicodeRange,
    'wq-name': postParseTypeSelector,
    'xyz-space': postParseXYZSpace,
}
