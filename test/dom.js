
import { CSSStyleProperties, CSSStyleSheet, StyleSheetList } from '../lib/cssom/index.js'
import { findAncestor } from '../lib/utils/dom.js'
import { implForWrapper } from '../lib/cssom/utils.js'

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

export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'
export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg'
export const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink'

/**
 * @param {Element} element
 * @returns {Element|null}
 */
function getNextSibling(element) {
    const { parentElement } = element
    if (parentElement) {
        const { children } = parentElement
        const index = children._list.indexOf(element)
        const child = children._list[index + 1]
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
function getPreviousSibling(element) {
    const { parentElement } = element
    if (parentElement) {
        const { children } = parentElement
        const index = children._list.indexOf(element)
        const child = children._list[index - 1]
        if (child) {
            return child
        }
    }
    return null
}

export class DOMTokenList {

    /**
     * @param {string[]} list
     */
    constructor(list = []) {
        this._list = new Set(list)
    }

    /**
     * @param {string} token
     * @returns {boolean}
     */
    contains(token) {
        return this._list.has(token)
    }
}

export class HTMLCollection {

    /**
     * @param {NodeList} list
     */
    constructor(list) {
        this._list = list._list
    }

    /**
     * @param {number} index
     * @returns {Element|null}
     */
    item(index) {
        return this._list.filter(node => node instanceof Element)[index] ?? null
    }

    /**
     * @returns {number}
     */
    get length() {
        return this._list.reduce((sum, node) => sum += node instanceof Element ? 1 : 0, 0)
    }
}

export class NodeList {

    /**
     * @param {Element[]} list
     */
    constructor(list = []) {
        this._list = list
    }

    /**
     * @param {number} index
     * @returns {Element|null}
     */
    item(index) {
        return this._list[index] ?? null
    }

    /**
     * @returns {number}
     */
    get length() {
        return this._list.length
    }
}

export class Node {

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

    childNodes = new NodeList

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
            parentNode.childNodes._list.push(this)
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
        return this === node || this.childNodes._list.some(child => child === node || child.contains(node))
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

export class CharacterData extends Node {

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

export class Comment extends CharacterData { nodeType = COMMENT_NODE_TYPE }
export class Text extends CharacterData { nodeType = TEXT_NODE_TYPE }

export class Document extends Node {

    adoptedStyleSheets = []
    fullscreenElement = null
    nodeType = DOCUMENT_NODE_TYPE
    pictureInPictureElement = null
    styleSheets = StyleSheetList.create(globalThis)

    /**
     * @param {object} [properties]
     */
    constructor(properties = {}) {

        super(properties)

        const {
            activeViewTransition = null,
            selected,
            url = 'http://localhost/',
            userAgentStyleSheet = '',
            userStyleSheet = '',
        } = properties

        globalThis.document = this

        this.activeViewTransition = activeViewTransition
        this.children = new HTMLCollection(this.childNodes)
        this.location = new URL(url)
        this.URL = url

        // Private
        this._selected = selected
        this._userAgentStyleSheet = CSSStyleSheet.create(globalThis, undefined, {
            location: this.baseURI,
            rules: userAgentStyleSheet,
        })
        this._userStyleSheet = CSSStyleSheet.create(globalThis, undefined, {
            location: this.baseURI,
            rules: userStyleSheet,
        })
    }

    /**
     * @returns {string}
     */
    get baseURI() {
        return this.URL
    }

    /**
     * @returns {Element}
     */
    get documentElement() {
        return this.children._list[0]
    }
}

export class HTMLDocument extends Document { contentType = 'text/html' }

export class DocumentFragment extends Node {

    nodeType = DOCUMENT_FRAGMENT_NODE_TYPE

    /**
     * @param {object} properties
     */
    constructor(properties) {
        super(properties)
        this.children = new HTMLCollection(this.childNodes)
    }

    /**
     * @returns {Element|null}
     */
    get nextElementSibling() {
        return getNextSibling(this)
    }

    /**
     * @returns {Element|null}
     */
    get previousElementSibling() {
        return getPreviousSibling(this)
    }
}

export class ShadowRoot extends DocumentFragment {

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

export class Element extends Node {

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
        this.children = new HTMLCollection(this.childNodes)
        this.classList = new DOMTokenList(this.getAttribute('class')?.split(' '))
        this.indeterminate = indeterminate
        this.isContentEditable = isContentEditable
        this.localName = localName

        this.form = form
        form?.elements.push(this)
        fieldSet?.elements.push(this)
        this.name = this.getAttribute('name') ?? ''
        this.required = !!this.getAttributeNode('required')
        this.slot = this.getAttribute('slot') ?? ''

        const { parentElement } = this
        if (parentElement?.shadowRoot) {
            parentElement.shadowRoot.children._list.find(element => element.name === this.slot)._slotted.push(this)
        }

        const { ownerDocument: { _selected } } = this
        selectors.forEach(selector => {
            if (_selected.has(selector)) {
                _selected.get(selector).push(this)
            } else {
                _selected.set(selector, [this])
            }
        })
    }

    /**
     * @returns {Element|null}
     */
    get firstElementChild() {
        return this.childNodes._list.find(node => node instanceof Element) ?? null
    }

    /**
     * @param {string} name
     * @returns {object|null}
     */
    getAttribute(name) {
        return this.getAttributeNS(null, name)
    }

    /**
     * @param {string|null} namespace
     * @param {string} name
     * @returns {object|null}
     */
    getAttributeNS(namespace, name) {
        return this.getAttributeNodeNS(namespace, name)?.value ?? null
    }

    /**
     * @param {string} name
     * @returns {object|null}
     */
    getAttributeNode(name) {
        return this.getAttributeNodeNS(null, name)
    }

    /**
     * @param {string|null} namespace
     * @param {string} name
     * @returns {object|null}
     */
    getAttributeNodeNS(namespace, name) {
        return this.attributes.find(attribute => attribute.localName === name && attribute.namespaceURI === namespace) ?? null
    }

    /**
     * @param {string} name
     * @returns {boolean}
     */
    hasAttribute(name) {
        return this.hasAttributeNS(null, name)
    }

    /**
     * @param {string|null} namespace
     * @param {string} name
     * @returns {boolean}
     */
    hasAttributeNS(namespace, name) {
        return !!this.getAttributeNodeNS(namespace, name)
    }

    /**
     * @returns {Element|null}
     */
    get nextElementSibling() {
        return getNextSibling(this)
    }

    /**
     * @returns {Element|null}
     */
    get previousElementSibling() {
        return getPreviousSibling(this)
    }

    /**
     * @param {string} value
     */
    setAttribute(name, value) {
        const node = this.getAttributeNode(name)
        if (node) {
            node.value = value
        } else {
            this.attributes.push({ localName: name, namespaceURI: null, ownerElement: this, value })
        }
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

export class HTMLElement extends Element {

    namespaceURI = HTML_NAMESPACE

    /**
     * @returns {CSSStyleProperties}
     */
    get style() {
        return this._style ??= CSSStyleProperties.create(globalThis, undefined, { ownerNode: this })
    }
}

export class HTMLAnchorElement extends HTMLElement {

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
            const url = URL.parse(href, this.baseURI)
            if (url) {
                href = `${url}`
            }
        }
        this.href = href
    }
}

export class HTMLAreaElement extends HTMLElement {

    localName = 'area'

    /**
     * @param {object} properties
     */
    constructor(properties) {

        super(properties)

        let href = this.getAttribute('href') ?? ''
        if (href) {
            const url = URL.parse(href, this.baseURI)
            if (url) {
                href = `${url}`
            }
        }
        this.href = href
    }
}

export class HTMLBodyElement extends HTMLElement { localName = 'body' }

export class HTMLButtonElement extends HTMLElement {

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

export class HTMLDataListElement extends HTMLElement { localName = 'datalist' }

export class HTMLDetailsElement extends HTMLElement { localName = 'details' }

export class HTMLDialogElement extends HTMLElement { localName = 'dialog' }

export class HTMLDivElement extends HTMLElement { localName = 'div' }

export class HTMLFieldSetElement extends HTMLElement {
    elements = []
    localName = 'fieldset'
    type = 'fieldset'
}

export class HTMLFormElement extends HTMLElement {
    elements = []
    localName = 'form'
}

export class HTMLHeadingElement extends HTMLElement {

    /**
     * @param {object} properties
     */
    constructor(properties) {
        super(properties)
        const { localName } = properties
        this.localName = localName
    }
}

export class HTMLHtmlElement extends HTMLElement { localName = 'html' }

export class HTMLInputElement extends HTMLElement {

    localName = 'input'

    /**
     * @param {object} properties
     */
    constructor(properties) {

        super(properties)

        const { checked, value } = properties

        this.checked = checked ?? !!this.getAttributeNode('checked')
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
                if (this.ownerDocument._selected.get(':out-of-range')?.includes(this)) {
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

export class HTMLLegendElement extends HTMLElement { localName = 'legend' }

export class HTMLMeterElement extends HTMLElement {

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

export class HTMLOptionElement extends HTMLElement {

    localName = 'option'
    value = ''

    /**
     * @param {object} properties
     */
    constructor(properties = {}) {

        super(properties)

        this.selected = properties.selected ?? !!this.getAttributeNode('selected')

        const select = findAncestor(this, element => element instanceof HTMLSelectElement)
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

export class HTMLOptGroupElement extends HTMLElement { localName = 'optgroup' }

export class HTMLProgressElement extends HTMLElement {
    localName = 'progress'
    value = ''
}

export class HTMLSectionElement extends HTMLElement { localName = 'section' }

export class HTMLSelectElement extends HTMLElement {

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

export class HTMLSlotElement extends HTMLElement {

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

export class HTMLStyleElement extends HTMLElement {

    localName = 'style'

    /**
     * @param {object} properties
     */
    constructor(properties) {

        super(properties)

        this.sheet = CSSStyleSheet.create(globalThis, undefined, { rules: properties.innerText })
        implForWrapper(this.ownerDocument.styleSheets)._list.push(implForWrapper(this.sheet))
    }
}

export class HTMLTextAreaElement extends HTMLElement {

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

export class HTMLMediaElement extends HTMLElement {

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
        this.networkState = networkState
        this.paused = paused
        this.readyState = readyState
        this.seeking = seeking
    }
}

export class HTMLVideoElement extends HTMLMediaElement { localName = 'video' }

export class SVGElement extends Element {

    namespaceURI = SVG_NAMESPACE

    /**
     * @returns {CSSStyleProperties}
     */
    get style() {
        return this._style ??= CSSStyleProperties.create(globalThis, undefined, { ownerNode: this })
    }
}

export class SVGSVGElement extends SVGElement { localName = 'svg' }

export class SVGUseElement extends SVGElement { localName = 'use' }
