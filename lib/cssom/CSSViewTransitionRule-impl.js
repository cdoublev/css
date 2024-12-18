
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')
const { parseBlockContents } = require('../parse/parser.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')

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
        const { declarations } = parseBlockContents(privateData.value, this)
        const navigation = declarations.find(declaration => declaration.name === 'navigation')
        if (navigation) {
            this.navigation = serializeCSSValue(navigation)
        }
        const types = declarations.find(declaration => declaration.name === 'types')
        this.types = Object.freeze(Array.isArray(types?.value)
            ? [...types.value.map(serializeCSSComponentValue)] // Spread List into a plain Array
            : [])
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
        if (0 < types.length) {
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
