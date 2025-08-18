
import CSSRuleImpl from './CSSRule-impl.js'
import { serializeComponentValueList } from '../serialize.js'

/**
 * @see {@link https://drafts.csswg.org/css-cascade-5/#csslayerstatementrule}
 */
export default class CSSLayerStatementRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this.nameList = serializeComponentValueList(privateData.prelude)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        return `@layer ${this.nameList};`
    }
}
