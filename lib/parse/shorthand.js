
const { auto, column, discard, justify, none, one, row, start, webkitDiscard, zero, zeroPx } = require('../values/defaults.js')
const { hasSubstitution, isOmitted } = require('../values/validation.js')
const { createList } = require('../values/value.js')
const properties = require('../properties/definitions.js')
const shorthands = require('../properties/shorthands.js')
const whiteSpace = require('../values/white-space.js')

const borderTypes = ['line-width', 'line-style', 'color']
const { resetOnly } = shorthands

/**
 * @param {string[]} longhands
 * @returns {Map}
 */
function getInitialLonghandDeclarations(longhands) {
    return new Map(longhands.map(longhand => [longhand, properties[longhand].initial.parsed]))
}

/**
 * @param {object} value
 * @param {string[]} longhands
 * @returns {Map}
 */
function setLonghands(value, longhands) {
    return new Map(longhands.map(longhand => [longhand, value]))
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 *
 * It assigns each longhand the corresponding value in the list, or its initial
 * value if omitted.
 */
function parseLonghandsByIndex(list, longhands) {
    return new Map(longhands.map((longhand, index) => {
        let value = list[index]
        if (isOmitted(value)) {
            value = properties[longhand].initial.parsed
        }
        return [longhand, value]
    }))
}

/**
 * @param {object[][]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-animations-1/#propdef-animation}
 * @see {@link https://drafts.csswg.org/css-transitions-1/#propdef-transition}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-view-timeline}
 */
function parseRepeatedLonghands(list, longhands) {
    const declarations = new Map(longhands.map(longhand => [longhand, createList([], ',')]))
    list.forEach(repetition =>
        longhands.forEach((longhand, index) => {
            const value = repetition[index]
            declarations
                .get(longhand)
                .push(value.omitted ? properties[longhand].initial.parsed[0] : value)
        }))
    return declarations
}

/**
 * @param {object[][]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-background}
 *
 * It assigns each background layer value to the corresponding longhand values,
 * setting an omitted `background-clip` value to the `background-origin` value.
 */
function parseBackground(list, longhands) {
    const [bgLayers, [bgColor, ...finalBgLayer]] = list
    const layers = bgLayers.omitted ? [finalBgLayer] : [...bgLayers[0], finalBgLayer]
    const declarations = new Map(longhands.map(longhand =>
        longhand === 'background-color'
            ? [longhand, bgColor.omitted ? properties[longhand].initial.parsed : bgColor]
            : [longhand, createList([], ',')]))
    layers.forEach(([image, positionSize, repeat, attachment, origin, clip]) => {
        let position
        let size
        if (positionSize.omitted) {
            position = size = { omitted: true }
        } else {
            [position, size] = positionSize
            if (!size.omitted) {
                [, size] = size
            }
        }
        longhands.forEach(longhand => {
            if (longhand === 'background-color') {
                return
            }
            let value
            switch (longhand) {
                case 'background-image':
                    value = image
                    break
                case 'background-position':
                    value = position
                    break
                case 'background-size':
                    value = size
                    break
                case 'background-repeat':
                    value = repeat
                    break
                case 'background-attachment':
                    value = attachment
                    break
                case 'background-origin':
                    value = origin.omitted ? clip : origin
                    break
                case 'background-clip':
                    value = clip.omitted ? origin : clip
                    break
            }
            declarations.get(longhand).push(value.omitted ? properties[longhand].initial.parsed[0] : value)
        })
    })
    return declarations
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @param {number} sides
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-block}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-inline}
 */
function parseBorder(list, longhands, sides) {
    const length = sides * 3
    return new Map(longhands.map((longhand, index) => {
        if (index < length) {
            const typeIndex = Math.floor((index / sides) % 3)
            const type = borderTypes.at(typeIndex)
            const value = list.find(component => component.type.has(type)) ?? properties[longhand].initial.parsed
            return [longhand, value]
        }
        return [longhand, properties[longhand].initial.parsed]
    }))
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-image}
 */
function parseBorderImage(list, longhands) {
    return list.reduce(
        function setBorderImageLonghand(values, value) {
            const { omitted, type } = value
            if (!omitted) {
                const longhand = [...type].at(-1)
                if (longhand?.startsWith('border-image')) {
                    values.set(longhand, value)
                } else if (Array.isArray(value)) {
                    value.reduce(setBorderImageLonghand, values)
                }
            }
            return values
        },
        getInitialLonghandDeclarations(longhands))
}

/**
 * @param {object[][]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
 */
function parseBorderRadius(list, longhands) {
    const [horizontal, vertical] = list
    return parseLonghandsByIndex(
        horizontal.map((radius, index) => createList([radius, vertical[index]])),
        longhands)
}

/**
 * @param {object[]} list
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-contain-3/#propdef-container}
 */
function parseContainer([name, type]) {
    return new Map([
        ['container-name', name],
        ['container-type', type.omitted ? properties['container-type'].initial.parsed : type[1]],
    ])
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-corners}
 */
function parseCorners([shape, radius], longhands) {
    if (shape.omitted) {
        shape = properties['corner-shape'].initial.parsed
    }
    radius = radius.omitted
        ? getInitialLonghandDeclarations(longhands.slice(1))
        : parseBorderRadius(radius, longhands.slice(1))
    return radius.set('corner-shape', shape)
}

/**
 * @param {object|object[]} list
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-flexbox-1/#propdef-flex}
 */
function parseFlex(list) {
    if (Array.isArray(list)) {
        const [growShrink, basis] = list
        if (basis.omitted) {
            const [grow, shrink] = growShrink
            return new Map([
                ['flex-basis', zeroPx],
                ['flex-grow', grow],
                ['flex-shrink', shrink.omitted ? one : shrink],
            ])
        }
        if (growShrink.omitted) {
            return new Map([
                ['flex-basis', basis],
                ['flex-grow', one],
                ['flex-shrink', one],
            ])
        }
        const [grow, shrink] = growShrink
        return new Map([
            ['flex-basis', basis],
            ['flex-grow', grow],
            ['flex-shrink', shrink],
        ])
    }
    // none
    return new Map([['flex-basis', auto], ['flex-grow', zero], ['flex-shrink', zero]])
}

/**
 * @param {object|object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font}
 */
function parseFont(list, longhands) {
    const declarations = getInitialLonghandDeclarations(longhands)
    if (Array.isArray(list)) {
        const [optionals, size, lineHeight, family] = list
        declarations.set('font-size', size)
        declarations.set('font-family', family)
        if (!lineHeight.omitted) {
            declarations.set('line-height', lineHeight[1])
        }
        if (!optionals.omitted) {
            const [style, variant, weight, stretch] = optionals
            if (!style.omitted) {
                declarations.set('font-style', style)
            }
            if (!variant.omitted) {
                shorthands.get('font-variant').forEach(longhand => declarations.set(longhand, variant))
            }
            if (!weight.omitted) {
                declarations.set('font-weight', weight)
            }
            if (!stretch.omitted) {
                declarations.set('font-stretch', stretch)
            }
        }
    } else {
        declarations.set('font-family', list)
    }
    return declarations
}

/**
 * @param {object|object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-synthesis}
 */
function parseFontSynthesis(list, longhands) {
    return Array.isArray(list)
        ? parseLonghandsByIndex(list.map(component => component.omitted ? none : auto), longhands)
        : setLonghands(list, longhands)
}

/**
 * @param {object|object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-variant}
 */
function parseFontVariant(list, longhands) {
    if (Array.isArray(list)) {
        return parseLonghandsByIndex(list, longhands)
    }
    const declarations = getInitialLonghandDeclarations(longhands)
    const { value } = list
    if (value === 'normal') {
        return declarations
    }
    // none
    return declarations.set('font-variant-ligatures', none)
}

/**
 * @param {object|object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid}
 */
function parseGrid(list, longhands) {
    const declarations = getInitialLonghandDeclarations(longhands)
    if (list.value === 'none') {
        return declarations
    }
    if (list.type.has('grid-template')) {
        return new Map([...declarations, ...parseGridTemplate(list)])
    }
    const [head, ...tail] = list
    if (head.type.has('grid-template-rows')) {
        const [, [, dense], columns] = tail
        return new Map([
            ...declarations,
            ['grid-template-rows', head],
            ['grid-auto-flow', createList([column, dense])],
            ['grid-auto-rows', properties['grid-auto-rows'].initial.parsed],
            ['grid-auto-columns', columns.omitted ? auto : columns],
        ])
    }
    const [, dense] = head
    const [rows,, columns] = tail
    return new Map([
        ...declarations,
        ['grid-template-columns', columns],
        ['grid-auto-flow', createList([row, dense])],
        ['grid-auto-rows', rows.omitted ? auto : rows],
        ['grid-auto-columns', properties['grid-auto-columns'].initial.parsed],
    ])
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-area}
 */
function parseGridArea(list, longhands) {
    const [head, tail] = list
    const lines = [head]
    let index = -1
    while (++index < 3) {
        const line = tail[index]
        if (line) {
            lines.push(line[1])
            continue
        }
        const opposite = index < 2 ? head : lines[1]
        lines.push(opposite.type.has('ident') ? opposite : auto)
    }
    return parseLonghandsByIndex(lines, longhands)
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-row}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-column}
 */
function parseGridLine(list, longhands) {
    const [start, end] = list
    return parseLonghandsByIndex([start, end.omitted ? start : end[1]], longhands)
}

/**
 * @param {object|object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-template}
 */
function parseGridTemplate(list, longhands) {
    if (list.value === 'none') {
        return getInitialLonghandDeclarations(longhands)
    }
    const [head, ...tail] = list
    if (head.type.has('grid-template-rows')) {
        const [, columns] = tail
        return new Map([
            ['grid-template-areas', none],
            ['grid-template-columns', columns],
            ['grid-template-rows', head],
        ])
    }
    const [columns] = tail
    const rows = []
    const areas = []
    let lineNames
    for (const [start, string, size, end] of head) {
        areas.push(string)
        if (!start.omitted) {
            if (!lineNames || lineNames.omitted) {
                lineNames = start
            } else {
                lineNames.value.push(...start.value)
            }
        }
        rows.push(createList([lineNames, size.omitted ? auto : size]))
        lineNames = end
    }
    return new Map([
        ['grid-template-areas', createList(areas)],
        ['grid-template-columns', columns.omitted ? none : columns[1]],
        ['grid-template-rows', createList([createList(rows), lineNames], ' ', ['track-list', 'explicit-track-list'])],
    ])
}

/**
 * @param {object|object[]} list
 * @param {string[]} longhands
 * @param {boolean} [legacy]
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-overflow-3/#propdef-line-clamp}
 */
function parseLineClamp(list, longhands, legacy = false) {
    if (list.value === 'none') {
        return getInitialLonghandDeclarations(longhands)
    }
    const [maxLines, blockEllipsis] = list
    return new Map([
        ['block-ellipsis', (blockEllipsis.omitted || legacy) ? auto : blockEllipsis],
        ['continue', legacy ? webkitDiscard : discard],
        ['max-lines', maxLines],
    ])
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-list-style}
 */
function parseListStyle(list, longhands) {
    const [position, image, type] = list
    if (image.value === 'none' && type.omitted) {
        return new Map([
            ['list-style-image', image],
            ['list-style-position', position.omitted ? properties['list-style-position'].initial.parsed : position],
            ['list-style-type', image],
        ])
    }
    return parseLonghandsByIndex(list, longhands)
}

/**
 * @param {object[][]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask}
 */
function parseMask(list, longhands) {
    const positionIndex = longhands.indexOf('mask-position')
    const { mask } = resetOnly
    const declarations = new Map(longhands.map(longhand => [
        longhand,
        mask.includes(longhand)
            ? properties[longhand].initial.parsed
            : createList([], ',')
    ]))
    list.forEach((layer, layerIndex) => {
        const [, positionSize] = layer
        if (positionSize.omitted) {
            layer.splice(positionIndex, 1, positionSize, positionSize)
        } else {
            const [position, size] = positionSize
            layer.splice(positionIndex, 1, position, size.omitted ? size : size[1])
        }
        longhands.forEach((longhand, longhandIndex) => {
            if (mask.includes(longhand)) {
                return
            }
            let value = layer[longhandIndex]
            if (value.omitted) {
                value = longhand === 'mask-clip'
                    ? declarations.get('mask-origin')[layerIndex]
                    : properties[longhand].initial.parsed[0]
            }
            declarations.get(longhand).push(value)
        })
    })
    return declarations
}

/**
 * @param {object[][]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask-border}
 */
function parseMaskBorder(list, longhands) {
    return list.reduce(
        function setMaskBorderLonghand(values, value) {
            const { omitted, type } = value
            if (!omitted) {
                const longhand = [...type].at(-1)
                if (longhand?.startsWith('mask-border')) {
                    values.set(longhand, value)
                } else if (Array.isArray(value)) {
                    value.reduce(setMaskBorderLonghand, values)
                }
            }
            return values
        },
        getInitialLonghandDeclarations(longhands))
}

/**
 * @param {object[][]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.fxtf.org/motion-1/#propdef-offset}
 */
function parseOffset([head, anchor], longhands) {
    return parseLonghandsByIndex(anchor.omitted ? head.flat(3) : [head, anchor[1]].flat(3), longhands)
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-place-content}
 */
function parsePlaceContent([align, justify], longhands) {
    if (justify.omitted) {
        justify = align.type.has('baseline-position') ? start : align
    }
    return parseLonghandsByIndex([align, justify], longhands)
}

/**
 * @param {object[]} list
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-place-items}
 */
function parsePlaceItems([align, justify], longhands) {
    if (justify.omitted && justify.value !== 'legacy') {
        justify = align
    }
    return parseLonghandsByIndex([align, justify], longhands)
}

/**
 * @param {object} component
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-align}
 */
function parseTextAlign(component, longhands) {
    switch (component.value) {
        case 'justify-all':
            return parseLonghandsByIndex([justify, justify], longhands)
        case 'match-parent':
            return parseLonghandsByIndex([component, component], longhands)
        default:
            return parseLonghandsByIndex([component, auto], longhands)
    }
}

/**
 * @param {object} keyword
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-white-space}
 */
function parseWhiteSpace({ value }, longhands) {
    return parseLonghandsByIndex(whiteSpace.get(value), longhands)
}

/**
 * @param {object[]} list
 * @param {number} [sides]
 * @returns {object[]}
 *
 * It normalizes implicit side value(s) into explicit side value(s).
 */
function parseSides(list, sides = 4) {
    let { length } = list
    while (length < sides) {
        list.push(list[Math.max(0, length++ - 2)])
    }
    return list
}

/**
 * @param {object|*[]} list
 * @param {string} shorthand
 * @returns {Map}
 *
 * It expands a list of component values into an object mapping each longhand to
 * the corresponding component value(s).
 */
function parseShorthand(list, shorthand) {
    const longhands = shorthands.get(shorthand)
    if (hasSubstitution(list)) {
        list.pending = true
        return setLonghands(list, longhands)
    }
    if (list.type.has('css-wide-keyword')) {
        return setLonghands(list, longhands)
    }
    switch (shorthand) {
        case '-webkit-line-clamp':
            return parseLineClamp(list, longhands, true)
        case 'animation':
        case 'transition':
        case 'view-timeline':
            return parseRepeatedLonghands(list, longhands)
        case 'background':
            return parseBackground(list, longhands)
        case 'border':
            return parseBorder(list, longhands, 4)
        case 'border-block':
        case 'border-inline':
            return parseBorder(list, longhands, 2)
        case 'border-block-color':
        case 'border-block-style':
        case 'border-block-width':
        case 'border-color':
        case 'border-inline-color':
        case 'border-inline-style':
        case 'border-inline-width':
        case 'border-style':
        case 'border-width':
        case 'contain-intrinsic-size':
        case 'cue':
        case 'gap':
        case 'inset':
        case 'inset-block':
        case 'inset-inline':
        case 'margin':
        case 'margin-block':
        case 'margin-inline':
        case 'overflow':
        case 'overscroll-behavior':
        case 'padding':
        case 'padding-block':
        case 'padding-inline':
        case 'place-self':
        case 'rest':
        case 'scroll-margin':
        case 'scroll-margin-block':
        case 'scroll-margin-inline':
        case 'scroll-padding':
        case 'scroll-padding-block':
        case 'scroll-padding-inline':
        case 'scroll-start':
            return parseLonghandsByIndex(parseSides(list), longhands)
        case 'border-image':
            return parseBorderImage(list, longhands)
        case 'border-radius':
            return parseBorderRadius(list, longhands)
        case 'container':
            return parseContainer(list)
        case 'corners':
            return parseCorners(list, longhands)
        case 'flex':
            return parseFlex(list, longhands)
        case 'font':
            return parseFont(list, longhands)
        case 'font-variant':
            return parseFontVariant(list, longhands)
        case 'font-synthesis':
            return parseFontSynthesis(list, longhands)
        case 'grid':
            return parseGrid(list, longhands)
        case 'grid-area':
            return parseGridArea(list, longhands)
        case 'grid-column':
        case 'grid-row':
            return parseGridLine(list, longhands)
        case 'grid-template':
            return parseGridTemplate(list, longhands)
        case 'line-clamp':
            return parseLineClamp(list, longhands)
        case 'list-style':
            return parseListStyle(list, longhands)
        case 'mask-border':
            return parseMaskBorder(list, longhands)
        case 'marker':
            return setLonghands(list, longhands)
        case 'mask':
            return parseMask(list, longhands)
        case 'offset':
            return parseOffset(list, longhands)
        case 'place-content':
            return parsePlaceContent(list, longhands)
        case 'place-items':
            return parsePlaceItems(list, longhands)
        case 'text-align':
            return parseTextAlign(list, longhands)
        case 'white-space':
            return parseWhiteSpace(list, longhands)
        default:
            return parseLonghandsByIndex(list, longhands)
    }
}

module.exports = parseShorthand
