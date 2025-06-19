
const { angle, filter, keyword, list, map, number, omitted, string } = require('../values/value.js')
const { findContext, findSibling, isDeclaredBy, isProducedBy } = require('../utils/context.js')
const { addTypes, dimensionTypes, getCalculationType, matchNumericType } = require('./types.js')
const { isCalculation, isColon, isList, isOmitted, isWhitespace } = require('../utils/value.js')
const { isHexadecimal, isIdentifierCharacter, isWhitespace: isWhitespaceCharacter } = require('./tokenize.js')
const Stream = require('./stream.js')
const compatibility = require('../compatibility.js')
const counterStyles = require('../values/counter-styles.js')
const createError = require('../error.js')
const { keywords: cssWideKeywords } = require('../values/substitutions.js')
const descriptors = require('../descriptors/definitions.js')
const dimensions = require('../values/dimensions.js')
const nonTerminal = require('../values/definitions.js')
const { notAll } = require('../values/defaults.js')
const pseudos = require('../values/pseudos.js')
const { serializeCSSComponentValue } = require('../serialize.js')
const { simplifyCalculation } = require('./simplify.js')

const MAXIMUM_CODE_POINT = 0x10FFFF

const hexLengths = [3, 4, 6, 8]
const legacyStringFontFormats = [
    'collection',
    'opentype',
    'opentype-variations',
    'truetype',
    'truetype-variations',
    'woff',
    'woff-variations',
    'woff2',
    'woff2-variations',
]
const reserved = {
    animateableFeature: [/*'contents', 'scroll-position', */'all', 'auto', 'none', 'will-change'],
    colorScheme: [/*'dark', 'light', */'normal', 'only'],
    components: ['none'],
    containerName: ['and', 'none', 'not', 'or'],
    counterName: ['none'],
    counterStyleName: ['none'],
    flowInto: ['auto', 'none'],
    fontFamilyName: [
        ...nonTerminal['<generic-complete>'].split(' | '),
        ...nonTerminal['<generic-incomplete>'].split(' | '),
        ...nonTerminal['<system-family-name>'].split(' | '),
    ],
    keyframeName: ['none'],
    lineName: ['auto', 'span'],
    mediaType: ['and', 'layer', 'not', 'only', 'or'],
    viewTransitionName: [/* none, */'auto', 'match-element'],
    voiceFamilyName: [...nonTerminal['<gender>'].split(' | '), 'preserve'],
}

/**
 * @param {object} node
 * @returns {SyntaxError}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `Invalid ${name ?? value}` })
}

/**
 * @param {object|object[]} match
 * @param {object[]} input
 * @returns {object[]}
 *
 * It returns the matched value as a flat list of preserved tokens, functions,
 * or simple blocks, resolved from the input, which should be used to validate
 * the matched value against a refined grammar.
 */
function getInputComponentValuesFromMatch(match, input) {
    if (isList(match)) {
        match = match.flat(Infinity)
        const head = match.find(value => !isOmitted(value))
        const tail = match.findLast(value => !isOmitted(value))
        return input.slice(
            input.findIndex(value => value.start === head.start),
            input.findIndex(value => value.start === tail.start) + 1)
    }
    return [input.find(value => value.start === match.start)]
}

/**
 * @param {object[][]} symbols
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#descdef-counter-style-additive-symbols}
 *
 * It aborts parsing when the symbols are not in order of descending weight.
 */
function postParseAdditiveSymbols(symbols, node) {
    for (const [index, [weight]] of symbols.entries()) {
        const next = symbols[index + 1]
        if (next && weight.value <= next[0].value) {
            return error(node)
        }
    }
    return symbols
}

/**
 * @param {object|object[]} notation
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#anb-production}
 *
 * It aborts parsing when a whitespace is interleaved between `+` and `n`.
 *
 * It represents the notation as a plain object with `a` and `b` properties.
 */
function postParseAnB(notation, node) {
    const { value } = notation
    const { input: { data: tokens } } = node
    const types = ['<an+b>']
    if (value === 'even') {
        return { types, value: { a: 2, b: 0 } }
    }
    if (value === 'odd') {
        return { types, value: { a: 2, b: 1 } }
    }
    let text = ''
    for (const value of (isList(notation) ? notation : [notation])) {
        if (!isOmitted(value)) {
            // Invalid whitespace between an optional `+` and `n`
            if (text === '' && value.value === '+' && isWhitespace(tokens[tokens.indexOf(value) + 1])) {
                return error(node)
            }
            text += value.value + (value.unit ?? '')
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
    return { types, value: { a, b: b ? Number(b) : 0 } }
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-will-change-1/#typedef-animateable-feature}
 *
 * It aborts parsing when the name is a reserved keyword in the context.
 */
function postParseAnimateableFeature(name, node) {
    return reserved.animateableFeature.includes(name.value.toLowerCase()) ? error(node) : name
}

/**
 * @param {object} timeline
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-values-5/#valdef-progress-source-animation-timeline}
 *
 * It aborts parsing when the timeline is a keyword used as <progress-source>.
 */
function postParseAnimationTimeline(timeline, node) {
    if (timeline.types.includes('<keyword>') && isProducedBy(node, '<progress-source>')) {
        return error(node)
    }
    return timeline
}

/**
 * @param {object[]} radii
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
 *
 * It represents the radii by replacing an omitted radius with a default value.
 */
function postParseBorderRadius(radii) {
    const { types } = radii
    const [[h1, h2 = h1, h3 = h1, h4 = h2], vertical] = radii
    const horizontal = list([h1, h2, h3, h4])
    if (isOmitted(vertical)) {
        return list([horizontal, horizontal], '/', types)
    }
    const [, [v1 = h1, v2 = v1, v3 = v1, v4 = v2]] = vertical
    return list([horizontal, list([v1, v2, v3, v4])], '/', types)
}

/**
 * @param {object|object[]} product
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-calc-product}
 * @see {@link https://drafts.csswg.org/css-values-4/#parse-a-calculation}
 *
 * It collects product and invert nodes (step 3).
 */
function postParseCalcProduct([left, tail]) {
    if (tail.length === 0) {
        return left
    }
    return tail.reduce(
        (product, [operator, right]) => {
            if (operator.value === '/') {
                right = { types: ['<calc-invert>'], value: right }
            }
            product.push(right)
            return product
        },
        list([left], '*', ['<calc-product>']))
}

/**
 * @param {object|object[]} sum
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-calc-sum}
 * @see {@link https://drafts.csswg.org/css-values-4/#parse-a-calculation}
 *
 * It collects sum and negate nodes (step 4) and unwraps the calculation tree
 * from nested calculation operator nodes (step 5).
 */
function postParseCalcSum([left, tail]) {
    if (tail.length === 0) {
        return left
    }
    return tail.reduce(
        (sum, [operator, right]) => {
            if (operator.value === '-') {
                right = { types: ['<calc-negate>'], value: right }
            }
            sum.push(right)
            return sum
        },
        list([left], '+', ['<calc-sum>']))
}

/**
 * @param {object} value
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-calc-value}
 * @see {@link https://drafts.csswg.org/css-values-4/#parse-a-calculation}
 *
 * It unwraps a calculation nested in a simple block (step 5.1).
 */
function postParseCalcValue(value) {
    return value.types[0] === '<block>' ? value.value : value
}

/**
 * @param {object} color
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-palette-values-override-colors}
 *
 * It aborts parsing when the color is not an absolute color for override-colors
 * in @font-palette-values.
 */
function postParseColor(color, node) {
    if (isDeclaredBy(node, 'override-colors') && !color.types.includes('<color-base>')) {
        return error(node)
    }
    return color
}

/**
 * @param {object|object[]} schemes
 * @param {object} node
 * @returns {SyntaxError|string}
 * @see {@link https://drafts.csswg.org/css-color-adjust-1/#propdef-color-scheme}
 *
 * It aborts parsing when some scheme is a reserved keyword in the context.
 */
function postParseColorScheme(schemes, node) {
    if (isList(schemes) && schemes[0].some(scheme => reserved.colorScheme.includes(scheme.value.toLowerCase()))) {
        return error(node)
    }
    return schemes
}

/**
 * @param {object[]} components
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/css-color-5/#descdef-color-profile-components}
 *
 * It aborts parsing when some component is a reserved keyword in the context.
 */
function postParseComponents(components, node) {
    if (components.some(component => reserved.components.includes(component.value.toLowerCase()))) {
        return error(node)
    }
    return components
}

/**
 * @param {object|object[]} names
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#propdef-container-name}
 *
 * It aborts parsing when some name is a reserved keyword in the context.
 */
function postParseContainerNameProperty(names, node) {
    if (isList(names) && names.some(name => postParseContainerNameType(name, node))) {
        return error(node)
    }
    return names
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-container-name}
 *
 * It aborts parsing when the name is a reserved keyword in the context.
 */
function postParseContainerNameType(name, node) {
    return reserved.containerName.includes(name.value.toLowerCase()) ? error(node) : name
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-lists-3/#typedef-counter-name}
 *
 * It aborts parsing when the name is a reserved keyword in the context.
 *
 * It invalidates the name when it is a reserved keyword in the context.
 */
function postParseCounterName(name, node) {
    if (reserved.counterName.includes(name.value.toLowerCase())) {
        if (node.context.function?.definition.name === 'reversed') {
            return error(node)
        }
        return
    }
    return name
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#typedef-counter-style-name}
 *
 * It aborts parsing when the name is `none` or a non-overridable predefined
 * counter style name, in @counter-style.
 *
 * It invalidates the name when it is a reserved keyword in list-style or
 * list-style-type properties.
 *
 * It represents the name as a keyword when it matches a predefined name.
 */
function postParseCounterStyleName(name, node) {
    const lowercase = name.value.toLowerCase()
    if (reserved.counterStyleName.includes(lowercase)) {
        if (node.context.declaration?.definition.name.startsWith('list-style')) {
            return
        }
        return error(node)
    }
    if (counterStyles.predefined.includes(lowercase)) {
        if (!node.context.declaration && counterStyles.nonOverridable.includes(lowercase)) {
            return error(node)
        }
        return keyword(lowercase, ['<counter-style-name>'])
    }
    return name
}

/**
 * @param {object} type
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-mixins-1/#typedef-css-type}
 *
 * It represents a single <syntax-component> type without a type() wrapper.
 */
function postParseCSSType(type) {
    const { types, value } = type
    if (types[0] === '<function>' && isList(value) && isOmitted(value[1])) {
        return value[0]
    }
    return type
}

/**
 * @param {object[]} definition
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object}
 *
 * It aborts parsing when the definition uses an invalid <dashed-ident> name.
 */
function postParseCustomFunctionDefinition(definition, node, parser) {
    if (parser.parseCSSGrammar(definition[0].name, '<dashed-ident>', node.context)) {
        return definition
    }
    return error(node)
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#identifier-value}
 *
 * It aborts parsing the identifier when it is a globally reserved keyword.
 */
function postParseCustomIdentifier(identifier) {
    const lowercase = identifier.value.toLowerCase()
    if (cssWideKeywords.includes(lowercase) || lowercase === 'default') {
        return null
    }
    return identifier
}

/**
 * @param {object} name
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-variables-2/#typedef-custom-property-name}
 *
 * It aborts parsing the name when it is a reserved custom property name.
 */
function postParseCustomPropertyName(name) {
    return name.value === '--' ? null : name
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-dashndashdigit-ident}
 *
 * It aborts parsing the identifier when it does not match the expected pattern.
 *
 * It represents the identifier in lowercase.
 */
function postParseDashNDashDigitIdentifier(identifier) {
    const lowercase = identifier.value.toLowerCase()
    if (/^-n-\d+$/.test(lowercase)) {
        return { ...identifier, value: lowercase }
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#typedef-dashed-ident}
 *
 * It aborts parsing the identifier when it does not start with `--`.
 */
function postParseDashedIdent(identifier) {
    return identifier.value.startsWith('--') ? identifier : null
}

/**
 * @param {object} dimension
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-flex}
 * @see {@link https://drafts.csswg.org/css-speech-1/#typedef-voice-pitch-semitones}
 * @see {@link https://drafts.csswg.org/css-speech-1/#typedef-voice-volume-decibel}
 * @see {@link https://drafts.csswg.org/css-values-4/#angle-value}
 * @see {@link https://drafts.csswg.org/css-values-4/#frequency-value}
 * @see {@link https://drafts.csswg.org/css-values-4/#length-value}
 * @see {@link https://drafts.csswg.org/css-values-4/#resolution-value}
 * @see {@link https://drafts.csswg.org/css-values-4/#time-value}
 *
 * It aborts parsing the dimension when its unit is unrecognized or when its
 * value is out of range.
 */
function postParseDimension(dimension, { definition: { max, min, name } }) {
    const definition = dimensions.definitions.get(name)
    if (definition) {
        const { unit, value } = dimensions.canonicalize(dimension)
        min = Math.max(min ?? -Infinity, definition.min ?? -Infinity)
        max = Math.min(max ?? Infinity, definition.max ?? Infinity)
        if (definition.units.includes(unit) && min <= value && value <= max) {
            return dimension
        }
    }
    return null
}

/**
 * @param {object|object[]} name
 * @param {object} node
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#family-name-value}
 * @see {@link https://drafts.csswg.org/css-speech-1/#valdef-voice-family-family-name}
 *
 * It aborts parsing the name when it is invalid in the context.
 */
function postParseFamilyName(name, node) {
    const invalid = isDeclaredBy(node, 'voice-family')
        ? reserved.voiceFamilyName
        : reserved.fontFamilyName
    if (name.types.includes('<string>') || 1 < name.length || !invalid.includes(name[0].value.toLowerCase())) {
        return name
    }
    return null
}

/**
 * @param {object} substitution
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-first-valid}
 *
 * It aborts parsing when none of the arguments are valid in the context.
 *
 * It represents the substitution with the first valid value.
 */
function postParseFirstValid(substitution, node, { parseCSSGrammar }) {
    const { context } = node
    const { declaration: { definition } } = context
    for (let value of substitution.value) {
        if ((value = parseCSSGrammar(value, definition, context))) {
            return value
        }
    }
    return error(node)
}

/**
 * @param {object|object[]} name
 * @param {object} node
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.csswg.org/css-regions-1/#propdef-flow-into}
 *
 * It aborts parsing when the name is a reserved keyword in the context.
 */
function postParseFlowInto(name, node) {
    if (isList(name) && reserved.flowInto.includes(name[0].value.toLowerCase())) {
        return error(node)
    }
    return name
}

/**
 * @param {object} format
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#font-format-values}
 *
 * It aborts parsing when the format is not a known legacy format string.
 */
function postParseFontFormat(format, node) {
    if (format.types.includes('<string>') && !legacyStringFontFormats.includes(format.value)) {
        return error(node)
    }
    return format
}

/**
 * @param {*[]} list
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-src}
 *
 * It aborts parsing when the list has no valid font source.
 *
 * It represents the list without invalid font sources.
 */
function postParseFontSourceList(list, node) {
    list = filter(list, Boolean)
    return 0 < list.length ? list : error(node)
}

/**
 * @param {object[]} list
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-forgiving-selector-list}
 *
 * It aborts parsing when the list includes invalid selectors and parsing is
 * strict (unforgiving).
 */
function postParseForgivingSelectorList(selectors, node) {
    const valid = []
    for (const selector of selectors) {
        if (selector) {
            valid.push(selector)
        } else if (node.context.strict) {
            return error(node)
        }
    }
    return list(valid, ',')
}

/**
 * @param {object[]} parameter
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-mixins-1/#typedef-function-parameter}
 *
 * It aborts parsing when the parameter has the same name as a preceding one,
 * or when its default value is invalid according to its type.
 *
 * It represents the parameter without the default type.
 */
function postParseFunctionParameter(parameter, node, parser) {
    const { context, parent } = node
    const [name, type, defaultValue] = parameter
    if (parent?.children.some((parameter, index) => ++index % 2 && parameter.value[0].value === name.value)) {
        return error(node)
    }
    if (!isOmitted(type)) {
        if (!isOmitted(defaultValue)) {
            const definition = serializeCSSComponentValue(type.types[0] === '<function>' ? type.value : type)
            if (!parser.parseCSSGrammar(defaultValue[1], definition, context)) {
                return error(node)
            }
        }
        if (type.types[0] === '<function>') {
            const syntax = type.value
            if (syntax.value === '*') {
                return list([name, omitted, defaultValue])
            }
        }
    }
    return parameter
}

/**
 * @param {object} orientation
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-writing-modes-4/#propdef-glyph-orientation-vertical}
 *
 * It aborts parsing when the orientation is neither `auto`, `0`, `0deg`, `90`,
 * `90deg`.
 */
function postParseGlyphOrientationVertical(orientation, node) {
    const { types, unit, value } = orientation
    switch (value) {
        case 'auto':
            return orientation
        case 0:
        case 90:
            return (types.includes('<number>') || (types.includes('<angle>') && unit === 'deg'))
                ? orientation
                : error(node)
        default:
            return error(node)
    }
}

/**
 * @param {object|object[]} line
 * @param {object} node
 * @returns {SyntaxError|object|object[]|null|undefined}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-grid-row-start-grid-line}
 *
 * It aborts parsing when the line name is `auto`.
 *
 * It invalidates the line when its name is `span`.
 */
function postParseGridLine(line, node) {
    if (isList(line)) {
        const identifier = line.flat().at(-1)
        if (!isOmitted(identifier)) {
            const name = identifier.value.toLowerCase()
            if (name === 'auto') {
                return error(node)
            }
            if (name === 'span') {
                return
            }
        }
        return line
    }
    if (line.types.includes('<custom-ident>') && line.value.toLowerCase() === 'span') {
        return
    }
    return line
}

/**
 * @param {object|object[]} areas
 * @param {object} node
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#valdef-grid-template-areas-string}
 *
 * It aborts parsing when the areas are defined with:
 * - no cell
 * - a trash token
 * - a non-rectangular named area
 * - rows of non-equal lengths
 *
 * It represents the areas by collapsing null cell tokens and by joining cells
 * with a whitespace.
 */
function postParseGridTemplateAreas(areas, node) {
    if (isList(areas)) {
        const strings = []
        const named = new Map
        for (const [row, { value }] of areas.entries()) {
            const cells = []
            const string = new Stream(value)
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
                return error(node)
            }
            const { length } = cells
            // All strings must define the same number of cells and at least one cell
            if (length === 0 || strings.some(string => length !== string.length)) {
                return error(node)
            }
            strings.push(cells)
        }
        // Search for invalid non-rectangular named areas
        for (const rows of named.values()) {
            const firstRow = rows[0]
            const columnLength = firstRow.length
            const startColumn = firstRow[0][0]
            for (const [startRow, row] of rows.entries()) {
                const { length } = row
                // Not the same number of cells
                if (length !== columnLength) {
                    return error(node)
                }
                const [[x, y]] = row
                // Not the same start column or row gap
                if (x !== startColumn || (0 < startRow && y !== (rows[startRow - 1][0][1] + 1))) {
                    return error(node)
                }
                // Column gap
                for (let index = 1; index < length; ++index) {
                    if (row[index][0] !== (row[index - 1][0] + 1)) {
                        return error(node)
                    }
                }
            }
        }
        return list(
            strings.map(cells => string(cells.join(' '))),
            areas.separator,
            areas.types)
    }
    return areas
}

/**
 * @param {object} color
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-color-4/#typedef-hex-color}
 *
 * It aborts parsing the color when its value is not hexadecimal.
 */
function postParseHexColor(color) {
    const { value } = color
    if ([...value].every(value => /[a-f\d]/i.test(value)) && hexLengths.includes(value.length)) {
        return color
    }
    return null
}

/**
 * @param {object} selector
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-id-selector}
 *
 * It aborts parsing when the unprefixed selector hash is not a valid identifier.
 */
function postParseIDSelector(selector, node) {
    return selector.type === 'id' ? selector : error(node)
}

/**
 * @param {object} integer
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#integer-value}
 *
 * It aborts parsing the integer when its value is not an integer or is outside
 * any defined range.
 */
function postParseInteger(integer, node) {
    if (Number.isInteger(integer.value)) {
        return postParseNumeric(integer, node)
    }
    return null
}

/**
 * @param {object} interpolation
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-calc-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-color-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-interpolate}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-transform-interpolate}
 *
 * It aborts parsing when the interpolation has inconsistent absolute position
 * types, or when the progress position type is absolute but no stop position
 * type is.
 */
function postParseInterpolate(interpolation, node) {
    const { value: [[progress],, head,,,, tail] } = interpolation
    const progressType = progress.types.includes("<'animation-timeline'>")
        ? null
        : getCalculationType(progress, '<number>')
    let left
    if (matchNumericType(progressType, dimensionTypes, '<number>')) {
        left = progressType
    }
    for (const position of [...head, ...tail.flatMap(item => item[2])]) {
        const positionType = getCalculationType(position, '<number>')
        if (matchNumericType(positionType, ['<number>', '<percentage>'], '<number>')) {
            continue
        }
        if (left) {
            left = addTypes(left, positionType)
            if (!left) {
                return error(node)
            }
        } else {
            left = positionType
        }
    }
    if (left === progressType || (!left && !progressType)) {
        return error(node)
    }
    return interpolation
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframes-name}
 *
 * It aborts parsing when the name is a reserved keyword in the context.
 */
function postParseKeyframesName(name, node) {
    if (name.types.includes('<custom-ident>') && reserved.keyframeName.includes(name.value.toLowerCase())) {
        return error(node)
    }
    return name
}

/**
 * @param {object} keyword
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#css-keyword}
 *
 * It aborts parsing the keyword when it does not match the expected value or
 * any legacy mapped value.
 *
 * It represents the keyword in lowercase, with an alias name replaced with its
 * target name.
 */
function postParseKeyword(keyword, { context, definition: { range } }) {
    const lowercase = keyword.value.toLowerCase()
    if (lowercase === range.toLowerCase()) {
        return { ...keyword, value: lowercase }
    }
    if (context.function?.definition.name === range) {
        const { values: { functions: { aliases, mappings } } } = compatibility
        if (aliases?.get(lowercase) === range) {
            return { ...keyword, value: range }
        }
        if (mappings?.has(lowercase) === range) {
            return { ...keyword, value: lowercase }
        }
        return null
    }
    const { aliases, mappings } = compatibility.values.keywords[context.declaration?.definition.name] ?? {}
    if (aliases?.get(lowercase) === range) {
        return { ...keyword, value: range }
    }
    if (mappings?.get(lowercase) === range) {
        return { ...keyword, value: lowercase }
    }
    return null
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-cascade-5/#typedef-layer-name}
 *
 * It aborts parsing when the name includes a CSS-wide keyword.
 */
function postParseLayerName(name, node) {
    const [head, tail] = name
    if (cssWideKeywords.includes(head.value) || tail.some(([, name]) => cssWideKeywords.includes(name.value))) {
        return error(node)
    }
    return name
}

/**
 * @param {object} names
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-names}
 *
 * It aborts parsing when some name is a reserved keyword in the context.
 */
function postParseLineNames(names, node) {
    if (names.value.some(name => reserved.lineName.includes(name.value.toLowerCase()))) {
        return error(node)
    }
    return names
}

/**
 * @param {object} context
 * @returns {string}
 */
function getMediaFeatureContextName(context) {
    return context.function?.definition.name
        ?? context.rule?.definition.name
        ?? '@media'
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-name}
 *
 * It aborts parsing when the name is prefixed with `min` or `max` but is not
 * used in a plain (declaration) context.
 *
 * It represents the name in lowercase, with an alias name replaced with its
 * target name.
 */
function postParseMediaFeatureName(name, node) {

    const { context, parent } = node
    const lowercase = name.value.toLowerCase()
    const unprefixed = lowercase.replace(/(min|max)-/, '')

    let contextName = getMediaFeatureContextName(context)
    if (contextName.endsWith('-progress')) {
        contextName = `@${contextName.split('-progress')[0]}`
        if (descriptors[contextName][lowercase]?.type !== 'range') {
            return error(node)
        }
    }

    const target = compatibility.descriptors[contextName]?.aliases.get(unprefixed)

    if (lowercase === unprefixed) {
        if (target) {
            return { ...name, value: target }
        }
        if (descriptors[contextName][lowercase]) {
            return { ...name, value: lowercase }
        }
    } else if (isProducedBy(node, '<mf-plain>') /* only for <mf-name> tests: */ || !node.parent) {
        if (target) {
            return { ...name, value: `${lowercase.includes('min-') ? 'min' : 'max'}-${target}` }
        }
        if (descriptors[contextName][unprefixed]?.type === 'range') {
            return { ...name, value: lowercase }
        }
    }
    return error(node)
}

/**
 * @param {object[]} declaration
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-plain}
 *
 * It aborts parsing when the declaration value fails to be parsed against its
 * definition.
 *
 * It represents the declaration value with the result from parsing it against
 * the feature value definition.
 */
function postParseMediaFeaturePlain(declaration, node, parser) {
    const { context, input } = node
    const [name,, value] = declaration
    const unprefixed = name.value.replace(/(min|max)-/, '')
    const definition = descriptors[getMediaFeatureContextName(context)][unprefixed].value
    const list = getInputComponentValuesFromMatch(value, input.data)
    const match = parser.parseCSSGrammar(list, definition, context)
    if (match) {
        match.types.push('<mf-value>')
        declaration.splice(2, 1, match)
        return declaration
    }
    return error(node)
}

/**
 * @param {object[]} range
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-range}
 *
 * It aborts parsing when the feature type is `discrete` or some value fails to
 * be parsed against the feature value definition.
 *
 * It represents the range values with the result from parsing them against the
 * feature value definition.
 */
function postParseMediaFeatureRange(range, node, { parseCSSGrammar }) {
    const { context, input } = node
    const name = range.find(value => value.types.at(-1) === '<mf-name>')
    const { type, value: definition } = descriptors[getMediaFeatureContextName(context)][name.value]
    if (type !== 'range') {
        return error(node)
    }
    for (let value of range.splice(0)) {
        if (value.types.at(-1) === '<mf-value>') {
            value = getInputComponentValuesFromMatch(value, input.data)
            value = parseCSSGrammar(value, definition, context)
            if (!value) {
                return error(node)
            }
            value.types.push('<mf-value>')
        }
        range.push(value)
    }
    return range
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-media-query-list}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list}
 *
 * It represents the list by replacing invalid media queries with `not all`.
 */
function postParseMediaQueryList(list) {
    return map(list, media => media ?? notAll)
}

/**
 * @param {object} type
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-type}
 *
 * It aborts parsing when the type is a reserved keyword in the context.
 */
function postParseMediaType(type, node) {
    return reserved.mediaType.includes(type.value.toLowerCase()) ? error(node) : type
}

/**
 * @param {object} dimension
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-ndashdigit-dimension}
 *
 * It aborts parsing the dimension when its unit does not match the expected
 * pattern.
 */
function postParseNDashDigitDimension(dimension) {
    if (/^n-\d+$/.test(dimension.unit) && Number.isInteger(dimension.value)) {
        return dimension
    }
    return null
}

/**
 * @param {object} identifier
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-ndashdigit-ident}
 *
 * It aborts parsing the identifier when its value does not match the expected
 * pattern.
 *
 * It represents the identifier in lowercase.
 */
function postParseNDashDigitIdentifier(identifier) {
    const lowercase = identifier.value.toLowerCase()
    if (/^n-\d+$/.test(lowercase)) {
        return { ...identifier, value: lowercase }
    }
    return null
}

/**
 * @param {object} dimension
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-ndash-dimension}
 *
 * It aborts parsing the dimension when its unit does not match the expected
 * pattern.
 */
function postParseNDashDimension(dimension) {
    if (dimension.unit === 'n-' && Number.isInteger(dimension.value)) {
        return dimension
    }
    return null
}

/**
 * @param {object} dimension
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-n-dimension}
 *
 * It aborts parsing the dimension when its unit does not match the expected
 * pattern.
 */
function postParseNDimension(dimension) {
    if (dimension.unit === 'n' && Number.isInteger(dimension.value)) {
        return dimension
    }
    return null
}

/**
 * @param {object[]} prefix
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-ns-prefix}
 *
 * It aborts parsing when the prefix is undeclared.
 */
function postParseNSPrefix(prefix, node) {
    const name = prefix[0]
    if (isOmitted(name) || node.context.globals.get('namespaces').has(name.value)) {
        return prefix
    }
    return error(node)
}

/**
 * @param {object} numeric
 * @param {object} node
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-values-4/#integer-value}
 * @see {@link https://drafts.csswg.org/css-values-4/#number-value}
 * @see {@link https://drafts.csswg.org/css-values-4/#percentage-value}
 *
 * It aborts parsing the numeric when its value is outside any defined range.
 */
function postParseNumeric(numeric, { definition: { max = Infinity, min = -Infinity } }) {
    const { value } = numeric
    if (min <= value && value <= max) {
        return numeric
    }
    return null
}

/**
 * @param {object} tag
 * @param {object} node
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#typedef-opentype-tag}
 *
 * It aborts parsing when the tag has less or more than 4 characters or when it
 * includes a non-ASCII character.
 */
function postParseOpenTypeTag(tag, node) {
    if (/^[\u0020-\u007E]{4}$/.test(tag.value)) {
        return tag
    }
    return error(node)
}

/**
 * @param {object|object[]} paint
 * @returns {object|object[]}
 * @see {@link https://svgwg.org/svg2-draft/painting.html#PaintOrderProperty}
 *
 * It represents the paint list as specified by the author.
 */
function postParsePaintOrder(paint) {
    if (isList(paint)) {
        const res = paint.sort((a, b) => {
            if (isOmitted(a)) {
                return 1
            }
            if (isOmitted(b)) {
                return -1
            }
            return a.start < b.start ? -1 : 1
        })
        return res
    }
    return paint
}

/**
 * @param {object} path
 * @param {object} node
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-path}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-polygon}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/3468}
 *
 * It represents the path or polygon with an omitted fill rule when the context
 * is the offset-path property.
 */
function postParsePath(path, node) {
    if (isDeclaredBy(node, 'offset-path')) {
        const { value: [,, ...tail] } = path
        return { ...path, value: list([omitted, omitted, ...tail]) }
    }
    return path
}

/**
 * @param {object} node
 * @returns {object}
 */
function getPseudoElementDefinition({ value: [, [, { name, types, value }]] }) {
    if (types.includes('<function>')) {
        return pseudos.elements.functions[name]
    }
    return pseudos.elements.identifiers[value]
}

/**
 * @param {string} key
 * @param {object} node
 * @returns {boolean}
 */
function isValidPseudoClass(key, node) {
    if (pseudos.userActions.includes(key) || pseudos.logical[key]) {
        return true
    }
    // :has() nested in :has()
    if (key === 'has' && findContext('function', node, node => node.definition.name === 'has')) {
        return false
    }
    // Pseudo-class qualifying pseudo-element
    const pseudoElement = findSibling(
        node,
        node => node.definition.name === '<pseudo-element-selector>',
        node => node.definition.name === '<subclass-selector>',
        true)
    if (pseudoElement) {
        return getPseudoElementDefinition(pseudoElement).classes?.includes(key)
    }
    return true
}

/**
 * @param {object[]} selector
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-class-selector}
 *
 * It aborts parsing when the selector:
 * - is an unrecognized pseudo-class identifier
 * - is not allowed in the context
 * - has an invalid argument
 *
 * It invalidates the selector when it is a legacy pseudo-element identifier.
 */
function postParsePseudoClassSelector(selector, node, parser) {
    const { context, input } = node
    // Pseudo-element
    if (isColon(input.prev(1, 1))) {
        return selector
    }
    const [colon, pseudo] = selector
    let { name, value } = pseudo
    // Functional pseudo-class
    if (name) {
        name = name.toLowerCase()
        const definition = pseudos.classes.functions[name]
        if (definition && isValidPseudoClass(name, node)) {
            node = { ...node, definition: { name, type: 'function', value: definition } }
            value = parser.parseCSSGrammar(input.current.value, definition, { ...context, function: node })
            if (value) {
                const fn = { ...pseudo, name, value }
                return list([colon, fn], '', ['<pseudo-class-selector>'])
            }
        }
        return error(node)
    }
    // Pseudo-class identifier
    value = value.toLowerCase()
    if (pseudos.classes.aliases.has(value)) {
        value = pseudos.classes.aliases.get(value)
    }
    if (pseudos.classes.identifiers.includes(value) && isValidPseudoClass(value, node)) {
        const identifier = { ...pseudo, value }
        return list([colon, identifier], '', ['<pseudo-class-selector>'])
    }
    return null
}

/**
 * @param {string} key
 * @param {object} node
 * @returns {boolean}
 */
function isValidPseudoElement(key, node) {
    const origin = findSibling(
        node,
        node => node.definition.name === '<pseudo-element-selector>',
        node => node.definition.name === '<coumpound-selector>',
        true)
    if (origin) {
        if (key.startsWith('-webkit-')) {
            return false
        }
        return getPseudoElementDefinition(origin).elements?.includes(key)
    }
    return true
}

/**
 * @param {object[]} selector
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-element-selector}
 *
 * It aborts parsing when the selector:
 * - is unrecognized
 * - is not allowed in the context
 * - has an invalid argument
 *
 * It represents a legacy pseudo-element as a non-legacy pseudo-element.
 */
function postParsePseudoElementSelector(selector, node, parser) {
    const { context, input } = node
    if (selector.types.includes('<legacy-pseudo-element-selector>')) {
        const [colon, pseudo] = selector
        const pseudoClass = list([colon, pseudo], '', ['<pseudo-class-selector>'])
        selector = list([colon, pseudoClass], '', ['<pseudo-element-selector>'])
    }
    const [, [colon, pseudo]] = selector
    let { name, value } = pseudo
    // Functional pseudo-element
    if (name) {
        name = name.toLowerCase()
        const definition = pseudos.elements.functions[name]
        if (definition && isValidPseudoElement(name, node)) {
            node = { ...node, definition: { name, type: 'function', value: definition } }
            value = parser.parseCSSGrammar(input.current.value, definition.value, { ...context, function: node })
            if (value) {
                const fn = { ...pseudo, name, value }
                const pseudoClass = list([colon, fn], '', ['<pseudo-class-selector>'])
                return list([colon, pseudoClass], '', ['<pseudo-element-selector>'])
            }
        }
        return error(node)
    }
    // Pseudo-element identifier
    value = value.toLowerCase()
    const isDefined = pseudos.elements.identifiers[value] ?? (value.startsWith('-webkit-') && !context.strict)
    if (isDefined && isValidPseudoElement(value, node)) {
        const identifier = { ...pseudo, value }
        const pseudoClass = list([colon, identifier], '', ['<pseudo-class-selector>'])
        return list([colon, pseudoClass], '', ['<pseudo-element-selector>'])
    }
    return error(node)
}

/**
 * @param {object[]} gradient
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-radial-gradient}
 * @see {@link https://drafts.csswg.org/css-images-4/#radial-size}
 *
 * It aborts parsing when the shape of the gradient is a circle specified with
 * two component values for its size.
 */
function postParseRadialGradient(gradient, node) {
    const configuration = gradient[0]
    if (!isOmitted(configuration) && !isOmitted(configuration[0])) {
        const aspect = configuration[0][0]
        if (!isOmitted(aspect) && aspect.every(value => !isOmitted(value))) {
            const [shape, size] = aspect
            if (shape.value === 'circle' && 1 < size.length) {
                return error(node)
            }
        }
    }
    return gradient
}

/**
 * @param {object|object[]} size
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/css-shapes-1/#funcdef-basic-shape-circle}
 *
 * It aborts parsing when the size is specified with two <radial-radius> for
 * circle().
 */
function postParseRadialSize(size, node) {
    if (size.length === 2 && node.context.function?.definition.name === 'circle') {
        return error(node)
    }
    return size
}

/**
 * @param {object} random
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-random}
 *
 * It represents random() arguments in a comma separated list, with its default
 * optional values, to simplify further processing.
 */
function postParseRandom({ value: [options,, min,, max,, step], ...props }) {
    if (isOmitted(options)) {
        options = list([keyword('auto'), omitted], ' ', ['<random-value-sharing>'])
    }
    return { ...props, value: list([options, min, max, step], ',') }
}

/**
 * @param {object|object[][]} range
 * @param {object} node
 * @returns {SyntaxError|object[]}
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#descdef-counter-style-range}
 *
 * It aborts parsing when the range lower bound is lower than its higher bound.
 */
function postParseRange(range, node) {
    if (
        isList(range)
        && range.some(bounds =>
            bounds.every(bound => bound.types.includes('<integer>'))
            && bounds[1].value < bounds[0].value)
    ) {
        return error(node)
    }
    return range
}

/**
 * @param {object} round
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#funcdef-round}
 *
 * It represents round() arguments in a comma separated list, with its default
 * optional values, to simplify further processing.
 */
function postParseRound({ value: [strategy,, a,, b], ...props }) {
    if (isOmitted(strategy)) {
        strategy = keyword('nearest', ['<rounding-strategy>'])
    }
    if (isOmitted(b)) {
        b = number(1, ['<calc-value>'])
    }
    return { ...props, value: list([strategy, a, b], ',') }
}

/**
 * @param {object} integer
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-signed-integer}
 *
 * It aborts parsing the integer when its value is not an integer or is not
 * prefixed with `+` or `-`.
 */
function postParseSignedInteger(integer) {
    if (integer.sign && Number.isInteger(integer.value)) {
        return integer
    }
    return null
}

/**
 * @param {object} integer
 * @returns {object|null}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-signless-integer}
 *
 * It aborts parsing the integer when its value is not an integer or is prefixed
 * with `+` or `-`.
 */
function postParseSignlessInteger(integer) {
    if (!integer.sign && Number.isInteger(integer.value)) {
        return integer
    }
    return null
}

/**
 * @param {object} steps
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-easing-2/#funcdef-steps}
 *
 * It aborts parsing when the step count is too low.
 */
function postParseSteps(steps, node) {
    const { value: [{ value: count },, { value: position }] } = steps
    if (count < 1 || (count < 2 && position === 'jump-none')) {
        return error(node)
    }
    return steps
}

/**
 * @param {object} feature
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#typedef-style-feature}
 *
 * It aborts parsing when the feature is an unknown property or a declaration
 * whose value is either `revert` or `revert-layer`.
 */
function postParseStyleFeature(feature, node, { createContext, getDeclarationDefinition }) {
    const { types, value } = feature
    if (
        types[0] === '<ident-token>'
            ? getDeclarationDefinition(createContext('@style'), value)
            : !value.value?.startsWith?.('revert')
    ) {
        return feature
    }
    return error(node)
}

/**
 * @param {object} symbols
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#funcdef-symbols}
 *
 * It aborts parsing when symbols are missing for the specified symbol type.
 */
function postParseSymbols(symbols, node) {
    const { value: [{ value: type }, list] } = symbols
    if ((type === 'alphabetic' || type === 'numeric') && 1 === list.length) {
        return error(node)
    }
    return symbols
}

/**
 * @param {object|object[]} syntax
 * @param {object} node
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#descdef-property-syntax}
 * @see {@link https://drafts.csswg.org/css-values-5/#typedef-syntax}
 *
 * It aborts parsing when the syntax is a CSS-wide keyword for @property.
 */
function postParseSyntax(syntax, node) {
    if (
        node.context.rule?.definition.name === '@property'
        && cssWideKeywords.includes(serializeCSSComponentValue(syntax).toLowerCase())
    ) {
        return error(node)
    }
    return syntax
}

/**
 * @param {object} syntax
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.csswg.org/css-values-5/#typedef-syntax-string}
 *
 * It aborts parsing when the syntax is invalid or uses unsupported features of
 * the CSS value definition syntax.
 */
function postParseSyntaxString(syntax, node, parser) {
    return parser.parseCSSValue(syntax.value, '<syntax>', node.context) ?? error(node)
}

/**
 * @param {object} alignment
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-align}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-align-all}
 *
 * It aborts parsing when the alignment is not a single character string.
 */
function postParseTextAlign(alignment, node) {
    if (alignment.types.includes('<string>') && 1 < alignment.value.length) {
        return error(node)
    }
    return alignment
}

/**
 * @param {object} toggle
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-values-5/#funcdef-toggle}
 *
 * It aborts parsing when the toggle is nested in another toggle.
 */
function postParseToggle(toggle, node) {
    if (findContext('function', node, node => node.definition.name === 'toggle')) {
        return error(node)
    }
    return toggle
}

/**
 * @param {object[]} list
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-track-list}
 *
 * It represents the list as an <explicit-track-list> when all track sizes are
 * explicit, to simplify the serialization of `grid-template`.
 */
function postParseTrackList(list) {
    if (list[0].every(([, size]) => size.types.includes('<track-size>'))) {
        list.types.push('<explicit-track-list>')
    }
    return list
}

/**
 * @param {object[]} range
 * @param {object} node
 * @returns {SyntaxError|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#typedef-urange}
 *
 * It aborts parsing when the range:
 * - does not start with `U+` or `u+`
 * - has its start or end value that has 0 or more than 6 hexadecimal digits
 * - has its start and end values not separated with `-`
 * - has its start value greater than its end value
 * - has its end value greather than `10FFFF` (max. allowed code point)
 * - includes an invalid wildcard `?`
 *
 * It represents the range as a plain object with `start` and `end` properties.
 */
function postParseUnicodeRange(range, node) {
    const text = []
    for (const { end, start } of range.flat()) {
        const representation = node.input.source.slice(start, end)
        if (representation.toLowerCase() === 'u') {
            continue
        }
        text.push(...representation)
    }
    if (text.shift() !== '+') {
        return error(node)
    }
    let consumed = ''
    while (isHexadecimal(text[0])) {
        consumed += text.shift()
    }
    while (text[0] === '?') {
        consumed += text.shift()
    }
    const fromLength = consumed.length
    if (fromLength === 0 || 6 < fromLength) {
        return error(node)
    }
    const { length } = text
    const { types } = range
    if (consumed.endsWith('?')) {
        if (0 < length) {
            return error(node)
        }
        const to = Number(`0x${consumed.replaceAll('?', 'F')}`)
        if (MAXIMUM_CODE_POINT < to) {
            return error(node)
        }
        return { from: Number(`0x${consumed.replaceAll('?', '0')}`), to, types }
    }
    const from = Number(`0x${consumed}`)
    if (length === 0) {
        if (MAXIMUM_CODE_POINT < from) {
            return error(node)
        }
        return { from, to: from, types }
    }
    if (text.shift() !== '-') {
        return error(node)
    }
    consumed = ''
    while (isHexadecimal(text[0])) {
        consumed += text.shift()
    }
    const toLength = consumed.length
    if (0 === toLength || 6 < toLength || 0 < text.length || MAXIMUM_CODE_POINT < consumed || consumed < from) {
        return error(node)
    }
    return { from, to: Number(`0x${consumed}`), types }
}

/**
 * @param {object} name
 * @param {object} node
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.csswg.org/css-view-transitions-1/#propdef-view-transition-name}
 *
 * It aborts parsing when the name is a reserved keyword in the context.
 */
function postParseViewTransitionName(name, node) {
    return reserved.viewTransitionName.includes(name.value.toLowerCase()) ? error(node) : name
}

/**
 * @param {object[]} value
 * @param {object} node
 * @param {object} parser
 * @returns {SyntaxError|object|object[]}
 * @see {@link https://drafts.csswg.org/css-values-5/#whole-value}
 *
 * It aborts parsing when the value is invalid for the property.
 */
function postParseWholeValue(value, node, parser) {
    const { context } = node
    const { declaration: { definition } } = context
    if (isOmitted(value)) {
        return definition.name.startsWith('--') ? value : error(node)
    }
    return parser.parseCSSValue(value, definition, context) ?? error(node)
}

/**
 * @param {object} zero
 * @param {object} node
 * @returns {object}
 * @see {@link https://drafts.csswg.org/css-values-4/#angle-value}
 *
 * It aborts parsing zero when its value is not zero.
 *
 * It represents zero as an angle when it is accepted as an alternative (browser
 * conformance).
 */
function postParseZero(zero, { parent }) {
    if (zero.value !== 0) {
        return null
    }
    if (parent) {
        const { definition: { type, value } } = parent
        if (type === '|' || type === '||') {
            for (const { name } of value) {
                if (name === '<angle-percentage>') {
                    return angle(0, 'deg', [name])
                }
                if (name === '<angle>') {
                    return angle(0, 'deg')
                }
            }
        }
    }
    return zero
}

module.exports = {
    "<'animation-timeline'>": postParseAnimationTimeline,
    "<'border-radius'>": postParseBorderRadius,
    '<an+b>': postParseAnB,
    '<angle>': postParseDimension,
    '<animateable-feature>': postParseAnimateableFeature,
    '<calc-interpolate()>': postParseInterpolate,
    '<calc-product>': postParseCalcProduct,
    '<calc-sum>': postParseCalcSum,
    '<calc-value>': postParseCalcValue,
    '<color-interpolate()>': postParseInterpolate,
    '<color>': postParseColor,
    '<container-name>': postParseContainerNameType,
    '<counter-name>': postParseCounterName,
    '<counter-style-name>': postParseCounterStyleName,
    '<css-type>': postParseCSSType,
    '<custom-function-definition>': postParseCustomFunctionDefinition,
    '<custom-ident>': postParseCustomIdentifier,
    '<custom-property-name>': postParseCustomPropertyName,
    '<dashed-ident>': postParseDashedIdent,
    '<dashndashdigit-ident>': postParseDashNDashDigitIdentifier,
    '<decibel>': postParseDimension,
    '<family-name>': postParseFamilyName,
    '<first-valid()>': postParseFirstValid,
    '<flex>': postParseDimension,
    '<font-format>': postParseFontFormat,
    '<font-src-list>': postParseFontSourceList,
    '<forgiving-selector-list>': postParseForgivingSelectorList,
    '<frequency>': postParseDimension,
    '<function-parameter>': postParseFunctionParameter,
    '<grid-line>': postParseGridLine,
    '<hex-color>': postParseHexColor,
    '<id-selector>': postParseIDSelector,
    '<integer>': postParseInteger,
    '<interpolate()>': postParseInterpolate,
    '<keyframes-name>': postParseKeyframesName,
    '<keyword>': postParseKeyword,
    '<layer-name>': postParseLayerName,
    '<length>': postParseDimension,
    '<line-names>': postParseLineNames,
    '<media-query-list>': postParseMediaQueryList,
    '<media-type>': postParseMediaType,
    '<mf-name>': postParseMediaFeatureName,
    '<mf-plain>': postParseMediaFeaturePlain,
    '<mf-range>': postParseMediaFeatureRange,
    '<n-dimension>': postParseNDimension,
    '<ndash-dimension>': postParseNDashDimension,
    '<ndashdigit-dimension>': postParseNDashDigitDimension,
    '<ndashdigit-ident>': postParseNDashDigitIdentifier,
    '<ns-prefix>': postParseNSPrefix,
    '<number>': postParseNumeric,
    '<opentype-tag>': postParseOpenTypeTag,
    '<path()>': postParsePath,
    '<percentage>': postParseNumeric,
    '<polygon()>': postParsePath,
    '<pseudo-class-selector>': postParsePseudoClassSelector,
    '<pseudo-element-selector>': postParsePseudoElementSelector,
    '<radial-gradient-syntax>': postParseRadialGradient,
    '<radial-size>': postParseRadialSize,
    '<random()>': postParseRandom,
    '<resolution>': postParseDimension,
    '<round()>': postParseRound,
    '<semitones>': postParseDimension,
    '<signed-integer>': postParseSignedInteger,
    '<signless-integer>': postParseSignlessInteger,
    '<steps()>': postParseSteps,
    '<style-feature>': postParseStyleFeature,
    '<symbols()>': postParseSymbols,
    '<syntax-string>': postParseSyntaxString,
    '<syntax>': postParseSyntax,
    '<time>': postParseDimension,
    '<toggle()>': postParseToggle,
    '<track-list>': postParseTrackList,
    '<transform-interpolate()>': postParseInterpolate,
    '<urange>': postParseUnicodeRange,
    '<whole-value>': postParseWholeValue,
    '<zero>': postParseZero,
    'additive-symbols': postParseAdditiveSymbols,
    'border-radius': postParseBorderRadius,
    'color-scheme': postParseColorScheme,
    'components': postParseComponents,
    'container-name': postParseContainerNameProperty,
    'flow-into': postParseFlowInto,
    'glyph-orientation-vertical': postParseGlyphOrientationVertical,
    'grid-template-areas': postParseGridTemplateAreas,
    'paint-order': postParsePaintOrder,
    'range': postParseRange,
    'syntax': postParseSyntaxString,
    'text-align': postParseTextAlign,
    'text-align-all': postParseTextAlign,
    'view-transition-name': postParseViewTransitionName,
}
