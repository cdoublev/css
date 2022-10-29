
const { atCenter, comma } = require('../values/defaults.js')
const { hasNestingSelector, isColon, isNumericRepresentationOf, isWhitespace } = require('../values/validation.js')
const { classes: pseudoClasses, elements: pseudoElements, functions: pseudoFunctions } = require('../values/pseudos.js')
const { isHex, isIdentifierCharacter, isWhitespace: isWhitespaceCharacter } = require('./tokenize.js')
const { createList } = require('../values/value.js')
const createStream = require('./stream.js')
const cssWideKeywords = require('../values/css-wide-keywords.js')

const MAXIMUM_CODE_POINT = 0x10FFFF
const reservedMediaQueryTypes = ['and', 'not', 'only', 'or']

/**
 * @param {object|object[]} notation
 * @param {Parser} parser
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#anb-production}
 *
 * It invalidates the notation when a whitespace is missing between `+` and `n`.
 *
 * It represents the notation as a plain object with `a` and `b` properties.
 */
function postParseAnB(notation, { list }) {
    const { representation, value } = notation
    const type = new Set(['an+b'])
    if (value === 'even') {
        return { representation, type, value: { a: 2, b: 0 } }
    }
    if (value === 'odd') {
        return { representation, type, value: { a: 2, b: 1 } }
    }
    if (!Array.isArray(notation)) {
        notation = [notation]
    }
    let text = ''
    for (const component of notation) {
        const { omitted, value, representation = value } = component
        if (!omitted) {
            // Invalid whitespace between an optional `+` and `n`
            if (value === '+' && text === '' && isWhitespace(list.source.at(list.source.indexOf(component) + 1))) {
                return null
            }
            text += representation
        }
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
    return { representation: text, type, value: { a, b: b ? Number(b) : 0 } }
}

/**
 * @param {object[]} radii
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
 *
 * It represents radii with omitted radii replaced by the corresponding radius.
 */
function postParseBorderRadius(radii) {
    const { type } = radii
    const [[h1, h2 = h1, h3 = h1, h4 = h2], vertical] = radii
    const horizontal = createList([h1, h2, h3, h4])
    if (vertical.omitted) {
        return createList([horizontal, horizontal], '/', type)
    }
    const [, [v1 = h1, v2 = v1, v3 = v1, v4 = v2]] = vertical
    return createList([horizontal, createList([v1, v2, v3, v4])], '/', type)
}

/**
 * @param {object[]} sum
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#parse-a-calculation}
 *
 * It collects sum and negate nodes (step 4) and unwraps the calculation tree
 * from nested calculation operator nodes (step 5).
 */
function postParseCalcSum([left, components]) {
    if (components.length === 0) {
        return left
    }
    return components.reduce(
        (sum, [operator, right]) => {
            if (operator.value === '-') {
                right = { type: new Set(['calc-negate']), value: right }
            }
            sum.value.push(right)
            return sum
        },
        { type: new Set(['calc-sum']), value: [left] })
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
    return components.reduce(
        (product, [operator, right]) => {
            if (operator.value === '/') {
                right = { type: new Set(['calc-invert']), value: right }
            }
            product.value.push(right)
            return product
        },
        { type: new Set(['calc-product']), value: [left] })
}

/**
 * @param {object} value
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#parse-a-calculation}
 *
 * It unwraps a calculation nested in a simple block (step 5.1).
 */
function postParseCalcValue(value) {
    return value.type.has('simple-block') ? value.value : value
}

/**
 * @param {object[]} stop
 * @param {Parser} parser
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-linear-color-stop}
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-angular-color-stop-list}
 *
 * It replaces a color stop defined with two positions by an explicit color stop
 * followed by the first position, and inserts the component values in the input
 * list in order to parse the next color stop with the second position.
 */
function postParseColorStop(stop, { list }) {
    const [color, positions] = stop
    if (positions.length === 2) {
        list.source.splice(list.index, 1, comma, color, positions.pop())
        list.reconsume()
    }
    return stop
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-complex-selector}
 * @see {@link https://drafts.csswg.org/selectors-4/#pseudo-element-structure}
 * @see {@link https://drafts.csswg.org/css-nesting-1/#at-nest}
 *
 * It invalidates the selector when it does not contain a nesting selector
 * whereas it is the prelude of @nest, or when it combines a compound selector
 * ending with a pseudo-element that is not defined with an internal structure.
 */
function postParseComplexSelector(selector, { context: { type } }) {

    const [parent, chain] = selector
    let nestContaining = hasNestingSelector(parent)

    // Single <compound-selector>
    if (chain.length === 0) {
        if (type === 'nest' && !nestContaining) {
            return null
        }
        return selector
    }

    // Filter out <combinator> and nesting selector
    const compounds = chain.reduce(
        (compounds, [, compound]) => {
            if (compound.type.has('compound-selector')) {
                compounds.push(compound)
            }
            nestContaining ||= hasNestingSelector(compound)
            return compounds
        },
        parent.type.has('compound-selector') ? [parent] : [])

    if (type === 'nest' && !nestContaining) {
        return null
    }

    // Read last item in the pseudo selector chain of <compound-selector>
    let structured = true
    for (const [, subclass, pseudoChain] of compounds) {
        if (!structured) {
            return null
        }
        // CSS2 pseudo-elements preceded by a single colon
        if (subclass.at(-1)?.type.has('pseudo-element-selector')) {
            structured = false
            continue
        }
        if (0 < pseudoChain.length) {
            const [element] = pseudoChain.at(-1)
            const { name, value } = element.at(-1).at(-1);
            ({ structured = false } = pseudoElements[name ?? value])
        }
    }

    return selector
}

/**
 * @param {object[]} selector
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-compound-selector}
 * @see {@link https://drafts.csswg.org/selectors-4/#sub-pseudo-elements}
 *
 * It invalidates the selector when it includes a pseudo-element preceding a
 * pseudo-class that cannot apply to a pseudo-element, or preceding another
 * pseudo-element but it is not an originating pseudo-element.
 */
function postParseCompoundSelector(selector) {
    const [,, pseudos] = selector
    let originating
    for (const { name, value } of pseudos.flat(3)) {
        if (value === '&') {
            continue
        }
        if (value === ':') {
            continue
        }
        if (originating && !originating.includes(name ?? value)) {
            return null
        }
        const pseudoElement = pseudoElements[name ?? value]
        if (pseudoElement) {
            ({ originating = [] } = pseudoElement)
        } else {
            originating = []
        }
    }
    return selector
}

/**
 * @param {object} gradient
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-conic-gradient}
 *
 * It represents the gradient by removing a default rotation and by replacing an
 * omitted position by `center` (default).
 */
function postParseConicGradient(gradient) {
    const { value } = gradient
    const [rotation, origin] = value
    if (!rotation.omitted && isNumericRepresentationOf(rotation[1], 0, 'deg')) {
        rotation.omitted = true
    }
    if (origin.omitted) {
        value.splice(1, 2, atCenter, comma)
    }
    return gradient
}

/**
 * @param {object[]} list
 * @returns {object[]}
 *
 * It filters out invalid results from parsing a comma-separated list according
 * to a CSS grammar.
 */
function postParseForgivingList(list) {
    return list.filter(Boolean)
}

/**
 * @param {object|[]} line
 * @returns {object[]|object|null}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-grid-row-start-grid-line}
 */
function postParseGridLine(line) {
    if (Array.isArray(line)) {
        return postParseGridLine(line.at(-1)) ? line : null
    }
    const { type, value } = line
    return (type.has('custom-ident') && (value === 'auto' || value === 'span')) ? null : line
}

/**
 * @param {object|object[]} areas
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-grid-2/#valdef-grid-template-areas-string}
 *
 * It invalidates areas when:
 * - it defines no cell token
 * - it contains a trash token
 * - it defines a non-rectangular named area
 * - it defines rows of non-equal lengths
 *
 * It represents the areas by collapsing null cell tokens and by joining cells
 * with a whitespace.
 */
function postParseGridTemplateAreas(areas) {
    if (Array.isArray(areas)) {
        const strings = []
        const named = new Map()
        for (const [row, { value }] of areas.entries()) {
            const cells = []
            const string = createStream(value)
            while (!string.atEnd()) {
                if (string.consumeRunOf(isWhitespaceCharacter)) {
                    continue
                }
                if (string.consumeRunOf('.')) {
                    cells.push('.')
                    continue
                }
                const cell = string.consumeRunOf(isIdentifierCharacter)
                if (cell) {
                    /**
                     * NamedCells => Map { [Name]: [Row] }
                     * Row        => [Position]
                     * Position   => [Number, Number]
                     */
                    const position = [cells.length, row]
                    if (named.has(cell)) {
                        const rows = named.get(cell)
                        const lastRow = rows.at(-1)
                        if (row === lastRow[0][1]) {
                            lastRow.push(position)
                        } else {
                            rows.push([position])
                        }
                    } else {
                        named.set(cell, [[position]])
                    }
                    cells.push(cell)
                    continue
                }
                return null
            }
            const { length } = cells
            // All strings must define the same number of cells and at least one cell
            if (length === 0 || strings.some(string => length !== string.length)) {
                return null
            }
            strings.push(cells)
        }
        // Search for invalid non-rectangular named areas
        for (const rows of named.values()) {
            const [firstRow] = rows
            const { length: columnLength } = firstRow
            const [[startColumn]] = firstRow
            for (const [startRow, row] of rows.entries()) {
                const { length } = row
                // Not the same number of cells
                if (length !== columnLength) {
                    return null
                }
                const [[x, y]] = row
                // Not the same start column or row gap
                if (x !== startColumn || (0 < startRow && y !== (rows[startRow - 1][0][1] + 1))) {
                    return null
                }
                // Column gap
                for (let index = 1; index < length; ++index) {
                    if (row[index][0] !== (row[index - 1][0] + 1)) {
                        return null
                    }
                }
            }
        }
        return createList(
            strings.map(cells => ({
                type: new Set(['string']),
                value: cells.join(' '),
            })),
            areas.separator,
            areas.type)
    }
    return areas
}

/**
 * @param {object} selector
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-id-selector}
 *
 * It invalidates the selector when it is an hexadecimal number.
 *
 * Ideally, <id-selector> would be defined as equal to <id> defined as a basic
 * data type corresponding to <hash-token> whose type should be `id`.
 */
function postParseIDSelector(selector) {
    return selector.type.has('id') ? selector : null
}

/**
 * @param {object} name
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframes-name}
 *
 * It invalidates the name when it is `none`.
 */
function postParseKeyframeName(name) {
    if (name.type.has('ident') && name.value === 'none') {
        return null
    }
    return name
}

/**
 * @param {object} names
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-names}
 *
 * It invalidates the name list when some is `auto` or `span`.
 */
function postParseLineNames(names) {
    if (names.value.some(({ value }) => value === 'auto' || value === 'span')) {
        return null
    }
    return names
}

/**
 * @param {object} gradient
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-linear-gradient}
 *
 * It represents the radient by omitting a default direction.
 */
function postParseLinearGradient(gradient) {
    const { value: [direction, comma] } = gradient
    const { omitted, type } = direction
    if (!omitted && !type.has('color-stop-list') && (isNumericRepresentationOf(direction, 180, 'deg'))) {
        direction.omitted = true
        comma.omitted = true
    }
    return gradient
}

/**
 * @param {object[]} list
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query}
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
 * It invalidates the prefix when it has not been declared.
 */
function postParseNSPrefix(prefix, { context }) {
    const [{ omitted, value }] = prefix
    if (!omitted && !context.root.namespaces.includes(value)) {
        return null
    }
    return prefix
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @param {object} node
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-class-selector}
 *
 * It invalidates a pseudo-class whose name is unrecognized, or a pseudo-element
 * preceded by a single colon whereas it is not defined in CSS2.
 */
function postParsePseudoClassSelector(selector, parser, node) {
    const { list } = parser
    if (isColon(list.prev(1, 1))) {
        return selector
    }
    const [colon, pseudo] = selector
    const { name, value } = pseudo
    // Functional pseudo-class
    if (name) {
        const lowercase = name.toLowerCase()
        const definition = pseudoFunctions[lowercase]
        if (definition) {
            const parsed = parser.parse(list.current.value, definition, node)
            if (parsed) {
                pseudo.name = lowercase
                pseudo.value = parsed
                return selector
            }
        }
        return null
    }
    const lowercase = value.toLowerCase()
    if (pseudoClasses.includes(lowercase)) {
        pseudo.value = lowercase
        return selector
    }
    // Pre-CSS3 pseudo-element (back-compatibility)
    if (pseudoElements[lowercase]?.legacy) {
        pseudo.value = lowercase
        return createList([colon, selector], '', ['pseudo-element-selector'])
    }
    return null
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @param {object} node
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-element-selector}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/2284}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7463}
 *
 * It invalidates the pseudo-element when its name is unrecognized or when it is
 * matched in a functional pseudo-class.
 */
function postParsePseudoElementSelector(selector, parser, node) {
    const { list, lists } = parser
    const context = lists.at(-2)
    if (context && (context.atEnd(isWhitespace) || context.current.type.has('function'))) {
        return null
    }
    const [, [, pseudo]] = selector
    const { name, value } = pseudo
    // Functional pseudo-element
    if (name) {
        const lowercase =  name.toLowerCase()
        const definition = pseudoFunctions[lowercase]
        if (definition) {
            const parsed = parser.parse(list.current.value, definition, node)
            if (parsed) {
                pseudo.name = lowercase
                pseudo.value = parsed
                return selector
            }
        }
        return null
    }
    const lowercase = value.toLowerCase()
    if (pseudoElements[lowercase]) {
        pseudo.value = lowercase
        return selector
    }
    return null
}

/**
 * @param {object} gradient
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-radial-gradient}
 *
 * It invalidates the gradient when its ending shape is:
 * - a circle with a size specified with two <length-percentage>
 * - an ellipse with a size specified with a single <length>
 *
 * It represents the gradient:
 * - by omitting a default size
 * - by omitting a default ending shape or sized with numeric values
 * - by replacing an omitted position by `center` (default)
 */
function postParseRadialGradient(gradient) {
    const { value } = gradient
    const [aspect, origin] = value
    if (!aspect.omitted) {
        const [shape, size] = aspect
        // Invalid gradient size
        if (!shape.type.has('keyword')
            && (
                (shape.value === 'circle' && Array.isArray(size))
                || (shape.value === 'ellipse' && !Array.isArray(size))
            )
        ) {
            return null
        }
        // Ommit default size
        if (size.value === 'farthest-corner') {
            size.omitted = true
        }
        // Ommit explicit shape
        if (shape.value === 'ellipse' || (!size.omitted && !size.type.has('keyword'))) {
            shape.omitted = true
        }
    }
    if (origin.omitted) {
        value.splice(1, 2, atCenter, comma)
    }
    return gradient
}

/**
 * @param {object} fn
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-round}
 *
 * It represents the function by omitting a default strategy.
 */
function postParseRound(fn) {
    const { value } = fn
    const [strategy] = value
    if (strategy.value === 'nearest') {
        strategy.omitted = true
    }
    return fn
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-track-list}
 *
 * It represents the list as an <explicit-track-list> when all track sizes are
 * explicit values, to simplify the serialization of `grid-template`.
 */
function postParseTrackList(list) {
    if (list[0].every(([, size]) => size.type.has('track-size'))) {
        list.type.add('explicit-track-list')
    }
    return list
}

/**
 * @param {object[][]} list
 * @returns {object[][]|null}
 * @see {@link https://drafts.csswg.org/css-transitions-1/#propdef-transition}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-view-timeline}
 */
function postParseNamedList(list) {
    if (1 < list.length && list.some(value => value.some(({ value }) => value === 'none'))) {
        return null
    }
    return list
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
    const { type } = range
    const text = []
    for (const component of range.flat()) {
        if (component.representation.toLowerCase() === 'u') {
            continue
        }
        text.push(...component.representation)
    }
    if (text.shift() !== '+') {
        return null
    }
    let consumed = ''
    while (isHex(text[0])) {
        consumed += text.shift()
    }
    while (text[0] === '?') {
        consumed += text.shift()
    }
    const { length: startLength } = consumed
    if (startLength === 0 || 6 < startLength) {
        return null
    }
    const { length } = text
    if (consumed.endsWith('?')) {
        if (0 < length) {
            return null
        }
        const end = Number(`0x${consumed.replaceAll('?', 'F')}`)
        if (MAXIMUM_CODE_POINT < end) {
            return null
        }
        return { end, start: Number(`0x${consumed.replaceAll('?', '0')}`), type }
    }
    const start = Number(`0x${consumed}`)
    if (length === 0) {
        if (MAXIMUM_CODE_POINT < start) {
            return null
        }
        return { end: start, start, type }
    }
    if (text.shift() !== '-') {
        return null
    }
    consumed = ''
    while (isHex(text[0])) {
        consumed += text.shift()
    }
    const { length: endLength } = consumed
    if (0 === endLength || 6 < endLength || 0 < text.length || MAXIMUM_CODE_POINT < consumed || consumed < start) {
        return null
    }
    return { end: Number(`0x${consumed}`), start, type }
}

module.exports = {
    'an+b': postParseAnB,
    'angular-color-stop': postParseColorStop,
    'border-radius': postParseBorderRadius,
    'calc-product': postParseCalcProduct,
    'calc-sum': postParseCalcSum,
    'calc-value': postParseCalcValue,
    'complex-selector': postParseComplexSelector,
    'compound-selector': postParseCompoundSelector,
    'conic-gradient()': postParseConicGradient,
    'forgiving-relative-selector-list': postParseForgivingList,
    'forgiving-selector-list': postParseForgivingList,
    'grid-line': postParseGridLine,
    'grid-template-areas': postParseGridTemplateAreas,
    'id-selector': postParseIDSelector,
    'keyframes-name': postParseKeyframeName,
    'layer-name': postParseLayerName,
    'line-names': postParseLineNames,
    'linear-color-stop': postParseColorStop,
    'linear-gradient()': postParseLinearGradient,
    'media-query': postParseMediaQuery,
    'ns-prefix': postParseNSPrefix,
    'pseudo-class-selector': postParsePseudoClassSelector,
    'pseudo-element-selector': postParsePseudoElementSelector,
    'radial-gradient()': postParseRadialGradient,
    'repeating-conic-gradient()': postParseConicGradient,
    'repeating-linear-gradient()': postParseLinearGradient,
    'repeating-radial-gradient()': postParseRadialGradient,
    'round()': postParseRound,
    'track-list': postParseTrackList,
    'transition': postParseNamedList,
    'view-timeline': postParseNamedList,
    'urange': postParseUnicodeRange,
}
