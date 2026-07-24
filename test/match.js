
import {
    Comment,
    DocumentFragment,
    Element,
    HTMLAnchorElement,
    HTMLAreaElement,
    HTMLBodyElement,
    HTMLButtonElement,
    HTMLDataListElement,
    HTMLDetailsElement,
    HTMLDialogElement,
    HTMLDivElement,
    HTMLDocument,
    HTMLElement,
    HTMLFieldSetElement,
    HTMLFormElement,
    HTMLHeadingElement,
    HTMLHtmlElement,
    HTMLInputElement,
    HTMLLegendElement,
    HTMLMediaElement,
    HTMLMetaElement,
    HTMLMeterElement,
    HTMLOptGroupElement,
    HTMLOptionElement,
    HTMLProgressElement,
    HTMLScriptElement,
    HTMLSelectElement,
    HTMLSlotElement,
    HTMLStyleElement,
    HTMLTextAreaElement,
    HTMLVideoElement,
    MathMLElement,
    SVGSVGElement,
    SVGUseElement,
    ShadowRoot,
    Text,
} from './dom.js'
import { HTML_NAMESPACE, SVG_NAMESPACE, XLINK_NAMESPACE, XML_NAMESPACE } from '../lib/utils/dom/constants.js'
import assert, { Assert, AssertionError } from 'node:assert/strict'
import { createContext, parseGrammar } from '../lib/parse/parser.js'
import { describe, test } from 'node:test'
import { matchPseudoElementAgainstSelectors, matchTreesAgainstSelectors } from '../lib/match/selector.js'
import { CSSPseudoElement } from '../lib/cssom/index.js'
import { install } from '@cdoublev/css'
import matchMediaQueryList from '../lib/match/media.js'
import matchSupport from '../lib/match/support.js'
import { omitted } from '../lib/values/value.js'

install()

describe('media', () => {

    const window = {
        devicePixelRatio: 1,
        document: new HTMLDocument,
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
        assert.equal(match(''), true)
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
            assert.equal(match(query, context), expected))
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
            ['(ua-color-scheme)'],
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
            assert.equal(match(query, context), expected))
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
            ['(ua-color-scheme: dark)', false],
            ['(ua-color-scheme: light)'],
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
            assert.equal(match(query, context), expected))
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
            assert.equal(match(query, context), expected))
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
            assert.equal(match(query, context), expected))
    })
})

describe('selector', () => {

    /**
     * @param {Element} element
     * @param {number} number
     * @returns {number}
     */
    function isOdd(_, index) {
        return ++index % 2
    }

    /**
     * @param {Element} element
     * @param {number} number
     * @returns {number}
     */
    function isEven(_, number) {
        return !isOdd(_, number)
    }

    /**
     * @param {Element} element
     * @param {Element|ShadowRoot} tree
     * @returns {string}
     */
    function serializeElement({ attributes, localName }) {
        let string = `<${localName.toLowerCase()}`
        for (let index = 0; index < attributes.length; index++) {
            const { localName, value } = attributes.item(index)
            string += ` ${value ? `${localName}="${value}"` : localName}`
        }
        string += '>'
        return string
    }

    class CSSAssert extends Assert {

        /**
         * @param {string} selector
         * @param {Element[]} elements
         * @param {Document|Element|ShadowRoot} tree
         * @param {object} [context]
         * @param {object} [options]
         * @returns {*[]}
         */
        match(selector, elements = [], tree, { namespaces: ns = {}, ...context } = {}, options = { includeSubtrees: true }) {

            const ctx = createContext()
            const { namespaces } = ctx

            Object.entries(ns).forEach(([key, value]) => namespaces.set(key, value))

            const selectorList = parseGrammar(selector, '<selector-list>', ctx)
            const matched = matchTreesAgainstSelectors([tree], selectorList, { ...context, namespaces }, options)
            const length = Math.max(elements.length, matched.length)

            for (let index = 0; index < length; index++) {
                let actual = matched[index]
                let expected = elements[index]
                if (expected === actual) {
                    continue
                }
                let message
                if (actual) {
                    actual = serializeElement(actual)
                    if (expected) {
                        expected = serializeElement(expected)
                        message = `Matched ${actual} instead of ${expected} against ${selector}`
                    } else {
                        message = `Unexpected match of ${actual} against ${selector}`
                    }
                } else {
                    expected = serializeElement(expected)
                    message = `Failed to match ${expected} against ${selector}`
                }
                throw new AssertionError({ actual, expected, message, operator: selector })
            }
        }
    }

    const assert = new CSSAssert({ skipPrototype: true })

    test('type', () => {

        /**
         * <html>
         *   <body>
         *     <div>
         *       #shadow-root
         *         <div></div>
         *     </div>
         *     <DIV></DIV>
         *     <svg></svg>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const host = new HTMLDivElement({ ownerDocument: document, parentNode: body })
        const shadowRoot = new ShadowRoot({ host, ownerDocument: document })
        const shadowDiv = new HTMLDivElement({ ownerDocument: document, parentNode: shadowRoot })
        const noNamespace = new Element({ localName: 'DIV', ownerDocument: document, parentNode: body })
        const svg = new SVGSVGElement({ ownerDocument: document, parentNode: body })

        const selections = [
            ['*', [html, body, host, shadowDiv, noNamespace, svg]],
            ['*', [html, body, host, noNamespace, svg], document, { scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['*', [html, body, host, shadowDiv], document, { namespaces: { '': HTML_NAMESPACE } }],
            ['*', [html, body, host], document, { namespaces: { '': HTML_NAMESPACE }, scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['*', [shadowDiv], shadowRoot],
            ['*', [shadowDiv], shadowRoot, { scopes: { roots: [shadowRoot] } }, { includeSubtrees: false }],
            ['|*', [noNamespace]],
            ['|*', [noNamespace], document, { scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['*|*', [html, body, host, shadowDiv, noNamespace, svg]],
            ['prefix|*', [html, body, host, shadowDiv], document, { namespaces: { prefix: HTML_NAMESPACE } }],
            ['prefix|*', [html, body, host], document, { namespaces: { prefix: HTML_NAMESPACE }, scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['html|*', [svg], document, { namespaces: { html: SVG_NAMESPACE } }],
            ['div', [host, shadowDiv]],
            ['div', [host, shadowDiv], document, { namespaces: { '': HTML_NAMESPACE } }],
            ['DIV', [host, shadowDiv, noNamespace]],
            ['svg', [svg]],
            ['SVG', []],
        ]
        selections.forEach(([selector, expected, tree = document, context, options]) =>
            assert.match(selector, expected, tree, context, options))
    })
    test('id', () => {

        /**
         * <html>
         *   <body>
         *     <div id="div"></div>
         *     <div id="div"></div>
         *     <div id="div"></div>
         *     <div id="1"></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const div = new HTMLDivElement({
            attributes: [{ localName: 'id', value: 'div' }],
            ownerDocument: document,
            parentNode: body,
        })
        const noNamespace = new Element({
            attributes: [{ localName: 'id', value: 'div' }],
            localName: 'div',
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'id', namespaceURI: SVG_NAMESPACE, value: 'div' }],
            ownerDocument: document,
            parentNode: body,
        })
        const one = new HTMLDivElement({
            attributes: [{ localName: 'id', value: '1' }],
            ownerDocument: document,
            parentNode: body,
        })

        assert.match('#div', [div, noNamespace], document)
        assert.match('#div', [div, noNamespace], document, { scopes: { roots: [document] } }, { includeSubtrees: false })
        assert.match('#div', [div, noNamespace], document, { namespaces: { '': HTML_NAMESPACE } })
        assert.match('#div', [div, noNamespace], document, { namespaces: { '': HTML_NAMESPACE }, scopes: { roots: [document] } }, { includeSubtrees: false })
        assert.match('#DIV', [], document)
        assert.match('#DIV', [], document, { scopes: { roots: [document] } }, { includeSubtrees: false })
        assert.match('#\\31', [one], document)
        assert.match('#\\31', [one], document, { scopes: { roots: [document] } }, { includeSubtrees: false })
    })
    test('class', () => {

        /**
         * <html>
         *   <body>
         *     <div class="class-1 class-2"></div>
         *     <div class="class-1"></div>
         *     <div class="class-1"></div>
         *     <div class="1"></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const div = new HTMLDivElement({
            attributes: [{ localName: 'class', value: 'class-1 class-2' }],
            ownerDocument: document,
            parentNode: body,
        })
        const noNamespace = new Element({
            attributes: [{ localName: 'class', value: 'class-1' }],
            localName: 'div',
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'class', namespaceURI: SVG_NAMESPACE, value: 'class-1' }],
            ownerDocument: document,
            parentNode: body,
        })
        const one = new HTMLDivElement({
            attributes: [{ localName: 'class', value: '1' }],
            ownerDocument: document,
            parentNode: body,
        })

        const selections = [
            ['.class-1', [div, noNamespace]],
            ['.class-1', [div, noNamespace], { scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['.class-1', [div, noNamespace], { namespaces: { '': HTML_NAMESPACE } }],
            ['.class-1', [div, noNamespace], { namespaces: { '': HTML_NAMESPACE }, scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['.CLASS-1', []],
            ['.CLASS-1', [], { scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['.class-1.class-2', [div]],
            ['.class-1.class-2', [div], { scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['.\\31', [one]],
            ['.\\31', [one], { scopes: { roots: [document] } }, { includeSubtrees: false }],
        ]
        selections.forEach(([selector, expected, context, options]) =>
            assert.match(selector, expected, document, context, options))
    })
    test('attribute', () => {

        /**
         * <html>
         *   <body>
         *     <div id="div" class="class-1 class-2" empty=""></div>
         *     <div id="no-namespace"></div>
         *     <svg viewBox="0 0 1 1">
         *       <use xlink:href />
         *     </svg>
         *     <div 1="1"></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const div = new HTMLDivElement({
            attributes: [
                { localName: 'id', value: 'div' },
                { localName: 'class', value: 'class-1 class-2' },
                { localName: 'color', value: '#fff' },
                { localName: 'empty' },
            ],
            ownerDocument: document,
            parentNode: body,
        })
        const noNamespace = new Element({
            attributes: [{ localName: 'id', value: 'no-namespace' }],
            localName: 'div',
            ownerDocument: document,
            parentNode: body,
        })
        const svg = new SVGSVGElement({
            attributes: [
                { localName: 'id', namespaceURI: SVG_NAMESPACE, value: 'svg' },
                { localName: 'viewBox', value: '0 0 1 1' },
            ],
            ownerDocument: document,
            parentNode: body,
        })
        const use = new SVGUseElement({
            attributes: [{ localName: 'href', namespaceURI: XLINK_NAMESPACE, prefix: 'xlink' }],
            ownerDocument: document,
            parentNode: svg,
        })
        const one = new HTMLDivElement({
            attributes: [{ localName: '1', value: '1' }],
            ownerDocument: document,
            parentNode: body,
        })

        const selections = [
            ['[id]', [div, noNamespace]],
            ['[id]', [div, noNamespace], { scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['[ID]', [div]],
            ['[id]', [div, noNamespace], { namespaces: { '': HTML_NAMESPACE } }],
            ['[viewBox]', [svg]],
            ['[VIEWBOX]', []],
            ['[href]'],
            ['[|id]', [div, noNamespace]],
            ['[|href]'],
            ['[*|id]', [div, noNamespace, svg]],
            ['[*|href]', [use]],
            ['[another-prefix|href]', [use], { namespaces: { 'another-prefix': XLINK_NAMESPACE } }],
            ['[xlink|href]', [], { namespaces: { xlink: 'http://www.w3.org/1999/another-xlink' } }],
            ['[id=div]', [div]],
            ['[ID=div]', [div]],
            ['[id=DIV]', []],
            ['[id=DIV i]', [div]],
            ['[\\31=\\31]', [one]],
            ['[color="#FFF"]', [div]],
            ['[color="#FFF" s]', []],
            ['[class~=class-1]', [div]],
            ['[class~="class-1"]', [div]],
            ['[class|=class]', [div]],
            ['[class^=class-1]', [div]],
            ['[class$=class-2]', [div]],
            ['[class*=class]', [div]],
            ['[empty=""]', [div]],
            ['[empty~=""]'],
            ['[empty|=""]', [div]],
            ['[empty^=""]'],
            ['[empty$=""]'],
            ['[empty*=""]'],
        ]
        selections.forEach(([selector, expected, context, options]) =>
            assert.match(selector, expected, document, context, options))
    })
    test('pseudo-element', () => {

        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const highlight = CSSPseudoElement.createImpl(globalThis, {
            element: html,
            parent: html,
            selectorText: '::highlight(identifier)',
            type: '::highlight',
        })

        const selectors = ['::highlight(identifier)', 'html::highlight(identifier)']

        selectors.forEach(selector => {
            selector = parseGrammar(selector, '<selector-list>')
            assert.equal(!!matchPseudoElementAgainstSelectors(highlight, selector), true)
        })
    })

    test('complex', () => {

        /**
         * <html>
         *   <body>
         *     <section></section>
         *     <div></div>
         *     <div></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const section = new HTMLElement({ localName: 'section', ownerDocument: document, parentNode: body })
        const div1 = new HTMLDivElement({ ownerDocument: document, parentNode: body })
        const div2 = new HTMLDivElement({ ownerDocument: document, parentNode: body })

        const selections = [
            ['html *', [body, section, div1, div2]],
            ['html *', [body, section, div1, div2], { scopes: { roots: [document] } }, { includeSubtrees: false }],
            ['body > *', [section, div1, div2]],
            ['section + *', [div1]],
            ['section ~ *', [div1, div2]],
            ['html body section', [section]],
        ]
        selections.forEach(([selector, expected, context]) =>
            assert.match(selector, expected, document, context))
    })

    // Display
    test(':fullscreen, :modal, :open, :picture-in-picture, :popover-open', () => {

        /**
         * <html>
         *   <body>
         *     <details></details>
         *     <dialog></dialog>
         *     <details open></details>
         *     <dialog open></dialog>
         *     <div>
         *       #shadow-root
         *         <video></video>
         *     </div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({
            ownerDocument: document,
            parentNode: document,
        })
        const body = new HTMLBodyElement({
            fullscreen: true,
            ownerDocument: document,
            parentNode: html,
            pictureInPicture: true,
        })
        new HTMLDetailsElement({
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDialogElement({
            ownerDocument: document,
            parentNode: body,
        })
        const openDetails = new HTMLDetailsElement({
            attributes: [{ localName: 'open', value: 'true' }],
            ownerDocument: document,
            parentNode: body,
        })
        const openDialog = new HTMLDialogElement({
            attributes: [{ localName: 'open', value: 'true' }],
            ownerDocument: document,
            parentNode: body,
        })
        const host = new HTMLDivElement({
            fullscreen: true,
            ownerDocument: document,
            parentNode: body,
            pictureInPicture: true,
        })
        const shadowRoot = new ShadowRoot({
            host,
            ownerDocument: document,
        })
        const video = new HTMLVideoElement({
            fullscreen: true,
            ownerDocument: document,
            parentNode: shadowRoot,
            pictureInPicture: true,
        })

        const selections = [
            [':fullscreen', [host, video]],
            [':modal', [host, video]],
            [':open', [openDetails, openDialog]],
            [':picture-in-picture', [host, video]],
        ]
        selections.forEach(selection => assert.match(...selection, document))
    })
    // Form
    test(':blank', () => {

        /**
         * <html>
         *   <body>
         *     <form>
         *
         *       <!-- not :blank -->
         *       <button></button>
         *       <input type="button">
         *       <input type="checkbox" checked>
         *       <input type="color">
         *       <input type="color" value>
         *       <input type="image">
         *       <input type="number">  <!-- the user set `value` to "1" -->
         *       <input type="radio" checked>
         *       <input type="reset">
         *       <input type="submit">
         *       <select>
         *         <option></option>
         *       </select>
         *       <select multiple>
         *         <option selected></option>
         *       </select>
         *       <textarea>value</textarea>
         *
         *       <!-- :blank -->
         *       <input type="checkbox" disabled readonly>
         *       <input type="checkbox" value="value">
         *       <input type="number" value="1">  <!-- the user set `value` to "" -->
         *       <input type="radio">
         *       <select value="value"></select>
         *       <select multiple>
         *         <option></option>
         *       </select>
         *       <textarea value="value"></textarea>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const form = new HTMLFormElement({ ownerDocument: document, parentNode: body })

        // Not :blank
        new HTMLButtonElement({
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'button' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'checked' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'color' }],
            form,
            ownerDocument: document,
            parentNode: form,
            value: '#000000',
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'color' },
                { localName: 'value' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            value: '#000000',
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'image' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'number' }],
            form,
            ownerDocument: document,
            parentNode: form,
            value: '1',
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'checked' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'reset' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'submit' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLSelectElement({
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'multiple' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
        })
        new HTMLTextAreaElement({
            form,
            ownerDocument: document,
            parentNode: form,
            value: 'value',
        })

        // :blank
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'value', value: 'value' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'value', value: '1' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
            value: '',
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'radio' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'value', value: 'value' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'multiple' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'value', value: 'value' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
        })

        assert.match(':blank', document._selected.get(':blank'), document)
    })
    test(':checked, :unchecked', () => {

        /**
         * <html>
         *   <body>
         *     <form>
         *
         *       <!-- neither :checked or :unchecked -->
         *       <div type="checkbox" checked="true"></div>
         *
         *       <!-- :unchecked -->
         *       <input type="checkbox" checked="true">  <!-- the user unchecked the input -->
         *       <input type="radio" checked="true">     <!-- the user unchecked the input -->
         *       <select multiple>
         *         <option selected></option>            <!-- the user unselected the option -->
         *         <option></option>
         *       </select>
         *
         *       <!-- :checked -->
         *       <input type="checkbox" checked disabled readonly>
         *       <input type="checkbox">                 <!-- the user checked the input -->
         *       <input type="radio">                    <!-- the user checked the input -->
         *       <select>
         *         <option></option>
         *       </select>
         *       <select multiple>
         *         <option selected></option>
         *         <option selected></option>
         *       </select>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const form = new HTMLFormElement({ ownerDocument: document, parentNode: body })

        // Neither :checked or :unchecked
        new HTMLDivElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'checked', value: 'true' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })

        // :unchecked
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'checked', value: 'true' },
            ],
            checked: false,
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':unchecked'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'checked', value: 'true' },
            ],
            checked: false,
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':unchecked'],
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'multiple' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selected: false,
            selectors: [':unchecked'],
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':unchecked'],
        })

        // :checked
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'checked' },
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':checked'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            checked: true,
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':checked'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'radio' }],
            checked: true,
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':checked'],
        })
        new HTMLSelectElement({
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':checked'],
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'multiple' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':checked'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':checked'],
        })

        assert.match(':unchecked', document._selected.get(':unchecked'), document)
        assert.match(':checked', document._selected.get(':checked'), document)
    })
    test(':default', () => {

        /**
         * <html>
         *   <body>
         *
         *     <form id="form-1">
         *
         *       <!-- :default -->
         *       <button disabled readonly></button>
         *
         *       <input type="image">
         *       <input type="submit">
         *
         *     </form>
         *
         *     <form id="form-2">
         *
         *       <button type="button"></button>
         *       <button type="reset"></button>
         *       <input type="button">
         *       <input type="reset">
         *
         *     </form>
         *
         *     <form id="form-3">
         *
         *       <button form="form-1"></button>
         *
         *       <!-- :default -->
         *       <button form="form-2"></button>
         *       <input type="image">
         *
         *       <button></button>
         *       <input type="submit">
         *
         *     </form>
         *
         *     <form id="form-4">
         *
         *       <select>
         *         <option></option>
         *       </select>
         *
         *       <!-- :default -->
         *       <input type="checkbox" checked disabled readonly>  <!-- the user unchecked the input -->
         *       <input type="radio" checked>  <!-- the user unchecked the input -->
         *       <input type="submit">
         *       <select>
         *         <option selected></option>
         *         <option selected></option>
         *       </select>
         *       <select multiple>
         *         <option selected></option>  <!-- the user unselected the option -->
         *         <option selected></option>
         *       </select>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        const form1 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-1' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLButtonElement({
            attributes: [
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            form: form1,
            ownerDocument: document,
            parentNode: form1,
            selectors: [':default'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'image' }],
            form: form1,
            ownerDocument: document,
            parentNode: form1,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'submit' }],
            form: form1,
            ownerDocument: document,
            parentNode: form1,
        })

        const form2 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-2' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLButtonElement({
            attributes: [{ localName: 'type', value: 'button' }],
            form: form2,
            ownerDocument: document,
            parentNode: form2,
        })
        new HTMLButtonElement({
            attributes: [{ localName: 'type', value: 'reset' }],
            form: form2,
            ownerDocument: document,
            parentNode: form2,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'button' }],
            form: form2,
            ownerDocument: document,
            parentNode: form2,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'reset' }],
            form: form2,
            ownerDocument: document,
            parentNode: form2,
        })

        const form3 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-3' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLButtonElement({
            attributes: [{ localName: 'form', value: 'form-1' }],
            form: form1,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLButtonElement({
            attributes: [{ localName: 'form', value: 'form-2' }],
            form: form2,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':default'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'image' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':default'],
        })
        new HTMLButtonElement({
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'submit' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })

        const form4 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-4' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLSelectElement({
            form: form4,
            ownerDocument: document,
            parentNode: form4,
        })
        new HTMLOptionElement({
            form: form4,
            ownerDocument: document,
            parentNode: form4.childNodes._list.at(-1),
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'checked' },
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            checked: false,
            form: form4,
            ownerDocument: document,
            parentNode: form4,
            selectors: [':default'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'checked' },
            ],
            checked: false,
            form: form4,
            ownerDocument: document,
            parentNode: form4,
            selectors: [':default'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'submit' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4,
            selectors: [':default'],
        })
        new HTMLSelectElement({
            form: form4,
            ownerDocument: document,
            parentNode: form4,
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4.childNodes._list.at(-1),
            selectors: [':default'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4.childNodes._list.at(-1),
            selectors: [':default'],
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'multiple' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4,
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4.childNodes._list.at(-1),
            selected: false,
            selectors: [':default'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4.childNodes._list.at(-1),
            selectors: [':default'],
        })

        assert.match(':default', document._selected.get(':default'), document)
    })
    test(':disabled, :enabled', () => {

        /**
         * <html>
         *   <body>
         *     <form disabled>
         *
         *       <button disabled></button>
         *       <input disabled>
         *       <select disabled>
         *         <optgroup>
         *           <option></option>
         *         </optgroup>
         *       </select>
         *       <select>
         *         <optgroup disabled>
         *           <option></option>
         *         </optgroup>
         *         <option disabled></option>
         *       </select>
         *       <textarea disabled></textarea>
         *
         *       <fieldset disabled>
         *
         *         <legend disabled>
         *           <button></button>
         *           <fieldset></fieldset>
         *           <input>
         *           <select>
         *             <optgroup>
         *               <option></option>
         *             </optgroup>
         *           </select>
         *           <textarea></textarea>
         *         </legend>
         *
         *         <datalist disabled>
         *           <option></option>
         *         </datalist>
         *
         *         <fieldset>
         *           <legend>
         *             <input>
         *           </legend
         *           <button></button>
         *           <input>
         *           <select>
         *             <optgroup>
         *               <option></option>
         *             </optgroup>
         *           </select>
         *           <textarea></textarea>
         *         </fieldset>
         *
         *       </fieldset>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const form = new HTMLFormElement({
            attributes: [{ localName: 'disabled' }],
            ownerDocument: document,
            parentNode: body,
        })

        new HTMLButtonElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':disabled'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':disabled'],
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':disabled'],
        })
        new HTMLOptGroupElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':enabled'],
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1).childNodes._list.at(-1),
            selectors: [':enabled'],
        })
        new HTMLSelectElement({
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':enabled'],
        })
        new HTMLOptGroupElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':disabled'],
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1).childNodes._list.at(-1),
            selectors: [':disabled'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':disabled'],
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':disabled'],
        })

        const disabledFieldSet = new HTMLFieldSetElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':disabled'],
        })
        const legend = new HTMLLegendElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: disabledFieldSet,
        })
        new HTMLButtonElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: legend,
            selectors: [':enabled'],
        })
        new HTMLFieldSetElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: legend,
            selectors: [':enabled'],
        })
        new HTMLInputElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: legend,
            selectors: [':enabled'],
        })
        new HTMLSelectElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: legend,
            selectors: [':enabled'],
        })
        new HTMLOptGroupElement({
            ownerDocument: document,
            parentNode: legend.childNodes._list.at(-1),
            selectors: [':enabled'],
        })
        new HTMLOptionElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: legend.childNodes._list.at(-1).childNodes._list.at(-1),
            selectors: [':enabled'],
        })
        new HTMLTextAreaElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: legend,
            selectors: [':enabled'],
        })
        new HTMLDataListElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: disabledFieldSet,
        })
        new HTMLOptionElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: disabledFieldSet,
            selectors: [':enabled'],
        })
        const fieldSet = new HTMLFieldSetElement({
            form,
            ownerDocument: document,
            parentNode: disabledFieldSet,
            selectors: [':disabled'],
        })
        new HTMLLegendElement({
            form,
            ownerDocument: document,
            parentNode: fieldSet,
        })
        new HTMLInputElement({
            fieldSet,
            form,
            ownerDocument: document,
            parentNode: fieldSet.childNodes._list.at(-1),
            selectors: [':disabled'],
        })
        new HTMLButtonElement({
            fieldSet,
            form,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':disabled'],
        })
        new HTMLInputElement({
            fieldSet,
            form,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':disabled'],
        })
        new HTMLSelectElement({
            fieldSet,
            form,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':disabled'],
        })
        new HTMLOptGroupElement({
            ownerDocument: document,
            parentNode: fieldSet.childNodes._list.at(-1),
            selectors: [':enabled'],
        })
        new HTMLOptionElement({
            ownerDocument: document,
            parentNode: fieldSet.childNodes._list.at(-1).childNodes._list.at(-1),
            selectors: [':enabled'],
        })
        new HTMLTextAreaElement({
            fieldSet,
            form,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':disabled'],
        })

        assert.match(':disabled', document._selected.get(':disabled'), document)
        assert.match(':enabled', document._selected.get(':enabled'), document)
    })
    test(':high-value, :low-value, :optimal-value', () => {

        /**
         * <html>
         *   <body>
         *
         *     <!-- neither :high-value, :low-value, or :optimal-value -->
         *     <div min="0" low="1" value="2" high="3" max="4" optimum="2"></div>
         *     <meter value="-1"></meter>
         *     <meter value="2"></meter>
         *
         *     <!-- :low-value -->
         *     <meter low="1" optimum="1"></meter>
         *     <meter high="1" optimum="2" max="2"></meter>
         *
         *     <!-- :high-value -->
         *     <meter optimum="0" high="0" value="1"></meter>
         *     <meter optimum="0" low="1" value="2" max="2"></meter>
         *
         *     <!-- :optimal-value -->
         *     <meter></meter>
         *     <meter value="1"></meter>
         *     <meter optimum="0"></meter>
         *     <meter optimum="0" value="1"></meter>
         *     <meter optimum="1"></meter>
         *     <meter optimum="1" value="1"></meter>
         *     <meter optimum="0" low="1"></meter>
         *     <meter optimum="0" low="1" value="1"></meter>
         *     <meter high="1" value="1" optimum="2" max="2"></meter>
         *     <meter high="1" value="2" optimum="2" max="2"></meter>
         *
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        new HTMLDivElement({
            attributes: [
                { localName: 'min', value: '0' },
                { localName: 'low', value: '1' },
                { localName: 'value', value: '2' },
                { localName: 'high', value: '3' },
                { localName: 'max', value: '4' },
                { localName: 'optimum', value: '2' },
            ],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLMeterElement({
            attributes: [{ localName: 'value', value: '-1' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLMeterElement({
            attributes: [{ localName: 'value', value: '2' }],
            ownerDocument: document,
            parentNode: body,
        })

        const low = [
            new HTMLMeterElement({
                attributes: [
                    { localName: 'low', value: '1' },
                    { localName: 'optimum', value: '1' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'high', value: '1' },
                    { localName: 'optimum', value: '2' },
                    { localName: 'max', value: '2' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
        ]
        const high = [
            new HTMLMeterElement({
                attributes: [
                    { localName: 'optimum', value: '0' },
                    { localName: 'high', value: '0' },
                    { localName: 'value', value: '1' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'optimum', value: '0' },
                    { localName: 'low', value: '1' },
                    { localName: 'value', value: '2' },
                    { localName: 'max', value: '2' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
        ]
        const optimal = [
            new HTMLMeterElement({
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [{ localName: 'value', value: '1' }],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [{ localName: 'optimum', value: '0' }],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'optimum', value: '0' },
                    { localName: 'value', value: '1' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [{ localName: 'optimum', value: '1' }],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'optimum', value: '1' },
                    { localName: 'value', value: '1' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'optimum', value: '0' },
                    { localName: 'low', value: '1' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'optimum', value: '0' },
                    { localName: 'low', value: '1' },
                    { localName: 'value', value: '1' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'high', value: '1' },
                    { localName: 'value', value: '1' },
                    { localName: 'optimum', value: '2' },
                    { localName: 'max', value: '2' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
            new HTMLMeterElement({
                attributes: [
                    { localName: 'high', value: '1' },
                    { localName: 'value', value: '2' },
                    { localName: 'optimum', value: '2' },
                    { localName: 'max', value: '2' },
                ],
                ownerDocument: document,
                parentNode: body,
            }),
        ]

        assert.match(':low-value', low, document)
        assert.match(':high-value', high, document)
        assert.match(':optimal-value', optimal, document)
    })
    test(':in-range, :out-of-range', () => {

        /**
         * <html>
         *   <body>
         *     <form>
         *
         *       <!-- neither :in-range or :out-of-range -->
         *       <meter min="0" value="1" max="2"></meter>
         *       <input type="number" min="0" value="1" disabled>
         *       <input type="number" min="0" value="1" readonly>
         *       <input type="range" min="0" value="1" readonly>
         *       <datalist>
         *         <input type="number" min="0" value="1">
         *       </datalist>
         *
         *       <!-- :out-of-range -->
         *       <input type="date" min="2000-01-01" value="1999-12-31">
         *       <input type="date" value="2000-01-02" max="2000-01-01">
         *       <input type="datetime-local" min="2000-01-01T00:00" value="1999-12-31T00:00">
         *       <input type="datetime-local" value="2000-01-01T00:01" max="2000-01-01T00:00">
         *       <input type="month" min="2000-01" value="1999-12">
         *       <input type="month" value="2000-02" max="2000-01">
         *       <input type="number" min="0" value="-1">
         *       <input type="number" value="1" max="0">
         *       <input type="range" min="0" value="-1">
         *       <input type="range" value="1"   max="0">
         *       <input type="time" min="00:01" value="00:00">
         *       <input type="time" value="00:02" max="00:01">
         *       <input type="week" min="2000-W01" value="1999-W52">
         *       <input type="week" value="2000-W02" max="2000-W01">
         *
         *       <!-- :in-range -->
         *       <input type="date" min="2000-01-01" value="1999-12-31" max="2000-01-02">  <!-- the user set `value` to empty string -->
         *       <input type="date" min="1999-12-31" max="2000-01-02">                     <!-- the user set `value` to "2000-01-01" -->
         *       <input type="date" min="2000-01-01" value="2000-01-01" max="2000-01-01">
         *       <input type="datetime-local" min="1999-12-31T00:00" value="2000-01-01T00:00" max="2000-01-01T00:01">
         *       <input type="month" min="1999-12" value="2000-01" max="2000-02">
         *       <input type="number" min="0" value="1" max="2">
         *       <input type="range" min="0" value="0.5" max="1" step="1">
         *       <input type="time" min="00:00" value="00:01" max="00:02">
         *       <input type="week" min="2000-W01" value="2000-W02" max="2000-W03">
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const form = new HTMLFormElement({ ownerDocument: document, parentNode: body })

        // Neither :in-range or :out-of-range
        new HTMLMeterElement({
            attributes: [
                { localName: 'min', value: '0' },
                { localName: 'value', value: '1' },
                { localName: 'max', value: '0' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '1' },
                { localName: 'disabled', namespaceURI: null },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '1' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '1' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLDataListElement({
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '1' },
            ],
            form,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
        })

        // :out-of-range
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'min', value: '2000-01-01' },
                { localName: 'value', value: '1999-12-31' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'value', value: '2000-01-02' },
                { localName: 'max', value: '2000-01-01' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'datetime-local' },
                { localName: 'min', value: '2000-01-01T00:00' },
                { localName: 'value', value: '1999-12-31T00:00' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'datetime-local' },
                { localName: 'value', value: '2000-01-01T00:01' },
                { localName: 'max', value: '2000-01-01T00:00' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'month' },
                { localName: 'min', value: '2000-01' },
                { localName: 'value', value: '1999-12' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'month' },
                { localName: 'value', value: '2000-02' },
                { localName: 'max', value: '2000-01' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '-1' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'value', value: '1' },
                { localName: 'max', value: '0' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '-1' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'value', value: '1' },
                { localName: 'max', value: '0' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'time' },
                { localName: 'min', value: '00:01' },
                { localName: 'value', value: '00:00' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'time' },
                { localName: 'value', value: '00:02' },
                { localName: 'max', value: '00:01' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'week' },
                { localName: 'min', value: '2000-W01' },
                { localName: 'value', value: '1999-W52' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'week' },
                { localName: 'value', value: '2000-W02' },
                { localName: 'max', value: '2000-W01' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':out-of-range'],
        })

        // :in-range
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'min', value: '2000-01-01' },
                { localName: 'value', value: '1999-12-31' },
                { localName: 'max', value: '2000-01-02' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
            value: '',
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'min', value: '1999-12-31' },
                { localName: 'max', value: '2000-01-02' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
            value: '2000-01-01',
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'min', value: '2000-01-01' },
                { localName: 'value', value: '2000-01-01' },
                { localName: 'max', value: '2000-01-01' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'datetime-local' },
                { localName: 'min', value: '1999-12-31T00:00' },
                { localName: 'value', value: '2000-01-01T00:00' },
                { localName: 'max', value: '2000-01-01T00:01' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'month' },
                { localName: 'min', value: '1999-12' },
                { localName: 'value', value: '2000-01' },
                { localName: 'max', value: '2000-02' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '1' },
                { localName: 'max', value: '2' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'min', value: '0' },
                { localName: 'value', value: '0.5' },
                { localName: 'max', value: '1' },
                { localName: 'step', value: '1' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'time' },
                { localName: 'min', value: '00:00' },
                { localName: 'value', value: '00:01' },
                { localName: 'max', value: '00:02' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'week' },
                { localName: 'min', value: '2000-W01' },
                { localName: 'value', value: '2000-W02' },
                { localName: 'max', value: '2000-W03' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':in-range'],
        })

        assert.match(':out-of-range', document._selected.get(':out-of-range'), document)
        assert.match(':in-range', document._selected.get(':in-range'), document)
    })
    test(':invalid, :valid', () => {

        /**
         * <html>
         *   <body>
         *
         *     <!-- :valid -->
         *     <form id="form-1"></form>
         *
         *     <!-- :invalid -->
         *     <form id="form-2">
         *       <!-- :valid -->
         *       <fieldset></fieldset>
         *     </form>
         *
         *     <!-- :valid -->
         *     <form id="form-3">
         *
         *       <!-- neither :valid or :invalid -->
         *       <div></div>  <!-- the user set `validity` to { valid: true } -->
         *       <button type="button"></button>
         *       <button type="reset"></button>
         *       <button type="submit" disabled></button>
         *       <input type="button">
         *       <input type="hidden">
         *       <input type="range" disabled>
         *       <input type="range" readonly>
         *       <input type="reset">
         *       <select disabled></select>
         *       <textarea disabled></textarea>
         *       <textarea readonly></textarea>
         *       <datalist>
         *         <div>
         *           <input>
         *           <select></select>
         *           <textarea></textarea>
         *         </div>
         *       </datalist>
         *
         *       <!-- :invalid -->
         *       <fieldset>
         *         <input type="number" form="form-2" required>
         *         <select form="form-2" readonly required></select>
         *         <textarea form="form-2" required></textarea>
         *       </fieldset>
         *
         *       <!-- :valid -->
         *       <button type="submit" readonly required></button>
         *       <input type="image" required>
         *       <input type="number">
         *       <input type="range" required>
         *       <input type="submit" required>
         *       <select readonly multiple>
         *         <option></option>
         *       </select>
         *       <textarea></textarea>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-1' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':valid'],
        })

        const form2 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-2' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':invalid'],
        })
        new HTMLFieldSetElement({
            form: form2,
            ownerDocument: document,
            parentNode: form2,
            selectors: [':valid'],
        })

        const form3 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-3' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':valid'],
        })

        // Neither :valid or :invalid
        const div = new HTMLDivElement({
            ownerDocument: document,
            parentNode: form3,
        })
        div.valididity = { valid: true }
        new HTMLButtonElement({
            attributes: [{ localName: 'type', value: 'button' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLButtonElement({
            attributes: [{ localName: 'type', value: 'reset' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLButtonElement({
            attributes: [
                { localName: 'type', value: 'submit' },
                { localName: 'disabled' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'button' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'hidden' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'disabled' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'readonly' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'reset' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'disabled' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'disabled' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'readonly' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
        })
        new HTMLDataListElement({
            ownerDocument: document,
            parentNode: form3,
        })
        const wrapper = new HTMLDivElement({
            ownerDocument: document,
            parentNode: form3.childNodes._list.at(-1),
        })
        new HTMLInputElement({
            ownerDocument: document,
            parentNode: wrapper,
        })
        new HTMLSelectElement({
            ownerDocument: document,
            parentNode: wrapper,
        })
        new HTMLTextAreaElement({
            ownerDocument: document,
            parentNode: wrapper,
        })

        // :invalid
        const fieldSet = new HTMLFieldSetElement({
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':invalid'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'form', value: 'form-2' },
                { localName: 'required' },
            ],
            fieldSet,
            form: form2,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':invalid'],
        })
        new HTMLSelectElement({
            attributes: [
                { localName: 'form', value: 'form-2' },
                { localName: 'readonly' },
                { localName: 'required' },
            ],
            fieldSet,
            form: form2,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':invalid'],
        })
        new HTMLTextAreaElement({
            attributes: [
                { localName: 'form', value: 'form-2' },
                { localName: 'required' },
            ],
            fieldSet,
            form: form2,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':invalid'],
        })

        // :valid
        new HTMLButtonElement({
            attributes: [
                { localName: 'type', value: 'submit' },
                { localName: 'readonly' },
                { localName: 'required' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'image' },
                { localName: 'required' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'number' }],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'required' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'submit' },
                { localName: 'required' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })
        new HTMLSelectElement({
            attributes: [
                { localName: 'readonly' },
                { localName: 'multiple' },
            ],
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })
        new HTMLOptionElement({
            form: form3,
            ownerDocument: document,
            parentNode: form3.childNodes._list.at(-1),
        })
        new HTMLTextAreaElement({
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })

        assert.match(':valid', document._selected.get(':valid'), document)
        assert.match(':invalid', document._selected.get(':invalid'), document)
    })
    test(':indeterminate', () => {

        /**
         * <html>
         *   <body>
         *
         *     <!-- not :indeterminate -->
         *     <input type="radio" name="shadow">
         *     <input type="radio" name="shadow" checked>
         *     <form id="form">
         *       <input type="checkbox">
         *       <div type="checkbox"></div>                <!-- the user set `indeterminate` to `true` -->
         *       <input type="radio" name="">               <!-- the user set `indeterminate` to `true` -->
         *       <input type="radio" name="group" checked>  <!-- the user set `indeterminate` to `true` -->
         *       <progress value=""></progress>             <!-- the user set `indeterminate` to `true` -->
         *     </form>
         *     <form>
         *       <input type="radio" form="form" name="group">
         *     </form>
         *
         *     <!-- :indeterminate -->
         *     <input type="checkbox">                      <!-- the user set `indeterminate` to `true` -->
         *     <input type="checkbox" disabled readonly>    <!-- the user set `indeterminate` to `true` -->
         *     <input type="radio" name=" ">
         *     <input type="radio" name="group">
         *     <div>
         *       #shadow-root
         *         <input type="radio" name="shadow">
         *     </div>
         *     <progress></progress>
         *
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        // Not :indeterminate
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: 'shadow' },
            ],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: 'shadow' },
                { localName: 'checked' },
            ],
            ownerDocument: document,
            parentNode: body,
        })
        const form = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form,
            indeterminate: true,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name' },
            ],
            form,
            indeterminate: true,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: 'group' },
                { localName: 'checked' },
            ],
            form,
            indeterminate: true,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLProgressElement({
            attributes: [{ localName: 'value' }],
            indeterminate: true,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLFormElement({
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'form', value: 'form' },
                { localName: 'name', value: 'group' },
            ],
            form,
            ownerDocument: document,
            parentNode: body.childNodes._list.at(-1),
        })

        // :indeterminate
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            indeterminate: true,
            ownerDocument: document,
            parentNode: body,
            selectors: [':indeterminate'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            indeterminate: true,
            ownerDocument: document,
            parentNode: body,
            selectors: [':indeterminate'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: ' ' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':indeterminate'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: 'group' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':indeterminate'],
        })
        new HTMLDivElement({
            ownerDocument: document,
            parentNode: body,
        })
        const shadowRoot = new ShadowRoot({
            host: body.childNodes._list.at(-1),
            ownerDocument: document,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: 'shadow' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot,
            selectors: [':indeterminate'],
        })
        new HTMLProgressElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':indeterminate'],
        })

        assert.match(':indeterminate', document._selected.get(':indeterminate'), document)
    })
    test(':optional, :required', () => {

        /**
         * <html>
         *   <body>
         *     <form>
         *
         *       <!-- neither :optional or :required -->
         *       <button type="checkbox"></button>
         *       <input type="button">
         *       <input type="color">
         *       <input type="hidden">
         *       <input type="image">
         *       <input type="range">
         *       <input type="reset">
         *       <input type="submit">
         *       <button type="checkbox" required></button>
         *       <input type="button" required>
         *       <input type="color" required>
         *       <input type="hidden" required>
         *       <input type="image" required>
         *       <input type="range" required>
         *       <input type="reset" required>
         *       <input type="submit" required>
         *
         *       <!-- :optional -->
         *       <input type="checkbox">
         *       <input type="date">
         *       <input type="datetime-local">
         *       <input type="email">
         *       <input type="file">
         *       <input type="month">
         *       <input type="number">
         *       <input type="password">
         *       <input type="radio">
         *       <input type="search">
         *       <input type="tel">
         *       <input type="text">
         *       <input type="url">
         *       <input type="week">
         *       <input type="week">
         *       <select></select>
         *       <textarea></textarea>
         *
         *       <!-- :required -->
         *       <input type="checkbox" disabled readonly required>
         *       <input type="date" required>
         *       <input type="datetime-local" required>
         *       <input type="email" required>
         *       <input type="file" required>
         *       <input type="month" required>
         *       <input type="number" required>
         *       <input type="password" required>
         *       <input type="radio" required>
         *       <input type="search" required>
         *       <input type="tel" required>
         *       <input type="text" required>
         *       <input type="url" required>
         *       <input type="week" required>
         *       <input type="week" required>
         *       <select required></select>
         *       <textarea required></textarea>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const form = new HTMLFormElement({ ownerDocument: document, parentNode: body })

        // Neither :optional or :required
        new HTMLButtonElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'button' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'color' }],
            form,
            ownerDocument: document,
            parentNode: form,
            value: '#000000',
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'hidden' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'image' }],
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'range' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'reset' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'submit' }],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLButtonElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'color' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            value: '#000000',
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'hidden' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'image' },
                { localName: 'required' },
            ],
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'range' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'reset' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'submit' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })

        // :optional
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'date' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'datetime-local' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'email' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'file' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'month' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'number' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'password' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'radio' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'search' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'tel' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'text' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'url' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'week' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLSelectElement({
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })
        new HTMLTextAreaElement({
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':optional'],
        })

        // :required
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'disabled' },
                { localName: 'readonly' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'datetime-local' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'email' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'file' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'month' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'password' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'search' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'tel' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'text' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'url' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'week' },
                { localName: 'required' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLSelectElement({
            attributes: [{ localName: 'required' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'required' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':required'],
        })

        assert.match(':optional', document._selected.get(':optional'), document)
        assert.match(':required', document._selected.get(':required'), document)
    })
    test(':placeholder-shown', () => {

        /**
         * <html>
         *   <body>
         *     <form>
         *
         *       <!-- not :placeholder-shown -->
         *       <input type="button" placeholder="submit">
         *       <input type="email" placeholder value="value">
         *
         *       <!-- :placeholder-shown -->
         *       <input type="email" placeholder value>
         *       <input type="number" placeholder>
         *       <input type="password" placeholder>
         *       <input type="search" placeholder>
         *       <input type="text" placeholder>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const form = new HTMLFormElement({ ownerDocument: document, parentNode: body })

        // Not :placeholder-shown
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'placeholder', value: 'submit' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'email' },
                { localName: 'placeholder' },
                { localName: 'value', value: 'value' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
        })

        // :placeholder-shown
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'email' },
                { localName: 'placeholder' },
                { localName: 'value' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':placeholder-shown'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'placeholder' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':placeholder-shown'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'password' },
                { localName: 'placeholder' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':placeholder-shown'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'search' },
                { localName: 'placeholder' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':placeholder-shown'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'text' },
                { localName: 'placeholder' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':placeholder-shown'],
        })

        assert.match(':placeholder-shown', document._selected.get(':placeholder-shown'), document)
    })
    test(':read-only, :read-write', () => {

        /**
         * <html>
         *   <body>
         *     <form>
         *
         *       <!-- neither :read-only or :read-write -->
         *       <svg></svg>
         *       <div></div>
         *
         *       <!-- :read-only -->
         *       <div></div>
         *       <input type="button" contenteditable>
         *       <input type="checkbox">
         *       <input type="color">
         *       <input type="date" contenteditable disabled>
         *       <input type="date" contenteditable readonly>
         *       <input type="datetime-local" readonly>
         *       <input type="email" readonly>
         *       <input type="file">
         *       <input type="hidden">
         *       <input type="month" readonly>
         *       <input type="number" readonly>
         *       <input type="radio">
         *       <input type="range">
         *       <input type="reset">
         *       <input type="search" readonly>
         *       <input type="submit">
         *       <input type="tel" readonly>
         *       <input type="text" readonly>
         *       <input type="time" readonly>
         *       <input type="url" readonly>
         *       <input type="week" readonly>
         *       <textarea contenteditable disabled></textarea>
         *       <textarea contenteditable readonly></textarea>
         *
         *       <!-- :read-write -->
         *       <input type="date">
         *       <input type="datetime-local">
         *       <input type="email">
         *       <input type="month">
         *       <input type="number">
         *       <input type="search">
         *       <input type="tel">
         *       <input type="text">
         *       <input type="time">
         *       <input type="url">
         *       <input type="week">
         *       <textarea></textarea>
         *       <div contenteditable disabled readonly>
         *         <button disabled readonly></button>
         *         <!-- :read-only -->
         *         <input class="read-only" type="date" disabled>
         *         <input class="read-only" type="date" readonly>
         *         <textarea class="read-only" disabled></textarea>
         *         <textarea class="read-only" readonly></textarea>
         *       </div>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({
            ownerDocument: document,
            parentNode: document,
            selectors: [':read-only'],
        })
        const body = new HTMLBodyElement({
            ownerDocument: document,
            parentNode: html,
            selectors: [':read-only'],
        })
        const form = new HTMLFormElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':read-only'],
        })

        // Neither :read-only or :read-write
        new Element({ localName: 'div', ownerDocument: document, parentNode: body })
        new SVGSVGElement({ ownerDocument: document, parentNode: body })

        // :read-only
        new HTMLDivElement({
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'contenteditable' },
            ],
            form,
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'color' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
            value: '#000000',
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'contenteditable' },
                { localName: 'disabled' },
            ],
            form,
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'contenteditable' },
                { localName: 'readonly' },
            ],
            form,
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'datetime-local' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'email' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'file' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'hidden' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'month' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'number' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'radio' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'range' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'reset' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'search' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'submit' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'tel' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'text' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'time' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'url' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'week' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLTextAreaElement({
            attributes: [
                { localName: 'contenteditable' },
                { localName: 'disabled' },
            ],
            form,
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })
        new HTMLTextAreaElement({
            attributes: [
                { localName: 'contenteditable' },
                { localName: 'readonly' },
            ],
            form,
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-only'],
        })

        // :read-write
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'date' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'datetime-local' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'email' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'month' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'number' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'search' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'tel' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'text' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'time' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'url' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'week' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLTextAreaElement({
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLDivElement({
            attributes: [
                { localName: 'contenteditable' },
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
        new HTMLButtonElement({
            attributes: [
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'disabled' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'readonly' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':read-only'],
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'disabled' }],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':read-only'],
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'readonly' }],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes._list.at(-1),
            selectors: [':read-only'],
        })

        assert.match(':read-only', document._selected.get(':read-only'), document)
        assert.match(':read-write', document._selected.get(':read-write'), document)
    })
    // Logical
    test(':is(), :not(), :where()', () => {

        /**
         * <html>
         *   <body>
         *     <div></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const div = new HTMLDivElement({ ownerDocument: document, parentNode: body })

        const selections = [
            // [':is()'], // <pseudo-class-selector> does not currently allow pseudo function taking no argument
            [':is(*::before)'],
            [':is(*::before, html)', [html]],
            [':is(html *)', [body, div]],
            [':not(html)', [body, div]],
            [':not(html, body)', [div]],
        ]
        selections.forEach(([selector, expected]) => assert.match(selector, expected, document))
    })
    // Navigation
    test(':any-link, :link, :target, :visited', () => {

        /**
         * <html>
         *   <body>
         *     <a></a>
         *     <a href></a>
         *     <a id="target" href="#target"></a>
         *     <area>
         *     <area href>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ url: 'http://localhost/#current-target' })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        new HTMLAnchorElement({ ownerDocument: document, parentNode: body })
        const linkAnchor = new HTMLAnchorElement({
            attributes: [{ localName: 'href' }],
            ownerDocument: document,
            parentNode: body,
        })
        const targetLinkAnchor = new HTMLAnchorElement({
            attributes: [
                { localName: 'id', value: 'target' },
                { localName: 'href', value: '#current-target' },
            ],
            ownerDocument: document,
            parentNode: body,
        })
        const currentTargetLinkAnchor = new HTMLAnchorElement({
            attributes: [
                { localName: 'id', value: 'current-target' },
                { localName: 'href', value: '#target' },
            ],
            ownerDocument: document,
            parentNode: body,
        })

        new HTMLAreaElement({ ownerDocument: document, parentNode: body })
        const area = new HTMLAreaElement({
            attributes: [{ localName: 'href' }],
            ownerDocument: document,
            parentNode: body,
        })

        const selections = [
            [':any-link', [linkAnchor, targetLinkAnchor, currentTargetLinkAnchor, area]],
            [':link', [linkAnchor, targetLinkAnchor, currentTargetLinkAnchor, area]],
            [':target', [currentTargetLinkAnchor]],
        ]
        selections.forEach(([selector, expected]) => assert.match(selector, expected, document))
    })
    test(':local-link, :local-link()', () => {

        /**
         * <html>
         *   <body>
         *
         *     <!-- neither :local-link or :local-link() -->
         *     <a href="https://localhost/level-1/level-2/"></a>
         *     <a href="http://sub.localhost/level-1/level-2/"></a>
         *     <a href="http://localhost:8080/level-1/level-2/"></a>
         *     <a href="/level-1/level-2/?parameter"></a>
         *
         *     <-- :local-link or :local-link() -->
         *     <a href="http://localhost"></a>
         *     <a href=""></a>
         *     <a href="#"></a>
         *     <a href="/"></a>
         *     <a href="/level-1"></a>
         *     <a href="/level-1/"></a>
         *     <a href="/level-1/level-2/#other-target"></a>
         *     <a href="/level-1/level-2/level-3"></a>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map, url: 'http://localhost/level-1/level-2/#target' })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        // Neither :local-link or :local-link()
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: 'https://localhost/level-1/level-2/' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: 'http://sub.localhost/level-1/level-2/' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: 'http://localhost:8080/level-1/level-2/' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: '/level-1/level-2/?parameter' }],
            ownerDocument: document,
            parentNode: body,
        })

        // :local-link or :local-link()
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: 'http://localhost' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link(0)'],
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link', ':local-link(0)', ':local-link(1)', ':local-link(2)', ':local-link(3)'],
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: '#' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link', ':local-link(0)', ':local-link(1)', ':local-link(2)', ':local-link(3)'],
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: '/' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link(0)'],
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: '/level-1' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link(0)', ':local-link(1)'],
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: '/level-1/' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link(0)', ':local-link(1)'],
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: '/level-1/level-2/#other-target' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link', ':local-link(0)', ':local-link(1)', ':local-link(2)', ':local-link(3)'],
        })
        new HTMLAnchorElement({
            attributes: [{ localName: 'href', value: '/level-1/level-2/level-3' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':local-link(0)', ':local-link(1)', ':local-link(2)'],
        })

        const selectors = [
            ':local-link',
            ':local-link(0)',
            ':local-link(1)',
            ':local-link(2)',
            ':local-link(3)',
        ]
        selectors.forEach(selector => assert.match(selector, document._selected.get(selector), document))
    })
    // Resource
    test(':buffering, :muted, :paused, :playing, :seeking, :stalled, :volume-locked', () => {

        /**
         * <html>
         *   <body>
         *     <video muted="true"></video>  <!-- the user unmuted the video -->
         *     <video muted></video>
         *     <div></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        new HTMLVideoElement({
            attributes: [{ localName: 'muted', value: 'true' }],
            muted: false,
            networkState: HTMLVideoElement.NETWORK_LOADING,
            ownerDocument: document,
            parentNode: body,
            paused: false,
            readyState: HTMLMediaElement.HAVE_CURRENT_DATA,
            seeking: true,
            selectors: [':buffering', ':playing', ':seeking'],
        })
        new HTMLVideoElement({
            attributes: [{ localName: 'muted' }],
            ownerDocument: document,
            parentNode: body,
            paused: true,
            selectors: [':muted', ':paused'],
        })

        const selectors = [
            ':buffering',
            ':muted',
            ':paused',
            ':playing',
            ':seeking',
            ':stalled',
            ':volume-locked',
        ]
        selectors.forEach(selector => assert.match(selector, document._selected.get(selector), document))
    })
    // Text
    test(':dir()', () => {

        /**
         * <html>
         *   <body>
         *
         *     <!-- auto-directionality form-associated element -->
         *     <input type="button" dir="auto" value="">
         *     <input type="button" dir="auto" value="1">
         *     <input type="button" dir="auto" value="؈L">
         *     <input type="button" dir="auto" value="־L">
         *     <input type="button" dir="auto" value="L؈">
         *     <input type="email" dir="auto" value="؈L">
         *     <input type="email" dir="auto" value="־L">
         *     <input type="email" dir="auto" value="L؈">
         *     <input type="password" dir="auto" value="؈L">
         *     <input type="password" dir="auto" value="־L">
         *     <input type="password" dir="auto" value="L؈">
         *     <input type="reset" dir="auto" value="؈L">
         *     <input type="reset" dir="auto" value="־L">
         *     <input type="reset" dir="auto" value="L؈">
         *     <input type="search" dir="auto" value="؈L">
         *     <input type="search" dir="auto" value="־L">
         *     <input type="search" dir="auto" value="L؈">
         *     <input type="submit" dir="auto" value="؈L">
         *     <input type="submit" dir="auto" value="־L">
         *     <input type="submit" dir="auto" value="L؈">
         *     <input type="tel" dir="auto" value="؈L">
         *     <input type="tel" dir="auto" value="־L">
         *     <input type="tel" dir="auto" value="L؈">
         *     <input type="text" dir="auto" value="؈L">
         *     <input type="text" dir="auto" value="־L">
         *     <input type="text" dir="auto" value="L؈">
         *     <input type="url" dir="auto" value="؈L">
         *     <input type="url" dir="auto" value="־L">
         *     <input type="url" dir="auto" value="L؈">
         *     <textarea dir="auto"></textarea>
         *     <textarea dir="auto">1</textarea>
         *     <textarea dir="auto">؈L</textarea>
         *     <textarea dir="auto">־L</textarea>
         *     <textarea dir="auto">L؈</textarea>
         *
         *     <!-- auto-directionallity slot -->
         *     <slot dir="auto">؈</slot>
         *     <div>
         *       #shadow-root-1
         *         <slot dir="auto"></slot>
         *         <slot dir="auto"></slot>
         *       ؈L
         *     </div>
         *     <div>
         *       #shadow-root-2
         *         <slot dir="auto"></slot>
         *       ־L
         *     </div>
         *     <div>
         *       #shadow-root-3
         *         <slot dir="auto"></slot>
         *       L؈
         *     </div>
         *     <div>
         *       #shadow-root-4
         *         <slot dir="auto"></slot>
         *       1
         *     </div>
         *     <div>
         *       #shadow-root-5
         *         <slot name="slot-1" dir="auto"></slot>
         *         <slot name="slot-2" dir="auto"></slot>
         *         <slot name="slot-3" dir="auto"></slot>
         *         <slot name="slot-4" dir="auto"></slot>
         *         <slot name="slot-5" dir="auto"></slot>
         *         <slot name="slot-6" dir="auto"></slot>
         *         <slot name="slot-7" dir="auto"></slot>
         *         <slot name="slot-8" dir="auto"></slot>
         *         <slot name="slot-9" dir="auto"></slot>
         *         <slot name="slot-10" dir="auto"></slot>
         *         <slot name="slot-11" dir="auto"></slot>
         *         <slot name="slot-12" dir="auto"></slot>
         *         <slot name="slot-13" dir="auto"></slot>
         *       <bdi slot="slot-1">؈</bdi>
         *       <script slot="slot-2">؈</script>
         *       <style slot="slot-3">؈</style>
         *       <textarea slot="slot-4">؈</textarea>
         *       <div slot="slot-5" dir="rtl"></div>
         *       <div slot="slot-6"><bdi>؈</bdi></div>
         *       <div slot="slot-7"><script>؈</script></div>
         *       <div slot="slot-8"><style>؈</style></div>
         *       <div slot="slot-9"><textarea>؈</textarea></div>
         *       <div slot="slot-10"><slot>؈</slot></div>
         *       <div slot="slot-11">؈L</div>
         *       <div slot="slot-12">L؈</div>
         *       <div slot="slot-13"></div>
         *     </div>
         *     <div dir="ltr">
         *       #shadow-root-6
         *         <div>
         *           #shadow-root-7
         *             <slot dir="auto"></slot>
         *           <div><slot>؈</slot></div>
         *         </div>
         *     </div>
         *     <div dir="rtl">
         *       #shadow-root-8
         *         <div>
         *           #shadow-root-9
         *             <slot dir="auto"></slot>
         *           <div><slot>L</slot></div>
         *         </div>
         *     </div>
         *
         *     <bdi dir="auto">؈</bdi>
         *     <bdi>؈</bdi>
         *
         *     <div dir="rtl">
         *       <input type="tel">
         *     </div>
         *
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({
            ownerDocument: document,
            parentNode: document,
            selectors: [':dir(ltr)'],
        })
        const body = new HTMLBodyElement({
            ownerDocument: document,
            parentNode: html,
            selectors: [':dir(ltr)'],
        })

        // Auto-directionality form-associated element
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '1' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'button' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'email' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'email' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'email' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'password' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'password' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'password' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'reset' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'reset' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'reset' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'search' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'search' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'search' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'submit' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'submit' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'submit' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'tel' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'tel' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'tel' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'text' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'text' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'text' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'url' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '؈L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'url' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: '־L' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'url' },
                { localName: 'dir', value: 'auto' },
                { localName: 'value', value: 'L؈' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
            value: '1',
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
            value: '؈L',
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
            value: '־L',
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
            value: 'L؈',
        })

        // Auto-directionallity <slot>
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new Text({ data: '؈', parentNode: body.childNodes._list.at(-1) })
        const host1 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        const shadowRoot1 = new ShadowRoot({ host: host1, ownerDocument: document })
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: shadowRoot1,
            selectors: [':dir(rtl)'],
        })
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: shadowRoot1,
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈L', parentNode: host1, slot: '' })
        const host2 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        const shadowRoot2 = new ShadowRoot({ host: host2, ownerDocument: document })
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: shadowRoot2,
            selectors: [':dir(rtl)'],
        })
        new Text({ data: '־L', parentNode: host2, slot: '' })
        const host3 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        const shadowRoot3 = new ShadowRoot({ host: host3, ownerDocument: document })
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: shadowRoot3,
            selectors: [':dir(ltr)'],
        })
        new Text({ data: 'L؈', parentNode: host3, slot: '' })
        const host4 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        const shadowRoot4 = new ShadowRoot({ host: host4, ownerDocument: document })
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: shadowRoot4,
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '1', parentNode: host4, slot: '' })
        const host5 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        const shadowRoot5 = new ShadowRoot({ host: host5, ownerDocument: document })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-1' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-2' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-3' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-4' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-5' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-6' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-7' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-8' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-9' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-10' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(rtl)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-11' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(rtl)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-12' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            attributes: [
                { localName: 'name', value: 'slot-13' },
                { localName: 'dir', value: 'auto' },
            ],
            ownerDocument: document,
            parentNode: shadowRoot5,
            selectors: [':dir(ltr)'],
        })
        new HTMLElement({
            attributes: [{ localName: 'slot', value: 'slot-1' }],
            localName: 'bdi',
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(rtl)'],
        })
        new Text({ data: '؈', parentNode: host5.childNodes._list.at(-1) })
        new HTMLScriptElement({
            attributes: [{ localName: 'slot', value: 'slot-2' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈', parentNode: host5.childNodes._list.at(-1) })
        new HTMLStyleElement({
            attributes: [{ localName: 'slot', value: 'slot-3' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈', parentNode: host5.childNodes._list.at(-1) })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'slot', value: 'slot-4' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
            value: '؈',
        })
        new HTMLDivElement({
            attributes: [
                { localName: 'slot', value: 'slot-5' },
                { localName: 'dir', value: 'rtl' },
            ],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(rtl)'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-6' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new HTMLElement({
            localName: 'bdi',
            ownerDocument: document,
            parentNode: host5.childNodes._list.at(-1),
            selectors: [':dir(rtl)'],
        })
        new Text({ data: '؈', parentNode: host5.childNodes._list.at(-1).childNodes._list.at(-1) })
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-7' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new HTMLScriptElement({
            ownerDocument: document,
            parentNode: host5.childNodes._list.at(-1),
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈', parentNode: host5.childNodes._list.at(-1).childNodes._list.at(-1) })
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-8' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new HTMLStyleElement({
            ownerDocument: document,
            parentNode: host5.childNodes._list.at(-1),
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈', parentNode: host5.childNodes._list.at(-1).childNodes._list.at(-1) })
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-9' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new HTMLTextAreaElement({
            ownerDocument: document,
            parentNode: host5.childNodes._list.at(-1),
            selectors: [':dir(ltr)'],
            value: '؈',
        })
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-10' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new HTMLSlotElement({
            ownerDocument: document,
            parentNode: host5.childNodes._list.at(-1),
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈', parentNode: host5.childNodes._list.at(-1).childNodes._list.at(-1) })
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-11' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈L', parentNode: host5.childNodes._list.at(-1) }),
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-12' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new Text({ data: 'L؈', parentNode: host5.childNodes._list.at(-1) }),
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-13' }],
            ownerDocument: document,
            parentNode: host5,
            selectors: [':dir(ltr)'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'dir', value: 'ltr' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(ltr)'],
        })
        const host6 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: body.childNodes._list.at(-1),
            selectors: [':dir(ltr)'],
        })
        const shadowRoot6 = new ShadowRoot({ host: host6, ownerDocument: document })
        const host7 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: shadowRoot6,
            selectors: [':dir(ltr)'],
        })
        const shadowRoot7 = new ShadowRoot({ host: host7, ownerDocument: document })
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: shadowRoot7,
            selectors: [':dir(ltr)'],
        })
        new HTMLDivElement({
            ownerDocument: document,
            parentNode: host7,
            selectors: [':dir(ltr)'],
            slot: '',
        })
        new HTMLSlotElement({
            ownerDocument: document,
            parentNode: host7.childNodes._list.at(-1),
            selectors: [':dir(ltr)'],
        })
        new Text({ data: '؈', parentNode: host7.childNodes._list.at(-1) })
        const host8 = new HTMLDivElement({
            attributes: [{ localName: 'dir', value: 'rtl' }],
            ownerDocument: document,
            parentNode: body.childNodes._list.at(-1),
            selectors: [':dir(rtl)'],
        })
        const shadowRoot8 = new ShadowRoot({ host: host8, ownerDocument: document })
        const host9 = new HTMLDivElement({
            ownerDocument: document,
            parentNode: shadowRoot8,
            selectors: [':dir(rtl)'],
        })
        const shadowRoot9 = new ShadowRoot({ host: host9, ownerDocument: document })
        new HTMLSlotElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            ownerDocument: document,
            parentNode: shadowRoot9,
            selectors: [':dir(rtl)'],
        })
        new HTMLDivElement({
            ownerDocument: document,
            parentNode: host9,
            selectors: [':dir(rtl)'],
            slot: '',
        })
        new HTMLSlotElement({
            ownerDocument: document,
            parentNode: host9.childNodes._list.at(-1),
            selectors: [':dir(rtl)'],
        })
        new Text({ data: 'L', parentNode: host9.childNodes._list.at(-1) })

        new HTMLElement({
            attributes: [{ localName: 'dir', value: 'auto' }],
            localName: 'bdi',
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new Text({ data: '؈', parentNode: body.childNodes._list.at(-1) })
        new HTMLElement({
            localName: 'bdi',
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new Text({ data: '؈', parentNode: body.childNodes._list.at(-1) })

        new HTMLDivElement({
            attributes: [{ localName: 'dir', value: 'rtl' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':dir(rtl)'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'tel' }],
            ownerDocument: document,
            parentNode: body.childNodes._list.at(-1),
            selectors: [':dir(ltr)'],
        })

        assert.match(':dir(ltr)', document._selected.get(':dir(ltr)'), document)
        assert.match(':dir(rtl)', document._selected.get(':dir(rtl)'), document)
    })
    test(':lang()', () => {

        /**
         * <html>
         *   <body lang="de">
         *
         *     <meta http-equiv="content-language" content="en">
         *     <meta http-equiv="content-language" content="FR">
         *
         *     <!-- multiple language tag candidates -->
         *     <div>
         *       #shadow-root
         *         <div></div>
         *     </div>
         *     <div lang="en" lang="es"></div>  <!-- the user declared `lang="es"` in the XML namespace -->
         *     <math lang="en"></math>
         *     <math></math>  <!-- the user declared `lang="es"` in the XML namespace -->
         *     <svg lang="en"></svg>
         *
         *     <!-- ill-formed language tags -->
         *     <div lang=""></div>
         *     <div lang="*"></div>
         *     <div lang=" aa"></div>
         *     <div lang="aa "></div>
         *     <div lang="a"></div>
         *     <div lang="a1"></div>
         *     <div lang="abcdefghi"></div>
         *     <div lang="aa-"></div>
         *     <div lang="-eee"></div>
         *     <div lang="aa--eee"></div>
         *
         *     <!-- normalization to extended form -->
         *     <div lang="AA-f-e2-e-e1"></div>
         *     <div lang="aa-e-e2-e-e1"></div>
         *     <div lang="sgn-br"></div>
         *     <div lang="zh-cmn-hans"></div>
         *     <div lang="art-lojban"></div>
         *     <div lang="in-eee"></div>
         *     <div lang="aa-bu-v1v1v"></div>
         *     <div lang="aa-heploc-v1v1v"></div>
         *     <div lang="ar-aao-eee"></div>
         *
         *     <!-- matching with explicit and implicit wildcards -->
         *     <div lang="aa-eee-eee-ssss-rr-v1v1v-e-e1-e1-e-e2-e2-x-y"></div>
         *     <div lang="aaaa-111-2v2v"></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument({ selected: new Map })
        const html = new HTMLHtmlElement({
            ownerDocument: document,
            parentNode: document,
            selectors: [':lang(fr)', ':lang("*")'],
        })
        const body = new HTMLBodyElement({
            attributes: [{ localName: 'lang', value: 'de' }],
            ownerDocument: document,
            parentNode: html,
            selectors: [':lang(de)', ':lang("*")'],
        })

        new HTMLMetaElement({
            attributes: [
                { localName: 'http-equiv', value: 'content-language' },
                { localName: 'content', value: '1' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(de)', ':lang("*")'],
        })
        new HTMLMetaElement({
            attributes: [
                { localName: 'http-equiv', value: 'content-language' },
                { localName: 'content', value: 'fr' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(de)', ':lang("*")'],
        })

        // Multiple language tag candidates
        new HTMLDivElement({
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(de)', ':lang("*")'],
        })
        const shadowRoot = new ShadowRoot({
            host: body.childNodes._list.at(-1),
            ownerDocument: document,
        })
        new HTMLDivElement({
            ownerDocument: document,
            parentNode: shadowRoot,
            selectors: [':lang(de)', ':lang("*")'],
        })
        new HTMLDivElement({
            attributes: [
                { localName: 'lang', value: 'en' },
                { localName: 'lang', namespaceURI: XML_NAMESPACE, value: 'es' },
            ],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(es)', ':lang("*")'],
        })
        new MathMLElement({
            attributes: [{ localName: 'lang', value: 'en' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(de)', ':lang("*")'],
        })
        new MathMLElement({
            attributes: [{ localName: 'lang', namespaceURI: XML_NAMESPACE, value: 'en' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(en)', ':lang("*")'],
        })

        // Ill-formed language tags
        new HTMLDivElement({
            attributes: [{ localName: 'lang' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang("")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: '*' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: ' aa' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aa ' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'a' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'a1' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'abcdefghi' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aa-' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: '-eee' }],
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aa--eee' }],
            ownerDocument: document,
            parentNode: body,
        })

        // Normalization to extended form
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'AA-f-e2-e-e1' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(AA-e-e1-f-e2)', ':lang(aa-f-e2-e-e1)', ':lang("*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aa-e-e2-e-e1' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang("*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'sgn-br' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(bzs)', ':lang(sgn-br)', ':lang("*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'zh-cmn-hans' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(cmn-hans)', ':lang(zh-cmn-hans)', ':lang("*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'art-lojban' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(jbo)', ':lang(art-lojban)', ':lang("*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'in-eee' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(id-eee)', ':lang(in)', ':lang("*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aa-bu-v1v1v' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(aa-mm-v1v1v)', ':lang(aa-bu)', ':lang("*")', ':lang("aa-*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aa-heploc-v1v1v' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(aa-alalc97-v1v1v)', ':lang(aa-heploc)', ':lang("*")', ':lang("aa-*")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'ar-aao-eee' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(aao-eee)', ':lang(ar-aao)', ':lang("*")'],
        })

        // Matching with explicit and implicit wildcards
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aa-eee-eee-ssss-rr-v1v1v-e-e1-e1-e-e2-e2-x-y' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang(aa-e-e1-e-e2)', ':lang(aa-e-e-x-y)', ':lang("*")', ':lang("aa-*")', ':lang("aa-*-ssss")'],
        })
        new HTMLDivElement({
            attributes: [{ localName: 'lang', value: 'aaaa-111-2v2v' }],
            ownerDocument: document,
            parentNode: body,
            selectors: [':lang("*")'],
        })

        const selectors = [
            // Ill-formed language range
            ':lang(" aa")',
            ':lang("aa ")',
            ':lang("1")',
            ':lang("a*")',
            ':lang("*a")',
            ':lang("**")',
            ':lang("*-")',
            ':lang("-*")',
            // Multiple language tag candidates
            ':lang(de)',
            ':lang(en)',
            ':lang(es)',
            ':lang(fr)',
            // Normalization to extended form
            ':lang(AA-e-e1-f-e2)',
            ':lang(aa-f-e2-e-e1)',
            ':lang(aa-e-e1-e-e2)',
            ':lang(bzs)',
            ':lang(sgn-br)',
            ':lang(sgn-eee-br)',
            ':lang(sgn-br-v1v1v)',
            ':lang(cmn-hans)',
            ':lang(zh-cmn-hans)',
            ':lang(zh-eee-cmn-hans)',
            ':lang(zh-cmn-eee-hans)',
            ':lang(zh-cmn-hans-rr)',
            ':lang(jbo)',
            ':lang(art-lojban)',
            ':lang(id-eee)',
            ':lang(in)',
            ':lang(aa-mm-v1v1v)',
            ':lang(aa-bu)',
            ':lang(aa-alalc97-v1v1v)',
            ':lang(aa-heploc)',
            ':lang(ar-aao)',
            ':lang(aao-eee)',
            // No language
            ':lang("")',
            // Match with explicit and implicit wildcards
            ':lang("*")',
            ':lang(aaa)',
            ':lang(eee)',
            ':lang(aa-x)',
            ':lang(aaaa-e)',
            ':lang(aa-e-e-x-y)',
            ':lang("aa-*-ssss")',
        ]
        selectors.forEach(selector => assert.match(selector, document._selected.get(selector), document))
    })
    // Tree-structural
    test(':root, :host, :host(), :host-context(), :scope, &', () => {

        /**
         * <html>
         *   <body>
         *     <section>
         *       #shadow-root
         *         <section></section>
         *     </section>
         *     <div></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const host = new HTMLElement({ localName: 'section', ownerDocument: document, parentNode: body })
        const shadowRoot = new ShadowRoot({ host, ownerDocument: document })
        const shadowElement = new HTMLElement({ localName: 'section', ownerDocument: document, parentNode: shadowRoot })
        const div = new HTMLDivElement({ ownerDocument: document, parentNode: body })

        const fragment = new DocumentFragment
        new HTMLDivElement({ ownerDocument: document, parentNode: fragment })

        const selections = [
            [':root', [html]],
            [':root', [], shadowRoot],
            [':root > *', [], fragment],
            [':host', []],
            [':host', [host], shadowRoot],
            [':host > *', [shadowElement], shadowRoot],
            [':host + *', [], shadowRoot],
            [':host(div)', [], shadowRoot],
            [':host(section)', []],
            [':host(section)', [host], shadowRoot],
            [':host-context(div)', [], shadowRoot],
            [':host-context(section)', []],
            [':host-context(section)', [host], shadowRoot],
            [':host-context(body)', [host], shadowRoot],
            [':scope', [html]],
            [':scope', [host], shadowRoot],
            [':scope', [html], document, { scopes: { roots: [document] } }],
            [':scope', [html], document, { scopes: { inclusive: true, roots: [html] } }],
            [':scope', [], shadowRoot, { scopes: { roots: [shadowRoot] } }],
            [':scope', [], shadowRoot, { scopes: { inclusive: true, roots: [shadowRoot] } }],
            [':scope > *', [host, div], document, { scopes: { roots: [body] } }],
            [':scope > *', [], shadowRoot, { scopes: { roots: [shadowRoot] } }],
            [':scope > *', [], fragment, { scopes: { roots: [fragment] } }],
            [':scope > *', [body], document, { scopes: { roots: [html] } }],
            [':scope + *', [], document, { scopes: { roots: [host] } }],
            [':scope + *', [], document, { scopes: { inclusive: true, roots: [host] } }],
            ['* + :scope', [], document, { scopes: { roots: [div] } }],
            ['* + :scope', [div], document, { scopes: { inclusive: true, roots: [div] } }],
            [':has(:scope)', [], document, { scopes: { roots: [host] } }],
            [':has(:scope)', [], document, { scopes: { inclusive: true, roots: [host] } }],
            ['&', [html]],
            ['&', [host], shadowRoot],
            ['&', [html], document, { anchors: [html] }],
            ['&', [html], document, { scopes: { roots: [document] } }],
            ['&', [html], document, { scopes: { inclusive: true, roots: [html] } }],
            ['& > *', [body], document, { anchors: [html] }],
            ['& > *', [body], document, { scopes: { roots: [html] } }],
            ['& + *', [div], document, { anchors: [host] }],
            ['& + *', [], document, { scopes: { inclusive: true, roots: [host] } }],
            ['* + &', [div], document, { anchors: [div] }],
            ['* + &', [div], document, { scopes: { inclusive: true, roots: [div] } }],
            [':has(&)', [html, body], document, { anchors: [host] }],
            [':has(&)', [], document, { scopes: { inclusive: true, roots: [host] } }],
        ]
        selections.forEach(([selector, expected, tree = document, context]) =>
            assert.match(selector, expected, tree, context))
    })
    test(':empty, :*-child, :*-of-type', () => {

        /**
         * <html>
         *   <body>
         *     <section></section>
         *     <div id="item-1"><!-- comment --></div>
         *     <div id="item-2"></div>
         *     <div id="item-3"></div>
         *     <div id="item-4"></div>
         *     <div id="item-5"></div>
         *     <div id="item-6"></div>
         *     <section></section>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const section = new HTMLElement({ localName: 'section', ownerDocument: document, parentNode: body })
        const divs = ['<!-- comment -->', '', '', '', '', ''].map((data, index) => {
            const div = new HTMLDivElement({
                attributes: [{ localName: 'id', value: `div-${index + 1}` }],
                ownerDocument: document,
                parentNode: body,
            })
            if (data.startsWith('<!--')) {
                new Comment({ data, parentNode: div })
            } else {
                new Text({ data, parentNode: div })
            }
            return div
        })
        const noNamespace = new Element({ localName: 'section', ownerDocument: document, parentNode: body })
        const children = [section, ...divs, noNamespace]

        const selections = [
            [':empty', [section, ...divs, noNamespace]],
            [':first-child', [html, body, section]],
            [':first-of-type', [html, body, section, divs[0], noNamespace]],
            [':last-child', [html, body, noNamespace]],
            [':last-of-type', [html, body, section, divs.at(-1), noNamespace]],
            [':only-child', [html, body]],
            [':only-of-type', [html, body, section, noNamespace]],
            [':nth-child(-1)'],
            [':nth-child(0)'],
            [':nth-child(1)', [html, body, children[0]]],
            [':nth-child(6)', [children[5]]],
            [':nth-child(-1n)'],
            [':nth-child(0n)'],
            [':nth-child(1n)', [html, body, ...children]],
            [':nth-child(2n)', children.filter(isEven)],
            [':nth-child(-2n - 1)'],
            [':nth-child(-2n + 1)', [html, body, ...children.slice(0, 1).filter(isOdd)]],
            [':nth-child(-2n + 4)', children.slice(0, 4).filter(isEven)],
            [':nth-child(-1n - 1)'],
            [':nth-child(-1n + 1)', [html, body, ...children.slice(0, 1)]],
            [':nth-child(-1n + 4)', [html, body, ...children.slice(0, 4)]],
            [':nth-child(0n - 1)'],
            [':nth-child(0n + 1)', [html, body, children[0]]],
            [':nth-child(0n + 4)', [children[3]]],
            [':nth-child(1n - 1)', [html, body, ...children]],
            [':nth-child(1n + 1)', [html, body, ...children]],
            [':nth-child(1n + 4)', children.slice(3)],
            [':nth-child(2n - 2)', children.filter(isEven)],
            [':nth-child(2n - 1)', [html, body, ...children.filter(isOdd)]],
            [':nth-child(2n + 1)', [html, body, ...children.filter(isOdd)]],
            [':nth-child(2n + 4)', children.slice(3).filter(isOdd)],
            [':nth-child(1 of section)', [section]],
            [':nth-child(1 of :nth-child(odd))', [html, body, children.filter(isOdd)[0]]],
            [':nth-child(2 of :nth-child(odd))', [children.filter(isOdd)[1]]],
            [':nth-child(2n - 1 of :nth-child(odd))', [html, body, ...children.filter(isOdd).filter(isOdd)]],
            [':nth-last-child(-1)'],
            [':nth-last-child(0)'],
            [':nth-last-child(1)', [html, body, children.at(-1)]],
            [':nth-last-child(2)', [children.at(-2)]],
            [':nth-last-child(-2n - 1)'],
            [':nth-last-child(-2n + 1)', [html, body, ...children.toReversed().slice(0, 1).filter(isOdd).toReversed()]],
            [':nth-last-child(-2n + 4)', [...children.toReversed().slice(0, 4).filter(isEven).toReversed()]],
            [':nth-last-child(2n - 1)', [html, body, ...children.toReversed().filter(isOdd).toReversed()]],
            [':nth-last-child(2n)', [...children.toReversed().filter(isEven).toReversed()]],
            [':nth-last-child(2n + 1)', [html, body, ...children.toReversed().filter(isOdd).toReversed()]],
            [':nth-last-child(2n + 4)', children.toReversed().slice(3).filter(isOdd).toReversed()],
            [':nth-of-type(-1)'],
            [':nth-of-type(0)'],
            [':nth-of-type(1)', [html, body, section, divs[0], noNamespace]],
            [':nth-of-type(2)', [divs[1]]],
            [':nth-of-type(-2n - 1)'],
            [':nth-of-type(-2n + 1)', [html, body, section, ...divs.slice(0, 1).filter(isOdd), noNamespace]],
            [':nth-of-type(-2n + 4)', [...divs.slice(0, 4).filter(isEven)]],
            [':nth-of-type(2n - 1)', [html, body, section, ...divs.filter(isOdd), noNamespace]],
            [':nth-of-type(2n)', divs.filter(isEven)],
            [':nth-of-type(2n + 1)', [html, body, section, ...divs.filter(isOdd), noNamespace]],
            [':nth-of-type(2n + 4)', divs.slice(3).filter(isOdd)],
            [':nth-last-of-type(-1)'],
            [':nth-last-of-type(0)'],
            [':nth-last-of-type(1)', [html, body, section, divs.at(-1), noNamespace]],
            [':nth-last-of-type(2)', [divs.at(-2)]],
            [':nth-last-of-type(-2n - 1)'],
            [':nth-last-of-type(-2n + 1)', [html, body, section, ...divs.toReversed().slice(0, 1).filter(isOdd).toReversed(), noNamespace]],
            [':nth-last-of-type(-2n + 4)', [...divs.toReversed().slice(0, 4).filter(isEven).toReversed()]],
            [':nth-last-of-type(2n - 1)', [html, body, section, ...divs.toReversed().filter(isOdd).toReversed(), noNamespace]],
            [':nth-last-of-type(2n)', [...divs.toReversed().filter(isEven).toReversed()]],
            [':nth-last-of-type(2n + 1)', [html, body, section, ...divs.toReversed().filter(isOdd).toReversed(), noNamespace]],
            [':nth-last-of-type(2n + 4)', divs.toReversed().slice(3).filter(isOdd).toReversed()],
        ]
        selections.forEach(([selector, expected]) => assert.match(selector, expected, document))
    })
    test(':has()', () => {

        /**
         * <html>
         *   <body>
         *     <section></section>
         *     <div></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        new HTMLElement({ localName: 'section', ownerDocument: document, parentNode: body })
        new HTMLDivElement({ ownerDocument: document, parentNode: body })

        const selections = [
            [':has(html)', []],
            [':has(body)', [html]],
            [':has(section)', [html, body]],
            [':has(> section)', [body]],
            [':has(body > section)', [html]],
            [':has(section + div)', [html, body]],
        ]
        selections.forEach(([selector, expected]) => assert.match(selector, expected, document))
    })
    test(':has-slotted', () => {

        /**
         * <html>
         *   <body>
         *     <div>
         *       #shadow-root
         *         <slot></slot>
         *         <slot name="slot-2"></slot>
         *         <slot></slot>
         *       <div></div>
         *       <div></div>
         *       <div slot="slot-1"></div>
         *     </div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const host = new HTMLDivElement({ ownerDocument: document, parentNode: body })

        const shadowRoot = new ShadowRoot({ host, ownerDocument: document })
        const slot1 = new HTMLSlotElement({ ownerDocument: document, parentNode: shadowRoot })
        const slot2 = new HTMLSlotElement({
            attributes: [{ localName: 'name', value: 'slot-2' }],
            ownerDocument: document,
            parentNode: shadowRoot,
        })
        new HTMLSlotElement({ ownerDocument: document, parentNode: shadowRoot })

        new HTMLDivElement({ ownerDocument: document, parentNode: host, slot: '' })
        new HTMLDivElement({ ownerDocument: document, parentNode: host, slot: '' })
        new HTMLDivElement({
            attributes: [{ localName: 'slot', value: 'slot-2' }],
            ownerDocument: document,
            parentNode: host,
        })

        assert.match(':has-slotted', [slot1, slot2], document)
    })
    test(':heading, :heading()', () => {

        /**
         * <html>
         *   <body>
         *
         *     <h><h>
         *     <h0><h0>
         *     <h7><h7>
         *     <h1><h1>
         *
         *     <h1><h1>
         *     <h1><h1>
         *     <h2><h2>
         *     <h3><h3>
         *     <h4><h4>
         *     <h5><h5>
         *     <h6><h6>
         *
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        new HTMLElement({ localName: 'h', ownerDocument: document, parentNode: body })
        new HTMLElement({ localName: 'h0', ownerDocument: document, parentNode: body })
        new HTMLElement({ localName: 'h7', ownerDocument: document, parentNode: body })
        new Element({ localName: 'h1', ownerDocument: document, parentNode: body })

        const headings = [
            new HTMLHeadingElement({ localName: 'h1', ownerDocument: document, parentNode: body }),
            new HTMLHeadingElement({ localName: 'h2', ownerDocument: document, parentNode: body }),
            new HTMLHeadingElement({ localName: 'h3', ownerDocument: document, parentNode: body }),
            new HTMLHeadingElement({ localName: 'h4', ownerDocument: document, parentNode: body }),
            new HTMLHeadingElement({ localName: 'h5', ownerDocument: document, parentNode: body }),
            new HTMLHeadingElement({ localName: 'h6', ownerDocument: document, parentNode: body }),
        ]

        assert.match(':heading', headings, document)
        assert.match(':heading(1, 3, 5)', headings.filter(isOdd), document)
    })
    // View transition
    test(':active-view-transition, :active-view-transition()', () => {

        const idle = new HTMLDocument
        const document = new HTMLDocument({ activeViewTransition: { types: ['fade'] } })
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })

        new HTMLHtmlElement({ ownerDocument: idle, parentNode: idle })

        assert.match(':active-view-transition', [], idle)
        assert.match(':active-view-transition', [html], document)
        assert.match(':active-view-transition-type(fade-in)', [], document)
        assert.match(':active-view-transition-type(fade)', [html], document)
    })
})

describe('support', () => {

    function match(query, globalObject) {
        return matchSupport(parseGrammar(`(${query})`, '<supports-condition>'), globalObject)
    }

    test('at-rule', () => {
        assert.equal(match('at-rule(@style)'), false)
        assert.equal(match('at-rule(@annotation)'), true)
    })
    test('declaration', () => {
        const declarations = [
            // <general-enclosed>
            ['unknown', false],
            ['unknown: 1', false],
            ['color: invalid', false],
            // Property value range
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
        declarations.forEach(([declaration, expected = true]) => assert.equal(match(declaration), expected))
    })
    test('environment variable', () => {

        const globalObject = { document: { _registeredEnvironmentVariables: new Map([['--custom', omitted]]) } }

        assert.equal(match('env(--CUSTOM)', globalObject), false)
        assert.equal(match('env(--custom)', globalObject), true)
        assert.equal(match('env(preferred-text-scale)'), true)
    })
    test('font format', () => {
        assert.equal(match('font-format("woff")'), false)
        assert.equal(match('font-format(woff)'), true)
    })
    test('font technology', () => {
        assert.equal(match('font-tech(unknown)'), false)
        assert.equal(match('font-tech(color-svg)'), true)
    })
    test('named feature', () => {
        assert.equal(match('named-feature(unknown)'), false)
        assert.equal(match('named-feature(anchor-position-follows-transforms)'), true)
    })
    test('named condition', () => {
        assert.equal(match('(--unknown)'), false)
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
            assert.equal(match(`selector(${selector})`), expected))
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
        queries.forEach(([query, expected = true]) => assert.equal(match(query), expected))
    })
})
