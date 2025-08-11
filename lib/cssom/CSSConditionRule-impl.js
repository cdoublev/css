
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSNestedDeclarations from './CSSNestedDeclarations.js'
import CSSRuleList from './CSSRuleList.js'
import { parseBlockContents } from '../parse/parser.js'
import { serializeCSSComponentValue } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssconditionrule}
 */
export default class CSSConditionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { prelude, value } = privateData
        const rules = parseBlockContents(value, this).map(rule => {
            if (Array.isArray(rule)) {
                return CSSNestedDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._condition = prelude
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-cssconditionrule-conditiontext}
     */
    get conditionText() {
        return serializeCSSComponentValue(this._condition)
    }
}
