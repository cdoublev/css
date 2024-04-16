
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { cssPropertyToIDLAttribute } = require('../utils/string.js')

/**
 * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#csspropertyrule}
 */
class CSSPropertyRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value } = privateData
        this.name = serializeCSSComponentValue(prelude)
        value.declarations.forEach(({ name, value }) =>
            this[cssPropertyToIDLAttribute(name)] = serializeCSSValue({ name, value }))
        this.initialValue ??= null
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     * @see {@link https://drafts.css-houdini.org/css-properties-values-api-1/#serialize-a-csspropertyrule}
     */
    get cssText() {
        const { inherits, initialValue, name, syntax } = this
        let string = `@property ${name} { syntax: ${syntax}; inherits: ${inherits}; `
        if (initialValue !== null) {
            string += `initial-value: ${initialValue}; `
        }
        string += '}'
        return string
    }
}

module.exports = {
    implementation: CSSPropertyRuleImpl,
}
