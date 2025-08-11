
import { serializeCSSComponentValue, serializeIdentifier } from '../serialize.js'
import CSSFunctionDeclarations from './CSSFunctionDeclarations.js'
import CSSGroupingRuleImpl from './CSSGroupingRule-impl.js'
import CSSRuleList from './CSSRuleList.js'
import { isOmitted } from '../utils/value.js'
import { parseBlockContents } from '../parse/parser.js'

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
        const { prelude: [{ name, value: parameters }, returnType], value } = privateData
        const rules = parseBlockContents(value, this).map(rule => {
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
        let string = `@function ${name}(${serializeCSSComponentValue(_parameters)}) `
        if (returnType !== '*') {
            string += `returns ${serializeCSSComponentValue(_returnType[1])} `
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
            return serializeCSSComponentValue(type.value)
        }
        return serializeCSSComponentValue(type)
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
                type = serializeCSSComponentValue(type.value)
            } else {
                type = serializeCSSComponentValue(type)
            }
            defaultValue = isOmitted(defaultValue) ? null : serializeCSSComponentValue(defaultValue[1])
            parameters.push({ defaultValue, name, type })
        })
        return parameters
    }
}
