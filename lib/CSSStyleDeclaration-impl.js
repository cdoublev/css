
const { parseDeclarationBlock, parseValue } = require('./parse/value.js')
const { serializeDeclarationBlock, serializeValue } = require('./serialize.js')
const { aliases } = require('./properties/compatibility.js')
const idlUtils = require('./utils.js')
const parseLonghands = require('./parse/longhands.js')
const properties = require('./properties/definitions.js')
const shorthands = require('./properties/shorthands.js')

/**
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function isEqual(a, b) {
    if (Array.isArray(a)) {
        return Array.isArray(b) && a.length === b.length && a.every((aa, index) => isEqual(aa, b[index]))
    }
    return a === b
}

/**
 * @param {object} declaration
 * @param {Map} declarations
 * @param {string[]} declared
 * @returns {void}
 * @see {@link https://drafts.csswg.org/cssom/#set-a-css-declaration}
 */
function setDeclaration(declaration, declarations, declared) {
    const { important, name, value } = declaration
    if (declarations.has(name)) {
        const { important: prevImportant, value: prevValue } = declarations.get(name)
        if (isEqual(value, prevValue) && prevImportant === important) {
            return false
        }
    } else {
        declared.push(name)
    }
    declarations.set(name, declaration)
    return true
}

/**
 * @param {object[]} declarations
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#concept-declarations-specified-order}
 */
function getDeclarationsInSpecifiedOrder(declarations) {
    return declarations
        .flatMap(declaration => {
            const { important, name, value } = declaration
            if (shorthands.has(name)) {
                const expanded = parseLonghands(value, name)
                return Object.entries(expanded).map(([name, list]) =>
                    ({ important, input: value, name, value: list }))
            }
            return declaration
        })
        .reduce((declarations, declaration) => {
            const { name } = declaration
            const occurrenceIndex = declarations.findIndex(declaration => declaration.name === name)
            if (-1 < occurrenceIndex) {
                declarations.splice(occurrenceIndex, 1)
            }
            declarations.push(declaration)
            return declarations
        }, [])
}

class NoModificationAllowedError extends Error {
    constructor(message) {
        super(`Uncaught DOMException: ${message}`)
        this.name = 'NoModificationAllowedError'
    }
}


/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration}
 */
class CSSStyleDeclarationImpl {

    #computed = false
    #declarations = new Map()
    #declared = []
    #ownerNode = null
    #parentRule = null
    #updating = false

    /**
     * @constructor
     * @param {object} globalObject
     * @param {*[]} args
     * @param {object} privateData
     * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration}
     * @see {@link https://drafts.csswg.org/cssom/#css-declaration-blocks}
     */
    constructor(globalObject, args, { parentRule = null, ownerNode = null, computed = false }) {
        this.#parentRule = parentRule
        this.#ownerNode = ownerNode
        this.#computed = computed
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
        if (this.#computed) {
            return ''
        }
        return serializeDeclarationBlock(this.#declarations)
    }

    /**
     * @param {string} value
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-csstext}
     */
    set cssText(value) {
        if (this.#computed) {
            throw new NoModificationAllowedError(`Can not set "cssText" on read-only computed style declaration"`)
        }
        this.#declarations.clear()
        this.#declared = []
        const declarations = getDeclarationsInSpecifiedOrder(parseDeclarationBlock(value))
        declarations.forEach(declaration => setDeclaration(declaration, this.#declarations, this.#declared))
        // TODO: update style attribute for the declaration block
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-length}
     */
    get length() {
        return this.#declared.length
    }

    /**
     * @returns {CSSStyleDeclaration|null}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-parentrule}
     */
    get parentRule() {
        return this.#parentRule
    }

    /**
     * @param {string} name
     * @return {string}
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
                    const declaration = this.#declarations.get(longhand)
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
                return serializeValue(list)
            }
        }
        if (this.#declarations.has(name)) {
            return serializeValue(this.#declarations.get(name))
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
        if (this.#computed) {
            throw new NoModificationAllowedError(`Can not set "${name}" on read-only computed style declaration"`)
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
        const componentValueList = parseValue(value, name)
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
                    const declaration = { important, input: value, name, value: list }
                    return setDeclaration(declaration, this.#declarations, this.#declared) && updated
                },
                true)
        } else {
            const declaration = { important, input: value, name, value: componentValueList }
            updated = setDeclaration(declaration, this.#declarations, this.#declared)
        }
        // TODO: update style attribute for the declaration block
    }

    /**
     * @param {string} name
     * @return {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-removeproperty}
     */
    removeProperty(name) {
        if (this.#computed) {
            throw new NoModificationAllowedError(`Can not remove "${name}" on read-only computed style declaration"`)
        }
        if (!name.startsWith('--')) {
            name = name.toLowerCase()
        }
        const prevValue = this.getPropertyValue(name)
        let removed = false
        if (shorthands.has(name)) {
            shorthands.get(name).forEach(longhand => {
                if (this.#declarations.get(longhand)) {
                    this.removeProperty(longhand)
                    removed = true
                }
            })
        } else if (this.#declarations.get(name)) {
            this.#declarations.delete(name)
            const index = this.#declared.indexOf(name)
            this.#declared.splice(index, 1)
            removed = true
        }
        // TODO: update style attribute for the declaration block
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
        if (this.#declarations.has(name)) {
            return this.#declarations.get(name).priority === 'important'
        }
        return ''
    }

    /**
     * @param {number|string} index
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-item}
     */
    item(index) {
        return this.#declared[index] ?? ''
    }

    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this.#declared.length
    }

    [idlUtils.supportedPropertyIndices]() {
        return this.#declared.keys()
    }
}

module.exports = {
    implementation: CSSStyleDeclarationImpl,
}
