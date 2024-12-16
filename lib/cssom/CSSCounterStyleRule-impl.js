
const { parseCSSDeclaration, parseCSSGrammar } = require('../parse/parser.js')
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
        this._name = serializeCSSComponentValue(privateData.prelude)
        this._declarations.forEach(({ name, value }) => this[`_${cssPropertyToIDLAttribute(name)}`] = value)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const declarations = []
        descriptorNames.forEach(name => {
            const { [cssPropertyToIDLAttribute(name)]: value } = this
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
        const { system } = this
        if (system && system !== 'additive') {
            return
        }
        value = parseCSSDeclaration({ name: 'additive-symbols', value }, this)?.value
        if (value) {
            this._additiveSymbols = value
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
        value = parseCSSDeclaration({ name: 'fallback', value }, this)?.value
        if (value) {
            this._fallback = value
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
        if (name) {
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
        value = parseCSSDeclaration({ name: 'negative', value }, this)?.value
        if (value) {
            this._negative = value
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
        value = parseCSSDeclaration({ name: 'pad', value }, this)?.value
        if (value) {
            this._pad = value
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
        value = parseCSSDeclaration({ name: 'prefix', value }, this)?.value
        if (value) {
            this._prefix = value
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
        value = parseCSSDeclaration({ name: 'range', value }, this)?.value
        if (value) {
            this._range = value
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
        value = parseCSSDeclaration({ name: 'speak-as', value }, this)?.value
        if (value) {
            this._speakAs = value
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
        value = parseCSSDeclaration({ name: 'suffix', value }, this)?.value
        if (value) {
            this._suffix = value
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
        value = parseCSSDeclaration({ name: 'symbols', value }, this)?.value
        if (value && (1 < value.length || (system !== 'alphabetic' && system !== 'numeric'))) {
            this._symbols = value
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
        value = parseCSSDeclaration({ name: 'system', value }, this)?.value
        if (value) {
            const { _additiveSymbols, _symbols, system } = this
            if (system) {
                if (Array.isArray(value)) {
                    const head = value[0].value
                    if (
                        system.startsWith(head)
                        && (
                            (head === 'fixed' && _symbols)
                         || (head === 'extends' && !_symbols && !_additiveSymbols)
                        )
                    ) {
                        this._system = value
                    }
                }
                return
            }
            if (Array.isArray(value)) {
                const head = value[0].value
                if (_symbols) {
                    if (head === 'fixed') {
                        this._system = value
                    }
                } else if (head === 'extends' && !_additiveSymbols) {
                    this._system = value
                }
                return
            }
            switch (value.value) {
                case 'additive':
                    if (_additiveSymbols) {
                        this._system = value
                    }
                    return
                case 'alphabetic':
                case 'numeric':
                    if (_symbols && 1 < _symbols.length) {
                        this._system = value
                    }
                    return
                default: // 'cyclic | fixed | numeric'
                    if (_symbols) {
                        this._system = value
                    }
                    return
            }
        }
    }
}

module.exports = {
    implementation: CSSCounterStyleRuleImpl,
}
