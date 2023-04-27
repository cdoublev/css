
const { comma, notAll, revertLayer } = require('../values/defaults.js')
const { findLast, findParent } = require('../utils/context.js')
const { isColon, isWhitespace } = require('../values/validation.js')
const { isHex, isIdentifierCharacter, isWhitespace: isWhitespaceCharacter } = require('./tokenize.js')
const Stream = require('./stream.js')
const { aliases: mediaFeatureAliases } = require('../descriptors/compatibility.js')
const createError = require('../error.js')
const { createList } = require('../values/value.js')
const { keywords: cssWideKeywords } = require('../values/substitutions.js')
const nonTerminals = require('../values/definitions.js')
const pseudos = require('../values/pseudos.js')
const tokenize = require('./tokenize.js')

const MAXIMUM_CODE_POINT = 0x10FFFF
const legacyStringFontFormats = ['collection', 'opentype', 'truetype', 'woff', 'woff2']
const reservedContainerNames = ['and', 'none', 'not', 'or']
const reservedMediaTypes = ['and', 'layer', 'not', 'only', 'or']

/**
 * @param {object} node
 * @returns {Error}
 */
function error({ definition: { name, value } }) {
    return createError({ message: `invalid ${name ? `<${name}>` : `'${value}'`}`, type: SyntaxError })
}

/**
 * @param {object|object[]} notation
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 * @see {@link https://drafts.csswg.org/css-syntax-3/#anb-production}
 *
 * It aborts parsing when a white space is omitted between `+` and `n`.
 *
 * It represents the notation as a plain object with `a` and `b` properties.
 */
function postParseAnB(notation, { tree: { list } }, node) {
    const { representation, value } = notation
    const type = new Set(['an+b'])
    if (value === 'even') {
        return { representation, type, value: { a: 2, b: 0 } }
    }
    if (value === 'odd') {
        return { representation, type, value: { a: 2, b: 1 } }
    }
    let text = ''
    for (const component of (Array.isArray(notation) ? notation : [notation])) {
        const { omitted, value, representation } = component
        if (!omitted) {
            // Invalid white space between an optional `+` and `n`
            if (value === '+' && text === '' && isWhitespace(list.source.at(list.source.indexOf(component) + 1))) {
                return error(node)
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
 * It represents radii by replacing omitted radii with the corresponding radius.
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
 * @see {@link https://drafts.csswg.org/css-images-4/#typedef-angular-color-stop}
 *
 * It replaces a stop defined with two positions with an explicit stop with the
 * first position, and inserts the component values in the input list to parse
 * the next stop with the second position.
 */
function postParseColorStop(stop, { tree: { list } }) {
    const [color, positions] = stop
    if (positions.length === 2) {
        list.source.splice(list.index, 1, comma, color, positions.pop())
        list.reconsume()
    }
    return stop
}

/**
 * @param {object|object[]} name
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 * @see {@link https://drafts.csswg.org/css-contain-3/#propdef-container-name}
 * @see {@link https://drafts.csswg.org/css-contain-3/#typedef-container-name}
 *
 * It aborts parsing when name is for <'container-name'> and includes `none`, or
 * when it is a single name for <container-name> that is `none`.
 */
function postParseContainerName(name, parser, node) {
    if (node.definition.type === 'property') {
        return Array.isArray(name) && name.some(name => reservedContainerNames.includes(name.value))
            ? error(node)
            : name
    }
    return reservedContainerNames.includes(name.value)
        ? error(node)
        : name
}

/**
 * @param {object|object[]} display
 * @param {Parser} parser
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/css-display-4/#propdef-display}
 *
 * It replaces the display value with `revert-layer` when it is `none` and the
 * context is a keyframe rule.
 */
function postParseDisplay(display, parser) {
    if (parser.context?.definition.type === 'keyframe' && display.value === 'none') {
        return revertLayer
    }
    return display
}

/**
 * @param {object|object[]} name
 * @param {Parser} parser
 * @returns {object|object[]|null}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#family-name-value}
 * @see {@link https://drafts.csswg.org/css-speech-1/#valdef-voice-family-family-name}
 *
 * It invalidates the name when it matches a keyword reserved for `font-family`
 * or the prelude of `@font-feature-values`, or for `voice-family`.
 */
function postParseFamilyName(name, parser) {
    const reserved = parser.tree.root.definition.name === 'voice-family'
        ? [...nonTerminals['gender'].split(' | '), 'preserve']
        : nonTerminals['generic-family'].split(' | ')
    if (name.type.has('string') || 1 < name.length || !reserved.includes(name[0].value)) {
        return name
    }
    return null
}

/**
 * @param {object[]} tag
 * @returns {object[]|null}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#feature-tag-value}
 *
 * It aborts parsing when the tag has less or more than 4 characters or when it
 * includes a non-ASCII character.
 */
function postParseFeatureTagValue(tag, parser, node) {
    if (/^[\u0000-\u007F]{4}$/.test(tag[0].value)) {
        return tag
    }
    return error(node)
}

/**
 * @param {object|object[]} source
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object|object[]}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#font-face-src-parsing}
 *
 * It aborts parsing when the source is defined with a string representing an
 * unrecognized legacy format.
 *
 * It represents the source with the syntax of non-legacy formats.
 */
function postParseFontSource(source, parser, node) {
    if (Array.isArray(source)) {
        const [, { omitted, value: { type, value } }] = source
        if (!omitted && type.has('string')) {
            const [format, variations] = value.split('-')
            if (!legacyStringFontFormats.includes(format)) {
                return error(node)
            }
            const formatFn = {
                name: 'format',
                type: new Set(['function']),
                value: {
                    type: new Set(['ident', 'keyword', 'font-format']),
                    value: format,
                },
            }
            source.splice(1, 1, formatFn)
            if (variations) {
                const tech = {
                    type: new Set(['ident', 'keyword', 'font-tech']),
                    value: 'variations',
                }
                const techs = {
                    name: 'tech',
                    type: new Set(['function']),
                    value: createList([tech], ','),
                }
                source.splice(2, 1, techs)
            }
        }
    }
    return source
}

/**
 * @param {object[]} list
 * @param {Parser} parser
 * @param {Error|object} node
 * @see {@link https://drafts.csswg.org/css-fonts-4/#descdef-font-face-src}
 *
 * It aborts parsing when the list has no valid font source.
 *
 * It represents the list without invalid font sources.
 */
function postParseFontSourceList(list, parser, node) {
    list = list.filter(Boolean)
    return 0 < list.length ? list : error(node)
}

/**
 * @param {object[]} list
 * @param {Parser} parser
 * @returns {Error|object[]}
 *
 * It aborts parsing when the list includes invalid selectors but its parsing
 * is not forgiving.
 *
 * It represents the list without invalid selectors.
 */
function postParseForgivingSelectorList(list, parser, node) {
    const { length } = list
    list = list.filter(Boolean)
    if (list.length < length && parser.trees[0].root.definition.name === 'supports-condition') {
        return error(node)
    }
    return list
}

/**
 * @param {object|object[]} line
 * @returns {Error|object|object[]|null|undefined}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-grid-row-start-grid-line}
 *
 * It aborts parsing when the line includes `auto` or `span`, and another value.
 *
 * It invalidates the line when it is `auto` or `span`.
 */
function postParseGridLine(line, parser, node) {
    if (Array.isArray(line)) {
        const { omitted, value } = line.flat().at(-1)
        if (!omitted) {
            if (value === 'auto') {
                return error(node)
            }
            if (value === 'span') {
                return
            }
        }
        return line
    }
    const { type, value } = line
    if (type.has('custom-ident') && (value === 'auto' || value === 'span')) {
        return
    }
    return line
}

/**
 * @param {object|object[]} areas
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object|object[]}
 * @see {@link https://drafts.csswg.org/css-grid-2/#valdef-grid-template-areas-string}
 *
 * It aborts parsing when the areas are defined with:
 * - no cell
 * - a trash token
 * - a non-rectangular named area
 * - rows of non-equal lengths
 *
 * It represents the areas by collapsing null cell tokens and by joining cells
 * with a white space.
 */
function postParseGridTemplateAreas(areas, parser, node) {
    if (Array.isArray(areas)) {
        const strings = []
        const named = new Map()
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
            const [firstRow] = rows
            const { length: columnLength } = firstRow
            const [[startColumn]] = firstRow
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
 * It aborts parsing when the selector is an hexadecimal number.
 *
 * Ideally, <id-selector> would be defined as equal to <id> defined as a basic
 * data type corresponding to <hash-token> whose type is `id`.
 */
function postParseIDSelector(selector, parser, node) {
    return selector.type.has('id') ? selector : error(node)
}

/**
 * @param {object} name
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 * @see {@link https://drafts.csswg.org/css-animations-1/#typedef-keyframes-name}
 *
 * It aborts parsing when the name is `none`.
 *
 * It normalizes a custom identifier specified as a string.
 */
function postParseKeyframeName(name, parser, node) {
    const { type, value } = name
    if (value === 'none') {
        if (type.has('custom-ident')) {
            return error(node)
        }
    } else if (type.has('string')) {
        const ident = parser.parseValue(tokenize(new Stream(value)), '<custom-ident>')
        if (ident) {
            return ident
        }
    }
    return name
}

/**
 * @param {object} names
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 * @see {@link https://drafts.csswg.org/css-grid-2/#typedef-line-names}
 *
 * It aborts parsing when some name is `auto` or `span`.
 */
function postParseLineNames(names, parser, node) {
    return (names.value.some(({ value }) => value === 'auto' || value === 'span'))
        ? error(node)
        : names
}

/**
 * @param {object} name
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 *
 * It aborts parsing when the name is a CSS-wide keyword.
 */
function postParseLayerName(name, parser, node) {
    const [head, tail] = name
    if (cssWideKeywords.includes(head.value) || tail.some(([, name]) => cssWideKeywords.includes(name.value))) {
        return error(node)
    }
    return name
}

/**
 * @param {object} name
 * @returns {object}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-mf-name}
 *
 * It represents the aliased name with its new name.
 */
function postParseMediaFeatureName(name) {
    const { value } = name
    const lowercase = value.toLowerCase()
    const unprefixed = value.replace(/(min|max)-/, '')
    if (mediaFeatureAliases.has(unprefixed)) {
        const target = mediaFeatureAliases.get(unprefixed)
        if (lowercase === unprefixed) {
            name.value = target
        } else {
            name.value = `${lowercase.includes('min-') ? 'min' : 'max'}-${target}`
        }
    }
    return name
}

/**
 * @param {object} mix
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 *
 * It aborts parsing when the mix includes an invalid value for the property.
 */
function postParseMix(mix, parser, node) {
    const { tree: { root: { definition: { name } } } } = parser
    const { value: [,, start,, end] } = mix
    if (parser.parseDeclaration({ name, value: start }) && parser.parseDeclaration({ name, value: end })) {
        return mix
    }
    return error(node)
}

/**
 * @param {object[]} list
 * @param {Parser} [parser]
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom-1/#parse-a-media-query-list}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-query-list}
 * @see {@link https://github.com/w3c/csswg-drafts/issues/7040}
 *
 * It represents the list by replacing invalid media queries with `not all`.
 */
function postParseMediaQueryList(list) {
    return list.map(media => media ?? notAll)
}

/**
 * @param {object} type
 * @returns {Error|object}
 * @see {@link https://drafts.csswg.org/mediaqueries-5/#typedef-media-type}
 *
 * It aborts parsing when the type is a reserved keyword.
 */
function postParseMediaType(type, parser, node) {
    return reservedMediaTypes.includes(type.value) ? error(node) : type
}

/**
 * @param {object[]} prefix
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-ns-prefix}
 *
 * It aborts parsing when the prefix has not been declared.
 */
function postParseNSPrefix(prefix, parser, node) {
    const [{ omitted, value }] = prefix
    if (omitted || parser.namespaces.includes(value)) {
        return prefix
    }
    return error(node)
}

/**
 * @param {object} node
 * @returns {*[]}
 *
 * It returns the type and definition of a pseudo-element.
 */
function getPseudoElementEntry({ value: [, [, { name, type, value }]] }) {
    if (type.has('function')) {
        const type = `${name}()`
        return [type, pseudos.elements.functions[type]]
    }
    return [value, pseudos.elements.identifiers[value]]
}

/**
 * @param {string} type
 * @param {ParseTree} tree
 * @returns {boolean}
 *
 * It returns whether the pseudo-class is not has() nested in has(), and whether
 * it is allowed to qualify a pseudo-element.
 */
function isValidPseudoClass(type, tree) {
    if (pseudos.userActions.includes(type) || pseudos.logical[type]) {
        return true
    }
    // :has() nested in :has()
    if (type === 'has()' && findParent(tree, tree => tree.list.current.name === 'has')) {
        return false
    }
    // Pseudo-class qualifying pseudo-element
    const pseudoElement = findLast(
        tree,
        node => node.definition.name === 'pseudo-element-selector' && node.status === 'matched',
        node => node.definition.name === 'subclass-selector')
    if (pseudoElement) {
        const [parent, { classes, originating, structured }] = getPseudoElementEntry(pseudoElement)
        if (pseudos.indexes.includes(type)) {
            return pseudos.originated.includes(parent) || parent === 'part()'
        }
        if (type === 'empty' || type === 'has()') {
            return (originating || structured) && parent !== 'slotted()'
        }
        return classes?.includes(type)
    }
    return true
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object[]|null}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-class-selector}
 *
 * It aborts parsing when the selector:
 * - is an unrecognized pseudo class identifier
 * - is not allowed in the context
 * - has an invalid argument
 *
 * It invalidates the selector when it is a legacy pseudo element identifier.
 */
function postParsePseudoClassSelector(selector, parser, node) {
    const { tree } = parser
    const { list } = tree
    // Pseudo-element
    if (isColon(list.prev(1, 1))) {
        return selector
    }
    const [colon, pseudo] = selector
    const { name, value } = pseudo
    // Functional pseudo-class
    if (name) {
        const lowercase = name.toLowerCase()
        const type = `${lowercase}()`
        const { classes: { functions: { [type]: definition } } } = pseudos
        if (definition && isValidPseudoClass(type, tree)) {
            const value = parser.parseValue(list.current.value, definition)
            if (value) {
                const fn = { ...pseudo, name: lowercase, value }
                return createList([colon, fn], '', ['pseudo-class-selector'])
            }
        }
        return error(node)
    }
    // Pseudo-class identifier
    let lowercase = value.toLowerCase()
    if (pseudos.classes.aliases.has(lowercase)) {
        lowercase = pseudos.classes.aliases.get(lowercase)
    }
    if (pseudos.classes.identifiers.includes(lowercase) && isValidPseudoClass(lowercase, tree)) {
        const identifier = { ...pseudo, value: lowercase }
        return createList([colon, identifier], '', ['pseudo-class-selector'])
    }
    return null
}

/**
 * @param {string} type
 * @param {ParseTree} tree
 * @returns {boolean}
 *
 * It returns whether the pseudo-element type is a valid sub-pseudo-element.
 */
function isValidPseudoElement(type, tree) {
    const origin = findLast(
        tree.nodes,
        ({ definition, status }) => status === 'matched' && definition.name === 'pseudo-element-selector',
        node => node.definition.name === 'coumpound-selector')
    if (origin) {
        if (type.startsWith('-webkit-')) {
            return false
        }
        return getPseudoElementEntry(origin)[1].originating?.includes(type)
    }
    return true
}

/**
 * @param {object[]} selector
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object[]}
 * @see {@link https://drafts.csswg.org/selectors-4/#typedef-pseudo-element-selector}
 *
 * It aborts parsing when the selector:
 * - is unrecognized
 * - is not allowed in the context
 * - has an invalid argument
 *
 * It represents a legacy pseudo-element as a non-legacy pseudo-element.
 */
function postParsePseudoElementSelector(selector, parser, node) {
    if (selector.type.has('legacy-pseudo-element-selector')) {
        const [colon, pseudo] = selector
        const pseudoClass = createList([colon, pseudo], '', ['pseudo-class-selector'])
        selector = createList([colon, pseudoClass], '', ['pseudo-element-selector'])
    }
    const { tree, trees } = parser
    const [, [colon, pseudo]] = selector
    const { name, value } = pseudo
    // Functional pseudo-element
    if (name) {
        const lowercase =  name.toLowerCase()
        const type = `${lowercase}()`
        const { elements: { functions: { [type]: definition } } } = pseudos
        if (definition && isValidPseudoElement(type, tree)) {
            const value = parser.parseValue(tree.list.current.value, definition.value)
            if (value) {
                const fn = { ...pseudo, name: lowercase, value }
                const pseudoClass = createList([colon, fn], '', ['pseudo-class-selector'])
                return createList([colon, pseudoClass], '', ['pseudo-element-selector'])
            }
        }
        return error(node)
    }
    // Pseudo-element identifier
    const lowercase = value.toLowerCase()
    const isDefined = pseudos.elements.identifiers[lowercase]
        ?? (lowercase.startsWith('-webkit-') && trees[0].root.definition.name !== 'supports-condition')
    if (isDefined && isValidPseudoElement(lowercase, tree)) {
        const identifier = { ...pseudo, value: lowercase }
        const pseudoClass = createList([colon, identifier], '', ['pseudo-class-selector'])
        return createList([colon, pseudoClass], '', ['pseudo-element-selector'])
    }
    return error(node)
}

/**
 * @param {object} gradient
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 * @see {@link https://drafts.csswg.org/css-images-4/#funcdef-radial-gradient}
 *
 * It aborts parsing when the shape of the gradient is a circle specified with
 * two lengths or percentages, or an ellipse specified with a single length.
 */
function postParseRadialGradient(gradient, parser, node) {
    const { value: [configuration] } = gradient
    if (!configuration.omitted) {
        const [aspect] = configuration
        if (!aspect.omitted) {
            const [{ value }, size] = aspect
            if ((value === 'circle' && Array.isArray(size)) || (value === 'ellipse' && size.type.has('length'))) {
                return error(node)
            }
        }
    }
    return gradient
}

/**
 * @param {object} steps
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 * @see {@link https://drafts.csswg.org/css-easing-2/#funcdef-step-easing-function-steps}
 *
 * It aborts parsing when step count is too low.
 */
function postParseSteps(steps, parser, node) {
    const { value: [{ value: count },, { value: position }] } = steps
    if (count < 1 || (count < 2 && position === 'jump-none')) {
        return error(node)
    }
    return steps
}

/**
 * @param {object} toggle
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
 *
 * It aborts parsing when the toggled values include an invalid value for the
 * property.
 */
function postParseToggle(toggle, parser, node) {
    const { tree: { root: { definition: { name } } } } = parser
    const { value: [head, tail] } = toggle
    const values = [head, ...tail.map(([, value]) => value)]
    if (values.every(value => parser.parseDeclaration({ name, value }))) {
        return toggle
    }
    return error(node)
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
    if (list[0].every(([, size]) => size.type.has('track-size'))) {
        list.type.add('explicit-track-list')
    }
    return list
}

/**
 * @param {object[]} range
 * @param {Parser} parser
 * @param {object} node
 * @returns {Error|object}
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
function postParseUnicodeRange(range, parser, node) {
    const text = []
    for (const component of range.flat()) {
        if (component.representation.toLowerCase() === 'u') {
            continue
        }
        text.push(...component.representation)
    }
    if (text.shift() !== '+') {
        return error(node)
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
        return error(node)
    }
    const { length } = text
    const { type } = range
    if (consumed.endsWith('?')) {
        if (0 < length) {
            return error(node)
        }
        const end = Number(`0x${consumed.replaceAll('?', 'F')}`)
        if (MAXIMUM_CODE_POINT < end) {
            return error(node)
        }
        return { end, start: Number(`0x${consumed.replaceAll('?', '0')}`), type }
    }
    const start = Number(`0x${consumed}`)
    if (length === 0) {
        if (MAXIMUM_CODE_POINT < start) {
            return error(node)
        }
        return { end: start, start, type }
    }
    if (text.shift() !== '-') {
        return error(node)
    }
    consumed = ''
    while (isHex(text[0])) {
        consumed += text.shift()
    }
    const { length: endLength } = consumed
    if (0 === endLength || 6 < endLength || 0 < text.length || MAXIMUM_CODE_POINT < consumed || consumed < start) {
        return error(node)
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
    'container-name': postParseContainerName,
    'display': postParseDisplay,
    'family-name': postParseFamilyName,
    'feature-tag-value': postParseFeatureTagValue,
    'font-src': postParseFontSource,
    'font-src-list': postParseFontSourceList,
    'forgiving-selector-list': postParseForgivingSelectorList,
    'grid-line': postParseGridLine,
    'grid-template-areas': postParseGridTemplateAreas,
    'id-selector': postParseIDSelector,
    'keyframes-name': postParseKeyframeName,
    'layer-name': postParseLayerName,
    'line-names': postParseLineNames,
    'linear-color-stop': postParseColorStop,
    'media-query-list': postParseMediaQueryList,
    'media-type': postParseMediaType,
    'mf-name': postParseMediaFeatureName,
    'mix()': postParseMix,
    'ns-prefix': postParseNSPrefix,
    'pseudo-class-selector': postParsePseudoClassSelector,
    'pseudo-element-selector': postParsePseudoElementSelector,
    'radial-gradient()': postParseRadialGradient,
    'repeating-radial-gradient()': postParseRadialGradient,
    'steps()': postParseSteps,
    'toggle()': postParseToggle,
    'track-list': postParseTrackList,
    'urange': postParseUnicodeRange,
}
