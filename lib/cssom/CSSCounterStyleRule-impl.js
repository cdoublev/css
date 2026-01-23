
import * as counterStyles from '../values/counter-styles.js'
import { isFailure, isList } from '../utils/value.js'
import { parseDeclarationValue, parseGrammar } from '../parse/parser.js'
import { serializeComponentValue, serializeValue } from '../serialize.js'
import { toIDLAttribute, toLowerCase } from '../utils/string.js'
import CSSRuleImpl from './CSSRule-impl.js'
import descriptors from '../descriptors/definitions.js'
import { keyword } from '../values/value.js'

const descriptorNames = Object.keys(descriptors['@counter-style'])

/**
 * @see {@link https://drafts.csswg.org/css-counter-styles-3/#csscounterstylerule}
 */
export default class CSSCounterStyleRuleImpl extends CSSRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { node, prelude } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const declarations = block.value[0] ?? [] ?? []
        this._name = serializeComponentValue(prelude)
        declarations.forEach(({ name, value }) => this[`_${toIDLAttribute(name)}`] = value)
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const declarations = []
        descriptorNames.forEach(name => {
            const value = this[toIDLAttribute(name)]
            if (value) {
                declarations.push(`${name}: ${value}`)
            }
        })
        return 0 < declarations.length
            ? `@counter-style ${this.name} { ${declarations.join('; ')}; }`
            : `@counter-style ${this.name} { }`
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-additivesymbols}
     */
    get additiveSymbols() {
        const { _additiveSymbols } = this
        return _additiveSymbols ? serializeValue({ name: 'additive-symbols', value: _additiveSymbols }) : ''
    }
    set additiveSymbols(value) {
        if (this.system !== 'additive') {
            return
        }
        value = parseDeclarationValue(value, 'additive-symbols', this)
        if (!isFailure(value)) {
            this._additiveSymbols = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-fallback}
     */
    get fallback() {
        const { _fallback } = this
        return _fallback ? serializeValue({ name: 'fallback', value: _fallback }) : ''
    }
    set fallback(value) {
        value = parseDeclarationValue(value, 'fallback', this)
        if (!isFailure(value)) {
            this._fallback = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-name}
     */
    get name() {
        return serializeComponentValue(this._name).trim()
    }
    set name(name) {
        name = parseGrammar(this._globalObject.CSS.escape(name), '<counter-style-name>', this)
        if (!isFailure(name)) {
            const lowercase = toLowerCase(name.value)
            if (counterStyles.predefined.includes(lowercase)) {
                name = keyword(lowercase, ['counter-style-name'])
            }
            this._name = serializeComponentValue(name).trim()
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-negative}
     */
    get negative() {
        const { _negative } = this
        return _negative ? serializeValue({ name: 'negative', value: _negative }) : ''
    }
    set negative(value) {
        value = parseDeclarationValue(value, 'negative', this)
        if (!isFailure(value)) {
            this._negative = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-pad}
     */
    get pad() {
        const { _pad } = this
        return _pad ? serializeValue({ name: 'pad', value: _pad }) : ''
    }
    set pad(value) {
        value = parseDeclarationValue(value, 'pad', this)
        if (!isFailure(value)) {
            this._pad = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-prefix}
     */
    get prefix() {
        const { _prefix } = this
        return _prefix ? serializeValue({ name: 'prefix', value: _prefix }) : ''
    }
    set prefix(value) {
        value = parseDeclarationValue(value, 'prefix', this)
        if (!isFailure(value)) {
            this._prefix = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-range}
     */
    get range() {
        const { _range } = this
        return _range ? serializeValue({ name: 'range', value: _range }) : ''
    }
    set range(value) {
        value = parseDeclarationValue(value, 'range', this)
        if (!isFailure(value)) {
            this._range = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-speakas}
     */
    get speakAs() {
        const { _speakAs } = this
        return _speakAs ? serializeValue({ name: 'speak-as', value: _speakAs }) : ''
    }
    set speakAs(value) {
        value = parseDeclarationValue(value, 'speak-as', this)
        if (!isFailure(value)) {
            this._speakAs = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-suffix}
     */
    get suffix() {
        const { _suffix } = this
        return _suffix ? serializeValue({ name: 'suffix', value: _suffix }) : ''
    }
    set suffix(value) {
        value = parseDeclarationValue(value, 'suffix', this)
        if (!isFailure(value)) {
            this._suffix = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-symbols}
     */
    get symbols() {
        const { _symbols } = this
        return _symbols ? serializeValue({ name: 'symbols', value: _symbols }) : ''
    }
    set symbols(value) {
        const { system } = this
        if (system === 'additive' || system.startsWith('extends')) {
            return
        }
        value = parseDeclarationValue(value, 'symbols', this)
        if (!isFailure(value) && (1 < value.length || (system !== 'alphabetic' && system !== 'numeric'))) {
            this._symbols = value
        }
    }

    /**
     * @see {@link https://drafts.csswg.org/css-counter-styles-3/#dom-csscounterstylerule-system}
     */
    get system() {
        const { _system } = this
        return _system ? serializeValue({ name: 'system', value: _system }) : ''
    }
    set system(value) {
        const { _system } = this
        if (!_system) {
            // Explicit defaut system
            value = parseDeclarationValue(value, 'system', this)
            if (!isFailure(value) && value.value === 'symbolic') {
                this._system = value
            }
        } else if (isList(_system)) {
            // Fixed <integer>? or extends <counter-style-name>
            value = parseDeclarationValue(value, 'system', this)
            if (!isFailure(value) && value[0]?.value === _system[0]?.value) {
                this._system = value
            }
        }
    }
}
