
const { isFailure, isList } = require('../utils/value.js')
const { parseBlockContents, parseCSSDeclaration, parseCSSGrammar } = require('../parse/parser.js')
const { serializeCSSComponentValue, serializeCSSValue } = require('../serialize.js')
const { implementation: CSSRuleImpl } = require('./CSSRule-impl.js')
const counterStyles = require('../values/counter-styles.js')
const { cssPropertyToIDLAttribute } = require('../utils/string.js')
const { '@counter-style': descriptors } = require('../descriptors/definitions.js')
const { keyword } = require('../values/value.js')

const descriptorNames = Object.keys(descriptors)

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
        const { prelude, value } = privateData
        const declarations = parseBlockContents(value, this)[0] ?? []
        this._name = serializeCSSComponentValue(prelude)
        declarations.forEach(({ name, value }) => this[`_${cssPropertyToIDLAttribute(name)}`] = value)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const declarations = []
        descriptorNames.forEach(name => {
            const value = this[cssPropertyToIDLAttribute(name)]
            if (value) {
                declarations.push(`${name}: ${value}`)
            }
        })
        return 0 < declarations.length
            ? `@counter-style ${this.name} { ${declarations.join('; ')}; }`
            : `@counter-style ${this.name} {}`
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-additivesymbols}
     */
    get additiveSymbols() {
        const { _additiveSymbols } = this
        return _additiveSymbols ? serializeCSSValue({ name: 'additive-symbols', value: _additiveSymbols }) : ''
    }
    set additiveSymbols(value) {
        if (this.system !== 'additive') {
            return
        }
        value = parseCSSDeclaration('additive-symbols', value, false, this)
        if (!isFailure(value)) {
            this._additiveSymbols = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-fallback}
     */
    get fallback() {
        const { _fallback } = this
        return _fallback ? serializeCSSValue({ name: 'fallback', value: _fallback }) : ''
    }
    set fallback(value) {
        value = parseCSSDeclaration('fallback', value, false, this)
        if (!isFailure(value)) {
            this._fallback = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-name}
     */
    get name() {
        return serializeCSSComponentValue(this._name).trim()
    }
    set name(name) {
        name = parseCSSGrammar(CSS.escape(name), '<counter-style-name>', this)
        if (!isFailure(name)) {
            const lowercase = name.value.toLowerCase()
            if (counterStyles.predefined.includes(lowercase)) {
                name = keyword(lowercase, ['counter-style-name'])
            }
            this._name = serializeCSSComponentValue(name).trim()
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-negative}
     */
    get negative() {
        const { _negative } = this
        return _negative ? serializeCSSValue({ name: 'negative', value: _negative }) : ''
    }
    set negative(value) {
        value = parseCSSDeclaration('negative', value, false, this)
        if (!isFailure(value)) {
            this._negative = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-pad}
     */
    get pad() {
        const { _pad } = this
        return _pad ? serializeCSSValue({ name: 'pad', value: _pad }) : ''
    }
    set pad(value) {
        value = parseCSSDeclaration('pad', value, false, this)
        if (!isFailure(value)) {
            this._pad = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-prefix}
     */
    get prefix() {
        const { _prefix } = this
        return _prefix ? serializeCSSValue({ name: 'prefix', value: _prefix }) : ''
    }
    set prefix(value) {
        value = parseCSSDeclaration('prefix', value, false, this)
        if (!isFailure(value)) {
            this._prefix = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-range}
     */
    get range() {
        const { _range } = this
        return _range ? serializeCSSValue({ name: 'range', value: _range }) : ''
    }
    set range(value) {
        value = parseCSSDeclaration('range', value, false, this)
        if (!isFailure(value)) {
            this._range = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-speakas}
     */
    get speakAs() {
        const { _speakAs } = this
        return _speakAs ? serializeCSSValue({ name: 'speak-as', value: _speakAs }) : ''
    }
    set speakAs(value) {
        value = parseCSSDeclaration('speak-as', value, false, this)
        if (!isFailure(value)) {
            this._speakAs = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-suffix}
     */
    get suffix() {
        const { _suffix } = this
        return _suffix ? serializeCSSValue({ name: 'suffix', value: _suffix }) : ''
    }
    set suffix(value) {
        value = parseCSSDeclaration('suffix', value, false, this)
        if (!isFailure(value)) {
            this._suffix = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-symbols}
     */
    get symbols() {
        const { _symbols } = this
        return _symbols ? serializeCSSValue({ name: 'symbols', value: _symbols }) : ''
    }
    set symbols(value) {
        const { system } = this
        if (system === 'additive' || system.startsWith('extends')) {
            return
        }
        value = parseCSSDeclaration('symbols', value, false, this)
        if (!isFailure(value) && (1 < value.value.length || (system !== 'alphabetic' && system !== 'numeric'))) {
            this._symbols = value.value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-system}
     */
    get system() {
        const { _system } = this
        return _system ? serializeCSSValue({ name: 'system', value: _system }) : ''
    }
    set system(value) {
        const { _system } = this
        if (!_system) {
            // Explicit defaut system
            value = parseCSSDeclaration('system', value, false, this)
            if (!isFailure(value) && value.value.value === 'symbolic') {
                this._system = value.value
            }
        } else if (isList(_system)) {
            // Fixed <integer>? or extends <counter-style-name>
            value = parseCSSDeclaration('system', value, false, this)
            if (!isFailure(value) && value.value[0]?.value === _system[0]?.value) {
                this._system = value.value
            }
        }
    }
}

module.exports = {
    implementation: CSSCounterStyleRuleImpl,
}
