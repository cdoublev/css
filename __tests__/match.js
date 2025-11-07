
import { install } from '@cdoublev/css'
import matchMediaQueryList from '../lib/match/media.js'
import matchSupport from '../lib/match/support.js'
import { parseGrammar } from '../lib/parse/parser.js'

install()

describe('media', () => {

    const window = {
        devicePixelRatio: 1,
        document: {},
        innerHeight: 100,
        innerWidth: 100,
        screen: {
            colorDepth: 24,
            height: 100,
            width: 200,
        },
    }

    function match(query, window) {
        return matchMediaQueryList(parseGrammar(query, '<media-query-list>'), window)
    }

    test('empty', () => {
        expect(match('')).toBeTruthy()
    })
    test('types', () => {
        const queries = [
            ['all'],
            ['screen'],
            ['not screen', false],
            ['print', false],
            ['tty', false],
            ['unknown', false],
            ['not all', false],
            ['not print'],
            ['not tty'],
            ['not unknown'],
        ]
        queries.forEach(([query, expected = true, context = window]) =>
            expect(match(query, context)).toBe(expected))
    })
    test('boolean', () => {
        const queries = [
            // <general-enclosed>
            ['(unknown)', false],
            ['(min-orientation)', false],
            ['(min-color)', false],
            // Discrete
            ['(-webkit-transform-3d)'],
            ['(any-hover)'],
            ['(any-pointer)'],
            ['(color-gamut)'],
            ['(display-mode)'],
            ['(dynamic-range)'],
            ['(environment-blending)'],
            ['(forced-colors)', false],
            ['(grid)', false],
            ['(hover)'],
            ['(inverted-colors)', false],
            ['(nav-controls)', false],
            ['(orientation)'],
            ['(overflow-block)'],
            ['(overflow-inline)'],
            ['(pointer)'],
            ['(prefers-color-scheme)'],
            ['(prefers-contrast)', false],
            ['(prefers-reduced-data)', false],
            ['(prefers-reduced-motion)', false],
            ['(prefers-reduced-transparancy)', false],
            ['(scan)'],
            ['(scripting)'],
            ['(shape)'],
            ['(update)'],
            ['(video-color-gamut)'],
            ['(video-dynamic-range)'],
            // Range
            ['(aspect-ratio)'],
            ['(aspect-ratio)', true, { innerHeight: 1, innerWidth: 0 }],
            ['(aspect-ratio)', true, { innerHeight: 0, innerWidth: 0 }],
            ['(color)'],
            ['(color)', false, { screen: { colorDepth: 0 } }],
            ['(color-index)', false],
            ['(device-aspect-ratio)'],
            ['(device-aspect-ratio)', true, { screen: { height: 1, width: 0 } }],
            ['(device-aspect-ratio)', true, { screen: { height: 0, width: 0 } }],
            ['(device-height)'],
            ['(device-height)', false, { screen: { height: 0 } }],
            ['(device-width)'],
            ['(device-width)', false, { screen: { width: 0 } }],
            ['(height)'],
            ['(height)', false, { innerHeight: 0 }],
            ['(horizontal-viewport-segments)'],
            ['(monochrome)', false],
            ['(resolution)'],
            ['(resolution)', false, { devicePixelRatio: 0 }],
            ['(vertical-viewport-segments)'],
            ['(width)'],
            ['(width)', false, { innerWidth: 0 }],
        ]
        queries.forEach(([query, expected = true, context = window]) =>
            expect(match(query, context)).toBe(expected))
    })
    test('plain', () => {
        const queries = [
            // <general-enclosed>
            ['(unknown: 1)', false],
            ['(min-orientation: portrait)', false],
            ['(max-orientation: portrait)', false],
            // Discrete
            ['(-webkit-transform-3d: 0)', false],
            ['(-webkit-transform-3d: 1)'],
            ['(any-hover: none)', false],
            ['(any-hover: hover)'],
            ['(any-pointer: none)', false],
            ['(any-pointer: fine)'],
            ['(color-gamut: p3)', false],
            ['(color-gamut: srgb)'],
            ['(display-mode: fullscreen)', false],
            ['(display-mode: browser)'],
            ['(display-mode: fullscreen)', true, { document: { fullscreenEnabled: true } }],
            ['(display-mode: picture-in-picture)', true, { document: { pictureInPictureEnabled: true } }],
            ['(dynamic-range: high)', false],
            ['(dynamic-range: standard)'],
            ['(environment-blending: additive)', false],
            ['(environment-blending: opaque)'],
            ['(forced-colors: active)', false],
            ['(forced-colors: none)'],
            ['(grid: 1)', false],
            ['(grid: 0)'],
            ['(hover: none)', false],
            ['(hover)'],
            ['(inverted-colors: inverted)', false],
            ['(inverted-colors: none)'],
            ['(nav-controls: back)', false],
            ['(nav-controls: none)'],
            ['(orientation: landscape)', false],
            ['(orientation: landscape)', false, { innerHeight: 2, innerWidth: 1 }],
            ['(orientation: portrait)', false, { innerHeight: 1, innerWidth: 2 }],
            ['(orientation: portrait)'],
            ['(orientation: portrait)', true, { innerHeight: 2, innerWidth: 1 }],
            ['(orientation: landscape)', true, { innerHeight: 1, innerWidth: 2 }],
            ['(overflow-block: none)', false],
            ['(overflow-block: scroll)'],
            ['(overflow-inline: none)', false],
            ['(overflow-inline: scroll)'],
            ['(pointer: none)', false],
            ['(pointer: fine)'],
            ['(prefers-color-scheme: dark)', false],
            ['(prefers-color-scheme: light)'],
            ['(prefers-contrast: more)', false],
            ['(prefers-contrast: no-preference)'],
            ['(prefers-reduced-data: reduce)', false],
            ['(prefers-reduced-data: no-preference)'],
            ['(prefers-reduced-motion: reduce)', false],
            ['(prefers-reduced-motion: no-preference)'],
            ['(prefers-reduced-transparency: reduce)', false],
            ['(prefers-reduced-transparency: no-preference)'],
            ['(scan: interlace)', false],
            ['(scan: progressive)'],
            ['(scripting: none)', false],
            ['(scripting: enabled)'],
            ['(shape: round)', false],
            ['(shape: rect)'],
            ['(update: none)', false],
            ['(update: fast)'],
            ['(video-color-gamut: p3)', false],
            ['(video-color-gamut: srgb)'],
            ['(video-dynamic-range: high)', false],
            ['(video-dynamic-range: standard)'],
            // Range
            ['(aspect-ratio: 0)', false],
            ['(aspect-ratio: 1)'],
            ['(aspect-ratio: 1 / 1)'],
            ['(aspect-ratio: calc(1))'],
            ['(min-aspect-ratio: 2)', false],
            ['(min-aspect-ratio: 1)'],
            ['(max-aspect-ratio: 1)'],
            ['(max-aspect-ratio: 0)', false],
            ['(color: 0)', false],
            ['(color: 24)'],
            ['(color-index: 16777216)', false],
            ['(color-index: 0)'],
            ['(device-aspect-ratio: 0)', false],
            ['(device-aspect-ratio: 2)'],
            ['(device-aspect-ratio: 2 / 1)'],
            ['(device-height: 0px)', false],
            ['(device-height: 100px)'],
            ['(device-width: 0px)', false],
            ['(device-width: 200px)'],
            ['(height: 0px)', false],
            ['(height: 100px)'],
            ['(height: 1in)', true, { innerHeight: 96 }],
            ['(height: 2in)', false, { innerHeight: 96 }],
            ['(horizontal-viewport-segments: 0)', false],
            ['(horizontal-viewport-segments: 1)'],
            ['(monochrome: 1)', false],
            ['(monochrome: 0)'],
            ['(resolution: 2dppx)', false],
            ['(resolution: 1dppx)'],
            ['(resolution: infinite)', true, { devicePixelRatio: Infinity }],
            ['(resolution: calc(infinity))', false, { devicePixelRatio: Infinity }],
            ['(vertical-viewport-segments: 0)', false],
            ['(vertical-viewport-segments: 1)'],
            ['(width: 0px)', false],
            ['(width: 100px)'],
        ]
        queries.forEach(([query, expected = true, context = window]) =>
            expect(match(query, context)).toBe(expected))
    })
    test('range', () => {
        const queries = [
            // <general-enclosed>
            ['(unknown = 1)', false],
            ['(-webkit-transform-3d = 1)', false],
            ['(min-color = 24)', false],
            ['(max-color = 24)', false],
            // Guinea pig for all range features
            ['(color = 24)'],
            ['(color < 23)', false],
            ['(color < 24)', false],
            ['(color < 25)'],
            ['(color <= 23)', false],
            ['(color <= 24)'],
            ['(color <= 25)'],
            ['(color > 23)'],
            ['(color > 24)', false],
            ['(color > 25)', false],
            ['(color >= 23)'],
            ['(color >= 24)'],
            ['(color >= 25)', false],
            ['(23 < color)'],
            ['(24 < color)', false],
            ['(25 < color)', false],
            ['(23 <= color)'],
            ['(24 <= color)'],
            ['(25 <= color)', false],
            ['(23 > color)', false],
            ['(24 > color)', false],
            ['(25 > color)'],
            ['(23 >= color)', false],
            ['(24 >= color)'],
            ['(25 >= color)'],
            ['(23 < color < 25)'],
            ['(24 < color < 24)', false],
            ['(24 <= color < 24)', false],
            ['(24 < color <= 24)', false],
            ['(24 <= color <= 24)'],
            ['(25 > color > 23)'],
            ['(24 > color > 24)', false],
            ['(24 >= color > 24)', false],
            ['(24 > color >= 24)', false],
            ['(24 >= color >= 24)'],
            ['(color = calc(24))'],
            ['(color < calc(25))'],
            ['(calc(23) < color < calc(25))'],
            // Special case: aspect-ratio against 0 / 0
            ['(aspect-ratio = 0 / 0)', true, { innerHeight: 0, innerWidth: 0 }],
            ['(aspect-ratio = 0 / 0)', false, { innerHeight: 0, innerWidth: 1 }],
            ['(aspect-ratio = 0 / 0)', false],
            ['(aspect-ratio = 0 / 0)', false, { innerHeight: 1, innerWidth: 0 }],
            ['(aspect-ratio <= 0 / 0)', true, { innerHeight: 0, innerWidth: 0 }],
            ['(aspect-ratio <= 0 / 0)', false, { innerHeight: 0, innerWidth: 1 }],
            ['(aspect-ratio <= 0 / 0)', false],
            ['(aspect-ratio <= 0 / 0)', false, { innerHeight: 1, innerWidth: 0 }],
            ['(aspect-ratio >= 0 / 0)', true, { innerHeight: 0, innerWidth: 0 }],
            ['(aspect-ratio >= 0 / 0)', false, { innerHeight: 0, innerWidth: 1 }],
            ['(aspect-ratio >= 0 / 0)', false],
            ['(aspect-ratio >= 0 / 0)', false, { innerHeight: 1, innerWidth: 0 }],
        ]
        queries.forEach(([query, expected = true, context = window]) =>
            expect(match(query, context)).toBe(expected))
    })
    test('combinations', () => {
        const queries = [
            // <media-query> = [not|only]? <media-type> [and <media-condition-without-or>]
            ['all and (color)'],
            ['tty and (color)', false],
            ['unknown and (color)', false],
            ['not all and (color)', false],
            ['not tty and (color)'],
            ['not unknown and (color)'],
            // <media-query> = <media-condition> = <media-in-parens> <media-and>*
            ['(color) and (color)'],
            ['(color) and (color: 0)', false],
            ['(color) and (unknown)', false],
            ['(not (color)) and (color)', false],
            ['(not (color: 0)) and (color)'],
            ['(not (unknown)) and (color)', false],
            // <media-query> = <media-query> = <media-condition> = <media-in-parens> <media-or>*
            ['(color) or (color)'],
            ['(color: 0) or (color)'],
            ['(not (color)) or (color)'],
            ['(not (hover)) or (hover)'],
            ['(not (unknown)) or (color)'],
        ]
        queries.forEach(([query, expected = true, context = window]) =>
            expect(match(query, context)).toBe(expected))
    })
})

describe('support', () => {

    function match(query) {
        return matchSupport(parseGrammar(`(${query})`, '<supports-condition>'))
    }

    test('at-rule', () => {
        expect(match('at-rule(@style)')).toBeFalsy()
        expect(match('at-rule(@ANNOTATION)')).toBeTruthy()
    })
    test('declaration', () => {
        const declarations = [
            // <general-enclosed>
            ['unknown', false],
            ['unknown: 1', false],
            ['color: invalid', false],
            // Property value range
            ['COLOR: green'],
            ['color: green !important'],
            ['--custom: 1'],
            // Property value substitution
            ['color: initial'],
            ['color: var(--custom)'],
            ['color: first-valid(green)'],
            // Aliased/mapped property
            ['grid-gap: 1px'],
            ['-webkit-box-align: center'],
        ]
        declarations.forEach(([declaration, expected = true]) => expect(match(declaration)).toBe(expected))
    })
    test('font technology', () => {
        expect(match('font-tech(color-svg)')).toBeTruthy()
    })
    test('font format', () => {
        expect(match('font-format("woff")')).toBeFalsy()
        expect(match('font-format(woff)')).toBeTruthy()
    })
    test('selector', () => {
        const selectors = [
            // <general-enclosed>
            [':unknown', false],
            [':nth-child(+ n-1)', false],
            [':is(::before)', false],
            ['::before:is(type)', false],
            ['::before:not(type)', false],
            ['::-webkit-unknown', false],
            ['::slotted(type > type)', false],
            ['#1', false],
            ['undeclared|*', false],
            // <complex-selector>
            ['type + .class'],
        ]
        selectors.forEach(([selector, expected = true]) =>
            expect(match(`selector(${selector})`)).toBe(expected))
    })
    test('combinations', () => {
        const queries = [
            // not
            ['not (unknown: 1)'],
            ['not (color: unknown)'],
            ['not (color: green)', false],
            // and
            ['(unknown) and (unknown)', false],
            ['(unknown) and (color: green)', false],
            ['(color: green) and (color: green)'],
            // or
            ['(unknown) or (unknown)', false],
            ['(unknown) or (color: green)'],
            ['(color: green) or (color: green)'],
            // and/or
            ['((unknown) and (unknown)) or (color: green)'],
            ['((unknown) or (color: green)) and (color: green)'],
        ]
        queries.forEach(([query, expected = true]) => expect(match(query)).toBe(expected))
    })
})
