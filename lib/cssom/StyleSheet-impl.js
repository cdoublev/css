
/**
 * @interface
 * @see {@link https://drafts.csswg.org/cssom/#stylesheet}
 */
class StyleSheetImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-disabled}
     */
    disabled = false
}

module.exports = {
    implementation: StyleSheetImpl,
}
