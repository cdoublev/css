
import * as whiteSpace from '../values/white-space.js'
import {
    auto,
    collapse,
    column,
    justify,
    noAutospace,
    noRepeat,
    none,
    one,
    repeat,
    row,
    spaceAll,
    spacingTrim,
    start,
    transparent,
    webkitLegacy,
    zero,
    zeroPx,
} from '../values/defaults.js'
import { isList, isOmitted } from '../utils/value.js'
import { keyword, list, omitted } from '../values/value.js'
import { keywords as cssWideKeywords } from '../values/substitutions.js'
import properties from '../properties/definitions.js'
import shorthands from '../properties/shorthands.js'

const borderTypes = ['<line-width>', '<line-style>', '<color>']

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
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 *
 * It assigns each longhand the corresponding value in the list, or its initial
 * value if it is omitted.
 */
function parseLonghandsByIndex(values, longhands) {
    return new Map(longhands.map((longhand, index) => {
        let value = values[index]
        if (!value || isOmitted(value)) {
            value = properties[longhand].initial.parsed
        }
        return [longhand, value]
    }))
}

/**
 * @param {object[][]} lists
 * @param {string[]} longhands
 * @returns {Map}
 */
function parseCoordinatedValueList(lists, longhands) {
    const declarations = new Map(longhands.map(longhand => [longhand, list([], ',')]))
    lists.forEach(list =>
        longhands.forEach((longhand, index) => {
            const value = list[index]
            declarations
                .get(longhand)
                .push(isOmitted(value) ? properties[longhand].initial.parsed[0] : value)
        }))
    return declarations
}

/**
 * @param {object[][]} animations
 * @param {string[]} longhands
 * @param {string[]} resetOnly
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-animations-1/#propdef-animation}
 */
function parseAnimation(animations, longhands, resetOnly) {
    const declarations = parseCoordinatedValueList(animations, longhands)
    resetOnly.forEach(longhand => declarations.set(longhand, properties[longhand].initial.parsed))
    return declarations
}

/**
 * @param {object[][]} animations
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-animation-range}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-timeline-trigger-exit-range}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-timeline-trigger-range}
 */
function parseAnimationRange(ranges, longhands) {
    return parseCoordinatedValueList(
        ranges.map(range => parseAnimationRangeValue(range, longhands.at(-1))),
        longhands)
}

/**
 * @param {object[]} boundaries
 * @param {string} endType
 * @returns {object[]}
 */
function parseAnimationRangeValue(boundaries, endType) {
    const [start, end] = boundaries
    if (isList(start) && isOmitted(end)) {
        return list([start, list([start[0], omitted], ' ', [endType])])
    }
    return boundaries
}

/**
 * @param {object[][]} layers
 * @param {string[]} longhands
 * @param {string[]} resetOnly
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#propdef-background}
 *
 * It assigns each background layer value to the corresponding longhand values,
 * setting an omitted `background-clip` value to the `background-origin` value.
 */
function parseBackground(layers, longhands, resetOnly) {
    [layers,, final] = layers
    const color = final.pop()
    const declarations = new Map(longhands.map(longhand =>
        longhand === 'background-color'
            ? [longhand, isOmitted(color) ? properties[longhand].initial.parsed : color]
            : [longhand, list([], ',')]))
    resetOnly.forEach(longhand => declarations.set(longhand, properties[longhand].initial.parsed))
    layers = isOmitted(layers) ? [final] : [...layers, final]
    layers.forEach(([image, positionSize, repeat, attachment, origin, clip]) => {
        let position
        let size
        if (isOmitted(positionSize)) {
            position = size = omitted
        } else {
            [position, size] = positionSize
            if (!isOmitted(size)) {
                size = size[1]
            }
        }
        longhands.forEach(longhand => {
            if (longhand === 'background-color') {
                return
            }
            if (longhand === 'background-repeat-x') {
                if (isOmitted(repeat)) {
                    const initial = properties['background-repeat-x'].initial.parsed[0]
                    declarations.get('background-repeat-x').push(initial)
                    declarations.get('background-repeat-y').push(initial)
                } else {
                    repeat = parseBackgroundRepeat([repeat])
                    declarations.get('background-repeat-x').push(repeat.get('background-repeat-x')[0])
                    declarations.get('background-repeat-y').push(repeat.get('background-repeat-y')[0])
                }
                return
            }
            if (longhand === 'background-repeat-y') {
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
                case 'background-attachment':
                    value = attachment
                    break
                case 'background-origin':
                    value = isOmitted(origin) && clip.types.includes('<visual-box>') ? clip : origin
                    break
                case 'background-clip':
                    value = isOmitted(clip) ? origin : clip
                    break
            }
            declarations.get(longhand).push(isOmitted(value) ? properties[longhand].initial.parsed[0] : value)
        })
    })
    return declarations
}

/**
 * @param {object[]} values
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-4/#background-repeat}
 */
function parseBackgroundRepeat(values) {
    const x = []
    const y = []
    values.forEach(style => {
        if (style.value === 'repeat-x') {
            x.push(repeat)
            y.push(noRepeat)
        } else if (style.value === 'repeat-y') {
            x.push(noRepeat)
            y.push(repeat)
        } else {
            x.push(style[0])
            y.push(style[1] ?? style[0])
        }
    })
    return new Map([['background-repeat-x', list(x, ',')], ['background-repeat-y', list(y, ',')]])
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @param {number} sides
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-block}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-inline}
 */
function parseBorder(values, longhands, sides) {
    const length = sides * 3
    return new Map(longhands.map((longhand, index) => {
        if (index < length) {
            const typeIndex = Math.floor((index / sides) % 3)
            const type = borderTypes.at(typeIndex)
            const value = values.find(value => value.types.includes(type))
            return [longhand, value ?? properties[longhand].initial.parsed]
        }
        return [longhand, properties[longhand].initial.parsed]
    }))
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-image}
 */
function parseBorderImage(values, longhands) {
    return values.reduce(
        function setBorderImageLonghand(values, value) {
            if (!isOmitted(value)) {
                const longhand = value.types.at(-1)
                if (longhand?.startsWith("<'border-image")) {
                    values.set(longhand.slice(2, -2), value)
                } else if (isList(value)) {
                    value.reduce(setBorderImageLonghand, values)
                }
            }
            return values
        },
        getInitialLonghandDeclarations(longhands))
}

/**
 * @param {object[][]} radii
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-radius}
 */
function parseBorderRadius([horizontal, vertical], longhands) {
    return parseLonghandsByIndex(
        horizontal.map((radius, index) => list([radius, vertical[index]])),
        longhands)
}

/**
 * @param {object[]} radii
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-border-top-radius}
 */
function parseBorderSideRadius([[ha, hb = ha], vertical], [a, b]) {
    if (isOmitted(vertical)) {
        return new Map([[a, list([ha, ha])], [b, list([hb, hb])]])
    }
    const [, [va, vb = va]] = vertical
    return new Map([[a, list([ha, va])], [b, list([hb, vb])]])
}

/**
 * @param {object[]} shadows
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-box-shadow}
 */
function parseBoxShadow(shadows, longhands) {
    const declarations = new Map(longhands.map(longhand => [longhand, list([], ',')]))
    shadows.forEach(([color, [offset, options], position]) => {
        let blur
        let spread
        if (isOmitted(color)) {
            color = offset.value === 'none'
                ? transparent
                : properties['box-shadow-color'].initial.parsed[0]
        }
        if (isOmitted(options)) {
            blur = properties['box-shadow-blur'].initial.parsed[0]
            spread = properties['box-shadow-spread'].initial.parsed[0]
        } else {
            ([blur, spread] = options)
            if (isOmitted(spread)) {
                spread = properties['box-shadow-spread'].initial.parsed[0]
            }
        }
        if (isOmitted(position)) {
            position = properties['box-shadow-position'].initial.parsed[0]
        }
        declarations.get('box-shadow-color').push(color)
        declarations.get('box-shadow-offset').push(offset)
        declarations.get('box-shadow-blur').push(blur)
        declarations.get('box-shadow-spread').push(spread)
        declarations.get('box-shadow-position').push(position)
    })
    return declarations
}

/**
 * @param {object[]} columns
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-multicol-2/#propdef-columns}
 */
function parseColumns(columns, longhands) {
    const [width, count,, height] = columns.flat()
    return parseLonghandsByIndex([width, count, height], longhands)
}

/**
 * @param {object[]} values
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-conditional-5/#propdef-container}
 */
function parseContainer([name, type]) {
    return new Map([
        ['container-name', name],
        ['container-type', isOmitted(type) ? properties['container-type'].initial.parsed : type[1]],
    ])
}

/**
 * @param {*[]} corner
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-corner}
 */
function parseCorner([radii, shape], longhands) {
    if (isOmitted(radii)) {
        const direction = list([zeroPx, zeroPx, zeroPx, zeroPx])
        radii = list([direction, direction])
    } else if (isOmitted(shape)) {
        shape = list([properties['corner-top-left-shape'].initial.parsed])
    }
    shape = parseSides(shape, longhands.slice(4))
    return new Map([
        ...parseBorderRadius(radii, longhands.slice(0, 4)),
        ...parseLonghandsByIndex(shape, longhands.slice(4)),
    ])
}

/**
 * @param {*[]} corner
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-borders-4/#propdef-corner-top}
 */
function parseCornerSide([radii, shape], longhands) {
    if (isOmitted(radii)) {
        radii = list([list([zeroPx]), omitted])
    } else if (isOmitted(shape)) {
        shape = list([properties['corner-top-left-shape'].initial.parsed])
    }
    shape = parseSides(shape, longhands.slice(2))
    return new Map([
        ...parseBorderSideRadius(radii, longhands.slice(0, 2)),
        ...parseLonghandsByIndex(shape, longhands.slice(2)),
    ])
}

/**
 * @param {object[][]} triggers
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-event-trigger}
 */
function parseEventTrigger(triggers, longhands) {
    if (isList(triggers)) {
        return parseCoordinatedValueList(triggers, longhands)
    }
    return getInitialLonghandDeclarations(longhands)
}

/**
 * @param {object|object[]} values
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-flexbox-1/#propdef-flex}
 */
function parseFlex(values) {
    if (isList(values)) {
        const [growShrink, basis] = values
        if (isOmitted(basis)) {
            const [grow, shrink] = growShrink
            return new Map([
                ['flex-grow', grow],
                ['flex-shrink', isOmitted(shrink) ? one : shrink],
                ['flex-basis', zeroPx],
            ])
        }
        if (isOmitted(growShrink)) {
            return new Map([
                ['flex-grow', one],
                ['flex-shrink', one],
                ['flex-basis', basis],
            ])
        }
        const [grow, shrink] = growShrink
        return new Map([
            ['flex-grow', grow],
            ['flex-shrink', shrink],
            ['flex-basis', basis],
        ])
    }
    // none
    return new Map([['flex-basis', auto], ['flex-grow', zero], ['flex-shrink', zero]])
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @param {string[]} resetOnly
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font}
 */
function parseFont(values, longhands, resetOnly) {
    const declarations = getInitialLonghandDeclarations([...longhands, ...resetOnly])
    if (isList(values)) {
        const [settings, size, lineHeight, family] = values
        declarations.set('font-size', size)
        declarations.set('font-family', family)
        if (!isOmitted(lineHeight)) {
            declarations.set('line-height', lineHeight[1])
        }
        if (!isOmitted(settings)) {
            const [style, variant, weight, stretch] = settings
            if (!isOmitted(style)) {
                declarations.set('font-style', style)
            }
            if (!isOmitted(variant)) {
                shorthands.get('font-variant')[0].forEach(longhand => declarations.set(longhand, variant))
            }
            if (!isOmitted(weight)) {
                declarations.set('font-weight', weight)
            }
            if (!isOmitted(stretch)) {
                declarations.set('font-width', stretch)
            }
        }
    } else {
        const value = {
            name: 'system-font',
            types: ['<function>', '<system-font()>'],
            value: values,
        }
        longhands.forEach(longhand => declarations.set(longhand, value))
    }
    return declarations
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-synthesis}
 */
function parseFontSynthesis(values, longhands) {
    return isList(values)
        ? parseLonghandsByIndex(values.map(value => isOmitted(value) ? none : auto), longhands)
        : setLonghands(values, longhands)
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-variant}
 */
function parseFontVariant(values, longhands) {
    if (isList(values)) {
        return parseLonghandsByIndex(values, longhands)
    }
    const declarations = getInitialLonghandDeclarations(longhands)
    if (values.value === 'normal') {
        return declarations
    }
    return declarations.set('font-variant-ligatures', none)
}

/**
 * @param {object|object[]} template
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid}
 */
function parseGrid(template, longhands) {
    const declarations = getInitialLonghandDeclarations(longhands)
    if (template.value === 'none') {
        return declarations
    }
    if (template.types.at(-2) === "<'grid-template'>") {
        return new Map([...declarations, ...parseGridTemplate(template)])
    }
    const [head, ...tail] = template
    if (head.types.at(-1) === "<'grid-template-rows'>") {
        const [, [, dense], columns] = tail
        declarations.set('grid-template-rows', head)
        declarations.set('grid-auto-flow', list([column, dense]))
        declarations.set('grid-auto-rows', properties['grid-auto-rows'].initial.parsed)
        declarations.set('grid-auto-columns', isOmitted(columns) ? auto : columns)
        return declarations
    }
    const dense = head[1]
    const [rows,, columns] = tail
    declarations.set('grid-template-columns', columns)
    declarations.set('grid-auto-flow', list([row, dense]))
    declarations.set('grid-auto-rows', isOmitted(rows) ? auto : rows)
    declarations.set('grid-auto-columns', properties['grid-auto-columns'].initial.parsed)
    return declarations
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-area}
 */
function parseGridArea([head, tail], longhands) {
    const lines = [head]
    for (let index = 0; index < longhands.length; ++index) {
        const line = tail[index]
        if (line) {
            lines.push(line[1])
            continue
        }
        const opposite = index < 2 ? head : lines[1]
        lines.push(opposite.types.includes('<ident>') ? opposite : auto)
    }
    return parseLonghandsByIndex(lines, longhands)
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-column}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-row}
 */
function parseGridLine([start, end], longhands) {
    return parseGridArea([start, isOmitted(end) ? [] : [end]], longhands)
}

/**
 * @param {object|object[]} template
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-template}
 */
function parseGridTemplate(template, longhands) {
    if (template.value === 'none') {
        return getInitialLonghandDeclarations(longhands)
    }
    const [head, ...tail] = template
    if (head.types.at(-1) === "<'grid-template-rows'>") {
        const columns = tail[1]
        return new Map([
            ['grid-template-rows', head],
            ['grid-template-columns', columns],
            ['grid-template-areas', none],
        ])
    }
    const columns = tail[0]
    const rows = list()
    const areas = list()
    let lineNames
    head.forEach(([start, string, size, end]) => {
        areas.push(string)
        if (!isOmitted(start)) {
            if (!lineNames || isOmitted(lineNames)) {
                lineNames = start
            } else {
                lineNames.value.push(...start.value)
            }
        }
        rows.push(list([lineNames, isOmitted(size) ? auto : size]))
        lineNames = end
    })
    return new Map([
        ['grid-template-rows', list([rows, lineNames], ' ', ['<track-list>', '<explicit-track-list>'])],
        ['grid-template-columns', isOmitted(columns) ? none : columns[1]],
        ['grid-template-areas', areas],
    ])
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @param {boolean} [legacy]
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef-line-clamp}
 * @see {@link https://drafts.csswg.org/css-overflow-4/#propdef--webkit-line-clamp}
 */
function parseLineClamp(values, longhands, legacy) {
    if (legacy) {
        if (values.value === 'none') {
            return new Map([
                ['max-lines', none],
                ['block-ellipsis', auto],
                ['continue', auto],
            ])
        }
        return new Map([
            ['max-lines', values],
            ['block-ellipsis', auto],
            ['continue', webkitLegacy],
        ])
    }
    if (values.value === 'none') {
        return getInitialLonghandDeclarations(longhands)
    }
    let [[maxLines, blockEllipsis], fragment] = values
    if (isOmitted(maxLines)) {
        maxLines = none
    } else if (isOmitted(blockEllipsis)) {
        blockEllipsis = auto
    }
    if (isOmitted(fragment)) {
        fragment = collapse
    }
    return new Map([
        ['max-lines', maxLines],
        ['block-ellipsis', blockEllipsis],
        ['continue', fragment],
    ])
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-lists-3/#propdef-list-style}
 */
function parseListStyle(values, longhands) {
    const [position, image, type] = values
    if (image.value === 'none' && isOmitted(type)) {
        return new Map([
            ['list-style-position', isOmitted(position) ? properties['list-style-position'].initial.parsed : position],
            ['list-style-image', image],
            ['list-style-type', image],
        ])
    }
    return parseLonghandsByIndex(values, longhands)
}

/**
 * @param {object[][]} masks
 * @param {string[]} longhands
 * @param {string[]} resetOnly
 * @returns {Map}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask}
 */
function parseMask(masks, longhands, resetOnly) {
    const positionIndex = longhands.indexOf('mask-position')
    const declarations = new Map
    longhands.forEach(longhand => declarations.set(longhand, list([], ',')))
    resetOnly.forEach(longhand => declarations.set(longhand, properties[longhand].initial.parsed))
    masks.forEach(layer => {
        const [, positionSize,, origin, clip] = layer
        if (isOmitted(positionSize)) {
            layer.splice(positionIndex, 1, positionSize, positionSize)
        } else {
            const [position, size] = positionSize
            layer.splice(positionIndex, 1, position, isOmitted(size) ? size : size[1])
        }
        longhands.forEach((longhand, longhandIndex) => {
            let value = layer[longhandIndex]
            if (isOmitted(value)) {
                if (longhand === 'mask-origin' && clip.types.includes('<geometry-box>')) {
                    value = clip
                } else if (longhand === 'mask-clip' && !isOmitted(origin)) {
                    value = origin
                } else {
                    value = properties[longhand].initial.parsed[0]
                }
            }
            declarations.get(longhand).push(value)
        })
    })
    return declarations
}

/**
 * @param {object[][]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask-border}
 */
function parseMaskBorder(values, longhands) {
    return values.reduce(
        function setMaskBorderLonghand(values, value) {
            if (!isOmitted(value)) {
                const longhand = value.types.at(-1)
                if (longhand?.startsWith("<'mask-border")) {
                    values.set(longhand.slice(2, -2), value)
                } else if (isList(value)) {
                    value.reduce(setMaskBorderLonghand, values)
                }
            }
            return values
        },
        getInitialLonghandDeclarations(longhands))
}

/**
 * @param {object[][]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.fxtf.org/motion-1/#propdef-offset}
 */
function parseOffset([[position, center], anchor], longhands) {
    const declarations = getInitialLonghandDeclarations(longhands)
    if (!isOmitted(anchor)) {
        declarations.set('offset-anchor', anchor[1])
    }
    if (isOmitted(position)) {
        const [path, tail] = center
        declarations.set('offset-path', path)
        if (isOmitted(tail)) {
            return declarations
        }
        const [distance, rotate] = tail
        if (isOmitted(distance)) {
            declarations.set('offset-rotate', rotate)
        } else {
            declarations.set('offset-distance', distance)
        }
    } else {
        declarations.set('offset-position', position)
    }
    return declarations
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-ui-4/#propdef-outline}
 */
function parseOutline([width, style, color], longhands) {
    if (color.value === 'auto' && isOmitted(style)) {
        style = auto
    }
    return parseLonghandsByIndex([width, style, color], longhands)
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-place-content}
 */
function parsePlaceContent([align, justify], longhands) {
    if (isOmitted(justify)) {
        justify = align.types.includes('<baseline-position>') ? start : align
    }
    return parseLonghandsByIndex([align, justify], longhands)
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-align-3/#propdef-place-items}
 */
function parsePlaceItems([align, justify]) {
    return new Map([
        ['align-items', align],
        ['justify-items', isOmitted(justify) ? align : justify],
    ])
}

/**
 * @param {object} value
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-align}
 */
function parseTextAlign(value, longhands) {
    switch (value.value) {
        case 'justify-all':
            return parseLonghandsByIndex([justify, justify], longhands)
        case 'match-parent':
            return parseLonghandsByIndex([value, value], longhands)
        default:
            return parseLonghandsByIndex([value, auto], longhands)
    }
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-inline-3/#propdef-text-box-edge}
 */
function parseTextBox(values, longhands) {
    if (isList(values)) {
        let [trim, edge] = values
        if (isOmitted(trim)) {
            trim = keyword('trim-both', 'text-box-trim')
        } else if (isOmitted(edge)) {
            edge = keyword('auto', 'text-box-edge')
        }
        return new Map([
            ['text-box-trim', trim],
            ['text-box-edge', edge],
        ])
    }
    return getInitialLonghandDeclarations(longhands)
}

/**
 * @param {object} value
 * @param {Map} longhands
 * @see {@link https://drafts.csswg.org/css-text-decor-4/#propdef-text-decoration-skip}
 */
function parseTextDecorationSkip(value, longhands) {
    if (value.value === 'auto') {
        return getInitialLonghandDeclarations(longhands)
    }
    const declarations = setLonghands(value, longhands)
    declarations.set('text-decoration-skip-self', keyword('no-skip', ['text-decoration-skip-self']))
    return declarations
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-spacing}
 */
function parseTextSpacing(values, longhands) {
    if (isList(values)) {
        return parseLonghandsByIndex(values, longhands)
    }
    switch (values.value) {
        case 'auto':
            return setLonghands(auto, longhands)
        case 'none':
            return new Map([['text-spacing-trim', spaceAll], ['text-autospace', noAutospace]])
        default: // normal
            return new Map([['text-spacing-trim', spacingTrim], ['text-autospace', values]])
    }
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {object[]}
 *
 * It normalizes implicit side value(s) into explicit side value(s).
 */
function parseSides(values, { length: sides }) {
    while (isOmitted(values.at(-1))) {
        values.pop()
    }
    let { length } = values
    while (length < sides) {
        values.push(values[Math.max(0, length++ - 2)])
    }
    return values
}

/**
 * @param {object[]} triggers
 * @param {string} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-timeline-trigger}
 */
function parseTimelineTrigger(triggers, longhands) {
    const initial = getInitialLonghandDeclarations(longhands)
    if (!isList(triggers)) {
        return initial
    }
    const declarations = new Map(longhands.map(longhand => [longhand, list([], ',')]))
    for (const trigger of triggers) {
        const [name, source, range, exitRange] = trigger
        let [rangeStart, rangeEnd] = parseAnimationRangeValue(range, 'timeline-trigger-range-end')
        if (isOmitted(rangeEnd)) {
            rangeEnd = initial.get('timeline-trigger-range-end')[0]
        }
        let exitRangeStart
        let exitRangeEnd
        if (isOmitted(exitRange)) {
            exitRangeStart = initial.get('timeline-trigger-exit-range-start')[0]
            exitRangeEnd = initial.get('timeline-trigger-exit-range-end')[0]
        } else {
            [exitRangeStart, exitRangeEnd] = parseAnimationRangeValue(exitRange[1], 'timeline-trigger-exit-range-end')
            if (isOmitted(exitRangeEnd)) {
                exitRangeEnd = initial.get('timeline-trigger-exit-range-end')[0]
            }
        }
        declarations.get('timeline-trigger-name').push(name)
        declarations.get('timeline-trigger-source').push(source)
        declarations.get('timeline-trigger-range-start').push(rangeStart)
        declarations.get('timeline-trigger-range-end').push(rangeEnd)
        declarations.get('timeline-trigger-exit-range-start').push(exitRangeStart)
        declarations.get('timeline-trigger-exit-range-end').push(exitRangeEnd)
    }
    return declarations
}

/**
 * @param {object[][]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-view-timeline}
 */
function parseViewTimeline(values, longhands) {
    values = values.map(value => isOmitted(value[1]) ? [value[0], omitted, omitted] : value.flat())
    return parseCoordinatedValueList(values, longhands)
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-white-space}
 */
function parseWhiteSpace(values, longhands) {
    if (!isList(values)) {
        values = whiteSpace.mapping.get(values.value)
    }
    return parseLonghandsByIndex(values, longhands)
}

/**
 * @param {object|*[]} value
 * @param {string} name
 * @param {string[][]} subProperties
 * @returns {Map}
 */
function parse(value, name, subProperties) {
    if (cssWideKeywords.includes(value.value)) {
        return setLonghands(value, subProperties.flat())
    }
    const [longhands, resetOnly] = subProperties
    switch (name) {
        case '-webkit-line-clamp':
            return parseLineClamp(value, longhands, true)
        case 'animation':
            return parseAnimation(value, longhands, resetOnly)
        case 'animation-range':
        case 'timeline-trigger-exit-range':
        case 'timeline-trigger-range':
            return parseAnimationRange(value, longhands)
        case 'background':
            return parseBackground(value, longhands, resetOnly)
        case 'background-repeat':
            return parseBackgroundRepeat(value, longhands)
        case 'border':
            return parseBorder(value, subProperties.flat(), 4)
        case 'border-block':
        case 'border-inline':
            return parseBorder(value, longhands, 2)
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
        case 'corner-block-end-shape':
        case 'corner-block-start-shape':
        case 'corner-bottom-shape':
        case 'corner-inline-end-shape':
        case 'corner-inline-start-shape':
        case 'corner-left-shape':
        case 'corner-right-shape':
        case 'corner-shape':
        case 'corner-top-shape':
        case 'cue':
        case 'gap':
        case 'inset':
        case 'inset-block':
        case 'inset-inline':
        case 'interest-delay':
        case 'margin':
        case 'margin-block':
        case 'margin-inline':
        case 'overflow':
        case 'overscroll-behavior':
        case 'padding':
        case 'padding-block':
        case 'padding-inline':
        case 'pause':
        case 'place-self':
        case 'rest':
        case 'scroll-margin':
        case 'scroll-margin-block':
        case 'scroll-margin-inline':
        case 'scroll-padding':
        case 'scroll-padding-block':
        case 'scroll-padding-inline':
            return parseLonghandsByIndex(parseSides(value, longhands), longhands)
        case 'border-block-end-radius':
        case 'border-block-start-radius':
        case 'border-bottom-radius':
        case 'border-inline-end-radius':
        case 'border-inline-start-radius':
        case 'border-left-radius':
        case 'border-right-radius':
        case 'border-top-radius':
            return parseBorderSideRadius(value, longhands)
        case 'border-clip':
        case 'color-adjust':
        case 'glyph-orientation-vertical':
        case 'marker':
        case 'overflow-clip-margin':
        case 'overflow-clip-margin-block':
        case 'overflow-clip-margin-inline':
        case 'page-break-after':
        case 'page-break-before':
        case 'page-break-inside':
            return setLonghands(value, longhands)
        case 'border-image':
            return parseBorderImage(value, longhands)
        case 'border-radius':
            return parseBorderRadius(value, longhands)
        case 'box-shadow':
            return parseBoxShadow(value, longhands)
        case 'columns':
            return parseColumns(value, longhands)
        case 'container':
            return parseContainer(value)
        case 'corner':
            return parseCorner(value, longhands)
        case 'corner-block-end':
        case 'corner-block-start':
        case 'corner-bottom':
        case 'corner-inline-end':
        case 'corner-inline-start':
        case 'corner-left':
        case 'corner-right':
        case 'corner-top':
            return parseCornerSide(value, longhands)
        case 'event-trigger':
            return parseEventTrigger(value, longhands)
        case 'flex':
            return parseFlex(value, longhands)
        case 'font':
            return parseFont(value, longhands, resetOnly)
        case 'font-synthesis':
            return parseFontSynthesis(value, longhands)
        case 'font-variant':
            return parseFontVariant(value, longhands)
        case 'grid':
            return parseGrid(value, longhands)
        case 'grid-area':
            return parseGridArea(value, longhands)
        case 'grid-column':
        case 'grid-row':
            return parseGridLine(value, longhands)
        case 'grid-template':
            return parseGridTemplate(value, longhands)
        case 'line-clamp':
            return parseLineClamp(value, longhands)
        case 'list-style':
            return parseListStyle(value, longhands)
        case 'mask':
            return parseMask(value, longhands, resetOnly)
        case 'mask-border':
            return parseMaskBorder(value, longhands)
        case 'offset':
            return parseOffset(value, longhands)
        case 'outline':
            return parseOutline(value, longhands)
        case 'place-content':
            return parsePlaceContent(value, longhands)
        case 'place-items':
            return parsePlaceItems(value, longhands)
        case 'text-align':
            return parseTextAlign(value, longhands)
        case 'text-box':
            return parseTextBox(value, longhands)
        case 'text-decoration-skip':
            return parseTextDecorationSkip(value, longhands)
        case 'text-spacing':
            return parseTextSpacing(value, longhands)
        case 'timeline-trigger':
            return parseTimelineTrigger(value, longhands)
        case 'transition':
        case 'pointer-timeline':
        case 'scroll-timeline':
            return parseCoordinatedValueList(value, longhands)
        case 'view-timeline':
            return parseViewTimeline(value, longhands)
        case 'white-space':
            return parseWhiteSpace(value, longhands)
        default:
            return parseLonghandsByIndex(value, longhands)
    }
}

/**
 * @param {object} declaration
 * @returns {object[]}
 */
export default function expand(declaration) {
    const { important, name, pending, value } = declaration
    const subProperties = shorthands.get(name)
    if (pending) {
        return subProperties.flat().map(name => ({ ...declaration, name }))
    }
    const map = parse(value, name, subProperties)
    const declarations = []
    map.forEach((value, name) => declarations.push({ important, name, value }))
    return declarations
}
