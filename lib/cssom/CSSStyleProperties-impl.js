
import CSSStyleDeclarationImpl from './CSSStyleDeclaration-impl.js'

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssstyleproperties}
 */
export default class CSSStylePropertiesImpl extends CSSStyleDeclarationImpl {

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyleproperties-cssfloat}
     */
    get cssFloat() {
        return this.getPropertyValue('float')
    }

    /**
     * @param {string} value
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyleproperties-cssfloat}
     */
    set cssFloat(value) {
        this.setProperty('float', value)
    }
}
