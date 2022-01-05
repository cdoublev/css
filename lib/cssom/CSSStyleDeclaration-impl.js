
const { parseComponentValuesList, parseDeclarationList } = require('../parse/syntax.js')
const { serializeDeclarationBlock, serializeValue } = require('../serialize.js')
const DOMException = require('domexception')
const { aliases } = require('../properties/compatibility.js')
const createList = require('../values/value.js')
const createStream = require('../parse/stream.js')
const idlUtils = require('./utils.js')
const parseDefinition = require('../parse/definition.js')
const parseLonghands = require('../parse/longhands.js')
const parseRootNode = require('../parse/engine.js')
const properties = require('../properties/definitions.js')
const shorthands = require('../properties/shorthands.js')

const cssWideKeywords = parseDefinition('<css-wide-keyword>')
const customVariable = parseDefinition('<var()>')

/**
 * @param {object} list
 * @returns {object[]|void|null}
 */
function parseCustomVariables(list) {
    let hasCustomVariables = false
    const match = createList()
    for (const component of list) {
        if (component.type?.has('function')) {
            if (component.name === 'var') {
                hasCustomVariables = true
                const variable = parseRootNode(createStream([component]), customVariable)
                if (variable) {
                    match.push(variable)
                    continue
                }
                return
            }
            const withCustomVariables = parseCustomVariables(createStream(component.value))
            if (withCustomVariables === undefined) {
                return
            }
            if (withCustomVariables) {
                hasCustomVariables = true
                component.value = withCustomVariables
            }
        }
        if (component !== ' ') {
            match.push(component)
        }
    }
    if (hasCustomVariables) {
        if (match.length === 1) {
            return match[0]
        }
        return match
    }
    list.reset()
    return null
}

/**
 * @param {string} value
 * @param {string} property
 * @param {string} [testDefinition]
 * @param {boolean} [parseGlobals]
 * @returns {object|object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-value}
 *
 * The optional arguments only exist for testing purposes.
 */
function parseValue(value, property, testDefinition, parseGlobals = true) {
    const list = parseComponentValuesList(value)
    if (parseGlobals) {
        const cssWideKeyword = parseRootNode(list, cssWideKeywords)
        if (cssWideKeyword) {
            return cssWideKeyword
        }
        const withCustomVariables = parseCustomVariables(list, customVariable)
        // Invalid `var()`
        if (withCustomVariables === undefined) {
            return null
        }
        if (withCustomVariables) {
            return withCustomVariables
        }
    }
    if (property.startsWith('--')) {
        return createList(list.source)
    }
    const { value: definition = testDefinition } = properties[property] ?? {}
    const node = parseDefinition(definition)
    return parseRootNode(list, node)
}

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

/**
 * @param {string} string
 * @returns {object[]}
 * @see {@link https://drafts.csswg.org/cssom/#parse-a-css-declaration-block}
 */
function parseDeclarationBlock(string) {
    const declarations = parseDeclarationList(string)
    const parsedDeclarations = []
    for (const declaration of declarations) {
        const { important, value } = declaration
        let { name } = declaration
        if (aliases.has(name)) {
            name = aliases.get(name)
        }
        const parsedDeclaration = parseValue(value, name)
        if (parsedDeclaration) {
            parsedDeclarations.push({ important, name, value: parsedDeclaration })
        }
    }
    return parsedDeclarations
}

/**
 * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration}
 */
class CSSStyleDeclarationImpl {

    /**
     * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration-computed-flag}
     */
    #computed

    /**
     * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration-declarations}
     */
    #declarations
    #declared = []

    /**
     * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration-owner-node}
     */
    #ownerNode

    /**
     * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration-parent-css-rule}
     */
    #parentRule

    /**
     * @see {@link https://drafts.csswg.org/cssom/#cssstyledeclaration-updating-flag}
     */
    #updating = false

    /**
     * @constructor
     * @param {object} globalObject
     * @param {*[]} args
     * @param {object} associatedProperties
     * @see {@link https://drafts.csswg.org/cssom/#ref-for-css-declaration-block⑥}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstylerule-style}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssgroupingrule-style} (typo in URL)
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssmarginrule-style}
     * @see {@link https://drafts.csswg.org/cssom/#dom-elementcssinlinestyle-style}
     * @see {@link https://drafts.csswg.org/cssom/#dom-window-getcomputedstyle}
     */
    constructor(globalObject, args, associatedProperties) {

        const {
            computed = false,
            declarations = new Map(),
            ownerNode = null,
            parentRule = null,
        } = associatedProperties

        this.#parentRule = parentRule
        this.#ownerNode = ownerNode
        this.#computed = computed
        this.#declarations = declarations

        // "When a CSS declaration block object is created, then [...]"
        if (ownerNode && !computed) {
            const value = ownerNode.getAttribute('style')
            if (value) {
                parseDeclarationBlock(value).forEach(declaration =>
                    setDeclaration(declaration, declarations, this.#declared))
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
            throw new DOMException('Can not set "cssText" on read-only computed style declaration"', 'NoModificationAllowedError')
        }
        this.#declarations.clear()
        this.#declared = []
        const declarations = getDeclarationsInSpecifiedOrder(parseDeclarationBlock(value))
        declarations.forEach(declaration => setDeclaration(declaration, this.#declarations, this.#declared))
        this.#updateStyle()
    }

    /**
     * @returns {number}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-length}
     */
    get length() {
        return this.#declared.length
    }

    /**
     * @returns {CSSRule|null}
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
            throw new DOMException(`Can not set "${name}" on read-only computed style declaration"`, 'NoModificationAllowedError')
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
        if (updated) {
            this.#updateStyle()
        }
    }

    /**
     * @param {string} name
     * @return {string}
     * @see {@link https://drafts.csswg.org/cssom/#dom-cssstyledeclaration-removeproperty}
     */
    removeProperty(name) {
        if (this.#computed) {
            throw new DOMException(`Can not remove "${name}" on read-only computed style declaration"`, 'NoModificationAllowedError')
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
        if (removed) {
            this.#updateStyle()
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
        if (this.#declarations.has(name) && this.#declarations.get(name).important) {
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
        return this.#declared[index] ?? ''
    }

    [idlUtils.supportsPropertyIndex](index) {
        return index >= 0 && index < this.#declared.length
    }

    [idlUtils.supportedPropertyIndices]() {
        return this.#declared.keys()
    }

    /**
     * @see {@link https://drafts.csswg.org/cssom/#update-style-attribute-for}
     */
    #updateStyle() {
        if (this.#ownerNode) {
            this.#updating = true
            this.#ownerNode.setAttribute('style', serializeDeclarationBlock(this.#declarations))
            this.#updating = false
        }
    }
}

module.exports = {
    implementation: CSSStyleDeclarationImpl,
    parseValue,
}
