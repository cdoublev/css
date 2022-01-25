
const { insertCSSRule, removeCSSRule, parseCSSRuleList } = require('../parse/syntax.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { definition: keyframe } = require('./CSSKeyframeRule-impl.js')

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#keyframes}
 */
const definition = {
    prelude: '<keyframes-name>',
    value: {
        rules: {
            qualified: keyframe,
        },
        type: '<rule-list>',
    },
}

/**
 * @see {@link https://drafts.csswg.org/css-animations-1/#csskeyframesrule}
 */
class KeyframesImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData, definition)
        const { prelude: { name: { value: name } }, value } = privateData
        this._rules = parseCSSRuleList(value, definition.value, this)
        this.name = name
        this.cssRules = CSSRuleList.create(globalObject, undefined, { rules: this._rules })
    }

    /**
     * @param {string} rule
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-appendrule}
     */
    appendRule(rule) {
        // TODO: fix https://github.com/w3c/csswg-drafts/issues/6972
        insertCSSRule(this._rules, rule, this._rules.length - 1, this)
    }

    /**
     * @param {string} select
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-deleterule}
     */
    deleteRule(select) {
        select = this._normalizeSelect(select)
        const index = this._rules.findIndex(({ keyText }) => keyText === select)
        if (-1 < index) {
            removeCSSRule(this._rules, index)
        }
    }

    /**
     * @param {string} selector
     * @see {@link https://drafts.csswg.org/css-animations-1/#dom-csskeyframesrule-findrule}
     */
    findRule(select) {
        select = this._normalizeSelect(select)
        return this._rules.find(({ keyText }) => keyText === select)
    }

    _normalizeSelect(select) {
        return select.split(/\s*,\s*/).join(', ')
    }
}

module.exports = {
    definition,
    implementation: KeyframesImpl,
}
