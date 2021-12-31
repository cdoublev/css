
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
     * @returns {string|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-href}
     */
    get href() {
        return this.#location
    }

    /**
     * @returns {MediaList}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-media}
     */
    get media() {
        return this.#media
    }

    /**
     * @returns {Node|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-ownernode}
     */
    get ownerNode() {
        return this.#ownerNode
    }

    /**
     * @returns {StyleSheet|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-parentstylesheet}
     */
    get parentStyleSheet() {
        return this.#parent
    }

    /**
     * @returns {string|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-title}
     */
    get title() {
        if (this.#title === '') {
            return null
        }
        return this.#title
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-stylesheet-type}
     */
    get type() {
        return this.#type
    }
}

module.exports = {
    implementation: StyleSheetImpl,
}
