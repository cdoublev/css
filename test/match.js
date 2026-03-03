
import assert, { Assert, AssertionError } from 'node:assert'
import { createContext, parseGrammar } from '../lib/parse/parser.js'
import { describe, test } from 'node:test'
import { install } from '@cdoublev/css'
import matchMediaQueryList from '../lib/match/media.js'
import matchSupport from '../lib/match/support.js'
import { matchTreesAgainstSelectors } from '../lib/match/selector.js'

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

    const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
    const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
    const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'

    const ELEMENT_NODE_TYPE = 1
    const ATTRIBUTE_NODE_TYPE = 2
    const TEXT_NODE_TYPE = 3
    const CDATA_SECTION_NODE_TYPE = 4
    const ENTITY_REFERENCE_NODE_TYPE = 5
    const ENTITY_NODE_TYPE = 6
    const PROCESSING_INSTRUCTION_NODE_TYPE = 7
    const COMMENT_NODE_TYPE = 8
    const DOCUMENT_NODE_TYPE = 9
    const DOCUMENT_TYPE_NODE_TYPE = 10
    const DOCUMENT_FRAGMENT_NODE_TYPE = 11
    const NOTATION_NODE_TYPE = 12

    /**
     * @param {Element} element
     * @param {function} accept
     * @returns {Element}
     */
    function findParentElement({ parentElement }, accept) {
        while (parentElement) {
            if (accept(parentElement)) {
                return parentElement
            }
            parentElement = parentElement.parentElement
        }
    }

    /**
     * @param {Element} element
     * @returns {Element|null}
     */
    function getNextElementSibling(element) {
        const { parentElement } = element
        if (parentElement) {
            const { children } = parentElement
            const index = children.indexOf(element)
            const child = children[index + 1]
            if (child) {
                return child
            }
        }
        return null
    }

    /**
     * @param {Element} element
     * @returns {Element|null}
     */
    function getPreviousElementSibling(element) {
        const { parentElement } = element
        if (parentElement) {
            const { children } = parentElement
            const index = children.indexOf(element)
            const child = children[index - 1]
            if (child) {
                return child
            }
        }
        return null
    }

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
        return `${attributes.reduce(
            (string, { localName, value }) =>
                string += ` ${value ? `${localName}="${value}"` : localName}`,
            `<${localName.toLowerCase()}`)}>`
    }

    class CSSAssert extends Assert {

        /**
         * @param {string} selector
         * @param {Element[]} [elements]
         * @param {Document|Element|ShadowRoot} tree
         * @param {object} [options]
         * @returns {*[]}
         */
        match(selector, elements = [], tree, { namespaces: ns = {}, ...options } = {}) {

            const context = createContext()
            const namespaces = context.globals.get('namespaces')

            Object.entries(ns).forEach(([key, value]) => namespaces.set(key, value))

            const selectorList = parseGrammar(selector, '<selector-list>', context)
            const matched = matchTreesAgainstSelectors([tree], selectorList, { ...options, namespaces })
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

    class DOMTokenList {

        /**
         * @param {string[]} list
         */
        constructor(list = []) {
            this.list = new Set(list)
        }

        /**
         * @param {string} token
         * @returns {boolean}
         */
        contains(token) {
            return this.list.has(token)
        }
    }

    class Node {

        static ATTRIBUTE_NODE = ATTRIBUTE_NODE_TYPE
        static CDATA_SECTION_NODE = CDATA_SECTION_NODE_TYPE
        static COMMENT_NODE = COMMENT_NODE_TYPE
        static DOCUMENT_FRAGMENT_NODE = DOCUMENT_FRAGMENT_NODE_TYPE
        static DOCUMENT_NODE = DOCUMENT_NODE_TYPE
        static DOCUMENT_TYPE_NODE = DOCUMENT_TYPE_NODE_TYPE
        static ELEMENT_NODE = ELEMENT_NODE_TYPE
        static ENTITY_NODE = ENTITY_NODE_TYPE
        static ENTITY_REFERENCE_NODE = ENTITY_REFERENCE_NODE_TYPE
        static NOTATION_NODE = NOTATION_NODE_TYPE
        static PROCESSING_INSTRUCTION_NODE = PROCESSING_INSTRUCTION_NODE_TYPE
        static TEXT_NODE = TEXT_NODE_TYPE

        childNodes = []

        /**
         * @param {object} properties
         */
        constructor(properties = {}) {

            const {
                fullscreen = false,
                ownerDocument = null,
                parentNode = null,
                pictureInPicture = false,
            } = properties

            this.ownerDocument = ownerDocument
            this.parentNode = parentNode
            if (parentNode) {
                parentNode.childNodes.push(this)
            }
            if (fullscreen) {
                this.getRootNode().fullscreenElement = this
            }
            if (pictureInPicture) {
                this.getRootNode().pictureInPictureElement = this
            }
        }

        /**
         * @returns {string}
         */
        get baseURI() {
            return this.ownerDocument.baseURI
        }

        /**
         * @param {Node} node
         * @returns {boolean}
         */
        contains(node) {
            return this === node || this.childNodes.some(child => child === node || child.contains(node))
        }

        /**
         * @returns {Element|null}
         */
        get parentElement() {
            const { parentNode } = this
            return parentNode instanceof Element ? parentNode : null
        }

        /**
         * @param {object} [options]
         * @returns {Node}
         */
        getRootNode(options = {}) {
            const { parentNode } = this
            if (parentNode) {
                if (!options.composed && parentNode instanceof ShadowRoot) {
                    return parentNode
                }
                return parentNode.getRootNode(options)
            }
            return this
        }
    }

    class CharacterData extends Node {

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            const { data } = properties

            this.data = data
            this.length = data.length
        }
    }
    class Comment extends CharacterData { nodeType = COMMENT_NODE_TYPE }
    class Text extends CharacterData { nodeType = TEXT_NODE_TYPE }

    class Document extends Node {

        fullscreenElement = null
        nodeType = DOCUMENT_NODE_TYPE
        pictureInPictureElement = null

        /**
         * @param {object} [properties]
         */
        constructor(properties = {}) {

            super(properties)

            const { activeViewTransition = null, baseURI = 'http://localhost/' } = properties

            this.activeViewTransition = activeViewTransition
            this.baseURI = baseURI
            this.location = new URL(this.baseURI)
        }

        /**
         * @returns {Element}
         */
        get children() {
            return this.childNodes.filter(node => node instanceof Element)
        }

        /**
         * @returns {Element}
         */
        get documentElement() {
            return this.children[0]
        }
    }
    class HTMLDocument extends Document { contentType = 'text/html' }

    class DocumentFragment extends Node {

        nodeType = DOCUMENT_FRAGMENT_NODE_TYPE

        /**
         * @returns {Element}
         */
        get children() {
            return this.childNodes.filter(node => node instanceof Element)
        }

        /**
         * @returns {Element|null}
         */
        get nextElementSibling() {
            return getNextElementSibling(this)
        }

        /**
         * @returns {Element|null}
         */
        get previousElementSibling() {
            return getPreviousElementSibling(this)
        }
    }
    class ShadowRoot extends DocumentFragment {

        fullscreenElement = null

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            const { host } = properties

            this.host = host
            host.shadowRoot = this
        }
    }

    class Element extends Node {

        namespaceURI = null
        nodeType = ELEMENT_NODE_TYPE
        prefix = null
        shadowRoot = null

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            const {
                attributes = [],
                fieldSet,
                form = null,
                indeterminate,
                isContentEditable = false,
                localName,
                selectors = [],
            } = properties

            this.attributes = attributes.map(({ localName, namespaceURI = null, value = '' }) =>
                ({ localName, namespaceURI, ownerElement: this, value }))
            this.classList = new DOMTokenList(this.getAttribute('class')?.split(' '))
            this.indeterminate = indeterminate
            this.isContentEditable = isContentEditable
            this.localName = localName

            this.disabled = !!this.getAttributeNode('disabled')
            this.id = this.getAttribute('id') ?? ''
            this.form = form
            form?.elements.push(this)
            fieldSet?.elements.push(this)
            this.name = this.getAttribute('name') ?? ''
            this.readOnly = !!this.getAttributeNode('readonly')
            this.required = !!this.getAttributeNode('required')
            this.slot = this.getAttribute('slot') ?? ''

            const { parentElement } = this
            if (parentElement?.shadowRoot) {
                parentElement.shadowRoot.children.find(element => element.name === this.slot)._slotted.push(this)
            }

            selectors.forEach(selector => {
                if (expected.has(selector)) {
                    expected.get(selector).push(this)
                } else {
                    expected.set(selector, [this])
                }
            })
        }

        /**
         * @returns {Element}
         */
        get children() {
            return this.childNodes.filter(node => node instanceof Element)
        }

        /**
         * @returns {Element|null}
         */
        get firstElementChild() {
            return this.childNodes.find(node => node instanceof Element) ?? null
        }

        /**
         * @param {string} name
         * @returns {object|null}
         */
        getAttribute(name) {
            return this.getAttributeNode(name)?.value ?? null
        }

        /**
         * @param {string} name
         * @returns {object|null}
         */
        getAttributeNode(name) {
            return this.attributes.find(attribute => attribute.localName === name && attribute.namespaceURI === null) ?? null
        }

        /**
         * @returns {Element|null}
         */
        get nextElementSibling() {
            return getNextElementSibling(this)
        }

        /**
         * @returns {Element|null}
         */
        get previousElementSibling() {
            return getPreviousElementSibling(this)
        }

        /**
         * @returns {string}
         */
        get tagName() {
            if (this.prefix) {
                return `${this.prefix}:${this.localName}`
            }
            return this.localName
        }
    }

    class HTMLElement extends Element { namespaceURI = HTML_NAMESPACE }
    class HTMLAnchorElement extends HTMLElement {

        localName = 'a'

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            let href = this.getAttribute('href')
            if (href === null) {
                href = ''
            } else {
                const url = URL.parse(href, this.ownerDocument.baseURI)
                if (url) {
                    href = `${url}`
                }
            }
            this.href = href
        }
    }
    class HTMLAreaElement extends HTMLElement {

        localName = 'area'

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            let href = this.getAttribute('href') ?? ''
            if (href) {
                const url = URL.parse(href, this.ownerDocument.baseURI)
                if (url) {
                    href = `${url}`
                }
            }
            this.href = href
        }
    }
    class HTMLBodyElement extends HTMLElement { localName = 'body' }
    class HTMLButtonElement extends HTMLElement {

        localName = 'button'
        value = ''

        /**
         * @returns {string}
         */
        get type() {
            const type = this.getAttribute('type')
            switch (type) {
                case 'button':
                case 'reset':
                case 'submit':
                    return type
                default:
                    if (
                        this.getAttributeNode('command')
                        || this.getAttributeNode('commandFor')
                        || this.parentNode instanceof HTMLSelectElement
                    ) {
                        return 'button'
                    }
                    return 'submit'
            }
        }

        /**
         * @returns {object}
         */
        get validity() {
            return { valid: true }
        }
    }
    class HTMLDataListElement extends HTMLElement { localName = 'datalist' }
    class HTMLDetailsElement extends HTMLElement {

        localName = 'details'

        /**
         * @param {object} properties
         */
        constructor(properties) {
            super(properties)
            this.open = properties.open ?? !!this.getAttributeNode('open')
        }
    }
    class HTMLDialogElement extends HTMLElement {

        localName = 'dialog'

        /**
         * @param {object} properties
         */
        constructor(properties) {
            super(properties)
            this.open = properties.open ?? !!this.getAttributeNode('open')
        }
    }
    class HTMLDivElement extends HTMLElement { localName = 'div' }
    class HTMLFieldSetElement extends HTMLElement {
        elements = []
        localName = 'fieldset'
        type = 'fieldset'
    }
    class HTMLFormElement extends HTMLElement {
        elements = []
        localName = 'form'
    }
    class HTMLHeadingElement extends HTMLElement {

        /**
         * @param {object} properties
         */
        constructor(properties) {
            super(properties)
            const { localName } = properties
            this.localName = localName
        }
    }
    class HTMLHtmlElement extends HTMLElement { localName = 'html' }
    class HTMLInputElement extends HTMLElement {

        localName = 'input'

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            const { checked, value } = properties

            this.defaultChecked = !!this.getAttributeNode('checked')
            this.checked = checked ?? this.defaultChecked
            this.max = this.getAttribute('max') ?? ''
            this.min = this.getAttribute('min') ?? ''
            this.step = this.getAttribute('step') ?? ''
            this.type = this.getAttribute('type') ?? 'text'
            this.value = value ?? this.getAttribute('value') ?? ''
        }

        /**
         * @returns {object}
         */
        get validity() {
            switch (this.type) {
                case 'checkbox':
                case 'radio':
                    return this.required && !this.checked
                        ? { valueMissing: true }
                        : { valid: true }
                case 'date':
                case 'datetime-local':
                case 'month':
                case 'number':
                case 'range':
                case 'time':
                case 'week':
                    if (expected.get(':out-of-range')?.includes(this)) {
                        return { rangeOverflow: true, rangeUnderflow: true }
                    }
                    if (this.type === 'range') {
                        return { valid: true }
                    }
                    // falls through
                case 'email':
                case 'file':
                case 'password':
                case 'search':
                case 'tel':
                case 'text':
                case 'url':
                    if (this.required && !this.value) {
                        return { valueMissing: true }
                    }
                    // falls through
                default:
                    return { valid: true }
            }
        }
    }
    class HTMLLegendElement extends HTMLElement { localName = 'legend' }
    class HTMLMeterElement extends HTMLElement {

        localName = 'meter'

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            this.min = this.getAttribute('min') ?? '0'
            this.max = this.getAttribute('max') ?? '1'
            this.low = this.getAttribute('low') ?? this.min
            this.high = this.getAttribute('high') ?? this.max
            this.value = this.getAttribute('value') ?? '0'
            this.optimum = this.getAttribute('optimum') ?? `${(this.max - this.min) / 2}`
        }
    }
    class HTMLOptionElement extends HTMLElement {

        localName = 'option'
        value = ''

        /**
         * @param {object} properties
         */
        constructor(properties = {}) {

            super(properties)

            this.defaultSelected = !!this.getAttributeNode('selected')
            this.selected = properties.selected ?? this.defaultSelected

            const select = findParentElement(this, element => element instanceof HTMLSelectElement)
            if (select) {
                select.options.push(this)
                const { multiple, options, selectedIndex } = select
                const selected = options[selectedIndex]
                if (!multiple && !this.selected && !selected?.getAttributeNode('selected')) {
                    if (selectedIndex === -1) {
                        this.selected = true
                    } else {
                        selected.selected = false
                    }
                }
            }
        }
    }
    class HTMLOptGroupElement extends HTMLElement { localName = 'optgroup' }
    class HTMLProgressElement extends HTMLElement {
        localName = 'progress'
        value = ''
    }
    class HTMLSectionElement extends HTMLElement { localName = 'section' }
    class HTMLSelectElement extends HTMLElement {

        options = []
        localName = 'select'

        /**
         * @param {object} properties
         */
        constructor(properties) {
            super(properties)
            this.multiple = properties.multiple ?? !!this.getAttributeNode('multiple')
        }

        /**
         * @returns {number}
         */
        get selectedIndex() {
            return this.options.findIndex(option => option.selected)
        }

        /**
         * @returns {Element[]}
         */
        get selectedOptions() {
            return this.options.filter(option => option.selected)
        }

        /**
         * @returns {string}
         */
        get type() {
            return `select-${this.multiple ? 'multiple' : 'one'}`
        }

        /**
         * @returns {object}
         */
        get validity() {
            if (this.required && this.selectedIndex === -1) {
                return { valueMissing: true }
            }
            return { valid: true }
        }

        /**
         * @returns {string|undefined}
         */
        get value() {
            return this.selectedOptions[0]?.value ?? ''
        }
    }
    class HTMLSlotElement extends HTMLElement {

        localName = 'slot'
        _slotted = []

        /**
         * @param {object} options
         * @returns {Node}
         */
        assignedNodes({ flatten }) {
            if (flatten) {
                return this._slotted.flat(Infinity)
            }
            return this._slotted
        }
    }
    class HTMLTextAreaElement extends HTMLElement {

        localName = 'textarea'
        type = 'textarea'

        /**
         * @param {object} properties
         */
        constructor(properties) {
            super(properties)
            this.value = properties.value ?? ''
        }

        /**
         * @returns {object}
         */
        get validity() {
            if (this.required && !this.value) {
                return { valueMissing: true }
            }
            return { valid: true }
        }
    }
    class HTMLMediaElement extends HTMLElement {

        static NETWORK_EMPTY = 0
        static NETWORK_IDLE = 1
        static NETWORK_LOADING = 2
        static NETWORK_NO_SOURCE = 3

        static HAVE_NOTHING = 0
        static HAVE_METADATA = 1
        static HAVE_CURRENT_DATA = 2
        static HAVE_FUTURE_DATA = 3
        static HAVE_ENOUGH_DATA = 4

        /**
         * @param {object} properties
         */
        constructor(properties) {

            super(properties)

            const {
                muted,
                networkState = HTMLMediaElement.NETWORK_EMPTY,
                paused = true,
                readyState = HTMLMediaElement.HAVE_NOTHING,
                seeking = false,
            } = properties

            this.muted = muted ?? !!this.getAttributeNode('muted')
            this.paused = paused
            this.networkState = networkState
            this.readyState = readyState
            this.seeking = seeking
        }
    }
    class HTMLVideoElement extends HTMLMediaElement { localName = 'video' }

    class SVGElement extends Element { namespaceURI = SVG_NAMESPACE }
    class SVGSVGElement extends SVGElement { localName = 'svg' }
    class SVGUseElement extends SVGElement { localName = 'use' }

    const assert = new CSSAssert({ skipPrototype: true })
    const expected = new Map

    test('type', () => {

        /**
         * <html>
         *   <body>
         *     <section>
         *       #shadow-root
         *         <section></section>
         *     </section>
         *     <SECTION></SECTION>
         *     <svg></svg>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const host = new HTMLSectionElement({ ownerDocument: document, parentNode: body })
        const shadowRoot = new ShadowRoot({ host, ownerDocument: document })
        const shadowSection = new HTMLSectionElement({ ownerDocument: document, parentNode: shadowRoot })
        const noNamespace = new Element({ localName: 'SECTION', ownerDocument: document, parentNode: body })
        const svg = new SVGSVGElement({ ownerDocument: document, parentNode: body })

        const selections = [
            ['*', [html, body, host, shadowSection, noNamespace, svg]],
            ['*', [html, body, host, shadowSection], { '': HTML_NAMESPACE }],
            ['*', [shadowSection], {}, shadowRoot],
            ['|*', [noNamespace]],
            ['*|*', [html, body, host, shadowSection, noNamespace, svg]],
            ['prefix|*', [html, body, host, shadowSection], { prefix: HTML_NAMESPACE }],
            ['html|*', [svg], { html: SVG_NAMESPACE }],
            ['section', [host, shadowSection]],
            ['section', [host, shadowSection], { '': HTML_NAMESPACE }],
            ['SECTION', [host, shadowSection, noNamespace]],
            ['svg', [svg]],
            ['SVG', []],
        ]
        selections.forEach(([selector, expected, namespaces, tree = document]) =>
            assert.match(selector, expected, tree, { namespaces }))
    })
    test('id', () => {

        /**
         * <html>
         *   <body>
         *     <section id="section"></section>
         *     <section id="section"></section>
         *     <section id="section"></section>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const section = new HTMLSectionElement({
            attributes: [{ localName: 'id', value: 'section' }],
            ownerDocument: document,
            parentNode: body,
        })
        const noNamespace = new Element({
            attributes: [{ localName: 'id', value: 'section' }],
            localName: 'section',
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLSectionElement({
            attributes: [{ localName: 'id', namespaceURI: SVG_NAMESPACE, value: 'section' }],
            ownerDocument: document,
            parentNode: body,
        })

        assert.match('#section', [section, noNamespace], document)
        assert.match('#section', [section, noNamespace], document, { namespaces: { '': HTML_NAMESPACE } })
        assert.match('#SECTION', [], document)
    })
    test('class', () => {

        /**
         * <html>
         *   <body>
         *     <section class="class-1 class-2"></section>
         *     <section class="class-1"></section>
         *     <section class="class-1"></section>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const section = new HTMLSectionElement({
            attributes: [{ localName: 'class', value: 'class-1 class-2' }],
            ownerDocument: document,
            parentNode: body,
        })
        const noNamespace = new Element({
            attributes: [{ localName: 'class', value: 'class-1' }],
            localName: 'section',
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLSectionElement({
            attributes: [{ localName: 'class', namespaceURI: SVG_NAMESPACE, value: 'class-1' }],
            ownerDocument: document,
            parentNode: body,
        })

        const selections = [
            ['.class-1', [section, noNamespace]],
            ['.class-1', [section, noNamespace], { '': HTML_NAMESPACE }],
            ['.CLASS-1', []],
            ['.class-1.class-2', [section]],
        ]
        selections.forEach(([selector, expected, namespaces]) =>
            assert.match(selector, expected, document, { namespaces }))
    })
    test('attribute', () => {

        /**
         * <html>
         *   <body>
         *     <section id="section" class="class-1 class-2" empty=""></section>
         *     <section id="no-namespace"></section>
         *     <svg viewBox="0 0 1 1">
         *       <use xlink:href />
         *     </svg>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const section = new HTMLSectionElement({
            attributes: [
                { localName: 'id', value: 'section' },
                { localName: 'class', value: 'class-1 class-2' },
                { localName: 'color', value: '#fff' },
                { localName: 'empty' },
            ],
            ownerDocument: document,
            parentNode: body,
        })
        const noNamespace = new Element({
            attributes: [{ localName: 'id', value: 'no-namespace' }],
            localName: 'section',
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

        const selections = [
            ['[id]', [section, noNamespace]],
            ['[ID]', [section]],
            ['[id]', [section, noNamespace], { '': HTML_NAMESPACE }],
            ['[viewBox]', [svg]],
            ['[VIEWBOX]', []],
            ['[href]'],
            ['[|id]', [section, noNamespace]],
            ['[|href]'],
            ['[*|id]', [section, noNamespace, svg]],
            ['[*|href]', [use]],
            ['[another-prefix|href]', [use], { 'another-prefix': XLINK_NAMESPACE }],
            ['[xlink|href]', [], { xlink: 'http://www.w3.org/1999/another-xlink' }],
            ['[id=section]', [section]],
            ['[ID=section]', [section]],
            ['[id=SECTION]', []],
            ['[id=SECTION i]', [section]],
            ['[color="#FFF"]', [section]],
            ['[color="#FFF" s]', []],
            ['[class~=class-1]', [section]],
            ['[class~="class-1"]', [section]],
            ['[class|=class]', [section]],
            ['[class^=class-1]', [section]],
            ['[class$=class-2]', [section]],
            ['[class*=class]', [section]],
            ['[empty=""]', [section]],
            ['[empty~=""]'],
            ['[empty|=""]', [section]],
            ['[empty^=""]'],
            ['[empty$=""]'],
            ['[empty*=""]'],
        ]
        selections.forEach(([selector, expected, namespaces]) =>
            assert.match(selector, expected, document, { namespaces }))
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
        const section = new HTMLSectionElement({ ownerDocument: document, parentNode: body })
        const div1 = new HTMLDivElement({ ownerDocument: document, parentNode: body })
        const div2 = new HTMLDivElement({ ownerDocument: document, parentNode: body })

        const selections = [
            ['html *', [body, section, div1, div2]],
            ['body > *', [section, div1, div2]],
            ['section + *', [div1]],
            ['section ~ *', [div1, div2]],
            ['html body section', [section]],
        ]
        selections.forEach(selection => assert.match(...selection, document))
    })

    // Display
    test(':fullscreen, :modal, :open, :picture-in-picture, :popover-open', () => {

        /**
         * <html>
         *   <body>
         *     <details open></details>  <!-- closed by the user -->
         *     <details></details>  <-- open by the user -->
         *     <dialog open></dialog>  <!-- closed by the user -->
         *     <dialog></dialog>  <-- open by the user -->
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
            attributes: [{ localName: 'open', value: 'true' }],
            open: false,
            ownerDocument: document,
            parentNode: body,
        })
        const openDetails = new HTMLDetailsElement({
            open: true,
            ownerDocument: document,
            parentNode: body,
        })
        new HTMLDialogElement({
            attributes: [{ localName: 'open', value: 'true' }],
            open: false,
            ownerDocument: document,
            parentNode: body,
        })
        const openDialog = new HTMLDialogElement({
            open: true,
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
            [':modal', [openDialog, host, video]],
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
         *       <input type="number">  <!-- value set to "1" by the user -->
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
         *       <input type="number" value="1">  <!-- value set to "" by the user -->
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
        const document = new HTMLDocument
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
            parentNode: form.childNodes.at(-1),
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
            parentNode: form.childNodes.at(-1),
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
        new HTMLInputElement({
            attributes: [
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
            value: '',
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
            parentNode: form.childNodes.at(-1),
        })
        new HTMLTextAreaElement({
            attributes: [{ localName: 'value', value: 'value' }],
            form,
            ownerDocument: document,
            parentNode: form,
            selectors: [':blank'],
        })

        assert.match(':blank', expected.get(':blank'), document)
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
         *       <input type="checkbox" checked="true">  <!-- unchecked by the user -->
         *       <input type="radio" checked="true">  <!-- unchecked by the user -->
         *       <select multiple>
         *         <option selected></option>  <!-- unselected by the user -->
         *         <option></option>
         *       </select>
         *
         *       <!-- :checked -->
         *       <input type="checkbox" checked disabled readonly>
         *       <input type="checkbox">  <!-- checked by the user -->
         *       <input type="radio">  <!-- checked by the user -->
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
        const document = new HTMLDocument
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
            parentNode: form.childNodes.at(-1),
            selected: false,
            selectors: [':unchecked'],
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1),
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
            parentNode: form.childNodes.at(-1),
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
            parentNode: form.childNodes.at(-1),
            selectors: [':checked'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1),
            selectors: [':checked'],
        })

        assert.match(':unchecked', expected.get(':unchecked'), document)
        assert.match(':checked', expected.get(':checked'), document)
    })
    test(':default', () => {

        /**
         * <html>
         *   <body>
         *     <form id="form-1">
         *
         *       <!-- :default -->
         *       <button disabled readonly></button>
         *
         *       <!-- not :default -->
         *       <input type="image">
         *       <input type="submit">
         *
         *     </form>
         *     <form id="form-2">
         *
         *       <!-- not :default -->
         *       <button type="button"></button>
         *       <button type="reset"></button>
         *       <input type="button">
         *       <input type="reset">
         *
         *     </form>
         *     <form id="form-3">
         *
         *       <!-- not :default -->
         *       <button form="form-1"></button>
         *
         *       <!-- :default -->
         *       <button form="form-2"></button>
         *       <input type="image">
         *
         *       <!-- not :default -->
         *       <button></button>
         *       <input type="submit">
         *
         *     </form>
         *     <form id="form-4">
         *
         *       <!-- not :default -->
         *       <select>
         *         <option></option>
         *       </select>
         *
         *       <!-- :default -->
         *       <input type="checkbox" checked disabled readonly>
         *       <input type="radio" checked>
         *       <input type="submit">
         *       <select>
         *         <option selected></option>
         *         <option selected></option>
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
        const document = new HTMLDocument
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
            parentNode: form4.childNodes.at(-1),
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
            parentNode: form4.childNodes.at(-1),
            selectors: [':default'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4.childNodes.at(-1),
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
            parentNode: form4.childNodes.at(-1),
            selected: false,
            selectors: [':default'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'selected' }],
            form: form4,
            ownerDocument: document,
            parentNode: form4.childNodes.at(-1),
            selectors: [':default'],
        })

        assert.match(':default', expected.get(':default'), document)
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
        const document = new HTMLDocument
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
            parentNode: form.childNodes.at(-1),
            selectors: [':enabled'],
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1).childNodes.at(-1),
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
            parentNode: form.childNodes.at(-1),
            selectors: [':disabled'],
        })
        new HTMLOptionElement({
            form,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1).childNodes.at(-1),
            selectors: [':disabled'],
        })
        new HTMLOptionElement({
            attributes: [{ localName: 'disabled' }],
            form,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1),
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
            parentNode: legend.childNodes.at(-1),
            selectors: [':enabled'],
        })
        new HTMLOptionElement({
            fieldSet: disabledFieldSet,
            form,
            ownerDocument: document,
            parentNode: legend.childNodes.at(-1).childNodes.at(-1),
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
            parentNode: fieldSet.childNodes.at(-1),
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
            parentNode: fieldSet.childNodes.at(-1),
            selectors: [':enabled'],
        })
        new HTMLOptionElement({
            ownerDocument: document,
            parentNode: fieldSet.childNodes.at(-1).childNodes.at(-1),
            selectors: [':enabled'],
        })
        new HTMLTextAreaElement({
            fieldSet,
            form,
            ownerDocument: document,
            parentNode: fieldSet,
            selectors: [':disabled'],
        })

        assert.match(':disabled', expected.get(':disabled'), document)
        assert.match(':enabled', expected.get(':enabled'), document)
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
         *       <input type="date" min="2000-01-01" value="1999-12-31" max="2000-01-02">  <!-- value set to empty string by the user -->
         *       <input type="date" min="1999-12-31" max="2000-01-02">  <!-- value set to "2000-01-01" by the user -->
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
        const document = new HTMLDocument
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
            parentNode: form.childNodes.at(-1),
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

        assert.match(':out-of-range', expected.get(':out-of-range'), document)
        assert.match(':in-range', expected.get(':in-range'), document)
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
        const document = new HTMLDocument
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
            parentNode: form3.childNodes.at(-1),
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
            parentNode: form3.childNodes.at(-1),
        })
        new HTMLTextAreaElement({
            form: form3,
            ownerDocument: document,
            parentNode: form3,
            selectors: [':valid'],
        })

        assert.match(':valid', expected.get(':valid'), document)
        assert.match(':invalid', expected.get(':invalid'), document)
    })
    test(':indeterminate', () => {

        /**
         * <html>
         *   <body>
         *
         *     <form id="form-1">
         *
         *       <!-- not :indeterminate -->
         *       <div type="checkbox"></div>  <!-- the user set `indeterminate` to `true` -->
         *       <input type="checkbox">
         *       <input type="radio">  <!-- the user set `indeterminate` to `true` -->
         *       <input type="radio" name="group-1" checked>  <!-- the user set `indeterminate` to `true` -->
         *       <progress value=""></progress>  <!-- the user set `indeterminate` to `true` -->
         *
         *       <!-- :indeterminate -->
         *       <input type="radio" name="group-2">
         *
         *     </form>
         *
         *     <form id="form-2">
         *
         *       <!-- not :indeterminate -->
         *       <input type="radio" form="form-1" name="group-1">
         *
         *       <!-- :indeterminate -->
         *       <input type="checkbox" disabled readonly>  <!-- the user set `indeterminate` to `true` -->
         *       <input type="checkbox">  <!-- the user set `indeterminate` to `true` -->
         *       <input type="radio" form="form-1" name="group-2">
         *       <progress></progress>
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })

        const form1 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-1' }],
            ownerDocument: document,
            parentNode: body,
        })
        // Not :indeterminate
        new HTMLDivElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form: form1,
            indeterminate: 'true',
            ownerDocument: document,
            parentNode: form1,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form: form1,
            ownerDocument: document,
            parentNode: form1,
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'radio' }],
            form: form1,
            indeterminate: 'true',
            ownerDocument: document,
            parentNode: form1,
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: 'group-1' },
                { localName: 'checked' },
            ],
            form: form1,
            indeterminate: 'true',
            ownerDocument: document,
            parentNode: form1,
        })
        new HTMLProgressElement({
            attributes: [{ localName: 'value' }],
            indeterminate: 'true',
            ownerDocument: document,
            parentNode: form1,
        })
        // :indeterminate
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'name', value: 'group-2' },
            ],
            form: form1,
            ownerDocument: document,
            parentNode: form1,
            selectors: [':indeterminate'],
        })

        const form2 = new HTMLFormElement({
            attributes: [{ localName: 'id', value: 'form-2' }],
            ownerDocument: document,
            parentNode: body,
        })
        // Not :indeterminate
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'form', value: 'form-1' },
                { localName: 'name', value: 'group-1' },
            ],
            form: form2,
            ownerDocument: document,
            parentNode: form2,
        })
        // :indeterminate
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'checkbox' },
                { localName: 'disabled' },
                { localName: 'readonly' },
            ],
            form: form2,
            indeterminate: 'true',
            ownerDocument: document,
            parentNode: form2,
            selectors: [':indeterminate'],
        })
        new HTMLInputElement({
            attributes: [{ localName: 'type', value: 'checkbox' }],
            form: form2,
            indeterminate: 'true',
            ownerDocument: document,
            parentNode: form2,
            selectors: [':indeterminate'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'radio' },
                { localName: 'form', value: 'form-1' },
                { localName: 'name', value: 'group-2' },
            ],
            form: form1,
            ownerDocument: document,
            parentNode: form2,
            selectors: [':indeterminate'],
        })
        new HTMLProgressElement({
            ownerDocument: document,
            parentNode: form2,
            selectors: [':indeterminate'],
        })

        assert.match(':indeterminate', expected.get(':indeterminate'), document)
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
        const document = new HTMLDocument
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

        assert.match(':optional', expected.get(':optional'), document)
        assert.match(':required', expected.get(':required'), document)
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
        const document = new HTMLDocument
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

        assert.match(':placeholder-shown', expected.get(':placeholder-shown'), document)
    })
    test(':read-only, :read-write', () => {

        /**
         * <html>
         *   <body>
         *     <form>
         *
         *       <!-- neither :read-only or :read-write -->
         *       <section></section>
         *       <svg></svg>
         *
         *       <!-- :read-only -->
         *       <button></button>
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
         *       <div contenteditable disabled readonly>
         *         <button disabled readonly></button>
         *         <!-- :read-only -->
         *         <input type="date" disabled>
         *         <input type="date" readonly>
         *         <textarea disabled></textarea>
         *         <textarea readonly></textarea>
         *       </div>
         *       <input type="button" contenteditable>
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
         *
         *     </form>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document, selectors: [':read-only'] })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html, selectors: [':read-only'] })
        const form = new HTMLFormElement({ ownerDocument: document, parentNode: body, selectors: [':read-only'] })

        // Neither :read-only or :read-write
        new Element({ localName: 'section', ownerDocument: document, parentNode: body })
        new SVGSVGElement({ ownerDocument: document, parentNode: body })

        // :read-only
        new HTMLButtonElement({
            form,
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
            parentNode: form.childNodes.at(-1),
            selectors: [':read-write'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'disabled' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1),
            selectors: [':read-only'],
        })
        new HTMLInputElement({
            attributes: [
                { localName: 'type', value: 'date' },
                { localName: 'readonly' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1),
            selectors: [':read-only'],
        })
        new HTMLTextAreaElement({
            attributes: [
                { localName: 'disabled' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1),
            selectors: [':read-only'],
        })
        new HTMLTextAreaElement({
            attributes: [
                { localName: 'readonly' },
            ],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form.childNodes.at(-1),
            selectors: [':read-only'],
        })
        new HTMLButtonElement({
            attributes: [{ localName: 'contenteditable' }],
            isContentEditable: true,
            ownerDocument: document,
            parentNode: form,
            selectors: [':read-write'],
        })
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

        assert.match(':read-only', expected.get(':read-only'), document)
        assert.match(':read-write', expected.get(':read-write'), document)
    })
    // Logical
    test(':is(), :not(), :where()', () => {

        /**
         * <html>
         *   <body>
         *     <section></section>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const section = new HTMLSectionElement({ ownerDocument: document, parentNode: body })

        const selections = [
            // [':is()'], // <pseudo-class-selector> does not currently allow pseudo function taking no argument
            [':is(*::before)'],
            [':is(*::before, html)', [html]],
            [':is(html *)', [body, section]],
            [':not(html)', [body, section]],
            [':not(html, body)', [section]],
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
        const document = new HTMLDocument({ baseURI: 'http://localhost/#current-target' })
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
        const document = new HTMLDocument({ baseURI: 'http://localhost/level-1/level-2/#target' })
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
            selectors: [':local-link', ':local-link(0)', ':local-link(1)', ':local-link(2)'],
        })

        const selectors = [
            ':local-link',
            ':local-link(0)',
            ':local-link(1)',
            ':local-link(2)',
            ':local-link(3)',
        ]
        selectors.forEach(selector => assert.match(selector, expected.get(selector), document))
    })
    // Resource
    test(':buffering, :muted, :paused, :playing, :seeking, :stalled, :volume-locked', () => {

        /**
         * <html>
         *   <body>
         *     <video muted="true"></video>  <!-- unmuted by the user -->
         *     <video muted></video>
         *     <div></div>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
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
        selectors.forEach(selector => assert.match(selector, expected.get(selector), document))
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
        const host = new HTMLSectionElement({ ownerDocument: document, parentNode: body })
        const shadowRoot = new ShadowRoot({ host, ownerDocument: document })
        const shadowElement = new HTMLSectionElement({ ownerDocument: document, parentNode: shadowRoot })
        const div = new HTMLDivElement({ ownerDocument: document, parentNode: body })

        const selections = [
            [':root', [html]],
            [':root', [], shadowRoot],
            [':host', []],
            [':host', [host], shadowRoot],
            [':host > *', [shadowElement], shadowRoot],
            [':host + *', [], shadowRoot],
            [':host(div)', [], shadowRoot],
            [':host(section)', []],
            [':host(section)', [host], shadowRoot],
            [':host-context(div)', [], shadowRoot],
            [':host-context(body)', []],
            [':host-context(body)', [host], shadowRoot],
            [':scope', [html]],
            [':scope', [host], shadowRoot],
            [':scope', [html], document, { scopes: { roots: [document] } }],
            [':scope', [html], document, { scopes: { inclusive: true, roots: [html] } }],
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
        selections.forEach(([selector, expected, tree = document, options]) =>
            assert.match(selector, expected, tree, options))
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
        const section = new HTMLSectionElement({ ownerDocument: document, parentNode: body })
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
            [':empty', [section, ...divs.slice(1), noNamespace]],
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
        new HTMLSectionElement({ ownerDocument: document, parentNode: body })
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
         *     <section>
         *       #shadow-root
         *         <slot></slot>
         *         <slot name="slot-2"></slot>
         *         <slot></slot>
         *       <div></div>
         *       <div></div>
         *       <div slot="slot-1"></div>
         *     </section>
         *   </body>
         * </html>
         */
        const document = new HTMLDocument
        const html = new HTMLHtmlElement({ ownerDocument: document, parentNode: document })
        const body = new HTMLBodyElement({ ownerDocument: document, parentNode: html })
        const host = new HTMLSectionElement({ ownerDocument: document, parentNode: body })

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

    function match(query) {
        return matchSupport(parseGrammar(`(${query})`, '<supports-condition>'))
    }

    test('at-rule', () => {
        assert.equal(match('at-rule(@style)'), false)
        assert.equal(match('at-rule(@ANNOTATION)'), true)
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
        declarations.forEach(([declaration, expected = true]) => assert.equal(match(declaration), expected))
    })
    test('font technology', () => {
        assert.equal(match('font-tech(color-svg)'), true)
    })
    test('font format', () => {
        assert.equal(match('font-format("woff")'), false)
        assert.equal(match('font-format(woff)'), true)
    })
    // TODO: fix `value` of `<supports-feature-named-feature-fn>`
    test.skip('named feature', () => {
        assert.equal(match('named-feature(unknown)', false))
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
