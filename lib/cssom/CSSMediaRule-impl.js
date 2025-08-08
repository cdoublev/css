
import CSSConditionRuleImpl from './CSSConditionRule-impl.js'
import MediaList from './MediaList.js'
import matchMediaQueryList from '../match/media.js'

/**
 * @see {@link https://drafts.csswg.org/css-conditional-3/#cssmediarule}
 */
export default class CSSMediaRuleImpl extends CSSConditionRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        this.media = MediaList.createImpl(globalObject, undefined, { list: this._condition })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { cssRules, media: { mediaText } } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        if (mediaText) {
            if (rules) {
                return `@media ${mediaText} { ${rules} }`
            }
            return `@media ${mediaText} {}`
        }
        if (rules) {
            return `@media { ${rules} }`
        }
        return '@media {}'
    }

    /**
     * @returns {string}
     */
    get conditionText() {
        return this.media.mediaText
    }

    /**
     * @returns {boolean}
     * @see {@link https://drafts.csswg.org/css-conditional-3/#dom-cssmediarule-matches}
     */
    get matches() {
        const { _globalObject, media } = this
        return _globalObject ? matchMediaQueryList(media._list, _globalObject) : false
    }
}
