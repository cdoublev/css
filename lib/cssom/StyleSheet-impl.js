
/**
 * @interface
 * @see {@link https://drafts.csswg.org/cssom-1/#stylesheet}
 */
class StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheet-disabled}
     */
    disabled = false

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-stylesheet-href}
     */
    get href() {
        return this._location
    }
}

module.exports = {
    implementation: StyleSheetImpl,
}
