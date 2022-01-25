
const { implementation: CSSRuleImpl } = require('./CSSRule-impl')
const CSSStyleDeclaration = require('./CSSStyleDeclaration.js')
const { getDeclarationsInSpecifiedOrder, parseCSSDeclarationList, parseCSSGrammar } = require('../parse/syntax.js')
const { serializeValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
 */
const definition = {
    prelude: '<keyframe-selector>#',
    value: {
        properties: [
            'animation',
            'animation-delay',
            'animation-direction',
            'animation-duration',
            'animation-fill-mode',
            'animation-iteration-count',
            'animation-name',
            'animation-play-state',
        ],
        type: '<declaration-list>',
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframerule}
 */
class CSSKeyframeImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData, definition)
        const { prelude, value } = privateData
        this._declarations = parseCSSDeclarationList(value, definition.value, this)
        this._keyText = serializeValue(prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    get keyText() {
        return this._keyText
    }

    /**
     * @param {string} select
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-keytext}
     */
    set keyText(select) {
        const parsed = parseCSSGrammar(select, '<keyframe-selector>#')
        if (parsed) {
            this._keyText = serializeValue(parsed)
        } else {
            new DOMException('TODO: check out the error message from browser vendors', 'SyntaxError')
        }
    }

    /**
     * @returns {CSSStyleDeclaration}
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframerule-style}
     */
    get style() {
        const properties = {
            declarations: getDeclarationsInSpecifiedOrder(this._declarations),
            parentRule: this,
        }
        return CSSStyleDeclaration.create(this._globalObject, [], properties)
    }
}

module.exports = {
    definition,
    implementation: CSSKeyframeImpl,
}
