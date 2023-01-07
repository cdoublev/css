
const {
    createParser,
    getDeclarationsInSpecifiedOrder,
    parseCSSDeclaration,
    parseCSSDeclarationBlock,
    setCSSDeclaration,
} = require('../parse/syntax.js')
const { serializeCSSDeclarationBlock, serializeCSSValue } = require('../serialize.js')
const { aliases } = require('../properties/compatibility.js')
const createError = require('../error.js')
const idlUtils = require('./utils.js')
const parseShorthand = require('../parse/shorthand.js')
const shorthands = require('../properties/shorthands.js')

const UPDATE_COMPUTED_STYLE_DECLARATION_ERROR = {
    message: 'Cannot change a read-only computed style declaration"',
    name: 'NoModificationAllowedError',
    type: 'DOMException',
}

/**
 * @see {@link https://drafts.csswg.org/cssom-1/#cssstyledeclaration}
 */
class CSSStyleDeclarationImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#cssstyledeclaration-updating-flag}
     */
    _updating = false

    /**
     * @param {object} globalObject
     * @param {*[]} args
     * @param {object} privateData
     * @see {@link https://drafts.csswg.org/cssom-1/#ref-for-css-declaration-block⑥}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylerule-style}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssgroupingrule-style} (typo in URL)
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssmarginrule-style}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-elementcssinlinestyle-style}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-window-getcomputedstyle}
     *
     * `privateData.declarations` (CSS declarations) is only specified as a list
     * in the procedure for `Window.getComputedStyle()`, but a `Map` makes the
     * code more readable, is probably more efficient and more appropriate to
     * represent a list of declarations that must not include more than one
     * declaration with the same property.
     */
    constructor(globalObject, args, privateData) {

        const {
            computed = false,
            declarations = [],
            ownerNode = null,
            parentRule = null,
        } = privateData

        this._ownerNode = ownerNode
        this._computed = computed
        this._declarations = declarations
        this.parentRule = parentRule

        // "When a CSS declaration block object is created, then [...]"
        if (ownerNode && !computed) {
            const value = ownerNode.getAttribute('style')
            if (value) {
                parseCSSDeclarationBlock(value).forEach(declaration =>
                    setCSSDeclaration(declaration, this._declarations))
            }
        }
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-cssfloat}
     */
    get cssFloat() {
        return this.getPropertyValue('float')
    }

    /**
     * @param {string} value
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-cssfloat}
     */
    set cssFloat(value) {
        this.setProperty('float', value)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-csstext}
     */
    get cssText() {
        if (this._computed) {
            return ''
        }
        return serializeCSSDeclarationBlock(this._declarations)
    }

    /**
     * @param {string} value
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-csstext}
     */
    set cssText(value) {
        if (this._computed) {
            throw createError(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        this._declarations.splice(0)
        getDeclarationsInSpecifiedOrder(parseCSSDeclarationBlock(value, createParser(this.parentRule)))
            .forEach(declaration => setCSSDeclaration(declaration, this._declarations))
        this._updateStyle()
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-length}
     */
    get length() {
        return this._declarations.length
    }

    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this._declarations.length
    }

    [idlUtils.supportedPropertyIndices]() {
        return this._declarations.map(({ name }) => name)
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-getpropertyvalue}
     *
     * It slightly deviates from the specification for shorthands: instead of
     * running `serializeCSSValue()` with a list of its longhand declarations,
     * it runs it with an hypothetical declaration assigned this list as value.
     */
    getPropertyValue(name) {
        if (aliases.has(name)) {
            name = aliases.get(name)
        }
        if (!name.startsWith('--')) {
            name = name.toLowerCase()
            if (shorthands.has(name)) {
                const value = []
                let important = null
                for (const longhand of shorthands.get(name)) {
                    const declaration = this._declarations.find(declaration => declaration.name === longhand)
                    if (declaration && (declaration.important === important || important === null)) {
                        ({ important } = declaration)
                        value.push(declaration)
                        continue
                    }
                    return ''
                }
                return serializeCSSValue({ important, name, value })
            }
        }
        const declaration = this._declarations.find(declaration => declaration.name === name)
        if (declaration) {
            return serializeCSSValue(declaration)
        }
        return ''
    }

    /**
     * @param {string} name
     * @param {string} value
     * @param {string} [priority=""] "important" or ""
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-setproperty}
     * @see {@link https://github.com/w3c/csswg-drafts/issues/5649}
     *
     * It slightly deviates from the specification to validate the property (or
     * descriptor) declaration against the current context, until new child
     * interfaces are defined to apply this validation, which is delegated to
     * `parseCSSDeclaration()` for now.
     */
    setProperty(name, value, priority = '') {
        if (this._computed) {
            throw createError(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        if (!name.startsWith('--')) {
            name = name.toLowerCase()
        }
        if (value === '') {
            this.removeProperty(name)
            return
        }
        if (priority !== '' && priority.toLowerCase() !== 'important') {
            return
        }
        const parser = createParser(this.parentRule)
        const declaration = parseCSSDeclaration(
            {
                important: !!priority,
                name,
                type: new Set(['declaration']),
                value,
            },
            parser)
        if (declaration === null) {
            return
        }
        let updated = true
        if (shorthands.has(name)) {
            const { important, name, value } = declaration
            const declarations = parseShorthand(value, name)
            declarations.forEach((value, name) =>
                updated = value === ''
                    ? this.removeProperty(name) && updated
                    : setCSSDeclaration({ important, name, value }, this._declarations) && updated)
        } else {
            updated = setCSSDeclaration(declaration, this._declarations)
        }
        if (updated) {
            this._updateStyle()
        }
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-removeproperty}
     */
    removeProperty(name) {
        if (this._computed) {
            throw createError(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        if (!name.startsWith('--')) {
            name = name.toLowerCase()
        }
        const prevValue = this.getPropertyValue(name)
        let removed = false
        if (shorthands.has(name)) {
            shorthands.get(name).forEach(longhand => {
                const index = this._declarations.findIndex(declaration => declaration.name === longhand)
                if (-1 < index) {
                    this._declarations.splice(index, 1)
                    removed = true
                }
            })
        } else {
            const index = this._declarations.findIndex(declaration => declaration.name === name)
            if (-1 < index) {
                this._declarations.splice(index, 1)
                removed = true
            }
        }
        if (removed) {
            this._updateStyle()
        }
        return prevValue
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-getpropertypriority}
     */
    getPropertyPriority(name) {
        if (!name.startsWith('--')) {
            name = name.toLowerCase()
            if (shorthands.has(name)) {
                if (shorthands.get(name).every(longhand => this.getPropertyPriority(longhand) === 'important')) {
                    return 'important'
                }
            }
        }
        if (this._declarations.find(declaration => declaration.name === name)?.important) {
            return 'important'
        }
        return ''
    }

    /**
     * @param {number|string} index
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-item}
     */
    item(index) {
        return this._declarations[index]?.name ?? ''
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#update-style-attribute-for}
     */
    _updateStyle() {
        if (this._ownerNode) {
            this._updating = true
            this._ownerNode.setAttribute('style', serializeCSSDeclarationBlock(this._declarations))
            this._updating = false
        }
    }
}

module.exports = {
    UPDATE_COMPUTED_STYLE_DECLARATION_ERROR,
    implementation: CSSStyleDeclarationImpl,
}
