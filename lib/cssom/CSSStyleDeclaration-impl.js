
const { getDeclarationsInSpecifiedOrder, parseCSSDeclarationBlock, parseCSSPropertyValue, setCSSDeclaration } = require('../parse/syntax.js')
const { serializeCSSDeclarationBlock, serializeCSSValue } = require('../serialize.js')
const { aliases } = require('../properties/compatibility.js')
const createError = require('../error.js')
const idlUtils = require('./utils.js')
const parseLonghands = require('../parse/longhands.js')
const properties = require('../properties/definitions.js')
const shorthands = require('../properties/shorthands.js')

const UPDATE_COMPUTED_STYLE_DECLARATION_ERROR = {
    message: 'Can not change a read-only computed style declaration"',
    name: 'NoModificationAllowedError',
    type: 'DOMException',
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration}
 */
class CSSStyleDeclarationImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration-updating-flag}
     */
    _updating = false

    /**
     * @param {object} globalObject
     * @param {*[]} args
     * @param {object} privateData
     * @see {@link https://drafts.csswg.org/cssom/#ref-for-css-declaration-block⑥}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-style}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-style} (typo in URL)
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssmarginrule-style}
     * @see {@link https://drafts.csswg.org/cssom/#dom-elementcssinlinestyle-style}
     * @see {@link https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle}
     *
     * `privateData.declarations` (CSS declarations) is only specified as a list
     * in the procedure for `Window.getComputedStyle()`, but a `Map` makes the
     * code more readable, is probably more performant and more appropriate to
     * represent a list of declarations that must not include more than one
     * declaration with the same property.
     */
    constructor(globalObject, args, privateData) {

        const {
            computed = false,
            declarations = new Map(),
            ownerNode = null,
            parentRule = null,
        } = privateData

        this._ownerNode = ownerNode
        this._computed = computed
        this._declarations = declarations
        this._declared = [...this._declarations.keys()]
        this.parentRule = parentRule

        // "When a CSS declaration block object is created, then [...]"
        if (ownerNode && !computed) {
            const value = ownerNode.getAttribute('style')
            if (value) {
                parseCSSDeclarationBlock(value).forEach(declaration =>
                    setCSSDeclaration(declaration, this._declarations, this._declared))
            }
        }
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-cssfloat}
     */
    get cssFloat() {
        return this.getPropertyValue('float')
    }

    /**
     * @param {string} value
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-cssfloat}
     */
    set cssFloat(value) {
        this.setProperty('float', value)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-csstext}
     */
    get cssText() {
        if (this._computed) {
            return ''
        }
        return serializeCSSDeclarationBlock(this._declarations)
    }

    /**
     * @param {string} value
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-csstext}
     */
    set cssText(value) {
        if (this._computed) {
            throw createError(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        this._declarations.clear()
        this._declared = []
        const declarations = getDeclarationsInSpecifiedOrder(parseCSSDeclarationBlock(value))
        declarations.forEach(declaration => setCSSDeclaration(declaration, this._declarations, this._declared))
        this._updateStyle()
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-length}
     */
    get length() {
        return this._declared.length
    }

    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this._declared.length
    }

    [idlUtils.supportedPropertyIndices]() {
        return this._declared.keys()
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-getpropertyvalue}
     */
    getPropertyValue(name) {
        if (aliases.has(name)) {
            name = aliases.get(name)
        }
        if (!name.startsWith('--')) {
            name = name.toLowerCase()
            if (shorthands.has(name)) {
                const list = []
                let prevImportant = null
                for (const longhand of shorthands.get(name)) {
                    const declaration = this._declarations.get(longhand)
                    if (declaration) {
                        const { important } = declaration
                        if (important === prevImportant || prevImportant === null) {
                            prevImportant = important
                            list.push(declaration)
                            continue
                        }
                    }
                    return ''
                }
                return serializeCSSValue(list)
            }
        }
        if (this._declarations.has(name)) {
            return serializeCSSValue(this._declarations.get(name))
        }
        return ''
    }

    /**
     * @param {string} name
     * @param {string} value
     * @param {string} [priority=""] "important" or ""
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-setproperty}
     */
    setProperty(name, value, priority = '') {
        if (this._computed) {
            throw createError(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        if (aliases.has(name)) {
            name = aliases.get(name)
        }
        if (!name.startsWith('--')) {
            name = name.toLowerCase()
            if (!properties[name]) {
                return
            }
        }
        if (value === '') {
            this.removeProperty(name)
            return
        }
        if (priority !== '' && priority.toLowerCase() !== 'important') {
            return
        }
        const componentValueList = parseCSSPropertyValue(value, name)
        if (componentValueList === null) {
            return
        }
        const important = !!priority
        let updated = false
        if (shorthands.has(name)) {
            const values = parseLonghands(componentValueList, name)
            updated = Object.entries(values).reduce(
                (updated, [name, list]) => {
                    if (list === '') {
                        return this.removeProperty(name) && updated
                    }
                    const declaration = { important, name, value: list }
                    return setCSSDeclaration(declaration, this._declarations, this._declared) && updated
                },
                true)
        } else {
            const declaration = { important, name, value: componentValueList }
            updated = setCSSDeclaration(declaration, this._declarations, this._declared)
        }
        if (updated) {
            this._updateStyle()
        }
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-removeproperty}
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
                if (this._declarations.get(longhand)) {
                    this.removeProperty(longhand)
                    removed = true
                }
            })
        } else if (this._declarations.get(name)) {
            this._declarations.delete(name)
            const index = this._declared.indexOf(name)
            this._declared.splice(index, 1)
            removed = true
        }
        if (removed) {
            this._updateStyle()
        }
        return prevValue
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-getpropertypriority}
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
        if (this._declarations.has(name) && this._declarations.get(name).important) {
            return 'important'
        }
        return ''
    }

    /**
     * @param {number|string} index
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-item}
     */
    item(index) {
        return this._declared[index] ?? ''
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom/#update-style-attribute-for}
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
