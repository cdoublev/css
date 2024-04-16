
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { serializeCSSComponentValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-view-transitions-2/#cssviewtransitionrule}
 */
class CSSViewTransitionRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { value: { declarations } } = privateData
        const navigation = declarations.find(declaration => declaration.name === 'navigation')
        if (navigation) {
            this.navigation = serializeCSSComponentValue(navigation.value)
        }
        const types = declarations.find(declaration => declaration.name === 'types')
        this.types = Object.freeze(Array.isArray(types?.value) ? [...types.value.map(serializeCSSComponentValue)] : [])
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { navigation, types } = this
        const declarations = []
        if (navigation) {
            declarations.push(`navigation: ${navigation}`)
        }
        if (types) {
            declarations.push(`types: ${types.join(' ')}`)
        }
        return 0 < declarations.length
            ? `@view-transition { ${declarations.join('; ')}; }`
            : '@view-transition {}'
    }
}

module.exports = {
    implementation: CSSViewTransitionRuleImpl,
}
