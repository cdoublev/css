
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const { Parser } = require('../parse/syntax.js')
const { cssPropertyToIDLAttribute } = require('../utils/script.js')
const predefinedCounterStyles = require('../values/counter-styles.js')
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#csscounterstylerule}
 */
class CSSCounterStyleRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { prelude, value: { declarations } } = privateData
        this._declarations = declarations
        declarations.forEach(({ name, value }) =>
            this[`_${cssPropertyToIDLAttribute(name)}`] = serializeCSSValue({ name, value }))
        this.name = serializeCSSComponentValue(prelude)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-additivesymbols}
     */
    get additiveSymbols() {
        return this._additiveSymbols
    }
    set additiveSymbols(value) {
        this._setDescriptor('additive-symbols', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-fallback}
     */
    get fallback() {
        return this._fallback
    }
    set fallback(value) {
        this._setDescriptor('fallback', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-name}
     */
    get name() {
        return this._name
    }
    set name(value) {
        const lowercase = value.toLowerCase()
        if (predefinedCounterStyles.includes(lowercase)) {
            value = lowercase
        }
        if (value !== 'decimal' && value !== 'disc' && value !== 'none') {
            this._name = { type: new Set(['ident']), value }
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-negative}
     */
    get negative() {
        return this._negative
    }
    set negative(value) {
        this._setDescriptor('negative', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-pad}
     */
    get pad() {
        return this._pad
    }
    set pad(value) {
        this._setDescriptor('pad', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-prefix}
     */
    get prefix() {
        return this._prefix
    }
    set prefix(value) {
        this._setDescriptor('prefix', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-range}
     */
    get range() {
        return this._range
    }
    set range(value) {
        this._setDescriptor('range', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-speakas}
     */
    get speakAs() {
        return this._speakAs
    }
    set speakAs(value) {
        this._setDescriptor('speakAs', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-suffix}
     */
    get suffix() {
        return this._suffix
    }
    set suffix(value) {
        this._setDescriptor('suffix', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-system}
     */
    get system() {
        return this._system
    }
    set system(value) {
        this._setDescriptor('system', value)
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-symbols}
     */
    get symbols() {
        return this._symbols
    }
    set symbols(value) {
        this._setDescriptor('symbols', value)
    }

    /**
     * @param {string} name
     * @param {string} value
     */
    _setDescriptor(name, value) {
        const parser = new Parser(this)
        const parsed = parser.parseDeclaration({ name, value })
        if (parsed === null) {
            return
        }
        // TODO: do nothing only if "the new value would change the algorithm used"
        if (name === 'system') {
            return
        }
        this[`_${cssPropertyToIDLAttribute(name)}`] = serializeCSSValue(parsed)
    }
}

module.exports = {
    implementation: CSSCounterStyleRuleImpl,
}
