
const { getDeclarationName, parseCSSDeclaration, parseDeclarationBlock } = require('../parse/parser.js')
const { isOmitted, isFailure } = require('../utils/value.js')
const { serializeCSSDeclarationBlock, serializeCSSValue } = require('../serialize.js')
const error = require('../error.js')
const expandShorthandDeclaration = require('../parse/shorthand.js')
const idlUtils = require('./utils.js')
const logical = require('../properties/logical.js')
const properties = require('../properties/definitions.js')
const shorthands = require('../properties/shorthands.js')

const UPDATE_COMPUTED_STYLE_DECLARATION_ERROR = {
    message: 'Cannot change a read-only computed style declaration',
    name: 'NoModificationAllowedError',
}

/**
 * @param {object} declaration
 * @param {object[]} declarations
 * @returns {boolean}
 * @see {@link https://drafts.csswg.org/cssom-1/#set-a-css-declaration}
 */
function setCSSDeclaration(declaration, declarations) {
    const { important, name, pending } = declaration
    const index = declarations.findIndex(declaration => declaration.name === name)
    if (-1 < index) {
        const { [name]: { group } = {} } = properties
        let needsAppend = false
        if (group) {
            const mapping = logical[group].find(mapping => !mapping.includes(name))
            needsAppend = declarations
                .slice(index + 1)
                .some(({ name }) => mapping.includes(name))
        }
        if (!needsAppend) {
            const prevDeclaration = declarations[index]
            if (
                !pending
                && important === prevDeclaration.important
                && serializeCSSValue(declaration) === serializeCSSValue(prevDeclaration)
            ) {
                return false
            }
            declarations.splice(index, 1, declaration)
            return true
        }
        declarations.splice(index, 1)
    }
    declarations.push(declaration)
    return true
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
     * @see {@link https://drafts.csswg.org/cssom-1/#css-declaration-block}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssmarginrule-style}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-csspagerule-style}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstylerule-style}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-elementcssinlinestyle-style}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-window-getcomputedstyle}
     */
    constructor(globalObject, args, privateData) {

        const {
            computed = false,
            declarations = [],
            ownerNode = null,
            parentRule = null,
            readOnly = false,
        } = privateData

        this._ownerNode = ownerNode
        this._computed = computed
        this._declarations = declarations
        this._readOnly = readOnly
        this.parentRule = parentRule

        // "When a CSS declaration block object is created, then [...]"
        if (ownerNode && !computed) {
            const value = ownerNode.getAttribute('style')
            if (value) {
                this._declarations = parseDeclarationBlock(value, ownerNode)
            }
        }
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
        if (this._readOnly) {
            throw error(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        this._declarations = parseDeclarationBlock(value, this.parentRule ?? this._ownerNode)
        this._update()
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-length}
     */
    get length() {
        return this._declarations.length
    }

    /**
     * @param {number} index
     * @returns {boolean}
     */
    [idlUtils.supportsPropertyIndex](index) {
        return 0 <= index && index < this._declarations.length
    }

    /**
     * @returns {object}
     */
    [idlUtils.supportedPropertyIndices]() {
        return this._declarations.map(({ name }) => name)
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-getpropertyvalue}
     *
     * It deviates from the specification by resolving a legacy name alias and
     * escaping a custom property name (browser conformance).
     *
     * It deviates from the specification by serializing a shorthand declaration
     * with the list of longhand declarations as its value, to avoid resolving
     * its name again in `serializeCSSValue()`.
     *
     * It deviates from the specification by serializing an omitted declaration
     * value as a whitespace.
     */
    getPropertyValue(name) {
        name = getDeclarationName(this.parentRule ?? this._ownerNode, name)
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
        const declaration = this._declarations.find(declaration => declaration.name === name)
        if (declaration) {
            if (isOmitted(declaration.value)) {
                return ' '
            }
            return serializeCSSValue(declaration)
        }
        return ''
    }

    /**
     * @param {string} name
     * @param {string} value
     * @param {string} [priority=""] "important" or ""
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-setproperty}
     *
     * It deviates from the specification by resolving a legacy name alias and
     * escaping a custom property name (browser conformance).
     *
     * It deviates from the specification to avoid validating declarations in
     * multiple places.
     *
     * It deviates from the specification by validating the priority.
     */
    setProperty(name, value, priority = '') {
        if (this._readOnly) {
            throw error(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        if (value === '') {
            this.removeProperty(name)
            return
        }
        if (priority !== '' && priority.toLowerCase() !== 'important') {
            return
        }
        const context = this.parentRule ?? this._ownerNode
        const declaration = parseCSSDeclaration(name, value, !!priority, context)
        if (isFailure(declaration)) {
            return
        }
        let updated = true
        if (shorthands.has(declaration.name)) {
            expandShorthandDeclaration(declaration).forEach(declaration =>
                updated = setCSSDeclaration(declaration, this._declarations) && updated)
        } else {
            updated = setCSSDeclaration(declaration, this._declarations)
        }
        if (updated) {
            this._update()
        }
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-removeproperty}
     */
    removeProperty(name) {
        if (this._readOnly) {
            throw error(UPDATE_COMPUTED_STYLE_DECLARATION_ERROR)
        }
        name = getDeclarationName(this.parentRule ?? this._ownerNode, name)
        if (!name) {
            return ''
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
            this._update()
        }
        return prevValue
    }

    /**
     * @param {string} name
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssstyledeclaration-getpropertypriority}
     */
    getPropertyPriority(name) {
        if (this._computed) {
            return ''
        }
        name = getDeclarationName(this.parentRule ?? this._ownerNode, name)
        if (shorthands.has(name)) {
            if (shorthands.get(name).every(longhand => this.getPropertyPriority(longhand) === 'important')) {
                return 'important'
            }
            return ''
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
     * @param {string} name
     * @param {string|null} value
     * @param {string|null} namespace
     *
     * Attribute change steps.
     */
    _change(name, value, namespace) {
        if (this._computed || this._updating || name !== 'style' || namespace !== null) {
            return
        }
        this._declarations = value ? parseDeclarationBlock(value, this.parentRule ?? this._ownerNode) : []
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom-1/#update-style-attribute-for}
     */
    _update() {
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
