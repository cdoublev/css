
import CSSPseudoElement from './CSSPseudoElement.js'
import { elements as definitions } from '../values/pseudos.js'
import { isFailure } from '../utils/value.js'
import { parseGrammar } from '../parse/parser.js'
import { serializeComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-pseudo-4/#csspseudoelement}
 */
export default class CSSPseudoElementImpl {

    /**
     * @param {Window} globalObject
     * @param {*[]} args
     */
    constructor(globalObject, { element, parent, selectorText, type }) {
        this._globalObject = globalObject
        this.element = element
        this.parent = parent
        this.selectorText = selectorText
        this.type = type
    }

    /**
     * @returns {Document}
     */
    get ownerDocument() {
        return this.element.ownerDocument
    }

    /**
     * @param {object} options
     * @returns {Document|ShadowRoot}
     */
    getRootNode(options) {
        return this.element.getRootNode(options)
    }

    /**
     * @param {string} type
     * @returns {CSSPseudoElementImpl|null}
     * @see {@link https://drafts.csswg.org/css-pseudo-4/#dom-csspseudoelement-pseudo}
     */
    pseudo(type) {

        const selectorText = parseGrammar(type, '<pseudo-element-selector>')

        if (isFailure(selectorText)) {
            return null
        }

        const [, [, { value, name }]] = selectorText

        type = name ?? value

        if (!definitions[this.type.slice(2)].elements?.includes(type)) {
            return null
        }

        const properties = {
            element: this.element,
            parent: this,
            selectorText: serializeComponentValue(selectorText),
            type: `::${type}`,
        }

        return CSSPseudoElement.createImpl(this._globalObject, properties)
    }
}
