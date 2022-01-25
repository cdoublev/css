
/**
 * @interface
 * @see {@link https://drafts.csswg.org/cssom/#stylesheet}
 */
class StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-disabled}
     */
    disabled = false

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-href}
     */
    get href() {
        return this._location
    }
}

module.exports = {
    implementation: StyleSheetImpl,
}
