
const {
    auto,
    column,
    discard,
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
    webkitDiscard,
    zero,
    zeroPx,
} = require('../values/defaults.js')
const { keywords: cssWideKeywords } = require('../values/substitutions.js')
const { keyword, list, omitted } = require('../values/value.js')
const { isOmitted } = require('../utils/value.js')
const properties = require('../properties/definitions.js')
const shorthands = require('../properties/shorthands.js')
const whiteSpace = require('../values/white-space.js')

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
 * @see {@link https://drafts.csswg.org/css-transitions-2/#propdef-transition}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-scroll-timeline}
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
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-animations-1/#propdef-animation}
 */
function parseAnimation(animations, [...longhands]) {
    const resetOnly = longhands.splice(longhands.indexOf(shorthands.resetOnly.animation[0]))
    const declarations = parseCoordinatedValueList(animations, longhands)
    resetOnly.forEach(longhand => declarations.set(longhand, properties[longhand].initial.parsed))
    return declarations
}

/**
 * @param {object[][]} animations
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-animation-range}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-animation-trigger-exit-range}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-animation-trigger-range}
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
    if (Array.isArray(start) && isOmitted(end)) {
        return list([start, list([start[0], omitted], ' ', [endType])])
    }
    return boundaries
}

/**
 * @param {object[]} triggers
 * @param {string} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-animations-2/#propdef-animation-trigger}
 */
function parseAnimationTrigger(triggers, longhands) {
    const declarations = new Map(longhands.map(longhand => [longhand, list([], ',')]))
    const initial = new Map(longhands.map(longhand => [longhand, properties[longhand].initial.parsed[0]]))
    for (const trigger of triggers) {
        let [type, timeline, [start, end, exitStart, exitEnd] = []]= trigger.flat()
        if (isOmitted(type)) {
            type = initial.get('animation-trigger-type')
        }
        if (isOmitted(timeline)) {
            timeline = initial.get('animation-trigger-timeline')
        }
        if (!start) {
            start = initial.get('animation-trigger-range-start')
            end = initial.get('animation-trigger-range-end')
        } else if (!end) {
            [start, end] = parseAnimationRangeValue([start, omitted], 'animation-trigger-range-end')
            if (isOmitted(end)) {
                end = initial.get('animation-trigger-range-end')
            }
        }
        if (!exitStart) {
            exitStart = initial.get('animation-trigger-exit-range-start')
            exitEnd = initial.get('animation-trigger-exit-range-end')
        } else if (!exitEnd) {
            [exitStart, exitEnd] = parseAnimationRangeValue([exitStart, omitted], 'animation-trigger-exit-range-end');
            if (isOmitted(exitEnd)) {
                exitEnd = initial.get('animation-trigger-exit-range-end')
            }
        }
        declarations.get('animation-trigger-type').push(type)
        declarations.get('animation-trigger-timeline').push(timeline)
        declarations.get('animation-trigger-range-start').push(start)
        declarations.get('animation-trigger-range-end').push(end)
        declarations.get('animation-trigger-exit-range-start').push(exitStart)
        declarations.get('animation-trigger-exit-range-end').push(exitEnd)
    }
    return declarations
}

/**
 * @param {object[][]} layers
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-background}
 *
 * It assigns each background layer value to the corresponding longhand values,
 * setting an omitted `background-clip` value to the `background-origin` value.
 */
function parseBackground(layers, [...longhands]) {
    const [bgLayers,, finalBgLayer] = layers
    const bgColor = finalBgLayer.pop()
    const resetOnly = longhands.splice(longhands.indexOf(shorthands.resetOnly.background[0]))
    const declarations = new Map(longhands.map(longhand =>
        longhand === 'background-color'
            ? [longhand, isOmitted(bgColor) ? properties[longhand].initial.parsed : bgColor]
            : [longhand, list([], ',')]))
    resetOnly.forEach(longhand => declarations.set(longhand, properties[longhand].initial.parsed))
    layers = isOmitted(bgLayers) ? [finalBgLayer] : [...bgLayers, finalBgLayer]
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
                    value = isOmitted(origin) ? clip : origin
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
    const x = list([], ',')
    const y = list([], ',')
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
    return new Map([['background-repeat-x', x], ['background-repeat-y', y]])
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @param {number} sides
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-block}
 * @see {@link https://drafts.csswg.org/css-logical-1/#propdef-border-inline}
 */
function parseBorder(values, longhands, sides) {
    const length = sides * 3
    return new Map(longhands.map((longhand, index) => {
        if (index < length) {
            const typeIndex = Math.floor((index / sides) % 3)
            const type = borderTypes.at(typeIndex)
            const value = values.find(component => component.types.includes(type))
            return [longhand, value ?? properties[longhand].initial.parsed]
        }
        return [longhand, properties[longhand].initial.parsed]
    }))
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-image}
 */
function parseBorderImage(values, longhands) {
    return values.reduce(
        function setBorderImageLonghand(values, value) {
            if (!isOmitted(value)) {
                const longhand = value.types.at(-1)
                if (longhand?.startsWith("<'border-image")) {
                    values.set(longhand.slice(2, -2), value)
                } else if (Array.isArray(value)) {
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
 * @see {@link https://drafts.csswg.org/css-backgrounds-3/#propdef-border-radius}
 */
function parseBorderRadius(radii, longhands) {
    const [horizontal, vertical] = radii
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
function parseBorderSideRadius(radii, [a, b]) {
    const [[ha, hb = ha], vertical] = radii
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
 * @param {object|object[]} values
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-flexbox-1/#propdef-flex}
 */
function parseFlex(values) {
    if (Array.isArray(values)) {
        const [growShrink, basis] = values
        if (isOmitted(basis)) {
            const [grow, shrink] = growShrink
            return new Map([
                ['flex-basis', zeroPx],
                ['flex-grow', grow],
                ['flex-shrink', isOmitted(shrink) ? one : shrink],
            ])
        }
        if (isOmitted(growShrink)) {
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
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font}
 */
function parseFont(values, longhands) {
    const declarations = getInitialLonghandDeclarations(longhands)
    if (Array.isArray(values)) {
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
                shorthands.get('font-variant').forEach(longhand => declarations.set(longhand, variant))
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
        longhands.forEach(longhand => {
            if (!shorthands.resetOnly.font.includes(longhand)) {
                declarations.set(longhand, value)
            }
        })
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
    return Array.isArray(values)
        ? parseLonghandsByIndex(values.map(component => isOmitted(component) ? none : auto), longhands)
        : setLonghands(values, longhands)
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-fonts-4/#propdef-font-variant}
 */
function parseFontVariant(values, longhands) {
    if (Array.isArray(values)) {
        return parseLonghandsByIndex(values, longhands)
    }
    const declarations = getInitialLonghandDeclarations(longhands)
    if (values.value === 'normal') {
        return declarations
    }
    // none
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
        return new Map([
            ...declarations,
            ['grid-template-rows', head],
            ['grid-auto-flow', list([column, dense])],
            ['grid-auto-rows', properties['grid-auto-rows'].initial.parsed],
            ['grid-auto-columns', isOmitted(columns) ? auto : columns],
        ])
    }
    const [, dense] = head
    const [rows,, columns] = tail
    return new Map([
        ...declarations,
        ['grid-template-columns', columns],
        ['grid-auto-flow', list([row, dense])],
        ['grid-auto-rows', isOmitted(rows) ? auto : rows],
        ['grid-auto-columns', properties['grid-auto-columns'].initial.parsed],
    ])
}

/**
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-grid-2/#propdef-grid-area}
 */
function parseGridArea(values, longhands) {
    const [head, tail] = values
    const lines = [head]
    let index = -1
    while (++index < 3) {
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
    return parseLonghandsByIndex([start, isOmitted(end) ? start : end[1]], longhands)
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
        const [, columns] = tail
        return new Map([
            ['grid-template-areas', none],
            ['grid-template-columns', columns],
            ['grid-template-rows', head],
        ])
    }
    const [columns] = tail
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
        ['grid-template-areas', areas],
        ['grid-template-columns', isOmitted(columns) ? none : columns[1]],
        ['grid-template-rows', list([rows, lineNames], ' ', ['<track-list>', '<explicit-track-list>'])],
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
            ['continue', webkitDiscard],
        ])
    }
    if (values.value === 'none') {
        return getInitialLonghandDeclarations(longhands)
    }
    let [maxLines, blockEllipsis] = values
    if (isOmitted(maxLines)) {
        maxLines = none
    } else if (isOmitted(blockEllipsis)) {
        blockEllipsis = auto
    }
    return new Map([
        ['max-lines', maxLines],
        ['block-ellipsis', blockEllipsis],
        ['continue', discard],
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
            ['list-style-image', image],
            ['list-style-position', isOmitted(position) ? properties['list-style-position'].initial.parsed : position],
            ['list-style-type', image],
        ])
    }
    return parseLonghandsByIndex(values, longhands)
}

/**
 * @param {object[][]} masks
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.fxtf.org/css-masking-1/#propdef-mask}
 */
function parseMask(masks, longhands) {
    const positionIndex = longhands.indexOf('mask-position')
    const { resetOnly: { mask } } = shorthands
    const declarations = new Map(longhands.map(longhand => [
        longhand,
        mask.includes(longhand)
            ? properties[longhand].initial.parsed
            : list([], ','),
    ]))
    masks.forEach((layer, layerIndex) => {
        const [, positionSize] = layer
        if (isOmitted(positionSize)) {
            layer.splice(positionIndex, 1, positionSize, positionSize)
        } else {
            const [position, size] = positionSize
            layer.splice(positionIndex, 1, position, isOmitted(size) ? size : size[1])
        }
        longhands.forEach((longhand, longhandIndex) => {
            if (mask.includes(longhand)) {
                return
            }
            let value = layer[longhandIndex]
            if (isOmitted(value)) {
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
                } else if (Array.isArray(value)) {
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
function parseOffset([head, anchor], longhands) {
    return parseLonghandsByIndex(isOmitted(anchor) ? head.flat(3) : [head, anchor[1]].flat(3), longhands)
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
 * @param {object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-inline-3/#propdef-text-box-edge}
 */
function parseTextBox(values, longhands) {
    if (Array.isArray(values)) {
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
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-text-spacing}
 */
function parseTextSpacing(values, longhands) {
    if (Array.isArray(values)) {
        return parseLonghandsByIndex(values, longhands)
    }
    switch (values.value) {
        case 'auto':
            return setLonghands(auto, longhands)
        case 'none':
            return new Map([['text-autospace', noAutospace], ['text-spacing-trim', spaceAll]])
        default: // normal
            return new Map([['text-autospace', values], ['text-spacing-trim', spacingTrim]])
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
 * @param {object[][]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/scroll-animations-1/#propdef-view-timeline}
 */
function parseViewTimeline(values, longhands) {
    values = values.map(list => isOmitted(list[1]) ? [list[0], omitted, omitted] : list.flat())
    return parseCoordinatedValueList(values, longhands)
}

/**
 * @param {object|object[]} values
 * @param {string[]} longhands
 * @returns {Map}
 * @see {@link https://drafts.csswg.org/css-text-4/#propdef-white-space}
 */
function parseWhiteSpace(values, longhands) {
    if (!Array.isArray(values)) {
        values = whiteSpace.get(values.value)
    }
    return parseLonghandsByIndex(values, longhands)
}

/**
 * @param {object|*[]} value
 * @param {string} name
 * @returns {Map}
 */
function parse(value, name) {
    const longhands = shorthands.get(name)
    if (cssWideKeywords.includes(value.value)) {
        return setLonghands(value, longhands)
    }
    switch (name) {
        case '-webkit-line-clamp':
            return parseLineClamp(value, longhands, true)
        case 'animation':
            return parseAnimation(value, longhands)
        case 'animation-range':
        case 'animation-trigger-exit-range':
        case 'animation-trigger-range':
            return parseAnimationRange(value, longhands)
        case 'animation-trigger':
            return parseAnimationTrigger(value, longhands)
        case 'transition':
        case 'scroll-timeline':
            return parseCoordinatedValueList(value, longhands)
        case 'background':
            return parseBackground(value, longhands)
        case 'background-repeat':
            return parseBackgroundRepeat(value, longhands)
        case 'border':
            return parseBorder(value, longhands, 4)
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
        case 'corner-bottom-shape':
        case 'corner-left-shape':
        case 'corner-right-shape':
        case 'corner-shape':
        case 'corner-top-shape':
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
        case 'container':
            return parseContainer(value)
        case 'flex':
            return parseFlex(value, longhands)
        case 'font':
            return parseFont(value, longhands)
        case 'font-variant':
            return parseFontVariant(value, longhands)
        case 'font-synthesis':
            return parseFontSynthesis(value, longhands)
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
        case 'mask-border':
            return parseMaskBorder(value, longhands)
        case 'mask':
            return parseMask(value, longhands)
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
        case 'text-spacing':
            return parseTextSpacing(value, longhands)
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
function expand(declaration) {
    const { important, name, pending, value } = declaration
    const longhands = shorthands.get(name)
    if (pending) {
        return longhands.map(name => ({ ...declaration, name }))
    }
    const map = parse(value, name)
    const declarations = []
    map.forEach((value, name) => declarations.push({ important, name, value }))
    return declarations
}

module.exports = expand
