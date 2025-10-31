
/**
 * @interface
 * @see {@link https://drafts.csswg.org/cssom-1/#stylesheet}
 */
export default class StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheet-disabled}
     */
    disabled = false

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#concept-css-style-sheet-type}
     */
    type = 'text/css'

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheet-href}
     */
    get href() {
        return this._location
    }
}
