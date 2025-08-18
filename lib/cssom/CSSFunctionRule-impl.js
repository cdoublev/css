
import { serializeComponentValue, serializeIdentifier } from '../serialize.js'
import CSSFunctionDeclarations from './CSSFunctionDeclarations.js'
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSRuleList from './CSSRuleList.js'
import { isOmitted } from '../utils/value.js'
import { parseGrammar } from '../parse/parser.js'

/**
 * @see {@link https://drafts.csswg.org/css-mixins-1/#cssfunctionrule}
 */
export default class CSSFunctionRuleImpl extends CSSGroupingRuleImpl {

    /**
     * @param {DocumentOrShadowRoot} globalObject
     * @param {*[]} args
     * @param {object} privateData
     */
    constructor(globalObject, args, privateData) {
        super(globalObject, args, privateData)
        const { parentStyleSheet } = this
        const { node, prelude: [{ name, value: parameters }, returnType] } = privateData
        const { definition, input } = node
        const block = parseGrammar(input, { associatedToken: '{', type: 'block', value: definition.value }, { ...node, value: this }, 'lazy')
        const rules = block.value.map(rule => {
            if (Array.isArray(rule)) {
                return CSSFunctionDeclarations.createImpl(globalObject, undefined, {
                    declarations: rule,
                    parentRule: this,
                    parentStyleSheet,
                })
            }
            return rule
        })
        this._parameters = parameters
        this._returnType = returnType
        this.name = serializeIdentifier({ value: name })
        this.cssRules = CSSRuleList.createImpl(globalObject, undefined, { rules })
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/cssom-1/#dom-cssrule-csstext}
     */
    get cssText() {
        const { _parameters, _returnType, cssRules, returnType, name } = this
        const rules = cssRules._rules.map(rule => rule.cssText).join(' ')
        let string = `@function ${name}(${serializeComponentValue(_parameters)}) `
        if (returnType !== '*') {
            string += `returns ${serializeComponentValue(_returnType[1])} `
        }
        string += rules ? `{ ${rules} }` : '{}'
        return string
    }

    /**
     * @returns {string}
     * @see {@link https://drafts.csswg.org/css-mixins-1/#dom-cssfunctionrule-returntype}
     */
    get returnType() {
        const { _returnType } = this
        if (isOmitted(_returnType)) {
            return '*'
        }
        const type = _returnType[1]
        if (type.types[0] === '<function>') {
            return serializeComponentValue(type.value)
        }
        return serializeComponentValue(type)
    }

    /**
     * @returns {FunctionParameter[]}
     * @see {@link https://drafts.csswg.org/css-mixins-1/#dom-cssfunctionrule-getparameters}
     */
    getParameters() {
        const parameters = []
        this._parameters.forEach(([name, type, defaultValue]) => {
            name = serializeIdentifier(name)
            if (isOmitted(type)) {
                type = '*'
            } else if (type.types[0] === '<function>') {
                type = serializeComponentValue(type.value)
            } else {
                type = serializeComponentValue(type)
            }
            defaultValue = isOmitted(defaultValue) ? null : serializeComponentValue(defaultValue[1])
            parameters.push({ defaultValue, name, type })
        })
        return parameters
    }
}
