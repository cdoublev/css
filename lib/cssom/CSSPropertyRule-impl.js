
import { serializeCSSComponentValue, serializeCSSValue } from '../serialize.js'
import CSSRuleImpl from './CSSRule-impl.js'
import { parseBlockContents } from '../parse/parser.js'
import { toIDLAttribute } from '../utils/string.js'

/**
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#csspropertyrule}
 */
export default class CSSPropertyRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        const declarations = parseBlockContents(value, this)[0] ?? []
        this.name = serializeCSSComponentValue(prelude)
        declarations.forEach(({ name, value }) => {
            let attribute = toIDLAttribute(name)
            if (attribute === 'initialValue') {
                attribute = `_${attribute}`
            }
            this[attribute] = serializeCSSValue({ name, value })
        })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#serialize-a-csspropertyrule}
     */
    get cssText() {
        const { inherits, _initialValue, name, syntax } = this
        let string = `@property ${name} { syntax: ${syntax}; inherits: ${inherits}; `
        if (_initialValue !== undefined) {
            string += `initial-value: ${_initialValue}; `
        }
        string += '}'
        return string
    }

    /**
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#dom-csspropertyrule-initialvalue}
     * @see {@link https://github.com/w3c/css-houdini-drafts/issues/1115}
     */
    get initialValue() {
        return this._initialValue ?? ''
    }
}
